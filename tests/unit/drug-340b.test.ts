import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COVERED_ENTITY_ARCHETYPES,
  SAMPLE_SPLIT_BILLING_ENCOUNTERS,
  adjudicate340bEncounter,
  calculateAnnual340bExposure,
  generate340bAuditDossier,
} from '../../src/data/drug340bData';

test('COVERED_ENTITY_ARCHETYPES contains authentic covered entities with valid statutory thresholds', () => {
  assert.equal(COVERED_ENTITY_ARCHETYPES.length, 4);

  const dsh = COVERED_ENTITY_ARCHETYPES.find((e) => e.entityType === 'DSH')!;
  assert.ok(dsh, 'DSH must exist');
  assert.ok(dsh.dshAdjustmentPercentage > 11.75, 'DSH must exceed 11.75% threshold');
  assert.equal(dsh.gpoProhibitionApplies, true, 'GPO prohibition applies to DSH');
  assert.equal(dsh.orphanDrugExclusionApplies, false, 'Orphan drug exclusion does not apply to DSH');

  const sch = COVERED_ENTITY_ARCHETYPES.find((e) => e.entityType === 'SCH')!;
  assert.ok(sch, 'SCH must exist');
  assert.ok(sch.dshAdjustmentPercentage >= 8.0, 'SCH must meet or exceed 8.0% threshold');
  assert.equal(sch.orphanDrugExclusionApplies, true, 'Orphan exclusion applies to SCH');

  const cah = COVERED_ENTITY_ARCHETYPES.find((e) => e.entityType === 'CAH')!;
  assert.ok(cah, 'CAH must exist');
  assert.equal(cah.orphanDrugExclusionApplies, true, 'Orphan exclusion applies to CAH');

  const fqhc = COVERED_ENTITY_ARCHETYPES.find((e) => e.entityType === 'FQHC')!;
  assert.ok(fqhc, 'FQHC must exist');
  assert.equal(fqhc.gpoProhibitionApplies, false, 'GPO prohibition does not apply to FQHC');
});

test('adjudicate340bEncounter allocates eligible outpatient infusion to 340B pricing with cost savings', () => {
  const dsh = COVERED_ENTITY_ARCHETYPES[0];
  const keytrudaEnc = SAMPLE_SPLIT_BILLING_ENCOUNTERS[0]; // Outpatient, credentialed, commercial

  const res = adjudicate340bEncounter(dsh, keytrudaEnc);
  assert.equal(res.allocation, '340B_ELIGIBLE');
  assert.equal(res.purchaseAccount, '340B');
  assert.equal(res.acquisitionCost, 200 * 32.50); // 6,500
  assert.equal(res.savingsVsWac, 200 * (54.00 - 32.50)); // 4,300
  assert.equal(res.complianceWarning, null);
  assert.equal(res.duplicateDiscountRisk, false);
});

test('adjudicate340bEncounter strictly prohibits 340B on inpatient admissions under prospective DRG', () => {
  const dsh = COVERED_ENTITY_ARCHETYPES[0];
  const inpatientEnc = SAMPLE_SPLIT_BILLING_ENCOUNTERS[3]; // Inpatient Bed

  const res = adjudicate340bEncounter(dsh, inpatientEnc);
  assert.equal(res.allocation, 'GPO_INPATIENT_ONLY');
  assert.equal(res.purchaseAccount, 'GPO');
  assert.ok(res.reason.includes('Inpatient admission'));
});

test('adjudicate340bEncounter flags diversion when ordering provider is not credentialed', () => {
  const dsh = COVERED_ENTITY_ARCHETYPES[0];
  const keytrudaEnc = {
    ...SAMPLE_SPLIT_BILLING_ENCOUNTERS[0],
    orderingProviderCredentialed: false, // Violates 3-part test
  };

  const res = adjudicate340bEncounter(dsh, keytrudaEnc);
  assert.equal(res.allocation, 'STATUTORY_VIOLATION_DIVERSION');
  assert.equal(res.purchaseAccount, 'WAC');
  assert.equal(res.savingsVsWac, 0);
  assert.ok(res.complianceWarning!.includes('Diversion Hazard'));
});

test('adjudicate340bEncounter enforces statutory Orphan Drug Exclusion for SCH and CAH entities', () => {
  const sch = COVERED_ENTITY_ARCHETYPES[1]; // SCH Highland Regional
  const darzalexEnc = SAMPLE_SPLIT_BILLING_ENCOUNTERS[2]; // Darzalex is orphan designated

  const res = adjudicate340bEncounter(sch, darzalexEnc);
  assert.equal(res.allocation, 'WAC_NON_ELIGIBLE');
  assert.equal(res.purchaseAccount, 'WAC');
  assert.equal(res.orphanDrugViolationRisk, true);
  assert.ok(res.reason.includes('Orphan Drug Exclusion'));
});

test('adjudicate340bEncounter prevents Medicaid duplicate discounts under Carve-Out policy', () => {
  const sch = COVERED_ENTITY_ARCHETYPES[1]; // SCH uses Carve-Out
  const medicaidEnc = SAMPLE_SPLIT_BILLING_ENCOUNTERS[1]; // Medicaid FFS

  const res = adjudicate340bEncounter(sch, medicaidEnc);
  assert.equal(res.allocation, 'WAC_NON_ELIGIBLE');
  assert.equal(res.purchaseAccount, 'WAC');
  assert.equal(res.duplicateDiscountRisk, true);
  assert.ok(res.reason.includes('Medicaid Carve-Out Policy'));
});

test('calculateAnnual340bExposure accurately models annual savings, audit risk, and charity reinvestment', () => {
  const dsh = COVERED_ENTITY_ARCHETYPES[0];
  const exp = calculateAnnual340bExposure(dsh);

  assert.equal(exp.annualRxUnits, 14500 * 12);
  assert.ok(exp.annualGrossWacSpend > 0);
  assert.ok(exp.annualGross340bSavings > 0);
  assert.ok(exp.net340bBenefitCaptured > 0);
  assert.ok(exp.communityBenefitRatio > 0);
});

test('generate340bAuditDossier produces complete HRSA OPAIS defense dossier', () => {
  const dsh = COVERED_ENTITY_ARCHETYPES[0];
  const exp = calculateAnnual340bExposure(dsh);
  const dossier = generate340bAuditDossier(dsh, exp);

  assert.ok(dossier.dossierId.includes('HRSA-OPAIS-AUDIT-'));
  assert.ok(dossier.auditHash.startsWith('340B-HRSA-'));
  assert.ok(dossier.legalHeader.includes('HRSA OFFICE OF PHARMACY AFFAIRS'));
  assert.ok(dossier.coveredEntityVerification['CMS Form 2552 Worksheet E, Part A Line 33 DSH%']);
  assert.ok(dossier.splitBillingPolicyCompliance['Mixed-Use Virtual Accumulator']);
  assert.ok(dossier.statutorySafeHarborBrief.includes('42 U.S.C. § 256b'));
});
