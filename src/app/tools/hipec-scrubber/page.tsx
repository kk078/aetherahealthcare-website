import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import HipecScrubber from '@/components/ui/HipecScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Cytoreductive Surgery & HIPEC Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Cytoreductive Surgery (CRS) & HIPEC Scrubber. Audit multivisceral peritonectomy (CPT 49205), defend 90-minute hyperthermic peritoneal chemoperfusion (+96560), coordinate co-surgeon Modifier -62, and safeguard concomitant bowel resections (44140-51).',
};

export default function HipecScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Cytoreductive Surgery & HIPEC Scrubber',
    url: 'https://aetherahealthcare.com/tools/hipec-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit multivisceral peritonectomy, heated intraperitoneal chemoperfusion (+96560), co-surgeon Modifier -62 pairing, and concomitant bowel resections.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#451a03] via-[#0f172a] to-[#7c2d12]">
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
              Cytoreductive Surgery &amp; HIPEC Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-amber-100/90 max-w-3xl leading-relaxed">
              Cytoreductive surgery paired with hyperthermic intraperitoneal chemotherapy (HIPEC) demands rigorous
              multi-specialty surgical coordination across surgical oncology and gynecologic oncology. Yet commercial
              payers frequently reject heated chemoperfusion (+96560) as experimental, downcode extensive peritonectomies,
              and bundle concomitant bowel resections. Audit your complex surgical oncology claims with automated clinical rules.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <HipecScrubber />

          <ToolConversionBridge
            toolName="Surgical Oncology & Peritoneal Malignancy RCM"
            contextText="Frustrated by commercial payer denials on 90-minute HIPEC perfusion (+96560), downcoded peritonectomy claims, or unbundling rejections on concomitant visceral resections? Aethera's oncology surgical coding specialists ensure every dollar earned is recovered."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
