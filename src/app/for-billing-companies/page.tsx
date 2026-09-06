import Link from 'next/link';
import { Users, AlertTriangle, TrendingUp, ArrowRight, Laptop, ClipboardList, CalendarClock, Tag } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import BillingPartnerRoiCalculator from '@/components/ui/BillingPartnerRoiCalculator';

export const metadata = {
  title: 'For Billing Companies | White-Label RCM Back Office | Aethera Healthcare',
  description: 'Own the client relationship and your brand. Aethera runs the eligibility, claims, payment posting, AR follow-up, and denial management behind it — at India+AI economics, with your SLAs. Try the free 50-claim pilot.',
};

const pains = [
  { icon: <Users className="h-6 w-6" />, text: 'Staff churn eats your margin.' },
  { icon: <AlertTriangle className="h-6 w-6" />, text: 'Eligibility denials you absorb as rework.' },
  { icon: <TrendingUp className="h-6 w-6" />, text: "You can't quote growth because you can't hire fast enough." },
];

const partnership = [
  { icon: <Laptop className="h-6 w-6" />, title: 'Your PM system, our team', desc: 'We work inside the practice management system you already run — your team and our automation, side by side.' },
  { icon: <ClipboardList className="h-6 w-6" />, title: 'Weekly scorecards', desc: 'A standing report on volume, accuracy, and turnaround — so capacity is never a guess.' },
  { icon: <CalendarClock className="h-6 w-6" />, title: 'Month-to-month', desc: 'No long lock-in. The relationship holds because the work does.' },
  { icon: <Tag className="h-6 w-6" />, title: 'White-label or disclosed', desc: 'Your call. Many partners keep us fully white-label; some disclose. Either way, you own the client.' },
];

const pilotSteps = [
  { n: '1', title: 'Sign the BAA.', desc: 'Ours or yours — before any data moves.' },
  { n: '2', title: 'Send 50 claims (or 50 eligibility checks).', desc: 'We agree in writing what success means: accuracy vs. your current process, turnaround time, issues caught.' },
  { n: '3', title: 'Get the results in 14 days.', desc: 'A one-page scorecard in your numbers, a live walkthrough of every exception we found, zero obligation.' },
];

const faqs = [
  { q: 'Do my clients know?', a: 'Your choice — many partners keep us fully white-label; some disclose. Either way, you own the client relationship.' },
  { q: 'What about offshore-restricted states?', a: "We screen every engagement's state and payer mix up front and carve out any restricted book of business before work begins." },
  { q: 'Minimums?', a: 'None for the pilot.' },
];

export default function ForBillingCompanies() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <RcmHeroBand
        eyebrow="For Billing Companies"
        title="Your white-label back office"
        subtitle="You keep the client relationship and your brand. We run the work behind it — eligibility verification, claims, payment posting, AR follow-up, denial management — at India+AI economics, with your SLAs."
        primary={{ href: '/free-assessment', label: 'Start the Free 50-Claim Pilot' }}
        secondary={{ href: '/contact', label: 'Talk to Us' }}
        chips={['Month-to-month', 'White-label or disclosed', 'No minimums for the pilot']}
      />

      {/* Pains */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pains.map((p, i) => (
              <FadeIn key={p.text} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-6 border border-gray/10 h-full flex items-start gap-4">
                  <span className="flex-shrink-0 h-11 w-11 rounded-xl bg-royal/10 text-royal flex items-center justify-center">{p.icon}</span>
                  <p className="text-navy font-semibold leading-snug">{p.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How the partnership works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold tracking-[0.16em] text-teal uppercase mb-3">How it works</p>
            <h2 className="font-jakarta font-bold text-navy text-3xl md:text-4xl tracking-tight">How the partnership works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnership.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.1}>
                <div className="bg-cream rounded-xl p-6 border border-gray/10 h-full">
                  <span className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-navy/10 text-navy mb-4">{p.icon}</span>
                  <h3 className="font-jakarta font-bold text-navy mb-2">{p.title}</h3>
                  <p className="text-gray text-sm leading-relaxed">{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Margin Calculator */}
      <BillingPartnerRoiCalculator />

      {/* Pilot CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-ink via-navy to-[#06304f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.25] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(120,160,200,0.4) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-mint/15 border border-mint/40 text-mint text-xs font-bold tracking-[0.14em] uppercase px-4 py-1.5 rounded-full mb-4">Zero obligation</span>
          <h2 className="font-jakarta font-bold text-white text-3xl md:text-4xl tracking-tight mb-12">The Free 50-Claim Pilot</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-12">
            {pilotSteps.map((s) => (
              <FadeIn key={s.n} delay={Number(s.n) * 0.1}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-7 h-full">
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-mint text-navy font-bold text-sm mb-5">{s.n}</span>
                  <h3 className="font-jakarta font-bold text-white text-lg mb-2">{s.title}</h3>
                  <p className="text-cream/80 leading-relaxed text-sm">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <Link prefetch={false} href="/free-assessment"
            className="inline-flex items-center justify-center gap-2 bg-mint hover:bg-white text-navy font-bold py-3.5 px-8 rounded-xl transition-colors duration-200 shadow-lg shadow-black/20">
            Claim your pilot slot <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.16em] text-teal uppercase mb-3">FAQ</p>
            <h2 className="font-jakarta font-bold text-navy text-3xl md:text-4xl tracking-tight">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FadeIn key={faq.q} delay={index * 0.08}>
                <div className="bg-cream rounded-xl p-6 border border-gray/12">
                  <h3 className="font-jakarta text-lg font-bold text-navy mb-2">{faq.q}</h3>
                  <p className="text-gray leading-relaxed">{faq.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
