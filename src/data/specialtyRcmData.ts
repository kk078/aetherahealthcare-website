/**
 * 20 Core Medical Specialties RCM Reference & Sovereign Human Autonomy Matrix
 * Fully compliant with ABMS Taxonomy, AMA CPT, CMS IOM Pub 100-04, NCCI Policy, and OIG Work Plan guidelines.
 */

export interface SpecialtyRcmProfile {
  id: string;
  name: string;
  abmsCategory: string;
  taxonomyCode: string;
  cptCodeRange: string;
  credentialRequired: string;
  coreCodes: Array<{
    code: string;
    system: 'CPT' | 'HCPCS' | 'ICD-10';
    label: string;
    description: string;
    globalPeriod?: string;
  }>;
  mandatoryModifiers: Array<{
    modifier: string;
    name: string;
    usage: string;
    auditTripwire: string;
  }>;
  regulatoryFramework: {
    cmsManualRef: string;
    ncciGuideline: string;
    oigWorkPlanFocus: string;
    lcdNcdReference: string;
  };
  autonomousAiFailureRisk: string;
  humanSovereigntyProtocol: string;
  rcmBenchmark: {
    cleanClaimTarget: string;
    typicalDenialRateWithoutGate: string;
    primaryCARC: string;
  };
}

export const SPECIALTY_RCM_PROFILES: SpecialtyRcmProfile[] = [
  {
    id: 'allergy-immunology',
    name: 'Allergy and Immunology',
    abmsCategory: 'Medical Specialties',
    taxonomyCode: '207K00000X',
    cptCodeRange: '95004–95199, 99202–99215',
    credentialRequired: 'CPC / CPB with Allergy Specialization',
    coreCodes: [
      {
        code: '95004',
        system: 'CPT',
        label: 'Percutaneous Allergy Skin Tests (Prick/Scratch)',
        description: 'Percutaneous testing with allergen extracts, immediate type reaction; per test unit.',
      },
      {
        code: '95117',
        system: 'CPT',
        label: 'Allergen Immunotherapy Injections (2+ Injections)',
        description: 'Professional services for allergen immunotherapy, not including provision of allergenic extracts; 2 or more injections.',
        globalPeriod: '0-day global',
      },
      {
        code: '95165',
        system: 'CPT',
        label: 'Antigen Extract Supervision & Preparation',
        description: 'Supervision of preparation and provision of antigens for allergen immunotherapy; single or multiple vials.',
      },
      {
        code: 'J0517',
        system: 'HCPCS',
        label: 'Injection, Benralizumab, 1 mg',
        description: 'Monoclonal antibody for severe eosinophilic asthma subcutaneous administration.',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-25',
        name: 'Significant Separate E/M Service',
        usage: 'Required when an acute allergic reaction or therapy plan change is evaluated during an injection-only visit.',
        auditTripwire: 'Payers reject 99213/99214 if documentation does not support decision-making independent of routine immunotherapy prep.',
      },
      {
        modifier: '-59 / -XS',
        name: 'Distinct Anatomical Site',
        usage: 'Applied to distinct testing modalities (e.g. percutaneous prick 95004 vs intracutaneous 95024) performed on separate anatomical zones.',
        auditTripwire: 'Unbundling prick and intradermal tests for the same antigen group triggers NCCI Column 1-2 rejection (CARC 97).',
      },
      {
        modifier: '-JW / -JZ',
        name: 'Drug Waste Reporting',
        usage: 'Mandatory on biologic single-dose vials (e.g. omalizumab, benralizumab) to report discarded units vs zero waste.',
        auditTripwire: 'CMS clearinghouses reject biologic claims lacking modifier -JW or -JZ under Section 90004.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 12, § 200 (Allergy Testing and Immunotherapy)',
      ncciGuideline: 'NCCI Policy Manual Ch. 11: Evaluation and Management services bundled with 95115/95117 unless separate medical necessity established.',
      oigWorkPlanFocus: 'OIG active scrutiny on multi-dose vial antigen billing (CPT 95165) unit calculation vs actual patient-administered doses.',
      lcdNcdReference: 'LCD L34648 (Allergy Testing & Desensitization Criteria)',
    },
    autonomousAiFailureRisk:
      'Generative LLMs frequently confuse total antigen vial dose volume (milliliters) with billable maintenance dose units under 95165, resulting in massive 10x upcoding and False Claims Act liability.',
    humanSovereigntyProtocol:
      'Certified allergy coder recalculates extract dilution ratios from laboratory mixing logs, validates individual skin prick counts against signed provider test maps, and verifies separate E/M documentation.',
    rcmBenchmark: {
      cleanClaimTarget: '98.4%',
      typicalDenialRateWithoutGate: '18.2%',
      primaryCARC: 'CO-97 (Bundled Service) / CO-151 (Payment Adjusted by Payer)',
    },
  },
  {
    id: 'anesthesiology',
    name: 'Anesthesiology',
    abmsCategory: 'Hospital & Surgical',
    taxonomyCode: '207L00000X',
    cptCodeRange: '00100–01999, 99100–99140, 64400–64530',
    credentialRequired: 'CANPC (Certified Anesthesia and Pain Management Coder)',
    coreCodes: [
      {
        code: '00840',
        system: 'CPT',
        label: 'Anesthesia for Lower Abdominal Surgery',
        description: 'Anesthesia for intraperitoneal procedures in lower abdomen including laparoscopy; base value 6 units.',
      },
      {
        code: '01402',
        system: 'CPT',
        label: 'Anesthesia for Total Knee Arthroplasty',
        description: 'Anesthesia for open or surgical arthroscopic procedures on knee joint; base value 7 units.',
      },
      {
        code: '64447',
        system: 'CPT',
        label: 'Femoral Nerve Block Injection (Post-op Analgesia)',
        description: 'Injection of anesthetic agent into femoral nerve for continuous or single-shot post-operative pain relief.',
        globalPeriod: '0-day global',
      },
      {
        code: '99100',
        system: 'CPT',
        label: 'Qualifying Circumstance: Extreme Age (<1 yr or >70 yr)',
        description: 'Add-on code for anesthesia complicated by extreme age; 1 base unit.',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-AA',
        name: 'Anesthesia Services Personally Performed by Anesthesiologist',
        usage: 'Full personal administration without CRNA or resident involvement.',
        auditTripwire: 'Billing -AA when CRNA was concurrently present constitutes federal false claim.',
      },
      {
        modifier: '-QK / -QX',
        name: 'Medical Direction of CRNA (2–4 Concurrent Cases)',
        usage: '-QK applied to MD claim; -QX applied to CRNA claim under 50/50 fee split.',
        auditTripwire: 'Failure to document all 7 TEFRA medical direction criteria forfeits MD payment to -AD supervision rate.',
      },
      {
        modifier: '-59',
        name: 'Post-Operative Pain Block Independent of Surgical Anesthesia',
        usage: 'Required on CPT 64447 or 64415 when block is performed for post-op analgesia rather than the primary intra-operative anesthetic.',
        auditTripwire: 'Surgeon must document explicit written request for post-op pain management; absent request results in automatic CARC 97 denial.',
      },
      {
        modifier: '-P1 to -P6',
        name: 'ASA Physical Status Classification',
        usage: 'Mandatory clinical physical risk tier (-P1 normal healthy to -P6 brain dead organ donor).',
        auditTripwire: 'Claims rejected by commercial clearinghouses if physical status modifier missing from box 24d.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 12, § 50 (Payment for Anesthesiology Services)',
      ncciGuideline: 'TEFRA 7 Rules (42 CFR § 415.110): Pre-op exam, prescription, personal participation in induction/emergence, continuous monitoring.',
      oigWorkPlanFocus: 'OIG active audit on anesthesia time unit rounding and concurrent case concurrency overlap (double-billing overlap minutes).',
      lcdNcdReference: 'ASA Relative Value Guide (Base Unit + 15-Minute Continuous Time Unit Standard)',
    },
    autonomousAiFailureRisk:
      'Autonomous software cannot cross-check real-time OR concurrency logs to catch an anesthesiologist stepping into a 5th room, which legally collapses medical direction (-QK) into medical supervision (-AD) at an 80% reimbursement penalty.',
    humanSovereigntyProtocol:
      'CANPC certified auditor inspects digital anesthesia machine timestamps, exact induction and handoff minutes, eliminates relief breaks from billable time, and verifies surgeon request for post-op nerve blocks.',
    rcmBenchmark: {
      cleanClaimTarget: '99.1%',
      typicalDenialRateWithoutGate: '22.6%',
      primaryCARC: 'CO-23 (Payment adjusted due to impact of prior adjudication) / CO-97',
    },
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    abmsCategory: 'Medical & Surgical',
    taxonomyCode: '207N00000X',
    cptCodeRange: '11102–11646, 17000–17315, 99202–99215',
    credentialRequired: 'CPC / CPCD (Certified Professional Coder in Dermatology)',
    coreCodes: [
      {
        code: '11104',
        system: 'CPT',
        label: 'Punch Biopsy of Skin, Single Lesion',
        description: 'Biopsy of skin using punch tool including simple closure; single lesion.',
        globalPeriod: '0-day global',
      },
      {
        code: '11604',
        system: 'CPT',
        label: 'Excision, Malignant Lesion, Trunk/Arms/Legs (3.1 to 4.0 cm)',
        description: 'Excision of malignant lesion including margins; excised diameter 3.1 to 4.0 cm.',
        globalPeriod: '10-day global',
      },
      {
        code: '17311',
        system: 'CPT',
        label: 'Mohs Micrographic Surgery, First Stage, Up to 5 Blocks',
        description: 'Mohs surgery for head, neck, hands, feet; includes surgeon acting as both surgical exciser and pathologist.',
        globalPeriod: '0-day global',
      },
      {
        code: '12032',
        system: 'CPT',
        label: 'Intermediate Repair, Scalp/Trunk/Extremities (2.6 to 7.5 cm)',
        description: 'Layered closure of deeper layers of subcutaneous tissue and non-muscle fascia.',
        globalPeriod: '10-day global',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-25',
        name: 'Significant, Separately Identifiable E/M Service',
        usage: 'Appended to 99213/99214 when a separate dermatological disease (e.g. psoriasis flare) is treated alongside a scheduled biopsy.',
        auditTripwire: 'OIG high-risk tripwire: billing -25 without distinct history, exam, and treatment plan triggers automatic prepayment audit.',
      },
      {
        modifier: '-59 / -XS',
        name: 'Distinct Anatomical Site',
        usage: 'Required when multiple biopsies or excisions are performed on anatomically distinct lesions.',
        auditTripwire: 'Failing to specify exact body coordinates (e.g. right upper arm vs left lumbar) results in Column 2 NCCI bundling.',
      },
      {
        modifier: '-58',
        name: 'Staged or Related Procedure in Post-op Global',
        usage: 'Applied to delayed flap closure or re-excision following pathology review during a 10- or 90-day global period.',
        auditTripwire: 'Missing modifier -58 leads to denial as bundled routine post-operative care.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 12, § 40 (Surgeons and Global Surgery)',
      ncciGuideline: 'NCCI Policy Manual Ch. 3: Simple wound closure bundled into all excision codes (11400–11646).',
      oigWorkPlanFocus: 'OIG Work Plan scrutiny on Modifier -25 unbundling with minor dermatological surgical procedures.',
      lcdNcdReference: 'LCD L33942 (Removal of Benign Skin Lesions Medical Necessity Guidelines)',
    },
    autonomousAiFailureRisk:
      'AI models regularly calculate excision margins incorrectly by summing multiple lesion radii instead of calculating the maximum lesion diameter plus narrowest surgical margins, leading to fraudulent code level inflation.',
    humanSovereigntyProtocol:
      'Certified dermatology coder correlates operative defect size with pathology gross description, verifies intermediate repair layer documentation, and substantiates separate E/M decision making.',
    rcmBenchmark: {
      cleanClaimTarget: '98.7%',
      typicalDenialRateWithoutGate: '24.1%',
      primaryCARC: 'CO-97 (Bundling Edit) / CO-16 (Claim lacks information needed for adjudication)',
    },
  },
  {
    id: 'diagnostic-radiology',
    name: 'Diagnostic Radiology',
    abmsCategory: 'Diagnostic Imaging',
    taxonomyCode: '2085R0202X',
    cptCodeRange: '70010–76499, 77001–77086',
    credentialRequired: 'CIRCC / RCC (Radiology Certified Coder)',
    coreCodes: [
      {
        code: '71046',
        system: 'CPT',
        label: 'Chest X-Ray, 2 Views (PA and Lateral)',
        description: 'Radiologic examination of chest; 2 views including frontal and lateral projections.',
      },
      {
        code: '70450',
        system: 'CPT',
        label: 'Computed Tomography (CT) Head/Brain without Contrast',
        description: 'CT scan of head or brain without intravenous contrast material.',
      },
      {
        code: '74177',
        system: 'CPT',
        label: 'Computed Tomography (CT) Abdomen & Pelvis with Contrast',
        description: 'Computed tomography of abdomen and pelvis concurrently with contrast material.',
      },
      {
        code: '72148',
        system: 'CPT',
        label: 'Magnetic Resonance Imaging (MRI) Lumbar Spine without Contrast',
        description: 'MRI of lumbar spinal canal and contents without intravenous contrast agent.',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-26',
        name: 'Professional Component',
        usage: 'Billed by interpreting radiologist who renders the written formal diagnostic report.',
        auditTripwire: 'Billing global code without possessing equipment/technologist staff triggers federal facility split recoupment.',
      },
      {
        modifier: '-TC',
        name: 'Technical Component',
        usage: 'Billed by imaging center or hospital owning the scanner and employing technologists.',
        auditTripwire: 'Billing -TC without documented physician order in chart triggers immediate Medicare recovery.',
      },
      {
        modifier: '-FX',
        name: 'Computed Radiography X-Ray (Cassette-Based)',
        usage: 'Mandatory CMS modifier indicating film/CR rather than direct digital DR; triggers statutory 10% payment reduction.',
        auditTripwire: 'Omitting -FX on CR equipment constitutes failure to disclose statutory payment discount under Consolidated Appropriations Act.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 13 (Radiology Services and Other Diagnostic Procedures)',
      ncciGuideline: 'NCCI PTP Policy Ch. 9: Diagnostic scout radiographs bundled into comprehensive CT/MRI exams.',
      oigWorkPlanFocus: 'OIG audit focus on multiple repeat CT scans of abdomen/pelvis without clinical progression.',
      lcdNcdReference: 'Protecting Access to Medicare Act (PAMA) Clinical Decision Support Mechanism (CDSM) Mandate',
    },
    autonomousAiFailureRisk:
      'Autonomous AI cannot verify whether the referring physician consulted a certified Clinical Decision Support Mechanism (CDSM) with appropriate AUC G-codes, resulting in blanket CMS claim rejections.',
    humanSovereigntyProtocol:
      'Certified radiology coder validates referring provider NPI against CDSM consultation record, reviews written signature on wet-read reports, and ensures appropriate contrast route documentation.',
    rcmBenchmark: {
      cleanClaimTarget: '99.3%',
      typicalDenialRateWithoutGate: '14.8%',
      primaryCARC: 'CO-4 (The procedure code is inconsistent with the modifier used) / CO-97',
    },
  },
  {
    id: 'emergency-medicine',
    name: 'Emergency Medicine',
    abmsCategory: 'Hospital Acute',
    taxonomyCode: '207P00000X',
    cptCodeRange: '99281–99285, 99291–99292, 12001–13153',
    credentialRequired: 'CEDC (Certified Emergency Department Coder)',
    coreCodes: [
      {
        code: '99285',
        system: 'CPT',
        label: 'Emergency Department Visit, Level 5 (High Complexity MDM)',
        description: 'Emergency department visit requiring high medical decision making involving immediate threat to life or function.',
      },
      {
        code: '99291',
        system: 'CPT',
        label: 'Critical Care Service, First 30–74 Minutes',
        description: 'Critical care evaluation and management of critically ill patient; first 30–74 minutes of cumulative physician time.',
      },
      {
        code: '31500',
        system: 'CPT',
        label: 'Emergency Endotracheal Intubation',
        description: 'Direct endotracheal intubation for airway management; separate procedure.',
        globalPeriod: '0-day global',
      },
      {
        code: '36556',
        system: 'CPT',
        label: 'Insertion of Non-Tunneled Central Venous Catheter',
        description: 'Insertion of central venous line into jugular, subclavian, or femoral vein; age 5 years and older.',
        globalPeriod: '0-day global',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-25',
        name: 'Separate E/M with Emergency Procedure',
        usage: 'Required on 99284/99285 when procedures like fracture reduction, laceration repair, or lumbar puncture are performed.',
        auditTripwire: 'Payers automatically downcode or bundle ED E/M if the procedural documentation is intertwined with the general trauma assessment.',
      },
      {
        modifier: '-FT',
        name: 'Unrelated E/M for Critical Care in Post-Op Global',
        usage: 'Applied to 99291 when critical care is provided during a surgical global period for a condition unrelated to the initial surgery.',
        auditTripwire: 'Critical care claims during global periods without -FT are rejected under post-operative transfer edits.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 12, § 30.6.12 (Critical Care Services)',
      ncciGuideline: 'Emergency intubation (31500), CPR (92950), and central lines (36556) have distinct NCCI edits when billed alongside critical care (99291).',
      oigWorkPlanFocus: 'OIG high-priority initiative investigating Level 5 ED upcoding (CPT 99285) lacking high-risk medication administration.',
      lcdNcdReference: 'EMTALA Mandate (42 U.S.C. § 1395dd) & CMS Revised 2023 ED MDM Framework',
    },
    autonomousAiFailureRisk:
      'AI scrubbers frequently fail to deduct the procedural time spent performing intubations and central lines from the total critical care minutes recorded, directly violating CMS cumulative time rules.',
    humanSovereigntyProtocol:
      'CEDC certified coder reads physician flowsheets, subtracts discrete surgical procedural times from total bedside minutes, and verifies parenteral drug administration to substantiate Level 5 MDM.',
    rcmBenchmark: {
      cleanClaimTarget: '98.1%',
      typicalDenialRateWithoutGate: '26.4%',
      primaryCARC: 'CO-97 (Bundled with Procedure) / CO-150 (Payment adjusted by payer)',
    },
  },
  {
    id: 'family-medicine',
    name: 'Family Medicine',
    abmsCategory: 'Primary Care',
    taxonomyCode: '207Q00000X',
    cptCodeRange: '99202–99215, 99381–99397, 99490, G0438–G0439',
    credentialRequired: 'CPC / CPB Primary Care Specialist',
    coreCodes: [
      {
        code: '99214',
        system: 'CPT',
        label: 'Established Patient Office Visit, Level 4 (Moderate MDM)',
        description: 'Office visit requiring 2+ stable chronic conditions, or 1 chronic illness with exacerbation, plus prescription management.',
      },
      {
        code: 'G0439',
        system: 'HCPCS',
        label: 'Medicare Annual Wellness Visit, Subsequent',
        description: 'Annual wellness visit including personalized prevention plan service for Medicare beneficiaries.',
      },
      {
        code: '99490',
        system: 'CPT',
        label: 'Chronic Care Management (CCM), First 20 Minutes',
        description: 'Chronic care management services for patients with 2 or more chronic conditions; 20 minutes of clinical staff time per month.',
      },
      {
        code: '96127',
        system: 'CPT',
        label: 'Brief Emotional / Behavioral Assessment (PHQ-9)',
        description: 'Brief emotional and behavioral assessment with scoring and documentation per standardized instrument.',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-25',
        name: 'Significant Separate E/M with Preventive Exam',
        usage: 'Applied to 99213/99214 when an acute or chronic condition is evaluated during an Annual Wellness Visit (G0439).',
        auditTripwire: 'Requires completely distinct SOAP notes. Payers audit split wellness visits for lack of separate medical necessity.',
      },
      {
        modifier: '-33',
        name: 'Preventive Service Exempt from Cost-Sharing',
        usage: 'Mandatory under ACA § 2713 for USPSTF Grade A and B screening services to prevent copayment or deductible deduction.',
        auditTripwire: 'Omitting -33 improperly bills elderly patients for copays, triggering federal balance-billing compliance violations.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 12, § 30.6 (Evaluation and Management Services)',
      ncciGuideline: 'NCCI Policy: Routine screening tests bundled into global preventive medicine codes unless standalone diagnosis supported.',
      oigWorkPlanFocus: 'OIG audit on Chronic Care Management (CCM 99490) time logging and concurrent Principal Care Management (PCM) overlap.',
      lcdNcdReference: 'CMS Medicare Annual Wellness Visit (AWV) Guidelines & Affordable Care Act § 2713',
    },
    autonomousAiFailureRisk:
      'AI models fail to recognize when a patient raises a new acute complaint during an annual wellness exam that meets threshold criteria for a separate 99214-25 visit, leaving $140+ per encounter uncaptured.',
    humanSovereigntyProtocol:
      'Certified primary care coder inspects both the preventive screening checklist and the problem-oriented note, verifies MEAT criteria for chronic diseases, and attaches modifier -25 with distinct ICD-10 pointers.',
    rcmBenchmark: {
      cleanClaimTarget: '99.0%',
      typicalDenialRateWithoutGate: '16.9%',
      primaryCARC: 'CO-97 (Bundled into Preventive Exam) / PR-1 (Deductible Amount)',
    },
  },
  {
    id: 'internal-medicine',
    name: 'Internal Medicine',
    abmsCategory: 'Adult Medicine',
    taxonomyCode: '207R00000X',
    cptCodeRange: '99202–99215, 99221–99233, 99238–99239',
    credentialRequired: 'CPC / CPMA (Certified Professional Medical Auditor)',
    coreCodes: [
      {
        code: '99215',
        system: 'CPT',
        label: 'Established Patient Office Visit, Level 5 (High MDM)',
        description: 'High complexity decision making: severe exacerbation of chronic illness threatening life or complex parenteral therapy.',
      },
      {
        code: '99223',
        system: 'CPT',
        label: 'Initial Hospital Inpatient Care, Level 3 (High MDM)',
        description: 'Initial inpatient care for admission of patient with severe acute illness or multiorgan failure; 75 min threshold.',
      },
      {
        code: '99233',
        system: 'CPT',
        label: 'Subsequent Hospital Inpatient Care, Level 3',
        description: 'Subsequent inpatient visit for unstable patient with severe organ decompensation; 50 min threshold.',
      },
      {
        code: '99239',
        system: 'CPT',
        label: 'Hospital Discharge Day Management, More Than 30 Min',
        description: 'Comprehensive hospital discharge management exceeding 30 minutes including final exam and coordination.',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-AI',
        name: 'Principal Physician of Record',
        usage: 'Appended by admitting internist to initial hospital care code (99221–99223) to differentiate from consulting physicians.',
        auditTripwire: 'Medicare denies secondary physician initial hospital visits lacking consultation cross-walks if -AI is missing.',
      },
      {
        modifier: '-24',
        name: 'Unrelated Inpatient E/M during Surgical Global Period',
        usage: 'Used when an internist co-manages complex diabetes or COPD decompensation during a patient’s 90-day surgical recovery.',
        auditTripwire: 'Missing -24 results in automatic denial as bundled routine postoperative surgical care.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 12, § 30.6.9 (Payment for Hospital Inpatient Services)',
      ncciGuideline: '2023 Revised E/M Guidelines: Number and complexity of problems, data reviewed, and risk of complications.',
      oigWorkPlanFocus: 'OIG nationwide study on high-level inpatient E/M billing (99223 and 99233) driven by automated EHR copy-paste templates.',
      lcdNcdReference: 'CMS Hospital Inpatient Prospective Payment System (IPPS) Guidelines',
    },
    autonomousAiFailureRisk:
      'Autonomous systems cannot distinguish between active clinical medical decision making and historical EHR copy-forward bloat, coding routine stable hospital visits as high-level 99233s vulnerable to RAC clawbacks.',
    humanSovereigntyProtocol:
      'CPMA certified auditor validates physician chart entries for true changes in management, verifies independent interpretation of diagnostic tests, and confirms discharge time logging exceeds 30 minutes.',
    rcmBenchmark: {
      cleanClaimTarget: '98.5%',
      typicalDenialRateWithoutGate: '21.3%',
      primaryCARC: 'CO-97 (Included in Global Service) / CO-150 (Level of care adjusted)',
    },
  },
  {
    id: 'medical-genetics',
    name: 'Medical Genetics',
    abmsCategory: 'Genomic & Precision Medicine',
    taxonomyCode: '207S00000X',
    cptCodeRange: '81162–81479, 96040',
    credentialRequired: 'CPC / Molecular Diagnostics Billing Specialist',
    coreCodes: [
      {
        code: '81162',
        system: 'CPT',
        label: 'BRCA1 & BRCA2 Full Sequence and Duplication/Deletion',
        description: 'Full gene sequence analysis and full duplication/deletion analysis for hereditary breast/ovarian cancer.',
      },
      {
        code: '81415',
        system: 'CPT',
        label: 'Exome Sequence Analysis (e.g. Unexplained Pediatric Anomaly)',
        description: 'Exome sequence analysis including whole exome sequencing of proband.',
      },
      {
        code: '81479',
        system: 'CPT',
        label: 'Unlisted Molecular Pathology Procedure',
        description: 'Unlisted molecular pathology test requiring detailed lab methodology breakdown and invoices.',
      },
      {
        code: '96040',
        system: 'CPT',
        label: 'Medical Genetics Counseling, Each 30 Minutes',
        description: 'Medical genetics and genetic counseling services provided by non-physician genetic counselor; each 30 minutes.',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-59',
        name: 'Distinct Procedural Assay',
        usage: 'Applied to distinct gene sequence components performed concurrently with multiplex assays.',
        auditTripwire: 'Palmetto MolDX rejections occur if distinct assays lack separate diagnostic justification.',
      },
      {
        modifier: '-KX',
        name: 'Specific Clinical Coverage Criteria Met',
        usage: 'Mandated by Medicare MACs to attest that patient pedigree meets strict hereditary risk criteria under MolDX LCD.',
        auditTripwire: 'Submitting BRCA or oncologic panels without modifier -KX triggers immediate statutory coverage denial.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 16 (Laboratory Services)',
      ncciGuideline: 'MolDX Program Guidelines: Requires unique 5-character DEX Z-Code identifier in addition to CPT code.',
      oigWorkPlanFocus: 'OIG active scrutiny on genetic test panels billed with multiple unlisted codes (81479) without pre-authorization.',
      lcdNcdReference: 'CMS NCD 90.2 (Next Generation Sequencing for Advanced Cancer) & MolDX LCDs',
    },
    autonomousAiFailureRisk:
      'AI models cannot navigate the complex DEX Z-Code registry to map laboratory assay identifiers to payer specific molecular diagnostic LCDs, causing 100% of genomic panel claims to fail clearinghouse intake.',
    humanSovereigntyProtocol:
      'Certified genetic billing specialist matches lab CLIA certification, links valid Palmetto DEX Z-Code to EDI segment SV1, and validates documentation of family history pedigree before submission.',
    rcmBenchmark: {
      cleanClaimTarget: '97.2%',
      typicalDenialRateWithoutGate: '34.8%',
      primaryCARC: 'CO-16 (Claim lacks information) / CO-50 (Non-covered service under LCD)',
    },
  },
  {
    id: 'neurology',
    name: 'Neurology',
    abmsCategory: 'Neuroscience',
    taxonomyCode: '2084N0400X',
    cptCodeRange: '95812–95999, 99202–99215',
    credentialRequired: 'CPC / Neurophysiology Billing Specialist',
    coreCodes: [
      {
        code: '95816',
        system: 'CPT',
        label: 'Electroencephalogram (EEG), Routine Awake & Drowsy',
        description: 'Standard clinical EEG recording awake and drowsy; including hyperventilation and photic stimulation.',
      },
      {
        code: '95860',
        system: 'CPT',
        label: 'Needle Electromyography (EMG), One Extremity',
        description: 'Needle electromyography of one extremity with or without related paraspinal areas.',
      },
      {
        code: '95910',
        system: 'CPT',
        label: 'Nerve Conduction Studies (7 or 8 Studies)',
        description: 'Nerve conduction studies; 7 or 8 sensory, motor, or F-wave studies.',
      },
      {
        code: '95718',
        system: 'CPT',
        label: 'Long-Term Video EEG Monitoring (2 to 12 Hours)',
        description: 'Long-term video EEG monitoring by technologist with physician review; 2 to 12 hours.',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-26',
        name: 'Professional Component Interpretation',
        usage: 'Billed by neurologist for formal written interpretation and tracing analysis.',
        auditTripwire: 'Hospital unbundling audits occur if physician bills global code for hospital inpatient EEG.',
      },
      {
        modifier: '-59 / -XS',
        name: 'Separate Anatomical Extremity',
        usage: 'Required when billing bilateral or multiple discrete nerve studies across upper and lower limbs.',
        auditTripwire: 'Failure to separate upper vs lower limb testing results in MUE frequency cap denials.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 12 (Physicians and Nonphysician Practitioners)',
      ncciGuideline: 'NCCI edits strictly limit simultaneous billing of sensory and motor conduction studies on identical nerve paths.',
      oigWorkPlanFocus: 'OIG focus on high-volume nerve conduction studies (>12 studies in single setting) lacking radiculopathy indications.',
      lcdNcdReference: 'LCD L34534 (Nerve Conduction Studies and Electromyography Quality Standards)',
    },
    autonomousAiFailureRisk:
      'AI software cannot parse raw wave tracings to count the actual number of discrete nerves stimulated versus repeat trials on the same nerve, routinely triggering OIG audit tripwires for excessive study count units.',
    humanSovereigntyProtocol:
      'Certified neurophysiology coder audits raw stimulation logs, counts individual motor/sensory/F-wave channels, verifies needle EMG was performed in ≥5 muscles for radiculopathy, and confirms signed reports.',
    rcmBenchmark: {
      cleanClaimTarget: '98.3%',
      typicalDenialRateWithoutGate: '20.5%',
      primaryCARC: 'CO-97 (Bundling Edit) / CO-151 (Payment adjusted based on MUE units)',
    },
  },
  {
    id: 'nuclear-medicine',
    name: 'Nuclear Medicine',
    abmsCategory: 'Molecular Imaging & Theranostics',
    taxonomyCode: '207U00000X',
    cptCodeRange: '78012–79999',
    credentialRequired: 'RCC (Radiology Certified Coder) / Nuclear Medicine Specialist',
    coreCodes: [
      {
        code: '78452',
        system: 'CPT',
        label: 'Myocardial Perfusion Imaging (SPECT), Multiple Studies',
        description: 'Myocardial perfusion imaging SPECT; multiple studies at rest and/or stress, with or without quantification.',
      },
      {
        code: '78815',
        system: 'CPT',
        label: 'PET/CT Scan for Tumor Imaging, Skull Base to Mid-Thigh',
        description: 'Positron emission tomography (PET) with concurrently acquired computed tomography (CT); skull base to mid-thigh.',
      },
      {
        code: 'A9500',
        system: 'HCPCS',
        label: 'Technetium Tc-99m Sestamibi Diagnostic, Per Dose',
        description: 'Diagnostic radiopharmaceutical agent for myocardial perfusion and parathyroid imaging.',
      },
      {
        code: 'A9552',
        system: 'HCPCS',
        label: 'Fluorodeoxyglucose F-18 (FDG), Up to 45 mCi',
        description: 'Diagnostic radiopharmaceutical for PET oncology and neurology metabolic imaging.',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-26 / -TC',
        name: 'Professional vs Technical Split',
        usage: 'Required when radiologist interprets scan performed at an outpatient hospital or imaging center.',
        auditTripwire: 'Billing global code without ownership of cyclotron/radiopharmacy triggers facility overpayment clawbacks.',
      },
      {
        modifier: '-Q0',
        name: 'Investigational Clinical Trial Service',
        usage: 'Mandated by CMS for oncologic PET indications falling under Coverage with Evidence Development (CED).',
        auditTripwire: 'Omitting -Q0 on CED-designated PET scans results in statutory non-coverage denials.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 13, § 60 (Nuclear Medicine and Radiopharmaceuticals)',
      ncciGuideline: 'Diagnostic CT scans (e.g. 71250 chest) bundled into concurrent PET/CT scans (78815) under Column 1-2 NCCI.',
      oigWorkPlanFocus: 'OIG scrutiny on radiopharmaceutical dosage waste tracking and separate billing of packaged imaging agents.',
      lcdNcdReference: 'CMS NCD 220.6 (PET Scans for Oncologic Indications)',
    },
    autonomousAiFailureRisk:
      'Autonomous AI cannot determine whether diagnostic CT slices were separately ordered for standalone diagnostic interpretation versus low-dose attenuation correction, triggering illegal unbundling of 71250 with 78815.',
    humanSovereigntyProtocol:
      'Certified radiology coder verifies nuclear pharmacy assay calibration logs for administered mCi, confirms clinical indication matches NCD 220.6 oncologic covered indications, and validates physician interpretation.',
    rcmBenchmark: {
      cleanClaimTarget: '98.8%',
      typicalDenialRateWithoutGate: '19.4%',
      primaryCARC: 'CO-97 (Bundled with Scan) / CO-50 (Non-Covered Experimental/Investigational)',
    },
  },
  {
    id: 'obstetrics-gynecology',
    name: 'Obstetrics and Gynecology',
    abmsCategory: 'Women’s Health & Surgical',
    taxonomyCode: '207V00000X',
    cptCodeRange: '56405–59899, 99202–99215',
    credentialRequired: 'CPC / COBGC (Certified Obstetrics and Gynecology Coder)',
    coreCodes: [
      {
        code: '59400',
        system: 'CPT',
        label: 'Routine Obstetric Care, Vaginal Delivery (Antepartum + Postpartum)',
        description: 'Comprehensive global obstetric care including antepartum care, vaginal delivery, and postpartum care.',
        globalPeriod: 'Global Maternity Package',
      },
      {
        code: '59510',
        system: 'CPT',
        label: 'Routine Obstetric Care, Cesarean Delivery',
        description: 'Comprehensive global obstetric care including antepartum care, cesarean delivery, and postpartum care.',
        globalPeriod: 'Global Maternity Package',
      },
      {
        code: '58558',
        system: 'CPT',
        label: 'Hysteroscopy, Surgical; with Biopsy and/or Polypectomy',
        description: 'Surgical hysteroscopy with sampling of endometrium and/or polypectomy, with or without D&C.',
        globalPeriod: '0-day global',
      },
      {
        code: '58150',
        system: 'CPT',
        label: 'Total Abdominal Hysterectomy with/without Tubes/Ovaries',
        description: 'Total abdominal hysterectomy with or without removal of fallopian tube(s) or ovary(s).',
        globalPeriod: '90-day global',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-22',
        name: 'Increased Procedural Complexity',
        usage: 'Applied to cesarean deliveries or hysterectomies complicated by dense pelvic adhesions (stage IV endometriosis), BMI >45, or prior surgeries.',
        auditTripwire: 'Requires operative time >50% above average and explicit comparative narrative; payers routinely deny without documentation.',
      },
      {
        modifier: '-25',
        name: 'Separate E/M with Global Antepartum Visit',
        usage: 'Required when patient presents with non-obstetric conditions (e.g. pyelonephritis, severe depression) during routine antepartum check.',
        auditTripwire: 'Routine pregnancy complaints (nausea, mild edema) are bundled; unbundling without distinct pathology triggers post-payment clawbacks.',
      },
      {
        modifier: '-51',
        name: 'Multiple Surgical Procedures',
        usage: 'Applied to secondary gynecological procedures (e.g. cystectomy with hysterectomy).',
        auditTripwire: 'Salpingectomy (58700) is bundled into hysterectomy (58150) under NCCI unless performed for malignancy or ectopic pregnancy.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 12, § 40 (Surgeons and Global Surgery Maternity Guidelines)',
      ncciGuideline: 'Diagnostic hysteroscopy (58555) is bundled into surgical hysteroscopy (58558) under Column 1-2 NCCI.',
      oigWorkPlanFocus: 'OIG audit on split maternity billing (59425/59426) when full global package (59400) was previously collected.',
      lcdNcdReference: 'ACOG Practice Bulletin Guidelines on Global Maternity Billing Standards',
    },
    autonomousAiFailureRisk:
      'Autonomous AI fails to track antepartum visit counts when a patient changes insurance or switches providers at week 28, illegally billing the full global maternity code (59400) instead of split itemized antepartum codes (59426).',
    humanSovereigntyProtocol:
      'COBGC certified coder audits prenatal flowcharts, verifies exact antepartum visit counts (1-3 visits as E/M, 4-6 visits as 59425, 7+ visits as 59426), and reviews operative dictation for modifier -22 justification.',
    rcmBenchmark: {
      cleanClaimTarget: '98.6%',
      typicalDenialRateWithoutGate: '23.7%',
      primaryCARC: 'CO-97 (Bundled into Global Maternity Package) / CO-16',
    },
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology',
    abmsCategory: 'Ocular & Microsurgery',
    taxonomyCode: '207W00000X',
    cptCodeRange: '65091–68899, 92002–92287',
    credentialRequired: 'CPC / COPC (Certified Ophthalmology Coder)',
    coreCodes: [
      {
        code: '66984',
        system: 'CPT',
        label: 'Extracapsular Cataract Extraction with IOL Implant',
        description: 'Cataract extraction with insertion of intraocular lens prosthesis; manual or phacoemulsification.',
        globalPeriod: '90-day global',
      },
      {
        code: '67028',
        system: 'CPT',
        label: 'Intravitreal Injection of Pharmacologic Agent',
        description: 'Injection of pharmacologic agent into vitreous chamber; separate procedure.',
        globalPeriod: '0-day global',
      },
      {
        code: '92134',
        system: 'CPT',
        label: 'Retinal Optical Coherence Tomography (OCT)',
        description: 'Scanning computerized ophthalmic diagnostic imaging of retina with interpretation and report.',
      },
      {
        code: '92014',
        system: 'CPT',
        label: 'Comprehensive Eye Examination, Established Patient',
        description: 'Comprehensive ophthalmological examination of established patient with medical evaluation of complete visual system.',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-RT / -LT',
        name: 'Laterality (Right Eye vs Left Eye)',
        usage: 'Mandatory on all cataract, intravitreal injection, and retinal imaging claims.',
        auditTripwire: 'Claims submitted without laterality modifiers are instantly rejected by clearinghouse front-end EDI edits.',
      },
      {
        modifier: '-54 / -55',
        name: 'Surgical Co-Management (Surgical Care vs Post-Op Management)',
        usage: 'Used in cataract co-management: surgeon bills 66984-54 (80%), optometrist bills 66984-55 (20%).',
        auditTripwire: 'Missing co-management agreement letter or mismatched transfer-of-care dates triggers audit clawbacks.',
      },
      {
        modifier: '-JW / -JZ',
        name: 'Drug Discard Tracking on Anti-VEGF Biologics',
        usage: 'Required on J9035 (bevacizumab) and J0178 (aflibercept) to report unused medication discarded from single-dose vials.',
        auditTripwire: 'CMS mandates strict denial of anti-VEGF claims lacking modifier -JW or -JZ under Section 90004.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 12, § 40.7 (Claims for Co-Management of Surgical Procedures)',
      ncciGuideline: 'Diagnostic OCT (92134) bundled into same-day intravitreal injection (67028) unless distinct retinal pathology documented.',
      oigWorkPlanFocus: 'OIG scrutiny on cataract surgery medical necessity documentation (visual acuity thresholds and ADL impairment).',
      lcdNcdReference: 'LCD L34741 (Cataract Extraction in Adults Medical Coverage Policy)',
    },
    autonomousAiFailureRisk:
      'AI models regularly miss CMS cataract LCD criteria, approving surgical claims that lack documented visual field limitations and interference with activities of daily living (ADLs), creating catastrophic repayment liability.',
    humanSovereigntyProtocol:
      'Certified ophthalmology coder verifies Snellen visual acuity scores and subjective lifestyle impairment notes, cross-checks co-management transfer dates, and calculates milligram waste splits for anti-VEGF biologics.',
    rcmBenchmark: {
      cleanClaimTarget: '99.2%',
      typicalDenialRateWithoutGate: '17.8%',
      primaryCARC: 'CO-4 (Modifier missing or inconsistent) / CO-97',
    },
  },
  {
    id: 'pathology',
    name: 'Pathology',
    abmsCategory: 'Laboratory & Anatomical Pathology',
    taxonomyCode: '207ZP0102X',
    cptCodeRange: '80047–89398',
    credentialRequired: 'CPC / Pathologist Assistant Specialist',
    coreCodes: [
      {
        code: '88305',
        system: 'CPT',
        label: 'Surgical Pathology Level IV (Gross & Microscopic)',
        description: 'Level IV surgical pathology examination of biopsy specimens (skin, colon polyp, bladder, prostate).',
      },
      {
        code: '88307',
        system: 'CPT',
        label: 'Surgical Pathology Level V (Single Resection)',
        description: 'Level V surgical pathology examination of organ resections (uterus, colectomy, partial nephrectomy).',
      },
      {
        code: '88342',
        system: 'CPT',
        label: 'Immunohistochemistry (IHC), First Antibody Stain',
        description: 'Immunohistochemistry or immunocytochemistry, per specimen; initial single antibody stain.',
      },
      {
        code: '88312',
        system: 'CPT',
        label: 'Special Stains (Group 1: Microorganisms)',
        description: 'Special stains including interpretation and report; Group I for microorganisms (e.g. acid-fast, fungi).',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-26',
        name: 'Professional Component Interpretation',
        usage: 'Billed by pathologist for microscopic diagnosis and signed synoptic cancer report.',
        auditTripwire: 'Hospital labs billing global codes for hospital inpatient specimens trigger immediate Medicare recoupment.',
      },
      {
        modifier: '-59',
        name: 'Distinct Specimen Containers',
        usage: 'Applied to multiple units of 88305 when distinct specimens are submitted in separate labeled containers from separate sites.',
        auditTripwire: 'Multiple skin biopsies submitted in a single container cannot be billed as separate 88305 units under AMA CPT rules.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 16 (Laboratory Services and Anatomical Pathology)',
      ncciGuideline: 'NCCI Policy Manual Ch. 10: Hematoxylin and eosin (H&E) routine stain bundled into 88302–88309 base codes.',
      oigWorkPlanFocus: 'OIG audit focus on excessive surgical pathology Level IV (88305) billing for routine pap smears or single-jar specimens.',
      lcdNcdReference: 'CLIA (42 CFR § 493) Quality Standards & CAP Synoptic Cancer Reporting Mandate',
    },
    autonomousAiFailureRisk:
      'Generative software cannot verify whether multiple tissue fragments were received in separate formalin containers versus a single accession jar, creating fraudulent multi-unit 88305 billing subject to federal False Claims penalties.',
    humanSovereigntyProtocol:
      'Certified pathology coder inspects gross accession logs to verify independent specimen containers, audits antibody stain requisition orders, and verifies pathologist signature on cancer synoptic reports.',
    rcmBenchmark: {
      cleanClaimTarget: '99.5%',
      typicalDenialRateWithoutGate: '15.3%',
      primaryCARC: 'CO-97 (Bundling Edit) / CO-16 (Lacks Specimen Information)',
    },
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    abmsCategory: 'Child & Adolescent Health',
    taxonomyCode: '208000000X',
    cptCodeRange: '99381–99385, 90460–90749, 99202–99215',
    credentialRequired: 'CPEDC (Certified Pediatric Coder)',
    coreCodes: [
      {
        code: '99382',
        system: 'CPT',
        label: 'Well-Child Visit, Early Childhood (Age 1 through 4)',
        description: 'Comprehensive preventive medicine evaluation and management; early childhood age 1 through 4 years.',
      },
      {
        code: '90460',
        system: 'CPT',
        label: 'Immunization Admin through Age 18 with Counseling, 1st Component',
        description: 'Immunization administration through 18 years of age via any route with physician counseling; first component.',
      },
      {
        code: '90461',
        system: 'CPT',
        label: 'Immunization Admin through Age 18 with Counseling, Each Add-on Component',
        description: 'Immunization administration with counseling; each additional vaccine or toxoid component.',
      },
      {
        code: '90707',
        system: 'CPT',
        label: 'Measles, Mumps, Rubella (MMR) Vaccine Live',
        description: 'MMR virus vaccine live for subcutaneous use; 3 vaccine components.',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-25',
        name: 'Sick Visit Concurrent with Well-Child Check',
        usage: 'Required on 99213/99214 when an acute condition (e.g. otitis media) is diagnosed and treated during a routine checkup.',
        auditTripwire: 'Medicaid MCOs deny claims if diagnosis codes for well-child (Z00.129) and acute illness are not strictly partitioned.',
      },
      {
        modifier: '-SL',
        name: 'State-Supplied Vaccine (Vaccines for Children Program)',
        usage: 'Mandated on vaccine serum codes provided free via federal VFC program; bills only administration fee ($0.00 serum).',
        auditTripwire: 'Billing private insurance rates for federally funded VFC vaccine serums constitutes direct Medicaid fraud.',
      },
      {
        modifier: '-33',
        name: 'Preventive Service Mandate',
        usage: 'Applied to developmental screenings (96110) and hearing/vision screens to waive family cost-sharing.',
        auditTripwire: 'Improper deductible assignment triggers state insurance commissioner complaints.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 12 (Physicians and Preventive Services)',
      ncciGuideline: 'Developmental screening (96110) and autism screening (96112) have specific Medically Unlikely Edits (MUEs).',
      oigWorkPlanFocus: 'OIG audit on Vaccines for Children (VFC) billing compliance and vaccine component calculation errors.',
      lcdNcdReference: 'Medicaid Early and Periodic Screening, Diagnostic and Treatment (EPSDT) Mandates',
    },
    autonomousAiFailureRisk:
      'Autonomous software routinely miscalculates multi-component vaccines under 90460/90461 (e.g. billing DTaP-HepB-IPV as 1 unit instead of 1 unit 90460 + 4 units 90461), forfeiting $55+ in legitimate administration revenue per child.',
    humanSovereigntyProtocol:
      'CPEDC certified coder audits physician counseling documentation in chart, cross-checks state VFC inventory logs to prevent illegal serum charges, and partitions sick vs well-child diagnoses.',
    rcmBenchmark: {
      cleanClaimTarget: '98.9%',
      typicalDenialRateWithoutGate: '21.0%',
      primaryCARC: 'CO-97 (Bundled with Preventive Visit) / CO-24 (Charges exceed fee schedule)',
    },
  },
  {
    id: 'physical-medicine-rehabilitation',
    name: 'Physical Medicine and Rehabilitation',
    abmsCategory: 'Rehabilitation & Physiatry',
    taxonomyCode: '208100000X',
    cptCodeRange: '97010–97799, 98960–98962',
    credentialRequired: 'CPC / Physical Therapy Billing Specialist',
    coreCodes: [
      {
        code: '97110',
        system: 'CPT',
        label: 'Therapeutic Exercise (15 Minutes)',
        description: 'Therapeutic procedure to develop strength, endurance, range of motion, and flexibility; each 15 minutes.',
      },
      {
        code: '97140',
        system: 'CPT',
        label: 'Manual Therapy Techniques (15 Minutes)',
        description: 'Manual therapy techniques (mobilization, manipulation, manual lymphatic drainage); each 15 minutes.',
      },
      {
        code: '97530',
        system: 'CPT',
        label: 'Therapeutic Activities (15 Minutes)',
        description: 'Direct one-on-one contact to improve functional performance in dynamic activities; each 15 minutes.',
      },
      {
        code: '97161',
        system: 'CPT',
        label: 'Physical Therapy Evaluation, Low Complexity',
        description: 'Physical therapy evaluation of low complexity with no personal factors affecting plan of care.',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-GP',
        name: 'Physical Therapy Plan of Care',
        usage: 'Mandatory on all therapy procedure codes delivered under an outpatient physical therapy plan of care.',
        auditTripwire: 'Claims missing -GP modifier are rejected outright by Medicare Part B clearinghouses.',
      },
      {
        modifier: '-59 / -XS',
        name: 'Distinct Procedural Service',
        usage: 'Required when manual therapy (97140) is delivered to a distinct anatomical region from therapeutic exercise (97110).',
        auditTripwire: 'Delivering manual therapy and exercise to the same joint without modifier -59 triggers automatic CARC 97 denial.',
      },
      {
        modifier: '-KX',
        name: 'Therapy Threshold Exception',
        usage: 'Required when patient therapy costs exceed annual Medicare therapy cap threshold to attest medical necessity.',
        auditTripwire: 'Failure to append -KX after reaching the monetary threshold results in immediate Medicare beneficiary denial.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 5 (Part B Outpatient Rehabilitation and CORF Services)',
      ncciGuideline: 'CMS 8-Minute Rule: Total timed minutes dictate billable unit counts (8-22 min = 1 unit, 23-37 min = 2 units).',
      oigWorkPlanFocus: 'OIG high-priority audit on therapy providers billing concurrent untimed modalities and excessive 15-minute units.',
      lcdNcdReference: 'CMS Medical Necessity Guidelines for Physical Therapy Plan of Care Certification (42 CFR § 424.24)',
    },
    autonomousAiFailureRisk:
      'Autonomous bots routinely fail the CMS 8-Minute Rule by summing individual timed services separately rather than calculating the aggregate timed treatment pool, committing federal overbilling on every multi-modality encounter.',
    humanSovereigntyProtocol:
      'Certified rehab coder tallies exact start/stop treatment minutes, verifies physician re-certification signature within statutory 30-day windows, and confirms distinct anatomical sites before applying modifier -59.',
    rcmBenchmark: {
      cleanClaimTarget: '98.5%',
      typicalDenialRateWithoutGate: '27.3%',
      primaryCARC: 'CO-119 (Benefit maximum for this time period has been reached) / CO-97',
    },
  },
  {
    id: 'preventive-medicine',
    name: 'Preventive Medicine',
    abmsCategory: 'Public Health & Prevention',
    taxonomyCode: '2083P0500X',
    cptCodeRange: '99381–99429, G0438–G0444',
    credentialRequired: 'CPC / Preventive Health Compliance Specialist',
    coreCodes: [
      {
        code: 'G0438',
        system: 'HCPCS',
        label: 'Medicare Annual Wellness Visit, Initial',
        description: 'First annual wellness visit providing personalized prevention plan service for Medicare beneficiary.',
      },
      {
        code: '99396',
        system: 'CPT',
        label: 'Preventive Medicine Exam, Established (Age 40–64)',
        description: 'Periodic comprehensive preventive medicine evaluation and management; established patient age 40–64.',
      },
      {
        code: 'G0444',
        system: 'HCPCS',
        label: 'Annual Depression Screening, 15 Minutes',
        description: 'Annual depression screening in primary care setting; 15 minutes.',
      },
      {
        code: 'G0442',
        system: 'HCPCS',
        label: 'Annual Alcohol Misuse Screening, 15 Minutes',
        description: 'Annual alcohol misuse screening; 15 minutes.',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-33',
        name: 'Preventive Services under ACA Section 2713',
        usage: 'Mandatory for commercial preventive screening services receiving USPSTF Grade A or B ratings.',
        auditTripwire: 'Omitting modifier -33 causes commercial insurers to improperly apply copayments and deductibles to patients.',
      },
      {
        modifier: '-PT',
        name: 'Colorectal Screening Converted to Diagnostic/Therapeutic',
        usage: 'Mandatory on colonoscopies that began as screening but involved biopsy or polypectomy under Medicare.',
        auditTripwire: 'Failure to append modifier -PT results in Medicare illegally deducting coinsurance from elderly patients.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 18 (Preventive and Screening Services)',
      ncciGuideline: 'Screening laboratory and screening E/M codes have specific statutory frequency limitations (e.g. 1 per 12 months).',
      oigWorkPlanFocus: 'OIG audit on Annual Wellness Visits billed within 365 days of previous wellness visits.',
      lcdNcdReference: 'Patient Protection and Affordable Care Act § 2713 & USPSTF Grade A/B Recommendations',
    },
    autonomousAiFailureRisk:
      'AI algorithms regularly fail date-of-service lookbacks across previous claims, submitting Medicare Annual Wellness Visits before the statutory 365-day interval has elapsed, triggering automatic 100% claim rejections.',
    humanSovereigntyProtocol:
      'Certified preventive medicine coder queries clearinghouse historical 270/271 eligibility records for exact prior AWV dates, attaches modifier -PT on converted screening procedures, and ensures complete wellness screening logs.',
    rcmBenchmark: {
      cleanClaimTarget: '99.4%',
      typicalDenialRateWithoutGate: '18.7%',
      primaryCARC: 'CO-119 (Benefit maximum reached) / PR-1 (Deductible Amount)',
    },
  },
  {
    id: 'psychiatry',
    name: 'Psychiatry',
    abmsCategory: 'Behavioral & Mental Health',
    taxonomyCode: '2084P0800X',
    cptCodeRange: '90791–90899, 99202–99215',
    credentialRequired: 'CPC / Behavioral Health Coder',
    coreCodes: [
      {
        code: '90792',
        system: 'CPT',
        label: 'Psychiatric Diagnostic Evaluation with Medical Services',
        description: 'Comprehensive psychiatric diagnostic evaluation with medical examination and prescription assessment.',
      },
      {
        code: '90834',
        system: 'CPT',
        label: 'Psychotherapy, 45 Minutes (38 to 52 Minutes)',
        description: 'Individual psychotherapy with patient; 45 minutes (range 38 to 52 minutes of face-to-face time).',
      },
      {
        code: '+90833',
        system: 'CPT',
        label: 'Add-on Psychotherapy, 30 Minutes (with E/M Service)',
        description: 'Individual psychotherapy provided with an Evaluation and Management service; 30 minutes.',
      },
      {
        code: '90837',
        system: 'CPT',
        label: 'Psychotherapy, 60 Minutes (53+ Minutes)',
        description: 'Individual psychotherapy with patient; 60 minutes (minimum 53 minutes).',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-95',
        name: 'Synchronous Telemedicine via Real-Time Audio/Video',
        usage: 'Mandated on tele-psychiatry sessions conducted through HIPAA-compliant two-way audio-video platforms.',
        auditTripwire: 'Billing in-person POS 11 for remote telemedicine sessions constitutes federal False Claims Act fraud.',
      },
      {
        modifier: '-FQ',
        name: 'Audio-Only Telehealth Mental Health Service',
        usage: 'Required on Medicare mental health visits conducted via telephone without video capabilities.',
        auditTripwire: 'Medicare Part B clearinghouses reject phone therapy sessions lacking modifier -FQ.',
      },
      {
        modifier: '-25',
        name: 'Separate E/M with Standalone Diagnostic Psychiatric Evaluation',
        usage: 'Required when somatic medical decision making is evaluated concurrently with a specialized evaluation.',
        auditTripwire: 'Requires separate narrative and time documentation; failure results in Column 2 NCCI bundling.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 12, § 170 (Payment for Psychiatry Services)',
      ncciGuideline: 'Psychotherapy add-on codes (+90833, +90836, +90838) must never be billed without a primary E/M service.',
      oigWorkPlanFocus: 'OIG active scrutiny on high-volume 60-minute psychotherapy sessions (90837) lacking face-to-face time logs.',
      lcdNcdReference: 'Mental Health Parity and Addiction Equity Act (MHPAEA) & Consolidated Appropriations Act Telehealth Rules',
    },
    autonomousAiFailureRisk:
      'Generative bots cannot verify actual start and stop timestamps in clinician session notes, frequently upcoding 35-minute visits to 60-minute CPT 90837 codes that fail payer audits.',
    humanSovereigntyProtocol:
      'Certified behavioral health coder audits start/stop minutes, separates medication management MDM from psychotherapy therapeutic intervention, and verifies tele-mental health modifier -95/-FQ compliance.',
    rcmBenchmark: {
      cleanClaimTarget: '98.8%',
      typicalDenialRateWithoutGate: '22.1%',
      primaryCARC: 'CO-97 (Bundling Edit) / CO-16 (Lacks start/stop time documentation)',
    },
  },
  {
    id: 'radiation-oncology',
    name: 'Radiation Oncology',
    abmsCategory: 'Oncology & Radiation Physics',
    taxonomyCode: '2085R0001X',
    cptCodeRange: '77261–77799',
    credentialRequired: 'CHONC / Radiation Oncology Certified Coder',
    coreCodes: [
      {
        code: '77263',
        system: 'CPT',
        label: 'Radiation Therapy Clinical Treatment Planning, Complex',
        description: 'Complex clinical treatment planning requiring multi-modality imaging, complex volume delineation, and organs-at-risk.',
      },
      {
        code: '77301',
        system: 'CPT',
        label: 'Intensity Modulated Radiation Therapy (IMRT) Plan',
        description: 'Intensity modulated radiation therapy plan including dose volume histograms and inverse planning.',
      },
      {
        code: '77386',
        system: 'CPT',
        label: 'Intensity Modulated Radiation Therapy Delivery, Complex',
        description: 'IMRT delivery to multiple fields with multi-leaf collimation; per treatment session.',
      },
      {
        code: '77427',
        system: 'CPT',
        label: 'Radiation Treatment Management, 5 Fractions',
        description: 'Radiation treatment management including clinical evaluation and verification; 5 treatments.',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-26 / -TC',
        name: 'Professional vs Technical Split',
        usage: 'Required when radiation oncologist performs physics planning at a hospital outpatient facility.',
        auditTripwire: 'Billing global radiation therapy codes in facility places of service triggers double-billing recoupment.',
      },
      {
        modifier: '-59',
        name: 'Distinct Procedural Service',
        usage: 'Applied to distinct physics calculations (77300) when multiple separate treatment portals are planned.',
        auditTripwire: 'ASTRO guidelines prohibit billing basic dosimetry calculations (77300) alongside IMRT planning (77301) without proof of separate non-IMRT fields.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 13, § 70 (Radiation Oncology)',
      ncciGuideline: 'CMS 5-Fraction Rule: 77427 can only be billed after exactly 5 fractions are delivered (or ≥3 fractions in terminal fraction week).',
      oigWorkPlanFocus: 'OIG active audit on unbundling simulation codes (77280–77295) with IMRT treatment planning (77301).',
      lcdNcdReference: 'ASTRO Radiation Oncology Coding Guidelines & CMS IMRT National Coverage Determination',
    },
    autonomousAiFailureRisk:
      'AI software cannot monitor cumulative treatment fraction delivery counters across calendar weeks, routinely billing 77427 before the mandatory 5 treatment sessions are completed, triggering automatic denial and billing fraud alerts.',
    humanSovereigntyProtocol:
      'CHONC certified oncology coder inspects radiation delivery sheets to verify 5 completed fractions, audits medical physics records for signed isodose curves, and ensures simulation is not unbundled from IMRT.',
    rcmBenchmark: {
      cleanClaimTarget: '99.0%',
      typicalDenialRateWithoutGate: '25.8%',
      primaryCARC: 'CO-97 (Bundled with IMRT Plan) / CO-151 (Units exceed fraction delivery)',
    },
  },
  {
    id: 'surgery',
    name: 'Surgery (General & Surgical Specialties)',
    abmsCategory: 'Operative & Invasive',
    taxonomyCode: '208600000X',
    cptCodeRange: '10000–69999',
    credentialRequired: 'CGSC (Certified General Surgery Coder)',
    coreCodes: [
      {
        code: '47562',
        system: 'CPT',
        label: 'Laparoscopic Cholecystectomy',
        description: 'Laparoscopy, surgical; cholecystectomy.',
        globalPeriod: '90-day global',
      },
      {
        code: '49505',
        system: 'CPT',
        label: 'Repair Inguinal Hernia, Age 5 Years or Older',
        description: 'Repair initial inguinal hernia, age 5 years or older; reducible.',
        globalPeriod: '90-day global',
      },
      {
        code: '44140',
        system: 'CPT',
        label: 'Partial Colectomy with Anastomosis',
        description: 'Colectomy, partial; with anastomosis.',
        globalPeriod: '90-day global',
      },
      {
        code: '33533',
        system: 'CPT',
        label: 'Coronary Artery Bypass, Single Arterial Graft',
        description: 'Coronary artery bypass using single arterial graft (e.g. LIMA to LAD).',
        globalPeriod: '90-day global',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-58',
        name: 'Staged or Related Procedure by Same Physician during Global',
        usage: 'Applied to planned return to OR during post-op period (e.g. delayed wound debridement or staged flap).',
        auditTripwire: 'Omitting -58 results in total denial as routine post-operative care bundled into initial surgery.',
      },
      {
        modifier: '-78',
        name: 'Unplanned Return to OR for Related Procedure during Global',
        usage: 'Required when patient suffers a post-op complication requiring OR return (e.g. post-op hemorrhage or dehiscence).',
        auditTripwire: 'Billed without -78, the complication procedure is denied; with -78, intraoperative portion is paid without restarting global.',
      },
      {
        modifier: '-79',
        name: 'Unrelated Procedure by Same Physician during Global Period',
        usage: 'Applied when patient undergoes a completely unrelated surgery during a 90-day global period.',
        auditTripwire: 'Requires completely distinct surgical diagnosis code; absence triggers 100% global bundle rejection.',
      },
      {
        modifier: '-62',
        name: 'Two Surgeons (Co-Surgeons)',
        usage: 'Billed when two surgeons of distinct specialties perform distinct parts of a complex surgery.',
        auditTripwire: 'Both surgeons must dictate separate operative notes detailing distinct skills; failure denies both claims.',
      },
      {
        modifier: '-80 / -AS',
        name: 'Assistant Surgeon (MD vs Non-Physician Assistant)',
        usage: '-80 billed for physician assistant; -AS billed for PA or NP assistant.',
        auditTripwire: 'Procedure must qualify for assistant surgeon on CMS MPFS indicator (Indicator 2 = assistant permitted).',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 12, § 40 (Surgeons and Global Surgery Package Rules)',
      ncciGuideline: 'CMS Global Surgery Policy: Pre-operative E/M, local anesthesia, surgical approach, and normal post-op care bundled.',
      oigWorkPlanFocus: 'OIG continuous scrutiny on Modifier -59/-XS unbundling of surgical component codes and assistant surgeon billing.',
      lcdNcdReference: 'CMS Physician Fee Schedule Relative Value Files & Global Day Indicators (000, 010, 090)',
    },
    autonomousAiFailureRisk:
      'Autonomous software cannot determine whether a re-operation during a 90-day global period was planned (Modifier -58), a complication return to OR (Modifier -78), or an unrelated surgery (Modifier -79), creating catastrophic payment recoupments.',
    humanSovereigntyProtocol:
      'CGSC certified coder reads operative narratives word-for-word, verifies surgical approach incision, checks assistant surgeon clinical indications against CMS MPFS indicators, and confirms laterality modifiers.',
    rcmBenchmark: {
      cleanClaimTarget: '99.1%',
      typicalDenialRateWithoutGate: '28.4%',
      primaryCARC: 'CO-97 (Bundled into Global Package) / CO-236 (Procedure or modifier not compatible with global period)',
    },
  },
  {
    id: 'urology',
    name: 'Urology',
    abmsCategory: 'Genitourinary & Surgical',
    taxonomyCode: '208800000X',
    cptCodeRange: '50010–53899, 55801–55899',
    credentialRequired: 'CUC (Certified Urology Coder)',
    coreCodes: [
      {
        code: '52356',
        system: 'CPT',
        label: 'Cystourethroscopy with Lithotripsy & Stent Insertion',
        description: 'Cystourethroscopy with ureteroscopy and/or pyeloscopy; with lithotripsy and insertion of indwelling stent.',
        globalPeriod: '0-day global',
      },
      {
        code: '52000',
        system: 'CPT',
        label: 'Cystourethroscopy (Separate Procedure)',
        description: 'Diagnostic cystourethroscopy for examination of bladder and urethra.',
        globalPeriod: '0-day global',
      },
      {
        code: '55866',
        system: 'CPT',
        label: 'Laparoscopic Radical Prostatectomy',
        description: 'Laparoscopy, surgical prostatectomy, retropubic radical, including nerve sparing.',
        globalPeriod: '90-day global',
      },
      {
        code: '50543',
        system: 'CPT',
        label: 'Laparoscopic Partial Nephrectomy',
        description: 'Laparoscopy, surgical; partial nephrectomy.',
        globalPeriod: '90-day global',
      },
    ],
    mandatoryModifiers: [
      {
        modifier: '-RT / -LT',
        name: 'Laterality (Kidney or Ureter)',
        usage: 'Required on all ureteroscopy, nephrectomy, and lithotripsy procedures.',
        auditTripwire: 'Omitting laterality modifier triggers instant front-end clearinghouse rejection.',
      },
      {
        modifier: '-50',
        name: 'Bilateral Procedure',
        usage: 'Applied to bilateral ureteral stent placement (CPT 52332-50) or bilateral orchiectomy.',
        auditTripwire: 'Billing two separate lines with -RT and -LT instead of single line with -50 on Medicare triggers 50% denial.',
      },
      {
        modifier: '-58',
        name: 'Staged Stent Removal in Global Period',
        usage: 'Required on subsequent cystoscopic removal of ureteral stent (CPT 52310) placed during prior major surgery.',
        auditTripwire: 'Failing to append -58 denies stent removal as bundled into the primary surgery global package.',
      },
    ],
    regulatoryFramework: {
      cmsManualRef: 'CMS IOM Pub. 100-04, Chapter 12 (Physicians and Urology Guidelines)',
      ncciGuideline: 'Diagnostic cystoscopy (52000) and ipsilateral stent placement (52332) are Column 2 bundled into therapeutic 52356.',
      oigWorkPlanFocus: 'OIG audit on bilateral cystoscopic procedures and unbundled bladder biopsy with fulguration (52204 vs 52224).',
      lcdNcdReference: 'AUA (American Urological Association) Coding Standards & CMS Urology NCCI Edits',
    },
    autonomousAiFailureRisk:
      'Autonomous bots routinely unbundle diagnostic cystoscopy (52000) and ipsilateral stent placement (52332) alongside ureteroscopic lithotripsy (52356), triggering instant NCCI Column 1-2 clawbacks and CARC 97 rejections.',
    humanSovereigntyProtocol:
      'CUC certified urology coder inspects operative records to verify whether stent was placed on the ipsilateral side (bundled) versus contralateral side (billable with modifier -59/-XS and opposite laterality).',
    rcmBenchmark: {
      cleanClaimTarget: '98.9%',
      typicalDenialRateWithoutGate: '24.9%',
      primaryCARC: 'CO-97 (Bundling Edit) / CO-4 (Modifier missing or invalid for procedure)',
    },
  },
];
