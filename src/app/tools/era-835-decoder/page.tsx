import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import Era835Decoder from '@/components/ui/Era835Decoder';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: '835 Electronic Remittance Advice (ERA) Decoder | Aethera Healthcare Solutions',
  },
  description:
    'Free X12 835 ERA parser and claim remittance decoder. Understand CLP, CAS adjustment group codes (CO, PR, OA) and get immediate step-by-step overturn workflows.',
};

export default function Era835DecoderPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '835 Electronic Remittance Advice (ERA) Decoder',
    url: 'https://aetherahealthcare.com/tools/era-835-decoder',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free interactive tool to parse raw X12 835 electronic remittance advice and translate CAS adjustment codes into actionable billing workflows.',
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
              835 Electronic Remittance Advice (ERA) Decoder
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Decipher complex 835 claim adjustment loops (CLP, CAS, SVC) instantly. Translate CO contractual write-offs,
              PR patient responsibility balances, and OA adjustments into clear financial allocations and appeal plans.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <Era835Decoder />

          <ToolConversionBridge
            toolName="835 ERA Decoder"
            contextText="Tired of reconciling 835 remittances manually across multiple clearinghouses? Aethera automated payment posting reconciles 100% of ERAs within 24 hours with zero-pay auditing."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
