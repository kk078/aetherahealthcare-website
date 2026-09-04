'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Lock, CheckCircle2, TrendingDown, ArrowRight, ShieldCheck } from 'lucide-react';
import { submitToWorker } from '@/lib/worker';
import { SPECIALTY_BENCHMARKS, INDUSTRY_HEADLINES, getBenchmark } from '@/lib/denialBenchmarks';

function Bar({ value, max, label, sub }: { value: number; max: number; label: string; sub?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span>{label}</span>
        <span className="font-semibold text-navy">{sub}</span>
      </div>
      <div className="h-3 w-full bg-cream rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-teal to-navy" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function DenialsReport() {
  const [specialty, setSpecialty] = useState('cardiology');
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending'>('idle');

  const b = useMemo(() => getBenchmark(specialty)!, [specialty]);
  const maxReason = useMemo(() => Math.max(...b.topReasons.map(r => r.share)), [b]);

  async function unlock(e: FormEvent) {
    e.preventDefault();
    if (!email || status === 'sending') return;
    setStatus('sending');
    await submitToWorker('denials_report', {
      email,
      specialty: b.name,
      message: `Unlocked the ${b.name} State of Denials benchmark report. Requested the full PDF + a free denial-mix review for their practice.`,
    });
    setUnlocked(true);
    setStatus('idle');
  }

  return (
    <div className="space-y-8">
      {/* Specialty selector */}
      <div className="flex flex-wrap gap-2">
        {SPECIALTY_BENCHMARKS.map(s => (
          <button
            key={s.slug}
            onClick={() => setSpecialty(s.slug)}
            className={`text-sm rounded-full px-4 py-2 border transition-colors ${
              specialty === s.slug ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-gray/30 hover:border-teal'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Headline stats (always visible — the teaser) */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray/15 p-5">
          <p className="text-xs text-gray uppercase tracking-widest">Initial denial rate</p>
          <p className="text-3xl font-bold text-navy mt-1">{b.initialDenialRate}</p>
          <p className="text-xs text-gray mt-1">{b.name}, typical</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray/15 p-5">
          <p className="text-xs text-gray uppercase tracking-widest">Top-quartile target</p>
          <p className="text-3xl font-bold text-teal mt-1">{b.topQuartileDenialRate}</p>
          <p className="text-xs text-gray mt-1">where best performers sit</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray/15 p-5">
          <p className="text-xs text-gray uppercase tracking-widest">Clean-claim rate</p>
          <p className="text-3xl font-bold text-navy mt-1">{b.cleanClaimRate}</p>
          <p className="text-xs text-gray mt-1">first-pass acceptance</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray/15 p-5">
          <p className="text-xs text-gray uppercase tracking-widest">Days in A/R</p>
          <p className="text-3xl font-bold text-navy mt-1">{b.daysInAR}</p>
          <p className="text-xs text-gray mt-1">typical range</p>
        </div>
      </div>

      {/* Gate / full report */}
      {!unlocked ? (
        <div className="relative">
          {/* blurred preview */}
          <div className="pointer-events-none select-none blur-sm opacity-60 bg-white rounded-2xl border border-gray/15 p-6">
            <h3 className="text-lg font-bold text-navy mb-4">Top denial reasons — {b.name}</h3>
            <div className="space-y-3">
              {b.topReasons.map(r => (
                <Bar key={r.carc} value={r.share} max={maxReason} label={`CARC ${r.carc} — ${r.label}`} sub={`${r.share}%`} />
              ))}
            </div>
          </div>
          {/* gate overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <form onSubmit={unlock} className="bg-navy text-white rounded-2xl p-7 max-w-md w-full text-center shadow-2xl">
              <Lock className="h-7 w-7 text-mint mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-1">Unlock the full {b.name} report</h3>
              <p className="text-sm text-gray mb-4">Top denial reasons, preventable share, and the fixes that move your numbers — plus the PDF and a free denial-mix review.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@practice.com" aria-label="Work email"
                  className="flex-1 rounded-lg px-4 py-2.5 text-navy bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mint"
                />
                <button type="submit" disabled={status === 'sending'} className="bg-mint hover:bg-white text-navy font-bold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 whitespace-nowrap">
                  {status === 'sending' ? 'Unlocking…' : 'Unlock report'}
                </button>
              </div>
              <p className="text-[11px] text-gray/70 mt-3">No spam. Unsubscribe anytime.</p>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-teal text-sm font-semibold">
            <CheckCircle2 className="h-5 w-5" /> Report unlocked — we&apos;ll also email you the PDF.
          </div>

          {/* Top reasons */}
          <div className="bg-white rounded-2xl border border-gray/15 p-6">
            <h3 className="text-lg font-bold text-navy mb-1">Top denial reasons — {b.name}</h3>
            <p className="text-xs text-gray mb-4">Directional share of denials by CARC reason.</p>
            <div className="space-y-3">
              {b.topReasons.map(r => (
                <Bar key={r.carc} value={r.share} max={maxReason} label={`CARC ${r.carc} — ${r.label}`} sub={`${r.share}%${r.preventable ? ' · preventable' : ''}`} />
              ))}
            </div>
          </div>

          {/* Watch-out + reframe */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-amber-200 p-6">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2 flex items-center"><TrendingDown className="h-4 w-4 mr-1.5" />Signature trap</p>
              <p className="text-sm text-slate-700 leading-relaxed">{b.watchout}</p>
            </div>
            <div className="bg-navy rounded-2xl p-6 text-white">
              <p className="text-xs font-bold text-mint uppercase tracking-widest mb-2">The opportunity</p>
              <p className="text-sm text-gray leading-relaxed">
                Across specialties, roughly <strong className="text-mint">{INDUSTRY_HEADLINES.preventableShare}</strong> of denials
                are preventable — and around <strong className="text-mint">{INDUSTRY_HEADLINES.neverReworkedShare}</strong> are never
                reworked. Closing the gap to the top-quartile denial rate above is where the recovered revenue lives.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl p-7 text-center text-white">
            <ShieldCheck className="h-7 w-7 mx-auto mb-2 text-mint" />
            <h3 className="text-xl font-bold mb-1">See your real numbers, not the benchmark</h3>
            <p className="text-sm text-cream mb-5 max-w-xl mx-auto">A free assessment maps your actual denial mix against these benchmarks and shows exactly where revenue is leaking.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link prefetch={false} href="/free-assessment" className="bg-mint hover:bg-white text-navy font-bold py-3 px-6 rounded-full transition-colors text-sm">Get a Free Assessment</Link>
              <Link prefetch={false} href="/tools/denial-code-lookup" className="border border-white/40 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-full transition-colors text-sm inline-flex items-center">
                Look up a denial code <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
