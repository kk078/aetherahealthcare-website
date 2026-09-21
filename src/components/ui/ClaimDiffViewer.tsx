'use client';

import React, { useState } from 'react';
import { CLAIM_DIFF_CASES, ClaimDiffCase } from '@/data/claimDiffData';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Fingerprint,
  Scale,
  Copy,
  Check,
  Stethoscope,
  DollarSign
} from 'lucide-react';

export default function ClaimDiffViewer() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('mohs-surgery');
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const activeCase: ClaimDiffCase =
    CLAIM_DIFF_CASES.find((c) => c.id === selectedCaseId) || CLAIM_DIFF_CASES[0];

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <section id="claim-diff-viewer" className="py-20 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[500px] bg-rose-500/5 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[500px] bg-emerald-500/5 blur-[180px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-rose-400" />
            CMS &amp; OIG Compliance Comparator • Live Claim Diff Viewer
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Probabilistic AI Hallucination vs. Sovereign Human Seal
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Witness the real-world operational liability of unverified automation. Below are authentic clinical encounters where black-box
            AI models committed catastrophic unbundling, missed mandatory CMS modifiers, or violated federal fraud statutes—and how
            Aethera&apos;s AAPC-certified specialists intervened to secure 100% compliant reimbursement.
          </p>
        </div>

        {/* Case Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CLAIM_DIFF_CASES.map((c) => {
            const isSelected = activeCase.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCaseId(c.id);
                  setCopiedHash(false);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-left flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 shadow-lg shadow-teal-500/20 ring-1 ring-teal-300'
                    : 'bg-slate-800/80 border border-slate-750 text-slate-300 hover:text-white hover:bg-slate-750'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-slate-950 text-teal-300' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {c.caseNumber}
                </span>
                <span className="truncate max-w-[200px] sm:max-w-[240px]">{c.title}</span>
              </button>
            );
          })}
        </div>

        {/* Clinical Encounter Brief Card */}
        <div className="bg-slate-850 border border-slate-750 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-750">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              <span className="font-mono text-xs uppercase tracking-wider text-teal-300 font-bold">
                Clinical Encounter • Case {activeCase.caseNumber}: {activeCase.specialty}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              HIPAA Compliant Synthetic-Free Patient Record
            </span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {activeCase.patientScenario}
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-750 text-xs text-slate-300 font-mono italic leading-relaxed">
            <span className="text-[10px] uppercase font-bold text-slate-400 not-italic block mb-1">
              Physician Operative Note Excerpt:
            </span>
            {activeCase.clinicalEncounterSnippet}
          </div>
        </div>

        {/* Side-by-Side Split Screen Diff Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* LEFT PANE: UNVERIFIED PROBABILISTIC AI (RED) */}
          <div className="bg-gradient-to-b from-rose-950/20 to-slate-900 border-2 border-rose-600/40 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-rose-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 block font-bold">
                      Unverified Generative AI Output
                    </span>
                    <h3 className="text-lg font-extrabold text-white">
                      Probabilistic Black-Box Claim
                    </h3>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${activeCase.aiClaim.statusColor}`}>
                  {activeCase.aiClaim.status}
                </span>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Generated Claim Lines (CMS-1500 EDI 837P)
                </span>
                <div className="space-y-2">
                  {activeCase.aiClaim.lines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                        line.isError
                          ? 'bg-rose-950/40 border-rose-600/60 ring-1 ring-rose-500/30'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-sm ${line.isError ? 'text-rose-300' : 'text-slate-200'}`}>
                            {line.code}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                            {line.system}
                          </span>
                          {line.modifiers.length > 0 ? (
                            line.modifiers.map((m) => (
                              <span key={m} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                                {m}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] font-mono text-slate-500 italic">No Modifiers</span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-slate-200">{line.charge}</span>
                      </div>

                      {line.isError && (
                        <div className="p-2 rounded bg-rose-950/70 border border-rose-800/60 text-[11px] text-rose-200 font-sans flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{line.errorReason}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fatal Error Analysis */}
              <div className="p-4 rounded-xl bg-slate-900 border border-rose-800/40 space-y-2">
                <div className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Algorithmic Blindspot &amp; Statutory Violation
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeCase.aiClaim.fatalErrorSummary}
                </p>
              </div>

              {/* Denial Code & OIG Citation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-750">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Payer CARC Denial</span>
                  <span className="font-mono text-xs font-bold text-rose-400">{activeCase.aiClaim.carcCode}</span>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{activeCase.aiClaim.carcDescription}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-750">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">OIG Audit Vulnerability</span>
                  <span className="text-[11px] text-amber-300 line-clamp-3 mt-1 font-mono">
                    {activeCase.aiClaim.oigCitation}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Penalty Footer */}
            <div className="pt-4 border-t border-rose-800/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Claim Billed</span>
                <span className="font-mono text-base font-bold text-slate-400 line-through">
                  {activeCase.aiClaim.totalBilled}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">Financial Hazard</span>
                <span className="font-mono text-sm font-extrabold text-rose-300">
                  {activeCase.aiClaim.financialPenaltyRisk}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT PANE: AETHERA SOVEREIGN HUMAN SEAL (EMERALD) */}
          <div className="bg-gradient-to-b from-emerald-950/20 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-emerald-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 block font-bold">
                      Aethera Sovereign Adjudication Gate
                    </span>
                    <h3 className="text-lg font-extrabold text-white">
                      Certified Specialist Cryptographic Claim
                    </h3>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${activeCase.sovereignClaim.statusColor}`}>
                  {activeCase.sovereignClaim.status}
                </span>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Sovereign Sealed Claim Lines (100% Compliant)
                </span>
                <div className="space-y-2">
                  {activeCase.sovereignClaim.lines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                        line.isCorrected
                          ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-sm ${line.isCorrected ? 'text-emerald-300' : 'text-slate-200'}`}>
                            {line.code}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                            {line.system}
                          </span>
                          {line.modifiers.map((m) => (
                            <span key={m} className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                              {m}
                            </span>
                          ))}
                          {line.isCorrected && (
                            <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40 font-bold">
                              Verified
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-emerald-400">{line.charge}</span>
                      </div>

                      {line.isCorrected && (
                        <div className="p-2 rounded bg-emerald-950/70 border border-emerald-800/60 text-[11px] text-emerald-200 font-sans flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{line.correctionNote}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Human Intervention Summary */}
              <div className="p-4 rounded-xl bg-slate-900 border border-emerald-800/40 space-y-2">
                <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Sovereign Human Adjudication Protocol
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeCase.sovereignClaim.humanInterventionSummary}
                </p>
              </div>

              {/* Reviewer & Regulatory Authority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-750">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">AAPC Reviewer Authority</span>
                  <span className="text-[11px] font-bold text-white block mt-1">{activeCase.sovereignClaim.credentialedReviewer}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-750">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">CMS Internet-Only Manual</span>
                  <span className="text-[11px] text-teal-300 font-mono block mt-1 line-clamp-2">
                    {activeCase.sovereignClaim.cmsManualReference}
                  </span>
                </div>
              </div>

              {/* SHA-256 Sovereign Audit Seal */}
              <div className="p-3 rounded-xl bg-slate-950 border border-teal-500/30 flex items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 truncate">
                  <Fingerprint className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="text-slate-400 text-[10px] truncate">
                    SHA-256: <strong className="text-teal-300">{activeCase.sovereignClaim.sha256Seal}</strong>
                  </span>
                </div>
                <button
                  onClick={() => handleCopyHash(activeCase.sovereignClaim.sha256Seal)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 shrink-0 transition-all"
                  title="Copy SHA-256 Hash"
                >
                  {copiedHash ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Approved Revenue Footer */}
            <div className="pt-4 border-t border-emerald-800/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Clean Claim Payout</span>
                <span className="font-mono text-xl font-extrabold text-emerald-400">
                  {activeCase.sovereignClaim.totalApproved}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">Protected Value</span>
                <span className="font-mono text-xs font-semibold text-slate-300">
                  {activeCase.sovereignClaim.protectedRevenue}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Key Takeaway Callout */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 border border-teal-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">
                Why Practice CFOs Prohibit Blind Autonomous Scribing
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Generative models lack legal standing to sign CMS-1500 claims. Aethera pairs deterministic scrubbers with credentialed human specialists to eliminate unbundling penalties and False Claims Act liability.
              </p>
            </div>
          </div>
          <a
            href="/schedule"
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider shrink-0 transition-all shadow-lg shadow-teal-500/20"
          >
            Audit Your Claims Pipeline
          </a>
        </div>
      </div>
    </section>
  );
}
