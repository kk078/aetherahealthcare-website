import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CLINICAL_RESEARCH_TRIALS,
  NCD_310_1_CRITERIA,
  IDE_CATEGORY_DEFINITIONS,
  calculateLedgerBreakdown,
  evaluateFcaRiskScenario,
} from '../../src/data/clinicalResearchComplianceData';

test('clinical research trials data contains 4 authentic high-stakes trials', () => {
  assert.equal(CLINICAL_RESEARCH_TRIALS.length, 4);
  for (const trial of CLINICAL_RESEARCH_TRIALS) {
    assert.ok(trial.id, 'Trial must have an id');
    assert.ok(trial.title, 'Trial must have a title');
    assert.ok(trial.nctNumber.startsWith('NCT'), 'NCT number must start with NCT');
    assert.ok(trial.protocolNumber, 'Trial must have protocol number');
    assert.ok(trial.category, 'Trial must have IDE/IND category');
    assert.ok(trial.macJurisdiction, 'Trial must specify MAC jurisdiction');
    assert.ok(trial.lineItems.length >= 5, 'Trial must have at least 5 line items');
    assert.ok(trial.coverageAttestationText, 'Trial must have legal attestation text');
  }
});

test('IDE category definitions accurately reflect federal statutes', () => {
  const catA = IDE_CATEGORY_DEFINITIONS['category-a'];
  const catB = IDE_CATEGORY_DEFINITIONS['category-b'];
  const indOncology = IDE_CATEGORY_DEFINITIONS['ind-oncology'];

  assert.equal(catA.medicareDeviceCovered, false);
  assert.equal(catA.medicareRoutineCovered, true);
  assert.equal(catB.medicareDeviceCovered, true);
  assert.equal(catB.medicareRoutineCovered, true);
  assert.equal(indOncology.sponsorSuppliedAgentBilledToMedicare, false);
});

test('NCD 310.1 criteria contains 3 mandatory and 7 desirable standards', () => {
  const mandatory = NCD_310_1_CRITERIA.filter((c) => c.isMandatory);
  const desirable = NCD_310_1_CRITERIA.filter((c) => !c.isMandatory);
  assert.equal(mandatory.length, 3);
  assert.equal(desirable.length, 7);
});

test('dual-ledger calculation accurately segregates Medicare vs. Sponsor totals', () => {
  const trial = CLINICAL_RESEARCH_TRIALS[0]; // TMVR Category A
  const breakdown = calculateLedgerBreakdown(trial);

  assert.ok(breakdown.medicareTotal > 0, 'Medicare total must be positive');
  assert.ok(breakdown.sponsorTotal > 0, 'Sponsor total must be positive');
  assert.ok(breakdown.nonCoveredDeviceTotal > 0, 'Category A device must be non-covered by Medicare');
  assert.equal(
    breakdown.medicareTotal + breakdown.sponsorTotal + breakdown.nonCoveredDeviceTotal,
    breakdown.grossTotal,
    'Ledger sum must equal gross billed total'
  );
});

test('FCA risk simulation flags illegal double-billing and missing modifiers', () => {
  const doubleBilling = evaluateFcaRiskScenario('double-billing-sponsor-item', 15000);
  assert.equal(doubleBilling.severity, 'CRITICAL_FCA_VIOLATION');
  assert.ok(doubleBilling.potentialPenalty.includes('31 U.S.C. § 3729'));

  const catADevice = evaluateFcaRiskScenario('bill-cat-a-device-to-medicare', 38500);
  assert.equal(catADevice.severity, 'PROHIBITED_DEVICE_BILLING');

  const missingQMod = evaluateFcaRiskScenario('missing-q-modifier', 4850);
  assert.equal(catADevice.severity, 'PROHIBITED_DEVICE_BILLING');
  assert.equal(missingQMod.severity, 'CLEARINGHOUSE_REJECTION');
});
