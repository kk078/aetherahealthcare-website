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

export default function PediatricVascularScrubber() {
  // Anomaly & Procedure selections
  const [anomalyType, setAnomalyType] = useState<'vm' | 'lm' | 'avm' | 'hemangioma'>('vm');
  const [procedureCode, setProcedureCode] = useState<'37241' | '49185' | '37242'>('37241');
  const [imagingGuidance, setImagingGuidance] = useState<'dual' | 'us_only' | 'fluoro_only' | 'none'>('dual');
  const [sclerosantAgent, setSclerosantAgent] = useState<'bleomycin' | 'sotradecol' | 'doxycycline' | 'ethanol'>('bleomycin');
  const [sessionStage, setSessionStage] = useState<'initial' | 'staged_58' | 'unplanned_78'>('staged_58');
  const [angiographyType, setAngiographyType] = useState<'separate_diag' | 'therapeutic_roadmap'>('separate_diag');
  const [sclerosantUnits, setSclerosantUnits] = useState<number>(15); // e.g. 15 units Bleomycin

  // Lead capture state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPractice, setContactPractice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Claim Audit Calculation
  const auditResult = useMemo(() => {
    const items: LineItem[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let grossValue = 0;
    let atRiskValue = 0;

    // 1. Primary Procedure Line
    if (procedureCode === '37241') {
      const isStaged = sessionStage === 'staged_58';
      const mod = isStaged ? '58' : sessionStage === 'unplanned_78' ? '78' : '';
      const allowed = 1680;
      items.push({
        code: '37241',
        modifier: mod,
        description: 'Vascular embolization or occlusion, venous / low-flow vascular malformation',
        rvu: 14.8,
        estAllowed: allowed,
        status: isStaged ? 'compliant' : sessionStage === 'unplanned_78' ? 'warning' : 'compliant',
        editReason: isStaged
          ? 'Modifier -58 appended: Protects 100% allowable on staged procedure during 90-day global period'
          : sessionStage === 'unplanned_78'
          ? 'Modifier -78 incurs 30% intraoperative reduction on unplanned return'
          : undefined,
      });
      grossValue += allowed;
      if (sessionStage === 'unplanned_78') atRiskValue += allowed * 0.3;
    } else if (procedureCode === '49185') {
      const isStaged = sessionStage === 'staged_58';
      const mod = isStaged ? '58' : '';
      const allowed = 1240;
      items.push({
        code: '49185',
        modifier: mod,
        description: 'Sclerotherapy, fluid collection or lymphocele / macrocystic lymphatic malformation',
        rvu: 10.4,
        estAllowed: allowed,
        status: 'compliant',
        editReason: isStaged ? 'Modifier -58 preserves planned treatment series payment' : undefined,
      });
      grossValue += allowed;
    } else if (procedureCode === '37242') {
      const allowed = 2450;
      items.push({
        code: '37242',
        modifier: sessionStage === 'staged_58' ? '58' : '',
        description: 'Vascular embolization or occlusion, arterial / high-flow AVM nidus',
        rvu: 22.1,
        estAllowed: allowed,
        status: 'compliant',
      });
      grossValue += allowed;
    }

    // 2. Imaging Guidance Lines
    if (imagingGuidance === 'dual') {
      const allowedUS = 210;
      const allowedFluoro = 195;
      items.push({
        code: '76937',
        modifier: '26',
        description: 'Ultrasound guidance for vascular access / percutaneous needle placement',
        rvu: 1.8,
        estAllowed: allowedUS,
        status: 'compliant',
        editReason: 'Requires recorded hardcopy images showing needle entry and permanent interpretation report',
      });
      items.push({
        code: '77002',
        modifier: '26',
        description: 'Fluoroscopic guidance for needle placement and sclerosant contrast dispersion',
        rvu: 1.6,
        estAllowed: allowedFluoro,
        status: 'compliant',
        editReason: 'NCCI edit defense: distinct from US guidance; verify contrast stagnation dictation',
      });
      grossValue += allowedUS + allowedFluoro;
    } else if (imagingGuidance === 'us_only') {
      const allowedUS = 210;
      items.push({
        code: '76937',
        modifier: '26',
        description: 'Ultrasound guidance for vascular access',
        rvu: 1.8,
        estAllowed: allowedUS,
        status: 'compliant',
      });
      grossValue += allowedUS;
    } else if (imagingGuidance === 'fluoro_only') {
      const allowedFluoro = 195;
      items.push({
        code: '77002',
        modifier: '26',
        description: 'Fluoroscopic guidance for needle placement',
        rvu: 1.6,
        estAllowed: allowedFluoro,
        status: 'compliant',
      });
      grossValue += allowedFluoro;
    } else {
      warnings.push('No imaging guidance billed: Commercial payers frequently scrutinize high-flow or deep lesions treated without documented radiographic guidance.');
    }

    // 3. Selective Diagnostic Angiogram Line
    if (procedureCode === '37242' || anomalyType === 'avm') {
      if (angiographyType === 'separate_diag') {
        const allowedAngio = 890;
        items.push({
          code: '36245',
          modifier: '59',
          description: 'Selective catheter placement, arterial system (first order) for diagnostic arteriogram',
          rvu: 7.2,
          estAllowed: allowedAngio,
          status: 'compliant',
          editReason: 'Modifier 59 defended: Diagnostic decision made at time of procedure prior to embolization',
        });
        grossValue += allowedAngio;
      } else {
        items.push({
          code: '36245',
          modifier: '',
          description: 'Therapeutic roadmap catheterization (Bundled into 37242)',
          rvu: 0,
          estAllowed: 0,
          status: 'fatal',
          editReason: 'FATAL NCCI BUNDLE: Catheterization solely for roadmapping embolization is non-reimbursable',
        });
        warnings.push('Catheter placement (36245) without Modifier 59 will be denied under NCCI PTP edits as inclusive to 37242.');
        atRiskValue += 890;
      }
    }

    // 4. Sclerosant J-Codes
    if (sclerosantAgent === 'bleomycin') {
      const costPerUnit = 28.5; // per 15-unit vial / fractional
      const allowedJ = costPerUnit * sclerosantUnits;
      items.push({
        code: 'J9040',
        modifier: '',
        description: `Injection, Bleomycin sulfate, 15 units (Qty: ${sclerosantUnits})`,
        rvu: 0,
        estAllowed: allowedJ,
        status: 'warning',
        editReason: 'Off-label oncology NDC review: Requires prior authorization and pediatric multidisciplinary team note',
      });
      grossValue += allowedJ;
      warnings.push('Bleomycin J9040: Off-label use for vascular sclerotherapy triggers commercial payer automated medical necessity denials without a pre-procedure LOE (Letter of Exemption).');
      atRiskValue += allowedJ;
    } else if (sclerosantAgent === 'sotradecol') {
      const allowedJ = 145;
      items.push({
        code: 'J3490',
        modifier: '',
        description: 'Unclassified drugs (Sodium tetradecyl sulfate 3% Sotradecol, NDC required)',
        rvu: 0,
        estAllowed: allowedJ,
        status: 'warning',
        editReason: 'J3490 requires box 19 / 2410 loop invoice attachments, exact NDC 11-digit code, and metric quantity',
      });
      grossValue += allowedJ;
      atRiskValue += allowedJ;
    } else if (sclerosantAgent === 'doxycycline') {
      const allowedJ = 85;
      items.push({
        code: 'J3490',
        modifier: '',
        description: 'Unclassified drugs (Doxycycline hyclate 100mg for macrocystic LM sclerosis)',
        rvu: 0,
        estAllowed: allowedJ,
        status: 'compliant',
        editReason: 'Standard off-label lymphangioma sclerosant; attach package insert and drug invoice',
      });
      grossValue += allowedJ;
    }

    // Recommendations
    if (sessionStage === 'staged_58') {
      recommendations.push('Modifier -58 is properly staged: Operative notes must quote the initial vascular anomalies board treatment plan outlining staged sequential sessions.');
    }
    if (procedureCode === '37241' && imagingGuidance === 'dual') {
      recommendations.push('Dual imaging (+76937 & +77002): Document real-time ultrasound puncture followed by digital subtraction fluoroscopy demonstrating contrast stagnation in dysplastic venous lakes.');
    }
    recommendations.push('General Anesthesia Concurrency: Ensure pediatric anesthesiology report aligns ASA Physical Status Class (ASA III/IV for airway-compromising malformations) with pediatric interventional radiology start/stop times.');

    return {
      items,
      warnings,
      recommendations,
      grossValue: Math.round(grossValue),
      atRiskValue: Math.round(atRiskValue),
      cleanClaimScore: atRiskValue === 0 ? 98 : Math.max(45, Math.round(100 - (atRiskValue / (grossValue || 1)) * 100)),
    };
  }, [anomalyType, procedureCode, imagingGuidance, sclerosantAgent, sessionStage, angiographyType, sclerosantUnits]);

  // Handle Form Submission
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail) return;
    setIsSubmitting(true);
    try {
      await sendLeadToKiran('pediatric_vascular_rcm_audit', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        anomalyType,
        procedureCode,
        imagingGuidance,
        sclerosantAgent,
        sessionStage,
        angiographyType,
        grossValue: auditResult.grossValue,
        atRiskValue: auditResult.atRiskValue,
        cleanClaimScore: auditResult.cleanClaimScore,
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Lead submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy/90 to-teal text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-mint/20 text-mint border border-mint/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Specialized Pediatric IR & Vascular Anomaly Scrubber
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Pediatric Vascular Malformations & Sclerotherapy Scrubber
          </h2>
          <p className="mt-2 text-sm sm:text-base text-cream/90 max-w-3xl leading-relaxed">
            Eliminate denials on image-guided percutaneous sclerotherapy (37241/49185), high-flow AVM embolization (37242), off-label sclerosant J-codes (Bleomycin J9040), dual ultrasound/fluoroscopy add-ons, and staged procedure Modifier -58.
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Clinical Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-xl shadow-md border border-gray/10 p-6 space-y-5">
            <h2 className="text-lg font-bold text-navy flex items-center gap-2 border-b border-gray/10 pb-3 font-jakarta">
              <Stethoscope className="w-5 h-5 text-teal" />
              1. Lesion Classification & Procedure
            </h2>

            {/* Anomaly Type */}
            <div>
              <label className="block text-xs font-semibold text-gray mb-1.5 uppercase tracking-wider">
                Vascular Anomaly Classification (ISSVA)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'vm', label: 'Venous Malformation (VM)' },
                  { id: 'lm', label: 'Lymphatic Malformation (LM)' },
                  { id: 'avm', label: 'Arteriovenous Malformation (AVM)' },
                  { id: 'hemangioma', label: 'Ulcerated Hemangioma' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAnomalyType(t.id as any)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition-all text-left ${
                      anomalyType === t.id
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-cream/40 text-navy border-gray/20 hover:bg-cream'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Procedure */}
            <div>
              <label className="block text-xs font-semibold text-gray mb-1.5 uppercase tracking-wider">
                Primary Interventional Procedure
              </label>
              <select
                value={procedureCode}
                onChange={(e) => setProcedureCode(e.target.value as any)}
                className="w-full bg-white border border-gray/20 rounded-lg p-2.5 text-xs sm:text-sm font-semibold text-navy focus:ring-2 focus:ring-teal focus:border-teal"
              >
                <option value="37241">CPT 37241 - Percutaneous Venous Embolization / Sclerotherapy</option>
                <option value="49185">CPT 49185 - Sclerotherapy, Fluid Collection / Macrocystic LM</option>
                <option value="37242">CPT 37242 - Transcatheter Embolization, Arterial / High-Flow AVM</option>
              </select>
            </div>

            {/* Imaging Guidance */}
            <div>
              <label className="block text-xs font-semibold text-gray mb-1.5 uppercase tracking-wider">
                Intraoperative Imaging Guidance
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'dual', label: 'Dual US + Fluoro (+76937 & +77002)' },
                  { id: 'us_only', label: 'Ultrasound Guidance Only (+76937)' },
                  { id: 'fluoro_only', label: 'Fluoroscopy Only (+77002)' },
                  { id: 'none', label: 'No Imaging Guidance' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setImagingGuidance(g.id as any)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-left ${
                      imagingGuidance === g.id
                        ? 'bg-teal text-white border-teal shadow-sm'
                        : 'bg-cream/40 text-navy border-gray/20 hover:bg-cream'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sclerosant Agent & J-Code */}
            <div>
              <label className="block text-xs font-semibold text-gray mb-1.5 uppercase tracking-wider">
                Sclerosant Drug & HCPCS J-Code
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bleomycin', label: 'Bleomycin (J9040) Off-Label' },
                  { id: 'sotradecol', label: 'Sotradecol STS 3% (J3490)' },
                  { id: 'doxycycline', label: 'Doxycycline USP (J3490)' },
                  { id: 'ethanol', label: 'Absolute Alcohol / Foam' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSclerosantAgent(s.id as any)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-left ${
                      sclerosantAgent === s.id
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-cream/40 text-navy border-gray/20 hover:bg-cream'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Staging & Global Period */}
            <div>
              <label className="block text-xs font-semibold text-gray mb-1.5 uppercase tracking-wider">
                Treatment Episode Staging (90-Day Global Interval)
              </label>
              <select
                value={sessionStage}
                onChange={(e) => setSessionStage(e.target.value as any)}
                className="w-full bg-white border border-gray/20 rounded-lg p-2.5 text-xs sm:text-sm font-semibold text-navy focus:ring-2 focus:ring-teal focus:border-teal"
              >
                <option value="staged_58">Planned Staged Session (Append Modifier -58)</option>
                <option value="initial">Initial Diagnostic & Treatment Session (No Modifier)</option>
                <option value="unplanned_78">Unplanned Return for Post-Procedure Bleed/Complication (Mod -78)</option>
              </select>
            </div>

            {/* Diagnostic Angiogram Question (for AVM / 37242) */}
            {(procedureCode === '37242' || anomalyType === 'avm') && (
              <div>
                <label className="block text-xs font-semibold text-gray mb-1.5 uppercase tracking-wider">
                  Diagnostic vs Roadmap Angiogram Dictation
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAngiographyType('separate_diag')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-left ${
                      angiographyType === 'separate_diag'
                        ? 'bg-mint text-navy border-mint shadow-sm'
                        : 'bg-cream/40 text-navy border-gray/20 hover:bg-cream'
                    }`}
                  >
                    Distinct Diagnostic Angio (Mod 59)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAngiographyType('therapeutic_roadmap')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-left ${
                      angiographyType === 'therapeutic_roadmap'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-cream/40 text-navy border-gray/20 hover:bg-cream'
                    }`}
                  >
                    Roadmap Angio Only (Bundled)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Lead Capture Box */}
          <div className="bg-cream rounded-xl p-6 border border-gray/10 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-teal" />
              <h3 className="text-sm font-bold text-navy font-jakarta">
                Free Pediatric Vascular RCM Audit & Appeal Template
              </h3>
            </div>
            <p className="text-xs text-gray">
              Receive our comprehensive Pediatric Vascular Anomaly Denial Defense Toolkit, including CMS-compliant Bleomycin J9040 prior auth templates and Modifier -58 staging defense packets.
            </p>
            {submitSuccess ? (
              <div className="bg-teal/10 border border-teal text-teal p-3.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Audit packet transmitted to {contactEmail}. Kiran and our pediatric surgical specialists will review within 24 hours.
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Your Name / Practice Admin"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="bg-white border border-gray/20 rounded-lg px-3 py-2 text-xs text-navy focus:ring-1 focus:ring-teal"
                  />
                  <input
                    type="email"
                    placeholder="Work Email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="bg-white border border-gray/20 rounded-lg px-3 py-2 text-xs text-navy focus:ring-1 focus:ring-teal"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Practice / Children's Hospital"
                    value={contactPractice}
                    onChange={(e) => setContactPractice(e.target.value)}
                    className="bg-white border border-gray/20 rounded-lg px-3 py-2 text-xs text-navy focus:ring-1 focus:ring-teal"
                  />
                  <input
                    type="tel"
                    placeholder="Direct Phone (Optional)"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="bg-white border border-gray/20 rounded-lg px-3 py-2 text-xs text-navy focus:ring-1 focus:ring-teal"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-navy hover:bg-navy/90 text-white font-bold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Transmitting Audit...' : 'Request Practice-Specific Audit'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Live Audit Results & 837P Stream */}
        <div className="lg:col-span-6 space-y-6">
          {/* Scorecard */}
          <div className="bg-white rounded-xl shadow-md border border-gray/10 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray/10 pb-4">
              <div>
                <span className="text-xs font-bold text-gray uppercase tracking-wider">Clean Claim Feasibility</span>
                <div className="text-3xl font-extrabold text-navy font-jakarta mt-1 flex items-baseline gap-2">
                  {auditResult.cleanClaimScore}%
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    auditResult.cleanClaimScore > 85 ? 'bg-mint/20 text-teal' : 'bg-red-100 text-red-700'
                  }`}>
                    {auditResult.cleanClaimScore > 85 ? 'High First-Pass Yield' : 'High Audit Risk'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray uppercase tracking-wider">Est. Allowed Value</span>
                <div className="text-2xl font-extrabold text-teal font-jakarta mt-1">
                  ${auditResult.grossValue.toLocaleString()}
                </div>
                {auditResult.atRiskValue > 0 && (
                  <span className="text-xs text-red-600 font-bold block">
                    -${auditResult.atRiskValue.toLocaleString()} at risk
                  </span>
                )}
              </div>
            </div>

            {/* Claim Line Items */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal" />
                Audited Claim Line Items
              </h3>
              <div className="space-y-2">
                {auditResult.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 ${
                      item.status === 'compliant'
                        ? 'bg-cream/30 border-gray/20 text-navy'
                        : item.status === 'warning'
                        ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                        : 'bg-red-50/80 border-red-300 text-red-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray/20 text-navy text-xs">
                          {item.code} {item.modifier && <span className="text-teal font-bold">-{item.modifier}</span>}
                        </span>
                        <span>{item.description}</span>
                      </div>
                      <div className="font-mono text-right">
                        ${item.estAllowed.toLocaleString()}
                      </div>
                    </div>
                    {item.editReason && (
                      <p className="text-[11px] opacity-90 pl-1 border-l-2 border-current">
                        {item.editReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings Alert Box */}
            {auditResult.warnings.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-red-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  NCCI Bundling & Audit Hazards Detected
                </div>
                <ul className="text-xs text-red-700 list-disc pl-5 space-y-1">
                  {auditResult.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Compliance Recommendations */}
            <div className="bg-teal/5 border border-teal/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-teal font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-teal" />
                Pediatric IR Billing Recommendations
              </div>
              <ul className="text-xs text-navy/80 list-disc pl-5 space-y-1">
                {auditResult.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Simulated ANSI X12 837P EDI Output */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-teal" />
                Simulated ANSI X12 837P Professional Claim Stream
              </span>
              <div className="bg-navy text-cream font-mono text-[10px] sm:text-[11px] p-3 rounded-lg overflow-x-auto whitespace-pre leading-relaxed border border-navy/40">
                {`ISA*00*          *00*          *ZZ*AETHERA-RCM    *ZZ*PAYER-EDI      *260905*1200*^*00501*000000074*0*P*:~
GS*HC*AETHERA-RCM*PAYER-EDI*20260905*1200*74*X*005010X222A1~
ST*837*0074*005010X222A1~
BHT*0019*00*PED-VASC-20260905*20260905*1200*CH~
NM1*85*2*AETHERA PEDIATRIC VASCULAR SPECIALISTS*****XX*1992019283~
CLM*PED-VASC-CLAIM-01*${auditResult.grossValue}***11:B:1*Y*A*Y*Y~
${auditResult.items
  .map(
    (item, idx) =>
      `LX*${idx + 1}~\nSV1*HC:${item.code}${item.modifier ? `:${item.modifier}` : ''}*${item.estAllowed}*UN*1***1:2~`
  )
  .join('\n')}
SE*${12 + auditResult.items.length * 2}*0074~
GE*1*74~
IEA*1*000000074~`}
              </div>
            </div>
          </div>

          {/* Conversion Bridge */}
          <ToolConversionBridge
            toolName="Pediatric Vascular Malformations & Sclerotherapy Scrubber"
            contextText="Pediatric vascular anomalies require precision billing: off-label Bleomycin prior authorization appeals, Modifier -58 staged session defense, and dual ultrasound/fluoroscopy claim assembly."
          />
        </div>
      </div>
    </div>
  );
}
