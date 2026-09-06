'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Clock,
  Calendar,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  Building2,
  Lock,
  RefreshCw,
  Zap,
  Layers,
  ArrowDownRight,
  Scale,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function SwitchBillingLandingClient() {
  // Calculator state
  const [monthlyCollections, setMonthlyCollections] = useState<number>(300000);
  const [agingAr, setAgingAr] = useState<number>(180000);
  const [currentBillerType, setCurrentBillerType] = useState<'offshore' | 'solo_local' | 'legacy_software' | 'in_house'>('offshore');

  // Form state
  const [contactName, setContactName] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('Primary Care & Family Medicine');
  const [ehrSystem, setEhrSystem] = useState('eClinicalWorks');
  const [currentBillerName, setCurrentBillerName] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculations
  const riskMultipliers = {
    offshore: { uncollectedPct: 0.28, standardDowntimeWeeks: 6, label: 'Offshore BPO (High AR Abandonment)' },
    solo_local: { uncollectedPct: 0.22, standardDowntimeWeeks: 5, label: 'Solo Local Biller (Capacity Bottleneck)' },
    legacy_software: { uncollectedPct: 0.25, standardDowntimeWeeks: 7, label: 'Software-Bundled Billing (Passive Follow-up)' },
    in_house: { uncollectedPct: 0.18, standardDowntimeWeeks: 4, label: 'In-House Staff (Staffing/Turnover Vulnerability)' },
  };

  const selectedConfig = riskMultipliers[currentBillerType];
  const estimatedAbandonedArRisk = Math.round(agingAr * selectedConfig.uncollectedPct);
  const potential90DayRecapture = Math.round(estimatedAbandonedArRisk * 0.78);
  const estimatedAnnualBillingLift = Math.round(monthlyCollections * 12 * 0.065); // 6.5% typical lift from undercoding/denial clean rate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) {
      setStatus('success');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const ok = await sendLeadToKiran('switching_medical_billing_inquiry', {
        contactName,
        practiceName,
        email,
        phone,
        specialty,
        ehrSystem,
        currentBillerName: currentBillerName || 'Not specified',
        currentBillerType: selectedConfig.label,
        monthlyCollections: `$${monthlyCollections.toLocaleString()}`,
        agingAr: `$${agingAr.toLocaleString()}`,
        estimatedAbandonedArRisk: `$${estimatedAbandonedArRisk.toLocaleString()}`,
        potential90DayRecapture: `$${potential90DayRecapture.toLocaleString()}`,
        estimatedAnnualBillingLift: `$${estimatedAnnualBillingLift.toLocaleString()}`,
        source: 'Switching Billing Landing Page (/lp/switch-medical-billing)',
        submittedAt: new Date().toISOString(),
      });

      if (ok) {
        setStatus('success');
        trackConversion('pilot');
      } else {
        setStatus('error');
        setErrorMsg('Unable to submit your inquiry. Please submit an email request at /contact or schedule a meeting at /schedule.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please submit an inquiry at /contact or schedule a meeting.');
    }
  };

  return (
    <>
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-24">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[128px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 7 Columns: Pitch & Interactive Downtime & AR Risk Engine */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal/15 text-teal border border-teal/30 text-xs font-bold uppercase tracking-wider">
                  <RefreshCw className="w-3.5 h-3.5 text-mint animate-spin-slow" />
                  Guaranteed Zero-Downtime Parallel Migration Protocol
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-jakarta text-white tracking-tight leading-[1.15]">
                  Switch Medical Billing Companies{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal via-mint to-blue-400">
                    Without Pausing Your Cash Flow
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                  Most practices endure failing billing companies because they dread EDI re-enrollment delays, lost claims, and abandoned legacy AR. Aethera runs a <strong>parallel dual-track cutover</strong> that maintains 100% remittance continuity while recovering your old aging accounts.
                </p>
              </div>

              {/* Key Assurance Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-teal" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">0 Days Downtime</div>
                    <div className="text-[10px] text-slate-400">Parallel clearinghouse link</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-mint/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-mint" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">100% AR Runoff</div>
                    <div className="text-[10px] text-slate-400">Zero legacy claims dropped</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">48-Hr Shadow Pilot</div>
                    <div className="text-[10px] text-slate-400">Test first 50 claims free</div>
                  </div>
                </div>
              </div>

              {/* Interactive AR Leakage & Transition Risk Calculator */}
              <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Scale className="w-5 h-5 text-teal" />
                    <h3 className="text-base sm:text-lg font-bold font-jakarta text-white">
                      Switching Downtime &amp; AR Attrition Risk Calculator
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Live Model
                  </span>
                </div>

                {/* Slider: Monthly Collections */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label htmlFor="collections-slider" className="text-slate-300 font-medium">
                      Estimated Monthly Collections:
                    </label>
                    <span className="font-mono font-bold text-teal text-base">
                      ${monthlyCollections.toLocaleString()}
                    </span>
                  </div>
                  <input
                    id="collections-slider"
                    type="range"
                    min="50000"
                    max="1500000"
                    step="25000"
                    value={monthlyCollections}
                    onChange={(e) => setMonthlyCollections(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>$50,000/mo</span>
                    <span>$750,000/mo</span>
                    <span>$1.5M+/mo</span>
                  </div>
                </div>

                {/* Slider: Aging AR */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label htmlFor="ar-slider" className="text-slate-300 font-medium">
                      Current Outstanding Accounts Receivable (&gt;30 Days):
                    </label>
                    <span className="font-mono font-bold text-amber-400 text-base">
                      ${agingAr.toLocaleString()}
                    </span>
                  </div>
                  <input
                    id="ar-slider"
                    type="range"
                    min="25000"
                    max="800000"
                    step="15000"
                    value={agingAr}
                    onChange={(e) => setAgingAr(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>$25,000</span>
                    <span>$400,000</span>
                    <span>$800,000+</span>
                  </div>
                </div>

                {/* Dropdown: Current Biller Setup */}
                <div className="space-y-2">
                  <label htmlFor="biller-type" className="text-sm text-slate-300 font-medium block">
                    Current Billing Setup Being Replaced:
                  </label>
                  <select
                    id="biller-type"
                    value={currentBillerType}
                    onChange={(e) => setCurrentBillerType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal"
                  >
                    <option value="offshore">Generic Offshore BPO / Agency (High backlog, low communication)</option>
                    <option value="solo_local">Solo Independent Biller (Over capacity, sick/vacation gaps)</option>
                    <option value="legacy_software">EHR-Bundled Billing Service (Passive auto-billing, no denial follow-up)</option>
                    <option value="in_house">In-House Staff (High turnover, rising wages, training burden)</option>
                  </select>
                </div>

                {/* Dynamic Calculated Financial Impact Grid */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 mb-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      Legacy AR Abandonment Risk
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-white">
                      ${estimatedAbandonedArRisk.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Typical AR lost during unmanaged biller transitions.
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-teal flex items-center gap-1 mb-1">
                      <Clock className="w-3.5 h-3.5 text-teal" />
                      Aethera Cutover Lag
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-teal">
                      0 Days
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Parallel EDI/ERA cutover guarantees uninterrupted cash flow.
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-mint flex items-center gap-1 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-mint" />
                      Estimated Annual Lift
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-mint">
                      +${estimatedAnnualBillingLift.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      From clean claims (+6.5% first-pass collections average).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: The Seamless Transition Form */}
            <div id="pilot-form" className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative">
                {status === 'success' ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-teal/20 text-teal flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h3 className="text-2xl font-bold font-jakarta text-white">
                      Migration Plan Initiated!
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Thank you, <strong className="text-white">{contactName}</strong>. Kiran and our Senior RCM Migration Director have received your transition parameters for <strong className="text-white">{practiceName}</strong>.
                    </p>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 mt-4 text-slate-300">
                      <div className="font-semibold text-teal flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> What Happens in the Next 2 Hours:
                      </div>
                      <p>1. We draft your practice-specific EDI/ERA Parallel Enrollment Roadmap.</p>
                      <p>2. We run an audit sample of 50 active claims to prove denial recapture before you give notice to your current biller.</p>
                      <p>3. Direct meeting booking: <Link href="/schedule" className="text-teal underline font-bold">Schedule Consultation with Kiran</Link>.</p>
                    </div>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-6 text-xs text-slate-400 hover:text-white underline transition"
                    >
                      Submit another practice inquiry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal bg-teal/10 px-2.5 py-1 rounded-md border border-teal/20">
                        Zero-Disruption Transition Plan
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold font-jakarta text-white mt-2">
                        Get Your Zero-Downtime Transition Roadmap
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Receive a custom 4-phase cutover blueprint + test Aethera on 50 claims with zero obligation.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Honeypot */}
                      <input
                        type="text"
                        name="website_url_hp"
                        value={hp}
                        onChange={(e) => setHp(e.target.value)}
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-300 mb-1">
                            Your Name *
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            required
                            placeholder="Dr. Sarah Jenkins"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal placeholder:text-slate-600"
                          />
                        </div>
                        <div>
                          <label htmlFor="practice-name" className="block text-xs font-semibold text-slate-300 mb-1">
                            Practice Name *
                          </label>
                          <input
                            id="practice-name"
                            type="text"
                            required
                            placeholder="Bay Area Spine & Ortho"
                            value={practiceName}
                            onChange={(e) => setPracticeName(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="work-email" className="block text-xs font-semibold text-slate-300 mb-1">
                            Work Email *
                          </label>
                          <input
                            id="work-email"
                            type="email"
                            required
                            placeholder="sarah@bayareaspline.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal placeholder:text-slate-600"
                          />
                        </div>
                        <div>
                          <label htmlFor="direct-phone" className="block text-xs font-semibold text-slate-300 mb-1">
                            Direct Phone *
                          </label>
                          <input
                            id="direct-phone"
                            type="tel"
                            required
                            placeholder="(555) 000-0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="specialty-select" className="block text-xs font-semibold text-slate-300 mb-1">
                            Clinical Specialty *
                          </label>
                          <select
                            id="specialty-select"
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal"
                          >
                            <option value="Cardiology">Cardiology</option>
                            <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                            <option value="Emergency Medicine">Emergency Medicine & Hospitalists</option>
                            <option value="Urgent Care">Urgent Care & Walk-In Clinics</option>
                            <option value="Mental Health">Mental Health & Psychiatry</option>
                            <option value="Pain Management">Interventional Pain Management</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Primary Care & Family Medicine">Primary Care & Internal Medicine</option>
                            <option value="Pediatrics">Pediatrics</option>
                            <option value="OB/GYN">OB/GYN & Women&apos;s Health</option>
                            <option value="Ambulatory Surgery Centers">Ambulatory Surgery Centers (ASC)</option>
                            <option value="Other">Other Clinical Specialty</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="ehr-system" className="block text-xs font-semibold text-slate-300 mb-1">
                            EHR / PM System *
                          </label>
                          <select
                            id="ehr-system"
                            value={ehrSystem}
                            onChange={(e) => setEhrSystem(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal"
                          >
                            <option value="Epic">Epic</option>
                            <option value="eClinicalWorks">eClinicalWorks</option>
                            <option value="Athenahealth">Athenahealth</option>
                            <option value="AdvancedMD">AdvancedMD</option>
                            <option value="Kareo / Tebra">Kareo / Tebra</option>
                            <option value="NextGen">NextGen</option>
                            <option value="ModMed">Modernizing Medicine (ModMed)</option>
                            <option value="Office Ally">Office Ally</option>
                            <option value="Other">Other EHR / Clearinghouse</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="current-biller" className="block text-xs font-semibold text-slate-300 mb-1">
                          Current Billing Company / Software (Optional)
                        </label>
                        <input
                          id="current-biller"
                          type="text"
                          placeholder="e.g. Current BPO, In-House, or Vendor Name"
                          value={currentBillerName}
                          onChange={(e) => setCurrentBillerName(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal placeholder:text-slate-600"
                        />
                      </div>

                      {status === 'error' && (
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal to-blue-500 hover:from-teal/90 hover:to-blue-600 text-white font-bold font-jakarta text-sm transition-all shadow-lg hover:shadow-teal/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {status === 'submitting' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Formulating Migration Protocol...</span>
                          </>
                        ) : (
                          <>
                            <span>Request Transition Plan + Free 50-Claim Audit</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" /> 100% Confidential
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-teal" /> HIPAA BAA Provided
                        </span>
                        <span>•</span>
                        <span>No Contract Lock-in</span>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Phase Transition Roadmap Walkthrough */}
      <section className="py-16 sm:py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-teal font-bold uppercase tracking-wider text-xs">
              Proven Playbook
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-jakarta text-white tracking-tight mt-2">
              The Aethera 4-Phase Parallel Migration Protocol
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
              Why do transitions fail with other vendors? Because they make you terminate your current biller before setting up new EDI/ERA lines. Here is how Aethera executes with <strong>zero day-lag</strong>:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative group hover:border-teal/50 transition">
              <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal font-extrabold text-base flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-white font-jakarta mb-2">
                Parallel EDI/ERA Enrollment
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We establish clearinghouse payer bridges behind the scenes. Your current billing continues unaffected while sub-accounts, 837 claim feeds, and 835 remittance paths are pre-validated.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-semibold text-mint flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Zero interruption to cash flow
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative group hover:border-teal/50 transition">
              <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal font-extrabold text-base flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-white font-jakarta mb-2">
                Dual-Track AR Runoff Rescue
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you notify your old biller, they typically abandon aging claims. Our dedicated AR recovery specialists audit and aggressively pursue 100% of claims over 30, 60, and 90 days.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-semibold text-mint flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> 78% average legacy recovery
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative group hover:border-teal/50 transition">
              <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal font-extrabold text-base flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-white font-jakarta mb-2">
                Shadow Batch Scrubbing
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Before full cutover, your first 50–100 claims pass through our 3-Tier NCCI, LCD/NCD, and payer-specific rule scrubber. You see clean claim pass rates exceed 99% before live billing.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-semibold text-mint flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> 99.2% verified first-pass rate
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative group hover:border-teal/50 transition">
              <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal font-extrabold text-base flex items-center justify-center mb-4">
                04
              </div>
              <h3 className="text-lg font-bold text-white font-jakarta mb-2">
                Live Seamless Cutover
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                On day of cutover, all daily encounters transition directly to Aethera. You receive a dedicated US-based Account Director and live real-time KPI visibility in your client dashboard.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-semibold text-mint flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Under 26 days in AR SLA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix: Aethera vs Others */}
      <section className="py-16 sm:py-24 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta text-white">
              Why Other Transitions Fail vs. Why Aethera Succeeds
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900">
                  <th className="p-4 sm:p-5 text-slate-400 font-semibold">Transition Dimension</th>
                  <th className="p-4 sm:p-5 text-rose-400 font-bold">Standard Billing Agency</th>
                  <th className="p-4 sm:p-5 text-teal font-bold bg-teal/10">Aethera Healthcare Solutions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-4 sm:p-5 font-medium text-white">EDI / Clearinghouse Cutover</td>
                  <td className="p-4 sm:p-5 text-slate-400">Claims paused 30–60 days during re-credentialing</td>
                  <td className="p-4 sm:p-5 text-white font-semibold bg-teal/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                    Parallel enrollment; 0 days lost cash flow
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-medium text-white">Old Accounts Receivable (Runoff)</td>
                  <td className="p-4 sm:p-5 text-slate-400">Abandoned or charged 15–20% standalone contingency</td>
                  <td className="p-4 sm:p-5 text-white font-semibold bg-teal/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                    Dedicated runoff team pursues 100% of backlog
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-medium text-white">Account Management</td>
                  <td className="p-4 sm:p-5 text-slate-400">Anonymous ticket queue with offshore shift lag</td>
                  <td className="p-4 sm:p-5 text-white font-semibold bg-teal/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                    Dedicated US-based Account Director &amp; direct phone
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-medium text-white">Denial Prevention Scrubbing</td>
                  <td className="p-4 sm:p-5 text-slate-400">Basic clearinghouse format checks only</td>
                  <td className="p-4 sm:p-5 text-white font-semibold bg-teal/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                    Pre-submission NCCI, LCD/NCD &amp; modifier rules engine
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-medium text-white">Contract Commitments</td>
                  <td className="p-4 sm:p-5 text-slate-400">12–24 month binding contracts with exit penalties</td>
                  <td className="p-4 sm:p-5 text-white font-semibold bg-teal/5 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                    Performance-based SLA; 14-day zero-risk trial
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Floating CTA footer bar */}
      <section className="py-12 bg-gradient-to-r from-teal/20 via-slate-900 to-blue-600/20 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <h3 className="text-xl sm:text-3xl font-extrabold font-jakarta text-white">
            Ready to stop accepting mediocre billing performance?
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            Book a confidential 15-minute transition discovery call with Kiran or submit your practice parameters for a free 50-claim pilot.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#pilot-form"
              className="px-6 py-3 rounded-xl bg-teal hover:bg-teal/90 text-white text-sm font-bold shadow-lg shadow-teal/20 transition cursor-pointer"
            >
              Get Custom Transition Roadmap
            </a>
            <Link
              href="/schedule"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold border border-slate-700 flex items-center gap-2 transition"
            >
              <Calendar className="w-4 h-4 text-teal" />
              <span>Schedule a Meeting</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
