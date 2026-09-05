import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import DialysisMcpCalculator from '@/components/ui/DialysisMcpCalculator';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Dialysis Monthly Capitation Payment (MCP) Calculator | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Dialysis Monthly Capitation Payment (MCP) Calculator. Compute physician allowable reimbursement under CPT 90951–90962 and 90966, calculate inpatient hospital stay pro-rations, and model downcoding revenue recovery.',
};

export default function DialysisMcpCalculatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Dialysis Monthly Capitation Payment (MCP) Physician Tier Calculator',
    url: 'https://aetherahealthcare.com/tools/dialysis-mcp-calculator',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Calculate ESRD physician monthly management tiers, handle inpatient pro-ration deductions (90967–90970), and model nephrology clinic downcoding revenue recovery.',
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
              Dialysis Monthly Capitation Payment (MCP) Tier Calculator
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Under Medicare ESRD rules (42 CFR § 414.314 &amp; CMS Chapter 8 § 140), nephrologists report outpatient dialysis
              management using tiered codes (CPT 90951–90962) dictated by age and documented face-to-face physician visits.
              When patients are hospitalized, Medicare prohibits full MCP codes and requires daily pro-rations (90967–90970).
              Calculate your exact tier allowable and recover lost downcoded revenue.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <DialysisMcpCalculator />

          <ToolConversionBridge
            toolName="Dialysis MCP Tier Calculator"
            contextText="Are your nephrologists conducting 4+ dialysis visits but getting reimbursed at the 1-visit rate? Aethera delivers specialized nephrology RCM that audits rounding logs, captures complete MCP tiers, and automates hospital stay pro-rations."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
