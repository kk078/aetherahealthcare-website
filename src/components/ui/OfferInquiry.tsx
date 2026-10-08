'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { OFFERS } from '@/lib/siteConfig';
import { submitToWorker } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function OfferInquiry({ offer = 'pilot', specialty = '' }: { offer?: keyof typeof OFFERS; specialty?: string }) {
  const details = OFFERS[offer];
  const [status, setStatus] = useState<'idle' | 'sending' | 'error' | 'received'>('idle');
  const [form, setForm] = useState({ contactName: '', practiceName: '', email: '', bottleneck: '', phone: '', ehrSystem: '', hp_field: '' });
  const set = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    const accepted = await submitToWorker(details.id, { ...form, specialty, offer: details.name, source: window.location.pathname });
    if (!accepted) { setStatus('error'); return; }
    if (!form.hp_field) trackConversion('pilot');
    setStatus('received');
  }
  if (status === 'received') return <div role="status" className="space-y-4 rounded-2xl border border-teal/30 bg-teal/5 p-6">
    <h3 className="font-bold text-xl text-navy">Your request has been received</h3>
    <p>We’ll contact you within one business day to confirm scope and intake. No patient records are needed in this form.</p>
    <Link href="/schedule/" className="font-semibold text-teal underline">Schedule a meeting with Kiran</Link>
  </div>;
  const input = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 dark:bg-slate-900 dark:text-white dark:border-slate-600';
  return <form onSubmit={submit} className="space-y-4 text-slate-800 dark:text-slate-200">
    <p className="text-sm">{details.scope}. Findings in {details.duration} {details.start}. No obligation. HIPAA BAA &amp; Mutual NDA Provided.</p>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-semibold">Your name *<input name="contactName" autoComplete="name" required value={form.contactName} onChange={e => set('contactName', e.target.value)} className={input} /></label>
      <label className="block text-sm font-semibold">Practice / organization *<input name="practiceName" autoComplete="organization" required value={form.practiceName} onChange={e => set('practiceName', e.target.value)} className={input} /></label>
    </div>
    <label className="block text-sm font-semibold">Work email *<input name="email" type="email" autoComplete="email" required value={form.email} onChange={e => set('email', e.target.value)} className={input} /></label>
    <label className="block text-sm font-semibold">What would you like us to review? (optional)<textarea name="bottleneck" rows={2} value={form.bottleneck} onChange={e => set('bottleneck', e.target.value)} className={input} /></label>
    <details className="rounded-xl border border-slate-200 p-3"><summary className="cursor-pointer text-sm font-semibold">Add phone or EHR details (optional)</summary><div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="text-sm">Phone<input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={input} /></label>
      <label className="text-sm">EHR / practice management system<input name="ehrSystem" value={form.ehrSystem} onChange={e => set('ehrSystem', e.target.value)} className={input} /></label>
    </div></details>
    <input aria-label="Leave empty" tabIndex={-1} autoComplete="off" value={form.hp_field} onChange={e => set('hp_field', e.target.value)} className="hidden" aria-hidden="true" />
    <p className="text-xs">Practice information only. Please do not include patient identifiers or upload clinical records here. <Link href="/compliance/privacy-policy/" className="underline">Privacy policy</Link></p>
    {status === 'error' && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">Your request could not be saved. Please retry, or <Link href="/schedule/" className="underline">schedule a meeting</Link>.</p>}
    <button disabled={status === 'sending'} className="w-full rounded-xl bg-teal px-6 py-3 font-bold text-white disabled:opacity-60">{status === 'sending' ? 'Sending…' : `Request ${details.name}`}</button>
  </form>;
}
