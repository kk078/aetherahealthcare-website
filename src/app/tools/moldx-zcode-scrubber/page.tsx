import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import MolDxZCodeScrubber from '@/components/ui/MolDxZCodeScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Molecular Diagnostics MolDX® Z-Code & LCD Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free MolDX molecular diagnostics scrubber. Validate DEX Z-Code registration, scrub genetic testing against Palmetto/Noridian/CGS/WPS LCD criteria, and generate ANSI X12 837P Loop 2400 REF*17 segments.',
};

export default function MolDxZCodeScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Molecular Diagnostics MolDX® Z-Code & LCD Scrubber',
    url: 'https://aetherahealthcare.com/tools/moldx-zcode-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Validate DEX Z-Codes and LCD coverage criteria for molecular pathology, next-generation sequencing panels, and pharmacogenomics under CMS MolDX program requirements.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-navy via-[#003087] to-teal">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-cream/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Molecular Diagnostics MolDX® Z-Code &amp; LCD Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Palmetto GBA, Noridian, CGS, and WPS MolDX programs mandate a unique 5-character DEX Z-Code in Loop 2400 REF02
              for all molecular pathology CPT codes. Missing Z-codes or unverified LCD medical necessity indications trigger
              instant claim rejections. Scrub your molecular panels and genetic tests against CMS criteria before submission.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <MolDxZCodeScrubber />

          <ToolConversionBridge
            toolName="MolDX Scrubber"
            contextText="Are molecular pathology, pharmacogenomics, or NGS claims triggering CARC 16 / N382 rejections or retrospective LCD audit clawbacks? Aethera's certified pathology billing specialists verify every DEX Z-Code and clinical indication before claim submission to protect 100% of your laboratory allowable."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
