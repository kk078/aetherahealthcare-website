import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import LvadCardiacScrubber from '@/components/ui/LvadCardiacScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Durable LVAD Implantation & Cardiac Reoperation Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Cardiac LVAD Scrubber. Audit durable LVAD implantation (CPT 33979), redo sternotomy adhesiolysis add-on (+33530), concomitant tricuspid/aortic repairs, and post-op RV failure critical care.',
};

export default function LvadCardiacScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Durable LVAD Implantation & Cardiac Reoperation Scrubber',
    url: 'https://aetherahealthcare.com/tools/lvad-cardiac-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit durable continuous-flow LVAD implants (CPT 33979), defend redo sternotomy add-ons (+33530), and validate concomitant valve repairs and post-op critical care.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#450a0a] via-[#0f172a] to-[#881337]">
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
              Durable LVAD Implantation &amp; Cardiac Reoperation Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-rose-100/90 max-w-3xl leading-relaxed">
              Durable ventricular assist device (LVAD) implantation represents one of the highest-acuity surgical procedures
              in medicine. Yet commercial payers aggressively downcode durable intracorporeal implants (33979) to temporary
              systems (33975), unbundle redo sternotomy adhesiolysis (+33530), and reject concurrent tricuspid valve annuloplasties.
              Protect your heart failure surgical revenue with automated clinical audit rules.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <LvadCardiacScrubber />

          <ToolConversionBridge
            toolName="Cardiothoracic Surgery & Mechanical Circulatory Support RCM"
            contextText="Frustrated by commercial payer downcoding on durable LVADs, redo sternotomy add-on bundling clawbacks, or Modifier 62 co-surgeon suspensions? Aethera's specialized cardiovascular surgical coding team defends every dollar."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
