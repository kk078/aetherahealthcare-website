import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricSingleVentricleScrubber from '@/components/ui/PediatricSingleVentricleScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Single-Ventricle Norwood & Glenn Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric Single-Ventricle Congenital Heart Disease Palliation Scrubber. Audit Stage 1 Norwood (33619), Sano/BT shunts (33766/33750), Glenn (33767), Fontan (33737), and delayed sternal closure (+33530).',
};

export default function PediatricSingleVentricleScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Single-Ventricle Norwood & Glenn Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-single-ventricle-norwood-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit multi-stage single-ventricle palliation for hypoplastic left heart syndrome (HLHS), including Norwood neo-aorta reconstruction, Sano conduit, pulmonary artery angioplasty, and staged Modifier -58 defenses.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#1c1917] via-[#0f172a] to-[#292524]">
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
              Pediatric Single-Ventricle Norwood &amp; Glenn Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Multi-stage palliative surgical reconstruction for hypoplastic left heart syndrome (HLHS) and single ventricle anomalies represents one of medicine’s highest-acuity pathways. Yet congenital cardiothoracic surgical programs routinely lose tens of thousands of dollars to global period clawbacks, branch pulmonary artery patch angioplasty bundling (+33688), and unlinked delayed sternal closure (+33530). Scrub and defend your multi-stage single-ventricle claims.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricSingleVentricleScrubber />

          <ToolConversionBridge
            toolName="Pediatric Single-Ventricle Norwood & Glenn Scrubber"
            contextText="Pediatric cardiothoracic surgical programs lose an average of $3,780 to $6,800 per infant when clearinghouses bundle multi-stage shunts, delayed sternal closures, or post-cardiotomy ECMO support."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
