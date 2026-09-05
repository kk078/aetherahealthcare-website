import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PayerDirectory from '@/components/ui/PayerDirectory';
import { getAllPayers, payerTypes, payersMeta } from '@/lib/payers';
import { AlertTriangle, ShieldCheck, Sparkles, Building2, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata = {
  title: { absolute: '10,600+ Payer Directory & Clearinghouse EDI Routing | Aethera Healthcare Solutions' },
  description:
    'Comprehensive U.S. insurance payer directory and clearinghouse EDI routing guide. Look up 10,600+ electronic payer IDs, par statuses, pre-enrollment rules, 835 ERA remittance support, and real-time 270/271 eligibility.',
};

export default function PayerDirectoryIndex() {
  const payers = getAllPayers();
  const types = payerTypes();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-14 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-mint text-xs font-semibold mb-4 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5" /> National Clearinghouse EDI Master Feed Active
          </div>
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-jakarta mb-4">
              Payer Directory &amp; EDI Clearinghouse Master
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream max-w-3xl mx-auto">
              Nationwide routing intelligence across 10,600+ payers — electronic payer IDs, participating (Par) statuses,
              EDI pre-enrollment requirements, 835 ERA remittance support, and in-depth AR playbooks.
            </p>
          </FadeIn>

          {/* Quick metric chips */}
          <FadeIn delay={0.25}>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs text-white/90">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 font-semibold">
                ✓ 10,640+ Electronic Payer IDs
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 font-semibold">
                ✓ Commercial, Medicare, Medicaid &amp; WC
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 font-semibold">
                ✓ Real-Time 270/271 Eligibility
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 font-semibold">
                ✓ 835 Remittance Matching
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-10 md:py-14 bg-cream flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Accuracy disclaimer & clearinghouse notice */}
          <div className="flex items-start gap-3 bg-amber-50/90 border border-amber-200 rounded-2xl p-4 mb-8 shadow-xs">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-950 leading-relaxed">
              <p>
                <strong>Clearinghouse Gateway &amp; Clinical Verification:</strong> Electronic payer IDs, Par statuses, and
                pre-enrollment rules are synchronized with national clearinghouse EDI master feeds. Always verify
                provider-level contract terms, timely filing deadlines, and secondary routing before claim dispatch.
                Last updated {payersMeta.updated}.
              </p>
            </div>
          </div>

          <PayerDirectory payers={payers} types={types} />
        </div>
      </section>

      <section className="py-14 bg-white border-t border-gray/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShieldCheck className="h-8 w-8 text-teal mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-navy mb-2 font-jakarta">
            Struggling with Payer Enrollment, Stalled Claims, or Unresolved AR?
          </h2>
          <p className="text-gray mb-6 max-w-2xl mx-auto text-sm leading-relaxed">
            Aethera&apos;s revenue cycle specialists maintain live clearinghouse integrations across all 10,600+ insurers.
            We handle provider enrollment, clearinghouse reject resolution, and aged AR recovery with a 98%+ clean claim rate.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="/free-assessment"
              className="inline-block bg-teal hover:bg-navy text-white font-bold py-3 px-6 rounded-full transition-colors text-sm shadow-xs"
            >
              Get a Free Practice Assessment
            </a>
            <a
              href="/tools/practice-proposal-wizard"
              className="inline-block border-2 border-teal text-teal hover:bg-teal hover:text-white font-bold py-3 px-6 rounded-full transition-colors text-sm"
            >
              Calculate Practice SLA Proposal
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
