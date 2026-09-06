/**
 * Marketing Attribution & Campaign Telemetry Engine.
 *
 * Captures UTM parameters, Google Ads Click IDs (gclid/gbraid/wbraid),
 * and referrer channels on initial landing. Preserves them in ephemeral
 * sessionStorage (with in-memory fallback) across internal client navigations,
 * and attaches them automatically to lead submissions routed to Kiran.
 *
 * Adheres strictly to zero-persistence HIPAA compliance — data is purely session-scoped.
 */

export interface CampaignAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  msclkid?: string;
  li_fat_id?: string;
  referrer?: string;
  landingPage?: string;
  landingTime?: string;
}

const STORAGE_KEY = 'aethera_session_attribution';
let inMemoryAttribution: CampaignAttribution | null = null;

/**
 * Parses query params from window.location and saves initial attribution.
 * Only saves if not already captured in the current session.
 */
export function captureAttribution(): CampaignAttribution | null {
  if (typeof window === 'undefined') return null;

  try {
    // If we already have stored attribution for this session, return it
    const existing = getAttribution();
    if (existing && (existing.utmSource || existing.gclid)) {
      return existing;
    }

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || undefined;
    const utmMedium = params.get('utm_medium') || undefined;
    const utmCampaign = params.get('utm_campaign') || undefined;
    const utmTerm = params.get('utm_term') || undefined;
    const utmContent = params.get('utm_content') || undefined;
    const gclid = params.get('gclid') || undefined;
    const gbraid = params.get('gbraid') || undefined;
    const wbraid = params.get('wbraid') || undefined;
    const fbclid = params.get('fbclid') || undefined;
    const msclkid = params.get('msclkid') || undefined;
    const liFatId = params.get('li_fat_id') || undefined;

    const hasCampaignData = Boolean(
      utmSource || utmMedium || utmCampaign || gclid || fbclid || msclkid || liFatId
    );

    const attribution: CampaignAttribution = {
      utmSource: utmSource || (document.referrer ? 'organic_or_referral' : 'direct'),
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      gclid,
      gbraid,
      wbraid,
      fbclid,
      msclkid,
      li_fat_id: liFatId,
      referrer: document.referrer ? new URL(document.referrer, window.location.origin).hostname : 'direct',
      landingPage: window.location.pathname,
      landingTime: new Date().toISOString(),
    };

    // Store in ephemeral sessionStorage
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    } catch {
      // Fallback in case storage is restricted
    }
    inMemoryAttribution = attribution;
    return attribution;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current session's campaign attribution data.
 */
export function getAttribution(): CampaignAttribution | null {
  if (typeof window === 'undefined') return null;

  if (inMemoryAttribution) return inMemoryAttribution;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      inMemoryAttribution = JSON.parse(raw);
      return inMemoryAttribution;
    }
  } catch {
    // sessionStorage blocked or unavailable
  }

  return inMemoryAttribution;
}

/**
 * Resets attribution on session clear.
 */
export function clearAttribution(): void {
  inMemoryAttribution = null;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // no-op
    }
  }
}
