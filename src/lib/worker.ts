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
export const DISPLAY_SUPPORT_EMAIL = 'support@aetherahealthcare.com';
export const DISPLAY_INFO_EMAIL = 'info@aetherahealthcare.com';

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

// Email backup so a CRM outage can never silently lose a lead. Uses Web3Forms
// routed directly to Kiran (kirkmar078@gmail.com).
const WEB3FORMS_KEY = 'b1e9389e-b14d-4e6a-84eb-e4708fcb39f4';

async function emailFallback(formType: string, data: AnyData): Promise<boolean> {
  try {
    const details = Object.entries(data)
      .filter(([k, v]) => v != null && typeof v !== 'object' && k !== 'hp_field')
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join('\n');
    const email = String(data.email || data.scheduleEmail || '') || 'no-reply@aetherahealthcare.com';
    const name = String(data.firstName || data.name || data.practiceContact || 'Website Visitor');
    const attr = getAttribution();
    const source = String(data.campaign_source || attr?.utmSource || 'Direct / Organic');
    const medium = String(data.campaign_medium || attr?.utmMedium || 'N/A');
    const campaign = String(data.campaign_name || attr?.utmCampaign || 'N/A');
    const term = String(data.campaign_term || attr?.utmTerm || 'N/A');
    const gclid = String(data.google_click_id || attr?.gclid || 'None');
    const landing = String(data.landing_page || attr?.landingPage || 'Direct entry');

    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `[AETHERA LEAD -> ${PRIMARY_EXPERT_EMAIL}] ${formType.replace(/_/g, ' ').toUpperCase()} from ${name}`,
        from_name: `${name} (Aethera Web Lead)`,
        email,
        to_email: PRIMARY_EXPERT_EMAIL,
        recipient: PRIMARY_EXPERT_EMAIL,
        target_email: PRIMARY_EXPERT_EMAIL,
        reply_to: email,
        message:
          `====================================================\n` +
          `AETHERA HEALTHCARE SOLUTIONS — NEW WEBSITE INQUIRY\n` +
          `ROUTED DIRECTLY TO: ${PRIMARY_EXPERT_EMAIL}\n` +
          `====================================================\n\n` +
          `Form Channel: ${formType}\n` +
          `Timestamp: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET\n` +
          `Visitor Name: ${name}\n` +
          `Visitor Email: ${email}\n\n` +
          `--- Marketing Campaign Attribution ---\n` +
          `Traffic Source: ${source}\n` +
          `Medium: ${medium}\n` +
          `Campaign: ${campaign}\n` +
          `Search Keyword / Term: ${term}\n` +
          `Google Ads GCLID: ${gclid}\n` +
          `Initial Landing Page: ${landing}\n\n` +
          `--- Ingest Data ---\n` +
          `${details}\n\n` +
          `Please follow up within 2 business hours.\n` +
          `====================================================`,
        botcheck: '',
      }),
    });
    return res.ok;
  } catch {
    return false; // last resort — nothing further we can do
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
 * Post a lead to the CRM. If the CRM does not confirm receipt (non-2xx, network,
 * or CORS failure), automatically send an email backup routed to Kiran (kirkmar078@gmail.com).
 * Never throws; resolves true when at least one delivery channel confirmed receipt.
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
  // CRM did not accept the lead → email backup routed directly to Kiran.
  return emailFallback(formType, data);
}
