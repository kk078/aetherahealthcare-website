import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import ColorectalExenterationScrubber from '@/components/ui/ColorectalExenterationScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Colorectal Surgery & Pelvic Exenteration Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Colorectal Surgery & Pelvic Exenteration Scrubber. Audit total mesorectal excision (45119/45110), pelvic exenteration (45126), defend protective loop ileostomy unbundling (44320-XE), and validate Modifier -62 co-surgeon billing.',
};

export default function ColorectalExenterationScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Colorectal Surgery & Pelvic Exenteration Scrubber',
    url: 'https://aetherahealthcare.com/tools/colorectal-exenteration-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit complex colorectal resections, defend colonic J-pouch LAR from downcoding, model diverting loop ileostomy separate-incision defense, and audit multidisciplinary pelvic exenteration co-surgery.',
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
              Colorectal Surgery &amp; Pelvic Exenteration Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Colorectal oncology cases face aggressive payer auditing: clearinghouses bundle protective diverting
              loop ileostomies (44320) into low anterior resections (45119), downcode colonic J-pouch reservoirs to
              simple colectomy (44145), and reject co-surgeon Modifier -62 claims during multivisceral pelvic exenteration
              (45126). Audit your operative dictation for bulletproof compliance.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <ColorectalExenterationScrubber />

          <ToolConversionBridge
            toolName="Colorectal Surgery & Pelvic Oncology RCM"
            contextText="Tired of commercial payer clawbacks on low anterior resections, bundled loop ileostomies, or disputed pelvic exenteration co-surgery? Aethera's specialized colorectal billing team recovers 100% of earned RVUs."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
