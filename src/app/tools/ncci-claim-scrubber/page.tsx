import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import NcciClaimScrubber from '@/components/ui/NcciClaimScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'CMS NCCI Claim Scrubber & Modifier Validator | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free CMS NCCI Procedure-to-Procedure (PTP) bundling edit checker. Validate modifier 25, 59, XS, and XE applicability to prevent CARC 97 bundling denials.',
};

export default function NcciClaimScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CMS NCCI Claim Scrubber & Modifier Validator',
    url: 'https://aetherahealthcare.com/tools/ncci-claim-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free interactive tool to validate medical billing CPT bundling rules and modifier applicability based on official CMS NCCI edits.',
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
              CMS NCCI Claim Scrubber &amp; Modifier Validator
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Verify procedure bundling rules before claim submission. Test any two CPT codes against National
              Correct Coding Initiative (NCCI) edit indicators (0 vs 1), review modifier -25 and -59/-XS requirements,
              and prevent unbundling rejections.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <NcciClaimScrubber />

          <ToolConversionBridge
            toolName="NCCI Claim Scrubber"
            contextText="Tired of receiving CARC 97 bundling rejections on E/M with minor procedures? Aethera automated scrubbers audit every claim line with 100% compliance before EDI transmission."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
