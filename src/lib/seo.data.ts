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
  {
    slug: 'neurology',
    name: 'Neurology',
    noun: 'neurology and neurophysiology practices',
    cpt: '95810–95822, 95886–95913, 99202–99215, 64615',
    blurb:
      'Electrodiagnostic testing, complex chronic neurological care, and infusion therapies where technical/professional split billing and prior authorization rules dominate cash flow.',
    painPoints: [
      'EMG and nerve conduction study (NCS) units are capped and frequently audited by Medicare MACs without strict medical necessity documentation',
      'Botox chemodenervation (CPT 64615) for chronic migraine triggers high-dollar claim denials when drug wastage (JW/JZ modifiers) is misreported',
      'EEG and ambulatory sleep study interpretation versus technical component split (26/TC) requires rigorous billing separation',
      'Infusion billing for MS and neuropathy biologics requires flawless J-code NDC pairing and prior authorization',
    ],
    faqs: [
      { q: 'How do you prevent denials on electrodiagnostic testing (EMG/NCS)?', a: 'We verify documented clinical indications against local Medicare MAC LCDs (Local Coverage Determinations) and ensure specific motor/sensory nerve counts match the billed CPT codes before submission.' },
      { q: 'How do you handle Botox wastage and J-code reporting?', a: 'We apply the required JW or JZ modifier with exact units administered and units discarded according to CMS regulations, preventing drug clawback audits.' },
    ],
  },
  {
    slug: 'pain-management',
    name: 'Pain Management & Spine',
    noun: 'interventional pain and spine practices',
    cpt: '62321–62323, 64483–64484, 64490–64495, 64635–64636',
    blurb:
      'High-acuity interventional procedures where imaging guidance bundling, bilateral modifiers, and frequency-of-injection limits determine practice solvency.',
    painPoints: [
      'Fluoroscopic and ultrasound guidance (77003, 76942) are bundled under NCCI PTP edits for modern injection codes and cannot be separately unbundled',
      'Payer frequency limitations on epidural steroid injections (e.g. max 3–4 per 12-month rolling period) cause hard non-covered rejections',
      'Bilateral spinal injections require nuanced modifier rules (Mod 50 vs. LT/RT vs. 59) depending on whether the payer is Medicare or a commercial PPO',
      'Pre-authorization expiration dates on multi-tier radiofrequency ablation (RFA) lead to massive retro-denials',
    ],
    faqs: [
      { q: 'How do you stop imaging guidance bundling denials in pain management?', a: 'We stay aligned with current CMS NCCI edits where fluoroscopic guidance is integral to spine injections (e.g., 64483), preventing unbundling penalties while capturing separately billable services like sedation when documented.' },
      { q: 'How do you manage bilateral injection billing?', a: 'We maintain payer-specific modifier matrices that automatically switch between Modifier 50 (150% allowable) and LT/RT single-line billing to match each payer\'s specific clearinghouse logic.' },
    ],
  },
  {
    slug: 'obgyn',
    name: 'Obstetrics & Gynecology (OB/GYN)',
    noun: 'OB/GYN practices and women\'s health clinics',
    cpt: '59400, 59510, 57454, 58300, 76801–76817',
    blurb:
      'Global maternity delivery packages, split antepartum/postpartum transitions, and in-office surgical procedures with dedicated device and drug reimbursement.',
    painPoints: [
      'Global maternity package unbundling when patients change insurance mid-pregnancy or deliver at an out-of-network facility (CPT 59425, 59426, 59430)',
      'LARC device acquisition reimbursement (Mirena, Paragard, Nexplanon) requires exact HCPCS J-codes and invoice reconciliation',
      'Same-day E/M (99213/99214) with in-office colposcopy or endometrial biopsy requires bulletproof Modifier 25 documentation',
      'High-risk fetal ultrasound (76811/76812) is frequently denied without clear maternal-fetal medical necessity ICD-10 indication',
    ],
    faqs: [
      { q: 'How do you handle patients who switch payers mid-pregnancy?', a: 'We split global maternity packages into itemized antepartum care (59425 for 4–6 visits, 59426 for 7+ visits), delivery-only, and postpartum-only codes so your practice captures 100% of earned revenue.' },
      { q: 'How do you ensure full payment on expensive contraceptive devices?', a: 'We track buy-and-bill LARC inventory, verify pre-auth before insertion, and pair J-codes with insertion codes (58300/11981) to guarantee positive practice margins.' },
    ],
  },
  {
    slug: 'ophthalmology',
    name: 'Ophthalmology & Optometry',
    noun: 'ophthalmology surgical centers and eye clinics',
    cpt: '66984, 66982, 67028, 92004–92014, 92134',
    blurb:
      'High-volume surgical and retina billing balancing Medicare 90-day global periods, high-cost anti-VEGF injectables, and Eye Codes vs. E/M optimization.',
    painPoints: [
      'Intravitreal injections (CPT 67028) paired with high-cost biologics (Eylea, Lucentis, Vabysmo) carry six-figure monthly financial risk if pre-auth or NDC is off',
      'Complex cataract surgery (66982) downcoded to standard (66984) when operative notes fail to substantiate pupil expansion devices or iris hooks',
      'Post-operative co-management modifier rules (Modifier 54 surgical care vs. Modifier 55 post-op management) with optometrists',
      'Retinal diagnostic testing (OCT 92134, Fluorescein 92235) bundled or denied for excessive frequency under commercial LCD policies',
    ],
    faqs: [
      { q: 'How do you optimize Eye Codes (92004/92014) vs Evaluation & Management (99202–99215)?', a: 'Our ophthalmic coders cross-evaluate medical decision making against vision exam elements to submit whichever code set yields the compliant maximum reimbursement for the visit.' },
      { q: 'How do you protect cash flow on anti-VEGF drug injections?', a: 'We maintain automated clearinghouse pre-validation for every single vial, verifying active authorization, NDC batch codes, and bilateral modifiers before claims leave our scrubber.' },
    ],
  },
  {
    slug: 'urology',
    name: 'Urology',
    noun: 'urology groups and surgery centers',
    cpt: '52000, 52601, 55700, 51726–51729',
    blurb:
      'Complex surgical urology, office cystoscopy, multi-channel urodynamics, and advanced prostate oncology therapies.',
    painPoints: [
      'Cystoscopy bundled into therapeutic procedures (e.g. ureteral stent placement 52332) without appropriate distinct procedural modifiers',
      'Urodynamic study component billing (technical vs professional, pressure flow, electromyography 51784) triggering duplicate claim rejections',
      'Prostate biopsy (55700) and ultrasound guidance (76942) documentation scrutiny by commercial health plans',
      'Part B buy-and-bill oncology injections (Eligard, Lupron, Firmagon) requiring NDC conversion and prompt payment posting',
    ],
    faqs: [
      { q: 'How do you handle cystoscopy and stent placement bundling?', a: 'We apply NCCI PTP edits and only apply Modifier 59 or XS when the cystoscopy was diagnostic and distinct, protecting your practice from audit clawbacks while maximizing legitimate reimbursement.' },
      { q: 'Do you bill multi-component urodynamic evaluations?', a: 'Yes — we itemize cystometrograms, pressure studies, and sphincter electromyography with accurate modifier 26/TC splits so every aspect of testing is fully paid.' },
    ],
  },
  {
    slug: 'radiology',
    name: 'Radiology & Diagnostic Imaging',
    noun: 'radiology groups and imaging centers',
    cpt: '71046, 74177, 70553, 77067',
    blurb:
      'High-volume imaging center and teleradiology billing requiring instant 26/TC component split, CDS/AUC compliance, and rapid turnaround.',
    painPoints: [
      'Split billing: Ensuring professional component (Mod 26) and technical facility component (Mod TC) are cleanly separated',
      'Clinical Decision Support (CDS/AUC) consultation requirement documentation for advanced diagnostic imaging',
      'Multiple-imaging payment reduction (MPPR) rules across same-day CT, MRI, and ultrasound procedures',
      'Screening vs. diagnostic mammography conversion rules (77067 vs 77065/77066) triggering patient copay balance disputes',
    ],
    faqs: [
      { q: 'How do you manage professional and technical component billing (26/TC)?', a: 'Our billing engine automatically handles global, professional-only, or technical-only claim generation depending on whether services occurred in an IDTF, hospital, or physician office.' },
      { q: 'How do you handle multiple-imaging payment reduction (MPPR)?', a: 'We sequence imaging modalities to optimize reimbursement under CMS and commercial MPPR rules, ensuring full payment on primary scans.' },
    ],
  },
  {
    slug: 'physical-therapy',
    name: 'Physical Therapy & Rehabilitation',
    noun: 'physical and occupational therapy practices',
    cpt: '97110, 97140, 97112, 97161–97163',
    blurb:
      'Time-based modal therapy billing governed by Medicare\'s 8-minute rule, therapy caps, KX modifier tracking, and plan-of-care certifications.',
    painPoints: [
      'Medicare 8-Minute Rule calculation errors resulting in over-billing or under-billing of timed units',
      'Therapy threshold cap tracking: Failure to append Modifier KX when claims exceed Medicare\'s annual threshold results in automatic rejection',
      'Missing physician signatures on the 90-day Plan of Care (POC) recertification halting payment entirely',
      'Manual therapy (97140) bundled with physical therapy evaluation (97161–97163) under NCCI edits unless Modifier 59 is justified',
    ],
    faqs: [
      { q: 'How do you calculate Medicare 8-minute rule units?', a: 'Our claim scrubbing system audits total timed minutes against Medicare\'s table (e.g., 8–22 mins = 1 unit, 23–37 mins = 2 units) to prevent audit recoupments.' },
      { q: 'How do you track the Medicare therapy cap and KX modifier?', a: 'We continuously track cumulative therapy expenditures per patient and automatically apply Modifier KX when reaching the annual limit, while alerting your staff when targeted medical review thresholds approach.' },
    ],
  },
  {
    slug: 'oncology',
    name: 'Medical Oncology & Hematology',
    noun: 'medical oncology practices and cancer centers',
    cpt: '96413, 96415, 96372, J9000–J9999',
    blurb:
      'High-value drug buy-and-bill administration, hydration sequencing, biosimilar interchangeability, and strict clinical trial modifier management.',
    painPoints: [
      'Chemotherapy infusion administration sequencing: First hour (96413) vs sequential (96417) vs concurrent (96416) errors cause immediate denials',
      'High-cost J-code drug clawbacks due to missing NDC 11-digit format, exact dose calculations, or missing JW/JZ waste reporting',
      'Hydration infusion (96360/96361) bundled as integral when administered solely as a carrier for chemotherapy',
      'Pre-authorization delays for new line-of-treatment oncology drugs leading to massive uncompensated hospital and clinic costs',
    ],
    faqs: [
      { q: 'How do you handle chemotherapy drug wastage reporting?', a: 'We strictly audit every single dose against vial sizes and automatically append Modifier JW (discarded drug) or JZ (zero waste) with exact multi-decimal units, meeting CMS oncology compliance.' },
      { q: 'How do you code complex multi-drug infusion sequences?', a: 'Our certified oncology coders follow hierarchy guidelines: primary chemotherapy always takes precedence over sequential infusions, hydration, and therapeutic pushes.' },
    ],
  },
  {
    slug: 'podiatry',
    name: 'Podiatry & Advanced Wound Care',
    noun: 'podiatry practices and wound care clinics',
    cpt: '11042–11047, 97597–97598, 11720–11721, Q4100–Q4280, 29580',
    blurb:
      'High-volume excisional debridement, cellular skin substitute grafts, and diabetic foot care requiring rigorous LCD wound documentation and Q-modifier precision.',
    painPoints: [
      'Surgical excisional debridement (11042–11047) requires precise depth documentation (dermis vs subcutaneous vs bone) or faces aggressive post-payment recoupment',
      'Biological cellular tissue grafts (Q-codes) trigger bundling denials without separate JW/JZ wastage billing and manufacturer invoice matching',
      'Routine foot care and mycotic nail debridement (11720/11721) require documented systemic disease class findings (Q7, Q8, Q9 modifiers)',
      'Unna boot compression strapping (29580/29581) billed with E/M visits faces frequent medical necessity rejections without ulcer staging',
    ],
    faqs: [
      { q: 'How do you prevent debridement depth recoupments?', a: 'We ensure clinical notes explicitly record instrument type (scalpel/curette), wound dimensions (length × width × depth in cm²), tissue type removed, and post-procedure bleeding to meet strict Medicare LCD criteria.' },
      { q: 'How are cellular skin substitute grafts billed without unbundling denials?', a: 'We coordinate pre-authorization, match manufacturer invoice pricing, append appropriate application CPTs (15271–15278), and report exact square-centimeter units plus wastage via JW modifier.' },
    ],
  },
  {
    slug: 'anesthesia',
    name: 'Anesthesiology & Interventional Sedation',
    noun: 'anesthesiology practices, CRNA groups, and pain clinics',
    cpt: '00100–01999, 99100–99140, 01967–01968',
    blurb:
      'Complex time-increment arithmetic, ASA base unit valuations, physical status modifiers, and medical direction concurrency audit defense.',
    painPoints: [
      'Concurrency management: when an anesthesiologist directs >4 rooms or is interrupted by emergency services, direction drops to medical supervision, cutting allowable reimbursement by 50%',
      'Time unit calculation discrepancies (15-minute standard increments vs exact minute rounding rules between Medicare and commercial plans)',
      'Physical status modifiers (P1–P6) and qualifying circumstances (extreme age 99100, emergency 99140) routinely downcoded without appeal',
      'Discontinuous anesthesia times and PACU handoff tracking creating compliance vulnerabilities during payer audits',
    ],
    faqs: [
      { q: 'How do you safeguard medical direction concurrency?', a: 'We integrate real-time electronic anesthesia record (AIMS) timestamps to guarantee the 7 CMS medical direction criteria are met and prevent concurrency drops from QK/QX to non-covered supervision.' },
      { q: 'How are 15-minute time increments calculated across commercial payers?', a: 'We map payer-specific contract terms for fractional time rounding (e.g. Medicare exact fractional minutes vs commercial 15-minute blocks) to maximize allowable cash capture.' },
    ],
  },
  {
    slug: 'asc',
    name: 'Ambulatory Surgery Centers (ASC)',
    noun: 'ambulatory surgery centers and outpatient surgical suites',
    cpt: 'UB-04 Rev Codes 0490, 0360, 0278; CPT 29881, 45380, 66984',
    blurb:
      'Dual facility (UB-04 / 837I) and professional (CMS-1500 / 837P) claim coordination, device-intensive implant packaging, and OPPS fee schedule optimization.',
    painPoints: [
      'Device-intensive procedures lose implant pass-through revenue when HCPCS C-codes are omitted from Revenue Code 0278',
      'Multiple procedure discounting rules (50% reduction on secondary surgical procedures) miscalculated or underpaid by commercial payers',
      'ASC facility fee packaging differs significantly from hospital outpatient department (HOPD) APC rates, causing under-billing',
      'Discontinued surgery modifier rules (Modifier 73 prior to anesthesia vs Modifier 74 after surgical initiation) frequently challenged',
    ],
    faqs: [
      { q: 'How do you capture high-cost surgical implant pass-through revenue?', a: 'Our surgical coders audit operative reports against vendor device invoices to ensure all C-codes and L-codes are accounted for under Revenue Code 0278 before UB-04 release.' },
      { q: 'How do you handle dual facility and physician billing?', a: 'We run parallel claim scrubbers for both the facility (837I) and the surgeon professional fee (837P) to synchronize diagnosis coding, procedure dates, and modifier consistency across both entities.' },
    ],
  },
  {
    slug: 'pathology',
    name: 'Pathology & Clinical Laboratory',
    noun: 'pathology practices, independent clinical laboratories, and histology labs',
    cpt: '80047–89398, 88300–88309, 88312, 88342, MolDX Z-Codes',
    blurb:
      'High-complexity surgical pathology levels, immunohistochemistry stains, molecular diagnostics (MolDX Z-codes), and CLIA certificate tier validation.',
    painPoints: [
      'CLIA certificate level mismatches (Waived, Provider-Performed Microscopy, High Complexity) on 837 claim files triggering immediate electronic payer rejections',
      'Surgical pathology unit calculation errors: Gross and microscopic examination levels (88302–88309) denied when multiple tissue specimens are unbundled without separate specimen identifiers',
      'Immunohistochemistry (88342 for initial single antibody vs 88341 for each additional) and special stains (88312/88313) downcoded or denied as duplicative',
      'Molecular diagnostic (MoPath) tier 1/tier 2 Palmetto MolDX Z-Code requirements leading to automatic commercial and Medicare denials',
    ],
    faqs: [
      { q: 'How do you ensure CLIA compliance and prevent 277CA lab claim rejections?', a: 'We embed active CLIA number verification directly into Box 23 / Loop 2300 of our EDI 837 scrubbers, validating certificate expiration dates and test complexity tiers before claim generation.' },
      { q: 'How are surgical pathology specimen levels and special stains properly billed?', a: 'Our certified pathology coders audit accession logs to verify each distinct anatomical specimen container is billed with its exact surgical pathology level (e.g., 88305 per container) and correct IHC add-on units.' },
    ],
  },
  {
    slug: 'emergency-medicine',
    name: 'Emergency Medicine & Hospitalists',
    noun: 'emergency physician groups, freestanding EDs, and hospitalist services',
    cpt: '99281–99285, 99291–99292, 99221–99223, 99231–99233',
    blurb:
      'High-acuity emergency department coding, critical care time documentation, trauma team activation charges, and No Surprises Act Qualified Payment Amount (QPA) dispute arbitration.',
    painPoints: [
      'Payer downcoding of Level 5 ED visits (99285) to Level 4 (99284) using automated algorithms without regard to high-risk diagnostic testing or MDM complexity',
      'Critical care time (99291 for first 30–74 minutes, 99292 for each additional 30 minutes) documentation clawbacks due to missing bedside time logs or non-continuous care intervals',
      'No Surprises Act out-of-network underpayments: Commercial payers reimbursing below median in-network rates without initiating Open Negotiation or Federal IDR dispute resolution',
      'Concurrent hospitalist and emergency physician admission day billing (99285 on same date as 99223) triggering duplicate service CARC 18/97 rejections',
    ],
    faqs: [
      { q: 'How do you prevent algorithmic downcoding on CPT 99285?', a: 'Our certified emergency coders substantiate Medical Decision Making (MDM) using 2023 AMA guidelines, explicitly auditing high risk of morbidity, prescription drug management, and parenterally administered medications before claim dispatch.' },
      { q: 'How do you handle No Surprises Act Qualified Payment Amount (QPA) disputes?', a: 'We track the 30-business-day Open Negotiation period for out-of-network emergency claims and file certified Federal IDR arbitration requests to capture fair-market contracted reimbursement.' },
    ],
  },
  {
    slug: 'urgent-care',
    name: 'Urgent Care & Walk-In Clinics',
    noun: 'urgent care centers, occupational health clinics, and walk-in suites',
    cpt: '99202–99214, S9088, S9083, 87880, 87804, 12001–12004',
    blurb:
      'High-throughput episodic care, urgent care facility add-on codes (S9088), rapid point-of-care CLIA waived testing, and point-of-service patient financial clearance.',
    painPoints: [
      'Commercial payer non-recognition of urgent care add-on code S9088 or bundling it into primary E/M without separate contractual reimbursement',
      'Point-of-care CLIA-waived diagnostic testing (Strep 87880, COVID 87811, Flu 87804) denied without Modifier QW and active CLIA number in Box 23',
      'Minor surgical procedures (simple laceration repair, foreign body removal, I&D) billed without Modifier 25 on same-day E/M causing complete visit write-offs',
      'High patient liability bad debt: Uncollected high-deductible copays and coinsurance at the walk-in front desk resulting in 18%+ bad debt write-offs',
    ],
    faqs: [
      { q: 'How do you ensure full payment on urgent care facility code S9088?', a: 'We map each payer contract to verify whether S9088, S9083, or global per-visit flat-rate case rates apply, ensuring claims are routed to trigger contractual facility add-on payments.' },
      { q: 'How are rapid point-of-care laboratory tests paid without rejections?', a: 'We automatically append Modifier QW to CLIA-waived testing CPTs and populate the provider clinic\'s active CLIA ID across Loop 2300 (REF*X4) on all 837P electronic files.' },
    ],
  },
  {
    slug: 'nephrology',
    name: 'Nephrology & Dialysis Centers',
    noun: 'nephrologists, dialysis centers, and kidney care clinics',
    cpt: '90951–90970, 90935–90945, 90989, 90999, 99202–99215',
    blurb:
      'ESRD monthly capitation payment (MCP) tiers, in-center and home dialysis supervision, vascular access management, and CKD chronic disease coordination.',
    painPoints: [
      'MCP monthly capitation denials (90951–90970) due to patient mid-month hospitalizations, transient dialysis treatments, or unbilled partial-month days (90970)',
      'Dialysis facility vs professional physician duplicate claim rejections under CMS ESRD Prospective Payment System (PPS)',
      'Commercial payer underpayments on immunosuppressive post-transplant medication management and complex CKD care plan oversight (G0511/99490)',
      'Vascular access declotting and fistulogram coding mismatches (36901–36906) triggering NCCI PTP edits and bilateral bundling clawbacks',
    ],
    faqs: [
      { q: 'How do you handle patient hospitalizations during an ESRD Monthly Capitation Payment (MCP) cycle?', a: 'When an ESRD patient is hospitalized during a month, full MCP codes cannot be billed. We automatically pivot to per-day MCP codes (90970) for the non-hospitalized days, preventing complete monthly reimbursement forfeiture.' },
      { q: 'How do you verify vascular access intervention coding compliance?', a: 'Our certified coders audit diagnostic angiography vs mechanical thrombectomy within the dialysis access circuit, ensuring proper usage of peripheral/central segment CPTs 36901–36906 with appropriate angiographic documentation.' },
    ],
  },
  {
    slug: 'ent',
    name: 'Otolaryngology & ENT',
    noun: 'otolaryngologists, head & neck surgeons, and ENT specialty groups',
    cpt: '31231–31298, 95165, 92557, 69210, 69436, 30520, 30140',
    blurb:
      'Functional endoscopic sinus surgery (FESS), in-office balloon sinuplasty, diagnostic nasal endoscopy, multi-antigen allergy immunotherapy (95165), and audiology billing.',
    painPoints: [
      'Diagnostic nasal endoscopy (31231) bundled into surgical sinus endoscopy (31254–31288) or denied when billed with same-day E/M without Modifier 25',
      'Commercial payer downcoding and unit clawbacks on multi-dose allergy vial preparation (95165) under restrictive payer unit limits',
      'Multiple endoscopy reduction rule deductions automatically discounting sinus procedures within the same surgical family without contractual review',
      'Cerumen removal (69210) claim denials when performed bilaterally or without documentation of instrumentation and clinical necessity',
    ],
    faqs: [
      { q: 'How do you prevent denials when billing nasal endoscopy (31231) with an office visit?', a: 'We verify that the medical record details a distinct and separately identifiable evaluation with standalone medical decision-making before appending Modifier 25 to the E/M code.' },
      { q: 'How do you navigate multiple endoscopy reduction rules in sinus surgery?', a: 'We model the base endoscopy code values against secondary sinus procedures, sequencing the highest RVU surgery primarily and tracking appropriate modifier 51/59 indicators to protect net surgeon yield.' },
    ],
  },
  {
    slug: 'rheumatology',
    name: 'Rheumatology & Biologic Infusion',
    noun: 'rheumatologists, arthritis centers, and biologic infusion suites',
    cpt: '96413–96415, 96372, 20610, 20611, 77080, J1745, J9312, J3262',
    blurb:
      'High-cost specialty biologic Buy & Bill J-codes, in-office infusion therapy sequencing, ultrasound-guided arthrocentesis (20611), and DEXA bone density scans.',
    painPoints: [
      'Biologic Buy & Bill clawbacks: Commercial payer denials on high-dollar infused drugs (Remicade, Rituxan, Actemra) due to NDC unit conversion errors',
      'JW/JZ waste modifier audit recoupments: Missing single-dose vial wastage documentation or incorrect discard unit calculation on CMS-1500',
      'Arthrocentesis bundling: Joint injections (20610/20611) denied when billed with same-day follow-up visits without discrete Modifier 25 clinical notes',
      'Prior-authorization re-certification lapses for ongoing maintenance biologic infusions causing sudden $5,000+ per-patient unreimbursed losses',
    ],
    faqs: [
      { q: 'How do you prevent Buy and Bill financial leakage on rheumatology biologics?', a: 'Our dedicated specialty pharmacy pod verifies upfront pre-authorization, exact NDC 11-digit package identifiers, and unit conversions before scheduling the infusion, capturing 100% of drug costs.' },
      { q: 'How do you ensure compliance with CMS JW and JZ drug waste modifiers?', a: 'We calculate exact discard units from single-dose vials, appending Modifier JW to documented wasted milligrams and Modifier JZ to zero-waste administrations per CMS requirements.' },
    ],
  },
  {
    slug: 'pulmonology',
    name: 'Pulmonology & Sleep Medicine',
    noun: 'pulmonologists, critical care physicians, and sleep diagnostic centers',
    cpt: '94010, 94060, 94375, 94726, 95800–95811, 31622–31629, 99202–99215',
    blurb:
      'Complete pulmonary function testing (PFT), diagnostic and therapeutic sleep studies (polysomnography 95810), home sleep apnea tests (HSAT), and flexible bronchoscopy.',
    painPoints: [
      'PFT component bundling: Multiple PFT codes (spirometry 94010, plethysmography 94726, DLCO 94729) unbundled or denied under restrictive commercial payer bundles',
      'Sleep study technical component denials: Polysomnography (95810/95811) denied due to insufficient continuous recording time (<6 hours) or lack of pre-authorization',
      'Home sleep apnea test (HSAT 95800/G0399) denials when patient fails to meet strict Epworth Sleepiness Scale or clinical comorbidity criteria',
      'Diagnostic bronchoscopy with biopsy (31625/31628) downcoded or bundled into primary airway inspection (31622)',
    ],
    faqs: [
      { q: 'How do you ensure proper reimbursement for complete pulmonary function tests (PFTs)?', a: 'We bill comprehensive PFT panels using appropriate component coding (spirometry, gas dilution, and diffusion capacity) with distinct ICD-10 indications, eliminating unbundling rejections.' },
      { q: 'How do you manage sleep study pre-authorizations and compliance verification?', a: 'We capture all necessary clinical documentation—including documented snoring, witnessed apneas, and high Epworth Sleepiness Scale scores—to secure pre-authorization prior to patient sleep lab intake.' },
    ],
  },
  {
    slug: 'infectious-disease',
    name: 'Infectious Disease & OPAT',
    noun: 'infectious disease specialists, OPAT clinics, and travel medicine practices',
    cpt: '99205, 99215, 99223, 99233, 96365–96379, 99453–99458, G0498',
    blurb:
      'High-complexity cognitive consultations, Outpatient Parenteral Antimicrobial Therapy (OPAT) management, home IV infusion coordination, and remote physiological monitoring.',
    painPoints: [
      'Inpatient consultation split billing: Downcoding of high-acuity initial inpatient consults (99223/99255) by Medicare Advantage plans questioning medical necessity',
      'OPAT home infusion denials: Medicare Part B vs Part D vs DME unbundling rejections for prolonged intravenous antibiotic administration (G0498)',
      'Prolonged cognitive service under-reimbursement: Failing to capture add-on codes (G2212) for 60+ minute complex multi-microbial evaluations',
      'Microbiology and culture diagnostic testing denials due to lack of distinct ICD-10 infection site and pathogen linkage',
    ],
    faqs: [
      { q: 'How do you capture proper reimbursement for prolonged complex infectious disease visits?', a: 'We substantiate extended cognitive decision-making using CMS time-based billing thresholds and add-on code G2212, documenting comprehensive pathogen workups and multi-drug regimen monitoring.' },
      { q: 'How do you manage OPAT home IV antibiotic claims?', a: 'We bill OPAT encounters with explicit drug administration codes (96365/96366 or G0498) and synchronize home infusion pharmacy NDC tracking with nursing oversight visits.' },
    ],
  },
  {
    slug: 'allergy-immunology',
    name: 'Allergy, Asthma & Clinical Immunology',
    noun: 'allergists, immunologists, and asthma care clinics',
    cpt: '95004, 95024, 95165, 95115, 95117, 94010, 94060, J0517, J2357',
    blurb:
      'Percutaneous skin prick and intracutaneous testing, allergen immunotherapy antigen compounding (95165), desensitization injections, and biologic asthma J-codes.',
    painPoints: [
      'Antigen compounding (95165) unit conversion rejections: Payer billing disputes over single-dose vs multi-dose maintenance vial treatment units',
      'Venom immunotherapy unbundling: Commercial payer denials when billing Hymenoptera venom testing and extract preparation concurrently',
      'Same-day skin testing and E/M denials: Modifier 25 rejections when diagnostic scratch testing (95004) is performed during an initial allergy consultation',
      'Asthma biologic prior-authorization lapses: High-cost biologic therapies (Xolair J2357, Dupixent, Fasenra) denied due to lapsed 6-month clinical recertification',
    ],
    faqs: [
      { q: 'How do you calculate and bill allergen extract preparation (95165) accurately?', a: 'We calculate exact treatment dose units based on individual vial volume and maintenance concentrations, preventing payer audit recoupments and ensuring 100% compliance with Medicare unit definitions.' },
      { q: 'How do you prevent Modifier 25 denials on same-day allergy testing visits?', a: 'We ensure physician clinical notes distinctly separate the evaluation of allergic rhinitis or asthma triggers from the technical execution of skin tests (95004/95024), satisfying payer modifier 25 requirements.' },
    ],
  },
  {
    slug: 'interventional-radiology',
    name: 'Interventional Radiology & Endovascular',
    noun: 'interventional radiologists, endovascular surgeons, and vein clinics',
    cpt: '36200–36248, 37241–37243, 37220–37235, 75710, 75625, 75774, 36556–36585',
    blurb:
      'High-complexity catheterization tree hierarchy, vascular family selective catheter placements, transcatheter embolization, revascularization, and radiological supervision.',
    painPoints: [
      'Vascular family catheterization hierarchy: Non-selective (36200) vs selective 1st, 2nd, and 3rd order branch catheterization (36245–36248) downcoding',
      'Diagnostic angiography bundling during intervention: Denials when billing diagnostic studies (75710) in conjunction with peripheral vascular interventions (37220–37235)',
      'Vascular embolization bundling: Transcatheter embolization (37241–37244) bundled into tumor ablation or uterine artery embolization procedures',
      'Venous access device insertion vs replacement vs repair (CPT 36556–36585) rejections over tunneled vs non-tunneled documentation gaps',
    ],
    faqs: [
      { q: 'How do you prevent vascular catheterization hierarchy downcoding?', a: 'Our interventional radiology billing specialists trace the catheter roadmap through each vascular family branch order, verifying selective catheterization CPT codes (36245–36248) alongside imaging supervision and interpretation (S&I) codes.' },
      { q: 'When is diagnostic angiography separately billable during a vascular intervention?', a: 'We apply CMS guidelines verifying that diagnostic angiograms are billable with Modifier 59/XU only when performed prior to the intervention to decide on treatment or when examining a distinct anatomical territory.' },
    ],
  },
  {
    slug: 'oral-surgery',
    name: 'Oral & Maxillofacial Surgery (CDT/CPT)',
    noun: 'oral and maxillofacial surgery (OMS) practices and surgical suites',
    cpt: '21085, 21141–21155, 21193–21206, 21240–21243, 40810–40818, D7210–D7999',
    blurb:
      'Dual dental (CDT) and medical (CPT) cross-coding, orthognathic surgery, TMJ arthroplasty, bone grafts, and traumatic facial reconstruction under medical insurance.',
    painPoints: [
      'Dental vs Medical carrier finger-pointing: Medical insurance denying impacted extractions or TMJ as dental, while dental insurance denies them as exceeding benefit limits',
      'Orthognathic surgical planning: Le Fort osteotomies (21141–21155) and sagittal split ramus osteotomies (21193–21206) denied for cosmetic exclusion without cephalometric proof',
      'TMJ arthroscopy and arthroplasty (21240–21243) denials requiring prior conservative non-surgical splint therapy documentation',
      'In-office surgical bone grafting (CPT 21210/21215 vs CDT D7950/D7953) underpayment and site-of-service fee differentials',
    ],
    faqs: [
      { q: 'How do you successfully cross-code oral surgery CDT dental codes to medical CPT?', a: 'We perform automated primary medical claim submission using standard HCFA-1500 / 837P formats with required ICD-10 medical necessity diagnoses (e.g. severe skeletal malocclusion or osteonecrosis) before coordinating secondary benefits through dental payers.' },
      { q: 'What documentation is required for medical pre-authorization of orthognathic surgery?', a: 'We compile and submit comprehensive cephalometric tracings, facial photographic analysis, diagnostic dental models, and airway sleep study documentation to overcome cosmetic exclusion barriers.' },
    ],
  },
  {
    slug: 'addiction-medicine',
    name: 'Addiction Medicine & SUD',
    noun: 'addiction medicine clinics, OTP programs, and residential treatment centers',
    cpt: 'G2086–G2088, G2074–G2080, H0001, H0004, H0015, H0020, H0035, G0480–G0483',
    blurb:
      'Opioid Treatment Program (OTP) weekly bundles, Office-Based Opioid Treatment (OBOT) buprenorphine induction, per diem residential billing, and definitive urine toxicology.',
    painPoints: [
      'Medicare OTP weekly bundle denials: G2074–G2080 bundled claims rejected when dispensing dates or counseling minutes do not match MAC billing schedules',
      'Office-Based Opioid Treatment (OBOT) induction under-reimbursement: Failing to capture initial month intensive assessment and induction add-ons (G2086)',
      'Definitive drug testing clawbacks: Commercial payers recouping multi-drug class UDT (G0480–G0483) panels when lacking individualized clinical justification',
      'Parity Act non-compliance: Commercial payers arbitrarily capping residential bed days below ASAM criteria recommendations',
    ],
    faqs: [
      { q: 'How do you bill Medicare Opioid Treatment Program (OTP) weekly bundled codes?', a: 'We bill HCPCS G2074–G2080 corresponding to the specific medication (methadone, buprenorphine, or naltrexone) with paired dispensing and clinical counseling documentation meeting CMS Chapter 17 requirements.' },
      { q: 'How do you prevent urine drug screen denials in addiction treatment?', a: 'We separate presumptive point-of-care screening (80305) from physician-ordered definitive mass spectrometry confirmation (G0480), attaching specific clinical reasoning and risk level documentation for each test.' },
    ],
  },
  {
    slug: 'gynecologic-oncology',
    name: 'Gynecologic Oncology & Pelvic Surgery',
    noun: 'gynecologic oncologists and pelvic surgical centers',
    cpt: '58210, 58548, 38571–38572, 49220, 58953–58956, 96560, 96413',
    blurb:
      'Complex radical pelvic resections, retroperitoneal and para-aortic lymphadenectomies, HIPEC intraperitoneal hyperthermic chemotherapy, and co-surgeon Modifier 62 compliance.',
    painPoints: [
      'Radical hysterectomy vs simple hysterectomy downcoding: Commercial payers downcoding CPT 58210/58548 when operative reports lack detailed parametrial and uterosacral ligament dissection',
      'Pelvic & para-aortic lymphadenectomy unbundling denials: Inguinal and pelvic node dissections (38571/38572) erroneously bundled into cytoreductive debulking',
      'HIPEC intraoperative chemotherapy: Hospital vs professional fee disputes on prolonged hyperthermic perfusion administration (CPT 96560)',
      'Co-surgeon Modifier 62 disputes: Reimbursement rejections when gynecologic oncologists co-operate with colorectal or urologic surgical teams',
    ],
    faqs: [
      { q: 'How do you ensure full payment for complex cytoreductive tumor debulking?', a: 'Our surgical coders substantiate ovarian tumor debulking codes (58953–58956) by documenting all concurrent resections—including omentectomy, peritoneal stripping, and bowel resections—with appropriate NCCI modifier exemptions.' },
      { q: 'How do you bill co-surgery with surgical oncologists or colorectal teams?', a: 'Both surgeons bill the identical primary CPT code appended with Modifier 62, backed by distinct, individualized operative dictations detailing the distinct operative components performed by each specialist.' },
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
