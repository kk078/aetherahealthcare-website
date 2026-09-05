import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Edi837Scrubber from '@/components/ui/Edi837Scrubber';
import { Code2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ANSI X12 837 Claim File Syntax & Rejection Inspector | Aethera Healthcare',
  description:
    'Free online ANSI X12 837P and 837I electronic claim file scrubber. Inspect Loops 2010AA, 2010BA, 2300, and 2400 to prevent 277CA clearinghouse rejections.',
};

export default function Edi837Page() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9]">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-bold uppercase tracking-wider mb-3">
            <Code2 className="h-3.5 w-3.5" /> EDI Healthcare Interoperability Lab
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            ANSI X12 837 Claim File Syntax Scrubber
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Diagnose ANSI X12 837P (Professional CMS-1500) and 837I (Institutional UB-04) electronic claims. Catch missing NPIs, modifier omissions, and invalid loop syntax before clearinghouse rejection.
          </p>
        </div>

        <Edi837Scrubber />

        {/* Technical FAQ & Explanations */}
        <section className="mt-16 pt-12 border-t border-gray/15">
          <h2 className="text-xl font-bold text-navy mb-6 text-center">
            ANSI X12 837 Electronic Claim Specifications FAQ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-700">
            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                Difference Between 837P and 837I
              </h3>
              <p className="leading-relaxed text-slate-600">
                837P is the electronic equivalent of CMS-1500 used by private practices, physicians, and allied health. 837I is the electronic version of UB-04 used by inpatient hospitals, skilled nursing, and ambulatory surgical centers.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                What is a 277CA Claim Acknowledgment?
              </h3>
              <p className="leading-relaxed text-slate-600">
                The 277CA is returned by clearinghouses within hours of 837 transmission. An acceptance status code of <code>A1</code> indicates the claim has entered payer adjudication; an <code>A3</code> code indicates fatal syntax rejection.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                Pre-Clearinghouse Automated Scrubbing
              </h3>
              <p className="leading-relaxed text-slate-600">
                Aethera’s rule-based claim engine cross-references Loop 2010AA NPIs against NPPES, verifies Loop 2010BA subscriber IDs against active 271 eligibility cache, and applies CMS NCCI PTP edits to Loop 2400 lines before batch release.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
