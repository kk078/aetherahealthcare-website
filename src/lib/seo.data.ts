/**
 * Data for programmatic SEO pages: nationwide specialty medical-billing landing
 * pages, plus shared specialty metadata. Kept deliberately curated (not
 * machine-spun) so each page carries genuine, specialty-specific substance.
 *
 * Aethera serves practices nationwide, so pages focus on specialty depth rather
 * than geography.
 */

export interface SeoSpecialty {
  slug: string;
  name: string;          // "Cardiology"
  noun: string;          // "cardiology practices"
  serviceHref?: string;  // matching /services page if one exists
  cpt: string;
  blurb: string;         // 1-2 sentence overview
  painPoints: string[];  // specialty-specific billing challenges
  faqs: { q: string; a: string }[];
}

export const SEO_SPECIALTIES: SeoSpecialty[] = [
  {
    slug: 'family-medicine',
    name: 'Family Medicine',
    noun: 'family medicine practices',
    serviceHref: '/services/family-medicine-billing',
    cpt: '99202–99215, 99381–99397, G0438–G0439',
    blurb:
      'High-volume primary care billing where small per-claim errors compound fast across thousands of visits a month.',
    painPoints: [
      'High visit volume means a low clean-claim rate quietly drains thousands of dollars a month',
      'Annual wellness visits (AWV) and preventive vs. problem-oriented E/M get bundled or downcoded',
      'Chronic care management (CCM) and transitional care (TCM) codes are under-captured',
      'Modifier 25 on a same-day E/M with a procedure is a frequent denial trigger',
    ],
    faqs: [
      { q: 'How do you stop modifier 25 denials in family medicine?', a: 'We validate that a separately identifiable E/M is documented before appending modifier 25, and scrub same-day E/M-plus-procedure claims against payer rules so they pass on the first submission.' },
      { q: 'Can you capture annual wellness visit and chronic care management revenue?', a: 'Yes — we flag AWV (G0438/G0439) and CCM/TCM opportunities at coding so preventive and care-management revenue is not left on the table.' },
    ],
  },
  {
    slug: 'cardiology',
    name: 'Cardiology',
    noun: 'cardiology practices',
    serviceHref: '/services/cardiology-billing',
    cpt: '92920–92944, 93000–93010, 93224–93272',
    blurb:
      'Procedure-heavy billing with diagnostic testing, device monitoring, and global-period rules that invite bundling denials.',
    painPoints: [
      'Cath lab and EP procedures carry complex component/modifier rules (26/TC, 59) that get denied when mis-applied',
      'Cardiac monitoring (Holter, event, remote) has strict frequency and documentation limits',
      'Stress test and echo bundling under NCCI edits is a top denial source',
      'Global surgical period overlaps with E/M visits trip up clean submission',
    ],
    faqs: [
      { q: 'How do you handle cardiac monitoring billing?', a: 'We track frequency limits and required documentation for Holter, event, and remote monitoring so the technical and professional components bill correctly and survive payer review.' },
      { q: 'Do you manage NCCI bundling on echo and stress tests?', a: 'Yes — we run NCCI PTP edits at scrubbing and only unbundle with documentation supporting a distinct service, which keeps CARC 97 denials down.' },
    ],
  },
  {
    slug: 'orthopedics',
    name: 'Orthopedics',
    noun: 'orthopedic practices',
    serviceHref: '/services/orthopedic-billing',
    cpt: '20000–29999, 99202–99215, 73000–73725',
    blurb:
      'Surgical billing dominated by global periods, prior authorization, and DME — where missed auths and modifiers cost the most.',
    painPoints: [
      'Prior authorization for surgery and advanced imaging is a leading cause of hard denials',
      'Global surgical packages and staged-procedure modifiers (58/78/79) are frequently mis-coded',
      'Durable medical equipment (DME) billing has its own documentation and supplier rules',
      'Assistant-surgeon and bilateral-procedure modifiers (80/82, 50) get denied without support',
    ],
    faqs: [
      { q: 'How do you prevent prior-authorization denials in orthopedics?', a: 'We flag procedures and imaging that typically require auth and confirm a valid authorization number is on file before the date of service, holding claims that are missing one.' },
      { q: 'Can you handle DME billing alongside surgical claims?', a: 'Yes — we manage DME documentation, supplier requirements, and the modifiers that keep equipment claims clean alongside the surgical episode.' },
    ],
  },
  {
    slug: 'dermatology',
    name: 'Dermatology',
    noun: 'dermatology practices',
    serviceHref: '/services/dermatology-billing',
    cpt: '17000–17999, 11000–11646, 99202–99215',
    blurb:
      'A mix of medical and cosmetic work where lesion counts, destruction codes, and Mohs staging make accurate coding decisive.',
    painPoints: [
      'Lesion destruction and excision codes depend on size and count that documentation must support',
      'Cosmetic vs. medically necessary determinations drive non-covered (CARC 96) denials',
      'Mohs surgery staging and pathology coding is intricate and audit-prone',
      'Modifier 25 and 59 usage on same-day biopsy plus E/M is heavily scrutinized',
    ],
    faqs: [
      { q: 'How do you code lesion destruction and excisions accurately?', a: 'We code to the documented size, count, and method, and confirm the diagnosis supports medical necessity so destruction and excision claims are not downcoded or denied.' },
      { q: 'How do you handle cosmetic vs. medical determinations?', a: 'We flag likely cosmetic services for a benefit check and ABN up front, so genuinely non-covered work is handled correctly instead of denied after the fact.' },
    ],
  },
  {
    slug: 'behavioral-health',
    name: 'Behavioral Health',
    noun: 'behavioral health and psychiatry practices',
    serviceHref: '/services/psychiatry-billing',
    cpt: '90791–90899, 99202–99215, 90832–90838',
    blurb:
      'Time-based therapy codes, add-on E/M, and tight authorization rules make behavioral health billing uniquely denial-sensitive.',
    painPoints: [
      'Time-based psychotherapy codes (90832/90834/90837) get downcoded without documented time',
      'Psychotherapy add-on codes billed with E/M require careful pairing',
      'Authorization and visit-limit rules vary widely by payer and plan',
      'Telehealth place-of-service and modifier rules shift frequently',
    ],
    faqs: [
      { q: 'How do you avoid downcoding on therapy time codes?', a: 'We confirm documented session time supports the billed code (90832/90834/90837) and pair add-on codes with E/M correctly so time-based claims hold up.' },
      { q: 'Do you handle telehealth behavioral health billing?', a: 'Yes — we keep current on place-of-service and modifier rules for telehealth so virtual sessions are reimbursed instead of rejected.' },
    ],
  },
  {
    slug: 'gastroenterology',
    name: 'Gastroenterology',
    noun: 'gastroenterology practices',
    cpt: '43180–43285, 45300–45398, 99202–99215',
    blurb:
      'Endoscopy-driven billing where screening-vs-diagnostic logic and modifier rules separate paid claims from denials.',
    painPoints: [
      'Screening vs. diagnostic colonoscopy (and modifier 33/PT) is a constant denial source',
      'Multiple-endoscopy payment rules reduce reimbursement when not coded correctly',
      'Anesthesia and facility coordination adds COB and bundling complexity',
      'Polypectomy technique codes must match the documented procedure',
    ],
    faqs: [
      { q: 'How do you handle screening vs. diagnostic colonoscopy?', a: 'We apply modifier 33/PT correctly based on intent and findings so a screening that becomes diagnostic is billed in a way that preserves the patient benefit and payment.' },
      { q: 'Do you manage multiple-endoscopy reductions?', a: 'Yes — we sequence endoscopy codes correctly so the multiple-procedure reduction is applied accurately and you are not underpaid or denied.' },
    ],
  },
  {
    slug: 'internal-medicine',
    name: 'Internal Medicine',
    noun: 'internal medicine practices',
    cpt: '99202–99215, 99495–99496, 99490',
    blurb:
      'Complex adult chronic-care billing where risk-adjusted coding and care-management revenue are easy to under-capture.',
    painPoints: [
      'E/M level selection on complex visits is frequently downcoded by payers',
      'Chronic care and transitional care management revenue goes uncaptured',
      'HCC/risk-adjustment diagnosis specificity affects long-term reimbursement',
      'Coordination across multiple specialists complicates COB and duplicate edits',
    ],
    faqs: [
      { q: 'Do you capture chronic care management revenue?', a: 'Yes — we identify CCM (99490) and TCM (99495/99496) opportunities so care-management work between visits is billed instead of given away.' },
      { q: 'How do you support accurate E/M leveling?', a: 'We code E/M to the documented medical decision-making and time, and flag under-documentation, so complex visits are not routinely downcoded.' },
    ],
  },
  {
    slug: 'pediatrics',
    name: 'Pediatrics',
    noun: 'pediatric practices',
    cpt: '99381–99394, 90460–90474, 99202–99215',
    blurb:
      'Well-child and immunization-heavy billing where vaccine administration codes and Medicaid rules drive the revenue.',
    painPoints: [
      'Vaccine administration codes (90460–90474) are under-billed against the product codes',
      'Well-child vs. sick-visit same-day billing needs modifier 25 support',
      'Medicaid and VFC (Vaccines for Children) rules add program-specific complexity',
      'Newborn and developmental screening codes are frequently missed',
    ],
    faqs: [
      { q: 'How do you maximize vaccine administration revenue?', a: 'We bill each administration component (90460–90474) alongside the vaccine product so immunization revenue is fully captured under both commercial and VFC rules.' },
      { q: 'Can you bill a well-child and sick visit on the same day?', a: 'Yes — when documentation supports it, we apply modifier 25 to the problem-oriented E/M so both the preventive and sick visit are paid.' },
    ],
  },
];

export function getSpecialty(slug: string): SeoSpecialty | undefined {
  return SEO_SPECIALTIES.find(s => s.slug === slug);
}

/** All specialty slugs — for generateStaticParams on /medical-billing/[specialty]. */
export function allSpecialtyParams(): { specialty: string }[] {
  return SEO_SPECIALTIES.map(s => ({ specialty: s.slug }));
}
