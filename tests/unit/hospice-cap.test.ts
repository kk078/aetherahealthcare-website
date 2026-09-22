import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWageAdjustedRates,
  evaluateSia,
  evaluateInpatientCap,
  evaluateAggregateCap,
  evaluateFullHospiceSettlement,
  generateHospiceAuditDossier,
  HOSPICE_ARCHETYPES,
  HOSPICE_FY2026_BASE_RATES,
  HOSPICE_FY2026_AGGREGATE_CAP_AMOUNT,
  HOSPICE_INPATIENT_CAP_PERCENT
} from '../../src/data/hospiceCapData';

test('HOSPICE_ARCHETYPES contains 4 authentic hospice profiles with valid parameters and CCNs', () => {
  assert.equal(HOSPICE_ARCHETYPES.length, 4);

  const bluegrass = HOSPICE_ARCHETYPES.find(a => a.id === 'bluegrass-community');
  assert.ok(bluegrass);
  assert.equal(bluegrass.ccn, '18-1524');
  assert.equal(bluegrass.npi, '1427189032');
  assert.equal(bluegrass.regulatoryRisk, 'CAP_SAFE');

  const highDesert = HOSPICE_ARCHETYPES.find(a => a.id === 'high-desert-regional');
  assert.ok(highDesert);
  assert.equal(highDesert.ccn, '03-1540');
  assert.equal(highDesert.regulatoryRisk, 'AGGREGATE_CAP_BREACH');

  const ozark = HOSPICE_ARCHETYPES.find(a => a.id === 'ozark-mountain-respite');
  assert.ok(ozark);
  assert.equal(ozark.ccn, '26-1509');
  assert.equal(ozark.regulatoryRisk, 'INPATIENT_20_BREACH');

  const cascade = HOSPICE_ARCHETYPES.find(a => a.id === 'cascade-haven-institute');
  assert.ok(cascade);
  assert.equal(cascade.ccn, '50-1533');
  assert.equal(cascade.regulatoryRisk, 'HIGH_SIA_OPTIMIZED');
});

test('calculateWageAdjustedRates computes statutory wage index and HQRP adjustments', () => {
  // Neutral wage index
  const baseRates = calculateWageAdjustedRates(1.0, true);
  assert.equal(baseRates.rhcTier1, HOSPICE_FY2026_BASE_RATES.rhcTier1);
  assert.equal(baseRates.rhcTier2, HOSPICE_FY2026_BASE_RATES.rhcTier2);
  assert.equal(baseRates.chcDaily, HOSPICE_FY2026_BASE_RATES.chcDaily);
  assert.equal(baseRates.irc, HOSPICE_FY2026_BASE_RATES.irc);
  assert.equal(baseRates.gip, HOSPICE_FY2026_BASE_RATES.gip);

  // Seattle high wage index 1.2850
  const seattleRates = calculateWageAdjustedRates(1.2850, true);
  assert.ok(seattleRates.rhcTier1 > HOSPICE_FY2026_BASE_RATES.rhcTier1);
  assert.ok(Math.abs(seattleRates.rhcTier1 - 259.40) < 0.2);
  assert.ok(Math.abs(seattleRates.gip - 1402.02) < 0.2);

  // HQRP non-compliance 4% penalty
  const penalizedRates = calculateWageAdjustedRates(1.0, false);
  assert.ok(Math.abs(penalizedRates.rhcTier1 - (baseRates.rhcTier1 * 0.96)) < 0.2);
});

test('evaluateSia enforces statutory 4-hour daily limit and 7-day end-of-life cap', () => {
  // 6 hours daily, 8 days requested -> should cap at 4.0 hrs and 7 days
  // 4.0 hrs * 7 days * 10 decedents = 280 hours
  const sia = evaluateSia(1.0, true, 10, 3.5, 2.5, 8);
  assert.equal(sia.totalEligibleHours, 280.0);
  assert.ok(Math.abs(sia.totalSiaPayments - (280.0 * 65.81)) < 1.0);
  assert.ok(Math.abs(sia.dailyRateMax - (4.0 * 65.81)) < 1.0);

  // Standard hours: 2.0 hrs daily * 5 days * 20 decedents = 200 hours
  const standardSia = evaluateSia(1.0, true, 20, 1.5, 0.5, 5);
  assert.equal(standardSia.totalEligibleHours, 200.0);
  assert.ok(Math.abs(standardSia.totalSiaPayments - (200.0 * 65.81)) < 1.0);
});

test('evaluateInpatientCap enforces 20% inpatient ceiling under 42 CFR § 418.308', () => {
  const rates = calculateWageAdjustedRates(1.0, true);
  
  // Compliant scenario: 800 inpatient days out of 11,000 (7.27% < 20%)
  const compliantDays = {
    rhcTier1Days: 5000,
    rhcTier2Days: 5000,
    chcDays: 200,
    ircDays: 300,
    gipDays: 500,
  };
  const compliantResult = evaluateInpatientCap(compliantDays, rates);
  assert.equal(compliantResult.isBreached, false);
  assert.equal(compliantResult.excessInpatientDays, 0);
  assert.equal(compliantResult.clawbackAmount, 0);
  assert.ok(compliantResult.inpatientRatio <= HOSPICE_INPATIENT_CAP_PERCENT);

  // Breach scenario: 3,000 inpatient days out of 10,000 (30% > 20%)
  const breachDays = {
    rhcTier1Days: 3000,
    rhcTier2Days: 3800,
    chcDays: 200,
    ircDays: 1000,
    gipDays: 2000,
  };
  const breachResult = evaluateInpatientCap(breachDays, rates);
  assert.equal(breachResult.isBreached, true);
  assert.equal(breachResult.totalCareDays, 10000);
  assert.equal(breachResult.maxAllowedInpatientDays, 2000);
  assert.equal(breachResult.excessInpatientDays, 1000);
  assert.ok(breachResult.clawbackAmount > 0);
});

test('evaluateAggregateCap calculates safe buffer and overpayment liabilities', () => {
  const netBeneficiaries = 100;
  const allowedCap = netBeneficiaries * HOSPICE_FY2026_AGGREGATE_CAP_AMOUNT;
  
  // Safe buffer scenario
  const safeEval = evaluateAggregateCap(netBeneficiaries, 2000000);
  assert.equal(safeEval.isBreached, false);
  assert.equal(safeEval.overpaymentLiability, 0);
  assert.ok(Math.abs(safeEval.safeBuffer - (allowedCap - 2000000)) < 1.0);
  assert.equal(safeEval.riskStatus, 'SAFE');

  // Breach scenario
  const breachEval = evaluateAggregateCap(50, 2200000);
  const breachAllowedCap = 50 * HOSPICE_FY2026_AGGREGATE_CAP_AMOUNT;
  assert.equal(breachEval.isBreached, true);
  assert.ok(Math.abs(breachEval.overpaymentLiability - (2200000 - breachAllowedCap)) < 1.0);
  assert.equal(breachEval.safeBuffer, 0);
  assert.equal(breachEval.riskStatus, 'BREACH');
});

test('evaluateFullHospiceSettlement accurately models 4 authentic hospice archetypes', () => {
  // Bluegrass: Cap Safe & Inpatient Compliant
  const bg = HOSPICE_ARCHETYPES.find(a => a.id === 'bluegrass-community')!;
  const bgReport = evaluateFullHospiceSettlement(bg);
  assert.equal(bgReport.inpatientCap.isBreached, false);
  assert.equal(bgReport.aggregateCap.isBreached, false);
  assert.ok(bgReport.aggregateCap.safeBuffer > 5000000);
  assert.equal(bgReport.netSettlementAfterRecoupment, bgReport.paymentBreakdown.grossMedicarePayment);

  // High Desert: Aggregate Cap Breach
  const hd = HOSPICE_ARCHETYPES.find(a => a.id === 'high-desert-regional')!;
  const hdReport = evaluateFullHospiceSettlement(hd);
  assert.equal(hdReport.aggregateCap.isBreached, true);
  assert.ok(hdReport.aggregateCap.overpaymentLiability > 0);
  assert.ok(hdReport.netSettlementAfterRecoupment < hdReport.paymentBreakdown.grossMedicarePayment);

  // Ozark: 20% Inpatient Cap Breach
  const oz = HOSPICE_ARCHETYPES.find(a => a.id === 'ozark-mountain-respite')!;
  const ozReport = evaluateFullHospiceSettlement(oz);
  assert.equal(ozReport.inpatientCap.isBreached, true);
  assert.ok(ozReport.inpatientCap.excessInpatientDays > 0);
  assert.ok(ozReport.inpatientCap.clawbackAmount > 500000);

  // Cascade Haven: High SIA Optimization
  const ch = HOSPICE_ARCHETYPES.find(a => a.id === 'cascade-haven-institute')!;
  const chReport = evaluateFullHospiceSettlement(ch);
  assert.ok(chReport.paymentBreakdown.siaPayment > 300000);
  assert.equal(chReport.inpatientCap.isBreached, false);
  assert.equal(chReport.aggregateCap.isBreached, false);
});

test('generateHospiceAuditDossier outputs complete Form CMS-1984-14 brief with SHA-256 hash', () => {
  const bg = HOSPICE_ARCHETYPES[0];
  const report = evaluateFullHospiceSettlement(bg);
  const dossier = generateHospiceAuditDossier(report);

  assert.match(dossier.dossierId, /^HOSPICE-CAP-[A-F0-9]{10}-2026-FCA$/);
  assert.equal(dossier.sha256Hash.length, 64);
  assert.ok(dossier.content.includes('FORM CMS-1984-14'));
  assert.ok(dossier.content.includes('42 CFR § 418.308'));
  assert.ok(dossier.content.includes('42 CFR § 418.309'));
  assert.ok(dossier.content.includes(bg.ccn));
  assert.ok(dossier.content.includes(bg.npi));
});
