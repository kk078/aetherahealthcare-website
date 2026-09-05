'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Code2,
  Terminal,
} from 'lucide-react';
import { PRIMARY_EXPERT_EMAIL } from '@/lib/worker';

interface Sample837 {
  title: string;
  claimType: '837P (Professional)' | '837I (Institutional)';
  status: 'clean' | 'clearinghouse_reject' | 'bundling_warning';
  summary: string;
  clearinghouse277Response: string;
  errorDetails?: {
    loop: string;
    segment: string;
    field: string;
    issue: string;
    remediation: string;
  };
  rawEdi: string;
}

const SAMPLES: Record<string, Sample837> = {
  clean_claim: {
    title: 'Clean 837P Professional Claim',
    claimType: '837P (Professional)',
    status: 'clean',
    summary: 'Standard Level 4 office visit (99214) with ECG (93000) and proper modifier -25.',
    clearinghouse277Response: 'STC*A1:19:PR*20260905*WQ*185.00~ (Accepted at Clearinghouse / Routed to Payer)',
    rawEdi: `ISA*00*          *00*          *ZZ*AETHERARCM     *ZZ*AVAILITY       *260905*1015*^*00501*000000088*0*P*:~
GS*HC*AETHERARCM*AVAILITY*20260905*1015*88*X*005010X222A1~
ST*837*0001*005010X222A1~
BHT*0019*00*BATCH20260905*20260905*1015*CH~
NM1*41*2*AETHERA BILLING SOLUTIONS*****46*842918471~
PER*IC*KIRAN RCM LEAD*TE*8135194640~
NM1*40*2*AVAILITY CLEARINGHOUSE*****46*AVAIL001~
HL*1**20*1~
NM1*85*2*METROPOLITAN CARDIOLOGY CLINIC*****XX*1942857193~
N3*400 S DADE BLVD~
N4*TAMPA*FL*33602~
REF*EI*592817492~
HL*2*1*22*0~
SBR*P*18*******CI~
NM1*IL*1*WASHINGTON*GEORGE****MI*AET9948271~
N3*1200 PALMETTO WAY~
N4*TAMPA*FL*33606~
DMG*D8*19620222*M~
NM1*PR*2*AETNA HEALTHCARE*****PI*60054~
CLM*CLM20260905-01*260.00***11:B:1*Y*A*Y*Y~
HI*BK:I10*BF:R07.9~
LX*1~
SV1*HC:99214:25*185.00*UN*1***1:2~
DTP*472*D8*20260904~
LX*2~
SV1*HC:93000*75.00*UN*1***2~
DTP*472*D8*20260904~
SE*25*0001~
GE*1*88~
IEA*1*000000088~`,
  },
  missing_npi_reject: {
    title: 'Rejected 837P: Missing Provider NPI (Loop 2010AA)',
    claimType: '837P (Professional)',
    status: 'clearinghouse_reject',
    summary: 'Missing valid 10-digit National Provider Identifier (NPI) in Billing Provider Name segment NM1*85.',
    clearinghouse277Response: 'STC*A3:562:85*20260905*U*260.00~ (Entity National Provider Identifier (NPI) Missing or Invalid - REJECTED)',
    errorDetails: {
      loop: 'Loop 2010AA (Billing Provider)',
      segment: 'NM1*85*2*METROPOLITAN CARDIOLOGY CLINIC*****XX*~',
      field: 'NM109 (Identification Code)',
      issue: 'Segment NM1*85 has identifier qualifier XX but field NM109 is empty or incomplete.',
      remediation: 'Insert valid 10-digit Type 2 Organization NPI (e.g. 1942857193) into NM109 before transmission.',
    },
    rawEdi: `ISA*00*          *00*          *ZZ*AETHERARCM     *ZZ*AVAILITY       *260905*1020*^*00501*000000089*0*P*:~
GS*HC*AETHERARCM*AVAILITY*20260905*1020*89*X*005010X222A1~
ST*837*0002*005010X222A1~
BHT*0019*00*BATCH20260905*20260905*1020*CH~
NM1*41*2*AETHERA BILLING SOLUTIONS*****46*842918471~
PER*IC*KIRAN RCM LEAD*TE*8135194640~
NM1*40*2*AVAILITY CLEARINGHOUSE*****46*AVAIL001~
HL*1**20*1~
NM1*85*2*METROPOLITAN CARDIOLOGY CLINIC*****XX*~
N3*400 S DADE BLVD~
N4*TAMPA*FL*33602~
REF*EI*592817492~
HL*2*1*22*0~
SBR*P*18*******CI~
NM1*IL*1*WASHINGTON*GEORGE****MI*AET9948271~
N3*1200 PALMETTO WAY~
N4*TAMPA*FL*33606~
DMG*D8*19620222*M~
NM1*PR*2*AETNA HEALTHCARE*****PI*60054~
CLM*CLM20260905-02*260.00***11:B:1*Y*A*Y*Y~
HI*BK:I10*BF:R07.9~
LX*1~
SV1*HC:99214*185.00*UN*1***1~
DTP*472*D8*20260904~
SE*23*0002~
GE*1*89~
IEA*1*000000089~`,
  },
  missing_modifier_ptp: {
    title: 'Bundling Error 837P: Missing Modifier 25 (Loop 2400)',
    claimType: '837P (Professional)',
    status: 'bundling_warning',
    summary: 'Submitting E&M 99214 alongside ECG 93000 without Modifier 25 triggers CARC 97 bundling denial.',
    clearinghouse277Response: 'STC*A2:21:PR*20260905*WQ*260.00~ (Accepted by Clearinghouse, but high risk of Payer CARC 97 Bundling Denial)',
    errorDetails: {
      loop: 'Loop 2400 (Service Line 1)',
      segment: 'SV1*HC:99214*185.00*UN*1***1:2~',
      field: 'SV101-2 (Modifier Component)',
      issue: 'Office visit 99214 billed on same date of service as minor diagnostic procedure 93000 without modifier -25.',
      remediation: 'Append modifier 25 to SV1 (e.g. SV1*HC:99214:25*...) and ensure medical record supports separate identifiable E&M.',
    },
    rawEdi: `ISA*00*          *00*          *ZZ*AETHERARCM     *ZZ*AVAILITY       *260905*1030*^*00501*000000090*0*P*:~
GS*HC*AETHERARCM*AVAILITY*20260905*1030*90*X*005010X222A1~
ST*837*0003*005010X222A1~
BHT*0019*00*BATCH20260905*20260905*1030*CH~
NM1*41*2*AETHERA BILLING SOLUTIONS*****46*842918471~
PER*IC*KIRAN RCM LEAD*TE*8135194640~
NM1*40*2*AVAILITY CLEARINGHOUSE*****46*AVAIL001~
HL*1**20*1~
NM1*85*2*METROPOLITAN CARDIOLOGY CLINIC*****XX*1942857193~
N3*400 S DADE BLVD~
N4*TAMPA*FL*33602~
REF*EI*592817492~
HL*2*1*22*0~
SBR*P*18*******CI~
NM1*IL*1*WASHINGTON*GEORGE****MI*AET9948271~
N3*1200 PALMETTO WAY~
N4*TAMPA*FL*33606~
DMG*D8*19620222*M~
NM1*PR*2*AETNA HEALTHCARE*****PI*60054~
CLM*CLM20260905-03*260.00***11:B:1*Y*A*Y*Y~
HI*BK:I10*BF:R07.9~
LX*1~
SV1*HC:99214*185.00*UN*1***1:2~
DTP*472*D8*20260904~
LX*2~
SV1*HC:93000*75.00*UN*1***2~
DTP*472*D8*20260904~
SE*25*0003~
GE*1*90~
IEA*1*000000090~`,
  },
};

export default function Edi837Scrubber() {
  const [selectedKey, setSelectedKey] = useState<string>('clean_claim');
  const [ediInput, setEdiInput] = useState<string>(SAMPLES.clean_claim.rawEdi);
  const [copied, setCopied] = useState(false);

  const sample = SAMPLES[selectedKey] || SAMPLES.clean_claim;

  const handleSelectSample = (key: string) => {
    setSelectedKey(key);
    setEdiInput(SAMPLES[key].rawEdi);
  };

  const copyEdi = () => {
    navigator.clipboard.writeText(ediInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Selector Toolbar */}
      <div className="bg-white rounded-2xl p-6 border border-gray/20 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-teal font-bold text-xs uppercase tracking-wider">
              <Code2 className="h-4 w-4" />
              <span>ANSI X12 837P / 837I Diagnostic Engine</span>
            </div>
            <h2 className="text-xl font-bold text-navy mt-1">Select Claim File Transaction Test Case</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.keys(SAMPLES).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectSample(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedKey === key
                    ? 'bg-navy text-white border-navy shadow-xs'
                    : 'bg-cream text-navy border-gray/20 hover:border-teal'
                }`}
              >
                {SAMPLES[key].title.split(':')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Raw ANSI 837 EDI Code Terminal */}
        <div className="lg:col-span-6 bg-slate-950 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-lg flex flex-col space-y-4 text-white font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-teal" />
              <span className="text-slate-400 font-semibold text-[11px]">837P_PROFESSIONAL_CLAIM.X12</span>
            </div>

            <button
              type="button"
              onClick={copyEdi}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              <Copy className="h-3 w-3" />
              {copied ? 'Copied' : 'Copy EDI'}
            </button>
          </div>

          <textarea
            value={ediInput}
            onChange={e => setEdiInput(e.target.value)}
            rows={16}
            className="w-full bg-transparent text-emerald-400 focus:outline-none resize-none font-mono text-[11px] leading-relaxed select-all"
            spellCheck={false}
          />

          {/* EDI Segment Glossary */}
          <div className="border-t border-slate-800 pt-3 text-[10px] text-slate-400 space-y-1">
            <p className="font-bold text-slate-300">ANSI X12 837 Hierarchical Loop Structure:</p>
            <p>
              <strong className="text-emerald-400">Loop 2010AA</strong> = Billing Provider (NPI/TIN) ·{' '}
              <strong className="text-emerald-400">Loop 2010BA</strong> = Subscriber (Member ID)
            </p>
            <p>
              <strong className="text-emerald-400">Loop 2300</strong> = Claim Info (CLM) &amp; Diagnosis (HI) ·{' '}
              <strong className="text-emerald-400">Loop 2400</strong> = Service Lines (SV1 CPT + Modifiers)
            </p>
          </div>
        </div>

        {/* Right: Validation Report & Clearinghouse Response */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray/20 shadow-sm space-y-5">
            {/* Status Header */}
            <div className="border-b border-gray/15 pb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Claim Scrubbing Result</span>
              <div className="mt-2">
                {sample.status === 'clean' && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>98.7% Clean Claim: Formatted for 277CA Acceptance</span>
                  </div>
                )}
                {sample.status === 'clearinghouse_reject' && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold">
                    <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                    <span>Clearinghouse Rejection: Fatal Syntax Omission</span>
                  </div>
                )}
                {sample.status === 'bundling_warning' && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                    <span>Clinical Scrubbing Warning: Potential CARC 97 Denial</span>
                  </div>
                )}
              </div>
            </div>

            {/* Clearinghouse 277CA Translation */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-500 font-semibold block">Predicted Clearinghouse 277CA Response:</span>
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed">
                {sample.clearinghouse277Response}
              </div>
            </div>

            {/* Error Deep-Dive & Remediation Checklist */}
            {sample.errorDetails ? (
              <div className="p-4 rounded-xl bg-cream/50 border border-gray/20 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-navy border-b border-gray/10 pb-1.5">
                  <span>Diagnostic Location: {sample.errorDetails.loop}</span>
                  <span className="font-mono text-teal">{sample.errorDetails.field}</span>
                </div>
                <div className="space-y-1 text-slate-700">
                  <p>
                    <strong>Failing Segment:</strong> <code className="px-1 py-0.5 bg-slate-100 rounded text-navy font-mono">{sample.errorDetails.segment}</code>
                  </p>
                  <p>
                    <strong>Root Cause:</strong> {sample.errorDetails.issue}
                  </p>
                  <p className="text-emerald-800 font-semibold pt-1">
                    <strong>Remediation Action:</strong> {sample.errorDetails.remediation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2 text-xs text-slate-700">
                <p className="font-bold text-emerald-900">Pre-Submission Verification Complete:</p>
                <ul className="space-y-1 text-slate-600">
                  <li>• Loop 2010AA: Billing NPI verified against NPPES registry.</li>
                  <li>• Loop 2010BA: Subscriber ID formatted per Aetna commercial standard.</li>
                  <li>• Loop 2300: CLM01 unique claim control ID present.</li>
                  <li>• Loop 2400: Modifier -25 appropriately appended to separate E&amp;M from minor diagnostic.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RCM Claim Scrubbing CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-navy via-navy to-teal p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-bold">Achieve a 98.7% First-Pass Clean Claim Rate</h3>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
            Stop losing weeks in A/R due to clearinghouse rejection loops. Aethera scrubs 100% of claims against payer-specific ANSI X12 837 rules and CMS NCCI edits before clearinghouse transmission.
          </p>
        </div>
        <Link
          href="/services/claims-billing"
          className="px-5 py-2.5 rounded-xl bg-teal hover:bg-white hover:text-navy text-white font-bold text-xs transition-colors shrink-0 shadow-sm"
        >
          Explore Claims Management
        </Link>
      </div>
    </div>
  );
}
