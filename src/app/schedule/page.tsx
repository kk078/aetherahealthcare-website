import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import BookingEmbed from '@/components/ui/BookingEmbed';
import { CalendarClock, ShieldCheck, Clock } from 'lucide-react';

export const metadata = {
  title: 'Schedule a Meeting',
  description:
    'Book a time to talk with Aethera Healthcare Solutions about your medical billing and revenue cycle. Pick a slot that works for you — no obligation.',
  alternates: { canonical: 'https://aetherahealthcare.com/schedule' },
};

export default function SchedulePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-ink via-navy to-[#06304f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.25] pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(120,160,200,0.4) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3.5 py-1.5 text-xs font-semibold tracking-[0.14em] text-cream uppercase">
              <CalendarClock className="h-4 w-4 text-mint" /> Book a time
            </span>
            <h1 className="font-jakarta font-extrabold text-white text-4xl md:text-5xl tracking-tight mt-5 mb-4">
              Schedule a meeting with our team
            </h1>
            <p className="text-lg text-cream/85 max-w-2xl mx-auto">
              Pick a time that works for you and we&rsquo;ll walk through your revenue cycle, answer your questions,
              and show exactly how we can help — no obligation.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-cream/75 text-sm">
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-mint" /> 30 minutes</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-mint" /> No obligation</span>
              <span className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-mint" /> Fits your schedule</span>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingEmbed />
          <p className="text-center text-sm text-gray mt-6">
            Prefer email? Reach us at{' '}
            <a href="mailto:info@aetherahealthcare.com" className="text-teal font-semibold hover:text-navy">info@aetherahealthcare.com</a>{' '}
            or start with a{' '}
            <Link prefetch={false} href="/free-assessment" className="text-teal font-semibold hover:text-navy">free revenue assessment</Link>.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
