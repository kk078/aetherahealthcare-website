import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PatientLiabilityEstimator from '@/components/ui/PatientLiabilityEstimator';
import { Calculator, DollarSign, CheckCircle2, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Patient Out-of-Pocket Liability & Deductible Estimator | Aethera Healthcare',
  description:
    'Free medical billing calculator to estimate patient out-of-pocket responsibility at point of service. Calculates deductible, coinsurance, copays, and out-of-pocket maximum caps.',
};

export default function PatientLiabilityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9]">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="h-3.5 w-3.5" /> Point-of-Service Financial Clearance
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            Patient Out-of-Pocket Liability Estimator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Calculate exact patient financial responsibility (deductibles, copays, coinsurance) prior to service delivery. Prevent front-end bad debt and print patient point-of-service financial estimates.
          </p>
        </div>

        <PatientLiabilityEstimator />

        {/* Informational Guidance Section */}
        <section className="mt-16 pt-12 border-t border-gray/15 print:hidden">
          <h2 className="text-xl font-bold text-navy mb-6 text-center">
            Point-of-Service (POS) Collections &amp; Financial Clearance Strategy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-700">
            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                Why Collect at Point-of-Service?
              </h3>
              <p className="leading-relaxed text-slate-600">
                HFMA research indicates that the probability of collecting patient balances drops to <strong>under 30%</strong> once the patient leaves the clinic. Front-end financial clearance recovers 85%+ of anticipated self-pay liability.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                Deductible vs Coinsurance Logic
              </h3>
              <p className="leading-relaxed text-slate-600">
                The contracted allowable is first applied toward any unmet deductible dollar-for-dollar. Once the deductible is exhausted, the remaining allowable balance is split according to the plan coinsurance ratio (e.g. 80% plan / 20% patient).
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray/20 shadow-2xs space-y-2">
              <h3 className="font-bold text-navy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
                High-Deductible Risk Mitigation
              </h3>
              <p className="leading-relaxed text-slate-600">
                For procedures with patient liability exceeding $500, top practices implement automated card-on-file payment plans across 3–6 monthly installments, eliminating subsequent collection agency commissions.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
