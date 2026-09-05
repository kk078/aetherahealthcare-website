import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import HccRafCalculator from '@/components/ui/HccRafCalculator';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'CMS HCC Risk Adjustment & RAF Score Benchmarker | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Calculate and model patient risk adjustment factor (RAF) scores comparing CMS-HCC v28 vs v24. Estimate Medicare Advantage capitation revenue changes, uncover disease interaction bonuses, and review MEAT documentation criteria.',
};

export default function HccRafCalculatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CMS HCC Risk Adjustment & RAF Score Benchmarker',
    url: 'https://aetherahealthcare.com/tools/hcc-raf-calculator',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free healthcare risk adjustment engine comparing CMS-HCC v28 and v24 risk models, estimating Medicare Advantage capitation revenue impacts and MEAT documentation criteria.',
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
              CMS HCC Risk Adjustment &amp; RAF Score Benchmarker
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              CMS is actively transitioning Medicare Advantage risk adjustment to the v28 model. Measure your clinical RAF
              differential, model capitation revenue impacts across county benchmarks, and implement MEAT documentation
              defensibility to protect practice cash flow.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <HccRafCalculator />

          <ToolConversionBridge
            toolName="HCC RAF Score Benchmarker"
            contextText="Concerned about RAF score contraction under CMS-HCC v28? Aethera's certified risk adjustment coders (AAPC CRC) perform continuous prospective chart audits, close documentation gaps, and maintain 99.2% MEAT audit defensibility."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
