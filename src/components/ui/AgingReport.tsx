'use client';

import type { AgingMetrics } from '@/lib/agingAnalysis';
import {
  Activity, Layers, ShieldAlert, Building2, Target, Wrench, AlertTriangle,
} from 'lucide-react';

const usd = (n: number) => '$' + Math.round(n).toLocaleString();
const pct = (n: number) => `${n.toFixed(n < 10 ? 1 : 0)}%`;

function EstBadge() {
  return (
    <span className="ml-1.5 align-middle inline-block text-[9px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 border border-amber-200 rounded px-1 py-0.5">
      est.
    </span>
  );
}

const BUCKET_ROWS: { key: keyof AgingMetrics['buckets']; label: string; rec: number; risk: number; unc: number }[] = [
  { key: 'b30', label: '0–30 Days', rec: 0.04, risk: 0, unc: 0 },
  { key: 'b60', label: '31–60 Days', rec: 0.15, risk: 0, unc: 0 },
  { key: 'b90', label: '61–90 Days', rec: 0.28, risk: 0.40, unc: 0.10 },
  { key: 'b120', label: '91–120 Days', rec: 0.35, risk: 0.60, unc: 0.25 },
  { key: 'bOv', label: '120+ Days', rec: 0.45, risk: 0.85, unc: 0.50 },
];

function SectionTitle({ icon, n, title }: { icon: React.ReactNode; n: number; title: string }) {
  return (
    <div className="flex items-center gap-2 mt-8 mb-3">
      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-teal/10 text-teal">{icon}</span>
      <h3 className="text-sm font-bold text-teal uppercase tracking-wide">{n}. {title}</h3>
    </div>
  );
}

export default function AgingReport({ m }: { m: AgingMetrics }) {
  const est = (k: string) => m.estimatedFields.includes(k);
  const total = m.totalAR || 1;

  return (
    <div className="mt-2">
      {/* data provenance line */}
      <div className="rounded-lg bg-cream border border-gray/10 px-4 py-3 text-xs text-gray mb-2">
        {m.source === 'upload'
          ? <>Computed from your uploaded aging report{m.fileName ? ` (${m.fileName})` : ''} — <strong className="text-navy">{m.rowCount.toLocaleString()}</strong> claim lines parsed in your browser. No patient data left your device; only de-identified totals were used.</>
          : <>Computed from the figures you entered. Upload your aging report for payer-level detail.</>}
        {' '}Items marked <EstBadge /> are specialty benchmarks, confirmed against your live data during intake.
      </div>

      {/* 1. KPIs */}
      <SectionTitle icon={<Activity className="h-4 w-4" />} n={1} title="Key Performance Indicators" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 bg-white border border-gray/15">
          <p className="text-xs text-gray mb-1">Days in A/R (DAR)</p>
          <p className="text-2xl font-bold text-navy">{m.dar} <span className="text-sm font-semibold text-gray">days</span></p>
          <p className="text-[11px] text-gray mt-1">Avg. age of outstanding A/R. Best-practice ≤ 35 days.</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray/15">
          <p className="text-xs text-gray mb-1">Clean Claim Rate (CCR){est('ccr') && <EstBadge />}</p>
          <p className="text-2xl font-bold text-navy">{pct(m.ccr)}</p>
          <p className="text-[11px] text-gray mt-1">First-pass acceptance. Target 95%+.</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray/15">
          <p className="text-xs text-gray mb-1">Collection Efficiency (CER){est('cer') && <EstBadge />}</p>
          <p className="text-2xl font-bold text-navy">{pct(m.cer)}</p>
          <p className="text-[11px] text-gray mt-1">Cash collected vs. allowable. Target 96%+.</p>
        </div>
      </div>

      {/* 2. Aging Analysis */}
      <SectionTitle icon={<Layers className="h-4 w-4" />} n={2} title="Aging Analysis by Bucket" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-gray border-b border-gray/20">
              <th className="py-2 pr-3 font-semibold">Aging Bucket</th>
              <th className="py-2 px-3 font-semibold text-right">Balance</th>
              <th className="py-2 px-3 font-semibold text-right">% of A/R</th>
              <th className="py-2 px-3 font-semibold text-right">At Risk</th>
              <th className="py-2 px-3 font-semibold text-right">Uncollectible</th>
              <th className="py-2 pl-3 font-semibold text-right">Recoverable</th>
            </tr>
          </thead>
          <tbody>
            {BUCKET_ROWS.map((r) => {
              const bal = m.buckets[r.key];
              return (
                <tr key={r.key} className="border-b border-gray/10">
                  <td className="py-2 pr-3 text-navy font-medium">{r.label}</td>
                  <td className="py-2 px-3 text-right text-navy">{usd(bal)}</td>
                  <td className="py-2 px-3 text-right text-gray">{((bal / total) * 100).toFixed(0)}%</td>
                  <td className="py-2 px-3 text-right text-red-600">{r.risk ? usd(bal * r.risk) : '—'}</td>
                  <td className="py-2 px-3 text-right text-red-500">{r.unc ? usd(bal * r.unc) : '—'}</td>
                  <td className="py-2 pl-3 text-right text-teal">{usd(bal * r.rec)}</td>
                </tr>
              );
            })}
            <tr className="font-bold text-navy">
              <td className="py-2.5 pr-3">Total</td>
              <td className="py-2.5 px-3 text-right">{usd(m.totalAR)}</td>
              <td className="py-2.5 px-3 text-right">100%</td>
              <td className="py-2.5 px-3 text-right text-red-600">{usd(m.atRisk)}</td>
              <td className="py-2.5 px-3 text-right text-red-500">{usd(m.uncollectible)}</td>
              <td className="py-2.5 pl-3 text-right text-teal">{usd(m.recoverable)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg p-3">
        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-navy"><strong>{usd(m.uncollectible)}</strong> is statistically unlikely to be recovered without intervention — concentrated in your <strong>{pct(m.over90Pct)}</strong> of A/R aged past 90 days.</p>
      </div>

      {/* 3. Denial Management */}
      <SectionTitle icon={<ShieldAlert className="h-4 w-4" />} n={3} title="Denial Management Breakdown" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
        <div className="rounded-xl p-4 bg-white border border-gray/15">
          <p className="text-xs text-gray mb-1">Denial Rate{est('denialRate') && <EstBadge />}</p>
          <p className="text-2xl font-bold text-red-600">{pct(m.denialRate)}</p>
          <p className="text-[11px] text-gray mt-1">≈ {usd(m.deniedValue)} in denied charges annually.</p>
        </div>
        <div className="rounded-xl p-4 bg-white border border-gray/15">
          <p className="text-xs text-gray mb-1">Write-Offs{est('writeOff') && <EstBadge />}</p>
          <p className="text-2xl font-bold text-red-600">{pct(m.writeOffPct)}</p>
          <p className="text-[11px] text-gray mt-1">≈ {usd(m.writeOffValue)} formally written off — much of it avoidable.</p>
        </div>
      </div>
      <p className="text-xs font-semibold text-navy mb-2">Estimated denial value by root cause</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-gray border-b border-gray/20">
              <th className="py-2 pr-3 font-semibold">Root Cause</th>
              <th className="py-2 px-3 font-semibold text-right">Share</th>
              <th className="py-2 pl-3 font-semibold text-right">Est. Value</th>
            </tr>
          </thead>
          <tbody>
            {m.denialReasons.map((d) => (
              <tr key={d.reason} className="border-b border-gray/10">
                <td className="py-2 pr-3 text-navy">{d.reason}</td>
                <td className="py-2 px-3 text-right text-gray">{d.pct}%</td>
                <td className="py-2 pl-3 text-right text-red-600">{usd(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Payer & Financial Performance */}
      <SectionTitle icon={<Building2 className="h-4 w-4" />} n={4} title="Payer & Financial Performance" />
      {m.payers.length > 0 ? (
        <>
          <p className="text-xs font-semibold text-navy mb-2">Top payer bottlenecks (by outstanding balance)</p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-gray border-b border-gray/20">
                  <th className="py-2 pr-3 font-semibold">Payer</th>
                  <th className="py-2 px-3 font-semibold text-right">Outstanding</th>
                  <th className="py-2 px-3 font-semibold text-right">% of A/R</th>
                  <th className="py-2 pl-3 font-semibold text-right">% Aged 90+</th>
                </tr>
              </thead>
              <tbody>
                {m.payers.map((p) => (
                  <tr key={p.name} className="border-b border-gray/10">
                    <td className="py-2 pr-3 text-navy font-medium">{p.name}</td>
                    <td className="py-2 px-3 text-right text-navy">{usd(p.balance)}</td>
                    <td className="py-2 px-3 text-right text-gray">{p.pct.toFixed(0)}%</td>
                    <td className={`py-2 pl-3 text-right font-semibold ${p.over90Pct >= 25 ? 'text-red-600' : 'text-gray'}`}>{p.over90Pct.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray mb-4">Upload your aging report to see a payer-by-payer bottleneck breakdown.</p>
      )}
      <p className="text-xs font-semibold text-navy mb-2">Patient responsibility gap</p>
      <div className="flex h-8 w-full rounded-lg overflow-hidden border border-gray/15 text-[11px] font-semibold text-white">
        <div className="bg-navy flex items-center justify-center" style={{ width: `${Math.max(6, 100 - m.patientRespPct)}%` }} title="Payer responsibility">
          Payer {pct(100 - m.patientRespPct)}
        </div>
        <div className="bg-teal flex items-center justify-center" style={{ width: `${Math.max(6, m.patientRespPct)}%` }} title="Patient responsibility">
          Patient {pct(m.patientRespPct)}
        </div>
      </div>
      <p className="text-[11px] text-gray mt-1">{usd(m.payerRespValue)} owed by payers · {usd(m.patientRespValue)} owed directly by patients{est('patientResp') && <EstBadge />}.</p>

      {/* 5. Bridging & Action Plan */}
      <SectionTitle icon={<Target className="h-4 w-4" />} n={5} title="Bridging & Action Plan" />
      <p className="text-xs font-semibold text-navy mb-2">Target closures — where the business needs to be</p>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-gray border-b border-gray/20">
              <th className="py-2 pr-3 font-semibold">Goal</th>
              <th className="py-2 px-3 font-semibold text-right">Now</th>
              <th className="py-2 px-3 font-semibold text-right">Target</th>
              <th className="py-2 pl-3 font-semibold text-right">Cash Impact</th>
            </tr>
          </thead>
          <tbody>
            {m.targets.map((t) => (
              <tr key={t.label} className="border-b border-gray/10">
                <td className="py-2 pr-3 text-navy">{t.label}</td>
                <td className="py-2 px-3 text-right text-gray">{t.current}</td>
                <td className="py-2 px-3 text-right text-teal font-semibold">{t.target}</td>
                <td className="py-2 pl-3 text-right text-teal">{t.impact > 0 ? usd(t.impact) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs font-semibold text-navy mb-2">Staff assignments & timeframes</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-gray border-b border-gray/20">
              <th className="py-2 pr-3 font-semibold">Focus Area</th>
              <th className="py-2 px-3 font-semibold">Assigned To</th>
              <th className="py-2 pl-3 font-semibold text-right">Target Resolution</th>
            </tr>
          </thead>
          <tbody>
            {m.assignments.map((a) => (
              <tr key={a.focus} className="border-b border-gray/10">
                <td className="py-2 pr-3 text-navy">{a.focus}</td>
                <td className="py-2 px-3 text-teal font-medium">{a.owner}</td>
                <td className="py-2 pl-3 text-right text-gray">{a.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. Aethera solution */}
      <SectionTitle icon={<Wrench className="h-4 w-4" />} n={6} title="How Aethera Fixes Your Revenue" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {m.solutions.map((s) => (
          <div key={s.service} className="rounded-xl p-4 bg-navy text-white">
            <p className="text-[11px] text-red-300 font-semibold mb-1">Issue: {s.problem}</p>
            <p className="font-bold text-mint mb-1">{s.service}</p>
            <p className="text-xs text-cream/80">{s.how}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
