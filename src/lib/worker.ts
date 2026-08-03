/**
 * CRM ingest integration.
 * All website forms call submitToWorker(); it posts directly to the Aethera
 * CRM public ingest endpoints so submissions land in the CRM inbox (live DB).
 * Best-effort — never throws.
 */
export const CRM_INGEST_BASE = `${process.env.NEXT_PUBLIC_CRM_API_URL || 'https://aethera-crm-api.aetherahealthcare.workers.dev/api/v1'}/public/website`;

type AnyData = Record<string, unknown>;

function mapToCrm(formType: string, data: AnyData): { path: string; payload: AnyData } {
  const s = (k: string) => (data[k] == null ? '' : String(data[k]));
  if (formType === 'free_assessment') {
    return {
      path: '/assessments',
      payload: {
        firstName: s('firstName'), lastName: s('lastName'), practiceName: s('practiceName'),
        specialty: s('specialty'), providerCount: s('providerCount'), claimVolume: s('claimVolume'),
        billingSituation: s('billingSituation'), ehr: s('ehr'), email: s('email'),
        phone: s('phone'), challenge: s('challenge') || s('message'),
      },
    };
  }
  if (formType === 'gap' || formType === 'gap_analysis') {
    return {
      path: '/gap-analyses',
      payload: {
        firstName: s('firstName'), lastName: s('lastName'), phone: s('phone'),
        email: s('email'), practiceName: s('practiceName') || s('practice'), specialty: s('specialty'),
        providerCount: s('providerCount'), claimVolume: s('claimVolume') || s('monthlyClaims'),
        monthlyClaims: s('monthlyClaims') || s('claimVolume'), denialRate: s('denialRate'),
        daysInAr: s('daysInAr'), currentBilling: s('currentBilling') || s('billingSituation'),
        ehr: s('ehr'), challenge: s('challenge'),
        answers: (data.answers as AnyData) || data,
      },
    };
  }
  // contact_message | consultation_request | callback_request -> contact
  const name = s('name') || s('practiceContact') || 'Website Visitor';
  const practice = s('practice') || s('practiceName') || '';
  const email = s('email') || s('scheduleEmail') || '';
  const phone = s('phone') || s('schedulePhone') || '';
  const specialty = s('specialty') || s('practiceSpecialty') || '';
  const messageParts = [
    s('message') || s('consultationNotes'),
    s('preferredTime') ? `Preferred time: ${s('preferredTime')}` : '',
    s('bestTime') ? `Best time to call: ${s('bestTime')}` : '',
  ].filter(Boolean);
  const message = messageParts.join(' — ') || `${formType.replace(/_/g, ' ')} from website`;
  return { path: '/contact', payload: { name, practice, email, phone, specialty, message } };
}

// Email backup so a CRM outage can never silently lose a lead. Uses the same
// Web3Forms channel the contact form already relies on; the access key is a
// public, client-side key by design.
const WEB3FORMS_KEY = 'b1e9389e-b14d-4e6a-84eb-e4708fcb39f4';

async function emailFallback(formType: string, data: AnyData): Promise<boolean> {
  try {
    const details = Object.entries(data)
      .filter(([, v]) => v != null && typeof v !== 'object')
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join('\n');
    const email = String(data.email || data.scheduleEmail || '') || 'no-reply@aetherahealthcare.com';
    const name = String(data.firstName || data.name || data.practiceContact || 'Website Visitor');
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `[LEAD BACKUP] ${formType} — CRM did not confirm receipt`,
        from_name: name,
        email,
        message:
          `A website lead came in via "${formType}" but the CRM did not confirm receipt, ` +
          `so this email backup was sent to make sure the prospect is not lost.\n\n${details}`,
        botcheck: '',
      }),
    });
    return res.ok;
  } catch {
    return false; // last resort — nothing further we can do
  }
}

/**
 * Post a lead to the CRM. If the CRM does not confirm receipt (non-2xx, network,
 * or CORS failure), automatically send an email backup so no prospect is ever
 * lost. Never throws; resolves true when at least one delivery channel
 * confirmed receipt, false when both failed (callers should surface a
 * "call us instead" message rather than a false success).
 */
export async function submitToWorker(formType: string, data: AnyData): Promise<boolean> {
  const { path, payload } = mapToCrm(formType, data);
  try {
    const res = await fetch(CRM_INGEST_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return true; // CRM accepted the lead — done.
  } catch {
    // network / CORS failure — fall through to the email backup.
  }
  // CRM did not accept the lead → email backup so no prospect is ever lost.
  return emailFallback(formType, data);
}
