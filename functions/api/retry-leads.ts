import { dispatchLead, json, type LeadEnv } from '../../src/server/leads';
export async function onRequestPost({ request, env }: { request: Request; env: LeadEnv }) {
  if (!env.LEAD_RETRY_SECRET || request.headers.get('Authorization') !== `Bearer ${env.LEAD_RETRY_SECRET}`) return json({ error: 'Unauthorized' }, 401);
  if (!env.LEADS_DB) return json({ error: 'Not configured' }, 503);
  const { results } = await env.LEADS_DB.prepare('SELECT id FROM leads WHERE delivered_at IS NULL AND lease_until < ? ORDER BY created_at LIMIT 20').bind(Date.now()).all<{ id: string }>();
  await Promise.all(results.map(row => dispatchLead(env, row.id)));
  // Retain receipts for deduplication, but remove delivered personal data after 30 days.
  await env.LEADS_DB.prepare('DELETE FROM leads WHERE delivered_at IS NOT NULL AND delivered_at < ?').bind(Date.now() - 30 * 86400000).run();
  await env.LEADS_DB.prepare('DELETE FROM request_limits WHERE expires_at < ?').bind(Date.now()).run();
  const pending = await env.LEADS_DB.prepare('SELECT COUNT(*) AS count FROM leads WHERE delivered_at IS NULL').first<{ count: number }>();
  return json({ attempted: results.length, pending: pending?.count ?? 0 });
}
