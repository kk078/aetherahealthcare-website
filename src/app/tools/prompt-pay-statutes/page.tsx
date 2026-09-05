import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PromptPayMatrix from '@/components/ui/PromptPayMatrix';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: '50-State Prompt-Pay Statute & Interest Penalty Matrix | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Directory of 50 state clean-claim prompt-payment laws, electronic payment deadlines (15–30 days), statutory annual interest penalty rates (12%–18%), and formal demand letters.',
};

export default function PromptPayStatutesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '50-State Prompt-Payment Statute & Interest Penalty Matrix',
    url: 'https://aetherahealthcare.com/tools/prompt-pay-statutes',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free healthcare revenue cycle compliance engine to inspect 50 state prompt-pay mandates, calculate statutory late payment interest penalties, and generate legal demand notices.',
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
              50-State Prompt-Payment Statute &amp; Interest Penalty Matrix
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              When payers delay clean claims beyond statutory deadlines, they owe non-waivable daily interest penalties up to 18% per year. Search clean-claim mandates across all 50 states and compute mandatory late interest due to your practice.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PromptPayMatrix />

          <ToolConversionBridge
            toolName="Prompt-Payment Statute Matrix"
            contextText="Tired of payers holding your clean claims for 60 to 90 days with zero accountability? Aethera enforces state prompt-pay statutory interest penalties on 100% of aging accounts, expediting remittance and collecting penalty cash."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
