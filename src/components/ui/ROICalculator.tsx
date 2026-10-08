'use client';
import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { SITE, PRICING_RANGE } from '@/lib/siteConfig';
import { revenueScenario } from '@/lib/marketing';
import { submitToWorker } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
export default function ROICalculator() {
  const [collections, setCollections] = useState('');
  const [improvement, setImprovement] = useState('');
  const [fee, setFee] = useState<number>(SITE.pricing.estimatePercent);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const valid = collections !== '' && improvement !== '' && Number.isFinite(Number(collections)) && Number(collections) > 0 && Number.isFinite(Number(improvement)) && Number(improvement) >= 0 && Number(improvement) <= 100;
  const results = useMemo(() => revenueScenario(valid ? Number(collections) : 0, valid ? Number(improvement) : 0, fee), [collections, improvement, fee, valid]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (status === 'sending' || !valid) return;
    setStatus('sending');
    const ok = await submitToWorker('calculator_lead', { email, monthlyNetCollections: collections, improvementAssumption: improvement, feePercent: fee, message: `Requested a review of visitor-entered scenario: monthly net collections ${collections}, improvement assumption ${improvement}%, fee ${fee}% of net collections. No client outcome is implied.` });
    if (!ok) { setStatus('error'); return; }
    trackConversion('calculator'); setStatus('sent');
  }
  const input = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900';
  return <div className="grid gap-8 lg:grid-cols-2">
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <h3 className="text-xl font-bold text-navy">Model your practice’s economics</h3>
      <p className="my-3 text-sm text-slate-600">Enter your actual collections and an improvement assumption you want to explore. This scenario is not a forecast or a promise of recovery.</p>
      <label className="mb-4 block text-sm font-semibold text-slate-800">Monthly net collections ($)<input aria-label="Monthly net collections" type="number" min="0" step="100" value={collections} onChange={e => setCollections(e.target.value)} className={input} /></label>
      <label className="mb-4 block text-sm font-semibold text-slate-800">Potential improvement — your assumption (%)<input aria-label="Potential improvement assumption" type="number" min="0" max="100" step="0.5" value={improvement} onChange={e => setImprovement(e.target.value)} className={input} /></label>
      <label className="block text-sm font-semibold text-slate-800">Fee assumption: {fee}% of {SITE.pricing.basis}<input aria-label="Fee assumption" type="range" min={SITE.pricing.minimumPercent} max={SITE.pricing.maximumPercent} step="0.1" value={fee} onChange={e => setFee(Number(e.target.value))} className="mt-3 w-full accent-teal" /></label>
      <p className="mt-3 text-xs text-slate-600">Published range: {PRICING_RANGE} of net collections. Final scope and rate are confirmed in writing. The scenario excludes your existing billing costs.</p>
    </div>
    <div className="rounded-2xl bg-navy p-6 text-white sm:p-8">
      <h3 className="text-xl font-bold">Your scenario</h3>
      {valid ? <dl className="my-6 space-y-4">
        {[['Scenario monthly collections', money(results.projectedMonthly)], ['Monthly increase before fees', money(results.monthlyGain)], [`Monthly fee (${fee}%)`, money(results.monthlyFee)], ['Annual change after fees', money(results.netAnnualGain)]].map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-3 border-b border-white/20 pb-3"><dt>{label}</dt><dd className="font-bold text-mint">{value}</dd></div>)}
      </dl> : <p role="status" className="my-6 text-white/80">Enter your collections and an improvement assumption to see a scenario.</p>}
      <p className="mb-5 text-xs text-white/75">Actual results depend on your payer mix, contracts, documentation and current process. A first-pass rejection does not necessarily mean lost revenue.</p>
      {status === 'sent' ? <p role="status" className="rounded-xl bg-white/10 p-4">Your review request was received. We’ll reply within one business day.</p> : <form onSubmit={submit} className="space-y-3">
        <label className="block text-sm font-semibold">Work email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={input} /></label>
        <button disabled={status === 'sending' || !valid} className="w-full rounded-xl bg-mint px-4 py-3 font-bold text-navy disabled:opacity-60">{status === 'sending' ? 'Sending…' : 'Request a review of my scenario'}</button>
        {status === 'error' && <p role="alert" className="text-sm text-red-200">Your request could not be saved. Please retry or <Link href="/schedule/" className="underline">schedule a meeting</Link>.</p>}
      </form>}
      <Link href="/pricing/" className="mt-5 inline-block text-sm text-mint underline">See pricing and service scope</Link>
    </div>
  </div>;
}
