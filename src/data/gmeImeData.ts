/**
 * Teaching Hospital GME/IME Resident Cap & Direct Graduate Medical Education Optimizer
 * 
 * Statutory & Regulatory Foundations:
 * - Social Security Act § 1886(h) & 42 CFR §§ 413.75 - 413.83: Direct Graduate Medical Education (DGME)
 * - Social Security Act § 1886(d)(5)(B) & 42 CFR § 412.105: Indirect Medical Education (IME) Operating Adjustment
 * - 42 CFR § 412.322: Capital Indirect Medical Education (IME) Adjustment
 * - Balanced Budget Act of 1997 (BBA-97, Pub. L. 105-33): Statutory 1996 Base-Year Resident FTE Caps
 * - Consolidated Appropriations Act (CAA), 2021 (Pub. L. 116-260) § 126 & CAA 2023 § 4122: 1,200 New Medicare GME Slots
 * - Medicare Advantage (MA) Shadow Billing: BBA-97 § 4624, 42 CFR § 412.105(g), CMS Transmittal 10738 (TOB 111 with Condition Code 04/69)
 * - Inpatient Psychiatric Facility (IPF) Teaching Adjustment: 42 CFR § 412.424(d)(1)(iii) (Teaching Exponent = 0.5150)
 * - Inpatient Psychiatric Facility Quality Reporting (IPFQR): Social Security Act § 1886(s)(4) (2.0% Market Basket Penalty)
 * - Form CMS-2552-10 Hospital Cost Report: Worksheet E-4 (DGME), Worksheet E, Part A (Operating IME), Worksheet L (Capital IME)
 */

export interface TeachingHospitalArchetype {
  id: string;
  name: string;
  facilityType: 'ACADEMIC_MEDICAL_CENTER' | 'COMMUNITY_TEACHING' | 'RURAL_REFERRAL_CENTER' | 'PSYCHIATRIC_FACILITY';
  description: string;
  cptDrgScope: string;
  inpatientBedCount: number;
  averageDailyCensus: number;
  // BBA-97 Statutory 1996 Base Year Caps
  bba1996DgmeCap: number;
  bba1996ImeCap: number;
  // Current Staffing
  actualResidentFtes: number;
  fellowshipFtesBeyondIrp: number; // Weighted at 0.5 FTE for DGME
  // Per-Resident Amount (PRA) updated by CPI-U
  primaryCarePra: number;
  nonPrimaryCarePra: number;
  blendedPra: number;
  // Utilization Metrics
  totalInpatientDays: number;
  medicareFfsDays: number;
  medicareAdvantageDays: number; // Crucial for MA Shadow Billing & Allina Health MPL
  // Financial IPPS Base Payments
  annualBaseIppsOperatingDrgRevenue: number;
  annualBaseIppsCapitalDrgRevenue: number;
  // Medicare Advantage Shadow Claim Filings
  unfiledShadowClaimRate: number; // % of MA claims not dropped to MAC
  // CAA § 126 / § 127 Status
  caaCategory: 'CAT_1_RURAL' | 'CAT_2_OVER_CAP' | 'CAT_3_HIGH_HPSA' | 'CAT_4_HPSA_SERVING';
  caaAwardedSlots: number; // 0 to 5.0 FTEs
  // IPF Specific Metrics (if applicable)
  isIpf: boolean;
  ipfFederalBaseRatePerDiem?: number;
  ipfqrComplianceScore?: number; // % compliance (threshold 95%)
  residentStipendAndBenefitsCost: number; // Average direct cost per resident ($78,500 - $85,000)
}

export interface GmeImeCalculationResult {
  // DGME Calculations (CMS-2552-10 Worksheet E-4)
  weightedResidentFtes: number;
  effectiveDgmeCap: number; // BBA-97 cap + CAA slots
  allowableDgmeFtes: number; // min(weighted, effectiveDgmeCap)
  overCapDgmeFtes: number;
  medicarePatientLoad: number; // (FFS Days + MA Days) / Total Days
  totalDgmeReimbursement: number; // Allowable FTEs * Blended PRA * MPL

  // Operating IME Calculations (CMS-2552-10 Worksheet E, Part A)
  effectiveImeCap: number;
  allowableImeFtes: number; // min(actual, effectiveImeCap)
  overCapImeFtes: number;
  internAndResidentToBedRatio: number; // Allowable FTEs / Bed Count
  operatingImeFactor: number; // 1.35 * ((1 + IRB)^0.405 - 1)
  operatingImePayment: number; // Base Operating DRG * IME Factor

  // Capital IME Calculations (CMS-2552-10 Worksheet L)
  capitalImeFactor: number; // e^(0.2822 * IRB) - 1
  capitalImePayment: number; // Base Capital DRG * Capital Factor

  // Total Medicare Graduate Medical Education Funding
  totalDirectAndIndirectFunding: number;

  // Medicare Advantage (MA) Shadow Billing Recovery
  maEligibleImeRevenue: number;
  unbilledMaShadowLoss: number;
  capturedMaShadowRevenue: number;

  // Over-Cap Economics
  totalUnfundedResidentDirectCost: number; // Over-Cap FTEs * Stipend Cost
  netInstitutionalMarginOnGme: number;

  // CAA § 126 Expansion Impact
  caaSlotMarginalDgme: number;
  caaSlotMarginalIme: number;
  totalCaaExpansionValue: number;

  // IPF Specific (if applicable)
  ipfTeachingFactor?: number; // (1 + FTEs/ADC)^0.5150 - 1
  ipfTeachingPayment?: number;
  ipfqrPenaltyRate?: number; // 2.0% if non-compliant
  ipfqrAnnualRevenueAtRisk?: number;
}

export const TEACHING_HOSPITAL_ARCHETYPES: TeachingHospitalArchetype[] = [
  {
    id: 'amc-tier1',
    name: 'Metropolitan Academic Health System',
    facilityType: 'ACADEMIC_MEDICAL_CENTER',
    description: '720-bed Level 1 Trauma Center & Comprehensive Cancer Institute with 38 ACGME-accredited residency and subspecialty fellowship programs.',
    cptDrgScope: 'MS-DRG 001-989 (Comprehensive Surgical, Mechanical Circulatory Support, Solid Organ Transplant, CAR-T Cellular Immunotherapy)',
    inpatientBedCount: 720,
    averageDailyCensus: 624.5,
    bba1996DgmeCap: 240.0,
    bba1996ImeCap: 230.0,
    actualResidentFtes: 310.0,
    fellowshipFtesBeyondIrp: 48.0, // Weighted at 0.5
    primaryCarePra: 178500,
    nonPrimaryCarePra: 171800,
    blendedPra: 174200,
    totalInpatientDays: 210000,
    medicareFfsDays: 48000,
    medicareAdvantageDays: 32850,
    annualBaseIppsOperatingDrgRevenue: 385000000,
    annualBaseIppsCapitalDrgRevenue: 32000000,
    unfiledShadowClaimRate: 0.35, // 35% shadow claims unbilled!
    caaCategory: 'CAT_2_OVER_CAP',
    caaAwardedSlots: 5.0,
    isIpf: false,
    residentStipendAndBenefitsCost: 82500,
  },
  {
    id: 'community-teaching',
    name: 'St. Jude Regional Community Teaching Hospital',
    facilityType: 'COMMUNITY_TEACHING',
    description: '280-bed community health system sponsoring ACGME Internal Medicine, Family Medicine, and General Surgery residencies.',
    cptDrgScope: 'MS-DRG 177-872 (Cardiology, Orthopedic Arthroplasty, General Surgery, Sepsis, Stroke Care)',
    inpatientBedCount: 280,
    averageDailyCensus: 232.0,
    bba1996DgmeCap: 42.0,
    bba1996ImeCap: 40.0,
    actualResidentFtes: 58.0,
    fellowshipFtesBeyondIrp: 4.0,
    primaryCarePra: 146000,
    nonPrimaryCarePra: 139000,
    blendedPra: 142500,
    totalInpatientDays: 84000,
    medicareFfsDays: 22000,
    medicareAdvantageDays: 15100,
    annualBaseIppsOperatingDrgRevenue: 118000000,
    annualBaseIppsCapitalDrgRevenue: 9800000,
    unfiledShadowClaimRate: 0.20,
    caaCategory: 'CAT_4_HPSA_SERVING',
    caaAwardedSlots: 3.5,
    isIpf: false,
    residentStipendAndBenefitsCost: 79200,
  },
  {
    id: 'rural-referral',
    name: 'Highland Valley Rural Referral Center',
    facilityType: 'RURAL_REFERRAL_CENTER',
    description: '110-bed Sole Community Hospital & Rural Training Track (RTT) facility qualifying for rural reclassification under 42 CFR § 412.103.',
    cptDrgScope: 'MS-DRG 190-871 (Chronic Disease Exacerbation, Emergency General Surgery, Rural Primary Care)',
    inpatientBedCount: 110,
    averageDailyCensus: 88.0,
    bba1996DgmeCap: 12.0,
    bba1996ImeCap: 10.0,
    actualResidentFtes: 22.0,
    fellowshipFtesBeyondIrp: 0.0,
    primaryCarePra: 139500,
    nonPrimaryCarePra: 132000,
    blendedPra: 136800,
    totalInpatientDays: 38000,
    medicareFfsDays: 12500,
    medicareAdvantageDays: 7200,
    annualBaseIppsOperatingDrgRevenue: 42000000,
    annualBaseIppsCapitalDrgRevenue: 3500000,
    unfiledShadowClaimRate: 0.15,
    caaCategory: 'CAT_1_RURAL',
    caaAwardedSlots: 5.0,
    isIpf: false,
    residentStipendAndBenefitsCost: 77000,
  },
  {
    id: 'ipf-behavioral',
    name: 'Pinecrest Academic Psychiatric Hospital',
    facilityType: 'PSYCHIATRIC_FACILITY',
    description: '120-bed specialized Inpatient Psychiatric Facility (IPF) with 16 ACGME adult and child psychiatry residents subject to 42 CFR § 412.424(d)(1)(iii).',
    cptDrgScope: 'Psychiatric Per-Diem (Major Depressive Disorder, Bipolar I Mania, Schizoaffective Disorder, Dual Diagnosis)',
    inpatientBedCount: 120,
    averageDailyCensus: 96.4,
    bba1996DgmeCap: 12.0,
    bba1996ImeCap: 10.0,
    actualResidentFtes: 16.0,
    fellowshipFtesBeyondIrp: 2.0,
    primaryCarePra: 148000,
    nonPrimaryCarePra: 141000,
    blendedPra: 144500,
    totalInpatientDays: 35186,
    medicareFfsDays: 14200,
    medicareAdvantageDays: 6100,
    annualBaseIppsOperatingDrgRevenue: 31491470, // Federal Base Per-Diem * Days
    annualBaseIppsCapitalDrgRevenue: 2400000,
    unfiledShadowClaimRate: 0.25,
    caaCategory: 'CAT_3_HIGH_HPSA',
    caaAwardedSlots: 2.0,
    isIpf: true,
    ipfFederalBaseRatePerDiem: 895.00,
    ipfqrComplianceScore: 91.2, // Under 95% threshold -> At risk of 2.0% market basket penalty!
    residentStipendAndBenefitsCost: 78500,
  },
];

/**
 * Deterministic GME / IME Reimbursement & Compliance Calculator
 * Compliant with Form CMS-2552-10 Worksheets E-4 and E (Part A).
 */
export function calculateGmeImeReimbursement(
  hospital: TeachingHospitalArchetype,
  overrides?: {
    customResidentFtes?: number;
    customFellowshipFtes?: number;
    customCaaSlots?: number;
    customUnfiledShadowRate?: number;
    ipfqrCompliant?: boolean;
  }
): GmeImeCalculationResult {
  const actualFtes = overrides?.customResidentFtes ?? hospital.actualResidentFtes;
  const fellowshipFtes = overrides?.customFellowshipFtes ?? hospital.fellowshipFtesBeyondIrp;
  const caaSlots = overrides?.customCaaSlots ?? hospital.caaAwardedSlots;
  const unfiledShadowRate = overrides?.customUnfiledShadowRate ?? hospital.unfiledShadowClaimRate;

  // 1. DGME Calculation (42 CFR §§ 413.75 - 413.83, Worksheet E-4)
  // Residents in Initial Residency Period (IRP) count as 1.0; fellows count as 0.5
  const irpFtes = Math.max(0, actualFtes - fellowshipFtes);
  const weightedResidentFtes = irpFtes * 1.0 + fellowshipFtes * 0.5;

  const effectiveDgmeCap = hospital.bba1996DgmeCap + caaSlots;
  const allowableDgmeFtes = Math.min(weightedResidentFtes, effectiveDgmeCap);
  const overCapDgmeFtes = Math.max(0, weightedResidentFtes - effectiveDgmeCap);

  // Medicare Patient Load (MPL) under Azar v. Allina Health Services (BIPA § 111):
  // Includes both Medicare FFS (Part A) and Medicare Advantage (Part C) days
  const totalMedicareDays = hospital.medicareFfsDays + hospital.medicareAdvantageDays;
  const medicarePatientLoad = hospital.totalInpatientDays > 0 ? totalMedicareDays / hospital.totalInpatientDays : 0;

  const totalDgmeReimbursement = allowableDgmeFtes * hospital.blendedPra * medicarePatientLoad;

  // 2. Operating IME Calculation (42 CFR § 412.105, Worksheet E, Part A)
  // Intern-and-Resident-to-Bed (IRB) Ratio = Unweighted Capped FTEs / Bed Count
  const effectiveImeCap = hospital.bba1996ImeCap + caaSlots;
  const allowableImeFtes = Math.min(actualFtes, effectiveImeCap);
  const overCapImeFtes = Math.max(0, actualFtes - effectiveImeCap);

  const irbRatio = hospital.inpatientBedCount > 0 ? allowableImeFtes / hospital.inpatientBedCount : 0;

  // Statutory Operating IME Formula: 1.35 * ((1 + IRB)^0.405 - 1)
  const operatingImeFactor = 1.35 * (Math.pow(1 + irbRatio, 0.405) - 1);
  const operatingImePayment = hospital.annualBaseIppsOperatingDrgRevenue * operatingImeFactor;

  // 3. Capital IME Calculation (42 CFR § 412.322, Worksheet L)
  // Capital IME Factor = e^(0.2822 * IRB) - 1
  const capitalImeFactor = Math.exp(0.2822 * irbRatio) - 1;
  const capitalImePayment = hospital.annualBaseIppsCapitalDrgRevenue * capitalImeFactor;

  const totalDirectAndIndirectFunding = totalDgmeReimbursement + operatingImePayment + capitalImePayment;

  // 4. Medicare Advantage (MA) Shadow Claim Recovery (CMS Transmittal 10738, Condition Code 04)
  // MA enrollees entitle the hospital to full operating IME, paid directly by the MAC!
  // Operating IME per Medicare day = operatingImePayment / FFS days
  const imePerMedicareDay = hospital.medicareFfsDays > 0 ? operatingImePayment / hospital.medicareFfsDays : 0;
  const maEligibleImeRevenue = hospital.medicareAdvantageDays * imePerMedicareDay;
  const unbilledMaShadowLoss = maEligibleImeRevenue * unfiledShadowRate;
  const capturedMaShadowRevenue = maEligibleImeRevenue * (1 - unfiledShadowRate);

  // 5. Over-Cap Economics & Unfunded Resident Burden
  const totalUnfundedResidentDirectCost = (actualFtes - Math.min(actualFtes, effectiveDgmeCap)) * hospital.residentStipendAndBenefitsCost;
  const netInstitutionalMarginOnGme = totalDirectAndIndirectFunding - (actualFtes * hospital.residentStipendAndBenefitsCost);

  // 6. CAA § 126 / § 127 Expansion Upside (Marginal yield per added slot)
  const baselineAllowableDgme = Math.min(weightedResidentFtes, hospital.bba1996DgmeCap);
  const baselineAllowableIme = Math.min(actualFtes, hospital.bba1996ImeCap);
  const baselineIrb = hospital.inpatientBedCount > 0 ? baselineAllowableIme / hospital.inpatientBedCount : 0;
  const baselineImeFactor = 1.35 * (Math.pow(1 + baselineIrb, 0.405) - 1);
  const baselineImePayment = hospital.annualBaseIppsOperatingDrgRevenue * baselineImeFactor;
  const baselineDgmePayment = baselineAllowableDgme * hospital.blendedPra * medicarePatientLoad;

  const caaSlotMarginalDgme = Math.max(0, totalDgmeReimbursement - baselineDgmePayment);
  const caaSlotMarginalIme = Math.max(0, operatingImePayment - baselineImePayment);
  const totalCaaExpansionValue = caaSlotMarginalDgme + caaSlotMarginalIme;

  // 7. Inpatient Psychiatric Facility (IPF) Teaching Adjustment & IPFQR (42 CFR § 412.424(d)(1)(iii))
  let ipfTeachingFactor: number | undefined;
  let ipfTeachingPayment: number | undefined;
  let ipfqrPenaltyRate: number | undefined;
  let ipfqrAnnualRevenueAtRisk: number | undefined;

  if (hospital.isIpf && hospital.averageDailyCensus > 0) {
    // IPF Teaching formula: (1 + Residents / ADC)^0.5150 - 1
    const residentToAdc = allowableImeFtes / hospital.averageDailyCensus;
    ipfTeachingFactor = Math.pow(1 + residentToAdc, 0.5150) - 1;
    ipfTeachingPayment = hospital.annualBaseIppsOperatingDrgRevenue * ipfTeachingFactor;

    // IPFQR 2.0 percentage point penalty check
    const isCompliant = overrides?.ipfqrCompliant ?? ((hospital.ipfqrComplianceScore ?? 100) >= 95.0);
    ipfqrPenaltyRate = isCompliant ? 0.0 : 0.02; // 2% reduction
    ipfqrAnnualRevenueAtRisk = hospital.annualBaseIppsOperatingDrgRevenue * 0.02;
  }

  return {
    weightedResidentFtes,
    effectiveDgmeCap,
    allowableDgmeFtes,
    overCapDgmeFtes,
    medicarePatientLoad,
    totalDgmeReimbursement,
    effectiveImeCap,
    allowableImeFtes,
    overCapImeFtes,
    internAndResidentToBedRatio: irbRatio,
    operatingImeFactor,
    operatingImePayment,
    capitalImeFactor,
    capitalImePayment,
    totalDirectAndIndirectFunding,
    maEligibleImeRevenue,
    unbilledMaShadowLoss,
    capturedMaShadowRevenue,
    totalUnfundedResidentDirectCost,
    netInstitutionalMarginOnGme,
    caaSlotMarginalDgme,
    caaSlotMarginalIme,
    totalCaaExpansionValue,
    ipfTeachingFactor,
    ipfTeachingPayment,
    ipfqrPenaltyRate,
    ipfqrAnnualRevenueAtRisk,
  };
}

/**
 * Generate 1-Click CMS-2552-10 Worksheet E-4 & E Part A Audit Dossier
 */
export function generateGmeAuditDossier(
  hospital: TeachingHospitalArchetype,
  calc: GmeImeCalculationResult
): {
  dossierId: string;
  auditHash: string;
  timestamp: string;
  legalHeader: string;
  worksheetE4Data: Record<string, string | number>;
  worksheetEPartAData: Record<string, string | number>;
  shadowClaimDefenseBrief: string;
} {
  const timestamp = new Date().toISOString();
  const rawPayload = `${hospital.id}|${calc.allowableDgmeFtes}|${calc.operatingImePayment}|${calc.unbilledMaShadowLoss}|${timestamp}`;
  
  // Deterministic hash simulation
  let hashVal = 0;
  for (let i = 0; i < rawPayload.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawPayload.charCodeAt(i);
    hashVal |= 0;
  }
  const auditHash = `GME-E4-${Math.abs(hashVal).toString(16).toUpperCase().padStart(8, '0')}-2026-FCA`;

  return {
    dossierId: `CMS-2552-10-GME-${hospital.id.toUpperCase()}`,
    auditHash,
    timestamp,
    legalHeader: `CMS FORM 2552-10 GRADUATE MEDICAL EDUCATION AUDIT & REDETERMINATION BRIEF (42 CFR §§ 413.75 - 413.83 & 42 CFR § 412.105)`,
    worksheetE4Data: {
      'Line 1 - Unweighted Resident FTE Count': hospital.actualResidentFtes.toFixed(2),
      'Line 2 - Weighted Resident FTE Count (IRP @ 1.0, Fellows @ 0.5)': calc.weightedResidentFtes.toFixed(2),
      'Line 3 - Statutory BBA-1997 Direct GME Cap': hospital.bba1996DgmeCap.toFixed(2),
      'Line 4 - Section 126/127 CAA Awarded Slots': hospital.caaAwardedSlots.toFixed(2),
      'Line 5 - Allowable Capped DGME FTEs': calc.allowableDgmeFtes.toFixed(2),
      'Line 6 - Over-Cap Unfunded DGME FTEs': calc.overCapDgmeFtes.toFixed(2),
      'Line 7 - Hospital Specific Updated PRA': `$${hospital.blendedPra.toLocaleString()}`,
      'Line 8 - Medicare Patient Load (FFS + Part C MA Days / Total)': `${(calc.medicarePatientLoad * 100).toFixed(2)}%`,
      'Line 9 - Net Reimbursable Direct GME Payment': `$${Math.round(calc.totalDgmeReimbursement).toLocaleString()}`,
    },
    worksheetEPartAData: {
      'Line 26 - Available Inpatient Bed Count': hospital.inpatientBedCount,
      'Line 27 - Allowable IME Capped FTEs': calc.allowableImeFtes.toFixed(2),
      'Line 28 - Intern-and-Resident-to-Bed (IRB) Ratio': calc.internAndResidentToBedRatio.toFixed(4),
      'Line 29 - Operating IME Payment Factor (1.35 * [(1+r)^0.405 - 1])': `${(calc.operatingImeFactor * 100).toFixed(4)}%`,
      'Line 30 - Total Base Inpatient Operating DRG Revenue': `$${hospital.annualBaseIppsOperatingDrgRevenue.toLocaleString()}`,
      'Line 31 - Operating Indirect Medical Education (IME) Payment': `$${Math.round(calc.operatingImePayment).toLocaleString()}`,
      'Line 32 - Capital IME Factor (e^(0.2822 * r) - 1)': `${(calc.capitalImeFactor * 100).toFixed(4)}%`,
      'Line 33 - Capital IME Payment': `$${Math.round(calc.capitalImePayment).toLocaleString()}`,
      'Line 34 - Medicare Advantage Shadow Claim Timely Filing Recovery Target': `$${Math.round(calc.unbilledMaShadowLoss).toLocaleString()}`,
    },
    shadowClaimDefenseBrief: `LEGAL & STATUTORY SUBSTANTIATION FOR MEDICARE ADVANTAGE SHADOW CLAIMS:\n` +
      `Under Section 4624 of the Balanced Budget Act of 1997 and 42 CFR § 412.105(g), Medicare Part C (Advantage) inpatient discharges are entitled to full indirect medical education (IME) payments disbursed directly by CMS through the Medicare Administrative Contractor (MAC), independent of the commercial MA plan's DRG adjudication.\n` +
      `Teaching hospitals must submit informational claims (Type of Bill 111 with Condition Code 04 or Condition Code 69) within the 1-year timely filing window (Social Security Act § 1814(a)(1)).\n` +
      `This dossier substantiates $${Math.round(calc.unbilledMaShadowLoss).toLocaleString()} in unfiled shadow revenue currently subject to immediate retrospective recovery.`
  };
}
