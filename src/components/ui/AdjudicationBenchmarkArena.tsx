'use client';

import React, { useState } from 'react';
import {
  BENCHMARK_CASES,
  AdjudicationBenchmarkCase,
} from '@/data/adjudicationBenchmarkData';
import {
  Swords,
  Bot,
  UserCheck,
  AlertTriangle,
  ShieldCheck,
  Flame,
  Scale,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';

export default function AdjudicationBenchmarkArena() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-multilevel-spine');
  const [auditRunning, setAuditRunning] = useState<boolean>(false);
  const [auditCompleted, setAuditCompleted] = useState<boolean>(false);

  const activeCase: AdjudicationBenchmarkCase =
    BENCHMARK_CASES.find((c) => c.id === selectedCaseId) || BENCHMARK_CASES[0];

  const handleCaseChange = (caseId: string) => {
    setSelectedCaseId(caseId);
    setAuditCompleted(false);
    setAuditRunning(false);
  };

  const handleRunAudit = () => {
    setAuditRunning(true);
    setAuditCompleted(false);
    setTimeout(() => {
      setAuditRunning(false);
      setAuditCompleted(true);
    }, 1800);
  };

  return (
    <section
      id="adjudication-benchmark-arena"
      className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[500px] bg-amber-500/5 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[500px] bg-rose-500/5 blur-[180px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-700/50 text-amber-300 text-xs font-mono uppercase tracking-wider mb-4">
          <Swords className="w-3.5 h-3.5 text-amber-400" />
          Head-to-Head Adjudication & RAC Audit Challenge
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Sovereign Coder vs. Autonomous AI Benchmark Arena
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
          AI vendors boast 98% &ldquo;clean claim rates&rdquo; on Day 0. But electronic clearinghouses only check syntax. Between Day 90 and Day 360, Recovery Audit Contractors (RACs) and commercial SIUs claw back millions for AI unbundling and modifier -59 abuse. Compare the outcomes below.
        </p>
      </div>

      {/* Case Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {BENCHMARK_CASES.map((item) => {
          const isSelected = item.id === selectedCaseId;
          return (
            <button
              key={item.id}
              onClick={() => handleCaseChange(item.id)}
              className={`p-4 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider mb-1">
                {item.specialty}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 mb-2">
                {item.title}
              </h3>
              <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span>Avoid Clawback:</span>
                <span className="font-bold">{item.rvuDifferential.clawbackAvoided}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Clinical Scenario Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4" />
            Active Clinical Case Record:
          </div>
          <p className="text-sm text-slate-200 leading-relaxed max-w-4xl">
            {activeCase.clinicalNarrative}
          </p>
        </div>
        <button
          onClick={handleRunAudit}
          disabled={auditRunning}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-950/40 flex items-center gap-2"
        >
          {auditRunning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Simulating RAC Audit...</span>
            </>
          ) : (
            <>
              <Flame className="w-4 h-4 text-slate-950" />
              <span>Trigger Day 180 RAC Audit</span>
            </>
          )}
        </button>
      </div>

      {/* Arena Split-Screen Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Column: Autonomous AI Black-Box Coder */}
        <div className="p-6 rounded-2xl bg-slate-950/90 border border-rose-900/60 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -z-10" />

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-rose-900/40 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-950 border border-rose-800/60 text-rose-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Autonomous AI Coder</h3>
                  <div className="text-xs font-mono text-rose-400">Black-Box ML (Zero Human Seal)</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs font-mono">
                Day 0 Clean Rate: 98%+
              </span>
            </div>

            {/* Billed Codes Strip */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 mb-4">
              <div className="text-[11px] font-mono uppercase text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Electronic Claim Lines Dispatched:</span>
                <span className="text-rose-400 font-bold">Unbundled & Mod -59</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeCase.aiOutcome.billedCodes.map((code, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs font-mono font-bold"
                  >
                    CPT {code}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-[11px] font-mono text-slate-400">
                Modifiers: {activeCase.aiOutcome.modifiersApplied.join(', ')}
              </div>
            </div>

            {/* Post-Payment Audit Reality */}
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 mb-4">
              <div className="text-xs font-mono uppercase text-rose-400 font-bold mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Day 180 Audit Adjudication:</span>
              </div>
              <div className="text-sm font-bold text-white mb-1">
                {activeCase.aiOutcome.day180AuditResult}
              </div>
              <div className="text-sm font-mono font-bold text-rose-400">
                Clawback: {activeCase.aiOutcome.clawbackAmount}
              </div>
            </div>

            {/* False Claims Act Risk Box */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 mb-4 text-xs">
              <div className="text-rose-400 font-mono font-bold uppercase mb-1 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-rose-400" />
                Statutory Liability (31 U.S.C. § 3729):
              </div>
              <div className="text-slate-300">{activeCase.aiOutcome.fcaRiskExposure}</div>
            </div>

            {/* Failure Mechanisms List */}
            <div className="space-y-2 mb-4">
              <div className="text-xs font-mono uppercase text-slate-400 font-bold">
                Algorithmic Blind Spots:
              </div>
              {activeCase.aiOutcome.failureMechanisms.map((mech, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0 mt-0.5">&times;</span>
                  <span>{mech}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-rose-900/40 text-[11px] font-mono text-rose-400">
            Net Result: Facility bears 100% recoupment liability + interest penalties.
          </div>
        </div>

        {/* Right Column: Aethera Sovereign Human Coder */}
        <div className="p-6 rounded-2xl bg-slate-950/90 border border-teal-500/60 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -z-10" />

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-teal-900/40 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-950 border border-teal-800/60 text-teal-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Aethera Sovereign Expert</h3>
                  <div className="text-xs font-mono text-teal-400">Deterministic Engine + Certified Signer</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-950/80 border border-teal-800/60 text-teal-300 text-xs font-mono">
                Day 0 Clean Rate: 99.4%
              </span>
            </div>

            {/* Billed Codes Strip */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 mb-4">
              <div className="text-[11px] font-mono uppercase text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Compliant Hierarchy Dispatched:</span>
                <span className="text-teal-400 font-bold">100% NCCI Verified</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeCase.sovereignOutcome.billedCodes.map((code, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-teal-950/60 border border-teal-800/60 text-teal-200 text-xs font-mono font-bold"
                  >
                    CPT {code}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-[11px] font-mono text-teal-300">
                Modifiers: {activeCase.sovereignOutcome.modifiersApplied.join(', ')}
              </div>
            </div>

            {/* Post-Payment Audit Reality */}
            <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/50 mb-4">
              <div className="text-xs font-mono uppercase text-teal-400 font-bold mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Day 180 Audit Adjudication:</span>
              </div>
              <div className="text-sm font-bold text-white mb-1">
                {activeCase.sovereignOutcome.day180AuditResult}
              </div>
              <div className="text-sm font-mono font-bold text-emerald-400">
                Clawback: {activeCase.sovereignOutcome.clawbackAmount}
              </div>
            </div>

            {/* False Claims Act Risk Box */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 mb-4 text-xs">
              <div className="text-teal-400 font-mono font-bold uppercase mb-1 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-teal-400" />
                Statutory Liability (31 U.S.C. § 3729):
              </div>
              <div className="text-slate-300">{activeCase.sovereignOutcome.fcaRiskExposure}</div>
            </div>

            {/* Clinical Protections List */}
            <div className="space-y-2 mb-4">
              <div className="text-xs font-mono uppercase text-slate-400 font-bold">
                Sovereign Human Clinical Safeguards:
              </div>
              {activeCase.sovereignOutcome.clinicalProtections.map((prot, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-teal-400 font-bold shrink-0 mt-0.5">&check;</span>
                  <span>{prot}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-teal-900/40 text-[11px] font-mono text-teal-400">
            Net Result: Zero clawback risk. 100% legal immunity backed by certified coder sign-off.
          </div>
        </div>
      </div>

      {/* Economic RVU Differential Strip */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-teal-500/40 shadow-xl mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
          <div>
            <div className="text-xs font-mono uppercase text-slate-400">Autonomous AI Total RVU</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">
              {activeCase.rvuDifferential.aiTotalRvu} RVUs
            </div>
            <div className="text-xs text-slate-400">Prematurely lost in audits</div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-slate-400">Aethera Sovereign Total RVU</div>
            <div className="text-2xl font-bold text-teal-400 mt-1">
              {activeCase.rvuDifferential.sovereignTotalRvu} RVUs
            </div>
            <div className="text-xs text-slate-400">Full legitimate allowable</div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-slate-400">Net Additional Revenue</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {activeCase.rvuDifferential.netReimbursementRetained}
            </div>
            <div className="text-xs text-slate-400">At 2026 CF ($32.35)</div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-slate-400">Audit Clawback Prevented</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {activeCase.rvuDifferential.clawbackAvoided}
            </div>
            <div className="text-xs text-slate-400">100% Protected under safe-harbor</div>
          </div>
        </div>
      </div>

      {/* Live RAC Audit Simulation Output Panel */}
      {auditCompleted && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/60 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider font-bold mb-3">
            <Sparkles className="w-4 h-4" />
            Live Day 180 RAC Post-Payment Audit Simulation Result
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-mono text-slate-400 uppercase mb-1">Contractor Trigger</div>
              <div className="text-sm font-bold text-white mb-2">
                {activeCase.racAuditSimulation.contractorType}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeCase.racAuditSimulation.auditTriggerEvent}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50">
              <div className="text-xs font-mono text-rose-400 uppercase mb-1">Target AI Flaw</div>
              <div className="text-sm font-bold text-white mb-2">Unbundling & Mod -59 Abuse</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeCase.racAuditSimulation.targetAlgorithmFlaw}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-800/50">
              <div className="text-xs font-mono text-teal-400 uppercase mb-1">Sovereign Defense</div>
              <div className="text-sm font-bold text-white mb-2">Instant Audit Dismissal</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeCase.racAuditSimulation.statutoryRemedy}
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </section>
  );
}
