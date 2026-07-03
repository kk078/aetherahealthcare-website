import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PayerDirectory from '@/components/ui/PayerDirectory';
import { getAllPayers, payerTypes, payersMeta } from '@/lib/payers';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: { absolute: 'Payer Directory — Timely Filing, Payer IDs, Claims & Portals | Aethera Healthcare Solutions' },
  description:
    'A free working reference for AR teams: timely-filing limits (TFL), payer IDs, claims routing, appeal windows, clearinghouses, and provider portals for major insurance payers and their subsidiaries.',
};

export default function PayerDirectoryIndex() {
  const payers = getAllPayers();
  const types = payerTypes();

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      <section className="pt-24 pb-14 md:pt-28 md:pb-16 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-playfair mb-5">Payer Directory</h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-xl text-cream max-w-3xl mx-auto">
              One stop for AR teams — timely-filing limits, payer IDs, claims routing, appeal windows, clearinghouses,
              and provider portals for major payers and their subsidiaries.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Accuracy disclaimer — front and center */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <strong>Always verify before you file.</strong> Payer IDs, timely-filing limits, and claims addresses vary by
              plan, region, and contract. This directory is a starting reference, not a contract-binding source — confirm
              each value in the payer portal or your clearinghouse. Last updated {payersMeta.updated}.
            </p>
          </div>

          <PayerDirectory payers={payers} types={types} />
        </div>
      </section>

      <section className="py-14 bg-white border-t border-gray/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShieldCheck className="h-8 w-8 text-teal mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-navy mb-2">We don&apos;t just look up payers — we work them every day</h2>
          <p className="text-gray mb-6 max-w-2xl mx-auto">
            Aethera&apos;s AR team maintains live payer rules across 900+ insurers. Tired of chasing TFLs and denials yourself?
            Let us run your revenue cycle.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/free-assessment" className="inline-block bg-teal hover:bg-navy text-white font-semibold py-3 px-6 rounded-full transition-colors text-sm">
              Get a Free Assessment
            </a>
            <a href="/contact" className="inline-block border-2 border-teal text-teal hover:bg-teal hover:text-white font-semibold py-3 px-6 rounded-full transition-colors text-sm">
              Suggest a Payer to Add
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
