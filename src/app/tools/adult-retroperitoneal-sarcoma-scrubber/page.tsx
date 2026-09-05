import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import AdultRetroperitonealSarcomaScrubber from '@/components/ui/AdultRetroperitonealSarcomaScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Adult Retroperitoneal Sarcoma & Multivisceral Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Complex Adult Retroperitoneal Sarcoma & Multivisceral Scrubber. Audit radical retroperitoneal tumor excision (49203–49205), en-bloc nephrectomy (50240-59), contiguous adrenalectomy (60540-59), colectomy (44140-59), and IVC vascular reconstruction (35281-59).',
};

export default function AdultRetroperitonealSarcomaScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Adult Retroperitoneal Sarcoma & Multivisceral Scrubber',
    url: 'https://aetherahealthcare.com/tools/adult-retroperitoneal-sarcoma-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit radical retroperitoneal soft-tissue sarcoma resections, contiguous multivisceral organ clearance (radical nephrectomy, adrenalectomy, hemicolectomy), and major vascular IVC replacement grafts.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#1c1917]">
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
              Adult Retroperitoneal Sarcoma &amp; Multivisceral Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Curative surgical oncology for high-grade retroperitoneal sarcomas demands radical compartment clearance with contiguous multivisceral organ sacrifice (nephrectomy, adrenalectomy, colon resection) and major vascular reconstructions. Commercial health plans aggressively bundle these critical en-bloc resections under generic soft-tissue mass codes (CPT 49205). Defend your multivisceral surgical claims.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <AdultRetroperitonealSarcomaScrubber />

          <ToolConversionBridge
            toolName="Adult Retroperitoneal Sarcoma & Multivisceral Scrubber"
            contextText="Surgical oncology practices lose upwards of $4,500 to $9,000 per retroperitoneal sarcoma case when payers bundle contiguous radical nephrectomies or claw back IVC vascular reconstruction add-ons."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
