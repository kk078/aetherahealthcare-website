'use client';

import React, { useState, useMemo } from 'react';
import {
  Award,
  Calculator,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  DollarSign,
  HelpCircle,
  FileCheck2,
  Activity,
  Zap,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

export default function MipsScoreForecaster() {
  // Practice inputs
  const [medicareRevenue, setMedicareRevenue] = useState<number>(1500000);
  const [clinicianCount, setClinicianCount] = useState<number>(5);

  // Category performance scores (0 - 100%)
  const [qualityScore, setQualityScore] = useState<number>(78);
  const [piScore, setPiScore] = useState<number>(85);
  const [iaScore, setIaScore] = useState<number>(100);
  const [costScore, setCostScore] = useState<number>(65);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadOrg, setLeadOrg] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  // Calculations
  const results = useMemo(() => {
    // Standard MIPS Category Weights: Quality 30%, PI 25%, IA 15%, Cost 30%
    const qualityWeighted = (qualityScore * 0.30);
    const piWeighted = (piScore * 0.25);
    const iaWeighted = (iaScore * 0.15);
    const costWeighted = (costScore * 0.30);

    const compositeScore = Number((qualityWeighted + piWeighted + iaWeighted + costWeighted).toFixed(2));

    // Performance Threshold = 75.0 points
    const threshold = 75.0;
    let paymentAdjPct = 0;
    let status: 'penalty' | 'neutral' | 'bonus' = 'neutral';

    if (compositeScore < threshold) {
      status = 'penalty';
      if (compositeScore <= 18.75) {
        paymentAdjPct = -9.0;
      } else {
        // Linear interpolation from -9.0% at 18.75 to 0.0% at 75.0
        const slope = (0 - (-9.0)) / (threshold - 18.75);
        paymentAdjPct = Number((-9.0 + slope * (compositeScore - 18.75)).toFixed(2));
      }
    } else if (compositeScore > threshold) {
      status = 'bonus';
      // CMS statutory cap is +9.0%, but historical budget-neutrality scaling yields ~1.5% - 3.8%
      // Modeled realistic bonus scale with budget neutrality factor (~2.1x)
      const bonusSpread = (compositeScore - threshold) / (100 - threshold);
      paymentAdjPct = Number((bonusSpread * 3.6).toFixed(2));
    } else {
      paymentAdjPct = 0.0;
      status = 'neutral';
    }

    const annualDollarImpact = Math.round((medicareRevenue * paymentAdjPct) / 100);
    const clinicianImpact = Math.round(annualDollarImpact / (clinicianCount || 1));

    return {
      qualityWeighted,
      piWeighted,
      iaWeighted,
      costWeighted,
      compositeScore,
      threshold,
      paymentAdjPct,
      annualDollarImpact,
      clinicianImpact,
      status,
    };
  }, [qualityScore, piScore, iaScore, costScore, medicareRevenue, clinicianCount]);

  const copyReport = () => {
    const reportText = `CMS MIPS PERFORMANCE & PAYMENT ADJUSTMENT AUDIT REPORT
Generated via Aethera Healthcare Solutions (https://aetherahealthcare.com/tools/mips-score-forecaster)

PRACTICE PROFILE:
• Medicare Part B Allowable Revenue: $${medicareRevenue.toLocaleString()}
• Clinician Headcount: ${clinicianCount} NPI(s)

MIPS CATEGORY PERFORMANCE BREAKDOWN:
• Quality (30% weight): ${qualityScore}% -> ${results.qualityWeighted.toFixed(2)} / 30.00 pts
• Promoting Interoperability (25% weight): ${piScore}% -> ${results.piWeighted.toFixed(2)} / 25.00 pts
• Improvement Activities (15% weight): ${iaScore}% -> ${results.iaWeighted.toFixed(2)} / 15.00 pts
• Cost (30% weight): ${costScore}% -> ${results.costWeighted.toFixed(2)} / 30.00 pts

FINAL SCORE & MEDICARE PAYMENT ADJUSTMENT:
• Final MIPS Composite Score: ${results.compositeScore} / 100.00 pts
• CMS Performance Threshold: ${results.threshold} pts
• Resulting Status: ${results.status.toUpperCase()}
• Estimated Payment Adjustment: ${results.paymentAdjPct >= 0 ? '+' : ''}${results.paymentAdjPct}%
• Net Annual Practice Financial Impact: ${results.annualDollarImpact >= 0 ? '+' : ''}$${results.annualDollarImpact.toLocaleString()}
• Average per-Clinician Variance: ${results.clinicianImpact >= 0 ? '+' : ''}$${results.clinicianImpact.toLocaleString()} / NPI

COMPLIANCE ACTION RECOMMENDATIONS:
1. Ensure 75% data completeness across all six selected quality measures.
2. Complete and document the annual HIPAA Security Risk Assessment before Dec 31 to prevent immediate PI category disqualification.
3. Attest to 2 high-weighted or 4 medium-weighted Improvement Activities maintained continuously for 90 days.
4. Schedule a comprehensive MIPS audit with Aethera Healthcare Solutions: https://aetherahealthcare.com/contact`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail) return;
    setLeadLoading(true);

    try {
      await sendLeadToKiran('mips_performance_audit_request', {
        source: 'MIPS Score Forecaster & Compliance Tool',
        name: leadName || 'MIPS Quality Director',
        email: leadEmail,
        phone: leadPhone || 'Not provided',
        organization: leadOrg || 'Medical Group / ACO',
        message: `Requested Comprehensive MIPS Measure Selection & Audit.
Medicare Part B Rev: $${medicareRevenue.toLocaleString()} (${clinicianCount} NPIs)
MIPS Composite Score: ${results.compositeScore}/100 pts (Status: ${results.status.toUpperCase()})
Payment Adjustment: ${results.paymentAdjPct >= 0 ? '+' : ''}${results.paymentAdjPct}% (${results.annualDollarImpact >= 0 ? '+' : ''}$${results.annualDollarImpact.toLocaleString()}/yr)
Category Breakdown: Quality ${qualityScore}%, PI ${piScore}%, IA ${iaScore}%, Cost ${costScore}%`,
      });
      setLeadSubmitted(true);
    } catch {
      setLeadSubmitted(true);
    } finally {
      setLeadLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Tool Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" />
              CMS Quality Payment Program (QPP) 2025/2026
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-jakarta">
              CMS MIPS Performance Score &amp; Penalty Forecaster
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
              Forecast your Merit-based Incentive Payment System (MIPS) composite score out of 100 points. Model your
              exact Medicare Part B penalty (up to -9.0%) or positive incentive bonus across all four performance
              categories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors shadow-sm"
              title="Copy complete MIPS forecast report"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              {copied ? 'Audit Copied!' : 'Copy Audit Summary'}
            </button>
          </div>
        </div>

        {/* MIPS 75-point Threshold Alert */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong className="font-semibold text-amber-950">CMS 75-Point Performance Cliff:</strong> Practices failing
            to reach 75.0 points in the 2025 performance year face an automatic negative Medicare Part B payment
            reduction of up to <strong>-9.0%</strong> on all paid claims two years later.
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Practice Scale & Category Sliders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Practice Parameters */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              1. Medicare Part B Practice Volume
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Annual Medicare Part B Revenue
                  </label>
                  <span className="text-sm font-bold font-mono text-emerald-600">
                    ${medicareRevenue.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="200000"
                  max="6000000"
                  step="50000"
                  value={medicareRevenue}
                  onChange={(e) => setMedicareRevenue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>$200k</span>
                  <span>$1.5M</span>
                  <span>$6.0M+</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Eligible Clinicians (NPIs)
                  </label>
                  <span className="text-sm font-bold font-mono text-slate-900">{clinicianCount} NPI(s)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="1"
                  value={clinicianCount}
                  onChange={(e) => setClinicianCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Solo (1)</span>
                  <span>Group (10)</span>
                  <span>Enterprise (25)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Four Performance Categories */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              2. Category Performance Level (0% to 100%)
            </h2>

            {/* Quality */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900">Quality Performance (30% Weight)</span>
                  <p className="text-xs text-slate-500">
                    6 measures scored against historical CMS deciles. 75% data completeness required.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-slate-900">{qualityScore}%</span>
                  <div className="text-xs font-mono text-emerald-600 font-semibold">
                    {results.qualityWeighted.toFixed(2)} / 30.00 pts
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={qualityScore}
                onChange={(e) => setQualityScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Promoting Interoperability */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900">Promoting Interoperability (25% Weight)</span>
                  <p className="text-xs text-slate-500">
                    CEHRT edition, e-Prescribing, Health Information Exchange (HIE), and Patient Access.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-slate-900">{piScore}%</span>
                  <div className="text-xs font-mono text-emerald-600 font-semibold">
                    {results.piWeighted.toFixed(2)} / 25.00 pts
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={piScore}
                onChange={(e) => setPiScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal"
              />
            </div>

            {/* Improvement Activities */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900">Improvement Activities (15% Weight)</span>
                  <p className="text-xs text-slate-500">
                    2 high-weighted (20 pts each) or 4 medium-weighted (10 pts each) clinical workflow activities.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-slate-900">{iaScore}%</span>
                  <div className="text-xs font-mono text-emerald-600 font-semibold">
                    {results.iaWeighted.toFixed(2)} / 15.00 pts
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={iaScore}
                onChange={(e) => setIaScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy"
              />
            </div>

            {/* Cost */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900">Cost Category (30% Weight)</span>
                  <p className="text-xs text-slate-500">
                    Calculated automatically by CMS from claims (Total Per Capita Cost &amp; Episode-based measures).
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-slate-900">{costScore}%</span>
                  <div className="text-xs font-mono text-emerald-600 font-semibold">
                    {results.costWeighted.toFixed(2)} / 30.00 pts
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={costScore}
                onChange={(e) => setCostScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Composite Score & Dollar Impact */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-navy to-slate-950 text-white rounded-2xl p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                MIPS Score &amp; Verdict
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  results.status === 'bonus'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : results.status === 'penalty'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                }`}
              >
                {results.status === 'bonus' && <TrendingUp className="w-3.5 h-3.5" />}
                {results.status === 'penalty' && <TrendingDown className="w-3.5 h-3.5" />}
                {results.status === 'bonus' ? 'Positive Incentive' : results.status === 'penalty' ? 'Penalty Exposure' : 'Neutral'}
              </span>
            </div>

            {/* Big Score Display */}
            <div className="text-center py-4 border-y border-white/10 space-y-1">
              <div className="text-xs text-slate-300 uppercase tracking-wider">Composite Final Score</div>
              <div className="text-5xl font-black font-mono text-white tracking-tight">
                {results.compositeScore}
                <span className="text-xl text-slate-400 font-normal"> / 100</span>
              </div>
              <p className="text-xs text-slate-400">
                Performance threshold: <strong>75.0 points</strong>
              </p>
            </div>

            {/* Financial Impact Metric */}
            <div
              className={`p-4 rounded-xl border space-y-1 ${
                results.annualDollarImpact >= 0
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Medicare Payment Adjustment:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {results.paymentAdjPct >= 0 ? '+' : ''}{results.paymentAdjPct}%
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {results.annualDollarImpact >= 0 ? '+' : ''}${results.annualDollarImpact.toLocaleString()}
                <span className="text-xs font-normal text-slate-300 ml-1">/ practice / yr</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Average impact per provider:{' '}
                <strong className="text-white font-mono">
                  {results.clinicianImpact >= 0 ? '+' : ''}${results.clinicianImpact.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Category Contributions Bar */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Point Distribution
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Quality</span>
                  <span className="font-mono text-white">{results.qualityWeighted.toFixed(1)} / 30</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Interoperability</span>
                  <span className="font-mono text-white">{results.piWeighted.toFixed(1)} / 25</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Improvement</span>
                  <span className="font-mono text-white">{results.iaWeighted.toFixed(1)} / 15</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Cost</span>
                  <span className="font-mono text-white">{results.costWeighted.toFixed(1)} / 30</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Critical MIPS Audit Defenses
            </h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Maintain 75% data completeness across all payers, not just Medicare.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Complete formal HIPAA Security Risk Assessment with timestamped remediation.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Retain 6 years of documentation for CMS data validation audits.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Free MIPS Compliance Audit Lead Capture Form */}
      <div className="bg-gradient-to-br from-navy via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-10 shadow-xl">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Complimentary Quality Review
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Schedule a Complimentary MIPS Measure Optimization &amp; Penalty Shield Audit
          </h3>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Our certified MIPS quality specialists analyze your EHR measure performance, select the 6 highest-decile
            quality measures for your specialty, and guarantee protection against Medicare Part B penalties.
          </p>
        </div>

        {leadSubmitted ? (
          <div className="mt-8 max-w-xl mx-auto p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">MIPS Audit Request Submitted</h4>
            <p className="text-sm text-slate-300">
              Our MIPS Quality Pod has received your practice profile and will contact you within 1 business day to
              prepare your custom measure selection roadmap.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLeadSubmit} className="mt-8 max-w-xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. David Miller"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="dmiller@clinicgroup.com"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Practice / Group Name</label>
                <input
                  type="text"
                  placeholder="Summit Medical Associates"
                  value={leadOrg}
                  onChange={(e) => setLeadOrg(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="(555) 345-6789"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={leadLoading}
              className="w-full py-3 px-6 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 mt-2"
            >
              {leadLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Quality Metrics...
                </>
              ) : (
                <>
                  Request MIPS Measure Selection &amp; Penalty Shield Audit
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Complimentary confidential review. All data handled under strict HIPAA Business Associate confidentiality.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
