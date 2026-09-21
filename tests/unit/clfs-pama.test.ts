import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CLFS_LABORATORY_ARCHETYPES,
  CLFS_TEST_CATALOG,
  DEFAULT_PAYER_TIERS_80053,
  calculateWeightedMedian,
  evaluateClfsPamaSettlement,
  generateClfsPamaAuditDossier,
  type PrivatePayerRateTier,
} from '../../src/data/clfsPamaData';

test('CLFS_LABORATORY_ARCHETYPES contains 4 authentic lab profiles with CLIA certification', () => {
  assert.equal(CLFS_LABORATORY_ARCHETYPES.length, 4);

  const national = CLFS_LABORATORY_ARCHETYPES.find(l => l.labType === 'INDEPENDENT_REFERENCE')!;
  assert.ok(national);
  assert.equal(national.cliaNumber, '36D0652840');
  assert.equal(national.reportingComplianceStatus, 'COMPLIANT');

  const outreach = CLFS_LABORATORY_ARCHETYPES.find(l => l.labType === 'HOSPITAL_OUTREACH')!;
  assert.ok(outreach);
  assert.equal(outreach.usesHospitalTob14x, true);

  const adlt = CLFS_LABORATORY_ARCHETYPES.find(l => l.labType === 'MOLECULAR_ADLT_HUB')!;
  assert.ok(adlt);

  const cah = CLFS_LABORATORY_ARCHETYPES.find(l => l.labType === 'RURAL_CAH_LAB')!;
  assert.ok(cah);
  assert.equal(cah.reportingComplianceStatus, 'EXEMPT_BELOW_THRESHOLD');
});

test('evaluateClfsPamaSettlement correctly determines Applicable Laboratory status under 42 CFR § 414.504', () => {
  const nationalLab = CLFS_LABORATORY_ARCHETYPES.find(l => l.id === 'national-reference-lab')!;
  const hospitalOutreachLab = CLFS_LABORATORY_ARCHETYPES.find(l => l.id === 'hospital-outreach-center')!;
  const cahLab = CLFS_LABORATORY_ARCHETYPES.find(l => l.id === 'rural-cah-lab')!;
  const cmpTest = CLFS_TEST_CATALOG.find(t => t.cptCode === '80053')!;

  // 1. National Reference Lab has >50% revenues from CLFS/PFS and >$12,500
  const resNational = evaluateClfsPamaSettlement(nationalLab, cmpTest, DEFAULT_PAYER_TIERS_80053);
  assert.equal(resNational.isApplicableLaboratory, true);
  assert.ok(resNational.majorityMedicareRevenuePercent > 50);
  assert.equal(resNational.meetsLowExpenditureThreshold, true);
  assert.ok(resNational.applicabilitySubstantiation.includes('MANDATORY APPLICABLE LAB'));

  // 2. Hospital Outreach Lab bills on 14x TOB and meets majority test
  const resOutreach = evaluateClfsPamaSettlement(hospitalOutreachLab, cmpTest, DEFAULT_PAYER_TIERS_80053);
  assert.equal(resOutreach.isApplicableLaboratory, true);
  assert.ok(resOutreach.majorityMedicareRevenuePercent > 50);

  // 3. CAH Lab is exempt under cost-based reimbursement and <$12,500
  const resCah = evaluateClfsPamaSettlement(cahLab, cmpTest, DEFAULT_PAYER_TIERS_80053);
  assert.equal(resCah.isApplicableLaboratory, false);
  assert.ok(resCah.applicabilitySubstantiation.includes('EXEMPT'));
});

test('calculateWeightedMedian accurately computes the volume-weighted median of private payer rates', () => {
  const mockTiers: PrivatePayerRateTier[] = [
    { payerName: 'Payer A', payerType: 'COMMERCIAL_PPO', allowedRate: 6.00, paidVolume: 100 },
    { payerName: 'Payer B', payerType: 'COMMERCIAL_PPO', allowedRate: 8.00, paidVolume: 300 }, // Total = 400
    { payerName: 'Payer C', payerType: 'COMMERCIAL_HMO', allowedRate: 10.00, paidVolume: 400 }, // Total = 800
    { payerName: 'Payer D', payerType: 'MEDICARE_ADVANTAGE', allowedRate: 12.00, paidVolume: 200 }, // Total = 1000
  ];

  // Total volume = 1000. Median target = 500.
  // Cumulative:
  // Rate 6.00: 100
  // Rate 8.00: 100 + 300 = 400
  // Rate 10.00: 400 + 400 = 800 (crosses 500!) -> Weighted Median = 10.00
  const { weightedMedian, totalVolume } = calculateWeightedMedian(mockTiers);
  assert.equal(totalVolume, 1000);
  assert.equal(weightedMedian, 10.00);
});

test('evaluateClfsPamaSettlement enforces the statutory 15% phase-in reduction cap under SSA § 1834A(b)(3)', () => {
  const nationalLab = CLFS_LABORATORY_ARCHETYPES.find(l => l.id === 'national-reference-lab')!;
  const cmpTest = CLFS_TEST_CATALOG.find(t => t.cptCode === '80053')!;

  // Current CLFS rate for CMP 80053 is $10.65
  // 15% max reduction floor = $10.65 * 0.85 = $9.0525
  // If private payer weighted median is severely depressed (e.g. $7.50), the rate MUST be capped at $9.0525
  const depressedTiers: PrivatePayerRateTier[] = [
    { payerName: 'Aggressive PPO', payerType: 'COMMERCIAL_PPO', allowedRate: 7.50, paidVolume: 50000 },
  ];

  const res = evaluateClfsPamaSettlement(nationalLab, cmpTest, depressedTiers);
  assert.equal(res.weightedMedianRate, 7.50);
  assert.ok(Math.abs(res.statutoryCappedRate - 10.65 * 0.85) < 0.01);
  assert.ok(Math.abs(res.finalSettledMedicareRate - 9.0525) < 0.01);
  assert.ok(res.phaseInProtectionSavingsPerTest > 1.50);
  assert.ok(res.annualPhaseInProtectionValue > 0);
});

test('evaluateClfsPamaSettlement evaluates ADLT New initial period list charge vs 130% recoupment rule under 42 CFR § 414.522', () => {
  const genomicAdltLab = CLFS_LABORATORY_ARCHETYPES.find(l => l.id === 'genomic-adlt-institute')!;
  const adltNewTest = CLFS_TEST_CATALOG.find(t => t.cptCode === '0242U')!;

  // New ADLT CPT 0242U with initial list charge $5,800.00
  // Case 1: Market weighted median = $4,950.00.
  // 130% threshold = $4,950 * 1.30 = $6,435.00.
  // List charge ($5,800) is <= $6,435.00 -> No clawback!
  const compliantTiers: PrivatePayerRateTier[] = [
    { payerName: 'Genomic Commercial Payer', payerType: 'COMMERCIAL_PPO', allowedRate: 4950.00, paidVolume: 500 },
  ];
  const resCompliant = evaluateClfsPamaSettlement(genomicAdltLab, adltNewTest, compliantTiers, 5800.00);
  assert.equal(resCompliant.isAdlt, true);
  assert.ok(Math.abs(resCompliant.listChargeRecoupmentThreshold - 6435.00) < 0.01);
  assert.equal(resCompliant.exceeds130PercentThreshold, false);
  assert.equal(resCompliant.clawbackExposurePerTest, 0);

  // Case 2: Excessive List Charge of $7,000.00 (> $6,435.00)
  // Clawback per test = $7,000 - $4,950 = $2,050.00 per test!
  const resExcessive = evaluateClfsPamaSettlement(genomicAdltLab, adltNewTest, compliantTiers, 7000.00);
  assert.equal(resExcessive.exceeds130PercentThreshold, true);
  assert.equal(resExcessive.clawbackExposurePerTest, 2050.00);
  assert.ok(resExcessive.annualAdltClawbackExposure > 0);
});

test('evaluateClfsPamaSettlement calculates Civil Monetary Penalty (CMP) exposure under 42 U.S.C. § 1395m-1(a)(9)', () => {
  const nationalLab = CLFS_LABORATORY_ARCHETYPES.find(l => l.id === 'national-reference-lab')!;
  const cahLab = CLFS_LABORATORY_ARCHETYPES.find(l => l.id === 'rural-cah-lab')!;
  const cmpTest = CLFS_TEST_CATALOG.find(t => t.cptCode === '80053')!;

  // 30 days late reporting for mandatory applicable lab
  const resLate = evaluateClfsPamaSettlement(nationalLab, cmpTest, DEFAULT_PAYER_TIERS_80053, undefined, 30);
  assert.equal(resLate.cmpDailyPenaltyRate, 10000);
  assert.equal(resLate.potentialCmpPenaltyExposure, 300000); // 30 * $10,000

  // Exempt lab has 0 CMP exposure even if days are late
  const resCahLate = evaluateClfsPamaSettlement(cahLab, cmpTest, DEFAULT_PAYER_TIERS_80053, undefined, 30);
  assert.equal(resCahLate.potentialCmpPenaltyExposure, 0);
});

test('generateClfsPamaAuditDossier produces compliant CMS Form 116 / PAMA Section 216 Audit Dossier with SHA-256 hash', () => {
  const nationalLab = CLFS_LABORATORY_ARCHETYPES.find(l => l.id === 'national-reference-lab')!;
  const cmpTest = CLFS_TEST_CATALOG.find(t => t.cptCode === '80053')!;

  const calc = evaluateClfsPamaSettlement(nationalLab, cmpTest, DEFAULT_PAYER_TIERS_80053);
  const dossier = generateClfsPamaAuditDossier(nationalLab, cmpTest, calc);

  assert.match(dossier.auditHash, /^CLFS-PAMA-[0-9A-F]{8}-2026-FCA$/);
  assert.ok(dossier.legalHeader.includes('CMS FORM 116 / PAMA SECTION 216'));
  assert.equal(dossier.applicableLabDetermination.cliaNumber, '36D0652840');
  assert.ok(dossier.pamaRateSettlement.testCode.includes('80053'));
  assert.ok(dossier.cmpSafeHarborCertification.includes('STATUTORY CMP COMPLIANCE CERTIFICATION'));
});
