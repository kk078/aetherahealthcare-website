import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PracticeBenchmarkScorecard from '@/components/ui/PracticeBenchmarkScorecard';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'MGMA Practice Health Index & Specialty Scorecard | Aethera Healthcare',
  description:
    'Benchmark your medical practice revenue cycle against national MGMA & HFMA standards. Calculate Days in AR performance, denial rates, and annual recoverable cash lift.',
};

export default function PracticeBenchmarkPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9]">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="h-3.5 w-3.5" /> Practice Intelligence &amp; MGMA Analytics
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            Practice Health Index &amp; Specialty Benchmark Scorecard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Audit your practice’s collections efficiency against national MGMA top-decile metrics. Quantify annual unbilled cash recovery and uncover hidden denial patterns.
          </p>
        </div>

        <PracticeBenchmarkScorecard />

        {/* Informational Guidance Section */}
        <section className="mt-16 pt-12 border-t border-gray/15 print:hidden">
          <h2 className="text-xl font-bold text-navy mb-6 text-center">
            Understanding National Medical Revenue Cycle Benchmarks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-700">
            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                What is MGMA Top Decile?
              </h3>
              <p className="leading-relaxed text-slate-600">
                The Medical Group Management Association (MGMA) tracks financial metrics across 4,000+ medical groups. The top 10% of practices achieve under 30 days in A/R and less than 4% denial rates.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                The True Cost of Aging A/R
              </h3>
              <p className="leading-relaxed text-slate-600">
                Every 10 days of aging A/R traps hundreds of thousands in uncollected working capital. Clinics often borrow against credit lines at 7%–9% APR to cover payroll while payers hold legitimate claims.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                Denial Overturn Rates
              </h3>
              <p className="leading-relaxed text-slate-600">
                Over 65% of denied medical claims are fully collectible if appealed within statutory timely filing windows with correct CPT modifier documentation and ERISA legal citations.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
