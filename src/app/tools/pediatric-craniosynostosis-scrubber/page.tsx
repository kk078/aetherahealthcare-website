import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricCraniosynostosisScrubber from '@/components/ui/PediatricCraniosynostosisScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Cranial Vault Remodeling & Synostosis Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric Craniosynostosis & Cranial Vault Remodeling Scrubber. Audit fronto-orbital advancement (CPT 21175), complex multi-suture remodeling (21180), co-surgeon Modifier -62 orchestration, split-calvarial bone grafts (20900-59), and cranial molding orthosis helmet DME (L0112).',
};

export default function PediatricCraniosynostosisScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Cranial Vault Remodeling & Synostosis Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-craniosynostosis-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit open fronto-orbital advancement, complex cranial vault remodeling, co-surgeon Modifier -62 pairing between neurosurgery and craniofacial plastics, and helmet DME claims.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#0c2340] via-[#0f172a] to-[#1e3a8a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-blue-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Pediatric Cranial Vault Remodeling &amp; Synostosis Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-blue-100/90 max-w-3xl leading-relaxed">
              Pediatric craniosynostosis reconstruction brings together pediatric neurosurgery and pediatric craniofacial
              plastic surgery for life-changing cranial expansion. Yet payer cross-matching frequently triggers catastrophic
              Modifier -62 co-surgeon unbundling rejections, disallows split-thickness calvarial bone grafts, and rejects
              postoperative cranial molding helmet therapy (HCPCS L0112). Audit your surgical cases with real-time clinical rules.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricCraniosynostosisScrubber />

          <ToolConversionBridge
            toolName="Pediatric Cranial Vault Remodeling Scrubber"
            contextText="Pediatric craniofacial and neurosurgical reconstructions face steep co-surgeon Modifier -62 audits and helmet DME prior-authorization hurdles."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
