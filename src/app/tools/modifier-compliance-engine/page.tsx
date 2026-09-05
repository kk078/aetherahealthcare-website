import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import ModifierComplianceEngine from '@/components/ui/ModifierComplianceEngine';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Modifier 25 & 59 / X{EPSU} Compliance Engine | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Evaluate clinical documentation against CMS NCCI guidelines for Modifier 25 (Same-Day E/M) and Modifier 59 / XE / XP / XS / XU. Generate audit-defense attestations and prevent CARC 97 unbundling denials.',
};

export default function ModifierComplianceEnginePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Modifier 25 & 59 / X{EPSU} Compliance Engine',
    url: 'https://aetherahealthcare.com/tools/modifier-compliance-engine',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free clinical compliance tool to evaluate same-day E/M and surgical unbundling modifiers against official CMS NCCI and OIG criteria.',
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
              Modifier 25 &amp; 59 / X&#123;EPSU&#125; Compliance Engine
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Step through our clinical qualification gates to substantiate significant separately identifiable E/M services (Modifier 25) and distinct procedural services (Modifier 59, XE, XS, XP, XU). Generate legal audit-defense attestations and eliminate CARC 97 recoupments.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <ModifierComplianceEngine />

          <ToolConversionBridge
            toolName="Modifier Compliance Engine"
            contextText="Payer audits on modifiers are increasing. Aethera’s AAPC-certified coders audit 100% of multi-code encounters to ensure compliant modifier appending and zero post-payment clawbacks."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
