'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ClipboardCheck, Mail, CheckCircle2, ArrowRight, AlertTriangle, Printer, CheckSquare, RotateCcw } from 'lucide-react';
import { submitToWorker } from '@/lib/worker';

interface Item {
  id: string;
  group: string;
  text: string;
  weight: number; // relative importance
  /** the denial(s) this control prevents — shown when unchecked */
  risk: string;
  toolHref?: string;
  toolLabel?: string;
}

const ITEMS: Item[] = [
  { id: 'elig', group: 'Front-end', weight: 3, text: 'Eligibility & benefits verified for the date of service', risk: 'CARC 27 (coverage terminated), 96 (non-covered)', toolHref: '/services/eligibility-verification', toolLabel: 'Eligibility Verification' },
  { id: 'auth', group: 'Front-end', weight: 3, text: 'Prior authorization obtained and number on file when required', risk: 'CARC 197 (auth absent)', toolHref: '/tools/appeal-letter-generator', toolLabel: 'Auth Appeal Generator' },
  { id: 'demo', group: 'Front-end', weight: 2, text: 'Patient demographics & subscriber/member ID confirmed', risk: 'CARC 16 (lacks information)', toolHref: '/tools/era-835-decoder', toolLabel: 'ERA 835 Decoder' },
  { id: 'cob', group: 'Front-end', weight: 2, text: 'Primary vs secondary payer (COB) order confirmed', risk: 'CARC 109 / 23 (wrong payer, COB)', toolHref: '/tools/denial-code-lookup', toolLabel: 'Denial Lookup' },
  { id: 'cred', group: 'Front-end', weight: 2, text: 'Rendering provider credentialed & effective with the payer', risk: 'CARC B7 (provider not eligible)', toolHref: '/services/credentialing', toolLabel: 'Provider Credentialing' },

  { id: 'spec', group: 'Coding', weight: 3, text: 'Most-specific ICD-10 supported by the documentation', risk: 'CARC 50 / 11 (medical necessity, dx mismatch)', toolHref: '/tools/appeal-letter-generator', toolLabel: 'Appeal Generator' },
  { id: 'link', group: 'Coding', weight: 2, text: 'Every CPT linked to a supporting diagnosis pointer', risk: 'CARC 11 / 16 (linkage, missing pointer)', toolHref: '/tools/ncci-claim-scrubber', toolLabel: 'NCCI Scrubber' },
  { id: 'mod', group: 'Coding', weight: 2, text: 'Required modifiers applied; conflicting ones removed', risk: 'CARC 4 (modifier missing/inconsistent)', toolHref: '/tools/ncci-claim-scrubber', toolLabel: 'Modifier Validator' },
  { id: 'ncci', group: 'Coding', weight: 2, text: 'NCCI PTP edits run; unbundling only with documentation', risk: 'CARC 97 (bundled)', toolHref: '/tools/ncci-claim-scrubber', toolLabel: 'PTP Scrubber' },
  { id: 'mue', group: 'Coding', weight: 1, text: 'Units within MUE / frequency limits', risk: 'CARC 151 (too many services)', toolHref: '/tools/fee-schedule-benchmarker', toolLabel: 'Fee Benchmarker' },

  { id: 'scrub', group: 'Submission', weight: 3, text: 'Claim scrubbed — NPIs, units, all required loops/segments complete', risk: 'CARC 16 (lacks information)', toolHref: '/tools/era-835-decoder', toolLabel: '835 Decoder' },
  { id: 'dup', group: 'Submission', weight: 1, text: 'Claim history checked for duplicates before sending', risk: 'CARC 18 (duplicate)' },
  { id: 'tfl', group: 'Submission', weight: 2, text: 'Submitted within the payer timely-filing window', risk: 'CARC 29 (timely filing)', toolHref: '/tools/timely-filing-matrix', toolLabel: 'Timely Filing Matrix' },
  { id: 'ack', group: 'Submission', weight: 1, text: 'Clearinghouse acceptance / 277CA acknowledgment reviewed', risk: 'Silent rejections never reach the payer' },
];

const GROUPS = ['Front-end', 'Coding', 'Submission'];

export default function CleanClaimScorecard() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState('');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const totalWeight = useMemo(() => ITEMS.reduce((s, i) => s + i.weight, 0), []);
  const score = useMemo(() => {
    const got = ITEMS.reduce((s, i) => s + (checked[i.id] ? i.weight : 0), 0);
    return Math.round((got / totalWeight) * 100);
  }, [checked, totalWeight]);

  const gaps = useMemo(() => ITEMS.filter(i => !checked[i.id]), [checked]);

  const band = score >= 90
    ? { label: 'Strong', color: 'text-teal', bar: 'bg-teal' }
    : score >= 70
      ? { label: 'Needs work', color: 'text-amber-600', bar: 'bg-amber-500' }
      : { label: 'High denial risk', color: 'text-red-500', bar: 'bg-red-500' };

  function toggle(id: string) {
    setChecked(c => ({ ...c, [id]: !c[id] }));
  }

  function selectAll() {
    const all: Record<string, boolean> = {};
    ITEMS.forEach(i => { all[i.id] = true; });
    setChecked(all);
  }

  function resetAll() {
    setChecked({});
  }

  async function handleLead(e: FormEvent) {
    e.preventDefault();
    if (!email || leadStatus === 'sending') return;
    setLeadStatus('sending');
    await submitToWorker('scorecard_lead', {
      email,
      message:
        `Clean-claim scorecard lead — self-scored ${score}/100 (${band.label}). ` +
        `${gaps.length} gap(s): ${gaps.map(g => g.id).join(', ') || 'none'}. ` +
        'Requested a free clean-claim workflow review.',
    });
    setLeadStatus('sent');
  }

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar */}
      <div className="bg-white rounded-2xl border border-gray/15 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal/10 text-teal hover:bg-teal hover:text-white transition-colors"
          >
            <CheckSquare className="h-3.5 w-3.5" /> Check All 14 Controls
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray/10 text-gray hover:bg-navy hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray hover:text-navy border border-gray/20 hover:border-navy transition-colors"
        >
          <Printer className="h-3.5 w-3.5" /> Print / Save Scorecard PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Checklist */}
        <div className="lg:col-span-2 space-y-6">
          {GROUPS.map(g => (
            <div key={g} className="bg-white rounded-2xl border border-gray/15 p-6">
              <h3 className="text-sm font-bold text-navy uppercase tracking-widest mb-4 flex items-center">
                <ClipboardCheck className="h-4 w-4 mr-2 text-teal" />{g}
              </h3>
              <div className="space-y-2.5">
                {ITEMS.filter(i => i.group === g).map(i => (
                  <label
                    key={i.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-cream/60 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox" checked={!!checked[i.id]} onChange={() => toggle(i.id)}
                      className="mt-0.5 h-5 w-5 accent-teal shrink-0"
                    />
                    <span>
                      <span className={`block text-sm leading-snug ${checked[i.id] ? 'text-gray line-through' : 'text-slate-700 font-medium'}`}>{i.text}</span>
                      {!checked[i.id] && (
                        <span className="flex flex-wrap items-center gap-2 text-[11px] text-amber-700 mt-1">
                          <span>Prevents {i.risk}</span>
                          {i.toolHref && (
                            <Link
                              prefetch={false}
                              href={i.toolHref}
                              onClick={e => e.stopPropagation()}
                              className="text-teal hover:text-navy font-bold underline ml-1"
                            >
                              [{i.toolLabel} &rarr;]
                            </Link>
                          )}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Score panel */}
        <div className="lg:sticky lg:top-28">
          <div className="bg-navy rounded-2xl p-7 text-white">
            <p className="text-sm text-gray">Clean-claim readiness</p>
            <p className={`text-6xl font-bold ${band.color}`}>{score}<span className="text-2xl text-gray">/100</span></p>
            <p className={`text-sm font-semibold ${band.color} mb-4`}>{band.label}</p>
            <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden mb-5">
              <div className={`h-full ${band.bar} transition-all duration-300`} style={{ width: `${score}%` }} />
            </div>

            {gaps.length > 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-2 flex items-center">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />{gaps.length} open gap{gaps.length > 1 ? 's' : ''}
                </p>
                <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {gaps.map(gp => (
                    <li key={gp.id} className="text-xs text-cream/80 leading-snug pb-1 border-b border-white/5 last:border-0">
                      <p>&bull; {gp.text}</p>
                      {gp.toolHref && (
                        <Link
                          prefetch={false}
                          href={gp.toolHref}
                          className="text-[11px] text-mint hover:underline font-semibold block mt-0.5"
                        >
                          Resolve with {gp.toolLabel} &rarr;
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
          ) : (
            <div className="bg-mint/20 border border-mint/40 rounded-xl p-4 mb-5 flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-mint shrink-0" />
              <p className="text-sm text-mint">Every control checked — that&apos;s a clean-claim-ready workflow.</p>
            </div>
          )}

          {leadStatus === 'sent' ? (
            <div className="bg-mint/20 border border-mint/40 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-mint shrink-0 mt-0.5" />
              <div>
                <p className="text-mint font-semibold text-sm">Sent.</p>
                <p className="text-xs text-gray">We&apos;ll email your scorecard and a free workflow review.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLead} className="space-y-2">
              <p className="text-sm text-white font-semibold flex items-center"><Mail className="h-4 w-4 mr-2 text-mint" />Email me my scorecard</p>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@practice.com" aria-label="Work email"
                className="w-full rounded-lg px-4 py-2.5 text-navy bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mint"
              />
              <button
                type="submit" disabled={leadStatus === 'sending'}
                className="w-full bg-mint hover:bg-white text-navy font-bold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {leadStatus === 'sending' ? 'Sending…' : 'Email my results + free review'}
              </button>
            </form>
          )}

          <Link prefetch={false}
            href="/free-assessment"
            className="flex items-center justify-center w-full border border-white/20 hover:bg-white/10 text-white font-semibold py-2.5 px-5 rounded-full transition-colors mt-3 text-sm"
          >
            Get a Free Assessment <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
}
