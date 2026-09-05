'use client';

import React, { useState, useMemo } from 'react';
import {
  Radiation,
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
  Activity,
  Zap,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

interface ModalityConfig {
  id: string;
  name: string;
  deliveryCode: string;
  avgDeliveryAllowable: number;
  description: string;
}

const MODALITIES: ModalityConfig[] = [
  {
    id: 'imrt',
    name: 'IMRT (Intensity Modulated Radiation Therapy)',
    deliveryCode: '77386',
    avgDeliveryAllowable: 420,
    description: 'Complex multi-segment step-and-shoot or dynamic arc inverse-planned photon therapy.',
  },
  {
    id: 'sbrt',
    name: 'SBRT (Stereotactic Body Radiotherapy)',
    deliveryCode: '77373',
    avgDeliveryAllowable: 1650,
    description: 'High-dose hypofractionated extracranial radiation (1–5 fractions) with sub-millimeter precision.',
  },
  {
    id: 'srs',
    name: 'SRS (Stereotactic Radiosurgery - Cranial)',
    deliveryCode: '77372',
    avgDeliveryAllowable: 2150,
    description: 'Single-session stereotactic radiosurgery for brain metastases, meningiomas, or AVMs.',
  },
  {
    id: '3dcrt',
    name: '3D-CRT (3D Conformal Radiotherapy)',
    deliveryCode: '77412',
    avgDeliveryAllowable: 195,
    description: 'Forward-planned 3D geometric beam shaping using anatomical CT volume reconstruction.',
  },
  {
    id: 'proton',
    name: 'Proton Beam Therapy (Intermediate/Complex)',
    deliveryCode: '77523',
    avgDeliveryAllowable: 1120,
    description: 'Charged particle Bragg-peak therapy sparing distal normal tissue structures.',
  },
];

export default function RadOncScrubber() {
  // Modality & Fraction State
  const [selectedModalityId, setSelectedModalityId] = useState<string>('imrt');
  const [totalFractions, setTotalFractions] = useState<number>(28);

  // Planning & Physics Services Selected
  const [hasImrtPlan77301, setHasImrtPlan77301] = useState<boolean>(true);
  const [hasSimulation77295, setHasSimulation77295] = useState<boolean>(true);
  const [hasBasicDosimetry77300, setHasBasicDosimetry77300] = useState<boolean>(true);
  const [hasMlcDesign77338, setHasMlcDesign77338] = useState<boolean>(true);
  const [hasDevices77334, setHasDevices77334] = useState<boolean>(true);
  const [hasDistinctMaskDoc, setHasDistinctMaskDoc] = useState<boolean>(true);

  // Form State
  const [contactName, setContactName] = useState('');
  const [centerName, setCenterName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEdi, setCopiedEdi] = useState(false);

  const activeModality = MODALITIES.find((m) => m.id === selectedModalityId) || MODALITIES[0];

  // Weekly Treatment Management (CPT 77427) CMS Fraction Math (§ 100.1)
  const managementMath = useMemo(() => {
    const fullBlocks = Math.floor(totalFractions / 5);
    const remainder = totalFractions % 5;
    const carryOverBillable = remainder >= 3 ? 1 : 0;
    const total77427Units = fullBlocks + carryOverBillable;

    let remainderNote = '';
    if (remainder === 0) {
      remainderNote = 'Even 5-fraction blocks. Exactly billable as full units.';
    } else if (remainder >= 3) {
      remainderNote = `Final remainder of ${remainder} fractions meets CMS ≥3 rule: generates +1 billable unit of 77427!`;
    } else {
      remainderNote = `Final remainder of ${remainder} fraction(s) does NOT meet CMS ≥3 threshold: bundled into prior management cycle under CMS § 100.1.`;
    }

    const managementFeePerUnit = 485;
    const totalManagementFee = total77427Units * managementFeePerUnit;

    return {
      fullBlocks,
      remainder,
      carryOverBillable,
      total77427Units,
      remainderNote,
      totalManagementFee,
    };
  }, [totalFractions]);

  // NCCI Bundling & Claim Line Analysis
  const bundlingAnalysis = useMemo(() => {
    const issues: { code: string; message: string; severity: 'error' | 'warning' | 'clean' }[] = [];
    let unbundledLoss = 0;

    // Base allowable benchmarks
    const planFee = hasImrtPlan77301 ? 1850 : 0;
    let simFee = hasSimulation77295 ? 620 : 0;
    let dosFee = hasBasicDosimetry77300 ? 145 : 0;
    const mlcFee = hasMlcDesign77338 ? 390 : 0;
    let devFee = hasDevices77334 ? 280 : 0;

    if (hasImrtPlan77301) {
      if (hasSimulation77295) {
        issues.push({
          code: '77295 Bundled into 77301',
          message:
            'NCCI PTP Edit (CARC 97): 3D Simulation (77295) is mutually exclusive with IMRT Planning (77301) when performed for the same course. Denied if billed on same DOS without distinct separate site documentation.',
          severity: 'error',
        });
        unbundledLoss += simFee;
        simFee = 0; // cannot be collected separately
      }

      if (hasBasicDosimetry77300) {
        issues.push({
          code: '77300 Bundled into 77301',
          message:
            'Basic Dosimetry (77300) calculations are intrinsic to IMRT computer optimization algorithms. Standalone billing on plan generation date triggers NCCI bundling denial.',
          severity: 'error',
        });
        unbundledLoss += dosFee;
        dosFee = 0;
      }

      if (hasDevices77334 && !hasDistinctMaskDoc) {
        issues.push({
          code: '77334 Documentation Risk',
          message:
            'Treatment Devices (77334) requires customized immobilization notes (e.g. bespoke thermoplastic mask or vac-lok cushion) documented prior to simulation to withstand audit.',
          severity: 'warning',
        });
      }
    }

    if (issues.length === 0) {
      issues.push({
        code: 'Clean NCCI Alignment',
        message: 'All planning, physics, and delivery codes align with ASTRO and CMS Chapter 13 MPFS coding standards.',
        severity: 'clean',
      });
    }

    const totalPlanningAndPhysics = planFee + simFee + dosFee + mlcFee + devFee;
    const totalDeliveryReimbursement = totalFractions * activeModality.avgDeliveryAllowable;
    const grossCourseAllowable = totalPlanningAndPhysics + totalDeliveryReimbursement + managementMath.totalManagementFee;

    return {
      issues,
      unbundledLoss,
      planFee,
      simFee,
      dosFee,
      mlcFee,
      devFee,
      totalPlanningAndPhysics,
      totalDeliveryReimbursement,
      grossCourseAllowable,
    };
  }, [
    hasImrtPlan77301,
    hasSimulation77295,
    hasBasicDosimetry77300,
    hasMlcDesign77338,
    hasDevices77334,
    hasDistinctMaskDoc,
    totalFractions,
    activeModality,
    managementMath,
  ]);

  // ANSI X12 837P EDI Simulation
  const simulatedEdi = useMemo(() => {
    const lines = [
      'ISA*00*          *00*          *ZZ*RADONC-BILLING *ZZ*PAYER-EDI      *260905*1200*^*00501*000000003*0*P*:~',
      'GS*HC*RADONC-BILLING*PAYER-EDI*20260905*1200*1*X*005010X222A1~',
      'ST*837*0003*005010X222A1~',
      'BHT*0019*00*20260905003*20260905*1200*CH~',
      'NM1*85*2*METRO CANCER INSTITUTE*****XX*1749204918~',
      'CLM*RO-COURSE-884*' + bundlingAnalysis.grossCourseAllowable.toFixed(2) + '***11:B:1*Y*A*Y*Y~',
      '// LINE 1: PRIMARY PLANNING PROCEDURE',
    ];

    if (hasImrtPlan77301) {
      lines.push('LX*1~', 'SV1*HC:77301*1850.00*UN*1~', 'DTP*472*D8*20260905~');
    }

    if (hasMlcDesign77338) {
      lines.push('// LINE 2: MLC DEVICE DESIGN (ASTRO SEPARATELY PAYABLE)', 'LX*2~', 'SV1*HC:77338*390.00*UN*1~', 'DTP*472*D8*20260905~');
    }

    lines.push(
      '// LINE 3: TREATMENT DELIVERY SESSIONS',
      'LX*3~',
      `SV1*HC:${activeModality.deliveryCode}*${bundlingAnalysis.totalDeliveryReimbursement.toFixed(2)}*UN*${totalFractions}~`,
      'DTP*472*RD8*20260905-20261014~',
      '// LINE 4: WEEKLY TREATMENT MANAGEMENT (CPT 77427)',
      'LX*4~',
      `SV1*HC:77427*${managementMath.totalManagementFee.toFixed(2)}*UN*${managementMath.total77427Units}~`,
      'DTP*472*RD8*20260905-20261014~',
      'SE*16*0003~',
      'GE*1*1~',
      'IEA*1*000000003~'
    );

    return lines.join('\n');
  }, [bundlingAnalysis, activeModality, totalFractions, managementMath, hasImrtPlan77301, hasMlcDesign77338]);

  const handleCopyEdi = () => {
    navigator.clipboard.writeText(simulatedEdi);
    setCopiedEdi(true);
    setTimeout(() => setCopiedEdi(false), 2500);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: contactName,
        email,
        phone,
        practice: centerName,
        service: 'Radiation Oncology RCM & NCCI Bundling Audit',
        notes: `[Tool: Rad-Onc Scrubber] Modality: ${activeModality.name} | Fractions: ${totalFractions} | 77427 Units: ${managementMath.total77427Units} | Plan 77301: ${hasImrtPlan77301} | 77295 Bundled: ${hasSimulation77295} | Unbundled At Risk: $${bundlingAnalysis.unbundledLoss} | Course Total: $${bundlingAnalysis.grossCourseAllowable}`,
        source: 'Tool: /tools/rad-onc-scrubber',
      };

      const ok = await sendLeadToKiran('rad_onc_scrubber_inquiry', payload);
      if (ok) {
        trackConversion('assessment');
        setSubmitted(true);
      }
    } catch {
      // Graceful fallback
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Parameter Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Planning & Treatment Controls */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Radiation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Radiation Oncology Treatment &amp; Physics Scrubber</h2>
              <p className="text-xs text-slate-400">CMS MPFS Chapter 13 &amp; ASTRO Bundling Standards</p>
            </div>
          </div>

          {/* Modality Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Radiation Treatment Modality
            </label>
            <select
              value={selectedModalityId}
              onChange={(e) => setSelectedModalityId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {MODALITIES.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  {mod.name} (CPT {mod.deliveryCode})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">{activeModality.description}</p>
          </div>

          {/* Fractions Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <span>Treatment Course Fractions</span>
              <span className="text-cyan-400 font-mono font-bold">{totalFractions} fractions</span>
            </div>
            <input
              type="range"
              min="1"
              max="45"
              step="1"
              value={totalFractions}
              onChange={(e) => setTotalFractions(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
              <span>SBRT / Hypofractionated (1–5)</span>
              <span>Standard Curative Course (25–35)</span>
              <span>Extended Boost (40+)</span>
            </div>
          </div>

          {/* Planning & Physics Selection */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Planning &amp; Dosimetry Services Billed
            </span>

            <div className="space-y-2.5">
              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasImrtPlan77301}
                  onChange={(e) => setHasImrtPlan77301(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-white">CPT 77301</span> — IMRT Treatment Plan (Inverse Planning)
                </div>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSimulation77295}
                  onChange={(e) => setHasSimulation77295(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-white">CPT 77295</span> — 3D Simulation / Volumetric Reconstruction
                  {hasImrtPlan77301 && hasSimulation77295 && (
                    <span className="ml-2 text-rose-400 font-bold">(NCCI Bundling Collision)</span>
                  )}
                </div>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasBasicDosimetry77300}
                  onChange={(e) => setHasBasicDosimetry77300(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-white">CPT 77300</span> — Basic Radiation Dosimetry Calculation
                  {hasImrtPlan77301 && hasBasicDosimetry77300 && (
                    <span className="ml-2 text-rose-400 font-bold">(NCCI Bundled)</span>
                  )}
                </div>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasMlcDesign77338}
                  onChange={(e) => setHasMlcDesign77338(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-white">CPT 77338</span> — Medical Physics MLC Device Design (Separately Payable)
                </div>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDevices77334}
                  onChange={(e) => setHasDevices77334(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-white">CPT 77334</span> — Complex Treatment Devices (Mask / Mold / Bolus)
                </div>
              </label>

              {hasDevices77334 && (
                <div className="ml-6 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDistinctMaskDoc}
                      onChange={(e) => setHasDistinctMaskDoc(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>Customized physical mask/mold documented prior to simulation date</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Bundling Verdict & Total Course Revenue */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                ASTRO &amp; CMS Bundling Audit
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                CPT 77427 Rule § 100.1
              </span>
            </div>

            {/* Financial Course Totals */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Planning &amp; Physics:</span>
                <span className="font-mono font-bold text-white">
                  ${bundlingAnalysis.totalPlanningAndPhysics.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">
                  Delivery ({activeModality.deliveryCode} × {totalFractions} fx):
                </span>
                <span className="font-mono font-bold text-white">
                  ${bundlingAnalysis.totalDeliveryReimbursement.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">
                  Weekly Mgmt (77427 × {managementMath.total77427Units} units):
                </span>
                <span className="font-mono font-bold text-cyan-400">
                  +${managementMath.totalManagementFee.toLocaleString()}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-white">Total Expected Course:</span>
                <span className="text-2xl font-black font-mono text-cyan-400">
                  ${bundlingAnalysis.grossCourseAllowable.toLocaleString()}
                </span>
              </div>

              {bundlingAnalysis.unbundledLoss > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Unbundled Claim Denial Risk:</span>
                    <span>-${bundlingAnalysis.unbundledLoss.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-rose-400">
                    Services bundled under NCCI PTP edits will be rejected by Medicare MAC with CARC 97.
                  </p>
                </div>
              )}
            </div>

            {/* Fraction Management Callout */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Weekly Treatment Fraction Math</span>
              </div>
              <p className="text-slate-400">{managementMath.remainderNote}</p>
            </div>

            {/* Issues List */}
            <div className="space-y-2">
              {bundlingAnalysis.issues.map((iss, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    iss.severity === 'error'
                      ? 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                      : iss.severity === 'warning'
                      ? 'bg-amber-950/60 border-amber-500/30 text-amber-300'
                      : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {iss.severity === 'error' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : iss.severity === 'warning' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span>{iss.code}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{iss.message}</p>
                </div>
              ))}
            </div>

            <a
              href="#rad-onc-audit"
              className="w-full inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-3 rounded-lg text-sm transition-all shadow-lg hover:shadow-cyan-500/20"
            >
              <span>Request Radiation Oncology Audit</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ANSI X12 837P EDI Inspector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ANSI X12 837P Radiation Oncology Claim Segment</h3>
              <p className="text-xs text-slate-400">Electronic Loop 2400 SV1 Lines with Fraction Unit Multipliers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyEdi}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
          >
            {copiedEdi ? (
              <>
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copied EDI</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy 837P Segment</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300/90 overflow-x-auto whitespace-pre leading-relaxed">
          {simulatedEdi}
        </div>
      </div>

      {/* Lead Capture Form */}
      <section id="rad-onc-audit" className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white">Request Radiation Oncology Coding &amp; Physics Audit</h3>
          <p className="text-xs text-slate-400 mt-1">
            Overcome IMRT planning bundling recoupments, streamline dosimetry capture, and defend proton therapy prior authorizations.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-cyan-400 mx-auto" />
            <div className="text-base font-bold text-white">Radiation Oncology Audit Request Received</div>
            <p className="text-xs text-slate-300">
              Our Radiation Oncology RCM Director will contact you within 4 business hours under a standard BAA.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLeadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Evans"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Center / Hospital Name *</label>
                <input
                  type="text"
                  required
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  placeholder="e.g. Pacific Radiation Oncology"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aevans@pacificradonc.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold py-3 px-6 rounded-lg text-sm transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <>
                  <span>Submit Radiation Oncology Review</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
