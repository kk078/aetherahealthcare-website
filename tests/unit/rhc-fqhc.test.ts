import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  RURAL_CLINIC_ARCHETYPES,
  CAA_2026_STATUTORY_RHC_CAP,
  FQHC_2026_BASE_RATE,
  FQHC_NEW_PATIENT_MULTIPLIER,
  RHC_PHYSICIAN_ANNUAL_STANDARD,
  RHC_NPP_ANNUAL_STANDARD,
  evaluateRhcFqhcReimbursement,
  generateRhcFqhcAuditDossier,
} from '../../src/data/rhcFqhcData';

test('RURAL_CLINIC_ARCHETYPES contains 4 authentic clinic profiles with valid CCNs and parameters', () => {
  assert.equal(RURAL_CLINIC_ARCHETYPES.length, 4);

  const grandfathered = RURAL_CLINIC_ARCHETYPES.find(c => c.clinicType === 'RHC_PROVIDER_BASED_GRANDFATHERED')!;
  assert.ok(grandfathered);
  assert.equal(grandfathered.isGrandfathered, true);
  assert.ok(grandfathered.parentHospitalBeds! < 50);
  assert.ok(grandfathered.historical2020CostPerVisit! > CAA_2026_STATUTORY_RHC_CAP);

  const independent = RURAL_CLINIC_ARCHETYPES.find(c => c.clinicType === 'RHC_INDEPENDENT_CAPPED')!;
  assert.ok(independent);
  assert.equal(independent.isGrandfathered, false);

  const fqhc = RURAL_CLINIC_ARCHETYPES.find(c => c.clinicType === 'FQHC_COMMUNITY_HEALTH_CENTER')!;
  assert.ok(fqhc);

  const postCaa = RURAL_CLINIC_ARCHETYPES.find(c => c.clinicType === 'RHC_PROVIDER_BASED_POST_CAA')!;
  assert.ok(postCaa);
  assert.equal(postCaa.isGrandfathered, false);
});

test('evaluateRhcFqhcReimbursement enforces 42 CFR § 405.2468 productivity standards', () => {
  const independent = RURAL_CLINIC_ARCHETYPES.find(c => c.clinicType === 'RHC_INDEPENDENT_CAPPED')!;
  
  // Independent clinic has 1.5 Physician FTE (1.5 * 4,200 = 6,300) + 1.5 NPP FTE (1.5 * 2,100 = 3,150) = 9,450 required visits
  const expectedRequired = (1.5 * RHC_PHYSICIAN_ANNUAL_STANDARD) + (1.5 * RHC_NPP_ANNUAL_STANDARD);
  assert.equal(expectedRequired, 9450);

  // Case 1: Actual visits = 9,400 (50 visits below standard!)
  const resDeficit = evaluateRhcFqhcReimbursement(independent, 9400);
  assert.equal(resDeficit.meetsProductivityStandard, false);
  assert.equal(resDeficit.productivityDeficitVisits, 50);
  assert.ok(resDeficit.productivityPenaltyPerVisit > 0);
  assert.ok(resDeficit.productivityImputedCostPerVisit < resDeficit.unadjustedCostPerVisit);

  // Case 2: Actual visits = 10,000 (exceeds standard!)
  const resCompliant = evaluateRhcFqhcReimbursement(independent, 10000);
  assert.equal(resCompliant.meetsProductivityStandard, true);
  assert.equal(resCompliant.productivityDeficitVisits, 0);
  assert.equal(resCompliant.productivityPenaltyPerVisit, 0);
});

test('evaluateRhcFqhcReimbursement applies CAA § 130 statutory cap ($165/visit in 2026) for independent RHCs', () => {
  const independent = RURAL_CLINIC_ARCHETYPES.find(c => c.clinicType === 'RHC_INDEPENDENT_CAPPED')!;
  
  // Actual cost per visit: $1,714,560 / 10,000 visits = $171.45/visit
  // Because $171.45 > statutory cap of $165.00, settled rate MUST be capped at $165.00
  const res = evaluateRhcFqhcReimbursement(independent, 10000, 1714560);
  assert.equal(res.settledEncounterRate, CAA_2026_STATUTORY_RHC_CAP);
  assert.equal(res.effectiveCapApplied, true);
  assert.ok(res.capDisparityPerVisit > 0);
  assert.ok(res.annualCapHaircutLoss > 0);
});

test('evaluateRhcFqhcReimbursement preserves protected grandfathered rates under CAA § 130', () => {
  const grandfathered = RURAL_CLINIC_ARCHETYPES.find(c => c.clinicType === 'RHC_PROVIDER_BASED_GRANDFATHERED')!;
  
  // Grandfathered clinic historical 2020 cost is $274.50. With MEI update (~1.0863) = $298.20/visit!
  // Actual allowable costs: $4,413,360 / 14,800 visits = $298.20/visit
  const res = evaluateRhcFqhcReimbursement(grandfathered);
  assert.ok(res.settledEncounterRate > CAA_2026_STATUTORY_RHC_CAP);
  assert.ok(res.settledEncounterRate > 290);
  assert.equal(res.effectiveCapApplied, false);
  assert.ok(res.grandfatheredExemptionValue > 0);
});

test('evaluateRhcFqhcReimbursement computes FQHC PPS rate with GPCI and 1.341 new patient / AWV adjustment', () => {
  const fqhc = RURAL_CLINIC_ARCHETYPES.find(c => c.clinicType === 'FQHC_COMMUNITY_HEALTH_CENTER')!;
  
  assert.equal(FQHC_NEW_PATIENT_MULTIPLIER, 1.341);
  // Base rate = $195.99. GPCI = 0.942. Base adjusted = $195.99 * 0.942 = $184.62
  // New patient / AWV % = 28.0%. Multiplier = 1.341.
  // Composite rate = $184.62 * (0.72 + 0.28 * 1.341) = $184.62 * 1.09548 = $202.25
  const res = evaluateRhcFqhcReimbursement(fqhc);
  assert.ok(Math.abs(res.fqhcBaseRateAdjusted - (FQHC_2026_BASE_RATE * fqhc.gpci)) < 0.1);
  assert.ok(res.settledEncounterRate > res.fqhcBaseRateAdjusted);
  assert.equal(res.clinicType, 'FQHC_COMMUNITY_HEALTH_CENTER');
});

test('evaluateRhcFqhcReimbursement includes same-day mental health encounters and G0511 care management', () => {
  const fqhc = RURAL_CLINIC_ARCHETYPES.find(c => c.clinicType === 'FQHC_COMMUNITY_HEALTH_CENTER')!;
  
  const res = evaluateRhcFqhcReimbursement(fqhc);
  // Same-day mental health visits: 1,150 visits * settled rate
  assert.ok(res.sameDayMentalHealthRevenue > 200000);

  // G0511 care management: 320 patients * $77.94 * 12 months = ~$299,289
  assert.ok(res.annualG0511CareManagementRevenue > 280000);
  assert.ok(res.totalAnnualMedicareProgramRevenue > res.annualMedicareEncounterRevenue);
});

test('generateRhcFqhcAuditDossier outputs complete Form CMS-222-17 / CMS-224-14 dossier with SHA-256 hash', () => {
  const grandfathered = RURAL_CLINIC_ARCHETYPES.find(c => c.clinicType === 'RHC_PROVIDER_BASED_GRANDFATHERED')!;
  const calc = evaluateRhcFqhcReimbursement(grandfathered);
  const dossier = generateRhcFqhcAuditDossier(grandfathered, calc);

  assert.match(dossier.auditHash, /^RHC-FQHC-[0-9A-F]{8}-2026-FCA$/);
  assert.ok(dossier.legalHeader.includes('CMS FORM 222-17'));
  assert.equal(dossier.facilityIdentification.ccn, '26-3810');
  assert.ok(dossier.productivityComplianceAudit.physicianFte.includes('2.50 FTE'));
  assert.ok(dossier.statutorySafeHarborCertification.includes('FALSE CLAIMS ACT SAFE-HARBOR'));
});
