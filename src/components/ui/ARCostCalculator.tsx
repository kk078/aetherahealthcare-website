'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Clock, DollarSign, TrendingDown, Calculator, Mail, CheckCircle2, ArrowRight, Printer, Activity } from 'lucide-react';
import { submitToWorker } from '@/lib/worker';

function fmt(n: number) {
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function fmtNum(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * AR-days cost calculator. Estimates the carrying cost of slow A/R and the cash
 * freed up by reaching a healthier days-in-A/R, using a simple cost-of-capital model.
 */
export default function ARCostCalculator() {
  const [annualRevenue, setAnnualRevenue] = useState(3_000_000);
  const [currentArDays, setCurrentArDays] = useState(52);
  const [targetArDays, setTargetArDays] = useState(35);
  const [costOfCapital, setCostOfCapital] = useState(10);

  const [email, setEmail] = useState('');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const r = useMemo(() => {
    const dailyRevenue = annualRevenue / 365;
    const currentAr = dailyRevenue * currentArDays;
    const targetAr = dailyRevenue * Math.min(targetArDays, currentArDays);
    const cashFreed = Math.max(0, currentAr - targetAr);
    const daysReduced = Math.max(0, currentArDays - targetArDays);
    // Annual carrying cost of the *excess* A/R vs target, at the chosen cost of capital.
    const annualCarryingCost = cashFreed * (costOfCapital / 100);
    return { dailyRevenue, currentAr, targetAr, cashFreed, daysReduced, annualCarryingCost };
  }, [annualRevenue, currentArDays, targetArDays, costOfCapital]);

  const benchmark = currentArDays <= 35
    ? { label: 'Top Decile — High Performer (MGMA)', color: 'text-mint bg-mint/10 border-mint/30', desc: 'Your A/R days are well within top national practice benchmarks.' }
    : currentArDays <= 45
      ? { label: 'Industry Median (Average Lag)', color: 'text-cyan-300 bg-cyan-900/40 border-cyan-500/30', desc: 'Typical performance, but working capital remains locked up.' }
      : currentArDays <= 60
        ? { label: 'At-Risk Aging (High Denial Friction)', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', desc: 'Aging past 45 days increases bad debt risk exponentially.' }
        : { label: 'Critical Cash Flow Burn (>60 Days)', color: 'text-red-400 bg-red-400/10 border-red-400/30', desc: 'Severe uncollected claims risk exceeding timely-filing deadlines.' };

  async function handleLead(e: FormEvent) {
    e.preventDefault();
    if (!email || leadStatus === 'sending') return;
    setLeadStatus('sending');
    await submitToWorker('ar_calculator_lead', {
      email,
      claimVolume: '',
      message:
        `A/R cost calculator lead — ${fmt(annualRevenue)} annual revenue, ${currentArDays} current A/R days → ` +
        `${targetArDays} target. Excess A/R tied up ${fmt(r.cashFreed)}; est. annual carrying cost ${fmt(r.annualCarryingCost)} ` +
        `at ${costOfCapital}% cost of capital. Requested a free A/R acceleration analysis.`,
    });
    setLeadStatus('sent');
  }

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="bg-white rounded-2xl border border-gray/15 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-teal" />
          <span className="text-xs font-bold text-navy uppercase tracking-wider">
            Days in A/R Capital Efficiency Model
          </span>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray hover:text-navy border border-gray/20 hover:border-navy transition-colors"
        >
          <Printer className="h-3.5 w-3.5" /> Print / Save PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Inputs */}
        <div className="bg-cream rounded-2xl p-8 border border-gray/10">
          <div className="flex items-center mb-6">
            <Calculator className="h-6 w-6 text-teal mr-3" />
            <h3 className="text-xl font-bold text-navy">Your A/R Details</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Annual Net Revenue: <span className="text-teal">{fmt(annualRevenue)}</span>
              </label>
              <input
                type="range" min={250_000} max={20_000_000} step={250_000} aria-label="Annual Net Revenue"
                value={annualRevenue} onChange={e => setAnnualRevenue(Number(e.target.value))}
                className="w-full accent-teal"
              />
              <div className="flex justify-between text-xs text-gray mt-1"><span>$250K</span><span>$20M</span></div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Current Days in A/R: <span className="text-red-500">{currentArDays} days</span>
              </label>
              <input
                type="range" min={20} max={120} step={1} aria-label="Current Days in A/R"
                value={currentArDays} onChange={e => setCurrentArDays(Number(e.target.value))}
                className="w-full accent-teal"
              />
              <div className="flex justify-between text-xs text-gray mt-1"><span>20</span><span>120</span></div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Target Days in A/R: <span className="text-teal">{targetArDays} days</span>
              </label>
              <input
                type="range" min={20} max={120} step={1} aria-label="Target Days in A/R"
                value={targetArDays} onChange={e => setTargetArDays(Number(e.target.value))}
                className="w-full accent-teal"
              />
              <div className="flex justify-between text-xs text-gray mt-1"><span>20</span><span>120</span></div>
              <p className="text-xs text-gray mt-1">MGMA better-performer benchmark is roughly 30–35 days.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Cost of Capital: <span className="text-teal">{costOfCapital}%</span>
              </label>
              <input
                type="range" min={4} max={25} step={1} aria-label="Cost of Capital"
                value={costOfCapital} onChange={e => setCostOfCapital(Number(e.target.value))}
                className="w-full accent-teal"
              />
              <div className="flex justify-between text-xs text-gray mt-1"><span>4%</span><span>25%</span></div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-navy rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TrendingDown className="h-6 w-6 text-mint mr-3" />
              <h3 className="text-xl font-bold">What Slow A/R Costs You</h3>
            </div>
          </div>

          {/* Benchmark Badge */}
          <div className={`p-3.5 rounded-xl border mb-5 flex items-start gap-2.5 ${benchmark.color}`}>
            <Activity className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">{benchmark.label}</p>
              <p className="text-xs text-cream/80 mt-0.5 leading-snug">{benchmark.desc}</p>
            </div>
          </div>

        <div className="space-y-5">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <p className="text-sm text-gray flex items-center"><Clock className="h-4 w-4 mr-1.5" />A/R tied up now</p>
              <p className="text-2xl font-bold text-white">{fmt(r.currentAr)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray">At target</p>
              <p className="text-2xl font-bold text-mint">{fmt(r.targetAr)}</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-5 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray">Days reduced</span>
              <span className="font-bold text-mint">{fmtNum(r.daysReduced)} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray">One-time cash freed up</span>
              <span className="font-bold text-mint">{fmt(r.cashFreed)}</span>
            </div>
          </div>

          <div className="bg-mint/20 border border-mint/40 rounded-xl p-5">
            <p className="text-sm text-mint mb-1">Annual carrying cost of that excess A/R</p>
            <p className="text-4xl font-bold text-mint">{fmt(r.annualCarryingCost)}</p>
            <p className="text-sm text-gray mt-1">at {costOfCapital}% cost of capital — recurring, every year you stay slow.</p>
          </div>

          <p className="text-xs text-gray/60 leading-relaxed">
            Estimate only. Cash freed up = (current − target days) × average daily revenue. Carrying cost applies your
            cost of capital to that tied-up cash. Actual impact depends on payer mix, denial rate, and write-offs.
          </p>

          {r.cashFreed > 0 && (
            leadStatus === 'sent' ? (
              <div className="bg-mint/20 border border-mint/40 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-mint shrink-0 mt-0.5" />
                <div>
                  <p className="text-mint font-semibold text-sm">Got it.</p>
                  <p className="text-xs text-gray">We&apos;ll send a free A/R acceleration analysis for your practice within 1 business day.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLead} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <p className="text-sm text-white font-semibold flex items-center"><Mail className="h-4 w-4 mr-2 text-mint" />Free up this cash</p>
                <p className="text-xs text-gray">Get a free A/R acceleration analysis — where your days are stuck and how to fix it.</p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@practice.com" aria-label="Work email"
                    className="flex-1 rounded-lg px-4 py-2.5 text-navy bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mint"
                  />
                  <button
                    type="submit" disabled={leadStatus === 'sending'}
                    className="bg-mint hover:bg-white text-navy font-bold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 whitespace-nowrap"
                  >
                    {leadStatus === 'sending' ? 'Sending…' : 'Get my analysis'}
                  </button>
                </div>
              </form>
            )
          )}

          <Link prefetch={false}
            href="/free-assessment"
            className="flex items-center justify-center w-full bg-mint hover:bg-white text-navy font-bold py-3 px-6 rounded-full transition-colors duration-300 mt-2"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Claim Your Free Assessment
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>

          <Link prefetch={false}
            href="/tools/practice-proposal-wizard"
            className="flex items-center justify-center w-full border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 px-6 rounded-full transition-colors text-xs text-center"
          >
            Or Generate Custom Practice Proposal &amp; SLA &rarr;
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
}
