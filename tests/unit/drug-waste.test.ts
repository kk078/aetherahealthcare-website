import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PART_B_DRUGS,
  DRUG_WASTE_SCENARIOS,
  convertFdaNdcTo11Digit,
  calculateDrugWasteClaim,
  calculateAnnualDrugWasteExposure,
  generateDrugWasteAuditDossier,
} from '../../src/data/drugWasteData';

test('PART_B_DRUGS contains authentic single-dose Part B biologics', () => {
  assert.equal(PART_B_DRUGS.length, 4);
  for (const drug of PART_B_DRUGS) {
    assert.ok(drug.id, 'Drug must have an id');
    assert.ok(drug.hcpcsCode, 'Drug must have HCPCS code');
    assert.ok(drug.aspRatePerBillingUnit > 0, 'Must have positive ASP rate');
    assert.equal(drug.containerType, 'SINGLE_DOSE_VIAL');
    assert.ok(drug.vialConfigurations.length > 0, 'Must have vial configurations');
    for (const v of drug.vialConfigurations) {
      assert.ok(v.fdaNdc10.includes('-'), 'FDA NDC must be hyphenated');
      assert.ok(v.hipaaNdc11.includes('-'), 'HIPAA NDC must be hyphenated');
    }
  }
});

test('convertFdaNdcTo11Digit correctly zero-pads 4-4-2, 5-3-2, and 5-4-1 formats', () => {
  // Format 4-4-2: pad first segment to 5
  assert.equal(convertFdaNdcTo11Digit('0006-3026-02', '4-4-2'), '00006-3026-02');
  assert.equal(convertFdaNdcTo11Digit('0069-0809-01', '4-4-2'), '00069-0809-01');

  // Format 5-3-2: pad second segment to 4
  assert.equal(convertFdaNdcTo11Digit('61755-005-02', '5-3-2'), '61755-0005-02');

  // Format 5-4-1: pad third segment to 2
  assert.equal(convertFdaNdcTo11Digit('12345-1234-1', '5-4-1'), '12345-1234-01');
});

test('calculateDrugWasteClaim creates compliant split claim lines when waste exists', () => {
  const keytruda = PART_B_DRUGS[0]; // Pembrolizumab 100mg vials, $51.25/mg
  // Prescribe 175mg using two 100mg vials (200mg total): 175mg admin, 25mg discarded
  const res = calculateDrugWasteClaim(keytruda, 175, { 100: 2 }, 'COMPLIANT_SPLIT_JW');

  assert.equal(res.administeredMg, 175);
  assert.equal(res.discardedMg, 25);
  assert.equal(res.administeredBillingUnits, 175);
  assert.equal(res.discardedBillingUnits, 25);
  assert.equal(res.wastePercentage, 12.5); // 25 / 200 = 12.5%
  assert.equal(res.exceedsRefundThreshold, true); // 12.5% > 10%
  assert.equal(res.auditComplianceStatus, 'FULLY_COMPLIANT');

  // Must have 2 claim lines
  assert.equal(res.claimLines.length, 2);
  assert.equal(res.claimLines[0].units, 175);
  assert.equal(res.claimLines[0].modifier, null);
  assert.equal(res.claimLines[1].units, 25);
  assert.equal(res.claimLines[1].modifier, '-JW');
});

test('calculateDrugWasteClaim appends mandatory -JZ when zero waste occurs', () => {
  const eylea = PART_B_DRUGS[2]; // Aflibercept 2mg vial
  // Prescribe 2mg using 1x 2mg vial (100% utilized): 2mg admin, 0mg discarded
  const res = calculateDrugWasteClaim(eylea, 2, { 2: 1 }, 'COMPLIANT_SPLIT_JW');

  assert.equal(res.administeredMg, 2);
  assert.equal(res.discardedMg, 0);
  assert.equal(res.wastePercentage, 0);
  assert.equal(res.auditComplianceStatus, 'FULLY_COMPLIANT');

  // Must have 1 claim line with modifier -JZ
  assert.equal(res.claimLines.length, 1);
  assert.equal(res.claimLines[0].units, 2);
  assert.equal(res.claimLines[0].modifier, '-JZ');
});

test('calculateDrugWasteClaim flags rejection risk when -JZ is omitted and FCA risk when waste concealed', () => {
  const keytruda = PART_B_DRUGS[0];

  // 1. Missing -JZ
  const resMissingJz = calculateDrugWasteClaim(keytruda, 100, { 100: 1 }, 'MISSING_JZ_ZERO_WASTE');
  assert.equal(resMissingJz.auditComplianceStatus, 'CRITICAL_REJECTION_RISK');

  // 2. Unbilled waste (rolling 25mg waste into line 1 as administered)
  const resUnbilled = calculateDrugWasteClaim(keytruda, 175, { 100: 2 }, 'UNBILLED_WASTE_ALL_ADMIN');
  assert.equal(resUnbilled.auditComplianceStatus, 'FALSE_CLAIMS_ACT_EXPOSURE');
  assert.equal(resUnbilled.claimLines[0].units, 200); // Erroneously billed total packaged as administered
});

test('calculateAnnualDrugWasteExposure models annual exposure and FCA risk', () => {
  const res = calculateAnnualDrugWasteExposure(100, 5000, 15, 10);
  assert.equal(res.annualEncounters, 1200);
  assert.equal(res.totalDrugSpend, 6000000); // 1200 * $5,000 = $6,000,000
  assert.equal(res.annualDiscardedValue, 900000); // 15% of $6M = $900,000
  assert.ok(res.fcaRecoupmentRisk > res.unbilledLostRevenue, 'FCA exposure includes treble damages');
});

test('generateDrugWasteAuditDossier produces formal USP 797 compounding and Part B audit brief', () => {
  const scenario = DRUG_WASTE_SCENARIOS[0]; // Keytruda scenario
  const drug = PART_B_DRUGS[0];
  const calc = calculateDrugWasteClaim(drug, 175, { 100: 2 }, 'COMPLIANT_SPLIT_JW');
  const brief = generateDrugWasteAuditDossier(scenario, calc);

  assert.ok(brief.includes('USP <797>'), 'Must reference USP 797');
  assert.ok(brief.includes('42 CFR § 414.904'), 'Must cite 42 CFR 414.904');
  assert.ok(brief.includes('J9271'), 'Must include HCPCS J9271');
  assert.ok(brief.includes('-JW'), 'Must include -JW modifier');
  assert.ok(brief.includes('00006-3026-02'), 'Must include zero-padded 11-digit NDC');
  assert.ok(brief.includes('SHA-256[DRUG_WASTE:'), 'Must include audit signature');
});
