'use client';

import { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Cpu,
  UserCheck,
  Hash,
  TrendingUp,
} from 'lucide-react';
import { CLINICAL_CASE_STUDIES } from '@/data/autonomyData';

export default function ClinicalCaseScenarios() {
  const [activeCaseId, setActiveCaseId] = useState<string>(CLINICAL_CASE_STUDIES[0].id);

  const activeCase =
    CLINICAL_CASE_STUDIES.find((c) => c.id === activeCaseId) || CLINICAL_CASE_STUDIES[0];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray/15 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal bg-teal/10 px-3 py-1 rounded-full">
            Clinical Evidence
          </span>
          <h3 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-navy tracking-tight mt-2">
            Real-World Encounters: How Human Sign-Off Protects Revenue
          </h3>
          <p className="text-gray text-xs sm:text-sm mt-1">
            Walk through actual specialty encounters to see how our human autonomy framework prevents denials.
          </p>
        </div>

        {/* Case Switcher Tabs */}
        <div className="flex flex-wrap gap-2">
          {CLINICAL_CASE_STUDIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCaseId(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCaseId === c.id
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-cream text-gray hover:text-navy border border-gray/10'
              }`}
            >
              {c.specialty}
            </button>
          ))}
        </div>
      </div>

      {/* Case Details Card */}
      <div className="space-y-6">
        {/* Title & Presentation */}
        <div className="p-6 rounded-2xl bg-cream border border-gray/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal">
              {activeCase.specialty}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold">
              <TrendingUp className="h-3.5 w-3.5" /> 100% Cash Recovery
            </span>
          </div>
          <h4 className="text-xl font-extrabold text-navy font-jakarta">{activeCase.title}</h4>
          <p className="text-sm text-slate-700 leading-relaxed">{activeCase.patientPresentation}</p>
        </div>

        {/* Clinical Note Excerpt (Doctor's Raw Documentation) */}
        <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-700 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-700 pb-2">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-mint" /> Electronic Health Record Note Excerpt
            </span>
            <span className="text-[11px]">HIPAA Redacted</span>
          </div>
          <p className="italic text-slate-300 leading-relaxed pt-1">
            {activeCase.clinicalNoteExcerpt}
          </p>
        </div>

        {/* Code Stack Evaluated */}
        <div className="p-5 rounded-2xl bg-white border border-gray/15 space-y-3">
          <p className="text-xs font-bold text-gray uppercase tracking-wider">
            Codes Formulated &amp; Validated
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeCase.codesAttempted.map((cd, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-cream border border-gray/15 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="text-[10px] font-bold text-gray uppercase block font-mono">
                    {cd.system}
                  </span>
                  <span className="font-mono font-bold text-navy text-sm">{cd.code}</span>
                  <span className="text-xs text-gray block line-clamp-1">{cd.label}</span>
                </div>
                {cd.modifier && (
                  <span className="text-xs font-mono font-extrabold px-2 py-1 rounded-md bg-teal/10 text-teal border border-teal/30">
                    {cd.modifier}
                  </span>
                )}
                {cd.units && (
                  <span className="text-xs font-mono font-semibold px-2 py-1 rounded-md bg-navy/10 text-navy">
                    {cd.units}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Denial Risk Scanned vs AI & Human Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200 text-red-950 space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-red-800 uppercase tracking-wide text-xs">
              <AlertTriangle className="h-4 w-4 text-red-600" /> Denial Risk Caught
            </p>
            <p className="leading-relaxed">{activeCase.scannedDenialRisk}</p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-emerald-800 uppercase tracking-wide text-xs">
              <Cpu className="h-4 w-4 text-emerald-600" /> Deterministic AI Logic
            </p>
            <p className="leading-relaxed">{activeCase.aiScrubberRecommendation}</p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-amber-800 uppercase tracking-wide text-xs">
              <UserCheck className="h-4 w-4 text-amber-600" /> Human Certified Sign-Off
            </p>
            <p className="leading-relaxed">{activeCase.humanSignoffDecision}</p>
          </div>
        </div>

        {/* Audit Proof Stamp & Clean Outcome */}
        <div className="p-5 rounded-2xl bg-navy text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-mint font-bold">
              <Hash className="h-3.5 w-3.5" /> Immutable SHA-256 Ledger Record
            </div>
            <p className="text-xs font-mono text-slate-300 break-all">{activeCase.sha256AuditProof}</p>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-xs text-slate-400 block font-mono">Adjudication Result:</span>
            <span className="text-sm font-extrabold text-mint block">
              {activeCase.cleanClaimOutcome}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
