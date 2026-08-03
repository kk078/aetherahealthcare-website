'use client';

import { useMemo, useState } from 'react';
import { CalendarClock, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const PRESETS = [
  { label: 'Medicare (365 days)', days: 365 },
  { label: 'Medicaid — 95 days', days: 95 },
  { label: 'Commercial — 90 days', days: 90 },
  { label: 'Commercial — 180 days', days: 180 },
  { label: 'Commercial — 1 year', days: 365 },
];

const DAY = 86400000;
function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

export default function TimelyFilingCalculator() {
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const [dos, setDos] = useState(todayISO);
  const [days, setDays] = useState(90);

  const result = useMemo(() => {
    if (!dos) return null;
    const start = new Date(dos + 'T00:00:00');
    if (isNaN(start.getTime())) return null;
    // Add calendar days (not ms) so the deadline stays on the right date across DST transitions.
    const deadline = new Date(start);
    deadline.setDate(deadline.getDate() + days);
    const t0 = new Date(); t0.setHours(0, 0, 0, 0);
    const remaining = Math.round((deadline.getTime() - t0.getTime()) / DAY);
    let status: 'past' | 'urgent' | 'ok';
    if (remaining < 0) status = 'past';
    else if (remaining <= 14) status = 'urgent';
    else status = 'ok';
    return { deadline, remaining, status };
  }, [dos, days]);

  const styles = {
    past: { wrap: 'bg-red-50 border-red-200', pill: 'bg-red-600', icon: <AlertTriangle className="h-6 w-6 text-red-600" />, label: 'Past filing limit' },
    urgent: { wrap: 'bg-amber-50 border-amber-200', pill: 'bg-amber-600', icon: <Clock className="h-6 w-6 text-amber-600" />, label: 'File now — deadline near' },
    ok: { wrap: 'bg-mint/10 border-mint/40', pill: 'bg-emerald', icon: <CheckCircle2 className="h-6 w-6 text-emerald" />, label: 'Within filing window' },
  } as const;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-gray/15 p-6 shadow-sm">
        <h2 className="font-jakarta text-lg font-bold text-navy mb-5 flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-teal" /> Filing details
        </h2>

        <label className="block text-sm font-semibold text-navy mb-1.5">Date of service</label>
        <input type="date" value={dos} max={todayISO} onChange={(e) => setDos(e.target.value)}
          className="w-full border border-gray/30 rounded-xl px-3.5 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal mb-5" />

        <label className="block text-sm font-semibold text-navy mb-1.5">Payer filing limit</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => setDays(p.days)}
              className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${days === p.days ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-gray/30 hover:border-teal'}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input type="number" min={1} max={1095} value={days} onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))}
            className="w-24 border border-gray/30 rounded-xl px-3 py-2 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal" />
          <span className="text-sm text-gray">days from date of service</span>
        </div>
      </div>

      {/* Result */}
      <div className={`rounded-2xl border p-6 shadow-sm flex flex-col justify-center ${result ? styles[result.status].wrap : 'bg-white border-gray/15'}`}>
        {result ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              {styles[result.status].icon}
              <span className={`text-xs font-bold text-white uppercase tracking-wider px-2.5 py-1 rounded-full ${styles[result.status].pill}`}>
                {styles[result.status].label}
              </span>
            </div>
            <p className="text-sm text-gray mb-1">Submission deadline</p>
            <p className="font-jakarta text-2xl font-extrabold text-navy mb-4">{fmtDate(result.deadline)}</p>
            <p className="font-jakarta text-4xl font-extrabold text-navy leading-none">
              {result.remaining < 0 ? `${Math.abs(result.remaining)}` : result.remaining}
              <span className="text-base font-bold text-gray ml-2">
                {result.remaining < 0 ? 'days past due' : 'days remaining'}
              </span>
            </p>
            <p className="text-sm text-gray mt-4 leading-relaxed">
              {result.status === 'past'
                ? 'This claim is past the payer’s timely-filing limit. Check for a good-cause exception, proof of timely filing, or an appeal pathway before writing it off (CARC 29).'
                : result.status === 'urgent'
                ? 'Prioritize this claim today — it’s inside the final two weeks of the filing window. Missing the limit triggers CARC 29 (time limit for filing expired).'
                : 'You’re within the window. Submit clean to avoid rework that eats into the remaining days.'}
            </p>
          </>
        ) : (
          <p className="text-gray text-sm">Enter a valid date of service to see the deadline.</p>
        )}
      </div>
    </div>
  );
}
