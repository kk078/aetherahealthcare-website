import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PracticeProposalWizard from '@/components/ui/PracticeProposalWizard';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Interactive Practice Proposal & SLA Wizard | Aethera Healthcare Solutions',
  },
  description:
    'Generate a customized medical billing proposal, fee tier (3.5%–5.0%), and projected cash collections lift tailored to your medical specialty, volume, and EHR.',
};

export default function PracticeProposalWizardPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Interactive Practice Proposal & SLA Wizard',
    url: 'https://aetherahealthcare.com/tools/practice-proposal-wizard',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free 3-minute interactive proposal generator for healthcare practices to model collections lift, AR reduction, and custom performance pricing.',
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
              Interactive Practice Proposal &amp; SLA Wizard
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              No generic quotes. Build a tailored revenue cycle proposal based on your exact medical specialty,
              monthly encounter volume, and current EHR in under 3 minutes.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PracticeProposalWizard />

          <ToolConversionBridge
            toolName="Practice Proposal Wizard"
            contextText="Want to review this proposal live with leadership? Book a 15-minute discovery call directly with Kiran, or test our accuracy on 50 of your real claims for free."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
