'use client';

import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Calculator,
  AlertTriangle,
  FileText,
  Coins,
  Scale,
  Clock,
  ShieldCheck,
  Check,
  Copy,
  Sliders,
  Award,
  Activity,
} from 'lucide-react';
import {
  TEACHING_HOSPITAL_ARCHETYPES,
  calculateGmeImeReimbursement,
  generateGmeAuditDossier,
  type TeachingHospitalArchetype,
} from '@/data/gmeImeData';

export function GmeImeCapOptimizer() {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('amc-tier1');
  const [activeTab, setActiveTab] = useState<'worksheet' | 'shadow' | 'caa' | 'ipf'>('worksheet');

  // Interactive Overrides
  const [customFtes, setCustomFtes] = useState<number>(310);
  const [customFellows, setCustomFellows] = useState<number>(48);
  const [customCaaSlots, setCustomCaaSlots] = useState<number>(5.0);
  const [customShadowUnfiledRate, setCustomShadowUnfiledRate] = useState<number>(35);
  const [ipfqrCompliant, setIpfqrCompliant] = useState<boolean>(true);

  // Modal State
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);

  const activeHospital: TeachingHospitalArchetype = useMemo(() => {
    return TEACHING_HOSPITAL_ARCHETYPES.find((h) => h.id === selectedHospitalId) || TEACHING_HOSPITAL_ARCHETYPES[0];
  }, [selectedHospitalId]);

  const handleHospitalChange = (hospitalId: string) => {
    setSelectedHospitalId(hospitalId);
    const target = TEACHING_HOSPITAL_ARCHETYPES.find((h) => h.id === hospitalId);
    if (target) {
      setCustomFtes(target.actualResidentFtes);
      setCustomFellows(target.fellowshipFtesBeyondIrp);
      setCustomCaaSlots(target.caaAwardedSlots);
      setCustomShadowUnfiledRate(Math.round(target.unfiledShadowClaimRate * 100));
      setIpfqrCompliant((target.ipfqrComplianceScore ?? 100) >= 95.0);
      if (target.isIpf) {
        setActiveTab('ipf');
      } else if (activeTab === 'ipf') {
        setActiveTab('worksheet');
      }
    }
  };

  const calcResult = useMemo(() => {
    return calculateGmeImeReimbursement(activeHospital, {
      customResidentFtes: customFtes,
      customFellowshipFtes: customFellows,
      customCaaSlots: customCaaSlots,
      customUnfiledShadowRate: customShadowUnfiledRate / 100,
      ipfqrCompliant,
    });
  }, [activeHospital, customFtes, customFellows, customCaaSlots, customShadowUnfiledRate, ipfqrCompliant]);

  const dossier = useMemo(() => {
    return generateGmeAuditDossier(activeHospital, calcResult);
  }, [activeHospital, calcResult]);

  const handleCopyDossier = () => {
    const text = `${dossier.legalHeader}\n` +
      `Audit Hash: ${dossier.auditHash}\n` +
      `Timestamp: ${dossier.timestamp}\n\n` +
      `WORKSHEET E-4 DIRECT GME:\n` +
      Object.entries(dossier.worksheetE4Data).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\nWORKSHEET E PART A OPERATING & CAPITAL IME:\n` +
      Object.entries(dossier.worksheetEPartAData).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\n${dossier.shadowClaimDefenseBrief}`;

    navigator.clipboard.writeText(text);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <section
      id="gme-ime-cap-optimizer"
      aria-label="CMS Teaching Hospital GME/IME Resident Cap & Direct GME Optimizer"
      className="py-20 md:py-28 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-teal-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-blue-500/10 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="h-4 w-4 text-teal-400" />
            42 CFR § 413.75 - § 413.83 & 42 CFR § 412.105
          </div>
          <h2 className="font-jakarta text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Teaching Hospital GME / IME Cap Optimizer &amp; Shadow Billing Auditor
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Deterministic reimbursement modeling for Direct Graduate Medical Education (DGME), Operating &amp; Capital
            Indirect Medical Education (IME), Section 126/127 CAA cap slot expansion, and Medicare Advantage (MA) shadow-claim recovery.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-teal-300">
              CMS Form 2552-10 Worksheet E-4
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-blue-300">
              Operating IME Formula: 1.35 × [(1+r)^0.405 - 1]
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-300">
              MA Condition Code 04 Shadow Claims
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-purple-300">
              IPF Teaching Factor Exponent: 0.5150
            </span>
          </div>
        </div>

        {/* Hospital Archetype Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Select Teaching Hospital Cost-Report Archetype:
            </span>
            <span className="text-xs text-teal-400 font-mono">
              {activeHospital.inpatientBedCount} Beds | {activeHospital.cptDrgScope.split('(')[0]}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TEACHING_HOSPITAL_ARCHETYPES.map((hospital) => {
              const isSelected = hospital.id === selectedHospitalId;
              return (
                <button
                  key={hospital.id}
                  onClick={() => handleHospitalChange(hospital.id)}
                  className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-teal-950/40 border-teal-500/80 shadow-lg shadow-teal-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {hospital.facilityType.replace(/_/g, ' ')}
                      </span>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />}
                    </div>
                    <div className="text-sm font-bold text-white">{hospital.name}</div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{hospital.description}</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">1996 Cap: {hospital.bba1996DgmeCap} FTEs</span>
                    <span className="text-teal-400 font-bold">Act: {hospital.actualResidentFtes} FTEs</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 High-Impact KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Captured GME Funding */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-teal-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Total Medicare GME Funding</span>
              <Coins className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-300 font-mono">
              ${Math.round(calcResult.totalDirectAndIndirectFunding).toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>DGME: ${Math.round(calcResult.totalDgmeReimbursement).toLocaleString()}</span>
              <span className="text-blue-300">IME: ${Math.round(calcResult.operatingImePayment).toLocaleString()}</span>
            </div>
          </div>

          {/* Card 2: Medicare Advantage Shadow Claim Recovery Target */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-amber-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">MA Shadow Claim Leakage</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
              ${Math.round(calcResult.unbilledMaShadowLoss).toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Unfiled Rate: {customShadowUnfiledRate}%</span>
              <span className="text-amber-400 font-semibold">TOB 111 / Cond 04</span>
            </div>
          </div>

          {/* Card 3: Over-Cap Unfunded Burden */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-rose-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Unfunded Over-Cap Burden</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-300 font-mono">
              ${Math.round(calcResult.totalUnfundedResidentDirectCost).toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>{calcResult.overCapDgmeFtes.toFixed(1)} Unfunded FTEs</span>
              <span className="text-rose-400">Direct Stipend Gap</span>
            </div>
          </div>

          {/* Card 4: CAA § 126/127 Expansion Upside */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-purple-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">CAA Slot Expansion Value</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">
              +${Math.round(calcResult.totalCaaExpansionValue).toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>+{customCaaSlots.toFixed(1)} Permanent Slots</span>
              <span className="text-purple-300">Recurring Annual</span>
            </div>
          </div>
        </div>

        {/* Interactive Parameter Controls Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              <h3 className="text-base font-bold text-white">
                Interactive Institutional Parameters &amp; Sensitivity Modeler
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Real-time CMS-2552-10 Recalculation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Slider 1: Total Resident FTEs */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Total Residents Trained:</span>
                <span className="font-mono font-bold text-teal-300">{customFtes} FTEs</span>
              </div>
              <input
                type="range"
                min={Math.max(5, Math.round(activeHospital.bba1996DgmeCap * 0.5))}
                max={Math.round(activeHospital.actualResidentFtes * 1.5)}
                step={1}
                value={customFtes}
                onChange={(e) => setCustomFtes(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                <span>1996 Cap: {activeHospital.bba1996DgmeCap}</span>
                <span>Max: {Math.round(activeHospital.actualResidentFtes * 1.5)}</span>
              </div>
            </div>

            {/* Slider 2: Fellowship FTEs Beyond IRP (0.5 weight) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Post-IRP Fellows (0.5 weight):</span>
                <span className="font-mono font-bold text-blue-300">{customFellows} FTEs</span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.round(customFtes * 0.4)}
                step={1}
                value={customFellows}
                onChange={(e) => setCustomFellows(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
              />
              <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                <span>Weighted: {calcResult.weightedResidentFtes.toFixed(1)} FTEs</span>
                <span>IRP: {customFtes - customFellows} FTEs</span>
              </div>
            </div>

            {/* Slider 3: MA Shadow Claim Unfiled Leakage Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">MA Shadow Unfiled Rate:</span>
                <span className="font-mono font-bold text-amber-300">{customShadowUnfiledRate}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                step={5}
                value={customShadowUnfiledRate}
                onChange={(e) => setCustomShadowUnfiledRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                <span>0% (Full Capture)</span>
                <span>60% (High Leakage)</span>
              </div>
            </div>

            {/* Slider 4: CAA § 126/127 Awarded Slots */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">CAA § 126/127 Slots:</span>
                <span className="font-mono font-bold text-purple-300">+{customCaaSlots.toFixed(1)} FTEs</span>
              </div>
              <input
                type="range"
                min={0}
                max={5.0}
                step={0.5}
                value={customCaaSlots}
                onChange={(e) => setCustomCaaSlots(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
              <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                <span>0 (No slots)</span>
                <span>Max 5.0 FTEs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('worksheet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'worksheet'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Worksheet E-4 &amp; Part A Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('shadow')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'shadow'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Medicare Advantage Shadow Claims</span>
          </button>

          <button
            onClick={() => setActiveTab('caa')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'caa'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>CAA § 126/127 Slot Application</span>
          </button>

          {activeHospital.isIpf && (
            <button
              onClick={() => setActiveTab('ipf')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'ipf'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Inpatient Psychiatric Teaching &amp; IPFQR</span>
            </button>
          )}
        </div>

        {/* Tab 1: CMS Cost Report Worksheet E-4 & E Part A */}
        {activeTab === 'worksheet' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DGME Panel (Worksheet E-4) */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Direct GME (DGME) Calculation</h3>
                    <p className="text-[11px] text-slate-400 font-mono">42 CFR §§ 413.75 - 413.83 | Worksheet E-4</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-teal-950 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold">
                  ${Math.round(calcResult.totalDgmeReimbursement).toLocaleString()}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Total Trained FTEs:</span>
                  <span className="font-mono text-white font-semibold">{customFtes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Weighted FTE Count (IRP @ 1.0, Fellows @ 0.5):</span>
                  <span className="font-mono text-teal-300 font-semibold">{calcResult.weightedResidentFtes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">BBA-97 Statutory Cap + CAA Slots:</span>
                  <span className="font-mono text-white font-semibold">
                    {activeHospital.bba1996DgmeCap.toFixed(2)} + {customCaaSlots.toFixed(2)} = {calcResult.effectiveDgmeCap.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Allowable Reimbursable FTEs:</span>
                  <span className="font-mono text-emerald-400 font-bold">{calcResult.allowableDgmeFtes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Hospital Specific Per-Resident Amount (PRA):</span>
                  <span className="font-mono text-white">${activeHospital.blendedPra.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Medicare Patient Load (FFS + Part C MA):</span>
                  <span className="font-mono text-teal-300">{(calcResult.medicarePatientLoad * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="text-teal-400 font-bold">CMS Worksheet E-4 Formula:</div>
                <div className="text-slate-400">
                  DGME = Allowable FTEs ({calcResult.allowableDgmeFtes.toFixed(2)}) × PRA (${activeHospital.blendedPra.toLocaleString()}) × MPL ({(calcResult.medicarePatientLoad * 100).toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Operating & Capital IME Panel (Worksheet E, Part A) */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Operating &amp; Capital IME Adjustment</h3>
                    <p className="text-[11px] text-slate-400 font-mono">42 CFR § 412.105 | Worksheet E, Part A</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-blue-950 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold">
                  ${Math.round(calcResult.operatingImePayment + calcResult.capitalImePayment).toLocaleString()}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Inpatient Available Bed Count:</span>
                  <span className="font-mono text-white font-semibold">{activeHospital.inpatientBedCount} Beds</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Allowable IME Capped FTEs:</span>
                  <span className="font-mono text-blue-300 font-semibold">{calcResult.allowableImeFtes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Intern-and-Resident-to-Bed (IRB) Ratio:</span>
                  <span className="font-mono text-white font-bold">{calcResult.internAndResidentToBedRatio.toFixed(4)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Operating IME Payment Factor:</span>
                  <span className="font-mono text-blue-300 font-bold">{(calcResult.operatingImeFactor * 100).toFixed(4)}%</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Operating Base DRG Revenue:</span>
                  <span className="font-mono text-white">${activeHospital.annualBaseIppsOperatingDrgRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Operating IME Payment:</span>
                  <span className="font-mono text-emerald-400 font-bold">${Math.round(calcResult.operatingImePayment).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Capital IME Payment (42 CFR § 412.322):</span>
                  <span className="font-mono text-blue-200">${Math.round(calcResult.capitalImePayment).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="text-blue-400 font-bold">Statutory Operating IME Formula:</div>
                <div className="text-slate-400">
                  Adjustment Factor = 1.35 × [(1 + {calcResult.internAndResidentToBedRatio.toFixed(4)})^0.405 - 1] = {(calcResult.operatingImeFactor * 100).toFixed(4)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Medicare Advantage Shadow Claims */}
        {activeTab === 'shadow' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    Medicare Advantage (Part C) Information-Only Shadow Claim Radar
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Authority: Balanced Budget Act of 1997 § 4624, 42 CFR § 412.105(g), &amp; CMS Transmittal 10738
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">Annual Recoverable Shadow IME:</span>
                <div className="text-2xl font-bold font-mono text-amber-300">
                  ${Math.round(calcResult.unbilledMaShadowLoss).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">Annual MA Inpatient Days</span>
                <div className="text-xl font-bold text-white font-mono">
                  {activeHospital.medicareAdvantageDays.toLocaleString()} Days
                </div>
                <p className="text-[11px] text-slate-300">
                  {(
                    (activeHospital.medicareAdvantageDays /
                      (activeHospital.medicareFfsDays + activeHospital.medicareAdvantageDays)) *
                    100
                  ).toFixed(1)}
                  % of all Medicare inpatient census.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">MA Eligible Operating IME</span>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  ${Math.round(calcResult.maEligibleImeRevenue).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-300">
                  Direct cash entitlement paid by CMS MAC, independent of MA health plan.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">Unfiled Claim Leakage</span>
                <div className="text-xl font-bold text-amber-400 font-mono">
                  ${Math.round(calcResult.unbilledMaShadowLoss).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-300">
                  Lost annually if claims exceed the 1-year timely filing limit (SSA § 1814(a)(1)).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>The Multi-Million Dollar Hospital Revenue Cycle Trap:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                When a Medicare Advantage enrollee (e.g., UnitedHealthcare, Humana, Aetna) is discharged, the hospital
                submits an 837I claim to the commercial plan. However, <strong>commercial payers do not pay IME</strong>.
                Teaching hospitals must submit an <em>informational-only claim</em> (Type of Bill 111 with Condition Code
                04 or 69) directly to their regional Medicare Administrative Contractor (MAC). Unfiled shadow claims
                represent the single largest preventable leakage in academic medicine.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: CAA § 126 / § 127 Slot Application */}
        {activeTab === 'caa' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">
                    Consolidated Appropriations Act (CAA 2021 § 126 &amp; CAA 2023 § 4122) Cap Relief
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Federal distribution of 1,200 permanent Medicare-funded GME resident slots.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">Recurring Annual Uplift:</span>
                <div className="text-2xl font-bold font-mono text-purple-300">
                  +${Math.round(calcResult.totalCaaExpansionValue).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-teal-300">Statutory Eligibility Categories:</span>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className={`p-2 rounded border ${activeHospital.caaCategory === 'CAT_1_RURAL' ? 'bg-teal-950/40 border-teal-500/60 text-white font-semibold' : 'border-slate-800'}`}>
                    <strong>Category 1:</strong> Rural Hospitals or reclassified rural hospitals (42 CFR § 412.103).
                  </li>
                  <li className={`p-2 rounded border ${activeHospital.caaCategory === 'CAT_2_OVER_CAP' ? 'bg-teal-950/40 border-teal-500/60 text-white font-semibold' : 'border-slate-800'}`}>
                    <strong>Category 2:</strong> Hospitals training residents over their statutory BBA-97 cap.
                  </li>
                  <li className={`p-2 rounded border ${activeHospital.caaCategory === 'CAT_3_HIGH_HPSA' ? 'bg-teal-950/40 border-teal-500/60 text-white font-semibold' : 'border-slate-800'}`}>
                    <strong>Category 3:</strong> Hospitals in states with highest Health Professional Shortage Area (HPSA) population.
                  </li>
                  <li className={`p-2 rounded border ${activeHospital.caaCategory === 'CAT_4_HPSA_SERVING' ? 'bg-teal-950/40 border-teal-500/60 text-white font-semibold' : 'border-slate-800'}`}>
                    <strong>Category 4:</strong> Hospitals serving designated geographic or mental health HPSAs.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-purple-300">Financial Impact of +{customCaaSlots.toFixed(1)} Awarded Slots:</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Marginal Direct GME (DGME) Revenue:</span>
                    <span className="font-mono text-teal-300 font-bold">+${Math.round(calcResult.caaSlotMarginalDgme).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Marginal Operating IME Yield:</span>
                    <span className="font-mono text-blue-300 font-bold">+${Math.round(calcResult.caaSlotMarginalIme).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Net 10-Year Recurring Value:</span>
                    <span className="font-mono text-purple-300 font-extrabold">+${Math.round(calcResult.totalCaaExpansionValue * 10).toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                    Awarded slots become permanent additions to the hospital&apos;s Worksheet E-4 and E Part A baseline caps,
                    permanently converting over-cap resident stipends into federal revenue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Inpatient Psychiatric Facility (IPF) Teaching & Quality (IPFQR) */}
        {activeTab === 'ipf' && activeHospital.isIpf && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">
                    Inpatient Psychiatric Facility (IPF) Teaching Adjustment &amp; Quality Reporting (IPFQR)
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Authority: 42 CFR § 412.424(d)(1)(iii) &amp; Social Security Act § 1886(s)(4)
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">Annual Psychiatric Teaching Add-On:</span>
                <div className="text-2xl font-bold font-mono text-teal-300">
                  +${Math.round(calcResult.ipfTeachingPayment ?? 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300">IPF Teaching Adjustment Mechanics:</span>
                  <span className="text-xs font-mono text-teal-400 font-bold">
                    +{((calcResult.ipfTeachingFactor ?? 0) * 100).toFixed(3)}% Add-on
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 font-mono text-xs text-slate-300 space-y-1">
                  <div className="text-slate-400">Statutory IPF Formula:</div>
                  <div className="text-teal-300">
                    Teaching Factor = (1 + {calcResult.allowableImeFtes.toFixed(2)} / {activeHospital.averageDailyCensus})^0.5150 - 1
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Unlike acute care hospitals (where the teaching multiplier exponent is 0.405), CMS awards Inpatient
                  Psychiatric Facilities a powerful <strong>0.5150 exponent</strong> to reflect the high clinical oversight
                  required in psychiatric residency training.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300">IPFQR Quality Reporting Safeguard:</span>
                  <button
                    onClick={() => setIpfqrCompliant(!ipfqrCompliant)}
                    className={`px-3 py-1 rounded text-xs font-bold font-mono transition-all ${
                      ipfqrCompliant
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {ipfqrCompliant ? 'Compliant (95%+)' : 'NON-COMPLIANT (-2% CUT)'}
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Market Basket Reduction:</span>
                    <span className={`font-mono font-bold ${ipfqrCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {ipfqrCompliant ? '0.0%' : '-2.0% Statutory Penalty'}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Annual Revenue at Risk:</span>
                    <span className="font-mono text-rose-300 font-bold">
                      ${Math.round(calcResult.ipfqrAnnualRevenueAtRisk ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Under Social Security Act § 1886(s)(4), failing to report required IPFQR measures (e.g., metabolic
                    screening on antipsychotics, seclusion hours) triggers an automatic 2.0 percentage point reduction
                    to the federal per-diem rate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Callout Bar */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-blue-950/60 border border-teal-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-teal-300 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>CMS-2552-10 Worksheet E-4 &amp; Shadow Billing Audit Defense Ready</span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Generate a formal Medicare cost report redetermination brief, condition code 04 shadow-claim substantiation,
              and CAA slot expansion dossier certified with SHA-256 cryptographic proof.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDossierModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20"
            >
              <FileText className="w-4 h-4" />
              <span>Generate CMS Cost Report Audit Dossier</span>
            </button>
          </div>
        </div>

        {/* 1-Click CMS Cost Report Audit Dossier Modal */}
        {isDossierModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="CMS Form 2552-10 Graduate Medical Education Audit Dossier"
          >
            <div className="bg-slate-900 border border-teal-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-teal-500/20 border border-teal-500/30 text-teal-300 text-[10px] font-mono font-bold">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{dossier.auditHash}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">CMS-2552-10 Worksheet E-4 &amp; IME Defense Brief</h3>
                </div>
                <button
                  onClick={() => setIsDossierModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xl font-bold p-2"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs">
                {/* Legal Header */}
                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-teal-300">
                  {dossier.legalHeader}
                </div>

                {/* Worksheet E-4 */}
                <div className="space-y-2">
                  <div className="text-teal-400 font-bold uppercase tracking-wider text-xs">
                    Form CMS-2552-10 Worksheet E-4 (Direct Graduate Medical Education)
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    {Object.entries(dossier.worksheetE4Data).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-slate-300">
                        <span className="text-slate-400">{key}:</span>
                        <span className="font-bold text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Worksheet E, Part A */}
                <div className="space-y-2">
                  <div className="text-blue-400 font-bold uppercase tracking-wider text-xs">
                    Form CMS-2552-10 Worksheet E, Part A (Operating &amp; Capital IME)
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    {Object.entries(dossier.worksheetEPartAData).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-slate-300">
                        <span className="text-slate-400">{key}:</span>
                        <span className="font-bold text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shadow Claim Brief */}
                <div className="space-y-2">
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-xs">
                    Medicare Advantage Condition Code 04 Timely Filing Brief
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap text-slate-300 leading-relaxed">
                    {dossier.shadowClaimDefenseBrief}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Certified SHA-256 Audit Trail • 42 CFR § 413.75 - § 413.83
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyDossier}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    {copiedDossier ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDossier ? 'Copied to Clipboard' : 'Copy Full Dossier'}</span>
                  </button>
                  <button
                    onClick={() => setIsDossierModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default GmeImeCapOptimizer;
