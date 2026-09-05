import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricCellTherapyScrubber from '@/components/ui/PediatricCellTherapyScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Stem Cell & CAR-T Cellular Therapy Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Pediatric Cellular Therapy Scrubber. Audit autologous CAR-T cell infusions (0540T/Q2042), prior authorization dossiers, severe Cytokine Release Syndrome (CRS) critical care (99291), and restaging lumbar puncture unbundling (96450 vs 38222).',
};

export default function PediatricCellTherapyScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Stem Cell & CAR-T Cellular Therapy Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-cell-therapy-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit CAR-T cellular therapy prior authorizations, prevent bone marrow biopsy unbundling denials, and model post-infusion CRS critical care coding.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#3b0764] via-[#0f172a] to-[#1e1b4b]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-purple-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Pediatric Stem Cell &amp; CAR-T Cellular Therapy Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-purple-100/90 max-w-3xl leading-relaxed">
              Cellular immunotherapy and pediatric bone marrow transplantation involve extraordinary reimbursement stakes:
              a single autologous CAR-T dose (tisagenlecleucel, Q2042) exceeds $475,000. Commercial prior-authorization
              pitfalls, routine clearinghouse bundling of restaging intrathecal chemo (96450) into bone marrow biopsy (38222),
              and payer downcoding of post-infusion Cytokine Release Syndrome (CRS) critical care trigger catastrophic losses.
              Audit your cellular oncology dossiers for bulletproof compliance.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricCellTherapyScrubber />

          <ToolConversionBridge
            toolName="Pediatric Cellular Therapy & Oncology RCM"
            contextText="Navigating high-cost CAR-T prior authorization requirements, bone marrow transplant unbundling denials, or intensive CRS critical care appeals? Aethera's specialized pediatric cellular therapy coding experts protect your program."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
