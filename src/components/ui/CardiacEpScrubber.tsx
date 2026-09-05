'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Loader2,
  FileCode,
  ShieldCheck,
  Calculator,
  ChevronRight,
  Info,
  Layers,
  FileText,
  DollarSign,
  HeartPulse,
  Radio,
  Zap,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

interface AblationProcedure {
  id: string;
  code: string;
  name: string;
  avgRate: number;
  description: string;
}

const PRIMARY_ABLATIONS: AblationProcedure[] = [
  {
    id: 'afib_pvi',
    code: '93656',
    name: 'Atrial Fibrillation Pulmonary Vein Isolation (PVI)',
    avgRate: 1285.5,
    description: 'Comprehensive transseptal left atrial ablation including baseline mapping, induction, and pulmonary vein isolation.',
  },
  {
    id: 'svt_ablation',
    code: '93653',
    name: 'Supraventricular Tachycardia (SVT) Ablation',
    avgRate: 964.2,
    description: 'Comprehensive EP evaluation and ablation of AV nodal reentrant tachycardia (AVNRT), AVRT, or atrial tachycardia.',
  },
  {
    id: 'vt_ablation',
    code: '93654',
    name: 'Ventricular Tachycardia (VT) Ablation',
    avgRate: 1342.0,
    description: 'Comprehensive mapping and therapeutic ablation of ventricular tachycardia focus or arrhythmogenic substrate.',
  },
];

interface AddonProcedure {
  id: string;
  code: string;
  name: string;
  avgRate: number;
  description: string;
}

const ADDON_PROCEDURES: AddonProcedure[] = [
  {
    id: '3d_mapping',
    code: '93613',
    name: '3D Electroanatomical Mapping',
    avgRate: 424.0,
    description: 'Computer-generated 3D voltage and activation sequence mapping (Carto, EnSite, Rhythmia).',
  },
  {
    id: 'ice',
    code: '93662',
    name: 'Intracardiac Echocardiography (ICE)',
    avgRate: 282.5,
    description: 'Ultrasound catheter guidance for transseptal puncture and monitoring for pericardial effusion.',
  },
  {
    id: 'afib_addl',
    code: '93657',
    name: 'Additional Atrial Ablation (Roof/Isthmus Lines)',
    avgRate: 518.0,
    description: 'Linear atrial ablation lesions or complex fractionated electrograms for persistent AFib.',
  },
  {
    id: 'cti_flutter',
    code: '93655',
    name: 'Cavotricuspid Isthmus (CTI) Flutter Line',
    avgRate: 486.2,
    description: 'Ablation of discrete second arrhythmia mechanism (typical atrial flutter line).',
  },
];

interface BundledDiagnostic {
  id: string;
  code: string;
  name: string;
  warningText: string;
}

const BUNDLED_DIAGNOSTICS: BundledDiagnostic[] = [
  {
    id: 'ep_diag_comprehensive',
    code: '93620',
    name: 'Comprehensive Diagnostic EP Study',
    warningText: 'Statutorily bundled into 93656/93653. Payers deny under NCCI PTP edit CARC CO-97.',
  },
  {
    id: 'ep_diag_limited',
    code: '93619',
    name: 'Limited Diagnostic EP Study',
    warningText: 'Bundled into primary ablation procedure; cannot be billed with Modifier 59.',
  },
  {
    id: 'la_pacing',
    code: '93621',
    name: 'Left Atrial Pacing & Recording',
    warningText: 'Included in 93656 transseptal ablation global package.',
  },
  {
    id: 'his_bundle',
    code: '93600',
    name: 'Bundle of His Recording',
    warningText: 'Standard component of intracardiac electrogram catheter survey; non-billable standalone.',
  },
];

export default function CardiacEpScrubber() {
  // Ablation State
  const [selectedAblationId, setSelectedAblationId] = useState<string>('afib_pvi');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(['3d_mapping', 'ice']);
  const [selectedBundledIds, setSelectedBundledIds] = useState<string[]>(['ep_diag_comprehensive']);

  // Remote Device Interrogation State
  const [deviceType, setDeviceType] = useState<'pacemaker' | 'icd' | 'ilr'>('icd');
  const [daysSinceLastTransmission, setDaysSinceLastTransmission] = useState<number>(94);

  // Form State
  const [contactName, setContactName] = useState('');
  const [centerName, setCenterName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEdi, setCopiedEdi] = useState(false);

  const activeAblation = useMemo(() => {
    return PRIMARY_ABLATIONS.find((a) => a.id === selectedAblationId) || PRIMARY_ABLATIONS[0];
  }, [selectedAblationId]);

  const addonTotal = useMemo(() => {
    return selectedAddonIds.reduce((sum, id) => {
      const addon = ADDON_PROCEDURES.find((a) => a.id === id);
      return sum + (addon ? addon.avgRate : 0);
    }, 0);
  }, [selectedAddonIds]);

  const totalAblationAllowed = activeAblation.avgRate + addonTotal;

  // Remote Telemetry Cadence Evaluation
  const cadenceAnalysis = useMemo(() => {
    const minDays = deviceType === 'ilr' ? 30 : 90;
    const code = deviceType === 'pacemaker' ? '93294' : deviceType === 'icd' ? '93295' : '93298';
    const rate = deviceType === 'pacemaker' ? 48.5 : deviceType === 'icd' ? 72.4 : 32.1;
    const isCompliant = daysSinceLastTransmission >= minDays;
    const daysShort = minDays - daysSinceLastTransmission;

    return {
      code,
      rate,
      minDays,
      isCompliant,
      daysShort,
    };
  }, [deviceType, daysSinceLastTransmission]);

  // ANSI X12 837P EDI Simulation
  const ediSnippet = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const icd10 = selectedAblationId === 'afib_pvi' ? 'I48.0' : selectedAblationId === 'svt_ablation' ? 'I47.1' : 'I47.2';
    
    const addonSegments = selectedAddonIds.map((id, index) => {
      const addon = ADDON_PROCEDURES.find((a) => a.id === id);
      if (!addon) return '';
      return `LX*${index + 2}~\nSV1*HC:${addon.code}*${(addon.avgRate * 2.2).toFixed(2)}*UN*1***1~\nDTP*472*D8*${today}~`;
    }).filter(Boolean).join('\n');

    return `ISA*00*          *00*          *ZZ*SUBMITTERID    *ZZ*RECEIVERID     *${today.slice(2)}*1200*^*00501*000000001*0*P*:~
GS*HC*SENDER*RECEIVER*${today}*1200*1*X*005010X222A1~
ST*837*0001*005010X222A1~
BHT*0019*00*REF${today}*${today}*1200*CH~
NM1*85*2*CARDIAC ARRHYTHMIA SPECIALISTS*****XX*1748392019~
NM1*IL*1*SMITH*JOHN****MI*MED776655443~
CLM*EP-${today}-001*${(totalAblationAllowed * 2.1).toFixed(2)}***11:B:1*Y*A*Y*Y~
DTP*435*D8*${today}~
HI*ABK:${icd10}~
LX*1~
SV1*HC:${activeAblation.code}*${(activeAblation.avgRate * 2.1).toFixed(2)}*UN*1***1~
DTP*472*D8*${today}~
${addonSegments}
SE*16*0001~
GE*1*1~
IEA*1*000000001~`;
  }, [activeAblation, selectedAddonIds, selectedAblationId, totalAblationAllowed]);

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
      centerName,
      contactName,
      email,
      phone,
      primaryAblation: `${activeAblation.code} - ${activeAblation.name}`,
      selectedAddons: selectedAddonIds,
      bundledViolationsCount: selectedBundledIds.length,
      deviceTelemetryType: deviceType,
      telemetryCadenceDays: daysSinceLastTransmission,
      isCadenceCompliant: cadenceAnalysis.isCompliant,
      estimatedAblationAllowed: totalAblationAllowed,
      pageUrl: typeof window !== 'undefined' ? window.location.href : '/tools/cardiac-ep-scrubber',
      submittedAt: new Date().toISOString(),
    };

    try {
      await sendLeadToKiran('cardiac_ep_scrubber_audit', payload);
      trackConversion('assessment', totalAblationAllowed);
      setSubmitted(true);
    } catch (err) {
      console.error('Lead submission failed:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleBundled = (id: string) => {
    setSelectedBundledIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-10">
      {/* Hero Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray/15 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <HeartPulse className="h-3.5 w-3.5 text-red-600" />
              CPT 93656 &amp; NCCI EP Bundling Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-jakarta text-navy">
              Cardiac Electrophysiology &amp; Catheter Ablation Scrubber
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Verify pulmonary vein isolation (CPT 93656) bundling edits against diagnostic EP studies (93619/93620), capture 3D mapping (93613) and ICE (93662) add-ons, and audit remote cardiac device telemetry 90-day intervals.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[240px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Estimated Allowed Total
            </span>
            <div className="text-3xl font-extrabold text-navy">
              ${totalAblationAllowed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" /> CMS MPFS Facility Equivalent
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Primary Catheter Ablation Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">Primary Catheter Ablation Procedure</h3>
                <p className="text-xs text-slate-500">Comprehensive base operative code under CPT coding guidelines</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {PRIMARY_ABLATIONS.map((ablation) => (
                <button
                  key={ablation.id}
                  type="button"
                  onClick={() => setSelectedAblationId(ablation.id)}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    selectedAblationId === ablation.id
                      ? 'border-red-500 bg-red-50/70 ring-2 ring-red-400/20'
                      : 'border-gray/20 hover:border-red-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-navy">{ablation.name}</span>
                    <span className="font-mono font-bold text-xs bg-white border border-gray/20 px-2 py-0.5 rounded-md text-red-700">
                      CPT {ablation.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">{ablation.description}</p>
                  <div className="mt-2 text-xs font-semibold text-slate-700">
                    CMS Allowed: <span className="text-red-700 font-bold">${ablation.avgRate.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Billable EP Add-on Procedures */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">Documented Billable Add-on Procedures</h3>
                <p className="text-xs text-slate-500">Separately payable with documented mapping and ultrasound guidance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ADDON_PROCEDURES.map((addon) => {
                const isSelected = selectedAddonIds.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-400'
                        : 'border-gray/20 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-navy">CPT {addon.code}</span>
                      <span className="text-xs font-bold text-emerald-700">+${addon.avgRate.toFixed(0)}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mb-0.5">{addon.name}</div>
                    <p className="text-[11px] text-slate-500 leading-snug">{addon.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Diagnostic EP Bundling Scrubber */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">Diagnostic EP Study Unbundling Auditor</h3>
                <p className="text-xs text-slate-500">Identify NCCI edit collisions before claim transmission</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong className="font-bold flex items-center gap-1 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-700 inline shrink-0" />
                CMS Chapter 11 NCCI Policy Rule:
              </strong>
              Catheter ablation codes (93656/93653) statutorily include right atrial mapping, pacing, and intracardiac recordings. Submitting diagnostic EP codes alongside comprehensive ablation causes claim rejection under CARC CO-97.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BUNDLED_DIAGNOSTICS.map((b) => {
                const isChecked = selectedBundledIds.includes(b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleBundled(b.id)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all ${
                      isChecked
                        ? 'border-amber-400 bg-amber-50/60 ring-1 ring-amber-300'
                        : 'border-gray/20 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-mono font-bold text-navy">CPT {b.code}</span>
                      {isChecked ? (
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                          BUNDLED
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Not selected</span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-slate-700">{b.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Remote Device Telemetry Cadence */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm">
                4
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">Remote Cardiac Device Telemetry Cadence</h3>
                <p className="text-xs text-slate-500">Audit statutory 90-day interrogation intervals (CPT 93294/93295)</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pacemaker', label: 'Pacemaker (93294)', days: 90 },
                { id: 'icd', label: 'ICD (93295)', days: 90 },
                { id: 'ilr', label: 'Loop Recorder (93298)', days: 30 },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDeviceType(d.id as any)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    deviceType === d.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-gray/20 hover:border-blue-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span>Days Elapsed Since Prior Transmission:</span>
                <span className={`font-mono font-bold ${cadenceAnalysis.isCompliant ? 'text-emerald-600' : 'text-red-600'}`}>
                  {daysSinceLastTransmission} days
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="1"
                value={daysSinceLastTransmission}
                onChange={(e) => setDaysSinceLastTransmission(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {!cadenceAnalysis.isCompliant ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Premature Telemetry Transmission (Clawback Risk):</strong>
                  Medicare requires a minimum {cadenceAnalysis.minDays}-day interval. Claim submitted {cadenceAnalysis.daysShort} days early will be denied under CARC CO-16 / CO-96 duplicate frequency edits.
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Statutory {cadenceAnalysis.minDays}-day cadence satisfied. CPT {cadenceAnalysis.code} billable at ${cadenceAnalysis.rate.toFixed(2)}.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scrubber Findings & 837P EDI (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Findings Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray/15 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray/10 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-red-600" />
                <h3 className="font-bold text-base text-navy">EP Scrubber Compliance Report</h3>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  selectedBundledIds.length > 0 || !cadenceAnalysis.isCompliant
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {selectedBundledIds.length > 0 ? 'Bundling Suppressed' : 'Claim Ready'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Primary Ablation:</span>
                <span className="font-mono font-bold text-navy text-sm">CPT {activeAblation.code}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Primary Allowed:</span>
                <span className="font-bold text-slate-800">${activeAblation.avgRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Add-on Procedures:</span>
                <span className="font-bold text-emerald-600">+${addonTotal.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-navy">
                <span>Net Allowed Total:</span>
                <span className="text-red-700">${totalAblationAllowed.toFixed(2)}</span>
              </div>
            </div>

            {/* Bundling Alerts */}
            {selectedBundledIds.length > 0 && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                  {selectedBundledIds.length} Diagnostic EP Edit(s) Suppressed
                </div>
                <p className="text-[11px] text-red-700 leading-snug">
                  The following codes cannot be billed on separate claim lines with CPT {activeAblation.code}:
                </p>
                <ul className="text-xs text-red-800 list-disc list-inside space-y-1 font-mono">
                  {selectedBundledIds.map((id) => {
                    const b = BUNDLED_DIAGNOSTICS.find((x) => x.id === id);
                    return <li key={id}>CPT {b?.code} - {b?.name}</li>;
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* ANSI X12 837P Preview */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-red-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  ANSI X12 837P EP Lab Claim Lines
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
            <pre className="font-mono text-[11px] leading-relaxed text-red-300/90 bg-slate-950 p-3.5 rounded-xl overflow-x-auto max-h-56 scrollbar-thin">
              {ediSnippet}
            </pre>
            <p className="text-[10px] text-slate-400">
              Electronic claim segments formatted for primary PVI and secondary 3D mapping / ICE ultrasound guidance.
            </p>
          </div>

          {/* Practice Audit Lead Card */}
          <div className="bg-gradient-to-br from-navy via-navy to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-mint/20 border border-mint/40 text-mint text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                <Activity className="h-3 w-3" />
                Free EP Lab Billing Audit
              </div>
              <div>
                <h4 className="text-lg font-bold">Audit 50 Electrophysiology Claims Free</h4>
                <p className="text-xs text-cream/80 mt-1 leading-relaxed">
                  Our certified cardiology RCM specialists will audit 50 recent catheter ablation or device telemetry claims for unbundling rejections and missed mapping add-ons.
                </p>
              </div>

              {submitted ? (
                <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Audit request received. Kiran’s cardiology RCM audit team will contact you within 24 hours.</span>
                </div>
              ) : (
                <form onSubmit={handleAuditSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="EP Center / Hospital Name"
                      value={centerName}
                      onChange={(e) => setCenterName(e.target.value)}
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
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting Audit Request...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Request 50-Claim EP Audit
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-cream/60 text-center">
                    Zero financial obligation · Confidential HIPAA compliance · Direct to Kiran
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
