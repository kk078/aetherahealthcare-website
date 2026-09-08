import { consumeRateLimit, json, readBoundedJson, sameOrigin, type LeadEnv } from '../../src/server/leads';
export async function onRequestPost({ request, env }: { request: Request; env: LeadEnv }) {
  if (!sameOrigin(request)) return json({ error: 'Origin not allowed' }, 403);
  if (!await consumeRateLimit(request, env, 'assistant', 30)) return json({ error: 'Assistant unavailable or request limit reached' }, 429);
  try {
    const body = await readBoundedJson(request, 16000) as { message?: unknown; history?: unknown };
    if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > 2000) return json({ error: 'Invalid message' }, 400);
    const history = Array.isArray(body.history) ? body.history.slice(-6).filter(h => h && ['user', 'assistant'].includes(h.role) && typeof h.content === 'string' && h.content.length <= 2000) : [];
    const endpoint = env.ASSISTANT_URL || 'https://aethera-forms.aetherahealthcare.workers.dev/api/assistant';
    if (!endpoint.startsWith('https://')) return json({ error: 'Invalid assistant configuration' }, 503);
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: body.message, history }), signal: AbortSignal.timeout(12000) });
    const result = await response.json() as { answer?: unknown };
    if (!response.ok || typeof result.answer !== 'string') return json({ error: 'Assistant unavailable' }, 503);
    return json({ answer: result.answer.slice(0, 12000) });
  } catch { return json({ error: 'Assistant unavailable' }, 503); }
}
