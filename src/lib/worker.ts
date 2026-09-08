/** Website forms use a same-origin, server-validated durable lead endpoint. */
import { getAttribution } from './attribution';
import { SITE } from './siteConfig';
export const PRIMARY_EXPERT_EMAIL = SITE.contactEmail;

type LeadData = Record<string, unknown>;
const inFlight = new Map<string, Promise<boolean>>();
const retries = new Map<string, string>();

async function fingerprint(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}

export async function submitToWorker(formType: string, data: LeadData): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    if (data.hp_field || data.botcheck) return true;
    // Receipt time is assigned by the server; volatile UI timestamps break retries.
    data = Object.fromEntries(Object.entries(data).filter(([key]) => !['timestamp', 'submittedAt'].includes(key)));
    const attribution = getAttribution();
    const payload = { formType, data, attribution };
    const key = await fingerprint(JSON.stringify({ formType, data }));
    const pending = inFlight.get(key);
    if (pending) return pending;
    // Keep only opaque IDs/hashes, never submitted fields, across a network retry.
    let submissionId = retries.get(key) || crypto.randomUUID();
    try {
      const previous = JSON.parse(sessionStorage.getItem(`lead-retry:${key}`) || 'null');
      if (previous?.expiresAt > Date.now()) submissionId = previous.id;
      sessionStorage.setItem(`lead-retry:${key}`, JSON.stringify({ id: submissionId, expiresAt: Date.now() + 3600000 }));
    } catch { /* In-memory retries remain available when storage is blocked. */ }
    retries.set(key, submissionId);
    const request = (async () => {
      try {
        const response = await fetch('/api/leads', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, submissionId }),
          signal: AbortSignal.timeout(20000),
        });
        const receipt = await response.json().catch(() => null);
        const accepted = response.ok && receipt?.accepted === true && receipt?.submissionId === submissionId;
        if (!accepted) window.dispatchEvent(new Event('lead-delivery-failed'));
        return accepted;
      } catch { window.dispatchEvent(new Event('lead-delivery-failed')); return false; }
      finally { inFlight.delete(key); }
    })();
    inFlight.set(key, request);
    return await request;
  } catch { return false; }
}

export async function sendLeadToKiran(inquiryType: string, data: LeadData, chatHistory?: Array<{ role: string; content: string }>): Promise<boolean> {
  const accepted = await submitToWorker(inquiryType, {
    ...data,
    ...(chatHistory?.length ? { chatContext: chatHistory.slice(-12).map(m => `${m.role}: ${m.content}`).join('\n\n').slice(0, 8000) } : {}),
  });
  return accepted;
}
