import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TWO_MIDNIGHT_CASES,
  PAYER_COMPLIANCE_METRICS,
  calculateLevelOfCareArbitration,
  calculateHospitalAnnualMaExposure,
  generateTwoMidnightAppealDossier,
} from '../../src/data/twoMidnightData';

test('TWO_MIDNIGHT_CASES contains 4 authentic clinical cases with valid CMS-4201-F violations', () => {
  assert.equal(TWO_MIDNIGHT_CASES.length, 4);
  for (const c of TWO_MIDNIGHT_CASES) {
    assert.ok(c.id, 'Case must have an id');
    assert.ok(c.title, 'Case must have a title');
    assert.ok(c.admittingDiagnosis.code, 'Case must specify admitting diagnosis');
    assert.ok(c.inpatientDrg.paymentAmount > c.observationApc.paymentAmount, 'Inpatient DRG must pay more than Observation');
    assert.ok(c.physicianAdmissionOrder.midnightsExpected >= 2, 'Clinical case must expect at least 2 midnights');
    assert.ok(c.cmsViolation.cfrCitation.includes('42 CFR'), 'Violation must cite 42 CFR');
  }
});

test('PAYER_COMPLIANCE_METRICS tracks key national MA plans with high ALJ overturn rates', () => {
  assert.equal(PAYER_COMPLIANCE_METRICS.length, 4);
  for (const m of PAYER_COMPLIANCE_METRICS) {
    assert.ok(m.twoMidnightDenialRate > 10, 'Denial rate must be authentic (>10%)');
    assert.ok(m.aljOverturnRate > 75, 'ALJ overturn rate must exceed 75%');
    assert.ok(m.complianceRiskLevel, 'Must define risk level');
  }
});

test('calculateLevelOfCareArbitration detects unlawful MA downgrades when 2-midnight benchmark met', () => {
  const c = TWO_MIDNIGHT_CASES[0]; // ADHF case

  // 1. Inpatient Part A Setting -> Compliant, $0 shortfall
  const resInpatient = calculateLevelOfCareArbitration(c, 'INPATIENT_PART_A', 3, true);
  assert.equal(resInpatient.assignedSetting, 'INPATIENT_PART_A');
  assert.equal(resInpatient.assignedPayment, 13400);
  assert.equal(resInpatient.revenueShortfall, 0);
  assert.equal(resInpatient.arbitrationStatus, 'CMS_COMPLIANT_INPATIENT');
  assert.equal(resInpatient.cms4201FViolationDetected, false);

  // 2. MA Downgrade to Observation when 2-midnight benchmark was met -> Unlawful downgrade, $9,800 shortfall
  const resObsDowngrade = calculateLevelOfCareArbitration(c, 'OUTPATIENT_OBSERVATION', 3, true);
  assert.equal(resObsDowngrade.assignedSetting, 'OUTPATIENT_OBSERVATION');
  assert.equal(resObsDowngrade.assignedPayment, 3600);
  assert.equal(resObsDowngrade.revenueShortfall, 9800);
  assert.equal(resObsDowngrade.arbitrationStatus, 'UNLAWFUL_MA_DOWNGRADE');
  assert.equal(resObsDowngrade.cms4201FViolationDetected, true);
  assert.ok(resObsDowngrade.promptPayInterestExposures > 0, 'Must calculate prompt pay interest exposure');
});

test('calculateHospitalAnnualMaExposure accurately models hospital-wide loss and arbitration recovery', () => {
  const res = calculateHospitalAnnualMaExposure(1000, 15, 9000);
  assert.equal(res.totalMaAdmissions, 1000);
  assert.equal(res.annualDenials, 150);
  assert.equal(res.totalAnnualLoss, 1350000); // 150 * $9,000 = $1,350,000
  assert.equal(res.recoverableWithArbiter, Math.round(1350000 * 0.83));
});

test('generateTwoMidnightAppealDossier outputs formal demand citing CMS-4201-F and 42 CFR 422.101', () => {
  const dossier = generateTwoMidnightAppealDossier(TWO_MIDNIGHT_CASES[1]); // TKA case
  assert.ok(dossier.includes('CMS-4201-F'), 'Appeal must cite CMS-4201-F');
  assert.ok(dossier.includes('42 CFR § 422.101'), 'Appeal must cite 42 CFR 422.101');
  assert.ok(dossier.includes('42 CFR § 412.3'), 'Appeal must cite 42 CFR 412.3 Two-Midnight Rule');
  assert.ok(dossier.includes('Humana Choice Medicare Advantage'), 'Must reference payer');
  assert.ok(dossier.includes('MS-DRG 470'), 'Must cite Inpatient DRG');
  assert.ok(dossier.includes('SHA-256[TWO_MIDNIGHT:'), 'Must include cryptographic audit trail');
});
