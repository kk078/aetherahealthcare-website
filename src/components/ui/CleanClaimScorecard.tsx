'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ClipboardCheck, Mail, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';
import { submitToWorker } from '@/lib/worker';

interface Item {
  id: string;
  group: string;
  text: string;
  weight: number; // relative importance
  /** the denial(s) this control prevents — shown when unchecked */
  risk: string;
}

const ITEMS: Item[] = [
  { id: 'elig', group: 'Front-end', weight: 3, text: 'Eligibility & benefits verified for the date of service', risk: 'CARC 27 (coverage terminated), 96 (non-covered)' },
  { id: 'auth', group: 'Front-end', weight: 3, text: 'Prior authorization obtained and number on file when required', risk: 'CARC 197 (auth absent)' },
  { id: 'demo', group: 'Front-end', weight: 2, text: 'Patient demographics & subscriber/member ID confirmed', risk: 'CARC 16 (lacks information)' },
  { id: 'cob', group: 'Front-end', weight: 2, text: 'Primary vs secondary payer (COB) order confirmed', risk: 'CARC 109 / 23 (wrong payer, COB)' },
  { id: 'cred', group: 'Front-end', weight: 2, text: 'Rendering provider credentialed & effective with the payer', risk: 'CARC B7 (provider not eligible)' },

  { id: 'spec', group: 'Coding', weight: 3, text: 'Most-specific ICD-10 supported by the documentation', risk: 'CARC 50 / 11 (medical necessity, dx mismatch)' },
  { id: 'link', group: 'Coding', weight: 2, text: 'Every CPT linked to a supporting diagnosis pointer', risk: 'CARC 11 / 16 (linkage, missing pointer)' },
  { id: 'mod', group: 'Coding', weight: 2, text: 'Required modifiers applied; conflicting ones removed', risk: 'CARC 4 (modifier missing/inconsistent)' },
  { id: 'ncci', group: 'Coding', weight: 2, text: 'NCCI PTP edits run; unbundling only with documentation', risk: 'CARC 97 (bundled)' },
  { id: 'mue', group: 'Coding', weight: 1, text: 'Units within MUE / frequency limits', risk: 'CARC 151 (too many services)' },

  { id: 'scrub', group: 'Submission', weight: 3, text: 'Claim scrubbed — NPIs, units, all required loops/segments complete', risk: 'CARC 16 (lacks information)' },
  { id: 'dup', group: 'Submission', weight: 1, text: 'Claim history checked for duplicates before sending', risk: 'CARC 18 (duplicate)' },
  { id: 'tfl', group: 'Submission', weight: 2, text: 'Submitted within the payer timely-filing window', risk: 'CARC 29 (timely filing)' },
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
                    <span className={`block text-sm leading-snug ${checked[i.id] ? 'text-gray line-through' : 'text-slate-700'}`}>{i.text}</span>
                    {!checked[i.id] && (
                      <span className="block text-[11px] text-amber-700 mt-0.5">Prevents {i.risk}</span>
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
              <ul className="space-y-1.5 max-h-44 overflow-y-auto">
                {gaps.map(gp => (
                  <li key={gp.id} className="text-xs text-gray leading-snug">• {gp.text}</li>
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
  );
}
