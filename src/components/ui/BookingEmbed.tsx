'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Calendar, CalendarClock, CheckCircle2, Loader2, Phone, Video, ArrowUpRight } from 'lucide-react';
import { submitToWorker } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

// Live-calendar booking URL (Cal.com / Calendly). Defaults to Aethera's public
// Cal.com page; NEXT_PUBLIC_BOOKING_URL can override it without a code change.
// When blank, the page shows a meeting-request form that still captures the
// lead and notifies the team.
const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL || 'https://cal.com/aethera-healthcare-solutions-ribxep';

export default function BookingEmbed() {
  if (BOOKING_URL) return <BookCard url={BOOKING_URL} />;
  return <MeetingRequestForm />;
}

/**
 * Booking card that opens the live calendar (Cal.com/Calendly) in a new tab.
 * Chosen over an inline iframe/embed because Cal.com blocks raw framing and its
 * embed script is unreliable cross-domain — a direct link always works, and the
 * live availability, Google Meet link, and invites are handled by the calendar.
 */
function BookCard({ url }: { url: string }) {
  return (
    <div className="rounded-2xl border border-gray/15 bg-white shadow-sm p-7 md:p-9 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal/10 text-teal mb-4">
        <CalendarClock className="h-7 w-7" />
      </span>
      <h3 className="text-xl md:text-2xl font-bold text-navy mb-2">Pick a time on our live calendar</h3>
      <p className="text-gray text-sm max-w-md mx-auto mb-6">
        Choose a slot that works for you. You&rsquo;ll get a confirmation with a{' '}
        <span className="inline-flex items-center gap-1 font-semibold text-navy"><Video className="h-3.5 w-3.5 text-teal" /> Google Meet</span>{' '}
        link automatically.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackConversion('booking')}
        className="inline-flex items-center justify-center gap-2 bg-teal hover:bg-navy text-white font-bold py-3.5 px-8 rounded-full transition-colors text-sm"
      >
        Book a time <ArrowUpRight className="h-4 w-4" />
      </a>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray">
        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-teal" /> 30- or 15-minute options</span>
        <span className="flex items-center gap-1.5"><Video className="h-3.5 w-3.5 text-teal" /> Google Meet included</span>
        <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-teal" /> Or call (813) 519-4640</span>
      </div>
      <div className="mt-6 pt-5 border-t border-gray/10">
        <p className="text-xs text-gray mb-3">Prefer we reach out to you instead? Send a request and we&rsquo;ll confirm a time.</p>
        <MeetingRequestForm compact />
      </div>
    </div>
  );
}

function MeetingRequestForm({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(!compact);
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
      trackConversion('meeting');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-mint/40 bg-mint/10 p-6 text-center">
        <CheckCircle2 className="h-9 w-9 text-teal mx-auto mb-2" />
        <p className="font-bold text-navy">Your meeting request is in.</p>
        <p className="text-gray text-sm mt-1">
          We&rsquo;ll reach out within one business day to confirm a time. Prefer to talk now? Call{' '}
          <a href="tel:+18135194640" className="text-teal font-semibold hover:text-navy">(813) 519-4640</a>.
        </p>
      </div>
    );
  }

  if (compact && !open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-semibold text-teal hover:text-navy">
        Request a meeting instead →
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? 'text-left' : 'rounded-2xl border border-gray/15 bg-white p-6 md:p-8 shadow-sm text-left'}>
      {!compact && (
        <>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-5 w-5 text-teal" />
            <h3 className="text-lg font-bold text-navy">Request a meeting</h3>
          </div>
          <p className="text-sm text-gray mb-5">Tell us when works and we&rsquo;ll confirm a time that fits your schedule.</p>
        </>
      )}
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
      <button type="submit" disabled={status === 'sending'} className="w-full mt-5 bg-navy hover:bg-teal text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center disabled:opacity-60">
        {status === 'sending' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</> : 'Request my meeting'}
      </button>
      {status === 'error' && (
        <p className="text-center text-sm text-red-600 mt-3">
          Something went wrong. Please call <a href="tel:+18135194640" className="underline">(813) 519-4640</a> or{' '}
          <Link prefetch={false} href="/contact" className="underline">contact us</Link>.
        </p>
      )}
    </form>
  );
}
