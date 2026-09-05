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
  HeartPulse,
  Brain,
  FileCheck2,
  Award,
  Zap,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function BehavioralHealthLandingClient() {
  // Calculator state
  const [clientCensus, setClientCensus] = useState<number>(36);
  const [levelOfCare, setLevelOfCare] = useState<'residential' | 'php' | 'iop' | 'outpatient'>('residential');
  const [unrecoveredRate, setUnrecoveredRate] = useState<number>(14); // 14%

  // Form state
  const [facilityName, setFacilityName] = useState('');
  const [contactName, setContactName] = useState('');
  const [titleRole, setTitleRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [facilityType, setFacilityType] = useState('Addiction Residential (RTC & Detox)');
  const [currentEhr, setCurrentEhr] = useState('Kipu Systems');
  const [primaryChallenge, setPrimaryChallenge] = useState('Concurrent authorization denials & ASAM peer reviews');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Level of care per diem rates
  const rates = {
    residential: { daily: 950, name: 'Residential Inpatient / Detox' },
    php: { daily: 450, name: 'Partial Hospitalization (PHP)' },
    iop: { daily: 250, name: 'Intensive Outpatient (IOP)' },
    outpatient: { daily: 140, name: 'Outpatient Therapy / Psych' },
  };

  const activeRate = rates[levelOfCare];
  const annualCensusDays = clientCensus * 365;
  const annualGrossBilling = annualCensusDays * activeRate.daily;
  const annualLeakage = Math.round(annualGrossBilling * (unrecoveredRate / 100));
  const recoveredCashFlow = Math.round(annualLeakage * 0.88); // 88% recovered via active UR and MHPAEA appeals
  const targetDaysInAr = 24;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) {
      setStatus('success');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const ok = await sendLeadToKiran('behavioral_health_audit_inquiry', {
        facilityName,
        contactName,
        titleRole,
        email,
        phone,
        facilityType,
        currentEhr,
        primaryChallenge,
        clientCensus: `${clientCensus} Census / Beds`,
        levelOfCare: activeRate.name,
        unrecoveredRate: `${unrecoveredRate}%`,
        annualLeakage: `$${annualLeakage.toLocaleString()}`,
        recoveredCashFlow: `$${recoveredCashFlow.toLocaleString()}`,
        sourcePage: '/lp/behavioral-health-billing',
      });

      if (ok) {
        setStatus('success');
        trackConversion('pilot');
      } else {
        setStatus('error');
        setErrorMsg('Unable to submit request right now. Please try again or contact Kiran directly.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('A network error occurred. Please refresh and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900/60 via-emerald-900/60 to-cyan-900/60 border-b border-teal-500/20 px-4 py-2.5 text-center text-xs sm:text-sm font-medium text-teal-200">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
          <span>Behavioral Health &amp; SUD Billing Engine: 100% ASAM Criteria Defense &amp; Parity Act Enforcement</span>
        </span>
      </div>

      {/* Hero Section */}
      <header className="relative pt-12 pb-20 overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-950/80 to-slate-950 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-inner">
              <Brain className="w-3.5 h-3.5" />
              Behavioral Health &amp; Substance Use Disorder (SUD) Revenue Cycle
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Stop Losing Census Revenue to{' '}
              <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                Concurrent Auth Denials
              </span>{' '}
              &amp; Length-of-Stay Cuts
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed">
              Designed specifically for residential treatment centers (RTC), detox facilities, PHP/IOP clinics, and behavioral health networks. We synchronize utilization review (UR) with daily clinical documentation, overturning ASAM medical necessity cutoffs and holding commercial payers accountable under MHPAEA parity mandates.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-medium text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                ASAM Levels 1.0 to 4.0 Defense
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                UB-04 &amp; 1500 Bed-Day Revenue
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                MHPAEA Parity Appeal Enforcement
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Days in A/R Under 24 Days
              </span>
            </div>
          </div>

          {/* Interactive Calculator Card */}
          <div className="max-w-4xl mx-auto bg-slate-900/90 border border-teal-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                  <Activity className="w-6 h-6 text-teal-400" />
                  Behavioral Health Census &amp; Authorization Loss Calculator
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Model financial recovery across residential, PHP, and IOP per diem denial clawbacks
                </p>
              </div>
              <span className="hidden sm:inline-flex px-3 py-1 bg-teal-950/60 border border-teal-500/40 rounded-full text-xs font-semibold text-teal-300">
                Dynamic Census Model
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Slider 1: Average Daily Census / Beds */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Active Bed Census / Clients
                  </label>
                  <span className="text-lg font-bold text-teal-400">{clientCensus} census</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="2"
                  value={clientCensus}
                  onChange={(e) => setClientCensus(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>10 beds</span>
                  <span>150 beds</span>
                </div>
              </div>

              {/* Selector 2: Primary Level of Care */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Primary Level of Care
                </label>
                <select
                  value={levelOfCare}
                  onChange={(e) => setLevelOfCare(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="residential">Residential Detox &amp; RTC ($950/day)</option>
                  <option value="php">Partial Hospitalization PHP ($450/day)</option>
                  <option value="iop">Intensive Outpatient IOP ($250/day)</option>
                  <option value="outpatient">Outpatient Psych / Therapy ($140/hr)</option>
                </select>
                <div className="text-[11px] text-teal-400 font-medium mt-2">
                  Daily Baseline: ${activeRate.daily.toLocaleString()} / client day
                </div>
              </div>

              {/* Slider 3: Denied or Unrecovered Rate */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Unrecovered / Denied %
                  </label>
                  <span className="text-lg font-bold text-amber-400">{unrecoveredRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={unrecoveredRate}
                  onChange={(e) => setUnrecoveredRate(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>5% Low</span>
                  <span>35% Severe Denial Drain</span>
                </div>
              </div>
            </div>

            {/* Calculated Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800">
              <div className="bg-slate-950/90 p-5 rounded-xl border border-rose-500/20 relative overflow-hidden">
                <div className="text-xs font-medium text-rose-400 mb-1">Annual Denied Bed Revenue</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  ${annualLeakage.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5">
                  Lost to premature discharge cutoffs &amp; missed UR milestones
                </div>
              </div>

              <div className="bg-slate-950/90 p-5 rounded-xl border border-teal-500/20 relative overflow-hidden">
                <div className="text-xs font-medium text-teal-400 mb-1">Aethera UR Peer Recovery</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-300">
                  ${recoveredCashFlow.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5">
                  Recaptured via expedited external reviews and parity legal appeals
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-950/80 to-emerald-950/80 p-5 rounded-xl border border-teal-500/40 relative overflow-hidden shadow-lg">
                <div className="text-xs font-medium text-teal-300 mb-1">Guaranteed A/R Performance</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
                  &lt;{targetDaysInAr} Days
                </div>
                <div className="text-[11px] text-teal-300/80 mt-1.5 font-medium">
                  Clean-claim adjudication with zero cash-flow lag
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href="#behavioral-pilot-form"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-sm hover:from-teal-400 hover:to-emerald-400 transition-all shadow-lg shadow-teal-500/20"
              >
                Claim Your 30-Day Behavioral Health Claims Audit
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Specialty Treatment Tracks */}
      <section className="py-20 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Complete Revenue Cycle Coverage Across the Behavioral Continuum
            </h2>
            <p className="text-slate-400 text-base">
              From medically managed withdrawal (detox) to step-down outpatient therapy, our behavioral billing teams master Revenue Codes, HCPCS H-codes, and Kipu/Sunwave EHR synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center mb-4 text-teal-400">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Residential &amp; Medically Managed Detox</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Sub-acute detox (ASAM 3.7-WM) and residential short-term treatment (ASAM 3.5).
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400" />
                  Revenue Codes 0110–0160 &amp; 1002 bed-day adjudication
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400" />
                  COWS / CIWA withdrawal scoring synchronization in daily notes
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400" />
                  Daily medication management (H0016 / H0018) bundle capture
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Partial Hospitalization (PHP) &amp; IOP</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Day treatment programs delivering 20+ hours (PHP) or 9–19 hours (IOP) of structured weekly clinical care.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  HCPCS H0035 (PHP per diem) &amp; H0015 (IOP per diem) compliance
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Multi-disciplinary therapy attendance roster cross-verification
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Definitive urine drug test (UDT G0480–G0483) medical necessity
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Outpatient Psychotherapy &amp; MAT</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Psychiatric evaluations, psychotherapy, and Medication-Assisted Treatment (MAT) for opioid dependence.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  Psychiatric diagnostic eval (90791/90792) and therapy (90834/90837)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  Office-based opioid treatment (OBOT G2086–G2088) monthly bundles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  Telehealth Modifier 95 / Place of Service 02/10 billing rules
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Parity & UR Advantage */}
      <section className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Zap className="w-4 h-4" />
              The Aethera Behavioral Engine
            </div>
            <h2 className="text-3xl font-bold text-white">
              Why Premier Behavioral Health Centers Partner with Aethera
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-teal-400 font-mono text-sm font-bold mb-2">ADVANTAGE 01</div>
              <h4 className="text-lg font-bold text-white mb-2">Proactive UR Advocates</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our UR clinicians conduct pre-admit authorizations and concurrent reviews 48 hours prior to payer cutoff deadlines, translating client clinical distress into strict ASAM criteria.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-emerald-400 font-mono text-sm font-bold mb-2">ADVANTAGE 02</div>
              <h4 className="text-lg font-bold text-white mb-2">MHPAEA Parity Citations</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                When payers impose discriminatory non-quantitative treatment limitations (NQTL), our legal appeal templates cite federal Mental Health Parity law, reversing arbitrary length-of-stay denials.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-cyan-400 font-mono text-sm font-bold mb-2">ADVANTAGE 03</div>
              <h4 className="text-lg font-bold text-white mb-2">Kipu &amp; Sunwave Native</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct API integration with leading behavioral EHRs. We extract attendance sheets, doctor orders, and toxicology results automatically without manual double data entry.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-blue-400 font-mono text-sm font-bold mb-2">ADVANTAGE 04</div>
              <h4 className="text-lg font-bold text-white mb-2">UDT Lab Compliance</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated clinical validation for presumptive (80305–80307) and definitive (G0480–G0483) toxicology panels, eliminating payer recoupments for excessive testing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pilot Intake Form */}
      <section id="behavioral-pilot-form" className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-teal-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/90 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-4">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Zero-Risk 30-Day Behavioral Health Claims Audit
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Let Us Audit 30 of Your Denied Behavioral Claims
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Send us 30 denied or underpaid behavioral health / SUD claims. Our certified behavioral billing team will review them for ASAM documentation flaws, parity violations, and missed level-of-care step-downs at zero cost.
              </p>
            </div>

            {status === 'success' ? (
              <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Audit Pilot Request Transmitted</h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
                  Thank you! Our Director of Behavioral Health RCM will contact you within 4 business hours to establish secure SFTP transmission for your claims sample.
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-950 px-4 py-2 rounded-lg border border-emerald-800">
                  <Lock className="w-3.5 h-3.5" />
                  Direct routing confirmed to Senior Behavioral Billing Specialists
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      Facility / Practice Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hope Horizon Recovery Center"
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Michael Harris, LCSW"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm"
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
                      placeholder="michael@hopehorizon.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Direct Phone / Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(555) 789-0123"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm"
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
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500 text-sm"
                    >
                      <option value="">Select Role</option>
                      <option value="Executive Director / CEO">Executive Director / CEO</option>
                      <option value="Clinical Director / DON">Clinical Director / DON</option>
                      <option value="Utilization Review (UR) Director">UR Director</option>
                      <option value="Billing / Finance Manager">Billing / Finance Manager</option>
                      <option value="Physician / Psychiatrist">Physician / Psychiatrist</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Facility Structure
                    </label>
                    <select
                      value={facilityType}
                      onChange={(e) => setFacilityType(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500 text-sm"
                    >
                      <option value="Addiction Residential (RTC & Detox)">Addiction Residential (RTC &amp; Detox)</option>
                      <option value="Partial Hospitalization (PHP) & IOP">Partial Hospitalization (PHP) &amp; IOP</option>
                      <option value="Outpatient Psych & Therapy Group">Outpatient Psych &amp; Therapy</option>
                      <option value="Integrated Multi-Site Behavioral Network">Multi-Site Behavioral Network</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Primary Clinical EHR
                    </label>
                    <select
                      value={currentEhr}
                      onChange={(e) => setCurrentEhr(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500 text-sm"
                    >
                      <option value="Kipu Systems">Kipu Systems</option>
                      <option value="Sunwave Health">Sunwave Health</option>
                      <option value="TherapyNotes">TherapyNotes</option>
                      <option value="SimplePractice">SimplePractice</option>
                      <option value="Qualifacts / Credible">Qualifacts / Credible</option>
                      <option value="Other / Generic EHR">Other EHR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Primary Reimbursement Challenge
                  </label>
                  <select
                    value={primaryChallenge}
                    onChange={(e) => setPrimaryChallenge(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500 text-sm"
                  >
                    <option value="Concurrent authorization denials & ASAM peer reviews">Concurrent authorization denials &amp; ASAM peer reviews</option>
                    <option value="Payer clawbacks on urine toxicology lab panels">Payer clawbacks on urine toxicology lab panels</option>
                    <option value="Days in A/R exceeding 55+ days for per diem claims">Days in A/R exceeding 55+ days for per diem claims</option>
                    <option value="Unpaid secondary crossover claims & patient deductibles">Unpaid secondary claims &amp; patient deductibles</option>
                  </select>
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
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 text-slate-950 font-bold text-base hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-xl shadow-teal-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Transmitting Audit Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit 30-Day Behavioral Health Audit Request</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 pt-2">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-teal-400" />
                    42 CFR Part 2 &amp; HIPAA Compliant
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
                    BAA Provided Prior to Data Review
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-teal-400" />
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
