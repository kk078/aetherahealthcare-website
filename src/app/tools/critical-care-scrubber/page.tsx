import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import CriticalCareScrubber from '@/components/ui/CriticalCareScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Emergency & Critical Care Time Documentation Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free CMS critical care time scrubber. Validate CPT 99291 and 99292 time thresholds, deduct separately billable bedside procedures (CVC, intubation, CPR), evaluate split/shared visit rules, and generate ANSI X12 837P Loop 2400 SV1 lines.',
};

export default function CriticalCareScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Emergency & Critical Care Time Documentation Scrubber',
    url: 'https://aetherahealthcare.com/tools/critical-care-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Evaluate CPT 99291 and 99292 critical care time thresholds, automatically deduct separately billable procedure times under CMS Chapter 12 § 30.6.12, and verify split/shared visit substantive portions.',
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
              Emergency &amp; Critical Care Time Documentation Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Commercial payers aggressively downcode CPT 99291 to 99285 when clinical notes fail to explicitly document
              subtraction of procedure time or lack life-threatening organ deterioration proof. Scrub your critical care
              encounters against statutory CMS time thresholds and split/shared substantive portion rules before claim submission.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <CriticalCareScrubber />

          <ToolConversionBridge
            toolName="Critical Care Scrubber"
            contextText="Are emergency department or ICU claims triggering downcoding audits, CERT recoupments, or split/shared disputes? Aethera's certified emergency medicine coders audit every critical care note for vital organ system impairment and explicit time documentation to defend 100% of your practice's allowable."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
