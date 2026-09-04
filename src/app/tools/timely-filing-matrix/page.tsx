import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import TimelyFilingMatrix from '@/components/ui/TimelyFilingMatrix';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Multi-Payer Timely Filing & Appeal Deadline Matrix | Aethera Healthcare Solutions',
  },
  description:
    'Comprehensive multi-payer timely filing database. Compare initial claim filing limits, corrected claim deadlines, and appeal windows across 50 state Medicaid programs, Medicare MACs, and commercial PPOs.',
};

export default function TimelyFilingMatrixPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Multi-Payer Timely Filing Matrix',
    url: 'https://aetherahealthcare.com/tools/timely-filing-matrix',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free reference matrix comparing initial claim filing limits and appeal deadlines across commercial payers, Medicare MACs, and state Medicaid programs.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-navy via-[#003087] to-teal">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-cream/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Multi-Payer Timely Filing &amp; Appeal Deadline Matrix
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Timely filing rules differ wildly by state and payer — from 90 days for New York Medicaid and commercial PPOs
              to 365 days for traditional Medicare Part B. Use this matrix to protect your practice cashflow from untimeliness write-offs.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <TimelyFilingMatrix />

          <ToolConversionBridge
            toolName="Timely Filing Matrix"
            contextText="Worried about claims hitting timely filing limits during in-house staff absences? Aethera 24-hour daily submission SLA guarantees your claims never expire."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
