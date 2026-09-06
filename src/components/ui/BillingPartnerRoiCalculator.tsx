'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calculator, TrendingUp, ShieldCheck, CheckCircle2, ArrowRight, Zap, Users, DollarSign } from 'lucide-react';
import { trackConversion } from '@/lib/gtag';

function fmt(n: number) {
  const rounded = Math.round(n);
  return '$' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function BillingPartnerRoiCalculator() {
  const [usFteCount, setUsFteCount] = useState<number>(4);
  const [usHourlyWage, setUsHourlyWage] = useState<number>(42);
  const [monthlyClaims, setMonthlyClaims] = useState<number>(3200);

  const calculations = useMemo(() => {
    // Loaded cost factor: 1.28 (28% for payroll taxes, health benefits, 401k, clearinghouse seat licenses)
    const annualUsWages = usFteCount * usHourlyWage * 2080;
    const loadedUsCost = annualUsWages * 1.28;
    
    // Average cost to recruit & retrain a US medical biller (assuming 35% annual churn rate)
    const annualChurnCost = usFteCount * 0.35 * 14000;
    const totalUsCost = loadedUsCost + annualChurnCost;

    // Aethera India + AI hybrid model: 65% cost reduction
    const aetheraAnnualCost = totalUsCost * 0.35;
    const netAnnualSavings = totalUsCost - aetheraAnnualCost;
    const savingsPercent = Math.round((netAnnualSavings / totalUsCost) * 100);

    // Clean claims revenue protection:
    // Avg 12% rejection rate on first pass; Aethera lifts to 99.1%
    // Estimated $43.84 manual rework cost per denied claim saved
    const monthlyDenialsAvoided = Math.round(monthlyClaims * 0.08); // 8% absolute lift
    const annualReworkSavings = monthlyDenialsAvoided * 43.84 * 12;

    return {
      totalUsCost,
      aetheraAnnualCost,
      netAnnualSavings,
      savingsPercent,
      annualReworkSavings,
      monthlyDenialsAvoided,
    };
  }, [usFteCount, usHourlyWage, monthlyClaims]);

  return (
    <section className="py-16 bg-navy text-white relative overflow-hidden" id="interactive-calculator">
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#00BFA5 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-mint/15 text-mint border border-mint/30 mb-3">
            <Calculator className="h-3.5 w-3.5" /> Interactive Margin Simulator
          </span>
          <h2 className="font-jakarta font-bold text-3xl sm:text-4xl text-white tracking-tight">
            Calculate Your Agency's Operating Margin Unlock
          </h2>
          <p className="mt-3 text-slate-300 text-base sm:text-lg">
            See how much EBITDA margin your medical billing agency recaptures by pairing autonomous AI scrubbing with dedicated AAPC-certified pods in India.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-mint" /> 1. Input Your Agency Parameters
            </h3>

            {/* Slider 1: US FTE Count */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-200">
                  US Billers / Coders on Payroll
                </label>
                <span className="text-base font-bold text-mint bg-mint/10 px-2.5 py-0.5 rounded border border-mint/20">
                  {usFteCount} {usFteCount === 1 ? 'Specialist' : 'Specialists'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={usFteCount}
                onChange={(e) => setUsFteCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-mint"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1 Coder</span>
                <span>15 Coders</span>
                <span>30 Coders</span>
              </div>
            </div>

            {/* Slider 2: Hourly Rate */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-200">
                  Average US Hourly Wage
                </label>
                <span className="text-base font-bold text-sky-400 bg-sky-400/10 px-2.5 py-0.5 rounded border border-sky-400/20">
                  ${usHourlyWage} / hour
                </span>
              </div>
              <input
                type="range"
                min={30}
                max={60}
                step={1}
                value={usHourlyWage}
                onChange={(e) => setUsHourlyWage(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>$30/hr (Junior)</span>
                <span>$45/hr (AAPC Certified)</span>
                <span>$60/hr (Lead Specialist)</span>
              </div>
            </div>

            {/* Slider 3: Monthly Claims Volume */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-200">
                  Total Monthly Claims Billed
                </label>
                <span className="text-base font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded border border-emerald-400/20">
                  {monthlyClaims.toLocaleString()} claims / mo
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={25000}
                step={250}
                value={monthlyClaims}
                onChange={(e) => setMonthlyClaims(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>500</span>
                <span>12,000</span>
                <span>25,000+</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/60 text-xs text-slate-400 space-y-1.5">
              <p>• US loaded costs include 28% employer taxes, healthcare, PTO, and clearinghouse seat overhead.</p>
              <p>• Includes estimated $14,000 recruiter/training churn loss per replaced US biller (35% industry baseline).</p>
            </div>
          </div>

          {/* Results Output Column */}
          <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 to-[#0c234a] border-2 border-mint/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Annual Financial Projection
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-mint bg-mint/10 border border-mint/30 px-2.5 py-1 rounded-full">
                <Zap className="h-3 w-3" /> {calculations.savingsPercent}% Cost Reduction
              </span>
            </div>

            {/* Big Hero Savings */}
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-300 mb-1">Estimated Annual Operating Savings</p>
              <div className="text-4xl sm:text-5xl font-extrabold text-mint tracking-tight font-jakarta">
                {fmt(calculations.netAnnualSavings)}
                <span className="text-lg text-slate-300 font-normal"> / year</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Direct bottom-line EBITDA improvement back into your agency.
              </p>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-400">Current US Cost</p>
                <p className="text-xl font-bold text-rose-400 mt-1">{fmt(calculations.totalUsCost)}</p>
                <p className="text-[11px] text-slate-400 mt-1">Wages + taxes + churn</p>
              </div>
              <div className="bg-slate-800/80 border border-mint/30 rounded-xl p-4">
                <p className="text-xs text-slate-400">Aethera India + AI</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">{fmt(calculations.aetheraAnnualCost)}</p>
                <p className="text-[11px] text-slate-400 mt-1">Full back-office delivery</p>
              </div>
            </div>

            {/* Value Highlights */}
            <div className="space-y-2.5 mb-8 text-sm text-slate-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-mint shrink-0" />
                <span><strong>+{calculations.monthlyDenialsAvoided}</strong> denials prevented/mo via real-time pre-submission AI</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-mint shrink-0" />
                <span><strong>99.1%</strong> clean-claim rate guaranteed under SLA</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-mint shrink-0" />
                <span><strong>100% White-Label</strong>: You own client relationship and billing brand</span>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <Link
                href="/free-assessment?intent=partner_pilot"
                onClick={() => trackConversion('start_partner_pilot_from_calculator')}
                className="w-full inline-flex items-center justify-center gap-2 bg-mint hover:bg-emerald-400 text-navy font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-mint/20 text-center text-sm sm:text-base"
              >
                Claim Complimentary 50-Claim Pilot <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="flex justify-between items-center text-xs text-slate-400 px-1">
                <span>✓ Zero minimum commitments</span>
                <span>✓ 14-day turnaround</span>
                <span>✓ 100% HIPAA BAA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
