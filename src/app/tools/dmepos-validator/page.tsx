import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import DmeposValidator from '@/components/ui/DmeposValidator';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'DMEPOS Medical Necessity & Prior Auth Validator | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Validate Medicare DMEPOS claims across Oxygen, CPAP, Mobility Assistive Equipment, CGMs, and Orthotics. Verify Standard Written Orders (SWO), Face-to-Face timing, required Prior Authorizations, and KX/GA/CG modifiers mapped to DME MAC Jurisdictions A, B, C, and D.',
};

export default function DmeposValidatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'DMEPOS Medical Necessity & Prior Auth Validator',
    url: 'https://aetherahealthcare.com/tools/dmepos-validator',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free compliance validator for DMEPOS suppliers to verify CMS LCD criteria, Standard Written Orders (SWO), affirmative prior authorization decisions, and DME MAC jurisdiction routing.',
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
              DMEPOS Medical Necessity &amp; Prior Auth Validator
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Durable Medical Equipment, Prosthetics, Orthotics, and Supplies (DMEPOS) face severe post-payment audits,
              UPIC clawbacks, and clearinghouse rejections. Validate Standard Written Orders (SWO), clinical diagnostic
              thresholds, required Prior Authorizations, and DME MAC jurisdiction routing before submission.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <DmeposValidator />

          <ToolConversionBridge
            toolName="DMEPOS Validator"
            contextText="Tired of DME MAC pre-payment additional documentation requests (ADR) and complex prior authorization delays? Aethera manages end-to-end DMEPOS intake, clinical chart order audits, and electronic MAC billing with 98.6% first-pass adjudication."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
