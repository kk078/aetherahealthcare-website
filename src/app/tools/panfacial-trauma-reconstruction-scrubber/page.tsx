import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PanfacialTraumaScrubber from '@/components/ui/PanfacialTraumaScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Panfacial Trauma & Multi-Level Fracture Reconstruction Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Panfacial Trauma & Multi-Level Fracture Reconstruction Scrubber. Audit complex midface Le Fort I/II/III repairs (21422–21435), ZMC fractures (21365), mandibular plating (21462), intermaxillary fixation bundling (21110-59), and orbital blowout reconstructive implants (21390).',
};

export default function PanfacialTraumaScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Panfacial Trauma & Multi-Level Fracture Reconstruction Scrubber',
    url: 'https://aetherahealthcare.com/tools/panfacial-trauma-reconstruction-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit multi-level craniofacial fracture repairs, Le Fort osteotomies, mandibular open reduction internal fixation, intermaxillary fixation, and orbital floor reconstructions.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#312e81]">
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
              Panfacial Trauma &amp; Multi-Level Fracture Reconstruction Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              High-energy panfacial trauma resuscitations require simultaneous multi-bone rigid internal fixation across the upper, middle, and lower facial skeleton. Yet commercial clearinghouses and trauma payers apply harsh multi-procedure bundling penalties, unbundling clawbacks on intermaxillary fixation (21110), and denials on orbital floor reconstruction implants (21390). Audit your trauma surgical encounters with intelligent multi-level hierarchy rules.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PanfacialTraumaScrubber />

          <ToolConversionBridge
            toolName="Panfacial Trauma & Multi-Level Fracture Reconstruction Scrubber"
            contextText="Craniofacial trauma surgeons, oral and maxillofacial surgeons (OMFS), and Level 1 trauma centers face extensive payer denials on multiple-fracture bundling and intermaxillary fixation."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
