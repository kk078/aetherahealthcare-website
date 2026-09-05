import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricTefEaScrubber from '@/components/ui/PediatricTefEaScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric TEF & Esophageal Atresia Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric Tracheoesophageal Fistula & Esophageal Atresia (TEF/EA) Scrubber. Audit neonatal thoracotomy/thoracoscopic repair (43305/43312), rigid bronchoscopy (+31622-59), enteral gastrostomy (+43653-59), and staged Foker elongation (Modifier -58).',
};

export default function PediatricTefEaScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric TEF & Esophageal Atresia Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-tef-ea-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit neonatal esophageal atresia and tracheoesophageal fistula repairs, defend pre-repair diagnostic rigid bronchoscopy unbundling, separate incision gastrostomy tube placement, and staged Foker traction elongation.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#0c2340] via-[#0d3b66] to-[#002828]">
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
              Pediatric TEF &amp; Esophageal Atresia Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Neonatal tracheoesophageal fistula and esophageal atresia (TEF/EA) reconstructive claims face severe payer clawbacks. Health plans frequently bundle separate-incision gastrostomy tubes (+43653), deny essential diagnostic rigid bronchoscopy (+31622), or downcode staged Foker elongation procedures during global surgical periods. Scrub and protect your congenital surgical revenue.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricTefEaScrubber />

          <ToolConversionBridge
            toolName="Pediatric TEF & Esophageal Atresia Scrubber"
            contextText="Children's surgical programs lose over $2,400 per neonatal TEF case when commercial clearinghouses bundle distinct laparotomy gastrostomy tubes or reject diagnostic carinal endoscopy."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
