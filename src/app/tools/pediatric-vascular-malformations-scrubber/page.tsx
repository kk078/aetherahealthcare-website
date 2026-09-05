import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricVascularScrubber from '@/components/ui/PediatricVascularScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Vascular Malformations & Sclerotherapy Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric Vascular Malformations & Sclerotherapy Scrubber. Audit image-guided percutaneous sclerotherapy (CPT 37241/49185), defend off-label Bleomycin J9040 prior authorizations, unbundle dual ultrasound/fluoroscopy (+76937/+77002), and protect planned staged sessions with Modifier -58.',
};

export default function PediatricVascularScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Vascular Malformations & Sclerotherapy Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-vascular-malformations-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit pediatric vascular anomaly sclerotherapy, off-label Bleomycin J-codes, dual imaging guidance, and staged procedure Modifier -58.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#042f2e] via-[#0f172a] to-[#134e4a]">
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
              Pediatric Vascular Malformations &amp; Sclerotherapy Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Pediatric vascular anomalies—including low-flow venous (VM), lymphatic (LM), and high-flow arteriovenous
              malformations (AVM)—demand multidisciplinary care. Yet commercial payers frequently issue automated denials
              for off-label Bleomycin (J9040) sclerotherapy, bundle dual ultrasound (+76937) and fluoroscopy (+77002),
              and initiate 90-day global period clawbacks on staged treatment sessions. Audit your claims with specialized pediatric IR scrubbing rules.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricVascularScrubber />

          <ToolConversionBridge
            toolName="Pediatric Vascular Malformations & Sclerotherapy Scrubber"
            contextText="Pediatric interventional radiology groups and vascular anomaly centers lose up to 35% of allowable revenue to off-label sclerosant drug rejections, unbundled imaging guidance, and mismanaged global periods."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
