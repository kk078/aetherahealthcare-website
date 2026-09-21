export interface CodeDefinition {
  id: string;
  code: string;
  system: 'CPT' | 'CDT' | 'NDC' | 'MODIFIER' | 'ICD-10';
  category: string;
  title: string;
  plainEnglishDescription: string;
  anatomyBreakdown?: string[];
  aiDeterministicRole: string;
  humanSovereigntyRole: string;
  auditAndDenialRisk: string;
  clinicalExample: string;
  tags: string[];
}

export interface AutonomyPhase {
  phaseNumber: string;
  name: string;
  description: string;
  deterministicSoftwareAction: string[];
  humanCertifiedSignoffAction: string[];
  forbiddenAiAction: string;
  auditTrailEvidence: string;
}

export interface CaseStudyScenario {
  id: string;
  specialty: string;
  title: string;
  patientPresentation: string;
  clinicalNoteExcerpt: string;
  codesAttempted: Array<{
    system: string;
    code: string;
    label: string;
    modifier?: string;
    units?: string;
  }>;
  scannedDenialRisk: string;
  aiScrubberRecommendation: string;
  humanSignoffDecision: string;
  sha256AuditProof: string;
  cleanClaimOutcome: string;
}

export const AUTONOMY_LEVELS = [
  {
    level: 'Level 0',
    title: 'Manual Legacy',
    desc: 'Paper and manual keying. Human error rates 12–25%, high days in A/R, delayed submissions.',
    status: 'Obsolete',
  },
  {
    level: 'Level 1',
    title: 'Rule-Based Scrubbers',
    desc: 'Basic static EDI syntax filters. Misses complex clinical documentation nuances and payer policy changes.',
    status: 'Standard Clearinghouse',
  },
  {
    level: 'Level 2',
    title: 'Generative AI (Dangerous)',
    desc: 'Black-box LLMs that hallucinate codes, dollar amounts, and medical necessity. High False Claims Act risk.',
    status: 'Forbidden at Aethera',
  },
  {
    level: 'Level 3',
    title: 'Aethera Deterministic AI + Certified Human Sovereignty',
    desc: 'Strict algorithmic validation with 100% human sign-off on every dollar and clinical code before claim dispatch.',
    status: 'Aethera Standard',
    highlight: true,
  },
];

export const AUTONOMY_PHASES: AutonomyPhase[] = [
  {
    phaseNumber: '01',
    name: 'Clinical Chart Ingestion & Parsing',
    description: 'Deterministic extraction of clinical facts from EHR, encounter notes, and operative reports.',
    deterministicSoftwareAction: [
      'Parses structured and unstructured EHR encounter text without generating synthetic content.',
      'Identifies documented anatomical sites, procedural times, medication dosages, and vital signs.',
      'Flags missing clinical elements (e.g., lack of separate operative report or missing post-op period documentation).',
    ],
    humanCertifiedSignoffAction: [
      'Certified medical coder (CPC/COC) verifies physician medical decision making (MDM) complexity.',
      'Corroborates provider documentation against CMS Local and National Coverage Determinations (LCD/NCD).',
      'Validates that clinical intent matches documented surgical or medical rationale.',
    ],
    forbiddenAiAction: 'AI is mathematically barred from inventing symptoms, extrapolating unstated procedures, or assuming clinical severity.',
    auditTrailEvidence: 'Original EHR note text hash cryptographically linked to the extraction record.',
  },
  {
    phaseNumber: '02',
    name: 'Code Formulation & Crosswalk Mapping',
    description: 'Algorithmic matching of documented services against official AMA CPT, ADA CDT, FDA NDC, and WHO ICD-10 datasets.',
    deterministicSoftwareAction: [
      'Queries official CPT/CDT/HCPCS code tables with zero algorithmic guesswork.',
      'Computes FDA NDC 10-to-11-digit zero-padding (5-4-2 standard) and maps to appropriate J-code.',
      'Validates ICD-10-CM coding to maximum specificity (up to 7th character for encounter/sequelae).',
      'Checks NCCI edits for Column 1/Column 2 unbundling and Mutually Exclusive code pairs.',
    ],
    humanCertifiedSignoffAction: [
      'Reviews code candidate list against exact surgical operative details (e.g., margins, depth, complex closure).',
      'Selects correct primary vs. secondary diagnosis hierarchy to establish undisputed medical necessity.',
      'Authorizes dental-to-medical cross-coding when facial trauma or surgical pathology warrants medical coverage.',
    ],
    forbiddenAiAction: 'AI cannot unilaterally assign a code without human verification, nor can it downcode to avoid audits.',
    auditTrailEvidence: 'Complete candidate code list, NCCI table version used, and exact rule citations logged.',
  },
  {
    phaseNumber: '03',
    name: 'Modifier & Packaging Substantiation',
    description: 'Rigorous legal and clinical justification for billing modifiers (-25, -59, -X{EPSU}, -26, -TC, -JW, -JZ).',
    deterministicSoftwareAction: [
      'Detects same-day E/M paired with minor surgical procedures (0-day or 10-day global periods).',
      'Evaluates NCCI modifier indicators (0 = unbundling forbidden; 1 = modifier allowed if documented).',
      'Verifies single-dose vial NDC wastage calculations against administered dose and package size.',
    ],
    humanCertifiedSignoffAction: [
      'Personally audits clinical note to prove E/M service was significant, separately identifiable, and above routine pre/post care.',
      'Certifies separate anatomical structure, different encounter, or distinct surgeon for surgical unbundling.',
      'Attests exact discarded medication units before applying Modifier -JW or verifies zero waste for -JZ.',
    ],
    forbiddenAiAction: 'AI cannot automatically append Modifier -25 or -59 merely to force claim passage through clearinghouses.',
    auditTrailEvidence: 'Written attestation paragraph, reviewer NPI/credential ID, and matched note paragraph citation.',
  },
  {
    phaseNumber: '04',
    name: 'Sovereign Sign-Off & Claim Assembly',
    description: 'Final human seal of approval before conversion to standard ANSI ASC X12 837P/837I/837D EDI format.',
    deterministicSoftwareAction: [
      'Validates all 837 EDI loops, segments, and elements (Loop 2000A, 2010AA, 2300, 2400).',
      'Cross-references payer-specific billing rules, timely filing limits, and prior authorization numbers.',
      'Computes exact contracted fee schedule allowables and verifies $0.00 balancing variance.',
    ],
    humanCertifiedSignoffAction: [
      'Executes digital cryptographic signature on the finalized encounter packet.',
      'Performs final human sovereignty review of total charges, patient liability, and provider credentials.',
      'Authorizes release to clearinghouse gateway.',
    ],
    forbiddenAiAction: 'Zero autonomous claim release. No claim leaves Aethera without a verified human credential sign-off.',
    auditTrailEvidence: 'SHA-256 digital signature of the complete 837 payload stamped with UTC timestamp and reviewer ID.',
  },
  {
    phaseNumber: '05',
    name: '835 ERA Adjudication & Appeal Autonomy',
    description: 'Remittance parsing, underpayment detection, and clinical denial defense.',
    deterministicSoftwareAction: [
      'Parses incoming 835 electronic remittance files into claim-level and service-line CARC/RARC adjustments.',
      'Compares paid amount against fee schedule contract terms to detect silent PPO downcoding or underpayment.',
      'Matches denials against statutory appeal deadlines (e.g., 60-day Medicare redetermination, 180-day commercial).',
    ],
    humanCertifiedSignoffAction: [
      'Reviews root cause of clinical medical necessity or prior authorization denials.',
      'Drafts customized, evidence-based appeal packets citing peer-reviewed clinical guidelines, LCDs, and NCCI rules.',
      'Signs and submits legal appeal or initiates peer-to-peer physician conference.',
    ],
    forbiddenAiAction: 'AI cannot write off balances or accept illegitimate payer denials without human financial authorization.',
    auditTrailEvidence: 'Full remittance ledger trail with before-and-after cash recovery delta.',
  },
];

export const CODE_SYSTEMS_DATA: CodeDefinition[] = [
  // ===================== CPT CODES =====================
  {
    id: 'cpt-99214',
    code: '99214',
    system: 'CPT',
    category: 'Evaluation & Management (E/M)',
    title: 'Office/Outpatient Visit, Established Patient, Moderate Complexity',
    plainEnglishDescription:
      'Standard established patient clinic visit requiring moderate medical decision making (MDM) or 30–39 minutes of total provider time on the date of encounter.',
    anatomyBreakdown: [
      '99: Evaluation and Management series',
      '2: Outpatient / Office setting',
      '1: Established patient',
      '4: Level 4 complexity (Moderate MDM or 30-39 min)',
    ],
    aiDeterministicRole:
      'Checks documented time against 2021/2023 AMA E/M guidelines; cross-references problem count (1 chronic with exacerbation or 2+ stable chronic illnesses), prescription drug management, and diagnostic data review.',
    humanSovereigntyRole:
      'Certified coder verifies that physician note demonstrates genuine prescription drug management or diagnostic risk rather than copy-pasted EHR macros.',
    auditAndDenialRisk:
      'Frequently audited by Medicare Recovery Audit Contractors (RAC) for over-coding. If paired with same-day procedure without Modifier 25, triggers automatic CARC 97 denial.',
    clinicalExample:
      'Patient with Type 2 Diabetes with elevated HbA1c and hypertension: physician adjusts insulin dosage, orders renal panel, and reviews home BP logs. Billed with 99214.',
    tags: ['E/M', 'Outpatient', 'Moderate MDM', 'Established Patient'],
  },
  {
    id: 'cpt-11104',
    code: '11104',
    system: 'CPT',
    category: 'Integumentary Surgical Procedure',
    title: 'Punch Biopsy of Skin, Single Lesion',
    plainEnglishDescription:
      'Surgical biopsy of skin using a cylindrical circular blade down through full-thickness dermis into subcutaneous fat, including simple closure.',
    anatomyBreakdown: [
      '11: Integumentary system (skin/subcutaneous)',
      '10: Biopsy series',
      '4: Punch technique, initial lesion (distinct from tangential 11102 or incisional 11106)',
    ],
    aiDeterministicRole:
      'Validates 0-day global surgery period; flags unbundling edit if submitted with same-day E/M (99214) or second biopsy (+11105 add-on) without appropriate distinct site modifiers.',
    humanSovereigntyRole:
      'Verifies pathology requisition report, operative note confirming punch tool diameter, anatomical site description, and closure documentation.',
    auditAndDenialRisk:
      'Payer denial CARC 59 (processed based on multiple procedure rules) or CARC 97 if unbundled from excision codes (11600–11646) at same site.',
    clinicalExample:
      'Dermatologist performs punch biopsy on suspicious 6mm pigmented lesion on left forearm. Billed as 11104-LT.',
    tags: ['Surgery', 'Dermatology', 'Biopsy', '0-Day Global'],
  },
  {
    id: 'cpt-27447',
    code: '27447',
    system: 'CPT',
    category: 'Musculoskeletal Major Surgery',
    title: 'Total Knee Arthroplasty (TKA)',
    plainEnglishDescription:
      'Complete prosthetic replacement of the knee joint components (femoral, tibial, and patellar surfaces) for severe osteoarthritis or joint degeneration.',
    anatomyBreakdown: [
      '27: Musculoskeletal / Lower Extremity series',
      '44: Knee reconstruction series',
      '7: Total knee replacement prosthesis (distinct from unicompartmental 27446)',
    ],
    aiDeterministicRole:
      'Applies 90-day major global surgery packaging; tracks subsequent post-operative visits within 90 days to suppress duplicate billing; checks prior authorization approval records.',
    humanSovereigntyRole:
      'Reviews complete operative report, implant serial logs, FDA device identifiers, tourniquet time, and medical necessity conservative therapy failure records.',
    auditAndDenialRisk:
      'High-dollar audit scrutiny ($1,400+ allowable). Unbundled billing of synovectomy, lateral release, or patellar resurfacing during TKA results in immediate False Claims audit recoupment.',
    clinicalExample:
      'Patient with end-stage tricompartmental knee osteoarthritis undergoes right total knee replacement with cement. Billed as 27447-RT.',
    tags: ['Orthopedics', 'Major Surgery', '90-Day Global', 'Prior Auth'],
  },
  {
    id: 'cpt-93000',
    code: '93000',
    system: 'CPT',
    category: 'Cardiovascular Diagnostic',
    title: 'Electrocardiogram (ECG/EKG), Routine 12-Lead, Complete',
    plainEnglishDescription:
      '12-lead electrocardiogram including tracing, physician interpretation, and written formal report.',
    anatomyBreakdown: [
      '93: Cardiovascular medicine series',
      '00: Electrocardiography',
      '0: Global code (Tracing 93005 + Interpretation 93010 combined)',
    ],
    aiDeterministicRole:
      'Verifies place of service (POS); if performed in hospital outpatient or emergency room, automatically splits into 93010 (professional interpretation only) to avoid billing technical component owned by facility.',
    humanSovereigntyRole:
      'Confirms written separate clinical interpretation report with rhythm, rate, intervals, and axis signed by physician rather than automated ECG machine printout.',
    auditAndDenialRisk:
      'CARC 96 (Non-covered service) or CARC 16 if machine interpretation is submitted without physician signed narrative analysis.',
    clinicalExample:
      'Patient presenting with acute chest palpitations receives in-office 12-lead EKG. Cardiologist reviews tracing, documents sinus tachycardia with ST changes. Billed as 93000.',
    tags: ['Cardiology', 'Diagnostic', 'Component Split', 'E/M Linkage'],
  },

  // ===================== CDT CODES (DENTAL) =====================
  {
    id: 'cdt-d0140',
    code: 'D0140',
    system: 'CDT',
    category: 'Diagnostic Dental',
    title: 'Limited Oral Evaluation — Problem Focused',
    plainEnglishDescription:
      'Emergency or limited dental evaluation focused on a specific oral health problem, acute dental pain, trauma, or localized infection.',
    anatomyBreakdown: [
      'D: ADA Dental Procedure Identifier',
      '01: Diagnostic Clinical Oral Evaluations',
      '40: Limited evaluation, problem-focused (distinct from D0120 periodic or D0150 comprehensive)',
    ],
    aiDeterministicRole:
      'Checks frequency limitations (e.g., maximum 2 per calendar year under dental plans); identifies medical cross-coding eligibility if linked to facial trauma or emergency room visit.',
    humanSovereigntyRole:
      'Reviews dentist clinical progress notes, chief complaint, visual exam findings, and referral notes. Determines whether claim routes to dental insurance or commercial medical policy.',
    auditAndDenialRisk:
      'Payer denial if billed on the same day as a comprehensive oral evaluation (D0150) or periodic exam (D0120).',
    clinicalExample:
      'Patient arrives with acute severe swelling and pain in mandibular right quadrant. Dentist evaluates tooth #30 for localized abscess. Billed as D0140.',
    tags: ['Dental', 'Diagnostic', 'Emergency', 'Medical Cross-Coding'],
  },
  {
    id: 'cdt-d7240',
    code: 'D7240',
    system: 'CDT',
    category: 'Oral & Maxillofacial Surgery',
    title: 'Removal of Impacted Tooth — Completely Bony',
    plainEnglishDescription:
      'Surgical extraction of an impacted tooth where the crown is completely covered by bone, requiring significant osteotomy (bone removal) and/or tooth sectioning.',
    anatomyBreakdown: [
      'D: ADA Dental Code',
      '72: Surgical Extractions / Oral Surgery',
      '40: Completely bony impaction (most complex tier compared to soft tissue D7220 or partial bony D7230)',
    ],
    aiDeterministicRole:
      'Validates tooth number (Universal 1, 16, 17, 32); initiates medical crosswalk to CPT 41899 / CMS-1500 when documented as medically necessary impaction with cystic involvement or nerve impingement.',
    humanSovereigntyRole:
      'Personally audits pre-operative panoramic or CBCT 3D radiograph to confirm complete bone covering. Signs off on surgical narrative and pathology reporting.',
    auditAndDenialRisk:
      'Downcoding by dental payers to D7230 (partial bony) if radiograph does not unequivocally show complete bony coverage. Medical claim denial without documented functional impairment.',
    clinicalExample:
      '21-year-old with painful recurrent pericoronitis and horizontal full bony impaction of tooth #17. Surgeon sections tooth and removes bone. Billed as D7240 with tooth #17.',
    tags: ['Oral Surgery', 'CDT', 'Impacted Teeth', 'Medical Crosswalk'],
  },
  {
    id: 'cdt-d2393',
    code: 'D2393',
    system: 'CDT',
    category: 'Restorative Dental',
    title: 'Resin-Based Composite — Three Surfaces, Posterior',
    plainEnglishDescription:
      'Tooth-colored composite resin filling placed on three distinct surfaces of a posterior tooth (premolar or molar).',
    anatomyBreakdown: [
      'D: ADA Dental Code',
      '23: Tooth-colored composite resin restoration',
      '9: Posterior tooth',
      '3: Three surfaces (e.g., MOD: Mesial-Occlusal-Distal)',
    ],
    aiDeterministicRole:
      'Validates posterior tooth number (1–5, 12–16, 17–21, 28–32); checks that documented surface count matches exactly 3 valid letters (e.g., MOD, MOBL, DOL).',
    humanSovereigntyRole:
      'Verifies pre-operative bite-wing radiograph showing interproximal decay extending into dentin and cavity preparation depth before signoff.',
    auditAndDenialRisk:
      'Payer denial or downcoding to amalgam equivalent (D2160) under non-amalgam alternative plan clauses; denial if surfaces conflict with previous recent restoration records.',
    clinicalExample:
      'Patient with recurrent caries on tooth #19 involving mesial, occlusal, and distal surfaces. Restored with composite resin. Billed as D2393 on tooth #19, surfaces MOD.',
    tags: ['Dental', 'Restorative', 'Composite', 'Surfaces'],
  },
  {
    id: 'cdt-d9947',
    code: 'D9947',
    system: 'CDT',
    category: 'Adjunctive Dental / Sleep Medicine',
    title: 'Custom Sleep Apnea Appliance, Fabrication and Placement',
    plainEnglishDescription:
      'Design, fabrication, and custom delivery of a mandibular advancement device for patients diagnosed with Obstructive Sleep Apnea (OSA).',
    anatomyBreakdown: [
      'D: ADA Dental Identifier',
      '99: Adjunctive General Services',
      '47: Custom obstructive sleep apnea oral appliance',
    ],
    aiDeterministicRole:
      'Automatically generates medical crosswalk to HCPCS E0486 on CMS-1500; checks for documented Polysomnography (sleep study) with Apnea-Hypopnea Index (AHI > 15 or AHI > 5 with comorbidities).',
    humanSovereigntyRole:
      'Verifies written physician sleep specialist prescription, CPAP intolerance attestation, and acoustic rhinometry/bite registration records before medical claim submission.',
    auditAndDenialRisk:
      'Medical insurance CARC 50 (Non-covered unless Medicare DME criteria met). False claims risk if billed without verified physician sleep study diagnostic report.',
    clinicalExample:
      'Moderate OSA patient intolerant of CPAP fitted with custom adjustable mandibular repositioning appliance. Cross-coded to medical HCPCS E0486 with diagnostic link to G47.33.',
    tags: ['Dental', 'Sleep Apnea', 'DME Crosswalk', 'Medical Claim'],
  },

  // ===================== NDC CODES (DRUGS & BIOLOGICS) =====================
  {
    id: 'ndc-50242-060-01',
    code: '50242-0060-01',
    system: 'NDC',
    category: 'Biologic Antineoplastic',
    title: 'Bevacizumab (Avastin) 400 mg / 16 mL Single-Dose Vial',
    plainEnglishDescription:
      '11-digit FDA National Drug Code formatted for HIPAA billing, representing Avastin 400 mg single-dose vial for intravenous infusion in oncology.',
    anatomyBreakdown: [
      '50242: 5-digit Labeler Code (Genentech, Inc.)',
      '0060: 4-digit Product Code (Bevacizumab 400mg/16mL formulation, zero-padded from 060)',
      '01: 2-digit Commercial Package Size (Single glass vial)',
    ],
    aiDeterministicRole:
      'Converts 10-digit package NDC (50242-060-01, format 5-3-2) to mandatory 11-digit HIPAA 5-4-2 standard (50242-0060-01); crosswalks to HCPCS J9035 (10 mg billing unit = 40 units per vial).',
    humanSovereigntyRole:
      'Audits infusion nurse flow sheet for exact milligrams administered vs. discarded; verifies single-dose vial designation; calculates mandatory Modifier -JW discarded waste units.',
    auditAndDenialRisk:
      'Mandatory CMS drug waste reporting: Failure to report Modifier -JW (discarded waste) and -JZ (zero waste attested) results in claim rejection under Section 90004 of the Infrastructure Act.',
    clinicalExample:
      'Patient with metastatic colorectal cancer receives 350 mg Bevacizumab from a 400 mg single-dose vial. 35 units billed on J9035 with NDC 50242-0060-01; 5 units discarded billed on J9035-JW.',
    tags: ['NDC', 'Oncology', 'Biologic', 'J-Code Crosswalk', 'Waste Tracking'],
  },
  {
    id: 'ndc-00069-3150-83',
    code: '00069-3150-83',
    system: 'NDC',
    category: 'Immunosuppressive Biologic',
    title: 'Infliximab (Remicade) 100 mg Single-Use Vial',
    plainEnglishDescription:
      'Lyophilized powder for IV infusion representing Remicade 100 mg vial for Crohn’s disease, ulcerative colitis, and rheumatoid arthritis.',
    anatomyBreakdown: [
      '00069: 5-digit Labeler (Pfizer / Janssen)',
      '3150: 4-digit Product Code (Infliximab 100mg vial)',
      '83: 2-digit Package Configuration',
    ],
    aiDeterministicRole:
      'Crosswalks to HCPCS J1745 (Infliximab, 10 mg = 1 billing unit); computes total billing units (100mg vial = 10 units); checks patient weight-based dosage (5 mg/kg or 10 mg/kg) limits.',
    humanSovereigntyRole:
      'Verifies patient weight documented in EHR on infusion date; confirms tuberculosis screening and hepatitis B clearance on file; signs off on compound dilution timing.',
    auditAndDenialRisk:
      'CARC 16 with RARC N382 (Missing/invalid NDC or HCPCS/NDC mismatch); payer denial if administered dose exceeds FDA label weight ceiling without clinical justification.',
    clinicalExample:
      '70 kg patient with Crohn’s disease prescribed 5 mg/kg (350 mg total). Requires four 100mg vials (400 mg reconstituted). 35 units billed under J1745; 5 units waste billed under J1745-JW.',
    tags: ['NDC', 'Biologic', 'Infusion', 'Weight-Based Dosing', 'J-Code'],
  },
  {
    id: 'ndc-00006-3026-02',
    code: '00006-3026-02',
    system: 'NDC',
    category: 'Immuno-Oncology',
    title: 'Pembrolizumab (Keytruda) 100 mg / 4 mL Vial',
    plainEnglishDescription:
      'PD-1 inhibitor monoclonal antibody for melanoma, non-small cell lung cancer, and head/neck cancer.',
    anatomyBreakdown: [
      '00006: 5-digit Labeler Code (Merck Sharp & Dohme)',
      '3026: 4-digit Product Code (Pembrolizumab 100mg/4mL)',
      '02: 2-digit Single-dose carton package',
    ],
    aiDeterministicRole:
      'Maps to HCPCS J9271 (Injection, pembrolizumab, 1 mg = 1 unit; 100mg vial = 100 billing units); matches FDA companion biomarker diagnostics (e.g. PD-L1 TPS score >= 50%).',
    humanSovereigntyRole:
      'Confirms laboratory molecular biomarker pathology report verifying PD-L1 positivity and prior authorization certification number before dispatch.',
    auditAndDenialRisk:
      'Extremely high cost ($10,000+ per infusion). Lack of exact NDC unit qualifier (UN vs ML) or missing prior auth causes immediate permanent recoupment and hospital cash flow shock.',
    clinicalExample:
      'Patient with Stage IV NSCLC receives 200 mg fixed dose every 3 weeks. Billed as 200 units of J9271 with NDC 00006-3026-02, qualifier ML4.0, zero waste (-JZ attested).',
    tags: ['NDC', 'Keytruda', 'Biomarker Defense', 'Prior Auth', 'Oncology'],
  },

  // ===================== MODIFIERS =====================
  {
    id: 'mod-25',
    code: '-25',
    system: 'MODIFIER',
    category: 'Evaluation & Management (E/M)',
    title: 'Significant, Separately Identifiable E/M Service by Same Physician on Same Day',
    plainEnglishDescription:
      'Appended to an E/M service code (e.g. 99213, 99214) to attest that the patient’s condition required significant clinical evaluation above and beyond the usual pre- and post-operative care of a procedure performed on the same day.',
    anatomyBreakdown: [
      '2: Identifies service as procedural adjustment',
      '5: Specific designation for same-day separate E/M care',
    ],
    aiDeterministicRole:
      'Scans claim line items for minor surgical procedure (0-day or 10-day global period); verifies NCCI modifier indicator is "1"; checks for distinct diagnosis or documented separate workup.',
    humanSovereigntyRole:
      'Certified human coder reviews provider progress note to ensure the E/M stands completely independent: would the visit notes still warrant a separate billing if the procedure had not occurred?',
    auditAndDenialRisk:
      'The #1 audited modifier by CMS OIG and commercial payers. Improper automated usage results in False Claims Act civil penalties and automatic CARC 97 recoupments.',
    clinicalExample:
      'Patient arrives for routine hypertension followup. During examination, physician notices an irregular, bleeding mole and performs an unscheduled punch biopsy (11104). 99214-25 is billed with 11104.',
    tags: ['Modifier', 'E/M', 'OIG Focus', 'Same-Day Surgery'],
  },
  {
    id: 'mod-59',
    code: '-59',
    system: 'MODIFIER',
    category: 'Surgical & Procedural Unbundling',
    title: 'Distinct Procedural Service',
    plainEnglishDescription:
      'Identifies procedures or services that are not normally reported together, but were appropriate under the clinical circumstances (e.g., different session, different surgical site, separate incision/excision).',
    anatomyBreakdown: [
      '5: Procedural service adjustment',
      '9: Universal unbundling override',
    ],
    aiDeterministicRole:
      'Checks NCCI Column 1 / Column 2 edit pairs; checks if more specific Medicare -X{EPSU} modifiers apply before permitting fallback to -59.',
    humanSovereigntyRole:
      'Examines operative note for independent anatomical site, separate incision, or distinct operative session. Certifies true procedural independence.',
    auditAndDenialRisk:
      'Overused as a "magic bullet" to bypass edits. Payers aggressively scrutinize -59. CMS created -X{EPSU} subsets specifically to curtail automated -59 abuse.',
    clinicalExample:
      'Surgeon removes a lipoma from the left shoulder and an independent sebaceous cyst from the right thigh during the same operative session. Second excision billed with Modifier -59.',
    tags: ['Modifier', 'NCCI Edit', 'Unbundling', 'Surgical'],
  },
  {
    id: 'mod-xe-xp-xs-xu',
    code: '-X{EPSU}',
    system: 'MODIFIER',
    category: 'Medicare NCCI Subset Modifiers',
    title: 'Specific Unbundling Subsets (XE, XP, XS, XU)',
    plainEnglishDescription:
      'Four distinct CMS modifiers designed to replace Modifier 59 for Medicare and strict commercial plans: XE (Separate Encounter), XP (Separate Practitioner), XS (Separate Structure/Organ), XU (Unusual Non-Overlapping Service).',
    anatomyBreakdown: [
      'XE: Separate Encounter on the same date',
      'XP: Separate Practitioner in the same group',
      'XS: Separate Structure/Organ (anatomical independence)',
      'XU: Unusual Non-Overlapping Service',
    ],
    aiDeterministicRole:
      'Enforces payer policy preference: if payer is Medicare Part B or commercial plan requiring CMS subset, flags error if generic -59 is used instead of specific -X code.',
    humanSovereigntyRole:
      'Selects the exact clinical rationale (e.g., selecting XS when distinct organs are involved, or XE when patient returned to clinic later that afternoon).',
    auditAndDenialRisk:
      'Medicare contractors automatically deny claims with CARC 97 if -59 is submitted for an edit pair where -XS or -XE was required.',
    clinicalExample:
      'Orthopedic surgeon operates on left knee and right shoulder in same session. Billed using -XS (Separate Structure) rather than generic -59.',
    tags: ['Modifier', 'Medicare', 'CMS NCCI', 'Subsets'],
  },
  {
    id: 'mod-26-tc',
    code: '-26 / -TC',
    system: 'MODIFIER',
    category: 'Component Billing',
    title: 'Professional Component (-26) & Technical Component (-TC)',
    plainEnglishDescription:
      'Used to bill separately for the physician interpretation (-26) and the equipment/facility/technologist cost (-TC) of diagnostic services.',
    anatomyBreakdown: [
      '26: Professional component only (physician reading and written report)',
      'TC: Technical component only (equipment, supplies, technologist salary)',
    ],
    aiDeterministicRole:
      'Checks Place of Service (POS). In hospital outpatient (POS 22) or inpatient (POS 21), automatically appends -26 for physician claims and blocks global billing.',
    humanSovereigntyRole:
      'Confirms physician is an independent contractor or attending who actually reviewed imaging, and ensures facility has not billed complete global service.',
    auditAndDenialRisk:
      'Duplicate billing denial (CARC 18 or CARC 97) if physician practice bills global code when hospital has already claimed the technical fee.',
    clinicalExample:
      'Hospital performs brain MRI (70553). Independent radiologist reads the scan and writes interpretive report. Radiologist bills 70553-26; hospital bills 70553-TC.',
    tags: ['Modifier', 'Radiology', 'Pathology', 'Split Billing'],
  },
  {
    id: 'mod-jw-jz',
    code: '-JW / -JZ',
    system: 'MODIFIER',
    category: 'Drug Waste Reporting',
    title: 'Single-Dose Drug Waste Discarded (-JW) & Zero Waste Attested (-JZ)',
    plainEnglishDescription:
      'Mandatory CMS modifiers for single-dose vial medications. -JW identifies amount discarded as medical waste; -JZ certifies that zero drug was discarded.',
    anatomyBreakdown: [
      'JW: Drug amount discarded and not administered to any patient',
      'JZ: Attestation that zero units of drug were discarded',
    ],
    aiDeterministicRole:
      'Verifies that medication is listed on CMS Single-Dose Vial table; enforces requirement that either -JW or -JZ must appear on every HCPCS J-code claim line.',
    humanSovereigntyRole:
      'Calculates exact remainder in vial based on patient dose; confirms nurse documentation notes discarded volume in sharps container.',
    auditAndDenialRisk:
      'Claims submitted without -JW or -JZ for single-dose vials are rejected upfront by Medicare with remittance code CO-4. False claims liability if waste is billed for multi-dose vials.',
    clinicalExample:
      'Physician uses 75 mg from a 100 mg single-dose vial. Line 1: 75 units billed with -JZ or standard code. Line 2: 25 units billed with -JW as discarded waste.',
    tags: ['Modifier', 'CMS Mandate', 'Drug Waste', 'Oncology'],
  },
  {
    id: 'mod-24',
    code: '-24',
    system: 'MODIFIER',
    category: 'Post-Operative Global Surgery',
    title: 'Unrelated E/M Service by Same Physician During Global Period',
    plainEnglishDescription:
      'Allows reimbursement for an E/M visit performed during the 10-day or 90-day post-operative period of a surgical procedure, when the visit is for a completely unrelated condition.',
    anatomyBreakdown: [
      '2: E/M modifier family',
      '4: Unrelated condition during active surgical global period',
    ],
    aiDeterministicRole:
      'Tracks patient surgical history within 10 or 90 days; validates that ICD-10 diagnosis on current visit differs from surgical ICD-10 indication.',
    humanSovereigntyRole:
      'Reviews chart to confirm visit was not post-op wound check, suture removal, or expected surgical recovery symptom. Confirms distinct clinical diagnosis.',
    auditAndDenialRisk:
      'CARC B15 (Service bundled into surgical package). Payers routinely request entire medical record before releasing payment on Modifier -24.',
    clinicalExample:
      'Patient 3 weeks after hip replacement (90-day global) visits orthopedic clinic for acute severe wrist sprain from a fall. Orthopedist bills 99213-24 with wrist sprain diagnosis.',
    tags: ['Modifier', 'Global Surgery', 'Post-Op', 'Unrelated Visit'],
  },

  // ===================== ICD-10-CM LINKAGE =====================
  {
    id: 'icd-i10',
    code: 'I10',
    system: 'ICD-10',
    category: 'Circulatory Disease',
    title: 'Essential (Primary) Hypertension',
    plainEnglishDescription:
      'Standard diagnostic code for high blood pressure not secondary to renal or endocrine disease.',
    anatomyBreakdown: [
      'I: Diseases of the circulatory system',
      '10: Essential (primary) hypertension',
    ],
    aiDeterministicRole:
      'Checks Excludes1 notes (excludes hypertensive disease involving kidney I12.-, heart I11.-, or brain I67.4); validates medical necessity crosswalks to E/M 99213/99214 and lab panels.',
    humanSovereigntyRole:
      'Reviews clinical chart for secondary organ involvement (e.g., chronic kidney disease, heart failure) to ensure patient is not under-coded with simple I10 instead of combo code I13.10.',
    auditAndDenialRisk:
      'Failure to code to highest specificity lowers patient Hierarchical Condition Category (HCC) risk score and can cause downcoding of complex chronic E/M visits.',
    clinicalExample:
      'Patient presenting for routine hypertension review with stable home BP readings. Linked to CPT 99213.',
    tags: ['ICD-10', 'Hypertension', 'Primary Diagnosis', 'Medical Necessity'],
  },
  {
    id: 'icd-e11-9',
    code: 'E11.9',
    system: 'ICD-10',
    category: 'Endocrine, Nutritional & Metabolic',
    title: 'Type 2 Diabetes Mellitus without Complications',
    plainEnglishDescription:
      'Diagnostic code for Type 2 diabetes with no documented manifestation of neuropathy, nephropathy, retinopathy, or peripheral vascular disease.',
    anatomyBreakdown: [
      'E: Endocrine and metabolic disorders',
      '11: Type 2 diabetes mellitus',
      '.9: Without documented complications',
    ],
    aiDeterministicRole:
      'Flags if clinical note mentions diabetic peripheral neuropathy (E11.40), chronic kidney disease (E11.22), or diabetic retinopathy (E11.319) to prevent generic under-coding.',
    humanSovereigntyRole:
      'Reviews ophthalmology exam, microalbumin lab results, and podiatry notes to select the exact manifestational combo code. Upgrades from E11.9 to precise chronic condition.',
    auditAndDenialRisk:
      'Under-coding directly harms RAF (Risk Adjustment Factor) scores for Medicare Advantage plans, reducing legitimate practice reimbursement by thousands of dollars per patient year.',
    clinicalExample:
      'Well-controlled Type 2 diabetic patient with clean lab profile and normal sensory exam. Billed with E11.9.',
    tags: ['ICD-10', 'Diabetes', 'Chronic Care', 'Risk Adjustment'],
  },
];

export const CLINICAL_CASE_STUDIES: CaseStudyScenario[] = [
  {
    id: 'case-derm',
    specialty: 'Dermatology & Minor Surgery',
    title: 'Same-Day Office Visit with Unexpected Punch Biopsy',
    patientPresentation:
      'A 62-year-old established patient presents for scheduled quarterly evaluation of generalized actinic keratoses and severe eczema flare. During skin examination, provider identifies an irregular 7mm asymmetric pigmented lesion on the left upper back with border irregularity, suspicious for melanoma.',
    clinicalNoteExcerpt:
      '"Full skin exam conducted. Adjusted topical triamcinolone for widespread eczema. Discussed sun protection. Distinct from the rash, noted newly evolved asymmetric pigmented lesion on left upper scapular region. Discussed risks/benefits of biopsy with patient; obtained informed consent. Prepped and draped in sterile fashion. Performed 4mm punch biopsy down to subcutis. Hemostasis achieved with single 4-0 nylon suture. Specimen dispatched to pathology."',
    codesAttempted: [
      { system: 'CPT', code: '99214', label: 'Established Patient E/M Level 4', modifier: '-25' },
      { system: 'CPT', code: '11104', label: 'Punch Biopsy of Skin, Initial', modifier: '-LT' },
      { system: 'ICD-10', code: 'L20.9', label: 'Atopic dermatitis, unspecified (Linked to 99214)' },
      { system: 'ICD-10', code: 'D48.5', label: 'Neoplasm of uncertain behavior of skin (Linked to 11104)' },
    ],
    scannedDenialRisk:
      'High Risk: Payers routinely auto-deny 99214 under CARC 97 when billed on the same day as minor surgery 11104, asserting that E/M is pre-operative evaluation included in surgical fee.',
    aiScrubberRecommendation:
      'Deterministic rule validates: separate diagnosis code present (L20.9 vs D48.5); E/M MDM meets Level 4 threshold independent of biopsy; Modifier -25 is legally defensible on line 1; anatomical modifier -LT required on line 2.',
    humanSignoffDecision:
      'AAPC Certified Coder audits progress note to confirm eczema management paragraph is independent of biopsy note. Coder applies Modifier -25 to 99214 and Modifier -LT to 11104. Cryptographically signs encounter packet.',
    sha256AuditProof: 'a7f3c89b91e01d24599fb4c781045b63032d8471e98a1200df3f48a510c4bc89',
    cleanClaimOutcome: 'Paid in full on initial submission: 100% of contracted allowable collected within 14 days without payer denial or appeal delay.',
  },
  {
    id: 'case-oncol',
    specialty: 'Medical Oncology & Infusion',
    title: 'Biologic Monoclonal Antibody Infusion with Single-Dose Vial Waste',
    patientPresentation:
      'A 58-year-old patient with metastatic adenocarcinoma of the colon presents for cycle 4 of systemic chemotherapy. Prescribed Bevacizumab (Avastin) at weight-based dosage of 5 mg/kg. Patient weighs 70 kg, requiring 350 mg total dose.',
    clinicalNoteExcerpt:
      '"Administered Bevacizumab 350 mg IV over 60 minutes. Sourced from one 400 mg / 16 mL single-dose glass vial (NDC 50242-060-01). 350 mg (14 mL) administered to patient without acute reaction. Remaining 50 mg (2 mL) discarded in biological sharps waste per institutional protocol. Zero vial sharing permitted."',
    codesAttempted: [
      { system: 'HCPCS', code: 'J9035', label: 'Injection, bevacizumab, 10 mg', units: '35 units' },
      { system: 'HCPCS', code: 'J9035', label: 'Injection, bevacizumab, 10 mg (Discarded Waste)', modifier: '-JW', units: '5 units' },
      { system: 'NDC', code: '50242-0060-01', label: 'Zero-padded 11-digit NDC (5-4-2 standard)' },
    ],
    scannedDenialRisk:
      'Severe Risk: Failure to convert 10-digit NDC (50242-060-01) to 11 digits (50242-0060-01) results in upfront clearinghouse EDI rejection. Omitting Modifier -JW on discarded remainder violates CMS mandatory waste reporting and triggers False Claims audit.',
    aiScrubberRecommendation:
      'Deterministic rule zero-pads NDC product code: 50242-060-01 -> 50242-0060-01. Splits line items into administered 35 units (J9035) and discarded 5 units (J9035-JW). Reconciles 40 total units to 400mg vial size.',
    humanSignoffDecision:
      'Oncology Billing Specialist verifies nursing waste log timestamp, confirms single-dose manufacturer vial packaging, validates physician dose calculation against recorded patient weight, and authorizes 837P dispatch.',
    sha256AuditProof: '3b92f4410a8d5c80879e6231d87f54c125a691bc74e2098b672a91f5403e1982',
    cleanClaimOutcome: 'Adjudicated clean by Medicare Part B Administrative Contractor (MAC); 100% allowable reimbursed including drug waste units.',
  },
  {
    id: 'case-oral',
    specialty: 'Oral-Maxillofacial Surgery & Dental Trauma',
    title: 'Facial Trauma & Impacted Tooth Extraction Cross-Coded to Medical',
    patientPresentation:
      'A 19-year-old patient involved in a motor vehicle accident presents to the emergency maxillofacial clinic with severe mandibular trauma, lacerations, and fractured jaw with deeply impacted tooth #17 in the fracture line requiring surgical removal to prevent osteomyelitis.',
    clinicalNoteExcerpt:
      '"Trauma evaluation reveals non-displaced fracture of mandibular angle with impacted third molar #17 directly traversing the fracture line. Radiographic CBCT confirms full bony impaction with complete cortical bone coverage. Performed mucoperiosteal flap reflection, extensive bone removal with surgical bur, tooth sectioning, and extraction of #17. Fracture stabilized. Specimen and inflammatory tissue sent to pathology."',
    codesAttempted: [
      { system: 'CDT', code: 'D7240', label: 'Removal of Impacted Tooth — Completely Bony', units: 'Tooth #17' },
      { system: 'CPT', code: '41899', label: 'Unlisted procedure, dentoalveolar structures (Medical Crosswalk)' },
      { system: 'ICD-10', code: 'S02.609A', label: 'Fracture of mandible, unspecified, initial encounter for closed fracture' },
    ],
    scannedDenialRisk:
      'Critical Risk: If billed solely to dental insurance, claim exhausts annual $1,500 dental benefit, leaving $4,200 patient balance. If billed to medical without trauma linkage, medical payer denies as "Dental Exclusion".',
    aiScrubberRecommendation:
      'Deterministic rule flags trauma etiology; links ICD-10 fracture code (S02.609A) with external cause code; constructs CMS-1500 cross-coded medical claim with operative trauma report attached.',
    humanSignoffDecision:
      'Oral Surgery Certified Biller verifies medical emergency criteria, confirms trauma diagnosis documentation, attaches CBCT radiological reports, and signs off on primary submission to commercial medical carrier.',
    sha256AuditProof: 'c905e1143891002df35789bc401278ba99410efd84032a11b7029514e8c10924',
    cleanClaimOutcome: 'Approved under primary medical insurance at commercial out-of-pocket rate; zero balance billed to patient dental maximum.',
  },
];
