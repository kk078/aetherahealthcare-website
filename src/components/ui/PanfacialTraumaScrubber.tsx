'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Activity,
  Send,
  Sparkles,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  Layers,
  Copy,
  Crosshair,
} from 'lucide-react';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { sendLeadToKiran } from '@/lib/worker';

interface LineItem {
  code: string;
  modifier: string;
  description: string;
  rvu: number;
  estAllowed: number;
  status: 'compliant' | 'warning' | 'fatal';
  editReason?: string;
}

export default function PanfacialTraumaScrubber() {
  // Fracture & Reconstruction Selections
  const [midfaceType, setMidfaceType] = useState<'lefort3' | 'lefort2' | 'lefort1' | 'none'>('lefort3');
  const [zmcType, setZmcType] = useState<'zmc_graft' | 'zmc_simple' | 'none'>('zmc_graft');
  const [mandibleType, setMandibleType] = useState<'mandible_interdental' | 'mandible_simple' | 'none'>('mandible_interdental');
  const [imfStrategy, setImfStrategy] = useState<'postop_therapeutic' | 'intraop_temporary' | 'none'>('postop_therapeutic');
  const [orbitalType, setOrbitalType] = useState<'orbital_implant' | 'orbital_bone_graft' | 'none'>('orbital_implant');
  const [includeBoneGraft, setIncludeBoneGraft] = useState<boolean>(true);
  const [modifierStrategy, setModifierStrategy] = useState<'modifier_xs' | 'modifier_51'>('modifier_xs');

  // Lead capture state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPractice, setContactPractice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Claim Audit Calculation
  const auditResult = useMemo(() => {
    interface RawProcedure {
      code: string;
      baseRvu: number;
      baseAllowed: number;
      description: string;
      anatomicalSite: string;
    }

    const procs: RawProcedure[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let atRiskValue = 0;

    // 1. Midface Le Fort
    if (midfaceType === 'lefort3') {
      procs.push({
        code: '21435',
        baseRvu: 38.6,
        baseAllowed: 2700,
        description: 'Open treatment of craniofacial disjunction (Le Fort III); complicated, multi-segment',
        anatomicalSite: 'Craniofacial Junction / Midface',
      });
    } else if (midfaceType === 'lefort2') {
      procs.push({
        code: '21423',
        baseRvu: 25.4,
        baseAllowed: 1780,
        description: 'Open treatment of palatomaxillary fracture (Le Fort II); complicated',
        anatomicalSite: 'Palatomaxillary Midface',
      });
    } else if (midfaceType === 'lefort1') {
      procs.push({
        code: '21422',
        baseRvu: 20.8,
        baseAllowed: 1450,
        description: 'Open treatment of palatomaxillary fracture (Le Fort I); complicated',
        anatomicalSite: 'Lower Maxilla',
      });
    }

    // 2. ZMC / Malar Fracture
    if (zmcType === 'zmc_graft') {
      procs.push({
        code: '21365',
        baseRvu: 29.8,
        baseAllowed: 2080,
        description: 'Open treatment of complicated (comminuted) zygomatic arch and malar complex fracture with internal fixation',
        anatomicalSite: 'Zygomaticomaxillary Buttress',
      });
    } else if (zmcType === 'zmc_simple') {
      procs.push({
        code: '21360',
        baseRvu: 16.5,
        baseAllowed: 1150,
        description: 'Open treatment of depressed malar fracture, including zygomatic arch and facial bones',
        anatomicalSite: 'Zygoma',
      });
    }

    // 3. Mandible Fracture
    if (mandibleType === 'mandible_interdental') {
      procs.push({
        code: '21462',
        baseRvu: 27.2,
        baseAllowed: 1900,
        description: 'Open treatment of mandibular fracture with interdental fixation / rigid plating; complicated',
        anatomicalSite: 'Mandibular Body / Angle',
      });
    } else if (mandibleType === 'mandible_simple') {
      procs.push({
        code: '21461',
        baseRvu: 23.5,
        baseAllowed: 1640,
        description: 'Open treatment of mandibular fracture without interdental fixation',
        anatomicalSite: 'Mandible',
      });
    }

    // 4. Orbital Floor Blowout
    if (orbitalType === 'orbital_implant') {
      procs.push({
        code: '21390',
        baseRvu: 22.8,
        baseAllowed: 1590,
        description: 'Open treatment of orbital floor blowout fracture; periorbital approach with alloplastic / titanium implant',
        anatomicalSite: 'Orbital Floor',
      });
    } else if (orbitalType === 'orbital_bone_graft') {
      procs.push({
        code: '21385',
        baseRvu: 20.1,
        baseAllowed: 1400,
        description: 'Open treatment of orbital floor blowout fracture; periorbital approach with bone graft',
        anatomicalSite: 'Orbital Floor',
      });
    }

    // Sort procedures by base RVU descending for primary vs secondary ranking
    procs.sort((a, b) => b.baseRvu - a.baseRvu);

    const items: LineItem[] = [];
    let grossValue = 0;

    // Apply primary and secondary rules
    procs.forEach((proc, index) => {
      if (index === 0) {
        // Primary procedure: 100% reimbursement, no modifier needed
        items.push({
          code: proc.code,
          modifier: '',
          description: `${proc.description} [Primary Panfacial Reconstruction]`,
          rvu: proc.baseRvu,
          estAllowed: proc.baseAllowed,
          status: 'compliant',
          editReason: `Primary surgical reconstruction (${proc.anatomicalSite}) paid at 100% allowable rate.`,
        });
        grossValue += proc.baseAllowed;
      } else {
        // Secondary procedures: check modifier strategy
        const isModifierXS = modifierStrategy === 'modifier_xs';
        const mod = isModifierXS ? 'XS' : '51';
        // When using Mod XS for distinct anatomical structures, some commercial contracts pay 100% or reduced 50%
        const rate = isModifierXS ? 0.75 : 0.50; // Distinct structure modifier defense
        const secondaryAllowed = Math.round(proc.baseAllowed * rate);
        grossValue += secondaryAllowed;

        items.push({
          code: proc.code,
          modifier: mod,
          description: proc.description,
          rvu: proc.baseRvu,
          estAllowed: secondaryAllowed,
          status: 'compliant',
          editReason: isModifierXS
            ? `Modifier -XS defends distinct anatomical structure (${proc.anatomicalSite}) against blanket multiple-procedure bundling.`
            : `Modifier -51 applied under standard 50% multi-procedure fee reduction schedule.`,
        });
      }
    });

    // 5. Intermaxillary Fixation (CPT 21110) Audit
    if (imfStrategy === 'postop_therapeutic') {
      const imfAllowed = 1360;
      grossValue += imfAllowed;
      items.push({
        code: '21110',
        modifier: '59',
        description: 'Application of intermaxillary fixation facility; includes arch bars or traction screws',
        rvu: 19.5,
        estAllowed: imfAllowed,
        status: 'compliant',
        editReason: 'Continuous postoperative elastic traction maintained for skeletal stabilization. Modifier -59 defends distinct therapeutic service from intraoperative plating.',
      });
      recommendations.push('Ensure operative note details that arch bars remain in place postoperatively for 4–6 weeks of therapeutic intermaxillary fixation to support CPT 21110-59.');
    } else if (imfStrategy === 'intraop_temporary') {
      items.push({
        code: '21110',
        modifier: 'UNBUNDLED',
        description: 'Application of intermaxillary fixation facility (intraoperative reduction only)',
        rvu: 19.5,
        estAllowed: 1360,
        status: 'fatal',
        editReason: 'CMS NCCI Chapter VII edit: CPT 21110 is bundled into open mandibular/maxillary fracture repair if removed at the conclusion of surgery. Separate billing triggers immediate claim rejection.',
      });
      warnings.push('CRITICAL NCCI EDIT: Arch bars removed intraoperatively are inclusive to mandibular plating (21462). Billing CPT 21110 causes immediate claim clawback of $1,360.');
      recommendations.push('Suppress CPT 21110 if arch bars were used solely for temporary occlusion reduction during hardware fixation.');
      atRiskValue += 1360;
    }

    // 6. Autologous Bone Graft Harvesting (+20900)
    if (includeBoneGraft) {
      const graftAllowed = 410;
      grossValue += graftAllowed;
      items.push({
        code: '+20900',
        modifier: '59',
        description: 'Bone graft, any area, minor or small (calvarial / iliac crest donor site)',
        rvu: 5.8,
        estAllowed: graftAllowed,
        status: 'compliant',
        editReason: 'Separate surgical site autogenous bone graft harvest defended with Modifier -59 and distinct incision documentation.',
      });
    }

    return {
      items,
      warnings,
      recommendations,
      grossValue,
      atRiskValue,
      cleanAllowed: grossValue,
    };
  }, [midfaceType, zmcType, mandibleType, imfStrategy, orbitalType, includeBoneGraft, modifierStrategy]);

  // Lead submission
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactName) return;

    setIsSubmitting(true);
    try {
      await sendLeadToKiran('panfacial_trauma_rcm_audit', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        midfaceType,
        zmcType,
        mandibleType,
        imfStrategy,
        orbitalType,
        includeBoneGraft,
        grossValue: auditResult.grossValue,
        atRiskValue: auditResult.atRiskValue,
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Submission failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPacket = () => {
    const text = `--- AETHERA HEALTHCARE RCM PANFACIAL TRAUMA AUDIT ---
Midface Fracture: ${midfaceType.toUpperCase()}
ZMC Fracture: ${zmcType.toUpperCase()}
Mandible Fracture: ${mandibleType.toUpperCase()}
IMF Status: ${imfStrategy.toUpperCase()}
Orbital Reconstruction: ${orbitalType.toUpperCase()}
Bone Graft Harvest (+20900): ${includeBoneGraft ? 'YES' : 'NO'}
Gross Clean Value: $${auditResult.grossValue.toLocaleString()}
Revenue At Risk: $${auditResult.atRiskValue.toLocaleString()}

CLAIM CODING LEDGER:
${auditResult.items.map((i) => `${i.code}${i.modifier ? `-${i.modifier}` : ''} | $${i.estAllowed} | ${i.description}`).join('\n')}

RECOMMENDATIONS:
${auditResult.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy/90 to-teal text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-mint/20 text-mint border border-mint/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Crosshair className="w-3.5 h-3.5" />
            Maxillofacial Skeleton &amp; Panfacial Trauma Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Panfacial Trauma &amp; Multi-Level Fracture Reconstruction Scrubber
          </h2>
          <p className="mt-2 text-sm sm:text-base text-cream/90 max-w-3xl leading-relaxed">
            Eliminate multi-procedure bundling write-offs on complex midface Le Fort I/II/III fractures (21422–21435), ZMC repairs (21365), mandibular plating (21462), intermaxillary fixation (21110-59), and orbital floor reconstructive implants (21390).
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal" />
              1. Skeletal Fracture Patterns
            </h3>

            {/* Midface Le Fort */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Midface Maxillary Fracture (Le Fort)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'lefort3', label: 'Le Fort III (21435)' },
                  { id: 'lefort2', label: 'Le Fort II (21423)' },
                  { id: 'lefort1', label: 'Le Fort I (21422)' },
                  { id: 'none', label: 'No Midface' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMidfaceType(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      midfaceType === item.id
                        ? 'border-teal bg-teal/10 text-teal'
                        : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ZMC & Mandible */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Zygomaticomaxillary (ZMC) Complex
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'zmc_graft', label: 'Complicated / Plating (21365)' },
                    { id: 'zmc_simple', label: 'Depressed Malar (21360)' },
                    { id: 'none', label: 'No ZMC Fracture' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setZmcType(item.id as any)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                        zmcType === item.id
                          ? 'border-teal bg-teal/10 text-teal'
                          : 'border-gray/20 text-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Mandibular Fracture
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'mandible_interdental', label: 'ORIF with Plating (21462)' },
                    { id: 'mandible_simple', label: 'Simple ORIF (21461)' },
                    { id: 'none', label: 'No Mandibular Fracture' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMandibleType(item.id as any)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                        mandibleType === item.id
                          ? 'border-teal bg-teal/10 text-teal'
                          : 'border-gray/20 text-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Intermaxillary Fixation & Orbital Reconstruction */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-teal" />
              2. Occlusal Fixation &amp; Orbital Reconstruction
            </h3>

            {/* IMF Strategy */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Intermaxillary Fixation (IMF 21110) Audit Strategy
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'postop_therapeutic', label: 'Post-Op Elastic Traction (Mod 59)' },
                  { id: 'intraop_temporary', label: 'Intraoperative Removal (Test Bundling)' },
                  { id: 'none', label: 'No IMF Billed' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setImfStrategy(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      imfStrategy === item.id
                        ? item.id === 'intraop_temporary'
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-teal bg-teal/10 text-teal'
                        : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orbital Floor */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Orbital Floor Blowout Reconstruction
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'orbital_implant', label: 'Titanium / Mesh (21390)' },
                  { id: 'orbital_bone_graft', label: 'Bone Graft (21385)' },
                  { id: 'none', label: 'No Orbital Fracture' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOrbitalType(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      orbitalType === item.id
                        ? 'border-teal bg-teal/10 text-teal'
                        : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bone graft & Modifier Strategy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBoneGraft}
                  onChange={(e) => setIncludeBoneGraft(e.target.checked)}
                  className="rounded text-teal focus:ring-teal h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">Autologous Bone Harvest (+20900)</span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Multi-Procedure Modifiers
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setModifierStrategy('modifier_xs')}
                    className={`p-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      modifierStrategy === 'modifier_xs' ? 'border-teal bg-teal/10 text-teal' : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    Mod -XS (Distinct Site)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModifierStrategy('modifier_51')}
                    className={`p-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      modifierStrategy === 'modifier_51' ? 'border-teal bg-teal/10 text-teal' : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    Mod -51 (Standard 50%)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Audit Ledger & Action Center */}
        <div className="lg:col-span-6 space-y-6">
          {/* Audit Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray/15 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Clean Allowed</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">
                ${auditResult.cleanAllowed.toLocaleString()}
              </div>
              <span className="text-xs text-teal font-medium mt-1 inline-block">Multi-Level Skeleton Repair</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray/15 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue At Risk</span>
              <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${auditResult.atRiskValue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ${auditResult.atRiskValue.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500 mt-1 inline-block">Unbundling &amp; Cascading Reduction</span>
            </div>
          </div>

          {/* Warnings Panel */}
          {auditResult.warnings.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>NCCI Compliance &amp; Bundling Alert Detected</span>
              </div>
              <ul className="space-y-2 text-xs text-rose-700">
                {auditResult.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Line Item Ledger */}
          <div className="bg-white border border-gray/15 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray/10 pb-3">
              <h4 className="font-bold text-navy text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal" />
                ANSI X12 837P Claim Line Item Ledger
              </h4>
              <button
                type="button"
                onClick={handleCopyPacket}
                className="inline-flex items-center gap-1.5 text-xs text-teal hover:text-navy font-semibold transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Audit Copied!' : 'Copy Audit Packet'}
              </button>
            </div>

            <div className="divide-y divide-gray/10">
              {auditResult.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-navy text-sm">{item.code}</span>
                      {item.modifier && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                          item.modifier === 'UNBUNDLED' ? 'bg-rose-100 text-rose-700' : 'bg-teal/15 text-teal'
                        }`}>
                          {item.modifier}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        item.status === 'compliant'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'warning'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{item.description}</p>
                    {item.editReason && (
                      <p className="text-[11px] text-slate-500 italic">{item.editReason}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-navy">${item.estAllowed.toLocaleString()}</div>
                    <div className="text-[11px] text-slate-400">{item.rvu} RVUs</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Capture Form */}
          <div className="bg-gradient-to-br from-cream/40 to-teal/5 border border-teal/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-teal" />
              <h4 className="font-bold text-navy text-sm">Request Comprehensive Panfacial Trauma RCM Audit</h4>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Have our certified surgical coders review your complex facial fracture operative reports, multi-surgeon co-surgery splits, and intermaxillary fixation claims.
            </p>

            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <h5 className="text-sm font-bold text-emerald-900">Audit Request Received</h5>
                <p className="text-xs text-emerald-700 mt-1">
                  Our trauma and craniofacial surgery RCM specialist will contact you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Physician / Trauma Practice Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Work Email (e.g. jmiller@traumacenter.org)"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Hospital / Level 1 Trauma System"
                    value={contactPractice}
                    onChange={(e) => setContactPractice(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Direct Phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal hover:bg-navy text-white font-bold text-xs py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    'Processing Audit Request...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Panfacial Trauma Case for Comprehensive Practice Audit
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
