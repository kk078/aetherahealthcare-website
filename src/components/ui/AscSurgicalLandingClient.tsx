'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Clock,
  Phone,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  Building2,
  Lock,
  Layers,
  Activity,
  Scissors,
  FileCheck2,
  Award,
  Zap,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function AscSurgicalLandingClient() {
  // Calculator state
  const [monthlyCases, setMonthlyCases] = useState<number>(280);
  const [implantCostPerCase, setImplantCostPerCase] = useState<number>(1400);
  const [underpaymentRate, setUnderpaymentRate] = useState<number>(12); // 12%

  // Form state
  const [contactName, setContactName] = useState('');
  const [titleRole, setTitleRole] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [operatingRooms, setOperatingRooms] = useState('3-4 OR Suites');
  const [specialtyMix, setSpecialtyMix] = useState('Orthopedics & Spine');
  const [currentBillingModel, setCurrentBillingModel] = useState('In-House ASC Billers');
  const [primaryChallenge, setPrimaryChallenge] = useState('Implant carve-outs & payer underpayments');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculations
  const annualCases = monthlyCases * 12;
  const annualImplantSpend = annualCases * implantCostPerCase;
  const annualCarveOutLeakage = Math.round(annualImplantSpend * (underpaymentRate / 100));
  const mpprRecoveryLift = Math.round(annualCases * 240 * 0.78); // Multiple Procedure Payment Reduction recaptured revenue
  const totalRecoverableMargin = annualCarveOutLeakage + mpprRecoveryLift;
  const targetDaysInAr = 22;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) {
      setStatus('success');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const ok = await sendLeadToKiran('asc_surgical_audit_inquiry', {
        contactName,
        titleRole,
        facilityName,
        email,
        phone,
        operatingRooms,
        specialtyMix,
        currentBillingModel,
        primaryChallenge,
        monthlyCases: `${monthlyCases} cases/mo`,
        implantCostPerCase: `$${implantCostPerCase.toLocaleString()}/case`,
        underpaymentRate: `${underpaymentRate}%`,
        annualCarveOutLeakage: `$${annualCarveOutLeakage.toLocaleString()}`,
        totalRecoverableMargin: `$${totalRecoverableMargin.toLocaleString()}`,
        sourcePage: '/lp/asc-surgical-billing',
      });

      if (ok) {
        setStatus('success');
        trackConversion('pilot');
      } else {
        setStatus('error');
        setErrorMsg('Unable to submit request right now. Please try again or contact us directly.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('A network error occurred. Please refresh and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-900/60 via-teal-900/60 to-blue-900/60 border-b border-cyan-500/20 px-4 py-2.5 text-center text-xs sm:text-sm font-medium text-cyan-200">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Specialized ASC Revenue Engine: 100% Implant Carve-Out Recapture & Zero-Downtime Migration</span>
        </span>
      </div>

      {/* Hero Section */}
      <header className="relative pt-12 pb-20 overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/80 to-slate-950 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-inner">
              <Scissors className="w-3.5 h-3.5" />
              Ambulatory Surgery Center (ASC) Revenue Cycle Management
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Stop Losing Surgical Margins to{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Implant Carve-Out Denials
              </span>{' '}
              & Cascading Cascades
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed">
              Designed specifically for surgery center administrators, clinical directors, and surgical business offices. We master both facility (UB-04 / 837I) and professional (CMS-1500 / 837P) claims, eliminating MPPR underpayments and recovering 100% of high-cost implant invoice carve-outs.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-medium text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                UB-04 & CMS-1500 Dual Billing
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                CMS Covered Procedures List (CPL)
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Device-Intensive Offset Scrubbing
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Days in A/R Under 22 Days
              </span>
            </div>
          </div>

          {/* Interactive Calculator Card */}
          <div className="max-w-4xl mx-auto bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                  <Activity className="w-6 h-6 text-cyan-400" />
                  ASC Implant Carve-Out & Revenue Acceleration Calculator
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Model unrecovered device carve-outs and multi-procedure payment reduction (MPPR) revenue recovery
                </p>
              </div>
              <span className="hidden sm:inline-flex px-3 py-1 bg-cyan-950/60 border border-cyan-500/40 rounded-full text-xs font-semibold text-cyan-300">
                Live Dynamic Model
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Slider 1: Monthly Surgical Cases */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Monthly Surgical Cases
                  </label>
                  <span className="text-lg font-bold text-cyan-400">{monthlyCases} cases</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="1000"
                  step="10"
                  value={monthlyCases}
                  onChange={(e) => setMonthlyCases(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>30 cases</span>
                  <span>1,000 cases</span>
                </div>
              </div>

              {/* Slider 2: Average Implant Spend per Case */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Avg Implant Cost / Case
                  </label>
                  <span className="text-lg font-bold text-teal-300">
                    ${implantCostPerCase.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6000"
                  step="100"
                  value={implantCostPerCase}
                  onChange={(e) => setImplantCostPerCase(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>$0 (Non-implant)</span>
                  <span>$6,000 (Spine/Ortho)</span>
                </div>
              </div>

              {/* Slider 3: Underpayment Rate */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Uncaptured Carve-Out %
                  </label>
                  <span className="text-lg font-bold text-amber-400">{underpaymentRate}%</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="25"
                  step="1"
                  value={underpaymentRate}
                  onChange={(e) => setUnderpaymentRate(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>4% Low</span>
                  <span>25% Critical Leakage</span>
                </div>
              </div>
            </div>

            {/* Calculated Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800">
              <div className="bg-slate-950/90 p-5 rounded-xl border border-rose-500/20 relative overflow-hidden">
                <div className="text-xs font-medium text-rose-400 mb-1">Annual Carve-Out Revenue at Risk</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  ${annualCarveOutLeakage.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5">
                  Lost to unattached manufacturer invoices & improper packaging
                </div>
              </div>

              <div className="bg-slate-950/90 p-5 rounded-xl border border-teal-500/20 relative overflow-hidden">
                <div className="text-xs font-medium text-teal-400 mb-1">MPPR Cascading Recapture</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-300">
                  ${mpprRecoveryLift.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5">
                  Preventing erroneous 50% discounts on exempt multi-procedures
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-950/80 to-teal-950/80 p-5 rounded-xl border border-cyan-500/40 relative overflow-hidden shadow-lg">
                <div className="text-xs font-medium text-cyan-300 mb-1">Total Aethera 12-Mo Net Recovery</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-200">
                  ${totalRecoverableMargin.toLocaleString()}
                </div>
                <div className="text-[11px] text-cyan-300/80 mt-1.5 font-medium">
                  A/R compressed to &lt;{targetDaysInAr} days guaranteed
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href="#asc-pilot-form"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-sm hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/20"
              >
                Claim Your 30-Case ASC Audit Pilot
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Specialty Grid & Core Pain Points */}
      <section className="py-20 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Engineered for High-Volume Surgical Specialties
            </h2>
            <p className="text-slate-400 text-base">
              Every surgical specialty operates under distinct CMS payment indicators, packaging exclusions, and prior authorization requirements. We tailor our rules engine to each OR suite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Specialty 1 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Orthopedic & Spine ASCs</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Total knee/hip arthroplasty (TKA/THA 27447, 27130), anterior cervical discectomy (22551), and hardware instrumentation.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  Line-item invoice attachment for plates, screws, and biologics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  CMS C-code device pass-through capture (C1776, C1889)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  Complex spine modifier compliance (Modifier 59, XE, XS)
                </li>
              </ul>
            </div>

            {/* Specialty 2 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center mb-4 text-teal-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ophthalmology & Eye Centers</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Cataract extraction (66984/66982), premium toric & multifocal IOL upgrade carve-outs, and MIGS glaucoma micro-stents.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400" />
                  Correct patient-pay differential for non-covered premium IOLs
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400" />
                  Concurrent trabecular stent (66989/66991) packaging scrubbing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400" />
                  Bilateral procedure modifier compliance (Modifier 50 vs RT/LT)
                </li>
              </ul>
            </div>

            {/* Specialty 3 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Gastroenterology & Endoscopy</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                High-turnover screening colonoscopies (45378, G0121), therapeutic polypectomies (45380, 45385), and EGDs (43239).
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Modifier 33 (Affordable Care Act preventive service waiver)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Modifier PT (Diagnostic converted from screening waiver)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Multiple endoscopy payment reduction (MEPR) validation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ASC 4-Pillar Advantage */}
      <section className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Zap className="w-4 h-4" />
              The Aethera ASC Operating Engine
            </div>
            <h2 className="text-3xl font-bold text-white">
              Four Pillars of Surgical RCM Excellence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-cyan-400 font-mono text-sm font-bold mb-2">PILLAR 01</div>
              <h4 className="text-lg font-bold text-white mb-2">Implant Invoice Scrubbing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatic optical verification of manufacturer invoices, model numbers, and purchase orders directly appended to Loop 2300 PWK segments for same-day payer adjudication.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-teal-400 font-mono text-sm font-bold mb-2">PILLAR 02</div>
              <h4 className="text-lg font-bold text-white mb-2">MPPR Protection</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our rules engine flags payer remittance advices where commercial carriers illegally applied multiple procedure reductions to non-surgical or exempt diagnostic modalities.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-emerald-400 font-mono text-sm font-bold mb-2">PILLAR 03</div>
              <h4 className="text-lg font-bold text-white mb-2">UB-04 & 1500 Reconciliation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unified cross-scrubbing between the facility fee bill (UB-04 / 837I) and the attending surgeon's professional fee bill (CMS-1500 / 837P) to eliminate CPT and diagnosis mismatches.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-blue-400 font-mono text-sm font-bold mb-2">PILLAR 04</div>
              <h4 className="text-lg font-bold text-white mb-2">Contract Underpayment Audit</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Continuous automated auditing against your negotiated commercial payer fee schedules, ensuring surgical implants with cost-plus (e.g. Cost + 15%) provisions are paid in full.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pilot Intake Form Section */}
      <section id="asc-pilot-form" className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Zero-Risk 30-Case ASC Billing Audit
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Experience Aethera Surgical RCM on 30 of Your Past Claims
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Send us 30 denied or underpaid surgical claims. Our ASC specialized scrubbers will audit them for uncaptured implant carve-outs, incorrect MPPR deductions, and contract variances at zero upfront cost.
              </p>
            </div>

            {status === 'success' ? (
              <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Audit Pilot Request Received</h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
                  Thank you! Our Director of Surgical RCM is preparing your ASC claims intake packet. We will reach out within 4 business hours to establish secure SFTP transmission.
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-950 px-4 py-2 rounded-lg border border-emerald-800">
                  <Lock className="w-3.5 h-3.5" />
                  Direct routing confirmed to Senior ASC Billing Leadership
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot */}
                <input
                  type="text"
                  name="user_note"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Surgery Center / Facility Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Outpatient Surgical Center"
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jennifer Miller, RN"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jennifer@apexorthosurg.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Direct Phone / Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(555) 345-6789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Your Title / Role
                    </label>
                    <select
                      value={titleRole}
                      onChange={(e) => setTitleRole(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-sm"
                    >
                      <option value="">Select Role</option>
                      <option value="ASC Administrator">ASC Administrator</option>
                      <option value="Clinical Director / DON">Clinical Director / DON</option>
                      <option value="CFO / Finance Director">CFO / Finance Director</option>
                      <option value="Billing / RCM Manager">Billing / RCM Manager</option>
                      <option value="Physician Owner / Partner">Physician Owner / Partner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Facility Footprint
                    </label>
                    <select
                      value={operatingRooms}
                      onChange={(e) => setOperatingRooms(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-sm"
                    >
                      <option value="1-2 OR Suites / Procedure Rooms">1-2 OR Suites</option>
                      <option value="3-4 OR Suites">3-4 OR Suites</option>
                      <option value="5-8 OR Suites">5-8 OR Suites</option>
                      <option value="9+ OR Multi-Center System">9+ OR Multi-Center System</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Primary Surgical Specialty
                    </label>
                    <select
                      value={specialtyMix}
                      onChange={(e) => setSpecialtyMix(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-sm"
                    >
                      <option value="Orthopedics & Spine">Orthopedics & Spine</option>
                      <option value="Ophthalmology / Eye Surgery">Ophthalmology</option>
                      <option value="Gastroenterology / GI">Gastroenterology / GI</option>
                      <option value="Pain Management / Interventional">Pain Management</option>
                      <option value="Multi-Specialty ASC">Multi-Specialty ASC</option>
                      <option value="Plastic & Reconstructive">Plastic & Reconstructive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Current Billing Operation
                    </label>
                    <select
                      value={currentBillingModel}
                      onChange={(e) => setCurrentBillingModel(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-sm"
                    >
                      <option value="In-House ASC Billers">In-House ASC Billers</option>
                      <option value="Outsourced Billing Vendor (Dissatisfied)">Outsourced Billing Vendor (Dissatisfied)</option>
                      <option value="Hospital CBO Centralized System">Hospital CBO Centralized System</option>
                      <option value="Hybrid / Mixed Model">Hybrid / Mixed Model</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Biggest Financial Challenge
                    </label>
                    <select
                      value={primaryChallenge}
                      onChange={(e) => setPrimaryChallenge(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-sm"
                    >
                      <option value="Implant carve-outs & payer underpayments">Implant carve-outs & payer underpayments</option>
                      <option value="Days in A/R exceeding 45+ days">Days in A/R exceeding 45+ days</option>
                      <option value="Surgical prior authorization bottlenecks">Surgical prior auth bottlenecks</option>
                      <option value="Biller turnover and coding errors">Biller turnover & coding errors</option>
                    </select>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-bold text-base hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Transmitting Audit Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit 30-Case ASC Audit Request</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 pt-2">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    HIPAA Zero-Knowledge Architecture
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                    BAA Provided Prior to PHI Transfer
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-cyan-400" />
                    Zero Long-Term Contract Required
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
