import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import ScoliosisDeformityScrubber from '@/components/ui/ScoliosisDeformityScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Scoliosis & Multi-Rod Deformity Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Pediatric Scoliosis & Multi-Rod Deformity Scrubber. Audit posterior spinal deformity fusions (22800, 22802, 22804), prevent payer interspace downcoding, safeguard pelvic fixation (+22848), and validate multi-level Ponte osteotomy claims.',
};

export default function ScoliosisDeformityScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Scoliosis & Multi-Rod Deformity Scrubber',
    url: 'https://aetherahealthcare.com/tools/scoliosis-deformity-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit complex pediatric spinal deformity arthrodesis episodes, combat payer interspace downcoding of CPT 22804, validate pelvic fixation (+22848) and multi-level Ponte osteotomy claims.',
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
              Pediatric Scoliosis &amp; Deformity Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-indigo-100/90 max-w-3xl leading-relaxed">
              Pediatric spinal deformity corrections for adolescent idiopathic scoliosis (AIS) and neuromuscular curves
              involve intensive surgical planning across 10 to 18+ vertebral levels. Payers aggressively downcode CPT 22804
              by counting disc spaces rather than vertebral bodies, bundle pelvic fixation (+22848) into instrumentation, or
              slash 50% through misapplied Modifier -51 deductions. Simulate your deformity reconstructive cases and ensure
              bulletproof audit defense.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <ScoliosisDeformityScrubber />

          <ToolConversionBridge
            toolName="Pediatric Scoliosis RCM Scrubber"
            contextText="Facing payer downcoding on long-segment deformity fusions, bundling denials on pelvic anchor fixation (+22848), or complex multi-rod prior authorization disputes? Aethera's specialized pediatric orthopedic spine billing auditors maximize your practice reimbursement."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
