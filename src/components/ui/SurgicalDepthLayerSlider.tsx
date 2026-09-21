'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  HISTOLOGICAL_STRATA,
  SURGICAL_DEPTH_DOMAINS,
  SurgicalDomainId,
  DepthStratum,
} from '@/data/surgicalDepthData';
import {
  Scissors,
  Layers,
  Activity,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Info,
  FileCheck2,
  Sliders
} from 'lucide-react';

export default function SurgicalDepthLayerSlider() {
  const [activeDomainId, setActiveDomainId] = useState<SurgicalDomainId>('debridement');
  const [sliderDepthMm, setSliderDepthMm] = useState<number>(12); // Default to Stratum 2 (Subcutaneous)
  const [selectedTestPhrase, setSelectedTestPhrase] = useState<'compliant' | 'nonCompliant' | null>(null);

  // Derive active stratum from slider depth
  const activeStratum: DepthStratum = useMemo(() => {
    const found = HISTOLOGICAL_STRATA.find(
      (s) => sliderDepthMm >= s.depthRangeMm[0] && sliderDepthMm <= s.depthRangeMm[1]
    );
    return found || HISTOLOGICAL_STRATA[HISTOLOGICAL_STRATA.length - 1];
  }, [sliderDepthMm]);

  // Active procedure details
  const activeProcedure = activeStratum.procedures[activeDomainId];

  // Calculate percentage of visual caliper line from 0 to 60 mm
  const depthPercentage = Math.min(Math.max((sliderDepthMm / 60) * 100, 0), 100);

  // Get icon for active domain
  const renderDomainIcon = (id: SurgicalDomainId) => {
    switch (id) {
      case 'debridement':
        return <Scissors className="w-4 h-4" />;
      case 'tumorExcision':
        return <Layers className="w-4 h-4" />;
      case 'incisionDrainage':
        return <Activity className="w-4 h-4" />;
      case 'woundRepair':
        return <Maximize2 className="w-4 h-4" />;
      default:
        return <Scissors className="w-4 h-4" />;
    }
  };

  return (
    <section id="surgical-depth-slider" className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 right-10 w-[700px] h-[500px] bg-teal-500/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[450px] bg-amber-500/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            Anatomical Tissue Planes • CPT Surgical Depth Calibration
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Interactive Surgical Depth Layer Slider
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            In surgical coding, tissue depth is the single most aggressively audited variable by CMS Recovery Audit Contractors (RAC).
            Drag the caliper through the anatomical planes to witness how CPT codes, Medicare RVUs, and OIG audit tripwires transform millimeter-by-millimeter.
          </p>
        </div>

        {/* 4 Surgical Clinical Domains Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          {SURGICAL_DEPTH_DOMAINS.map((domain) => {
            const isSelected = activeDomainId === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => {
                  setActiveDomainId(domain.id);
                  setSelectedTestPhrase(null);
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 ring-1 ring-teal-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {renderDomainIcon(domain.id)}
                <span>{domain.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Interactive Stage: Slider + 3D Visual Cross Section + Telemetry Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Visual Cross-Section & Depth Caliper Slider (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
              {/* Slider Control Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-teal-400" />
                  Dissection Depth Caliper
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-teal-950 border border-teal-800 text-teal-300 font-mono text-xs font-bold">
                  {sliderDepthMm.toFixed(1)} mm
                </span>
              </div>

              {/* Range Input Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="0.5"
                  value={sliderDepthMm}
                  onChange={(e) => {
                    setSliderDepthMm(parseFloat(e.target.value));
                    setSelectedTestPhrase(null);
                  }}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
                  <span>0 mm (Skin)</span>
                  <span>18 mm (Fascia)</span>
                  <span>25 mm (Muscle)</span>
                  <span>60 mm (Bone)</span>
                </div>
              </div>

              {/* 5 Quick Stratum Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 pt-1">
                {HISTOLOGICAL_STRATA.map((stratum) => {
                  const isActive = activeStratum.id === stratum.id;
                  return (
                    <button
                      key={stratum.id}
                      onClick={() => {
                        // Set slider to midpoint of stratum
                        const mid = (stratum.depthRangeMm[0] + stratum.depthRangeMm[1]) / 2;
                        setSliderDepthMm(mid);
                        setSelectedTestPhrase(null);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all text-center ${
                        isActive
                          ? 'bg-teal-500 text-slate-950 ring-1 ring-teal-300 shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                      }`}
                    >
                      L{stratum.stratumNumber}: {stratum.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>

              {/* 3D Anatomical Cross-Section Frame with Dynamic Cutting Caliper */}
              <div className="relative rounded-xl overflow-hidden border border-slate-750 bg-slate-950 aspect-[16/10] sm:aspect-[4/3] group shadow-inner">
                <Image
                  src="/images/anatomy/tissue-planes-3d.jpg"
                  alt="Human Tissue Layers and Surgical Excision Depths Cross-Section"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />

                {/* Shaded Depth Plane Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

                {/* Laser / Caliper Needle indicating exact depth plane */}
                <div
                  className="absolute left-0 right-0 border-b-2 border-teal-400 pointer-events-none transition-all duration-150 flex items-center justify-between px-3"
                  style={{ top: `${depthPercentage}%` }}
                >
                  <div className="px-2 py-0.5 rounded bg-teal-950/90 border border-teal-400 text-teal-300 font-mono text-[10px] font-bold shadow-lg shadow-teal-500/20 -translate-y-1/2">
                    {sliderDepthMm.toFixed(1)} mm • {activeStratum.name}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping -translate-y-1/2" />
                </div>

                {/* Bottom Graphic Legend */}
                <div className="absolute bottom-2 left-2 right-2 p-2.5 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeStratum.accentHex }} />
                    <span className="font-bold text-white">{activeStratum.name}</span>
                  </div>
                  <span className="font-mono text-teal-300 font-semibold">{activeStratum.depthDisplay}</span>
                </div>
              </div>

              {/* Histology Description Card */}
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 space-y-1.5 text-xs">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3 text-teal-400" />
                  Histological Tissue Architecture
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {activeStratum.histologicalComposition}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RCM Telemetry HUD & Regulatory Gate (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Stratum Title & Valuation Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      Stratum {activeStratum.stratumNumber} of 5
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {activeStratum.depthDisplay}
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">
                    {activeStratum.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeStratum.anatomicalPlane}
                  </p>
                </div>

                {/* Work RVU & Medicare Payment Badge */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-xl bg-slate-800/90 border border-slate-700 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Medicare Standard Fee</span>
                    <span className="text-xl font-extrabold font-mono text-emerald-400">
                      {activeProcedure.medicareAllowable}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-teal-300 mt-0.5">
                    {activeProcedure.workRvu} wRVU • {activeProcedure.globalDays}
                  </span>
                </div>
              </div>

              {/* Active CPT Code Definition Box */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-extrabold text-teal-300">
                      CPT {activeProcedure.primaryCpt}
                    </span>
                    {activeProcedure.addlCpt && (
                      <span className="font-mono text-xs text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                        +Add-on {activeProcedure.addlCpt}
                      </span>
                    )}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-slate-900 border border-slate-750 text-slate-300">
                    {activeProcedure.globalDays}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  {activeProcedure.codeLabel}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-700/60">
                  <strong className="text-slate-200">Statutory CMS Authority: </strong>
                  {activeProcedure.cmsCoverageGuideline}
                </p>
              </div>

              {/* Operative Dictation Gold Standard */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase font-mono tracking-wider">
                  <FileCheck2 className="w-4 h-4" />
                  Operative Dictation Standard (Legal Medical Threshold)
                </div>
                <blockquote className="p-3 rounded-lg bg-slate-900 border-l-4 border-sky-400 text-xs italic text-slate-200 leading-relaxed font-mono">
                  {activeProcedure.operativeDictationRequirement}
                </blockquote>
              </div>

              {/* AI Failure vs Sovereign Human Seal Two-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI Failure Alert */}
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Autonomous AI Failure Trap</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeProcedure.aiFailureMode}
                  </p>
                </div>

                {/* Human Sovereign Gate */}
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sovereign Human Protocol</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed space-y-1">
                    <div>
                      <strong className="text-white">Required Signer: </strong>
                      <span className="font-mono text-emerald-300 font-bold">{activeProcedure.humanSignerCredential}</span>
                    </div>
                    <div>
                      <strong className="text-white">Prevented CARC: </strong>
                      <span className="font-mono text-amber-300">{activeProcedure.carcCode.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Operative Dictation Tester */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    Interactive Dictation Auditor: Test Clinician Phrasing
                  </span>
                  <span className="text-[10px] text-slate-500">Click a phrase below</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Compliant Phrase Button */}
                  <button
                    onClick={() => setSelectedTestPhrase('compliant')}
                    className={`p-3 rounded-lg border text-left transition-all text-xs space-y-1.5 ${
                      selectedTestPhrase === 'compliant'
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-400'
                        : 'bg-slate-900 border-slate-750 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-emerald-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Compliant Excerpt
                      </span>
                      <span className="text-[9px] font-mono uppercase bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                        Passes Audit
                      </span>
                    </div>
                    <p className="text-slate-300 italic text-[11px] line-clamp-2">
                      &ldquo;{activeStratum.interactiveDictationCheck.compliantPhrase}&rdquo;
                    </p>
                  </button>

                  {/* Non-Compliant / AI Phrase Button */}
                  <button
                    onClick={() => setSelectedTestPhrase('nonCompliant')}
                    className={`p-3 rounded-lg border text-left transition-all text-xs space-y-1.5 ${
                      selectedTestPhrase === 'nonCompliant'
                        ? 'bg-rose-950/60 border-rose-500 shadow-md shadow-rose-500/10 ring-1 ring-rose-400'
                        : 'bg-slate-900 border-slate-750 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-rose-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Ambiguous AI Excerpt
                      </span>
                      <span className="text-[9px] font-mono uppercase bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                        Denial Risk
                      </span>
                    </div>
                    <p className="text-slate-300 italic text-[11px] line-clamp-2">
                      &ldquo;{activeStratum.interactiveDictationCheck.nonCompliantPhrase}&rdquo;
                    </p>
                  </button>
                </div>

                {/* Auditor Outcome Output Box */}
                {selectedTestPhrase && (
                  <div
                    className={`p-3.5 rounded-lg border text-xs space-y-1 animate-fadeIn ${
                      selectedTestPhrase === 'compliant'
                        ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {selectedTestPhrase === 'compliant' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Adjudication Result: Claim Approved 100%</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                          <span>Adjudication Result: Audit Demand &amp; Penalty Warning</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {selectedTestPhrase === 'compliant'
                        ? activeStratum.interactiveDictationCheck.compliantOutcome
                        : activeStratum.interactiveDictationCheck.nonCompliantOutcome}
                    </p>
                    {selectedTestPhrase === 'nonCompliant' && (
                      <div className="text-[10px] font-mono text-amber-300 pt-1 border-t border-rose-800/40">
                        <strong>Financial Hazard: </strong>
                        {activeStratum.interactiveDictationCheck.auditPenaltyRisk}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
