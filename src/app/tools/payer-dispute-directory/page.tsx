import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PayerDisputeDirectory from '@/components/ui/PayerDisputeDirectory';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Payer Dispute & Electronic Appeals Directory | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Directory of 16+ major commercial, Medicare Advantage, and Medicaid payers with Level 1/2 appeal deadlines, electronic dispute portal URLs, clearinghouse IDs, and escalation fax/phone protocols.',
};

export default function PayerDisputeDirectoryPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Payer Dispute & Electronic Appeals Directory',
    url: 'https://aetherahealthcare.com/tools/payer-dispute-directory',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Searchable directory of national health plan dispute portals, Level 1 and Level 2 clinical appeal deadlines, clearinghouse payer IDs, and appeal submission endpoints.',
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
              Payer Dispute &amp; Electronic Appeals Directory
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Every major payer enforces strict Level 1 and Level 2 dispute filing timeframes and specialized portal endpoints. Search 16+ national commercial, Medicare Advantage, and Medicaid payers to avoid timely appeal forfeitures.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PayerDisputeDirectory />

          <ToolConversionBridge
            toolName="Payer Dispute & Appeals Directory"
            contextText="Are your staff spending hours tracking down obscure appeal fax numbers and navigating disparate payer portals? Aethera's specialized denial resolution team manages 100% of Level 1, 2, and external review appeals electronically."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
