'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import AccessibleDialog from './AccessibleDialog';
import OfferInquiry from './OfferInquiry';

export default function FreePilotModal({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('open-free-pilot-modal', show);
    return () => window.removeEventListener('open-free-pilot-modal', show);
  }, []);
  if (!open) return null;
  return <AccessibleDialog open={open} onClose={() => setOpen(false)} title="Free 50-Claim Pilot" className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4">
    <div className="relative my-8 max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 sm:p-8">
      <button aria-label="Close modal" onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-full p-2 text-slate-600 dark:text-white"><X /></button>
      <p className="text-xs font-bold uppercase tracking-wide text-teal">Zero Obligation · No Setup Fees · 14-Day Trial</p>
      <h2 className="mb-5 mt-3 pr-8 text-2xl font-bold text-navy dark:text-white">Claim Your Free 50-Claim Pilot</h2>
      <OfferInquiry />
    </div>
  </AccessibleDialog>;
}
