import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import AmbulanceFeeCalculator from '@/components/ui/AmbulanceFeeCalculator';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Ambulance & EMS Fee Schedule Calculator | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Medicare Ambulance Fee Schedule (AFS) calculator. Compute BLS, ALS1, ALS2, and SCT allowable rates, calculate CMS rural mileage bonuses, validate origin/destination modifier pairs, and generate 837P Loop 2400 CR1 segments.',
};

export default function AmbulanceFeeCalculatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Medicare Ambulance Fee Schedule & EMS Modifier Calculator',
    url: 'https://aetherahealthcare.com/tools/ambulance-fee-calculator',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Calculate ground ambulance reimbursement under 42 CFR § 414.610, apply rural mileage bonuses, validate origin/destination modifier combinations, and generate ANSI X12 837P CR1 EDI lines.',
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
              Ambulance &amp; EMS Fee Schedule Calculator
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Under CMS 42 CFR § 414.610, ground ambulance services require precise level-of-service selection
              (BLS, ALS1, ALS2, SCT), mandatory 2-character origin and destination modifier pairs (e.g. SH, RH, NH),
              and statutory rural mileage multipliers. Calculate your Medicare allowable reimbursement and generate
              audit-ready ANSI X12 837P Loop 2400 CR1 segments.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <AmbulanceFeeCalculator />

          <ToolConversionBridge
            toolName="Ambulance Fee Schedule Calculator"
            contextText="Tired of ambulance medical necessity denials, missing PCS signatures, or unbilled loaded mileage? Aethera delivers specialized EMS revenue cycle management designed specifically for municipal and private medical transport providers."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
