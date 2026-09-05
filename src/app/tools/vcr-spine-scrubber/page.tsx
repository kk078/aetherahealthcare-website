import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import VcrSpineScrubber from '@/components/ui/VcrSpineScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Vertebral Column Resection & 3-Column Osteotomy Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free VCR Spine Scrubber. Audit 3-column osteotomies (CPT 22206/22207), additional segment add-ons (+22208), spinopelvic fixation (+22848), and dual-attending Modifier -62 co-surgery.',
};

export default function VcrSpineScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Vertebral Column Resection & 3-Column Osteotomy Scrubber',
    url: 'https://aetherahealthcare.com/tools/vcr-spine-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit complex 3-column spinal osteotomy coding, counter commercial downcoding to simple posterior osteotomy, and validate pelvic fixation and co-surgeon Modifier 62 compliance.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#312e81]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-indigo-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Vertebral Column Resection &amp; 3-Column Osteotomy Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-indigo-100/90 max-w-3xl leading-relaxed">
              Vertebral Column Resection (VCR) and Pedicle Subtraction Osteotomy (PSO) represent the highest-acuity
              reconstructive spine procedures in surgery. However, commercial insurers routinely downcode 3-column osteotomies
              (22206/22207) to posterior column releases (22212) or simple fusions, unbundle spinopelvic anchors (+22848),
              and suspend dual-attending co-surgeon claims. Defend your surgical yield with automated scrub intelligence.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <VcrSpineScrubber />

          <ToolConversionBridge
            toolName="Complex Spine Deformity & Scoliosis RCM"
            contextText="Frustrated by commercial payer downcoding on high-risk 3-column osteotomies, pelvic fixation unbundling clawbacks, or Modifier 62 co-surgeon suspensions? Aethera's specialized spine surgery billing team protects every dollar."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
