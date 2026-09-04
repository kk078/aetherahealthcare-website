'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileCode,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';

interface EraPreset {
  name: string;
  scenario: string;
  rawEdi: string;
  payerName: string;
  claimId: string;
  billed: number;
  paid: number;
  patientOwed: number;
  contractualAdj: number;
  groupCodes: Array<{
    group: 'CO' | 'PR' | 'OA' | 'PI';
    code: string;
    amount: number;
    meaning: string;
    action: string;
  }>;
  nextStep: string;
}

const ERA_PRESETS: EraPreset[] = [
  {
    name: 'Patient Deductible & Coinsurance',
    scenario: 'Medicare Part B paid primary; patient owes remaining deductible and 20% coinsurance.',
    rawEdi: `CLP*MED-9812*1*185.00*122.40*0.00*12*1234567890123~
CAS*CO*45*62.60~
CAS*PR*1*40.00~
CAS*PR*2*22.60~
NM1*QC*1*DOE*JANE****MI*998877665A~`,
    payerName: 'Medicare Part B',
    claimId: 'MED-9812',
    billed: 185.0,
    paid: 122.4,
    patientOwed: 62.6,
    contractualAdj: 0.0,
    groupCodes: [
      {
        group: 'CO',
        code: '45',
        amount: 0.0,
        meaning: 'Charge exceeds contracted allowable fee schedule.',
        action: 'Provider write-off. Never balance bill the patient for CO-45 under contract.',
      },
      {
        group: 'PR',
        code: '1',
        amount: 40.0,
        meaning: 'Deductible amount.',
        action: 'Bill directly to secondary supplemental insurance or patient statement.',
      },
      {
        group: 'PR',
        code: '2',
        amount: 22.6,
        meaning: 'Coinsurance amount (20% Medicare Part B statutory rate).',
        action: 'Bill secondary payer (Medigap) or collect from patient.',
      },
    ],
    nextStep: 'Check for automatic crossover to Medigap. If no crossover ERA received in 14 days, bill secondary claim with attached Medicare EOB.',
  },
  {
    name: 'Commercial Bundling Denial (CO-97)',
    scenario: 'Aetna bundled an arthrocentesis procedure into an office visit because modifier 25 was missing.',
    rawEdi: `CLP*AET-4011*1*420.00*145.00*0.00*12*9876543210987~
CAS*CO*45*110.00~
CAS*CO*97*165.00~
NM1*QC*1*SMITH*JOHN****MI*W123456789~`,
    payerName: 'Aetna Commercial',
    claimId: 'AET-4011',
    billed: 420.0,
    paid: 145.0,
    patientOwed: 0.0,
    contractualAdj: 275.0,
    groupCodes: [
      {
        group: 'CO',
        code: '45',
        amount: 110.0,
        meaning: 'PPO contractual discount off billed charge.',
        action: 'Contractual write-off.',
      },
      {
        group: 'CO',
        code: '97',
        amount: 165.0,
        meaning: 'The benefit for this service is included in the payment for another service/procedure.',
        action: 'DO NOT write off immediately. Review chart note for distinct E/M or procedure. If supported, resubmit corrected claim with Modifier 25 or 59.',
      },
    ],
    nextStep: 'Audit chart for separate E/M documentation. Resubmit claim with Modifier -25 appended to office visit code within 180-day appeal window.',
  },
  {
    name: 'Prior Authorization Absent (CO-197)',
    scenario: 'UnitedHealthcare denied MRI imaging claim because precertification was absent on file.',
    rawEdi: `CLP*UHC-7712*4*850.00*0.00*0.00*12*5556667778889~
CAS*CO*197*850.00~
NM1*QC*1*WILLIAMS*SARAH****MI*U987654321~`,
    payerName: 'UnitedHealthcare',
    claimId: 'UHC-7712',
    billed: 850.0,
    paid: 0.0,
    patientOwed: 0.0,
    contractualAdj: 850.0,
    groupCodes: [
      {
        group: 'CO',
        code: '197',
        amount: 850.0,
        meaning: 'Precertification / authorization / notification absent.',
        action: 'Provider contractual loss unless overturned. Patient CANNOT be balance-billed without signed ABN/waiver.',
      },
    ],
    nextStep: 'Contact ordering facility or UHC Provider Portal to request retroactive authorization review or initiate peer-to-peer appeal with clinical notes.',
  },
  {
    name: 'Coverage Terminated / COB (CO-27 + CO-22)',
    scenario: 'Patient changed employer coverage before date of service; Cigna denied as inactive coverage.',
    rawEdi: `CLP*CIG-2291*4*310.00*0.00*0.00*12*4443332221110~
CAS*CO*27*310.00~
NM1*QC*1*BROWN*MICHAEL****MI*U888777666~`,
    payerName: 'Cigna Health',
    claimId: 'CIG-2291',
    billed: 310.0,
    paid: 0.0,
    patientOwed: 310.0,
    contractualAdj: 0.0,
    groupCodes: [
      {
        group: 'CO',
        code: '27',
        amount: 310.0,
        meaning: 'Expenses incurred after coverage terminated.',
        action: 'Contact patient for current commercial insurance card or update primary payer in practice management system.',
      },
    ],
    nextStep: 'Run real-time 270 eligibility check against active replacement payer, update subscriber ID, and rebill primary claim.',
  },
];

export default function Era835Decoder() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [rawText, setRawText] = useState<string>(ERA_PRESETS[0].rawEdi);
  const [copied, setCopied] = useState(false);

  const activePreset = ERA_PRESETS[selectedIdx] || ERA_PRESETS[0];

  const handleSelectPreset = (idx: number) => {
    setSelectedIdx(idx);
    setRawText(ERA_PRESETS[idx].rawEdi);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden font-inter">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-[#003087] to-teal p-6 text-white">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cream text-xs font-semibold uppercase tracking-wider mb-2">
          <FileCode className="h-3.5 w-3.5 text-mint" /> ASC X12 835 Remittance Engine
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-jakarta">
          835 Electronic Remittance Advice (ERA) Decoder
        </h2>
        <p className="text-xs sm:text-sm text-cream/90 max-w-2xl mt-1">
          Paste raw 835 electronic remittance segments (CLP, CAS, SVC) or explore real clinical presets to
          translate adjustment reason codes into plain English with clear collection action items.
        </p>

        {/* Preset Selector */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">
            Sample Remittance Scenarios:
          </p>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            {ERA_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(idx)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedIdx === idx
                    ? 'bg-mint text-navy font-bold shadow-xs'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Raw EDI Viewer / Editor */}
      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <span>Raw 835 EDI Transmission Segments</span>
            <span className="text-[11px] text-slate-400 font-normal font-mono">(CLP &amp; CAS Loops)</span>
          </label>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-teal font-semibold hover:underline"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy EDI Segment'}</span>
          </button>
        </div>
        <textarea
          rows={4}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          className="w-full bg-slate-900 text-teal-300 font-mono text-xs p-3.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal leading-relaxed"
          placeholder="Paste raw 835 EDI segments starting with CLP* or CAS*..."
        />
      </div>

      {/* Visual Adjudication Ledger */}
      <div className="p-6 space-y-6">
        {/* Financial Flow Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span className="font-bold uppercase tracking-wider text-navy">
              Claim Settlement Breakdown: {activePreset.claimId} ({activePreset.payerName})
            </span>
            <span className="font-mono text-slate-500">Total Billed: ${activePreset.billed.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
              <span className="text-slate-500 text-[11px] block">Total Billed Charge</span>
              <span className="text-lg font-bold text-[#003087] font-mono">${activePreset.billed.toFixed(2)}</span>
            </div>

            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <span className="text-slate-500 text-[11px] block">Payer Paid (EFT)</span>
              <span className="text-lg font-bold text-emerald-700 font-mono">${activePreset.paid.toFixed(2)}</span>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200">
              <span className="text-slate-500 text-[11px] block">Patient Owes (PR)</span>
              <span className="text-lg font-bold text-amber-700 font-mono">
                ${activePreset.patientOwed.toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200">
              <span className="text-slate-500 text-[11px] block">Contractual Adj (CO)</span>
              <span className="text-lg font-bold text-purple-700 font-mono">
                ${activePreset.contractualAdj.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Decoded Adjustment Codes */}
        <div>
          <h3 className="text-xs font-bold text-navy uppercase tracking-wider mb-3">
            Decoded Adjustment Codes &amp; Remittance Groups
          </h3>
          <div className="space-y-3">
            {activePreset.groupCodes.map((gc, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                        gc.group === 'CO'
                          ? 'bg-purple-100 text-purple-900'
                          : gc.group === 'PR'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {gc.group}-{gc.code}
                    </span>
                    <span className="font-bold text-navy">
                      {gc.group === 'CO'
                        ? 'Contractual Obligation'
                        : gc.group === 'PR'
                        ? 'Patient Responsibility'
                        : 'Other Adjustment'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">${gc.amount.toFixed(2)}</span>
                </div>

                <p className="text-slate-700"><strong className="text-slate-500">Meaning:</strong> {gc.meaning}</p>
                <p className="text-teal-800 bg-teal-50/60 p-2 rounded-lg border border-teal-100/80">
                  <strong className="text-teal-900">Billing Action:</strong> {gc.action}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Immediate Action */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950 block uppercase tracking-wider text-[11px]">
                Recommended Next Step for Practice:
              </span>
              <p className="text-emerald-900 mt-0.5">{activePreset.nextStep}</p>
            </div>
          </div>

          <Link
            href="/free-assessment"
            className="bg-[#003087] hover:bg-[#001A52] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors whitespace-nowrap shadow-xs"
          >
            Have Aethera Audit Remittances
          </Link>
        </div>
      </div>
    </div>
  );
}
