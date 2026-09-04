import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import DenialCodeLookup from '@/components/ui/DenialCodeLookup';
import { getAllDenialCodes, getReferenceCodes } from '@/lib/denialCodes';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';

export const metadata = {
  title: { absolute: 'Denial Code Lookup — Full CARC & RARC Reason Code List | Aethera Healthcare Solutions' },
  description:
    'Free searchable lookup of 1,200+ CARC and RARC denial codes for billing and AR teams. Get the official reason for any code, plus how to work and prevent the most common denials.',
};

export default function DenialCodeLookupPage() {
  const codes = getAllDenialCodes();
  const reference = getReferenceCodes();
  const totalCodes = codes.length + reference.length;

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: codes.slice(0, 10).map(c => ({
      '@type': 'Question',
      name: `What does denial code CARC ${c.code} mean?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `CARC ${c.code} — ${c.label}. ${c.rootCause} How to work it: ${c.workIt}`,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link prefetch={false} href="/tools" className="inline-flex items-center text-cream/80 hover:text-white text-sm mb-5">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> All tools
          </Link>
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-jakarta mb-4">Denial Code Lookup</h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-xl text-cream max-w-3xl">
              Search the full set of {totalCodes}+ CARC and RARC denial codes by code or reason. Every code
              shows what it means and how to work and prevent it — the top denials add hand-written, denial-specific playbooks.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <strong>Educational reference.</strong> CARC/RARC handling varies by payer, plan, and contract. Use this as a
              starting point and confirm specifics in the payer&apos;s remittance guidance or your clearinghouse.
            </p>
          </div>

          <DenialCodeLookup codes={codes} reference={reference} />
          
          <ToolConversionBridge
            toolName="Denial Code"
            contextText="Tired of researching CARC/RARC codes one-by-one? Let Aethera audit 50 of your recent denials and build automated root-cause appeal playbooks."
          />
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Footer />
    </div>
  );
}
