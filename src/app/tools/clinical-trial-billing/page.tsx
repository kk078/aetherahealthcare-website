import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import ClinicalTrialScrubber from '@/components/ui/ClinicalTrialScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Clinical Trial Billing & Coverage Analysis Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Separate Medicare routine care from sponsor-invoiced investigational items under CMS NCD 310.1. Verify 8-digit NCT numbers, Modifier Q1/Q0 rules, IDE Category A/B compliance, and secondary diagnosis ICD-10 Z00.6.',
};

export default function ClinicalTrialBillingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Clinical Trial Billing & Coverage Analysis Scrubber',
    url: 'https://aetherahealthcare.com/tools/clinical-trial-billing',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free healthcare research compliance tool to parse clinical trial protocols, validate NCT identifiers, and map routine costs to Modifier Q1 and investigational items to trial sponsors.',
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
              Clinical Trial Billing &amp; Coverage Analysis Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Double-billing Medicare for research items funded by study sponsors creates severe False Claims Act
              exposure. Build compliant clinical trial coverage analysis matrices, validate 8-digit NCT identifiers, and
              sequence Modifiers Q1 and Q0 correctly on ANSI X12 837P claims.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <ClinicalTrialScrubber />

          <ToolConversionBridge
            toolName="Clinical Trial Billing Scrubber"
            contextText="Managing complex clinical trials or IDE device studies? Aethera's specialized clinical research revenue cycle team performs Coverage Analyses (CTCA), validates NCT numbers in Loop 2300 REF*P4, and ensures zero False Claims Act double-billing risk."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
