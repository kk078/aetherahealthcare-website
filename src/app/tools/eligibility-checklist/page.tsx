import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import EligibilityChecklist from '@/components/ui/EligibilityChecklist';

export const metadata = {
  title: { absolute: 'Eligibility & Prior-Auth Readiness Checklist | Aethera Healthcare Solutions' },
  description:
    'Free pre-visit eligibility and prior-authorization checklist. Score your front-desk verification against the checks that prevent CO-27, CO-197, and eligibility denials.',
};

export default function EligibilityChecklistPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      <RcmHeroBand
        eyebrow="Free · No login"
        title="Eligibility & prior-auth checklist"
        subtitle="Denials that start at the front desk are the cheapest to prevent. Score your pre-visit verification against the ten checks that stop eligibility, coverage, and authorization denials before the claim goes out."
        primary={{ href: '#tool', label: 'Start the Checklist' }}
        secondary={{ href: '/tools', label: 'All Free Tools' }}
        chips={['10 front-end checks', 'Readiness score', 'Maps to CARC codes']}
      />

      <section id="tool" className="py-12 md:py-16 bg-cream flex-1 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link prefetch={false} href="/tools" className="inline-flex items-center text-teal hover:text-navy text-sm mb-6 font-semibold">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> All tools
          </Link>

          <EligibilityChecklist />

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mt-8">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <strong>Educational reference.</strong> Requirements vary by payer and plan — some services need referral
              and authorization, others neither. Use the{' '}
              <Link prefetch={false} href="/tools/denial-code-lookup" className="underline font-semibold">denial-code lookup</Link>{' '}
              to work any code these checks are meant to prevent.
            </p>
          </div>

          <div className="mt-10 bg-navy rounded-2xl p-6 md:p-8 text-white text-center">
            <p className="font-jakarta text-xl font-bold mb-2">Stop denials at the source.</p>
            <p className="text-cream/80 text-sm mb-5 max-w-2xl mx-auto">Aethera builds front-end verification into every claim so eligibility and auth denials never reach your A/R. See where yours are leaking.</p>
            <Link prefetch={false} href="/free-assessment" className="inline-block bg-mint hover:bg-white text-navy font-bold py-3 px-6 rounded-full transition-colors text-sm">
              Get a Free Assessment
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
