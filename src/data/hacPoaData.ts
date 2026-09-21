// Hospital-Acquired Condition (HAC) Reduction Program & Present on Admission (POA) Data Models
// Statutory Authorities: Social Security Act § 1886(d)(4)(D) (Deficit Reduction Act of 2005),
// Social Security Act § 1886(p) (Hospital-Acquired Condition Reduction Program - HACRP),
// CMS IPPS Final Rule (FY 2024 Base Rate $6,500.00), 42 CFR § 412.87, CMS Pub. 100-04 Ch. 23.

export type PoaIndicator = 'Y' | 'N' | 'U' | 'W' | '1';

export interface PoaIndicatorDefinition {
  code: PoaIndicator;
  label: string;
  cmsDefinition: string;
  paymentImpact: string;
  retainsMccStatus: boolean;
  regulatoryRule: string;
}

export interface HacCategory {
  id: string;
  number: number;
  title: string;
  icd10Range: string;
  statuteRef: string;
  clinicalDescription: string;
  highRiskSpecialties: string;
}

export interface DrgTier {
  code: string;
  title: string;
  weight: number;
  rate: number;
  mccLevel: 'MCC' | 'CC' | 'NON_CC';
}

export interface InpatientHacCase {
  id: string;
  title: string;
  shortTitle: string;
  specialty: string;
  admissionDiagnosis: {
    code: string;
    title: string;
  };
  hacSecondaryDiagnosis: {
    code: string;
    title: string;
    hacNumber: number;
    hacTitle: string;
  };
  fullDrg: DrgTier;
  downcodedDrg: DrgTier;
  financialDelta: number;
  admissionEvidence: string;
  postOpProgression: string;
  cdiRemediationStrategy: string;
  physicianQueryText: string;
}

export interface DrgReclassificationResult {
  assignedDrgCode: string;
  assignedDrgTitle: string;
  assignedWeight: number;
  assignedPayment: number;
  revenueLoss: number;
  hacPenaltyTriggered: boolean;
  poaStatusDescription: string;
  complianceGuidance: string;
}

export interface HacrpAnnualExposureResult {
  annualIppsOperatingRevenue: number;
  hospitalQuartile: number;
  isPenalized: boolean;
  penaltyPercentage: number;
  annualPenaltyAmount: number;
  safeHarborQuartile: boolean;
  psi90ScoreImpact: string;
}

export const POA_INDICATOR_DEFINITIONS: Record<PoaIndicator, PoaIndicatorDefinition> = {
  Y: {
    code: 'Y',
    label: 'Present on Admission (Yes)',
    cmsDefinition: 'Diagnosis was present at the time the order for inpatient admission occurred.',
    paymentImpact: 'Full Reimbursement: Secondary diagnosis retains full MCC/CC status. No DRG downcoding occurs.',
    retainsMccStatus: true,
    regulatoryRule: 'CMS IPPS DRA 2005: Diagnoses present at admission are exempt from the HAC payment disallowance.',
  },
  N: {
    code: 'N',
    label: 'Not Present on Admission (No - Hospital Acquired)',
    cmsDefinition: 'Condition developed during the hospital admission and was not present at the time of inpatient order.',
    paymentImpact: 'DRG Downward Reclassification: Secondary diagnosis stripped of MCC/CC status. Reclassified to lower base DRG.',
    retainsMccStatus: false,
    regulatoryRule: 'SSA § 1886(d)(4)(D): CMS treats condition as non-existent for DRG assignment if it is the sole MCC/CC driver.',
  },
  U: {
    code: 'U',
    label: 'Documentation Insufficient (Unknown)',
    cmsDefinition: 'Documentation in medical record is insufficient to determine whether condition was present at admission.',
    paymentImpact: 'DRG Downward Reclassification: CMS algorithms treat "U" identically to "N", stripping MCC/CC status.',
    retainsMccStatus: false,
    regulatoryRule: 'CMS Claims Processing Manual Ch. 23: Default rule penalizes provider for missing admission intake documentation.',
  },
  W: {
    code: 'W',
    label: 'Clinically Undetermined',
    cmsDefinition: 'Attending physician is clinically unable to determine whether condition was present at admission.',
    paymentImpact: 'Full Reimbursement: CMS treats "W" like "Y" and retains MCC/CC status for DRG grouping.',
    retainsMccStatus: true,
    regulatoryRule: 'CMS Guidelines: Recognizes diagnostic uncertainty when physician explicitly documents inability to ascertain timing.',
  },
  '1': {
    code: '1',
    label: 'Exempt from POA Reporting',
    cmsDefinition: 'Diagnosis code is on the official CMS list of ICD-10-CM codes exempt from POA reporting requirements.',
    paymentImpact: 'Full Reimbursement: Chronic conditions, congenital anomalies, and obstetric codes exempt from HAC penalty.',
    retainsMccStatus: true,
    regulatoryRule: 'CMS POA Exempt List: Automatically processed with full MCC/CC recognition without POA field scrutiny.',
  },
};

export const HAC_CATEGORIES: HacCategory[] = [
  {
    id: 'hac-1',
    number: 1,
    title: 'Foreign Object Retained After Surgery',
    icd10Range: 'T81.50 - T81.59',
    statuteRef: 'DRA 2005 Category 1',
    clinicalDescription: 'Accidental sponge, needle, clamp, or surgical instrument left in body cavity following an operative intervention.',
    highRiskSpecialties: 'General Surgery, OB/GYN, Cardiothoracic, Orthopedics',
  },
  {
    id: 'hac-2',
    number: 2,
    title: 'Air Embolism',
    icd10Range: 'T80.0, T81.7',
    statuteRef: 'DRA 2005 Category 2',
    clinicalDescription: 'Iatrogenic venous or arterial air embolism resulting from catheterization, infusion, or neurosurgical procedures.',
    highRiskSpecialties: 'Critical Care, Interventional Cardiology, Neurosurgery',
  },
  {
    id: 'hac-3',
    number: 3,
    title: 'Blood Incompatibility',
    icd10Range: 'T80.3, T80.4',
    statuteRef: 'DRA 2005 Category 3',
    clinicalDescription: 'ABO/Rh mismatch transfusion reaction resulting from blood banking error or patient identification breakdown.',
    highRiskSpecialties: 'Trauma Surgery, Hematology/Oncology, Anesthesiology',
  },
  {
    id: 'hac-4',
    number: 4,
    title: 'Pressure Ulcer Stages 3 & 4',
    icd10Range: 'L89.13 - L89.34',
    statuteRef: 'DRA 2005 Category 4',
    clinicalDescription: 'Full-thickness skin loss with damage to subcutaneous tissue, muscle, or bone developing during inpatient stay.',
    highRiskSpecialties: 'ICU / Critical Care, Neurology, Orthopedics, Geriatrics',
  },
  {
    id: 'hac-5',
    number: 5,
    title: 'Falls and Trauma (Fractures, Dislocations, Intracranial)',
    icd10Range: 'S02, S32, S72',
    statuteRef: 'DRA 2005 Category 5',
    clinicalDescription: 'In-hospital bed falls or ambulation accidents producing fractures, joint dislocations, or subdural hematomas.',
    highRiskSpecialties: 'Inpatient Medicine, Geriatrics, Rehabilitation, Neurology',
  },
  {
    id: 'hac-6',
    number: 6,
    title: 'Catheter-Associated Urinary Tract Infection (CAUTI)',
    icd10Range: 'T83.511, N39.0',
    statuteRef: 'DRA 2005 Category 6',
    clinicalDescription: 'Nosocomial bacterial cystitis or urosepsis developing >= 48 hours following indwelling Foley catheter insertion.',
    highRiskSpecialties: 'Urology, Critical Care, Post-Op Surgical Inpatients',
  },
  {
    id: 'hac-7',
    number: 7,
    title: 'Vascular Catheter-Associated Infection (CLABSI)',
    icd10Range: 'T80.211',
    statuteRef: 'DRA 2005 Category 7',
    clinicalDescription: 'Central venous line-associated bloodstream infection (CLABSI) with positive blood cultures and line sepsis.',
    highRiskSpecialties: 'Medical ICU, Surgical ICU, Bone Marrow Transplant',
  },
  {
    id: 'hac-8',
    number: 8,
    title: 'Manifestations of Poor Glycemic Control',
    icd10Range: 'E10.10, E11.01',
    statuteRef: 'DRA 2005 Category 8',
    clinicalDescription: 'Hospital-acquired diabetic ketoacidosis, hyperosmolar hyperglycemic state, or severe hypoglycemic coma.',
    highRiskSpecialties: 'Endocrinology, General Medicine, Post-Op Care',
  },
  {
    id: 'hac-9',
    number: 9,
    title: 'Surgical Site Infection (SSI) Following CABG',
    icd10Range: 'T81.41',
    statuteRef: 'DRA 2005 Category 9',
    clinicalDescription: 'Deep incisional mediastinitis or osteomyelitis of sternum following coronary artery bypass graft surgery.',
    highRiskSpecialties: 'Cardiothoracic Surgery, Cardiac ICU',
  },
  {
    id: 'hac-10',
    number: 10,
    title: 'Surgical Site Infection (SSI) Following Bariatric Surgery',
    icd10Range: 'T81.42',
    statuteRef: 'DRA 2005 Category 10',
    clinicalDescription: 'Deep intra-abdominal or port-site abscess following gastric bypass or sleeve gastrectomy for morbid obesity.',
    highRiskSpecialties: 'Bariatric & Metabolic Surgery, Minimally Invasive Surgery',
  },
  {
    id: 'hac-11',
    number: 11,
    title: 'Surgical Site Infection (SSI) Following Orthopedic Procedures',
    icd10Range: 'T84.50 - T84.54',
    statuteRef: 'DRA 2005 Category 11',
    clinicalDescription: 'Deep periprosthetic joint infection of hip, knee, or spinal arthrodesis instrumentation.',
    highRiskSpecialties: 'Orthopedic Joint Reconstruction, Spine Surgery',
  },
  {
    id: 'hac-12',
    number: 12,
    title: 'Deep Vein Thrombosis & Pulmonary Embolism (DVT/PE)',
    icd10Range: 'I26.92, I82.40',
    statuteRef: 'DRA 2005 Category 12',
    clinicalDescription: 'Acute pulmonary embolism or proximal deep vein thrombosis following elective orthopedic knee/hip surgery.',
    highRiskSpecialties: 'Orthopedic Surgery, Vascular Surgery, Trauma',
  },
  {
    id: 'hac-13',
    number: 13,
    title: 'Iatrogenic Pneumothorax with Venous Catheterization',
    icd10Range: 'J98.2, J95.811',
    statuteRef: 'DRA 2005 Category 13',
    clinicalDescription: 'Pneumothorax secondary to subclavian or internal jugular central venous line placement or lung biopsy.',
    highRiskSpecialties: 'Pulmonary Critical Care, Interventional Radiology, Anesthesia',
  },
  {
    id: 'hac-14',
    number: 14,
    title: 'Clostridioides difficile Infection (CDI)',
    icd10Range: 'A04.7',
    statuteRef: 'DRA 2005 Category 14',
    clinicalDescription: 'Hospital-acquired pseudomembranous colitis caused by toxin-producing C. difficile following broad-spectrum antibiotics.',
    highRiskSpecialties: 'Infectious Disease, Hospital Medicine, GI Surgery',
  },
];

export const INPATIENT_HAC_CASES: InpatientHacCase[] = [
  {
    id: 'spine-fusion-dvt',
    title: 'Complex Posterior Lumbar Interbody Fusion with Post-Op Pulmonary Embolism',
    shortTitle: 'Spine Fusion with Acute PE/DVT',
    specialty: 'Spine & Orthopedic Surgery',
    admissionDiagnosis: {
      code: 'M48.061',
      title: 'Spinal stenosis, lumbar region with neurogenic claudication',
    },
    hacSecondaryDiagnosis: {
      code: 'I26.92',
      title: 'Saddle embolus of pulmonary artery without acute cor pulmonale & femoral DVT',
      hacNumber: 12,
      hacTitle: 'HAC 12: DVT/PE Following Orthopedic Surgery',
    },
    fullDrg: {
      code: 'MS-DRG 453',
      title: 'Combined Anterior/Posterior Spinal System with MCC',
      weight: 4.3769,
      rate: 28450,
      mccLevel: 'MCC',
    },
    downcodedDrg: {
      code: 'MS-DRG 455',
      title: 'Combined Anterior/Posterior Spinal System without CC/MCC',
      weight: 2.5846,
      rate: 16800,
      mccLevel: 'NON_CC',
    },
    financialDelta: 11650,
    admissionEvidence:
      'Emergency Department triage note documented right calf edema, localized calf tenderness, and elevated D-dimer (1,450 ng/mL) 14 hours prior to surgery. Triage pulse was 104 bpm with 93% O2 saturation on ambient air.',
    postOpProgression:
      'On Post-Op Day 2, patient developed sudden dyspnea and tachycardia. CTA chest confirmed saddle pulmonary embolism. Default EHR coder assigned POA = "N" because formal CTA was executed post-operatively.',
    cdiRemediationStrategy:
      'Query attending spine surgeon and admitting hospitalist to corroborate that calf tenderness and hypoxemia were pre-existing upon arrival, substantiating that the subacute thrombus was present on admission (POA = "Y").',
    physicianQueryText:
      'CLINICAL DOCUMENTATION IMPROVEMENT (CDI) PHYSICIAN QUERY:\nPatient presented with pre-operative right calf tenderness, edema, and D-dimer 1,450 ng/mL prior to spinal arthrodesis. On POD#2, CTA confirmed pulmonary embolism. Based on pre-operative physical findings and laboratory presentation, was the deep venous thrombosis / pulmonary thromboembolism:\n[ ] 1. Present on Admission (POA = "Y")\n[ ] 2. Not Present on Admission (Hospital Acquired, POA = "N")\n[ ] 3. Clinically Undetermined despite medical review (POA = "W")',
  },
  {
    id: 'cabg-sternal-infection',
    title: 'Coronary Artery Bypass Graft (CABG x 3) with Sternal Mediastinitis',
    shortTitle: 'CABG with Sternal Wound Mediastinitis',
    specialty: 'Cardiothoracic Surgery',
    admissionDiagnosis: {
      code: 'I25.110',
      title: 'Atherosclerotic heart disease of native coronary artery with unstable angina',
    },
    hacSecondaryDiagnosis: {
      code: 'T81.41XA',
      title: 'Infection following a procedure, deep incisional surgical site, mediastinitis',
      hacNumber: 9,
      hacTitle: 'HAC 09: Surgical Site Infection Following CABG',
    },
    fullDrg: {
      code: 'MS-DRG 235',
      title: 'Coronary Bypass with Cardiac Cath with MCC',
      weight: 6.0308,
      rate: 39200,
      mccLevel: 'MCC',
    },
    downcodedDrg: {
      code: 'MS-DRG 236',
      title: 'Coronary Bypass with Cardiac Cath without MCC',
      weight: 4.0615,
      rate: 26400,
      mccLevel: 'NON_CC',
    },
    financialDelta: 12800,
    admissionEvidence:
      'Pre-op admission lab panel showed severe leukocytosis (WBC 18.4 k/uL with left shift) and unmonitored pre-existing Staphylococcus aureus skin colonization secondary to unmanaged diabetic foot ulceration.',
    postOpProgression:
      'On Post-Op Day 5, sternal wound exhibited purulent drainage and sternal instability. Wound culture matched pre-op baseline Staph aureus strain. Coder defaulted to POA = "N" under automated surgical site rules.',
    cdiRemediationStrategy:
      'Establish through infectious disease consultation that sternal seeding originated from hematogenous bacteremia pre-dating sternotomy, or execute physician query to document clinical undetermined status (POA = "W").',
    physicianQueryText:
      'CLINICAL DOCUMENTATION IMPROVEMENT (CDI) PHYSICIAN QUERY:\nPatient admitted with pre-operative leukocytosis (18.4k) and active diabetic foot ulceration prior to urgent CABG. On POD#5, deep sternal mediastinitis grew identical S. aureus. Clinically, did this infection represent:\n[ ] 1. Secondary hematogenous seeding from pre-admission bacteremia (POA = "Y")\n[ ] 2. Acute primary hospital-acquired surgical site infection (POA = "N")\n[ ] 3. Clinically undetermined source timing (POA = "W")',
  },
  {
    id: 'septic-shock-sacral-ulcer',
    title: 'Septic Shock Secondary to Pyelonephritis with Stage 4 Sacral Decubitus',
    shortTitle: 'Septic Shock with Stage 4 Sacral Ulcer',
    specialty: 'Inpatient Medicine & Critical Care',
    admissionDiagnosis: {
      code: 'A41.51 / R65.21',
      title: 'Sepsis due to Escherichia coli with septic shock requiring vasopressors',
    },
    hacSecondaryDiagnosis: {
      code: 'L89.154',
      title: 'Pressure ulcer of sacral region, stage 4 with full-thickness bone exposure',
      hacNumber: 4,
      hacTitle: 'HAC 04: Pressure Ulcer Stages 3 & 4',
    },
    fullDrg: {
      code: 'MS-DRG 871',
      title: 'Septicemia with MV > 96 Hours or MCC',
      weight: 2.2923,
      rate: 14900,
      mccLevel: 'MCC',
    },
    downcodedDrg: {
      code: 'MS-DRG 872',
      title: 'Septicemia without MCC',
      weight: 1.4462,
      rate: 9400,
      mccLevel: 'NON_CC',
    },
    financialDelta: 5500,
    admissionEvidence:
      'Triage nursing stretcher intake assessment explicitly recorded a 5cm x 4cm open wound over the sacrum with visible slough and bone contact. However, physician admission H&P omitted the integumentary body map.',
    postOpProgression:
      'Wound care team formally staged ulcer as Stage 4 on Inpatient Day 3. Because physician note did not document the ulcer until Day 3, hospital coder assigned POA = "U" (Unknown), triggering immediate CMS downcoding.',
    cdiRemediationStrategy:
      'Incorporate emergency nursing body map and transfer sheet from skilled nursing facility into the permanent physician medical record, updating the POA indicator from "U" to certified "Y".',
    physicianQueryText:
      'CLINICAL DOCUMENTATION IMPROVEMENT (CDI) PHYSICIAN QUERY:\nNursing skin assessment at ED intake documented a 5cm x 4cm stage 4 sacral decubitus ulcer upon stretcher transfer. Physician H&P noted skin as deferred. Please confirm if the stage 4 sacral pressure ulcer was:\n[ ] 1. Present on Admission upon physical examination (POA = "Y")\n[ ] 2. Developed during inpatient stay (POA = "N")\n[ ] 3. Clinically undetermined (POA = "W")',
  },
  {
    id: 'tha-cauti',
    title: 'Revision Total Hip Arthroplasty with Indwelling Catheter-Associated UTI',
    shortTitle: 'Hip Revision with Catheter UTI (CAUTI)',
    specialty: 'Orthopedic Reconstruction',
    admissionDiagnosis: {
      code: 'T84.030A',
      title: 'Mechanical loosening of internal right prosthetic hip joint, initial encounter',
    },
    hacSecondaryDiagnosis: {
      code: 'T83.511A',
      title: 'Infection and inflammatory reaction due to indwelling urethral catheter',
      hacNumber: 6,
      hacTitle: 'HAC 06: Catheter-Associated UTI (CAUTI)',
    },
    fullDrg: {
      code: 'MS-DRG 469',
      title: 'Major Hip/Knee Joint Replacement with MCC',
      weight: 3.0462,
      rate: 19800,
      mccLevel: 'MCC',
    },
    downcodedDrg: {
      code: 'MS-DRG 470',
      title: 'Major Hip/Knee Joint Replacement without MCC',
      weight: 2.0308,
      rate: 13200,
      mccLevel: 'NON_CC',
    },
    financialDelta: 6600,
    admissionEvidence:
      'Patient arrived via ambulance with an indwelling Foley catheter placed 8 days prior at outside long-term acute care. Admission urinalysis showed leukocyte esterase 3+, nitrites positive, WBC > 100/HPF.',
    postOpProgression:
      'Urine culture finalized on Day 3 with > 100,000 CFU/mL Klebsiella pneumoniae. Billing scrubber assigned POA = "N" because culture report finalized post-admission.',
    cdiRemediationStrategy:
      'Substantiate that urinalysis collected upon arrival confirmed active colonization and infection prior to inpatient admission order, legally requiring POA = "Y" and reversing the $6,600 DRG loss.',
    physicianQueryText:
      'CLINICAL DOCUMENTATION IMPROVEMENT (CDI) PHYSICIAN QUERY:\nPatient was admitted with pre-existing indwelling Foley from outside facility. Admission triage UA demonstrated pyuria and bacteriuria. Urine culture grew Klebsiella. Please confirm if the catheter-associated urinary infection was:\n[ ] 1. Present on Admission based on intake UA (POA = "Y")\n[ ] 2. Nosocomial hospital-acquired infection (POA = "N")\n[ ] 3. Clinically undetermined (POA = "W")',
  },
];

export function calculateDrgReclassification(
  inpatientCase: InpatientHacCase,
  poaIndicator: PoaIndicator
): DrgReclassificationResult {
  const definition = POA_INDICATOR_DEFINITIONS[poaIndicator];

  if (definition.retainsMccStatus) {
    return {
      assignedDrgCode: inpatientCase.fullDrg.code,
      assignedDrgTitle: inpatientCase.fullDrg.title,
      assignedWeight: inpatientCase.fullDrg.weight,
      assignedPayment: inpatientCase.fullDrg.rate,
      revenueLoss: 0,
      hacPenaltyTriggered: false,
      poaStatusDescription: `POA = "${poaIndicator}": Secondary diagnosis retains full ${inpatientCase.fullDrg.mccLevel} status under CMS rules.`,
      complianceGuidance:
        'Sovereign Audit Validated: The condition is legally recognized as pre-existing or exempt, securing maximum DRG payment without downward reclassification.',
    };
  }

  // Downcoded DRG
  return {
    assignedDrgCode: inpatientCase.downcodedDrg.code,
    assignedDrgTitle: inpatientCase.downcodedDrg.title,
    assignedWeight: inpatientCase.downcodedDrg.weight,
    assignedPayment: inpatientCase.downcodedDrg.rate,
    revenueLoss: inpatientCase.financialDelta,
    hacPenaltyTriggered: true,
    poaStatusDescription: `POA = "${poaIndicator}": CMS strips ${inpatientCase.fullDrg.mccLevel} status under SSA § 1886(d)(4)(D). DRG downcoded from ${inpatientCase.fullDrg.code} to ${inpatientCase.downcodedDrg.code}.`,
    complianceGuidance: `CRITICAL DRG SHORTFALL: Immediate loss of $${inpatientCase.financialDelta.toLocaleString()}. Hospital is penalized for an unverified hospital-acquired condition. Execute CDI query immediately.`,
  };
}

export function calculateHacrpAnnualExposure(
  annualIppsOperatingRevenue: number,
  hospitalQuartile: number // 1 (best) to 4 (worst)
): HacrpAnnualExposureResult {
  const isPenalized = hospitalQuartile >= 4;
  const penaltyPercentage = isPenalized ? 1.0 : 0.0;
  const annualPenaltyAmount = isPenalized ? annualIppsOperatingRevenue * 0.01 : 0;
  const safeHarborQuartile = !isPenalized;

  const psi90ScoreImpact = isPenalized
    ? 'HOSPITAL IN WORST-PERFORMING QUARTILE (Top 25% Total HAC Score): 1.0% statutory penalty deducted from ALL Medicare IPPS operating payments for the entire fiscal year.'
    : 'SAFE HARBOR QUARTILE: Total HAC Score is in top 75% performance band. 0% statutory penalty assessed.';

  return {
    annualIppsOperatingRevenue,
    hospitalQuartile,
    isPenalized,
    penaltyPercentage,
    annualPenaltyAmount,
    safeHarborQuartile,
    psi90ScoreImpact,
  };
}
