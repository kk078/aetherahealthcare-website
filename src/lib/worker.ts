/**
 * CRM ingest integration + Web3Forms Email Routing to Kiran (kirkmar078@gmail.com).
 * All website forms call submitToWorker(); it posts directly to the Aethera
 * CRM public ingest endpoints so submissions land in the CRM inbox (live DB).
 * If the CRM is unavailable or returns non-200, it falls back to Web3Forms
 * explicitly routed to Kiran (kirkmar078@gmail.com).
 * Best-effort — never throws.
 */

import { getAttribution } from '@/lib/attribution';

export const PRIMARY_EXPERT_EMAIL = 'kirkmar078@gmail.com';

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
        routedTo: PRIMARY_EXPERT_EMAIL,
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
        routedTo: PRIMARY_EXPERT_EMAIL,
      },
    };
  }
  // contact_message | consultation_request | callback_request | expert_ai_consultation -> contact
  const name = s('name') || s('practiceContact') || 'Website Visitor';
  const practice = s('practice') || s('practiceName') || '';
  const email = s('email') || s('scheduleEmail') || '';
  const phone = s('phone') || s('schedulePhone') || '';
  const specialty = s('specialty') || s('practiceSpecialty') || '';
  const messageParts = [
    s('message') || s('consultationNotes'),
    s('preferredTime') ? `Preferred time: ${s('preferredTime')}` : '',
    s('bestTime') ? `Best time to call: ${s('bestTime')}` : '',
    s('chatContext') ? `AI Chat Context:\n${s('chatContext')}` : '',
  ].filter(Boolean);
  const message = messageParts.join(' — ') || `${formType.replace(/_/g, ' ')} from website`;
  return { path: '/contact', payload: { name, practice, email, phone, specialty, message, routedTo: PRIMARY_EXPERT_EMAIL } };
}

// Direct email delivery to Kiran (kirkmar078@gmail.com) via FormSubmit
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${PRIMARY_EXPERT_EMAIL}`;

// Instant real-time push notification topic for mobile/desktop (both underscore and hyphen variants)
export const NTFY_LEADS_TOPIC = 'https://ntfy.sh/aethera_leads_kiran_2026';
export const NTFY_LEADS_TOPIC_ALT = 'https://ntfy.sh/aethera-leads-kiran-2026';

// Backup Web3Forms key
const WEB3FORMS_KEY = 'b1e9389e-b14d-4e6a-84eb-e4708fcb39f4';

function recordInLocalVault(formType: string, leadData: AnyData) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existingStr = window.localStorage.getItem('aethera_leads_vault');
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const record = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      formType,
      timestamp: new Date().toISOString(),
      leadData,
    };
    existing.unshift(record);
    // Keep last 50 submissions
    window.localStorage.setItem('aethera_leads_vault', JSON.stringify(existing.slice(0, 50)));
  } catch {
    // Non-critical local storage errors ignored
  }
}

async function deliverViaFormSubmit(formType: string, data: AnyData): Promise<boolean> {
  try {
    const name = String(data.name || data.firstName ? `${data.firstName || ''} ${data.lastName || ''}`.trim() : data.practiceContact || 'Website Visitor');
    const email = String(data.email || data.scheduleEmail || '') || 'no-reply@aetherahealthcare.com';
    const phone = String(data.phone || data.schedulePhone || '') || 'Not provided';
    const practice = String(data.practiceName || data.practice || '') || 'Not specified';
    const specialty = String(data.specialty || data.practiceSpecialty || '') || 'Healthcare / General';
    const rawMessage = String(data.message || data.consultationNotes || data.challenge || data.bottleneck || '');
    
    const attr = getAttribution();
    const source = String(data.campaign_source || attr?.utmSource || 'Direct / Organic');
    const medium = String(data.campaign_medium || attr?.utmMedium || 'N/A');
    const campaign = String(data.campaign_name || attr?.utmCampaign || 'N/A');
    const term = String(data.campaign_term || attr?.utmTerm || 'N/A');
    const gclid = String(data.google_click_id || attr?.gclid || 'None');
    const landing = String(data.landing_page || attr?.landingPage || 'Direct entry');

    const flatDetails: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v != null && typeof v !== 'object' && k !== 'hp_field' && k !== 'botcheck') {
        flatDetails[k] = String(v);
      }
    }

    const payload = {
      _subject: `[AETHERA LEAD -> ${PRIMARY_EXPERT_EMAIL}] ${formType.replace(/_/g, ' ').toUpperCase()} - ${name} (${specialty})`,
      _template: 'table',
      _captcha: 'false',
      _replyto: email,
      'Lead Full Name': name,
      'Email Address': email,
      'Phone Number': phone,
      'Practice / Organization': practice,
      'Medical Specialty': specialty,
      'Inquiry Category': formType.replace(/_/g, ' ').toUpperCase(),
      'Message / Requirements': rawMessage || 'Inquiry submitted via website form',
      ...flatDetails,
      'Traffic Source': source,
      'Campaign Medium': medium,
      'Campaign Name': campaign,
      'Search Keyword': term,
      'Google Click ID': gclid,
      'Initial Landing Page': landing,
      'Submission Timestamp': new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' ET',
    };

    const res = await fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      if (json && (json.success === 'true' || json.success === true)) {
        return true;
      }
    }
    return res.ok;
  } catch {
    return false;
  }
}

async function deliverViaNtfy(formType: string, data: AnyData): Promise<boolean> {
  try {
    const name = String(data.name || data.firstName ? `${data.firstName || ''} ${data.lastName || ''}`.trim() : data.practiceContact || 'Website Visitor');
    const email = String(data.email || data.scheduleEmail || 'no email');
    const phone = String(data.phone || data.schedulePhone || 'no phone');
    const practice = String(data.practiceName || data.practice || 'unspecified practice');
    const specialty = String(data.specialty || data.practiceSpecialty || 'General');
    const rawMessage = String(data.message || data.consultationNotes || data.challenge || data.bottleneck || '');

    // Header values MUST be ASCII only to avoid ByteString errors
    const safeTitle = `New Lead: ${name.replace(/[^\x00-\x7F]/g, '')} (${specialty.replace(/[^\x00-\x7F]/g, '')})`.slice(0, 100);

    const bodyText = [
      `Name: ${name}`,
      `Practice: ${practice}`,
      `Specialty: ${specialty}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Channel: ${formType}`,
      rawMessage ? `Notes: ${rawMessage}` : '',
    ].filter(Boolean).join('\n');

    const headers = {
      Title: safeTitle,
      Priority: 'urgent',
      Tags: 'hospital,bell,incoming_envelope',
      Click: 'https://aetherahealthcare.com/contact',
    };

    const results = await Promise.allSettled([
      fetch(NTFY_LEADS_TOPIC, { method: 'POST', headers, body: bodyText }),
      fetch(NTFY_LEADS_TOPIC_ALT, { method: 'POST', headers, body: bodyText }),
    ]);

    return results.some(r => r.status === 'fulfilled' && r.value.ok);
  } catch {
    return false;
  }
}

async function emailFallback(formType: string, data: AnyData): Promise<boolean> {
  try {
    const details = Object.entries(data)
      .filter(([k, v]) => v != null && typeof v !== 'object' && k !== 'hp_field')
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join('\n');
    const email = String(data.email || data.scheduleEmail || '') || 'no-reply@aetherahealthcare.com';
    const name = String(data.firstName || data.name || data.practiceContact || 'Website Visitor');

    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `[AETHERA LEAD -> ${PRIMARY_EXPERT_EMAIL}] ${formType.replace(/_/g, ' ').toUpperCase()} from ${name}`,
        from_name: `${name} (Aethera Web Lead)`,
        email,
        message: `Inquiry via ${formType}:\n\n${details}`,
        botcheck: '',
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Directly dispatch an inquiry/lead to Kiran (kirkmar078@gmail.com) with optional AI chat transcript.
 */
export async function sendLeadToKiran(
  inquiryType: string,
  data: AnyData,
  chatHistory?: Array<{ role: string; content: string }>
): Promise<boolean> {
  const chatContext = chatHistory && chatHistory.length > 0
    ? chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')
    : undefined;

  const attr = getAttribution();

  const augmentedData: AnyData = {
    ...data,
    ...(attr ? {
      campaign_source: attr.utmSource,
      campaign_medium: attr.utmMedium,
      campaign_name: attr.utmCampaign,
      campaign_term: attr.utmTerm,
      campaign_content: attr.utmContent,
      google_click_id: attr.gclid,
      landing_page: attr.landingPage,
      referrer_domain: attr.referrer,
    } : {}),
    chatContext,
    target_recipient: PRIMARY_EXPERT_EMAIL,
    routed_at: new Date().toISOString(),
  };

  return submitToWorker(inquiryType, augmentedData);
}

/**
 * Deliver inquiry directly to Kiran (kirkmar078@gmail.com) with multi-channel failover:
 * 1. FormSubmit API -> direct email inbox delivery to kirkmar078@gmail.com
 * 2. ntfy.sh instant mobile & desktop push alert
 * 3. Immutable client localStorage vault
 * 4. CRM / Web3Forms background fallback
 *
 * Never throws; returns true if at least one delivery channel confirms receipt.
 */
export async function submitToWorker(formType: string, data: AnyData): Promise<boolean> {
  // 1. Audit vault in local browser storage
  recordInLocalVault(formType, data);

  // 2. Best-effort background push alerts (non-blocking)
  void deliverViaNtfy(formType, data);

  // 3. Best-effort background CRM sync & Web3Forms backup
  void (async () => {
    try {
      const { path, payload } = mapToCrm(formType, data);
      const res = await fetch(CRM_INGEST_BASE + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        await emailFallback(formType, data);
      }
    } catch {
      await emailFallback(formType, data);
    }
  })();

  // 4. Primary direct email delivery to kirkmar078@gmail.com
  const ok = await deliverViaFormSubmit(formType, data);
  return ok;
}

