'use client';

import React, { useState, useMemo } from 'react';
import {
  Scissors,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Loader2,
  FileCode,
  Sparkles,
  Info,
  Clock,
  ShieldAlert,
  ArrowRight,
  Stethoscope,
  Building2,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

interface ProcedurePreset {
  id: string;
  name: string;
  cpt: string;
  globalPeriod: '000' | '010' | '090';
  description: string;
}

const PROCEDURE_PRESETS: ProcedurePreset[] = [
  {
    id: 'tka',
    name: 'Total Knee Arthroplasty (TKA)',
    cpt: '27447',
    globalPeriod: '090',
    description: 'Major orthopedic joint replacement with 1-day pre-op, day of surgery, and 90-day post-op period.',
  },
  {
    id: 'cholecystectomy',
    name: 'Laparoscopic Cholecystectomy',
    cpt: '47562',
    globalPeriod: '090',
    description: 'Major abdominal laparoscopic gallbladder excision with 90-day global surgical period.',
  },
  {
    id: 'cataract',
    name: 'Cataract Phacoemulsification with IOL',
    cpt: '66984',
    globalPeriod: '090',
    description: 'Major ophthalmic anterior segment procedure subject to 90-day post-operative co-management rules.',
  },
  {
    id: 'acdf_spine',
    name: 'Anterior Cervical Discectomy & Fusion (ACDF)',
    cpt: '22551',
    globalPeriod: '090',
    description: 'Major spinal decompression and arthrodesis with 90-day global period.',
  },
  {
    id: 'lesion_excision',
    name: 'Excision Benign Skin Lesion (1.1–2.0 cm)',
    cpt: '11402',
    globalPeriod: '010',
    description: 'Minor surgical excision subject to 10-day global surgical follow-up package.',
  },
  {
    id: 'colonoscopy',
    name: 'Diagnostic Colonoscopy',
    cpt: '45378',
    globalPeriod: '000',
    description: '0-day minor endoscopic procedure. No post-operative global follow-up period.',
  },
  {
    id: 'custom',
    name: 'Custom Surgical Procedure',
    cpt: 'Custom',
    globalPeriod: '090',
    description: 'Manually specify CPT code and CMS global fee period definition.',
  },
];

type EncounterScenario =
  | 'unrelated_em'
  | 'routine_postop'
  | 'staged_planned'
  | 'unplanned_or_return'
  | 'unrelated_surgery'
  | 'transfer_care_postop';

export default function GlobalPeriodScrubber() {
  // Scenario inputs
  const [selectedPreset, setSelectedPreset] = useState<string>('tka');
  const [customCpt, setCustomCpt] = useState<string>('29881');
  const [globalPeriodDays, setGlobalPeriodDays] = useState<'000' | '010' | '090'>('090');

  // Dates
  const [daysElapsed, setDaysElapsed] = useState<number>(24);
  const [physicianRelationship, setPhysicianRelationship] = useState<'same_surgeon' | 'different_group'>('same_surgeon');
  const [encounterScenario, setEncounterScenario] = useState<EncounterScenario>('unrelated_em');
  const [posSetting, setPosSetting] = useState<'office' | 'or_suite'>('office');

  // Copy state
  const [copied, setCopied] = useState(false);

  // Inquiry Form State
  const [providerName, setProviderName] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [hp, setHp] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  // Determine active global days
  const activeDaysLimit = useMemo(() => {
    if (selectedPreset === 'custom') {
      if (globalPeriodDays === '000') return 0;
      if (globalPeriodDays === '010') return 10;
      return 90;
    }
    const preset = PROCEDURE_PRESETS.find((p) => p.id === selectedPreset);
    if (!preset) return 90;
    if (preset.globalPeriod === '000') return 0;
    if (preset.globalPeriod === '010') return 10;
    return 90;
  }, [selectedPreset, globalPeriodDays]);

  const isInsideGlobalWindow = daysElapsed <= activeDaysLimit && activeDaysLimit > 0;

  // Scrubbing Evaluation Engine
  const scrubResult = useMemo(() => {
    const activeCpt = selectedPreset === 'custom' ? customCpt : PROCEDURE_PRESETS.find((p) => p.id === selectedPreset)?.cpt || '27447';

    // Outside global period
    if (!isInsideGlobalWindow) {
      return {
        verdict: 'Standard Billable — Outside Global Period',
        verdictType: 'clean' as const,
        requiredModifier: 'None Required',
        allowableImpact: '100% of Fee Schedule Allowable',
        globalPeriodReset: 'N/A — Encounter is outside the postoperative fee period',
        recommendation: `Day ${daysElapsed} exceeds the ${activeDaysLimit}-day surgical global window. The global surgical package has expired. Services can be billed cleanly without surgical post-op modifiers.`,
        checklist: [
          'Verify patient is seen after postoperative expiration date',
          'Standard E/M or procedure medical necessity applies',
          'Ensure routine diagnosis code reflects current medical condition',
        ],
        sv1Segment: `SV1*HC:99214:240.00:UN:1***1:2:3~`,
        auditRisk: 'Low Risk',
      };
    }

    // Different group/physician
    if (physicianRelationship === 'different_group') {
      return {
        verdict: 'Billable by Unrelated Physician / Distinct NPI',
        verdictType: 'clean' as const,
        requiredModifier: 'None (or Modifier 24 if covering for surgeon)',
        allowableImpact: '100% of Fee Schedule Allowable',
        globalPeriodReset: 'Does not affect original surgeon global period',
        recommendation: `When an unrelated physician in a completely different group practice (different Tax ID / NPI) renders medical care during a postoperative period, the global surgery package of another surgeon does not bundle the claim. However, if covering on-call, Modifier 24 is required.`,
        checklist: [
          'Confirm rendering provider Tax ID does not match surgical group',
          'Verify provider is not covering or cross-clearing on-call duties',
          'Document independent medical evaluation',
        ],
        sv1Segment: `SV1*HC:99214:240.00:UN:1***1:2:3~`,
        auditRisk: 'Low Risk',
      };
    }

    // Inside global period with same surgeon/group
    switch (encounterScenario) {
      case 'routine_postop':
        return {
          verdict: 'BUNDLED — Zero Allowable (Included in Surgical Fee)',
          verdictType: 'warning' as const,
          requiredModifier: 'CPT 99024 (Post-op Tracking Only)',
          allowableImpact: '$0.00 (100% Bundled into Initial Global Surgical Fee)',
          globalPeriodReset: 'Original global period continues through day ' + activeDaysLimit,
          recommendation: `Routine post-operative follow-up, suture removal, staple removal, and standard surgical recovery monitoring are strictly bundled into the global surgical fee under CMS Chapter 12 § 40.1. Submitting with an E/M (99212–99215) will trigger a CARC CO-97 denial or recoupment audit.`,
          checklist: [
            'Do NOT bill standard Evaluation and Management codes (99212–99215)',
            'Report CPT 99024 (Postoperative follow-up visit, included in global service) with $0 charge for internal tracking',
            'Suture or staple removal performed by operating surgeon is not separately payable',
          ],
          sv1Segment: `SV1*HC:99024:0.00:UN:1***1:2:3~`,
          auditRisk: 'High Audit Risk if billed with E/M',
        };

      case 'unrelated_em':
        return {
          verdict: 'Billable with Modifier 24 (Unrelated E/M)',
          verdictType: 'modifier' as const,
          requiredModifier: 'Modifier 24 (Appended to E/M Code)',
          allowableImpact: '100% of E/M Fee Schedule Allowable',
          globalPeriodReset: 'Original surgical global window remains intact',
          recommendation: `Modifier 24 indicates that an Evaluation & Management service was provided during a post-operative period for an unrelated medical problem (e.g. COPD exacerbation, acute sinusitis, or injury to unrelated anatomy).`,
          checklist: [
            'Primary ICD-10 diagnosis MUST be distinctly unrelated to surgical reason or operative complications',
            'Chief complaint and HPI must document non-surgical etiology',
            'Exam must focus on the unrelated clinical complaint',
            'Operating surgeon note must document "Post-operative status stable; encounter addressing unrelated condition"',
          ],
          sv1Segment: `SV1*HC:99214:24:240.00:UN:1***1:2:3~`,
          auditRisk: 'Moderate Audit Risk — Defensible with distinct ICD-10',
        };

      case 'staged_planned':
        return {
          verdict: 'Billable with Modifier 58 (Staged / Related Procedure)',
          verdictType: 'modifier' as const,
          requiredModifier: 'Modifier 58 (Appended to Staged Procedure CPT)',
          allowableImpact: '100% of New Procedure Allowable',
          globalPeriodReset: 'Resets a BRAND NEW global period from date of staged procedure',
          recommendation: `Modifier 58 applies when a procedure is: (a) planned prospectively at the time of the original procedure, (b) more extensive than original procedure, or (c) for therapy following a diagnostic surgical procedure. Full surgical fee is payable and a new global period begins.`,
          checklist: [
            'Prior operative note must document intention for staged or secondary intervention',
            'Condition required more extensive operative therapy than originally performed',
            'Starts an entirely new 0, 10, or 90-day global surgical clock',
          ],
          sv1Segment: `SV1*HC:${activeCpt}:58:1850.00:UN:1***1:2:3~`,
          auditRisk: 'Low-to-Moderate Audit Risk',
        };

      case 'unplanned_or_return':
        if (posSetting === 'office') {
          return {
            verdict: 'BUNDLED IN OFFICE — Must Occur in Operating Room for Modifier 78',
            verdictType: 'warning' as const,
            requiredModifier: 'Modifier 78 (Invalid in Office POS 11 under Medicare)',
            allowableImpact: '$0.00 under CMS rules if performed in Office',
            globalPeriodReset: 'Original global period continues uninterrupted',
            recommendation: `Under CMS Medicare rules, treatment of surgical complications in the office (Place of Service 11) is bundled into the global package. Modifier 78 is only payable when the patient is returned to a dedicated Operating Room suite (POS 21, 22, 24).`,
            checklist: [
              'Medicare requires dedicated Operating Room / Cath Lab / Endoscopy Suite for Modifier 78 payment',
              'If performed in OR, intraoperative component (~70%) is reimbursed',
              'Does NOT reset the original 90-day surgical global period',
            ],
            sv1Segment: `SV1*HC:35800:78:1200.00:UN:1***1:2:3~`,
            auditRisk: 'High Audit Risk if billed in POS 11',
          };
        }
        return {
          verdict: 'Billable with Modifier 78 (Unplanned Return to OR)',
          verdictType: 'modifier' as const,
          requiredModifier: 'Modifier 78 (Unplanned Return to OR for Complication)',
          allowableImpact: '~70% of Fee Schedule (Intraoperative Portion Only)',
          globalPeriodReset: 'Does NOT reset global period; original period continues',
          recommendation: `Modifier 78 reports an unplanned return to the operating/procedure room for a related procedure (e.g. postoperative bleeding, dehiscence, or surgical site infection). CMS reimburses the intraoperative surgical value (~70%) without new pre/post-op allowances.`,
          checklist: [
            'Must be performed in an Operating Room, Endoscopy Suite, or Cardiac Cath Lab',
            'Operative report must specify complication originating from initial surgery',
            'Original 90-day global surgical clock continues without reset',
          ],
          sv1Segment: `SV1*HC:35800:78:1200.00:UN:1***1:2:3~`,
          auditRisk: 'Low Audit Risk with OR Operative Report',
        };

      case 'unrelated_surgery':
        return {
          verdict: 'Billable with Modifier 79 (Unrelated Procedure)',
          verdictType: 'modifier' as const,
          requiredModifier: 'Modifier 79 (Unrelated Procedure by Same Physician)',
          allowableImpact: '100% of Procedure Allowable',
          globalPeriodReset: 'Resets an INDEPENDENT new global period for the new surgery',
          recommendation: `Modifier 79 applies when the same physician performs an unrelated surgical procedure during an active post-op window (e.g., patient undergoes emergency appendectomy while recovering from knee surgery, or contralateral eye surgery).`,
          checklist: [
            'Operative report must clearly substantiate distinct anatomical site or unrelated etiology',
            'Primary diagnosis must NOT link to the prior surgery',
            'Initiates a completely separate global surgical period for the new CPT',
          ],
          sv1Segment: `SV1*HC:44970:79:1450.00:UN:1***1:2:3~`,
          auditRisk: 'Low-to-Moderate Audit Risk',
        };

      case 'transfer_care_postop':
        return {
          verdict: 'Split Care Billable with Modifier 54 or 55',
          verdictType: 'modifier' as const,
          requiredModifier: 'Modifier 54 (Surgical Care Only) or Modifier 55 (Post-Op Only)',
          allowableImpact: 'Modifier 54: ~70-80% | Modifier 55: ~20% Post-Op Component',
          globalPeriodReset: 'Coordinated between operating surgeon and managing physician',
          recommendation: `When one physician performs surgical care and another assumes postoperative care, Modifier 54 is billed by the surgeon (Loop 2400) and Modifier 55 is billed by the managing clinician with documented transfer-of-care dates.`,
          checklist: [
            'Written transfer-of-care agreement in both medical records',
            'Surgeon bills with Modifier 54 for surgical component',
            'Receiving clinician bills with Modifier 55 with exact date care was assumed',
          ],
          sv1Segment: `SV1*HC:${activeCpt}:55:350.00:UN:1***1:2:3~`,
          auditRisk: 'Moderate Audit Risk — Requires matched transfer dates',
        };
    }
  }, [selectedPreset, customCpt, activeDaysLimit, daysElapsed, physicianRelationship, encounterScenario, posSetting, isInsideGlobalWindow]);

  const copyCode = () => {
    navigator.clipboard.writeText(scrubResult.sv1Segment);
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
      const ok = await sendLeadToKiran('global_period_audit_inquiry', {
        providerName,
        practiceName,
        email,
        phone,
        inquiryNotes,
        selectedProcedure: selectedPreset,
        globalPeriod: `${activeDaysLimit} Days`,
        daysElapsed: `${daysElapsed} Days`,
        encounterScenario,
        verdict: scrubResult.verdict,
        requiredModifier: scrubResult.requiredModifier,
        sourcePage: '/tools/global-period-scrubber',
      });

      if (ok) {
        setFormStatus('success');
        trackConversion('assessment');
      } else {
        setFormStatus('error');
        setFormError('Failed to transmit request. Please try again or call us directly.');
      }
    } catch {
      setFormStatus('error');
      setFormError('Network connection error. Please refresh and retry.');
    }
  };

  return (
    <div className="space-y-12">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
            <Scissors className="w-3.5 h-3.5" />
            CMS Chapter 12 § 40.1 Compliance Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Surgical Global Period &amp; Post-Op Modifier Scrubber
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate costly unbundling recoupments and stop leaving post-operative revenue on the table. Scrub surgical encounters against Medicare 0-day, 10-day, and 90-day global fee packages to pinpoint compliant usage of <strong>Modifiers 24, 58, 78, 79, 54, and 55</strong>.
          </p>
        </div>
      </div>

      {/* Main Interactive Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <Calendar className="w-5 h-5 text-cyan-400" />
              1. Surgical Procedure &amp; Global Window
            </h3>

            {/* Procedure Presets */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Select Surgical Procedure / Specialty
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PROCEDURE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      selectedPreset === preset.id
                        ? 'bg-cyan-950/80 border-cyan-500/80 text-white font-medium shadow-md shadow-cyan-950'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-slate-200 flex justify-between">
                      <span>{preset.name}</span>
                      <span className="text-cyan-400 font-mono text-[11px]">{preset.cpt}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      CMS Global: <span className="font-mono text-teal-400 font-bold">{preset.globalPeriod}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom CPT entry if selected */}
            {selectedPreset === 'custom' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800 mb-6">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                    CPT Procedure Code
                  </label>
                  <input
                    type="text"
                    value={customCpt}
                    onChange={(e) => setCustomCpt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm"
                    placeholder="e.g. 29881"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                    CMS Global Period
                  </label>
                  <select
                    value={globalPeriodDays}
                    onChange={(e) => setGlobalPeriodDays(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                  >
                    <option value="090">090 (Major 90-Day)</option>
                    <option value="010">010 (Minor 10-Day)</option>
                    <option value="000">000 (0-Day / Endoscopy)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Timeline Slider */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Days Elapsed Since Surgery
                </span>
                <span className="text-base font-bold font-mono text-cyan-300">
                  Day {daysElapsed} of {activeDaysLimit}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                value={daysElapsed}
                onChange={(e) => setDaysElapsed(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
                <span>Day 0 (Op Date)</span>
                <span>Day 10</span>
                <span>Day 90 (Global End)</span>
                <span>Day 120</span>
              </div>

              <div className="mt-3 text-xs">
                {isInsideGlobalWindow ? (
                  <div className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Encounter falls INSIDE the {activeDaysLimit}-day surgical global window.
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Encounter falls OUTSIDE the {activeDaysLimit}-day global window.
                  </div>
                )}
              </div>
            </div>

            {/* Physician Relationship */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Rendering Clinician Tax ID &amp; Relationship
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPhysicianRelationship('same_surgeon')}
                  className={`p-3 rounded-xl border text-xs text-left cursor-pointer transition ${
                    physicianRelationship === 'same_surgeon'
                      ? 'bg-cyan-950/70 border-cyan-500 text-white font-medium'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-semibold text-slate-200">Same Surgeon / Group</div>
                  <div className="text-[11px] text-slate-500">Same Tax ID / Same Specialty</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPhysicianRelationship('different_group')}
                  className={`p-3 rounded-xl border text-xs text-left cursor-pointer transition ${
                    physicianRelationship === 'different_group'
                      ? 'bg-cyan-950/70 border-cyan-500 text-white font-medium'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-semibold text-slate-200">Unrelated Provider</div>
                  <div className="text-[11px] text-slate-500">Different Tax ID / Specialty</div>
                </button>
              </div>
            </div>

            {/* Encounter Reason Scenario */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Clinical Reason for Post-Operative Encounter
              </label>
              <select
                value={encounterScenario}
                onChange={(e) => setEncounterScenario(e.target.value as EncounterScenario)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="unrelated_em">Unrelated Condition Evaluation &amp; Management (e.g. Hypertension, URI)</option>
                <option value="routine_postop">Routine Post-Op Examination / Suture Removal / Normal Healing Check</option>
                <option value="staged_planned">Staged or Related Surgical Procedure (Prospectively Planned)</option>
                <option value="unplanned_or_return">Unplanned Return to OR for Complication (Hemorrhage, Dehiscence)</option>
                <option value="unrelated_surgery">Unrelated Surgical Procedure by Same Physician</option>
                <option value="transfer_care_postop">Split-Care Transfer (Surgical Care Only vs Post-Op Only)</option>
              </select>
            </div>

            {/* Place of Service (for return to OR scenario) */}
            {encounterScenario === 'unplanned_or_return' && (
              <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-slate-400 block mb-2">
                  Place of Service (POS) for Return Procedure
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPosSetting('office')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium cursor-pointer ${
                      posSetting === 'office'
                        ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Office (POS 11)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosSetting('or_suite')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium cursor-pointer ${
                      posSetting === 'or_suite'
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Operating Room (POS 21/22/24)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Scrubbing Result & Code Generation */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                2. Scrubber Verdict &amp; Modifier Directives
              </h3>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  scrubResult.verdictType === 'clean'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : scrubResult.verdictType === 'warning'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                }`}
              >
                {scrubResult.auditRisk}
              </span>
            </div>

            {/* Verdict Box */}
            <div
              className={`p-4 rounded-xl border mb-5 ${
                scrubResult.verdictType === 'clean'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                  : scrubResult.verdictType === 'warning'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                  : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-100'
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Adjudication Status
              </div>
              <div className="text-lg font-bold mb-2">{scrubResult.verdict}</div>
              <div className="text-xs leading-relaxed text-slate-300">
                {scrubResult.recommendation}
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Required CPT Modifier</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">
                  {scrubResult.requiredModifier}
                </span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">Payment Allowable Impact</span>
                <span className="text-sm font-bold text-teal-300">
                  {scrubResult.allowableImpact}
                </span>
              </div>
            </div>

            {/* Global Period Reset Status */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 mb-5 text-xs">
              <span className="text-slate-400 font-semibold block mb-1">Global Period Reset Status:</span>
              <span className="text-slate-200">{scrubResult.globalPeriodReset}</span>
            </div>

            {/* Documentation Checklist */}
            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Audit Defensibility Documentation Protocol
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

            {/* ANSI X12 837P Loop 2400 SV1 Snippet */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  ANSI X12 837P Loop 2400 SV1 Line Preview
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
                {scrubResult.sv1Segment}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Free Practice Surgical Audit Bridge */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            Zero-Cost Post-Op Claim Audit
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Audit Your Past Surgical Remittances for Unbundling Recoupments
          </h3>
          <p className="text-slate-300 text-sm">
            Commercial payers routinely initiate retrospective recoupment audits for Modifier 24 and 58 claims. Let our certified surgical coders review 25 of your flagged post-op claims at zero cost.
          </p>
        </div>

        {formStatus === 'success' ? (
          <div className="max-w-xl mx-auto p-6 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-white mb-1">Audit Request Transmitted</h4>
            <p className="text-slate-300 text-xs">
              Thank you! Our Surgical Billing Audit Team will contact you within 4 business hours to securely review your post-operative claims data.
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">Physician / Practice Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Surgical Associates"
                  value={practiceName}
                  onChange={(e) => setPracticeName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Robert Vance, MD"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
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
                  placeholder="robert@apexsurgical.com"
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
                  placeholder="(555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Specific Denials or Post-Op Inquiries (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Aetna denying Modifier 24 visits as bundled into 90-day global package..."
                value={inquiryNotes}
                onChange={(e) => setInquiryNotes(e.target.value)}
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
                  <span>Request Free 25-Claim Post-Op Audit</span>
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
