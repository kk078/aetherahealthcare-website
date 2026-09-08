import { canonicalUrl } from '@/lib/siteConfig';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import DenialOverturnPredictor from '@/components/ui/DenialOverturnPredictor';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  alternates: { canonical: canonicalUrl('/tools/denial-overturn-predictor') },
  title: {
    absolute: 'Denial Appeal Readiness & Review Checklist | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Predict medical claim denial overturn probability across CARC codes (CO-50, CO-197, CO-97, CO-16, CO-29, CO-22). Compute statutory appeal deadline countdowns, clinical evidence checklists, and legal citations.',
};

export default function DenialOverturnPredictorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Denial Appeal Readiness & Review Checklist',
    url: 'https://aetherahealthcare.com/tools/denial-overturn-predictor',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free healthcare revenue cycle engine to calculate appeal overturn probability, track statutory appeal deadline windows, and generate clinical legal citations.',
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
              Denial Appeal Readiness &amp; Review Checklist
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Check your appeal documentation and reference timeframes. The score describes checklist completion and does not predict appeal success. Verify your payer’s actual policy and deadline.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <DenialOverturnPredictor />

          <ToolConversionBridge
            toolName="Denial Overturn Predictor"
            contextText="Tired of fighting payer denial sweeps one claim at a time? Aethera's specialized denial resolution team manages 100% of Level 1, 2, and external review appeals electronically with an 82%+ recovery rate."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
