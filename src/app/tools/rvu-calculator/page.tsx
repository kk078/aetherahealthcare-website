import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import RvuCalculator from '@/components/ui/RvuCalculator';

import ToolConversionBridge from '@/components/ui/ToolConversionBridge';

export const metadata = {
  title: { absolute: 'RVU Payment Calculator — Medicare Fee Schedule Estimate | Aethera Healthcare Solutions' },
  description:
    'Free RVU calculator: enter work, practice-expense, and malpractice RVUs with GPCI and the Medicare conversion factor to estimate the allowed amount for a CPT/HCPCS code.',
};

export default function RvuCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <RcmHeroBand
        eyebrow="Free · No login"
        title="RVU payment calculator"
        subtitle="Turn RVUs into dollars. Enter the work, practice-expense, and malpractice RVUs for a CPT/HCPCS code with your locality’s GPCI and the Medicare conversion factor to estimate the allowed amount."
        primary={{ href: '#tool', label: 'Calculate Payment' }}
        secondary={{ href: '/tools', label: 'All Free Tools' }}
        chips={['Medicare PFS formula', 'GPCI locality', 'Facility & non-facility']}
      />

      <section id="tool" className="py-12 md:py-16 bg-cream flex-1 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link prefetch={false} href="/tools" className="inline-flex items-center text-teal hover:text-navy text-sm mb-6 font-semibold">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> All tools
          </Link>

          <RvuCalculator />

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mt-8">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <strong>Estimation only.</strong> RVU values, GPCI, and the conversion factor come from the public CMS
              Physician Fee Schedule and change annually — pull the current values from the CMS Relative Value File for
              the code and locality you’re pricing. Commercial payer rates differ from Medicare.
            </p>
          </div>

          <ToolConversionBridge
            toolName="RVU Payment"
            contextText="Are you getting paid the full RVU value of every patient encounter? Aethera eliminates downcoding and documentation gaps."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
