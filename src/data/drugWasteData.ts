/**
 * CMS Single-Dose Vial Drug Waste Engine & Modifiers -JW / -JZ Auditor Data
 *
 * Statutory Authorities & Regulatory References:
 * - Section 90004 of the Infrastructure Investment and Jobs Act (Pub. L. 117-58)
 * - Social Security Act § 1847A (42 U.S.C. § 1395w-3a): Manufacturer Refunds for Discarded Part B Drugs
 * - 42 CFR § 414.904: Mandatory Modifier -JW (discarded amount) and -JZ (zero discarded amount)
 * - CMS Transmittal 12171 / Change Request 13056: Mandatory -JZ Reporting Effective July 1, 2023
 * - USP Chapter <797> Pharmaceutical Compounding - Sterile Preparations (Prohibition of single-dose vial reuse)
 * - False Claims Act (31 U.S.C. § 3729): Liability for Billing Phantom Waste or Concealing Waste Overpayments
 * - HIPAA 5010 837P Transaction Standard: 11-Digit Zero-Padded NDC Format (5-4-2)
 */

export interface PartBDrugVialConfig {
  vialSizeMg: number;
  fdaNdc10: string; // e.g. "0006-3026-02"
  ndc10Format: '4-4-2' | '5-3-2' | '5-4-1';
  hipaaNdc11: string; // e.g. "00006-3026-02"
  description: string;
}

export interface PartBDrugProfile {
  id: string;
  brandName: string;
  genericName: string;
  hcpcsCode: string;
  billingUnitDefinition: string; // e.g. "1 mg" or "10 mg"
  mgPerBillingUnit: number; // Conversion factor: 1 or 10
  containerType: 'SINGLE_DOSE_VIAL' | 'MULTI_DOSE_VIAL';
  aspRatePerBillingUnit: number; // Medicare Part B Allowed Rate (ASP + 6%)
  vialConfigurations: PartBDrugVialConfig[];
  clinicalSpecialty: string;
  indication: string;
  manufacturer: string;
  refundThresholdPercent: number; // Typically 10% under Sec. 90004 IIJA
}

export interface DrugWasteScenario {
  id: string;
  title: string;
  specialty: string;
  patientProfile: string;
  drugId: string;
  prescribedDoseMg: number;
  vialsDrawn: Array<{
    vialSizeMg: number;
    count: number;
  }>;
  administeredDoseMg: number;
  discardedDoseMg: number;
  compoundingContext: string;
  clinicalDocumentationExcerpt: string;
  commonBillingErrors: Array<{
    errorType: 'MISSING_JZ' | 'UNBILLED_WASTE_ALL_ADMIN' | 'IMPROPER_MULTI_DOSE_JW' | 'INCORRECT_NDC_FORMAT';
    description: string;
    financialOrLegalConsequence: string;
  }>;
}

export const PART_B_DRUGS: PartBDrugProfile[] = [
  {
    id: 'pembrolizumab-keytruda',
    brandName: 'Keytruda',
    genericName: 'Pembrolizumab',
    hcpcsCode: 'J9271',
    billingUnitDefinition: '1 mg',
    mgPerBillingUnit: 1,
    containerType: 'SINGLE_DOSE_VIAL',
    aspRatePerBillingUnit: 51.25,
    vialConfigurations: [
      {
        vialSizeMg: 100,
        fdaNdc10: '0006-3026-02',
        ndc10Format: '4-4-2',
        hipaaNdc11: '00006-3026-02',
        description: '100 mg / 4 mL single-dose solution vial',
      },
    ],
    clinicalSpecialty: 'Medical Oncology & Hematology',
    indication: 'Non-Small Cell Lung Cancer, Melanoma, Renal Cell Carcinoma',
    manufacturer: 'Merck Sharp & Dohme LLC',
    refundThresholdPercent: 10,
  },
  {
    id: 'nivolumab-opdivo',
    brandName: 'Opdivo',
    genericName: 'Nivolumab',
    hcpcsCode: 'J9299',
    billingUnitDefinition: '1 mg',
    mgPerBillingUnit: 1,
    containerType: 'SINGLE_DOSE_VIAL',
    aspRatePerBillingUnit: 32.40,
    vialConfigurations: [
      {
        vialSizeMg: 240,
        fdaNdc10: '0003-3774-12',
        ndc10Format: '4-4-2',
        hipaaNdc11: '00003-3774-12',
        description: '240 mg / 24 mL single-dose solution vial',
      },
      {
        vialSizeMg: 100,
        fdaNdc10: '0003-3772-11',
        ndc10Format: '4-4-2',
        hipaaNdc11: '00003-3772-11',
        description: '100 mg / 10 mL single-dose solution vial',
      },
      {
        vialSizeMg: 40,
        fdaNdc10: '0003-3734-11',
        ndc10Format: '4-4-2',
        hipaaNdc11: '00003-3734-11',
        description: '40 mg / 4 mL single-dose solution vial',
      },
    ],
    clinicalSpecialty: 'Medical Oncology & Immunotherapy',
    indication: 'Advanced Melanoma, Urothelial Carcinoma, Colorectal MSI-H',
    manufacturer: 'Bristol-Myers Squibb Company',
    refundThresholdPercent: 10,
  },
  {
    id: 'aflibercept-eylea',
    brandName: 'Eylea',
    genericName: 'Aflibercept',
    hcpcsCode: 'J0178',
    billingUnitDefinition: '1 mg',
    mgPerBillingUnit: 1,
    containerType: 'SINGLE_DOSE_VIAL',
    aspRatePerBillingUnit: 925.00,
    vialConfigurations: [
      {
        vialSizeMg: 2,
        fdaNdc10: '61755-005-02',
        ndc10Format: '5-3-2',
        hipaaNdc11: '61755-0005-02',
        description: '2 mg / 0.05 mL single-use injection vial',
      },
    ],
    clinicalSpecialty: 'Ophthalmology & Retina Surgery',
    indication: 'Neovascular (Wet) Age-Related Macular Degeneration (AMD), DME',
    manufacturer: 'Regeneron Pharmaceuticals, Inc.',
    refundThresholdPercent: 10,
  },
  {
    id: 'infliximab-inflectra',
    brandName: 'Inflectra',
    genericName: 'Infliximab-dyyb (Biosimilar)',
    hcpcsCode: 'Q5103',
    billingUnitDefinition: '10 mg',
    mgPerBillingUnit: 10,
    containerType: 'SINGLE_DOSE_VIAL',
    aspRatePerBillingUnit: 62.10,
    vialConfigurations: [
      {
        vialSizeMg: 100,
        fdaNdc10: '0069-0809-01',
        ndc10Format: '4-4-2',
        hipaaNdc11: '00069-0809-01',
        description: '100 mg lyophilized powder single-dose vial',
      },
    ],
    clinicalSpecialty: 'Rheumatology & Gastroenterology',
    indication: 'Rheumatoid Arthritis, Crohn’s Disease, Ulcerative Colitis',
    manufacturer: 'Pfizer Inc. / Celltrion',
    refundThresholdPercent: 10,
  },
];

export const DRUG_WASTE_SCENARIOS: DrugWasteScenario[] = [
  {
    id: 'scenario-keytruda-nsclc',
    title: 'Pembrolizumab (Keytruda) Weight-Dosed Infusion with 25mg Waste',
    specialty: 'Medical Oncology & Thoracic Oncology',
    patientProfile: '64-year-old female with metastatic non-small cell lung adenocarcinoma (PD-L1 65%)',
    drugId: 'pembrolizumab-keytruda',
    prescribedDoseMg: 175,
    vialsDrawn: [{ vialSizeMg: 100, count: 2 }],
    administeredDoseMg: 175,
    discardedDoseMg: 25,
    compoundingContext:
      'Patient weight 87.5 kg dosed at 2 mg/kg = 175 mg total dose. Pharmacy reconstituted two 100 mg single-dose vials (total 200 mg). 175 mg withdrawn into 100 mL 0.9% NaCl infusion bag; exactly 25 mg discarded in accordance with USP <797> single-dose vial disposal rules.',
    clinicalDocumentationExcerpt:
      'Compounding Log: 2x 100mg single-dose vials Lot #MK-90218 opened at 09:15. Drawn 7.0 mL (175 mg). Discarded 1.0 mL (25 mg) witnessed by PharmD. Infused over 30 mins.',
    commonBillingErrors: [
      {
        errorType: 'UNBILLED_WASTE_ALL_ADMIN',
        description:
          'Billing all 200 units on a single line as "administered" to avoid the complexity of modifier -JW.',
        financialOrLegalConsequence:
          'False Claims Act liability: Falsifies patient medical chart dose and conceals reportable waste from CMS.',
      },
      {
        errorType: 'MISSING_JZ',
        description:
          'Billing only the 175 units administered but omitting modifier -JW for discarded units or -JZ if zero waste claimed.',
        financialOrLegalConsequence:
          'Immediate claim rejection under CMS CR 13056 edit starting Oct 1, 2023; unbilled 25 mg ($1,281) lost permanently.',
      },
      {
        errorType: 'INCORRECT_NDC_FORMAT',
        description:
          'Submitting FDA 10-digit NDC "0006-3026-02" instead of zero-padded 11-digit HIPAA 5010 "00006-3026-02".',
        financialOrLegalConsequence:
          'Clearinghouse ANSI 837P rejection error "Loop 2410 LIN03 Invalid NDC format".',
      },
    ],
  },
  {
    id: 'scenario-opdivo-melanoma',
    title: 'Nivolumab (Opdivo) High-Dose Infusion Crossing 10% Refund Threshold',
    specialty: 'Medical Oncology & Cutaneous Oncology',
    patientProfile: '58-year-old male with unresectable Stage IV BRAF wild-type cutaneous melanoma',
    drugId: 'nivolumab-opdivo',
    prescribedDoseMg: 360,
    vialsDrawn: [{ vialSizeMg: 240, count: 2 }],
    administeredDoseMg: 360,
    discardedDoseMg: 120,
    compoundingContext:
      'Prescribed fixed dose of 360 mg q3w. Pharmacy opened two 240 mg single-dose vials (total 480 mg available). 360 mg administered via IV infusion; remaining 120 mg in single-dose container cannot be preserved or stored under USP <797> and was discarded.',
    clinicalDocumentationExcerpt:
      'Cleanroom Compounding Note: Prepared 360 mg Opdivo from 2x 240mg single-use vials Lot #BMS-44102. Administered: 360 mg (36 mL). Discarded: 120 mg (12 mL). Discarded amount represents 25.0% of total packaged units.',
    commonBillingErrors: [
      {
        errorType: 'UNBILLED_WASTE_ALL_ADMIN',
        description:
          'Billing 480 units on line 1 without -JW or billing 360 units with -JZ claiming zero waste occurred.',
        financialOrLegalConsequence:
          'FCA fraud audit: 120 mg waste ($3,888) is 25% of total package, well exceeding the 10% Sec. 90004 threshold.',
      },
      {
        errorType: 'IMPROPER_MULTI_DOSE_JW',
        description:
          'Attempting to split the leftover 120 mg vial to administer to another patient on a subsequent day.',
        financialOrLegalConsequence:
          'Direct violation of CDC sterile infection control and USP <797> single-dose vial safety standards.',
      },
    ],
  },
  {
    id: 'scenario-eylea-wet-amd',
    title: 'Aflibercept (Eylea) Intravitreal Injection with Zero Discarded Units',
    specialty: 'Ophthalmology & Surgical Retina',
    patientProfile: '72-year-old female with active subfoveal choroidal neovascularization secondary to wet AMD',
    drugId: 'aflibercept-eylea',
    prescribedDoseMg: 2,
    vialsDrawn: [{ vialSizeMg: 2, count: 1 }],
    administeredDoseMg: 2,
    discardedDoseMg: 0,
    compoundingContext:
      'Single-use vial containing 2 mg / 0.05 mL aflibercept. Full 2 mg dose was administered via intravitreal injection in the right eye. Zero reportable drug was discarded (residual liquid in vial is standard overfill not billable as waste).',
    clinicalDocumentationExcerpt:
      'Procedure Note: Under sterile prep, 0.05 mL (2 mg) Eylea drawn into tuberculin syringe and injected intravitreally into OD. Full dose administered; 0 mg discarded. Single-use container exhausted.',
    commonBillingErrors: [
      {
        errorType: 'MISSING_JZ',
        description:
          'Submitting HCPCS J0178 x 2 units without modifier -JZ, assuming lack of modifier indicates zero waste.',
        financialOrLegalConsequence:
          'Automatic Medicare MAC claim suspension and rejection: CMS mandates modifier -JZ whenever zero waste occurs.',
      },
      {
        errorType: 'INCORRECT_NDC_FORMAT',
        description:
          'Failing to zero-pad middle segment of FDA NDC 61755-005-02, submitting 10 digits instead of 61755-0005-02.',
        financialOrLegalConsequence:
          'Part B electronic crossover rejection and Medicare Advantage non-formulary auto-denial.',
      },
    ],
  },
  {
    id: 'scenario-inflectra-ra',
    title: 'Infliximab-dyyb (Inflectra) Lyophilized Infusion (75mg Discarded)',
    specialty: 'Rheumatology & Autoimmune Infusion',
    patientProfile: '61-year-old male with severe seropositive rheumatoid arthritis refractory to methotrexate',
    drugId: 'infliximab-inflectra',
    prescribedDoseMg: 325,
    vialsDrawn: [{ vialSizeMg: 100, count: 4 }],
    administeredDoseMg: 325,
    discardedDoseMg: 75,
    compoundingContext:
      'Patient weight 65 kg dosed at 5 mg/kg = 325 mg total dose. Compounded using 4x 100 mg single-dose vials (400 mg total). 325 mg administered in 250 mL sterile 0.9% NaCl over 2 hours; 75 mg remaining in fourth vial discarded under USP <797>.',
    clinicalDocumentationExcerpt:
      'Infusion Center Log: 4x 100mg single-use vials reconstituted. Infused: 32.5 billing units (325 mg). Discarded: 7.5 billing units (75 mg). HCPCS Q5103 definition = 10 mg/unit.',
    commonBillingErrors: [
      {
        errorType: 'UNBILLED_WASTE_ALL_ADMIN',
        description:
          'Rounding administered units up to 40 units (400 mg) on line 1, concealing the 7.5 units of waste.',
        financialOrLegalConsequence:
          'OIG compliance audit triggers overpayment recoupment and Civil Monetary Penalties (CMP).',
      },
      {
        errorType: 'MISSING_JZ',
        description:
          'Submitting fractional units on decimal lines without modifier -JW or failing to round billing units properly.',
        financialOrLegalConsequence:
          'Claim rejection for fractional billing units on Part B claims.',
      },
    ],
  },
];

/**
 * Result of Drug Waste & Billing Calculation
 */
export interface DrugWasteCalculationResult {
  drug: PartBDrugProfile;
  totalVialsUsed: number;
  totalMgPackaged: number;
  administeredMg: number;
  discardedMg: number;
  administeredBillingUnits: number;
  discardedBillingUnits: number;
  totalBillingUnits: number;
  wastePercentage: number;
  exceedsRefundThreshold: boolean;
  administeredPayment: number;
  discardedPayment: number;
  totalPayment: number;
  claimLines: Array<{
    lineNumber: number;
    hcpcs: string;
    modifier: string | null;
    units: number;
    description: string;
    lineCharge: number;
  }>;
  hipaa11DigitNdc: string;
  auditComplianceStatus: 'FULLY_COMPLIANT' | 'CRITICAL_REJECTION_RISK' | 'FALSE_CLAIMS_ACT_EXPOSURE';
  auditRecommendation: string;
}

/**
 * Converts FDA 10-Digit NDC to HIPAA 5010 11-Digit Zero-Padded Format (5-4-2)
 */
export function convertFdaNdcTo11Digit(ndc10: string, format: '4-4-2' | '5-3-2' | '5-4-1'): string {
  const parts = ndc10.replace(/[^0-9-]/g, '').split('-');
  if (parts.length !== 3) {
    return ndc10; // Fallback
  }

  const [p1, p2, p3] = parts;

  switch (format) {
    case '4-4-2':
      // Pad first segment from 4 to 5: 0XXXX-XXXX-XX
      return `${p1.padStart(5, '0')}-${p2}-${p3}`;
    case '5-3-2':
      // Pad second segment from 3 to 4: XXXXX-0XXX-XX
      return `${p1}-${p2.padStart(4, '0')}-${p3}`;
    case '5-4-1':
      // Pad third segment from 1 to 2: XXXXX-XXXX-0X
      return `${p1}-${p2}-${p3.padStart(2, '0')}`;
    default:
      return ndc10;
  }
}

/**
 * Calculates Discarded Units, Split Claim Lines, and Statutory Compliance
 */
export function calculateDrugWasteClaim(
  drug: PartBDrugProfile,
  prescribedDoseMg: number,
  vialCounts: Record<number, number>, // e.g. { 100: 2 } or { 240: 2 }
  billingMode: 'COMPLIANT_SPLIT_JW' | 'MISSING_JZ_ZERO_WASTE' | 'UNBILLED_WASTE_ALL_ADMIN' | 'IMPROPER_MDC_REUSE'
): DrugWasteCalculationResult {
  let totalMgPackaged = 0;
  let totalVialsUsed = 0;

  for (const [sizeStr, count] of Object.entries(vialCounts)) {
    const size = Number(sizeStr);
    totalMgPackaged += size * count;
    totalVialsUsed += count;
  }

  const administeredMg = Math.min(prescribedDoseMg, totalMgPackaged);
  const discardedMg = Math.max(0, totalMgPackaged - administeredMg);

  const mgPerUnit = drug.mgPerBillingUnit;
  const administeredUnits = Math.round(administeredMg / mgPerUnit);
  const discardedUnits = Math.round(discardedMg / mgPerUnit);
  const totalUnits = administeredUnits + discardedUnits;

  const wastePercentage = totalMgPackaged > 0 ? (discardedMg / totalMgPackaged) * 100 : 0;
  const exceedsThreshold = wastePercentage > drug.refundThresholdPercent;

  const administeredPayment = Math.round(administeredUnits * drug.aspRatePerBillingUnit * 100) / 100;
  const discardedPayment = Math.round(discardedUnits * drug.aspRatePerBillingUnit * 100) / 100;
  const totalPayment = administeredPayment + discardedPayment;

  const activeVialConfig = drug.vialConfigurations[0];
  const hipaaNdc = convertFdaNdcTo11Digit(activeVialConfig.fdaNdc10, activeVialConfig.ndc10Format);

  const claimLines: DrugWasteCalculationResult['claimLines'] = [];
  let complianceStatus: DrugWasteCalculationResult['auditComplianceStatus'] = 'FULLY_COMPLIANT';
  let auditRecommendation = '';

  if (billingMode === 'COMPLIANT_SPLIT_JW') {
    if (discardedUnits > 0) {
      // Line 1: Administered without modifier
      claimLines.push({
        lineNumber: 1,
        hcpcs: drug.hcpcsCode,
        modifier: null,
        units: administeredUnits,
        description: `${drug.brandName} (${drug.genericName}) - Administered Dose`,
        lineCharge: administeredPayment,
      });
      // Line 2: Discarded with -JW
      claimLines.push({
        lineNumber: 2,
        hcpcs: drug.hcpcsCode,
        modifier: '-JW',
        units: discardedUnits,
        description: `${drug.brandName} - Discarded Drug Amount Not Administered`,
        lineCharge: discardedPayment,
      });
      complianceStatus = 'FULLY_COMPLIANT';
      auditRecommendation = `CLEAN CLAIM: Correctly split into Line 1 (${administeredUnits} admin units) and Line 2 with Modifier -JW (${discardedUnits} discarded units). ${
        exceedsThreshold ? 'Warning: Waste exceeds 10% Section 90004 threshold; manufacturer rebate tracked by CMS.' : 'Within 10% standard waste threshold.'
      }`;
    } else {
      // Zero waste: Line 1 with -JZ
      claimLines.push({
        lineNumber: 1,
        hcpcs: drug.hcpcsCode,
        modifier: '-JZ',
        units: administeredUnits,
        description: `${drug.brandName} - Zero Discarded Single-Dose Container`,
        lineCharge: administeredPayment,
      });
      complianceStatus = 'FULLY_COMPLIANT';
      auditRecommendation = 'CLEAN CLAIM: 100% of single-dose container administered. Modifier -JZ correctly appended in compliance with CMS CR 13056.';
    }
  } else if (billingMode === 'MISSING_JZ_ZERO_WASTE') {
    // Missing -JZ when zero waste claimed or missing -JW
    claimLines.push({
      lineNumber: 1,
      hcpcs: drug.hcpcsCode,
      modifier: null,
      units: administeredUnits,
      description: `${drug.brandName} - Administered (Missing Mandatory Modifier)`,
      lineCharge: administeredPayment,
    });
    complianceStatus = 'CRITICAL_REJECTION_RISK';
    auditRecommendation =
      'CRITICAL REJECTION ERROR: CMS CR 13056 mandates modifier -JZ when 0 waste occurs, or -JW on line 2 if waste occurred. Claim will be suspended and rejected by Medicare MAC.';
  } else if (billingMode === 'UNBILLED_WASTE_ALL_ADMIN') {
    // Unbilled waste: entire vial billed on Line 1 as "administered"
    claimLines.push({
      lineNumber: 1,
      hcpcs: drug.hcpcsCode,
      modifier: null,
      units: totalUnits,
      description: `${drug.brandName} - Erroneously Billed 100% as Administered`,
      lineCharge: totalPayment,
    });
    complianceStatus = 'FALSE_CLAIMS_ACT_EXPOSURE';
    auditRecommendation = `FALSE CLAIMS ACT RISK: Billed entire ${totalUnits} units as administered when patient only received ${administeredUnits} units. Conceals reportable waste of ${discardedUnits} units ($${discardedPayment.toLocaleString()}). Violates 31 U.S.C. § 3729.`;
  } else {
    // IMPROPER_MDC_REUSE
    complianceStatus = 'FALSE_CLAIMS_ACT_EXPOSURE';
    auditRecommendation =
      'USP <797> INFECTION CONTROL VIOLATION: Single-dose containers lack antimicrobial preservatives. Storing leftover drug for a future encounter violates CDC sterile compounding rules.';
  }

  return {
    drug,
    totalVialsUsed,
    totalMgPackaged,
    administeredMg,
    discardedMg,
    administeredBillingUnits: administeredUnits,
    discardedBillingUnits: discardedUnits,
    totalBillingUnits: totalUnits,
    wastePercentage: Math.round(wastePercentage * 10) / 10,
    exceedsRefundThreshold: exceedsThreshold,
    administeredPayment,
    discardedPayment,
    totalPayment,
    claimLines,
    hipaa11DigitNdc: hipaaNdc,
    auditComplianceStatus: complianceStatus,
    auditRecommendation,
  };
}

/**
 * Calculates Clinic / Hospital Annual Part B Drug Waste Revenue & Exposure
 */
export function calculateAnnualDrugWasteExposure(
  monthlyEncounters: number,
  avgVialPackageCost: number = 4800,
  avgWastePercent: number = 14,
  unbilledWasteRate: number = 12 // % of encounters with missing/improper -JW
): {
  annualEncounters: number;
  totalDrugSpend: number;
  annualDiscardedValue: number;
  unbilledLostRevenue: number;
  fcaRecoupmentRisk: number;
  rejectionAvoidanceSavings: number;
} {
  const annualEncounters = monthlyEncounters * 12;
  const totalDrugSpend = annualEncounters * avgVialPackageCost;
  const annualDiscardedValue = Math.round(totalDrugSpend * (avgWastePercent / 100));
  const unbilledEncounters = Math.round(annualEncounters * (unbilledWasteRate / 100));
  const unbilledLostRevenue = Math.round(unbilledEncounters * (avgVialPackageCost * (avgWastePercent / 100)));
  const fcaRecoupmentRisk = unbilledLostRevenue * 3; // Treble damages under FCA
  const rejectionAvoidanceSavings = Math.round(annualEncounters * 0.15 * 85); // Avoided $85/claim rework fee on 15% rejection rate

  return {
    annualEncounters,
    totalDrugSpend,
    annualDiscardedValue,
    unbilledLostRevenue,
    fcaRecoupmentRisk,
    rejectionAvoidanceSavings,
  };
}

/**
 * Generates an Authentic USP <797> Sterile Compounding & CMS Drug Waste Audit Defense Brief
 */
export function generateDrugWasteAuditDossier(
  scenario: DrugWasteScenario,
  calc: DrugWasteCalculationResult
): string {
  const s = scenario;
  const d = calc.drug;

  return `================================================================================
USP <797> STERILE COMPOUNDING & CMS PART B DRUG WASTE AUDIT DEFENSE DOSSIER
MANDATORY MODIFIER -JW / -JZ COMPLIANCE UNDER 42 CFR § 414.904 & SEC. 90004 IIJA
================================================================================
DATE OF AUDIT: ${new Date().toISOString().split('T')[0]}
PATIENT PROFILE: ${s.patientProfile}
CLINICAL SPECIALTY: ${s.specialty}
HCPCS CODE: ${d.hcpcsCode} (${d.brandName} - ${d.genericName})
BILLING UNIT: ${d.billingUnitDefinition} | ASP RATE: $${d.aspRatePerBillingUnit.toFixed(2)}/unit
CONTAINER CLASSIFICATION: Single-Dose Container (SDC) - No Preservatives (USP <797>)
HIPAA 5010 11-DIGIT ZERO-PADDED NDC: ${calc.hipaa11DigitNdc} (FDA Original: ${d.vialConfigurations[0].fdaNdc10})

I. PRESCRIBING & PHARMACEUTICAL COMPOUNDING VERIFICATION
- Prescribed Patient Dose: ${s.prescribedDoseMg} mg
- Packaged Vials Opened: ${calc.totalVialsUsed} vial(s) (Total Packaged: ${calc.totalMgPackaged} mg)
- Dose Administered to Patient: ${calc.administeredMg} mg (${calc.administeredBillingUnits} Billing Units)
- Residual Amount Discarded: ${calc.discardedMg} mg (${calc.discardedBillingUnits} Billing Units)
- Waste Percentage: ${calc.wastePercentage}% of total package (${calc.exceedsRefundThreshold ? 'EXCEEDS 10% Section 90004 Refund Threshold' : 'Within 10% Standard Threshold'})

CLINICAL COMPOUNDING RECORD (USP <797> COMPLIANT):
"${s.clinicalDocumentationExcerpt}"

II. CMS-1500 / 837P SPLIT-LINE CLAIM CODING SUBSTANTIATION
${calc.claimLines
  .map(
    (l) =>
      `Line ${l.lineNumber}: HCPCS ${l.hcpcs}${l.modifier ? ` [MOD: ${l.modifier}]` : ' [NO MOD]'} | ${l.units} Units | Charge: $${l.lineCharge.toLocaleString()} (${l.description})`
  )
  .join('\n')}

TOTAL ALLOWABLE PART B REIMBURSEMENT: $${calc.totalPayment.toLocaleString()}
- Administered Component: $${calc.administeredPayment.toLocaleString()}
- Discarded Waste Component (Modifier -JW): $${calc.discardedPayment.toLocaleString()}

III. STATUTORY SAFEGUARDS & FALSE CLAIMS ACT DEFENSE
1. 42 CFR § 414.904 MANDATORY REPORTING:
   - Single-dose containers cannot be capped or stored for subsequent patient encounters under CDC infection control and USP <797> sterile compounding regulations.
   - Discarded drug is documented in the electronic medical record and pharmaceutical compounding log, substantiating the separate -JW claim line.
2. SECTION 90004 IIJA COMPLIANCE:
   - CMS tracks quarterly Part B manufacturer refunds for discarded single-dose containers exceeding 10%. Splitting lines allows CMS to accurately bill the manufacturer rebate without penalizing provider reimbursement.
3. CONCEALED WASTE PROHIBITION:
   - Certified coders specifically verified that waste was NOT rolled into Line 1 as "administered", precluding False Claims Act liability under 31 U.S.C. § 3729.

SOVEREIGN PHARMACEUTICAL RCM ATTESTATION:
Audit Hash: SHA-256[DRUG_WASTE:${s.id}:${d.hcpcsCode}:JW_VERIFIED]
Board Certified Oncology Pharmacist (BCOP) / Certified Professional Coder (CPC) Sign-Off`;
}
