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
  Layers,
  Network,
  BarChart3,
  Cpu,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function EnterpriseRcmLandingClient() {
  // Calculator state
  const [locations, setLocations] = useState<number>(6);
  const [annualRevenue, setAnnualRevenue] = useState<number>(18000000); // $18M
  const [currentDaysInAr, setCurrentDaysInAr] = useState<number>(44);

  // Form state
  const [contactName, setContactName] = useState('');
  const [titleRole, setTitleRole] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentEhrMix, setCurrentEhrMix] = useState('Epic & eClinicalWorks');
  const [primaryChallenge, setPrimaryChallenge] = useState('Centralizing CBO across multiple locations');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculations
  const dailyCollections = annualRevenue / 365;
  const targetDaysInAr = 25;
  const daysReduced = Math.max(0, currentDaysInAr - targetDaysInAr);
  const acceleratedCashFlow = Math.round(dailyCollections * daysReduced);
  const annualDenialRecapture = Math.round(annualRevenue * 0.048 * 0.82); // 4.8% typical enterprise denial leakage with 82% recovery
  const cboEfficiencySavings = Math.round(locations * 35000); // $35k per location saved via centralized automation
  const totalEnterpriseLift = acceleratedCashFlow + annualDenialRecapture + cboEfficiencySavings;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) {
      setStatus('success');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const ok = await sendLeadToKiran('enterprise_rcm_rfp_inquiry', {
        contactName,
        titleRole,
        organizationName,
        email,
        phone,
        currentEhrMix,
        primaryChallenge,
        locations: `${locations} Locations`,
        annualRevenue: `$${annualRevenue.toLocaleString()}`,
        currentDaysInAr: `${currentDaysInAr} Days`,
        acceleratedCashFlow: `$${acceleratedCashFlow.toLocaleString()}`,
        annualDenialRecapture: `$${annualDenialRecapture.toLocaleString()}`,
        cboEfficiencySavings: `$${cboEfficiencySavings.toLocaleString()}`,
        totalEnterpriseLift: `$${totalEnterpriseLift.toLocaleString()}`,
        source: 'Enterprise Health System Landing Page (/lp/enterprise-rcm)',
        submittedAt: new Date().toISOString(),
      });

      if (ok) {
        setStatus('success');
        trackConversion('pilot');
      } else {
        setStatus('error');
        setErrorMsg('Unable to submit inquiry. Please submit an email request at /contact or schedule a meeting at /schedule.');
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
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-teal/20 rounded-full blur-[128px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 7 Columns: Enterprise Pitch & CBO Engine */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal/15 text-teal border border-teal/30 text-xs font-bold uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-mint" />
                  Health Systems, MSOs &amp; Multi-Site Physician Groups
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-jakarta text-white tracking-tight leading-[1.15]">
                  Centralize Multi-Site RCM{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal via-mint to-blue-400">
                    Without Replacing Your EHRs
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                  Managing multiple clinics with disparate EHRs (Epic, Athena, eCW, NextGen) leads to billing silos, uneven denial management, and inflated CBO payroll. Aethera deploys a <strong>unified clearinghouse and specialized pod architecture</strong> that standardizes performance across all NPIs.
                </p>
              </div>

              {/* Enterprise Credentials Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center mb-2">
                    <Clock className="w-4 h-4 text-teal" />
                  </div>
                  <div className="text-xs font-bold text-white">&lt;25 Days in AR</div>
                  <div className="text-[10px] text-slate-400">Strict SLA contractual guarantee</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-mint/10 flex items-center justify-center mb-2">
                    <ShieldCheck className="w-4 h-4 text-mint" />
                  </div>
                  <div className="text-xs font-bold text-white">99.2% Clean Claims</div>
                  <div className="text-[10px] text-slate-400">3-tier NCCI pre-submission engine</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                    <Cpu className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-xs font-bold text-white">Multi-EHR Interop</div>
                  <div className="text-[10px] text-slate-400">Zero data migration downtime</div>
                </div>
              </div>

              {/* Interactive Enterprise CBO ROI Calculator */}
              <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-5 h-5 text-teal" />
                    <h3 className="text-base sm:text-lg font-bold font-jakarta text-white">
                      Enterprise CBO Consolidation &amp; Cash Acceleration Calculator
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Enterprise Model
                  </span>
                </div>

                {/* Slider: Locations */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label htmlFor="locations-slider" className="text-slate-300 font-medium">
                      Number of Clinical Locations / Facilities:
                    </label>
                    <span className="font-mono font-bold text-teal text-base">
                      {locations} {locations === 1 ? 'Site' : 'Sites'}
                    </span>
                  </div>
                  <input
                    id="locations-slider"
                    type="range"
                    min="2"
                    max="35"
                    step="1"
                    value={locations}
                    onChange={(e) => setLocations(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>2 Clinics</span>
                    <span>18 Sites</span>
                    <span>35+ Health System Sites</span>
                  </div>
                </div>

                {/* Slider: Annual Net Revenue */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label htmlFor="revenue-slider" className="text-slate-300 font-medium">
                      Total Annual Net Patient Service Revenue:
                    </label>
                    <span className="font-mono font-bold text-mint text-base">
                      ${(annualRevenue / 1000000).toFixed(1)}M / year
                    </span>
                  </div>
                  <input
                    id="revenue-slider"
                    type="range"
                    min="3000000"
                    max="60000000"
                    step="1000000"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-mint"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>$3M / yr</span>
                    <span>$30M / yr</span>
                    <span>$60M+ / yr</span>
                  </div>
                </div>

                {/* Slider: Current Days in AR */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label htmlFor="ar-days-slider" className="text-slate-300 font-medium">
                      Current Organization Days in A/R:
                    </label>
                    <span className="font-mono font-bold text-amber-400 text-base">
                      {currentDaysInAr} Days
                    </span>
                  </div>
                  <input
                    id="ar-days-slider"
                    type="range"
                    min="28"
                    max="65"
                    step="1"
                    value={currentDaysInAr}
                    onChange={(e) => setCurrentDaysInAr(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>28 Days (Clean)</span>
                    <span>45 Days (Average)</span>
                    <span>65+ Days (Distressed)</span>
                  </div>
                </div>

                {/* Output Comparison Grid */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[11px] font-semibold text-teal mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal" /> Accelerated Cash
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-white">
                      +${acceleratedCashFlow.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Liquidity released by compressing to 25d A/R.
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-mint mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-mint" /> Annual Denial Recovery
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-mint">
                      +${annualDenialRecapture.toLocaleString()}/yr
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Recaptured via 82% appeal overturn rate.
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-blue-400 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Total 12-Mo Financial Impact
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-blue-400">
                      +${totalEnterpriseLift.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Cash flow lift + operational CBO savings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Enterprise RFP & Discovery Form */}
            <div id="rfp-form" className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative">
                {status === 'success' ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-teal/20 text-teal flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h3 className="text-2xl font-bold font-jakarta text-white">
                      Executive Discovery Initiated!
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Thank you, <strong className="text-white">{contactName}</strong>. Kiran and our Managing Director of Enterprise RCM Solutions have received your request for <strong className="text-white">{organizationName}</strong>.
                    </p>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 mt-4 text-slate-300">
                      <div className="font-semibold text-teal flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Next Steps:
                      </div>
                      <p>1. We draft a tailored Centralized CBO Blueprint tailored to your {currentEhrMix} environment.</p>
                      <p>2. We prepare an NDA / BAA for clinical data exchange.</p>
                      <p>3. Direct meeting booking: <Link href="/schedule" className="text-teal underline font-bold">Schedule Consultation with Kiran</Link>.</p>
                    </div>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-6 text-xs text-slate-400 hover:text-white underline transition"
                    >
                      Submit another health system RFP
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal bg-teal/10 px-2.5 py-1 rounded-md border border-teal/20">
                        Enterprise Discovery &amp; RFP
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold font-jakarta text-white mt-2">
                        Request Multi-Site CBO Architecture Proposal
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Receive a custom feasibility audit, clearinghouse integration roadmap, and enterprise pricing.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Honeypot */}
                      <input
                        type="text"
                        name="website_hp_ent"
                        value={hp}
                        onChange={(e) => setHp(e.target.value)}
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="ent-name" className="block text-xs font-semibold text-slate-300 mb-1">
                            Your Name *
                          </label>
                          <input
                            id="ent-name"
                            type="text"
                            required
                            placeholder="David Sterling"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal placeholder:text-slate-600"
                          />
                        </div>
                        <div>
                          <label htmlFor="ent-role" className="block text-xs font-semibold text-slate-300 mb-1">
                            Title / Role *
                          </label>
                          <input
                            id="ent-role"
                            type="text"
                            required
                            placeholder="CFO / VP of Revenue Cycle"
                            value={titleRole}
                            onChange={(e) => setTitleRole(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="ent-org" className="block text-xs font-semibold text-slate-300 mb-1">
                          Health System / MSO / Group Name *
                        </label>
                        <input
                          id="ent-org"
                          type="text"
                          required
                          placeholder="Summit Regional Health Partners"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal placeholder:text-slate-600"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="ent-email" className="block text-xs font-semibold text-slate-300 mb-1">
                            Corporate Work Email *
                          </label>
                          <input
                            id="ent-email"
                            type="email"
                            required
                            placeholder="dsterling@summithealth.org"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal placeholder:text-slate-600"
                          />
                        </div>
                        <div>
                          <label htmlFor="ent-phone" className="block text-xs font-semibold text-slate-300 mb-1">
                            Direct Phone *
                          </label>
                          <input
                            id="ent-phone"
                            type="tel"
                            required
                            placeholder="(813) 555-0188"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="ent-ehr" className="block text-xs font-semibold text-slate-300 mb-1">
                            Primary EHR System(s) *
                          </label>
                          <select
                            id="ent-ehr"
                            value={currentEhrMix}
                            onChange={(e) => setCurrentEhrMix(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal"
                          >
                            <option value="Epic & eClinicalWorks">Epic &amp; eClinicalWorks</option>
                            <option value="Epic Community Connect">Epic Community Connect</option>
                            <option value="Athenahealth (Enterprise)">Athenahealth (Enterprise)</option>
                            <option value="NextGen Enterprise">NextGen Enterprise</option>
                            <option value="Cerner / Oracle Health">Cerner / Oracle Health</option>
                            <option value="Multiple Disparate Systems">Multiple Disparate Regional EHRs</option>
                            <option value="Other">Other Enterprise PM</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="ent-challenge" className="block text-xs font-semibold text-slate-300 mb-1">
                            Primary Revenue Initiative *
                          </label>
                          <select
                            id="ent-challenge"
                            value={primaryChallenge}
                            onChange={(e) => setPrimaryChallenge(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal"
                          >
                            <option value="Centralizing CBO across multiple locations">Centralizing CBO Across Locations</option>
                            <option value="Compressing Days in AR under 25 days">Compressing Days in AR &lt; 25 Days</option>
                            <option value="Overturning high-dollar surgical/hospital denials">Overturning High-Dollar Denials</option>
                            <option value="Replacing underperforming legacy vendor">Replacing Underperforming Legacy Vendor</option>
                            <option value="Full end-to-end RCM outsourcing">Full End-to-End RCM Outsourcing</option>
                          </select>
                        </div>
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
                            <span>Synthesizing Enterprise Model...</span>
                          </>
                        ) : (
                          <>
                            <span>Request Enterprise RFP &amp; Executive Assessment</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" /> Mutual NDA Provided
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-teal" /> SOC 2 / HIPAA Protocols
                        </span>
                        <span>•</span>
                        <span>Enterprise SLA Backing</span>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Architecture Pillars */}
      <section className="py-16 sm:py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-teal font-bold uppercase tracking-wider text-xs">
              Enterprise Grade RCM
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-jakarta text-white tracking-tight mt-2">
              How Aethera Powers Multi-Site Healthcare Organizations
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
              We eliminate regional operational friction through specialized clinical pods, automated clearinghouse aggregation, and transparent multi-facility executive reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="text-lg font-bold text-white font-jakarta">Unified Clearinghouse Aggregation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect multiple disparate regional billing engines and clearinghouses into one unified ANSI X12 837/835 analytics pipeline with real-time discrepancy monitoring.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="text-lg font-bold text-white font-jakarta">Sub-Specialty Pod Deployment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rather than assign generic billers, complex surgical, cardiology, oncology, and infusion claims are routed to specialized AAPC-certified billing pods.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="text-lg font-bold text-white font-jakarta">Executive KPI Telemetry</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                CFO and revenue cycle leadership access real-time Days in AR by facility, net collection ratios, payer delay trends, and dispute win rates with zero wait.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating CTA */}
      <section className="py-12 bg-gradient-to-r from-teal/20 via-slate-900 to-blue-600/20 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <h3 className="text-xl sm:text-3xl font-extrabold font-jakarta text-white">
            Schedule an Enterprise Executive Discovery Call
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            Discuss your organization&apos;s revenue cycle consolidation roadmap directly with Kiran and our Enterprise RCM team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#rfp-form"
              className="px-6 py-3 rounded-xl bg-teal hover:bg-teal/90 text-white text-sm font-bold shadow-lg shadow-teal/20 transition cursor-pointer"
            >
              Submit Enterprise RFP
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
