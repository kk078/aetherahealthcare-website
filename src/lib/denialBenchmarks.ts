/**
 * Benchmark data for the "State of Denials" report (gated lead magnet).
 *
 * Figures are industry benchmark RANGES compiled from public RCM/MGMA/AAFP/AAPC
 * commentary and Aethera's own denial-prevention knowledge base (the CARC mix the
 * coding/billing agents reason over). They are presented as typical ranges, not
 * proprietary claims, and every report view carries a methodology note. The point
 * is a credible, useful directional benchmark a practice can compare itself to.
 */

export interface DenialReason {
  carc: string;
  label: string;
  share: number; // approx % of denials this reason represents (directional)
  preventable: boolean;
}

export interface SpecialtyBenchmark {
  slug: string;
  name: string;
  initialDenialRate: string; // typical range, e.g. "9–13%"
  initialDenialMid: number;  // midpoint for the bar viz
  topQuartileDenialRate: string;
  cleanClaimRate: string;
  daysInAR: string;
  topReasons: DenialReason[];
  watchout: string; // the specialty's signature denial trap
}

export const INDUSTRY_HEADLINES = {
  avgInitialDenialRate: '~12%',
  preventableShare: '~85%',
  reworkCostPerClaim: '$25–$118',
  neverReworkedShare: '~60%',
};

export const SPECIALTY_BENCHMARKS: SpecialtyBenchmark[] = [
  {
    slug: 'family-medicine', name: 'Family Medicine',
    initialDenialRate: '8–12%', initialDenialMid: 10, topQuartileDenialRate: '≤5%',
    cleanClaimRate: '90–95%', daysInAR: '30–40 days',
    watchout: 'Modifier 25 on same-day E/M + procedure, and under-captured AWV/CCM revenue.',
    topReasons: [
      { carc: '16', label: 'Missing/incomplete information', share: 26, preventable: true },
      { carc: '4', label: 'Modifier missing/inconsistent', share: 18, preventable: true },
      { carc: '197', label: 'Authorization absent', share: 12, preventable: true },
      { carc: '27', label: 'Coverage terminated / eligibility', share: 11, preventable: true },
    ],
  },
  {
    slug: 'cardiology', name: 'Cardiology',
    initialDenialRate: '11–15%', initialDenialMid: 13, topQuartileDenialRate: '≤7%',
    cleanClaimRate: '85–92%', daysInAR: '38–48 days',
    watchout: 'NCCI bundling on echo/stress tests and component (26/TC) modifier errors.',
    topReasons: [
      { carc: '97', label: 'Bundled / NCCI edit', share: 24, preventable: true },
      { carc: '50', label: 'Medical necessity (LCD/NCD)', share: 19, preventable: true },
      { carc: '4', label: 'Modifier missing/inconsistent', share: 16, preventable: true },
      { carc: '197', label: 'Authorization absent', share: 13, preventable: true },
    ],
  },
  {
    slug: 'orthopedics', name: 'Orthopedics',
    initialDenialRate: '10–15%', initialDenialMid: 13, topQuartileDenialRate: '≤6%',
    cleanClaimRate: '85–92%', daysInAR: '40–50 days',
    watchout: 'Prior-authorization gaps on surgery/imaging and global-period modifier (58/78/79) errors.',
    topReasons: [
      { carc: '197', label: 'Authorization absent', share: 28, preventable: true },
      { carc: '97', label: 'Bundled / global period', share: 18, preventable: true },
      { carc: '4', label: 'Modifier missing/inconsistent', share: 16, preventable: true },
      { carc: '16', label: 'Missing/incomplete information', share: 12, preventable: true },
    ],
  },
  {
    slug: 'dermatology', name: 'Dermatology',
    initialDenialRate: '9–13%', initialDenialMid: 11, topQuartileDenialRate: '≤5%',
    cleanClaimRate: '88–94%', daysInAR: '32–42 days',
    watchout: 'Cosmetic-vs-medical non-covered denials and lesion size/count documentation.',
    topReasons: [
      { carc: '96', label: 'Non-covered (cosmetic)', share: 22, preventable: true },
      { carc: '50', label: 'Medical necessity', share: 18, preventable: true },
      { carc: '4', label: 'Modifier 25/59 issues', share: 17, preventable: true },
      { carc: '16', label: 'Missing/incomplete information', share: 13, preventable: true },
    ],
  },
  {
    slug: 'behavioral-health', name: 'Behavioral Health',
    initialDenialRate: '10–15%', initialDenialMid: 12, topQuartileDenialRate: '≤6%',
    cleanClaimRate: '86–93%', daysInAR: '35–45 days',
    watchout: 'Time-based therapy code downcoding and payer visit-limit/authorization rules.',
    topReasons: [
      { carc: '197', label: 'Authorization / visit limit', share: 24, preventable: true },
      { carc: '16', label: 'Missing/incomplete information', share: 19, preventable: true },
      { carc: '151', label: 'Frequency exceeds limit', share: 15, preventable: true },
      { carc: '96', label: 'Non-covered service', share: 12, preventable: true },
    ],
  },
  {
    slug: 'gastroenterology', name: 'Gastroenterology',
    initialDenialRate: '10–14%', initialDenialMid: 12, topQuartileDenialRate: '≤6%',
    cleanClaimRate: '86–93%', daysInAR: '38–48 days',
    watchout: 'Screening-vs-diagnostic colonoscopy (modifier 33/PT) and multiple-endoscopy rules.',
    topReasons: [
      { carc: '97', label: 'Bundled / multiple endoscopy', share: 22, preventable: true },
      { carc: '4', label: 'Modifier 33/PT issues', share: 19, preventable: true },
      { carc: '50', label: 'Medical necessity', share: 15, preventable: true },
      { carc: '16', label: 'Missing/incomplete information', share: 13, preventable: true },
    ],
  },
  {
    slug: 'internal-medicine', name: 'Internal Medicine',
    initialDenialRate: '9–13%', initialDenialMid: 11, topQuartileDenialRate: '≤5%',
    cleanClaimRate: '89–94%', daysInAR: '32–42 days',
    watchout: 'E/M downcoding on complex visits and uncaptured CCM/TCM care-management revenue.',
    topReasons: [
      { carc: '16', label: 'Missing/incomplete information', share: 24, preventable: true },
      { carc: '50', label: 'Medical necessity', share: 17, preventable: true },
      { carc: '4', label: 'Modifier missing/inconsistent', share: 15, preventable: true },
      { carc: '27', label: 'Eligibility / coverage', share: 12, preventable: true },
    ],
  },
  {
    slug: 'pediatrics', name: 'Pediatrics',
    initialDenialRate: '8–12%', initialDenialMid: 10, topQuartileDenialRate: '≤5%',
    cleanClaimRate: '89–94%', daysInAR: '30–40 days',
    watchout: 'Under-billed vaccine administration codes and well-vs-sick same-day visits.',
    topReasons: [
      { carc: '16', label: 'Missing/incomplete information', share: 23, preventable: true },
      { carc: '4', label: 'Modifier 25 (well + sick)', share: 18, preventable: true },
      { carc: '197', label: 'Authorization / eligibility', share: 14, preventable: true },
      { carc: '96', label: 'Non-covered / VFC rules', share: 11, preventable: true },
    ],
  },
];

export function getBenchmark(slug: string): SpecialtyBenchmark | undefined {
  return SPECIALTY_BENCHMARKS.find(b => b.slug === slug);
}
