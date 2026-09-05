import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import UnderpaymentAnalyzer from '@/components/ui/UnderpaymentAnalyzer';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Payer Contract Underpayment & Variance Analyzer | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Calculate silent PPO underpayment leakage, compare contracted allowable vs actual paid amounts, compute statutory prompt-pay interest penalties, and generate formal dispute letters.',
};

export default function UnderpaymentAnalyzerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Payer Contract Underpayment & Variance Analyzer',
    url: 'https://aetherahealthcare.com/tools/underpayment-analyzer',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free healthcare financial tool to analyze contract variance, detect silent PPO fee schedule downcoding, and model prompt-pay interest penalties.',
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
              Payer Contract Underpayment &amp; Variance Analyzer
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Practices lose 4%–7% of earned clinical revenue to silent PPO fee reductions and algorithmic underpayments. Uncover your contractual variance, model state prompt-payment statutory interest, and generate formal dispute demands.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <UnderpaymentAnalyzer />

          <ToolConversionBridge
            toolName="Contract Underpayment Analyzer"
            contextText="Payer underpayments rarely get resolved by automated clearinghouses because claims aren't rejected—they're just quietly underpaid. Aethera cross-audits 100% of remittances against contracted fee schedules."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
