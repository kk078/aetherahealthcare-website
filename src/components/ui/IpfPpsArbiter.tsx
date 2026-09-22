'use client';

import React, { useState, useMemo } from 'react';
import {
  Brain,
  Zap,
  Activity,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  FileText,
  Copy,
  Check,
  Sliders,
  RotateCcw,
  Building2,
  Stethoscope,
  Sparkles,
  AlertTriangle,
  HeartPulse,
  TrendingDown
} from 'lucide-react';
import {
  IPF_ARCHETYPES,
  IPF_MS_DRGS,
  IPF_COMORBIDITIES,
  IPF_FY2026_FEDERAL_BASE_RATE,
  IPF_FY2026_ECT_BASE_RATE,
  evaluateIpfStay,
  generateIpfAuditDossier,
  type IpfArchetypeProfile
} from '@/data/ipfPpsData';

export const IpfPpsArbiter: React.FC = () => {
  // Selected Archetype
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>('midwestern-psych-pavilion');
  const [activeTab, setActiveTab] = useState<'los_decay_curve' | 'ect_neuromodulation' | 'comorbidities_msdrg' | 'facility_adjustments'>('los_decay_curve');

  // Active Archetype
  const activeArchetype: IpfArchetypeProfile = useMemo(() => {
    return IPF_ARCHETYPES.find(a => a.id === selectedArchetypeId) || IPF_ARCHETYPES[0];
  }, [selectedArchetypeId]);

  // Interactive State
  const [customLos, setCustomLos] = useState<number>(activeArchetype.defaultLos);
  const [customEctSessions, setCustomEctSessions] = useState<number>(activeArchetype.defaultEctSessions);
  const [customMsDrg, setCustomMsDrg] = useState<string>(activeArchetype.defaultMsDrg);
  const [customAge, setCustomAge] = useState<number>(activeArchetype.defaultPatientAge);
  const [customComorbidities, setCustomComorbidities] = useState<string[]>(activeArchetype.defaultComorbidities);
  const [customWageIndex, setCustomWageIndex] = useState<number>(activeArchetype.wageIndex);
  const [customHasEd, setCustomHasEd] = useState<boolean>(activeArchetype.hasQualifiedEd);
  const [customIsRural, setCustomIsRural] = useState<boolean>(activeArchetype.isRural);

  // Modal State
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);

  // Switch Archetype Handler
  const handleArchetypeChange = (archetypeId: string) => {
    setSelectedArchetypeId(archetypeId);
    const target = IPF_ARCHETYPES.find(a => a.id === archetypeId);
    if (target) {
      setCustomLos(target.defaultLos);
      setCustomEctSessions(target.defaultEctSessions);
      setCustomMsDrg(target.defaultMsDrg);
      setCustomAge(target.defaultPatientAge);
      setCustomComorbidities(target.defaultComorbidities);
      setCustomWageIndex(target.wageIndex);
      setCustomHasEd(target.hasQualifiedEd);
      setCustomIsRural(target.isRural);
    }
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    setCustomLos(activeArchetype.defaultLos);
    setCustomEctSessions(activeArchetype.defaultEctSessions);
    setCustomMsDrg(activeArchetype.defaultMsDrg);
    setCustomAge(activeArchetype.defaultPatientAge);
    setCustomComorbidities(activeArchetype.defaultComorbidities);
    setCustomWageIndex(activeArchetype.wageIndex);
    setCustomHasEd(activeArchetype.hasQualifiedEd);
    setCustomIsRural(activeArchetype.isRural);
  };

  // Comorbidity Toggle Handler
  const handleToggleComorbidity = (comorbId: string) => {
    setCustomComorbidities(prev => 
      prev.includes(comorbId) 
        ? prev.filter(id => id !== comorbId) 
        : [...prev, comorbId]
    );
  };

  // Evaluation Result
  const settlement = useMemo(() => {
    return evaluateIpfStay(activeArchetype, {
      lengthOfStay: customLos,
      ectSessions: customEctSessions,
      msDrgCode: customMsDrg,
      patientAge: customAge,
      selectedComorbidities: customComorbidities,
      wageIndex: customWageIndex,
      hasQualifiedEd: customHasEd,
      isRural: customIsRural
    });
  }, [
    activeArchetype,
    customLos,
    customEctSessions,
    customMsDrg,
    customAge,
    customComorbidities,
    customWageIndex,
    customHasEd,
    customIsRural
  ]);

  // Audit Dossier
  const auditDossier = useMemo(() => {
    return generateIpfAuditDossier(
      activeArchetype,
      settlement,
      customLos,
      customEctSessions,
      customMsDrg,
      customAge,
      customComorbidities
    );
  }, [
    activeArchetype,
    settlement,
    customLos,
    customEctSessions,
    customMsDrg,
    customAge,
    customComorbidities
  ]);

  const handleCopyDossier = () => {
    navigator.clipboard.writeText(auditDossier.content);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <section
      id="ipf-pps-arbiter"
      aria-label="Inpatient Psychiatric Facility Prospective Payment System (IPF PPS) & ECT Arbiter"
      className="py-20 md:py-28 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-purple-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-cyan-500/10 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <Brain className="h-4 w-4 text-purple-400" />
            Social Security Act § 1886(s) & 42 CFR Part 412 Subpart N
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Inpatient Psychiatric Facility PPS & ECT Arbiter
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Autonomous multi-tier IPF PPS settlement engine arbitrating <span className="text-purple-400 font-semibold">Length of Stay (LOS) declining curves</span>, <span className="text-cyan-400 font-semibold">24/7 Qualified Psych ED 1.31x Day 1 bump</span>, <span className="text-amber-400 font-semibold">CPT 90870 ECT neuromodulation</span> add-on ($385.58 wage-adjusted), and <span className="text-emerald-400 font-semibold">17 statutory secondary comorbidities</span> against False Claims Act recoupment.
          </p>
        </div>

        {/* 4 Archetype Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {IPF_ARCHETYPES.map((arch) => {
            const isSelected = arch.id === selectedArchetypeId;
            return (
              <button
                key={arch.id}
                type="button"
                onClick={() => handleArchetypeChange(arch.id)}
                className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-purple-500 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      CCN {arch.ccn}
                    </span>
                    {arch.hasQualifiedEd && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        1.31x ED
                      </span>
                    )}
                    {arch.isRural && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        +17% Rural
                      </span>
                    )}
                    {arch.teachingMetrics.isTeaching && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        +16.7% Teaching
                      </span>
                    )}
                    {!arch.ipfqrCompliant && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        -2% Quality
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-slate-100 line-clamp-2">
                    {arch.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {arch.location} • {arch.licensedBeds} Beds • WI: {arch.wageIndex.toFixed(4)}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <p className="text-[11px] font-medium text-purple-300 line-clamp-1">
                    {arch.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Facility Overview Strip */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  {activeArchetype.facilityType.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400">CCN: {activeArchetype.ccn}</span>
                <span className="text-xs text-slate-400">NPI: {activeArchetype.npi}</span>
                <span className="text-xs text-slate-400">CBSA: {activeArchetype.cbsa}</span>
              </div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-400" />
                {activeArchetype.name}
              </h3>
              <p className="text-xs text-slate-400 max-w-3xl">
                {activeArchetype.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-slate-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Defaults
              </button>
              <button
                type="button"
                onClick={() => setShowDossierModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-950/50 transition-all border border-purple-400/30"
              >
                <FileText className="h-3.5 w-3.5" />
                CMS-2552-10 Worksheet E-3 Part II
              </button>
            </div>
          </div>
        </div>

        {/* 4 Financial & Operational KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Gross Medicare Payment</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              ${settlement.grossMedicarePayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400">
              Stay Per Diem + CPT 90870 ECT
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Average Effective Per Diem</span>
              <Activity className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-300 font-mono">
              ${settlement.averagePerDiem.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400">
              Base ${settlement.wageAdjustedBaseRate.toFixed(2)} adjusted by LOS curve
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">ECT Neuromodulation Total</span>
              <Zap className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-300 font-mono">
              ${settlement.totalEctPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400">
              {customEctSessions} Sessions @ ${settlement.wageAdjustedEctRate.toFixed(2)}/tx
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Compound Multipliers</span>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300 font-mono">
              {settlement.patientMultiplier.toFixed(3)}x / {settlement.facilityMultiplier.toFixed(3)}x
            </div>
            <p className="text-[11px] text-slate-400">
              Patient Clinical / Facility Institutional
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('los_decay_curve')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'los_decay_curve'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <TrendingDown className="h-4 w-4 text-purple-400" />
            LOS Decay Curve & ED Bump
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ect_neuromodulation')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'ect_neuromodulation'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Zap className="h-4 w-4 text-cyan-400" />
            ECT Neuromodulation (CPT 90870)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comorbidities_msdrg')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'comorbidities_msdrg'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Stethoscope className="h-4 w-4 text-emerald-400" />
            15 MS-DRGs & 17 Comorbidities
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('facility_adjustments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'facility_adjustments'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Building2 className="h-4 w-4 text-amber-400" />
            Facility & Quality Factors
          </button>
        </div>

        {/* Tab 1: LOS Decay Curve & ED Bump */}
        {activeTab === 'los_decay_curve' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive Controls */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-purple-400" />
                    Length of Stay Sensitivity
                  </h4>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                    {customLos} Days
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 flex justify-between">
                    <span>Inpatient Days (1 - 35):</span>
                    <span className="font-mono text-white">{customLos} days</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="35"
                    step="1"
                    value={customLos}
                    onChange={(e) => setCustomLos(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">24/7 Qualified Psych ED</span>
                    <button
                      type="button"
                      onClick={() => setCustomHasEd(!customHasEd)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        customHasEd ? 'bg-cyan-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          customHasEd ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {customHasEd 
                      ? '42 CFR § 412.424(d)(2)(i)(A): Qualified dedicated 24/7 psychiatric emergency department grants Day 1 multiplier of 1.31x (vs 1.19x non-ED).'
                      : 'Non-ED admission receives baseline Day 1 multiplier of 1.19x. Days 2+ converge to identical decay schedules.'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Day 1 Rate Multiplier:</span>
                    <span className="font-mono font-semibold text-cyan-400">
                      {settlement.dailySchedule[0]?.losMultiplier.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Day 1 Effective Per Diem:</span>
                    <span className="font-mono font-semibold text-white">
                      ${settlement.dailySchedule[0]?.effectivePerDiem.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Final Day Rate Multiplier:</span>
                    <span className="font-mono font-semibold text-purple-400">
                      {settlement.dailySchedule[customLos - 1]?.losMultiplier.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Inpatient Per Diem:</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      ${settlement.totalPerDiemPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Day-by-Day Trajectory Table */}
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    Statutory Length of Stay (LOS) Adjustment Curve
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Floor reached at Day 22 (0.92x)
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[360px] overflow-y-auto pr-1">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Stay Day</th>
                        <th className="py-2.5 px-3">LOS Factor</th>
                        <th className="py-2.5 px-3">Patient Mult</th>
                        <th className="py-2.5 px-3">Facility Mult</th>
                        <th className="py-2.5 px-3">Effective Per Diem</th>
                        <th className="py-2.5 px-3">Cumulative Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {settlement.dailySchedule.map((day) => (
                        <tr
                          key={day.dayNumber}
                          className={day.dayNumber === 1 ? 'bg-cyan-950/30' : 'hover:bg-slate-800/40'}
                        >
                          <td className="py-2 px-3 font-mono font-medium text-slate-300">
                            Day {day.dayNumber}
                            {day.dayNumber === 1 && (
                              <span className="ml-2 text-[10px] text-cyan-400 font-semibold uppercase">
                                {customHasEd ? 'ED 1.31x' : 'Direct 1.19x'}
                              </span>
                            )}
                            {day.dayNumber >= 22 && (
                              <span className="ml-2 text-[10px] text-amber-400 font-semibold uppercase">
                                Floor
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono text-purple-300 font-semibold">
                            {day.losMultiplier.toFixed(2)}x
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-400">
                            {day.patientMultiplier.toFixed(3)}x
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-400">
                            {day.facilityMultiplier.toFixed(3)}x
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-emerald-400">
                            ${day.effectivePerDiem.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-300">
                            ${day.cumulativePayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: ECT Neuromodulation */}
        {activeTab === 'ect_neuromodulation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ECT Controls */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-400" />
                    Inpatient ECT Treatments
                  </h4>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                    {customEctSessions} Sessions
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 flex justify-between">
                    <span>CPT 90870 Sessions (0 - 15):</span>
                    <span className="font-mono text-white">{customEctSessions}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={customEctSessions}
                    onChange={(e) => setCustomEctSessions(Number(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
                  <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                    <HeartPulse className="h-4 w-4 text-cyan-400" />
                    CPT 90870 & Rev Code 0901
                  </span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Under 42 CFR § 412.424(d)(1)(v), ECT is paid on a per-treatment basis in addition to the per diem payment. The Federal FY 2026 ECT base rate is <span className="text-white font-mono">${IPF_FY2026_ECT_BASE_RATE.toFixed(2)}</span>, adjusted by the facility wage index with a 68.8% labor share.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Federal Base Rate:</span>
                    <span className="font-mono text-slate-300">${IPF_FY2026_ECT_BASE_RATE.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Wage-Adjusted Per Session:</span>
                    <span className="font-mono font-semibold text-cyan-400">
                      ${settlement.wageAdjustedEctRate.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total ECT Reimbursement:</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      ${settlement.totalEctPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* ECT Clinical Protocol & Audit Guardrails */}
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Neuromodulation Medical Necessity & False Claims Act Safe Harbor
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Electroconvulsive therapy claims in inpatient psychiatric facilities are subjected to aggressive OIG and MAC post-payment audits. Aethera verifies complete psychiatric documentation prior to UB-04 claim submission:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                      <Check className="h-4 w-4 text-cyan-400" />
                      Treatment-Resistant Verification
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Autonomous validation that the medical record establishes failure or contraindication of at least two adequate trials of antidepressant classes or acute catatonia requiring rapid intervention.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                      <Check className="h-4 w-4 text-cyan-400" />
                      Anesthesia & Seizure Duration Audit
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Validation of concurrent general anesthesia administration, continuous EEG recording, and minimum therapeutic seizure duration (motor seizure &gt; 20 seconds / EEG &gt; 25 seconds).
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                      <Check className="h-4 w-4 text-cyan-400" />
                      Informed Consent Compliance
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Strict statutory verification of signed, non-expired voluntary or court-authorized surrogate consent specifically detailing transient retrograde and anterograde amnesia risks.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                      <Check className="h-4 w-4 text-cyan-400" />
                      Split-Line UB-04 Revenue Code 0901
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Autonomous cross-walking to UB-04 line items matching specific calendar dates of treatment to prevent multi-session bundling rejections under Medicare Claims Processing Manual Chapter 3 § 190.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: MS-DRGs & 17 Comorbidities */}
        {activeTab === 'comorbidities_msdrg' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* MS-DRG & Age Selectors */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-purple-400" />
                  Psychiatric MS-DRG & Patient Age
                </h4>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Primary Psychiatric MS-DRG:</label>
                  <select
                    value={customMsDrg}
                    onChange={(e) => setCustomMsDrg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    {Object.entries(IPF_MS_DRGS).map(([key, drg]) => (
                      <option key={key} value={key}>
                        MS-DRG {drg.code}: {drg.name} ({drg.weight.toFixed(2)}x)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-purple-300 italic">
                    {IPF_MS_DRGS[customMsDrg]?.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 flex justify-between">
                    <span>Patient Age:</span>
                    <span className="font-mono text-white">{customAge} Years</span>
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="90"
                    step="1"
                    value={customAge}
                    onChange={(e) => setCustomAge(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>&lt;45: 1.00x</span>
                    <span>65-69: 1.10x</span>
                    <span>75-79: 1.15x</span>
                    <span>80+: 1.17x</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Selected MS-DRG Weight:</span>
                    <span className="font-mono font-semibold text-white">
                      {(IPF_MS_DRGS[customMsDrg]?.weight || 1.0).toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Age Multiplier:</span>
                    <span className="font-mono font-semibold text-purple-400">
                      {settlement.patientMultiplier > 0 ? (settlement.patientMultiplier / ((IPF_MS_DRGS[customMsDrg]?.weight || 1.0) * (customComorbidities.reduce((acc, c) => acc * (IPF_COMORBIDITIES[c]?.multiplier || 1.0), 1.0)))).toFixed(2) : '1.00'}x
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Compound Patient Factor:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {settlement.patientMultiplier.toFixed(4)}x
                    </span>
                  </div>
                </div>
              </div>

              {/* 17 Statutory Comorbidities Grid */}
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-emerald-400" />
                    17 Statutory Secondary Comorbidities (42 CFR § 412.424(d)(2)(iv))
                  </h4>
                  <span className="text-xs font-mono text-emerald-300">
                    {customComorbidities.length} Active
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Select qualifying secondary diagnoses supported by physician progress notes and active medical management:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 max-h-[360px] overflow-y-auto pr-1">
                  {Object.entries(IPF_COMORBIDITIES).map(([id, comorb]) => {
                    const isChecked = customComorbidities.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleToggleComorbidity(id)}
                        className={`text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col justify-between ${
                          isChecked
                            ? 'bg-purple-950/40 border-purple-500 text-purple-200 ring-1 ring-purple-500/30'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200 line-clamp-1">{comorb.name}</span>
                          <span className="font-mono font-bold text-emerald-400 text-[11px] ml-1">
                            +{((comorb.multiplier - 1) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 font-mono">
                          {comorb.icd10Examples}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Facility & Quality Factors */}
        {activeTab === 'facility_adjustments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Facility Sliders */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-400" />
                  Institutional Multipliers
                </h4>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 flex justify-between">
                    <span>CBSA Wage Index (0.75 - 1.50):</span>
                    <span className="font-mono text-white">{customWageIndex.toFixed(4)}</span>
                  </label>
                  <input
                    type="range"
                    min="0.75"
                    max="1.50"
                    step="0.005"
                    value={customWageIndex}
                    onChange={(e) => setCustomWageIndex(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>Labor Share:</span>
                    <span className="font-mono font-semibold text-amber-300">
                      {customWageIndex > 1.0 ? '68.8% (High Wage)' : '62.0% (Low Wage)'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">Statutory Rural 17% Bonus</span>
                    <button
                      type="button"
                      onClick={() => setCustomIsRural(!customIsRural)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        customIsRural ? 'bg-amber-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          customIsRural ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {customIsRural 
                      ? '42 CFR § 412.424(d)(1)(iv): Rural IPF receives automatic 17% bump on all per diem reimbursement.'
                      : 'Urban facility receives neutral 1.00x factor.'}
                  </p>
                </div>
              </div>

              {/* Teaching & Quality Reporting Deep-Dive */}
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-purple-400" />
                  Teaching Program Intensity & Quality Reporting Penalty
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-300">Teaching Program Adjustment</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                        +{((settlement.teachingAdjustmentFactor - 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Calculated under 42 CFR § 412.424(d)(1)(iii) using formula: <code className="text-purple-300 font-mono">(1 + FTE / ADC)^0.5150</code>.
                    </p>
                    <div className="text-xs space-y-1 text-slate-400 font-mono">
                      <div>Resident FTEs: {activeArchetype.teachingMetrics.residentFte}</div>
                      <div>Average Daily Census (ADC): {activeArchetype.teachingMetrics.averageDailyCensus}</div>
                      <div>Teaching Factor: {settlement.teachingAdjustmentFactor.toFixed(4)}x</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-rose-300">IPFQR Quality Reporting</span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                        activeArchetype.ipfqrCompliant 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {activeArchetype.ipfqrCompliant ? 'Compliant (0%)' : 'Non-Compliant (-2.0%)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Failure to submit required quality measures under 42 CFR § 412.404 results in a statutory 2.0 percentage point reduction in the market basket update, permanently lowering base rates across all admissions.
                    </p>
                    <div className="text-xs space-y-1 text-slate-400 font-mono">
                      <div>Federal Base Rate: ${IPF_FY2026_FEDERAL_BASE_RATE.toFixed(2)}</div>
                      <div>Effective Base: ${settlement.wageAdjustedBaseRate.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-semibold text-amber-300">
                      Audit Trail & Cost Report Alignment
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      All calculations are aligned with CMS-2552-10 Worksheet E-3 Part II lines 1 through 16, ensuring exact mathematical reconciliation between monthly interim UB-04 billings and the Medicare Administrative Contractor (MAC) annual cost settlement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form CMS-2552-10 Worksheet E-3 Part II Audit Dossier Modal */}
      {showDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Form CMS-2552-10 Worksheet E-3 Part II Audit Dossier
                  </h3>
                  <p className="text-xs text-slate-400">
                    Immutable Inpatient Psychiatric Facility Settlement Brief • SHA-256 Sealed
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDossierModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto font-mono text-xs text-slate-300 space-y-4 bg-slate-950/40">
              <div className="p-3 bg-slate-900/80 rounded border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">CRYPTOGRAPHIC PROOF & DOSSIER ID:</div>
                <div className="text-purple-300 font-bold">{auditDossier.dossierId}</div>
                <div className="text-[10px] text-slate-500 break-all">{auditDossier.sha256Hash}</div>
              </div>
              <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-300 bg-slate-900/40 p-4 rounded-lg border border-slate-800/80">
                {auditDossier.content}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Statutorily Compliant with False Claims Act (31 U.S.C. § 3729)
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyDossier}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
                >
                  {copiedDossier ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" />
                      Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Audit Dossier
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDossierModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
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

export default IpfPpsArbiter;
