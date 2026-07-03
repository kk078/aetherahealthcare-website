import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import TimelyFilingCalculator from '@/components/ui/TimelyFilingCalculator';

export const metadata = {
  title: { absolute: 'Timely Filing Calculator — Claim Deadline & Days Remaining | Aethera Healthcare Solutions' },
  description:
    'Free timely-filing calculator: enter a date of service and the payer filing limit to get the exact submission deadline, days remaining, and a risk flag for CARC 29.',
};

export default function TimelyFilingPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      <RcmHeroBand
        eyebrow="Free · No login"
        title="Timely filing calculator"
        subtitle="Enter a date of service and the payer’s filing limit to get the exact submission deadline, how many days are left, and whether the claim is at risk of a CARC 29 timely-filing denial."
        primary={{ href: '#tool', label: 'Use the Calculator' }}
        secondary={{ href: '/tools', label: 'All Free Tools' }}
        chips={['Deadline in seconds', 'Payer presets', 'CARC 29 risk flag']}
      />

      <section id="tool" className="py-12 md:py-16 bg-cream flex-1 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link prefetch={false} href="/tools" className="inline-flex items-center text-teal hover:text-navy text-sm mb-6 font-semibold">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> All tools
          </Link>

          <TimelyFilingCalculator />

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mt-8">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <strong>Educational reference.</strong> Filing limits vary by payer, plan, and contract, and some payers
              count from date of service while others count from date of discharge or a prior payer’s remittance. Confirm
              the exact limit in your payer agreement or the{' '}
              <Link prefetch={false} href="/payers/directory" className="underline font-semibold">payer directory</Link>.
            </p>
          </div>

          <div className="mt-10 bg-navy rounded-2xl p-6 md:p-8 text-white text-center">
            <p className="font-jakarta text-xl font-bold mb-2">Missing filing deadlines is lost revenue.</p>
            <p className="text-cream/80 text-sm mb-5 max-w-2xl mx-auto">Aethera’s A/R team tracks every claim against its payer deadline so nothing ages out. See what your practice is leaving on the table.</p>
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
