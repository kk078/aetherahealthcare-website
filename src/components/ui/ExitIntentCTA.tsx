'use client';

import { useEffect, useState } from 'react';
import { X, TrendingDown, Loader2, CheckCircle } from 'lucide-react';
import { submitToWorker } from '@/lib/worker';

/**
 * Exit-intent capture. Fires once per session when the visitor moves to leave
 * (cursor leaves the top of the viewport on desktop, or after a dwell timer as a
 * mobile fallback). Offers the free denial-leakage assessment and captures the
 * email straight into the CRM via the shared ingest path. Best-effort, no nag.
 */
export default function ExitIntentCTA() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('aethera_exit_shown')) return;

    let done = false;
    const trigger = () => {
      if (done) return;
      done = true;
      sessionStorage.setItem('aethera_exit_shown', '1');
      setShow(true);
      cleanup();
    };
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    };
    // Desktop: cursor leaves toward the address bar / tab strip.
    document.addEventListener('mouseout', onMouseOut);
    // Mobile / no-mouse fallback: show after meaningful dwell.
    const timer = window.setTimeout(trigger, 60000);
    function cleanup() {
      document.removeEventListener('mouseout', onMouseOut);
      window.clearTimeout(timer);
    }
    return cleanup;
  }, []);

  if (!show) return null;

  const close = () => setShow(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'submitting') return;
    if (hp) { setStatus('success'); return; } // bot honeypot
    setStatus('submitting');
    await submitToWorker('exit_intent', {
      email,
      message: 'Exit-intent lead — requested a free denial-leakage assessment from the website.',
    });
    setStatus('success');
    setTimeout(close, 3500);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Free assessment offer"
      onClick={close}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-3 right-3 text-slate-400 hover:text-navy transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {status === 'success' ? (
          <div className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-teal mx-auto mb-3" />
            <p className="font-bold text-navy text-lg">You&apos;re all set.</p>
            <p className="text-sm text-slate-500 mt-1">
              We&apos;ll send your free denial-leakage assessment within 1 business day.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-navy to-teal px-6 py-5">
              <div className="flex items-center gap-2 text-mint mb-1">
                <TrendingDown className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wide">Before you go</span>
              </div>
              <h2 className="text-white font-bold text-xl leading-snug">
                See what your practice is leaving on the table
              </h2>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Get a free, no-obligation <strong>denial-leakage assessment</strong> — we&apos;ll pinpoint
                undercoding, denial patterns, and AR gaps costing you revenue. Delivered in 5 business days.
              </p>
              <div
                style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
                aria-hidden="true"
              >
                <input
                  type="text" tabIndex={-1} autoComplete="off" aria-label="Leave empty"
                  value={hp} onChange={e => setHp(e.target.value)}
                />
              </div>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@practice.com" aria-label="Work email"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal"
              />
              <button
                type="submit" disabled={status === 'submitting' || !email}
                className="w-full bg-navy hover:bg-teal disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                ) : (
                  'Get My Free Assessment'
                )}
              </button>
              <p className="text-center text-xs text-slate-400">
                No spam. No commitment. Cancel anytime.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
