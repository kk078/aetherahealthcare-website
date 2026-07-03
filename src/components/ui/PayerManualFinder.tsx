'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Search, BookOpen, FileText, ClipboardCheck, BadgeCheck, ExternalLink, Globe } from 'lucide-react';
import { type PayerResource, type PayerResourceType, getPayerResources, payerResourceTypes, payerResourcesMeta } from '@/lib/payerResources';

const TYPE_STYLE: Record<PayerResourceType, string> = {
  'Commercial': 'bg-royal/10 text-royal border-royal/20',
  'Blue Cross': 'bg-royal/10 text-royal border-royal/20',
  'Medicare Advantage': 'bg-teal/10 text-teal border-teal/20',
  'Medicaid': 'bg-mint/15 text-teal border-mint/30',
  'Government': 'bg-navy/10 text-navy border-navy/20',
};

const RESOURCES: { key: keyof PayerResource; label: string; icon: React.ReactNode }[] = [
  { key: 'providerHome', label: 'Provider home', icon: <Globe className="h-3.5 w-3.5" /> },
  { key: 'providerManual', label: 'Provider manual', icon: <BookOpen className="h-3.5 w-3.5" /> },
  { key: 'policies', label: 'Medical / payment policies', icon: <FileText className="h-3.5 w-3.5" /> },
  { key: 'credentialing', label: 'Credentialing / enrollment', icon: <BadgeCheck className="h-3.5 w-3.5" /> },
  { key: 'eligibility', label: 'Eligibility verification', icon: <ClipboardCheck className="h-3.5 w-3.5" /> },
];

export default function PayerManualFinder() {
  const all = useMemo(() => getPayerResources(), []);
  const [q, setQ] = useState('');
  const [type, setType] = useState<'all' | PayerResourceType>('all');

  const terms = useMemo(() => q.toLowerCase().split(/\s+/).filter(Boolean), [q]);
  const results = useMemo(() => all.filter((p) => {
    if (type !== 'all' && p.type !== type) return false;
    if (!terms.length) return true;
    const hay = `${p.name} ${p.type}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  }), [all, terms, type]);

  const tabs: { key: 'all' | PayerResourceType; label: string }[] = [
    { key: 'all', label: 'All' },
    ...payerResourceTypes().map((t) => ({ key: t, label: t })),
  ];

  return (
    <div>
      <div className="relative mb-4">
        <Search className="h-5 w-5 text-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search a payer — e.g. Aetna, Florida Blue, UnitedHealthcare, Medicare…"
          aria-label="Search payers"
          className="w-full border border-gray/30 rounded-xl pl-11 pr-4 py-3 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal" />
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setType(t.key)}
            className={`text-sm rounded-full px-3.5 py-1.5 border transition-colors ${type === t.key ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-gray/30 hover:border-teal'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray mb-4">Showing {results.length} {results.length === 1 ? 'payer' : 'payers'}{q ? ` matching “${q}”` : ''}.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {results.map((p) => (
          <div key={p.slug} className="bg-white rounded-2xl border border-gray/15 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-jakarta font-bold text-navy text-base leading-snug">{p.name}</h3>
              <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${TYPE_STYLE[p.type]}`}>{p.type}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {RESOURCES.map((r) => {
                const href = p[r.key] as string | null;
                if (!href) return null;
                return (
                  <a key={r.label} href={href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy bg-cream hover:bg-teal hover:text-white border border-gray/20 rounded-lg px-2.5 py-1.5 transition-colors">
                    {r.icon} {r.label} <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                );
              })}
            </div>
            {p.notes && <p className="text-xs text-gray mt-3 leading-relaxed">{p.notes}</p>}
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-12 text-gray text-sm">No payers match &ldquo;{q}&rdquo;. Try a shorter name or a different category.</div>
      )}

      <p className="text-xs text-gray mt-6">Links open each payer’s official website. Payers change URLs often — confirm before relying. Last updated {payerResourcesMeta.updated}.</p>
    </div>
  );
}
