'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  FileText,
  Sliders,
  TrendingDown,
  Info,
  Stethoscope,
  Activity,
  Layers
} from 'lucide-react';
import {
  HAC_CATEGORIES,
  POA_INDICATOR_DEFINITIONS,
  INPATIENT_HAC_CASES,
  calculateDrgReclassification,
  calculateHacrpAnnualExposure,
  type InpatientHacCase,
  type PoaIndicator,
} from '@/data/hacPoaData';

export function HacPoaPenaltySafeguard() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('spine-fusion-dvt');
  const [activePoa, setActivePoa] = useState<PoaIndicator>('N');
  const [annualRevenueMillions, setAnnualRevenueMillions] = useState<number>(120); // $120M IPPS
  const [hospitalQuartile, setHospitalQuartile] = useState<number>(4); // Default to worst quartile (penalized)
  const [showHacCategories, setShowHacCategories] = useState<boolean>(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState<boolean>(false);
  const [copiedQuery, setCopiedQuery] = useState<boolean>(false);

  const activeCase: InpatientHacCase = useMemo(() => {
    return INPATIENT_HAC_CASES.find((c) => c.id === selectedCaseId) || INPATIENT_HAC_CASES[0];
  }, [selectedCaseId]);

  const drgResult = useMemo(() => {
    return calculateDrgReclassification(activeCase, activePoa);
  }, [activeCase, activePoa]);

  const hacrpResult = useMemo(() => {
    return calculateHacrpAnnualExposure(annualRevenueMillions * 1_000_000, hospitalQuartile);
  }, [annualRevenueMillions, hospitalQuartile]);

  const handleCopyQuery = () => {
    const briefText = `
FORMAL INPATIENT CDI PHYSICIAN QUERY & CMS RAC AUDIT DEFENSE PACKET
--------------------------------------------------------------------------------
STATUTE: Social Security Act § 1886(d)(4)(D) • CMS IPPS Deficit Reduction Act (DRA) 2005
CASE: ${activeCase.title}
SPECIALTY: ${activeCase.specialty}
ADMITTING DIAGNOSIS: ${activeCase.admissionDiagnosis.code} - ${activeCase.admissionDiagnosis.title}
HAC SECONDARY DIAGNOSIS: ${activeCase.hacSecondaryDiagnosis.code} - ${activeCase.hacSecondaryDiagnosis.title} (${activeCase.hacSecondaryDiagnosis.hacTitle})

I. INPATIENT ENCOUNTER DRG FINANCIAL RECONCILIATION
- Target Full DRG (POA = "Y"): ${activeCase.fullDrg.code} (${activeCase.fullDrg.title})
  * Relative Weight: ${activeCase.fullDrg.weight} | Base Payment: $${activeCase.fullDrg.rate.toLocaleString()}
- Current Assigned DRG (POA = "${activePoa}"): ${drgResult.assignedDrgCode} (${drgResult.assignedDrgTitle})
  * Relative Weight: ${drgResult.assignedWeight} | Current Payment: $${drgResult.assignedPayment.toLocaleString()}
- DRG Downward Reclassification Shortfall: $${drgResult.revenueLoss.toLocaleString()}

II. ADMISSION CLINICAL EVIDENCE & TRIAGE FINDINGS
${activeCase.admissionEvidence}

III. INPATIENT CLINICAL PROGRESSION & CODING TRAP
${activeCase.postOpProgression}

IV. AHIMA/ACDIS-COMPLIANT PHYSICIAN QUERY
${activeCase.physicianQueryText}

V. SOVEREIGN RAC AUDIT DEFENSE WARRANTY
The Certified Clinical Documentation Specialist (CDIS) and Inpatient Sovereign Coder verify:
1. Clinical findings at triage substantiate pre-existing etiology prior to the inpatient admission order.
2. Upon attending physician confirmation, POA indicator must be amended from "${activePoa}" to certified "Y", reversing the $${activeCase.financialDelta.toLocaleString()} reimbursement loss.
3. This amendment eliminates the case from CMS Recalibrated PSI 90 Domain 1 penalty numerators under the Hospital-Acquired Condition Reduction Program (HACRP).

SOVEREIGN CLINICAL REVIEW HASH: SHA-256[INPATIENT:${activeCase.id}:POA_RECONCILED:VERIFIED]
    `.trim();

    navigator.clipboard.writeText(briefText);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 3000);
  };

  return (
    <section
      id="hac-poa-safeguard"
      aria-label="Hospital-Acquired Condition (HAC) & Present on Admission (POA) Penalty Safeguard"
      className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-rose-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-10 w-[400px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* 1. Header & Statutory Framework */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            SSA § 1886(d)(4)(D) &amp; § 1886(p) • HOSPITAL-ACQUIRED CONDITION (HAC) &amp; POA SAFEGUARD
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Hospital-Acquired Condition (HAC) &amp; POA Penalty Safeguard
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Preventing secondary MS-DRG downward reclassifications ($4,000–$12,800/case) and modeling CMS HAC Reduction Program (HACRP) 1% IPPS annual hospital penalty thresholds via certified Clinical Documentation Improvement (CDI).
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              Deficit Reduction Act (DRA) 2005
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              CMS 14 HAC Categories
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              UB-04 FL 67 POA (Y / N / U / W / 1)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              HACRP 1% IPPS Penalty
            </span>
            <span className="px-2.5 py-1 rounded-md bg-rose-950/60 border border-rose-700/50 text-rose-300">
              CMS Recalibrated PSI 90 Composite
            </span>
          </div>
        </div>

        {/* 2. Inpatient Case Selector Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              Select Inpatient Admission Case Study:
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
              Showing 4 High-Risk DRG Downcoding Scenarios
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {INPATIENT_HAC_CASES.map((c) => {
              const isSelected = c.id === selectedCaseId;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCaseId(c.id);
                    setActivePoa('N'); // Reset to default 'N' to highlight risk
                  }}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 relative ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {c.hacSecondaryDiagnosis.hacTitle.split(':')[0]}
                    </span>
                    <span className="text-[10px] font-mono text-rose-400 font-bold">
                      -${c.financialDelta.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">{c.shortTitle}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{c.specialty}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Inpatient Admission Metadata HUD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Admitting Diagnosis (Principal)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-mono">{activeCase.admissionDiagnosis.code}</span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">{activeCase.admissionDiagnosis.title}</p>
            <span className="text-[10px] font-mono text-cyan-400 block pt-1">Specialty: {activeCase.specialty}</span>
          </div>

          <div className="space-y-1 border-b md:border-b-0 lg:border-r border-slate-800 pb-3 md:pb-0 lg:pr-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              HAC Secondary Diagnosis
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-rose-400 font-mono">{activeCase.hacSecondaryDiagnosis.code}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                HAC {activeCase.hacSecondaryDiagnosis.hacNumber}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">{activeCase.hacSecondaryDiagnosis.title}</p>
          </div>

          <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Full Baseline DRG (with MCC)
            </span>
            <span className="text-sm font-bold text-emerald-400 block font-mono">{activeCase.fullDrg.code}</span>
            <span className="text-xs text-slate-300 block truncate">{activeCase.fullDrg.title}</span>
            <div className="flex items-center gap-2 text-xs font-mono pt-1 text-slate-400">
              <span>Weight: {activeCase.fullDrg.weight}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">${activeCase.fullDrg.rate.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Downcoded Base DRG (HAC Penalty)
            </span>
            <span className="text-sm font-bold text-rose-400 block font-mono">{activeCase.downcodedDrg.code}</span>
            <span className="text-xs text-slate-300 block truncate">{activeCase.downcodedDrg.title}</span>
            <div className="flex items-center gap-2 text-xs font-mono pt-1 text-slate-400">
              <span>Weight: {activeCase.downcodedDrg.weight}</span>
              <span>•</span>
              <span className="text-rose-400 font-bold">${activeCase.downcodedDrg.rate.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 4. Interactive POA Indicator Toggler & Live DRG Reclassification Engine */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-bold text-white">
                  Interactive Present on Admission (POA) Grouper Simulator
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Toggle the UB-04 FL 67 POA indicator to witness real-time MS-DRG grouping and statutory payment disallowance.
              </p>
            </div>
            <span className="text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-lg self-start sm:self-auto">
              SSA § 1886(d)(4)(D) Engine
            </span>
          </div>

          {/* POA Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {(['Y', 'N', 'U', 'W', '1'] as PoaIndicator[]).map((indicatorKey) => {
              const isSelected = activePoa === indicatorKey;
              const def = POA_INDICATOR_DEFINITIONS[indicatorKey];
              const isGreen = def.retainsMccStatus;
              return (
                <button
                  key={indicatorKey}
                  onClick={() => setActivePoa(indicatorKey)}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? isGreen
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                        : 'bg-rose-950/40 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-black font-mono">{def.code}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isGreen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {isGreen ? 'Full DRG' : 'Downcoded'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white block truncate">{def.label.split('(')[0]}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                    {def.retainsMccStatus ? 'Retains MCC Status' : 'Strips MCC Status'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* DRG Calculation Impact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Assigned MS-DRG
              </span>
              <div className="text-xl font-black text-white font-mono flex items-center gap-2">
                <span>{drgResult.assignedDrgCode}</span>
                {drgResult.hacPenaltyTriggered ? (
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                ) : (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className="text-xs text-slate-400 truncate mt-1">{drgResult.assignedDrgTitle}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Assigned Relative Weight
              </span>
              <div className="text-xl font-black text-white font-mono">
                {drgResult.assignedWeight.toFixed(4)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Baseline: {activeCase.fullDrg.weight.toFixed(4)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Assigned Operating Payment
              </span>
              <div className="text-xl font-black text-white font-mono">
                ${drgResult.assignedPayment.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                FY24 IPPS Base Rate: $6,500.00
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                drgResult.revenueLoss > 0
                  ? 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                  : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
              }`}
            >
              <span className="text-[11px] font-mono uppercase tracking-wider block mb-1">
                Encounter Revenue Shortfall
              </span>
              <div className="text-xl font-black font-mono">
                {drgResult.revenueLoss > 0 ? `-$${drgResult.revenueLoss.toLocaleString()}` : '$0 (Protected)'}
              </div>
              <p className="text-xs mt-1">
                {drgResult.revenueLoss > 0 ? 'Direct Bottom-Line Loss' : 'Maximum Reimbursement Secured'}
              </p>
            </div>
          </div>

          {/* Dynamic Reclassification Guidance Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              drgResult.hacPenaltyTriggered
                ? 'bg-rose-950/30 border-rose-500/50'
                : 'bg-emerald-950/30 border-emerald-500/50'
            }`}
          >
            {drgResult.hacPenaltyTriggered ? (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <div className="font-bold text-white font-mono">{drgResult.poaStatusDescription}</div>
              <div className="text-slate-300 leading-relaxed font-sans">{drgResult.complianceGuidance}</div>
            </div>
          </div>
        </div>

        {/* 5. Clinical Evidence & CDI Remediation Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Triage Evidence */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              1. Admission Clinical Evidence (ED Triage)
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeCase.admissionEvidence}
            </p>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300">
              Audit Note: Documented prior to inpatient admission order.
            </div>
          </div>

          {/* Post-Op Progression Trap */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              2. Hospital Inpatient Coding Trap
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeCase.postOpProgression}
            </p>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300">
              Coding Trap: Lack of physician H&amp;P reconciliation causes default &apos;N&apos; or &apos;U&apos;.
            </div>
          </div>

          {/* CDI Sovereign Remediation */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-emerald-500/30 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              3. Sovereign CDI Remediation Strategy
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeCase.cdiRemediationStrategy}
            </p>
            <button
              onClick={() => setIsQueryModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 mt-1"
            >
              <FileCheck2 className="w-4 h-4 text-slate-950" />
              Generate Compliant Physician Query
            </button>
          </div>
        </div>

        {/* 6. CMS HACRP 1% IPPS Annual Hospital Penalty Modeler */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  CMS HAC Reduction Program (HACRP) 1% IPPS Annual Penalty Modeler
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Simulate annual hospital-wide Medicare operating penalties under Social Security Act § 1886(p).
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg self-start sm:self-auto">
              Domain 1 (PSI 90) + Domain 2 (NHSN)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sliders */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Annual Medicare IPPS Operating Revenue:</span>
                  <span className="text-amber-400 font-bold text-sm">${annualRevenueMillions} Million</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="5"
                  value={annualRevenueMillions}
                  onChange={(e) => setAnnualRevenueMillions(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$30M (Community Hospital)</span>
                  <span>$150M (Regional Medical Center)</span>
                  <span>$300M (Major Academic System)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">CMS Total HAC Score Ranking Quartile:</span>
                  <span
                    className={`font-bold text-sm px-2 py-0.5 rounded ${
                      hospitalQuartile === 4
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    Quartile {hospitalQuartile} {hospitalQuartile === 4 ? '(Worst 25% - Penalized)' : '(Safe Harbor)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={hospitalQuartile}
                  onChange={(e) => setHospitalQuartile(Number(e.target.value))}
                  className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Q1 (Best 25%)</span>
                  <span>Q2 (25%-50%)</span>
                  <span>Q3 (50%-75%)</span>
                  <span className="text-rose-400 font-bold">Q4 (Worst 25% Penalized)</span>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Total Annual Statutory IPPS Penalty:
                </span>
                <div
                  className={`text-3xl sm:text-4xl font-black font-mono ${
                    hacrpResult.isPenalized ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {hacrpResult.isPenalized
                    ? `-$${hacrpResult.annualPenaltyAmount.toLocaleString()}`
                    : '$0 (Safe Harbor)'}
                </div>
                <span className="text-xs text-slate-400 block font-mono">
                  {hacrpResult.isPenalized
                    ? '1.0% statutory deduction across all Medicare IPPS discharges'
                    : 'Hospital maintains safe harbor status outside worst quartile'}
                </span>
              </div>

              <div className="text-xs text-slate-300 font-sans leading-relaxed border-t border-slate-800 pt-3">
                <span className="font-bold text-white">Clinical Quality Impact:</span>{' '}
                {hacrpResult.psi90ScoreImpact}
              </div>
            </div>
          </div>
        </div>

        {/* 7. CMS 14 Statutory HAC Categories Accordion */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  CMS Statutory 14 Hospital-Acquired Condition Categories (DRA 2005)
                </h3>
                <p className="text-xs text-slate-400">
                  Statutory conditions subject to DRG downcoding when not present on admission (POA = &quot;N&quot; or &quot;U&quot;).
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHacCategories(!showHacCategories)}
              className="text-xs font-mono text-rose-400 hover:text-rose-300 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 transition-all"
            >
              {showHacCategories ? 'Collapse Categories [-]' : 'Expand All 14 HACs [+]'}
            </button>
          </div>

          {showHacCategories && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {HAC_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-[10px] font-mono font-bold">
                        {cat.number}
                      </span>
                      {cat.title}
                    </span>
                    <span className="text-[10px] font-mono text-rose-400 font-semibold">{cat.icd10Range}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{cat.clinicalDescription}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                    <span>Citation: {cat.statuteRef}</span>
                    <span className="text-cyan-400">High Risk: {cat.highRiskSpecialties}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8. Formal Physician Query & RAC Defense Modal */}
        {isQueryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-400" />
                  <h3 className="text-lg font-bold text-white">
                    Inpatient CDI Physician Query &amp; CMS RAC Audit Defense Brief
                  </h3>
                </div>
                <button
                  onClick={() => setIsQueryModalOpen(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
                >
                  Close [ESC]
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-4 leading-relaxed">
                <div className="text-rose-400 font-bold">
                  TO: Attending Physician &amp; Surgical Service
                  <br />
                  RE: Present on Admission (POA) Clarification • Encounter {activeCase.id}
                  <br />
                  STATUTORY BASIS: Social Security Act § 1886(d)(4)(D) • AHIMA/ACDIS Compliant Query
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-white font-bold block mb-1">I. CASE IDENTIFIERS &amp; FINANCIAL EXPOSURE</span>
                  Primary Diagnosis: {activeCase.admissionDiagnosis.code} ({activeCase.admissionDiagnosis.title}). Secondary HAC: {activeCase.hacSecondaryDiagnosis.code} ({activeCase.hacSecondaryDiagnosis.title}).
                  Current DRG downcoding from {activeCase.fullDrg.code} ($ {activeCase.fullDrg.rate.toLocaleString()}) to {activeCase.downcodedDrg.code} ($ {activeCase.downcodedDrg.rate.toLocaleString()}) generates a net facility loss of ${activeCase.financialDelta.toLocaleString()}.
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-white font-bold block mb-1">II. CLINICAL TRIAGE EVIDENCE ON ADMISSION</span>
                  {activeCase.admissionEvidence}
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-white font-bold block mb-1">III. COMPLIANT NON-LEADING QUERY</span>
                  {activeCase.physicianQueryText}
                </div>

                <div className="text-[11px] text-emerald-400 border-t border-slate-800 pt-3">
                  SOVEREIGN CDI CERTIFICATION:
                  <br />
                  Certified Clinical Documentation Specialist (CCDS / CDIP)
                  <br />
                  Cryptographic Audit Trail: SHA-256[CASE:{activeCase.id}:POA_QUERY:COMPLIANT]
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="text-xs text-slate-400">
                  AHIMA/ACDIS-compliant non-leading query for hospital medical staff and RAC audit defense.
                </span>
                <button
                  onClick={handleCopyQuery}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  {copiedQuery ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-950" />
                      Copy Physician Query
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default HacPoaPenaltySafeguard;
