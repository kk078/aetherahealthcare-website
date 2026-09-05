'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Copy,
  Check,
  Send,
  Loader2,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  Percent,
  Sparkles,
  Layers,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

interface DenialRule {
  carc: string;
  name: string;
  category: string;
  baseOverturnRate: number;
  appealDeadlineDays: {
    medicare: number;
    commercial: number;
    medicaid: number;
  };
  keyDocumentationNeeded: string[];
  remediationSteps: string[];
  statutoryCitation: string;
  strategyTemplate: string;
}

const DENIAL_RULES: Record<string, DenialRule> = {
  'CO-50': {
    carc: 'CO-50',
    name: 'These are non-covered services because this is not deemed a medical necessity by the payer.',
    category: 'Medical Necessity',
    baseOverturnRate: 74,
    appealDeadlineDays: { medicare: 120, commercial: 180, medicaid: 60 },
    keyDocumentationNeeded: [
      'Attending physician Letter of Medical Necessity (LMN)',
      'Specific LCD/NCD coverage indication matching primary ICD-10',
      'Documented failure of conservative therapy (minimum 6–12 weeks where applicable)',
      'Diagnostic pathology or imaging reports confirming clinical diagnosis',
    ],
    remediationSteps: [
      'Audit the denying payer\'s specific clinical coverage policy bulletin (CPB) against chart notes.',
      'Highlight documented conservative treatment trial failure and physical exam objective findings.',
      'Submit formal Level 1 Redetermination or Reconsideration with physician-signed LMN attached.',
    ],
    statutoryCitation: 'CMS Medicare Claims Processing Manual Pub. 100-04, Ch. 29 & ERISA 29 CFR § 2560.503-1(h)',
    strategyTemplate:
      'Pursuant to ERISA regulations 29 CFR § 2560.503-1(h) and published Local Coverage Determination criteria, the contested services satisfy all medical necessity guidelines. Enclosed clinical records substantiate conservative management failure and objective diagnostic indicators warranting immediate overturn.',
  },
  'CO-197': {
    carc: 'CO-197',
    name: 'Precertification / authorization / notification / pre-treatment absent.',
    category: 'Prior Authorization',
    baseOverturnRate: 58,
    appealDeadlineDays: { medicare: 120, commercial: 180, medicaid: 45 },
    keyDocumentationNeeded: [
      'Proof of urgent/emergent presentation overriding elective pre-auth rules',
      'Payer portal confirmation timestamp or written retro-auth request',
      'Clinical justification demonstrating emergency medical stabilization (EMTALA/Prudent Layperson)',
      'State Gold-Card exemption documentation (if in TX, MI, or GA)',
    ],
    remediationSteps: [
      'Determine if the service was urgent/emergent; if so, cite EMTALA and Prudent Layperson Standard.',
      'Check if provider qualifies for state Gold Card prior-auth exemption (e.g., Texas HB 3459 / Michigan PA 60).',
      'Request retrospective authorization within payer-specified appeal grace periods.',
    ],
    statutoryCitation: 'Emergency Medical Treatment and Active Labor Act (EMTALA) 42 U.S.C. § 1395dd & CMS-0057-F',
    strategyTemplate:
      'The disputed treatment was provided under acute clinical presentation meeting statutory Prudent Layperson emergency criteria. Retrospective clinical review is hereby demanded pursuant to emergency exception protocols and CMS Interoperability mandate CMS-0057-F.',
  },
  'CO-97': {
    carc: 'CO-97',
    name: 'The benefit for this service is included in the payment/allowance for another service/procedure.',
    category: 'Bundling / NCCI',
    baseOverturnRate: 86,
    appealDeadlineDays: { medicare: 120, commercial: 180, medicaid: 90 },
    keyDocumentationNeeded: [
      'Operative note detailing distinct anatomic site, separate incision, or distinct session',
      'Procedure-to-procedure (PTP) CMS NCCI edit modifier indicator verification (Indicator 1)',
      'Separate and distinct ICD-10 diagnosis linkage in Loop 2400',
      'Documented independent medical decision-making for same-day E/M visits',
    ],
    remediationSteps: [
      'Verify CMS NCCI PTP edit table: confirm modifier indicator is "1" (allowed with appropriate modifier).',
      'Validate appropriate modifier usage: append Modifier 59, XE, XS, XP, or XU with distinct anatomic documentation.',
      'Submit corrected claim or formal appeal citing CMS NCCI Policy Manual Chapter 1.',
    ],
    statutoryCitation: 'CMS National Correct Coding Initiative (NCCI) Policy Manual, Chapter 1, Section E',
    strategyTemplate:
      'Pursuant to CMS NCCI guidelines, procedure code [CPT] represents a distinct, separately identifiable surgical service performed at a separate anatomic site/encounter. Clinical operative notes enclosed substantiate valid unbundling under Modifier [MOD].',
  },
  'CO-16': {
    carc: 'CO-16',
    name: 'Claim/service lacks information or has submission/billing error(s).',
    category: 'Information Deficit',
    baseOverturnRate: 94,
    appealDeadlineDays: { medicare: 120, commercial: 180, medicaid: 90 },
    keyDocumentationNeeded: [
      'Associated RARC remittance code identifying exact missing loop/segment',
      'Valid ordering physician NPI and primary taxonomy in Box 17/Loop 2310A',
      'Itemized invoice or NDC unit conversion for specialty pharmaceuticals',
      'CLIA certificate number in Box 23 / Loop 2300 for laboratory testing',
    ],
    remediationSteps: [
      'Decode the accompanying RARC code (e.g., M51, N257, MA130) to identify the specific missing data element.',
      'Correct the electronic ANSI 837 claim file rather than submitting a full formal appeal.',
      'Resubmit electronically as a Corrected Claim (Claim Frequency Type 7) with original ICN/CCN.',
    ],
    statutoryCitation: 'HIPAA Standard Electronic Transaction Standards 45 CFR § 162.1102',
    strategyTemplate:
      'Corrected claim resubmission providing previously omitted diagnostic information as identified in remit remark code. Claim resubmitted electronically under Frequency Code 7 with original payer reference number.',
  },
  'CO-29': {
    carc: 'CO-29',
    name: 'The time limit for filing has expired.',
    category: 'Timely Filing',
    baseOverturnRate: 64,
    appealDeadlineDays: { medicare: 120, commercial: 60, medicaid: 30 },
    keyDocumentationNeeded: [
      'Clearinghouse EDI 277 / 999 1st-tier acceptance report with date/time stamp',
      'Original payer claim control number (CCN) from previous remit',
      'Proof of timely submission to wrong payer or primary payer EOB for secondary claims',
      'State insurance commissioner prompt-filing waiver documentation for administrative delays',
    ],
    remediationSteps: [
      'Obtain electronic audit trail from clearinghouse proving initial clean submission before deadline.',
      'Check secondary billing rules: secondary timely filing runs from primary remit date, not date of service.',
      'Submit Level 1 dispute with clearinghouse acceptance certificate attached.',
    ],
    statutoryCitation: 'Medicare Claims Processing Manual Ch. 1 § 70 & State Prompt Pay Statutory Filing Provisions',
    strategyTemplate:
      'Timely filing appeal submitting certified EDI 277CA clearinghouse acceptance report proving initial submission on [DATE], well within the contractual [DAYS]-day filing limitation period. Immediate claim reprocessing is demanded.',
  },
  'CO-22': {
    carc: 'CO-22',
    name: 'This care may be covered by another payer per coordination of benefits.',
    category: 'Coordination of Benefits',
    baseOverturnRate: 88,
    appealDeadlineDays: { medicare: 120, commercial: 180, medicaid: 60 },
    keyDocumentationNeeded: [
      'Updated patient coordination of benefits (COB) questionnaire',
      'Primary payer explanation of benefits (EOB / 835) showing paid or non-covered status',
      'Medicare Secondary Payer (MSP) questionnaire and eligibility verification record',
      'Date of termination from former commercial policy',
    ],
    remediationSteps: [
      'Contact patient to complete COB questionnaire with health plan or verify primary policy termination.',
      'If primary payer has paid, submit electronic secondary claim (Loop 2320) with primary payment info.',
      'If this plan is primary, submit attestation of no other active coverage.',
    ],
    statutoryCitation: 'NAIC Coordination of Benefits Model Regulation & 42 CFR § 411.20',
    strategyTemplate:
      'Coordination of Benefits resolution: Enclosed verification confirms patient has updated primary payer coordination records with health plan. Primary EOB / secondary submission data enclosed for immediate adjudication.',
  },
};

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

  // Overturn Probability Model
  const calculatedProbability = useMemo(() => {
    let score = rule.baseOverturnRate;

    // Documentation weightings
    if (hasChartNotes) score += 6;
    if (hasLmn) score += 12;
    if (hasPeerToPeer) score += 10;
    if (hasClearinghouseProof && (selectedCarc === 'CO-29' || selectedCarc === 'CO-16')) score += 18;

    // Time penalty
    const timeRatio = daysElapsed / deadlineDays;
    if (timeRatio > 0.8) score -= 15;
    else if (timeRatio > 0.6) score -= 8;

    // Payer class variance
    if (payerType === 'medicare') score += 4; // Medicare MAC redeterminations follow strict statutory rules
    if (payerType === 'medicaid') score -= 5; // Medicaid MCO appeals have higher friction

    return Math.min(96, Math.max(15, Math.round(score)));
  }, [rule, hasChartNotes, hasLmn, hasPeerToPeer, hasClearinghouseProof, selectedCarc, daysElapsed, deadlineDays, payerType]);

  const urgencyTier = useMemo(() => {
    if (daysRemaining <= 0) return { label: 'Statutory Window Expired', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
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
        calculatedOverturnProbability: `${calculatedProbability}%`,
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
            Claim Denial Overturn Probability &amp; Strategy Predictor
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Select a CARC denial code, target payer class, and active documentation status. Compute your statistical probability of overturning the denial, track statutory appeal deadlines, and generate clinical legal citations.
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
                  onClick={() => setPayerType(p.id as any)}
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
              <span>Day {deadlineDays} (Statutory Deadline)</span>
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
                Predicted Appeal Yield
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${urgencyTier.bg} ${urgencyTier.color}`}>
                {urgencyTier.label}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-4xl sm:text-5xl font-black font-jakarta text-navy dark:text-white">
                  {calculatedProbability}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Overturn Likelihood on Level 1 Appeal
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-teal dark:text-mint">
                  {daysRemaining}d
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Window Remaining
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
                  Statutory Citation Rationale:
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
