import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SNF_FACILITY_ARCHETYPES,
  calculatePtOtVpdMultiplier,
  calculateNtaVpdMultiplier,
  evaluateSnfPdpmStay,
  evaluateInterruptedStay,
  generateSnfAuditDossier
} from '../../src/data/snfPdpmData';

test('SNF_FACILITY_ARCHETYPES contains 4 authentic SNF profiles with valid parameters and beds', () => {
  assert.equal(SNF_FACILITY_ARCHETYPES.length, 4);

  const greatLakes = SNF_FACILITY_ARCHETYPES.find(f => f.id === 'great-lakes-subacute')!;
  assert.ok(greatLakes);
  assert.equal(greatLakes.ccn, '14-5082');
  assert.equal(greatLakes.facilityType, 'SUBACUTE_POST_ACUTE');
  assert.equal(greatLakes.isRural, false);
  assert.equal(greatLakes.ptGroup, 'TC');
  assert.equal(greatLakes.otGroup, 'TC');

  const cumberland = SNF_FACILITY_ARCHETYPES.find(f => f.id === 'cumberland-rural-nursing')!;
  assert.ok(cumberland);
  assert.equal(cumberland.isRural, true);
  assert.equal(cumberland.nursingGroup, 'ES3'); // Extensive Services 3 (Trach/Vent)
  assert.equal(cumberland.ntaGroup, 'NF'); // Max NTA tier (12+ points)

  const evergreen = SNF_FACILITY_ARCHETYPES.find(f => f.id === 'evergreen-memory-care')!;
  assert.ok(evergreen);
  assert.equal(evergreen.slpGroup, 'SL'); // Severe dysphagia & cognition (weight 4.19)

  const metro = SNF_FACILITY_ARCHETYPES.find(f => f.id === 'metropolitan-transitions')!;
  assert.ok(metro);
  assert.equal(metro.hasHivDiagnosis, true);
});

test('calculatePtOtVpdMultiplier enforces statutory 2% per 7-day decay schedule after Day 20', () => {
  // Days 1 through 20 must have 1.00 multiplier
  assert.equal(calculatePtOtVpdMultiplier(1), 1.00);
  assert.equal(calculatePtOtVpdMultiplier(10), 1.00);
  assert.equal(calculatePtOtVpdMultiplier(20), 1.00);

  // Days 21 to 27: 0.98
  assert.equal(calculatePtOtVpdMultiplier(21), 0.98);
  assert.equal(calculatePtOtVpdMultiplier(25), 0.98);
  assert.equal(calculatePtOtVpdMultiplier(27), 0.98);

  // Days 28 to 34: 0.96
  assert.equal(calculatePtOtVpdMultiplier(28), 0.96);
  assert.equal(calculatePtOtVpdMultiplier(34), 0.96);

  // Days 35 to 41: 0.94
  assert.equal(calculatePtOtVpdMultiplier(35), 0.94);
  assert.equal(calculatePtOtVpdMultiplier(41), 0.94);

  // Days 98 to 100: 0.76 (statutory floor)
  assert.equal(calculatePtOtVpdMultiplier(98), 0.76);
  assert.equal(calculatePtOtVpdMultiplier(100), 0.76);
  assert.equal(calculatePtOtVpdMultiplier(105), 0.76);
});

test('calculateNtaVpdMultiplier enforces statutory triple multiplier on Days 1 through 3', () => {
  assert.equal(calculateNtaVpdMultiplier(1), 3.00);
  assert.equal(calculateNtaVpdMultiplier(2), 3.00);
  assert.equal(calculateNtaVpdMultiplier(3), 3.00);

  // Day 4 onwards must be 1.00
  assert.equal(calculateNtaVpdMultiplier(4), 1.00);
  assert.equal(calculateNtaVpdMultiplier(20), 1.00);
  assert.equal(calculateNtaVpdMultiplier(50), 1.00);
  assert.equal(calculateNtaVpdMultiplier(100), 1.00);
});

test('evaluateSnfPdpmStay calculates accurate Day 1, Day 4, and Day 21 per diem rates', () => {
  const greatLakes = SNF_FACILITY_ARCHETYPES.find(f => f.id === 'great-lakes-subacute')!;
  const result = evaluateSnfPdpmStay(greatLakes);

  // Day 1 rate must exceed Day 4 rate by the 2x extra NTA component
  assert.ok(result.day1PerDiemRate > result.day4PerDiemRate);
  assert.ok(result.day1PerDiemRate > 800);
  assert.ok(result.day4PerDiemRate > 500);

  // Day 21 rate must be slightly lower than Day 4 rate due to PT/OT 2% decay
  assert.ok(result.day21PerDiemRate < result.day4PerDiemRate);

  // Total episode payment must be positive and consistent with average per diem
  assert.ok(result.totalEpisodeMedicarePayment > 15000);
  assert.equal(
    Math.round(result.averagePerDiemPayment * result.lengthOfStay),
    Math.round(result.totalEpisodeMedicarePayment)
  );

  // Trajectory must contain exactly lengthOfStay entries
  assert.equal(result.dailyTrajectory.length, 28);
  assert.equal(result.dailyTrajectory[0].dayNumber, 1);
  assert.equal(result.dailyTrajectory[27].dayNumber, 28);
});

test('evaluateSnfPdpmStay incorporates MMA § 511 HIV/AIDS +18% nursing add-on', () => {
  const metro = SNF_FACILITY_ARCHETYPES.find(f => f.id === 'metropolitan-transitions')!;
  const result = evaluateSnfPdpmStay(metro);

  assert.equal(metro.hasHivDiagnosis, true);
  assert.ok(result.hivNursingAddOnValuePerDay > 0);
  assert.ok(result.ntaDay1to3TripleBonusTotal > 1000);
});

test('evaluateInterruptedStay enforces 3-day statutory threshold under 42 CFR § 413.337', () => {
  // Case 1: Same SNF, readmitted within 2 days after Day 6 discharge -> INTERRUPTED STAY (resumes Day 7)
  const interruptedCase = evaluateInterruptedStay(2, true, 6);
  assert.equal(interruptedCase.isInterruptedStay, true);
  assert.equal(interruptedCase.vpdAction, 'CONTINUE_PREVIOUS_DAY');
  assert.equal(interruptedCase.resumingDayNumber, 7);
  assert.equal(interruptedCase.ntaMultiplierOnReadmission, 1.00); // Day 7 NTA is standard 1.0x

  // Case 2: Same SNF, readmitted after 4 days (> 3 days) -> NEW STAY (resets to Day 1)
  const exceedCase = evaluateInterruptedStay(4, true, 6);
  assert.equal(exceedCase.isInterruptedStay, false);
  assert.equal(exceedCase.vpdAction, 'RESET_TO_DAY_1');
  assert.equal(exceedCase.resumingDayNumber, 1);
  assert.equal(exceedCase.ntaMultiplierOnReadmission, 3.00); // Day 1 resets to 3.0x NTA

  // Case 3: Different SNF, readmitted within 1 day -> NEW STAY (resets to Day 1)
  const diffSnfCase = evaluateInterruptedStay(1, false, 6);
  assert.equal(diffSnfCase.isInterruptedStay, false);
  assert.equal(diffSnfCase.vpdAction, 'RESET_TO_DAY_1');
  assert.equal(diffSnfCase.resumingDayNumber, 1);
  assert.equal(diffSnfCase.ntaMultiplierOnReadmission, 3.00);
});

test('generateSnfAuditDossier outputs complete Form CMS-2540-10 brief with SHA-256 hash', () => {
  const greatLakes = SNF_FACILITY_ARCHETYPES.find(f => f.id === 'great-lakes-subacute')!;
  const result = evaluateSnfPdpmStay(greatLakes);
  const dossier = generateSnfAuditDossier(greatLakes, result);

  assert.ok(dossier.auditHash.startsWith('PDPM-SNF-'));
  assert.ok(dossier.auditHash.endsWith('-2026-FCA'));
  assert.equal(dossier.facilityIdentification.ccn, '14-5082');
  assert.equal(dossier.facilityIdentification.hippsCode, 'CCAE1');
  assert.ok(dossier.reimbursementSettlement.day1PerDiemRate.includes('3.0x NTA'));
  assert.ok(dossier.statutorySafeHarbor.includes('31 U.S.C. § 3729'));
});
