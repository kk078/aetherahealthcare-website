'use client';

import React, { useState, useId } from 'react';
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
  Home,
  HeartHandshake,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

export default function HomeHealthLandingClient() {
  const formId = useId();

  // Calculator State
  const [episodeCount, setEpisodeCount] = useState<number>(120);
  const [careType, setCareType] = useState<'home_health' | 'hospice'>('home_health');
  const [leakageRate, setLeakageRate] = useState<number>(14);

  // Form State
  const [agencyName, setAgencyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [titleRole, setTitleRole] = useState('');
  const [agencyStructure, setAgencyStructure] = useState('Home Health Agency (PDGM)');
  const [currentEhr, setCurrentEhr] = useState('Homecare Homebase (HCHB)');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Rate Benchmarks
  const CARE_BENCHMARKS = {
    home_health: {
      label: 'Home Health 30-Day Episode ($2,150 avg base HIPPS)',
      baseRate: 2150,
      lupaLossPerCase: 1450,
    },
    hospice: {
      label: 'Hospice Routine Home Care ($218/day · $6,540/month)',
      baseRate: 6540,
      lupaLossPerCase: 2600,
    },
  };

  const activeBenchmark = CARE_BENCHMARKS[careType];
  const annualEpisodeVolume = episodeCount * 12;
  const annualTotalRevenue = annualEpisodeVolume * activeBenchmark.baseRate;
  const annualLeakage = Math.round(annualEpisodeVolume * (leakageRate / 100) * activeBenchmark.lupaLossPerCase);
  const recoveredCashFlow = Math.round(annualLeakage * 0.88);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        name: contactName,
        email,
        phone,
        practice: agencyName,
        service: 'Home Health & Hospice RCM & PDGM Audit',
        notes: `[Campaign: Home Health & Hospice Billing LP] Role: ${titleRole} | Structure: ${agencyStructure} | EHR: ${currentEhr} | Episodes: ${episodeCount}/mo | Mode: ${careType} | Risk %: ${leakageRate}% | Est Recaptured: $${recoveredCashFlow.toLocaleString()} | Details: ${notes || 'None provided'}`,
        source: 'Landing Page: /lp/home-health-hospice-billing',
      };

      const ok = await sendLeadToKiran('home_health_audit_inquiry', payload);
      if (ok) {
        setSubmitted(true);
      } else {
        setErrorMsg('There was an issue submitting your request. Please call (813) 519-4640 directly.');
      }
    } catch {
      setErrorMsg('A network error occurred. Please call us directly at (813) 519-4640.');
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
            <span>Home Health &amp; Hospice Revenue Cycle Management</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-jakarta tracking-tight text-white leading-tight">
            Stop Losing Revenue to PDGM LUPAs, Late NOAs &amp; Hospice Cap Recoupments
          </h1>

          <p className="text-base sm:text-xl text-slate-300 leading-relaxed">
            Engineered specifically for Medicare-certified home health agencies (CHHA) and hospice organizations.
            We synchronize OASIS-E scoring with daily nursing notes, prevent 5-day Notice of Admission (NOA) late penalties,
            and monitor statutory aggregate cap thresholds in real time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> PDGM 432 HIPPS Groups
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-teal-400" /> Day-5 NOA Guarantee
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
              <Award className="w-3.5 h-3.5 text-cyan-400" /> Hospice Cap Forecasting
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Sub-22 Days in A/R
            </span>
          </div>
        </div>

        {/* Interactive Financial Calculator */}
        <div className="mt-14 max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Calculator className="w-4 h-4" />
                <span>Financial Impact Simulator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-jakarta">
                PDGM LUPA Risk &amp; Hospice Cap Recoupment Calculator
              </h2>
            </div>
            <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-medium text-slate-300 self-start sm:self-auto">
              CMS 2025/2026 Payment Weights
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Control 1: Active Census / Episodes */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Active 30-Day Episodes / Census
                </label>
                <span className="text-lg font-bold text-emerald-400">{episodeCount}</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="5"
                value={episodeCount}
                onChange={(e) => setEpisodeCount(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                <span>20 cases</span>
                <span>500 cases</span>
              </div>
            </div>

            {/* Control 2: Care Type */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Program Model
              </label>
              <select
                value={careType}
                onChange={(e) => setCareType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="home_health">Home Health 30-Day Period (PDGM)</option>
                <option value="hospice">Hospice Care (Routine Home Care)</option>
              </select>
              <div className="text-[11px] text-emerald-400 font-medium mt-2 truncate">
                {activeBenchmark.label}
              </div>
            </div>

            {/* Control 3: Leakage Rate */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  LUPA / Penalty Exposure %
                </label>
                <span className="text-lg font-bold text-amber-400">{leakageRate}%</span>
              </div>
              <input
                type="range"
                min="4"
                max="30"
                step="1"
                value={leakageRate}
                onChange={(e) => setLeakageRate(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                <span>4% Low</span>
                <span>30% Severe LUPA Drop</span>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 mt-6">
            <div className="bg-slate-950/90 p-5 rounded-xl border border-rose-500/20 relative overflow-hidden">
              <div className="text-xs font-medium text-rose-400 mb-1">Annual Revenue at Risk</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                ${annualLeakage.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1.5">
                Forfeited to LUPA per-visit cuts, late NOA penalties &amp; OASIS HIPPS downcoding
              </div>
            </div>

            <div className="bg-slate-950/90 p-5 rounded-xl border border-emerald-500/20 relative overflow-hidden">
              <div className="text-xs font-medium text-emerald-400 mb-1">Aethera Net Recovery</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
                ${recoveredCashFlow.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1.5">
                Recaptured via automated visit pacing, same-day NOA filing &amp; clinical defensibility
              </div>
            </div>

            <div className="bg-slate-950/90 p-5 rounded-xl border border-cyan-500/20 relative overflow-hidden">
              <div className="text-xs font-medium text-cyan-400 mb-1">Guaranteed A/R Speed</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300">&lt; 22 Days</div>
              <div className="text-[11px] text-slate-400 mt-1.5">
                Rapid EDI 837I RAP and final claim adjudication with zero cash-flow stoppage
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-jakarta">
            Why Traditional Billers Fail in Home Health &amp; Hospice
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Generic professional billing companies do not understand institutional UB-04 EDI 837I, OASIS-E clinical groupings,
            or statutory hospice aggregate cap liabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-jakarta">PDGM LUPA Avoidance Engine</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Under PDGM, every 30-day period has an individualized visit threshold between 2 and 6 visits. If an agency delivers
              one visit fewer, the entire $2,150 episode is wiped out and converted to a meager per-visit rate. We monitor active visit
              velocity weekly to prevent surprise LUPA drops.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-jakarta">5-Day NOA Timely Submission</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              CMS penalizes late Notice of Admission (NOA) submissions with an un-waivable 1/30th reduction for every day past day 5.
              Our automated intake pipeline files NOAs within 24 hours of start of care (SOC), eliminating late penalties completely.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-jakarta">Hospice Aggregate Cap Shield</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Hospice providers face disastrous retrospective clawbacks if aggregate reimbursement exceeds the Medicare statutory cap
              ($34,385+ per beneficiary) or the 20% inpatient respite cap. We track live cap usage month-by-month to protect your agency.
            </p>
          </div>
        </div>
      </section>

      {/* Intake Form Section */}
      <section id="home-health-pilot-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Risk-Free 30-Day Episode Audit Pilot</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-jakarta">
                Get a Free 30-Day Episode Audit &amp; Cap Analysis
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Submit 20 recent episodes or claims to Aethera. Our senior post-acute RCM specialists will audit your OASIS HIPPS scores,
                LUPA visit frequencies, and NOA timestamps with detailed findings in under 48 hours.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-jakarta">
                  Audit Request Received by Leadership
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Thank you, <span className="font-semibold text-white">{contactName}</span>. Your Home Health &amp; Hospice
                  practice details have been routed directly to Kiran. We will reach out within 4 business hours to set up your secure pilot portal.
                </p>
                <div className="pt-2">
                  <a
                    href="tel:+18135194640"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    <PhoneCall className="w-4 h-4" /> Need immediate urgency? Call (813) 519-4640
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Agency / Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Guardian Home Health & Hospice"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins, RN, BSN"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
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
                      placeholder="sjenkins@guardianhh.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Direct Phone / Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(555) 432-8765"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
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
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
                    >
                      <option value="">Select Role</option>
                      <option value="Administrator / Executive Director">Administrator / CEO</option>
                      <option value="Director of Clinical Services (DON)">Director of Clinical Services</option>
                      <option value="Billing / Finance Director">Billing / Finance Director</option>
                      <option value="QA / OASIS Coordinator">QA / OASIS Coordinator</option>
                      <option value="Physician Medical Director">Physician Medical Director</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Agency Structure
                    </label>
                    <select
                      value={agencyStructure}
                      onChange={(e) => setAgencyStructure(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
                    >
                      <option value="Home Health Agency (PDGM)">Home Health Agency (PDGM)</option>
                      <option value="Hospice Care Organization">Hospice Care Organization</option>
                      <option value="Dual Home Health & Hospice">Dual Home Health &amp; Hospice</option>
                      <option value="Pediatric / Palliative Program">Palliative / Pediatric Program</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Primary Clinical EHR
                    </label>
                    <select
                      value={currentEhr}
                      onChange={(e) => setCurrentEhr(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
                    >
                      <option value="Homecare Homebase (HCHB)">Homecare Homebase (HCHB)</option>
                      <option value="Kinnser / WellSky">Kinnser / WellSky</option>
                      <option value="MatrixCare">MatrixCare</option>
                      <option value="KanTime Healthcare">KanTime Healthcare</option>
                      <option value="Axxess Home Health">Axxess Home Health</option>
                      <option value="Other / In-House EHR">Other / In-House EHR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Specific Billing Bottlenecks (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Experiencing 15% LUPA drops on surgical wound cases, or Palmetto GBA disputing NOA submission dates..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-xl font-bold font-jakarta text-white bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Initiating Audit Request…</span>
                  ) : (
                    <>
                      <span>Request Free 30-Day Episode Audit &amp; Cap Analysis</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% HIPAA Compliant · Business Associate Agreement (BAA) Executed · Zero Long-Term Obligation</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
