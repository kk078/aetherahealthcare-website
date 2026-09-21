import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ESRD_FACILITY_ARCHETYPES,
  calculateEsrdPpsReimbursement,
  generateEsrdAuditDossier,
  type DialysisEncounterCase,
} from '../../src/data/esrdKccData';

test('ESRD_FACILITY_ARCHETYPES contains authentic dialysis facilities with valid regulatory parameters', () => {
  assert.equal(ESRD_FACILITY_ARCHETYPES.length, 4);

  const urban = ESRD_FACILITY_ARCHETYPES.find((f) => f.facilityType === 'LARGE_URBAN_IN_CENTER')!;
  assert.ok(urban, 'Urban facility must exist');
  assert.equal(urban.qualifiesLowVolume, false, 'Large facility does not qualify for LVPA');
  assert.ok(urban.annualTreatmentsFurnished > 4000);

  const rural = ESRD_FACILITY_ARCHETYPES.find((f) => f.facilityType === 'RURAL_LOW_VOLUME')!;
  assert.ok(rural, 'Rural facility must exist');
  assert.equal(rural.qualifiesLowVolume, true, 'Rural facility qualifies for 18.9% LVPA');
  assert.equal(rural.isRural, true);
  assert.ok(rural.annualTreatmentsFurnished < 4000);

  const home = ESRD_FACILITY_ARCHETYPES.find((f) => f.facilityType === 'HOME_MODALITY_TRAINING')!;
  assert.ok(home, 'Home facility must exist');
  assert.ok(home.homeModalitySharePercent > 50.0);
  assert.equal(home.kccModelParticipant, true);

  const ped = ESRD_FACILITY_ARCHETYPES.find((f) => f.facilityType === 'ACADEMIC_PEDIATRIC')!;
  assert.ok(ped, 'Pediatric facility must exist');
});

test('calculateEsrdPpsReimbursement calculates accurate wage-adjusted base rate', () => {
  const facility = ESRD_FACILITY_ARCHETYPES[0]; // Urban, Wage Index = 1.2854, Labor Share = 55.2%
  const encounter: DialysisEncounterCase = {
    patientAge: 55,
    isPediatric: false,
    heightCm: 175,
    weightKg: 75,
    modality: 'IN_CENTER_HEMODIALYSIS',
    isOnsetOfDialysis: false,
    hasAcuteComorbidity: false,
    hasChronicComorbidity: false,
    isHomeTrainingSession: false,
    receivesTdapaInnovativeDrug: false,
    treatmentUnits: 1,
  };

  const res = calculateEsrdPpsReimbursement(facility, encounter);
  assert.equal(res.cy2025BaseRate, 273.82);

  const expectedWageFactor = (1 - 0.552) + (0.552 * 1.2854);
  const expectedWageAdjustedBase = 273.82 * expectedWageFactor;
  assert.ok(Math.abs(res.wageAdjustedBaseRate - expectedWageAdjustedBase) < 0.01);
});

test('calculateEsrdPpsReimbursement applies 1.510 Onset of Dialysis multiplier for first 120 days', () => {
  const facility = ESRD_FACILITY_ARCHETYPES[0];
  const onsetEncounter: DialysisEncounterCase = {
    patientAge: 55,
    isPediatric: false,
    heightCm: 175,
    weightKg: 75,
    modality: 'IN_CENTER_HEMODIALYSIS',
    isOnsetOfDialysis: true, // First 120 days
    hasAcuteComorbidity: false,
    hasChronicComorbidity: false,
    isHomeTrainingSession: false,
    receivesTdapaInnovativeDrug: false,
    treatmentUnits: 1,
  };

  const res = calculateEsrdPpsReimbursement(facility, onsetEncounter);
  assert.equal(res.onsetMultiplier, 1.510);
  assert.ok(res.compositePatientMultiplier >= 1.510);
});

test('calculateEsrdPpsReimbursement applies 18.9% Low-Volume Payment Adjustment (LVPA) and Rural factor', () => {
  const ruralFacility = ESRD_FACILITY_ARCHETYPES[1]; // Rural Low Volume (<4,000 treatments)
  const encounter: DialysisEncounterCase = {
    patientAge: 62,
    isPediatric: false,
    heightCm: 170,
    weightKg: 70,
    modality: 'IN_CENTER_HEMODIALYSIS',
    isOnsetOfDialysis: false,
    hasAcuteComorbidity: false,
    hasChronicComorbidity: false,
    isHomeTrainingSession: false,
    receivesTdapaInnovativeDrug: false,
    treatmentUnits: 1,
  };

  const res = calculateEsrdPpsReimbursement(ruralFacility, encounter);
  assert.equal(res.lowVolumeMultiplier, 1.189);
  assert.equal(res.ruralMultiplier, 1.008);
  assert.ok(Math.abs(res.compositeFacilityMultiplier - (1.189 * 1.008)) < 0.001);
  assert.ok(res.annualLowVolumeLifelineValue > 0);
});

test('calculateEsrdPpsReimbursement incorporates Home Training Add-on ($95.60) and TDAPA ($142.50)', () => {
  const homeFacility = ESRD_FACILITY_ARCHETYPES[2];
  const homeTrainingEncounter: DialysisEncounterCase = {
    patientAge: 48,
    isPediatric: false,
    heightCm: 168,
    weightKg: 65,
    modality: 'PERITONEAL_DIALYSIS',
    isOnsetOfDialysis: false,
    hasAcuteComorbidity: false,
    hasChronicComorbidity: false,
    isHomeTrainingSession: true,
    receivesTdapaInnovativeDrug: true,
    treatmentUnits: 1,
  };

  const res = calculateEsrdPpsReimbursement(homeFacility, homeTrainingEncounter);
  assert.equal(res.homeTrainingAddOn, 95.60);
  assert.equal(res.tdapaPayment, 142.50);
  assert.equal(res.grossPaymentPerTreatment, res.finalBundledRatePerTreatment + 95.60 + 142.50);
});

test('calculateEsrdPpsReimbursement penalizes up to 2.0% under ESRD QIP when score is low', () => {
  const facility = ESRD_FACILITY_ARCHETYPES[0];
  const encounter: DialysisEncounterCase = {
    patientAge: 55,
    isPediatric: false,
    heightCm: 175,
    weightKg: 75,
    modality: 'IN_CENTER_HEMODIALYSIS',
    isOnsetOfDialysis: false,
    hasAcuteComorbidity: false,
    hasChronicComorbidity: false,
    isHomeTrainingSession: false,
    receivesTdapaInnovativeDrug: false,
    treatmentUnits: 1,
  };

  // Score = 35 (< 36 points -> 2% maximum penalty)
  const lowScoreRes = calculateEsrdPpsReimbursement(facility, encounter, { customQipScore: 35.0 });
  assert.equal(lowScoreRes.qipPenaltyPercent, 0.02);
  assert.ok(lowScoreRes.qipDeductionPerTreatment > 0);
  assert.equal(lowScoreRes.netPaymentPerTreatment, lowScoreRes.grossPaymentPerTreatment - lowScoreRes.qipDeductionPerTreatment);

  // Score = 85 (Compliant -> 0% penalty)
  const highScoreRes = calculateEsrdPpsReimbursement(facility, encounter, { customQipScore: 85.0 });
  assert.equal(highScoreRes.qipPenaltyPercent, 0.0);
  assert.equal(highScoreRes.qipDeductionPerTreatment, 0.0);
});

test('generateEsrdAuditDossier outputs complete Form CMS-2552 Worksheet I audit brief', () => {
  const facility = ESRD_FACILITY_ARCHETYPES[1];
  const encounter: DialysisEncounterCase = {
    patientAge: 62,
    isPediatric: false,
    heightCm: 170,
    weightKg: 70,
    modality: 'IN_CENTER_HEMODIALYSIS',
    isOnsetOfDialysis: false,
    hasAcuteComorbidity: true,
    acuteComorbidityType: 'GI_BLEED',
    hasChronicComorbidity: false,
    isHomeTrainingSession: false,
    receivesTdapaInnovativeDrug: false,
    treatmentUnits: 1,
  };

  const calc = calculateEsrdPpsReimbursement(facility, encounter);
  const dossier = generateEsrdAuditDossier(facility, encounter, calc);

  assert.ok(dossier.dossierId.includes('CMS-ESRD-PPS-'));
  assert.ok(dossier.auditHash.startsWith('ESRD-PPS-'));
  assert.ok(dossier.legalHeader.includes('CMS FORM 2552-10 WORKSHEET I-4'));
  assert.ok(dossier.ppsPaymentCalculation['CY 2025 Federal Base Rate (CMS-1805-F)']);
  assert.ok(String(dossier.statutoryAdjustments['Low-Volume Payment Adjustment (42 CFR § 413.232(b))']).includes('QUALIFIED'));
  assert.ok(dossier.kccQualityDefenseBrief.includes('Social Security Act'));
});
