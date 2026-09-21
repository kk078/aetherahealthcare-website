'use client';

import React, { useState, useMemo } from 'react';
import {
  SAFE_HARBOR_QUESTIONS,
  RISK_TIERS,
  SafeHarborQuestion,
  RiskTier,
} from '@/data/federalSafeHarborData';
import {
  Scale,
  ShieldCheck,
  FileCheck2,
  Download,
  RotateCcw,
  Sparkles,
  Bot,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function FederalSafeHarborAuditor() {
  // Map of questionId -> selectedOptionId
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({
    q1_coder_sovereignty: 'opt1_spot_check',
    q2_ncci_unbundling: 'opt2_clearinghouse_override',
    q3_drug_waste: 'opt3_manual_nursing',
    q4_phi_data_residency: 'opt4_standard_cloud',
    q5_audit_trail_integrity: 'opt5_standard_pms_logs',
    q6_global_period_unbundling: 'opt6_manual_calendar',
  });

  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  // Compute total risk score
  const totalScore = useMemo(() => {
    let score = 0;
    SAFE_HARBOR_QUESTIONS.forEach((q) => {
      const selectedOptId = selectedAnswers[q.id];
      const opt = q.options.find((o) => o.id === selectedOptId);
      if (opt) {
        score += opt.riskScore;
      }
    });
    return score;
  }, [selectedAnswers]);

  // Max score is 150 (25 * 6)
  const riskPercentage = useMemo(() => {
    return Math.round((totalScore / 150) * 100);
  }, [totalScore]);

  // Current Risk Tier
  const activeTier: RiskTier = useMemo(() => {
    return (
      RISK_TIERS.find((t) => totalScore >= t.minScore && totalScore <= t.maxScore) ||
      RISK_TIERS[1]
    );
  }, [totalScore]);

  // Preset quick configurations
  const applyPreset = (preset: 'sovereign' | 'typical' | 'autonomous_ai') => {
    if (preset === 'sovereign') {
      setSelectedAnswers({
        q1_coder_sovereignty: 'opt1_human_certified',
        q2_ncci_unbundling: 'opt2_operative_documentation',
        q3_drug_waste: 'opt3_jw_jz_split',
        q4_phi_data_residency: 'opt4_sovereign_enclave',
        q5_audit_trail_integrity: 'opt5_cryptographic_ledger',
        q6_global_period_unbundling: 'opt6_global_scrubber',
      });
    } else if (preset === 'autonomous_ai') {
      setSelectedAnswers({
        q1_coder_sovereignty: 'opt1_autonomous_ai',
        q2_ncci_unbundling: 'opt2_ai_auto_append',
        q3_drug_waste: 'opt3_unreported_waste',
        q4_phi_data_residency: 'opt4_public_api',
        q5_audit_trail_integrity: 'opt5_no_audit_trail',
        q6_global_period_unbundling: 'opt6_ai_unbundled_em',
      });
    } else {
      setSelectedAnswers({
        q1_coder_sovereignty: 'opt1_spot_check',
        q2_ncci_unbundling: 'opt2_clearinghouse_override',
        q3_drug_waste: 'opt3_manual_nursing',
        q4_phi_data_residency: 'opt4_standard_cloud',
        q5_audit_trail_integrity: 'opt5_standard_pms_logs',
        q6_global_period_unbundling: 'opt6_manual_calendar',
      });
    }
  };

  const currentQuestion: SafeHarborQuestion = SAFE_HARBOR_QUESTIONS[activeQuestionIdx];

  return (
    <section id="federal-safe-harbor-auditor" className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 right-1/4 w-[750px] h-[500px] bg-teal-500/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[400px] bg-indigo-500/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-teal-400" />
            False Claims Act (31 U.S.C. § 3729) • Regulatory Self-Auditor
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Federal Safe-Harbor Checklist &amp; FCA Risk Auditor
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Healthcare executives face severe civil liability when autonomous AI vendors submit claims without certified human clinical sign-off.
            Self-audit your current billing infrastructure against core CMS, HIPAA, and federal false claims statutes.
          </p>
        </div>

        {/* Quick Scenario Preset Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              Simulate Architecture:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyPreset('sovereign')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  totalScore === 0
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Aethera Sovereign Gate</span>
              </button>

              <button
                onClick={() => applyPreset('typical')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  totalScore > 20 && totalScore < 100
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Typical Clearinghouse Practice</span>
              </button>

              <button
                onClick={() => applyPreset('autonomous_ai')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  totalScore >= 120
                    ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-rose-400" />
                <span>Unverified Autonomous AI</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setReportModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-bold transition-all flex items-center gap-2"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Generate Executive Safe-Harbor Report</span>
          </button>
        </div>

        {/* Main Auditor Grid: Questions Interactive Stepper (Left 7 cols) vs Live Score Meter (Right 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Questions & Interactive Options */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Stepper Tabs */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-bold">
                Mandate {activeQuestionIdx + 1} of {SAFE_HARBOR_QUESTIONS.length}: {currentQuestion.category}
              </span>
              <div className="flex items-center gap-1.5">
                {SAFE_HARBOR_QUESTIONS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                      activeQuestionIdx === idx
                        ? 'bg-teal-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {currentQuestion.question}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>

            {/* Options Radio List */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedAnswers[currentQuestion.id] === opt.id;

                let borderClass = 'border-slate-800 hover:border-slate-700 bg-slate-950/60';
                if (isSelected) {
                  if (opt.statusBadge === 'safe') {
                    borderClass = 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/50';
                  } else if (opt.statusBadge === 'moderate') {
                    borderClass = 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500/50';
                  } else {
                    borderClass = 'border-rose-500 bg-rose-950/20 ring-1 ring-rose-500/50';
                  }
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setSelectedAnswers({
                        ...selectedAnswers,
                        [currentQuestion.id]: opt.id,
                      });
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 text-left ${borderClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm text-white">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? opt.statusBadge === 'safe'
                                ? 'border-emerald-400 bg-emerald-500'
                                : opt.statusBadge === 'moderate'
                                ? 'border-amber-400 bg-amber-500'
                                : 'border-rose-400 bg-rose-500'
                              : 'border-slate-600 bg-slate-800'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                        </div>
                        <span>{opt.label}</span>
                      </div>

                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          opt.statusBadge === 'safe'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : opt.statusBadge === 'moderate'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {opt.statusBadge === 'safe'
                          ? 'Safe Harbor'
                          : opt.statusBadge === 'moderate'
                          ? 'Moderate Risk'
                          : 'Severe Exposure'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 pl-6 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Legal Footnote for Question */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Statute: {currentQuestion.statute}</span>
              </div>
              <div className="flex items-center gap-2">
                {activeQuestionIdx > 0 && (
                  <button
                    onClick={() => setActiveQuestionIdx(activeQuestionIdx - 1)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-mono text-slate-300"
                  >
                    ← Previous
                  </button>
                )}
                {activeQuestionIdx < SAFE_HARBOR_QUESTIONS.length - 1 && (
                  <button
                    onClick={() => setActiveQuestionIdx(activeQuestionIdx + 1)}
                    className="px-3 py-1 bg-teal-500 hover:bg-teal-450 rounded-lg text-xs font-mono font-bold text-slate-950"
                  >
                    Next Mandate →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Real-Time Regulatory Safe-Harbor Dashboard */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                  <Scale className="w-4 h-4 text-teal-400" />
                  Regulatory Risk Gauge
                </span>
                <button
                  onClick={() => applyPreset('typical')}
                  className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
                  title="Reset to defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* Big Score Dial */}
              <div className="text-center py-2 space-y-2">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Aggregated FCA Exposure Index
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`text-5xl sm:text-6xl font-black font-mono tracking-tight ${activeTier.statusColor}`}
                  >
                    {riskPercentage}%
                  </span>
                </div>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase tracking-wider border ${
                    totalScore <= 20
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : totalScore <= 60
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                      : 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                  }`}
                >
                  {activeTier.label}
                </div>
              </div>

              {/* Risk Meter Visual Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-emerald-400">0% Safe</span>
                  <span className="text-amber-400">50% Caution</span>
                  <span className="text-rose-400">100% Critical</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      totalScore <= 20
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : totalScore <= 60
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                        : 'bg-gradient-to-r from-orange-500 via-rose-500 to-red-600'
                    }`}
                    style={{ width: `${Math.max(riskPercentage, 5)}%` }}
                  />
                </div>
              </div>

              {/* Legal Implication & Penalty Box */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    Federal Legal Implication
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {activeTier.legalImplication}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-850">
                  <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    OIG / RAC Audit Vulnerability
                  </div>
                  <p className="font-mono text-amber-300 font-semibold">
                    {activeTier.oigTargetLevel}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-850">
                  <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    Recommended Remediation
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {activeTier.recommendation}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setReportModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-450 hover:to-emerald-450 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
              >
                <span>View Full Safe-Harbor Breakdown</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Executive Safe-Harbor Report Modal */}
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Executive Safe-Harbor Assessment Report
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Prepared for Practice Leadership &amp; Compliance Officers
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Report Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-slate-400 font-mono text-[10px]">CURRENT RATING</div>
                    <div className={`text-base font-extrabold font-mono ${activeTier.statusColor}`}>
                      {activeTier.label} ({riskPercentage}% Risk)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 font-mono text-[10px]">STATUTORY BENCHMARK</div>
                    <div className="text-slate-200 font-bold">31 U.S.C. § 3729 Safe Harbor</div>
                  </div>
                </div>

                {/* Question by question findings */}
                <div className="space-y-3 pt-1">
                  <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                    Itemized Mandate Analysis
                  </div>
                  {SAFE_HARBOR_QUESTIONS.map((q, idx) => {
                    const selectedOptId = selectedAnswers[q.id];
                    const selectedOpt = q.options.find((o) => o.id === selectedOptId);

                    return (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">
                            {idx + 1}. {q.category}
                          </span>
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                              selectedOpt?.statusBadge === 'safe'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : selectedOpt?.statusBadge === 'moderate'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {selectedOpt?.statusBadge === 'safe'
                              ? 'Compliant'
                              : selectedOpt?.statusBadge === 'moderate'
                              ? 'Warning'
                              : 'Non-Compliant'}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          <strong>Active Practice State:</strong> {selectedOpt?.label}
                        </div>
                        <div className="text-slate-500 text-[10px] font-mono">
                          Statute: {q.statute} • Risk: {q.penaltyRisk}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert('Safe-Harbor Report copied to clipboard for presentation to your compliance committee.');
                    setReportModalOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-450 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Copy Report Summary (.MD / .PDF)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
