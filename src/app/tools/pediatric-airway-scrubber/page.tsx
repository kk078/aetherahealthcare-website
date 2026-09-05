import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricAirwayScrubber from '@/components/ui/PediatricAirwayScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Laryngotracheal Reconstruction (LTR) Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric Airway Scrubber. Audit single-stage (CPT 31587) and double-stage (31590) LTR, cricotracheal resection (31584), defend autologous rib cartilage harvest (+20902-59), and safeguard staged surveillance bronchoscopy (Modifier -58).',
};

export default function PediatricAirwayScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Laryngotracheal Reconstruction (LTR) Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-airway-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit pediatric laryngotracheoplasty, cricotracheal resection downcoding defense, autologous costal cartilage graft harvest unbundling, and staged post-op bronchoscopy modifiers.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#042f2e] via-[#0f172a] to-[#065f46]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-emerald-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Pediatric Laryngotracheal Reconstruction Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-emerald-100/90 max-w-3xl leading-relaxed">
              Pediatric airway reconstruction demands exceptional precision from surgical teams treating severe
              subglottic and tracheal stenosis. Commercial and Medicaid payers routinely deny autologous costal cartilage
              rib harvest (+20902) as bundled, downcode complex cricotracheal resection (31584) to basic tracheoplasty,
              and reject planned postoperative surveillance bronchoscopies within the 90-day global period. Protect
              your aerodigestive surgical revenue with automated clinical audit rules.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricAirwayScrubber />

          <ToolConversionBridge
            toolName="Pediatric Otolaryngology & Complex Airway Surgical RCM"
            contextText="Frustrated by commercial payer unbundling denials on autologous rib graft harvests (+20902-59), cricotracheal resection downcoding clawbacks, or global period bronchoscopy rejections? Aethera's certified pediatric surgical coding team defends every dollar."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
