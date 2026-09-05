import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import TaaaFevarScrubber from '@/components/ui/TaaaFevarScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Complex FEVAR & TAAA Aortic Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Complex Fenestrated/Branched EVAR (FEVAR) & TAAA Scrubber. Audit multi-vessel visceral aortic endografts (CPT 34841-34848), defend open Crawford TAAA resections (33877), unbundle prophylactic spinal cord lumbar CSF drains (62272-59), and coordinate co-surgeon Modifier -62 matching.',
};

export default function TaaaFevarScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Complex Fenestrated/Branched EVAR (FEVAR) & TAAA Scrubber',
    url: 'https://aetherahealthcare.com/tools/taaa-fevar-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit fenestrated and branched endovascular aortic repair, open Crawford TAAA replacement, spinal cord protective lumbar CSF drainage, and vascular co-surgeon Modifier -62 orchestration.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#450a0a] via-[#0f172a] to-[#7f1d1d]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-rose-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Complex FEVAR &amp; TAAA Aortic Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-rose-100/90 max-w-3xl leading-relaxed">
              Complex thoracoabdominal aortic aneurysm (TAAA) repair and multi-vessel fenestrated/branched endovascular
              grafting (FEVAR / BEVAR) require extraordinary technical skill and precision. Yet commercial payers frequently
              downcode multi-branch visceral repairs (34841-34848), reject neuroprotective lumbar CSF drain catheters (62272)
              as inclusive, and fail dual-attending co-surgeon claims. Audit your complex aortic reconstructive cases with automated
              clinical guidelines.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <TaaaFevarScrubber />

          <ToolConversionBridge
            toolName="Complex FEVAR & TAAA Aortic Scrubber"
            contextText="High-volume aortic institutes and vascular programs face recurring unbundling rejections on multi-branch FEVAR procedures, lumbar CSF drainage catheters, and co-surgeon Modifier -62 pairings."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
