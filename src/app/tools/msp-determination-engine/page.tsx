import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import MspDeterminationEngine from '@/components/ui/MspDeterminationEngine';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Medicare Secondary Payer (MSP) Determination Engine | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Evaluate Medicare Secondary Payer (MSP) rules under Section 1862(b) of the Social Security Act. Determine primary vs secondary liability across Working Aged, Disability, ESRD 30-month coordination, and No-Fault/WC. Generate ANSI X12 837P Loop 2320 mapping.',
};

export default function MspDeterminationEnginePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Medicare Secondary Payer (MSP) Determination Engine',
    url: 'https://aetherahealthcare.com/tools/msp-determination-engine',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free healthcare compliance engine to determine statutory primary payer hierarchy, verify MSP Type codes, and generate ANSI X12 837P coordination of benefits claim segments.',
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
              Medicare Secondary Payer (MSP) Determination Engine
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Failing to properly sequence Medicare primary vs secondary billing triggers False Claims Act audits,
              drastic recoupments, and CO-22 denial sweeps. Walk through statutory CMS rules to determine exact payer
              order, generate 837P Loop 2320 electronic segments, and verify conditional payment rights.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <MspDeterminationEngine />

          <ToolConversionBridge
            toolName="MSP Determination Engine"
            contextText="Struggling with CARC CO-22 coordination denials or uncollected secondary balances? Aethera's billing specialists automatically capture patient MSP questionnaires, verify employer size thresholds, and transmit electronic secondary crossover claims with 99.2% clean claim acceptance."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
