import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricFacialReanimationScrubber from '@/components/ui/PediatricFacialReanimationScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Facial Reanimation & Free Gracilis Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric Facial Reanimation Scrubber. Audit dynamic smile reanimation, cross-face sural nerve grafting (CPT 64890/64891), Stage 2 free gracilis transfer (15756) with staged Modifier -58, and masseteric nerve transposition (64864-51).',
};

export default function PediatricFacialReanimationScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Facial Reanimation & Free Gracilis Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-facial-reanimation-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit pediatric dynamic facial reanimation, two-stage sural nerve grafting and free gracilis transfer, staged Modifier -58 protection, and masseteric nerve transposition.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#2e1065] via-[#0f172a] to-[#701a75]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-fuchsia-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Pediatric Facial Reanimation &amp; Free Gracilis Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-fuchsia-100/90 max-w-3xl leading-relaxed">
              Restoring spontaneous smile and facial symmetry in children with congenital Moebius syndrome
              or acquired facial palsy demands multi-stage microsurgery. Yet commercial payers aggressively
              deny second-stage free gracilis transfer (15756) under global surgical period bundles, unbundle
              sural nerve grafting, and bundle masseteric nerve transpositions. Protect your surgical practice with automated NCCI validation.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricFacialReanimationScrubber />

          <ToolConversionBridge
            toolName="Pediatric Craniofacial & Microsurgical RCM"
            contextText="Tired of commercial payer clawbacks on multi-stage dynamic facial reanimation, bundled masseteric nerve transpositions, or disputed operating microscope add-ons? Aethera's specialized pediatric plastic and microsurgical coding team recovers your earned revenue."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
