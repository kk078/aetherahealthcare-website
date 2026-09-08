import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import type { D1Database } from '@cloudflare/workers-types';
import { acknowledged, dispatchLead, mapToCrm, validateLead, type LeadEnv } from '../../src/server/leads';
import { onRequestPost } from '../../functions/api/leads';
function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync('migrations/0001_leads.sql', 'utf8'));
  const db = { prepare(sql: string) { let args: (string | number | null)[] = []; const statement = sqlite.prepare(sql); return {
    bind(...values: (string | number | null)[]) { args = values; return this; },
    async first() { return statement.get(...args) ?? null; },
    async run() { return statement.run(...args); },
    async all() { return { results: statement.all(...args) }; },
  }; } } as unknown as D1Database;
  return { db, sqlite };
}
const lead = { submissionId: '71c79851-e54c-4dd0-b1a8-802c5a7a7111', formType: 'contact_message', data: { name: 'Test Provider', email: 'test@example.com', practice: 'Test Practice', message: 'Testing' } };
test('maps all name variants and keeps campaign context', () => {
  for (const data of [{ name: 'A' }, { firstName: 'A', lastName: 'B' }, { contactName: 'A' }, { practiceContact: 'A' }]) {
    const result = mapToCrm({ ...lead, data: { ...data, email: 'test@example.com' }, attribution: { utmSource: 'test' } });
    assert.ok('name' in result.payload && result.payload.name);
    assert.ok('message' in result.payload);
    assert.match(String(result.payload.message), /utmSource/);
  }
});
test('requires a positive provider acknowledgement', () => {
  for (const body of [null, {}, { success: false }, { success: 'false' }, { ok: true, error: 'invalid' }]) assert.equal(acknowledged(body), false);
  for (const body of [{ success: true }, { id: 'lead-id' }, { ok: true }]) assert.equal(acknowledged(body), true);
});
test('validates contact and request shape', () => {
  assert.throws(() => validateLead({ ...lead, data: { email: 'invalid' } }));
  assert.throws(() => validateLead({ ...lead, data: {} }));
  assert.throws(() => validateLead({ ...lead, submissionId: 'bad' }));
});
test('specialty tool contact aliases validate and reach CRM identity fields', () => {
  const valid = validateLead({ ...lead, data: { contactName: 'Test Provider', contactEmail: 'test@example.com', contactPhone: '2025550100', contactPractice: 'Test Practice' } });
  const { payload } = mapToCrm(valid);
  assert.ok('email' in payload && 'phone' in payload && 'practice' in payload);
  assert.equal(payload.email, 'test@example.com');
  assert.equal(payload.phone, '2025550100');
  assert.equal(payload.practice, 'Test Practice');
});
test('durable acknowledgement is independent of CRM, and retries store one lead', async () => {
  const { db, sqlite } = database();
  const env: LeadEnv = { LEADS_DB: db, RATE_LIMIT_SECRET: 'unit-test-salt' };
  const tasks: Promise<unknown>[] = [];
  const request = (body = lead) => new Request('https://example.com/api/leads', { method: 'POST', headers: { Origin: 'https://example.com', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  // Do not run production network dispatch in this test.
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ success: false });
  try {
    const response = await onRequestPost({ request: request(), env, waitUntil: p => tasks.push(p) });
    assert.equal(response.status, 202); assert.equal((await response.json()).accepted, true);
    await Promise.all(tasks);
    const retry = await onRequestPost({ request: request(), env, waitUntil: p => tasks.push(p) });
    assert.equal(retry.status, 202);
    const conflict = await onRequestPost({ request: request({ ...lead, data: { ...lead.data, name: 'Different' } }), env, waitUntil: p => tasks.push(p) });
    assert.equal(conflict.status, 409);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM leads').get()?.count, 1);
    assert.equal(sqlite.prepare('SELECT delivered_at FROM leads').get()?.delivered_at, null);
    await Promise.all(tasks);
  } finally { globalThis.fetch = original; sqlite.close(); }
});
test('delivery acknowledges success once and leases concurrent retries', async () => {
  const { db, sqlite } = database();
  sqlite.prepare('INSERT INTO leads (id, payload, created_at) VALUES (?, ?, ?)').run(lead.submissionId, JSON.stringify(lead), Date.now());
  let calls = 0;
  const upstream: typeof fetch = async (_url, options) => { calls++; assert.equal((options?.headers as Record<string,string>)['Idempotency-Key'], lead.submissionId); return Response.json({ ok: true }); };
  await Promise.all([dispatchLead({ LEADS_DB: db }, lead.submissionId, upstream), dispatchLead({ LEADS_DB: db }, lead.submissionId, upstream)]);
  assert.equal(calls, 1); assert.ok(sqlite.prepare('SELECT delivered_at FROM leads').get()?.delivered_at); sqlite.close();
});
test('rejects cross-origin and unconfigured requests', async () => {
  const request = new Request('https://example.com/api/leads', { method: 'POST', headers: { Origin: 'https://other.example' } });
  assert.equal((await onRequestPost({ request, env: {}, waitUntil: () => {} })).status, 403);
  const same = new Request('https://example.com/api/leads', { method: 'POST', headers: { Origin: 'https://example.com' } });
  assert.equal((await onRequestPost({ request: same, env: {}, waitUntil: () => {} })).status, 503);
});
