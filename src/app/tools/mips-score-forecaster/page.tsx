import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import MipsScoreForecaster from '@/components/ui/MipsScoreForecaster';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'CMS MIPS Performance Score & Penalty Forecaster | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Forecast your CMS Merit-based Incentive Payment System (MIPS) score out of 100 points. Calculate positive payment adjustments or negative Part B penalty exposure (up to -9.0%) across Quality, Promoting Interoperability, Improvement Activities, and Cost.',
};

export default function MipsScoreForecasterPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CMS MIPS Performance Score & Penalty Forecaster',
    url: 'https://aetherahealthcare.com/tools/mips-score-forecaster',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free healthcare quality engine to forecast MIPS composite scores, model Medicare Part B payment adjustment penalties up to -9.0%, and audit data completeness.',
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
              CMS MIPS Performance Score &amp; Penalty Forecaster
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Failing to cross the CMS 75.0-point performance threshold triggers an automatic penalty of up to -9.0% on
              all Medicare Part B claims. Forecast your score across Quality, Interoperability, Improvement Activities,
              and Cost to defend practice revenue.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <MipsScoreForecaster />

          <ToolConversionBridge
            toolName="MIPS Score Forecaster"
            contextText="Worried about meeting the CMS 75-point MIPS threshold? Aethera's specialized quality reporting pod handles measure selection, EHR CEHRT data extraction, and annual QRDA-III submissions with zero penalty exposure guaranteed."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
