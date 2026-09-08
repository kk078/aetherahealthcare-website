'use client';
import { DENIAL_RULES, appealReadiness } from '@/lib/rules/denialReadiness';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Send,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

export default function DenialOverturnPredictor() {
  const [selectedCarc, setSelectedCarc] = useState<string>('CO-50');
  const [payerType, setPayerType] = useState<'commercial' | 'medicare' | 'medicaid'>('commercial');
  const [daysElapsed, setDaysElapsed] = useState<number>(25);
  const [hasChartNotes, setHasChartNotes] = useState<boolean>(true);
  const [hasLmn, setHasLmn] = useState<boolean>(false);
  const [hasPeerToPeer, setHasPeerToPeer] = useState<boolean>(false);
  const [hasClearinghouseProof, setHasClearinghouseProof] = useState<boolean>(true);
  const [copiedStrategy, setCopiedStrategy] = useState<boolean>(false);

  // Lead form
  const [providerName, setProviderName] = useState('');
  const [practiceEmail, setPracticeEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [claimAmount, setClaimAmount] = useState<number>(4500);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const rule = DENIAL_RULES[selectedCarc] || DENIAL_RULES['CO-50'];
  const deadlineDays = rule.appealDeadlineDays[payerType];
  const daysRemaining = Math.max(0, deadlineDays - daysElapsed);

  const calculatedProbability = appealReadiness([hasChartNotes, hasLmn, hasPeerToPeer, hasClearinghouseProof]);

  const urgencyTier = useMemo(() => {
    if (daysRemaining <= 0) return { label: 'Reference Window Reached', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
    if (daysRemaining <= 15) return { label: 'Critical: Expiring in ≤15 Days', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    if (daysRemaining <= 30) return { label: 'Urgent: Expiring in ≤30 Days', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' };
    return { label: 'Optimal Window Open', color: 'text-teal dark:text-mint', bg: 'bg-teal/10 border-teal/20' };
  }, [daysRemaining]);

  const handleCopyStrategy = () => {
    navigator.clipboard.writeText(rule.strategyTemplate);
    setCopiedStrategy(true);
    setTimeout(() => setCopiedStrategy(false), 2000);
  };

  const handleEscalationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    try {
      const ok = await sendLeadToKiran('denial_overturn_escalation_request', {
        providerName,
        email: practiceEmail,
        phone,
        carcCode: rule.carc,
        denialName: rule.name,
        payerType,
        daysElapsed: `${daysElapsed} days`,
        daysRemaining: `${daysRemaining} days`,
        documentReadinessScore: `${calculatedProbability}/100`,
        claimAmount: `$${claimAmount.toLocaleString()}`,
        hasChartNotes,
        hasLmn,
        hasPeerToPeer,
        hasClearinghouseProof,
        source: 'Claim Denial Overturn Predictor (/tools/denial-overturn-predictor)',
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
      <div className="bg-gradient-to-r from-navy via-[#002f6c] to-teal rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/20 text-mint text-xs font-bold uppercase tracking-wider border border-mint/30">
            <Sparkles className="w-3.5 h-3.5" />
            Predictive Denial Overturn Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta text-white">
            Denial Appeal Readiness &amp; Review Checklist
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Select a CARC denial code, target payer class, and active documentation status. Review document readiness and reference timeframes. Confirm the actual deadline and applicable policy with the payer before acting.
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Interactive Configuration */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray/15 dark:border-slate-800 space-y-6">
          <div className="border-b border-gray/10 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold font-jakarta text-navy dark:text-white">
              Denial Parameters &amp; Clinical Evidence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize the denial scenario from your 835 Electronic Remittance Advice.
            </p>
          </div>

          {/* CARC Code Selector */}
          <div className="space-y-2">
            <label htmlFor="carc-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Select CARC Denial Code &amp; Reason:
            </label>
            <select
              id="carc-select"
              value={selectedCarc}
              onChange={(e) => setSelectedCarc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal focus:outline-none"
            >
              {Object.keys(DENIAL_RULES).map((key) => (
                <option key={key} value={key}>
                  {key}: {DENIAL_RULES[key].category} — {DENIAL_RULES[key].name.slice(0, 70)}…
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              {rule.name}
            </p>
          </div>

          {/* Payer Class Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Payer Category:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'commercial', label: 'Commercial PPO' },
                { id: 'medicare', label: 'Medicare Part B / MAC' },
                { id: 'medicaid', label: 'State Medicaid MCO' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPayerType(p.id as typeof payerType)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    payerType === p.id
                      ? 'bg-navy text-white border-navy dark:bg-teal dark:border-teal shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Days Elapsed Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="days-elapsed-slider" className="font-bold text-slate-700 dark:text-slate-300">
                Days Elapsed Since 835 Remittance Date:
              </label>
              <span className="font-mono font-bold text-teal dark:text-mint">
                {daysElapsed} Days Elapsed ({daysRemaining} Days Left)
              </span>
            </div>
            <input
              id="days-elapsed-slider"
              type="range"
              min="1"
              max={deadlineDays + 15}
              value={daysElapsed}
              onChange={(e) => setDaysElapsed(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Day 1 (Fresh Denial)</span>
              <span>Day {Math.round(deadlineDays / 2)}</span>
              <span>Day {deadlineDays} (Reference Deadline)</span>
            </div>
          </div>

          {/* Clinical Evidence Checklist */}
          <div className="space-y-3 pt-2 border-t border-gray/10 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Active Supporting Evidence Available for Appeal:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-gray/20 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasChartNotes}
                  onChange={(e) => setHasChartNotes(e.target.checked)}
                  className="rounded text-teal focus:ring-teal"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Signed Clinical Chart / Operative Note
                </span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-gray/20 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLmn}
                  onChange={(e) => setHasLmn(e.target.checked)}
                  className="rounded text-teal focus:ring-teal"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Physician Letter of Medical Necessity
                </span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-gray/20 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPeerToPeer}
                  onChange={(e) => setHasPeerToPeer(e.target.checked)}
                  className="rounded text-teal focus:ring-teal"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Peer-to-Peer Review Requested
                </span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-gray/20 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasClearinghouseProof}
                  onChange={(e) => setHasClearinghouseProof(e.target.checked)}
                  className="rounded text-teal focus:ring-teal"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Clearinghouse 277CA Audit Trail
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Overturn Probability & Strategy Playbook */}
        <div className="lg:col-span-5 space-y-6">
          {/* Probability Scorecard */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-sm border border-gray/15 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-gray/10 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Document Readiness Score
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${urgencyTier.bg} ${urgencyTier.color}`}>
                {urgencyTier.label}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-4xl sm:text-5xl font-black font-jakarta text-navy dark:text-white">
                  {calculatedProbability}/100
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Checklist completion — not a prediction of appeal success
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-teal dark:text-mint">
                  {daysRemaining}d
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Reference days remaining
                </div>
              </div>
            </div>

            {/* Strategic Remediation Steps */}
            <div className="pt-3 border-t border-gray/10 dark:border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Recommended Appeal Playbook:
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {rule.remediationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-teal/10 text-teal dark:text-mint text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Copyable Statutory Legal Citation */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-gray/20 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                  Policy reference to verify:
                </span>
                <button
                  type="button"
                  onClick={handleCopyStrategy}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal hover:text-navy dark:hover:text-white transition"
                >
                  {copiedStrategy ? <Check className="w-3 h-3 text-mint" /> : <Copy className="w-3 h-3" />}
                  {copiedStrategy ? 'Copied' : 'Copy Citation'}
                </button>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                &ldquo;{rule.strategyTemplate}&rdquo;
              </p>
              <div className="text-[10px] text-teal dark:text-mint font-mono font-semibold">
                Ref: {rule.statutoryCitation}
              </div>
            </div>
          </div>

          {/* Direct Denial Escalation Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-sm border border-gray/15 dark:border-slate-800 space-y-4">
            <h4 className="text-sm font-bold font-jakarta text-navy dark:text-white">
              Have Aethera Overturn This Denial For You
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Our specialized Level 1/2 appeals team recovers 82%+ of denials without cost until cash is in your bank account.
            </p>

            {formStatus === 'success' ? (
              <div className="p-4 rounded-2xl bg-teal/10 border border-teal/20 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-teal mx-auto" />
                <div className="text-xs font-bold text-navy dark:text-white">
                  Appeal Strategy Request Dispatched!
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Kiran and our Denial Management Team will contact you within 2 business hours with an appeal packet.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEscalationSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Provider / Clinic Name"
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Denied Balance ($)"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Work Email"
                      value={practiceEmail}
                      onChange={(e) => setPracticeEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Direct Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal hover:bg-navy text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {formStatus === 'submitting' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting Denial Data...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Free Denial Overturn Review</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
