import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import PayerManualFinder from '@/components/ui/PayerManualFinder';
import { getPayerResources } from '@/lib/payerResources';

import ToolConversionBridge from '@/components/ui/ToolConversionBridge';

export const metadata = {
  title: { absolute: 'Payer Provider Manual & Policy Finder | Aethera Healthcare Solutions' },
  description:
    'Find provider manuals, medical/reimbursement policies, credentialing, and eligibility pages for major U.S. payers — UnitedHealthcare, Aetna, Cigna, Humana, Florida Blue, Medicare MACs, and more.',
};

export default function PayerManualFinderPage() {
  const count = getPayerResources().length;
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <RcmHeroBand
        eyebrow="Free · No login"
        title="Payer provider-manual & policy finder"
        subtitle={`Stop hunting through payer websites. Jump straight to the provider manual, medical and reimbursement policies, credentialing, and eligibility pages for ${count}+ major payers — including Medicare MACs and Florida plans.`}
        primary={{ href: '#tool', label: 'Find a Payer' }}
        secondary={{ href: '/payers/directory', label: 'Payer Directory' }}
        chips={[`${count} payers`, 'Direct official links', 'Medicare + commercial + Medicaid']}
      />

      <section id="tool" className="py-12 md:py-16 bg-cream flex-1 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link prefetch={false} href="/tools" className="inline-flex items-center text-teal hover:text-navy text-sm mb-6 font-semibold">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> All tools
          </Link>

          <PayerManualFinder />

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mt-8">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <strong>Reference only.</strong> Links point to each payer’s own website and were verified when compiled,
              but payers restructure their sites frequently — confirm you’re on the current page. Many Blue Cross,
              Medicaid, and Medicare pages are jurisdiction- or state-specific. For payer IDs, timely-filing limits, and
              portals, see the{' '}
              <Link prefetch={false} href="/payers/directory" className="underline font-semibold">payer directory</Link>.
            </p>
          </div>

          <ToolConversionBridge
            toolName="Payer Manual"
            contextText="Tired of navigating complicated payer portals and contradictory policies? Aethera manages credentialing and billing across 900+ payers."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
