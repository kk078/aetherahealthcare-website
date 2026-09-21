import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TEACHING_HOSPITAL_ARCHETYPES,
  calculateGmeImeReimbursement,
  generateGmeAuditDossier,
} from '../../src/data/gmeImeData';

test('TEACHING_HOSPITAL_ARCHETYPES contains authentic hospital profiles', () => {
  assert.equal(TEACHING_HOSPITAL_ARCHETYPES.length, 4);
  for (const hospital of TEACHING_HOSPITAL_ARCHETYPES) {
    assert.ok(hospital.id, 'Hospital must have an id');
    assert.ok(hospital.inpatientBedCount > 0, 'Must have inpatient beds');
    assert.ok(hospital.bba1996DgmeCap > 0, 'Must have BBA-97 DGME cap');
    assert.ok(hospital.bba1996ImeCap > 0, 'Must have BBA-97 IME cap');
    assert.ok(hospital.blendedPra > 100000, 'PRA must be realistic (> $100k)');
    assert.ok(hospital.totalInpatientDays > 0, 'Must have total inpatient days');
    assert.ok(hospital.medicareAdvantageDays > 0, 'Must have Medicare Advantage days');
    assert.ok(hospital.annualBaseIppsOperatingDrgRevenue > 0, 'Must have operating DRG revenue');
  }
});

test('calculateGmeImeReimbursement executes authentic DGME formula under 42 CFR § 413.75', () => {
  const amc = TEACHING_HOSPITAL_ARCHETYPES[0]; // AMC Tier 1
  const res = calculateGmeImeReimbursement(amc);

  // Weighted FTE count: (310 - 48) * 1.0 + 48 * 0.5 = 262 + 24 = 286.0
  assert.equal(res.weightedResidentFtes, 286.0);

  // Effective Cap: 240 + 5 = 245.0
  assert.equal(res.effectiveDgmeCap, 245.0);

  // Allowable DGME FTEs: min(286, 245) = 245.0
  assert.equal(res.allowableDgmeFtes, 245.0);

  // Over-Cap DGME FTEs: 286 - 245 = 41.0
  assert.equal(res.overCapDgmeFtes, 41.0);

  // Medicare Patient Load (MPL): (48,000 + 32,850) / 210,000 = 80,850 / 210,000 = 0.385 (38.5%)
  assert.ok(Math.abs(res.medicarePatientLoad - 0.385) < 0.001);

  // Total DGME: 245 * 174,200 * 0.385 = 16,431,235
  const expectedDgme = 245.0 * 174200 * (80850 / 210000);
  assert.ok(Math.abs(res.totalDgmeReimbursement - expectedDgme) < 1.0);
});

test('calculateGmeImeReimbursement executes statutory Operating IME formula under 42 CFR § 412.105', () => {
  const amc = TEACHING_HOSPITAL_ARCHETYPES[0];
  const res = calculateGmeImeReimbursement(amc);

  // Effective IME Cap: 230 + 5 = 235.0
  assert.equal(res.effectiveImeCap, 235.0);
  assert.equal(res.allowableImeFtes, 235.0);

  // IRB Ratio: 235.0 / 720 beds = 0.3263888...
  const expectedIrb = 235.0 / 720.0;
  assert.ok(Math.abs(res.internAndResidentToBedRatio - expectedIrb) < 0.0001);

  // Statutory IME Factor: 1.35 * ((1 + IRB)^0.405 - 1)
  const expectedImeFactor = 1.35 * (Math.pow(1 + expectedIrb, 0.405) - 1);
  assert.ok(Math.abs(res.operatingImeFactor - expectedImeFactor) < 0.0001);

  // Operating IME Payment: 385,000,000 * IME Factor
  const expectedPayment = 385000000 * expectedImeFactor;
  assert.ok(Math.abs(res.operatingImePayment - expectedPayment) < 1.0);
});

test('calculateGmeImeReimbursement calculates Capital IME under 42 CFR § 412.322', () => {
  const community = TEACHING_HOSPITAL_ARCHETYPES[1];
  const res = calculateGmeImeReimbursement(community);

  // IRB Ratio = 43.5 / 280 = 0.155357...
  const irb = res.internAndResidentToBedRatio;
  const expectedCapitalFactor = Math.exp(0.2822 * irb) - 1;
  assert.ok(Math.abs(res.capitalImeFactor - expectedCapitalFactor) < 0.0001);
  assert.ok(res.capitalImePayment > 0);
});

test('calculateGmeImeReimbursement calculates Medicare Advantage shadow claim leakage', () => {
  const amc = TEACHING_HOSPITAL_ARCHETYPES[0];
  const res = calculateGmeImeReimbursement(amc);

  // FFS days: 48,000; MA days: 32,850; unfiled rate: 35%
  assert.ok(res.maEligibleImeRevenue > 0);
  assert.ok(res.unbilledMaShadowLoss > 0);
  assert.ok(res.capturedMaShadowRevenue > 0);
  assert.ok(Math.abs(res.maEligibleImeRevenue - (res.unbilledMaShadowLoss + res.capturedMaShadowRevenue)) < 1.0);
});

test('calculateGmeImeReimbursement applies Inpatient Psychiatric Facility (IPF) 0.5150 teaching factor and IPFQR penalty', () => {
  const ipf = TEACHING_HOSPITAL_ARCHETYPES[3]; // Pinecrest Academic Psychiatric Hospital
  assert.equal(ipf.isIpf, true);

  // Non-compliant scenario (compliance 91.2% < 95% threshold)
  const nonCompliantRes = calculateGmeImeReimbursement(ipf, { ipfqrCompliant: false });
  assert.ok(nonCompliantRes.ipfTeachingFactor! > 0);
  // (1 + 12 / 96.4)^0.5150 - 1
  const residentRatio = nonCompliantRes.allowableImeFtes / ipf.averageDailyCensus;
  const expectedTeachingFactor = Math.pow(1 + residentRatio, 0.5150) - 1;
  assert.ok(Math.abs(nonCompliantRes.ipfTeachingFactor! - expectedTeachingFactor) < 0.0001);

  // IPFQR 2% penalty applied
  assert.equal(nonCompliantRes.ipfqrPenaltyRate, 0.02);
  assert.ok(nonCompliantRes.ipfqrAnnualRevenueAtRisk! > 500000);

  // Compliant scenario
  const compliantRes = calculateGmeImeReimbursement(ipf, { ipfqrCompliant: true });
  assert.equal(compliantRes.ipfqrPenaltyRate, 0.0);
});

test('generateGmeAuditDossier outputs complete CMS-2552-10 Worksheet E-4 audit dossier', () => {
  const amc = TEACHING_HOSPITAL_ARCHETYPES[0];
  const res = calculateGmeImeReimbursement(amc);
  const dossier = generateGmeAuditDossier(amc, res);

  assert.ok(dossier.dossierId.startsWith('CMS-2552-10-GME-'));
  assert.ok(dossier.auditHash.startsWith('GME-E4-'));
  assert.ok(dossier.legalHeader.includes('CMS FORM 2552-10'));
  assert.ok(dossier.worksheetE4Data['Line 1 - Unweighted Resident FTE Count']);
  assert.ok(dossier.worksheetEPartAData['Line 29 - Operating IME Payment Factor (1.35 * [(1+r)^0.405 - 1])']);
  assert.ok(dossier.shadowClaimDefenseBrief.includes('Condition Code 04'));
});
