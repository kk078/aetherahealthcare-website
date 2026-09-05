import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import OrthopedicOncologyScrubber from '@/components/ui/OrthopedicOncologyScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Orthopedic Oncology & Limb Salvage Mega-Prosthesis Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Orthopedic Oncology Mega-Prosthesis & Limb Salvage Scrubber. Audit radical bone tumor resections (CPT 27075/27645), defend modular oncologic mega-prosthesis arthroplasty (27599/27299 + Mod 22), unbundle rotational gastrocnemius flaps (15734-59), and recover catastrophic custom implant pass-through invoices.',
};

export default function OrthopedicOncologyScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Orthopedic Oncology & Limb Salvage Mega-Prosthesis Scrubber',
    url: 'https://aetherahealthcare.com/tools/orthopedic-oncology-limb-salvage-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit musculoskeletal tumor resections, modular oncologic endoprostheses, rotational muscle flap coverage, and catastrophic implant invoice pass-throughs.',
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
              Orthopedic Oncology &amp; Limb Salvage Mega-Prosthesis Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Limb preservation surgery for high-grade osteosarcoma and Ewing sarcoma requires radical en-bloc bone resection,
              modular titanium mega-prosthesis assembly, and rotational muscle flap coverage. Yet commercial payers aggressively
              downgrade custom oncologic reconstructions to routine primary total knees (slashing over 40 wRVUs), bundle soft-tissue
              coverage (15734), and deny $50,000+ modular hardware pass-through invoices. Audit your sarcoma claims with specialized rules.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <OrthopedicOncologyScrubber />

          <ToolConversionBridge
            toolName="Orthopedic Oncology & Limb Salvage Mega-Prosthesis Scrubber"
            contextText="Tertiary sarcoma centers and musculoskeletal tumor surgical groups risk massive financial losses when modular mega-prostheses are downcoded and expensive oncologic implants fail pass-through adjudication."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
