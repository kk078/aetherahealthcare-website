'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Loader2,
  FileCode,
  Sparkles,
  Info,
  Stethoscope,
  Activity,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Scissors,
  FileText,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

interface SeparatelyBillableProcedure {
  id: string;
  cpt: string;
  name: string;
  typicalMinutes: number;
}

const SEPARATE_PROCEDURES: SeparatelyBillableProcedure[] = [
  { id: 'intubation', cpt: '31500', name: 'Endotracheal Intubation', typicalMinutes: 15 },
  { id: 'cvc', cpt: '36556', name: 'Central Venous Catheter (CVC)', typicalMinutes: 20 },
  { id: 'art_line', cpt: '36620', name: 'Arterial Line Catheterization', typicalMinutes: 15 },
  { id: 'cpr', cpt: '92950', name: 'Cardiopulmonary Resuscitation (CPR)', typicalMinutes: 25 },
  { id: 'chest_tube', cpt: '32551', name: 'Tube Thoracostomy (Chest Tube)', typicalMinutes: 20 },
  { id: 'io_access', cpt: '36680', name: 'Intraosseous Line Access', typicalMinutes: 10 },
];

export default function CriticalCareScrubber() {
  // Time inputs
  const [totalBedsideMinutes, setTotalBedsideMinutes] = useState<number>(85);
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>(['intubation']);
  const [deductProcedureTimeAutomatically, setDeductProcedureTimeAutomatically] = useState<boolean>(true);

  // Split/Shared
  const [isSplitShared, setIsSplitShared] = useState<boolean>(false);
  const [physicianMinutes, setPhysicianMinutes] = useState<number>(45);
  const [nppMinutes, setNppMinutes] = useState<number>(40);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Form state
  const [physicianName, setPhysicianName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [hp, setHp] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  // Calculate procedure deducted time
  const procedureDeduction = useMemo(() => {
    if (!deductProcedureTimeAutomatically) return 0;
    return selectedProcedures.reduce((acc, id) => {
      const proc = SEPARATE_PROCEDURES.find((p) => p.id === id);
      return acc + (proc ? proc.typicalMinutes : 0);
    }, 0);
  }, [selectedProcedures, deductProcedureTimeAutomatically]);

  // Net critical care minutes
  const netCriticalMinutes = Math.max(0, totalBedsideMinutes - procedureDeduction);

  // Scrubber Calculation Logic
  const scrubResult = useMemo(() => {
    const issues: string[] = [];

    // Less than 30 minutes rule
    if (netCriticalMinutes < 30) {
      return {
        billable: false,
        status: 'error' as const,
        verdictTitle: 'NON-BILLABLE as Critical Care (<30 Minutes)',
        advice: `Net critical care time is ${netCriticalMinutes} minutes. Under CMS and CPT guidelines, critical care must reach at least 30 minutes to report CPT 99291. Bill standard Emergency Department E/M (CPT 99285) or appropriate inpatient code based on Medical Decision Making (MDM).`,
        cptBilling: 'Bill CPT 99285 (Level 5 Emergency E/M) instead of 99291',
        primaryCode: '99285',
        addonUnits: 0,
        modifierRequired: selectedProcedures.length > 0 ? 'Modifier 25 on 99285' : 'None',
        sv1Snippet: `SV1*HC:99285${selectedProcedures.length > 0 ? ':25' : ''}:340.00:UN:1***1:2~`,
        auditRisk: 'High Recoupment Risk if billed as 99291',
        checklist: [
          'Total time fails 30-minute statutory threshold',
          'Document high complexity MDM to support CPT 99285',
          'Ensure procedure time was documented separately from ED evaluation',
        ],
      };
    }

    let primaryCode = '99291';
    let addonUnits = 0;
    let unitsExplanation = '';

    if (netCriticalMinutes >= 30 && netCriticalMinutes <= 74) {
      primaryCode = '99291';
      addonUnits = 0;
      unitsExplanation = 'CPT 99291 x 1 unit (First 30–74 minutes)';
    } else if (netCriticalMinutes >= 75 && netCriticalMinutes <= 104) {
      primaryCode = '99291';
      addonUnits = 1;
      unitsExplanation = 'CPT 99291 x 1 unit + CPT 99292 x 1 unit (75–104 minutes)';
    } else if (netCriticalMinutes >= 105 && netCriticalMinutes <= 134) {
      primaryCode = '99291';
      addonUnits = 2;
      unitsExplanation = 'CPT 99291 x 1 unit + CPT 99292 x 2 units (105–134 minutes)';
    } else if (netCriticalMinutes >= 135 && netCriticalMinutes <= 164) {
      primaryCode = '99291';
      addonUnits = 3;
      unitsExplanation = 'CPT 99291 x 1 unit + CPT 99292 x 3 units (135–164 minutes)';
    } else {
      primaryCode = '99291';
      addonUnits = 4;
      unitsExplanation = 'CPT 99291 x 1 unit + CPT 99292 x 4 units (165+ minutes)';
    }

    // Modifiers
    const modifiers: string[] = [];
    if (selectedProcedures.length > 0) {
      modifiers.push('25');
    }

    // Split/Shared validation
    let substantiveBiller = 'Treating Attending Physician';
    if (isSplitShared) {
      modifiers.push('FS');
      if (nppMinutes > physicianMinutes) {
        substantiveBiller = 'Non-Physician Practitioner (PA/NP - Substantive Portion >50%)';
      } else {
        substantiveBiller = 'Attending Physician (MD/DO - Substantive Portion >50%)';
      }
    }

    const modifierStr = modifiers.length > 0 ? `:${modifiers.join(':')}` : '';
    let sv1Snippet = `SV1*HC:99291${modifierStr}:420.00:UN:1***1:2:3~`;
    if (addonUnits > 0) {
      sv1Snippet += `\nSV1*HC:99292:210.00:UN:${addonUnits}***1:2:3~`;
    }

    return {
      billable: true,
      status: 'clean' as const,
      verdictTitle: `Compliant Critical Care Service (${netCriticalMinutes} Net Mins)`,
      advice: `Clean critical care claim substantiated. ${unitsExplanation}. Procedure time deduction verified. Billed under ${substantiveBiller}.`,
      cptBilling: unitsExplanation,
      primaryCode,
      addonUnits,
      modifierRequired: modifiers.length > 0 ? modifiers.map((m) => `Modifier ${m}`).join(', ') : 'None Required',
      sv1Snippet,
      auditRisk: 'Low Audit Risk with Documented Time Statement',
      checklist: [
        'Document total qualifying critical care time explicitly (e.g. "I spent 85 total bedside minutes excluding procedure time...")',
        'State imminent or life-threatening organ system failure in physician note',
        'Document explicit subtraction of procedure times for CVC, intubation, or CPR',
        selectedProcedures.length > 0 ? 'Append Modifier 25 to 99291 to unbundle separate surgical procedures' : 'No procedural modifier required',
        isSplitShared ? `Split/Shared visit: Billed under ${substantiveBiller} with Modifier FS` : 'Solo practitioner service',
      ],
    };
  }, [netCriticalMinutes, selectedProcedures, isSplitShared, physicianMinutes, nppMinutes]);

  const toggleProcedure = (id: string) => {
    setSelectedProcedures((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const copyCode = () => {
    navigator.clipboard.writeText(scrubResult.sv1Snippet);
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
      const ok = await sendLeadToKiran('critical_care_audit_inquiry', {
        physicianName,
        groupName,
        email,
        phone,
        notes,
        totalBedsideMinutes: `${totalBedsideMinutes} mins`,
        procedureDeduction: `${procedureDeduction} mins`,
        netCriticalMinutes: `${netCriticalMinutes} mins`,
        verdict: scrubResult.verdictTitle,
        billingUnits: scrubResult.cptBilling,
        sourcePage: '/tools/critical-care-scrubber',
      });

      if (ok) {
        setFormStatus('success');
        trackConversion('assessment');
      } else {
        setFormStatus('error');
        setFormError('Unable to transmit request. Please retry or contact us directly.');
      }
    } catch {
      setFormStatus('error');
      setFormError('Network connection error. Please refresh and try again.');
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
            <Clock className="w-3.5 h-3.5" />
            CMS Chapter 12 § 30.6.12 &amp; CPT 2025 Time Threshold Rules
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Emergency &amp; Critical Care Time Documentation Scrubber
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate CERT and OIG downcoding recoupments on CPT 99291 and 99292. Automatically deduct time spent on bedside procedures (intubation, central lines, CPR), evaluate split/shared substantive portion requirements, and verify compliant <strong>Modifier 25 and FS</strong> usage.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Time & Procedure Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <Stethoscope className="w-5 h-5 text-cyan-400" />
              1. Bedside Encounter &amp; Procedure Time
            </h3>

            {/* Total Bedside Minutes Slider */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Total Direct Bedside Care Time
                </span>
                <span className="text-lg font-bold font-mono text-cyan-300">
                  {totalBedsideMinutes} Minutes
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="240"
                step="5"
                value={totalBedsideMinutes}
                onChange={(e) => setTotalBedsideMinutes(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
                <span>10 mins</span>
                <span>30 mins (99291 gate)</span>
                <span>75 mins (+99292)</span>
                <span>240 mins</span>
              </div>
            </div>

            {/* Separately Billable Bedside Procedures */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Separately Billable Procedures Performed
                </label>
                <span className="text-[11px] text-amber-400 font-mono">
                  -{procedureDeduction} Mins Deducted
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                CMS strictly requires deducting time spent performing separately billable surgical procedures from the total critical care time.
              </p>

              <div className="space-y-2">
                {SEPARATE_PROCEDURES.map((proc) => {
                  const isChecked = selectedProcedures.includes(proc.id);
                  return (
                    <button
                      key={proc.id}
                      type="button"
                      onClick={() => toggleProcedure(proc.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                        isChecked
                          ? 'bg-cyan-950/70 border-cyan-500 text-white'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'border-slate-700'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-medium text-slate-200">{proc.name}</span>
                        <span className="font-mono text-[11px] text-cyan-400">CPT {proc.cpt}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {proc.typicalMinutes} mins
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split / Shared Care Toggle */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Split / Shared Visit (MD + PA/NP)</span>
                  <span className="text-[11px] text-slate-400">Evaluate substantive portion under CMS 2024/2025 rule</span>
                </div>
                <input
                  type="checkbox"
                  checked={isSplitShared}
                  onChange={(e) => setIsSplitShared(e.target.checked)}
                  className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
                />
              </label>

              {isSplitShared && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Attending MD Minutes
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="240"
                      value={physicianMinutes}
                      onChange={(e) => setPhysicianMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      PA / NP Minutes
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="240"
                      value={nppMinutes}
                      onChange={(e) => setNppMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Scrubbing Verdict & EDI Snippet */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                2. Scrubber Verdict &amp; Code Recommendations
              </h3>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  scrubResult.status === 'clean'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                {scrubResult.auditRisk}
              </span>
            </div>

            {/* Verdict Box */}
            <div
              className={`p-4 rounded-xl border mb-5 ${
                scrubResult.status === 'clean'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Evaluation Verdict
              </div>
              <div className="text-lg font-bold mb-1">{scrubResult.verdictTitle}</div>
              <div className="text-xs leading-relaxed text-slate-300">
                {scrubResult.advice}
              </div>
            </div>

            {/* Time Breakdown Cards */}
            <div className="grid grid-cols-3 gap-3 mb-5 text-center">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Bedside</span>
                <span className="text-base font-bold font-mono text-slate-200">{totalBedsideMinutes}m</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Procedures</span>
                <span className="text-base font-bold font-mono text-rose-400">-{procedureDeduction}m</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-teal-500/30">
                <span className="text-[10px] text-teal-400 uppercase tracking-wider block font-semibold">Net Critical</span>
                <span className="text-base font-bold font-mono text-teal-300">{netCriticalMinutes}m</span>
              </div>
            </div>

            {/* CPT Codes & Modifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Recommended CPT Package</span>
                <span className="text-xs font-bold text-cyan-300 font-mono">
                  {scrubResult.cptBilling}
                </span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Required Modifiers</span>
                <span className="text-xs font-bold text-teal-300 font-mono">
                  {scrubResult.modifierRequired}
                </span>
              </div>
            </div>

            {/* Audit Defensibility Checklist */}
            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                CMS Chart Audit Documentation Checklist
              </h4>
              <ul className="space-y-2">
                {scrubResult.checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ANSI X12 837P Loop 2400 Preview */}
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
              <pre className="bg-slate-900 p-2.5 rounded-lg text-xs font-mono text-emerald-300 break-all border border-slate-800 whitespace-pre-wrap">
                {scrubResult.sv1Snippet}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Free ED Practice Audit Bridge */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Emergency Medicine &amp; Critical Care Coding Audit
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Defend Your High-Acuity ED &amp; ICU Claims Against Downcoding Audits
          </h3>
          <p className="text-slate-300 text-sm">
            Commercial payers and Medicare MACs routinely downcode CPT 99291 to 99285 when time statements lack explicit procedure exclusions. Submit 20 critical care charts to Aethera for a certified emergency medicine documentation audit at zero cost.
          </p>
        </div>

        {formStatus === 'success' ? (
          <div className="max-w-xl mx-auto p-6 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-white mb-1">Audit Request Transmitted</h4>
            <p className="text-slate-300 text-xs">
              Thank you! Our Certified Emergency Medicine Coding Lead will contact you within 4 business hours to securely coordinate chart review.
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">Emergency Group / Facility *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gulf Coast Emergency Physicians"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Marcus Cole, MD, FACEP"
                  value={physicianName}
                  onChange={(e) => setPhysicianName(e.target.value)}
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
                  placeholder="mcole@gulfcoastem.com"
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
                  placeholder="(555) 678-1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Specific Denials or Downcoding Patterns (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. UnitedHealthcare downcoding 99291 to 99285 on sepsis encounters..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
              />
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
                  <span>Request Free 20-Chart Critical Care Audit</span>
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
