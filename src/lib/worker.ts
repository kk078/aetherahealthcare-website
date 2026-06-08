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
  const message =
    s('message') || s('consultationNotes') ||
    (s('preferredTime') ? `Preferred time: ${s('preferredTime')}` : '') ||
    `${formType.replace(/_/g, ' ')} from website`;
  return { path: '/contact', payload: { name, practice, email, phone, specialty, message } };
}

export async function submitToWorker(formType: string, data: AnyData): Promise<void> {
  try {
    const { path, payload } = mapToCrm(formType, data);
    await fetch(CRM_INGEST_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // best-effort
  }
}
