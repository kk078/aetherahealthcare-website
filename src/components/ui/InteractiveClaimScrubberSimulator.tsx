'use client';

import { useState } from 'react';
import {
  Play,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  UserCheck,
} from 'lucide-react';

interface ClaimScenario {
  id: string;
  name: string;
  specialty: string;
  rawCodes: Array<{ code: string; label: string; charge: number; modifier?: string; units?: string }>;
  unscrubbedDenialCode: string;
  unscrubbedDenialReason: string;
  algorithmicFix: string;
  humanVerificationPrompt: string;
  signedModifier: string;
  signedHash: string;
}

const SCENARIOS: ClaimScenario[] = [
  {
    id: 'derm',
    name: 'Dermatology: E/M 99214 + Biopsy 11104',
    specialty: 'Dermatology',
    rawCodes: [
      { code: '99214', label: 'Established Patient E/M Level 4', charge: 215.0 },
      { code: '11104', label: 'Punch Biopsy Skin Single', charge: 185.0 },
    ],
    unscrubbedDenialCode: 'CARC 97 / NCCI Column 1-2 Edit',
    unscrubbedDenialReason:
      'Payment adjusted because procedure is bundled into E/M service or routine pre/post care. Line 1 (99214) denied entirely.',
    algorithmicFix:
      'Algorithm detected same-day minor procedure (0-day global). NCCI Modifier Indicator = 1. Validates that medical decision making supports Level 4 visit independent of biopsy.',
    humanVerificationPrompt:
      'Certified AAPC Coder must personally verify documented eczema flare note is independent of scapular biopsy note.',
    signedModifier: 'Appended Modifier -25 to 99214; Appended Modifier -LT to 11104',
    signedHash: '7a8f092...c41e (Digital Signature Verified)',
  },
  {
    id: 'oncol',
    name: 'Oncology: Bevacizumab 350mg from 400mg Vial',
    specialty: 'Medical Oncology',
    rawCodes: [
      { code: 'J9035', label: 'Injection, Bevacizumab, 10 mg', charge: 3200.0, units: '35 units' },
    ],
    unscrubbedDenialCode: 'CARC 16 / RARC N382 & CMS Waste Mandate',
    unscrubbedDenialReason:
      'Missing 11-digit zero-padded NDC format. Undocumented remainder from 400mg single-dose vial violates CMS Section 90004 waste reporting.',
    algorithmicFix:
      'Algorithm auto-pads 10-digit NDC (50242-060-01) to 11-digit 5-4-2 standard (50242-0060-01); calculates 35 units administered and 5 units discarded.',
    humanVerificationPrompt:
      'Oncology billing specialist verifies biological sharps disposal log and signs off on mandatory Modifier -JW line split.',
    signedModifier: 'Split J9035 into 35 administered units + 5 discarded units with Modifier -JW',
    signedHash: 'b490e11...99ef (Audit Block #8102)',
  },
  {
    id: 'dental',
    name: 'Oral Surgery: Impacted Tooth #17 in Jaw Fracture',
    specialty: 'Oral-Maxillofacial',
    rawCodes: [
      { code: 'D7240', label: 'Removal Impacted Tooth Completely Bony', charge: 850.0, units: 'Tooth #17' },
    ],
    unscrubbedDenialCode: 'Dental Benefit Exhaustion / Non-Covered Medical',
    unscrubbedDenialReason:
      'Dental insurer covers maximum $1,500 annual limit; commercial medical insurer rejects claim citing Dental Procedure Exclusion.',
    algorithmicFix:
      'Algorithm flags trauma etiology (fracture line involvement); initiates crosswalk from CDT D7240 to medical CPT 41899 on CMS-1500 with trauma ICD-10 link.',
    humanVerificationPrompt:
      'Maxillofacial billing specialist reviews emergency CBCT radiograph, attaches surgical narrative, and signs off on commercial medical claim.',
    signedModifier: 'Cross-coded to CMS-1500 with CPT 41899 and ICD-10 S02.609A trauma diagnosis',
    signedHash: 'd3821aa...2104 (Trauma File #492)',
  },
];

export default function InteractiveClaimScrubberSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<ClaimScenario>(SCENARIOS[0]);
  const [scrubberStage, setScrubberStage] = useState<'raw' | 'scanned' | 'signed'>('raw');

  const handleSelectScenario = (sc: ClaimScenario) => {
    setSelectedScenario(sc);
    setScrubberStage('raw');
  };

  const handleRunScrubber = () => {
    setScrubberStage('scanned');
  };

  const handleHumanSignoff = () => {
    setScrubberStage('signed');
  };

  const handleReset = () => {
    setScrubberStage('raw');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray/15 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal bg-teal/10 px-3 py-1 rounded-full">
            Hands-On Simulation
          </span>
          <h3 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-navy tracking-tight mt-2">
            Interactive Claim Scrubber &amp; Human Sign-Off Simulator
          </h3>
          <p className="text-gray text-xs sm:text-sm mt-1">
            Experience how Aethera catches unbundling violations and requires certified human sign-off before dispatch.
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedScenario.id === sc.id
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-cream text-gray hover:text-navy border border-gray/10'
              }`}
            >
              {sc.specialty}
            </button>
          ))}
        </div>
      </div>

      {/* Simulator Workspace Canvas */}
      <div className="p-6 sm:p-8 rounded-2xl bg-cream border border-gray/15 space-y-6">
        {/* Scenario Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray/15 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal">Active Encounter</span>
            <h4 className="font-extrabold text-navy text-lg">{selectedScenario.name}</h4>
          </div>
          <div className="flex items-center gap-2">
            {scrubberStage === 'raw' && (
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                Stage 1: Raw Claim Ingested
              </span>
            )}
            {scrubberStage === 'scanned' && (
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold animate-pulse">
                Stage 2: Denial Risk Detected
              </span>
            )}
            {scrubberStage === 'signed' && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Stage 3: Human Sovereign Sign-Off Complete
              </span>
            )}
          </div>
        </div>

        {/* Raw Line Items */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray uppercase tracking-wider">Claim Line Items</p>
          <div className="space-y-2">
            {selectedScenario.rawCodes.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-gray/15 flex flex-wrap items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-navy text-sm bg-gray/10 px-2.5 py-1 rounded-lg">
                    {item.code}
                  </span>
                  <div>
                    <span className="font-bold text-sm text-navy block">{item.label}</span>
                    {item.units && (
                      <span className="text-xs text-gray font-mono">{item.units}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-navy text-sm">
                    ${item.charge.toFixed(2)}
                  </span>
                  {scrubberStage === 'signed' && (
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Approved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls & Stage Output */}
        {scrubberStage === 'raw' && (
          <div className="p-5 rounded-2xl bg-white border border-gray/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray">
              Click below to execute our deterministic rule engine against 1,300+ NCCI and payer edits.
            </div>
            <button
              onClick={handleRunScrubber}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal text-white font-bold text-sm hover:bg-navy transition-all shadow-md"
            >
              <Play className="h-4 w-4 fill-current" /> Run Deterministic Scrubber
            </button>
          </div>
        )}

        {scrubberStage === 'scanned' && (
          <div className="space-y-4">
            {/* Denial Warning */}
            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Deterministic Edit Warning: {selectedScenario.unscrubbedDenialCode}
              </div>
              <p className="text-xs leading-relaxed">{selectedScenario.unscrubbedDenialReason}</p>
            </div>

            {/* AI Recommendation */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-800">
                <Cpu className="h-4 w-4 text-emerald-600" />
                Deterministic Algorithmic Recommendation
              </div>
              <p className="text-xs leading-relaxed">{selectedScenario.algorithmicFix}</p>
            </div>

            {/* Human Gate Action */}
            <div className="p-6 rounded-2xl bg-navy text-white space-y-4">
              <div className="flex items-center gap-2 text-mint font-bold text-xs uppercase tracking-wider">
                <UserCheck className="h-4 w-4" /> Sovereign Human Gate Authorization Required
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedScenario.humanVerificationPrompt}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-slate-400">
                  Credential: AAPC CPC-883921 (Active)
                </div>
                <button
                  onClick={handleHumanSignoff}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-mint text-navy font-extrabold text-sm hover:bg-white transition-all shadow-lg shadow-mint/20"
                >
                  <ShieldCheck className="h-4 w-4" /> Sign Off &amp; Authorize Claim Release
                </button>
              </div>
            </div>
          </div>
        )}

        {scrubberStage === 'signed' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-emerald-900 text-white space-y-3 border border-emerald-400/40">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Clean Claim Certified • Ready for ANSI 837P Dispatch
                </span>
                <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
                  100% Contractual SLA Guarantee
                </span>
              </div>

              <div className="text-sm font-semibold text-white">
                {selectedScenario.signedModifier}
              </div>

              <div className="pt-2 border-t border-emerald-700/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-emerald-200">
                <span>Proof: {selectedScenario.signedHash}</span>
                <span>$0.00 Balance Variance Verified</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray hover:text-navy hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Simulator
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
