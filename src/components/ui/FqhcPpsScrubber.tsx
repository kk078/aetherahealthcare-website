'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
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
  Activity,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

interface GafLocation {
  id: string;
  name: string;
  gaf: number;
}

const GAF_LOCATIONS: GafLocation[] = [
  { id: 'national', name: 'National Baseline (GAF 1.000)', gaf: 1.0 },
  { id: 'ca_sf', name: 'California - San Francisco / Bay Area (GAF 1.341)', gaf: 1.341 },
  { id: 'ca_la', name: 'California - Los Angeles / Long Beach (GAF 1.192)', gaf: 1.192 },
  { id: 'ny_nyc', name: 'New York - NYC Metropolitan Area (GAF 1.258)', gaf: 1.258 },
  { id: 'fl_miami', name: 'Florida - Miami / Fort Lauderdale (GAF 1.054)', gaf: 1.054 },
  { id: 'tx_dallas', name: 'Texas - Dallas / Fort Worth (GAF 1.018)', gaf: 1.018 },
  { id: 'il_chicago', name: 'Illinois - Chicago Metropolitan (GAF 1.082)', gaf: 1.082 },
  { id: 'rural_south', name: 'Rural Non-Metropolitan South / Midwest (GAF 0.884)', gaf: 0.884 },
];

interface EncounterPreset {
  id: string;
  code: string;
  type: 'medical' | 'mental_health' | 'preventive' | 'care_management';
  label: string;
  revCode: string;
  isNewPatientAdjustment: boolean;
  baseModifier?: string;
}

const ENCOUNTER_PRESETS: EncounterPreset[] = [
  {
    id: 'g0467',
    code: 'G0467',
    type: 'medical',
    label: 'G0467 - FQHC Visit, Established Medical Patient (Standard)',
    revCode: '0521',
    isNewPatientAdjustment: false,
  },
  {
    id: 'g0466',
    code: 'G0466',
    type: 'medical',
    label: 'G0466 - FQHC Visit, New Medical Patient (+34.16% Bump)',
    revCode: '0521',
    isNewPatientAdjustment: true,
  },
  {
    id: 'g0468',
    code: 'G0468',
    type: 'preventive',
    label: 'G0468 - FQHC Visit, IPPE / AWV (+34.16% Bump, Deductible Waived)',
    revCode: '0521',
    isNewPatientAdjustment: true,
  },
  {
    id: 'g0470',
    code: 'G0470',
    type: 'mental_health',
    label: 'G0470 - FQHC Visit, Established Mental Health Patient',
    revCode: '0900',
    isNewPatientAdjustment: false,
  },
  {
    id: 'g0469',
    code: 'G0469',
    type: 'mental_health',
    label: 'G0469 - FQHC Visit, New Mental Health Patient (+34.16% Bump)',
    revCode: '0900',
    isNewPatientAdjustment: true,
  },
  {
    id: 'g0511',
    code: 'G0511',
    type: 'care_management',
    label: 'G0511 - General Care Management (CCM / BHI / PCM - $77.94 Flat Rate)',
    revCode: '0521',
    isNewPatientAdjustment: false,
  },
];

export default function FqhcPpsScrubber() {
  // Config state
  const [selectedGaf, setSelectedGaf] = useState<string>('national');
  const [primaryEncId, setPrimaryEncId] = useState<string>('g0467');
  const [hasSameDaySecondary, setHasSameDaySecondary] = useState<boolean>(true);
  const [secondaryType, setSecondaryType] = useState<'mental_health' | 'subsequent_injury' | 'same_illness'>('mental_health');
  const [secondaryEncId, setSecondaryEncId] = useState<string>('g0470');
  const [mcoPaidAmount, setMcoPaidAmount] = useState<number>(85);
  const [slidingFeeTier, setSlidingFeeTier] = useState<string>('tier_nominal');

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [centerName, setCenterName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEdi, setCopiedEdi] = useState(false);

  // Constants
  const CMS_PPS_BASE_2026 = 195.65;
  const NEW_PATIENT_ADJUSTMENT = 1.3416; // +34.16%
  const G0511_FLAT_RATE = 77.94;

  const activeGafObj = GAF_LOCATIONS.find((g) => g.id === selectedGaf) || GAF_LOCATIONS[0];
  const primaryPreset = ENCOUNTER_PRESETS.find((p) => p.id === primaryEncId) || ENCOUNTER_PRESETS[0];
  const secondaryPreset = ENCOUNTER_PRESETS.find((p) => p.id === secondaryEncId) || ENCOUNTER_PRESETS[3];

  // Calculate Primary Rate
  const primaryRate = useMemo(() => {
    if (primaryPreset.code === 'G0511') return G0511_FLAT_RATE;
    let rate = CMS_PPS_BASE_2026 * activeGafObj.gaf;
    if (primaryPreset.isNewPatientAdjustment) {
      rate *= NEW_PATIENT_ADJUSTMENT;
    }
    return Math.round(rate * 100) / 100;
  }, [primaryPreset, activeGafObj]);

  // Calculate Secondary Rate & Compliance
  const secondaryAnalysis = useMemo(() => {
    if (!hasSameDaySecondary) {
      return {
        isPayable: false,
        rate: 0,
        modifier: '',
        explanation: 'Single encounter billing on this date of service.',
        status: 'valid_single',
      };
    }

    if (secondaryType === 'same_illness') {
      return {
        isPayable: false,
        rate: 0,
        modifier: 'UNBILLABLE',
        explanation:
          'DENIED under CMS Single Daily Encounter Limit (CARC 97). Second medical visit for same diagnosis cannot be billed as separate PPS payment.',
        status: 'denied',
      };
    }

    if (secondaryType === 'subsequent_injury') {
      let secRate = CMS_PPS_BASE_2026 * activeGafObj.gaf;
      return {
        isPayable: true,
        rate: Math.round(secRate * 100) / 100,
        modifier: '59 (Distinct Service / Subsequent Episode)',
        explanation:
          'QUALIFIED for second PPS payment. Patient suffered subsequent illness or injury after departing clinic. Requires distinct documentation of encounter time.',
        status: 'qualified_exception',
      };
    }

    // Mental health + medical same-day exception
    let secRate = CMS_PPS_BASE_2026 * activeGafObj.gaf;
    if (secondaryPreset.isNewPatientAdjustment) {
      secRate *= NEW_PATIENT_ADJUSTMENT;
    }
    return {
      isPayable: true,
      rate: Math.round(secRate * 100) / 100,
      modifier: '59 or XE (Separate Revenue Line 0900)',
      explanation:
        'QUALIFIED for dual PPS encounter reimbursement under 42 CFR § 405.2463(b). Medical (0521) and Mental Health (0900) services delivered on same date are statutory exceptions.',
      status: 'qualified_statutory',
    };
  }, [hasSameDaySecondary, secondaryType, secondaryPreset, activeGafObj]);

  const totalAllowable = primaryRate + (secondaryAnalysis.isPayable ? secondaryAnalysis.rate : 0);
  const estimatedMedicaidWrap = Math.max(0, Math.round((totalAllowable - mcoPaidAmount) * 100) / 100);

  // Generate UB-04 / 837I Simulation
  const simulatedEdi = useMemo(() => {
    const lines = [
      'ISA*00*          *00*          *ZZ*SUBMITTER      *ZZ*CMS-MAC        *260905*1030*^*00501*000000001*0*P*:~',
      'GS*HC*SUBMITTER*RECEIVER*20260905*1030*1*X*005010X223A2~',
      'ST*837*0001*005010X223A2~',
      'BHT*0010*00*20260905001*20260905*1030*CH~',
      'NM1*41*2*VALLEY COMMUNITY HEALTH CENTER*****XX*1992837461~',
      'CLM*FQHC-CLAIM-001*' + totalAllowable.toFixed(2) + '***771:A:1*Y*A*Y*Y~',
      '// LINE 1: PRIMARY PPS QUALIFYING ENCOUNTER',
      `LX*1~`,
      `SV2*${primaryPreset.revCode}*HC:${primaryPreset.code}*${primaryRate.toFixed(2)}*UN*1~`,
      `DTP*472*D8*20260905~`,
    ];

    if (hasSameDaySecondary && secondaryAnalysis.isPayable) {
      const secHcpcs = secondaryType === 'mental_health' ? secondaryPreset.code : 'G0467';
      const secRev = secondaryType === 'mental_health' ? '0900' : '0521';
      lines.push(
        '// LINE 2: SECONDARY SAME-DAY STATUTORY EXCEPTION ENCOUNTER',
        'LX*2~',
        `SV2*${secRev}*HC:${secHcpcs}:59*${secondaryAnalysis.rate.toFixed(2)}*UN*1~`,
        `DTP*472*D8*20260905~`,
        '// CMS EXCEPTION ATTESTATION: SAME-DAY MEDICAL + MENTAL HEALTH SPLIT'
      );
    }

    lines.push('SE*14*0001~', 'GE*1*1~', 'IEA*1*000000001~');
    return lines.join('\n');
  }, [totalAllowable, primaryPreset, primaryRate, hasSameDaySecondary, secondaryAnalysis, secondaryType, secondaryPreset]);

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
        practice: centerName,
        service: 'FQHC PPS Encounter Scrubber & Wrap Audit',
        notes: `[Tool: FQHC PPS Scrubber] GAF: ${activeGafObj.name} | Primary: ${primaryPreset.code} ($${primaryRate}) | Secondary: ${hasSameDaySecondary ? secondaryType : 'None'} | Total PPS: $${totalAllowable} | MCO Paid: $${mcoPaidAmount} | Est Wrap: $${estimatedMedicaidWrap} | SFS Tier: ${slidingFeeTier}`,
        source: 'Tool: /tools/fqhc-pps-scrubber',
      };

      const ok = await sendLeadToKiran('fqhc_pps_scrubber_inquiry', payload);
      if (ok) {
        trackConversion('assessment');
        setSubmitted(true);
      }
    } catch {
      // Fallback grace
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Parameters */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">FQHC Prospective Payment System Configuration</h2>
              <p className="text-xs text-slate-400">CMS-1450 (UB-04) Bill Type 771 Encounter Parameters</p>
            </div>
          </div>

          {/* GAF Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Geographic Adjustment Factor (GAF) Location
            </label>
            <select
              value={selectedGaf}
              onChange={(e) => setSelectedGaf(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {GAF_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              CMS CY 2025/2026 Base Rate: <span className="text-white font-medium">$195.65</span> × GAF ({activeGafObj.gaf.toFixed(3)})
            </p>
          </div>

          {/* Primary Encounter Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Primary Qualifying Encounter Code
            </label>
            <select
              value={primaryEncId}
              onChange={(e) => setPrimaryEncId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {ENCOUNTER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                UB-04 Rev Code: {primaryPreset.revCode}
              </span>
              {primaryPreset.isNewPatientAdjustment && (
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/40">
                  +34.16% New Patient Bump
                </span>
              )}
            </div>
          </div>

          {/* Same-Day Secondary Encounter Toggle */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white">Same-Day Secondary Encounter</span>
                <p className="text-xs text-slate-400">Did the patient receive a second distinct service on the same date?</p>
              </div>
              <button
                type="button"
                onClick={() => setHasSameDaySecondary(!hasSameDaySecondary)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  hasSameDaySecondary ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    hasSameDaySecondary ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {hasSameDaySecondary && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Secondary Encounter Scenario
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSecondaryType('mental_health')}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all border ${
                        secondaryType === 'mental_health'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Mental Health + Medical (Statutory)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSecondaryType('subsequent_injury')}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all border ${
                        secondaryType === 'subsequent_injury'
                          ? 'bg-teal-950/80 text-teal-300 border-teal-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Subsequent Illness / Injury
                    </button>
                    <button
                      type="button"
                      onClick={() => setSecondaryType('same_illness')}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all border ${
                        secondaryType === 'same_illness'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Same Medical Condition
                    </button>
                  </div>
                </div>

                {secondaryType === 'mental_health' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Secondary Mental Health Code
                    </label>
                    <select
                      value={secondaryEncId}
                      onChange={(e) => setSecondaryEncId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="g0470">G0470 - FQHC Visit, Established Mental Health (Rev Code 0900)</option>
                      <option value="g0469">G0469 - FQHC Visit, New Mental Health (+34.16% Bump, Rev Code 0900)</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Medicaid Wrap Calculator Inputs */}
          <div className="pt-2 border-t border-slate-800/80 space-y-4">
            <span className="text-sm font-bold text-white block">Medicaid MCO Wrap-Around Reconciliation</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Medicaid MCO Paid Amount ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    step="1"
                    value={mcoPaidAmount}
                    onChange={(e) => setMcoPaidAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Typical fee-for-service / capitation rate paid by MCO</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sliding Fee Discount Tier
                </label>
                <select
                  value={slidingFeeTier}
                  onChange={(e) => setSlidingFeeTier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="tier_nominal">≤100% FPL (Nominal Charge: $15–$25)</option>
                  <option value="tier_2">101%–150% FPL (Tier 2 Discount)</option>
                  <option value="tier_3">151%–200% FPL (Tier 3 Discount)</option>
                  <option value="tier_full">&gt;200% FPL (Full Fee Schedule)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">42 U.S.C. § 254b(k)(3)(G) SFDS Compliance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: Audit Summary & Financial Analysis */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Reimbursement Scrubber Results
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                CMS-1450 Bill 771
              </span>
            </div>

            {/* Financial Totals */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Primary Encounter ({primaryPreset.code}):</span>
                <span className="font-mono font-bold text-white">${primaryRate.toFixed(2)}</span>
              </div>

              {hasSameDaySecondary && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">
                    Secondary Encounter ({secondaryType === 'mental_health' ? secondaryPreset.code : 'Medical'}):
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      secondaryAnalysis.isPayable ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {secondaryAnalysis.isPayable ? `+$${secondaryAnalysis.rate.toFixed(2)}` : '$0.00 (Denied)'}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-white">Total Gross PPS Allowable:</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ${totalAllowable.toFixed(2)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>MCO Paid Amount:</span>
                  <span className="font-mono text-slate-300">-${mcoPaidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-cyan-400 pt-1 border-t border-slate-900">
                  <span>Supplemental Medicaid Wrap:</span>
                  <span className="font-mono">+${estimatedMedicaidWrap.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Compliance Status Callout */}
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                secondaryAnalysis.status === 'denied'
                  ? 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                {secondaryAnalysis.status === 'denied' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Single Encounter Restriction</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Qualifying Encounter Validation Passed</span>
                  </>
                )}
              </div>
              <p className="text-slate-300">{secondaryAnalysis.explanation}</p>
              {secondaryAnalysis.modifier && (
                <div className="font-mono text-[11px] text-white pt-1">
                  Required Modifier: <span className="text-emerald-400">{secondaryAnalysis.modifier}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <a
              href="#report-inquiry"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-3 rounded-lg text-sm transition-all shadow-lg hover:shadow-emerald-500/20"
            >
              <span>Get Full FQHC / RHC Revenue Audit</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ANSI X12 837I Electronic UB-04 EDI Inspector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ANSI X12 837I / UB-04 EDI Segment Mapping</h3>
              <p className="text-xs text-slate-400">Institutional Type of Bill 771 Revenue Code Lines</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyEdi}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
          >
            {copiedEdi ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied EDI</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy 837I Snippet</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300/90 overflow-x-auto whitespace-pre leading-relaxed">
          {simulatedEdi}
        </div>
      </div>

      {/* Conversion Inquiry Form */}
      <section id="report-inquiry" className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white">Request Official FQHC / RHC Revenue Scrubber Review</h3>
          <p className="text-xs text-slate-400 mt-1">
            Have our community health RCM team run 30 days of claims through our deep PPS validation engine.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="text-base font-bold text-white">Audit Request Received</div>
            <p className="text-xs text-slate-300">
              Our FQHC RCM Director will contact you within 4 business hours to analyze your PPS and wrap reconciliation needs.
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
                  placeholder="e.g. Maria Gonzalez"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Health Center / Clinic Name *</label>
                <input
                  type="text"
                  required
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  placeholder="e.g. Esperanza Community Health"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
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
                  placeholder="mgonzalez@esperanzahealth.org"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3 px-6 rounded-lg text-sm transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <>
                  <span>Submit FQHC Scrubber Review</span>
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
