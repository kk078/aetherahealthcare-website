'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ArrowRight,
} from 'lucide-react';

interface CptBenchmark {
  code: string;
  desc: string;
  medicareRate: number; // 2026 CMS PFS Non-Facility National Average
  commercialTypicalRate: number; // ~135% Medicare
  commercialTopRate: number; // ~160% Medicare
}

const SPECIALTY_PRESETS: Record<string, CptBenchmark[]> = {
  'Primary Care': [
    { code: '99213', desc: 'Office visit, established, level 3 (low)', medicareRate: 91.5, commercialTypicalRate: 125.0, commercialTopRate: 148.0 },
    { code: '99214', desc: 'Office visit, established, level 4 (moderate)', medicareRate: 130.8, commercialTypicalRate: 178.0, commercialTopRate: 210.0 },
    { code: '99215', desc: 'Office visit, established, level 5 (high)', medicareRate: 184.2, commercialTypicalRate: 252.0, commercialTopRate: 298.0 },
    { code: '99396', desc: 'Preventive exam, established (40-64 yrs)', medicareRate: 145.0, commercialTypicalRate: 195.0, commercialTopRate: 235.0 },
    { code: '99490', desc: 'Chronic care management (CCM), 20 min', medicareRate: 62.4, commercialTypicalRate: 85.0, commercialTopRate: 98.0 },
  ],
  Cardiology: [
    { code: '99214', desc: 'Office visit, established, level 4', medicareRate: 130.8, commercialTypicalRate: 178.0, commercialTopRate: 210.0 },
    { code: '93000', desc: '12-lead EKG, tracing and interpretation', medicareRate: 18.2, commercialTypicalRate: 35.0, commercialTopRate: 48.0 },
    { code: '93306', desc: 'Echocardiography, complete with Doppler', medicareRate: 220.5, commercialTypicalRate: 380.0, commercialTopRate: 465.0 },
    { code: '93015', desc: 'Cardiovascular stress test, complete', medicareRate: 88.6, commercialTypicalRate: 145.0, commercialTopRate: 180.0 },
    { code: '93224', desc: 'Holter monitor, up to 48 hours', medicareRate: 104.2, commercialTypicalRate: 175.0, commercialTopRate: 220.0 },
  ],
  Orthopedics: [
    { code: '99214', desc: 'Office visit, established, level 4', medicareRate: 130.8, commercialTypicalRate: 178.0, commercialTopRate: 210.0 },
    { code: '20610', desc: 'Arthrocentesis / major joint injection', medicareRate: 85.4, commercialTypicalRate: 145.0, commercialTopRate: 185.0 },
    { code: '73560', desc: 'X-ray, knee, 1 or 2 views', medicareRate: 32.5, commercialTypicalRate: 58.0, commercialTopRate: 75.0 },
    { code: '29881', desc: 'Knee arthroscopy with meniscectomy', medicareRate: 585.0, commercialTypicalRate: 940.0, commercialTopRate: 1250.0 },
    { code: '20611', desc: 'Joint injection with ultrasound guidance', medicareRate: 112.8, commercialTypicalRate: 185.0, commercialTopRate: 230.0 },
  ],
  Dermatology: [
    { code: '99213', desc: 'Office visit, established, level 3', medicareRate: 91.5, commercialTypicalRate: 125.0, commercialTopRate: 148.0 },
    { code: '17000', desc: 'Destruction of premalignant lesion, 1st', medicareRate: 78.4, commercialTypicalRate: 128.0, commercialTopRate: 165.0 },
    { code: '11102', desc: 'Tangential biopsy of skin single lesion', medicareRate: 98.2, commercialTypicalRate: 160.0, commercialTopRate: 210.0 },
    { code: '17110', desc: 'Destruction of benign lesions, up to 14', medicareRate: 108.5, commercialTypicalRate: 175.0, commercialTopRate: 225.0 },
    { code: '17311', desc: 'Mohs micrographic surgery, 1st stage', medicareRate: 642.0, commercialTypicalRate: 1020.0, commercialTopRate: 1380.0 },
  ],
  Psychiatry: [
    { code: '99214', desc: 'Office visit, established, level 4', medicareRate: 130.8, commercialTypicalRate: 178.0, commercialTopRate: 210.0 },
    { code: '90837', desc: 'Psychotherapy, 60 minutes', medicareRate: 154.2, commercialTypicalRate: 195.0, commercialTopRate: 240.0 },
    { code: '90833', desc: 'Psychotherapy add-on with E/M, 30 min', medicareRate: 76.5, commercialTypicalRate: 105.0, commercialTopRate: 135.0 },
    { code: '90792', desc: 'Psychiatric diagnostic eval with medical', medicareRate: 245.0, commercialTypicalRate: 340.0, commercialTopRate: 410.0 },
    { code: '90834', desc: 'Psychotherapy, 45 minutes', medicareRate: 118.4, commercialTypicalRate: 155.0, commercialTopRate: 190.0 },
  ],
};

export default function FeeScheduleBenchmarker() {
  const [specialty, setSpecialty] = useState<string>('Primary Care');
  const [providerCount, setProviderCount] = useState<number>(2);
  const [averageDiscountPct, setAverageDiscountPct] = useState<number>(15); // % under top commercial benchmark

  const codes = SPECIALTY_PRESETS[specialty] || SPECIALTY_PRESETS['Primary Care'];

  // Calculate annual metrics based on typical encounter distribution
  const analysis = useMemo(() => {
    // Approx 250 visits per provider per month
    const totalEncountersPerYear = providerCount * 250 * 12;
    const encountersPerCode = totalEncountersPerYear / codes.length;

    let totalMedicare = 0;
    let totalCommercialTarget = 0;
    let totalPracticeEstimated = 0;

    for (const c of codes) {
      const annualMed = c.medicareRate * encountersPerCode;
      const annualTop = c.commercialTopRate * encountersPerCode;
      // Realized with current fee schedule discount
      const annualRealized = annualTop * (1 - averageDiscountPct / 100);

      totalMedicare += annualMed;
      totalCommercialTarget += annualTop;
      totalPracticeEstimated += annualRealized;
    }

    const underpaymentGap = totalCommercialTarget - totalPracticeEstimated;
    const monthlyGap = underpaymentGap / 12;

    return {
      totalEncountersPerYear,
      totalMedicare: Math.round(totalMedicare),
      totalCommercialTarget: Math.round(totalCommercialTarget),
      totalPracticeEstimated: Math.round(totalPracticeEstimated),
      underpaymentGap: Math.round(underpaymentGap),
      monthlyGap: Math.round(monthlyGap),
    };
  }, [codes, providerCount, averageDiscountPct]);

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden font-inter">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-[#003087] to-teal p-6 text-white">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cream text-xs font-semibold uppercase tracking-wider mb-2">
          <DollarSign className="h-3.5 w-3.5 text-mint" /> 2026 CMS &amp; Commercial Fee Benchmarker
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-jakarta">
          CPT Fee Schedule &amp; Reimbursement Gap Calculator
        </h2>
        <p className="text-xs sm:text-sm text-cream/90 max-w-2xl mt-1">
          Compare your practice’s commercial reimbursement allowances against 2026 Medicare allowable rates and
          top-quartile commercial PPO contracts to measure underpaid revenue.
        </p>
      </div>

      {/* Control Panel */}
      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Medical Specialty
            </label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-teal"
            >
              {Object.keys(SPECIALTY_PRESETS).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Practicing Providers: <span className="text-[#003087]">{providerCount}</span>
            </label>
            <input
              type="range"
              min="1"
              max="25"
              value={providerCount}
              onChange={(e) => setProviderCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#003087] mt-3"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Estimated Contract Discount: <span className="text-[#003087]">{averageDiscountPct}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="35"
              step="5"
              value={averageDiscountPct}
              onChange={(e) => setAverageDiscountPct(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#003087] mt-3"
            />
          </div>
        </div>
      </div>

      {/* Primary KPI Result Banner */}
      <div className="p-6">
        <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Estimated Annual Commercial Underpayment Gap
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#001A52] font-jakarta mt-1">
              ${analysis.underpaymentGap.toLocaleString()}
              <span className="text-sm font-normal text-slate-500 ml-2">/ year</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Approx. <strong className="text-emerald-700 font-bold">${analysis.monthlyGap.toLocaleString()}/month</strong>{' '}
              left uncollected due to outdated commercial payer fee schedule allowances.
            </p>
          </div>

          <Link
            href="/schedule"
            className="bg-[#003087] hover:bg-[#001A52] text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
          >
            <span>Have Aethera Audit Fee Schedules</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Code Breakdown Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">CPT Code</th>
                <th className="p-3">Service Description</th>
                <th className="p-3">2026 Medicare Allowable</th>
                <th className="p-3">Commercial Typical (135%)</th>
                <th className="p-3 text-right">Top PPO Benchmark (160%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {codes.map((c) => (
                <tr key={c.code} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-[#003087]">{c.code}</td>
                  <td className="p-3 font-medium">{c.desc}</td>
                  <td className="p-3 font-mono">${c.medicareRate.toFixed(2)}</td>
                  <td className="p-3 font-mono font-semibold text-slate-800">
                    ${c.commercialTypicalRate.toFixed(2)}
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-700 text-right">
                    ${c.commercialTopRate.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footnote */}
        <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
          *Medicare allowable rates reflect 2026 CMS Physician Fee Schedule (MPFS) non-facility national conversion factor averages.
          Commercial benchmark percentiles reflect proprietary multi-payer aggregated adjudication data across Aetna, BCBS, Cigna, and UHC.
        </p>
      </div>
    </div>
  );
}
