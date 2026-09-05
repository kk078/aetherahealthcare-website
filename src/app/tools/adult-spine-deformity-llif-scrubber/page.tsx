import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import AdultSpineDeformityLlifScrubber from '@/components/ui/AdultSpineDeformityLlifScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Adult Spine Deformity & Multi-Level LLIF Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Multi-Level Minimally Invasive Adult Spinal Deformity & LLIF/XLIF Scrubber. Audit primary arthrodesis (22558), multi-level add-ons (+22552), ALLR release (+Mod 22), percutaneous instrumentation (+22842–+22843), and spinopelvic S2AI anchors (+22848).',
};

export default function AdultSpineDeformityLlifScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Adult Spine Deformity & Multi-Level LLIF Scrubber',
    url: 'https://aetherahealthcare.com/tools/adult-spine-deformity-llif-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit multi-level lateral lumbar interbody fusion (LLIF/XLIF), anterior longitudinal ligament release (ALLR), percutaneous posterior instrumentation, spinopelvic fixation, and stereotactic 3D navigation.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
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
              Adult Spine Deformity &amp; Multi-Level LLIF Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Minimally invasive adult spinal deformity reconstruction combines multi-level lateral lumbar interbody fusion (LLIF/XLIF) with anterior longitudinal ligament release (ALLR) and percutaneous posterior spinopelvic instrumentation. Yet commercial payers aggressively bundle multi-level add-ons (+22552), claw back ALLR Modifier -22 fee enhancements, and disallow S2AI pelvic anchors (+22848). Verify and protect your surgical claims.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <AdultSpineDeformityLlifScrubber />

          <ToolConversionBridge
            toolName="Adult Spine Deformity & Multi-Level LLIF Scrubber"
            contextText="Spine deformity practices lose upwards of $3,500 per multi-level LLIF case to automated payer edits that strip secondary interspace add-ons (+22552) and downcode anterior ligamentous release."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
