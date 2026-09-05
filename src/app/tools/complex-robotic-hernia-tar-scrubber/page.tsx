import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import ComplexRoboticHerniaTarScrubber from '@/components/ui/ComplexRoboticHerniaTarScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Complex Robotic Hernia & TAR Component Separation Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Complex Robotic & Laparoscopic Hernia Reconstruction Scrubber. Audit modern CPT 2023+ ventral hernia codes (49591–49618), unbundle posterior component separation with transversus abdominis release (TAR add-on +49622), and capture mesh placement (+49623).',
};

export default function ComplexRoboticHerniaTarScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Complex Robotic Hernia & TAR Component Separation Scrubber',
    url: 'https://aetherahealthcare.com/tools/complex-robotic-hernia-tar-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit modern CPT 2023+ anterior abdominal wall hernia repairs, transversus abdominis release (TAR) add-on codes, retrorectus mesh placement, and non-contiguous defects.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#1c1917] via-[#0f172a] to-[#292524]">
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
              Complex Robotic Hernia &amp; TAR Component Separation Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              The 2023 CPT overhaul eliminated the historical division between open and laparoscopic ventral hernia repairs, introducing unified size-stratified codes (49591–49618) and distinct add-on codes for transversus abdominis release (TAR +49622) and mesh implantation (+49623). However, commercial clearinghouses and Medicare MACs continue to improperly bundle myofascial component releases into primary repairs or downcode defect tiers. Scrutinize your complex abdominal wall reconstructions with automated compliance checks.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <ComplexRoboticHerniaTarScrubber />

          <ToolConversionBridge
            toolName="Complex Robotic Hernia & TAR Component Separation Scrubber"
            contextText="General surgeons and advanced robotic abdominal wall reconstruction centers lose significant revenue when clearinghouses apply outdated pre-2023 bundling edits to transversus abdominis release and mesh add-ons."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
