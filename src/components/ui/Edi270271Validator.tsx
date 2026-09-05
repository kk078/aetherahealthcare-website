'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileCode2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Copy,
  Info,
} from 'lucide-react';
import { PRIMARY_EXPERT_EMAIL } from '@/lib/worker';

interface Sample271 {
  title: string;
  tag: string;
  payer: string;
  subscriber: string;
  status: 'active' | 'inactive';
  rawEdi: string;
  parsed: {
    planName: string;
    payerId: string;
    memberId: string;
    groupNumber: string;
    effectiveDate: string;
    copay: string;
    coinsurance: string;
    individualDeductible: string;
    deductibleRemaining: string;
    oopMaxRemaining: string;
    priorAuthRequired: boolean;
    primaryCareAssigned?: string;
  };
}

const SAMPLES: Record<string, Sample271> = {
  commercial_active: {
    title: 'Aetna Commercial Choice POS II (Active)',
    tag: 'Standard In-Network',
    payer: 'Aetna Life Insurance Company',
    subscriber: 'ELEANOR ROOSEVELT (ID: W19482751)',
    status: 'active',
    rawEdi: `ISA*00*          *00*          *ZZ*AETNA          *ZZ*AETHERA        *260905*0830*^*00501*000000001*0*P*:~
GS*HB*AETNA*AETHERA*20260905*0830*1*X*005010X279A1~
ST*271*0001*005010X279A1~
BHT*0022*11*REQ001*20260905*0830~
HL*1**20*1~
NM1*PR*2*AETNA*****PI*60054~
HL*2*1*21*1~
NM1*1P*1*CARDIOLOGY ASSOC*****XX*1942857193~
HL*3*2*22*0~
TRN*2*CHK2026090501*9999999999~
NM1*IL*1*ROOSEVELT*ELEANOR****MI*W19482751~
REF*6P*GRP883019~
DMG*D8*19780312*F~
DTP*291*D8*20260101~
EB*1*IND*30*PR~
EB*B**98***25*****Y~
EB*C*IND*30*29*450*****Y~
EB*A*IND*30***.20****Y~
EB*G*IND*30*29*2400*****Y~
SE*18*0001~
GE*1*1~
IEA*1*000000001~`,
    parsed: {
      planName: 'Aetna Choice POS II (Open Access)',
      payerId: '60054',
      memberId: 'W19482751',
      groupNumber: 'GRP883019',
      effectiveDate: '2026-01-01',
      copay: '$25.00 (Office Visit)',
      coinsurance: '20% after deductible',
      individualDeductible: '$1,500.00',
      deductibleRemaining: '$450.00 remaining',
      oopMaxRemaining: '$2,400.00 remaining',
      priorAuthRequired: false,
    },
  },
  hdhp_high_deductible: {
    title: 'UHC Choice Plus HDHP (High Unmet Deductible)',
    tag: 'High Risk Self-Pay',
    payer: 'UnitedHealthcare Insurance Co',
    subscriber: 'MARCUS AURELIUS (ID: 984712034)',
    status: 'active',
    rawEdi: `ISA*00*          *00*          *ZZ*UHC            *ZZ*AETHERA        *260905*0915*^*00501*000000002*0*P*:~
GS*HB*UHC*AETHERA*20260905*0915*2*X*005010X279A1~
ST*271*0002*005010X279A1~
BHT*0022*11*REQ002*20260905*0915~
HL*1**20*1~
NM1*PR*2*UNITED HEALTHCARE*****PI*87726~
HL*2*1*21*1~
NM1*1P*1*ORTHOPEDIC SURG CTR*****XX*1851493021~
HL*3*2*22*0~
TRN*2*CHK2026090502*9999999999~
NM1*IL*1*AURELIUS*MARCUS****MI*984712034~
REF*6P*GRP442019~
DMG*D8*19851120*M~
DTP*291*D8*20260101~
EB*1*IND*30*PR~
EB*C*IND*30*29*3200*****Y~
EB*A*IND*30***.20****Y~
EB*G*IND*30*29*5800*****Y~
MSG*PRIOR AUTHORIZATION MANDATORY FOR OUTPATIENT SURGICAL PROCEDURES~
SE*18*0002~
GE*1*2~
IEA*1*000000002~`,
    parsed: {
      planName: 'UnitedHealthcare Choice Plus Qualified HDHP',
      payerId: '87726',
      memberId: '984712034',
      groupNumber: 'GRP442019',
      effectiveDate: '2026-01-01',
      copay: '$0.00 (Deductible applies first)',
      coinsurance: '20% after deductible',
      individualDeductible: '$4,000.00',
      deductibleRemaining: '$3,200.00 remaining (Unmet)',
      oopMaxRemaining: '$5,800.00 remaining',
      priorAuthRequired: true,
    },
  },
  inactive_coverage: {
    title: 'Medicare Part B / Commercial Terminated (Inactive)',
    tag: 'Rejection Risk (CO-27)',
    payer: 'Blue Cross Blue Shield Florida',
    subscriber: 'BENJAMIN FRANKLIN (ID: FLX9928174)',
    status: 'inactive',
    rawEdi: `ISA*00*          *00*          *ZZ*BCBSFL         *ZZ*AETHERA        *260905*0945*^*00501*000000003*0*P*:~
GS*HB*BCBSFL*AETHERA*20260905*0945*3*X*005010X279A1~
ST*271*0003*005010X279A1~
BHT*0022*11*REQ003*20260905*0945~
HL*1**20*1~
NM1*PR*2*BCBS FLORIDA*****PI*00590~
HL*2*1*21*1~
NM1*1P*1*FAMILY PRACTICE CLINIC*****XX*1749204851~
HL*3*2*22*0~
TRN*2*CHK2026090503*9999999999~
NM1*IL*1*FRANKLIN*BENJAMIN****MI*FLX9928174~
REF*6P*TERM881~
DMG*D8*19600117*M~
DTP*292*D8*20260630~
EB*6*IND*30*PR~
MSG*COVERAGE TERMINATED EFFECTIVE 2026-06-30. PATIENT INACTIVE.~
SE*16*0003~
GE*1*3~
IEA*1*000000003~`,
    parsed: {
      planName: 'Florida Blue BlueOptions PPO',
      payerId: '00590',
      memberId: 'FLX9928174',
      groupNumber: 'TERM881',
      effectiveDate: 'Terminated 2026-06-30',
      copay: 'N/A (Inactive)',
      coinsurance: 'N/A (Inactive)',
      individualDeductible: 'N/A',
      deductibleRemaining: 'Coverage Terminated',
      oopMaxRemaining: 'N/A',
      priorAuthRequired: false,
    },
  },
};

export default function Edi270271Validator() {
  const [selectedKey, setSelectedKey] = useState<string>('commercial_active');
  const [ediInput, setEdiInput] = useState<string>(SAMPLES.commercial_active.rawEdi);
  const [copied, setCopied] = useState(false);

  const sample = SAMPLES[selectedKey] || SAMPLES.commercial_active;

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
      {/* Sample Selector Bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray/20 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-teal font-bold text-xs uppercase tracking-wider">
              <FileCode2 className="h-4 w-4" />
              <span>ANSI X12 270/271 Real-Time Parser</span>
            </div>
            <h2 className="text-xl font-bold text-navy mt-1">Select ANSI X12 271 Eligibility Transaction</h2>
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
                {SAMPLES[key].title.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Column Interactive Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Raw ANSI X12 EDI Inspector */}
        <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md flex flex-col space-y-4 text-white font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-slate-400 font-semibold text-[11px] ml-2">271_BENEFIT_RESPONSE.X12</span>
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
            rows={15}
            className="w-full bg-transparent text-teal-300 focus:outline-none resize-none font-mono text-[11px] leading-relaxed select-all"
            spellCheck={false}
          />

          {/* Segment Key Guide */}
          <div className="border-t border-slate-800 pt-3 text-[10px] text-slate-400 space-y-1">
            <p className="font-bold text-slate-300">ANSI X12 271 Segment Dictionary:</p>
            <p>
              <strong className="text-teal-400">NM1*PR</strong> = Payer ID &amp; Name ·{' '}
              <strong className="text-teal-400">NM1*IL</strong> = Insured Member ·{' '}
              <strong className="text-teal-400">DTP*291</strong> = Benefit Effective Date
            </p>
            <p>
              <strong className="text-teal-400">EB*1</strong> = Active Coverage ·{' '}
              <strong className="text-teal-400">EB*6</strong> = Inactive ·{' '}
              <strong className="text-teal-400">EB*C</strong> = Deductible ·{' '}
              <strong className="text-teal-400">EB*B</strong> = Copay ·{' '}
              <strong className="text-teal-400">EB*A</strong> = Coinsurance
            </p>
          </div>
        </div>

        {/* Right: Decoded Human-Readable Benefit Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray/20 shadow-sm space-y-6">
            {/* Header Status */}
            <div className="flex items-start justify-between gap-4 border-b border-gray/15 pb-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Payer Verified Status</span>
                <div className="flex items-center gap-2 mt-1">
                  {sample.status === 'active' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Active In-Network Coverage
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold text-xs">
                      <XCircle className="h-4 w-4 text-red-600" /> Inactive / Terminated Coverage (CARC CO-27)
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">Payer ID: {sample.parsed.payerId}</span>
                <span className="text-xs font-bold text-navy">{sample.payer}</span>
              </div>
            </div>

            {/* Subscriber Demographics */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-cream/40 border border-gray/15 text-xs">
              <div>
                <span className="text-slate-500 block font-semibold">Subscriber / Patient:</span>
                <span className="font-bold text-navy text-sm">{sample.subscriber}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Group Number:</span>
                <span className="font-mono text-slate-800 font-bold">{sample.parsed.groupNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Plan Description:</span>
                <span className="text-slate-800 font-medium">{sample.parsed.planName}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Coverage Window:</span>
                <span className="text-slate-800 font-medium">{sample.parsed.effectiveDate}</span>
              </div>
            </div>

            {/* Financial Benefit Matrix */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">Patient Financial Responsibility Grid</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Primary Copay</span>
                  <strong className="text-sm font-bold text-navy mt-0.5 block">{sample.parsed.copay}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Deductible Remaining</span>
                  <strong className="text-sm font-bold text-teal mt-0.5 block">{sample.parsed.deductibleRemaining}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Coinsurance Rate</span>
                  <strong className="text-sm font-bold text-navy mt-0.5 block">{sample.parsed.coinsurance}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-3 flex items-center justify-between">
                  <span className="text-slate-600">Remaining Out-of-Pocket Maximum:</span>
                  <strong className="text-navy font-bold">{sample.parsed.oopMaxRemaining}</strong>
                </div>
              </div>
            </div>

            {/* Prior Authorization Warning */}
            {sample.parsed.priorAuthRequired && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Mandatory Prior Authorization Warning</strong>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    This benefit plan requires an electronic prior authorization reference on Loop 2300 segment REF*G1 before outpatient services or imaging can be submitted. Failure to obtain prior auth triggers CARC 197 non-appealable denial.
                  </p>
                </div>
              </div>
            )}

            {/* Inactive Coverage Denial Action Advice */}
            {sample.status === 'inactive' && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5">
                <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Denial Prevention Protocol (CARC CO-27)</strong>
                  <p className="mt-0.5 text-red-800 leading-relaxed">
                    Do not submit claims to this payer under the terminated policy. Request current primary insurance card or convert patient account to Self-Pay with a Good Faith Estimate under the No Surprises Act.
                  </p>
                  <Link
                    href="/tools/good-faith-estimate-generator"
                    className="inline-flex items-center gap-1 font-bold text-red-700 hover:text-red-900 underline mt-1.5"
                  >
                    Generate Self-Pay GFE Form <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RCM Automation Integration Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-navy via-navy to-teal p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-bold">Automate 270/271 Real-Time Eligibility Verification</h3>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
            Eliminate front-end eligibility denials (CO-27, CO-197, CO-4) forever. Aethera automates real-time 270/271 batch verification sweeps 48 hours and 2 hours prior to every patient visit across 10,600+ payers.
          </p>
        </div>
        <Link
          href="/services/eligibility-verification"
          className="px-5 py-2.5 rounded-xl bg-teal hover:bg-white hover:text-navy text-white font-bold text-xs transition-colors shrink-0 shadow-sm"
        >
          Explore Eligibility Services
        </Link>
      </div>
    </div>
  );
}
