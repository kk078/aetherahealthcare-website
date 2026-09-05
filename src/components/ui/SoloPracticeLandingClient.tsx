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
  UserCheck,
  PiggyBank,
  HeartPulse,
  Scale,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function SoloPracticeLandingClient() {
  // Calculator state
  const [providerCount, setProviderCount] = useState<number>(2);
  const [monthlyCollections, setMonthlyCollections] = useState<number>(85000);
  const [currentBillingModel, setCurrentBillingModel] = useState<'in_house_full' | 'in_house_part' | 'local_solo' | 'legacy_agency'>('in_house_full');

  // Form state
  const [contactName, setContactName] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('Family Medicine');
  const [ehrSystem, setEhrSystem] = useState('eClinicalWorks');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculations
  const annualCollections = monthlyCollections * 12;

  // Current costs estimate
  const currentCostBreakdown = {
    in_house_full: {
      annualCost: 72000, // $56k salary + benefits + software/clearinghouse fees
      label: 'Full-Time In-House Biller (Salary + FICA/Benefits + Software)',
      overheadPct: ((72000 / annualCollections) * 100).toFixed(1),
    },
    in_house_part: {
      annualCost: 42000, // $35k salary + part-time benefits + clearinghouse
      label: 'Part-Time In-House Staff (Wages + Clearinghouse Fees)',
      overheadPct: ((42000 / annualCollections) * 100).toFixed(1),
    },
    local_solo: {
      annualCost: Math.round(annualCollections * 0.075), // 7.5% typical local billing rate
      label: 'Independent Solo Biller (7.5% average fee)',
      overheadPct: '7.5',
    },
    legacy_agency: {
      annualCost: Math.round(annualCollections * 0.065), // 6.5% agency fee
      label: 'Generic Billing Service (6.5% fee + clearinghouse add-ons)',
      overheadPct: '6.5',
    },
  };

  const selectedCurrent = currentCostBreakdown[currentBillingModel];
  const aetheraAnnualFee = Math.round(annualCollections * 0.045); // 4.5% all-inclusive model
  const annualOverheadSavings = Math.max(0, selectedCurrent.annualCost - aetheraAnnualFee);
  const estimatedRevenueLift = Math.round(annualCollections * 0.06); // 6% collections lift from certified AAPC scrubbing
  const totalAnnualBenefit = annualOverheadSavings + estimatedRevenueLift;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) {
      setStatus('success');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const ok = await sendLeadToKiran('solo_practice_rcm_inquiry', {
        contactName,
        practiceName,
        email,
        phone,
        specialty,
        ehrSystem,
        providerCount: `${providerCount} Provider(s)`,
        monthlyCollections: `$${monthlyCollections.toLocaleString()}`,
        currentBillingModel: selectedCurrent.label,
        currentEstimatedCost: `$${selectedCurrent.annualCost.toLocaleString()}`,
        aetheraAnnualFee: `$${aetheraAnnualFee.toLocaleString()}`,
        projectedAnnualSavings: `$${annualOverheadSavings.toLocaleString()}`,
        projectedRevenueLift: `$${estimatedRevenueLift.toLocaleString()}`,
        totalAnnualBenefit: `$${totalAnnualBenefit.toLocaleString()}`,
        source: 'Solo & Small Practice Landing Page (/lp/solo-practice-rcm)',
        submittedAt: new Date().toISOString(),
      });

      if (ok) {
        setStatus('success');
        trackConversion('pilot');
      } else {
        setStatus('error');
        setErrorMsg('Unable to submit your request. Please call Kiran directly at +1 (813) 519-4640.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please call Kiran directly at +1 (813) 519-4640.');
    }
  };

  return (
    <>
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-24">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-[128px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 7 Columns: Solo Practice Pitch & ROI Calculator */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal/15 text-teal border border-teal/30 text-xs font-bold uppercase tracking-wider">
                  <UserCheck className="w-3.5 h-3.5 text-mint" />
                  Tailored for Independent 1–5 Provider Practices
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-jakarta text-white tracking-tight leading-[1.15]">
                  Enterprise Billing Power,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal via-mint to-emerald-400">
                    Priced for Independent Clinics
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                  You shouldn&apos;t have to choose between an expensive, turnover-prone in-house biller and a massive billing factory that ignores your accounts. Aethera assigns a <strong>dedicated US account lead</strong> to your practice with 100% transparent fee structures.
                </p>
              </div>

              {/* Key Value Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center mb-2">
                    <PiggyBank className="w-4 h-4 text-teal" />
                  </div>
                  <div className="text-xs font-bold text-white">4.5% All-Inclusive</div>
                  <div className="text-[10px] text-slate-400">Zero hidden software fees</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-mint/10 flex items-center justify-center mb-2">
                    <ShieldCheck className="w-4 h-4 text-mint" />
                  </div>
                  <div className="text-xs font-bold text-white">Zero Biller Turnover</div>
                  <div className="text-[10px] text-slate-400">Continuous coverage 365d</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                    <HeartPulse className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-xs font-bold text-white">Works In Your EHR</div>
                  <div className="text-[10px] text-slate-400">No data migration needed</div>
                </div>
              </div>

              {/* Interactive Overhead & ROI Calculator */}
              <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Scale className="w-5 h-5 text-teal" />
                    <h3 className="text-base sm:text-lg font-bold font-jakarta text-white">
                      Independent Practice Overhead &amp; Billing Savings Calculator
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Live Model
                  </span>
                </div>

                {/* Slider: Providers */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label htmlFor="provider-slider" className="text-slate-300 font-medium">
                      Number of Billing Providers (MD, DO, NP, PA):
                    </label>
                    <span className="font-mono font-bold text-teal text-base">
                      {providerCount} {providerCount === 1 ? 'Provider' : 'Providers'}
                    </span>
                  </div>
                  <input
                    id="provider-slider"
                    type="range"
                    min="1"
                    max="6"
                    step="1"
                    value={providerCount}
                    onChange={(e) => setProviderCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>1 Solo MD/NP</span>
                    <span>3 Providers</span>
                    <span>6+ Providers</span>
                  </div>
                </div>

                {/* Slider: Monthly Collections */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label htmlFor="monthly-collections-slider" className="text-slate-300 font-medium">
                      Estimated Monthly Collections:
                    </label>
                    <span className="font-mono font-bold text-mint text-base">
                      ${monthlyCollections.toLocaleString()}/mo
                    </span>
                  </div>
                  <input
                    id="monthly-collections-slider"
                    type="range"
                    min="25000"
                    max="350000"
                    step="5000"
                    value={monthlyCollections}
                    onChange={(e) => setMonthlyCollections(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-mint"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>$25,000/mo</span>
                    <span>$175,000/mo</span>
                    <span>$350,000/mo</span>
                  </div>
                </div>

                {/* Dropdown: Current Setup */}
                <div className="space-y-2">
                  <label htmlFor="current-model-select" className="text-sm text-slate-300 font-medium block">
                    Current Billing Operations Setup:
                  </label>
                  <select
                    id="current-model-select"
                    value={currentBillingModel}
                    onChange={(e) => setCurrentBillingModel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal"
                  >
                    <option value="in_house_full">1 Full-Time In-House Biller (~$72,000/yr with salary + benefits + software)</option>
                    <option value="in_house_part">1 Part-Time In-House Staff Member (~$42,000/yr with wages + clearinghouse)</option>
                    <option value="local_solo">Solo Independent Biller (7.5% typical local contract rate)</option>
                    <option value="legacy_agency">Generic Large Agency (6.5% rate + clearinghouse &amp; statement add-ons)</option>
                  </select>
                </div>

                {/* Output Comparison Grid */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">
                      Current Billing Overhead
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-slate-300">
                      ${selectedCurrent.annualCost.toLocaleString()}/yr
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      ~{selectedCurrent.overheadPct}% effective overhead cost.
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-teal mb-1">
                      Aethera (4.5% All-Inclusive)
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-teal">
                      ${aetheraAnnualFee.toLocaleString()}/yr
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Includes certified coding &amp; clearinghouse.
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-mint mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-mint" /> Net Practice Gain
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-mint">
                      +${totalAnnualBenefit.toLocaleString()}/yr
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Overhead savings + 6% clean claim lift.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Low-Friction Intake Form */}
            <div id="pilot-form" className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative">
                {status === 'success' ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-teal/20 text-teal flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h3 className="text-2xl font-bold font-jakarta text-white">
                      Practice Assessment Requested!
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Thank you, <strong className="text-white">{contactName}</strong>. Kiran and our Small Practice RCM Pod Director have received your details for <strong className="text-white">{practiceName}</strong>.
                    </p>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 mt-4 text-slate-300">
                      <div className="font-semibold text-teal flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> What Happens Next:
                      </div>
                      <p>1. We review your EHR workflow ({ehrSystem}) to ensure a 100% plug-and-play connection.</p>
                      <p>2. We prepare your practice&apos;s custom Overhead Optimization Blueprint.</p>
                      <p>3. Direct phone contact with Kiran: <a href="tel:+18135194640" className="text-teal underline font-bold">+1 (813) 519-4640</a>.</p>
                    </div>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-6 text-xs text-slate-400 hover:text-white underline transition"
                    >
                      Submit another clinic inquiry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal bg-teal/10 px-2.5 py-1 rounded-md border border-teal/20">
                        Zero-Risk 14-Day Pilot
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold font-jakarta text-white mt-2">
                        Get Your Free Small Practice RCM Audit
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Find out exactly where your cash is leaking. We test your next 50 claims completely free with zero commitment.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Honeypot */}
                      <input
                        type="text"
                        name="website_hp_solo"
                        value={hp}
                        onChange={(e) => setHp(e.target.value)}
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="solo-name" className="block text-xs font-semibold text-slate-300 mb-1">
                            Your Name *
                          </label>
                          <input
                            id="solo-name"
                            type="text"
                            required
                            placeholder="Dr. David Miller"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal placeholder:text-slate-600"
                          />
                        </div>
                        <div>
                          <label htmlFor="solo-practice" className="block text-xs font-semibold text-slate-300 mb-1">
                            Practice Name *
                          </label>
                          <input
                            id="solo-practice"
                            type="text"
                            required
                            placeholder="Miller Family Health"
                            value={practiceName}
                            onChange={(e) => setPracticeName(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="solo-email" className="block text-xs font-semibold text-slate-300 mb-1">
                            Work Email *
                          </label>
                          <input
                            id="solo-email"
                            type="email"
                            required
                            placeholder="drdavid@millerhealth.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal placeholder:text-slate-600"
                          />
                        </div>
                        <div>
                          <label htmlFor="solo-phone" className="block text-xs font-semibold text-slate-300 mb-1">
                            Direct Phone *
                          </label>
                          <input
                            id="solo-phone"
                            type="tel"
                            required
                            placeholder="(813) 555-0144"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="solo-specialty" className="block text-xs font-semibold text-slate-300 mb-1">
                            Specialty *
                          </label>
                          <select
                            id="solo-specialty"
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal"
                          >
                            <option value="Family Medicine">Family Medicine</option>
                            <option value="Internal Medicine">Internal Medicine</option>
                            <option value="Pediatrics">Pediatrics</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Dermatology">Dermatology</option>
                            <option value="Mental Health">Psychiatry &amp; Mental Health</option>
                            <option value="Pain Management">Interventional Pain Management</option>
                            <option value="Nephrology">Nephrology &amp; Dialysis</option>
                            <option value="ENT">Otolaryngology (ENT)</option>
                            <option value="Podiatry">Podiatry</option>
                            <option value="Other">Other Specialty</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="solo-ehr" className="block text-xs font-semibold text-slate-300 mb-1">
                            Current EHR *
                          </label>
                          <select
                            id="solo-ehr"
                            value={ehrSystem}
                            onChange={(e) => setEhrSystem(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-teal"
                          >
                            <option value="eClinicalWorks">eClinicalWorks</option>
                            <option value="Athenahealth">Athenahealth</option>
                            <option value="Kareo / Tebra">Kareo / Tebra</option>
                            <option value="AdvancedMD">AdvancedMD</option>
                            <option value="NextGen">NextGen Office</option>
                            <option value="ModMed">Modernizing Medicine</option>
                            <option value="Office Ally">Office Ally</option>
                            <option value="Epic">Epic</option>
                            <option value="Other">Other EHR</option>
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
                        className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal to-emerald-500 hover:from-teal/90 hover:to-emerald-600 text-white font-bold font-jakarta text-sm transition-all shadow-lg hover:shadow-teal/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {status === 'submitting' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Analyzing Practice Parameters...</span>
                          </>
                        ) : (
                          <>
                            <span>Request Free Practice Audit &amp; 50-Claim Pilot</span>
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
                        <span>Month-to-Month SLA</span>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solo Practice Comparison Section */}
      <section className="py-16 sm:py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-teal font-bold uppercase tracking-wider text-xs">
              Built Specifically for Small Clinics
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-jakarta text-white tracking-tight mt-2">
              Why Small Practices Suffer Most in Revenue Cycle
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
              When a solo practice loses their biller to illness or turnover, billing stops completely. When they outsource to large agencies, their small claims get buried under hospital-sized accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="text-rose-400 font-bold text-sm">The In-House Trap</div>
              <h3 className="text-lg font-bold text-white font-jakarta">Biller Turnover &amp; Overhead</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paying $55k–$70k+ annually for a single biller leaves your practice vulnerable. If they take vacation or quit, your cash flow pauses for 60+ days while you hire and retrain.
              </p>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/80">
                Average small clinic loses $28,000 during biller transitions.
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="text-amber-400 font-bold text-sm">The Big Agency Trap</div>
              <h3 className="text-lg font-bold text-white font-jakarta">Neglected Low-Dollar Claims</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Large billing conglomerates focus their staff on high-dollar surgical claims. Routine $150 office visit denials get written off as &apos;uncollectible&apos; rather than appealed.
              </p>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/80">
                Small practices lose 12% of allowable cash to unworked denials.
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-teal/40 space-y-4 relative">
              <div className="absolute top-4 right-4 px-2 py-0.5 rounded bg-teal/20 text-teal text-[10px] font-bold">
                The Aethera Model
              </div>
              <div className="text-teal font-bold text-sm">Dedicated Pods</div>
              <h3 className="text-lg font-bold text-white font-jakarta">Dedicated Support + 99% Clean Claims</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aethera assigns a dedicated specialty billing pod to your clinic. Every claim—large or small—passes through certified AAPC scrubbers with under 26 days in AR.
              </p>
              <div className="pt-2 text-[11px] text-mint font-semibold border-t border-slate-800/80 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 4.5% flat rate · Zero setup fees
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Call to Action */}
      <section className="py-12 bg-gradient-to-r from-teal/20 via-slate-900 to-emerald-600/20 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <h3 className="text-xl sm:text-3xl font-extrabold font-jakarta text-white">
            Take Control of Your Independent Practice Revenue
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            Speak directly with Kiran or test Aethera on 50 of your active claims with zero risk.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#pilot-form"
              className="px-6 py-3 rounded-xl bg-teal hover:bg-teal/90 text-white text-sm font-bold shadow-lg shadow-teal/20 transition cursor-pointer"
            >
              Claim Free 50-Claim Pilot
            </a>
            <a
              href="tel:+18135194640"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold border border-slate-700 flex items-center gap-2 transition"
            >
              <Phone className="w-4 h-4 text-teal" />
              <span>Call (813) 519-4640</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
