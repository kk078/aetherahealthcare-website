/**
 * Google Analytics 4 & Google Ads conversion tracking helpers.
 *
 * Set NEXT_PUBLIC_GA_MEASUREMENT_ID to your GA4 Measurement ID (e.g. "G-XXXXXXXXXX").
 * Set NEXT_PUBLIC_GOOGLE_ADS_ID to your Ads Conversion ID (e.g. "AW-18295729018").
 * For each conversion action you create in Google Ads, paste its conversion
 * LABEL into the matching env var below. Everything is inlined at build time and
 * no-ops safely when unset, so this is safe to ship before the IDs exist.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID || 'G-898JNZJ6LJ';
export const GADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-18295729018';

// Conversion action labels (the part after the "/" in a gtag send_to for Google Ads).
// `assessment` defaults to the live "Free Assessment Submission" action's label;
// env var overrides it.
export const GADS_LABELS: Record<string, string> = {
  assessment: process.env.NEXT_PUBLIC_GADS_LABEL_ASSESSMENT || '8gkvCJus38wcEPrWipRE',
  contact: process.env.NEXT_PUBLIC_GADS_LABEL_CONTACT || '',
  meeting: process.env.NEXT_PUBLIC_GADS_LABEL_MEETING || '',
  booking: process.env.NEXT_PUBLIC_GADS_LABEL_BOOKING || '',
  calculator: process.env.NEXT_PUBLIC_GADS_LABEL_CALCULATOR || '',
  pilot: process.env.NEXT_PUBLIC_GADS_LABEL_PILOT || '',
};

export type ConversionKind = keyof typeof GADS_LABELS;

// Standard GA4 event mappings for key high-intent user conversions
const GA4_EVENT_MAP: Record<ConversionKind, string> = {
  assessment: 'generate_lead',
  contact: 'contact_submit',
  meeting: 'schedule_appointment',
  booking: 'schedule_appointment',
  calculator: 'use_calculator',
  pilot: 'request_pilot',
};

/**
 * Fire a conversion for a lead action across Google Ads and Google Analytics 4.
 * Safe to call anywhere; it no-ops on the server or if gtag hasn't loaded.
 */
export function trackConversion(kind: ConversionKind, value?: number): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== 'function') return;

  // 1. Google Ads Conversion Event
  const adsLabel = GADS_LABELS[kind];
  if (GADS_ID && adsLabel) {
    w.gtag('event', 'conversion', {
      send_to: `${GADS_ID}/${adsLabel}`,
      ...(value != null ? { value, currency: 'USD' } : {}),
    });
  }

  // 2. Google Analytics 4 Standard Event
  const gaEvent = GA4_EVENT_MAP[kind] || 'lead_conversion';
  w.gtag('event', gaEvent, {
    event_category: 'lead_engagement',
    event_label: kind,
    ...(value != null ? { value, currency: 'USD' } : {}),
  });
}

/**
 * Dispatch custom events to Google Analytics 4.
 */
export function trackCustomEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== 'function') return;
  w.gtag('event', eventName, params);
}

