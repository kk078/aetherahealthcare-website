'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Send,
  Loader2,
  FileCode,
  Sparkles,
  Info,
  MapPin,
  Building2,
  Stethoscope,
  Activity,
  Award,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

interface EquipmentCategory {
  id: string;
  name: string;
  hcpcs: string;
  description: string;
  priorAuthRequired: boolean;
  defaultModifiers: string[];
  clinicalBenchmark: string;
}

const DME_CATEGORIES: EquipmentCategory[] = [
  {
    id: 'oxygen',
    name: 'Home Oxygen Therapy & Concentrators',
    hcpcs: 'E1390, E0431',
    description: 'Stationary and portable oxygen delivery for severe chronic hypoxemia.',
    priorAuthRequired: false,
    defaultModifiers: ['QA', 'KX'],
    clinicalBenchmark: 'Resting SpO2 <= 88% or PaO2 <= 55 mmHg on room air within 30 days prior to order.',
  },
  {
    id: 'cpap',
    name: 'CPAP / BiPAP for Obstructive Sleep Apnea',
    hcpcs: 'E0601, E0470',
    description: 'Positive airway pressure device for adult OSA therapy.',
    priorAuthRequired: false,
    defaultModifiers: ['KX', 'NU'],
    clinicalBenchmark: 'Diagnostic PSG/HSAT with AHI/RDI >= 15, or 5-14 with documented co-morbidities. 90-day adherence >= 4 hrs/night on 70% of nights.',
  },
  {
    id: 'power_mobility',
    name: 'Power Wheelchairs (Group 2 & Group 3)',
    hcpcs: 'K0823, K0848',
    description: 'Complex rehabilitation power mobility devices.',
    priorAuthRequired: true,
    defaultModifiers: ['KX', 'RR'],
    clinicalBenchmark: 'In-person F2F mobility exam, PT/OT specialty evaluation, and home environment accessibility assessment.',
  },
  {
    id: 'cgm',
    name: 'Continuous Glucose Monitors (CGM)',
    hcpcs: 'E2103, A4239',
    description: 'Therapeutic continuous glucose monitoring devices and monthly supply packages.',
    priorAuthRequired: false,
    defaultModifiers: ['KX', 'KF'],
    clinicalBenchmark: 'Treated with insulin OR documented history of problematic recurring/severe hypoglycemia. F2F visit within 6 months.',
  },
  {
    id: 'spinal_orthotics',
    name: 'Spinal Orthoses (TLSO / LSO Braces)',
    hcpcs: 'L0637, L0650',
    description: 'Custom fitted and prefabricated rigid spinal support orthoses.',
    priorAuthRequired: true,
    defaultModifiers: ['CG', 'KX'],
    clinicalBenchmark: 'Prescribing physician clinical notes substantiating acute spinal pathology, fracture, or surgical stabilization.',
  },
];

const JURISDICTIONS: Record<string, { mac: string; contractor: string; states: string[]; payerId: string }> = {
  A: {
    mac: 'DME MAC Jurisdiction A',
    contractor: 'Noridian Healthcare Solutions',
    states: ['CT', 'MA', 'ME', 'NH', 'NY', 'RI', 'VT'],
    payerId: '16013',
  },
  B: {
    mac: 'DME MAC Jurisdiction B',
    contractor: 'CGS Administrators, LLC',
    states: ['IL', 'IN', 'KY', 'MI', 'MN', 'OH', 'WI'],
    payerId: '17013',
  },
  C: {
    mac: 'DME MAC Jurisdiction C',
    contractor: 'CGS Administrators, LLC',
    states: ['AL', 'AR', 'CO', 'FL', 'GA', 'LA', 'MS', 'NC', 'NM', 'OK', 'SC', 'TN', 'TX', 'VA', 'WV', 'PR', 'VI'],
    payerId: '18011',
  },
  D: {
    mac: 'DME MAC Jurisdiction D',
    contractor: 'Noridian Healthcare Solutions',
    states: ['AK', 'AZ', 'CA', 'HI', 'ID', 'IA', 'KS', 'MO', 'MT', 'ND', 'NE', 'NV', 'OR', 'SD', 'UT', 'WA', 'WY'],
    payerId: '19003',
  },
};

const ALL_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY',
  'LA', 'ME', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
  'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function DmeposValidator() {
  // Config state
  const [selectedCategory, setSelectedCategory] = useState<string>('cpap');
  const [selectedState, setSelectedState] = useState<string>('TX');

  // Checkpoints
  const [hasSwo, setHasSwo] = useState<boolean>(true);
  const [hasF2F, setHasF2F] = useState<boolean>(true);
  const [meetsTestingCriteria, setMeetsTestingCriteria] = useState<boolean>(true);
  const [hasComplianceData, setHasComplianceData] = useState<boolean>(true);
  const [hasPriorAuthApproved, setHasPriorAuthApproved] = useState<boolean>(true);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Audit form state
  const [supplierName, setSupplierName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyVolume, setMonthlyVolume] = useState('$50,000 - $250,000 / mo');
  const [notes, setNotes] = useState('');
  const [hp, setHp] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  // Determine Jurisdiction based on state
  const jurisdictionInfo = useMemo(() => {
    for (const [key, val] of Object.entries(JURISDICTIONS)) {
      if (val.states.includes(selectedState)) {
        return { key, ...val };
      }
    }
    return { key: 'C', ...JURISDICTIONS.C };
  }, [selectedState]);

  const activeCategory = useMemo(() => {
    return DME_CATEGORIES.find((c) => c.id === selectedCategory) || DME_CATEGORIES[0];
  }, [selectedCategory]);

  // Validation Logic
  const validationResult = useMemo(() => {
    const issues: string[] = [];
    const recommendedModifiers = [...activeCategory.defaultModifiers];

    if (!hasSwo) {
      issues.push('Missing Standard Written Order (SWO) prior to delivery. Claim will be denied under statutory non-coverage.');
    }

    if (!hasF2F) {
      issues.push('No in-person Face-to-Face examination on file within 6 months prior to the order date.');
    }

    if (!meetsTestingCriteria) {
      issues.push(`Clinical diagnostic thresholds not met: ${activeCategory.clinicalBenchmark}`);
    }

    if (activeCategory.id === 'cpap' && !hasComplianceData) {
      issues.push('CPAP 90-day adherence failure: Lacks documentation of >= 4 hrs/night usage on 70% of nights within 30 consecutive days.');
    }

    if (activeCategory.priorAuthRequired && !hasPriorAuthApproved) {
      issues.push('Item is on CMS DMEPOS Prior Authorization Master List, but affirmative Prior Auth decision has not been received.');
    }

    // Determine status
    let status: 'clean' | 'warning' | 'error' = 'clean';
    let statusTitle = 'Clean DMEPOS Claim Ready for Submission';
    let advice = 'All CMS National Coverage Determinations (NCD) and Local Coverage Determinations (LCD) criteria are satisfied.';

    if (!hasSwo || (!hasPriorAuthApproved && activeCategory.priorAuthRequired)) {
      status = 'error';
      statusTitle = 'CRITICAL DEFECT — High Audit Recoupment Risk';
      advice = 'Do NOT submit this claim. A missing Standard Written Order or lack of required Prior Authorization results in hard claim rejection and potential False Claims Act liability.';
    } else if (issues.length > 0) {
      status = 'warning';
      statusTitle = 'Documentation Gaps Detected — Potential Post-Payment Audit Risk';
      advice = 'Claim may pass initial clearinghouse edits, but will fail a CERT or UPIC post-payment audit without missing medical records.';
    }

    // If clinical policy met, ensure KX modifier is included
    if (meetsTestingCriteria && hasSwo && hasF2F) {
      if (!recommendedModifiers.includes('KX')) {
        recommendedModifiers.push('KX');
      }
    } else {
      // If not met, replace KX with EY or GA
      const filtered = recommendedModifiers.filter((m) => m !== 'KX');
      filtered.push('GA'); // ABN on file
      recommendedModifiers.length = 0;
      recommendedModifiers.push(...filtered);
    }

    const primaryHcpcs = activeCategory.hcpcs.split(',')[0].trim();
    const modifierStr = recommendedModifiers.join(':');
    const sv1Snippet = `SV1*HC:${primaryHcpcs}:${modifierStr}:350.00:UN:1***1:2~`;

    return {
      status,
      statusTitle,
      advice,
      issues,
      recommendedModifiers,
      sv1Snippet,
      primaryHcpcs,
    };
  }, [activeCategory, hasSwo, hasF2F, meetsTestingCriteria, hasComplianceData, hasPriorAuthApproved]);

  const copyCode = () => {
    navigator.clipboard.writeText(validationResult.sv1Snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) {
      setFormStatus('success');
      return;
    }
    setFormStatus('submitting');
    setFormError('');

    try {
      const ok = await sendLeadToKiran('dmepos_audit_inquiry', {
        supplierName,
        contactName,
        email,
        phone,
        monthlyVolume,
        notes,
        equipmentCategory: activeCategory.name,
        state: selectedState,
        jurisdiction: jurisdictionInfo.mac,
        verdict: validationResult.statusTitle,
        sourcePage: '/tools/dmepos-validator',
      });

      if (ok) {
        setFormStatus('success');
        trackConversion('assessment');
      } else {
        setFormStatus('error');
        setFormError('Unable to transmit request. Please retry or contact Kiran directly.');
      }
    } catch {
      setFormStatus('error');
      setFormError('Network transmission error. Please check your connection.');
    }
  };

  return (
    <div className="space-y-12">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
            <Activity className="w-3.5 h-3.5" />
            CMS DMEPOS LCD &amp; Jurisdiction Routing Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            DMEPOS Medical Necessity &amp; Prior Auth Validator
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Validate DMEPOS claims across Oxygen, CPAP, Mobility Assistive Equipment, CGMs, and Orthotics. Verify Standard Written Orders (SWO), Face-to-Face timing, required Prior Authorizations, and <strong>KX / GA / CG modifiers</strong> mapped to the correct Medicare DME MAC (Jurisdictions A, B, C, and D).
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Equipment & Jurisdiction Config */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <MapPin className="w-5 h-5 text-cyan-400" />
              1. Equipment &amp; Jurisdiction Configuration
            </h3>

            {/* State & Jurisdiction Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Beneficiary Service State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {ALL_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
                  Assigned DME MAC
                </span>
                <div className="text-xs font-bold text-cyan-300">{jurisdictionInfo.mac}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Contractor: <span className="text-slate-200">{jurisdictionInfo.contractor}</span>
                </div>
                <div className="text-[10px] text-teal-400 font-mono mt-0.5">
                  EDI Payer ID: {jurisdictionInfo.payerId}
                </div>
              </div>
            </div>

            {/* Equipment Category Selection */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                Select DMEPOS Equipment Category
              </label>
              <div className="space-y-2">
                {DME_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-cyan-950/80 border-cyan-500 text-white font-medium shadow-md shadow-cyan-950'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-200">{cat.name}</span>
                      <span className="font-mono text-cyan-400 text-[11px] font-bold">{cat.hcpcs}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{cat.description}</p>
                    {cat.priorAuthRequired && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] rounded font-semibold">
                        CMS Prior Auth Mandatory
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkpoints */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                CMS Medical Necessity Checkpoints
              </h4>

              <label className="flex items-center gap-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSwo}
                  onChange={(e) => setHasSwo(e.target.checked)}
                  className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">Standard Written Order (SWO) on File</span>
                  <span className="text-[11px] text-slate-400">Signed &amp; dated by treating practitioner prior to claim submission</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasF2F}
                  onChange={(e) => setHasF2F(e.target.checked)}
                  className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">In-Person Face-to-Face Exam</span>
                  <span className="text-[11px] text-slate-400">Conducted within 6 months prior to written order date</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={meetsTestingCriteria}
                  onChange={(e) => setMeetsTestingCriteria(e.target.checked)}
                  className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">Diagnostic Testing Benchmark Met</span>
                  <span className="text-[11px] text-slate-400">{activeCategory.clinicalBenchmark}</span>
                </div>
              </label>

              {activeCategory.id === 'cpap' && (
                <label className="flex items-center gap-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasComplianceData}
                    onChange={(e) => setHasComplianceData(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">90-Day PAP Compliance Adherence</span>
                    <span className="text-[11px] text-slate-400">SD card download proves &gt;= 4 hrs/night on 70% of nights (30-day window)</span>
                  </div>
                </label>
              )}

              {activeCategory.priorAuthRequired && (
                <label className="flex items-center gap-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPriorAuthApproved}
                    onChange={(e) => setHasPriorAuthApproved(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Affirmative Prior Auth Decision Received</span>
                    <span className="text-[11px] text-slate-400">Unique Tracking Number (UTN) issued by DME MAC</span>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Validation Output & Code Generation */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                2. Validation Verdict &amp; EDI Directives
              </h3>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  validationResult.status === 'clean'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : validationResult.status === 'warning'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                {validationResult.status === 'clean' ? 'Passed Validation' : 'Action Required'}
              </span>
            </div>

            {/* Verdict Box */}
            <div
              className={`p-4 rounded-xl border mb-5 ${
                validationResult.status === 'clean'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                  : validationResult.status === 'warning'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-100'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Adjudication Status
              </div>
              <div className="text-lg font-bold mb-2">{validationResult.statusTitle}</div>
              <div className="text-xs leading-relaxed text-slate-300">
                {validationResult.advice}
              </div>
            </div>

            {/* Issues List if any */}
            {validationResult.issues.length > 0 && (
              <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30 mb-5">
                <span className="text-xs font-bold text-rose-400 block mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Documentation &amp; Policy Deficiencies ({validationResult.issues.length})
                </span>
                <ul className="space-y-2">
                  {validationResult.issues.map((iss, idx) => (
                    <li key={idx} className="text-xs text-rose-200 flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{iss}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Modifiers */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-5">
              <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
                Required HCPCS Line Modifiers
              </span>
              <div className="flex flex-wrap gap-2">
                {validationResult.recommendedModifiers.map((mod) => (
                  <span
                    key={mod}
                    className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-lg text-cyan-300 font-mono text-xs font-bold"
                  >
                    Modifier {mod}
                  </span>
                ))}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {validationResult.recommendedModifiers.includes('KX') && (
                  <span>
                    <strong>Modifier KX:</strong> Attests to Medicare that all clinical requirements in the LCD have been met and are documented in the patient chart.
                  </span>
                )}
                {validationResult.recommendedModifiers.includes('GA') && (
                  <span>
                    <strong>Modifier GA:</strong> Advance Beneficiary Notice (ABN) on file; patient accepts financial liability if Medicare denies.
                  </span>
                )}
              </div>
            </div>

            {/* ANSI X12 837P Loop 2400 SV1 Snippet */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  ANSI X12 837P Loop 2400 SV1 Segment
                </span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <code className="block bg-slate-900 p-2.5 rounded-lg text-xs font-mono text-emerald-300 break-all border border-slate-800">
                {validationResult.sv1Snippet}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* DMEPOS Practice Audit Intake */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            DMEPOS Supplier Claims &amp; CERT Defense Audit
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Defend Your DMEPOS Claims Against Medicare Post-Payment Recoupments
          </h3>
          <p className="text-slate-300 text-sm">
            UPIC and CERT auditors target DME suppliers with retrospective clawbacks for missing SWOs and compliance tracking gaps. Submit 20 past claims to Aethera for a comprehensive LCD medical necessity defense audit.
          </p>
        </div>

        {formStatus === 'success' ? (
          <div className="max-w-xl mx-auto p-6 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-white mb-1">Audit Request Transmitted</h4>
            <p className="text-slate-300 text-xs">
              Thank you! Our Certified DMEPOS Coding Specialist will contact you within 4 business hours to securely intake your claims sample.
            </p>
          </div>
        ) : (
          <form onSubmit={handleInquirySubmit} className="max-w-2xl mx-auto space-y-4">
            <input
              type="text"
              name="user_note"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">DME Supplier / Practice Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Precision Medical Equipment LLC"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Ross, Billing Director"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="david@precisionmed.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="(555) 456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Monthly Billing Volume</label>
                <select
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="Under $50,000 / mo">Under $50,000 / mo</option>
                  <option value="$50,000 - $250,000 / mo">$50,000 - $250,000 / mo</option>
                  <option value="$250,000 - $1,000,000 / mo">$250,000 - $1,000,000 / mo</option>
                  <option value="$1,000,000+ / mo">$1,000,000+ / mo</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Primary DME Pain Point</label>
                <input
                  type="text"
                  placeholder="e.g. Prior authorization denials or missing SWO clawbacks"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={formStatus === 'submitting'}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-bold text-sm hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              {formStatus === 'submitting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transmitting Audit Request...</span>
                </>
              ) : (
                <>
                  <span>Request Free 20-Claim DMEPOS Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
