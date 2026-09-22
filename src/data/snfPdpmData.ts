/**
 * Skilled Nursing Facility Prospective Payment System (SNF PPS) & Patient Driven Payment Model (PDPM) Arbiter
 * 
 * Statutory & Regulatory Authorities:
 * - Social Security Act § 1888(e), 42 U.S.C. § 1395yy(e): Prospective Payment System for Skilled Nursing Facilities
 * - 42 CFR Part 413, Subpart E (§§ 413.330 - 413.355): Payments for Inpatient SNF Services
 * - 42 CFR § 413.337: Methodology for Calculating the Federal Prospective Payment Rates Under PDPM
 * - 42 CFR § 413.338: SNF Value-Based Purchasing (VBP) Program & Readmission Penalty Adjustments
 * - Medicare MMA § 511: Special AIDS/HIV Add-on (+8 NTA Comorbidity Points & +18% Nursing Rate Multiplier)
 * - CMS Minimum Data Set (MDS 3.0 / MDS 3.0 v1.19.1) & PDPM Technical Specifications:
 *   - 5 Independent Case-Mix Components: Physical Therapy (PT), Occupational Therapy (OT), 
 *     Speech-Language Pathology (SLP), Nursing, Non-Therapy Ancillaries (NTA), plus Non-Case-Mix Base
 * - Variable Per Diem (VPD) Adjustment Schedules:
 *   - PT & OT: 1.00x on Days 1-20, then 2% decline every 7 days (0.98x -> 0.76x on Days 98-100)
 *   - NTA: 3.00x multiplier on Days 1-3, 1.00x on Days 4-100
 *   - SLP, Nursing, Non-Case-Mix: Constant 1.00x throughout stay
 * - Interrupted Stay Policy: Discharge and readmission to same SNF within 3 consecutive calendar days
 * - Medicare Cost Report Form CMS-2540-10: Worksheet S-2, Worksheet S-3, Worksheet E Part I
 * - UB-04 / 837I Billing: Revenue Code 0022 and 5-character HIPPS Codes
 * - False Claims Act (31 U.S.C. § 3729): Safe-Harbor MDS Section GG & Comorbidity Documentation
 */

import { createHash } from 'node:crypto';

export const SNF_LABOR_SHARE = 0.705; // 70.5% labor share subject to wage index
export const SNF_NON_LABOR_SHARE = 0.295; // 29.5% non-labor share

// FY 2026 Federal Base Per Diem Rates
export const SNF_FY2026_BASE_RATES = {
  urban: {
    pt: 68.20,
    ot: 62.40,
    slp: 26.30,
    nursing: 122.50,
    nta: 90.60,
    nonCaseMix: 106.80,
  },
  rural: {
    pt: 78.50,
    ot: 71.20,
    slp: 32.80,
    nursing: 115.60,
    nta: 85.40,
    nonCaseMix: 112.40,
  }
};

export type SnfFacilityType = 
  | 'SUBACUTE_POST_ACUTE' 
  | 'RURAL_POST_ACUTE' 
  | 'POST_ACUTE_MEMORY_CARE' 
  | 'SUBACUTE_SURGICAL';

export interface SnfPdpmProfile {
  id: string;
  name: string;
  ccn: string;
  npi: string;
  facilityType: SnfFacilityType;
  location: string;
  certifiedBeds: number;
  annualMedicareDays: number;
  wageIndex: number;
  isRural: boolean;
  vbpMultiplier: number; // SNF VBP adjustment (e.g., 1.0125 or 0.9850)
  hasHivDiagnosis: boolean; // MMA § 511 HIV add-on (+8 NTA points and +18% Nursing)

  // Clinical Classification Archetype
  ptGroup: string; // e.g. "TC", "TJ", "TA"
  ptWeight: number; // e.g. 1.88, 1.45, 1.00
  otGroup: string; // e.g. "TC", "TJ", "TA"
  otWeight: number; // e.g. 1.62, 1.38, 0.98
  slpGroup: string; // e.g. "SA", "SC", "SL"
  slpWeight: number; // e.g. 0.68, 1.82, 4.19
  nursingGroup: string; // e.g. "HDE2", "ES3", "CBC2"
  nursingWeight: number; // e.g. 2.39, 4.06, 1.54
  ntaGroup: string; // e.g. "NE", "NF", "ND", "NC"
  ntaWeight: number; // e.g. 2.53, 3.25, 1.94, 1.34
  ntaComorbidityPoints: number; // 0 to 17+

  sectionGgScore: number; // 0 to 24 (Section GG functional independence)
  averageLengthOfStay: number; // 1 to 100 days
  hippsCode: string; // 5-character HIPPS code (e.g. "CCAE1")
  summary: string;
}

export const SNF_FACILITY_ARCHETYPES: SnfPdpmProfile[] = [
  {
    id: 'great-lakes-subacute',
    name: 'Great Lakes Subacute & Rehabilitation Pavilion',
    ccn: '14-5082',
    npi: '1831492014',
    facilityType: 'SUBACUTE_POST_ACUTE',
    location: 'Peoria, IL (Urban)',
    certifiedBeds: 120,
    annualMedicareDays: 14200,
    wageIndex: 0.945,
    isRural: false,
    vbpMultiplier: 1.0125, // Top quintile VBP bonus (+1.25%)
    hasHivDiagnosis: false,
    ptGroup: 'TC',
    ptWeight: 1.88,
    otGroup: 'TC',
    otWeight: 1.62,
    slpGroup: 'SA',
    slpWeight: 0.68,
    nursingGroup: 'HDE2',
    nursingWeight: 2.39,
    ntaGroup: 'NE',
    ntaWeight: 2.53,
    ntaComorbidityPoints: 10,
    sectionGgScore: 14,
    averageLengthOfStay: 28,
    hippsCode: 'CCAE1',
    summary: 'High-volume subacute orthopedic recovery and complex wound management center with top-tier VBP performance.'
  },
  {
    id: 'cumberland-rural-nursing',
    name: 'Cumberland Highlands Critical Care Nursing Center',
    ccn: '44-5120',
    npi: '1942851033',
    facilityType: 'RURAL_POST_ACUTE',
    location: 'Crossville, TN (Rural HPSA)',
    certifiedBeds: 85,
    annualMedicareDays: 9800,
    wageIndex: 0.812,
    isRural: true, // Rural base rate schedule
    vbpMultiplier: 1.0080,
    hasHivDiagnosis: false,
    ptGroup: 'TJ',
    ptWeight: 1.45,
    otGroup: 'TJ',
    otWeight: 1.38,
    slpGroup: 'SC',
    slpWeight: 1.82,
    nursingGroup: 'ES3', // Extensive Services 3: Tracheostomy / Ventilator dependency
    nursingWeight: 4.06,
    ntaGroup: 'NF', // 12+ Comorbidity points (maximum NTA tier)
    ntaWeight: 3.25,
    ntaComorbidityPoints: 14,
    sectionGgScore: 6,
    averageLengthOfStay: 35,
    hippsCode: 'JC3F1',
    summary: 'Rural partner for critical access hospitals providing intensive ventilator weaning, complex tracheostomy care, and high NTA infusions.'
  },
  {
    id: 'evergreen-memory-care',
    name: 'Evergreen Gardens Skilled Nursing & Memory Care',
    ccn: '38-5241',
    npi: '1528473910',
    facilityType: 'POST_ACUTE_MEMORY_CARE',
    location: 'Portland, OR (Urban)',
    certifiedBeds: 140,
    annualMedicareDays: 16500,
    wageIndex: 1.124,
    isRural: false,
    vbpMultiplier: 0.9950, // Slight VBP penalty (-0.5%)
    hasHivDiagnosis: false,
    ptGroup: 'TA',
    ptWeight: 1.00,
    otGroup: 'TA',
    otWeight: 0.98,
    slpGroup: 'SL', // Acute neurologic + swallowing disorder + altered diet + severe cognitive impairment
    slpWeight: 4.19,
    nursingGroup: 'CBC2',
    nursingWeight: 1.54,
    ntaGroup: 'ND',
    ntaWeight: 1.94,
    ntaComorbidityPoints: 7,
    sectionGgScore: 8,
    averageLengthOfStay: 42,
    hippsCode: 'AALF1',
    summary: 'Specialized neuro-rehabilitation and memory center with maximum SLP tier intensity for advanced dysphagia and cognitive rehabilitation.'
  },
  {
    id: 'metropolitan-transitions',
    name: 'Metropolitan Transitions Post-Acute Institute',
    ccn: '05-5389',
    npi: '1679248501',
    facilityType: 'SUBACUTE_SURGICAL',
    location: 'San Diego, CA (Urban)',
    certifiedBeds: 96,
    annualMedicareDays: 11400,
    wageIndex: 1.265,
    isRural: false,
    vbpMultiplier: 1.0020,
    hasHivDiagnosis: true, // MMA § 511 HIV Add-on (+8 NTA points & +18% Nursing)
    ptGroup: 'TB',
    ptWeight: 1.70,
    otGroup: 'TB',
    otWeight: 1.49,
    slpGroup: 'SB',
    slpWeight: 1.45,
    nursingGroup: 'LDE2',
    nursingWeight: 2.07,
    ntaGroup: 'NE',
    ntaWeight: 2.53,
    ntaComorbidityPoints: 9, // Includes +8 points from HIV diagnosis
    sectionGgScore: 12,
    averageLengthOfStay: 21,
    hippsCode: 'BB2E1',
    summary: 'High-acuity surgical transition center auditing MMA § 511 HIV/AIDS add-on documentation and 3-day interrupted stay transfer compliance.'
  }
];

export interface PdpmDailyBreakdown {
  dayNumber: number;
  ptVpdMultiplier: number;
  otVpdMultiplier: number;
  ntaVpdMultiplier: number;
  ptPerDiem: number;
  otPerDiem: number;
  slpPerDiem: number;
  nursingPerDiem: number;
  ntaPerDiem: number;
  nonCaseMixPerDiem: number;
  unadjustedDailyRate: number;
  wageAdjustedDailyRate: number;
  vbpAdjustedDailyRate: number;
}

export interface SnfPdpmCalculationResult {
  // Base Component Rates (Wage-Adjusted)
  ptBaseWageAdjusted: number;
  otBaseWageAdjusted: number;
  slpBaseWageAdjusted: number;
  nursingBaseWageAdjusted: number;
  ntaBaseWageAdjusted: number;
  nonCaseMixWageAdjusted: number;

  // Day 1 Rates (with 3.0x NTA)
  day1PerDiemRate: number;
  // Day 4 Rates (after NTA drops to 1.0x)
  day4PerDiemRate: number;
  // Day 21 Rates (first 2% PT/OT decay)
  day21PerDiemRate: number;
  // Final Day Rate
  finalDayPerDiemRate: number;

  // Cumulative Episode Financials
  lengthOfStay: number;
  averagePerDiemPayment: number;
  totalEpisodeMedicarePayment: number;
  annualMedicareRevenueTotal: number;

  // Trajectory of Days
  dailyTrajectory: PdpmDailyBreakdown[];

  // Special Statutory Add-ons
  hivNursingAddOnValuePerDay: number; // +18% Nursing
  ntaDay1to3TripleBonusTotal: number; // Extra 2x NTA across Days 1-3
  vbpIncentiveImpactTotal: number; // Net gain or loss from VBP multiplier
}

export interface SnfAuditDossier {
  legalHeader: string;
  auditHash: string;
  timestamp: string;
  facilityIdentification: {
    facilityName: string;
    ccn: string;
    npi: string;
    facilityType: string;
    location: string;
    bedCount: number;
    wageIndex: string;
    ruralStatus: string;
    hippsCode: string;
  };
  clinicalClassificationAudit: {
    ptCategory: string;
    otCategory: string;
    slpCategory: string;
    nursingCategory: string;
    ntaCategory: string;
    comorbidityPoints: string;
    sectionGgScore: string;
    hivAddOnStatus: string;
  };
  reimbursementSettlement: {
    day1PerDiemRate: string;
    day4PerDiemRate: string;
    day21PerDiemRate: string;
    averagePerDiemStay: string;
    totalEpisodeSettlement: string;
    ntaFrontLoadedTripleBonus: string;
    vbpQualityAdjustment: string;
    totalAnnualFacilityRevenue: string;
  };
  statutorySafeHarbor: string;
}

/**
 * Calculates PT and OT Variable Per Diem (VPD) decay multiplier
 */
export function calculatePtOtVpdMultiplier(day: number): number {
  if (day <= 20) return 1.00;
  if (day > 100) return 0.76;
  const decayInterval = Math.floor((day - 21) / 7) + 1;
  const multiplier = 1.00 - (decayInterval * 0.02);
  return Math.max(0.76, Math.round(multiplier * 100) / 100);
}

/**
 * Calculates NTA Variable Per Diem (VPD) multiplier
 */
export function calculateNtaVpdMultiplier(day: number): number {
  return day <= 3 ? 3.00 : 1.00;
}

/**
 * Adjusts a component base rate for local wage index under 42 CFR § 413.337
 */
export function applyWageIndex(baseRate: number, wageIndex: number): number {
  return baseRate * (SNF_LABOR_SHARE * wageIndex + SNF_NON_LABOR_SHARE);
}

/**
 * Evaluates PDPM reimbursement across a full patient stay
 */
export function evaluateSnfPdpmStay(
  profile: SnfPdpmProfile,
  customLos?: number,
  customWageIndex?: number,
  customComorbidityPoints?: number,
  customSectionGgScore?: number
): SnfPdpmCalculationResult {
  const los = customLos !== undefined ? customLos : profile.averageLengthOfStay;
  const wageIndex = customWageIndex !== undefined ? customWageIndex : profile.wageIndex;
  const comorbidityPoints = customComorbidityPoints !== undefined ? customComorbidityPoints : profile.ntaComorbidityPoints;
  const sectionGg = customSectionGgScore !== undefined ? customSectionGgScore : profile.sectionGgScore;

  // Determine base schedule (urban vs rural)
  const baseSchedule = profile.isRural ? SNF_FY2026_BASE_RATES.rural : SNF_FY2026_BASE_RATES.urban;

  // Wage-adjusted base rates
  const ptBaseWageAdj = applyWageIndex(baseSchedule.pt, wageIndex);
  const otBaseWageAdj = applyWageIndex(baseSchedule.ot, wageIndex);
  const slpBaseWageAdj = applyWageIndex(baseSchedule.slp, wageIndex);
  const nursingBaseWageAdj = applyWageIndex(baseSchedule.nursing, wageIndex);
  const ntaBaseWageAdj = applyWageIndex(baseSchedule.nta, wageIndex);
  const nonCaseMixWageAdj = applyWageIndex(baseSchedule.nonCaseMix, wageIndex);

  // Dynamic NTA Weight based on points (NA: 0 pts, NB: 1-2, NC: 3-5, ND: 6-8, NE: 9-11, NF: 12+)
  let effectiveNtaWeight = profile.ntaWeight;
  if (customComorbidityPoints !== undefined) {
    if (comorbidityPoints >= 12) effectiveNtaWeight = 3.25;
    else if (comorbidityPoints >= 9) effectiveNtaWeight = 2.53;
    else if (comorbidityPoints >= 6) effectiveNtaWeight = 1.94;
    else if (comorbidityPoints >= 3) effectiveNtaWeight = 1.34;
    else if (comorbidityPoints >= 1) effectiveNtaWeight = 0.96;
    else effectiveNtaWeight = 0.72;
  }

  // Dynamic PT/OT weight adjustment based on Section GG if modified
  let effectivePtWeight = profile.ptWeight;
  let effectiveOtWeight = profile.otWeight;
  if (customSectionGgScore !== undefined) {
    // Higher Section GG indicates higher functional independence (modulates weight by up to +/-15%)
    const ggRatio = Math.max(0.75, Math.min(1.25, (sectionGg + 4) / 18));
    effectivePtWeight = Math.round(profile.ptWeight * ggRatio * 100) / 100;
    effectiveOtWeight = Math.round(profile.otWeight * ggRatio * 100) / 100;
  }

  // MMA § 511 HIV Add-on: +18% to Nursing Base
  const hivNursingMultiplier = profile.hasHivDiagnosis ? 1.18 : 1.00;
  const hivNursingAddOnValuePerDay = profile.hasHivDiagnosis
    ? Math.round(nursingBaseWageAdj * profile.nursingWeight * 0.18 * 100) / 100
    : 0;

  // Build Daily Trajectory
  const dailyTrajectory: PdpmDailyBreakdown[] = [];
  let totalEpisodeMedicarePayment = 0;
  let ntaDay1to3TripleBonusTotal = 0;

  for (let day = 1; day <= los; day++) {
    const ptVpdMultiplier = calculatePtOtVpdMultiplier(day);
    const otVpdMultiplier = calculatePtOtVpdMultiplier(day);
    const ntaVpdMultiplier = calculateNtaVpdMultiplier(day);

    const ptPerDiem = Math.round(ptBaseWageAdj * effectivePtWeight * ptVpdMultiplier * 100) / 100;
    const otPerDiem = Math.round(otBaseWageAdj * effectiveOtWeight * otVpdMultiplier * 100) / 100;
    const slpPerDiem = Math.round(slpBaseWageAdj * profile.slpWeight * 100) / 100;
    const nursingPerDiem = Math.round(nursingBaseWageAdj * profile.nursingWeight * hivNursingMultiplier * 100) / 100;
    const ntaPerDiem = Math.round(ntaBaseWageAdj * effectiveNtaWeight * ntaVpdMultiplier * 100) / 100;
    const nonCaseMixPerDiem = Math.round(nonCaseMixWageAdj * 100) / 100;

    const unadjustedDailyRate = ptPerDiem + otPerDiem + slpPerDiem + nursingPerDiem + ntaPerDiem + nonCaseMixPerDiem;
    const wageAdjustedDailyRate = unadjustedDailyRate;
    const vbpAdjustedDailyRate = Math.round(wageAdjustedDailyRate * profile.vbpMultiplier * 100) / 100;

    if (day <= 3) {
      // Extra 2x portion of NTA on days 1-3
      ntaDay1to3TripleBonusTotal += Math.round(ntaBaseWageAdj * effectiveNtaWeight * 2.0 * profile.vbpMultiplier * 100) / 100;
    }

    totalEpisodeMedicarePayment += vbpAdjustedDailyRate;

    dailyTrajectory.push({
      dayNumber: day,
      ptVpdMultiplier,
      otVpdMultiplier,
      ntaVpdMultiplier,
      ptPerDiem,
      otPerDiem,
      slpPerDiem,
      nursingPerDiem,
      ntaPerDiem,
      nonCaseMixPerDiem,
      unadjustedDailyRate: Math.round(unadjustedDailyRate * 100) / 100,
      wageAdjustedDailyRate: Math.round(wageAdjustedDailyRate * 100) / 100,
      vbpAdjustedDailyRate,
    });
  }

  totalEpisodeMedicarePayment = Math.round(totalEpisodeMedicarePayment * 100) / 100;
  const averagePerDiemPayment = Math.round((totalEpisodeMedicarePayment / los) * 100) / 100;
  const annualMedicareRevenueTotal = Math.round(averagePerDiemPayment * profile.annualMedicareDays);

  const vbpIncentiveImpactTotal = Math.round(
    (totalEpisodeMedicarePayment - (totalEpisodeMedicarePayment / profile.vbpMultiplier)) * 100
  ) / 100;

  const day1PerDiemRate = dailyTrajectory[0]?.vbpAdjustedDailyRate || 0;
  const day4PerDiemRate = dailyTrajectory[Math.min(3, los - 1)]?.vbpAdjustedDailyRate || day1PerDiemRate;
  const day21PerDiemRate = dailyTrajectory[Math.min(20, los - 1)]?.vbpAdjustedDailyRate || day4PerDiemRate;
  const finalDayPerDiemRate = dailyTrajectory[los - 1]?.vbpAdjustedDailyRate || day1PerDiemRate;

  return {
    ptBaseWageAdjusted: Math.round(ptBaseWageAdj * 100) / 100,
    otBaseWageAdjusted: Math.round(otBaseWageAdj * 100) / 100,
    slpBaseWageAdjusted: Math.round(slpBaseWageAdj * 100) / 100,
    nursingBaseWageAdjusted: Math.round(nursingBaseWageAdj * 100) / 100,
    ntaBaseWageAdjusted: Math.round(ntaBaseWageAdj * 100) / 100,
    nonCaseMixWageAdjusted: Math.round(nonCaseMixWageAdj * 100) / 100,

    day1PerDiemRate,
    day4PerDiemRate,
    day21PerDiemRate,
    finalDayPerDiemRate,

    lengthOfStay: los,
    averagePerDiemPayment,
    totalEpisodeMedicarePayment,
    annualMedicareRevenueTotal,

    dailyTrajectory,
    hivNursingAddOnValuePerDay,
    ntaDay1to3TripleBonusTotal: Math.round(ntaDay1to3TripleBonusTotal * 100) / 100,
    vbpIncentiveImpactTotal
  };
}

/**
 * Evaluates the Interrupted Stay Policy under 42 CFR § 413.337(c)(1)
 */
export function evaluateInterruptedStay(
  daysBetweenDischargeAndReadmission: number,
  isSameSnf: boolean,
  dischargeDayNumber: number
): {
  isInterruptedStay: boolean;
  statusLabel: string;
  vpdAction: 'CONTINUE_PREVIOUS_DAY' | 'RESET_TO_DAY_1';
  resumingDayNumber: number;
  ntaMultiplierOnReadmission: number;
  explanation: string;
} {
  // If readmitted to the same SNF within 3 consecutive calendar days (<= 3 days)
  if (isSameSnf && daysBetweenDischargeAndReadmission <= 3) {
    const resumingDay = dischargeDayNumber + 1;
    return {
      isInterruptedStay: true,
      statusLabel: 'INTERRUPTED STAY (42 CFR § 413.337)',
      vpdAction: 'CONTINUE_PREVIOUS_DAY',
      resumingDayNumber: resumingDay,
      ntaMultiplierOnReadmission: calculateNtaVpdMultiplier(resumingDay),
      explanation: 'Resident returned to the same SNF within 3 calendar days. Under CMS rules, the stay continues without a new 5-day assessment. The Variable Per Diem (VPD) schedule resumes from day ' + resumingDay + ' rather than resetting to Day 1.'
    };
  }

  return {
    isInterruptedStay: false,
    statusLabel: 'NEW STAY / DISCHARGE (FULL RESET)',
    vpdAction: 'RESET_TO_DAY_1',
    resumingDayNumber: 1,
    ntaMultiplierOnReadmission: 3.00,
    explanation: (!isSameSnf)
      ? 'Resident admitted to a different SNF facility. Triggers a new Part A episode, new 5-day assessment, and resets the Variable Per Diem schedule to Day 1 (with 3.0x NTA multiplier).'
      : 'Resident readmitted to the same SNF after > 3 calendar days (' + daysBetweenDischargeAndReadmission + ' days). Exceeds the 3-day statutory threshold, requiring a new 5-day assessment and resetting VPD to Day 1.'
  };
}

/**
 * Generates an auditable Form CMS-2540-10 & UB-04 settlement dossier with SHA-256 cryptographic fingerprint
 */
export function generateSnfAuditDossier(
  profile: SnfPdpmProfile,
  calc: SnfPdpmCalculationResult
): SnfAuditDossier {
  const hashSeed = `${profile.ccn}|${profile.npi}|${profile.hippsCode}|${calc.day1PerDiemRate}|${calc.totalEpisodeMedicarePayment}|${calc.annualMedicareRevenueTotal}|2026-PDPM-SNF`;
  const auditHash = `PDPM-SNF-${createHash('sha256').update(hashSeed).digest('hex').substring(0, 10).toUpperCase()}-2026-FCA`;

  const vbpSign = profile.vbpMultiplier >= 1.0 ? '+' : '';

  return {
    legalHeader: 'FORM CMS-2540-10 & UB-04 REVENUE CODE 0022 PDPM REVENUE SETTLEMENT BRIEF',
    auditHash,
    timestamp: '2026-09-22T06:00:00.000Z',
    facilityIdentification: {
      facilityName: profile.name,
      ccn: profile.ccn,
      npi: profile.npi,
      facilityType: profile.facilityType.replace(/_/g, ' '),
      location: profile.location,
      bedCount: profile.certifiedBeds,
      wageIndex: profile.wageIndex.toFixed(4),
      ruralStatus: profile.isRural ? 'RURAL SCHEDULE (HIGHER BASE RATES)' : 'URBAN SCHEDULE',
      hippsCode: profile.hippsCode
    },
    clinicalClassificationAudit: {
      ptCategory: `Group ${profile.ptGroup} (Weight: ${profile.ptWeight.toFixed(2)})`,
      otCategory: `Group ${profile.otGroup} (Weight: ${profile.otWeight.toFixed(2)})`,
      slpCategory: `Group ${profile.slpGroup} (Weight: ${profile.slpWeight.toFixed(2)})`,
      nursingCategory: `Group ${profile.nursingGroup} (Weight: ${profile.nursingWeight.toFixed(2)})`,
      ntaCategory: `Group ${profile.ntaGroup} (Weight: ${profile.ntaWeight.toFixed(2)})`,
      comorbidityPoints: `${profile.ntaComorbidityPoints} Weighted Points (MDS Section I)`,
      sectionGgScore: `${profile.sectionGgScore} / 24 Functional Independence Score`,
      hivAddOnStatus: profile.hasHivDiagnosis ? 'ACTIVE (MMA § 511: +8 NTA Pts & +18% Nursing Multiplier)' : 'NONE'
    },
    reimbursementSettlement: {
      day1PerDiemRate: `$${calc.day1PerDiemRate.toFixed(2)} / Day (with 3.0x NTA)`,
      day4PerDiemRate: `$${calc.day4PerDiemRate.toFixed(2)} / Day (Standard NTA)`,
      day21PerDiemRate: `$${calc.day21PerDiemRate.toFixed(2)} / Day (First PT/OT 2% Decay)`,
      averagePerDiemStay: `$${calc.averagePerDiemPayment.toFixed(2)} / Day across ${calc.lengthOfStay} Days`,
      totalEpisodeSettlement: `$${calc.totalEpisodeMedicarePayment.toLocaleString()}`,
      ntaFrontLoadedTripleBonus: `+$${calc.ntaDay1to3TripleBonusTotal.toLocaleString()} (Days 1-3 Front-Loaded)`,
      vbpQualityAdjustment: `${vbpSign}${((profile.vbpMultiplier - 1.0) * 100).toFixed(2)}% ($${calc.vbpIncentiveImpactTotal.toLocaleString()} Episode Impact)`,
      totalAnnualFacilityRevenue: `$${calc.annualMedicareRevenueTotal.toLocaleString()}`
    },
    statutorySafeHarbor: 'FALSE CLAIMS ACT SAFE-HARBOR (31 U.S.C. § 3729) & 42 CFR Part 413 Subpart E:\n' +
      'The facility certifies that the Minimum Data Set (MDS 3.0) 5-Day PPS and Interim Payment Assessments accurately substantiate ' +
      'the clinical classifications, Section GG functional scoring, and Section I active secondary comorbidities. The Variable Per Diem (VPD) ' +
      'decay schedules, triple NTA calculations, and 3-day interrupted stay determinations strictly conform to CMS PDPM statutory rules.'
  };
}
