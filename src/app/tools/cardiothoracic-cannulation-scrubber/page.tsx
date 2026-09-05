import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import CardiothoracicCannulationScrubber from '@/components/ui/CardiothoracicCannulationScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Cardiothoracic Bypass & Cannulation Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Cardiothoracic Bypass & Cannulation Scrubber. Audit complex CABG arterial-venous graft combinations (33533–33536 + 33517–33523), endoscopic vein harvest (+33508), concomitant valve replacement sequencing (33405/33430), and ECMO/ECLS cannulation bundling rules.',
};

export default function CardiothoracicCannulationScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Cardiothoracic Bypass & Cannulation Scrubber',
    url: 'https://aetherahealthcare.com/tools/cardiothoracic-cannulation-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit open heart surgical episodes, CABG arterial and venous graft combinations, endoscopic conduit harvest add-ons, concomitant valve replacement sequencing, and ECMO/ECLS cannulation bundling rules.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#3b0d14] via-slate-900 to-rose-950">
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
              Cardiothoracic Bypass &amp; Cannulation Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-rose-100/90 max-w-3xl leading-relaxed">
              Cardiothoracic and cardiovascular surgery claims represent massive RVU volume and acute audit exposure.
              Misreporting standalone venous graft codes (33510–33516) alongside arterial CABG (33533–33536), appending
              Modifier -51 to exempt add-ons (+33517/+33508), or unbundling routine cardiopulmonary bypass cannulation
              into ECMO codes (33951–33956) leads to devastating clawbacks. Simulate your cardiothoracic episodes and ensure
              total NCCI and CPT compliance before claim generation.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <CardiothoracicCannulationScrubber />

          <ToolConversionBridge
            toolName="Cardiothoracic Surgical RCM Scrubber"
            contextText="Facing multi-vessel CABG rejections, payer pushback on endoscopic saphenous harvest (+33508), or audit clawbacks on ECMO cannulation and concomitant valve surgeries? Aethera's specialized cardiovascular surgical coding team secures every dollar of legitimate reimbursement."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
