'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  FileCheck2,
  PhoneCall,
  Clock,
  Award,
  ChevronRight,
  Calculator,
  Activity,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  Coins,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

export default function FqhcRhcLandingClient() {
  const formId = useId();

  // Calculator State
  const [encounterCount, setEncounterCount] = useState<number>(2400);
  const [facilityType, setFacilityType] = useState<'fqhc' | 'rhc'>('fqhc');
  const [sameDayLeakage, setSameDayLeakage] = useState<number>(12);
  const [wrapLeakageRate, setWrapLeakageRate] = useState<number>(8);

  // Form State
  const [centerName, setCenterName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [titleRole, setTitleRole] = useState('');
  const [facilityCategory, setFacilityCategory] = useState('Section 330 Grantee FQHC');
  const [currentEhr, setCurrentEhr] = useState('eClinicalWorks (eCW)');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Facility Rate Benchmarks (CMS 2025/2026 PPS base + State Medicaid averages)
  const BENCHMARKS = {
    fqhc: {
      label: 'FQHC Prospective Payment System (CMS Base $195.65 + Medicaid Wrap)',
      effectiveAvgRate: 235,
      sameDayEncValue: 195,
    },
    rhc: {
      label: 'Rural Health Clinic All-Inclusive Rate (AIR / Statutory Cap)',
      effectiveAvgRate: 155,
      sameDayEncValue: 140,
    },
  };

  const activeRate = BENCHMARKS[facilityType];
  const annualEncounterVolume = encounterCount * 12;
  const annualGrossCollections = annualEncounterVolume * activeRate.effectiveAvgRate;

  // Losses: Unbilled same-day behavioral health/dental encounters + Medicaid wrap delays
  const annualSameDayLoss = Math.round(annualEncounterVolume * (sameDayLeakage / 100) * activeRate.sameDayEncValue);
  const annualWrapLoss = Math.round(annualGrossCollections * (wrapLeakageRate / 100) * 0.4); // portion unrecovered/written off
  const totalAnnualLeakage = annualSameDayLoss + annualWrapLoss;
  const recapturedAnnualCash = Math.round(totalAnnualLeakage * 0.9);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        name: contactName,
        email,
        phone,
        practice: centerName,
        service: 'FQHC & RHC Revenue Cycle & PPS Audit',
        notes: `[Campaign: FQHC/RHC Billing LP] Role: ${titleRole} | Category: ${facilityCategory} | EHR: ${currentEhr} | Encounters: ${encounterCount}/mo | Type: ${facilityType} | Same-Day Leak: ${sameDayLeakage}% | Wrap Leak: ${wrapLeakageRate}% | Est Recaptured: $${recapturedAnnualCash.toLocaleString()} | Details: ${notes || 'None provided'}`,
        source: 'Landing Page: /lp/fqhc-rhc-billing',
      };

      const ok = await sendLeadToKiran('fqhc_rhc_audit_inquiry', payload);
      if (ok) {
        setSubmitted(true);
      } else {
        setErrorMsg('There was an issue submitting your request. Please submit an email inquiry at /contact or schedule a meeting at /schedule.');
      }
    } catch {
      setErrorMsg('A network error occurred. Please submit an inquiry at /contact or schedule a meeting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Community Health &amp; Rural Clinic Revenue Cycle Management</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-jakarta tracking-tight text-white leading-tight">
            Stop Losing Revenue to Unbilled Same-Day Encounters &amp; Delayed Medicaid Wrap Payments
          </h1>

          <p className="text-base sm:text-xl text-slate-300 leading-relaxed">
            Engineered exclusively for Section 330 FQHCs, Look-Alikes, and Rural Health Clinics (RHCs).
            We capture dual-visit medical and behavioral health encounters, accelerate Medicaid PPS wrap-around reconciliations,
            and ensure 100% compliance with sliding fee discount schedule mandates.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" /> UB-04 / 837I Encounter Mastery
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-teal-400" /> Same-Day MH + Medical Split
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
              <Coins className="w-3.5 h-3.5 text-cyan-400" /> Medicaid Wrap Reconciliation
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
              <Award className="w-3.5 h-3.5 text-emerald-400" /> G0511 Care Management Capture
            </span>
          </div>
        </div>

        {/* Interactive Financial Calculator */}
        <div className="mt-14 max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Calculator className="w-4 h-4" />
                <span>FQHC / RHC PPS REVENUE LEAKAGE CALCULATOR</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Model Your Unclaimed Encounter &amp; Wrap-Around Revenue
              </h2>
            </div>
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFacilityType('fqhc')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  facilityType === 'fqhc'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                FQHC (PPS Rate)
              </button>
              <button
                type="button"
                onClick={() => setFacilityType('rhc')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  facilityType === 'rhc'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                RHC (All-Inclusive)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            {/* Left Inputs */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-slate-300">Monthly Billable Encounters</span>
                  <span className="text-emerald-400 font-bold">{encounterCount.toLocaleString()} visits/mo</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="10000"
                  step="100"
                  value={encounterCount}
                  onChange={(e) => setEncounterCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Annualized: {(encounterCount * 12).toLocaleString()} encounters across medical, behavioral health &amp; dental.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-slate-300">Unbilled Same-Day Encounter Rate</span>
                  <span className="text-amber-400 font-bold">{sameDayLeakage}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={sameDayLeakage}
                  onChange={(e) => setSameDayLeakage(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Percentage of patients seeing both medical and mental health or dental on the same day without split billing.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-slate-300">Medicaid Wrap-Around Reconciliation Lag</span>
                  <span className="text-cyan-400 font-bold">{wrapLeakageRate}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={wrapLeakageRate}
                  onChange={(e) => setWrapLeakageRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <p className="text-xs text-slate-400 mt-1">
                  MCO underpayments and unreconciled supplemental wrap payments exceeding 90+ days aging.
                </p>
              </div>
            </div>

            {/* Right Results */}
            <div className="bg-slate-950/80 rounded-xl p-6 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Annual Projected Revenue Impact
                </div>

                <div className="flex justify-between items-baseline border-b border-slate-900 pb-3">
                  <span className="text-sm text-slate-400">Gross Program Reimbursement</span>
                  <span className="text-base font-semibold text-slate-200">
                    ${annualGrossCollections.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-slate-900 pb-3">
                  <span className="text-sm text-amber-400/90">Unbilled Same-Day Encounters</span>
                  <span className="text-base font-semibold text-amber-400">
                    -${annualSameDayLoss.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-slate-900 pb-3">
                  <span className="text-sm text-rose-400/90">Unreconciled Medicaid Wrap</span>
                  <span className="text-base font-semibold text-rose-400">
                    -${annualWrapLoss.toLocaleString()}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-xs text-slate-400 font-medium">Estimated Recoverable Annual Cash Flow:</div>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1">
                    ${recapturedAnnualCash.toLocaleString()}
                  </div>
                  <p className="text-xs text-emerald-500/80 mt-1 font-medium">
                    + Real-time electronic wrap ledger &amp; same-day Modifier 59/XE validation
                  </p>
                </div>
              </div>

              <a
                href="#audit-form"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-3 rounded-lg text-sm transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                <span>Claim Your Free FQHC / RHC Audit</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points & Operational Pitfalls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold font-jakarta text-white">
            Where Community Health Centers Bleed Cash
          </h2>
          <p className="text-slate-400 mt-3">
            Standard commercial billing software fails at FQHC/RHC cost reimbursement mechanics.
            Here is what our specialized RCM engine solves on day one:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Unbilled Same-Day Behavioral Health</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              When an established patient visits for hypertension (G0467) and receives psychotherapy (G0470) on the same day,
              generic scrubbers bundle the claims into a single encounter. We execute proper UB-04 revenue code 0521 vs 0900 splits
              with Modifier 59/XE, collecting both PPS payments.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">MCO Wrap-Around Payment Delays</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Medicaid Managed Care Organizations pay discounted capitated or fee-for-service rates, leaving the health center
              waiting 90–180 days for state supplemental wrap reconciliation. Our automated wrap ledger reconciles every 835 ERA
              and batches state wrap requests monthly.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Missed G0511 &amp; G0512 Care Bundles</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              CMS allows FQHCs to bill HCPCS G0511 ($77+ per month) for chronic care management, behavioral health integration,
              and Principal Care Management. We connect directly to your EHR to aggregate clinical minutes and bill qualifying encounters automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison: In-House / Generic vs Aethera */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-10 overflow-x-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold font-jakarta text-white">
              Standard Commercial Billing vs. Aethera FQHC Engine
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Why leading community health centers and certified RHCs transition their revenue cycle to Aethera.
            </p>
          </div>

          <table className="w-full text-left text-sm text-slate-300 min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 font-semibold">Workflow Component</th>
                <th className="py-3 px-4 font-semibold text-rose-400">Typical Generic Billing</th>
                <th className="py-3 px-4 font-semibold text-emerald-400">Aethera FQHC &amp; RHC Suite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-4 px-4 font-medium text-white">Same-Day MH &amp; Medical Visits</td>
                <td className="py-4 px-4 text-slate-400">Bundled or denied as duplicate encounter (CARC 97)</td>
                <td className="py-4 px-4 text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Dual-line UB-04 (0521/0900) Modifier 59/XE compliance
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-medium text-white">Medicaid Wrap Reconciliation</td>
                <td className="py-4 px-4 text-slate-400">Manual spreadsheets, delayed 6-12 months at cost report</td>
                <td className="py-4 px-4 text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Real-time 835 differential ledger &amp; monthly state filing
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-medium text-white">Sliding Fee Discount Schedule (SFDS)</td>
                <td className="py-4 px-4 text-slate-400">Paper intake logs, inconsistent nominal fee recovery</td>
                <td className="py-4 px-4 text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  2026 Federal Poverty Level (FPL) tier validation
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-medium text-white">Care Management (G0511/G0512)</td>
                <td className="py-4 px-4 text-slate-400">Ignored or lost in nurse clinical notes</td>
                <td className="py-4 px-4 text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  EHR telemetry scrape capturing 20+ min monthly increments
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-medium text-white">Medicare Cost Report (CMS-222-17)</td>
                <td className="py-4 px-4 text-slate-400">Frantic annual reconciliation with missing crosswalks</td>
                <td className="py-4 px-4 text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Continuous audit-ready encounter and revenue data feeds
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Lead Capture Form */}
      <section id="audit-form" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40 mb-3">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Complimentary Operational Review</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-jakarta text-white">
              Request Your 30-Day FQHC / RHC Claims &amp; Wrap Audit
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Send us 30 days of 835 remit and encounter files under a standard BAA. We will pinpoint exact same-day leakage,
              unclaimed G0511 revenue, and unreconciled Medicaid wrap payments.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Audit Request Received</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Thank you, {contactName || 'Healthcare Leader'}. Our FQHC &amp; Rural Health RCM Director will review
                your health center profile and contact you within 4 business hours to establish secure BAA file transfer.
              </p>
              <div className="pt-2 text-xs text-emerald-400 font-medium flex items-center justify-center gap-3">
                <Link href="/schedule" className="underline hover:text-white">Schedule Meeting with Kiran</Link>
                <span>·</span>
                <Link href="/contact" className="underline hover:text-white">Email Request</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/40 text-rose-300 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`${formId}-centerName`} className="block text-xs font-semibold text-slate-300 mb-1">
                    Health Center / Clinic Name *
                  </label>
                  <input
                    id={`${formId}-centerName`}
                    type="text"
                    required
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    placeholder="e.g. Valley Community Health Center"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor={`${formId}-contactName`} className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Name &amp; Title *
                  </label>
                  <input
                    id={`${formId}-contactName`}
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Sarah Martinez, CFO"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`${formId}-email`} className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Email *
                  </label>
                  <input
                    id={`${formId}-email`}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="smartinez@valleyhealth.org"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor={`${formId}-phone`} className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    id={`${formId}-phone`}
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`${formId}-facilityCategory`} className="block text-xs font-semibold text-slate-300 mb-1">
                    Facility Designation
                  </label>
                  <select
                    id={`${formId}-facilityCategory`}
                    value={facilityCategory}
                    onChange={(e) => setFacilityCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option>Section 330 Grantee FQHC</option>
                    <option>FQHC Look-Alike</option>
                    <option>Certified Rural Health Clinic (RHC)</option>
                    <option>Tribal Health Center / 638 Clinic</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={`${formId}-ehr`} className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary EHR / Billing System
                  </label>
                  <select
                    id={`${formId}-ehr`}
                    value={currentEhr}
                    onChange={(e) => setCurrentEhr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option>eClinicalWorks (eCW)</option>
                    <option>NextGen Healthcare</option>
                    <option>Athenahealth</option>
                    <option>Epic Community Connect / OCHIN</option>
                    <option>Greenway Health / Intergy</option>
                    <option>Other / In-House</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor={`${formId}-notes`} className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary RCM Challenges or Notes (Optional)
                </label>
                <textarea
                  id={`${formId}-notes`}
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. High volume of unbilled same-day behavioral health visits; Medicaid wrap payments delayed 180+ days."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 px-6 rounded-lg text-sm transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {submitting ? (
                  <span>Analyzing Center Profile...</span>
                ) : (
                  <>
                    <span>Submit Audit Request</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-6 pt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> BAA-Protected
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-400" /> 4-Hour Response
                </span>
                <Link href="/schedule" className="flex items-center gap-1 hover:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Schedule Meeting
                </Link>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
