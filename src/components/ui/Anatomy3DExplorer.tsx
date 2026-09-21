'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ANATOMY_SYSTEMS } from '@/data/anatomyAtlasData';
import {
  ShieldAlert,
  CheckCircle2,
  FileText,
  Search,
  BookOpen,
  Activity,
  Layers,
  ExternalLink,
  Award,
  AlertTriangle,
  Fingerprint
} from 'lucide-react';

export default function Anatomy3DExplorer() {
  const [selectedSystemId, setSelectedSystemId] = useState<string>('head-neck');
  const [activeTab, setActiveTab] = useState<'codes' | 'modifiers' | 'ncci' | 'cases' | 'sovereign'>('codes');
  const [searchQuery, setSearchQuery] = useState('');
  const [signedOffSystems, setSignedOffSystems] = useState<Record<string, boolean>>({});

  const activeSystem = useMemo(() => {
    return ANATOMY_SYSTEMS.find((s) => s.id === selectedSystemId) || ANATOMY_SYSTEMS[0];
  }, [selectedSystemId]);

  // Search filtering across all systems
  const filteredSystems = useMemo(() => {
    if (!searchQuery.trim()) return ANATOMY_SYSTEMS;
    const q = searchQuery.toLowerCase();
    return ANATOMY_SYSTEMS.filter((sys) => {
      const matchTitle = sys.title.toLowerCase().includes(q) || sys.subtitle.toLowerCase().includes(q);
      const matchLandmark = sys.anatomicalLandmarks.some((l) => l.toLowerCase().includes(q));
      const matchCode = sys.codes.some(
        (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      );
      const matchMod = sys.mandatoryModifiers.some(
        (m) => m.modifier.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
      );
      return matchTitle || matchLandmark || matchCode || matchMod;
    });
  }, [searchQuery]);

  const handleSignOff = (systemId: string) => {
    setSignedOffSystems((prev) => ({ ...prev, [systemId]: true }));
  };

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-teal/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal/15 border border-teal/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Rohen Photographic Atlas of Anatomy Digitalization (7th Ed.)
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The 3D Anatomical Coding &amp; Sovereign Gate Matrix
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            In medical billing and coding, <strong className="text-white">anatomy is the legal source of truth</strong>.
            Explore Rohen&apos;s 8 core anatomical systems mapped directly to CPT, CDT, NDC, mandatory modifiers, and
            certified human sign-off gates.
          </p>

          {/* Search bar */}
          <div className="mt-6 relative max-w-xl mx-auto">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search anatomical landmark, code (e.g. 27447, D7240, 92928), or modifier (-LD, -FA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* 8-System Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin scrollbar-thumb-slate-700">
          {filteredSystems.map((sys) => {
            const isSelected = sys.id === selectedSystemId;
            const isSigned = signedOffSystems[sys.id];
            return (
              <button
                key={sys.id}
                onClick={() => {
                  setSelectedSystemId(sys.id);
                  setActiveTab('codes');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-lg shadow-teal-500/20 font-bold scale-[1.02]'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white hover:border-slate-600'
                }`}
              >
                <span>Ch. {sys.chapterNumber}: {sys.title.split(':')[0].split(',')[0]}</span>
                {isSigned && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main 3D Anatomy Display & RCM Telemetry Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: High-Resolution 3D Medical Render & Anatomical Callouts (5 cols) */}
          <div className="lg:col-span-5 bg-slate-850 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-widest">
                  Chapter {activeSystem.chapterNumber} • {activeSystem.rohenPages}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{activeSystem.title}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-400">
                {activeSystem.dissectionFiguresCount} Dissections
              </span>
            </div>

            {/* High-Resolution 3D Picture Display with interactive hover glow */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl group bg-slate-950">
              <Image
                src={activeSystem.imagePath}
                alt={activeSystem.title}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-teal-300 font-mono text-[11px] backdrop-blur-sm">
                  <Activity className="w-3 h-3 text-teal-400" />
                  Volumetric 3D Medical Dissection
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Rohen 7th Ed. Photographic Standard
                </span>
              </div>
            </div>

            {/* Anatomical Dissection Landmarks */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                Verified Anatomical Landmarks in this Volume
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeSystem.anatomicalLandmarks.map((landmark, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200 flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                    <span>{landmark}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Overview Note */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-teal-300">RCM Clinical Significance: </span>
              {activeSystem.clinicalOverview}
            </div>
          </div>

          {/* Right Column: RCM Coding & Sovereign Gate Telemetry Console (7 cols) */}
          <div className="lg:col-span-7 bg-slate-850 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-6">
            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-750 pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('codes')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'codes'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                1. Procedure Codes ({activeSystem.codes.length})
              </button>
              <button
                onClick={() => setActiveTab('modifiers')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'modifiers'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                2. Mandatory Modifiers ({activeSystem.mandatoryModifiers.length})
              </button>
              <button
                onClick={() => setActiveTab('ncci')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'ncci'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                3. NCCI Bundling Trap
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'cases'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                4. Clinical Case Study
              </button>
              <button
                onClick={() => setActiveTab('sovereign')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'sovereign'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                5. Sovereign Sign-Off Gate
              </button>
            </div>

            {/* TAB CONTENT 1: CODES (CPT, CDT, HCPCS, ICD-10) */}
            {activeTab === 'codes' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Code &amp; Classification</span>
                  <span>Global Period / Billing Rules</span>
                </div>
                {activeSystem.codes.map((c) => (
                  <div
                    key={c.code}
                    className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-teal-500/50 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-teal-300">{c.code}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-700 text-slate-300">
                          {c.system}
                        </span>
                        <span className="text-xs text-slate-400">• {c.category}</span>
                      </div>
                      {c.globalPeriod && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-teal-950 border border-teal-800/60 text-teal-400">
                          {c.globalPeriod}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-white">{c.name}</div>
                    <div className="text-xs text-slate-300 leading-relaxed">{c.description}</div>
                    {c.crossCodeNotice && (
                      <div className="mt-1 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{c.crossCodeNotice}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT 2: MANDATORY ANATOMICAL MODIFIERS */}
            {activeTab === 'modifiers' && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Payers enforce automated rejection filters on claims lacking anatomical specificity. The following
                  modifiers are legally required for this anatomical compartment:
                </p>
                {activeSystem.mandatoryModifiers.map((mod) => (
                  <div
                    key={mod.modifier}
                    className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60">
                        {mod.modifier}
                      </span>
                      <span className="text-sm font-bold text-white">{mod.name}</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      <strong className="text-slate-200">Payer Requirement: </strong>
                      {mod.rule}
                    </div>
                    <div className="text-xs text-teal-300/90 bg-teal-950/40 p-2 rounded border border-teal-900/50">
                      <strong className="text-teal-200">Human Attestation: </strong>
                      {mod.attestationRequirement}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT 3: NCCI BUNDLING TRAP */}
            {activeTab === 'ncci' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{activeSystem.ncciBundlingTrap.ruleTitle}</span>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-900/60 text-rose-200 border border-rose-700/60">
                    {activeSystem.ncciBundlingTrap.carcCode}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeSystem.ncciBundlingTrap.conflictDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1.5">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Algorithmic Detection
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeSystem.ncciBundlingTrap.algorithmicDetection}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Human Sovereign Resolution
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeSystem.ncciBundlingTrap.humanResolution}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: CLINICAL CASE SCENARIO */}
            {activeTab === 'cases' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <div>
                    <span className="text-[11px] font-mono text-teal-400 uppercase tracking-widest font-bold">
                      Clinical Encounter
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {activeSystem.clinicalCaseScenario.patientCondition}
                    </h4>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-200">Operative Findings: </strong>
                    {activeSystem.clinicalCaseScenario.operativeFindings}
                  </div>

                  {/* Comparison: AI Failure vs Human Sign-Off */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs space-y-1">
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> What Autonomous AI Failed:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {activeSystem.clinicalCaseScenario.unbundledAIFailure}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs space-y-1">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Certified Human Action:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {activeSystem.clinicalCaseScenario.certifiedHumanSignOff}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-teal-950/60 border border-teal-800/60 text-xs text-teal-200 font-mono flex items-center justify-between">
                    <span>Financial &amp; Compliance Result:</span>
                    <strong className="text-emerald-400">{activeSystem.clinicalCaseScenario.financialVariance}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: SOVEREIGN SIGN-OFF GATE */}
            {activeTab === 'sovereign' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-teal-400 font-bold uppercase tracking-wider">
                        Mandatory Audit Authority
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        {activeSystem.sovereignGateSignOff.auditorCredentials}
                      </h4>
                    </div>
                    {signedOffSystems[activeSystem.id] ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Claim Signed &amp; Dispatched
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-700/60 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Human Gate Pending
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Required Evidentiary Documentation:
                    </p>
                    <ul className="space-y-1.5">
                      {activeSystem.sovereignGateSignOff.requiredDocumentation.map((doc, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-750 text-xs text-slate-300 italic">
                    &ldquo;{activeSystem.sovereignGateSignOff.attestationStatement}&rdquo;
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleSignOff(activeSystem.id)}
                      disabled={signedOffSystems[activeSystem.id]}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                        signedOffSystems[activeSystem.id]
                          ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/60 cursor-default'
                          : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 font-extrabold hover:scale-[1.01]'
                      }`}
                    >
                      <Fingerprint className="w-4 h-4" />
                      {signedOffSystems[activeSystem.id]
                        ? 'Digital Cryptographic SHA-256 Signature Sealed • Certified Clean'
                        : 'Sign Off as Certified Coder & Authorize Claim Dispatch'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
