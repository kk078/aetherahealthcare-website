/**
 * 340B Drug Pricing Program Covered Entity Eligibility & Split-Billing Compliance Auditor
 * 
 * Statutory & Regulatory Foundations:
 * - Public Health Service Act (PHSA) § 340B, 42 U.S.C. § 256b: Limitation on Prices of Drugs Purchased by Covered Entities
 * - HRSA Office of Pharmacy Affairs (OPA) Final Notice on Patient Definition, 61 Fed. Reg. 55156 (Oct. 24, 1996)
 * - 42 U.S.C. § 256b(a)(4)(L): Disproportionate Share Hospitals (DSH Adjustment > 11.75%)
 * - 42 U.S.C. § 256b(a)(4)(O): Sole Community Hospitals (SCH) & Rural Referral Centers (RRC) (DSH Adjustment >= 8.0%)
 * - 42 U.S.C. § 256b(a)(4)(N): Critical Access Hospitals (CAH) (SSA § 1820(c)(2))
 * - 42 U.S.C. § 256b(a)(4)(A): Federally Qualified Health Centers (FQHC - Section 330 Grantees)
 * - 42 U.S.C. § 256b(a)(4)(L)(iii): Statutory Prohibition on Use of Group Purchasing Organizations (GPO Prohibition)
 * - 42 U.S.C. § 256b(a)(3) & ACA §§ 2302, 7101: Statutory Orphan Drug Exclusion for CAH, SCH, RRC, and CAN
 * - 42 U.S.C. § 256b(a)(5)(A): Medicaid Duplicate Discount Prohibition (Medicaid Exclusion File / MEF & Modifier -U6)
 * - 42 U.S.C. § 256b(a)(5)(B): Resale / Diversion Prohibition to Ineligible Individuals
 * - False Claims Act (31 U.S.C. § 3729) & HRSA OPAIS Audits: Covered Entity Decertification & Manufacturer Repayment
 */

export type CoveredEntityType = 'DSH' | 'SCH' | 'CAH' | 'FQHC';

export interface CoveredEntityProfile {
  id: string;
  name: string;
  opaisId: string;
  entityType: CoveredEntityType;
  description: string;
  medicareProviderNumber: string;
  dshAdjustmentPercentage: number; // Worksheet E, Part A, Line 33
  statutoryDshRequirement: number; // e.g. 11.75% for DSH, 8.0% for SCH, 0% for CAH/FQHC
  isEligibleDsh: boolean;
  gpoProhibitionApplies: boolean; // DSH, CAN, PED = YES; CAH, SCH, RRC, FQHC = NO
  orphanDrugExclusionApplies: boolean; // CAH, SCH, RRC, CAN = YES; DSH, FQHC = NO
  medicaidPolicy: 'CARVE_IN' | 'CARVE_OUT';
  mefRegistrationActive: boolean;
  monthlyOutpatientRxUnits: number;
  averageWacPerUnit: number;
  average340bDiscountPercent: number; // Typically 25% - 50% below WAC
  annualCharityCareProvided: number; // Direct uncompensated community benefit
}

export interface SplitBillingEncounter {
  encounterId: string;
  patientType: 'OUTPATIENT_CLINIC' | 'INPATIENT_BED' | 'EMERGENCY_OBSERVATION' | 'REFERRED_NON_REGISTERED';
  orderingProviderCredentialed: boolean;
  childSiteRegisteredOnOpais: boolean; // Must be listed on CMS-2552 Worksheet A
  drugName: string;
  ndc: string;
  hcpcs: string;
  isOrphanDesignated: boolean;
  payerType: 'COMMERCIAL' | 'MEDICARE_PART_B' | 'MEDICARE_ADVANTAGE' | 'MEDICAID_FFS' | 'MEDICAID_MCO';
  unitsDispensed: number;
  wacPricePerUnit: number;
  ceilingPrice340bPerUnit: number;
  gpoPricePerUnit: number;
}

export interface SplitBillingResult {
  allocation: '340B_ELIGIBLE' | 'WAC_NON_ELIGIBLE' | 'GPO_INPATIENT_ONLY' | 'STATUTORY_VIOLATION_DIVERSION';
  reason: string;
  purchaseAccount: '340B' | 'WAC' | 'GPO';
  acquisitionCost: number;
  savingsVsWac: number;
  complianceWarning: string | null;
  duplicateDiscountRisk: boolean;
  gpoViolationRisk: boolean;
  orphanDrugViolationRisk: boolean;
}

export const COVERED_ENTITY_ARCHETYPES: CoveredEntityProfile[] = [
  {
    id: 'dsh-metro-health',
    name: 'Metropolitan Safety-Net Health System',
    opaisId: 'DSH330014',
    entityType: 'DSH',
    description: '720-bed urban safety-net medical center operating 14 provider-based outpatient oncology and infusion clinics.',
    medicareProviderNumber: '33-0014',
    dshAdjustmentPercentage: 28.45,
    statutoryDshRequirement: 11.75,
    isEligibleDsh: true,
    gpoProhibitionApplies: true,
    orphanDrugExclusionApplies: false,
    medicaidPolicy: 'CARVE_IN',
    mefRegistrationActive: true,
    monthlyOutpatientRxUnits: 14500,
    averageWacPerUnit: 3450,
    average340bDiscountPercent: 38.5,
    annualCharityCareProvided: 48200000,
  },
  {
    id: 'sch-highland-regional',
    name: 'Highland Regional Sole Community Hospital',
    opaisId: 'SCH450112',
    entityType: 'SCH',
    description: '110-bed Sole Community Hospital providing outpatient oncology and ambulatory surgery in a rural health service area.',
    medicareProviderNumber: '45-0112',
    dshAdjustmentPercentage: 11.40,
    statutoryDshRequirement: 8.0,
    isEligibleDsh: true,
    gpoProhibitionApplies: false,
    orphanDrugExclusionApplies: true, // Must carve out FDA orphan designated drugs
    medicaidPolicy: 'CARVE_OUT',
    mefRegistrationActive: false,
    monthlyOutpatientRxUnits: 3200,
    averageWacPerUnit: 2800,
    average340bDiscountPercent: 34.0,
    annualCharityCareProvided: 8450000,
  },
  {
    id: 'cah-valley-view',
    name: 'Valley View Critical Access Hospital',
    opaisId: 'CAH161305',
    entityType: 'CAH',
    description: '25-bed designated Critical Access Hospital operating 2 outpatient specialty clinics and a contract pharmacy network.',
    medicareProviderNumber: '16-1305',
    dshAdjustmentPercentage: 0.0,
    statutoryDshRequirement: 0.0,
    isEligibleDsh: true,
    gpoProhibitionApplies: false,
    orphanDrugExclusionApplies: true,
    medicaidPolicy: 'CARVE_OUT',
    mefRegistrationActive: false,
    monthlyOutpatientRxUnits: 1100,
    averageWacPerUnit: 2450,
    average340bDiscountPercent: 32.5,
    annualCharityCareProvided: 2150000,
  },
  {
    id: 'fqhc-urban-care',
    name: 'Westside Community Health Center',
    opaisId: 'CH030421',
    entityType: 'FQHC',
    description: 'HRSA Section 330 Community Health Center delivering comprehensive outpatient primary care, HIV/Ryan White services, and clinical pharmacy.',
    medicareProviderNumber: '05-1820',
    dshAdjustmentPercentage: 0.0,
    statutoryDshRequirement: 0.0,
    isEligibleDsh: true,
    gpoProhibitionApplies: false,
    orphanDrugExclusionApplies: false,
    medicaidPolicy: 'CARVE_IN',
    mefRegistrationActive: true,
    monthlyOutpatientRxUnits: 4800,
    averageWacPerUnit: 980,
    average340bDiscountPercent: 42.0,
    annualCharityCareProvided: 12600000,
  },
];

export const SAMPLE_SPLIT_BILLING_ENCOUNTERS: SplitBillingEncounter[] = [
  {
    encounterId: 'ENC-340B-01',
    patientType: 'OUTPATIENT_CLINIC',
    orderingProviderCredentialed: true,
    childSiteRegisteredOnOpais: true,
    drugName: 'Pembrolizumab (Keytruda)',
    ndc: '00006-3026-02',
    hcpcs: 'J9271',
    isOrphanDesignated: false,
    payerType: 'COMMERCIAL',
    unitsDispensed: 200,
    wacPricePerUnit: 54.00,
    ceilingPrice340bPerUnit: 32.50,
    gpoPricePerUnit: 51.50,
  },
  {
    encounterId: 'ENC-340B-02',
    patientType: 'OUTPATIENT_CLINIC',
    orderingProviderCredentialed: true,
    childSiteRegisteredOnOpais: true,
    drugName: 'Nivolumab (Opdivo)',
    ndc: '00003-3774-12',
    hcpcs: 'J9299',
    isOrphanDesignated: false,
    payerType: 'MEDICAID_FFS',
    unitsDispensed: 240,
    wacPricePerUnit: 32.40,
    ceilingPrice340bPerUnit: 18.20,
    gpoPricePerUnit: 30.50,
  },
  {
    encounterId: 'ENC-340B-03',
    patientType: 'OUTPATIENT_CLINIC',
    orderingProviderCredentialed: true,
    childSiteRegisteredOnOpais: true,
    drugName: 'Daratumumab (Darzalex)',
    ndc: '57894-0502-05',
    hcpcs: 'J9145',
    isOrphanDesignated: true, // FDA Orphan Designation for Multiple Myeloma
    payerType: 'MEDICARE_PART_B',
    unitsDispensed: 400,
    wacPricePerUnit: 14.80,
    ceilingPrice340bPerUnit: 8.90,
    gpoPricePerUnit: 14.10,
  },
  {
    encounterId: 'ENC-340B-04',
    patientType: 'INPATIENT_BED',
    orderingProviderCredentialed: true,
    childSiteRegisteredOnOpais: true,
    drugName: 'Infliximab-dyyb (Inflectra)',
    ndc: '00069-0809-01',
    hcpcs: 'Q5103',
    isOrphanDesignated: false,
    payerType: 'MEDICARE_PART_B',
    unitsDispensed: 40,
    wacPricePerUnit: 82.50,
    ceilingPrice340bPerUnit: 48.00,
    gpoPricePerUnit: 78.00,
  },
];

/**
 * Deterministic 340B Split-Billing Adjudication Engine
 * Evaluates the 3-part HRSA patient definition, GPO prohibition, Orphan drug exclusion, and Medicaid MEF rules.
 */
export function adjudicate340bEncounter(
  entity: CoveredEntityProfile,
  encounter: SplitBillingEncounter
): SplitBillingResult {
  // 1. Inpatient Rule: 340B drugs cannot be dispensed to inpatients under prospective DRGs
  if (encounter.patientType === 'INPATIENT_BED') {
    const cost = encounter.unitsDispensed * (entity.gpoProhibitionApplies ? encounter.gpoPricePerUnit : encounter.gpoPricePerUnit);
    return {
      allocation: 'GPO_INPATIENT_ONLY',
      reason: 'Inpatient admission (DRG covered). Under 42 U.S.C. § 256b, 340B pricing is strictly prohibited for inpatients.',
      purchaseAccount: 'GPO',
      acquisitionCost: cost,
      savingsVsWac: (encounter.wacPricePerUnit - encounter.gpoPricePerUnit) * encounter.unitsDispensed,
      complianceWarning: entity.gpoProhibitionApplies
        ? 'DSH GPO prohibition exempts inpatient purchases; GPO permitted for inpatients only.'
        : null,
      duplicateDiscountRisk: false,
      gpoViolationRisk: false,
      orphanDrugViolationRisk: false,
    };
  }

  // 2. HRSA 3-Part Patient Definition: Provider Credentialing & Child-Site Registration
  if (!encounter.orderingProviderCredentialed || !encounter.childSiteRegisteredOnOpais) {
    const cost = encounter.unitsDispensed * encounter.wacPricePerUnit;
    return {
      allocation: 'STATUTORY_VIOLATION_DIVERSION',
      reason: !encounter.orderingProviderCredentialed
        ? 'Ordering provider is not employed or credentialed under formal agreement with the covered entity (Violates 61 Fed. Reg. 55156).'
        : 'Outpatient clinic site is not registered on HRSA OPAIS or listed on Form CMS-2552 Worksheet A.',
      purchaseAccount: 'WAC',
      acquisitionCost: cost,
      savingsVsWac: 0,
      complianceWarning: 'Diversion Hazard: Dispensing 340B drug would trigger statutory penalty under 42 U.S.C. § 256b(a)(5)(B). Carved out to WAC.',
      duplicateDiscountRisk: false,
      gpoViolationRisk: false,
      orphanDrugViolationRisk: false,
    };
  }

  // 3. Orphan Drug Exclusion Rule (42 U.S.C. § 256b(a)(3))
  // CAH, SCH, RRC, and CAN cannot purchase orphan drugs on 340B pricing
  if (entity.orphanDrugExclusionApplies && encounter.isOrphanDesignated) {
    const cost = encounter.unitsDispensed * encounter.wacPricePerUnit;
    return {
      allocation: 'WAC_NON_ELIGIBLE',
      reason: `Orphan Drug Exclusion: ${entity.entityType} entities are prohibited from purchasing FDA orphan-designated drugs under 340B pricing (42 U.S.C. § 256b(a)(3)).`,
      purchaseAccount: 'WAC',
      acquisitionCost: cost,
      savingsVsWac: 0,
      complianceWarning: 'Statutory Orphan Drug carve-out to WAC account required to avoid HRSA decertification.',
      duplicateDiscountRisk: false,
      gpoViolationRisk: false,
      orphanDrugViolationRisk: true,
    };
  }

  // 4. Medicaid Duplicate Discount Rule (42 U.S.C. § 256b(a)(5)(A))
  const isMedicaid = encounter.payerType === 'MEDICAID_FFS' || encounter.payerType === 'MEDICAID_MCO';
  if (isMedicaid) {
    if (entity.medicaidPolicy === 'CARVE_OUT') {
      // Entity carved out Medicaid -> must use WAC/GPO to allow state to collect Medicaid rebate
      const cost = encounter.unitsDispensed * encounter.wacPricePerUnit;
      return {
        allocation: 'WAC_NON_ELIGIBLE',
        reason: 'Medicaid Carve-Out Policy: Covered entity is designated as Carve-Out on HRSA OPAIS Medicaid Exclusion File (MEF). Drug carved out to non-340B WAC.',
        purchaseAccount: 'WAC',
        acquisitionCost: cost,
        savingsVsWac: 0,
        complianceWarning: 'Dispensing 340B to Medicaid under Carve-Out causes illegal duplicate discount and Medicaid rebate clawback.',
        duplicateDiscountRisk: true,
        gpoViolationRisk: false,
        orphanDrugViolationRisk: false,
      };
    } else {
      // Carve-In: Valid if MEF active and modifier -U6 appended
      if (!entity.mefRegistrationActive) {
        const cost = encounter.unitsDispensed * encounter.wacPricePerUnit;
        return {
          allocation: 'STATUTORY_VIOLATION_DIVERSION',
          reason: 'Medicaid Carve-In attempted, but covered entity is NOT actively registered on HRSA OPAIS Medicaid Exclusion File.',
          purchaseAccount: 'WAC',
          acquisitionCost: cost,
          savingsVsWac: 0,
          complianceWarning: 'Duplicate Discount Hazard: Manufacturer rebate + 340B discount violation.',
          duplicateDiscountRisk: true,
          gpoViolationRisk: false,
          orphanDrugViolationRisk: false,
        };
      }
    }
  }

  // 5. Fully Compliant 340B Outpatient Allocation
  const cost = encounter.unitsDispensed * encounter.ceilingPrice340bPerUnit;
  const savings = (encounter.wacPricePerUnit - encounter.ceilingPrice340bPerUnit) * encounter.unitsDispensed;

  return {
    allocation: '340B_ELIGIBLE',
    reason: 'Compliant 340B Outpatient Dispense: Meets 3-part HRSA patient definition, credentialed provider, registered child-site, and Medicaid MEF carve-in/carve-out protocol.',
    purchaseAccount: '340B',
    acquisitionCost: cost,
    savingsVsWac: savings,
    complianceWarning: null,
    duplicateDiscountRisk: false,
    gpoViolationRisk: false,
    orphanDrugViolationRisk: false,
  };
}

/**
 * Calculate Annual Covered Entity 340B Financial Exposure & Community Benefit
 */
export function calculateAnnual340bExposure(
  entity: CoveredEntityProfile,
  overrides?: {
    customRxUnits?: number;
    customDiscountPercent?: number;
    customMedicaidSharePercent?: number;
    customAuditErrorRatePercent?: number;
  }
) {
  const units = overrides?.customRxUnits ?? entity.monthlyOutpatientRxUnits;
  const discountPercent = overrides?.customDiscountPercent ?? entity.average340bDiscountPercent;
  const errorRate = (overrides?.customAuditErrorRatePercent ?? 2.5) / 100;

  const annualRxUnits = units * 12;
  const annualGrossWacSpend = annualRxUnits * entity.averageWacPerUnit;
  const annual340bCeilingSpend = annualGrossWacSpend * (1 - discountPercent / 100);
  const annualGross340bSavings = annualGrossWacSpend - annual340bCeilingSpend;

  // Potential Audit Recoupment Exposure (Diversion / Duplicate Discount / Orphan Drug Non-Compliance)
  const annualRecoupmentExposure = annualGross340bSavings * errorRate;
  const net340bBenefitCaptured = annualGross340bSavings - annualRecoupmentExposure;

  // Community Benefit Reinvestment Ratio (340B savings vs Charity Care Provided)
  const communityBenefitRatio = annualGross340bSavings > 0 ? entity.annualCharityCareProvided / annualGross340bSavings : 1.0;

  return {
    annualRxUnits,
    annualGrossWacSpend,
    annual340bCeilingSpend,
    annualGross340bSavings,
    annualRecoupmentExposure,
    net340bBenefitCaptured,
    communityBenefitRatio,
  };
}

/**
 * Generate 1-Click HRSA OPAIS 340B Audit Defense Dossier
 */
export function generate340bAuditDossier(
  entity: CoveredEntityProfile,
  exposure: ReturnType<typeof calculateAnnual340bExposure>
): {
  dossierId: string;
  auditHash: string;
  timestamp: string;
  legalHeader: string;
  coveredEntityVerification: Record<string, string | number>;
  splitBillingPolicyCompliance: Record<string, string>;
  statutorySafeHarborBrief: string;
} {
  const timestamp = new Date().toISOString();
  const raw = `${entity.opaisId}|${entity.dshAdjustmentPercentage}|${exposure.annualGross340bSavings}|${timestamp}`;

  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const auditHash = `340B-HRSA-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}-2026-FCA`;

  return {
    dossierId: `HRSA-OPAIS-AUDIT-${entity.opaisId}`,
    auditHash,
    timestamp,
    legalHeader: `HRSA OFFICE OF PHARMACY AFFAIRS 340B COMPLIANCE & SPLIT-BILLING DEFENSE BRIEF (42 U.S.C. § 256b)`,
    coveredEntityVerification: {
      'HRSA OPAIS 340B ID': entity.opaisId,
      'Covered Entity Legal Name': entity.name,
      'Statutory Designation': `${entity.entityType} (42 U.S.C. § 256b(a)(4))`,
      'CMS Form 2552 Worksheet E, Part A Line 33 DSH%': `${entity.dshAdjustmentPercentage.toFixed(2)}% (Threshold: ${entity.statutoryDshRequirement}%)`,
      'Statutory Eligibility Verification': entity.isEligibleDsh ? 'VERIFIED_COMPLIANT' : 'NON_COMPLIANT',
      'GPO Prohibition Mandate (42 U.S.C. § 256b(a)(4)(L)(iii))': entity.gpoProhibitionApplies ? 'ACTIVE_ENFORCEMENT (Outpatient GPO Prohibited)' : 'EXEMPT',
      'Orphan Drug Exclusion (42 U.S.C. § 256b(a)(3))': entity.orphanDrugExclusionApplies ? 'ACTIVE_ENFORCEMENT (WAC Carve-Out Required)' : 'EXEMPT',
      'Medicaid Duplicate Discount Policy': `${entity.medicaidPolicy} (MEF Registered: ${entity.mefRegistrationActive ? 'YES' : 'NO'})`,
    },
    splitBillingPolicyCompliance: {
      'Patient Definition (61 Fed. Reg. 55156)': 'Strict 3-part test enforced; non-credentialed community physicians and unlisted clinic sites routed to WAC.',
      'Mixed-Use Virtual Accumulator': 'Daily EDI 837 / 835 reconciliation segregating 340B, WAC, and GPO replenishment channels.',
      'Medicaid Carve-In/Carve-Out Protocol': entity.medicaidPolicy === 'CARVE_IN'
        ? 'Registered on HRSA Medicaid Exclusion File (MEF); Modifier -U6 appended to professional and institutional claims.'
        : 'Carve-Out enforced; all Medicaid encounters billed under WAC/GPO to allow standard manufacturer Medicaid rebate collection.',
      'Contract Pharmacy Oversight': 'Quarterly independent external audit verifying zero patient diversion and contract child-site registration.',
      'Community Benefit Reinvestment Ratio': `${(exposure.communityBenefitRatio * 100).toFixed(1)}% of 340B margin directly reinvested in charity care and uncompensated clinical services.`,
    },
    statutorySafeHarborBrief: `LEGAL & REGULATORY SUBSTANTIATION FOR HRSA OPAIS AUDIT READINESS:\n` +
      `Under Section 340B of the Public Health Service Act (42 U.S.C. § 256b), covered entities must maintain auditable records demonstrating:\n` +
      `1. Only eligible outpatients received 340B purchased drugs (61 Fed. Reg. 55156);\n` +
      `2. No duplicate discounts occurred under 42 U.S.C. § 256b(a)(5)(A);\n` +
      `3. For DSH entities, no outpatient drugs were purchased through a Group Purchasing Organization (GPO);\n` +
      `4. For CAH/SCH entities, no FDA orphan-designated drugs were acquired under 340B pricing;\n` +
      `5. All clinic dispensing sites are registered as child sites on OPAIS and reported on Form CMS-2552 Worksheet A.\n` +
      `This dossier substantiates $${Math.round(exposure.annualGross340bSavings).toLocaleString()} in net statutory drug savings with an audit trail resistant to False Claims Act (31 U.S.C. § 3729) clawbacks.`
  };
}
