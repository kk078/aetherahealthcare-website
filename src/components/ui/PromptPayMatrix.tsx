'use client';

import React, { useState, useMemo } from 'react';
import {
  Scale,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  Check,
  Send,
  Loader2,
  ExternalLink,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

interface StatePromptPayRule {
  state: string;
  name: string;
  elecDays: number;
  paperDays: number;
  annualInterestRate: number; // e.g. 0.18
  statuteCitation: string;
  doiPortalUrl: string;
  notes: string;
}

const STATE_PROMPT_PAY_RULES: StatePromptPayRule[] = [
  {
    state: 'TX',
    name: 'Texas',
    elecDays: 30,
    paperDays: 45,
    annualInterestRate: 0.18,
    statuteCitation: 'Tex. Ins. Code § 1301.103 & § 843.338 (Texas Prompt Pay Act)',
    doiPortalUrl: 'https://www.tdi.texas.gov',
    notes: 'Steepest penalties in the US: 18% statutory penalty plus 50%–100% of difference between billed charges and contracted rate if overdue past 90 days.',
  },
  {
    state: 'FL',
    name: 'Florida',
    elecDays: 20,
    paperDays: 40,
    annualInterestRate: 0.12,
    statuteCitation: 'Fla. Stat. § 627.6131 (Florida Clean Claims Law)',
    doiPortalUrl: 'https://www.floir.com',
    notes: '20 days for electronic clean claims. Payers must contest within 20 days or pay 12% simple annual interest.',
  },
  {
    state: 'CA',
    name: 'California',
    elecDays: 30,
    paperDays: 45,
    annualInterestRate: 0.15,
    statuteCitation: 'Cal. Health & Safety Code § 1371.35 & Ins. Code § 10123.13',
    doiPortalUrl: 'https://www.dmhc.ca.gov',
    notes: '15% annual interest automatically assessed plus a mandatory $10 late payment fee for every claim not adjudicated within 30 working days.',
  },
  {
    state: 'NY',
    name: 'New York',
    elecDays: 30,
    paperDays: 45,
    annualInterestRate: 0.12,
    statuteCitation: 'N.Y. Ins. Law § 3224-a (New York Prompt Pay Law)',
    doiPortalUrl: 'https://www.dfs.ny.gov',
    notes: '12% statutory interest automatically due. DFS imposes civil penalties up to $500 per violation for systemic payer delay patterns.',
  },
  {
    state: 'IL',
    name: 'Illinois',
    elecDays: 30,
    paperDays: 30,
    annualInterestRate: 0.18,
    statuteCitation: '215 ILCS 5/368a (Illinois Insurance Code)',
    doiPortalUrl: 'https://insurance.illinois.gov',
    notes: 'Payers failing to pay within 30 days must pay 9% interest if within 30 days of notice, increasing to 18% annual penalty if persistent.',
  },
  {
    state: 'NC',
    name: 'North Carolina',
    elecDays: 30,
    paperDays: 45,
    annualInterestRate: 0.18,
    statuteCitation: 'N.C. Gen. Stat. § 58-3-225',
    doiPortalUrl: 'https://www.ncdoi.gov',
    notes: '18% statutory interest assessed starting from the 31st day after receipt of an electronic clean claim until remitted.',
  },
  {
    state: 'GA',
    name: 'Georgia',
    elecDays: 15,
    paperDays: 30,
    annualInterestRate: 0.12,
    statuteCitation: 'O.C.G.A. § 33-24-59.5 (Georgia Prompt Pay Act)',
    doiPortalUrl: 'https://oci.georgia.gov',
    notes: 'Aggressive 15-calendar-day mandate for electronic clean claims; 12% per annum penalty plus 10% administrative penalty if contested in bad faith.',
  },
  {
    state: 'OH',
    name: 'Ohio',
    elecDays: 30,
    paperDays: 45,
    annualInterestRate: 0.18,
    statuteCitation: 'Ohio Rev. Code § 3901.381',
    doiPortalUrl: 'https://insurance.ohio.gov',
    notes: '18% annual interest on unpaid clean claim balances starting from the 31st calendar day following electronic receipt.',
  },
  {
    state: 'PA',
    name: 'Pennsylvania',
    elecDays: 45,
    paperDays: 45,
    annualInterestRate: 0.10,
    statuteCitation: '40 Pa. Stat. § 991.2166 (Act 68 Quality Health Care Accountability)',
    doiPortalUrl: 'https://www.insurance.pa.gov',
    notes: '45 calendar days for all clean claims. 10% annual interest penalty assessed automatically on overdue claims.',
  },
  {
    state: 'NJ',
    name: 'New Jersey',
    elecDays: 30,
    paperDays: 40,
    annualInterestRate: 0.12,
    statuteCitation: 'N.J. Stat. § 17B:27-44.2 (Health Claims Authorization Act)',
    doiPortalUrl: 'https://www.state.nj.us/dobi',
    notes: '12% statutory annual interest assessed from the 31st calendar day. Payers must acknowledge electronic receipt within 2 working days.',
  },
  {
    state: 'MI',
    name: 'Michigan',
    elecDays: 45,
    paperDays: 45,
    annualInterestRate: 0.12,
    statuteCitation: 'Mich. Comp. Laws § 500.2006 (Uniform Trade Practices Act)',
    doiPortalUrl: 'https://www.michigan.gov/difs',
    notes: '12% interest penalty per annum on clean claims not paid within 45 days. Enhanced protections under PA 60 Gold Card rules.',
  },
  {
    state: 'VA',
    name: 'Virginia',
    elecDays: 40,
    paperDays: 40,
    annualInterestRate: 0.12,
    statuteCitation: 'Va. Code Ann. § 38.2-3407.15',
    doiPortalUrl: 'https://scc.virginia.gov/boi',
    notes: 'Payers failing to pay or contest clean claims within 40 days must pay 12% statutory interest computed daily.',
  },
  {
    state: 'AZ',
    name: 'Arizona',
    elecDays: 30,
    paperDays: 30,
    annualInterestRate: 0.10,
    statuteCitation: 'Ariz. Rev. Stat. § 20-3102',
    doiPortalUrl: 'https://difi.az.gov',
    notes: 'Clean claims must be approved or denied within 30 days. Unpaid clean claims accrue 10% annual interest penalty.',
  },
  {
    state: 'CO',
    name: 'Colorado',
    elecDays: 30,
    paperDays: 45,
    annualInterestRate: 0.10,
    statuteCitation: 'Colo. Rev. Stat. § 10-16-106.5',
    doiPortalUrl: 'https://doi.colorado.gov',
    notes: '30 calendar days for electronic clean claims. 10% statutory interest plus possible treble damages for bad-faith systemic withholding.',
  },
  {
    state: 'WA',
    name: 'Washington',
    elecDays: 30,
    paperDays: 30,
    annualInterestRate: 0.12,
    statuteCitation: 'Wash. Rev. Code § 48.43.096',
    doiPortalUrl: 'https://www.insurance.wa.gov',
    notes: 'Clean claims must be paid within 30 calendar days. Accrues 1% per month (12% annual) interest until paid.',
  },
  {
    state: 'MA',
    name: 'Massachusetts',
    elecDays: 45,
    paperDays: 45,
    annualInterestRate: 0.18,
    statuteCitation: 'Mass. Gen. Laws ch. 176O § 7',
    doiPortalUrl: 'https://www.mass.gov/orgs/division-of-insurance',
    notes: 'Claims not paid within 45 days accrue 1.5% per month (18% per annum) interest automatically payable to provider.',
  },
];

export default function PromptPayMatrix() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('TX');

  // Calculator inputs
  const [claimAmount, setClaimAmount] = useState<number>(3200);
  const [daysPastReceipt, setDaysPastReceipt] = useState<number>(75);
  const [payerName, setPayerName] = useState('UnitedHealthcare / Commercial PPO');
  const [copiedLetter, setCopiedLetter] = useState(false);

  // Lead form
  const [providerName, setProviderName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const filteredStates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return STATE_PROMPT_PAY_RULES;
    return STATE_PROMPT_PAY_RULES.filter(
      (s) =>
        s.state.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.statuteCitation.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeRule = useMemo(() => {
    return (
      STATE_PROMPT_PAY_RULES.find((s) => s.state === selectedState) ||
      STATE_PROMPT_PAY_RULES[0]
    );
  }, [selectedState]);

  // Calculations
  const statutoryWindowDays = activeRule.elecDays;
  const daysOverdue = Math.max(0, daysPastReceipt - statutoryWindowDays);
  const dailyRate = activeRule.annualInterestRate / 365;
  const accruedStatutoryInterest = Math.round(claimAmount * dailyRate * daysOverdue);
  const totalMandatoryDue = claimAmount + accruedStatutoryInterest;

  const demandLetterText = `FORMAL DEMAND FOR IMMEDIATE PROMPT PAYMENT & STATUTORY INTEREST PENALTY
Date: ${new Date().toLocaleDateString('en-US')}
To: Claims Appeals & Prompt Payment Division (${payerName})
Re: Unlawful Claim Payment Delay on Electronic Clean Claim

Dear Claims Administrator,

This letter serves as a formal statutory notice of violation under ${activeRule.statuteCitation}.

CLAIM SPECIFICATIONS:
- Claim Principal Allowable: $${claimAmount.toLocaleString()}
- Electronic Clean Claim Statutory Window: ${activeRule.elecDays} Calendar Days
- Total Days Elapsed Since Electronic Submission: ${daysPastReceipt} Days
- Days Delinquent Past Statutory Mandate: ${daysOverdue} Days
- Statutory Interest Rate: ${(activeRule.annualInterestRate * 100).toFixed(0)}% Per Annum
- Accrued Statutory Interest Penalty Due: $${accruedStatutoryInterest.toLocaleString()}
- TOTAL MANDATORY DISBURSEMENT DEMANDED: $${totalMandatoryDue.toLocaleString()}

STATUTORY CITATION:
Pursuant to ${activeRule.statuteCitation}, clean claims not adjudicated within ${activeRule.elecDays} days incur non-waivable statutory interest computed daily. 

Please remit the full total of $${totalMandatoryDue.toLocaleString()} within 15 business days. Failure to remit will result in an immediate formal regulatory complaint lodged with the State Department of Insurance (${activeRule.doiPortalUrl}).`;

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(demandLetterText);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handleEscalationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    try {
      const ok = await sendLeadToKiran('prompt_pay_statute_inquiry', {
        providerName,
        email,
        phone,
        state: activeRule.name,
        statute: activeRule.statuteCitation,
        claimAmount: `$${claimAmount.toLocaleString()}`,
        daysElapsed: `${daysPastReceipt} days`,
        daysOverdue: `${daysOverdue} days overdue`,
        accruedInterest: `$${accruedStatutoryInterest.toLocaleString()}`,
        payerName,
        source: '50-State Prompt-Pay Matrix (/tools/prompt-pay-statutes)',
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
      <div className="bg-gradient-to-r from-navy via-[#022859] to-teal rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/20 text-mint text-xs font-bold uppercase tracking-wider border border-mint/30">
            <Scale className="w-3.5 h-3.5" />
            Federal &amp; 50-State Statutory Enforcement Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta text-white">
            50-State Prompt-Payment Statute &amp; Statutory Penalty Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            State prompt-pay statutes legally protect healthcare providers from payer cash-flow starvation. Look up statutory electronic claim payment deadlines (15–30 days), compute accrued annual interest penalties (12%–18%), and generate formal demand letters.
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 5 Columns: State Directory Picker */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray/15 dark:border-slate-800 space-y-4">
          <div className="border-b border-gray/10 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold font-jakarta text-navy dark:text-white">
              State Clean-Claim Laws ({STATE_PROMPT_PAY_RULES.length} Key States)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select a state to inspect prompt-pay mandates and interest penalties.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search state (e.g. Texas, Florida, CA)…"
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>

          {/* State List Scrollable */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredStates.map((st) => (
              <button
                key={st.state}
                type="button"
                onClick={() => setSelectedState(st.state)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                  selectedState === st.state
                    ? 'bg-teal/10 border-teal shadow-xs dark:bg-teal/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-gray/20 dark:border-slate-700/60 hover:border-teal/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-navy dark:text-white flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-navy dark:bg-teal text-white text-[11px] font-mono flex items-center justify-center font-bold">
                      {st.state}
                    </span>
                    {st.name}
                  </span>
                  <span className="text-[11px] font-bold text-mint bg-mint/20 dark:bg-mint/10 px-2 py-0.5 rounded border border-mint/30">
                    {(st.annualInterestRate * 100).toFixed(0)}% Penalty
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  <span>Elec: {st.elecDays}d · Paper: {st.paperDays}d</span>
                  <span className="truncate max-w-[150px] font-mono">{st.statuteCitation.split(' (')[0]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 7 Columns: Active State Detail & Live Statutory Penalty Calculator */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active State Statutory Mandate Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-sm border border-gray/15 dark:border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray/10 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal dark:text-mint">
                  Active State Jurisdiction
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-jakarta text-navy dark:text-white">
                  {activeRule.name} Prompt-Pay Law
                </h3>
              </div>
              <a
                href={activeRule.doiPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal hover:underline self-start sm:self-center"
              >
                <span>State DOI Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Statutory Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-gray/15 dark:border-slate-700">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Electronic Clean Claim</div>
                <div className="text-lg sm:text-xl font-bold text-navy dark:text-white mt-0.5">
                  {activeRule.elecDays} Days
                </div>
                <div className="text-[10px] text-teal dark:text-mint mt-0.5">Statutory Limit</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-gray/15 dark:border-slate-700">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Paper Claim Limit</div>
                <div className="text-lg sm:text-xl font-bold text-navy dark:text-white mt-0.5">
                  {activeRule.paperDays} Days
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Standard Adjudication</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-gray/15 dark:border-slate-700">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Statutory Penalty</div>
                <div className="text-lg sm:text-xl font-bold text-mint mt-0.5">
                  {(activeRule.annualInterestRate * 100).toFixed(0)}% / yr
                </div>
                <div className="text-[10px] text-teal dark:text-mint mt-0.5">Non-Waivable Interest</div>
              </div>
            </div>

            {/* Legal Citation & Enforcement Nuance */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-gray/20 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                Legal Citation: <span className="font-mono text-teal dark:text-mint">{activeRule.statuteCitation}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {activeRule.notes}
              </p>
            </div>
          </div>

          {/* Live Statutory Penalty Calculator */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-sm border border-gray/15 dark:border-slate-800 space-y-5">
            <div className="border-b border-gray/10 dark:border-slate-800 pb-3">
              <h4 className="text-base font-bold font-jakarta text-navy dark:text-white">
                Statutory Interest Penalty Calculator ({activeRule.name})
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Calculate interest accrued on claims held past {activeRule.elecDays} electronic calendar days.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Delayed Claim Balance ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    step="100"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-teal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Days Elapsed Since Electronic Acceptance
                </label>
                <input
                  type="number"
                  min={activeRule.elecDays}
                  value={daysPastReceipt}
                  onChange={(e) => setDaysPastReceipt(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-teal focus:outline-none"
                />
              </div>
            </div>

            {/* Dynamic Calculated Financials */}
            <div className="p-4 rounded-2xl bg-slate-950 text-white grid grid-cols-3 gap-3">
              <div>
                <div className="text-[11px] text-slate-400">Days Delinquent</div>
                <div className="text-base sm:text-lg font-bold font-mono text-amber-400">
                  {daysOverdue} Days
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Past {activeRule.elecDays}d mandate</div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Accrued Interest</div>
                <div className="text-base sm:text-lg font-bold font-mono text-mint">
                  +${accruedStatutoryInterest.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">@ {(activeRule.annualInterestRate * 100).toFixed(0)}% APR</div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Total Legal Demand</div>
                <div className="text-base sm:text-lg font-bold font-mono text-teal">
                  ${totalMandatoryDue.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Principal + Penalty</div>
              </div>
            </div>

            {/* Generated Demand Letter */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-gray/20 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Pre-Formatted Statutory Demand Letter:
                </span>
                <button
                  type="button"
                  onClick={handleCopyLetter}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal hover:text-navy dark:hover:text-white transition"
                >
                  {copiedLetter ? <Check className="w-3.5 h-3.5 text-mint" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLetter ? 'Copied' : 'Copy Demand Letter'}
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-gray/20 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                {demandLetterText}
              </pre>
            </div>

            {/* Direct Escalation Lead Form */}
            <div className="pt-2 border-t border-gray/10 dark:border-slate-800">
              {formStatus === 'success' ? (
                <div className="p-4 rounded-2xl bg-teal/10 border border-teal/20 text-center space-y-1">
                  <CheckCircle2 className="w-7 h-7 text-teal mx-auto" />
                  <div className="text-xs font-bold text-navy dark:text-white">
                    Statutory Demand Request Dispatched!
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Kiran and our Regulatory Recovery Pod will prepare your formal demand filings.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEscalationSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Clinic / Physician Name"
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Work Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Direct Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal hover:bg-navy text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {formStatus === 'submitting' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Transmitting Statutory Filing Parameters...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Have Aethera Enforce Prompt-Pay Statutes on Your Aged AR</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
