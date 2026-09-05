import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricDbsScrubber from '@/components/ui/PediatricDbsScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric DBS & Cranial Neuromodulation Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric DBS & Cranial Neuromodulation Scrubber. Audit stereotactic lead placement with microelectrode recording (CPT 61867/+61868), suppress headframe bundling rejections (20660), protect dual-channel IPGs (61886-59/58), and capture intraoperative neuroprogramming (95983).',
};

export default function PediatricDbsScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric DBS & Cranial Neuromodulation Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-dbs-neuromodulation-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit pediatric deep brain stimulation (DBS), microelectrode recording (MER), stereotactic head frame unbundling, and dual-array implantable pulse generator placement.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#0b192c] via-[#0f172a] to-[#1e3e62]">
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
              Pediatric DBS &amp; Cranial Neuromodulation Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Pediatric deep brain stimulation (DBS) for severe generalized dystonia, epileptic encephalopathies, and intractable movement disorders demands submillimeter neurosurgical precision. Yet clearinghouses routinely bundle headframe application (20660), downcode multi-track microelectrode cellular recordings (61867 vs 61863), and disallow dual-channel pulse generators (61886). Audit your operative claims with automated NCCI validation rules.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricDbsScrubber />

          <ToolConversionBridge
            toolName="Pediatric DBS & Cranial Neuromodulation Scrubber"
            contextText="Pediatric neurosurgery programs and academic children's hospitals face extensive payer scrutiny on stereotactic lead guidance, intraoperative MER cellular mapping, and dual-channel pulse generator carve-out reimbursement."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
