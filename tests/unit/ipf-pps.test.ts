import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  IPF_FY2026_FEDERAL_BASE_RATE,
  IPF_FY2026_ECT_BASE_RATE,
  IPF_RURAL_ADJUSTMENT,
  IPF_LABOR_SHARE_HIGH_WAGE,
  IPF_LABOR_SHARE_LOW_WAGE,
  IPF_ARCHETYPES,
  calculateIpfWageAdjustedRates,
  calculateTeachingAdjustment,
  getIpfAgeMultiplier,
  getIpfLosMultiplier,
  evaluateIpfStay,
  generateIpfAuditDossier
} from '../../src/data/ipfPpsData';

test('IPF_ARCHETYPES contains 4 authentic IPF profiles with valid parameters and CCNs', () => {
  assert.equal(IPF_ARCHETYPES.length, 4);

  const midwestern = IPF_ARCHETYPES.find(a => a.id === 'midwestern-psych-pavilion');
  assert.ok(midwestern);
  assert.equal(midwestern.ccn, '14-4012');
  assert.equal(midwestern.npi, '1851940221');
  assert.equal(midwestern.hasQualifiedEd, true);
  assert.equal(midwestern.isRural, false);
  assert.equal(midwestern.ipfqrCompliant, true);

  const appalachian = IPF_ARCHETYPES.find(a => a.id === 'appalachian-behavioral');
  assert.ok(appalachian);
  assert.equal(appalachian.ccn, '44-4008');
  assert.equal(appalachian.npi, '1720839104');
  assert.equal(appalachian.isRural, true);
  assert.equal(appalachian.hasQualifiedEd, false);

  const metroAcademic = IPF_ARCHETYPES.find(a => a.id === 'metropolitan-academic-neuro');
  assert.ok(metroAcademic);
  assert.equal(metroAcademic.ccn, '05-4120');
  assert.equal(metroAcademic.teachingMetrics.isTeaching, true);
  assert.equal(metroAcademic.teachingMetrics.residentFte, 24);
  assert.equal(metroAcademic.teachingMetrics.averageDailyCensus, 68);

  const greatPlains = IPF_ARCHETYPES.find(a => a.id === 'great-plains-stabilization');
  assert.ok(greatPlains);
  assert.equal(greatPlains.ccn, '28-4015');
  assert.equal(greatPlains.ipfqrCompliant, false);
});

test('calculateIpfWageAdjustedRates handles high-wage, low-wage, and quality penalty correctly', () => {
  // Neutral wage index 1.0 (low-wage labor share threshold <= 1.0 -> 62.0%)
  const neutral = calculateIpfWageAdjustedRates(1.0, true);
  assert.equal(neutral.basePerDiem, IPF_FY2026_FEDERAL_BASE_RATE);
  assert.equal(neutral.ectPerTreatment, IPF_FY2026_ECT_BASE_RATE);
  assert.equal(neutral.laborShare, IPF_LABOR_SHARE_LOW_WAGE);

  // Chicago high wage index (1.0420 > 1.0 -> 68.8% labor share)
  const chicago = calculateIpfWageAdjustedRates(1.0420, true);
  assert.equal(chicago.laborShare, IPF_LABOR_SHARE_HIGH_WAGE);
  assert.ok(chicago.basePerDiem > IPF_FY2026_FEDERAL_BASE_RATE);
  assert.ok(Math.abs(chicago.basePerDiem - 922.64) < 0.1);

  // Johnson City low wage index (0.8115 <= 1.0 -> 62.0% labor share)
  const ruralLow = calculateIpfWageAdjustedRates(0.8115, true);
  assert.equal(ruralLow.laborShare, IPF_LABOR_SHARE_LOW_WAGE);
  assert.ok(ruralLow.basePerDiem < IPF_FY2026_FEDERAL_BASE_RATE);

  // IPFQR Non-compliance 2% penalty
  const penalized = calculateIpfWageAdjustedRates(1.0, false);
  const expectedPenalizedBase = Number((IPF_FY2026_FEDERAL_BASE_RATE * 0.98).toFixed(2));
  assert.equal(penalized.basePerDiem, expectedPenalizedBase);
  const expectedPenalizedEct = Number((IPF_FY2026_ECT_BASE_RATE * 0.98).toFixed(2));
  assert.equal(penalized.ectPerTreatment, expectedPenalizedEct);
});

test('calculateTeachingAdjustment implements statutory exponent 0.5150', () => {
  // Non-teaching facility
  assert.equal(calculateTeachingAdjustment(0, 50), 1.0);
  assert.equal(calculateTeachingAdjustment(10, 0), 1.0);

  // Metropolitan Academic: 24 FTE / 68 ADC = 0.35294 ratio
  // (1 + 0.35294)^0.5150 = 1.35294^0.5150 ~ 1.1678 (+16.78%)
  const teachingAdj = calculateTeachingAdjustment(24, 68);
  assert.ok(teachingAdj > 1.16 && teachingAdj < 1.18);
});

test('getIpfAgeMultiplier maps correctly across all statutory age tiers', () => {
  assert.equal(getIpfAgeMultiplier(25), 1.00);
  assert.equal(getIpfAgeMultiplier(44), 1.00);
  assert.equal(getIpfAgeMultiplier(45), 1.01);
  assert.equal(getIpfAgeMultiplier(49), 1.01);
  assert.equal(getIpfAgeMultiplier(50), 1.03);
  assert.equal(getIpfAgeMultiplier(57), 1.06);
  assert.equal(getIpfAgeMultiplier(63), 1.11);
  assert.equal(getIpfAgeMultiplier(67), 1.10);
  assert.equal(getIpfAgeMultiplier(72), 1.12);
  assert.equal(getIpfAgeMultiplier(76), 1.15);
  assert.equal(getIpfAgeMultiplier(85), 1.17);
});

test('getIpfLosMultiplier implements Day 1 ED bump and declining plateau', () => {
  // Day 1 with qualified ED is 1.31, without ED is 1.19
  assert.equal(getIpfLosMultiplier(1, true), 1.31);
  assert.equal(getIpfLosMultiplier(1, false), 1.19);

  // Day 2 both are 1.12
  assert.equal(getIpfLosMultiplier(2, true), 1.12);
  assert.equal(getIpfLosMultiplier(2, false), 1.12);

  // Day 10 is 1.00
  assert.equal(getIpfLosMultiplier(10, true), 1.00);

  // Day 22+ reaches floor 0.92
  assert.equal(getIpfLosMultiplier(22, true), 0.92);
  assert.equal(getIpfLosMultiplier(35, false), 0.92);
});

test('evaluateIpfStay computes accurate per diem trajectory and ECT add-on', () => {
  const midwestern = IPF_ARCHETYPES.find(a => a.id === 'midwestern-psych-pavilion')!;
  const result = evaluateIpfStay(midwestern);

  assert.equal(result.dailySchedule.length, 14);
  assert.ok(result.totalPerDiemPayment > 0);
  assert.ok(result.totalEctPayment > 0);
  assert.equal(result.totalEctPayment, Number((6 * result.wageAdjustedEctRate).toFixed(2)));
  assert.equal(result.grossMedicarePayment, Number((result.totalPerDiemPayment + result.totalEctPayment).toFixed(2)));
  assert.equal(result.dailySchedule[0].losMultiplier, 1.31); // Day 1 with ED

  // Appalachian Rural Bonus verification
  const appalachian = IPF_ARCHETYPES.find(a => a.id === 'appalachian-behavioral')!;
  const ruralResult = evaluateIpfStay(appalachian);
  assert.ok(ruralResult.facilityMultiplier >= IPF_RURAL_ADJUSTMENT);
  assert.equal(ruralResult.dailySchedule[0].losMultiplier, 1.19); // Day 1 without ED
});

test('generateIpfAuditDossier produces cryptographic SHA-256 seal and compliant brief', () => {
  const metro = IPF_ARCHETYPES.find(a => a.id === 'metropolitan-academic-neuro')!;
  const settlement = evaluateIpfStay(metro);
  const dossier = generateIpfAuditDossier(
    metro,
    settlement,
    metro.defaultLos,
    metro.defaultEctSessions,
    metro.defaultMsDrg,
    metro.defaultPatientAge,
    metro.defaultComorbidities
  );

  assert.ok(dossier.dossierId.startsWith('IPF-PPS-'));
  assert.ok(dossier.dossierId.endsWith('-2026-FCA'));
  assert.equal(dossier.sha256Hash.length, 64);
  assert.ok(dossier.content.includes('FORM CMS-2552-10 WORKSHEET E-3 PART II'));
  assert.ok(dossier.content.includes(metro.ccn));
  assert.ok(dossier.content.includes('42 CFR Part 412 Subpart N'));
  assert.ok(dossier.content.includes(dossier.sha256Hash));
});
