'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Loader2,
  FileCode,
  ShieldCheck,
  Calculator,
  ChevronRight,
  Info,
  Layers,
  FileText,
  DollarSign,
  Droplets,
  Calendar,
  Building,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

interface McpTierDefinition {
  ageGroup: string;
  fourPlusCode: string;
  fourPlusRate: number;
  twoThreeCode: string;
  twoThreeRate: number;
  oneVisitCode: string;
  oneVisitRate: number;
  dailyCode: string;
  dailyRate: number;
}

const MCP_TIERS: Record<string, McpTierDefinition> = {
  adult: {
    ageGroup: 'Adult (Age 20+)',
    fourPlusCode: '90960',
    fourPlusRate: 285.4,
    twoThreeCode: '90961',
    twoThreeRate: 224.7,
    oneVisitCode: '90962',
    oneVisitRate: 161.2,
    dailyCode: '90970',
    dailyRate: 9.51,
  },
  adolescent: {
    ageGroup: 'Adolescent (Ages 12–19)',
    fourPlusCode: '90957',
    fourPlusRate: 432.1,
    twoThreeCode: '90958',
    twoThreeRate: 338.5,
    oneVisitCode: '90959',
    oneVisitRate: 247.9,
    dailyCode: '90969',
    dailyRate: 14.4,
  },
  child: {
    ageGroup: 'Child (Ages 1–11)',
    fourPlusCode: '90954',
    fourPlusRate: 512.6,
    twoThreeCode: '90955',
    twoThreeRate: 398.2,
    oneVisitCode: '90956',
    oneVisitRate: 282.4,
    dailyCode: '90968',
    dailyRate: 17.08,
  },
  infant: {
    ageGroup: 'Infant (<1 Year)',
    fourPlusCode: '90951',
    fourPlusRate: 641.8,
    twoThreeCode: '90952',
    twoThreeRate: 496.3,
    oneVisitCode: '90953',
    oneVisitRate: 351.7,
    dailyCode: '90967',
    dailyRate: 21.39,
  },
};

export default function DialysisMcpCalculator() {
  // Input State
  const [selectedAge, setSelectedAge] = useState<string>('adult');
  const [dialysisSetting, setDialysisSetting] = useState<'center' | 'home'>('center');
  const [visitFrequency, setVisitFrequency] = useState<'4_plus' | '2_to_3' | '1_visit'>('4_plus');
  const [hospitalDays, setHospitalDays] = useState<number>(0);
  const [patientCensus, setPatientCensus] = useState<number>(85);
  const [downcodeRiskPct, setDowncodeRiskPct] = useState<number>(18);

  // Form State
  const [contactName, setContactName] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEdi, setCopiedEdi] = useState(false);

  const activeTier = MCP_TIERS[selectedAge] || MCP_TIERS.adult;

  // Monthly Reimbursement Calculation under CMS Chapter 8 § 140
  const calculationResults = useMemo(() => {
    let assignedCpt = '';
    let perPatientMonthlyAllowable = 0;
    let isDailyProRated = false;
    let billableUnits = 1;

    // Check if patient was hospitalized during the month
    if (hospitalDays > 0) {
      isDailyProRated = true;
      const outpatientDays = Math.max(1, 30 - hospitalDays);
      assignedCpt = activeTier.dailyCode;
      billableUnits = outpatientDays;
      perPatientMonthlyAllowable = Math.round(outpatientDays * activeTier.dailyRate * 100) / 100;
    } else if (dialysisSetting === 'home') {
      assignedCpt = selectedAge === 'adult' ? '90966' : activeTier.fourPlusCode;
      perPatientMonthlyAllowable = selectedAge === 'adult' ? 238.1 : activeTier.fourPlusRate;
      billableUnits = 1;
    } else {
      if (visitFrequency === '4_plus') {
        assignedCpt = activeTier.fourPlusCode;
        perPatientMonthlyAllowable = activeTier.fourPlusRate;
      } else if (visitFrequency === '2_to_3') {
        assignedCpt = activeTier.twoThreeCode;
        perPatientMonthlyAllowable = activeTier.twoThreeRate;
      } else {
        assignedCpt = activeTier.oneVisitCode;
        perPatientMonthlyAllowable = activeTier.oneVisitRate;
      }
    }

    // Practice Annual Census Modeling
    const practiceMonthlyRevenue = patientCensus * perPatientMonthlyAllowable;
    const practiceAnnualRevenue = practiceMonthlyRevenue * 12;

    // Downcoding loss model: patient had 4+ visits, but billed as 1 visit due to missing F2F notes
    const deltaPerCase = Math.max(0, activeTier.fourPlusRate - activeTier.oneVisitRate);
    const downcodedPatientsPerMonth = Math.round(patientCensus * (downcodeRiskPct / 100));
    const annualDowncodeLoss = downcodedPatientsPerMonth * deltaPerCase * 12;
    const netRecoverableRevenue = Math.round(annualDowncodeLoss * 0.92);

    return {
      assignedCpt,
      billableUnits,
      perPatientMonthlyAllowable,
      isDailyProRated,
      practiceMonthlyRevenue,
      practiceAnnualRevenue,
      annualDowncodeLoss,
      netRecoverableRevenue,
    };
  }, [selectedAge, dialysisSetting, visitFrequency, hospitalDays, patientCensus, downcodeRiskPct, activeTier]);

  // ANSI X12 837P EDI Simulation
  const simulatedEdi = useMemo(() => {
    const lines = [
      'ISA*00*          *00*          *ZZ*NEPHROLOGY-EDI *ZZ*MEDICARE-MAC   *260905*1230*^*00501*000000004*0*P*:~',
      'GS*HC*NEPHROLOGY-EDI*MEDICARE-MAC*20260905*1230*1*X*005010X222A1~',
      'ST*837*0004*005010X222A1~',
      'BHT*0019*00*20260905004*20260905*1230*CH~',
      'NM1*85*2*METROPOLITAN NEPHROLOGY GROUP*****XX*1629104928~',
      'CLM*MCP-CLAIM-772*' + calculationResults.perPatientMonthlyAllowable.toFixed(2) + '***65:B:1*Y*A*Y*Y~',
      '// LOOP 2400: MONTHLY CAPITATION PAYMENT (MCP) SERVICE LINE',
      'LX*1~',
    ];

    if (calculationResults.isDailyProRated) {
      lines.push(
        `SV1*HC:${calculationResults.assignedCpt}*${calculationResults.perPatientMonthlyAllowable.toFixed(2)}*UN*${calculationResults.billableUnits}~`,
        'DTP*472*RD8*20260901-202609' + String(calculationResults.billableUnits).padStart(2, '0') + '~',
        '// CMS § 140 PRO-RATION: HOSPITAL INPATIENT DAYS DEDUCTED FROM MCP RATE'
      );
    } else {
      lines.push(
        `SV1*HC:${calculationResults.assignedCpt}*${calculationResults.perPatientMonthlyAllowable.toFixed(2)}*UN*1~`,
        'DTP*472*RD8*20260901-20260930~',
        '// FULL MONTH COMPREHENSIVE OUTPATIENT ESRD MANAGEMENT'
      );
    }

    lines.push('SE*14*0004~', 'GE*1*1~', 'IEA*1*000000004~');
    return lines.join('\n');
  }, [calculationResults]);

  const handleCopyEdi = () => {
    navigator.clipboard.writeText(simulatedEdi);
    setCopiedEdi(true);
    setTimeout(() => setCopiedEdi(false), 2500);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: contactName,
        email,
        phone,
        practice: practiceName,
        service: 'Nephrology ESRD & Dialysis MCP Audit',
        notes: `[Tool: Dialysis MCP Calculator] Age: ${activeTier.ageGroup} | Setting: ${dialysisSetting} | F2F Visits: ${visitFrequency} | Hospital Days: ${hospitalDays} | Census: ${patientCensus} | Code: ${calculationResults.assignedCpt} | Downcode Risk: ${downcodeRiskPct}% | Est Recaptured: $${calculationResults.netRecoverableRevenue.toLocaleString()}`,
        source: 'Tool: /tools/dialysis-mcp-calculator',
      };

      const ok = await sendLeadToKiran('dialysis_mcp_calculator_inquiry', payload);
      if (ok) {
        trackConversion('calculator');
        setSubmitted(true);
      }
    } catch {
      // Graceful fallback
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Parameter Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Controls */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">ESRD Monthly Capitation Payment (MCP) Engine</h2>
              <p className="text-xs text-slate-400">CMS Claims Processing Manual Chapter 8 § 140 &amp; 42 CFR § 414.314</p>
            </div>
          </div>

          {/* Age Cohort & Setting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Patient Age Cohort
              </label>
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                <option value="adult">Adult (Age 20+)</option>
                <option value="adolescent">Adolescent (Ages 12–19)</option>
                <option value="child">Child (Ages 1–11)</option>
                <option value="infant">Infant (&lt;1 Year)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Dialysis Setting
              </label>
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDialysisSetting('center')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    dialysisSetting === 'center'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  In-Center Hemodialysis
                </button>
                <button
                  type="button"
                  onClick={() => setDialysisSetting('home')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    dialysisSetting === 'home'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Home / PD (90966)
                </button>
              </div>
            </div>
          </div>

          {/* Face to Face Frequency (If Center) */}
          {dialysisSetting === 'center' && hospitalDays === 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Documented Face-to-Face Physician Visits
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setVisitFrequency('4_plus')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    visitFrequency === '4_plus'
                      ? 'bg-teal-950/80 border-teal-500 text-teal-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-bold">4+ Visits / mo</div>
                  <div className="text-[11px] font-mono mt-1 text-slate-400">
                    CPT {activeTier.fourPlusCode} (${activeTier.fourPlusRate})
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisitFrequency('2_to_3')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    visitFrequency === '2_to_3'
                      ? 'bg-teal-950/80 border-teal-500 text-teal-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-bold">2–3 Visits / mo</div>
                  <div className="text-[11px] font-mono mt-1 text-slate-400">
                    CPT {activeTier.twoThreeCode} (${activeTier.twoThreeRate})
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisitFrequency('1_visit')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    visitFrequency === '1_visit'
                      ? 'bg-teal-950/80 border-teal-500 text-teal-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-bold">1 Visit / mo</div>
                  <div className="text-[11px] font-mono mt-1 text-slate-400">
                    CPT {activeTier.oneVisitCode} (${activeTier.oneVisitRate})
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Hospitalization Deduction Slider */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <span>Inpatient Hospitalization Days in Month</span>
              <span className={`font-mono font-bold ${hospitalDays > 0 ? 'text-amber-400' : 'text-teal-400'}`}>
                {hospitalDays} days hospitalized
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={hospitalDays}
              onChange={(e) => setHospitalDays(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            {hospitalDays > 0 ? (
              <div className="p-3 bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs rounded-lg mt-2 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  CMS PRO-RATION MANDATE: Patient was hospitalized for {hospitalDays} days. Medicare prohibits full MCP monthly codes when inpatient care (99221–99233) is billed. Automatically switched to daily pro-ration code <strong className="font-mono">{activeTier.dailyCode}</strong> for {30 - hospitalDays} outpatient days.
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Zero inpatient days: Full comprehensive monthly MCP allowable applies.
              </p>
            )}
          </div>

          {/* Practice Census & Leakage Model */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                <span>Active Dialysis Census</span>
                <span className="text-teal-400 font-mono font-bold">{patientCensus} patients</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={patientCensus}
                onChange={(e) => setPatientCensus(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                <span>Downcoding Leakage Risk</span>
                <span className="text-rose-400 font-mono font-bold">{downcodeRiskPct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={downcodeRiskPct}
                onChange={(e) => setDowncodeRiskPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Reimbursement Verdict & Practice ROI */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                MCP Fee Schedule Results
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-950 text-teal-300 border border-teal-800/50">
                POS 65 / 12
              </span>
            </div>

            {/* Individual Encounter Totals */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Assigned Billing Code:</span>
                <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                  CPT {calculationResults.assignedCpt}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">
                  {calculationResults.isDailyProRated
                    ? `Pro-Rated Allowable (${calculationResults.billableUnits} days):`
                    : 'Monthly Allowable per Patient:'}
                </span>
                <span className="font-mono font-bold text-teal-400 text-lg">
                  ${calculationResults.perPatientMonthlyAllowable.toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Total Monthly Census Revenue:</span>
                  <span className="font-mono font-bold text-white">
                    ${calculationResults.practiceMonthlyRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Annualized MCP Collections:</span>
                  <span className="font-mono font-bold text-white">
                    ${calculationResults.practiceAnnualRevenue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Downcoding Recoupment Callout */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Annual Downcoding Revenue Loss:</span>
                </div>
                <div className="text-2xl font-black font-mono text-rose-400">
                  -${calculationResults.annualDowncodeLoss.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Occurs when physicians complete 4+ rounds but clinic billing defaults to CPT 90962 due to lack of distinct face-to-face physician attestations.
                </p>
                <div className="pt-2 border-t border-slate-900 flex justify-between text-xs">
                  <span className="text-slate-300">Aethera Recaptured Cash:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    +${calculationResults.netRecoverableRevenue.toLocaleString()}/yr
                  </span>
                </div>
              </div>
            </div>

            <a
              href="#nephro-audit"
              className="w-full inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-3 rounded-lg text-sm transition-all shadow-lg hover:shadow-teal-500/20"
            >
              <span>Request Nephrology MCP Audit</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ANSI X12 837P EDI Inspector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ANSI X12 837P Professional Nephrology Claim Segment</h3>
              <p className="text-xs text-slate-400">Electronic Loop 2400 SV1 with Monthly Date Span &amp; Place of Service 65</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyEdi}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
          >
            {copiedEdi ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-400" />
                <span>Copied EDI</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy 837P Segment</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-teal-300/90 overflow-x-auto whitespace-pre leading-relaxed">
          {simulatedEdi}
        </div>
      </div>

      {/* Lead Capture Form */}
      <section id="nephro-audit" className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white">Request Nephrology &amp; Dialysis RCM Audit</h3>
          <p className="text-xs text-slate-400 mt-1">
            Capture full 4+ visit MCP allowances, prevent hospital overlap recoupments, and streamline home dialysis billing.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-xl bg-teal-950/80 border border-teal-500/40 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-teal-400 mx-auto" />
            <div className="text-base font-bold text-white">Nephrology Audit Request Received</div>
            <p className="text-xs text-slate-300">
              Our Nephrology Billing Director will contact you within 4 business hours to analyze your dialysis census and MCP remits.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLeadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Dr. Jennifer Adams"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nephrology Practice Name *</label>
                <input
                  type="text"
                  required
                  value={practiceName}
                  onChange={(e) => setPracticeName(e.target.value)}
                  placeholder="e.g. Kidney Care Associates"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jadams@kidneycare.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold py-3 px-6 rounded-lg text-sm transition-all shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing MCP Census...</span>
                </>
              ) : (
                <>
                  <span>Submit Nephrology MCP Review</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
