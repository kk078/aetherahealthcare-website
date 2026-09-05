import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricEpilepsyScrubber from '@/components/ui/PediatricEpilepsyScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Hemispherotomy & Stereo-EEG Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric Epilepsy Surgery Scrubber. Audit stereo-EEG (CPT 61760), robotic cranial stereotaxy (+61781), staged hemispherotomy (61543-58), and continuous video-EEG (95724).',
};

export default function PediatricEpilepsyScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Hemispherotomy & Stereo-EEG Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-epilepsy-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit pediatric epilepsy surgery coding, defend sEEG trajectory add-ons (+61781), staged hemispherotomy disconnections (61543), and continuous video-EEG monitoring.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#2e1065] via-[#0f172a] to-[#3b0764]">
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
              Pediatric Hemispherotomy &amp; Stereo-EEG Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-purple-100/90 max-w-3xl leading-relaxed">
              Pediatric epilepsy surgery demands meticulous multi-stage coding across invasive stereo-EEG electrode implantation,
              stereotactic robotic guidance, continuous long-term video-EEG monitoring, and second-stage hemispherotomy or laser
              ablation. Commercial insurers frequently downcode complete hemispherotomies (61543) to simple lobectomies,
              deny robotic guidance (+61781), or reject staged procedures due to missing Modifier -58.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricEpilepsyScrubber />

          <ToolConversionBridge
            toolName="Pediatric Neurosurgery & Comprehensive Epilepsy RCM"
            contextText="Frustrated by commercial payer downcoding on pediatric hemispherotomies, sEEG unbundling denials, or staged procedure Modifier 58 disputes? Aethera's specialized pediatric neurosurgical coding team secures your reimbursement."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
