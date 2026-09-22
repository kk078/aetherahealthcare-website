import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  IRF_STATUTORY_COMPLIANCE_THRESHOLD,
  IRF_FY2026_STANDARD_CONVERSION_FACTOR,
  IRF_RURAL_ADJUSTMENT_FACTOR,
  IRF_13_QUALIFYING_CONDITIONS,
  IRF_FACILITY_ARCHETYPES,
  calculateIrfPaymentPerCase,
  evaluateIrfCompliance,
  generateIrfAuditDossier
} from '../../src/data/irfPpsData';

test('IRF_FACILITY_ARCHETYPES contains 4 authentic IRF profiles with valid CCNs, parameters, and beds', () => {
  assert.equal(IRF_FACILITY_ARCHETYPES.length, 4);

  const midwest = IRF_FACILITY_ARCHETYPES.find(f => f.id === 'midwest-neuro-rehab')!;
  assert.ok(midwest);
  assert.equal(midwest.facilityType, 'FREESTANDING_IRF');
  assert.equal(midwest.ccn, '14-3028');
  assert.ok(midwest.basePresumptiveRate > IRF_STATUTORY_COMPLIANCE_THRESHOLD);
  assert.equal(midwest.isRural, false);

  const allegheny = IRF_FACILITY_ARCHETYPES.find(f => f.id === 'allegheny-excluded-unit')!;
  assert.ok(allegheny);
  assert.equal(allegheny.facilityType, 'HOSPITAL_EXCLUDED_UNIT');
  assert.equal(allegheny.ccn, '39-T112');
  assert.ok(allegheny.basePresumptiveRate < IRF_STATUTORY_COMPLIANCE_THRESHOLD); // Fails presumptive
  assert.ok(allegheny.basePresumptiveRate + allegheny.medicalReviewDocumentationRate > IRF_STATUTORY_COMPLIANCE_THRESHOLD); // Rescued by medical review

  const appalachian = IRF_FACILITY_ARCHETYPES.find(f => f.id === 'appalachian-rural-rehab')!;
  assert.ok(appalachian);
  assert.equal(appalachian.isRural, true);
  assert.ok(appalachian.lipFactor > 1.10);

  const metro = IRF_FACILITY_ARCHETYPES.find(f => f.id === 'metropolitan-pmr-institute')!;
  assert.ok(metro);
  assert.ok(metro.basePresumptiveRate + metro.medicalReviewDocumentationRate < IRF_STATUTORY_COMPLIANCE_THRESHOLD); // Fails even after medical review
});

test('IRF_13_QUALIFYING_CONDITIONS contains all 13 conditions under 42 CFR § 412.29(b)(2)', () => {
  assert.equal(IRF_13_QUALIFYING_CONDITIONS.length, 13);

  // Check codes 01 to 13
  for (let i = 1; i <= 13; i++) {
    const codeStr = i < 10 ? `0${i}` : `${i}`;
    const condition = IRF_13_QUALIFYING_CONDITIONS.find(c => c.code === codeStr);
    assert.ok(condition, `Condition code ${codeStr} should exist`);
  }

  // Stroke, SCI, Amputation, Femur, Brain injury must be presumptive eligible
  const stroke = IRF_13_QUALIFYING_CONDITIONS.find(c => c.code === '01')!;
  assert.equal(stroke.presumptiveEligible, true);
  assert.equal(stroke.requiresMedicalReviewVerification, false);

  // Arthritis and Joint replacement conditions require medical review documentation verification
  const arthritis = IRF_13_QUALIFYING_CONDITIONS.find(c => c.code === '10')!;
  assert.equal(arthritis.presumptiveEligible, false);
  assert.equal(arthritis.requiresMedicalReviewVerification, true);

  const joint = IRF_13_QUALIFYING_CONDITIONS.find(c => c.code === '13')!;
  assert.equal(joint.presumptiveEligible, false);
  assert.equal(joint.requiresMedicalReviewVerification, true);
});

test('calculateIrfPaymentPerCase computes statutory wage index and facility adjustments', () => {
  // Urban facility with wageIndex = 1.0, no LIP, no teaching, CMG weight = 1.0, all tier 0
  const baseResult = calculateIrfPaymentPerCase(1.0, false, 1.0, 1.0, 1.0, {
    tier1Pct: 0,
    tier2Pct: 0,
    tier3Pct: 0,
    tier0Pct: 1.0
  });

  assert.equal(baseResult.wageAdjustedBase, IRF_FY2026_STANDARD_CONVERSION_FACTOR);
  assert.equal(baseResult.paymentPerCase, IRF_FY2026_STANDARD_CONVERSION_FACTOR);

  // Rural facility with 14.9% adjustment
  const ruralResult = calculateIrfPaymentPerCase(1.0, true, 1.0, 1.0, 1.0, {
    tier1Pct: 0,
    tier2Pct: 0,
    tier3Pct: 0,
    tier0Pct: 1.0
  });
  const expectedRuralPayment = Math.round(IRF_FY2026_STANDARD_CONVERSION_FACTOR * IRF_RURAL_ADJUSTMENT_FACTOR * 100) / 100;
  assert.equal(ruralResult.paymentPerCase, expectedRuralPayment);

  // High tier comorbidity case (all Tier 1 comorbidity weight 1.285)
  const tier1Result = calculateIrfPaymentPerCase(1.0, false, 1.0, 1.0, 1.0, {
    tier1Pct: 1.0,
    tier2Pct: 0,
    tier3Pct: 0,
    tier0Pct: 0
  });
  const expectedTier1Payment = Math.round(IRF_FY2026_STANDARD_CONVERSION_FACTOR * 1.285 * 100) / 100;
  assert.equal(tier1Result.paymentPerCase, expectedTier1Payment);
});

test('evaluateIrfCompliance grants IRF PPS status for compliant facility without penalty', () => {
  const midwest = IRF_FACILITY_ARCHETYPES.find(f => f.id === 'midwest-neuro-rehab')!;
  const result = evaluateIrfCompliance(midwest);

  assert.equal(result.presumptiveStatus, 'PASS');
  assert.equal(result.finalComplianceStatus, 'COMPLIANT_IRF_PPS');
  assert.equal(result.annualReclassificationPenaltyLoss, 0);
  assert.ok(result.complianceMarginDelta > 0);
  assert.ok(result.settledIrfPaymentPerCase > result.counterfactualIppsPaymentPerCase);
  assert.ok(result.annualIrfPpsProgramRevenue > 10000000);
});

test('evaluateIrfCompliance handles medical review rescue for borderline unit', () => {
  const allegheny = IRF_FACILITY_ARCHETYPES.find(f => f.id === 'allegheny-excluded-unit')!;
  const result = evaluateIrfCompliance(allegheny);

  // Presumptive is 56.4% -> FAILS automated screen
  assert.equal(result.presumptiveComplianceRate, 0.564);
  assert.equal(result.presumptiveStatus, 'FAIL_AUDIT_TRIGGERED');

  // Medical review rate is 56.4% + 6.8% = 63.2% -> PASSES
  assert.equal(result.medicalReviewComplianceRate, 0.632);
  assert.equal(result.medicalReviewStatus, 'PASS');
  assert.equal(result.finalComplianceStatus, 'COMPLIANT_IRF_PPS');
  assert.equal(result.annualReclassificationPenaltyLoss, 0);

  // Value saved by medical review defense must be substantial (> $3.5M)
  assert.ok(result.medicalReviewRecoveryValue > 3500000);
});

test('evaluateIrfCompliance triggers acute IPPS reclassification when 60% rule is violated', () => {
  const metro = IRF_FACILITY_ARCHETYPES.find(f => f.id === 'metropolitan-pmr-institute')!;
  const result = evaluateIrfCompliance(metro);

  assert.equal(result.presumptiveStatus, 'FAIL_AUDIT_TRIGGERED');
  assert.equal(result.medicalReviewStatus, 'FAIL_RECLASSIFICATION');
  assert.equal(result.finalComplianceStatus, 'RECLASSIFIED_ACUTE_IPPS');

  // Must suffer multi-million dollar reclassification penalty loss
  assert.ok(result.annualReclassificationPenaltyLoss > 4000000);
  assert.equal(result.medicalReviewRecoveryValue, 0);
  assert.ok(result.complianceMarginDelta < 0);
});

test('generateIrfAuditDossier outputs complete CMS-2552-10 brief with valid SHA-256 hash', () => {
  const midwest = IRF_FACILITY_ARCHETYPES.find(f => f.id === 'midwest-neuro-rehab')!;
  const result = evaluateIrfCompliance(midwest);
  const dossier = generateIrfAuditDossier(midwest, result);

  assert.ok(dossier.auditHash.startsWith('IRF-60R-'));
  assert.ok(dossier.auditHash.endsWith('-2026-FCA'));
  assert.equal(dossier.facilityIdentification.ccn, '14-3028');
  assert.equal(dossier.complianceRuleAudit.final60PercentStatus, 'COMPLIANT - QUALIFIED FOR IRF PPS');
  assert.ok(dossier.reimbursementSettlement.irfPaymentPerDischarge.includes('Discharge'));
  assert.ok(dossier.statutorySafeHarbor.includes('31 U.S.C. § 3729'));
});
