import { CONTACT_EMAIL } from './business';
/** Public business settings. Outcomes require a scoped, signed service agreement. */
export const SITE = {
  name: 'Aethera Healthcare Solutions',
  url: 'https://aetherahealthcare.com',
  contactEmail: CONTACT_EMAIL,
  contactPath: '/contact/',
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? 'https://cal.com/kiran-kumar-pedapudi-qh822e/30min',
  pricing: { minimumPercent: 3.5, maximumPercent: 5, estimatePercent: 5, basis: 'net collections', minimumPerClaim: 3.5, maximumPerClaim: 7 },
} as const;

export const PRICING_RANGE = `${SITE.pricing.minimumPercent}–${SITE.pricing.maximumPercent}%`;
export const OFFERS = {
  pilot: { id: 'free_50_claim_pilot_application', name: 'Free 50-Claim Pilot', duration: '14 days', scope: '50 claims or eligibility checks', start: 'after the BAA, complete intake and agreed success criteria' },
  sprint: { id: 'denial_recovery_sprint', name: 'Free Denial Recovery Sprint', duration: '48 hours', scope: '5–10 denied claims', start: 'after the BAA and receipt of complete EOBs and encounter notes' },
} as const;

export function canonicalUrl(path: string): string {
  return `${SITE.url}${path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}/`}`;
}
