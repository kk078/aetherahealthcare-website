import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricBiochemicalGeneticsScrubber from '@/components/ui/PediatricBiochemicalGeneticsScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Biochemical Genetics & Metabolic Formula Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric Biochemical Genetics & Metabolic Formula Scrubber. Audit tandem mass spectrometry amino acid panels (82139/82136), urine organic acid chromatography (83918), prolonged geneticist visits (+99417), and defend medical food prior-auth (HCPCS B4162/B4157).',
};

export default function PediatricBiochemicalGeneticsScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Biochemical Genetics & Metabolic Formula Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-biochemical-genetics-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit inborn errors of metabolism lab panels, tandem mass spectrometry, prolonged medical genetics counseling, and specialized medical food authorization.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#042f2e] via-[#0f172a] to-[#115e59]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-teal-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Pediatric Biochemical Genetics &amp; Metabolic Formula Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Managing inborn errors of metabolism (MMA, PA, MSUD, PKU, Urea Cycle Disorders) requires complex tandem mass spectrometry profiling, prolonged genetic counseling, and lifesaving medical foods. Yet commercial clearinghouses disallow quantitative fractionations (82139), downcode prolonged visits (+99417), and reject essential amino acid formulas (B4162) as over-the-counter supplements. Audit your biochemical genetics claims with statutory coverage rules.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricBiochemicalGeneticsScrubber />

          <ToolConversionBridge
            toolName="Pediatric Biochemical Genetics & Metabolic Formula Scrubber"
            contextText="Pediatric genetics clinics and academic rare disease centers face extensive prior-authorization disputes on medical formulas, prolonged geneticist counseling, and tandem mass spectrometry analyte unbundling."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
