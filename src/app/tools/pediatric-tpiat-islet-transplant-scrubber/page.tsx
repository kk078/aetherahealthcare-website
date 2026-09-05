import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricTpiatScrubber from '@/components/ui/PediatricTpiatScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric TPIAT & Islet Isolation Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric Total Pancreatectomy with Islet Autotransplantation (TPIAT) Scrubber. Audit total pancreatectomy (48155), cGMP clean-room islet isolation (48805), intraportal autotransplantation (+48554), and portal vein catheterization.',
};

export default function PediatricTpiatScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric TPIAT & Islet Isolation Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-tpiat-islet-transplant-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit total pancreatectomy, cGMP back-table islet cell isolation, and intraportal islet autotransplantation for pediatric hereditary pancreatitis.',
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
              Pediatric TPIAT &amp; Islet Isolation Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Total Pancreatectomy with Islet Autotransplantation (TPIAT) cures severe chronic pain from genetic pancreatitis while preserving endogenous insulin production. However, pediatric transplant centers face crippling denials when payers bundle multi-hour cGMP clean-room islet isolation (CPT 48805) into primary pancreatectomy (48155) or deny autologous islet transplantation under experimental deceased-donor policies. Audit your TPIAT claims with precision.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricTpiatScrubber />

          <ToolConversionBridge
            toolName="Pediatric TPIAT & Islet Isolation Scrubber"
            contextText="Pediatric hepatobiliary surgeons and cell processing centers lose up to $4,800 per case when commercial payers reject cGMP islet isolation or misclassify autologous transplantation as investigational."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
