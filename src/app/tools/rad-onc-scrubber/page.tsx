import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import RadOncScrubber from '@/components/ui/RadOncScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Radiation Oncology IMRT Bundling & Fraction Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Radiation Oncology Scrubber. Validate IMRT treatment planning (CPT 77301) bundling edits against simulation and dosimetry, compute CPT 77427 weekly treatment management fraction math, and generate ANSI X12 837P claim lines.',
};

export default function RadOncScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Radiation Oncology Treatment Planning & IMRT Bundling Scrubber',
    url: 'https://aetherahealthcare.com/tools/rad-onc-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit radiation oncology planning, medical physics, and weekly treatment management (CPT 77427) under CMS MPFS Chapter 13 and ASTRO NCCI guidelines.',
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
              Radiation Oncology IMRT Bundling &amp; Fraction Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              CMS Chapter 13 MPFS and ASTRO guidelines enforce strict NCCI bundling edits between IMRT Planning (CPT 77301),
              dosimetry (77300), and 3D simulation (77295). In addition, Weekly Radiation Treatment Management (CPT 77427)
              requires exact 5-fraction increments with specific rules for treatment end remainders. Scrub your planning
              packages and fraction calculations before claim transmission.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <RadOncScrubber />

          <ToolConversionBridge
            toolName="Radiation Oncology Scrubber"
            contextText="Frustrated with IMRT bundling denials, medical physics downcoding, or proton therapy prior authorizations? Aethera delivers certified radiation oncology coding specialists who protect revenue across external beam, SBRT, and proton treatments."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
