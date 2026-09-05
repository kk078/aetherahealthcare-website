'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Scale,
  Copy,
  Check,
  Send,
  Loader2,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

interface PresetProcedure {
  cpt: string;
  name: string;
  contractedRate: number;
  actualPaid: number;
  monthlyVolume: number;
}

const PRESETS: Record<string, PresetProcedure> = {
  cardio_echo: {
    cpt: '93306',
    name: 'Complete Echocardiogram with Doppler',
    contractedRate: 248.0,
    actualPaid: 194.5,
    monthlyVolume: 85,
  },
  ortho_arthro: {
    cpt: '29881',
    name: 'Knee Arthroscopy with Meniscectomy',
    contractedRate: 820.0,
    actualPaid: 675.0,
    monthlyVolume: 35,
  },
  ed_level5: {
    cpt: '99285',
    name: 'Emergency Department Visit (High Severity / MDM)',
    contractedRate: 310.0,
    actualPaid: 215.0,
    monthlyVolume: 120,
  },
  mri_spine: {
    cpt: '72148',
    name: 'MRI Lumbar Spine (without contrast)',
    contractedRate: 415.0,
    actualPaid: 328.0,
    monthlyVolume: 60,
  },
  urgent_visit: {
    cpt: '99214 + S9088',
    name: 'Urgent Care Moderate Visit + Facility Add-on',
    contractedRate: 195.0,
    actualPaid: 142.0,
    monthlyVolume: 180,
  },
};

export default function UnderpaymentAnalyzer() {
  const [selectedPreset, setSelectedPreset] = useState<string>('cardio_echo');
  const [cptCode, setCptCode] = useState<string>(PRESETS.cardio_echo.cpt);
  const [serviceName, setServiceName] = useState<string>(PRESETS.cardio_echo.name);
  const [contractedRate, setContractedRate] = useState<number>(PRESETS.cardio_echo.contractedRate);
  const [actualPaid, setActualPaid] = useState<number>(PRESETS.cardio_echo.actualPaid);
  const [monthlyVolume, setMonthlyVolume] = useState<number>(PRESETS.cardio_echo.monthlyVolume);
  const [promptPayState, setPromptPayState] = useState<'FL' | 'TX' | 'CA' | 'NY' | 'IL'>('FL');

  // Lead dispatch
  const [contactName, setContactName] = useState('');
  const [practiceEmail, setPracticeEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [payerName, setPayerName] = useState('UnitedHealthcare');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [copiedLetter, setCopiedLetter] = useState(false);

  const applyPreset = (key: string) => {
    setSelectedPreset(key);
    const p = PRESETS[key];
    setCptCode(p.cpt);
    setServiceName(p.name);
    setContractedRate(p.contractedRate);
    setActualPaid(p.actualPaid);
    setMonthlyVolume(p.monthlyVolume);
  };

  // Calculations
  const underpaymentPerClaim = Math.max(0, contractedRate - actualPaid);
  const monthlyUnderpaymentLoss = underpaymentPerClaim * monthlyVolume;
  const annualUnderpaymentLoss = monthlyUnderpaymentLoss * 12;

  // Prompt pay statutory interest rates
  const interestRateMap: Record<string, { rate: number; citation: string; penaltyDays: number }> = {
    FL: { rate: 0.12, citation: 'Florida Statute § 627.6131 (12% per annum simple interest)', penaltyDays: 45 },
    TX: { rate: 0.18, citation: 'Texas Insurance Code § 1301.103 (Prompt Pay Act - 18% statutory penalty)', penaltyDays: 30 },
    CA: { rate: 0.15, citation: 'California Health & Safety Code § 1371 (15% per annum interest)', penaltyDays: 45 },
    NY: { rate: 0.12, citation: 'New York Insurance Law § 3224-a (12% per annum prompt payment)', penaltyDays: 30 },
    IL: { rate: 0.09, citation: '215 ILCS 5/368a (9% per annum penalty)', penaltyDays: 30 },
  };

  const stateRule = interestRateMap[promptPayState];
  const accruedStatutoryInterest = Math.round(annualUnderpaymentLoss * stateRule.rate);

  const disputeLetterText = `DEMAND FOR CONTRACTUAL UNDERPAYMENT ADJUSTMENT & STATUTORY INTEREST
Date: ${new Date().toLocaleDateString('en-US')}
To: Payer Network Contracting & Claims Recovery Division (${payerName})
Re: Ongoing Systematic Underpayment on CPT Code ${cptCode} (${serviceName})

Dear Claims Administrator,

Please accept this formal demand for immediate audit and contract variance reconciliation on claims submitted for CPT ${cptCode}.

CONTRACT VARIANCE SPECIFICATIONS:
- Contracted PPO Fee Schedule Allowable: $${contractedRate.toFixed(2)}
- Actual Remitted / Paid Allowable: $${actualPaid.toFixed(2)}
- Discrepancy / Net Underpayment per Claim: $${underpaymentPerClaim.toFixed(2)}
- Estimated Cumulative 12-Month Underpayment Volume: $${annualUnderpaymentLoss.toLocaleString()}

STATUTORY CITATION:
Pursuant to ${stateRule.citation}, clean claims paid below contracted rates or adjudicated beyond ${stateRule.penaltyDays} days incur mandatory statutory interest. Total accrued statutory interest penalty: $${accruedStatutoryInterest.toLocaleString()}.

Please reprocess all underpaid claims at the contracted rate and remit outstanding balances within 30 days.`;

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(disputeLetterText);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    try {
      const ok = await sendLeadToKiran('underpayment_variance_audit_request', {
        contactName,
        email: practiceEmail,
        phone,
        payerName,
        cptCode,
        serviceName,
        contractedRate: `$${contractedRate}`,
        actualPaid: `$${actualPaid}`,
        monthlyVolume,
        monthlyUnderpaymentLoss: `$${monthlyUnderpaymentLoss.toLocaleString()}`,
        annualUnderpaymentLoss: `$${annualUnderpaymentLoss.toLocaleString()}`,
        promptPayState,
        source: 'Payer Contract Underpayment & Variance Analyzer (/tools/underpayment-analyzer)',
        submittedAt: new Date().toISOString(),
      });
      if (ok) {
        setFormStatus('success');
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <div className="space-y-8 font-inter">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <TrendingDown className="w-3.5 h-3.5" />
            Silent PPO Underpayment &amp; Fee Schedule Audit
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-jakarta text-white">
            Payer Contract Underpayment &amp; Variance Analyzer
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Uncover silent payer underpayments where claims are paid below contracted fee schedule rates. Calculate annual revenue leakage, prompt-pay statutory interest penalties, and generate formal dispute letters.
          </p>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 mr-2">Clinical Presets:</span>
            {Object.keys(PRESETS).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  selectedPreset === key
                    ? 'bg-teal text-white border-teal shadow-xs'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-teal'
                }`}
              >
                {PRESETS[key].name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Contract Inputs */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray/15 dark:border-slate-800 space-y-6">
          <div className="border-b border-gray/10 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold font-jakarta text-navy dark:text-white">
              Fee Schedule &amp; Adjudication Parameters
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter your contracted allowable vs the actual amount remitted on your 835 ERA remittance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                CPT / HCPCS Code
              </label>
              <input
                type="text"
                value={cptCode}
                onChange={e => setCptCode(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy dark:text-white font-mono focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Procedure / Service Name
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={e => setServiceName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy dark:text-white focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contracted Allowable ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  step="1"
                  value={contractedRate}
                  onChange={e => setContractedRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy dark:text-white font-mono font-bold focus:ring-2 focus:ring-teal focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Actual Remitted Paid ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  step="1"
                  value={actualPaid}
                  onChange={e => setActualPaid(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy dark:text-white font-mono font-bold focus:ring-2 focus:ring-teal focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Claim Volume
              </label>
              <input
                type="number"
                min="1"
                step="5"
                value={monthlyVolume}
                onChange={e => setMonthlyVolume(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy dark:text-white font-mono font-bold focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>
          </div>

          {/* State Prompt-Pay Selection */}
          <div className="space-y-2 pt-2 border-t border-gray/10 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                State Prompt Payment Statute &amp; Interest Calculator:
              </label>
              <span className="text-[11px] font-mono text-teal dark:text-mint font-bold">
                {stateRule.citation}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {(['FL', 'TX', 'CA', 'NY', 'IL'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setPromptPayState(st)}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    promptPayState === st
                      ? 'bg-navy text-white border-navy dark:bg-teal dark:border-teal shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal'
                  }`}
                >
                  {st} ({(interestRateMap[st].rate * 100).toFixed(0)}%)
                </button>
              ))}
            </div>
          </div>

          {/* Dispute Letter Generator */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy dark:text-white">
                Formal Contract Variance Dispute Demand
              </span>
              <button
                type="button"
                onClick={handleCopyLetter}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal dark:text-mint hover:underline"
              >
                {copiedLetter ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLetter ? 'Copied' : 'Copy Dispute Letter'}
              </button>
            </div>
            <pre className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
              {disputeLetterText}
            </pre>
          </div>
        </div>

        {/* Right 5 Cols: Financial Leakage & Audit Request */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <span className="text-[11px] font-bold text-teal uppercase tracking-wider">
                Variance Impact
              </span>
              <span className="text-xs font-mono text-rose-400 font-bold">
                -${underpaymentPerClaim.toFixed(2)}/claim
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block font-semibold">Monthly Trapped Underpayments</span>
                <strong className="text-2xl font-extrabold text-rose-400 font-mono">
                  ${monthlyUnderpaymentLoss.toLocaleString()}
                </strong>
                <span className="text-[10px] text-slate-500 block">Based on {monthlyVolume} claims/mo</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block font-semibold">12-Month Cumulative Underpayment Loss</span>
                <strong className="text-2xl font-extrabold text-white font-mono">
                  ${annualUnderpaymentLoss.toLocaleString()}
                </strong>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal/20 to-slate-950 border border-teal/40 space-y-1">
                <span className="text-[11px] text-teal block font-semibold">
                  Accruable Statutory Interest ({promptPayState})
                </span>
                <strong className="text-2xl font-extrabold text-mint font-mono">
                  +${accruedStatutoryInterest.toLocaleString()}
                </strong>
                <span className="text-[10px] text-slate-300 block">Mandatory per {stateRule.citation.split(' (')[0]}</span>
              </div>
            </div>
          </div>

          {/* Underpayment Audit Request Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray/15 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-navy dark:text-white uppercase tracking-wider">
              Request Full Contract Underpayment Audit
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aethera cross-references 100% of your 835 remittance data against your active commercial fee schedule contracts to reclaim underpaid balances.
            </p>

            {formStatus === 'success' ? (
              <div className="p-3.5 rounded-2xl bg-mint/15 border border-mint/30 text-teal dark:text-mint text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Audit request dispatched directly to Kiran. We will review your payer fee schedules within 2 business hours.
              </div>
            ) : (
              <form onSubmit={handleSubmitAudit} className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Contact Name"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray/25 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Payer Name (e.g. Aetna)"
                    value={payerName}
                    onChange={e => setPayerName(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray/25 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Work Email"
                    value={practiceEmail}
                    onChange={e => setPracticeEmail(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray/25 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray/25 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal text-white font-bold hover:bg-navy transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {formStatus === 'submitting' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Audit My Payer Underpayments
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
