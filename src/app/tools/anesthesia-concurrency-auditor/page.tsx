import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import AnesthesiaConcurrencyAuditor from '@/components/ui/AnesthesiaConcurrencyAuditor';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Anesthesia Concurrency & Medical Direction Auditor | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Audit anesthesia operating room concurrency ratios and TEFRA 7 medical direction conditions under 42 CFR § 415.110. Model Modifiers QK, QY, QX, QZ, and AD, simulate clawback recoupment risk, and generate ANSI X12 837P Loop 2400 lines.',
};

export default function AnesthesiaConcurrencyAuditorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Anesthesia Concurrency & Medical Direction Auditor',
    url: 'https://aetherahealthcare.com/tools/anesthesia-concurrency-auditor',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free compliance auditor to verify anesthesia CRNA supervision ratios, audit TEFRA 7 medical direction rules, and calculate clawback exposure under Modifier AD.',
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
              Anesthesia Concurrency &amp; Medical Direction Auditor
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              When an anesthesiologist's concurrent room overlap exceeds the 1:4 statutory limit or misses one of the 7 TEFRA
              conditions, commercial payers recoup 100% of medical direction fees. Audit your OR crossover logs, determine
              exact modifier requirements (QK, QY, QX, QZ, AD), and eliminate retrospective audit clawbacks.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <AnesthesiaConcurrencyAuditor />

          <ToolConversionBridge
            toolName="Anesthesia Concurrency Auditor"
            contextText="Concerned about payer audits into overlapping surgical room start/stop times or CRNA supervision ratios? Aethera's certified anesthesia billing experts cross-audit every OR record against TEFRA criteria to secure compliant maximum reimbursement for both MDs and CRNAs."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
