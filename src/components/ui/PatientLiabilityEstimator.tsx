'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Printer,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Receipt,
  UserCheck,
} from 'lucide-react';
import { PRIMARY_EXPERT_EMAIL } from '@/lib/worker';

interface PresetOption {
  name: string;
  cpt: string;
  description: string;
  allowableFee: number;
  copay: number;
  coinsurance: number;
}

const PRESETS: Record<string, PresetOption> = {
  office_visit: {
    name: 'Established Office Visit (Level 4)',
    cpt: '99214',
    description: 'Outpatient E&M for complex chronic disease management',
    allowableFee: 195,
    copay: 35,
    coinsurance: 0,
  },
  mri_brain: {
    name: 'Brain MRI with & without Contrast',
    cpt: '70553',
    description: 'Magnetic resonance imaging brain and brain stem',
    allowableFee: 920,
    copay: 0,
    coinsurance: 20,
  },
  knee_surgery: {
    name: 'Knee Arthroscopy Meniscectomy',
    cpt: '29881',
    description: 'Ambulatory outpatient knee joint surgical procedure',
    allowableFee: 2650,
    copay: 100,
    coinsurance: 20,
  },
  echocardiogram: {
    name: 'Transthoracic Echocardiogram',
    cpt: '93306',
    description: 'Comprehensive Doppler & 2D cardiac ultrasound',
    allowableFee: 540,
    copay: 40,
    coinsurance: 15,
  },
};

export default function PatientLiabilityEstimator() {
  const [patientName, setPatientName] = useState('Michael Chang');
  const [payerName, setPayerName] = useState('Blue Cross Blue Shield PPO');
  const [cptCode, setCptCode] = useState(PRESETS.office_visit.cpt);
  const [procedureDesc, setProcedureDesc] = useState(PRESETS.office_visit.description);
  const [contractedAllowable, setContractedAllowable] = useState(PRESETS.office_visit.allowableFee);
  const [remainingDeductible, setRemainingDeductible] = useState(250);
  const [copayAmount, setCopayAmount] = useState(PRESETS.office_visit.copay);
  const [coinsurancePercent, setCoinsurancePercent] = useState(PRESETS.office_visit.coinsurance);
  const [remainingOopMax, setRemainingOopMax] = useState(3500);

  const applyPreset = (key: string) => {
    const p = PRESETS[key];
    if (!p) return;
    setCptCode(p.cpt);
    setProcedureDesc(p.description);
    setContractedAllowable(p.allowableFee);
    setCopayAmount(p.copay);
    setCoinsurancePercent(p.coinsurance);
  };

  // Calculations
  const allowable = Math.max(0, Number(contractedAllowable) || 0);
  const deductibleRem = Math.max(0, Number(remainingDeductible) || 0);
  const copay = Math.max(0, Number(copayAmount) || 0);
  const coinsRate = Math.min(100, Math.max(0, Number(coinsurancePercent) || 0)) / 100;
  const oopMaxRem = Math.max(0, Number(remainingOopMax) || 0);

  // 1. Portion of allowable absorbed by deductible
  const deductibleApplied = Math.min(allowable, deductibleRem);

  // 2. Portion left after deductible subject to coinsurance
  const postDeductibleBalance = Math.max(0, allowable - deductibleApplied);
  const coinsuranceDollars = Math.round(postDeductibleBalance * coinsRate);

  // 3. Raw patient responsibility
  const rawPatientTotal = deductibleApplied + coinsuranceDollars + copay;

  // 4. Cap at remaining Out-of-Pocket Maximum
  const patientOwes = Math.min(rawPatientTotal, oopMaxRem);
  const oopMaxDiscount = rawPatientTotal > oopMaxRem ? rawPatientTotal - oopMaxRem : 0;

  // 5. Insurance plan responsibility
  const insurancePays = Math.max(0, allowable - patientOwes);

  // Percentage splits
  const patientSharePct = allowable > 0 ? Math.round((patientOwes / allowable) * 100) : 0;
  const planSharePct = Math.max(0, 100 - patientSharePct);

  // Risk of Bad Debt Category
  let riskTier = 'low';
  let riskBadge = 'Standard POS Collection';
  let riskDesc = 'Collect via credit card on file or standard front-desk check-in.';

  if (patientOwes > 750) {
    riskTier = 'critical';
    riskBadge = 'High Risk of Bad Debt (> $750)';
    riskDesc = 'Require upfront payment plan agreement (3–6 month card auto-debit) or deposit prior to elective treatment.';
  } else if (patientOwes > 250) {
    riskTier = 'moderate';
    riskBadge = 'Moderate Liability ($250 – $750)';
    riskDesc = 'Secure 50% deposit at check-in; notify patient 48 hours prior to visit.';
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="space-y-8">
      {/* Interactive Estimator Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray/20 shadow-sm print:hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-teal font-bold text-xs uppercase tracking-wider">
              <Receipt className="h-4 w-4" />
              <span>Front-Desk POS Financial Clearance</span>
            </div>
            <h2 className="text-xl font-bold text-navy mt-1">Patient Copay, Deductible &amp; Coinsurance Calculator</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Quick CPT Presets:</span>
            {Object.keys(PRESETS).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className="px-2.5 py-1.5 rounded-lg bg-cream text-navy hover:bg-teal hover:text-white transition-colors text-xs font-semibold border border-gray/20"
              >
                {PRESETS[key].cpt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              className="w-full px-3 py-2 border border-gray/25 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Payer / Plan Name</label>
            <input
              type="text"
              value={payerName}
              onChange={e => setPayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray/25 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">CPT / HCPCS Code</label>
            <input
              type="text"
              value={cptCode}
              onChange={e => setCptCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray/25 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Procedure Description</label>
            <input
              type="text"
              value={procedureDesc}
              onChange={e => setProcedureDesc(e.target.value)}
              className="w-full px-3 py-2 border border-gray/25 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal focus:outline-none"
            />
          </div>
        </div>

        {/* Insurance Benefit Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Contracted Allowable ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                value={contractedAllowable}
                onChange={e => setContractedAllowable(parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 border border-gray/25 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Remaining Deductible ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                value={remainingDeductible}
                onChange={e => setRemainingDeductible(parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 border border-gray/25 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Fixed Copay ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                value={copayAmount}
                onChange={e => setCopayAmount(parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 border border-gray/25 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Coinsurance (%)</label>
            <div className="relative">
              <input
                type="number"
                value={coinsurancePercent}
                onChange={e => setCoinsurancePercent(parseFloat(e.target.value) || 0)}
                className="w-full pl-3 pr-7 py-2 border border-gray/25 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Remaining OOP Max ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                value={remainingOopMax}
                onChange={e => setRemainingOopMax(parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 border border-gray/25 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy hover:bg-teal text-white font-bold text-xs transition-colors shadow-xs"
          >
            <Printer className="h-4 w-4" /> Print Patient Financial Estimate
          </button>
        </div>
      </div>

      {/* RESULTS & CALCULATION BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Financial Split Visualization */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-gray/20 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-navy">Reimbursement &amp; Liability Split</h3>
            <span className="text-xs font-semibold text-slate-500">Contracted Allowable: ${allowable.toLocaleString()}</span>
          </div>

          {/* Visual Ratio Bar */}
          <div className="space-y-2">
            <div className="h-6 rounded-xl overflow-hidden flex shadow-inner bg-slate-100 text-[11px] font-bold text-white leading-6 text-center">
              <div
                style={{ width: `${planSharePct}%` }}
                className="bg-navy transition-all duration-500 overflow-hidden px-1"
                title={`Insurance Pays: $${insurancePays}`}
              >
                {planSharePct > 15 && `Plan ${planSharePct}%`}
              </div>
              <div
                style={{ width: `${patientSharePct}%` }}
                className="bg-teal transition-all duration-500 overflow-hidden px-1"
                title={`Patient Owes: $${patientOwes}`}
              >
                {patientSharePct > 15 && `Patient ${patientSharePct}%`}
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-navy inline-block" />
                Insurance Coverage: <strong>${insurancePays.toLocaleString()}</strong> ({planSharePct}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-teal inline-block" />
                Patient Responsibility: <strong>${patientOwes.toLocaleString()}</strong> ({patientSharePct}%)
              </span>
            </div>
          </div>

          {/* Detailed Waterfall Allocation */}
          <div className="p-4 rounded-xl bg-cream/40 border border-gray/15 space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span>1. Deductible Component (up to ${deductibleRem.toLocaleString()} remaining):</span>
              <strong className="text-navy font-bold">${deductibleApplied.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>2. Post-Deductible Coinsurance ({coinsurancePercent}% of ${(postDeductibleBalance).toLocaleString()}):</span>
              <strong className="text-navy font-bold">${coinsuranceDollars.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>3. Primary In-Network Copay:</span>
              <strong className="text-navy font-bold">${copay.toLocaleString()}</strong>
            </div>
            {oopMaxDiscount > 0 && (
              <div className="flex justify-between items-center text-emerald-700 font-semibold pt-1 border-t border-gray/10">
                <span>4. Out-of-Pocket Maximum Cap Adjustment:</span>
                <span>-${oopMaxDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-navy font-extrabold text-sm pt-2 border-t-2 border-navy">
              <span>Total Upfront Patient Responsibility:</span>
              <span className="text-base text-teal">${patientOwes.toLocaleString()}</span>
            </div>
          </div>

          {/* Bad Debt Risk Warning Box */}
          <div
            className={`p-4 rounded-xl border text-xs space-y-1.5 ${
              riskTier === 'critical'
                ? 'bg-red-50/70 border-red-200 text-red-900'
                : riskTier === 'moderate'
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {riskTier === 'critical' ? (
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-teal shrink-0" />
              )}
              <span>POS Recommendation: {riskBadge}</span>
            </div>
            <p className="leading-relaxed opacity-90">{riskDesc}</p>
          </div>
        </div>

        {/* Right: Printable Patient Estimate Receipt */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-gray/20 shadow-md space-y-4 font-sans text-slate-800">
          <div className="border-b-2 border-navy pb-3 flex items-center justify-between">
            <div>
              <p className="font-extrabold text-navy text-sm">POINT OF SERVICE RECEIPT</p>
              <p className="text-[10px] text-slate-500">Estimated Patient Financial Responsibility</p>
            </div>
            <Receipt className="h-6 w-6 text-teal" />
          </div>

          <div className="space-y-1 text-xs border-b border-gray/15 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-semibold text-navy">{patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Insurance Plan:</span>
              <span className="font-semibold text-slate-800">{payerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">CPT Code:</span>
              <span className="font-mono font-bold text-teal">{cptCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Description:</span>
              <span className="text-slate-700 text-right truncate max-w-[180px]">{procedureDesc}</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs border-b-2 border-navy pb-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Contracted Fee:</span>
              <span>${allowable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Applied to Deductible:</span>
              <span>${deductibleApplied.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Coinsurance Amount:</span>
              <span>${coinsuranceDollars.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Copayment:</span>
              <span>${copay.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray/10 text-navy font-bold text-sm">
              <span>Amount Due Today:</span>
              <span className="text-teal">${patientOwes.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 leading-relaxed italic">
            Notice: This is an estimate based on information currently provided by your insurer. Final claims adjudication
            by your payer may result in additional balance or refund.
          </div>

          <div className="pt-4 border-t border-gray/20">
            <div className="h-8 border-b border-slate-300 mb-1" />
            <span className="text-[10px] text-slate-500 block">Patient Acknowledgment Signature &amp; Date</span>
          </div>
        </div>
      </div>

      {/* RCM Front-End Best Practice Callout */}
      <div className="rounded-2xl bg-cream p-6 border border-gray/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="font-bold text-navy text-sm sm:text-base">
            Eliminate Uncollected Patient Balances with Automated Front-End Verification
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Collecting patient responsibility at time-of-service recovers <strong>85% more cash</strong> than post-visit billing statements. Aethera configures automated 270/271 clearinghouse sweeps 48 hours prior to every scheduled appointment.
          </p>
        </div>
        <Link
          href="/free-assessment"
          className="px-5 py-2.5 rounded-xl bg-navy hover:bg-teal text-white font-bold text-xs transition-colors shrink-0 shadow-sm"
        >
          Book Practice Assessment
        </Link>
      </div>
    </div>
  );
}
