import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import ReconstructivePriorAuthScrubber from '@/components/ui/ReconstructivePriorAuthScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Reconstructive vs Cosmetic Prior-Authorization Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Reconstructive Surgery Prior-Auth Scrubber. Calculate Schnur sliding scale BSA thresholds for breast reduction (CPT 19318), audit blepharoplasty visual field deficits (15823), verify panniculectomy medical necessity (15830), and validate federal WHCRA breast reconstruction mandates.',
};

export default function ReconstructivePriorAuthScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Reconstructive vs Cosmetic Prior-Authorization Scrubber',
    url: 'https://aetherahealthcare.com/tools/reconstructive-prior-auth-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit plastic and reconstructive surgery prior authorization criteria against commercial payer medical LCD policies, Schnur sliding scale thresholds, and federal WHCRA mandates.',
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
              Reconstructive vs. Cosmetic Prior-Authorization Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Commercial payers aggressively downcode and deny reconstructive procedures as cosmetic. Prevent prior-auth
              denials by validating Schnur sliding scale resection minimums (CPT 19318), blepharoplasty visual field
              impairment (CPT 15823), panniculectomy clinical criteria (CPT 15830), and federal WHCRA statutory coverage
              guarantees before submitting clinical dossiers.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <ReconstructivePriorAuthScrubber />

          <ToolConversionBridge
            toolName="Reconstructive Surgery Prior-Auth Scrubber"
            contextText="Tired of commercial cosmetic downcodings, delayed peer-to-peer reviews, or denied reconstructive surgery claims? Aethera provides certified surgical RCM specialists who author rock-solid clinical dossiers and overturn payer denials."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
