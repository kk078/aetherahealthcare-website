import { consumeRateLimit, dispatchLead, json, readBoundedJson, sameOrigin, validateLead, type LeadEnv } from '../../src/server/leads';

export async function onRequestPost({ request, env, waitUntil }: { request: Request; env: LeadEnv; waitUntil: (task: Promise<unknown>) => void }) {
  if (!sameOrigin(request)) return json({ error: 'Origin not allowed' }, 403);
  if (!env.LEADS_DB || !env.RATE_LIMIT_SECRET) return json({ error: 'Lead service is not configured. Please use the booking calendar.' }, 503);
  try {
    const lead = validateLead(await readBoundedJson(request));
    if (lead.data.hp_field || lead.data.botcheck) return json({ accepted: true, submissionId: lead.submissionId }, 202);
    if (!await consumeRateLimit(request, env, 'lead', 10)) return json({ error: 'Please try again later' }, 429);
    const payload = JSON.stringify(lead);
    // First payload wins: ID reuse cannot overwrite another visitor's submission.
    await env.LEADS_DB.prepare('INSERT INTO leads (id, payload, created_at) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING').bind(lead.submissionId, payload, Date.now()).run();
    const existing = await env.LEADS_DB.prepare('SELECT payload FROM leads WHERE id = ?').bind(lead.submissionId).first<{ payload: string }>();
    if (existing?.payload !== payload) return json({ error: 'Submission ID conflict' }, 409);
    waitUntil(dispatchLead(env, lead.submissionId));
    return json({ accepted: true, submissionId: lead.submissionId }, 202);
  } catch (error) {
    if (error instanceof SyntaxError || (error instanceof Error && /Invalid|Provide|Expected|too|Too|Empty/.test(error.message))) return json({ error: 'Please check your submission fields and size.' }, 400);
    return json({ error: 'Unable to save your request. Please retry.' }, 503);
  }
}
