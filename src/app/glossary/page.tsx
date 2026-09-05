import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import RcmGlossary from '@/components/ui/RcmGlossary';
import { GLOSSARY_TERMS } from '@/lib/glossaryData';
import { ArrowRight, Wrench, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Healthcare RCM & Medical Billing Glossary | Aethera Healthcare Solutions',
  description:
    'Authoritative clinical and financial dictionary for U.S. healthcare revenue cycle management. Master EDI 837/835 standards, NCCI PTP edits, CARC/RARC denial codes, and RVU benchmarks.',
  alternates: { canonical: 'https://aetherahealthcare.com/glossary' },
};

export default function GlossaryPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Healthcare Revenue Cycle Management (RCM) Clinical & Financial Glossary',
    description: 'Comprehensive encyclopedia of medical billing acronyms, EDI transaction sets, modifier guidelines, and statutory reimbursement terminology.',
    url: 'https://aetherahealthcare.com/glossary',
    publisher: {
      '@type': 'Organization',
      name: 'Aethera Healthcare Solutions',
      url: 'https://aetherahealthcare.com',
    },
    hasDefinedTerm: GLOSSARY_TERMS.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.term,
      termCode: t.acronym || t.term,
      description: t.definition,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream/40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <RcmHeroBand
        eyebrow="Knowledge Base"
        title="Healthcare RCM & Medical Billing Glossary"
        subtitle="Demystifying complex reimbursement terminology, EDI transaction standards, CMS NCCI coding rules, and payer denial codes for practice administrators and clinicians."
        primary={{ href: '#glossary-terms', label: 'Explore All Terms' }}
        secondary={{ href: '/tools', label: 'View 14 RCM Tools' }}
        chips={['30+ Core Terms', 'EDI 837 / 835', 'NCCI & MUE Edits', 'CARC / RARC Mappings']}
      />

      <main id="glossary-terms" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-12">
        <RcmGlossary />

        {/* Cross-Tool Bridge Section */}
        <section className="bg-gradient-to-br from-navy to-[#002677] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-mint/20 text-mint mb-3">
              Interactive Practice Intelligence
            </span>
            <h2 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Apply These Definitions Directly to Your Practice&apos;s Claims
            </h2>
            <p className="text-cream/80 text-sm sm:text-base leading-relaxed mb-8">
              Explore our full suite of 14 interactive tools to scrub NCCI edits in real time, decode 835 remittances, benchmark Medicare conversion factors, and generate statutory appeal letters.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                prefetch={false}
                href="/tools/ncci-claim-scrubber"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-mint text-navy font-bold text-sm hover:bg-white transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-navy" /> NCCI Claim Scrubber <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                prefetch={false}
                href="/tools/era-835-decoder"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 border border-white/20 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4 text-mint" /> 835 ERA Decoder
              </Link>
              <Link
                prefetch={false}
                href="/tools"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-transparent text-cream hover:text-white font-semibold text-sm transition-colors"
              >
                <Wrench className="h-4 w-4 text-teal" /> View All 14 Interactive Tools
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
