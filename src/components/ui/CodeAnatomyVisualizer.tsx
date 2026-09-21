'use client';

import { useState } from 'react';
import {
  Pill,
  Workflow,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Scissors,
} from 'lucide-react';

export default function CodeAnatomyVisualizer() {
  const [activeTab, setActiveTab] = useState<'ndc' | 'modifiers' | 'cdt' | 'cpt'>('ndc');

  // NDC Interactive State
  const [ndcFormat, setNdcFormat] = useState<'5-3-2' | '4-4-2' | '5-4-1'>('5-3-2');

  // Modifier Decision State
  const [modStep1, setModStep1] = useState<'em' | 'procedure'>('em');
  const [modStep2, setModStep2] = useState<'same_day' | 'distinct_day'>('same_day');
  const [modStep3, setModStep3] = useState<'separate_organ' | 'separate_time' | 'different_doc'>('separate_organ');

  // CDT Cross-Coding State
  const [selectedTooth, setSelectedTooth] = useState<number>(17);

  // CPT MDM State
  const [mdmProblems, setMdmProblems] = useState<'minimal' | 'low' | 'moderate' | 'high'>('moderate');
  const [mdmData, setMdmData] = useState<'minimal' | 'limited' | 'moderate' | 'extensive'>('moderate');
  const [mdmRisk, setMdmRisk] = useState<'minimal' | 'low' | 'moderate' | 'high'>('moderate');

  // Calculate E/M level based on 2 of 3 MDM criteria
  const calculateEmLevel = () => {
    const scores: Record<string, number> = { minimal: 2, low: 3, moderate: 4, high: 5, limited: 3, extensive: 5 };
    const p = scores[mdmProblems];
    const d = scores[mdmData];
    const r = scores[mdmRisk];
    // Sort scores, 2nd highest is the level
    const sorted = [p, d, r].sort((a, b) => b - a);
    const finalLevel = sorted[1];
    return {
      code: `9921${finalLevel}`,
      name: `Level ${finalLevel} Established Patient E/M`,
      description:
        finalLevel === 4
          ? 'Requires 1 chronic illness with severe exacerbation, or 2+ stable chronic conditions, plus prescription drug management or moderate diagnostic risk.'
          : finalLevel === 5
          ? 'Requires acute or chronic illness posing immediate threat to life, extensive multi-source data, and high risk (e.g. parenteral controlled substances, emergency major surgery decision).'
          : finalLevel === 3
          ? 'Requires 1 stable chronic condition or 1 acute uncomplicated illness, low diagnostic data review, and low prescription/treatment risk.'
          : 'Straightforward visit with minimal problems, minimal data, and minimal risk.',
    };
  };

  const emResult = calculateEmLevel();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray/15 shadow-sm">
      <div className="max-w-3xl mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal bg-teal/10 px-3 py-1 rounded-full mb-3">
          <Sparkles className="h-3.5 w-3.5" /> Interactive Code Anatomy
        </div>
        <h2 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
          How Medical Codes Actually Work
        </h2>
        <p className="text-gray mt-2 text-sm sm:text-base leading-relaxed">
          Select a code system below to see its exact mathematical anatomy, zero-padding conversions,
          decision trees, and human sign-off criteria.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-gray/10 mb-8">
        <button
          onClick={() => setActiveTab('ndc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'ndc'
              ? 'bg-navy text-white shadow-md'
              : 'bg-cream text-gray hover:text-navy hover:bg-slate-100'
          }`}
        >
          <Pill className="h-4 w-4" /> 11-Digit NDC Zero-Padding
        </button>
        <button
          onClick={() => setActiveTab('modifiers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'modifiers'
              ? 'bg-navy text-white shadow-md'
              : 'bg-cream text-gray hover:text-navy hover:bg-slate-100'
          }`}
        >
          <Workflow className="h-4 w-4" /> Modifier Decision Tree (-25 / -59)
        </button>
        <button
          onClick={() => setActiveTab('cdt')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'cdt'
              ? 'bg-navy text-white shadow-md'
              : 'bg-cream text-gray hover:text-navy hover:bg-slate-100'
          }`}
        >
          <Scissors className="h-4 w-4" /> CDT Dental-to-Medical Cross-Coding
        </button>
        <button
          onClick={() => setActiveTab('cpt')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'cpt'
              ? 'bg-navy text-white shadow-md'
              : 'bg-cream text-gray hover:text-navy hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="h-4 w-4" /> CPT E/M Decision Matrix
        </button>
      </div>

      {/* TAB 1: NDC ZERO-PADDING TOOL */}
      {activeTab === 'ndc' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-cream border border-gray/10">
            <div>
              <p className="text-xs font-bold text-gray uppercase tracking-wider">Select FDA Package Format</p>
              <p className="text-sm text-navy font-semibold">Watch how deterministic rules insert the missing zero</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setNdcFormat('5-3-2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  ndcFormat === '5-3-2' ? 'bg-teal text-white' : 'bg-white text-navy border border-gray/20'
                }`}
              >
                5-3-2 (e.g. Avastin)
              </button>
              <button
                onClick={() => setNdcFormat('4-4-2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  ndcFormat === '4-4-2' ? 'bg-teal text-white' : 'bg-white text-navy border border-gray/20'
                }`}
              >
                4-4-2 (Zero in Labeler)
              </button>
              <button
                onClick={() => setNdcFormat('5-4-1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  ndcFormat === '5-4-1' ? 'bg-teal text-white' : 'bg-white text-navy border border-gray/20'
                }`}
              >
                5-4-1 (Zero in Package)
              </button>
            </div>
          </div>

          {/* Interactive NDC Pill Dissection */}
          <div className="p-6 rounded-2xl bg-navy text-white space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
              <span className="text-xs font-mono text-mint uppercase tracking-wider font-bold">
                HIPAA Mandate: ANSI X12 837P Segment 2410
              </span>
              <span className="text-xs text-slate-300">Format: 5-4-2 (Strict 11 digits)</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-center">
              {/* Segment 1: Labeler */}
              <div className="p-4 rounded-xl bg-white/10 border border-white/20 min-w-[130px]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Labeler (5)
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
                  {ndcFormat === '4-4-2' ? (
                    <span>
                      <span className="text-mint underline font-black">0</span>0002
                    </span>
                  ) : (
                    '50242'
                  )}
                </div>
                <div className="text-[10px] text-slate-300 mt-1">Manufacturer Code</div>
              </div>

              <span className="text-2xl text-slate-500 font-mono font-bold">-</span>

              {/* Segment 2: Product */}
              <div className="p-4 rounded-xl bg-white/10 border border-white/20 min-w-[130px]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Product (4)
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
                  {ndcFormat === '5-3-2' ? (
                    <span>
                      <span className="text-mint underline font-black">0</span>060
                    </span>
                  ) : (
                    '8215'
                  )}
                </div>
                <div className="text-[10px] text-slate-300 mt-1">Drug Formulation &amp; Strength</div>
              </div>

              <span className="text-2xl text-slate-500 font-mono font-bold">-</span>

              {/* Segment 3: Package */}
              <div className="p-4 rounded-xl bg-white/10 border border-white/20 min-w-[130px]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Package (2)
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
                  {ndcFormat === '5-4-1' ? (
                    <span>
                      <span className="text-mint underline font-black">0</span>1
                    </span>
                  ) : (
                    '01'
                  )}
                </div>
                <div className="text-[10px] text-slate-300 mt-1">Commercial Vial / Carton</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Raw FDA 10-digit NDC:</span>
                <span className="text-amber-400 font-bold">
                  {ndcFormat === '5-3-2' ? '50242-060-01' : ndcFormat === '4-4-2' ? '0002-8215-01' : '12345-6789-1'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Deterministic Zero-Padded 11-digit NDC:</span>
                <span className="text-mint font-extrabold">
                  {ndcFormat === '5-3-2' ? '50242-0060-01' : ndcFormat === '4-4-2' ? '00002-8215-01' : '12345-6789-01'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Crosswalk J-Code:</span>
                <span className="text-white">J9035 (Injection, Bevacizumab, 10 mg)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Mandatory Waste Rule:</span>
                <span className="text-teal-300">Single-Dose Vial: Requires Modifier -JW (Waste) or -JZ (Zero Waste)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODIFIER DECISION TREE */}
      {activeTab === 'modifiers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-cream border border-gray/10 space-y-2">
              <span className="text-xs font-bold text-teal uppercase tracking-wider">Step 1: Service Type</span>
              <p className="text-xs text-gray">What primary service are you substantiating?</p>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setModStep1('em')}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                    modStep1 === 'em' ? 'bg-navy text-white shadow-sm' : 'bg-white text-navy border border-gray/20'
                  }`}
                >
                  Office Visit (E/M 99202–99215)
                </button>
                <button
                  onClick={() => setModStep1('procedure')}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                    modStep1 === 'procedure' ? 'bg-navy text-white shadow-sm' : 'bg-white text-navy border border-gray/20'
                  }`}
                >
                  Surgical / Diagnostic Procedure
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-cream border border-gray/10 space-y-2">
              <span className="text-xs font-bold text-teal uppercase tracking-wider">Step 2: Encounter Timing</span>
              <p className="text-xs text-gray">When was the minor procedure performed?</p>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setModStep2('same_day')}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                    modStep2 === 'same_day' ? 'bg-navy text-white shadow-sm' : 'bg-white text-navy border border-gray/20'
                  }`}
                >
                  Same Day (0-day or 10-day global)
                </button>
                <button
                  onClick={() => setModStep2('distinct_day')}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                    modStep2 === 'distinct_day' ? 'bg-navy text-white shadow-sm' : 'bg-white text-navy border border-gray/20'
                  }`}
                >
                  During 90-Day Post-Op Window
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-cream border border-gray/10 space-y-2">
              <span className="text-xs font-bold text-teal uppercase tracking-wider">Step 3: Independence Reason</span>
              <p className="text-xs text-gray">Why is this clinically independent?</p>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setModStep3('separate_organ')}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                    modStep3 === 'separate_organ' ? 'bg-navy text-white shadow-sm' : 'bg-white text-navy border border-gray/20'
                  }`}
                >
                  Different Anatomical Structure (-XS)
                </button>
                <button
                  onClick={() => setModStep3('separate_time')}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                    modStep3 === 'separate_time' ? 'bg-navy text-white shadow-sm' : 'bg-white text-navy border border-gray/20'
                  }`}
                >
                  Separate Encounter / Time (-XE)
                </button>
                <button
                  onClick={() => setModStep3('different_doc')}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                    modStep3 === 'different_doc' ? 'bg-navy text-white shadow-sm' : 'bg-white text-navy border border-gray/20'
                  }`}
                >
                  Separate Practitioner (-XP)
                </button>
              </div>
            </div>
          </div>

          {/* Decision Outcome Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-navy to-[#0A3258] text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-mint uppercase tracking-wider">
                Certified Modifier Recommendation
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> 100% Audit Defensible
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-mint font-mono">
                {modStep1 === 'em'
                  ? modStep2 === 'same_day'
                    ? 'Modifier -25'
                    : 'Modifier -24'
                  : modStep3 === 'separate_organ'
                  ? 'Modifier -XS / -59'
                  : modStep3 === 'separate_time'
                  ? 'Modifier -XE / -59'
                  : 'Modifier -XP / -59'}
              </span>
              <span className="text-sm font-semibold text-slate-200">
                {modStep1 === 'em'
                  ? modStep2 === 'same_day'
                    ? 'Significant, Separately Identifiable E/M Service'
                    : 'Unrelated E/M Service During Global Post-Op Window'
                  : modStep3 === 'separate_organ'
                  ? 'Separate Structure (Organ / Site Independence)'
                  : modStep3 === 'separate_time'
                  ? 'Separate Encounter on Same Date'
                  : 'Separate Practitioner in Same Group'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {modStep1 === 'em' && modStep2 === 'same_day' && (
                <>
                  <strong>Required Human Attestation:</strong> Certified coder must verify that the E/M
                  documentation stands alone. If the minor procedure had been cancelled, would the E/M visit note
                  still support billing this level of service?
                </>
              )}
              {modStep1 === 'em' && modStep2 === 'distinct_day' && (
                <>
                  <strong>Required Human Attestation:</strong> Certified coder must verify that the visit is for a
                  completely distinct diagnosis unrelated to normal surgical healing or expected complications of the
                  prior procedure.
                </>
              )}
              {modStep1 === 'procedure' && (
                <>
                  <strong>Required Human Attestation:</strong> Certified coder must confirm operative note
                  documents distinct incisions, separate lesions, or anatomically independent organs before applying
                  CMS unbundling modifiers.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: CDT DENTAL-TO-MEDICAL CROSS-CODING */}
      {activeTab === 'cdt' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-cream border border-gray/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-navy text-sm">Universal Tooth Selection &amp; Cross-Coding Bridge</h4>
                <p className="text-xs text-gray">Click a tooth to see its anatomical crosswalk between CDT and CPT</p>
              </div>
              <span className="text-xs font-mono font-bold text-teal bg-teal/10 px-2.5 py-1 rounded-full">
                Active Tooth #{selectedTooth}
              </span>
            </div>

            {/* Quick Tooth Grid (Select Maxillary / Mandibular Molars & Incisors) */}
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 text-center">
              {Array.from({ length: 32 }, (_, i) => i + 1).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTooth(t)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    selectedTooth === t
                      ? 'bg-navy text-mint ring-2 ring-mint scale-105'
                      : 'bg-white text-navy border border-gray/20 hover:border-teal'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[11px] text-gray px-1 font-mono">
              <span>Tooth 1 (Upper Right 3rd Molar)</span>
              <span>Tooth 16 (Upper Left 3rd Molar)</span>
              <span>Tooth 17 (Lower Left 3rd Molar)</span>
              <span>Tooth 32 (Lower Right 3rd Molar)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-gray/20 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-navy font-bold text-sm">
                <span className="h-6 w-6 rounded-lg bg-teal/10 text-teal flex items-center justify-center font-mono text-xs">
                  D
                </span>
                CDT Dental Claim Standard (ADA Form)
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-gray/10">
                  <span className="text-gray">Procedure:</span>
                  <span className="font-bold text-navy">
                    {[1, 16, 17, 32].includes(selectedTooth) ? 'D7240 (Complete Bony Impaction)' : 'D2393 (3-Surface Composite)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray/10">
                  <span className="text-gray">Tooth Target:</span>
                  <span className="font-bold text-navy">Universal #{selectedTooth}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray/10">
                  <span className="text-gray">Coverage Limit:</span>
                  <span className="text-amber-600 font-bold">$1,500 Typical Annual Cap</span>
                </div>
              </div>
              <p className="text-xs text-gray leading-normal">
                Standard dental coverage covers routine care but caps out rapidly on major surgical extractions or trauma.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-navy text-white shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-mint font-bold text-sm">
                <span className="h-6 w-6 rounded-lg bg-mint/20 text-mint flex items-center justify-center font-mono text-xs">
                  M
                </span>
                Aethera Medical Crosswalk (CMS-1500)
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-slate-400">Medical CPT:</span>
                  <span className="font-bold text-mint">
                    {[1, 16, 17, 32].includes(selectedTooth) ? '41899 (Unlisted Dentoalveolar Surgery)' : 'E0486 (Oral Appliance DME)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-slate-400">Trauma/Pathology ICD-10:</span>
                  <span className="font-bold text-white">S02.609A / K08.109 / K04.7</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-slate-400">Coverage Basis:</span>
                  <span className="text-emerald-400 font-bold">Major Medical (No $1.5k Cap)</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-normal">
                <strong>Certified Human Action:</strong> Biller attaches CBCT radiograph report, verifies
                jaw fracture or cystic bone pathology, and bills medical carrier directly to protect patient benefits.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CPT E/M MEDICAL DECISION MAKING MATRIX */}
      {activeTab === 'cpt' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* MDM 1: Problems */}
            <div className="p-4 rounded-2xl bg-cream border border-gray/10 space-y-2">
              <span className="text-xs font-bold text-teal uppercase tracking-wider">
                1. Problems Addressed
              </span>
              <div className="space-y-1.5 pt-2">
                {[
                  { key: 'minimal', label: '1 self-limited / minor problem' },
                  { key: 'low', label: '2 minor or 1 stable chronic illness' },
                  { key: 'moderate', label: '1 chronic w/ exacerbation or 2+ stable' },
                  { key: 'high', label: '1 acute/chronic threat to life or function' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setMdmProblems(item.key as typeof mdmProblems)}
                    className={`w-full p-2 rounded-xl text-left text-xs font-semibold transition-all ${
                      mdmProblems === item.key
                        ? 'bg-navy text-white shadow-sm'
                        : 'bg-white text-navy border border-gray/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MDM 2: Data */}
            <div className="p-4 rounded-2xl bg-cream border border-gray/10 space-y-2">
              <span className="text-xs font-bold text-teal uppercase tracking-wider">
                2. Data Reviewed
              </span>
              <div className="space-y-1.5 pt-2">
                {[
                  { key: 'minimal', label: 'Minimal / None' },
                  { key: 'limited', label: 'Order/review 2 tests or external notes' },
                  { key: 'moderate', label: 'Order/review 3+ tests, independent historian' },
                  { key: 'extensive', label: 'Independent interpretation of test / discussion' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setMdmData(item.key as typeof mdmData)}
                    className={`w-full p-2 rounded-xl text-left text-xs font-semibold transition-all ${
                      mdmData === item.key
                        ? 'bg-navy text-white shadow-sm'
                        : 'bg-white text-navy border border-gray/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MDM 3: Risk */}
            <div className="p-4 rounded-2xl bg-cream border border-gray/10 space-y-2">
              <span className="text-xs font-bold text-teal uppercase tracking-wider">
                3. Risk of Complications
              </span>
              <div className="space-y-1.5 pt-2">
                {[
                  { key: 'minimal', label: 'Minimal risk (e.g. rest, gargles)' },
                  { key: 'low', label: 'Low risk (OTC meds, physical therapy)' },
                  { key: 'moderate', label: 'Prescription drug management, minor surgery' },
                  { key: 'high', label: 'Elective major surgery, IV controlled meds' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setMdmRisk(item.key as typeof mdmRisk)}
                    className={`w-full p-2 rounded-xl text-left text-xs font-semibold transition-all ${
                      mdmRisk === item.key
                        ? 'bg-navy text-white shadow-sm'
                        : 'bg-white text-navy border border-gray/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MDM Output Result */}
          <div className="p-6 rounded-2xl bg-navy text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-mint text-xs font-bold uppercase tracking-wider mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                AMA 2021/2023 Guidelines: 2 of 3 Elements Met
              </div>
              <h3 className="text-3xl font-extrabold text-white font-jakarta">
                CPT {emResult.code} <span className="text-mint text-xl font-normal">({emResult.name})</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                {emResult.description}
              </p>
            </div>
            <div className="shrink-0 p-4 rounded-xl bg-white/10 border border-white/20 text-center min-w-[150px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Human Sign-Off Gate
              </span>
              <span className="text-sm font-bold text-mint font-mono block mt-0.5">
                Certified CPC Coder
              </span>
              <span className="text-[10px] text-slate-300 block mt-1">Audit Trail Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
