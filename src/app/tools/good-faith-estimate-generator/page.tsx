import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GoodFaithEstimateGenerator from '@/components/ui/GoodFaithEstimateGenerator';
import { ShieldCheck, FileCheck, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Good Faith Estimate (GFE) Generator | CMS No Surprises Act Compliance',
  description:
    'Generate compliant CMS Good Faith Estimates (GFE) under 45 CFR § 149.610 for uninsured and self-pay patients. Itemize primary procedures, co-provider fees, and statutory dispute disclaimers.',
};

export default function GoodFaithEstimatePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9]">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="h-3.5 w-3.5" /> No Surprises Act Statutory Suite
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            Good Faith Estimate (GFE) Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Build, print, and archive CMS-compliant Good Faith Estimates under 45 CFR § 149.610 for uninsured and self-pay patients with full statutory dispute rights.
          </p>
        </div>

        <GoodFaithEstimateGenerator />

        {/* Informational Guidance & FAQs */}
        <section className="mt-16 pt-12 border-t border-gray/15 print:hidden">
          <h2 className="text-xl font-bold text-navy mb-6 text-center">
            No Surprises Act Compliance &amp; Good Faith Estimate FAQ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700">
            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-teal shrink-0" />
                Who is required to receive a Good Faith Estimate?
              </h3>
              <p className="leading-relaxed text-slate-600">
                Under federal law (45 CFR § 149.610), all healthcare providers and facilities must provide a Good Faith Estimate of expected charges to individuals who are uninsured or self-pay (not intending to submit a claim to their insurance) upon scheduling or upon request.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-teal shrink-0" />
                What are the mandatory statutory delivery deadlines?
              </h3>
              <p className="leading-relaxed text-slate-600">
                If scheduled at least <strong>3 business days</strong> in advance, the GFE must be furnished within <strong>1 business day</strong>. If scheduled at least <strong>10 business days</strong> in advance, the GFE must be furnished within <strong>3 business days</strong> of scheduling.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-teal shrink-0" />
                What is the $400 Patient-Provider Dispute threshold?
              </h3>
              <p className="leading-relaxed text-slate-600">
                If the final billed charges exceed the total Good Faith Estimate by <strong>$400 or more</strong> for any single provider or facility, the patient has the statutory right to initiate the federal PPDR dispute process within 120 calendar days of the bill date.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-teal shrink-0" />
                How does Aethera automate front-end compliance?
              </h3>
              <p className="leading-relaxed text-slate-600">
                Aethera integrates 270/271 real-time eligibility checking directly into the intake queue, instantly flagging self-pay, out-of-network, or high-deductible status, and auto-generating compliant GFE documentation before appointments are confirmed.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
