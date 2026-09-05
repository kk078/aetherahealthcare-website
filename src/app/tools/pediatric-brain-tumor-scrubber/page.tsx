import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricBrainTumorScrubber from '@/components/ui/PediatricBrainTumorScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Brain Tumor & Intraoperative Monitoring Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Pediatric Brain Tumor & IONM Scrubber. Audit posterior fossa craniotomy (61518/61520), intraoperative neurophysiological monitoring (95940/95941), defend external ventricular drain unbundling (61107-59), and protect stereotactic neuronavigation add-ons (+61781).',
};

export default function PediatricBrainTumorScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Brain Tumor & Intraoperative Monitoring Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-brain-tumor-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit pediatric posterior fossa brain tumor resections, defend infratentorial craniectomies from payer downcoding, validate continuous IONM supervision compliance, and model pre-craniotomy ventricular drain unbundling.',
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
              Pediatric Brain Tumor &amp; Intraoperative Monitoring Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-indigo-100/90 max-w-3xl leading-relaxed">
              Pediatric neuro-oncology procedures carry rigorous billing standards: commercial payers routinely
              downcode complex infratentorial/posterior fossa resections (61518) to simple supratentorial craniectomies
              (61510), cutting thousands per case. Concurrently, intraoperative neurophysiological monitoring (95940/95941)
              faces aggressive supervision audits, and pre-craniotomy ventricular drains (61107) are bundled without
              proper modifier defense. Audit your pediatric neurosurgical claims for peak revenue integrity.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricBrainTumorScrubber />

          <ToolConversionBridge
            toolName="Pediatric Neurosurgery & Neuro-Oncology RCM"
            contextText="Facing payer downcoding on posterior fossa tumor resections, clawbacks on remote IONM supervision, or denied external ventricular drain add-ons? Aethera's specialized neurosurgical coding team secures maximum allowable reimbursement."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
