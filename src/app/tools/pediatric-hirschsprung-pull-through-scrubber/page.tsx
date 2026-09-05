import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricHirschsprungPullThroughScrubber from '@/components/ui/PediatricHirschsprungPullThroughScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Hirschsprung Pull-Through Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric Hirschsprung Pull-Through Scrubber. Audit congenital aganglionic megacolon pull-through procedures (45120/45112), intraoperative leveling seromuscular biopsies (+44150-59), laparoscopic mobilization (49320-59), and staged diversion reversal (Modifier -58).',
};

export default function PediatricHirschsprungPullThroughScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Hirschsprung Pull-Through Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-hirschsprung-pull-through-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit pediatric Hirschsprung pull-through claims, defend leveling seromuscular mapping biopsies, laparoscopic mobilization unbundling, and staged post-colostomy pull-through procedures.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#0c373b] via-[#0d4b4f] to-[#042f2e]">
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
              Pediatric Hirschsprung Pull-Through Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Congenital Hirschsprung pull-through surgery (TERPT, Soave, Duhamel, Swenson) requires extensive multi-level diagnostic mapping biopsies to verify normal ganglion cells before establishing the coloanal anastomosis. However, pediatric surgery centers lose thousands per case when commercial payers bundle intraoperative leveling biopsies (+44150) or disallow laparoscopic colonic mobilization (49320). Scrub and defend your congenital colorectal claims.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricHirschsprungPullThroughScrubber />

          <ToolConversionBridge
            toolName="Pediatric Hirschsprung Pull-Through Scrubber"
            contextText="Children's surgical hospitals lose up to $3,200 per case when clearinghouses bundle multiple intraoperative frozen section leveling biopsies into primary proctectomy codes."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
