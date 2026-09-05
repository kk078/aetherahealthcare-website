import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PadRevascularizationScrubber from '@/components/ui/PadRevascularizationScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Endovascular & PAD Revascularization Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Endovascular & PAD Lower Extremity Revascularization Scrubber. Audit CPT 37220–37235 vascular territory hierarchies (iliac, fem/pop, tibial/peroneal), suppress unbundled angioplasties and catheter placements (36245–36248), and validate diagnostic angiography exemptions.',
};

export default function PadRevascularizationScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Endovascular & PAD Revascularization Scrubber',
    url: 'https://aetherahealthcare.com/tools/pad-revascularization-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit endovascular peripheral arterial disease (PAD) revascularization coding hierarchies across iliac, femoral-popliteal, and tibial-peroneal territories under CMS NCCI guidelines.',
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
              Endovascular &amp; PAD Revascularization Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Lower extremity revascularization coding (CPT 37220–37235) follows rigid vascular territory rules where angioplasty,
              atherectomy, and stenting are subject to strict intra-vessel hierarchies. Selective catheter placement (36245–36248)
              is statutorily bundled, and diagnostic angiography (75710) requires specific medical necessity exemptions. Scrub your
              endovascular and office-based lab (OBL) claims before submission.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PadRevascularizationScrubber />

          <ToolConversionBridge
            toolName="Vascular Endovascular Scrubber"
            contextText="Losing revenue on peripheral vascular unbundling denials, missed IVUS add-ons, or contested office-based lab (OBL) facility fees? Aethera provides certified vascular coding specialists who protect revenue across cath labs, ASCs, and outpatient vascular centers."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
