'use client';

import React, { useState } from 'react';
import {
  NSA_IDR_SCENARIOS,
  IdrCaseScenario,
} from '@/data/noSurprisesActIdrData';
import {
  Gavel,
  Scale,
  ShieldCheck,
  Building,
  AlertOctagon,
  Clock,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Award,
} from 'lucide-react';

export default function FederalIdrArbiter() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-trauma-splenectomy');
  const [arbiterStatus, setArbiterStatus] = useState<'pending' | 'evaluating' | 'awarded'>('pending');
  const [showBriefModal, setShowBriefModal] = useState<boolean>(false);
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);
  const [activeTimelineStep, setActiveTimelineStep] = useState<number>(3); // Default to Step 3 (4-Day Window)

  const activeScenario: IdrCaseScenario =
    NSA_IDR_SCENARIOS.find((c) => c.id === selectedCaseId) || NSA_IDR_SCENARIOS[0];

  const handleCaseChange = (id: string) => {
    setSelectedCaseId(id);
    setArbiterStatus('pending');
    setActiveTimelineStep(3);
  };

  const handleSimulateArbiter = () => {
    setArbiterStatus('evaluating');
    setTimeout(() => {
      setArbiterStatus('awarded');
    }, 1800);
  };

  const handleCopyBrief = () => {
    const briefText = `FEDERAL NO SURPRISES ACT (NSA) - CERTIFIED IDR ENTITY DISPUTE BRIEF
Pursuant to 45 CFR § 149.510, Section 109 of the No Surprises Act, and TMA v. HHS
Dispute Reference Case: ${activeScenario.title}
Primary CPT Codes: ${activeScenario.cptCodes.join(', ')}
Facility: ${activeScenario.facilityType}
Payer / Plan: ${activeScenario.payerName}

PAYER DEFICIENT QPA: $${activeScenario.qpaAmount.toFixed(2)}
PROVIDER FINAL CERTIFIED OFFER: $${activeScenario.sovereignOfferAmount.toFixed(2)}

${activeScenario.briefExcerpts.map((b) => `${b.heading}\n${b.body}`).join('\n\n')}

NON-QPA STATUTORY CREDIBLE FACTORS (45 CFR § 149.510(c)(4)):
${activeScenario.nonQpaFactors.map((f) => `- ${f.factorName}: ${f.substantiatingEvidence}`).join('\n')}

PHYSICIAN & CODING CERTIFICATION:
Under penalty of perjury, the undersigned certified clinician and coding professional attest that the clinical acuity, operative records, and non-QPA factors submitted are authentic, verifiable, and support the provider's final offer. Request selection of provider offer in its entirety.`;

    navigator.clipboard.writeText(briefText);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2500);
  };

  return (
    <section
      id="federal-idr-arbiter"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Section Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 text-xs font-mono uppercase tracking-wider mb-4">
          <Gavel className="w-3.5 h-3.5 text-indigo-400" />
          No Surprises Act (NSA) Federal Baseball Arbitration
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Federal Independent Dispute Resolution (IDR) Arbiter Engine
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
          Payers systematically deflate Qualifying Payment Amounts (QPAs) for out-of-network emergency and in-facility surgical care. Under federal court precedent (*TMA v. HHS*), certified arbiters are legally barred from presuming the QPA is correct. Sovereign human experts leverage non-QPA clinical acuity factors to win baseball-style arbitration.
        </p>
      </div>

      {/* Case Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {NSA_IDR_SCENARIOS.map((item) => {
          const isSelected = item.id === selectedCaseId;
          const delta = item.sovereignOfferAmount - item.qpaAmount;
          return (
            <button
              key={item.id}
              onClick={() => handleCaseChange(item.id)}
              className={`p-4 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider mb-1">
                {item.specialty}
              </div>
              <h3 className="text-sm font-bold text-white mb-2 line-clamp-1">{item.title}</h3>
              <div className="text-xs font-mono text-emerald-400 font-bold flex items-center justify-between">
                <span>Underpayment Delta:</span>
                <span>+${delta.toFixed(2)}</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 line-clamp-1">{item.payerName}</div>
            </button>
          );
        })}
      </div>

      {/* Statutory 4-Stage Timeline Stepper */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-8 shadow-2xl">
        <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold mb-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Federal Statutory IDR Timeline (45 CFR § 149.510)
          </span>
          <span className="text-amber-400 bg-amber-950/50 px-2.5 py-0.5 rounded border border-amber-800/40">
            Strict 4-Business-Day Statutory Deadline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              step: 1,
              title: 'Initial Payment / QPA',
              period: '30 Business Days',
              date: activeScenario.statutoryTimeline.initialPaymentDate,
              desc: 'Payer sends initial remittance advice with deflated QPA.',
            },
            {
              step: 2,
              title: 'Open Negotiation',
              period: '30 Business Days',
              date: activeScenario.statutoryTimeline.openNegotiationNoticeDate,
              desc: 'Mandatory open negotiation period between provider and payer.',
            },
            {
              step: 3,
              title: 'Federal IDR Initiation',
              period: 'Strictly 4 Business Days',
              date: activeScenario.statutoryTimeline.idrInitiationDeadlineDate,
              desc: 'Online submission via CMS Federal IDR Portal. Missing deadline forfeits claim.',
              highlight: true,
            },
            {
              step: 4,
              title: 'Arbiter Determination',
              period: 'Baseball-Style Winner',
              date: 'Certified IDR Entity Selection',
              desc: 'Arbiter selects either Provider Offer or Payer Offer with zero compromise.',
            },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setActiveTimelineStep(item.step)}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                activeTimelineStep === item.step
                  ? 'bg-slate-950 border-indigo-500 ring-1 ring-indigo-500 shadow-md'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
              } ${item.highlight ? 'border-amber-500/60' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-slate-400">Step {item.step}</span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    item.highlight
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.period}
                </span>
              </div>
              <div className="text-sm font-bold text-white mb-1">{item.title}</div>
              <div className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Dispute Arena: QPA vs. Sovereign Final Offer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left Column: Payer Deflated QPA (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-950/90 border border-rose-900/60 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-rose-900/40 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-950 border border-rose-800/60 text-rose-400">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Payer Initial Offer (QPA)</h3>
                  <div className="text-xs font-mono text-rose-400">{activeScenario.payerName}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-xs font-mono font-bold">
                Deflated QPA
              </span>
            </div>

            {/* QPA Amount Banner */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 mb-4 text-center">
              <div className="text-xs font-mono uppercase text-slate-400">Qualifying Payment Amount</div>
              <div className="text-3xl font-extrabold text-rose-400 mt-1">
                ${activeScenario.qpaAmount.toFixed(2)}
              </div>
              <div className="text-[11px] font-mono text-rose-400/80 mt-1">
                Payer median in-network rate (CPI-U adjusted)
              </div>
            </div>

            {/* Payer Flaw Alert */}
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 mb-4 text-xs space-y-2">
              <div className="text-rose-400 font-mono font-bold uppercase flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                <span>QPA Calculation Vulnerability:</span>
              </div>
              <p className="text-rose-200/90 leading-relaxed">
                Payer conflates low-acuity scheduled procedures with high-risk emergency trauma. Under *TMA v. HHS*, this QPA is legally stripped of any presumption of reasonableness.
              </p>
            </div>

            {/* Prohibited Factors Disclaimer */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <span className="text-amber-400 font-bold">Statutory Prohibitions: </span>
              Under 45 CFR § 149.510(c)(4)(v), the arbiter CANNOT consider the provider&apos;s billed charges (${activeScenario.billedCharges.toFixed(2)}) or public Medicare/Medicaid rates.
            </div>
          </div>

          <div className="pt-4 border-t border-rose-900/40 text-[11px] font-mono text-rose-400">
            Payer Stance: Submits unadjusted QPA with zero consideration for patient acuity.
          </div>
        </div>

        {/* Right Column: Sovereign Certified Final Offer (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-950/90 border border-indigo-500/60 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-indigo-900/40 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-700/60 text-indigo-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sovereign Certified Final Offer</h3>
                  <div className="text-xs font-mono text-indigo-300">
                    Non-QPA Credible Evidence Submittal
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-indigo-950 border border-indigo-700 text-indigo-300 text-xs font-mono font-bold">
                Win Probability: {activeScenario.prevailingProbability}%
              </span>
            </div>

            {/* Sovereign Offer Amount Banner */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-800/40 mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono uppercase text-slate-400">Provider Certified Offer</div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-0.5">
                  ${activeScenario.sovereignOfferAmount.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono uppercase text-slate-400">Revenue Recovered</div>
                <div className="text-xl font-mono font-bold text-indigo-400 mt-0.5">
                  +${(activeScenario.sovereignOfferAmount - activeScenario.qpaAmount).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Non-QPA Statutory Factors List */}
            <div className="space-y-2.5 mb-4">
              <div className="text-xs font-mono uppercase text-indigo-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Permissible Non-QPA Factors (45 CFR § 149.510(c)(4)):
              </div>
              {activeScenario.nonQpaFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed"
                >
                  <div className="text-teal-400 font-mono font-bold mb-0.5">{factor.factorName}</div>
                  <p className="text-slate-300">{factor.substantiatingEvidence}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-indigo-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>Certified Clinician Attestation Attached</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowBriefModal(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider transition-all"
              >
                View IDR Brief
              </button>
              <button
                onClick={handleSimulateArbiter}
                disabled={arbiterStatus === 'evaluating'}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-950/40"
              >
                {arbiterStatus === 'evaluating' ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Arbitrating...</span>
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4 text-slate-950" />
                    <span>Submit to Certified Arbiter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Arbiter Live Baseball-Style Award Result */}
      {arbiterStatus === 'awarded' && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-emerald-500/60 shadow-2xl animate-fade-in mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase text-emerald-400 font-bold">
                  Certified IDR Entity Final Baseball-Style Determination
                </div>
                <h3 className="text-xl font-bold text-white">
                  PROVIDER OFFER SELECTED IN ITS ENTIRETY: ${activeScenario.sovereignOfferAmount.toFixed(2)}
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold">
              100% Prevailing Party
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 uppercase mb-1">Arbiter Legal Reasoning</div>
              <p className="text-slate-200 leading-relaxed font-sans">
                Pursuant to *TMA III*, the Certified IDR Entity determined the provider&apos;s non-QPA evidence (Class IV shock, vascular fellowship) clearly demonstrated that the service complexity exceeded median in-network contracts.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 uppercase mb-1">Fee Allocation Mandate</div>
              <p className="text-slate-200 leading-relaxed font-sans">
                Under 45 CFR § 149.510(d)(2), the non-prevailing payer is ordered to pay the <strong className="text-amber-300">$515.00 CMS Administrative Fee</strong> plus the <strong className="text-amber-300">$700.00 IDR Entity Fee</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex flex-col justify-between">
              <div>
                <div className="text-emerald-400 uppercase mb-1">Net Reimbursement Impact</div>
                <div className="text-xl font-bold text-emerald-300">
                  +${(activeScenario.sovereignOfferAmount - activeScenario.qpaAmount).toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-300 mt-1 font-sans">
                  Payer must remit payment differential within 30 calendar days of determination.
                </p>
              </div>
              <div className="pt-2 text-[11px] text-emerald-400">Zero Patient Balance Billing</div>
            </div>
          </div>
        </div>
      )}

      {/* Federal IDR Legal Brief Modal */}
      {showBriefModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Federal IDR Formal Submission Brief (45 CFR § 149.510)
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      Case: {activeScenario.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBriefModal(false)}
                  className="text-slate-400 hover:text-white text-sm font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Close [ESC]
                </button>
              </div>

              {/* Brief Content */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-4 mb-6 leading-relaxed">
                <div className="border-b border-slate-800 pb-3 space-y-1">
                  <div className="text-indigo-400 font-bold">
                    TO: Certified Independent Dispute Resolution (IDR) Entity
                  </div>
                  <div>FROM: Aethera Sovereign Clinical Legal Defense & Out-of-Network Unit</div>
                  <div>GOVERNING STATUTE: No Surprises Act (P.L. 116-260) & 45 CFR § 149.510</div>
                  <div className="text-emerald-400">
                    DISPUTE TYPE: In-Facility Out-of-Network Emergency Service
                  </div>
                </div>

                {activeScenario.briefExcerpts.map((excerpt, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-indigo-300 font-bold uppercase">{excerpt.heading}</div>
                    <div className="text-slate-300 font-sans text-xs pl-2 border-l-2 border-slate-800">
                      {excerpt.body}
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="text-amber-300 font-bold uppercase">
                    SOVEREIGN ATTESTATION UNDER PENALTY OF PERJURY:
                  </div>
                  <div>
                    The undersigned certified coding professional and attending clinician certify that all non-QPA clinical acuity parameters submitted are true and verifiable from hospital electronic medical records.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs font-mono text-indigo-400">
                Formatted for CMS Federal IDR Portal Submission
              </span>
              <button
                onClick={handleCopyBrief}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
              >
                {copiedBrief ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-950" />
                    Copy Federal IDR Brief
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
