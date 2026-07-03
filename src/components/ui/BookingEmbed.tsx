'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Calendar, CheckCircle2, Loader2, Phone } from 'lucide-react';
import { submitToWorker } from '@/lib/worker';

// Client's live-calendar booking URL (Calendly or Cal.com). Inlined at build
// time. When set, the page renders the live calendar; when empty, it shows a
// meeting-request form that still captures the lead and notifies the team.
const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || '';

export default function BookingEmbed() {
  if (BOOKING_URL) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-gray/15 bg-white shadow-sm">
        <iframe
          src={BOOKING_URL}
          title="Schedule a meeting with Aethera Healthcare Solutions"
          className="w-full"
          style={{ height: 'min(80vh, 900px)', border: 'none' }}
          loading="lazy"
        />
      </div>
    );
  }
  return <MeetingRequestForm />;
}

function MeetingRequestForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', practice: '', preferredTime: '', message: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const inputCls =
    'w-full border border-gray/30 rounded-lg px-4 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal text-sm';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || status === 'sending') return;
    setStatus('sending');
    try {
      await submitToWorker('meeting_request', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        practice: form.practice.trim(),
        preferredTime: form.preferredTime.trim(),
        message:
          `Meeting request from the website. Preferred time: ${form.preferredTime || 'flexible'}. ` +
          (form.message ? `Notes: ${form.message}` : ''),
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-mint/40 bg-mint/10 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-teal mx-auto mb-3" />
        <h3 className="text-xl font-bold text-navy mb-1">Your meeting request is in.</h3>
        <p className="text-gray text-sm max-w-md mx-auto">
          A member of our team will reach out within one business day to confirm a time. Prefer to talk now? Call{' '}
          <a href="tel:+18135194640" className="text-teal font-semibold hover:text-navy">(813) 519-4640</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-gray/15 bg-white p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="h-5 w-5 text-teal" />
        <h3 className="text-lg font-bold text-navy">Request a meeting</h3>
      </div>
      <p className="text-sm text-gray mb-5">Tell us when works and we&rsquo;ll confirm a time that fits your schedule.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="mr-name" className="block text-sm font-semibold text-navy mb-1">Name *</label>
          <input id="mr-name" required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="mr-email" className="block text-sm font-semibold text-navy mb-1">Work Email *</label>
          <input id="mr-email" required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@yourpractice.com" className={inputCls} />
        </div>
        <div>
          <label htmlFor="mr-phone" className="block text-sm font-semibold text-navy mb-1">Phone</label>
          <input id="mr-phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="mr-practice" className="block text-sm font-semibold text-navy mb-1">Practice / Organization</label>
          <input id="mr-practice" value={form.practice} onChange={(e) => set('practice', e.target.value)} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="mr-time" className="block text-sm font-semibold text-navy mb-1">Preferred day &amp; time</label>
          <input id="mr-time" value={form.preferredTime} onChange={(e) => set('preferredTime', e.target.value)} placeholder="e.g. Tuesday or Thursday afternoons, ET" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="mr-msg" className="block text-sm font-semibold text-navy mb-1">Anything we should know? (optional)</label>
          <textarea id="mr-msg" rows={3} value={form.message} onChange={(e) => set('message', e.target.value)} className={inputCls + ' resize-none'} />
        </div>
      </div>
      <button type="submit" disabled={status === 'sending'} className="w-full mt-5 bg-teal hover:bg-navy text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center disabled:opacity-60">
        {status === 'sending' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</> : 'Request my meeting'}
      </button>
      {status === 'error' && (
        <p className="text-center text-sm text-red-600 mt-3">
          Something went wrong. Please call <a href="tel:+18135194640" className="underline">(813) 519-4640</a> or{' '}
          <Link prefetch={false} href="/contact" className="underline">contact us</Link>.
        </p>
      )}
      <p className="text-xs text-gray text-center mt-3 flex items-center justify-center gap-1.5">
        <Phone className="h-3.5 w-3.5" /> Prefer to talk now? Call (813) 519-4640
      </p>
    </form>
  );
}
