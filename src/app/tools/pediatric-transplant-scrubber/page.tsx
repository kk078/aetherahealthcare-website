import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricTransplantScrubber from '@/components/ui/PediatricTransplantScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Intestinal Rehabilitation & Transplant Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric Transplant Scrubber. Audit STEP enteroplasty (CPT 44130), isolated small bowel and composite liver-intestine transplants (44135/47135), bench vascular reconstructions (+44720), and organ acquisition cost carve-outs.',
};

export default function PediatricTransplantScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Intestinal Rehabilitation & Transplant Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-transplant-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit complex pediatric intestinal transplantation, autologous STEP enteroplasty, back-table vascular bench reconstructive add-ons, and Medicare Worksheet D-4 organ acquisition carving.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#064e3b] via-[#0f172a] to-[#047857]">
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
              Pediatric Intestinal Rehabilitation &amp; Transplant Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-emerald-100/90 max-w-3xl leading-relaxed">
              Pediatric abdominal organ transplantation and intestinal lengthening present severe revenue cycle hazards:
              insurers label autologous STEP procedures (44130) as &quot;investigational&quot;, bundle delicate vascular
              bench reconstructions (+44720/+44721), and cause fatal claim rejections by confusing hospital organ
              acquisition cost centers with professional recipient surgery. Audit your claims with clinical precision.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricTransplantScrubber />

          <ToolConversionBridge
            toolName="Pediatric Transplant & Intestinal Rehabilitation RCM"
            contextText="Tired of fighting commercial payer non-coverage denials on STEP enteroplasties, back-table vascular add-on bundles, or organ acquisition accounting rejections? Aethera's specialized pediatric transplant surgical billing directors overturn denials and protect your clinical revenue."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
