/**
 * Inpatient Rehabilitation Facility Prospective Payment System (IRF PPS) & 60% Compliance Rule Arbiter
 * 
 * Statutory & Regulatory Authorities:
 * - Social Security Act § 1886(j), 42 U.S.C. § 1395ww(j): Payment for Inpatient Rehabilitation Services
 * - 42 CFR § 412.29: Excluded Rehabilitation Units: Additional Requirements (The 60% Compliance Rule)
 * - 42 CFR § 412.604: Conditions for Payment Under the IRF Prospective Payment System
 * - 42 CFR § 412.624: Methodology for Calculating the Federal Prospective Payment Rates
 * - 42 CFR § 412.624(e)(1): Rural Adjustment (+14.9% payment multiplier for rural IRFs)
 * - 42 CFR § 412.624(e)(2): Low-Income Patient (LIP) Adjustment ((1 + DSH)^0.3177 - 1)
 * - 42 CFR § 412.624(e)(3): Teaching Status Adjustment ((1 + FTE / ADC)^0.6876 - 1)
 * - CMS IRF-PAI Manual: 13 Statutory Medical Conditions Qualifying for 60% Rule Compliance
 * - CMS Presumptive Compliance Screening List (Automated computer algorithm vs. Medical Review)
 * - Medicare Cost Report Form CMS-2552-10: Worksheet S-2 Part I (IRF 60% Certification) & Worksheet E-3 Part III
 * - False Claims Act (31 U.S.C. § 3729): Statutory Safe-Harbor for Inpatient Rehabilitation Necessity
 */

import { createHash } from 'node:crypto';

export const IRF_STATUTORY_COMPLIANCE_THRESHOLD = 0.60; // 60.0% rule
export const IRF_FY2026_STANDARD_CONVERSION_FACTOR = 19456; // Standard Federal Conversion Factor (FY 2026 est.)
export const IRF_LABOR_SHARE = 0.668;
export const IRF_NON_LABOR_SHARE = 0.332;
export const IRF_RURAL_ADJUSTMENT_FACTOR = 1.149; // +14.9% statutory rural payment bump
export const IPPS_MS_DRG_COUNTERFACTUAL_BASE = 11840; // Reclassification acute IPPS payment counterfactual

export type IrfFacilityType = 
  | 'FREESTANDING_IRF' 
  | 'HOSPITAL_EXCLUDED_UNIT';

export interface IrfConditionCategory {
  id: string;
  code: string;
  name: string;
  statutoryCategory: string;
  presumptiveEligible: boolean;
  requiresMedicalReviewVerification: boolean;
  icd10PrefixExamples: string[];
  clinicalCriteria: string;
}

export const IRF_13_QUALIFYING_CONDITIONS: IrfConditionCategory[] = [
  {
    id: 'cond_stroke',
    code: '01',
    name: 'Stroke / Cerebrovascular Accident (CVA)',
    statutoryCategory: '42 CFR § 412.29(b)(2)(i)',
    presumptiveEligible: true,
    requiresMedicalReviewVerification: false,
    icd10PrefixExamples: ['I63', 'I69.3', 'I61'],
    clinicalCriteria: 'Ischemic or hemorrhagic cerebral infarction with persistent hemiparesis, cognitive impairment, or dysphagia.'
  },
  {
    id: 'cond_spinal_cord',
    code: '02',
    name: 'Spinal Cord Injury (SCI)',
    statutoryCategory: '42 CFR § 412.29(b)(2)(ii)',
    presumptiveEligible: true,
    requiresMedicalReviewVerification: false,
    icd10PrefixExamples: ['S14.1', 'S24.1', 'S34.1'],
    clinicalCriteria: 'Complete or incomplete tetraplegia, paraplegia, or central cord syndrome resulting from trauma or acute myelopathy.'
  },
  {
    id: 'cond_congenital',
    code: '03',
    name: 'Congenital Deformity',
    statutoryCategory: '42 CFR § 412.29(b)(2)(iii)',
    presumptiveEligible: true,
    requiresMedicalReviewVerification: false,
    icd10PrefixExamples: ['Q05', 'Q66', 'Q74'],
    clinicalCriteria: 'Spina bifida, skeletal dysplasias, or arthrogryposis requiring comprehensive multidisciplinary functional restoration.'
  },
  {
    id: 'cond_amputation',
    code: '04',
    name: 'Amputation (Lower or Upper Extremity)',
    statutoryCategory: '42 CFR § 412.29(b)(2)(iv)',
    presumptiveEligible: true,
    requiresMedicalReviewVerification: false,
    icd10PrefixExamples: ['Z89.51', 'Z89.61', 'Z89.43'],
    clinicalCriteria: 'Transtibial, transfemoral, or bilateral limb loss requiring prosthetic training, residual limb management, and mobility re-education.'
  },
  {
    id: 'cond_major_trauma',
    code: '05',
    name: 'Major Multiple Trauma (MMT)',
    statutoryCategory: '42 CFR § 412.29(b)(2)(v)',
    presumptiveEligible: true,
    requiresMedicalReviewVerification: false,
    icd10PrefixExamples: ['T07', 'S32.0', 'S72.0'],
    clinicalCriteria: 'At least two significant injuries: complex fractures, visceral lacerations, or vascular trauma with severe functional limitation.'
  },
  {
    id: 'cond_femur_fracture',
    code: '06',
    name: 'Fracture of Femur (Hip Fracture)',
    statutoryCategory: '42 CFR § 412.29(b)(2)(vi)',
    presumptiveEligible: true,
    requiresMedicalReviewVerification: false,
    icd10PrefixExamples: ['S72.0', 'S72.1', 'S72.2'],
    clinicalCriteria: 'Subcapital, intertrochanteric, or subtrochanteric femoral fractures requiring open reduction internal fixation (ORIF) or hemiarthroplasty.'
  },
  {
    id: 'cond_brain_injury',
    code: '07',
    name: 'Brain Injury (Traumatic & Non-Traumatic)',
    statutoryCategory: '42 CFR § 412.29(b)(2)(vii)',
    presumptiveEligible: true,
    requiresMedicalReviewVerification: false,
    icd10PrefixExamples: ['S06.2', 'S06.3', 'G93.1'],
    clinicalCriteria: 'Traumatic brain injury, anoxic encephalopathy, or intracranial subdural/epidural hematoma with cognitive and neuromuscular deficits.'
  },
  {
    id: 'cond_neurological',
    code: '08',
    name: 'Neurological Disorders',
    statutoryCategory: '42 CFR § 412.29(b)(2)(viii)',
    presumptiveEligible: true,
    requiresMedicalReviewVerification: false,
    icd10PrefixExamples: ['G35', 'G20', 'G12.21', 'G61.0'],
    clinicalCriteria: 'Multiple sclerosis, Parkinson disease, ALS, Guillain-Barre syndrome, or severe polyneuropathy with acute functional decline.'
  },
  {
    id: 'cond_burns',
    code: '09',
    name: 'Burns (Full Thickness / Complex)',
    statutoryCategory: '42 CFR § 412.29(b)(2)(ix)',
    presumptiveEligible: true,
    requiresMedicalReviewVerification: false,
    icd10PrefixExamples: ['T20.3', 'T21.3', 'T31.2'],
    clinicalCriteria: 'Second- or third-degree burns involving >20% body surface area or critical joint contractures requiring intensive splinting and graft rehab.'
  },
  {
    id: 'cond_rheumatoid_arthritis',
    code: '10',
    name: 'Active Polyarticular Rheumatoid Arthritis & Seronegative Arthropathies',
    statutoryCategory: '42 CFR § 412.29(b)(2)(x)',
    presumptiveEligible: false,
    requiresMedicalReviewVerification: true,
    icd10PrefixExamples: ['M05.7', 'M06.0', 'M08.0'],
    clinicalCriteria: 'Active systemic joint inflammation where aggressive outpatient rehabilitation has failed or is medically contraindicated.'
  },
  {
    id: 'cond_vasculitis',
    code: '11',
    name: 'Systemic Vasculidities with Joint Inflammation',
    statutoryCategory: '42 CFR § 412.29(b)(2)(xi)',
    presumptiveEligible: false,
    requiresMedicalReviewVerification: true,
    icd10PrefixExamples: ['M30.0', 'M31.3', 'M32.1'],
    clinicalCriteria: 'Severe systemic vasculitis or lupus arthropathy with debilitating motor deficit documented during inpatient flare.'
  },
  {
    id: 'cond_severe_osteoarthritis',
    code: '12',
    name: 'Severe Advanced Osteoarthritis of Two Major Weight-Bearing Joints',
    statutoryCategory: '42 CFR § 412.29(b)(2)(xii)',
    presumptiveEligible: false,
    requiresMedicalReviewVerification: true,
    icd10PrefixExamples: ['M16.0', 'M17.0', 'M19.9'],
    clinicalCriteria: 'Bilateral hips, bilateral knees, or hip+knee involvement with marked joint deformity, loss of ROM, and outpatient rehab failure.'
  },
  {
    id: 'cond_joint_replacement',
    code: '13',
    name: 'Joint Replacement: Bilateral, BMI ≥ 50, or Age ≥ 85',
    statutoryCategory: '42 CFR § 412.29(b)(2)(xiii)',
    presumptiveEligible: false,
    requiresMedicalReviewVerification: true,
    icd10PrefixExamples: ['Z96.651', 'Z96.641', 'E66.01'],
    clinicalCriteria: 'Knee or hip joint replacement meeting ONE of three statutory exclusions: (1) bilateral procedure, (2) BMI ≥ 50 at admission, or (3) age ≥ 85.'
  }
];

export interface IrfFacilityProfile {
  id: string;
  name: string;
  ccn: string;
  npi: string;
  facilityType: IrfFacilityType;
  location: string;
  licensedBeds: number;
  annualDischargesTotal: number;
  medicareDischargesAnnual: number;
  wageIndex: number;
  lipFactor: number; // Low-Income Patient multiplier (e.g., 1.045)
  teachingFactor: number; // Teaching adjustment multiplier (e.g., 1.000 or 1.035)
  isRural: boolean;
  basePresumptiveRate: number; // Computerized screening result (e.g. 0.564 or 0.682)
  medicalReviewDocumentationRate: number; // Recovery rate achievable via chart audit (e.g. 0.068)
  averageCmgWeight: number; // Average Case-Mix Group relative weight (e.g. 1.24)
  tierDistribution: {
    tier1Pct: number; // High severity comorbidity (~1.285x)
    tier2Pct: number; // Medium severity comorbidity (~1.162x)
    tier3Pct: number; // Low severity comorbidity (~1.074x)
    tier0Pct: number; // No comorbidity (1.000x)
  };
  caseDistribution: {
    qualifyingPresumptivePct: number;
    borderlineJointRehabPct: number;
    rheumatoidVasculitisPct: number;
    nonQualifyingGeneralDebilityPct: number;
  };
  summary: string;
}

export const IRF_FACILITY_ARCHETYPES: IrfFacilityProfile[] = [
  {
    id: 'midwest-neuro-rehab',
    name: 'Midwest Neurological Rehabilitation Hospital',
    ccn: '14-3028',
    npi: '1629481920',
    facilityType: 'FREESTANDING_IRF',
    location: 'Joliet, IL (Chicago Metropolitan Area)',
    licensedBeds: 80,
    annualDischargesTotal: 840,
    medicareDischargesAnnual: 650,
    wageIndex: 1.042,
    lipFactor: 1.048,
    teachingFactor: 1.000,
    isRural: false,
    basePresumptiveRate: 0.664, // 66.4% compliant out of the box
    medicalReviewDocumentationRate: 0.021, // Potential +2.1%
    averageCmgWeight: 1.285,
    tierDistribution: {
      tier1Pct: 0.22,
      tier2Pct: 0.34,
      tier3Pct: 0.28,
      tier0Pct: 0.16
    },
    caseDistribution: {
      qualifyingPresumptivePct: 0.664,
      borderlineJointRehabPct: 0.082,
      rheumatoidVasculitisPct: 0.044,
      nonQualifyingGeneralDebilityPct: 0.210
    },
    summary: 'High-volume neurotrauma center treating stroke, traumatic brain injury, and spinal cord lesions with comfortable presumptive 60% rule compliance.'
  },
  {
    id: 'allegheny-excluded-unit',
    name: 'Allegheny Health Excluded Rehabilitation Unit',
    ccn: '39-T112',
    npi: '1841329045',
    facilityType: 'HOSPITAL_EXCLUDED_UNIT',
    location: 'Pittsburgh, PA (Tertiary Academic Medical Center)',
    licensedBeds: 28,
    annualDischargesTotal: 380,
    medicareDischargesAnnual: 310,
    wageIndex: 0.985,
    lipFactor: 1.062,
    teachingFactor: 1.035, // Resident teaching program
    isRural: false,
    basePresumptiveRate: 0.564, // 56.4% - FAILS Presumptive Computerized Screen (< 60%)!
    medicalReviewDocumentationRate: 0.068, // Medical review recovers +6.8% -> 63.2% PASS!
    averageCmgWeight: 1.215,
    tierDistribution: {
      tier1Pct: 0.18,
      tier2Pct: 0.32,
      tier3Pct: 0.30,
      tier0Pct: 0.20
    },
    caseDistribution: {
      qualifyingPresumptivePct: 0.564,
      borderlineJointRehabPct: 0.184, // Heavy joint volume missing bilateral/BMI flags
      rheumatoidVasculitisPct: 0.052,
      nonQualifyingGeneralDebilityPct: 0.200
    },
    summary: 'Borderline hospital-based unit facing immediate MAC audit and $4.2M IPPS reclassification clawback unless saved by medical review chart validation.'
  },
  {
    id: 'appalachian-rural-rehab',
    name: 'Appalachian Valley Rural Rehabilitation Center',
    ccn: '44-3042',
    npi: '1730294811',
    facilityType: 'FREESTANDING_IRF',
    location: 'Greeneville, TN (East Tennessee Rural HPSA)',
    licensedBeds: 36,
    annualDischargesTotal: 420,
    medicareDischargesAnnual: 360,
    wageIndex: 0.824,
    lipFactor: 1.115, // High dual-eligible Medicaid/SSI population
    teachingFactor: 1.000,
    isRural: true, // +14.9% Rural Multiplier under 42 CFR § 412.624(e)(1)
    basePresumptiveRate: 0.718, // 71.8% compliant
    medicalReviewDocumentationRate: 0.015,
    averageCmgWeight: 1.190,
    tierDistribution: {
      tier1Pct: 0.14,
      tier2Pct: 0.30,
      tier3Pct: 0.36,
      tier0Pct: 0.20
    },
    caseDistribution: {
      qualifyingPresumptivePct: 0.718,
      borderlineJointRehabPct: 0.062,
      rheumatoidVasculitisPct: 0.030,
      nonQualifyingGeneralDebilityPct: 0.190
    },
    summary: 'Sole community rural rehab hospital leveraging statutory +14.9% rural payment factor and high LIP multiplier with pristine compliance posture.'
  },
  {
    id: 'metropolitan-pmr-institute',
    name: 'Metropolitan Physical Medicine & Rehab Institute',
    ccn: '05-3185',
    npi: '1952483017',
    facilityType: 'FREESTANDING_IRF',
    location: 'Los Angeles, CA (Urban)',
    licensedBeds: 42,
    annualDischargesTotal: 510,
    medicareDischargesAnnual: 420,
    wageIndex: 1.285,
    lipFactor: 1.032,
    teachingFactor: 1.000,
    isRural: false,
    basePresumptiveRate: 0.495, // 49.5% - Severe Presumptive Failure!
    medicalReviewDocumentationRate: 0.042, // Adjusted: 53.7% - STILL FAILS (< 60%)!
    averageCmgWeight: 1.140,
    tierDistribution: {
      tier1Pct: 0.12,
      tier2Pct: 0.28,
      tier3Pct: 0.35,
      tier0Pct: 0.25
    },
    caseDistribution: {
      qualifyingPresumptivePct: 0.495,
      borderlineJointRehabPct: 0.125,
      rheumatoidVasculitisPct: 0.030,
      nonQualifyingGeneralDebilityPct: 0.350 // Heavy medical debility / non-qualifying admissions
    },
    summary: 'High-risk facility facing acute reclassification to IPPS MS-DRGs due to admission of non-qualifying general debility cases without documented arthritis criteria.'
  }
];

export interface IrfPpsCalculationResult {
  // Compliance Metrics
  presumptiveComplianceRate: number;
  presumptiveStatus: 'PASS' | 'FAIL_AUDIT_TRIGGERED';
  medicalReviewComplianceRate: number;
  medicalReviewStatus: 'PASS' | 'FAIL_RECLASSIFICATION';
  finalComplianceStatus: 'COMPLIANT_IRF_PPS' | 'RECLASSIFIED_ACUTE_IPPS';
  complianceMarginDelta: number; // Distance above or below 60.0% threshold

  // Payment Rates & Multipliers
  wageAdjustedBaseRate: number;
  facilityMultiplier: number;
  tierBlendedMultiplier: number;
  settledIrfPaymentPerCase: number;
  counterfactualIppsPaymentPerCase: number;
  perCaseDisparityDelta: number;

  // Annual Financial Settlement
  annualMedicareDischarges: number;
  annualIrfPpsProgramRevenue: number;
  annualIppsReclassificationRevenue: number;
  annualReclassificationPenaltyLoss: number; // Financial haircut if reclassified to IPPS
  medicalReviewRecoveryValue: number; // Financial value saved by medical review defense
}

export interface IrfAuditDossier {
  legalHeader: string;
  auditHash: string;
  timestamp: string;
  facilityIdentification: {
    facilityName: string;
    ccn: string;
    npi: string;
    facilityType: string;
    location: string;
    bedCount: number;
    wageIndex: string;
    ruralStatus: string;
  };
  complianceRuleAudit: {
    statutoryThreshold: string;
    presumptiveComplianceScore: string;
    presumptiveStatus: string;
    medicalReviewComplianceScore: string;
    final60PercentStatus: string;
    marginFromStatutoryStandard: string;
  };
  reimbursementSettlement: {
    standardConversionFactor: string;
    wageAdjustedBase: string;
    averageCmgWeight: string;
    tierMultiplier: string;
    irfPaymentPerDischarge: string;
    ippsCounterfactualPerDischarge: string;
    totalAnnualIrfRevenue: string;
    reclassificationLossRisk: string;
  };
  statutorySafeHarbor: string;
}

/**
 * Calculates the IRF PPS payment per discharge under 42 CFR § 412.624
 */
export function calculateIrfPaymentPerCase(
  wageIndex: number,
  isRural: boolean,
  lipFactor: number,
  teachingFactor: number,
  averageCmgWeight: number,
  tierDistribution: {
    tier1Pct: number;
    tier2Pct: number;
    tier3Pct: number;
    tier0Pct: number;
  }
): {
  wageAdjustedBase: number;
  facilityMultiplier: number;
  tierMultiplier: number;
  paymentPerCase: number;
} {
  // Labor share (66.8%) adjusted by wage index, non-labor share (33.2%) unadjusted
  const wageAdjustedBase = IRF_FY2026_STANDARD_CONVERSION_FACTOR * 
    (IRF_LABOR_SHARE * wageIndex + IRF_NON_LABOR_SHARE);

  // Facility adjustments: Rural (+14.9%), LIP, Teaching
  const ruralMultiplier = isRural ? IRF_RURAL_ADJUSTMENT_FACTOR : 1.0;
  const facilityMultiplier = ruralMultiplier * lipFactor * teachingFactor;

  // Comorbidity Tier multiplier: Tier 1 (1.285), Tier 2 (1.162), Tier 3 (1.074), Tier 0 (1.000)
  const tierMultiplier = 
    (tierDistribution.tier1Pct * 1.285) +
    (tierDistribution.tier2Pct * 1.162) +
    (tierDistribution.tier3Pct * 1.074) +
    (tierDistribution.tier0Pct * 1.000);

  const paymentPerCase = wageAdjustedBase * averageCmgWeight * tierMultiplier * facilityMultiplier;

  return {
    wageAdjustedBase: Math.round(wageAdjustedBase * 100) / 100,
    facilityMultiplier: Math.round(facilityMultiplier * 10000) / 10000,
    tierMultiplier: Math.round(tierMultiplier * 10000) / 10000,
    paymentPerCase: Math.round(paymentPerCase * 100) / 100
  };
}

/**
 * Evaluates facility compliance with the 42 CFR § 412.29 60% Rule and calculates financial delta
 */
export function evaluateIrfCompliance(
  profile: IrfFacilityProfile,
  customPresumptiveRate?: number,
  customMedicalReviewRateDelta?: number,
  customDischarges?: number
): IrfPpsCalculationResult {
  const presumptiveRate = customPresumptiveRate !== undefined ? customPresumptiveRate : profile.basePresumptiveRate;
  const medicalReviewDelta = customMedicalReviewRateDelta !== undefined ? customMedicalReviewRateDelta : profile.medicalReviewDocumentationRate;
  const discharges = customDischarges !== undefined ? customDischarges : profile.medicareDischargesAnnual;

  const presumptiveStatus = presumptiveRate >= IRF_STATUTORY_COMPLIANCE_THRESHOLD 
    ? 'PASS' 
    : 'FAIL_AUDIT_TRIGGERED';

  const medicalReviewComplianceRate = Math.min(1.0, presumptiveRate + medicalReviewDelta);
  const medicalReviewStatus = medicalReviewComplianceRate >= IRF_STATUTORY_COMPLIANCE_THRESHOLD 
    ? 'PASS' 
    : 'FAIL_RECLASSIFICATION';

  // Final status: Compliant if either presumptive or medical review passes
  const finalComplianceStatus = (presumptiveStatus === 'PASS' || medicalReviewStatus === 'PASS')
    ? 'COMPLIANT_IRF_PPS'
    : 'RECLASSIFIED_ACUTE_IPPS';

  const activeRate = presumptiveStatus === 'PASS' ? presumptiveRate : medicalReviewComplianceRate;
  const complianceMarginDelta = Math.round((activeRate - IRF_STATUTORY_COMPLIANCE_THRESHOLD) * 1000) / 10; // e.g. +3.2% or -6.3%

  // Calculate IRF PPS Reimbursement
  const irfPricing = calculateIrfPaymentPerCase(
    profile.wageIndex,
    profile.isRural,
    profile.lipFactor,
    profile.teachingFactor,
    profile.averageCmgWeight,
    profile.tierDistribution
  );

  // Counterfactual acute IPPS MS-DRG rate (adjusted for local wage index)
  const counterfactualIppsPaymentPerCase = Math.round(
    IPPS_MS_DRG_COUNTERFACTUAL_BASE * (IRF_LABOR_SHARE * profile.wageIndex + IRF_NON_LABOR_SHARE) * 100
  ) / 100;

  const perCaseDisparityDelta = Math.round((irfPricing.paymentPerCase - counterfactualIppsPaymentPerCase) * 100) / 100;

  const annualIrfPpsProgramRevenue = Math.round(irfPricing.paymentPerCase * discharges);
  const annualIppsReclassificationRevenue = Math.round(counterfactualIppsPaymentPerCase * discharges);

  const annualReclassificationPenaltyLoss = finalComplianceStatus === 'RECLASSIFIED_ACUTE_IPPS'
    ? Math.round(annualIrfPpsProgramRevenue - annualIppsReclassificationRevenue)
    : 0;

  // Value saved by medical review defense if presumptive failed but medical review passed
  const medicalReviewRecoveryValue = (presumptiveStatus === 'FAIL_AUDIT_TRIGGERED' && medicalReviewStatus === 'PASS')
    ? Math.round(annualIrfPpsProgramRevenue - annualIppsReclassificationRevenue)
    : 0;

  return {
    presumptiveComplianceRate: Math.round(presumptiveRate * 1000) / 1000,
    presumptiveStatus,
    medicalReviewComplianceRate: Math.round(medicalReviewComplianceRate * 1000) / 1000,
    medicalReviewStatus,
    finalComplianceStatus,
    complianceMarginDelta,

    wageAdjustedBaseRate: irfPricing.wageAdjustedBase,
    facilityMultiplier: irfPricing.facilityMultiplier,
    tierBlendedMultiplier: irfPricing.tierMultiplier,
    settledIrfPaymentPerCase: irfPricing.paymentPerCase,
    counterfactualIppsPaymentPerCase,
    perCaseDisparityDelta,

    annualMedicareDischarges: discharges,
    annualIrfPpsProgramRevenue,
    annualIppsReclassificationRevenue,
    annualReclassificationPenaltyLoss,
    medicalReviewRecoveryValue
  };
}

/**
 * Generates an auditable CMS Form 2552-10 Worksheet S-2 Part I settlement dossier with cryptographic SHA-256 hash
 */
export function generateIrfAuditDossier(
  profile: IrfFacilityProfile,
  calc: IrfPpsCalculationResult
): IrfAuditDossier {
  const hashSeed = `${profile.ccn}|${profile.npi}|${calc.presumptiveComplianceRate}|${calc.medicalReviewComplianceRate}|${calc.settledIrfPaymentPerCase}|${calc.annualIrfPpsProgramRevenue}|2026-IRF-PPS`;
  const auditHash = `IRF-60R-${createHash('sha256').update(hashSeed).digest('hex').substring(0, 10).toUpperCase()}-2026-FCA`;

  const marginSign = calc.complianceMarginDelta >= 0 ? '+' : '';

  return {
    legalHeader: 'FORM CMS-2552-10 (WORKSHEET S-2 & E-3) IRF 60% COMPLIANCE & PPS REVENUE SETTLEMENT BRIEF',
    auditHash,
    timestamp: '2026-09-22T06:00:00.000Z',
    facilityIdentification: {
      facilityName: profile.name,
      ccn: profile.ccn,
      npi: profile.npi,
      facilityType: profile.facilityType === 'FREESTANDING_IRF' ? 'FREESTANDING INPATIENT REHABILITATION HOSPITAL' : 'HOSPITAL-BASED EXCLUDED REHABILITATION UNIT',
      location: profile.location,
      bedCount: profile.licensedBeds,
      wageIndex: profile.wageIndex.toFixed(4),
      ruralStatus: profile.isRural ? 'RURAL (+14.9% STATUTORY ADJUSTMENT)' : 'URBAN (STANDARD RATE)'
    },
    complianceRuleAudit: {
      statutoryThreshold: '60.00% (42 CFR § 412.29(b)(2))',
      presumptiveComplianceScore: `${(calc.presumptiveComplianceRate * 100).toFixed(1)}%`,
      presumptiveStatus: calc.presumptiveStatus === 'PASS' ? 'COMPLIANT (PRESUMPTIVE TEST MET)' : 'FAIL - TRIGGERED MAC MANUAL AUDIT',
      medicalReviewComplianceScore: `${(calc.medicalReviewComplianceRate * 100).toFixed(1)}%`,
      final60PercentStatus: calc.finalComplianceStatus === 'COMPLIANT_IRF_PPS' ? 'COMPLIANT - QUALIFIED FOR IRF PPS' : 'NON-COMPLIANT - RECLASSIFIED TO IPPS',
      marginFromStatutoryStandard: `${marginSign}${calc.complianceMarginDelta.toFixed(1)}%`
    },
    reimbursementSettlement: {
      standardConversionFactor: `$${IRF_FY2026_STANDARD_CONVERSION_FACTOR.toLocaleString()}`,
      wageAdjustedBase: `$${calc.wageAdjustedBaseRate.toLocaleString()}`,
      averageCmgWeight: profile.averageCmgWeight.toFixed(3),
      tierMultiplier: `${calc.tierBlendedMultiplier.toFixed(4)}x`,
      irfPaymentPerDischarge: `$${calc.settledIrfPaymentPerCase.toLocaleString()} / Discharge`,
      ippsCounterfactualPerDischarge: `$${calc.counterfactualIppsPaymentPerCase.toLocaleString()} / Discharge`,
      totalAnnualIrfRevenue: `$${calc.annualIrfPpsProgramRevenue.toLocaleString()}`,
      reclassificationLossRisk: calc.annualReclassificationPenaltyLoss > 0
        ? `-$${calc.annualReclassificationPenaltyLoss.toLocaleString()} (RECLASSIFICATION TO IPPS)`
        : '$0.00 (PROTECTED BY COMPLIANCE DEFENSE)'
    },
    statutorySafeHarbor: 'FALSE CLAIMS ACT SAFE-HARBOR (31 U.S.C. § 3729) & 42 CFR § 412.29:\n' +
      'The facility certifies that the medical records and IRF-PAI assessments substantiate that at least 60.0% of the inpatient population ' +
      'required intensive inpatient rehabilitation for one or more of the 13 statutory conditions. In accordance with CMS guidelines, all ' +
      'joint replacement and arthritic admissions satisfy documentation requirements for medical necessity and statutory exclusions.'
  };
}
