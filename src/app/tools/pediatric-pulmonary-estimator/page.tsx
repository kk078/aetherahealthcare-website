import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricPulmonaryEstimator from '@/components/ui/PediatricPulmonaryEstimator';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Pulmonology, Allergy & CFTR Estimator | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Pediatric Pulmonology & CFTR Estimator. Audit pediatric spirometry and plethysmography (94010/94060/94726), unbundling traps, quantitative sweat chloride testing (82435), and verify CFTR prior authorization likelihood.',
};

export default function PediatricPulmonaryEstimatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Pulmonology, Allergy & CFTR Estimator',
    url: 'https://aetherahealthcare.com/tools/pediatric-pulmonary-estimator',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit pediatric spirometry, sweat chloride diagnostic testing, and CFTR targeted modulator prior authorizations for zero-denial pulmonary billing.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#0c4a6e] via-[#0f172a] to-[#134e4a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-sky-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Pediatric Pulmonology, Allergy &amp; CFTR Estimator
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-sky-100/90 max-w-3xl leading-relaxed">
              Pediatric pulmonology and cystic fibrosis practices face acute revenue threats from PFT unbundling audits
              (billing baseline 94010 with pre/post 94060), unbundled aerosol treatments, and stringent specialty pharmacy
              prior authorizations for targeted CFTR modulators (Trikafta, Kalydeco). Audit your pulmonary diagnostic
              panels, sweat testing, and biologic approvals with zero denial risk.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricPulmonaryEstimator />

          <ToolConversionBridge
            toolName="Pediatric Pulmonology & Allergy RCM"
            contextText="Tired of PFT unbundling recoupments, sweat chloride diagnostic denials, or protracted prior authorization delays for high-cost CFTR therapies? Aethera's specialized pediatric pulmonary billing team secures maximum reimbursement."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
