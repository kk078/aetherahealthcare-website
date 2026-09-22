'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Calendar,
  TrendingDown,
  TrendingUp,
  Sliders,
  FileCheck,
  Copy,
  Check,
  Activity,
  ShieldCheck,
  Scale,
  DollarSign,
  Layers,
  Syringe,
  Sparkles
} from 'lucide-react';
import {
  SNF_FACILITY_ARCHETYPES,
  evaluateSnfPdpmStay,
  evaluateInterruptedStay,
  generateSnfAuditDossier,
  type SnfPdpmProfile
} from '@/data/snfPdpmData';

export const SnfPdpmArbiter: React.FC = () => {
  // Active Profile & Tab
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('great-lakes-subacute');
  const [activeTab, setActiveTab] = useState<'case_mix' | 'vpd_trajectory' | 'comorbidity_hiv' | 'interrupted_stay'>('case_mix');

  // Interactive Sliders
  const [customLos, setCustomLos] = useState<number>(28);
  const [customPoints, setCustomPoints] = useState<number>(10);
  const [customSectionGg, setCustomSectionGg] = useState<number>(14);

  // Interrupted Stay Simulator State
  const [interruptedDaysGap, setInterruptedDaysGap] = useState<number>(2);
  const [isSameSnfFacility, setIsSameSnfFacility] = useState<boolean>(true);
  const [interruptedDischargeDay, setInterruptedDischargeDay] = useState<number>(6);

  // Modal State
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);

  // Active Facility Profile
  const activeFacility: SnfPdpmProfile = useMemo(() => {
    return SNF_FACILITY_ARCHETYPES.find((f) => f.id === selectedFacilityId) || SNF_FACILITY_ARCHETYPES[0];
  }, [selectedFacilityId]);

  // Handle Archetype Switch
  const handleFacilityChange = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    const target = SNF_FACILITY_ARCHETYPES.find((f) => f.id === facilityId);
    if (target) {
      setCustomLos(target.averageLengthOfStay);
      setCustomPoints(target.ntaComorbidityPoints);
      setCustomSectionGg(target.sectionGgScore);
    }
  };

  // Deterministic PDPM Calculation
  const calcResult = useMemo(() => {
    return evaluateSnfPdpmStay(
      activeFacility,
      customLos,
      undefined,
      customPoints,
      customSectionGg
    );
  }, [activeFacility, customLos, customPoints, customSectionGg]);

  // Interrupted Stay Evaluation
  const interruptedEval = useMemo(() => {
    return evaluateInterruptedStay(
      interruptedDaysGap,
      isSameSnfFacility,
      interruptedDischargeDay
    );
  }, [interruptedDaysGap, isSameSnfFacility, interruptedDischargeDay]);

  // Audit Dossier
  const dossier = useMemo(() => {
    return generateSnfAuditDossier(activeFacility, calcResult);
  }, [activeFacility, calcResult]);

  const handleCopyDossier = () => {
    const text = `${dossier.legalHeader}\n` +
      `Audit Hash: ${dossier.auditHash}\n` +
      `Timestamp: ${dossier.timestamp}\n\n` +
      `FACILITY IDENTIFICATION & CLASSIFICATION:\n` +
      Object.entries(dossier.facilityIdentification).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\nPDPM CLINICAL CLASSIFICATION & HIPPS AUDIT:\n` +
      Object.entries(dossier.clinicalClassificationAudit).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\nREIMBURSEMENT SETTLEMENT & EPISODE BREAKDOWN:\n` +
      Object.entries(dossier.reimbursementSettlement).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\n${dossier.statutorySafeHarbor}`;

    navigator.clipboard.writeText(text);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <section
      id="snf-pdpm-arbiter"
      aria-label="Skilled Nursing Facility (SNF) PPS & Patient Driven Payment Model (PDPM) Arbiter"
      className="py-20 md:py-28 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-teal-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-blue-500/10 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <Activity className="h-4 w-4 text-teal-400" />
            42 CFR Part 413 Subpart E • SSA § 1888(e) • Form CMS-2540-10
          </div>
          <h2 className="font-jakarta text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            SNF PPS &amp; Patient Driven Payment Model (PDPM) Arbiter
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Deterministic case-mix reimbursement modeling for Skilled Nursing Facilities under PDPM.
            Audit the 5 independent case-mix components (PT, OT, SLP, Nursing, NTA), Variable Per Diem (VPD) decay trajectories,
            3.0x front-loaded NTA bonus, MMA § 511 HIV add-ons, and 3-day interrupted stay transfer compliance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-teal-300">
              70.5% Labor Share (Wage Adjusted)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-300">
              Days 1-3 Triple NTA: 3.00x Multiplier
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-sky-300">
              PT/OT 2% Decay Every 7 Days Post-Day 20
            </span>
          </div>
        </div>

        {/* Archetype Selector Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-teal-400" />
              Select Facility Archetype &amp; Clinical Casemix
            </span>
            <span>{SNF_FACILITY_ARCHETYPES.length} Regulated Profiles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SNF_FACILITY_ARCHETYPES.map((facility) => {
              const isSelected = facility.id === selectedFacilityId;
              return (
                <button
                  key={facility.id}
                  onClick={() => handleFacilityChange(facility.id)}
                  type="button"
                  className={`p-4 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-slate-900/90 border-teal-500 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/30'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      CCN #{facility.ccn}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/20">
                      HIPPS: {facility.hippsCode}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-white mb-1 line-clamp-1">
                    {facility.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                    {facility.summary}
                  </p>

                  <div className="text-[11px] font-mono text-slate-400 space-y-1 pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between">
                      <span>Beds / Schedule:</span>
                      <span className="text-slate-200">{facility.certifiedBeds} Beds • {facility.isRural ? 'Rural' : 'Urban'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wage / VBP:</span>
                      <span className="text-slate-200">{facility.wageIndex.toFixed(3)} • {(facility.vbpMultiplier).toFixed(4)}x</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Status Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Day 1 Per Diem Rate (3.0x NTA) */}
          <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/30 text-teal-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Day 1 Per Diem Rate</span>
              <Sparkles className="h-4 w-4 text-teal-400" />
            </div>
            <div className="text-xl font-bold font-mono text-teal-300">
              ${calcResult.day1PerDiemRate.toFixed(2)} / Day
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Includes Front-Loaded 3.0x NTA Multiplier
            </p>
          </div>

          {/* Day 4 Standard Per Diem Rate */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Day 4 Per Diem (1.0x NTA)</span>
              <DollarSign className="h-4 w-4 text-sky-400" />
            </div>
            <div className="text-xl font-bold font-mono text-sky-400">
              ${calcResult.day4PerDiemRate.toFixed(2)} / Day
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Standard 1.0x NTA Rate
            </p>
          </div>

          {/* Average Per Diem across Length of Stay */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Stay Per Diem</span>
              <Calendar className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400">
              ${calcResult.averagePerDiemPayment.toFixed(2)} / Day
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Blended Across {calcResult.lengthOfStay} Days with VPD Decay
            </p>
          </div>

          {/* Total Episode Settlement */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Episode Payment</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              ${calcResult.totalEpisodeMedicarePayment.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              +${calcResult.ntaDay1to3TripleBonusTotal.toLocaleString()} NTA Front-Loaded Bonus
            </p>
          </div>
        </div>

        {/* Interactive Sensitivity Controls */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sliders className="h-4 w-4 text-teal-400" />
              Interactive Length of Stay &amp; Clinical Severity Sensitivity
            </div>
            <button
              onClick={() => {
                setCustomLos(activeFacility.averageLengthOfStay);
                setCustomPoints(activeFacility.ntaComorbidityPoints);
                setCustomSectionGg(activeFacility.sectionGgScore);
              }}
              type="button"
              className="text-xs text-teal-400 hover:text-teal-300 transition-colors font-mono underline"
            >
              Reset to Archetype Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Length of Stay Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Episode Length of Stay (LOS)</span>
                <span className="font-mono text-teal-400 font-semibold">
                  {customLos} Days
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="100"
                step="1"
                value={customLos}
                onChange={(e) => setCustomLos(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>3 Days (Min NTA)</span>
                <span className="text-amber-400 font-semibold">Day 21 (VPD Decay)</span>
                <span>100 Days (Medicare Cap)</span>
              </div>
            </div>

            {/* NTA Comorbidity Points */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">NTA Comorbidity Points (MDS Sec I)</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {customPoints} Points
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="18"
                step="1"
                value={customPoints}
                onChange={(e) => setCustomPoints(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 Pts (NA: 0.72x)</span>
                <span>6-8 (ND: 1.94x)</span>
                <span>12+ (NF: 3.25x)</span>
              </div>
            </div>

            {/* Section GG Functional Independence Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Section GG Functional Score</span>
                <span className="font-mono text-sky-400 font-semibold">
                  {customSectionGg} / 24
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={customSectionGg}
                onChange={(e) => setCustomSectionGg(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 (Dependent)</span>
                <span>12 (Moderate Assist)</span>
                <span>24 (Independent)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Analytical Perspectives */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'case_mix', label: '5 Case-Mix Components & HIPPS', icon: Layers },
              { id: 'vpd_trajectory', label: 'Variable Per Diem (VPD) Curve', icon: TrendingDown },
              { id: 'comorbidity_hiv', label: 'NTA Comorbidities & HIV Add-on', icon: Syringe },
              { id: 'interrupted_stay', label: 'Interrupted Stay & 3-Day Transfer', icon: Scale },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: 5 Case-Mix Components & HIPPS Generator */}
          {activeTab === 'case_mix' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers className="h-4 w-4 text-teal-400" />
                      PDPM 5 Case-Mix Components &amp; Non-Case-Mix Base (FY 2026)
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Deterministic calculation of unadjusted and wage-adjusted component per diems for HIPPS Code{' '}
                      <strong className="text-teal-400 font-mono">{activeFacility.hippsCode}</strong>.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Local Wage Index</span>
                    <div className="text-sm font-bold font-mono text-slate-200">
                      {activeFacility.wageIndex.toFixed(4)} ({activeFacility.isRural ? 'Rural Schedule' : 'Urban Schedule'})
                    </div>
                  </div>
                </div>

                {/* 6 Component Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Physical Therapy */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-teal-400">Physical Therapy (PT)</span>
                      <span className="font-mono text-slate-300">Group {activeFacility.ptGroup}</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-white">
                      ${(calcResult.ptBaseWageAdjusted * activeFacility.ptWeight).toFixed(2)} / Day
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
                      <span>Base: ${calcResult.ptBaseWageAdjusted.toFixed(2)}</span>
                      <span>Weight: {activeFacility.ptWeight.toFixed(2)}x</span>
                    </div>
                  </div>

                  {/* Occupational Therapy */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-teal-400">Occupational Therapy (OT)</span>
                      <span className="font-mono text-slate-300">Group {activeFacility.otGroup}</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-white">
                      ${(calcResult.otBaseWageAdjusted * activeFacility.otWeight).toFixed(2)} / Day
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
                      <span>Base: ${calcResult.otBaseWageAdjusted.toFixed(2)}</span>
                      <span>Weight: {activeFacility.otWeight.toFixed(2)}x</span>
                    </div>
                  </div>

                  {/* Speech-Language Pathology */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-sky-400">Speech Pathology (SLP)</span>
                      <span className="font-mono text-slate-300">Group {activeFacility.slpGroup}</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-white">
                      ${(calcResult.slpBaseWageAdjusted * activeFacility.slpWeight).toFixed(2)} / Day
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
                      <span>Base: ${calcResult.slpBaseWageAdjusted.toFixed(2)}</span>
                      <span>Weight: {activeFacility.slpWeight.toFixed(2)}x</span>
                    </div>
                  </div>

                  {/* Nursing Component */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-400">Nursing Component</span>
                      <span className="font-mono text-slate-300">Group {activeFacility.nursingGroup}</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-white">
                      ${(calcResult.nursingBaseWageAdjusted * activeFacility.nursingWeight * (activeFacility.hasHivDiagnosis ? 1.18 : 1.0)).toFixed(2)} / Day
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
                      <span>Base: ${calcResult.nursingBaseWageAdjusted.toFixed(2)}</span>
                      <span>Weight: {activeFacility.nursingWeight.toFixed(2)}x {activeFacility.hasHivDiagnosis ? '(+18% HIV)' : ''}</span>
                    </div>
                  </div>

                  {/* Non-Therapy Ancillaries (NTA) */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-400">Non-Therapy Ancillaries</span>
                      <span className="font-mono text-slate-300">Group {activeFacility.ntaGroup}</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-white">
                      ${(calcResult.ntaBaseWageAdjusted * activeFacility.ntaWeight).toFixed(2)} / Day
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
                      <span>Base: ${calcResult.ntaBaseWageAdjusted.toFixed(2)}</span>
                      <span>Weight: {activeFacility.ntaWeight.toFixed(2)}x ({activeFacility.ntaComorbidityPoints} pts)</span>
                    </div>
                  </div>

                  {/* Non-Case-Mix Component */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-400">Non-Case-Mix Base</span>
                      <span className="font-mono text-slate-300">Overhead</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-white">
                      ${calcResult.nonCaseMixWageAdjusted.toFixed(2)} / Day
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
                      <span>Room, Board &amp; Admin</span>
                      <span>Unadjusted Constant</span>
                    </div>
                  </div>
                </div>

                {/* VBP Quality Multiplier Impact */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-teal-400" />
                      SNF Value-Based Purchasing (VBP) Adjustment
                    </div>
                    <p className="text-xs text-slate-400">
                      Hospital readmission measure (SNFRM) incentive multiplier: <strong className="text-white font-mono">{activeFacility.vbpMultiplier.toFixed(4)}x</strong>.
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <div className={`text-lg font-bold ${
                      calcResult.vbpIncentiveImpactTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {calcResult.vbpIncentiveImpactTotal >= 0 ? '+' : ''}${calcResult.vbpIncentiveImpactTotal.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">Episode Financial Impact</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Variable Per Diem (VPD) Payment Curve */}
          {activeTab === 'vpd_trajectory' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-amber-400" />
                    Variable Per Diem (VPD) Payment Decay Trajectory
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Under 42 CFR § 413.337, NTA pays 3.0x on Days 1-3. PT and OT pay 1.0x on Days 1-20, then decline by 2% every 7 days through Day 100.
                  </p>
                </div>

                {/* Milestones Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/30 space-y-1">
                    <div className="text-[10px] font-mono text-teal-400 uppercase">Days 1 - 3 (Peak NTA)</div>
                    <div className="text-lg font-bold font-mono text-white">${calcResult.day1PerDiemRate.toFixed(2)} / Day</div>
                    <p className="text-[11px] text-slate-400">3.0x NTA + 1.0x PT/OT</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-sky-400 uppercase">Days 4 - 20 (Plateau)</div>
                    <div className="text-lg font-bold font-mono text-white">${calcResult.day4PerDiemRate.toFixed(2)} / Day</div>
                    <p className="text-[11px] text-slate-400">1.0x NTA + 1.0x PT/OT</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-amber-400 uppercase">Days 21 - 27 (Initial Decay)</div>
                    <div className="text-lg font-bold font-mono text-white">${calcResult.day21PerDiemRate.toFixed(2)} / Day</div>
                    <p className="text-[11px] text-slate-400">0.98x PT/OT (-$3.60/day)</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-rose-400 uppercase">Day {calcResult.lengthOfStay} (Final Day)</div>
                    <div className="text-lg font-bold font-mono text-white">${calcResult.finalDayPerDiemRate.toFixed(2)} / Day</div>
                    <p className="text-[11px] text-slate-400">Current Stay Exit Rate</p>
                  </div>
                </div>

                {/* Day-by-Day Trajectory Table */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sample Stay Progression (Days 1 to {calcResult.lengthOfStay})
                  </div>
                  <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400">
                        <tr>
                          <th className="p-2.5">Day</th>
                          <th className="p-2.5">PT Multiplier</th>
                          <th className="p-2.5">NTA Multiplier</th>
                          <th className="p-2.5">PT/OT Rate</th>
                          <th className="p-2.5">NTA Rate</th>
                          <th className="p-2.5 text-right">Settled Per Diem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-300">
                        {calcResult.dailyTrajectory.map((d) => (
                          <tr key={d.dayNumber} className={d.dayNumber <= 3 ? 'bg-teal-950/20' : d.dayNumber === 21 ? 'bg-amber-950/20' : ''}>
                            <td className="p-2.5 font-bold text-white">Day {d.dayNumber}</td>
                            <td className="p-2.5">{d.ptVpdMultiplier.toFixed(2)}x</td>
                            <td className="p-2.5">{d.ntaVpdMultiplier.toFixed(2)}x</td>
                            <td className="p-2.5">${(d.ptPerDiem + d.otPerDiem).toFixed(2)}</td>
                            <td className="p-2.5">${d.ntaPerDiem.toFixed(2)}</td>
                            <td className="p-2.5 text-right font-bold text-teal-300">${d.vbpAdjustedDailyRate.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: NTA Comorbidities & MMA § 511 HIV Add-on */}
          {activeTab === 'comorbidity_hiv' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Syringe className="h-4 w-4 text-rose-400" />
                    Non-Therapy Ancillary (NTA) Comorbidity Scoring &amp; MMA § 511 HIV Add-on
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    MDS 3.0 Section I comorbidity items determine the NTA case-mix group (NA through NF).
                    Statutory MMA § 511 grants +8 points to NTA and an 18% multiplier to the Nursing base for diagnosed HIV/AIDS.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* NTA Tier Thresholds */}
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      MDS 3.0 NTA Case-Mix Tiers
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      {[
                        { tier: 'NF', points: '12+ Points', weight: '3.25x', label: 'Very High Ancillary Intensity' },
                        { tier: 'NE', points: '9 - 11 Points', weight: '2.53x', label: 'High Ancillary Intensity' },
                        { tier: 'ND', points: '6 - 8 Points', weight: '1.94x', label: 'Moderate-High Ancillary' },
                        { tier: 'NC', points: '3 - 5 Points', weight: '1.34x', label: 'Moderate Ancillary' },
                        { tier: 'NB', points: '1 - 2 Points', weight: '0.96x', label: 'Low Ancillary' },
                        { tier: 'NA', points: '0 Points', weight: '0.72x', label: 'No Qualifying Comorbidities' },
                      ].map((item) => (
                        <div
                          key={item.tier}
                          className={`p-2 rounded flex justify-between items-center ${
                            activeFacility.ntaGroup === item.tier
                              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                              : 'bg-slate-900/50 text-slate-400'
                          }`}
                        >
                          <span className="font-bold">Group {item.tier} ({item.points})</span>
                          <span>{item.weight} ({item.label})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* High-Value Comorbidity Items */}
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      Statutory High-Weight Comorbidities (MDS Section I)
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded bg-rose-950/20 border border-rose-500/30 text-rose-300 flex justify-between">
                        <div>
                          <div className="font-bold">HIV / AIDS (ICD-10 B20)</div>
                          <div className="text-[10px] text-slate-400">MMA § 511 Statutory Add-on</div>
                        </div>
                        <span className="font-mono font-bold">+8 Points &amp; +18% Nursing</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex justify-between text-slate-300">
                        <span>Parenteral / IV Feeding</span>
                        <span className="font-mono text-teal-400 font-bold">+7 Points</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex justify-between text-slate-300">
                        <span>IV Medication (Post-Admission)</span>
                        <span className="font-mono text-teal-400 font-bold">+5 Points</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex justify-between text-slate-300">
                        <span>Ventilator / Respirator Post-Admit</span>
                        <span className="font-mono text-teal-400 font-bold">+4 Points</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex justify-between text-slate-300">
                        <span>Tracheostomy Care</span>
                        <span className="font-mono text-teal-400 font-bold">+1 Point</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Interrupted Stay & 3-Day Transfer Safeguard */}
          {activeTab === 'interrupted_stay' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Scale className="h-4 w-4 text-teal-400" />
                    42 CFR § 413.337 Interrupted Stay Policy Simulator
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    If a resident is discharged and readmitted to the same SNF within 3 consecutive calendar days, the stay continues without a new 5-day assessment.
                    Billing Day 1 reset rates (3.0x NTA) on an interrupted stay violates the False Claims Act.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Days Between Discharge &amp; Return</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="14"
                        value={interruptedDaysGap}
                        onChange={(e) => setInterruptedDaysGap(parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white"
                      />
                      <span className="text-xs text-slate-400">Days</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Discharge Day of Initial Stay</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={interruptedDischargeDay}
                        onChange={(e) => setInterruptedDischargeDay(parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white"
                      />
                      <span className="text-xs text-slate-400">Day #</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Destination Facility</label>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsSameSnfFacility(true)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold ${
                          isSameSnfFacility ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        Same SNF
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSameSnfFacility(false)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold ${
                          !isSameSnfFacility ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        Different SNF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulator Result Callout */}
                <div className={`p-4 rounded-xl border ${
                  interruptedEval.isInterruptedStay
                    ? 'bg-teal-950/20 border-teal-500/30 text-teal-300'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-sm uppercase tracking-wider">
                      {interruptedEval.statusLabel}
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-950">
                      Resuming Day: #{interruptedEval.resumingDayNumber} (NTA: {interruptedEval.ntaMultiplierOnReadmission.toFixed(1)}x)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {interruptedEval.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 1-Click Dossier Generator Bar */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
              <FileCheck className="h-4 w-4 text-teal-400" />
              Form CMS-2540-10 &amp; UB-04 Revenue Code 0022 Audit Brief
            </h4>
            <p className="text-xs text-slate-400">
              Generate an auditable PDPM compliance dossier with HIPPS code validation and SHA-256 fingerprint for MAC cost reporting.
            </p>
          </div>
          <button
            onClick={() => setShowDossierModal(true)}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <FileCheck className="h-4 w-4 text-slate-950" />
            Generate CMS-2540-10 Brief
          </button>
        </div>
      </div>

      {/* Audit Dossier Modal */}
      {showDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-[10px] font-mono text-teal-400 uppercase tracking-wider mb-1">
                  {dossier.auditHash}
                </div>
                <h3 className="text-lg font-bold text-white">
                  Form CMS-2540-10 &amp; UB-04 PDPM Settlement Brief
                </h3>
              </div>
              <button
                onClick={() => setShowDossierModal(false)}
                type="button"
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 space-y-4 border border-slate-800/80">
              <div className="text-slate-400 border-b border-slate-800 pb-2">
                CMS FORM 2540-10 &amp; UB-04 REVENUE CODE 0022 PDPM SETTLEMENT BRIEF<br />
                Statutory Authority: 42 U.S.C. § 1395yy(e), 42 CFR Part 413 Subpart E<br />
                Certified Facility: {dossier.facilityIdentification.facilityName} (CCN #{dossier.facilityIdentification.ccn}, NPI {dossier.facilityIdentification.npi})
              </div>

              <div className="space-y-1">
                <div className="text-teal-400 font-bold">FACILITY IDENTIFICATION &amp; HIPPS CLASSIFICATION</div>
                {Object.entries(dossier.facilityIdentification).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-400">
                    <span>{k}:</span>
                    <span className="text-slate-200">{v}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="text-amber-400 font-bold">MDS 3.0 PDPM CLINICAL CASE-MIX AUDIT</div>
                {Object.entries(dossier.clinicalClassificationAudit).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-400">
                    <span>{k}:</span>
                    <span className="text-slate-200">{v}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="text-emerald-400 font-bold">REIMBURSEMENT SETTLEMENT &amp; EPISODE BREAKDOWN</div>
                {Object.entries(dossier.reimbursementSettlement).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-400">
                    <span>{k}:</span>
                    <span className="text-slate-200">{v}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 text-slate-400 text-[11px] leading-relaxed">
                <div className="text-teal-400 font-bold mb-1">STATUTORY SAFE-HARBOR CERTIFICATION (31 U.S.C. § 3729)</div>
                {dossier.statutorySafeHarbor}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-slate-400">
                Certified SHA-256 Audit Trail • 42 CFR § 413.337
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyDossier}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedDossier ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Full Dossier
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDossierModal(false)}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SnfPdpmArbiter;
