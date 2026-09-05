import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import WhippleResectionScrubber from '@/components/ui/WhippleResectionScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Whipple Procedure & Pancreatic Resection Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Whipple Procedure Scrubber. Audit classic vs pylorus-preserving pancreaticoduodenectomy (48150 vs 48153), defend mesenteric vein vascular reconstruction add-ons (+35221), feeding jejunostomies (44010), and Modifier -62 co-surgeons.',
};

export default function WhippleResectionScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Whipple Procedure & Pancreatic Resection Scrubber',
    url: 'https://aetherahealthcare.com/tools/whipple-resection-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit complex pancreatic resections, defend antrectomy coding on classic Whipple, validate mesenteric vein graft add-ons, and audit multi-specialty co-surgery.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#451a03] via-[#0f172a] to-[#78350f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-amber-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Whipple Procedure &amp; Pancreatic Resection Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-amber-100/90 max-w-3xl leading-relaxed">
              Complex pancreatic surgery carries extreme coding stakes: commercial payers routinely downcode classic
              Whipple procedures (48150) to pylorus-preserving resections (48153), slashing hundreds per claim. Concurrently,
              clearinghouses bundle critical superior mesenteric vein reconstructions (+35221) and enteral feeding
              access (44010) into primary resection packages. Audit your operative dictation for bulletproof compliance.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <WhippleResectionScrubber />

          <ToolConversionBridge
            toolName="Pancreatic & HPB Surgical Oncology RCM"
            contextText="Exhausted by commercial payer downcoding on pancreaticoduodenectomies, vascular add-on bundling rejections, or co-surgeon Modifier 62 suspensions? Aethera's specialized surgical oncology billing specialists capture every dollar."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
