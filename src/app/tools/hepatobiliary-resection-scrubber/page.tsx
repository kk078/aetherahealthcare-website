import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import HepatobiliaryResectionScrubber from '@/components/ui/HepatobiliaryResectionScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Hepatobiliary Resection & Biliary Reconstruction Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Hepatobiliary Resection Scrubber. Audit extended hepatic trisegmentectomy (47125), lobectomy (47130), defend payer downcoding to partial wedge (47120), safeguard vascular reconstruction (+35221), and unbundle Roux-en-Y biliary reconstruction (47760).',
};

export default function HepatobiliaryResectionScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Hepatobiliary Resection & Biliary Reconstruction Scrubber',
    url: 'https://aetherahealthcare.com/tools/hepatobiliary-resection-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit complex hepatic resections, defend extended trisegmentectomy downcodings, model vascular reconstruction add-ons, and audit Roux-en-Y biliary reconstructions.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#064e3b] via-[#0f172a] to-[#042f2e]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-emerald-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Hepatobiliary Resection &amp; Biliary Reconstruction Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-emerald-100/90 max-w-3xl leading-relaxed">
              Complex hepatic resections face systematic commercial payer downcoding: plans reclassify extended
              trisegmentectomy (47125) to partial hepatectomy (47120), slashing over $1,290 per case. Concurrently,
              clearinghouses unlawfully bundle portal vein/hepatic artery reconstructions (+35221) and Roux-en-Y
              hepaticojejunostomy (47760) into parenchymal resection fees. Audit your HPB surgical claims for maximum allowable yield.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <HepatobiliaryResectionScrubber />

          <ToolConversionBridge
            toolName="Hepatobiliary & Surgical Oncology RCM"
            contextText="Frustrated by commercial payer downcoding of complex anatomic hepatectomies, bundling denials on vascular reconstructions, or co-surgery Modifier 62 rejections? Aethera's specialized HPB surgical coding team recovers every earned dollar."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
