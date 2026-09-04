import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import DenialCostCalculator from '@/components/ui/DenialCostCalculator';

import ToolConversionBridge from '@/components/ui/ToolConversionBridge';

export const metadata = {
  title: { absolute: 'Denial Cost Calculator — Revenue Lost & Rework Cost | Aethera Healthcare Solutions' },
  description:
    'Free denial cost calculator: estimate the reimbursement you lose to denied claims plus the cost of reworking them, per week, month, and year.',
};

export default function DenialCostPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <RcmHeroBand
        eyebrow="Free · No login"
        title="Denial cost calculator"
        subtitle="Denied claims cost you twice — lost reimbursement and the staff time to rework them. Put real numbers to both, per week, month, and year, and see the combined annual impact on your practice."
        primary={{ href: '#tool', label: 'Run the Numbers' }}
        secondary={{ href: '/tools', label: 'All Free Tools' }}
        chips={['Revenue loss + rework', 'Per week / month / year', 'MGMA rework benchmark']}
      />

      <section id="tool" className="py-12 md:py-16 bg-cream flex-1 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link prefetch={false} href="/tools" className="inline-flex items-center text-teal hover:text-navy text-sm mb-6 font-semibold">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> All tools
          </Link>

          <DenialCostCalculator />

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mt-8">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <strong>Estimation only.</strong> Actual losses depend on your payer mix, appeal success, and how many
              denials are truly recoverable. Use the{' '}
              <Link prefetch={false} href="/tools/denial-code-lookup" className="underline font-semibold">denial-code lookup</Link>{' '}
              to work the specific CARC/RARC codes driving yours.
            </p>
          </div>

          <ToolConversionBridge
            toolName="Denial Cost"
            contextText="Shocked by your annual denial rework cost? Aethera reduces denial rates to under 5% and appeals every valid denial within 48 hours."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
