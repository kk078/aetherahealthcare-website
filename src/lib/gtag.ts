/**
 * Google Ads conversion tracking helpers.
 *
 * Set NEXT_PUBLIC_GOOGLE_ADS_ID to your Ads Conversion ID (e.g. "AW-1234567890").
 * For each conversion action you create in Google Ads, paste its conversion
 * LABEL into the matching env var below. Everything is inlined at build time and
 * no-ops safely when unset, so this is safe to ship before the IDs exist.
 */
export const GADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '';

// Conversion action labels (the part after the "/" in a gtag send_to).
export const GADS_LABELS: Record<string, string> = {
  assessment: process.env.NEXT_PUBLIC_GADS_LABEL_ASSESSMENT || '',
  contact: process.env.NEXT_PUBLIC_GADS_LABEL_CONTACT || '',
  meeting: process.env.NEXT_PUBLIC_GADS_LABEL_MEETING || '',
  booking: process.env.NEXT_PUBLIC_GADS_LABEL_BOOKING || '',
  calculator: process.env.NEXT_PUBLIC_GADS_LABEL_CALCULATOR || '',
};

type ConversionKind = keyof typeof GADS_LABELS;

/**
 * Fire a Google Ads conversion for a lead action. Safe to call anywhere; it
 * no-ops on the server, when the Ads ID/label is unset, or if gtag hasn't loaded.
 */
export function trackConversion(kind: ConversionKind, value?: number): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  const label = GADS_LABELS[kind];
  if (!GADS_ID || !label || typeof w.gtag !== 'function') return;
  w.gtag('event', 'conversion', {
    send_to: `${GADS_ID}/${label}`,
    ...(value != null ? { value, currency: 'USD' } : {}),
  });
}
