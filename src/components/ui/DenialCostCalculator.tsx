'use client';

import { useMemo, useState } from 'react';
import { TrendingDown, RefreshCw } from 'lucide-react';

const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

function Field({ label, value, onChange, prefix, suffix }: { label: string; value: number; onChange: (n: number) => void; prefix?: string; suffix?: string }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-semibold text-navy mb-1.5">{label}</span>
      <span className="flex items-center border border-gray/30 rounded-xl bg-white focus-within:ring-2 focus-within:ring-teal overflow-hidden">
        {prefix && <span className="pl-3.5 text-gray text-sm">{prefix}</span>}
        <input type="number" min={0} value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-full px-3 py-2.5 text-navy bg-transparent focus:outline-none" />
        {suffix && <span className="pr-3.5 text-gray text-sm whitespace-nowrap">{suffix}</span>}
      </span>
    </label>
  );
}

function ResultRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-white/10 last:border-0">
      <span className="text-cream/80 text-sm">{k}</span>
      <span className="font-jakarta font-extrabold text-white text-xl">{v}</span>
    </div>
  );
}

export default function DenialCostCalculator() {
  // Revenue lost to denials
  const [denials, setDenials] = useState(1000);
  const [avgReimb, setAvgReimb] = useState(250);
  // Rework
  const [deniedPerPhys, setDeniedPerPhys] = useState(1000);
  const [reworkCost, setReworkCost] = useState(25.2);
  const [physicians, setPhysicians] = useState(1);

  const loss = useMemo(() => {
    const year = denials * avgReimb;
    return { year, month: year / 12, week: year / 52 };
  }, [denials, avgReimb]);

  const rework = useMemo(() => {
    const year = deniedPerPhys * reworkCost * physicians;
    return { year, month: year / 12, week: year / 52 };
  }, [deniedPerPhys, reworkCost, physicians]);

  const combined = loss.year + rework.year;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue lost */}
        <div className="bg-white rounded-2xl border border-gray/15 p-6 shadow-sm">
          <h2 className="font-jakarta text-lg font-bold text-navy mb-1 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" /> Revenue lost to denials
          </h2>
          <p className="text-sm text-gray mb-5">Reimbursement you never collect when denials aren’t worked to resolution.</p>
          <Field label="Denied claims per year" value={denials} onChange={setDenials} />
          <Field label="Average reimbursement per claim" value={avgReimb} onChange={setAvgReimb} prefix="$" />
          <div className="mt-5 bg-navy rounded-xl p-5">
            <p className="text-xs font-bold tracking-widest text-cream/60 uppercase mb-2">Your revenue loss</p>
            <ResultRow k="Per week" v={money(loss.week)} />
            <ResultRow k="Per month" v={money(loss.month)} />
            <ResultRow k="Per year" v={money(loss.year)} />
          </div>
        </div>

        {/* Rework */}
        <div className="bg-white rounded-2xl border border-gray/15 p-6 shadow-sm">
          <h2 className="font-jakarta text-lg font-bold text-navy mb-1 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-amber-500" /> Cost of reworking claims
          </h2>
          <p className="text-sm text-gray mb-5">Staff time and overhead spent chasing and resubmitting denied claims.</p>
          <Field label="Denied claims per physician / year" value={deniedPerPhys} onChange={setDeniedPerPhys} />
          <Field label="Cost to rework one claim" value={reworkCost} onChange={setReworkCost} prefix="$" />
          <Field label="Physicians in your practice" value={physicians} onChange={setPhysicians} />
          <div className="mt-5 bg-navy rounded-xl p-5">
            <p className="text-xs font-bold tracking-widest text-cream/60 uppercase mb-2">Your rework cost</p>
            <ResultRow k="Per week" v={money(rework.week)} />
            <ResultRow k="Per month" v={money(rework.month)} />
            <ResultRow k="Per year" v={money(rework.year)} />
          </div>
        </div>
      </div>

      {/* Combined */}
      <div className="bg-gradient-to-br from-ink to-navy rounded-2xl p-6 md:p-8 text-white text-center">
        <p className="text-xs font-bold tracking-[0.14em] text-cream/70 uppercase mb-2">Combined annual impact of denials</p>
        <p className="font-jakarta text-4xl md:text-5xl font-extrabold">{money(combined)}<span className="text-lg font-bold text-cream/70">/year</span></p>
        <p className="text-sm text-cream/70 mt-3 max-w-2xl mx-auto">
          Lost reimbursement plus rework cost. Cutting your denial rate and working denials to resolution recovers most of it.
          Rework benchmark (~$25/claim) per MGMA. Estimation only.
        </p>
      </div>
    </div>
  );
}
