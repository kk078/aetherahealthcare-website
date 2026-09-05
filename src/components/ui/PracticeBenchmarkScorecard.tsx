'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  DollarSign,
  Clock,
  Percent,
} from 'lucide-react';
import { PRIMARY_EXPERT_EMAIL, sendLeadToKiran } from '@/lib/worker';

interface SpecialtyBenchmark {
  medianDaysInAr: number;
  topDecileDaysInAr: number;
  medianDenialRate: number;
  topDecileDenialRate: number;
  cleanClaimTarget: number;
  avgMonthlyChargePerProvider: number;
}

const SPECIALTY_BENCHMARKS: Record<string, SpecialtyBenchmark> = {
  Cardiology: {
    medianDaysInAr: 42,
    topDecileDaysInAr: 28,
    medianDenialRate: 11.8,
    topDecileDenialRate: 3.5,
    cleanClaimTarget: 98.5,
    avgMonthlyChargePerProvider: 95000,
  },
  'Family Medicine': {
    medianDaysInAr: 38,
    topDecileDaysInAr: 24,
    medianDenialRate: 9.4,
    topDecileDenialRate: 3.2,
    cleanClaimTarget: 98.7,
    avgMonthlyChargePerProvider: 45000,
  },
  Orthopedics: {
    medianDaysInAr: 48,
    topDecileDaysInAr: 31,
    medianDenialRate: 13.5,
    topDecileDenialRate: 4.1,
    cleanClaimTarget: 98.2,
    avgMonthlyChargePerProvider: 140000,
  },
  Neurology: {
    medianDaysInAr: 45,
    topDecileDaysInAr: 29,
    medianDenialRate: 12.2,
    topDecileDenialRate: 3.8,
    cleanClaimTarget: 98.4,
    avgMonthlyChargePerProvider: 85000,
  },
  'Pain Management': {
    medianDaysInAr: 47,
    topDecileDaysInAr: 30,
    medianDenialRate: 14.1,
    topDecileDenialRate: 4.2,
    cleanClaimTarget: 98.0,
    avgMonthlyChargePerProvider: 110000,
  },
  'OB/GYN': {
    medianDaysInAr: 41,
    topDecileDaysInAr: 26,
    medianDenialRate: 10.5,
    topDecileDenialRate: 3.6,
    cleanClaimTarget: 98.6,
    avgMonthlyChargePerProvider: 75000,
  },
  'Medical Oncology': {
    medianDaysInAr: 36,
    topDecileDaysInAr: 22,
    medianDenialRate: 8.8,
    topDecileDenialRate: 2.9,
    cleanClaimTarget: 99.0,
    avgMonthlyChargePerProvider: 220000,
  },
  'Psychiatry & Behavioral': {
    medianDaysInAr: 44,
    topDecileDaysInAr: 27,
    medianDenialRate: 11.2,
    topDecileDenialRate: 3.4,
    cleanClaimTarget: 98.8,
    avgMonthlyChargePerProvider: 40000,
  },
};

export default function PracticeBenchmarkScorecard() {
  const [specialty, setSpecialty] = useState<string>('Cardiology');
  const [providerCount, setProviderCount] = useState<number>(3);
  const [monthlyVolume, setMonthlyVolume] = useState<number>(250000);
  const [daysInAr, setDaysInAr] = useState<number>(46);
  const [denialRate, setDenialRate] = useState<number>(12.5);
  const [cleanClaimRate, setCleanClaimRate] = useState<number>(84);

  // Proposal request state
  const [practiceName, setPracticeName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const b = SPECIALTY_BENCHMARKS[specialty] || SPECIALTY_BENCHMARKS['Cardiology'];

  // Scoring Logic (0 - 100)
  // AR Score: 40 points (top decile = 40, median = 25, high AR = 0)
  let arScore = 40;
  if (daysInAr > b.topDecileDaysInAr) {
    const arSpread = Math.max(1, daysInAr - b.topDecileDaysInAr);
    arScore = Math.max(5, 40 - arSpread * 1.5);
  }

  // Denial Score: 35 points
  let denialScore = 35;
  if (denialRate > b.topDecileDenialRate) {
    const denSpread = Math.max(0, denialRate - b.topDecileDenialRate);
    denialScore = Math.max(5, 35 - denSpread * 2.8);
  }

  // Clean Claim Score: 25 points
  let cleanScore = 25;
  if (cleanClaimRate < b.cleanClaimTarget) {
    const cleanSpread = Math.max(0, b.cleanClaimTarget - cleanClaimRate);
    cleanScore = Math.max(5, 25 - cleanSpread * 1.8);
  }

  const overallScore = Math.round(arScore + denialScore + cleanScore);

  let grade = 'A';
  let gradeColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let healthSummary = 'Top-Decile Performer: Your revenue cycle matches elite national benchmarks.';

  if (overallScore < 60) {
    grade = 'F';
    gradeColor = 'text-red-600 bg-red-50 border-red-200';
    healthSummary = 'Critical Revenue Leakage: Your practice is losing 15%–22% of collectible net revenue to delays and unworked denials.';
  } else if (overallScore < 72) {
    grade = 'D';
    gradeColor = 'text-orange-600 bg-orange-50 border-orange-200';
    healthSummary = 'At-Risk Practice Health: Substantial revenue is trapped in aging AR and avoidable front-end denials.';
  } else if (overallScore < 84) {
    grade = 'C';
    gradeColor = 'text-amber-600 bg-amber-50 border-amber-200';
    healthSummary = 'Average / Median Health: Operates at industry baseline with measurable upside through automated scrubbing and faster appeals.';
  } else if (overallScore < 93) {
    grade = 'B';
    gradeColor = 'text-teal bg-teal/10 border-teal/30';
    healthSummary = 'Above-Average Health: Performing well, with slight room for faster payment posting and AR compaction.';
  }

  // Financial Upside / Cash Recovery Lift
  // 1. Recoverable uncollected denial cash: (current denial rate - top decile) * 60% overturn probability
  const excessDenialRate = Math.max(0, (denialRate - b.topDecileDenialRate) / 100);
  const annualDenialRecovery = Math.round(monthlyVolume * 12 * excessDenialRate * 0.65);

  // 2. Cost of capital drag on aging AR (7.5% commercial APR on excess days)
  const excessDays = Math.max(0, daysInAr - b.topDecileDaysInAr);
  const dailyCharge = monthlyVolume / 30;
  const trappedWorkingCapital = Math.round(dailyCharge * excessDays);
  const annualInterestSaved = Math.round(trappedWorkingCapital * 0.075);

  const totalAnnualCashLift = annualDenialRecovery + annualInterestSaved;

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const handleSubmitScorecard = async () => {
    if (!contactEmail || isSubmitting) return;
    setIsSubmitting(true);
    const payload = {
      practiceName: practiceName || 'Not specified',
      contactEmail,
      specialty,
      providerCount,
      monthlyVolume,
      daysInAr,
      denialRate,
      cleanClaimRate,
      overallScore,
      grade,
      annualCashLift: totalAnnualCashLift,
      trappedWorkingCapital,
      routeTo: PRIMARY_EXPERT_EMAIL,
    };

    await sendLeadToKiran('scorecard_consultation', payload, [
      { role: 'user', content: `Scorecard Audit: ${specialty} (${providerCount} providers), Health Score ${overallScore}/100 (${grade}), Annual Cash Lift $${totalAnnualCashLift.toLocaleString()}` },
    ]);

    setIsSubmitting(false);
    setSubmitSuccess(true);
  };

  return (
    <div className="space-y-8">
      {/* Input Parameters Box */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray/20 shadow-sm print:hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray/10 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-teal font-bold text-xs uppercase tracking-wider">
              <Award className="h-4 w-4" />
              <span>National MGMA &amp; HFMA Benchmark Engine</span>
            </div>
            <h2 className="text-xl font-bold text-navy mt-1">Practice Financial Health &amp; Productivity Scorecard</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cream text-navy hover:bg-teal hover:text-white transition-colors text-xs font-semibold border border-gray/20"
            >
              <Printer className="h-3.5 w-3.5" /> Print Scorecard
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinical Specialty</label>
            <select
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              className="w-full px-3 py-2 border border-gray/25 rounded-xl text-navy bg-white focus:ring-2 focus:ring-teal focus:outline-none"
            >
              {Object.keys(SPECIALTY_BENCHMARKS).map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Active Physicians / Clinicians</label>
            <input
              type="number"
              min={1}
              max={100}
              value={providerCount}
              onChange={e => setProviderCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3 py-2 border border-gray/25 rounded-xl text-navy focus:ring-2 focus:ring-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Average Monthly Collections ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step={5000}
                value={monthlyVolume}
                onChange={e => setMonthlyVolume(parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 border border-gray/25 rounded-xl font-bold text-navy focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Current Days in A/R</label>
            <input
              type="number"
              value={daysInAr}
              onChange={e => setDaysInAr(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray/25 rounded-xl font-bold text-navy focus:ring-2 focus:ring-teal focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              MGMA Top Decile for {specialty}: <strong>&lt; {b.topDecileDaysInAr} days</strong>
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Initial Denial Rate (%)</label>
            <div className="relative">
              <input
                type="number"
                step={0.5}
                value={denialRate}
                onChange={e => setDenialRate(parseFloat(e.target.value) || 0)}
                className="w-full pl-3 pr-7 py-2 border border-gray/25 rounded-xl font-bold text-navy focus:ring-2 focus:ring-teal focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              MGMA Target: <strong>&lt; {b.topDecileDenialRate}%</strong> (Median is {b.medianDenialRate}%)
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">First-Pass Clean Claim Rate (%)</label>
            <div className="relative">
              <input
                type="number"
                step={0.5}
                value={cleanClaimRate}
                onChange={e => setCleanClaimRate(parseFloat(e.target.value) || 0)}
                className="w-full pl-3 pr-7 py-2 border border-gray/25 rounded-xl font-bold text-navy focus:ring-2 focus:ring-teal focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Industry Standard: <strong>&gt; {b.cleanClaimTarget}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* SCORECARD RESULTS & RECOVERY REPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Health Score Gauge & Metrics */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-gray/20 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray/15 pb-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Composite Evaluation</span>
              <h3 className="text-xl font-bold text-navy mt-0.5">Practice Health Index</h3>
            </div>

            <div className={`px-4 py-2 rounded-2xl border text-center font-extrabold ${gradeColor}`}>
              <span className="text-2xl sm:text-3xl block leading-none">{grade}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">Score: {overallScore}/100</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {healthSummary}
          </p>

          {/* Metric Comparison Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Key RCM Indicator Comparison</h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-cream/40 border border-gray/15 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Days in A/R:</span>
                  <span className="text-[11px] text-slate-500">Your practice: {daysInAr} days</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-navy block">Target: {b.topDecileDaysInAr} days</span>
                  <span className={daysInAr > b.topDecileDaysInAr ? 'text-red-600 font-semibold text-[11px]' : 'text-emerald-600 font-semibold text-[11px]'}>
                    {daysInAr > b.topDecileDaysInAr ? `+${daysInAr - b.topDecileDaysInAr} days drag` : 'Top Decile'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cream/40 border border-gray/15 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Initial Denial Rate:</span>
                  <span className="text-[11px] text-slate-500">Your practice: {denialRate}%</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-navy block">Target: &lt; {b.topDecileDenialRate}%</span>
                  <span className={denialRate > b.topDecileDenialRate ? 'text-red-600 font-semibold text-[11px]' : 'text-emerald-600 font-semibold text-[11px]'}>
                    {denialRate > b.topDecileDenialRate ? `+${(denialRate - b.topDecileDenialRate).toFixed(1)}% excess` : 'Top Decile'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cream/40 border border-gray/15 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Clean Claim Pass Rate:</span>
                  <span className="text-[11px] text-slate-500">Your practice: {cleanClaimRate}%</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-navy block">Target: &gt; {b.cleanClaimTarget}%</span>
                  <span className={cleanClaimRate < b.cleanClaimTarget ? 'text-red-600 font-semibold text-[11px]' : 'text-emerald-600 font-semibold text-[11px]'}>
                    {cleanClaimRate < b.cleanClaimTarget ? `-${(b.cleanClaimTarget - cleanClaimRate).toFixed(1)}% gap` : 'Top Decile'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Annual Cash Recovery Lift Card */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-gray/20 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-gray/15 pb-4">
              <span className="text-xs font-semibold text-teal uppercase tracking-wider block">Recoverable Practice Upside</span>
              <h3 className="text-xl font-bold text-navy mt-0.5">Estimated Annual Cash Lift</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-navy">
                  +${totalAnnualCashLift.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-semibold">/ year in recovered revenue</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cream/50 border border-gray/15 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Recovered Denial Reimbursement (65% appeal overturn):</span>
                <strong className="text-navy font-bold">+${annualDenialRecovery.toLocaleString()}/yr</strong>
              </div>
              <div className="flex justify-between">
                <span>Working Capital Interest Released ({excessDays} days compacted):</span>
                <strong className="text-navy font-bold">+${annualInterestSaved.toLocaleString()}/yr</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray/10 text-slate-600">
                <span>Trapped Working Capital in Excess A/R:</span>
                <strong className="text-slate-800">${trappedWorkingCapital.toLocaleString()}</strong>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed italic">
              Benchmark projections based on Aethera’s verified track record of 98.7% clean claim submission, 32-day average Days in A/R, and 3.5%–5.0% performance pricing.
            </p>
          </div>

          {/* Lead Consultation Dispatch Form */}
          <div className="p-4 rounded-xl bg-navy text-white space-y-3">
            {submitSuccess ? (
              <div className="text-center py-3 space-y-1">
                <CheckCircle2 className="h-6 w-6 text-mint mx-auto" />
                <p className="font-bold text-sm">Scorecard Dispatched to Kiran!</p>
                <p className="text-xs text-white/80">
                  We will contact you at <strong>{contactEmail}</strong> with an executive audit plan within 2 business hours.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-mint">
                    Request an Executive Denial &amp; A/R Audit with Kiran
                  </h5>
                  <p className="text-[11px] text-white/70">
                    Get an in-depth clinical CPT review and custom SLA recovery proposal for your practice.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    value={practiceName}
                    onChange={e => setPracticeName(e.target.value)}
                    placeholder="Practice / Clinic Name"
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20"
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="Physician / Admin Email *"
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitScorecard}
                  disabled={!contactEmail || isSubmitting}
                  className="w-full py-2 bg-teal hover:bg-mint hover:text-navy disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? 'Submitting to Kiran…' : 'Submit for Full Practice Audit'} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
