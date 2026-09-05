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
  Zap,
  Info,
  Layers,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

type VascularTerritory = 'iliac' | 'fem_pop' | 'tibial_peroneal';

interface TerritoryConfig {
  id: VascularTerritory;
  name: string;
  description: string;
  primaryInterventions: {
    id: string;
    code: string;
    name: string;
    rate: number;
    bundlesAngioplasty?: boolean;
  }[];
  additionalInterventions?: {
    id: string;
    code: string;
    name: string;
    rate: number;
  }[];
}

const TERRITORIES: TerritoryConfig[] = [
  {
    id: 'fem_pop',
    name: 'Femoral / Popliteal Territory',
    description: 'Single continuous vascular bed from common femoral bifurcation to tibioperoneal trunk.',
    primaryInterventions: [
      { id: 'fem_ath_stent', code: '37227', name: 'Atherectomy & Stent Placement', rate: 1280.0, bundlesAngioplasty: true },
      { id: 'fem_ath', code: '37225', name: 'Atherectomy alone', rate: 960.0, bundlesAngioplasty: true },
      { id: 'fem_stent', code: '37226', name: 'Stent placement alone', rate: 830.0, bundlesAngioplasty: true },
      { id: 'fem_pta', code: '37224', name: 'Angioplasty (PTA) alone', rate: 510.0 },
    ],
  },
  {
    id: 'tibial_peroneal',
    name: 'Tibial / Peroneal Territory',
    description: 'Three distinct vessel beds: Anterior tibial, posterior tibial, and peroneal arteries.',
    primaryInterventions: [
      { id: 'tib_ath_stent', code: '37231', name: 'Initial Vessel: Atherectomy & Stent', rate: 1450.0, bundlesAngioplasty: true },
      { id: 'tib_ath', code: '37229', name: 'Initial Vessel: Atherectomy alone', rate: 1120.0, bundlesAngioplasty: true },
      { id: 'tib_stent', code: '37230', name: 'Initial Vessel: Stent placement alone', rate: 990.0, bundlesAngioplasty: true },
      { id: 'tib_pta', code: '37228', name: 'Initial Vessel: Angioplasty (PTA) alone', rate: 680.0 },
    ],
    additionalInterventions: [
      { id: 'tib_addl_ath_stent', code: '+37235', name: 'Second Vessel: Atherectomy & Stent', rate: 680.0 },
      { id: 'tib_addl_ath', code: '+37233', name: 'Second Vessel: Atherectomy alone', rate: 520.0 },
      { id: 'tib_addl_stent', code: '+37234', name: 'Second Vessel: Stent placement alone', rate: 460.0 },
      { id: 'tib_addl_pta', code: '+37232', name: 'Second Vessel: Angioplasty alone', rate: 310.0 },
    ],
  },
  {
    id: 'iliac',
    name: 'Iliac Territory',
    description: 'Common iliac, external iliac, and internal iliac arterial beds.',
    primaryInterventions: [
      { id: 'iliac_stent', code: '37221', name: 'Initial Vessel: Stent placement', rate: 720.0, bundlesAngioplasty: true },
      { id: 'iliac_pta', code: '37220', name: 'Initial Vessel: Angioplasty (PTA) alone', rate: 440.0 },
    ],
    additionalInterventions: [
      { id: 'iliac_addl_stent', code: '+37223', name: 'Additional Vessel: Stent placement', rate: 380.0 },
      { id: 'iliac_addl_pta', code: '+37222', name: 'Additional Vessel: Angioplasty alone', rate: 210.0 },
    ],
  },
];

export default function PadRevascularizationScrubber() {
  const [selectedTerritory, setSelectedTerritory] = useState<VascularTerritory>('fem_pop');
  const [selectedPrimaryInterventionId, setSelectedPrimaryInterventionId] = useState<string>('fem_ath_stent');
  const [hasAdditionalVessel, setHasAdditionalVessel] = useState<boolean>(false);
  const [selectedAddlInterventionId, setSelectedAddlInterventionId] = useState<string>('');

  // Unbundling Test Toggles
  const [billsSeparateAngioplastyInSameVessel, setBillsSeparateAngioplastyInSameVessel] = useState<boolean>(false);
  const [billsSelectiveCatheterPlacement, setBillsSelectiveCatheterPlacement] = useState<boolean>(true); // CPT 36247
  const [billsDiagnosticAngiography, setBillsDiagnosticAngiography] = useState<boolean>(true); // CPT 75710
  const [diagAngioMeetsExemption, setDiagAngioMeetsExemption] = useState<boolean>(true); // Mod 59/XU defensible
  const [includesIvus, setIncludesIvus] = useState<boolean>(true); // CPT 37252

  // Lead Form
  const [practiceName, setPracticeName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEdi, setCopiedEdi] = useState(false);

  const activeTerritory = useMemo(() => {
    return TERRITORIES.find((t) => t.id === selectedTerritory) || TERRITORIES[0];
  }, [selectedTerritory]);

  const activePrimary = useMemo(() => {
    return activeTerritory.primaryInterventions.find((p) => p.id === selectedPrimaryInterventionId) || activeTerritory.primaryInterventions[0];
  }, [activeTerritory, selectedPrimaryInterventionId]);

  const activeAddl = useMemo(() => {
    if (!hasAdditionalVessel || !activeTerritory.additionalInterventions) return null;
    return activeTerritory.additionalInterventions.find((a) => a.id === selectedAddlInterventionId) || activeTerritory.additionalInterventions[0];
  }, [hasAdditionalVessel, activeTerritory, selectedAddlInterventionId]);

  // Financial Calculations
  const calculations = useMemo(() => {
    let total = activePrimary.rate;

    if (activeAddl) {
      total += activeAddl.rate;
    }

    const ivusFee = includesIvus ? 142.0 : 0;
    const diagAngioFee = billsDiagnosticAngiography && diagAngioMeetsExemption ? 94.0 : 0;

    total += ivusFee + diagAngioFee;

    return {
      primaryRate: activePrimary.rate,
      addlRate: activeAddl ? activeAddl.rate : 0,
      ivusFee,
      diagAngioFee,
      totalAllowed: total,
    };
  }, [activePrimary, activeAddl, includesIvus, billsDiagnosticAngiography, diagAngioMeetsExemption]);

  // NCCI Compliance Violations Audit
  const auditWarnings = useMemo(() => {
    const warnings: string[] = [];

    if (billsSeparateAngioplastyInSameVessel && activePrimary.bundlesAngioplasty) {
      warnings.push(`Same-Vessel PTA Unbundling: Angioplasty is statutorily bundled into CPT ${activePrimary.code}. Submitting a separate PTA line causes automated CARC CO-97 denial.`);
    }

    if (billsSelectiveCatheterPlacement) {
      warnings.push(`Selective Catheter Placement Bundled: CPT 36245–36248 is bundled into lower extremity revascularization codes 37220–37235. Cannot be unbundled with Modifier 59.`);
    }

    if (billsDiagnosticAngiography && !diagAngioMeetsExemption) {
      warnings.push(`Diagnostic Angiography Redundancy: CPT 75710 cannot be billed if prior diagnostic catheterization was performed or if angiography is merely roadmapping for the intervention.`);
    }

    return warnings;
  }, [billsSeparateAngioplastyInSameVessel, activePrimary, billsSelectiveCatheterPlacement, billsDiagnosticAngiography, diagAngioMeetsExemption]);

  // ANSI X12 837P EDI Simulation
  const ediSnippet = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let segments = `LX*1~\nSV1*HC:${activePrimary.code}*${(activePrimary.rate * 2.1).toFixed(2)}*UN*1***1~\nDTP*472*D8*${today}~`;

    let lineIndex = 2;
    if (activeAddl) {
      segments += `\nLX*${lineIndex}~\nSV1*HC:${activeAddl.code.replace('+', '')}*${(activeAddl.rate * 2.1).toFixed(2)}*UN*1***1~\nDTP*472*D8*${today}~`;
      lineIndex++;
    }

    if (includesIvus) {
      segments += `\nLX*${lineIndex}~\nSV1*HC:37252*${(142.0 * 2.1).toFixed(2)}*UN*1***1~\nDTP*472*D8*${today}~`;
      lineIndex++;
    }

    if (billsDiagnosticAngiography && diagAngioMeetsExemption) {
      segments += `\nLX*${lineIndex}~\nSV1*HC:75710:59*${(94.0 * 2.1).toFixed(2)}*UN*1***1~\nDTP*472*D8*${today}~`;
    }

    return `ISA*00*          *00*          *ZZ*VASCULARPRACTICE*ZZ*PAYERROUTING   *${today.slice(2)}*1145*^*00501*000000001*0*P*:~
GS*HC*SENDER*RECEIVER*${today}*1145*1*X*005010X222A1~
ST*837*0001*005010X222A1~
BHT*0019*00*PAD-${today}-001*${today}*1145*CH~
NM1*85*2*VASCULAR & ENDOVASCULAR SURGEONS*****XX*1948372615~
NM1*IL*1*MILLER*GEORGE****MI*MED883746251~
CLM*PAD-${today}*${(calculations.totalAllowed * 2.1).toFixed(2)}***11:B:1*Y*A*Y*Y~
HI*ABK:I70.213*ABF:I70.223~
${segments}
SE*18*0001~
GE*1*1~
IEA*1*000000001~`;
  }, [activePrimary, activeAddl, includesIvus, billsDiagnosticAngiography, diagAngioMeetsExemption, calculations]);

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
      territory: activeTerritory.name,
      primaryCode: activePrimary.code,
      additionalVesselCode: activeAddl ? activeAddl.code : 'None',
      auditViolationsCount: auditWarnings.length,
      auditWarnings,
      totalEstimatedAllowed: calculations.totalAllowed,
      pageUrl: typeof window !== 'undefined' ? window.location.href : '/tools/pad-revascularization-scrubber',
      submittedAt: new Date().toISOString(),
    };

    try {
      await sendLeadToKiran('pad_revascularization_scrubber_audit', payload);
      trackConversion('assessment', calculations.totalAllowed);
      setSubmitted(true);
    } catch (err) {
      console.error('Lead submission failed:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTerritoryChange = (id: VascularTerritory) => {
    setSelectedTerritory(id);
    const terr = TERRITORIES.find((t) => t.id === id) || TERRITORIES[0];
    setSelectedPrimaryInterventionId(terr.primaryInterventions[0].id);
    if (terr.additionalInterventions) {
      setSelectedAddlInterventionId(terr.additionalInterventions[0].id);
    } else {
      setHasAdditionalVessel(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray/15 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <GitBranch className="h-3.5 w-3.5 text-sky-600" />
              CPT 37220–37235 Endovascular Revascularization Hierarchy
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-jakarta text-navy">
              Endovascular &amp; PAD Revascularization Scrubber
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enforce CPT vascular territory hierarchy (iliac, femoral-popliteal, tibial-peroneal), suppress bundled angioplasties and selective catheter placements (36245–36248), and audit diagnostic angiography (75710) Modifier 59 exemptions.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[240px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Estimated Allowed Total
            </span>
            <div className="text-3xl font-extrabold text-navy">
              ${calculations.totalAllowed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" /> CMS MPFS Facility / OBL Rate
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Vascular Territory Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">Vascular Territory &amp; Bed Definition</h3>
                <p className="text-xs text-slate-500">CPT guidelines mandate strict single-bed territory coding</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TERRITORIES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTerritoryChange(t.id)}
                  className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${
                    selectedTerritory === t.id
                      ? 'bg-navy text-white border-navy shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-gray/20 hover:border-slate-300'
                  }`}
                >
                  <div>{t.name}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              {activeTerritory.description}
            </p>
          </div>

          {/* Section 2: Primary Vessel Intervention Hierarchy */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">Primary Vessel Procedure Hierarchy</h3>
                <p className="text-xs text-slate-500">Only the highest-tier intervention per vessel may be reported</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {activeTerritory.primaryInterventions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPrimaryInterventionId(p.id)}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    selectedPrimaryInterventionId === p.id
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-400/20'
                      : 'border-gray/20 hover:border-sky-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-navy">{p.name}</span>
                    <span className="font-mono font-bold text-xs bg-white border border-gray/20 px-2 py-0.5 rounded text-sky-800">
                      CPT {p.code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    CMS MPFS Allowed Rate: <span className="font-bold text-slate-800">${p.rate.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Additional Vessel in Same Session */}
            {activeTerritory.additionalInterventions && (
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-navy cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAdditionalVessel}
                    onChange={(e) => setHasAdditionalVessel(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                  />
                  <span>Second / Additional Ipsilateral Vessel Treated in Same Session</span>
                </label>

                {hasAdditionalVessel && (
                  <div className="grid grid-cols-1 gap-2 pl-6">
                    {activeTerritory.additionalInterventions.map((addl) => (
                      <button
                        key={addl.id}
                        type="button"
                        onClick={() => setSelectedAddlInterventionId(addl.id)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          selectedAddlInterventionId === addl.id
                            ? 'border-sky-500 bg-sky-50/60 ring-1 ring-sky-400'
                            : 'border-gray/20 hover:border-slate-300 bg-slate-50/60'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-800">{addl.name}</span>
                          <span className="font-mono font-bold text-sky-800">{addl.code} (+${addl.rate})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Statutory NCCI Bundling Scrubber */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">NCCI Bundling &amp; Modifiers Scrubber</h3>
                <p className="text-xs text-slate-500">Audit unbundling collisions before claim submission</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={billsSeparateAngioplastyInSameVessel}
                  onChange={(e) => setBillsSeparateAngioplastyInSameVessel(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 mt-0.5"
                />
                <div>
                  <span className="font-bold block text-navy">Simultaneous PTA billed on same vessel with Stent/Atherectomy:</span>
                  <span className="text-slate-500">Angioplasty in the same vessel is deemed pre-dilation or post-dilation and cannot be unbundled.</span>
                </div>
              </label>

              <label className="flex items-start gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={billsSelectiveCatheterPlacement}
                  onChange={(e) => setBillsSelectiveCatheterPlacement(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 mt-0.5"
                />
                <div>
                  <span className="font-bold block text-navy">Selective Catheter Placement Billed (CPT 36245–36248):</span>
                  <span className="text-slate-500">CMS statutory rule: vascular access and catheter positioning are included in 37220–37235.</span>
                </div>
              </label>

              <label className="flex items-start gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={billsDiagnosticAngiography}
                  onChange={(e) => setBillsDiagnosticAngiography(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4 mt-0.5"
                />
                <div>
                  <span className="font-bold block text-navy">Diagnostic Extremity Angiography (CPT 75710 with Mod 59):</span>
                  <span className="text-slate-500">Only billable if true diagnostic study decided the intervention and formal report is attached.</span>
                </div>
              </label>

              <label className="flex items-start gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includesIvus}
                  onChange={(e) => setIncludesIvus(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4 mt-0.5"
                />
                <div>
                  <span className="font-bold block text-navy">Intravascular Ultrasound (IVUS - CPT 37252):</span>
                  <span className="text-slate-500">Separately billable add-on when cross-sectional vessel lumen measurement is documented.</span>
                </div>
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
                <ShieldCheck className="h-5 w-5 text-sky-600" />
                <h3 className="font-bold text-base text-navy">Endovascular Scrubber Audit</h3>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  auditWarnings.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {auditWarnings.length > 0 ? 'Bundling Suppressed' : 'Claim Clean'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Primary Intervention:</span>
                <span className="font-mono font-bold text-navy">CPT {activePrimary.code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Primary Allowed:</span>
                <span className="font-bold text-slate-800">${calculations.primaryRate.toFixed(2)}</span>
              </div>
              {activeAddl && (
                <div className="flex justify-between items-center text-sky-700">
                  <span className="font-medium">Additional Vessel:</span>
                  <span className="font-mono font-bold">{activeAddl.code} (+${calculations.addlRate.toFixed(2)})</span>
                </div>
              )}
              {includesIvus && (
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">IVUS Catheter (37252):</span>
                  <span className="font-bold text-emerald-600">+${calculations.ivusFee.toFixed(2)}</span>
                </div>
              )}
              {billsDiagnosticAngiography && (
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">Diagnostic Angio (75710-59):</span>
                  <span className="font-bold text-emerald-600">+${calculations.diagAngioFee.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-navy">
                <span>Total Revascularization Allowed:</span>
                <span className="text-sky-700">${calculations.totalAllowed.toFixed(2)}</span>
              </div>
            </div>

            {/* Warnings Box */}
            {auditWarnings.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  {auditWarnings.length} NCCI Edit Conflict(s) Detected
                </div>
                <ul className="text-xs text-amber-800 list-disc list-inside space-y-1">
                  {auditWarnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ANSI X12 837P Preview */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  ANSI X12 837P Endovascular Lines
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
            <pre className="font-mono text-[11px] leading-relaxed text-sky-300/90 bg-slate-950 p-3.5 rounded-xl overflow-x-auto max-h-56 scrollbar-thin">
              {ediSnippet}
            </pre>
            <p className="text-[10px] text-slate-400">
              EDI 837P professional claim lines with compliant primary and add-on vessel hierarchy.
            </p>
          </div>

          {/* Practice Audit Lead Card */}
          <div className="bg-gradient-to-br from-navy via-[#003087] to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-mint/20 border border-mint/40 text-mint text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                <Activity className="h-3 w-3" />
                Vascular &amp; OBL Practice Audit
              </div>
              <div>
                <h4 className="text-lg font-bold">Audit 50 Endovascular Claims Free</h4>
                <p className="text-xs text-cream/80 mt-1 leading-relaxed">
                  Our certified vascular surgical coders will audit up to 50 recent PAD revascularization, EVAR, or dialysis access salvage claims to eliminate unbundling write-offs and recover underpayments.
                </p>
              </div>

              {submitted ? (
                <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Audit request received. Kiran’s vascular surgery audit team will contact you within 24 hours.</span>
                </div>
              ) : (
                <form onSubmit={handleAuditSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Vascular Center / OBL Name"
                      value={practiceName}
                      onChange={(e) => setPracticeName(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-hidden focus:border-mint"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Surgeon / Manager Name"
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
                        <Send className="h-3.5 w-3.5" /> Request 50-Claim Vascular Audit
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-cream/60 text-center">
                    Confidential HIPAA compliant · Zero obligation · Direct to Kiran
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
