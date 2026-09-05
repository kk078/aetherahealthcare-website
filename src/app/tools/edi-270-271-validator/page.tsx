import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Edi270271Validator from '@/components/ui/Edi270271Validator';
import { FileCode2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ANSI X12 270/271 Real-Time Eligibility & Benefit Validator | Aethera Healthcare',
  description:
    'Free online ANSI X12 270/271 EDI eligibility parser. Decode raw 271 transactions into clear copays, deductibles, coinsurance, and active coverage verification.',
};

export default function Edi270271Page() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9]">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-bold uppercase tracking-wider mb-3">
            <FileCode2 className="h-3.5 w-3.5" /> EDI Healthcare Interoperability Lab
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            ANSI X12 270/271 Eligibility Validator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Inspect, validate, and decode raw ANSI X12 271 real-time eligibility responses. Decode EB benefit segments, deductibles, copay amounts, and prevent CO-27 eligibility denials.
          </p>
        </div>

        <Edi270271Validator />

        {/* Technical FAQ & Explanations */}
        <section className="mt-16 pt-12 border-t border-gray/15">
          <h2 className="text-xl font-bold text-navy mb-6 text-center">
            ANSI X12 270/271 Technical Architecture FAQ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-700">
            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                What is an ANSI X12 270/271?
              </h3>
              <p className="leading-relaxed text-slate-600">
                The 270 is an electronic health care eligibility inquiry sent by a provider to a payer. The 271 is the official HIPAA-mandated response returned by the clearinghouse containing active benefit and coverage details.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                Decoding the EB (Eligibility Benefit) Segment
              </h3>
              <p className="leading-relaxed text-slate-600">
                The EB segment is the core payload: EB01 defines benefit type (1=Active, B=Copay, C=Deductible, A=Coinsurance, G=OOP Max), EB03 defines service type (30=General Health, 98=Professional, 1=Medical), and EB07 defines dollar amounts.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                Preventing Front-End Denials
              </h3>
              <p className="leading-relaxed text-slate-600">
                Over 25% of all medical claim rejections stem from eligibility issues (CARC CO-26, CO-27, CO-31). Performing automated 270/271 checks pre-service guarantees patient identification numbers and active coverage.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
