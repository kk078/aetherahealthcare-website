import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import FeeScheduleBenchmarker from '@/components/ui/FeeScheduleBenchmarker';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'CPT Fee Schedule & Reimbursement Gap Benchmarker | Aethera Healthcare Solutions',
  },
  description:
    'Calculate your practice’s annual underpayment gap by comparing commercial payer allowances against 2026 Medicare and top commercial PPO benchmarks.',
};

export default function FeeScheduleBenchmarkerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CPT Fee Schedule & Reimbursement Gap Benchmarker',
    url: 'https://aetherahealthcare.com/tools/fee-schedule-benchmarker',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free interactive calculator to benchmark medical practice CPT code reimbursement against Medicare and commercial fee schedules.',
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
              CPT Fee Schedule &amp; Reimbursement Gap Benchmarker
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Are outdated payer fee schedules quietly eroding your clinical earnings? Benchmark your top procedure
              codes against 2026 Medicare allowable rates and 135%–160% commercial PPO rates to quantify your underpayment gap.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <FeeScheduleBenchmarker />

          <ToolConversionBridge
            toolName="Fee Schedule Benchmarker"
            contextText="Want Aethera to renegotiate your commercial payer contracts? Our payer contracting specialists review your top 50 codes and demand rate parity with top regional health systems."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
