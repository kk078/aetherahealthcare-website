'use client';

import { useState } from 'react';
import { FileText, Download, X, Loader2, ArrowRight } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';
import { submitToWorker } from '@/lib/worker';

/**
 * Specialty billing-guide card with a soft email gate. Clicking opens a small
 * modal that asks where to send the guide (captures the lead to the CRM) and
 * then opens the PDF. A "skip" link preserves the original zero-friction path so
 * we capture most visitors without losing anyone.
 */
export default function GuideCard({
  slug, name, focus, index,
}: { slug: string; name: string; focus: string; index: number }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
  const pdf = `/decks/${slug}.pdf`;

  const openPdf = () => window.open(pdf, '_blank', 'noopener,noreferrer');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return;
    if (!hp && email) {
      setStatus('submitting');
      await submitToWorker('guide_download', {
        email,
        specialty: name,
        message: `Requested the ${name} specialty billing guide from the website.`,
      });
    }
    openPdf();
    setOpen(false);
    setStatus('idle');
    setEmail('');
  }

  return (
    <FadeIn delay={(index % 3) * 0.1}>
      <div className="group flex flex-col h-full bg-white rounded-2xl border border-gray/15 p-6 hover:shadow-lg hover:border-teal/40 transition-all duration-200">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-teal/10 text-teal rounded-xl p-3 flex-shrink-0 group-hover:bg-teal group-hover:text-white transition-colors">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-navy leading-tight">{name}</h3>
            <p className="text-gray text-xs mt-1">{focus}</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="mt-auto pt-3 border-t border-gray/10 flex items-center text-teal font-semibold text-sm hover:text-navy transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Get the billing guide (PDF)
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          role="dialog" aria-modal="true" aria-label={`${name} billing guide`}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setOpen(false)} className="absolute top-3 right-3 text-slate-400 hover:text-navy transition-colors" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <div className="bg-gradient-to-r from-navy to-teal px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-mint mb-1">Specialty Billing Guide</p>
              <h2 className="text-white font-bold text-lg leading-snug">{name}</h2>
            </div>
            <form onSubmit={submit} className="p-6 space-y-3">
              <p className="text-sm text-slate-600">Where should we send it? We&apos;ll email your copy and open it right now.</p>
              <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
                <input type="text" tabIndex={-1} autoComplete="off" aria-label="Leave empty" value={hp} onChange={e => setHp(e.target.value)} />
              </div>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@practice.com" aria-label="Work email"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal"
              />
              <button
                type="submit" disabled={status === 'submitting'}
                className="w-full bg-navy hover:bg-teal disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? (<><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>) : (<>Email it &amp; open <ArrowRight className="h-4 w-4" /></>)}
              </button>
              <button type="button" onClick={() => { openPdf(); setOpen(false); }} className="w-full text-center text-xs text-slate-400 hover:text-teal transition-colors">
                Skip — just open the PDF
              </button>
            </form>
          </div>
        </div>
      )}
    </FadeIn>
  );
}
