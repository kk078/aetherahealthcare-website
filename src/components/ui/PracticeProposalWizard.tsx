'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Send,
  Loader2,
} from 'lucide-react';
import { submitToWorker } from '@/lib/worker';

export default function PracticeProposalWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [specialty, setSpecialty] = useState('Primary Care / Internal Medicine');
  const [providerCount, setProviderCount] = useState(2);
  const [monthlyCollections, setMonthlyCollections] = useState(120000); // $120k/mo
  const [ehrPlatform, setEhrPlatform] = useState('AthenaHealth');
  const [primaryPain, setPrimaryPain] = useState('High Denial Rate (>8%)');

  // Contact for final proposal delivery
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Proposal Calculations
  const calculatedFeePct = monthlyCollections > 250000 ? 3.5 : monthlyCollections > 100000 ? 4.0 : 4.8;
  const estimatedAnnualCollections = monthlyCollections * 12;
  // Conservative 5.5% cash recovery lift
  const estimatedAnnualLift = Math.round(estimatedAnnualCollections * 0.055);

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail) return;
    setSubmitting(true);

    try {
      await submitToWorker('proposal_request', {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        specialty,
        providerCount: String(providerCount),
        monthlyCollections: `$${monthlyCollections.toLocaleString()}`,
        ehrPlatform,
        primaryPain,
        projectedLift: `$${estimatedAnnualLift.toLocaleString()}`,
        message: `Custom Proposal Generated via Wizard: ${specialty} (${providerCount} providers), Monthly Collections: $${monthlyCollections.toLocaleString()}, EHR: ${ehrPlatform}, Pain: ${primaryPain}.`,
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden font-inter">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-[#003087] to-teal p-6 text-white">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cream text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="h-3.5 w-3.5 text-mint" /> Interactive Practice Proposal Generator
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-jakarta">
          3-Minute Custom RCM Proposal &amp; ROI Scorecard
        </h2>
        <p className="text-xs sm:text-sm text-cream/90 max-w-2xl mt-1">
          Tell us about your medical specialty, monthly volume, and current billing software. Get an instant,
          guaranteed SLA proposal with projected revenue lift.
        </p>

        {/* Stepper Dots */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/10 text-xs">
          <span
            className={`px-3 py-1 rounded-full font-bold ${
              step === 1 ? 'bg-mint text-navy' : step > 1 ? 'bg-white/20 text-cream' : 'bg-white/10 text-cream/60'
            }`}
          >
            1. Clinical Profile
          </span>
          <span className="text-cream/40">→</span>
          <span
            className={`px-3 py-1 rounded-full font-bold ${
              step === 2 ? 'bg-mint text-navy' : step > 2 ? 'bg-white/20 text-cream' : 'bg-white/10 text-cream/60'
            }`}
          >
            2. Financials &amp; EHR
          </span>
          <span className="text-cream/40">→</span>
          <span
            className={`px-3 py-1 rounded-full font-bold ${
              step === 3 ? 'bg-mint text-navy' : step > 3 ? 'bg-white/20 text-cream' : 'bg-white/10 text-cream/60'
            }`}
          >
            3. Goals &amp; Pain Points
          </span>
          <span className="text-cream/40">→</span>
          <span
            className={`px-3 py-1 rounded-full font-bold ${
              step === 4 ? 'bg-mint text-navy' : 'bg-white/10 text-cream/60'
            }`}
          >
            4. Instant Proposal
          </span>
        </div>
      </div>

      {/* Wizard Body */}
      <div className="p-6 sm:p-8">
        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <label className="block text-sm font-bold text-navy mb-2">
                What is your primary medical specialty?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Primary Care / Internal Medicine',
                  'Cardiology',
                  'Orthopedic Surgery',
                  'Dermatology',
                  'Psychiatry & Behavioral Health',
                  'Pain Management & Neurology',
                  'Gastroenterology',
                  'Multi-Specialty Clinic',
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpecialty(s)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                      specialty === s
                        ? 'border-[#003087] bg-[#F0F4FB] text-[#001A52] ring-2 ring-[#003087]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-navy mb-2">
                Number of Billing Providers (Physicians, NPs, PAs):{' '}
                <span className="text-[#003087] font-extrabold">{providerCount}</span>
              </label>
              <input
                type="range"
                min="1"
                max="25"
                value={providerCount}
                onChange={(e) => setProviderCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#003087]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>Solo Practice (1)</span>
                <span>Group Practice (5)</span>
                <span>Large Group / Health System (25+)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-[#003087] hover:bg-[#001A52] text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
              >
                <span>Continue to Financials</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <label className="block text-sm font-bold text-navy mb-2">
                Approximate Monthly Collections:
                <span className="text-emerald-700 font-extrabold ml-2">
                  ${monthlyCollections.toLocaleString()} / month
                </span>
              </label>
              <input
                type="range"
                min="30000"
                max="600000"
                step="10000"
                value={monthlyCollections}
                onChange={(e) => setMonthlyCollections(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#003087]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>$30k/mo</span>
                <span>$250k/mo</span>
                <span>$600k+/mo</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-navy mb-2">
                What is your primary EHR / Practice Management platform?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  'AthenaHealth',
                  'eClinicalWorks',
                  'Epic / Community',
                  'Kareo / Tebra',
                  'AdvancedMD',
                  'NextGen',
                  'DrChrono',
                  'Other / Custom',
                ].map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEhrPlatform(e)}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                      ehrPlatform === e
                        ? 'border-[#003087] bg-[#F0F4FB] text-[#001A52] ring-2 ring-[#003087]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-navy font-semibold text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-[#003087] hover:bg-[#001A52] text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
              >
                <span>Continue to Goals</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <label className="block text-sm font-bold text-navy mb-2">
                What is your primary billing bottleneck or frustration?
              </label>
              <div className="space-y-2.5">
                {[
                  {
                    title: 'High Denial Rate (>8%)',
                    desc: 'Too many claims rejected for coding, eligibility, or missing authorizations.',
                  },
                  {
                    title: 'Slow Cashflow / Aging AR (>45 Days)',
                    desc: 'Payer claims sit unpaid past 60 and 90 days without systematic phone follow-up.',
                  },
                  {
                    title: 'In-House Staff Turnover & Overhead',
                    desc: 'Struggling with billing staff sick leave, vacancies, benefits, and training costs.',
                  },
                  {
                    title: 'Outdated Commercial Payer Contracts',
                    desc: 'Reimbursement rates haven’t been renegotiated in 3+ years and trail regional averages.',
                  },
                ].map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setPrimaryPain(item.title)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                      primaryPain === item.title
                        ? 'border-[#003087] bg-[#F0F4FB] text-[#001A52] ring-2 ring-[#003087]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold text-navy">{item.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-slate-500 hover:text-navy font-semibold text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Generate Instant Proposal</span>
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: PROPOSAL OUTPUT ================= */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Executive Proposal Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Projected Net Cash Lift
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-jakarta mt-1 block">
                  +${estimatedAnnualLift.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                  ~${Math.round(estimatedAnnualLift / 12).toLocaleString()}/month recovered
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="text-[11px] font-bold text-[#003087] uppercase tracking-wider block">
                  Performance Fee Tier
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#001A52] font-jakarta mt-1 block">
                  {calculatedFeePct}%
                </span>
                <span className="text-[11px] text-slate-600 font-medium mt-1 block">
                  Zero upfront costs. We only get paid when you collect.
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                  Target Days in AR
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-teal-950 font-jakarta mt-1 block">
                  &lt;26 Days
                </span>
                <span className="text-[11px] text-teal-700 font-medium mt-1 block">
                  Contractual 95%+ clean claim guarantee
                </span>
              </div>
            </div>

            {/* Included Deliverables Specification */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                Tailored Proposal Specifications for {specialty} ({providerCount} Providers):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Certified AAPC coders assigned to your clinical chart templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Native integration with {ehrPlatform} (Zero workflow disruption)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Daily 24-hour claim scrubbing &amp; electronic EDI submission</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>100% appeal coverage for denials within 48 hours of 835 ERA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Real-time 24/7 Provider Portal access with live aging analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Dedicated partner escalation directly to Kiran &amp; senior leadership</span>
                </div>
              </div>
            </div>

            {/* Lock in Proposal / Email Routing Form */}
            <div className="bg-white p-5 rounded-2xl border border-[#003087]/20 shadow-sm">
              <h4 className="text-sm font-bold text-navy mb-1">
                Receive Formal Written Proposal &amp; Lock In 50-Claim Free Pilot:
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                We will dispatch this formal proposal directly to leadership and your inbox. Zero obligation.
              </p>

              {submitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-emerald-950">Proposal Dispatched Successfully!</p>
                  <p className="text-xs text-emerald-800">
                    Kiran and our senior billing desk have received your practice specifications and will follow up with your formal proposal document.
                  </p>
                  <Link
                    href="/schedule"
                    className="inline-block mt-2 bg-[#003087] text-white text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    Schedule 15-Minute Strategy Walkthrough with Kiran
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmitLead} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Dr. Alex Mercer"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="office@practice.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-slate-500 hover:text-navy text-xs font-semibold"
                    >
                      ← Modify Details
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#003087] hover:bg-[#001A52] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span>{submitting ? 'Dispatching…' : 'Lock In Proposal & Request Pilot'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
