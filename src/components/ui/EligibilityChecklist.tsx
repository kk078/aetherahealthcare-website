'use client';

import { useMemo, useState } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const ITEMS = [
  { id: 'active', label: 'Verified active coverage on the date of service', denial: 'CO-27 — coverage terminated / expired' },
  { id: 'network', label: 'Confirmed plan and in-network / out-of-network status', denial: 'CO-242 — services not provided by network provider' },
  { id: 'memberid', label: 'Captured correct member ID, group, and payer', denial: 'CO-31 — patient cannot be identified as insured' },
  { id: 'benefit', label: 'Confirmed the service/benefit is covered under the plan', denial: 'CO-96 — non-covered charges' },
  { id: 'auth', label: 'Obtained prior authorization where required', denial: 'CO-197 — precert / authorization absent' },
  { id: 'referral', label: 'Referral on file (if plan requires one)', denial: 'CO-183 / CO-197 — referral requirement not met' },
  { id: 'cob', label: 'Checked coordination of benefits / primary payer', denial: 'CO-22 — may be covered by another payer per COB' },
  { id: 'demographics', label: 'Verified patient demographics match the payer record', denial: 'CO-140 — patient/insured health ID number and name mismatch' },
  { id: 'necessity', label: 'Confirmed diagnosis supports medical necessity', denial: 'CO-50 — not deemed a medical necessity' },
  { id: 'filing', label: 'Noted the payer’s timely-filing limit for this claim', denial: 'CO-29 — time limit for filing has expired' },
];

export default function EligibilityChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  const done = ITEMS.filter((i) => checked[i.id]).length;
  const score = Math.round((done / ITEMS.length) * 100);
  const openRisks = useMemo(() => ITEMS.filter((i) => !checked[i.id]), [checked]);

  const band = score >= 90 ? { t: 'Denial-ready', c: 'text-emerald', bar: 'bg-emerald' }
    : score >= 60 ? { t: 'Some exposure', c: 'text-amber-600', bar: 'bg-amber-500' }
    : { t: 'High denial risk', c: 'text-red-600', bar: 'bg-red-500' };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Checklist */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray/15 p-6 shadow-sm">
        <h2 className="font-jakarta text-lg font-bold text-navy mb-4">Pre-visit verification checks</h2>
        <ul className="space-y-2.5">
          {ITEMS.map((i) => {
            const on = !!checked[i.id];
            return (
              <li key={i.id}>
                <button onClick={() => toggle(i.id)} className="w-full flex items-start gap-3 text-left p-3 rounded-xl border border-gray/15 hover:border-teal/50 transition-colors">
                  <span className={`mt-0.5 shrink-0 h-5 w-5 rounded-md border flex items-center justify-center ${on ? 'bg-emerald border-emerald text-white' : 'border-gray/40'}`}>
                    {on && <ShieldCheck className="h-3.5 w-3.5" />}
                  </span>
                  <span>
                    <span className={`block text-sm font-semibold ${on ? 'text-navy' : 'text-slate-700'}`}>{i.label}</span>
                    <span className="block text-xs text-gray mt-0.5">Prevents {i.denial}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Score */}
      <div className="lg:sticky lg:top-24 h-fit bg-navy rounded-2xl p-6 text-white shadow-sm">
        <p className="text-xs font-bold tracking-[0.14em] text-cream/70 uppercase mb-2">Eligibility readiness</p>
        <p className="font-jakarta text-5xl font-extrabold leading-none">{score}%</p>
        <p className={`mt-2 font-bold ${band.c}`}>{band.t}</p>
        <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden mt-4">
          <div className={`h-full rounded-full ${band.bar}`} style={{ width: `${score}%` }} />
        </div>
        <p className="text-sm text-cream/80 mt-3">{done} of {ITEMS.length} checks complete.</p>

        {openRisks.length > 0 && (
          <div className="mt-5 pt-5 border-t border-white/15">
            <p className="text-xs font-bold uppercase tracking-wider text-cream/70 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Open denial risks
            </p>
            <ul className="space-y-1.5">
              {openRisks.map((r) => (
                <li key={r.id} className="text-xs text-cream/80">{r.denial}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
