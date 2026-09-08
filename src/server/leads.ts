import type { D1Database } from '@cloudflare/workers-types';
import { CONTACT_EMAIL } from '../lib/business';

export interface LeadEnv {
  LEADS_DB?: D1Database;
  CRM_API_URL?: string;
  CRM_API_TOKEN?: string;
  LEAD_RETRY_SECRET?: string;
  RATE_LIMIT_SECRET?: string;
  ASSISTANT_URL?: string;
}
export interface LeadEnvelope {
  submissionId: string;
  formType: string;
  data: Record<string, unknown>;
  attribution?: Record<string, unknown> | null;
}
const MAX_BYTES = 64000;
export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
export function sameOrigin(request: Request) {
  return request.headers.get('Origin') === new URL(request.url).origin;
}
export async function readBoundedJson(request: Request, max = MAX_BYTES): Promise<unknown> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new Error('Expected JSON');
  if (Number(request.headers.get('content-length')) > max) throw new Error('Request too large');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Empty body');
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { await reader.cancel(); throw new Error('Request too large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
export function validateLead(value: unknown): LeadEnvelope {
  if (!record(value) || !record(value.data)) throw new Error('Invalid submission');
  if (typeof value.submissionId !== 'string' || !/^[\da-f-]{36}$/i.test(value.submissionId)) throw new Error('Invalid submission ID');
  if (typeof value.formType !== 'string' || !/^[a-z0-9_]{2,100}$/.test(value.formType)) throw new Error('Invalid form type');
  if (Object.keys(value.data).length > 80) throw new Error('Too many fields');
  for (const [key, field] of Object.entries(value.data)) {
    if (!/^[a-zA-Z0-9_]{1,80}$/.test(key) || ['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error('Invalid field');
    if (typeof field === 'string' && field.length > 12000) throw new Error('Field too long');
  }
  const email = String(value.data.email || value.data.contactEmail || value.data.scheduleEmail || '').trim();
  const phone = String(value.data.phone || value.data.contactPhone || value.data.schedulePhone || '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email');
  if (!email && phone.replace(/\D/g, '').length < 7) throw new Error('Provide an email address or phone number');
  if (value.attribution != null && !record(value.attribution)) throw new Error('Invalid attribution');
  return { submissionId: value.submissionId, formType: value.formType, data: value.data, attribution: value.attribution as LeadEnvelope['attribution'] };
}
export function mapToCrm(lead: LeadEnvelope) {
  const { data, formType } = lead;
  const s = (key: string) => data[key] == null ? '' : String(data[key]);
  const name = s('name') || s('contactName') || [s('firstName'), s('lastName')].filter(Boolean).join(' ') || s('practiceContact') || 'Website Visitor';
  const shared = { submissionId: lead.submissionId, source: formType, routedTo: CONTACT_EMAIL, attribution: lead.attribution ?? {} };
  if (['gap', 'gap_analysis', 'free_assessment'].includes(formType)) {
    return { path: formType === 'free_assessment' ? '/assessments' : '/gap-analyses', payload: { ...data, ...shared } };
  }
  // Preserve specialist tool context and attribution in both structured fields and message.
  const detail = Object.fromEntries(Object.entries(data).filter(([key]) => !['hp_field', 'botcheck'].includes(key)));
  return { path: '/contact', payload: {
    ...shared, name, email: s('email') || s('contactEmail') || s('scheduleEmail'), phone: s('phone') || s('contactPhone') || s('schedulePhone'),
    practice: s('practice') || s('practiceName') || s('contactPractice'), specialty: s('specialty') || s('practiceSpecialty'),
    message: [s('message') || s('consultationNotes') || s('notes') || s('bottleneck') || `${formType.replaceAll('_', ' ')} from website`, JSON.stringify(detail), lead.attribution ? `Campaign: ${JSON.stringify(lead.attribution)}` : ''].filter(Boolean).join('\n\n'),
  } };
}
export function acknowledged(body: unknown): boolean {
  if (!record(body)) return false;
  if (body.ok === false || body.success === false || body.success === 'false' || body.error) return false;
  return body.ok === true || body.success === true || body.success === 'true' || typeof body.id === 'string' || typeof body.id === 'number';
}
export async function consumeRateLimit(request: Request, env: LeadEnv, scope: string, limit: number) {
  if (!env.LEADS_DB || !env.RATE_LIMIT_SECRET) return false;
  const hour = Math.floor(Date.now() / 3600000);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.RATE_LIMIT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${scope}:${hour}:${request.headers.get('CF-Connecting-IP') || 'local'}`));
  const id = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  const result = await env.LEADS_DB.prepare('INSERT INTO request_limits (id, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(id) DO UPDATE SET count = count + 1 WHERE count < ? RETURNING count').bind(id, Date.now() + 7200000, limit).first();
  return !!result;
}
export async function dispatchLead(env: LeadEnv, id: string, fetcher: typeof fetch = fetch) {
  const db = env.LEADS_DB;
  if (!db) return;
  // A short lease stops concurrent retry jobs from dispatching the same row.
  const row = await db.prepare("UPDATE leads SET lease_until = ?, attempts = attempts + 1 WHERE id = ? AND delivered_at IS NULL AND lease_until < ? RETURNING payload").bind(Date.now() + 60000, id, Date.now()).first<{ payload: string }>();
  if (!row) return;
  try {
    const lead = JSON.parse(row.payload) as LeadEnvelope;
    const mapped = mapToCrm(lead);
    const base = env.CRM_API_URL || 'https://aethera-crm-api.aetherahealthcare.workers.dev/api/v1/public/website';
    if (!base.startsWith('https://')) throw new Error('CRM requires HTTPS');
    const response = await fetcher(base.replace(/\/$/, '') + mapped.path, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': id, ...(env.CRM_API_TOKEN ? { Authorization: `Bearer ${env.CRM_API_TOKEN}` } : {}) },
      body: JSON.stringify(mapped.payload), signal: AbortSignal.timeout(15000),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || !acknowledged(body)) throw new Error('CRM did not acknowledge');
    await db.prepare('UPDATE leads SET delivered_at = ?, last_error = NULL WHERE id = ?').bind(Date.now(), id).run();
  } catch {
    // Never log payloads. A retained pending row can be safely retried by the job.
    await db.prepare('UPDATE leads SET last_error = ?, lease_until = ? WHERE id = ?').bind('CRM delivery not acknowledged', Date.now() + 300000, id).run();
  }
}
