'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Loader2,
  FileCode,
  ShieldCheck,
  FileText,
  DollarSign,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

interface RetinaDrug {
  id: string;
  name: string;
  hcpcs: string;
  ndc: string;
  unitDef: string; // e.g., '1 mg' or '0.1 mg'
  standardDoseUnits: number;
  sdvTotalUnits: number; // total units packaged in vial
  avgPricePerUnit: number;
  aspPrice: number;
}

const RETINA_DRUGS: RetinaDrug[] = [
  {
    id: 'eylea_2mg',
    name: 'Eylea® (aflibercept) 2 mg',
    hcpcs: 'J0178',
    ndc: '61755-0005-02',
    unitDef: '1 mg = 1 unit',
    standardDoseUnits: 2,
    sdvTotalUnits: 4,
    avgPricePerUnit: 925.0,
    aspPrice: 1850.0,
  },
  {
    id: 'eylea_hd_8mg',
    name: 'Eylea® HD (aflibercept) 8 mg',
    hcpcs: 'J0177',
    ndc: '61755-0006-01',
    unitDef: '1 mg = 1 unit',
    standardDoseUnits: 8,
    sdvTotalUnits: 10,
    avgPricePerUnit: 328.0,
    aspPrice: 2624.0,
  },
  {
    id: 'vabysmo_6mg',
    name: 'Vabysmo® (faricimab-svoa) 6 mg',
    hcpcs: 'Q5128',
    ndc: '50242-0096-01',
    unitDef: '1 mg = 1 unit',
    standardDoseUnits: 6,
    sdvTotalUnits: 8,
    avgPricePerUnit: 365.0,
    aspPrice: 2190.0,
  },
  {
    id: 'lucentis_05mg',
    name: 'Lucentis® (ranibizumab) 0.5 mg',
    hcpcs: 'J2778',
    ndc: '50242-0080-01',
    unitDef: '0.1 mg = 1 unit',
    standardDoseUnits: 5,
    sdvTotalUnits: 8,
    avgPricePerUnit: 228.0,
    aspPrice: 1140.0,
  },
  {
    id: 'syfovre_15mg',
    name: 'Syfovre® (pegcetacoplan) 15 mg',
    hcpcs: 'J2781',
    ndc: '82603-0100-01',
    unitDef: '1 mg = 1 unit',
    standardDoseUnits: 15,
    sdvTotalUnits: 17,
    avgPricePerUnit: 146.0,
    aspPrice: 2190.0,
  },
  {
    id: 'izervay_2mg',
    name: 'Izervay® (avacincaptad pegol) 2 mg',
    hcpcs: 'J2782',
    ndc: '70860-0441-01',
    unitDef: '0.1 mg = 1 unit',
    standardDoseUnits: 20,
    sdvTotalUnits: 25,
    avgPricePerUnit: 105.0,
    aspPrice: 2100.0,
  },
];

export default function RetinaInjectionScrubber() {
  const [selectedDrugId, setSelectedDrugId] = useState<string>('eylea_2mg');
  const [eyeLaterality, setEyeLaterality] = useState<'right' | 'left' | 'bilateral'>('right');
  const [vialType, setVialType] = useState<'sdv' | 'pfs'>('sdv'); // SDV (discarded) vs Pre-Filled Syringe (zero wastage)
  const [daysSincePriorInjection, setDaysSincePriorInjection] = useState<number>(35);
  const [sameDayOct, setSameDayOct] = useState<boolean>(true); // CPT 92134
  const [sameDayAngio, setSameDayAngio] = useState<boolean>(false); // CPT 92235
  const [payerType, setPayerType] = useState<'medicare_b' | 'commercial'>('medicare_b');

  // Lead capture state
  const [practiceName, setPracticeName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEdi, setCopiedEdi] = useState(false);

  const activeDrug = useMemo(() => {
    return RETINA_DRUGS.find((d) => d.id === selectedDrugId) || RETINA_DRUGS[0];
  }, [selectedDrugId]);

  // Wastage & Dosage Calculations
  const dosageCalculations = useMemo(() => {
    const isBilateral = eyeLaterality === 'bilateral';
    const eyesCount = isBilateral ? 2 : 1;

    const administeredUnits = activeDrug.standardDoseUnits * eyesCount;
    const administeredDrugAmount = administeredUnits * activeDrug.avgPricePerUnit;

    // In SDV, if single eye, discarded = total in vial - standard dose.
    // If bilateral with 2 vials used:
    const vialsUsed = eyesCount;
    let discardedUnits = 0;
    if (vialType === 'sdv') {
      discardedUnits = (activeDrug.sdvTotalUnits - activeDrug.standardDoseUnits) * vialsUsed;
    }
    const wastageAmount = discardedUnits * activeDrug.avgPricePerUnit;

    // Injection Professional Fee: CPT 67028 ~ $108 per eye CMS MPFS
    const injectionBaseRate = 108.0;
    let injectionFee = injectionBaseRate;
    if (isBilateral) {
      if (payerType === 'medicare_b') {
        // Modifier 50 => 150% of allowable
        injectionFee = injectionBaseRate * 1.5;
      } else {
        // Commercial: Line 1 100%, Line 2 50%
        injectionFee = injectionBaseRate * 1.5;
      }
    }

    const octFee = sameDayOct ? 42.0 : 0;
    const angioFee = sameDayAngio ? 112.0 : 0;
    const totalAllowed = administeredDrugAmount + wastageAmount + injectionFee + octFee + angioFee;

    return {
      eyesCount,
      isBilateral,
      administeredUnits,
      administeredDrugAmount,
      discardedUnits,
      wastageAmount,
      injectionFee,
      octFee,
      angioFee,
      totalAllowed,
      vialsUsed,
    };
  }, [activeDrug, eyeLaterality, vialType, payerType, sameDayOct, sameDayAngio]);

  // LCD Interval & Frequency Compliance
  const intervalCheck = useMemo(() => {
    const minDays = 28;
    const isCompliant = daysSincePriorInjection >= minDays;
    const daysShort = minDays - daysSincePriorInjection;
    return { isCompliant, daysShort, minDays };
  }, [daysSincePriorInjection]);

  // ANSI X12 837P EDI Generation
  const ediSnippet = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const isBilateral = eyeLaterality === 'bilateral';
    const lateralityMod = isBilateral ? '50' : eyeLaterality === 'right' ? 'RT' : 'LT';
    const injectionMod = payerType === 'medicare_b' && isBilateral ? '50' : lateralityMod;

    // Line 1: Injection 67028
    const line1 = `LX*1~\nSV1*HC:67028:${injectionMod}*${(dosageCalculations.injectionFee * 2.2).toFixed(2)}*UN*${isBilateral && payerType === 'medicare_b' ? 1 : dosageCalculations.eyesCount}***1~\nDTP*472*D8*${today}~`;

    // Line 2: Administered Drug (with JZ if PFS/zero wastage)
    const adminMod = vialType === 'pfs' ? ':JZ' : '';
    const line2 = `LX*2~\nLIN**N4*${activeDrug.ndc.replace(/-/g, '')}~\nCTP****${dosageCalculations.administeredUnits}*UN~\nSV1*HC:${activeDrug.hcpcs}${adminMod}*${(dosageCalculations.administeredDrugAmount * 1.15).toFixed(2)}*UN*${dosageCalculations.administeredUnits}***1~\nDTP*472*D8*${today}~`;

    // Line 3: Discarded Wastage (JW) if SDV
    let line3 = '';
    if (vialType === 'sdv' && dosageCalculations.discardedUnits > 0) {
      line3 = `LX*3~\nLIN**N4*${activeDrug.ndc.replace(/-/g, '')}~\nCTP****${dosageCalculations.discardedUnits}*UN~\nSV1*HC:${activeDrug.hcpcs}:JW*${(dosageCalculations.wastageAmount * 1.15).toFixed(2)}*UN*${dosageCalculations.discardedUnits}***1~\nDTP*472*D8*${today}~`;
    }

    // Diagnostic scans lines
    let diagLines = '';
    let lineIdx = vialType === 'sdv' && dosageCalculations.discardedUnits > 0 ? 4 : 3;
    if (sameDayOct) {
      diagLines += `LX*${lineIdx}~\nSV1*HC:92134:59*${(dosageCalculations.octFee * 2.0).toFixed(2)}*UN*1***1~\nDTP*472*D8*${today}~\n`;
      lineIdx++;
    }
    if (sameDayAngio) {
      diagLines += `LX*${lineIdx}~\nSV1*HC:92235:59*${(dosageCalculations.angioFee * 2.0).toFixed(2)}*UN*1***1~\nDTP*472*D8*${today}~\n`;
    }

    return `ISA*00*          *00*          *ZZ*RETINAPROVIDER *ZZ*PAYERROUTING   *${today.slice(2)}*1015*^*00501*000000001*0*P*:~
GS*HC*SENDER*RECEIVER*${today}*1015*1*X*005010X222A1~
ST*837*0001*005010X222A1~
BHT*0019*00*RET-${today}-001*${today}*1015*CH~
NM1*85*2*VITREORETINAL ASSOCIATES*****XX*1827364501~
NM1*IL*1*WILLIAMS*ELEANOR****MI*MED992837461~
CLM*RET-${today}*${(dosageCalculations.totalAllowed * 1.6).toFixed(2)}***11:B:1*Y*A*Y*Y~
HI*ABK:H35.321*ABF:H35.351~
${line1}
${line2}
${line3 ? line3 + '\n' : ''}${diagLines}SE*22*0001~
GE*1*1~
IEA*1*000000001~`;
  }, [eyeLaterality, payerType, dosageCalculations, activeDrug, vialType, sameDayOct, sameDayAngio]);

  const handleCopyEdi = async () => {
    try {
      await navigator.clipboard.writeText(ediSnippet);
      setCopiedEdi(true);
      setTimeout(() => setCopiedEdi(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;

    setSubmitting(true);
    const payload = {
      practiceName,
      contactName,
      email,
      phone,
      drugName: activeDrug.name,
      hcpcs: activeDrug.hcpcs,
      eyeLaterality,
      vialType,
      isCompliantInterval: intervalCheck.isCompliant,
      daysSincePriorInjection,
      administeredUnits: dosageCalculations.administeredUnits,
      discardedWastageUnits: dosageCalculations.discardedUnits,
      totalEstimatedAllowed: dosageCalculations.totalAllowed,
      pageUrl: typeof window !== 'undefined' ? window.location.href : '/tools/retina-injection-scrubber',
      submittedAt: new Date().toISOString(),
    };

    try {
      await sendLeadToKiran('retina_injection_scrubber_audit', payload);
      trackConversion('assessment', dosageCalculations.totalAllowed);
      setSubmitted(true);
    } catch (err) {
      console.error('Lead submission error:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray/15 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Eye className="h-3.5 w-3.5 text-indigo-600" />
              CPT 67028 &amp; Anti-VEGF Buy-and-Bill Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-jakarta text-navy">
              Anti-VEGF Intravitreal Injection &amp; Bilateral Scrubber
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Audit ophthalmic anti-VEGF dosage and wastage (Modifiers JW/JZ), enforce Medicare Part B 28-day injection intervals, resolve bilateral eye billing rules (-50 vs -RT/-LT), and generate compliant ANSI 837P claim lines.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[240px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Estimated Allowed Total
            </span>
            <div className="text-3xl font-extrabold text-navy">
              ${dosageCalculations.totalAllowed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" /> ASP + 6% Part B Facility Benchmark
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Pharmacologic Agent Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">Anti-VEGF / Complement Inhibitor Agent</h3>
                <p className="text-xs text-slate-500">Select injected therapeutic biologic and NDC profile</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RETINA_DRUGS.map((drug) => (
                <button
                  key={drug.id}
                  type="button"
                  onClick={() => setSelectedDrugId(drug.id)}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    selectedDrugId === drug.id
                      ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-400/20'
                      : 'border-gray/20 hover:border-indigo-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs bg-white border border-gray/20 px-2 py-0.5 rounded text-indigo-800">
                      {drug.hcpcs}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      ${drug.aspPrice.toFixed(0)}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-navy mb-0.5">{drug.name}</div>
                  <div className="text-[11px] text-slate-500">
                    Billing: {drug.unitDef} ({drug.standardDoseUnits} units/dose)
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Injection Laterality & Vial Packaging */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">Eye Laterality &amp; Vial Packaging</h3>
                <p className="text-xs text-slate-500">Determines bilateral modifier logic and Modifier JW/JZ rules</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'right', label: 'Right Eye (OD / -RT)' },
                { id: 'left', label: 'Left Eye (OS / -LT)' },
                { id: 'bilateral', label: 'Bilateral (OU / -50)' },
              ].map((lat) => (
                <button
                  key={lat.id}
                  type="button"
                  onClick={() => setEyeLaterality(lat.id as any)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    eyeLaterality === lat.id
                      ? 'bg-navy text-white border-navy shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-gray/20 hover:border-slate-300'
                  }`}
                >
                  {lat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVialType('sdv')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  vialType === 'sdv'
                    ? 'border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-400'
                    : 'border-gray/20 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-navy">Single-Dose Vial (SDV)</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                    Requires Mod JW
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Overfill/residual drug discarded from single-use vial. Mandates separate claim line with Modifier JW.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setVialType('pfs')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  vialType === 'pfs'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-400'
                    : 'border-gray/20 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-navy">Pre-Filled Syringe (PFS)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    Requires Mod JZ
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Exact calibrated single dose with zero discarded remainder. Mandates Modifier JZ on primary drug line.
                </p>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Payer Billing Jurisdiction:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPayerType('medicare_b')}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
                    payerType === 'medicare_b' ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Medicare Part B (-50)
                </button>
                <button
                  type="button"
                  onClick={() => setPayerType('commercial')}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
                    payerType === 'commercial' ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Commercial (-RT / -LT)
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Injection Interval & Same-Day Scans */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">LCD Interval Cadence &amp; Diagnostic Testing</h3>
                <p className="text-xs text-slate-500">Medicare Part B LCD frequency rules and same-day imaging</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span>Days Elapsed Since Prior Injection (Same Eye):</span>
                <span className={`font-mono font-bold ${intervalCheck.isCompliant ? 'text-emerald-600' : 'text-red-600'}`}>
                  {daysSincePriorInjection} Days
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={daysSincePriorInjection}
                onChange={(e) => setDaysSincePriorInjection(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {!intervalCheck.isCompliant ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Premature Injection Denial (CARC CO-119 / CO-16):</strong>
                  Medicare MAC LCD policies strictly mandate a minimum 28-day interval between anti-VEGF injections in the same eye. Submitting {intervalCheck.daysShort} days early will cause immediate automated claim denial.
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Compliant 28+ day treatment interval satisfied under Medicare Part B LCD.</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Same-Day Ophthalmic Diagnostic Imaging</h4>
              
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameDayOct}
                  onChange={(e) => setSameDayOct(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>
                  Optical Coherence Tomography (OCT - CPT 92134): Requires Modifier 59 / XU to unbundle from 67028.
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameDayAngio}
                  onChange={(e) => setSameDayAngio(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>
                  Fluorescein Angiography (CPT 92235): Documented baseline retinal vascular evaluation.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Scrubber Findings & 837P EDI (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Findings Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray/15 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray/10 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-base text-navy">Retina Claim Audit Summary</h3>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  intervalCheck.isCompliant ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {intervalCheck.isCompliant ? 'Claim Clean' : 'Interval Violation'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Injected Biologic:</span>
                <span className="font-mono font-bold text-navy">{activeDrug.hcpcs} ({activeDrug.name.split(' ')[0]})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Administered Units:</span>
                <span className="font-bold text-slate-800">
                  {dosageCalculations.administeredUnits} units (${dosageCalculations.administeredDrugAmount.toFixed(2)})
                </span>
              </div>
              {vialType === 'sdv' && dosageCalculations.discardedUnits > 0 ? (
                <div className="flex justify-between items-center text-amber-700">
                  <span className="font-medium">Discarded Wastage (Mod JW):</span>
                  <span className="font-mono font-bold">
                    {dosageCalculations.discardedUnits} units (${dosageCalculations.wastageAmount.toFixed(2)})
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-emerald-700">
                  <span className="font-medium">Zero Wastage (Mod JZ):</span>
                  <span className="font-mono font-bold">0 units discarded</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Intravitreal Injection (67028):</span>
                <span className="font-bold text-slate-800">${dosageCalculations.injectionFee.toFixed(2)}</span>
              </div>
              {(sameDayOct || sameDayAngio) && (
                <div className="flex justify-between items-center text-indigo-700">
                  <span className="font-medium">Diagnostic Scans (92134/92235):</span>
                  <span className="font-bold">+${(dosageCalculations.octFee + dosageCalculations.angioFee).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-navy">
                <span>Net Allowed Total:</span>
                <span className="text-indigo-700">${dosageCalculations.totalAllowed.toFixed(2)}</span>
              </div>
            </div>

            {/* Modifier Rule Alert */}
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 space-y-1 leading-relaxed">
              <strong className="font-bold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                Bilateral &amp; Packaging Coding Rules:
              </strong>
              {eyeLaterality === 'bilateral' ? (
                payerType === 'medicare_b' ? (
                  <p>Medicare Part B: Report CPT 67028 with Modifier 50 (1 unit, 150% rate). Drug J-code is reported on single line with {dosageCalculations.administeredUnits} total administered units.</p>
                ) : (
                  <p>Commercial: Report line 1 with 67028-RT and line 2 with 67028-LT-51 (subject to 50% multiple surgery reduction).</p>
                )
              ) : (
                <p>Unilateral: Report CPT 67028 with {eyeLaterality === 'right' ? 'Modifier RT' : 'Modifier LT'}.</p>
              )}
            </div>
          </div>

          {/* ANSI X12 837P Preview */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  ANSI X12 837P Retina Claim Lines
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyEdi}
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md transition-colors"
              >
                {copiedEdi ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copiedEdi ? 'Copied' : 'Copy 837P Segment'}
              </button>
            </div>
            <pre className="font-mono text-[11px] leading-relaxed text-indigo-300/90 bg-slate-950 p-3.5 rounded-xl overflow-x-auto max-h-56 scrollbar-thin">
              {ediSnippet}
            </pre>
            <p className="text-[10px] text-slate-400">
              Electronic claim segments with NDC 11-digit qualifier and Modifiers JW/JZ wastage split.
            </p>
          </div>

          {/* Lead Audit Card */}
          <div className="bg-gradient-to-br from-navy via-[#003087] to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-mint/20 border border-mint/40 text-mint text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                <Eye className="h-3 w-3" />
                Free Retina Practice Audit
              </div>
              <div>
                <h4 className="text-lg font-bold">Audit 50 Anti-VEGF Claims Free</h4>
                <p className="text-xs text-cream/80 mt-1 leading-relaxed">
                  Our certified ophthalmology coders will audit up to 50 recent anti-VEGF injection and OCT claims to identify missed drug wastage recovery and bilateral modifier underpayments.
                </p>
              </div>

              {submitted ? (
                <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Audit request received. Kiran’s retina RCM team will contact you within 24 hours.</span>
                </div>
              ) : (
                <form onSubmit={handleAuditSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Retina Clinic Name"
                      value={practiceName}
                      onChange={(e) => setPracticeName(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-hidden focus:border-mint"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-hidden focus:border-mint"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="email"
                      placeholder="Work Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-hidden focus:border-mint"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-hidden focus:border-mint"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-teal hover:bg-teal/90 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting Request...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Request 50-Claim Retina Audit
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-cream/60 text-center">
                    Zero obligation · Confidential HIPAA compliance · Direct to Kiran
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
