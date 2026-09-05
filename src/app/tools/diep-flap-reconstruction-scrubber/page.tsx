import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import DiepFlapReconstructionScrubber from '@/components/ui/DiepFlapReconstructionScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'DIEP Flap Breast Reconstruction Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free DIEP Flap Breast Reconstruction Claim Scrubber. Audit autologous microvascular free flaps (CPT 19364), bilateral reconstruction (19364-50), operating microscope (+69990), ICG laser angiography (+15860), second venous coupling (35201-59), and WHCRA parity rules.',
};

export default function DiepFlapReconstructionScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'DIEP Flap Breast Reconstruction Scrubber',
    url: 'https://aetherahealthcare.com/tools/diep-flap-reconstruction-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit autologous microvascular DIEP breast reconstructions, defend bilateral reconstruction claims under federal WHCRA rules, prevent operating microscope bundling, and protect second venous anastomosis reimbursement.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#1e1b4b] via-[#311042] to-[#0f172a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-pink-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              DIEP Flap Breast Reconstruction Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-pink-100/90 max-w-3xl leading-relaxed">
              Autologous microvascular DIEP flap breast reconstruction represents pinnacle reconstructive surgery. However, plastic and reconstructive practices lose tens of thousands of dollars when payers improperly downcode bilateral DIEP flaps (19364-50), disallow operating microscope add-ons (+69990), deny vital ICG perfusion angiography (+15860), or bundle secondary venous outflow anastomoses (35201-59). Audit your operative claims with statutory WHCRA precision.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <DiepFlapReconstructionScrubber />

          <ToolConversionBridge
            toolName="DIEP Flap Breast Reconstruction Scrubber"
            contextText="Reconstructive microsurgical practices lose over $5,800 per bilateral DIEP reconstruction when payers improperly bundle operating microscopes or reduce bilateral free flap allowance."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
