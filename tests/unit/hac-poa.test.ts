import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HAC_CATEGORIES,
  POA_INDICATOR_DEFINITIONS,
  INPATIENT_HAC_CASES,
  calculateDrgReclassification,
  calculateHacrpAnnualExposure,
} from '../../src/data/hacPoaData';

test('HAC categories contain 14 statutory DRA 2005 categories', () => {
  assert.equal(HAC_CATEGORIES.length, 14);
  for (const cat of HAC_CATEGORIES) {
    assert.ok(cat.id, 'HAC category must have an id');
    assert.ok(cat.title, 'HAC category must have a title');
    assert.ok(cat.icd10Range, 'HAC category must specify ICD-10 range');
    assert.ok(cat.statuteRef, 'HAC category must reference DRA 2005');
  }
});

test('POA indicator definitions accurately reflect CMS UB-04 standards', () => {
  const y = POA_INDICATOR_DEFINITIONS['Y'];
  const n = POA_INDICATOR_DEFINITIONS['N'];
  const u = POA_INDICATOR_DEFINITIONS['U'];
  const w = POA_INDICATOR_DEFINITIONS['W'];
  const exempt = POA_INDICATOR_DEFINITIONS['1'];

  assert.equal(y.retainsMccStatus, true);
  assert.equal(n.retainsMccStatus, false);
  assert.equal(u.retainsMccStatus, false); // Treated like 'N' by CMS
  assert.equal(w.retainsMccStatus, true);  // Treated like 'Y' by CMS
  assert.equal(exempt.retainsMccStatus, true);
});

test('inpatient cases contain 4 high-risk admissions with DRG downcoding impact', () => {
  assert.equal(INPATIENT_HAC_CASES.length, 4);
  for (const c of INPATIENT_HAC_CASES) {
    assert.ok(c.fullDrg.rate > c.downcodedDrg.rate, 'Full DRG rate must exceed downcoded rate');
    assert.ok(c.fullDrg.weight > c.downcodedDrg.weight, 'Full DRG weight must exceed downcoded weight');
    assert.ok(c.admissionEvidence, 'Case must include admission clinical evidence');
    assert.ok(c.cdiRemediationStrategy, 'Case must include CDI remediation strategy');
  }
});

test('calculateDrgReclassification accurately computes payment delta based on POA indicator', () => {
  const testCase = INPATIENT_HAC_CASES[0]; // Spine Fusion with PE/DVT

  // POA = 'Y' (Present on admission) -> Full DRG, $0 penalty
  const resY = calculateDrgReclassification(testCase, 'Y');
  assert.equal(resY.assignedDrgCode, testCase.fullDrg.code);
  assert.equal(resY.assignedPayment, testCase.fullDrg.rate);
  assert.equal(resY.revenueLoss, 0);
  assert.equal(resY.hacPenaltyTriggered, false);

  // POA = 'N' (Hospital-acquired) -> Downcoded DRG, $11,650 penalty
  const resN = calculateDrgReclassification(testCase, 'N');
  assert.equal(resN.assignedDrgCode, testCase.downcodedDrg.code);
  assert.equal(resN.assignedPayment, testCase.downcodedDrg.rate);
  assert.equal(resN.revenueLoss, 11650);
  assert.equal(resN.hacPenaltyTriggered, true);

  // POA = 'U' (Unknown) -> Treated like 'N'
  const resU = calculateDrgReclassification(testCase, 'U');
  assert.equal(resU.hacPenaltyTriggered, true);
  assert.equal(resU.revenueLoss, 11650);

  // POA = 'W' (Clinically undetermined) -> Treated like 'Y'
  const resW = calculateDrgReclassification(testCase, 'W');
  assert.equal(resW.hacPenaltyTriggered, false);
  assert.equal(resW.revenueLoss, 0);
});

test('calculateHacrpAnnualExposure correctly computes 1% statutory IPPS penalty', () => {
  const penalty = calculateHacrpAnnualExposure(120000000, 4); // $120M IPPS, Worst Quartile (4)
  assert.equal(penalty.isPenalized, true);
  assert.equal(penalty.annualPenaltyAmount, 1200000); // 1% of $120M
  assert.equal(penalty.safeHarborQuartile, false);

  const safe = calculateHacrpAnnualExposure(120000000, 2); // 2nd Quartile
  assert.equal(safe.isPenalized, false);
  assert.equal(safe.annualPenaltyAmount, 0);
  assert.equal(safe.safeHarborQuartile, true);
});
