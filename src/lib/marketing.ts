import type { Metadata } from 'next';
import { canonicalUrl, SITE } from './siteConfig';

/** Longest description search engines show in full; Google truncates around 155-160 characters. */
export const DESCRIPTION_MAX = 155;

/** First candidate that fits in a search snippet, otherwise the shortest one. */
export function fitDescription(...candidates: string[]): string {
  return candidates.find(c => c.length <= DESCRIPTION_MAX) ?? candidates.reduce((a, b) => (b.length < a.length ? b : a));
}

export function marketingMetadata(path: string, title: string, description: string): Metadata {
  title = title.replace(/\s*[|–—-]\s*Aethera Healthcare(?: Solutions)?\s*$/i, '').trim();
  return {
    title: { absolute: title.includes('Aethera Healthcare') ? title : `${title} | ${SITE.name}` }, description,
    alternates: { canonical: canonicalUrl(path) },
    openGraph: { title, description, url: canonicalUrl(path), type: 'website', siteName: SITE.name, images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${title} — Aethera Healthcare` }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] },
  };
}

/** Scenario assumptions supplied by the visitor; no claimed client results. */
export function revenueScenario(collections: number, improvementPercent: number, feePercent: number) {
  if (![collections, improvementPercent, feePercent].every(Number.isFinite) || collections < 0 || improvementPercent < 0 || improvementPercent > 100 || feePercent < SITE.pricing.minimumPercent || feePercent > SITE.pricing.maximumPercent) throw new Error('Invalid scenario inputs');
  const projectedMonthly = collections * (1 + improvementPercent / 100);
  const monthlyGain = projectedMonthly - collections;
  const monthlyFee = projectedMonthly * feePercent / 100;
  return { projectedMonthly, monthlyGain, monthlyFee, netAnnualGain: (monthlyGain - monthlyFee) * 12 };
}
