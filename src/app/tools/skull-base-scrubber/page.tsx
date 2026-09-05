import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SkullBaseScrubber from '@/components/ui/SkullBaseScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Lateral Skull Base & Acoustic Neuroma Co-Surgeon Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Lateral Skull Base Surgery Scrubber. Audit translabyrinthine and retrosigmoid acoustic neuroma approaches (CPT 61526, 61530), validate dual-attending Modifier 62 matching, operating microscope (+69990) microdissection defense, and continuous cranial nerve monitoring (95940).',
};

export default function SkullBaseScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Lateral Skull Base & Acoustic Neuroma Co-Surgeon Scrubber',
    url: 'https://aetherahealthcare.com/tools/skull-base-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit lateral skull base approaches, dual-attending Modifier 62 co-surgeon pairing, operating microscope microdissection add-ons (+69990), and facial nerve monitoring.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#0369a1]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-sky-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Lateral Skull Base &amp; Acoustic Neuroma Co-Surgeon Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-sky-100/90 max-w-3xl leading-relaxed">
              Resection of acoustic neuromas and cerebellopontine angle tumors requires seamless collaboration
              between neurotology and neurosurgery. Yet commercial payers aggressively target Modifier -62 co-surgery
              claims with mismatched coding denials, unbundle operating microscope microdissection (+69990), and disallow
              autologous fat graft harvests. Protect your multi-specialty surgical revenue with automated clinical audit rules.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <SkullBaseScrubber />

          <ToolConversionBridge
            toolName="Lateral Skull Base & Neurotology Surgical RCM"
            contextText="Frustrated by commercial payer denials on dual-attending Modifier 62 co-surgery claims, operating microscope (+69990) unbundling clawbacks, or neuromonitoring rejections? Aethera's specialized neurosurgical and ENT coding team defends every dollar."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
