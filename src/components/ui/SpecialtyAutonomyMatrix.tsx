'use client';

import React, { useState, useMemo } from 'react';
import { SPECIALTY_RCM_PROFILES } from '@/data/specialtyRcmData';
import {
  Search,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Scale,
  Award,
  BookOpen,
  Stethoscope,
  ExternalLink,
  Layers,
  Fingerprint
} from 'lucide-react';

export default function SpecialtyAutonomyMatrix() {
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('allergy-immunology');
  const [activeTab, setActiveTab] = useState<'codes' | 'modifiers' | 'regulatory' | 'autonomy'>('codes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const categories = useMemo(() => {
    const set = new Set(SPECIALTY_RCM_PROFILES.map((s) => s.abmsCategory));
    return ['ALL', ...Array.from(set)];
  }, []);

  const filteredSpecialties = useMemo(() => {
    return SPECIALTY_RCM_PROFILES.filter((s) => {
      const matchCat = categoryFilter === 'ALL' || s.abmsCategory === categoryFilter;
      if (!searchQuery.trim()) return matchCat;
      const q = searchQuery.toLowerCase();
      const hay = (
        s.name + ' ' +
        s.taxonomyCode + ' ' +
        s.cptCodeRange + ' ' +
        s.credentialRequired + ' ' +
        s.coreCodes.map((c) => c.code + ' ' + c.label).join(' ') + ' ' +
        s.mandatoryModifiers.map((m) => m.modifier + ' ' + m.name).join(' ') + ' ' +
        s.regulatoryFramework.cmsManualRef + ' ' +
        s.regulatoryFramework.oigWorkPlanFocus
      ).toLowerCase();
      return matchCat && hay.includes(q);
    });
  }, [categoryFilter, searchQuery]);

  const activeSpecialty = useMemo(() => {
    return (
      SPECIALTY_RCM_PROFILES.find((s) => s.id === selectedSpecialtyId) ||
      filteredSpecialties[0] ||
      SPECIALTY_RCM_PROFILES[0]
    );
  }, [selectedSpecialtyId, filteredSpecialties]);

  return (
    <section id="specialty-autonomy-matrix" className="py-20 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal/15 border border-teal/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
            American Board of Medical Specialties (ABMS) • 20 Core Disciplines
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Specialty Sovereign Autonomy &amp; RCM Directory
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Revenue cycle rules vary radically across medical specialties. Where probabilistic AI fails due to uncalibrated
            anesthesia time, oncology waste rules, or surgery global periods, our deterministic rule scrubbers pair with
            credentialed human specialists to guarantee 100% compliant claim submission.
          </p>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-2xl mx-auto">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search across 20 specialties, CPT codes (e.g. 66984, 00840), modifiers (-AA, -25, -GP), or regulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all shadow-inner"
            />
          </div>

          {/* Category Filter Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  categoryFilter === cat
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-lg shadow-teal-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 20-Specialty Selector Grid (Pills / Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {filteredSpecialties.map((specialty) => {
            const isSelected = activeSpecialty.id === specialty.id;
            return (
              <button
                key={specialty.id}
                onClick={() => {
                  setSelectedSpecialtyId(specialty.id);
                  setActiveTab('codes');
                }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-teal-400/80 shadow-lg shadow-teal-500/10 ring-1 ring-teal-400/50'
                    : 'bg-slate-850 border-slate-750 hover:border-slate-600 hover:bg-slate-800/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className={isSelected ? 'text-teal-300 font-bold' : 'text-slate-500'}>
                      {specialty.taxonomyCode}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {specialty.cptCodeRange.split(',')[0].slice(0, 11)}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-1">
                    {specialty.name}
                  </h4>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-700/50 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 truncate max-w-[100px]">{specialty.credentialRequired.split(' ')[0]}</span>
                  <span className="font-mono text-emerald-400 font-bold">{specialty.rcmBenchmark.cleanClaimTarget}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Specialty Comprehensive Telemetry Console */}
        <div className="bg-slate-850 border border-slate-750 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Active Specialty Header Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-750">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  {activeSpecialty.taxonomyCode}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {activeSpecialty.abmsCategory}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-800/60 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  {activeSpecialty.credentialRequired}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeSpecialty.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Primary Procedure Code Range: <span className="font-mono text-teal-300 font-semibold">{activeSpecialty.cptCodeRange}</span>
              </p>
            </div>

            {/* Benchmark Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-750 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Clean Claim Target</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{activeSpecialty.rcmBenchmark.cleanClaimTarget}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-750 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Unverified AI Risk</span>
                <span className="text-lg font-bold font-mono text-rose-400">{activeSpecialty.rcmBenchmark.typicalDenialRateWithoutGate}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-750 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Primary Prevented CARC</span>
                <span className="text-xs font-bold font-mono text-amber-300 truncate block mt-1">{activeSpecialty.rcmBenchmark.primaryCARC.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-750 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('codes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'codes'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              1. Core Code Taxonomy ({activeSpecialty.coreCodes.length})
            </button>
            <button
              onClick={() => setActiveTab('modifiers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'modifiers'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              2. Mandatory Modifiers &amp; Audit Tripwires ({activeSpecialty.mandatoryModifiers.length})
            </button>
            <button
              onClick={() => setActiveTab('regulatory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'regulatory'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              3. Regulatory RCM Authority (CMS &amp; OIG)
            </button>
            <button
              onClick={() => setActiveTab('autonomy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'autonomy'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              4. Autonomous AI Failure vs. Human Sovereign Seal
            </button>
          </div>

          {/* TAB 1: CORE CODES */}
          {activeTab === 'codes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSpecialty.coreCodes.map((c) => (
                <div
                  key={c.code}
                  className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-teal-500/40 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-teal-300">{c.code}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-700 text-slate-300">
                        {c.system}
                      </span>
                    </div>
                    {c.globalPeriod && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-950 border border-teal-800 text-teal-300">
                        {c.globalPeriod}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">{c.label}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{c.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MANDATORY MODIFIERS */}
          {activeTab === 'modifiers' && (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-300">
                Payer claims processing systems enforce automated denial filters on claims lacking specialty-specific modifiers:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSpecialty.mandatoryModifiers.map((mod) => (
                  <div
                    key={mod.modifier}
                    className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60">
                        {mod.modifier}
                      </span>
                      <span className="text-sm font-bold text-white">{mod.name}</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      <strong className="text-slate-200">Clinical Purpose: </strong>
                      {mod.usage}
                    </div>
                    <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300">
                      <strong className="text-rose-200">Audit Tripwire: </strong>
                      {mod.auditTripwire}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REGULATORY RCM AUTHORITY */}
          {activeTab === 'regulatory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <BookOpen className="w-4 h-4" />
                  <span>CMS Internet-Only Manual (IOM) Authority</span>
                </div>
                <p className="text-xs font-mono text-teal-300 bg-slate-900 p-2.5 rounded border border-slate-750">
                  {activeSpecialty.regulatoryFramework.cmsManualRef}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Scale className="w-4 h-4" />
                  <span>National Correct Coding Initiative (NCCI) Policy</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-750">
                  {activeSpecialty.regulatoryFramework.ncciGuideline}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  <span>OIG Work Plan Audit Scrutiny Area</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-750">
                  {activeSpecialty.regulatoryFramework.oigWorkPlanFocus}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ExternalLink className="w-4 h-4" />
                  <span>Local &amp; National Coverage Determinations (LCD/NCD)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-750">
                  {activeSpecialty.regulatoryFramework.lcdNcdReference}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: AUTONOMY FAILURE VS HUMAN SIGN-OFF */}
          {activeTab === 'autonomy' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Autonomous AI Failure Point */}
                <div className="p-5 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>What Autonomous AI Hallucinates or Fails</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeSpecialty.autonomousAiFailureRisk}
                  </p>
                </div>

                {/* Certified Human Sovereign Protocol */}
                <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Certified Human Sovereign Gate Protocol</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeSpecialty.humanSovereigntyProtocol}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-750 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Mandatory Specialist Signer: <strong className="text-white">{activeSpecialty.credentialRequired}</strong>
                </span>
                <span className="text-teal-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Protected from: <strong className="text-white">{activeSpecialty.rcmBenchmark.primaryCARC}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
