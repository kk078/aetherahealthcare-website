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
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function DenialPilotLandingClient() {
  // Calculator state
  const [monthlyCollections, setMonthlyCollections] = useState<number>(250000);
  const [denialRate, setDenialRate] = useState<number>(10);

  // Form state
  const [contactName, setContactName] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [ehrSystem, setEhrSystem] = useState('Epic');
  const [claimVolume, setClaimVolume] = useState('500–1,500 claims/mo');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculations
  const monthlyTrappedRevenue = Math.round(monthlyCollections * (denialRate / 100));
  const estimatedRecoverableAnnual = Math.round(monthlyTrappedRevenue * 0.82 * 12);
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
      const ok = await sendLeadToKiran('ppc_denial_recovery_pilot_application', {
        contactName,
        practiceName,
        email,
        phone,
        specialty,
        ehrSystem,
        claimVolume,
        estimatedMonthlyBilling: monthlyCollections,
        estimatedDenialRate: `${denialRate}%`,
        calculatedAnnualRecovery: `$${estimatedRecoverableAnnual.toLocaleString()}`,
        source: 'PPC Dedicated Landing Page (/lp/denial-recovery-pilot)',
        submittedAt: new Date().toISOString(),
      });

      if (ok) {
        setStatus('success');
        trackConversion('pilot');
      } else {
        setStatus('error');
        setErrorMsg('Unable to submit your request. Please submit an email request at /contact or schedule a consultation at /schedule.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please submit an inquiry at /contact or schedule a consultation at /schedule.');
    }
  };

  return (
    <>
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-24">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[128px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 7 Columns: Pitch & Leakage Calculator */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal/15 text-teal border border-teal/30 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-mint" />
                  Zero-Obligation 14-Day Pilot · 50 Free Claims
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-jakarta text-white tracking-tight leading-[1.15]">
                  Stop Leaving <span className="text-teal underline decoration-teal/40">8%–15%</span> of Practice Cash in Payer Accounts.
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                  Aethera deploys senior AAPC-certified coding pods and automated clearinghouse scrubbers to overturn 82%+ of denials and bring AR under 28 days. Test us on 50 of your toughest claims with zero setup fees and no long-term contract.
                </p>
              </div>

              {/* Interactive Revenue Leakage Estimator Box */}
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-teal/20 text-teal">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold font-jakarta text-white">Instant Revenue Leakage Estimator</h2>
                      <p className="text-xs text-slate-400">Model how much uncollected cash your practice can reclaim</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 text-teal font-bold">
                    82% Recovery Benchmark
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Slider 1: Monthly Collections */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>Monthly Billed Revenue</span>
                      <span className="font-mono text-teal">${(monthlyCollections / 1000).toFixed(0)}k/mo</span>
                    </div>
                    <input
                      type="range"
                      min="50000"
                      max="1000000"
                      step="25000"
                      value={monthlyCollections}
                      onChange={e => setMonthlyCollections(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>$50k</span>
                      <span>$500k</span>
                      <span>$1M+</span>
                    </div>
                  </div>

                  {/* Slider 2: Denial Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>Estimated Initial Denial Rate</span>
                      <span className="font-mono text-amber-400">{denialRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="25"
                      step="1"
                      value={denialRate}
                      onChange={e => setDenialRate(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>4% (Top Tier)</span>
                      <span>10% (Average)</span>
                      <span>25% (High)</span>
                    </div>
                  </div>
                </div>

                {/* Calculation Yield Outputs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-medium block">Monthly Trapped Cash</span>
                    <strong className="text-lg sm:text-xl font-extrabold text-rose-400 font-mono">
                      ${monthlyTrappedRevenue.toLocaleString()}
                    </strong>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-medium block">Target AR Duration</span>
                    <strong className="text-lg sm:text-xl font-extrabold text-teal font-mono">
                      &lt; {targetDaysInAr} Days
                    </strong>
                  </div>

                  <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-teal/20 to-slate-950 p-4 rounded-2xl border border-teal/40">
                    <span className="text-[11px] text-teal font-medium block">Annual Recoverable Lift</span>
                    <strong className="text-lg sm:text-xl font-extrabold text-mint font-mono">
                      +${estimatedRecoverableAnnual.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal shrink-0" />
                  <span>98.6% Clean Claims</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal shrink-0" />
                  <span>21-Day Average AR</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal shrink-0" />
                  <span>Zero Setup Fees</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal shrink-0" />
                  <span>No Long-Term Lock-in</span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Dedicated Embedded Intake Form */}
            <div id="pilot-form" className="lg:col-span-5 scroll-mt-28">
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative">
                {status === 'success' ? (
                  <div className="py-12 text-center space-y-5 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-mint/20 text-teal flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold font-jakarta text-navy">
                      Pilot Request Confirmed!
                    </h3>
                    <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                      Thank you, <strong className="text-navy">{contactName || 'Doctor'}</strong>. Your free 50-claim pilot has been routed directly to Kiran. Our senior onboarding lead will review your specialty parameters and contact you within 2 business hours.
                    </p>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
                      <div className="font-bold text-navy">What happens next:</div>
                      <div>1. Secure HIPAA BAA &amp; Mutual NDA countersigned via DocuSign.</div>
                      <div>2. Read-only EHR/clearinghouse credentials established.</div>
                      <div>3. First 50 claims audited &amp; scrubbed within 48 hours.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="px-5 py-2.5 rounded-full bg-navy text-white text-xs font-bold hover:bg-teal transition"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="border-b border-slate-100 pb-4">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal uppercase tracking-wider mb-1">
                        <Building2 className="w-4 h-4" /> Practice Verification
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-jakarta text-slate-900">
                        Claim Your Free 50-Claim Pilot
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Zero obligation. We will audit 50 real claims or past denials and prove recovered cash.
                      </p>
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* Anti-spam Honeypot */}
                    <div className="hidden" aria-hidden="true">
                      <input
                        type="text"
                        name="hp_field"
                        tabIndex={-1}
                        value={hp}
                        onChange={e => setHp(e.target.value)}
                        autoComplete="off"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Contact Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={e => setContactName(e.target.value)}
                          placeholder="Dr. Jane Smith"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Practice Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={practiceName}
                          onChange={e => setPracticeName(e.target.value)}
                          placeholder="Metro Heart & Vascular"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="billing@practice.com"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Direct Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="(813) 555-0199"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Primary Specialty
                        </label>
                        <select
                          value={specialty}
                          onChange={e => setSpecialty(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal"
                        >
                          <option value="Cardiology">Cardiology</option>
                          <option value="Orthopedics">Orthopedics &amp; Spine</option>
                          <option value="Family Medicine">Family / Internal Medicine</option>
                          <option value="Neurology">Neurology</option>
                          <option value="Pain Management">Pain Management</option>
                          <option value="Podiatry">Podiatry &amp; Wound Care</option>
                          <option value="Anesthesiology">Anesthesiology</option>
                          <option value="ASC">Ambulatory Surgery Center</option>
                          <option value="Radiology">Radiology &amp; Imaging</option>
                          <option value="Pathology">Pathology &amp; Lab</option>
                          <option value="Other">Other Specialty</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          EHR / Practice Software
                        </label>
                        <select
                          value={ehrSystem}
                          onChange={e => setEhrSystem(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal"
                        >
                          <option value="Epic">Epic</option>
                          <option value="eClinicalWorks">eClinicalWorks</option>
                          <option value="Athenahealth">athenahealth</option>
                          <option value="NextGen">NextGen</option>
                          <option value="ModMed">ModMed</option>
                          <option value="Kareo/Tebra">Kareo / Tebra</option>
                          <option value="AdvancedMD">AdvancedMD</option>
                          <option value="Other">Other / Proprietary</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full py-3.5 px-6 rounded-2xl bg-teal hover:bg-navy text-white text-sm font-bold transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Routing Pilot to Kiran...</span>
                        </>
                      ) : (
                        <>
                          <span>Activate My Free 50-Claim Pilot</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-slate-500 text-center">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-teal" /> 100% HIPAA Compliant
                      </span>
                      <span>•</span>
                      <span>No Credit Card</span>
                      <span>•</span>
                      <span>Cancel Anytime</span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile Conversion Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-3 px-4 flex items-center justify-between gap-3">
        <Link
          href="/schedule"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700"
        >
          <Calendar className="w-3.5 h-3.5 text-teal" />
          <span>Schedule Meeting</span>
        </Link>

        <a
          href="#pilot-form"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal text-white text-xs font-bold shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-mint" />
          <span>Claim 50 Claims</span>
        </a>
      </div>
    </>
  );
}
