import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CredentialingTimelineEstimator from '@/components/ui/CredentialingTimelineEstimator';
import { CalendarClock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Provider Credentialing & Payer Enrollment Timeline Estimator | Aethera Healthcare',
  description:
    'Free medical credentialing calculator. Calculate CAQH, Medicare PECOS, Medicaid, and commercial payer enrollment timelines to prevent billing freezes for new physicians.',
};

export default function CredentialingTimelinePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9]">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-bold uppercase tracking-wider mb-3">
            <CalendarClock className="h-3.5 w-3.5" /> Provider Credentialing &amp; Practice Operations
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            Provider Credentialing Timeline Estimator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Plan physician and mid-level onboarding lead times. Map CAQH, Medicare PECOS, Medicaid, and commercial payer committee schedules to guarantee on-time billing.
          </p>
        </div>

        <CredentialingTimelineEstimator />

        {/* Informational Guidance Section */}
        <section className="mt-16 pt-12 border-t border-gray/15">
          <h2 className="text-xl font-bold text-navy mb-6 text-center">
            Payer Credentialing &amp; Enrollment Best Practices FAQ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-700">
            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                Why Does Credentialing Take 90–120 Days?
              </h3>
              <p className="leading-relaxed text-slate-600">
                Payer credentialing committees meet once per month and verify primary source education, hospital privileges, malpractice claims, and state licenses across National Practitioner Data Bank (NPDB) databases before contract issuance.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                Medicare Effective Date Rules
              </h3>
              <p className="leading-relaxed text-slate-600">
                CMS allows a maximum 30-day retroactive effective date from the date of Medicare Part B PECOS application receipt. Claims prior to this 30-day window cannot be paid and must be written off.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                Delegated Credentialing Solutions
              </h3>
              <p className="leading-relaxed text-slate-600">
                Aethera manages CAQH attestations, re-credentialing cycles, EFT bank authorizations, and EDI 837 link-ups, freeing medical practice administrators from endless payer follow-up calls.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
