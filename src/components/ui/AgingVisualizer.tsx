'use client';

import { useMemo } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export interface AgingBuckets {
  b30: number;
  b60: number;
  b90: number;
  b120: number;
  bOv: number;
}

interface AgingVisualizerProps {
  buckets: AgingBuckets;
  total?: number;
  compact?: boolean;
}

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
const pct = (n: number) => `${Math.round(n)}%`;

export default function AgingVisualizer({ buckets, total: inputTotal, compact = false }: AgingVisualizerProps) {
  const { items, status } = useMemo(() => {
    const computedTotal = inputTotal || (buckets.b30 + buckets.b60 + buckets.b90 + buckets.b120 + buckets.bOv) || 1;
    
    const items = [
      { key: 'b30', label: '0–30d', longLabel: '0–30 Days (Current)', val: buckets.b30, pct: (buckets.b30 / computedTotal) * 100, color: 'bg-emerald-500', text: 'text-emerald-700', bgLight: 'bg-emerald-50', border: 'border-emerald-200' },
      { key: 'b60', label: '31–60d', longLabel: '31–60 Days (In-Flight)', val: buckets.b60, pct: (buckets.b60 / computedTotal) * 100, color: 'bg-teal-500', text: 'text-teal-700', bgLight: 'bg-teal-50', border: 'border-teal-200' },
      { key: 'b90', label: '61–90d', longLabel: '61–90 Days (Warning)', val: buckets.b90, pct: (buckets.b90 / computedTotal) * 100, color: 'bg-amber-500', text: 'text-amber-700', bgLight: 'bg-amber-50', border: 'border-amber-200' },
      { key: 'b120', label: '91–120d', longLabel: '91–120 Days (At Risk)', val: buckets.b120, pct: (buckets.b120 / computedTotal) * 100, color: 'bg-orange-500', text: 'text-orange-700', bgLight: 'bg-orange-50', border: 'border-orange-200' },
      { key: 'bOv', label: '120+d', longLabel: '120+ Days (Critical)', val: buckets.bOv, pct: (buckets.bOv / computedTotal) * 100, color: 'bg-rose-500', text: 'text-rose-700', bgLight: 'bg-rose-50', border: 'border-rose-200' },
    ];

    const over90 = buckets.b120 + buckets.bOv;
    const over90Pct = (over90 / computedTotal) * 100;

    let status: { label: string; detail: string; badgeCls: string; icon: 'check' | 'warning' | 'alert' } = {
      label: 'Healthy Aging Distribution',
      detail: `Over-90-day A/R is ${pct(over90Pct)} (within MGMA best-practice target <15%)`,
      badgeCls: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: 'check',
    };

    if (over90Pct > 20) {
      status = {
        label: 'Critical Revenue Risk',
        detail: `Over-90-day A/R is ${pct(over90Pct)} — ${Math.round(over90Pct - 15)}% above the 15% MGMA ceiling. High write-off threat.`,
        badgeCls: 'bg-rose-50 border-rose-200 text-rose-800',
        icon: 'alert',
      };
    } else if (over90Pct > 15) {
      status = {
        label: 'Elevated Aging Warning',
        detail: `Over-90-day A/R is ${pct(over90Pct)} — exceeds the 15% industry standard. Timely filing risk begins at 90d.`,
        badgeCls: 'bg-amber-50 border-amber-200 text-amber-800',
        icon: 'warning',
      };
    }

    return { items, status };
  }, [buckets, inputTotal]);

  return (
    <div className="w-full space-y-3">
      {/* Benchmark status pill */}
      {!compact && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${status.badgeCls}`}>
          {status.icon === 'check' && <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />}
          {status.icon === 'warning' && <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />}
          {status.icon === 'alert' && <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />}
          <div className="flex-1 leading-tight">
            <span className="font-bold mr-1.5">{status.label}:</span>
            <span>{status.detail}</span>
          </div>
        </div>
      )}

      {/* Horizontal Stacked Bar */}
      <div className="relative w-full h-8 bg-gray/10 rounded-xl overflow-hidden flex shadow-inner border border-gray/10">
        {items.map((it) => {
          if (it.pct <= 0) return null;
          return (
            <div
              key={it.key}
              style={{ width: `${Math.max(1, it.pct)}%` }}
              className={`${it.color} h-full transition-all duration-300 relative group flex items-center justify-center`}
              title={`${it.longLabel}: ${fmt(it.val)} (${pct(it.pct)})`}
            >
              {it.pct >= 11 && (
                <span className="text-[11px] font-bold text-white tracking-tight drop-shadow-sm select-none">
                  {pct(it.pct)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
        {items.map((it) => (
          <div
            key={it.key}
            className={`p-2 rounded-lg border ${it.border} ${it.bgLight} flex flex-col justify-between`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${it.color} shrink-0`} />
              <span className="font-semibold text-navy truncate">{it.label}</span>
            </div>
            <div>
              <p className="font-bold text-navy text-sm">{fmt(it.val)}</p>
              <p className={`text-[10px] font-medium ${it.text}`}>{pct(it.pct)} of total</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
