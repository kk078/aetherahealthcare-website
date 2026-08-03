'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Search, ChevronDown, Mail, CheckCircle2, ShieldAlert, Star } from 'lucide-react';
import { submitToWorker } from '@/lib/worker';
import {
  type DenialCode,
  type DenialDifficulty,
  type ReferenceCode,
  DIFFICULTY_LABEL,
} from '@/lib/denialCodes';

const DIFFICULTY_STYLE: Record<DenialDifficulty, string> = {
  correctable: 'bg-mint/20 text-teal border-mint/40',
  preventable: 'bg-amber-50 text-amber-700 border-amber-200',
  hard: 'bg-red-50 text-red-600 border-red-200',
};

type Mode = 'all' | 'guided' | 'CARC' | 'RARC';

function matchGuided(d: DenialCode, terms: string[]): boolean {
  if (!terms.length) return true;
  const hay = `${d.code} ${d.label} ${d.rarc} ${d.category} ${d.aliases.join(' ')}`.toLowerCase();
  return terms.every(t => hay.includes(t));
}
function matchRef(r: ReferenceCode, terms: string[]): boolean {
  if (!terms.length) return true;
  const hay = `${r.type} ${r.code} ${r.description}`.toLowerCase();
  return terms.every(t => hay.includes(t));
}

export default function DenialCodeLookup({
  codes,
  reference,
}: {
  codes: DenialCode[];
  categories?: string[];
  reference: ReferenceCode[];
}) {
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<Mode>('all');
  const [openCode, setOpenCode] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const terms = useMemo(() => q.toLowerCase().split(/\s+/).filter(Boolean), [q]);

  // Curated top-denial codes are all CARCs, so they belong in the CARC tab too
  // (the CARC tab count already includes them).
  const guided = useMemo(
    () => (mode === 'all' || mode === 'guided' || mode === 'CARC' ? codes.filter(d => matchGuided(d, terms)) : []),
    [codes, terms, mode]
  );
  const refs = useMemo(() => {
    if (mode === 'guided') return [];
    return reference.filter(r => (mode === 'all' || r.type === mode) && matchRef(r, terms));
  }, [reference, terms, mode]);

  const total = guided.length + refs.length;
  const carcCount = useMemo(() => reference.filter(r => r.type === 'CARC').length, [reference]);
  const rarcCount = useMemo(() => reference.filter(r => r.type === 'RARC').length, [reference]);

  async function handleLead(e: FormEvent) {
    e.preventDefault();
    if (!email || leadStatus === 'sending') return;
    setLeadStatus('sending');
    await submitToWorker('denial_guide', {
      email,
      message: 'Requested the full CARC/RARC denial playbook from the free denial-code lookup tool.',
    });
    setLeadStatus('sent');
  }

  const tabs: { key: Mode; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: codes.length + reference.length },
    { key: 'guided', label: 'Top denials', count: codes.length },
    { key: 'CARC', label: 'CARC', count: codes.length + carcCount },
    { key: 'RARC', label: 'RARC', count: rarcCount },
  ];

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="h-5 w-5 text-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search a code or reason — e.g. 16, N290, timely filing, modifier, auth…"
          aria-label="Search denial codes"
          className="w-full border border-gray/30 rounded-xl pl-11 pr-4 py-3 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal"
        />
      </div>

      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setMode(t.key); setOpenCode(null); }}
            className={`text-sm rounded-full px-3.5 py-1.5 border transition-colors ${
              mode === t.key ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-gray/30 hover:border-teal'
            }`}
          >
            {t.label} <span className={mode === t.key ? 'text-white/70' : 'text-gray'}>({t.count})</span>
          </button>
        ))}
      </div>

      <p className="text-sm text-gray mb-4">
        Showing {total} {total === 1 ? 'code' : 'codes'}
        {q ? ` matching “${q}”` : ''}.
      </p>

      {/* Guided (curated, rich) */}
      {guided.length > 0 && (
        <div className="space-y-3 mb-3">
          {guided.map(d => {
            const open = openCode === `g-${d.code}`;
            return (
              <div key={`g-${d.code}`} className="border border-teal/30 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setOpenCode(open ? null : `g-${d.code}`)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-cream/50 transition-colors"
                  aria-expanded={open}
                >
                  <span className="shrink-0 inline-flex items-center justify-center min-w-[3.5rem] h-9 px-2 rounded-lg bg-navy text-white font-bold text-sm">
                    {d.code}
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center gap-1.5 text-navy font-semibold text-sm leading-snug">
                      <Star className="h-3.5 w-3.5 text-amber-500 shrink-0" fill="currentColor" />{d.label}
                    </span>
                    <span className="block text-xs text-gray mt-0.5">CARC · {d.category}{d.rarc ? ` · RARC ${d.rarc}` : ''}</span>
                  </span>
                  <span className={`shrink-0 hidden sm:inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border ${DIFFICULTY_STYLE[d.difficulty]}`}>
                    {DIFFICULTY_LABEL[d.difficulty]}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-gray shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="px-4 pb-5 pt-1 border-t border-gray/10 space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray uppercase tracking-widest mb-1">Why it happens</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{d.rootCause}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-teal uppercase tracking-widest mb-1">How to work it</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{d.workIt}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">How to prevent it</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{d.prevent}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reference (full CARC/RARC list — same expandable card format) */}
      {refs.length > 0 && (
        <div className="space-y-3">
          {refs.map(r => {
            const key = `r-${r.type}-${r.code}`;
            const open = openCode === key;
            return (
              <div key={key} className="border border-gray/20 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setOpenCode(open ? null : key)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-cream/50 transition-colors"
                  aria-expanded={open}
                >
                  <span className="shrink-0 inline-flex items-center justify-center min-w-[3.5rem] h-9 px-2 rounded-lg bg-navy text-white font-bold text-sm">
                    {r.code}
                  </span>
                  <span className="flex-1">
                    <span className="block text-navy font-semibold text-sm leading-snug">{r.description}</span>
                    <span className="block text-xs text-gray mt-0.5">{r.type} · {r.category}</span>
                  </span>
                  {r.type === 'CARC' && r.difficulty ? (
                    <span className={`shrink-0 hidden sm:inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border ${DIFFICULTY_STYLE[r.difficulty]}`}>
                      {DIFFICULTY_LABEL[r.difficulty]}
                    </span>
                  ) : (
                    <span className="shrink-0 hidden sm:inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-teal/10 text-teal border-teal/20">
                      Remark code
                    </span>
                  )}
                  <ChevronDown className={`h-5 w-5 text-gray shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="px-4 pb-5 pt-1 border-t border-gray/10 space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray uppercase tracking-widest mb-1">What it means</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{r.description}</p>
                    </div>
                    {r.type === 'CARC' ? (
                      <>
                        <div>
                          <p className="text-xs font-bold text-teal uppercase tracking-widest mb-1">How to work it</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{r.workIt}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-navy uppercase tracking-widest mb-1">How to prevent it</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{r.prevent}</p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-teal uppercase tracking-widest mb-1">How to handle it</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{r.handle}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-12 text-gray">
          <ShieldAlert className="h-8 w-8 mx-auto mb-3 text-gray/50" />
          <p className="text-sm">No codes match &ldquo;{q}&rdquo;. Try a code number (e.g. 16 or N290) or a keyword like &ldquo;auth&rdquo; or &ldquo;modifier&rdquo;.</p>
        </div>
      )}

      {/* Lead capture */}
      <div className="mt-10 bg-navy rounded-2xl p-6 md:p-8 text-white">
        {leadStatus === 'sent' ? (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-mint shrink-0 mt-0.5" />
            <div>
              <p className="text-mint font-semibold">Check your inbox.</p>
              <p className="text-sm text-gray mt-1">We&apos;ll send the full denial playbook and our team can review your top denial reasons for free.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLead} className="md:flex md:items-center md:justify-between gap-6">
            <div className="mb-4 md:mb-0">
              <p className="text-lg font-bold flex items-center"><Mail className="h-5 w-5 mr-2 text-mint" />Get the full denial playbook</p>
              <p className="text-sm text-gray mt-1 max-w-md">The complete work-it + prevention guide for the top CARC/RARC denials, plus a free review of your practice&apos;s denial mix.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:shrink-0">
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@practice.com" aria-label="Work email"
                className="rounded-lg px-4 py-2.5 text-navy bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mint sm:w-60"
              />
              <button
                type="submit" disabled={leadStatus === 'sending'}
                className="bg-mint hover:bg-white text-navy font-bold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {leadStatus === 'sending' ? 'Sending…' : 'Send me the playbook'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
