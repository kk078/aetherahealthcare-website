'use client';

import React, { useState, useMemo } from 'react';
import { SPECIALTY_RCM_PROFILES, SpecialtyRcmProfile } from '@/data/specialtyRcmData';
import {
  Calculator,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  Building2
} from 'lucide-react';

export default function SpecialtyClawbackCalculator() {
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('surgery');
  const [monthlyVolume, setMonthlyVolume] = useState<number>(750000); // $750k/month default
  const [avgClaimSize, setAvgClaimSize] = useState<number>(1200); // $1,200 avg claim
  const [billingMode, setBillingMode] = useState<'ai_only' | 'clearinghouse_only' | 'in_house'>('ai_only');

  const activeSpecialty: SpecialtyRcmProfile = useMemo(() => {
    return (
      SPECIALTY_RCM_PROFILES.find((s) => s.id === selectedSpecialtyId) ||
      SPECIALTY_RCM_PROFILES[0]
    );
  }, [selectedSpecialtyId]);

  // Derived baseline denial rate based on specialty & selected architecture
  const baselineDenialRate = useMemo(() => {
    const rawRate = parseFloat(activeSpecialty.rcmBenchmark.typicalDenialRateWithoutGate.replace('%', ''));
    if (billingMode === 'ai_only') {
      return rawRate; // e.g. 28.4%
    } else if (billingMode === 'clearinghouse_only') {
      return Math.max(rawRate * 0.72, 14.5);
    } else {
      return Math.max(rawRate * 0.55, 10.2);
    }
  }, [activeSpecialty, billingMode]);

  // Aethera target clean claim rate
  const aetheraTargetRate = useMemo(() => {
    return parseFloat(activeSpecialty.rcmBenchmark.cleanClaimTarget.replace('%', ''));
  }, [activeSpecialty]);

  const aetheraDenialRate = useMemo(() => {
    return Math.max(100 - aetheraTargetRate, 0.5);
  }, [aetheraTargetRate]);

  // Financial calculations (HFMA & MGMA industry benchmarks)
  const stats = useMemo(() => {
    const annualVolume = monthlyVolume * 12;
    const annualClaimsCount = Math.round(annualVolume / avgClaimSize);
    
    // Baseline denials
    const baselineDeniedClaims = Math.round(annualClaimsCount * (baselineDenialRate / 100));
    const baselineDollarsAtRisk = annualVolume * (baselineDenialRate / 100);
    // Industry standard: 55% of denials are permanently written off / uncollected
    const baselineLostRevenue = baselineDollarsAtRisk * 0.55;
    // HFMA benchmark: $118 average cost to appeal and rework a denied claim
    const baselineReworkCost = baselineDeniedClaims * 118;
    const baselineTotalLoss = baselineLostRevenue + baselineReworkCost;

    // Aethera Sovereign Gate
    const aetheraDeniedClaims = Math.round(annualClaimsCount * (aetheraDenialRate / 100));
    const aetheraDollarsAtRisk = annualVolume * (aetheraDenialRate / 100);
    const aetheraLostRevenue = aetheraDollarsAtRisk * 0.20; // 80% overturn on residual clean claims
    const aetheraReworkCost = aetheraDeniedClaims * 118;
    const aetheraTotalLoss = aetheraLostRevenue + aetheraReworkCost;

    // Net Annual Financial Recovery
    const netAnnualRecovery = Math.max(baselineTotalLoss - aetheraTotalLoss, 0);
    // Administrative hours saved: average 2.2 staff hours per appealed claim
    const adminHoursSaved = Math.round((baselineDeniedClaims - aetheraDeniedClaims) * 2.2);

    return {
      annualVolume,
      annualClaimsCount,
      baselineDeniedClaims,
      baselineDollarsAtRisk,
      baselineLostRevenue,
      baselineReworkCost,
      baselineTotalLoss,
      aetheraDeniedClaims,
      aetheraTotalLoss,
      netAnnualRecovery,
      adminHoursSaved,
    };
  }, [monthlyVolume, avgClaimSize, baselineDenialRate, aetheraDenialRate]);

  return (
    <section id="specialty-clawback-calculator" className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
      {/* Ambient background lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-teal-500/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-[600px] h-[400px] bg-emerald-500/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5 text-teal-400" />
            HFMA &amp; MGMA Financial Benchmarking • Sovereign ROI Modeler
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Specialty Clawback &amp; Denial Risk Calculator
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Unverified generative AI models and generic clearinghouses miss specialty-specific modifiers, global periods, and NCCI edits.
            Calculate your practice&apos;s annual revenue at risk of payer clawback and see how much cash flow is protected by Aethera&apos;s certified sovereign gate.
          </p>
        </div>

        {/* Main Calculator Grid: Controls (Left) vs Real-Time ROI Output (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Inputs & Scenario Controls (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-400" />
                Practice Parameters
              </span>
              <span className="text-[10px] font-mono text-teal-300 bg-teal-950 px-2.5 py-1 rounded-md border border-teal-800">
                20 ABMS Disciplines
              </span>
            </div>

            {/* Specialty Selector Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200">
                1. Select Medical / Surgical Specialty
              </label>
              <select
                value={selectedSpecialtyId}
                onChange={(e) => setSelectedSpecialtyId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 font-sans"
              >
                {SPECIALTY_RCM_PROFILES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.abmsCategory})
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>Taxonomy: {activeSpecialty.taxonomyCode}</span>
                <span className="text-teal-300">Clean Target: {activeSpecialty.rcmBenchmark.cleanClaimTarget}</span>
              </div>
            </div>

            {/* Monthly Billed Volume Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-200">
                  2. Monthly Practice Charges / Volume
                </label>
                <span className="font-mono font-bold text-teal-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  ${(monthlyVolume).toLocaleString()} / mo
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="5000000"
                step="50000"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>$100k</span>
                <span>$1.5M</span>
                <span>$3.0M</span>
                <span>$5.0M</span>
              </div>
            </div>

            {/* Average Claim Size Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-200">
                  3. Average Billed Amount per Claim
                </label>
                <span className="font-mono font-bold text-teal-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  ${avgClaimSize}
                </span>
              </div>
              <input
                type="range"
                min="150"
                max="4000"
                step="50"
                value={avgClaimSize}
                onChange={(e) => setAvgClaimSize(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>$150 (Primary)</span>
                <span>$1,200 (Surgical)</span>
                <span>$4,000 (Major)</span>
              </div>
            </div>

            {/* Current Billing Architecture Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200">
                4. Current Billing Architecture
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'ai_only',
                    label: 'Unverified Generative AI / Ambient Scribing',
                    desc: `High risk: ~${activeSpecialty.rcmBenchmark.typicalDenialRateWithoutGate} denial rate on complex modifiers`,
                  },
                  {
                    id: 'clearinghouse_only',
                    label: 'Standard Clearinghouse Rules Engine Only',
                    desc: 'Moderate risk: misses non-mathematical clinical necessity edits',
                  },
                  {
                    id: 'in_house',
                    label: 'Traditional In-House Billing Staff',
                    desc: 'Moderate risk: staff turnover, backlogs, and manual RVU leakage',
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setBillingMode(mode.id as typeof billingMode)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      billingMode === mode.id
                        ? 'bg-teal-950/50 border-teal-500 text-white ring-1 ring-teal-400'
                        : 'bg-slate-800/60 border-slate-750 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{mode.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* OIG Tripwire Notice for Active Specialty */}
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 space-y-1.5 text-xs">
              <div className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Active OIG Audit Tripwire: {activeSpecialty.name}
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeSpecialty.regulatoryFramework.oigWorkPlanFocus}
              </p>
            </div>
          </div>

          {/* RIGHT: Financial Impact & ROI Dashboard (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Big Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Annual Revenue Recovered */}
              <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/50 rounded-2xl p-6 shadow-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    Annual Revenue Protected
                  </span>
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
                  ${Math.round(stats.netAnnualRecovery).toLocaleString()}
                </div>
                <p className="text-xs text-slate-300">
                  Estimated annual cash flow preserved through certified specialist sign-off and zero AI hallucinations.
                </p>
              </div>

              {/* Card 2: Administrative Hours Saved */}
              <div className="bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-900 border border-teal-500/40 rounded-2xl p-6 shadow-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-teal-300 font-bold">
                    Admin Staff Hours Saved
                  </span>
                  <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-teal-300 tracking-tight">
                  {stats.adminHoursSaved.toLocaleString()} hrs / yr
                </div>
                <p className="text-xs text-slate-300">
                  Eliminating avoidable claim denials frees {(stats.adminHoursSaved / 52).toFixed(1)} hours/week of staff rework.
                </p>
              </div>
            </div>

            {/* Detailed Financial Comparison Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                  Side-by-Side Adjudication &amp; Cash Flow Projection
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Annual Charge Volume: ${(stats.annualVolume).toLocaleString()}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                      <th className="pb-3">Financial Metric</th>
                      <th className="pb-3 text-rose-400">Unverified Architecture</th>
                      <th className="pb-3 text-emerald-400">Aethera Sovereign Gate</th>
                      <th className="pb-3 text-right text-teal-300">Net Improvement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    <tr>
                      <td className="py-3 text-slate-300 font-medium">Clean Claim Acceptance Rate</td>
                      <td className="py-3 font-mono text-rose-400 font-bold">{(100 - baselineDenialRate).toFixed(1)}%</td>
                      <td className="py-3 font-mono text-emerald-400 font-bold">{aetheraTargetRate.toFixed(1)}%</td>
                      <td className="py-3 font-mono text-right text-teal-300 font-bold">
                        +{((100 - baselineDenialRate) < aetheraTargetRate ? aetheraTargetRate - (100 - baselineDenialRate) : 0).toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-slate-300 font-medium">Annual Denied Claims</td>
                      <td className="py-3 font-mono text-rose-400">{stats.baselineDeniedClaims.toLocaleString()} claims</td>
                      <td className="py-3 font-mono text-emerald-400">{stats.aetheraDeniedClaims.toLocaleString()} claims</td>
                      <td className="py-3 font-mono text-right text-teal-300 font-bold">
                        -{(stats.baselineDeniedClaims - stats.aetheraDeniedClaims).toLocaleString()} claims
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-slate-300 font-medium">Permanently Abandoned Revenue</td>
                      <td className="py-3 font-mono text-rose-400">${Math.round(stats.baselineLostRevenue).toLocaleString()}</td>
                      <td className="py-3 font-mono text-emerald-400">${Math.round(stats.aetheraTotalLoss * 0.4).toLocaleString()}</td>
                      <td className="py-3 font-mono text-right text-teal-300 font-bold">
                        +${Math.round(stats.baselineLostRevenue - stats.aetheraTotalLoss * 0.4).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-slate-300 font-medium">Staff Appeal &amp; Rework Costs ($118/claim)</td>
                      <td className="py-3 font-mono text-rose-400">${Math.round(stats.baselineReworkCost).toLocaleString()}</td>
                      <td className="py-3 font-mono text-emerald-400">${Math.round(stats.aetheraDeniedClaims * 118).toLocaleString()}</td>
                      <td className="py-3 font-mono text-right text-teal-300 font-bold">
                        +${Math.round(stats.baselineReworkCost - stats.aetheraDeniedClaims * 118).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-800/40 font-bold">
                      <td className="py-3.5 text-white">Net Annual Value Protected</td>
                      <td className="py-3.5 font-mono text-slate-400">Baseline Loss</td>
                      <td className="py-3.5 font-mono text-emerald-400">Audit-Proof</td>
                      <td className="py-3.5 font-mono text-right text-emerald-400 text-sm">
                        +${Math.round(stats.netAnnualRecovery).toLocaleString()} / yr
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Specialist Credential Sign-off Seal Badge */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>
                    Mandatory Signer for {activeSpecialty.name}: <strong className="text-white">{activeSpecialty.credentialRequired}</strong>
                  </span>
                </div>
                <span className="font-mono text-teal-300 text-[11px] bg-teal-950 px-2.5 py-1 rounded border border-teal-800 shrink-0">
                  Primary Shield: {activeSpecialty.rcmBenchmark.primaryCARC.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Callout Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Ready to benchmark your practice against 2026 CMS Fee Schedules?
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Our certified auditors evaluate your clearinghouse scrub logs and identify every uncaptured modifier and unbundling tripwire.
                </p>
              </div>
              <a
                href="/free-assessment"
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider shrink-0 transition-all shadow-lg shadow-teal-500/20"
              >
                Request Custom Practice Audit
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
