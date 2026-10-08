'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { SPECIALTY_BENCHMARKS } from '@/lib/denialBenchmarks';
import { submitToWorker } from '@/lib/worker';
import { trackConversion, trackCustomEvent } from '@/lib/gtag';

export default function DenialsReport() {
  const [specialty, setSpecialty] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'received' | 'error'>('idle');
  const selected = SPECIALTY_BENCHMARKS.find(item => item.slug === specialty);
  async function requestReview(event: FormEvent) {
    event.preventDefault(); if (status === 'sending') return;
    setStatus('sending');
    const ok = await submitToWorker('denials_report', { email, specialty: selected?.name || '', message: 'Requested a specialist review of the practice’s denial mix after reading the denial review guide. No PDF delivery or subscription is implied.' });
    if (!ok) { setStatus('error'); return; }
    trackConversion('report'); setStatus('received');
  }
  return <div className="space-y-6">
    <label className="block font-semibold text-navy">Your specialty<select value={specialty} onChange={e => setSpecialty(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900"><option value="">Choose a specialty</option>{SPECIALTY_BENCHMARKS.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
    {selected && <article className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-xl font-bold text-navy">{selected.name}: denial review checklist</h3>
      <p className="my-3 text-sm text-slate-700">Review focus: {selected.watchout}</p>
      <ol className="list-decimal space-y-3 pl-5 text-sm text-slate-700"><li>Collect the EOB or ERA, claim submission record, payer policy and relevant documentation.</li><li>Confirm the adjustment reason in the current X12 code list. Review coverage and contract requirements for the date of service.</li><li>Check authorization, eligibility, coding and documentation before choosing a correction or appeal.</li><li>Record the filing deadline, owner and next action. Compare outcomes against your own baseline.</li></ol>
      <p className="mt-4 text-xs text-slate-600">No audited specialty benchmark dataset is available for this guide. It does not assign industry denial percentages or predict recovery.</p>
      <button onClick={() => { trackCustomEvent('file_download', { resource: 'denial_review_guide', specialty: selected.slug }); window.print(); }} className="mt-5 rounded-xl bg-teal px-4 py-3 font-semibold text-white no-print">Print / save this guide as PDF</button>
    </article>}
    <aside className="rounded-2xl border border-slate-200 bg-white p-6"><h3 className="font-bold text-navy">Primary reference collections</h3><ul className="mt-3 space-y-2 text-sm text-teal underline"><li><a href="https://x12.org/codes" target="_blank" rel="noopener noreferrer">X12 adjustment and remittance code lists</a></li><li><a href="https://www.cms.gov/regulations-and-guidance/guidance/manuals/internet-only-manuals-ioms-items/cms018912" target="_blank" rel="noopener noreferrer">CMS Medicare Claims Processing Manual</a></li><li><a href="https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits" target="_blank" rel="noopener noreferrer">CMS NCCI reference collection</a></li></ul><p className="mt-3 text-xs text-slate-600">These are reference resources. Confirm the applicable policy edition and payer requirements; they do not establish that a specialist reviewed this guide.</p></aside>
    <div className="rounded-2xl bg-navy p-6 text-white no-print"><h3 className="text-xl font-bold">Request a review using your own data</h3><p className="my-3 text-sm text-white/80">Start with your work email. We’ll arrange any clinical intake separately after the BAA.</p>
      {status === 'received' ? <p role="status">Your review request was received. We’ll reply within one business day.</p> : <form onSubmit={requestReview} className="space-y-3"><label className="block text-sm">Work email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 block w-full rounded-xl bg-white p-3 text-slate-900" /></label><button disabled={status === 'sending'} className="rounded-xl bg-mint px-5 py-3 font-bold text-navy disabled:opacity-60">{status === 'sending' ? 'Sending…' : 'Request denial review'}</button>{status === 'error' && <p role="alert" className="text-red-200">Your request could not be saved. Please retry or <Link href="/schedule/" className="underline">schedule a meeting</Link>.</p>}</form>}
    </div>
  </div>;
}
