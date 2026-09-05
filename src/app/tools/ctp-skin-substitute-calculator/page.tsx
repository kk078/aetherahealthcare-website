import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import CtpSkinSubstituteCalculator from '@/components/ui/CtpSkinSubstituteCalculator';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Skin Substitute & CTP Wastage Modifier JW / JZ Calculator | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free CMS skin substitute and Cellular & Tissue-Based Product (CTP) wastage calculator. Calculate administered vs discarded sq cm, determine mandatory Modifiers JW and JZ, and generate compliant dual-line ANSI X12 837P Loop 2400 snippets.',
};

export default function CtpSkinSubstituteCalculatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Skin Substitute & CTP Wastage Modifier JW / JZ Calculator',
    url: 'https://aetherahealthcare.com/tools/ctp-skin-substitute-calculator',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Model Medicare Part B skin substitute and CTP single-dose package wastage under Section 90004 of the IIJA and CMS Transmittal 11728. Split administered and discarded square centimeters with Modifiers JW and JZ.',
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
              Skin Substitute &amp; CTP Wastage Modifier JW / JZ Calculator
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              CMS strictly mandates reporting single-use Cellular &amp; Tissue-Based Products (CTPs) on two separate lines:
              administered surface area on Line 1 and discarded product with Modifier JW on Line 2. Omitting Modifier JW
              sacrifices thousands of dollars in legitimate product reimbursement, while failing to bill Modifier JZ on
              zero-waste applications triggers automatic claim denials.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <CtpSkinSubstituteCalculator />

          <ToolConversionBridge
            toolName="CTP Wastage Calculator"
            contextText="Are skin substitute, wound debridement, or hyperbaric oxygen claims triggering Modifier JW/JZ rejections, LCD medical necessity denials, or surgical bundling reductions? Aethera's certified wound care coding specialists verify every square centimeter of administered and discarded graft to protect 100% of your practice allowable."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
