'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Clock, Hash, ArrowRight, Building2 } from 'lucide-react';
import type { Payer } from '@/lib/payers';

export default function PayerDirectory({ payers, types }: { payers: Payer[]; types: string[] }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return payers.filter(p => {
      if (type && p.type !== type) return false;
      if (!needle) return true;
      const hay = [p.name, p.type, p.payerId || '', ...(p.aka || [])].join(' ').toLowerCase();
      return hay.includes(needle);
    });
  }, [payers, q, type]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search payer, subsidiary, or payer ID (e.g. Aetna, 87726, Evernorth)"
            aria-label="Search payers"
            className="w-full pl-11 pr-4 py-3 border border-gray/30 rounded-xl text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </div>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          aria-label="Filter by payer type"
          className="border border-gray/30 rounded-xl px-4 py-3 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal"
        >
          <option value="">All types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <p className="text-sm text-gray mb-4">{filtered.length} payer{filtered.length === 1 ? '' : 's'}</p>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <Link
            key={p.slug}
            href={`/payers/directory/${p.slug}`}
            className="group bg-white rounded-2xl border border-gray/15 p-5 hover:shadow-lg hover:border-teal/40 transition-all duration-200 flex flex-col"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-navy leading-tight truncate">{p.name}</h3>
                <span className="inline-block mt-1 text-[11px] font-semibold uppercase tracking-wide text-teal bg-teal/10 rounded px-2 py-0.5">{p.type}</span>
              </div>
              <Building2 className="h-5 w-5 text-gray/40 shrink-0" />
            </div>
            {p.aka && p.aka.length > 0 && (
              <p className="text-xs text-gray mt-2 truncate">Incl. {p.aka.slice(0, 4).join(', ')}</p>
            )}
            <div className="mt-3 pt-3 border-t border-gray/10 grid grid-cols-2 gap-2 text-xs text-gray">
              <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5 text-teal" /> {p.payerId || 'Varies'}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-teal" /> {p.timelyFiling ? shorten(p.timelyFiling) : 'Varies'}</span>
            </div>
            <div className="mt-3 flex items-center text-teal font-semibold text-sm group-hover:text-navy transition-colors">
              View details <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray">
          No payers match “{q}”. We&apos;re expanding the directory continuously — <Link href="/contact" className="text-teal font-semibold hover:underline">tell us which payer to add</Link>.
        </div>
      )}
    </div>
  );
}

function shorten(s: string) {
  return s.length > 28 ? s.slice(0, 26) + '…' : s;
}
