import { CONTACT_EMAIL } from './business';
/** Public business settings. Outcomes require a scoped, signed service agreement. */
export const SITE = {
  name: 'Aethera Healthcare Solutions',
  url: 'https://aetherahealthcare.com',
  contactEmail: CONTACT_EMAIL,
  contactPath: '/contact/',
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? 'https://cal.com/kiran-kumar-pedapudi-qh822e/30min',
  pricing: { minimumPercent: 3.5, maximumPercent: 5, basis: 'net collections' },
} as const;

export function canonicalUrl(path: string): string {
  return `${SITE.url}${path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}/`}`;
}
