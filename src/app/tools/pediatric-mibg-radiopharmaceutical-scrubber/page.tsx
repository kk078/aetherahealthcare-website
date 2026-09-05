import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricMibgScrubber from '@/components/ui/PediatricMibgScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Targeted MIBG & Radiopharmaceutical Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric Targeted Radioiodine & MIBG Therapy Scrubber. Audit therapeutic I-131 MIBG administration (79445), HCPCS A9508 isotope invoice pass-through, medical physics consultation (+77336), SPECT/CT dosimetry (78830), and autologous stem cell rescue (+38240).',
};

export default function PediatricMibgRadiopharmaceuticalScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Targeted MIBG & Radiopharmaceutical Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-mibg-radiopharmaceutical-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit therapeutic I-131 MIBG administration, HCPCS A9508 isotope pass-through invoices, continuing medical physics oversight, and stem cell rescue for pediatric neuroblastoma.',
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
              Pediatric Targeted MIBG &amp; Radiopharmaceutical Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Targeted high-dose Iodine-131 metaiodobenzylguanidine (I-131 MIBG) represents one of the most effective radiopharmaceutical therapies for high-risk refractory neuroblastoma and metastatic pheochromocytoma. However, pediatric cancer programs face catastrophic $40,000+ denials when commercial payers reject radiopharmaceutical pass-through invoices (HCPCS A9508), bundle statutory medical physics consultations (+77336), or deny delayed autologous stem cell rescues (+38240). Audit your radionuclide claims with clinical precision.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricMibgScrubber />

          <ToolConversionBridge
            toolName="Pediatric Targeted MIBG & Radiopharmaceutical Scrubber"
            contextText="Pediatric nuclear medicine centers and pediatric oncology hospitals encounter devastating billing write-offs when high-cost radiopharmaceutical isotope pass-through invoices and continuing radiation physics consultations are disputed by commercial payers."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
