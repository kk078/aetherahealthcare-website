'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertOctagon,
  FileCheck,
  Sparkles,
  ArrowRight,
  Stethoscope,
  Info,
  Copy,
  Check,
} from 'lucide-react';

interface NcciRule {
  primaryCpt: string;
  primaryDesc: string;
  secondaryCpt: string;
  secondaryDesc: string;
  category: string;
  indicator: 0 | 1 | 9; // 0 = Not allowed, 1 = Allowed with modifier, 9 = Not applicable
  allowedModifiers: string[];
  recommendedModifier: string;
  rationale: string;
  documentationRequirements: string[];
  preventedDenial: string;
}

const PRESET_RULES: NcciRule[] = [
  {
    primaryCpt: '99214',
    primaryDesc: 'Office/outpatient visit, established patient, level 4 (moderate complexity)',
    secondaryCpt: '20610',
    secondaryDesc: 'Arthrocentesis, aspiration and/or injection; major joint or bursa (e.g. knee, shoulder)',
    category: 'Orthopedics / Family Medicine',
    indicator: 1,
    allowedModifiers: ['25'],
    recommendedModifier: '25',
    rationale:
      'CMS considers minor surgical procedures (0 or 10-day global period) to include the routine pre- and post-procedure evaluation. An E/M service may only be paid separately if significant, separately identifiable medical care is provided beyond the injection.',
    documentationRequirements: [
      'Document a distinct history, exam, or medical decision-making unrelated to the decision to perform the injection (or evaluating chronic comorbidities).',
      'The clinical note must stand alone as a billable level 4 visit even if the injection portion is excised.',
      'Append Modifier -25 directly to CPT 99214 (never to 20610).',
    ],
    preventedDenial: 'CARC 97: Benefit included in the payment for another service/procedure.',
  },
  {
    primaryCpt: '45385',
    primaryDesc: 'Colonoscopy, flexible; with removal of tumor(s), polyp(s), or other lesion(s) by snare technique',
    secondaryCpt: '45380',
    secondaryDesc: 'Colonoscopy, flexible; with biopsy, single or multiple',
    category: 'Gastroenterology',
    indicator: 1,
    allowedModifiers: ['59', 'XS'],
    recommendedModifier: 'XS',
    rationale:
      'Biopsy (45380) is bundled into polyp removal by snare (45385). Biopsy may only be unbundled if performed on a completely different polyp or distinct anatomical site in the colon.',
    documentationRequirements: [
      'Operative report must clearly state separate lesion locations (e.g. snare of polyp at splenic flexure; cold forceps biopsy of mucosa in cecum).',
      'CMS Medicare prefers Medicare-specific Modifier -XS (Separate Structure) over general Modifier -59.',
      'Append -XS to 45380.',
    ],
    preventedDenial: 'CARC 97 / CARC 4: Procedure code inconsistent with modifier or missing required modifier.',
  },
  {
    primaryCpt: '93000',
    primaryDesc: 'Electrocardiogram, routine ECG with at least 12 leads; with interpretation and report',
    secondaryCpt: '93010',
    secondaryDesc: 'Electrocardiogram, routine ECG with at least 12 leads; interpretation and report only',
    category: 'Cardiology',
    indicator: 0,
    allowedModifiers: [],
    recommendedModifier: 'None (Unbundling prohibited)',
    rationale:
      'CPT 93000 includes both the technical component (tracing) and professional component (interpretation). Billing 93010 on the same date of service is a mutually exclusive duplicate claim.',
    documentationRequirements: [
      'Do NOT bill both codes for the same patient encounter under any circumstance.',
      'If your clinic owns the equipment and physician interprets: bill 93000 ONLY.',
      'If physician reads hospital-performed ECG: bill 93010 ONLY.',
    ],
    preventedDenial: 'CARC 18 (Duplicate service) & CARC 97 (Mutually exclusive service denial).',
  },
  {
    primaryCpt: '99213',
    primaryDesc: 'Office/outpatient visit, established patient, level 3 (low complexity)',
    secondaryCpt: '17000',
    secondaryDesc: 'Destruction (e.g., laser, cryotherapy) of premalignant lesion(s); first lesion',
    category: 'Dermatology',
    indicator: 1,
    allowedModifiers: ['25'],
    recommendedModifier: '25',
    rationale:
      'Cryotherapy destruction carries a 10-day global period. The decision to treat is included. A separate E/M is only payable if the provider addressed other skin complaints (e.g., rash, acne, atypical mole survey).',
    documentationRequirements: [
      'Document a distinct chief complaint (e.g., "Patient presents for full-body skin examination and evaluation of contact dermatitis").',
      'Link separate ICD-10 diagnosis codes (e.g., L23.9 for dermatitis on 99213; L57.0 for actinic keratosis on 17000).',
      'Append Modifier -25 to 99213.',
    ],
    preventedDenial: 'CARC 97: Payer bundling rejection.',
  },
  {
    primaryCpt: '99204',
    primaryDesc: 'Office/outpatient visit, new patient, level 4',
    secondaryCpt: '99214',
    secondaryDesc: 'Office/outpatient visit, established patient, level 4',
    category: 'General E/M Rules',
    indicator: 0,
    allowedModifiers: [],
    recommendedModifier: 'None (Mutually exclusive)',
    rationale:
      'A patient is either "New" or "Established" for a given date of service within the same specialty/group practice. You cannot bill both on the same day.',
    documentationRequirements: [
      'Check 3-year history rule: If patient has received professional services from any physician in the exact same specialty and subspecialty in the same group practice within the last 3 years, bill established (99214).',
      'Never attempt to append Modifier -25 or -59 to bypass this edit.',
    ],
    preventedDenial: 'CARC 4 / CARC 18: Exact duplicate / conflicting claim line.',
  },
  {
    primaryCpt: '29827',
    primaryDesc: 'Arthroscopy, shoulder, surgical; with rotator cuff repair',
    secondaryCpt: '29824',
    secondaryDesc: 'Arthroscopy, shoulder, surgical; distal claviculectomy (Mumford procedure)',
    category: 'Orthopedic Surgery',
    indicator: 1,
    allowedModifiers: ['59', 'XS'],
    recommendedModifier: 'XS',
    rationale:
      'Distal claviculectomy is considered bundled into major shoulder arthroscopic reconstructions unless performed on a distinct anatomical structure (acromioclavicular joint) supported by diagnostic pathology.',
    documentationRequirements: [
      'Operative note must describe dedicated acromioclavicular (AC) joint pathology separate from glenohumeral rotator cuff tears.',
      'Append -XS (Separate Structure) to CPT 29824.',
    ],
    preventedDenial: 'CARC 97: Surgical bundling reduction.',
  },
];

export default function NcciClaimScrubber() {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [primaryInput, setPrimaryInput] = useState(PRESET_RULES[0].primaryCpt);
  const [secondaryInput, setSecondaryInput] = useState(PRESET_RULES[0].secondaryCpt);
  const [selectedModifier, setSelectedModifier] = useState(PRESET_RULES[0].recommendedModifier);
  const [copied, setCopied] = useState(false);

  // Match rule from presets or generate generic evaluation
  const activeRule = useMemo<NcciRule>(() => {
    const p = primaryInput.trim();
    const s = secondaryInput.trim();

    const hit = PRESET_RULES.find(
      (r) =>
        (r.primaryCpt === p && r.secondaryCpt === s) ||
        (r.primaryCpt === s && r.secondaryCpt === p)
    );

    if (hit) return hit;

    // Generic fallback for custom code inputs
    return {
      primaryCpt: p || 'Custom Code 1',
      primaryDesc: 'User specified primary procedure',
      secondaryCpt: s || 'Custom Code 2',
      secondaryDesc: 'User specified secondary procedure',
      category: 'Custom Verification',
      indicator: 1,
      allowedModifiers: ['25', '59', 'XS', 'XU', '76'],
      recommendedModifier: '25 or 59',
      rationale:
        'Under CMS NCCI edits, these codes may be subject to column 1 / column 2 bundling. If one service is an E/M and the other a procedure, Modifier 25 applies. If both are surgical/diagnostic procedures on distinct anatomical sites, Modifier 59 or XS applies.',
      documentationRequirements: [
        'Document clear clinical independence: distinct anatomical site, separate incision, or independent medical decision-making.',
        'Link distinct ICD-10 diagnosis codes to each respective claim line.',
        'Audit against payer-specific LCD/NCD guidelines before transmission.',
      ],
      preventedDenial: 'CARC 97: Benefit included in primary procedure.',
    };
  }, [primaryInput, secondaryInput]);

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    const p = PRESET_RULES[idx];
    setPrimaryInput(p.primaryCpt);
    setSecondaryInput(p.secondaryCpt);
    setSelectedModifier(p.recommendedModifier);
  };

  const handleCopyNote = () => {
    const text = `NCCI Clinical Documentation Summary:\nPrimary: CPT ${activeRule.primaryCpt}\nSecondary: CPT ${activeRule.secondaryCpt}\nModifier: ${activeRule.recommendedModifier}\nDocumentation Checklist:\n${activeRule.documentationRequirements.map((r) => `- ${r}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden font-inter">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-[#003087] to-teal p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cream text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5 text-mint" /> 2026 CMS NCCI PTP Edit Database
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-jakarta">
              Claim Scrubber &amp; Modifier Validator
            </h2>
            <p className="text-xs sm:text-sm text-cream/90 max-w-2xl mt-1">
              Test CPT code combinations against National Correct Coding Initiative (NCCI) Procedure-to-Procedure
              (PTP) bundling rules before submission to prevent instant CARC 97 denials.
            </p>
          </div>

          <Link
            href="/free-assessment"
            className="hidden sm:inline-flex items-center gap-2 bg-mint hover:bg-white text-navy font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-md"
          >
            <span>Automate Scrubbing (Free Pilot)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Clinical Presets Pills */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">
            Frequent Clinical Scenarios:
          </p>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            {PRESET_RULES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(idx)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedPreset === idx
                    ? 'bg-mint text-navy font-bold shadow-xs'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {preset.primaryCpt} + {preset.secondaryCpt} ({preset.category.split('/')[0].trim()})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Input Form */}
      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Column 1 CPT */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Primary Procedure (Column 1 CPT)
            </label>
            <input
              type="text"
              value={primaryInput}
              onChange={(e) => {
                setPrimaryInput(e.target.value);
                setSelectedPreset(-1);
              }}
              placeholder="e.g. 99214, 45385, 93000"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono text-navy font-bold focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>

          {/* Column 2 CPT */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Secondary Procedure (Column 2 CPT)
            </label>
            <input
              type="text"
              value={secondaryInput}
              onChange={(e) => {
                setSecondaryInput(e.target.value);
                setSelectedPreset(-1);
              }}
              placeholder="e.g. 20610, 45380, 17000"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono text-navy font-bold focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>

          {/* Modifier Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Modifier Being Tested
            </label>
            <select
              value={selectedModifier}
              onChange={(e) => setSelectedModifier(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-teal"
            >
              <option value="None">No Modifier</option>
              <option value="25">Modifier -25 (Significant, Separately Identifiable E/M)</option>
              <option value="59">Modifier -59 (Distinct Procedural Service)</option>
              <option value="XS">Modifier -XS (Separate Structure/Organ)</option>
              <option value="XE">Modifier -XE (Separate Encounter)</option>
              <option value="XP">Modifier -XP (Separate Practitioner)</option>
              <option value="XU">Modifier -XU (Unusual Non-Overlapping Service)</option>
              <option value="50">Modifier -50 (Bilateral Procedure)</option>
              <option value="76">Modifier -76 (Repeat Procedure by Same Physician)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results & Adjudication Breakdown */}
      <div className="p-6 space-y-6">
        {/* Status Box */}
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            activeRule.indicator === 1
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : activeRule.indicator === 0
              ? 'bg-red-50 border-red-200 text-red-950'
              : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}
        >
          <div className="flex items-start gap-3.5">
            {activeRule.indicator === 1 ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : activeRule.indicator === 0 ? (
              <AlertOctagon className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-base font-jakarta">
                  {activeRule.indicator === 1
                    ? 'Modifier Permitted to Bypass Bundling'
                    : activeRule.indicator === 0
                    ? 'Mutually Exclusive: Modifier NOT Permitted'
                    : 'Edit Not Subject to NCCI PTP Bundling'}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    activeRule.indicator === 1
                      ? 'bg-emerald-200 text-emerald-800'
                      : 'bg-red-200 text-red-800'
                  }`}
                >
                  Edit Indicator: {activeRule.indicator}
                </span>
              </div>
              <p className="text-xs mt-1 text-slate-700">
                {activeRule.indicator === 1
                  ? `Recommended: Append Modifier -${activeRule.recommendedModifier} to bypass the claim bundling edit when supported by documentation.`
                  : 'CMS policy strictly prohibits billing these two procedures together on the same DOS. Any modifier appended will be flagged as an audit risk.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyNote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors shrink-0 shadow-xs"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Documentation Checklist'}</span>
          </button>
        </div>

        {/* Deep Dive Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Clinical Rationale & Prevented Denial */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-teal" /> CMS Clinical Coding Rationale
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{activeRule.rationale}</p>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs">
              <span className="font-bold text-amber-900 uppercase tracking-wider block mb-1">
                Prevented Remittance Denial If Billed Incorrectly:
              </span>
              <p className="font-mono text-amber-950 bg-white p-2.5 rounded-xl border border-amber-200/80">
                {activeRule.preventedDenial}
              </p>
            </div>
          </div>

          {/* Right: Mandatory Documentation Checklist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-emerald-600" /> Medical Record Audit Requirements
            </h3>
            <p className="text-xs text-slate-500">
              Payers perform pre- and post-payment audits on modifier claims. Ensure your physician note contains:
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              {activeRule.documentationRequirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal shrink-0 mt-1.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Need a custom appeal letter?</span>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('open-expert-modal', {
                      detail: {
                        mode: 'chat',
                        initialQuery: `How do I document and appeal a bundling denial for CPT ${activeRule.primaryCpt} and ${activeRule.secondaryCpt}?`,
                      },
                    })
                  );
                }}
                className="text-teal font-bold hover:underline flex items-center gap-1"
              >
                <span>Ask AI Expert</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
