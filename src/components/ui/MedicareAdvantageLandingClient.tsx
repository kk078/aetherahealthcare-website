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
  Phone,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  Building2,
  Lock,
  Layers,
  FileCheck2,
  Scale,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function MedicareAdvantageLandingClient() {
  // Calculator state
  const [monthlyEncounters, setMonthlyEncounters] = useState<number>(650);
  const [crossoverDropRate, setCrossoverDropRate] = useState<number>(14); // 14% unadjudicated crossover claims
  const [avgSecondaryBalance, setAvgSecondaryBalance] = useState<number>(65); // $65 average secondary coinsurance
  const [maPatientPct, setMaPatientPct] = useState<number>(45); // 45% MA / D-SNP panel

  // Form state
  const [contactName, setContactName] = useState('');
  const [titleRole, setTitleRole] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [payerMix, setPayerMix] = useState('Humana & UnitedHealthcare MA');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Financial Calculations
  const annualEncounters = monthlyEncounters * 12;
  const droppedCrossoverClaims = Math.round(annualEncounters * (crossoverDropRate / 100));
  const annualCrossoverLoss = Math.round(droppedCrossoverClaims * avgSecondaryBalance);
  const aetheraCrossoverRecovery = Math.round(annualCrossoverLoss * 0.88); // 88% recovery rate via automated electronic crossover bridge
  const hccV28OptimizationLift = Math.round(annualEncounters * 145); // ~$145/encounter average risk adjustment capitation recapture
  const totalAnnualAdvantageLift = aetheraCrossoverRecovery + Math.round(hccV28OptimizationLift * 0.4);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) {
      setStatus('success');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const ok = await sendLeadToKiran('dsnp_medicare_advantage_rcm_inquiry', {
        contact_name: contactName,
        title_role: titleRole,
        practice_name: practiceName,
        email,
        phone,
        primary_payer_mix: payerMix,
        ma_patient_share: `${maPatientPct}%`,
        monthly_encounters: monthlyEncounters,
        crossover_drop_rate: `${crossoverDropRate}%`,
        estimated_annual_crossover_loss: `$${annualCrossoverLoss.toLocaleString()}`,
        modeled_recovery_gain: `$${totalAnnualAdvantageLift.toLocaleString()}`,
        timestamp: new Date().toISOString(),
      });

      if (ok) {
        trackConversion('pilot', totalAnnualAdvantageLift);
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg('Submission failed. Please submit an email request at /contact or schedule a meeting at /schedule.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please submit an inquiry at /contact or schedule a meeting.');
    }
  };

  return (
    <>
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-24">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-teal/20 rounded-full blur-[128px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 7 Columns: Pitch & Crossover Recovery Calculator */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal/15 text-teal border border-teal/30 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-mint" />
                  Dual-Eligible (D-SNP) &amp; Medicare Advantage RCM Pod
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-jakarta text-white tracking-tight leading-[1.15]">
                  Stop D-SNP Crossover Claim Leakage &amp;{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal via-mint to-blue-400">
                    Defend v28 RAF Scores
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                  Dual-eligible patients are among the most financially vulnerable and clinically complex. Incomplete
                  Medicaid crossover routing, improper QMB balance billing, and the CMS-HCC v28 transition drain tens of
                  thousands in uncollected copays. Aethera deploys an automated <strong>secondary crossover bridge</strong>{' '}
                  and certified CRC coding pods that capture 100% of rightful reimbursement.
                </p>
              </div>

              {/* D-SNP Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center mb-2">
                    <Scale className="w-4 h-4 text-teal" />
                  </div>
                  <div className="text-xs font-bold text-white">QMB Billing Shield</div>
                  <div className="text-[10px] text-slate-400">100% SSA § 1902 compliance</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-mint/10 flex items-center justify-center mb-2">
                    <Layers className="w-4 h-4 text-mint" />
                  </div>
                  <div className="text-xs font-bold text-white">Auto Crossover EDI</div>
                  <div className="text-[10px] text-slate-400">88% dropped claim recovery</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                    <FileCheck2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-xs font-bold text-white">v28 MEAT Defensibility</div>
                  <div className="text-[10px] text-slate-400">Prospective CRC chart audits</div>
                </div>
              </div>

              {/* Interactive D-SNP & MA Recovery Calculator */}
              <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="w-5 h-5 text-teal" />
                    <h3 className="text-base sm:text-lg font-bold font-jakarta text-white">
                      Medicare Advantage &amp; D-SNP Revenue Recovery Calculator
                    </h3>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-teal/10 text-teal border border-teal/20">
                    Live Model
                  </span>
                </div>

                {/* Slider: Monthly MA Encounters */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label htmlFor="encounters-slider" className="text-slate-300 font-medium">
                      Monthly MA &amp; D-SNP Patient Encounters:
                    </label>
                    <span className="font-mono font-bold text-teal text-base">
                      {monthlyEncounters.toLocaleString()} visits / mo
                    </span>
                  </div>
                  <input
                    id="encounters-slider"
                    type="range"
                    min="150"
                    max="3000"
                    step="50"
                    value={monthlyEncounters}
                    onChange={(e) => setMonthlyEncounters(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>150 visits</span>
                    <span>1,500 visits</span>
                    <span>3,000+ visits</span>
                  </div>
                </div>

                {/* Slider: Crossover Drop Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label htmlFor="droprate-slider" className="text-slate-300 font-medium">
                      Estimated Unadjudicated Crossover Leakage:
                    </label>
                    <span className="font-mono font-bold text-amber-400 text-base">
                      {crossoverDropRate}% of claims
                    </span>
                  </div>
                  <input
                    id="droprate-slider"
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={crossoverDropRate}
                    onChange={(e) => setCrossoverDropRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>5% (Optimized)</span>
                    <span>14% (Industry Avg)</span>
                    <span>30% (Critical Leakage)</span>
                  </div>
                </div>

                {/* Slider: Average Secondary Balance */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label htmlFor="balance-slider" className="text-slate-300 font-medium">
                      Average Secondary Coinsurance / Copay:
                    </label>
                    <span className="font-mono font-bold text-mint text-base">
                      ${avgSecondaryBalance} / claim
                    </span>
                  </div>
                  <input
                    id="balance-slider"
                    type="range"
                    min="35"
                    max="140"
                    step="5"
                    value={avgSecondaryBalance}
                    onChange={(e) => setAvgSecondaryBalance(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-mint"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>$35 / encounter</span>
                    <span>$65 / encounter</span>
                    <span>$140 / encounter</span>
                  </div>
                </div>

                {/* Output Metrics Grid */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[11px] font-semibold text-rose-400 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Current Annual Loss
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-white">
                      -${annualCrossoverLoss.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Unpaid secondary Medicaid coinsurance.
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-teal mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal" /> Crossover Recovery
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-teal">
                      +${aetheraCrossoverRecovery.toLocaleString()}/yr
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Recaptured via automated 837 crossover.
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-mint mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-mint" /> Total Annual Advantage Lift
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-mint">
                      +${totalAnnualAdvantageLift.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Crossover cash + v28 risk adjustment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Medicare Advantage Payer Matrix Snapshot */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal" />
                  Direct Clearinghouse Integrations Across Major MA &amp; D-SNP Payers
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                    <strong className="block text-white">Humana MA</strong>
                    <span>ERA Auto-Crossover</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                    <strong className="block text-white">UnitedHealthcare</strong>
                    <span>Dual Complete Pod</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                    <strong className="block text-white">Aetna Medicare</strong>
                    <span>CO-22 Coordination</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                    <strong className="block text-white">Wellcare / Centene</strong>
                    <span>State Medicaid Bridges</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Lead & Pilot Application Form */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/15 text-teal text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Complimentary 50-Claim D-SNP Audit
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-jakarta text-white">
                    Request a 50-Claim D-SNP &amp; MA Recovery Audit
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Our specialized Medicare Advantage team will audit 50 of your denied or unadjudicated crossover
                    claims to demonstrate immediate revenue recovery. Zero cost, zero obligation.
                  </p>
                </div>

                {status === 'success' ? (
                  <div className="p-6 rounded-2xl bg-teal/10 border border-teal/30 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-teal/20 text-teal flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h4 className="text-lg font-bold text-white">Audit Request Received</h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Our Medicare Advantage Practice Director has received your parameters and will deliver your custom
                      crossover audit protocol within 1 business day.
                    </p>
                    <div className="pt-2 text-xs text-teal font-semibold">
                      Need immediate coordination? <Link href="/schedule" className="underline hover:text-white">Schedule a meeting with Kiran</Link>.
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Honeypot field */}
                    <input
                      type="text"
                      name="website_profile"
                      value={hp}
                      onChange={(e) => setHp(e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Elena Ramos"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Title / Role *</label>
                        <input
                          type="text"
                          required
                          placeholder="Clinic Director / MD"
                          value={titleRole}
                          onChange={(e) => setTitleRole(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Practice Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Sunrise Senior Care"
                          value={practiceName}
                          onChange={(e) => setPracticeName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="eramos@sunrisecare.org"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Direct Phone *</label>
                        <input
                          type="tel"
                          required
                          placeholder="(555) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Primary MA Payer Mix</label>
                      <input
                        type="text"
                        placeholder="Humana, UnitedHealthcare Dual Complete, Florida Blue MA"
                        value={payerMix}
                        onChange={(e) => setPayerMix(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                      />
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-teal to-mint hover:from-teal/90 hover:to-mint/90 text-navy flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-teal/25 disabled:opacity-50 mt-2"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting Audit Request...
                        </>
                      ) : (
                        <>
                          Request 50-Claim D-SNP Audit
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                      <Lock className="w-3.5 h-3.5 text-teal" />
                      <span>HIPAA BAA executed. No patient data stored on public web tier.</span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Compliance Section */}
      <section className="py-16 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-jakarta text-white">
              Why Medicare Advantage RCM Requires Specialized Pods
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Commercial billing rules do not work for Medicare Advantage and Dual-Eligible health plans. Our team
              enforces strict regulatory safeguards to maximize practice collections without regulatory risk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center text-teal font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-white">Zero QMB Balance Billing Penalties</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Section 1902(n)(3)(B) of the Social Security Act strictly prohibits billing Qualified Medicare
                Beneficiaries for Medicare cost-sharing. Our clearinghouse auto-detects QMB status and directs balances
                strictly to state Medicaid.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center text-mint font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-white">Automated Secondary Crossover (CO-22 Elimination)</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                When MA plans fail to transmit automatic 837 crossover claims to Medicaid, practices write off balances.
                Aethera intercepts the 835 remittance and instantly routes electronic secondary claims with original EOBs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-white">CMS-HCC v28 Risk Score Protection</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                With CMS transitioning 100% of risk adjustment to the v28 model, our certified CRC coders perform
                continuous chart audits to substantiate MEAT criteria and prevent RAF contraction.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
