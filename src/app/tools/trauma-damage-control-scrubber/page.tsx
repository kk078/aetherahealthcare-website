import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import TraumaDamageControlScrubber from '@/components/ui/TraumaDamageControlScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Trauma & Open Abdomen Damage Control Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Trauma & Open Abdomen Damage Control Scrubber. Audit staged damage control laparotomy (49000, 49002), secondary fascial closure (13160), bedside vascular line unbundling, and enforce Modifier 58 vs 78 compliance.',
};

export default function TraumaDamageControlScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Trauma & Open Abdomen Damage Control Scrubber',
    url: 'https://aetherahealthcare.com/tools/trauma-damage-control-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit staged damage control laparotomy, open abdomen temporary closure, critical care time carve-outs, and Modifier 58 vs 78 surgical billing compliance.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#450a0a] via-[#0f172a] to-[#1e1b4b]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-red-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Trauma &amp; Open Abdomen Damage Control Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-red-100/90 max-w-3xl leading-relaxed">
              Acute care and trauma surgical episodes involve rapid-fire resuscitations and staged re-explorations.
              Failing to append Modifier -58 to planned 49002 re-openings causes 100% global bundling denials, while mistakenly
              using Modifier -78 slashes 30% of your allowable fee. Concurrently, failing to carve out procedural time from
              critical care (99291) triggers severe RAC clawbacks. Audit your trauma episodes for zero audit vulnerability.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <TraumaDamageControlScrubber />

          <ToolConversionBridge
            toolName="Trauma Surgery RCM Scrubber"
            contextText="Facing damage control laparotomy denials, downcoded critical care time, or complex multi-cavity trauma bundling rejections? Aethera's specialized acute care and surgical critical care coding experts recover every legitimate dollar."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
