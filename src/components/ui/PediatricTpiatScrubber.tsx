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
  FlaskConical,
  Layers,
  Copy,
  Sliders,
  Dna,
} from 'lucide-react';
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

export default function PediatricTpiatScrubber() {
  // Clinical Inputs
  const [etiology, setEtiology] = useState<'prss1_mutation' | 'spink1_cftr' | 'idiopathic_chronic'>('prss1_mutation');
  const [patientWeightKg, setPatientWeightKg] = useState<number>(32);
  const [isletYieldIeqPerKg, setIsletYieldIeqPerKg] = useState<number>(4500); // IEQ/kg
  const [portalAccessRoute, setPortalAccessRoute] = useState<'mesenteric_cutdown' | 'transhepatic_catheter' | 'umbilical_vein'>('mesenteric_cutdown');
  const [cGmpIsolationReportAttached, setCGmpIsolationReportAttached] = useState<boolean>(true);
  const [continuousPortalManometry, setContinuousPortalManometry] = useState<boolean>(true);
  const [delayedInfusionMod58, setDelayedInfusionMod58] = useState<boolean>(false);
  const [intensivePostopGlycemicIcu, setIntensivePostopGlycemicIcu] = useState<boolean>(true);

  // Lead capture state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPractice, setContactPractice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Total Islet Equivalent (IEQ)
  const totalIeq = useMemo(() => {
    return patientWeightKg * isletYieldIeqPerKg;
  }, [patientWeightKg, isletYieldIeqPerKg]);

  // Dynamic Audit Computation
  const auditResult = useMemo(() => {
    const items: LineItem[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let grossValue = 0;
    let atRiskValue = 0;

    // 1. Total Pancreatectomy (CPT 48155)
    const pancreatectomyRvu = 52.1;
    const pancreatectomyFee = 3650;
    grossValue += pancreatectomyFee;
    items.push({
      code: '48155',
      modifier: '',
      description: 'Pancreatectomy, total (with duodenectomy and biliary reconstruction)',
      rvu: pancreatectomyRvu,
      estAllowed: pancreatectomyFee,
      status: 'compliant',
      editReason: 'Primary resection for intractable pediatric chronic pancreatitis. Preserves splenic vessels or includes splenectomy based on tissue viability.',
    });

    // 2. cGMP Clean-Room Islet Isolation & Processing (CPT 48805)
    const isolationFee = 4800;
    grossValue += isolationFee;
    items.push({
      code: '48805',
      modifier: '59',
      description: 'Preparation and laboratory processing of autologous islet cells for transplantation',
      rvu: 68.0,
      estAllowed: isolationFee,
      status: 'compliant',
      editReason: 'Distinct multi-hour enzymatic collagenase digestion and Ficoll density purification in clean room facility.',
    });
    atRiskValue += isolationFee * 0.45; // Commonly bundled into pancreatectomy

    if (cGmpIsolationReportAttached) {
      recommendations.push('Attach certified cGMP laboratory islet release form demonstrating viability (>70%) and sterility to defend CPT 48805.');
    } else {
      warnings.push('CRITICAL RISK: Missing cGMP clean-room processing certificate invites 100% recoupment of CPT 48805 ($4,800 audit exposure).');
    }

    // 3. Intraportal Islet Autotransplantation (CPT 48554)
    const transplantFee = 2150;
    grossValue += transplantFee;
    items.push({
      code: '48554',
      modifier: delayedInfusionMod58 ? '58' : '',
      description: 'Transplantation of pancreatic islet cells; autotransplantation (gravity-fed intraportal infusion)',
      rvu: 30.7,
      estAllowed: transplantFee,
      status: 'compliant',
      editReason: delayedInfusionMod58
        ? 'Modifier -58 applied: Delayed reinfusion completed in ICU/post-op setting following extended enzymatic isolation.'
        : 'Intraoperative gravity reinfusion into mesenteric vein branch.',
    });

    // 4. Portal Venous Access Catheterization (CPT 36481 / 37202)
    if (portalAccessRoute === 'transhepatic_catheter') {
      const catheterFee = 950;
      grossValue += catheterFee;
      items.push({
        code: '36481',
        modifier: '59',
        description: 'Percutaneous transhepatic portal vein catheterization for therapeutic infusion',
        rvu: 13.5,
        estAllowed: catheterFee,
        status: 'compliant',
        editReason: 'Distinct percutaneous transhepatic access established under ultrasound guidance.',
      });
      recommendations.push('Ensure ultrasound or fluoroscopic guidance log (+76937) is attached for transhepatic access.');
    } else {
      const cutdownFee = 680;
      grossValue += cutdownFee;
      items.push({
        code: '37202',
        modifier: '59',
        description: 'Transcatheter infusion into portal vein, selective mesenteric cutdown',
        rvu: 9.7,
        estAllowed: cutdownFee,
        status: 'compliant',
        editReason: 'Direct cannulation of middle colic or inferior mesenteric vein branch with purse-string suture closure.',
      });
    }

    // 5. Intensive ICU Glycemic Titration & Critical Care (CPT 99291)
    if (intensivePostopGlycemicIcu) {
      const icuFee = 580;
      grossValue += icuFee;
      items.push({
        code: '99291',
        modifier: '25',
        description: 'Critical care, evaluation and management of the critically ill patient; first 30-74 minutes (acute post-TPIAT glycemic crisis & IV insulin drip)',
        rvu: 8.3,
        estAllowed: icuFee,
        status: 'compliant',
        editReason: 'Continuous hemodynamic and frequent blood glucose titration to prevent portal hypertension thrombosis and hypoglycemia.',
      });
    }

    // Islet yield audit warnings
    if (isletYieldIeqPerKg < 2500) {
      warnings.push(`Low Islet Yield Warning: Yield is ${isletYieldIeqPerKg} IEQ/kg (<2,500 IEQ/kg threshold). Payers may scrutinize medical necessity documentation for autotransplantation.`);
    } else if (isletYieldIeqPerKg >= 5000) {
      recommendations.push(`Optimal Yield Documented: ${isletYieldIeqPerKg} IEQ/kg yields strong insulin independence prognosis (>5,000 IEQ/kg target reached).`);
    }

    return {
      items,
      warnings,
      recommendations,
      grossValue,
      atRiskValue,
      totalIeq,
    };
  }, [
    etiology,
    patientWeightKg,
    isletYieldIeqPerKg,
    portalAccessRoute,
    cGmpIsolationReportAttached,
    continuousPortalManometry,
    delayedInfusionMod58,
    intensivePostopGlycemicIcu,
  ]);

  // Lead submission
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactName) return;

    setIsSubmitting(true);
    try {
      await sendLeadToKiran('pediatric_tpiat_rcm_audit', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        etiology,
        patientWeightKg,
        isletYieldIeqPerKg,
        totalIeq: auditResult.totalIeq,
        portalAccessRoute,
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
    const text = `--- AETHERA HEALTHCARE PEDIATRIC TPIAT RCM AUDIT PACKET ---
Etiology: ${etiology.replace('_', ' ').toUpperCase()}
Patient Weight: ${patientWeightKg} kg | Yield: ${isletYieldIeqPerKg} IEQ/kg
Total Islet Equivalent (IEQ): ${auditResult.totalIeq.toLocaleString()} IEQ
Portal Access: ${portalAccessRoute.replace('_', ' ').toUpperCase()}
Gross Clean Value: $${auditResult.grossValue.toLocaleString()}
Revenue At Risk: $${auditResult.atRiskValue.toLocaleString()}

CODING LEDGER:
${auditResult.items.map((i) => `${i.code}${i.modifier ? `-${i.modifier}` : ''} | RVU: ${i.rvu.toFixed(1)} | $${i.estAllowed.toLocaleString()} | ${i.description}`).join('\n')}

CLEAN CLAIM RECOMMENDATIONS:
${auditResult.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
${auditResult.warnings.map((w, i) => `! WARNING ${i + 1}: ${w}`).join('\n')}`;

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
            <FlaskConical className="w-3.5 h-3.5" />
            Pediatric Cellular Therapy &amp; Pancreatic Surgery Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Pediatric TPIAT &amp; Islet Isolation Scrubber
          </h2>
          <p className="mt-2 text-sm sm:text-base text-cream/90 max-w-3xl leading-relaxed">
            Eliminate denials on total pancreatectomy (48155), defend multi-hour cGMP back-table islet cell isolation (48805), capture intraportal autotransplantation (+48554), and prevent experimental allotransplant policy rejections.
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical & Laboratory Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Dna className="w-5 h-5 text-teal" />
              1. Patient Dosing &amp; Islet Harvest
            </h3>

            {/* Genetic / Clinical Etiology */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Pancreatitis Etiology
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'prss1_mutation', label: 'PRSS1 Mutation' },
                  { id: 'spink1_cftr', label: 'SPINK1 / CFTR' },
                  { id: 'idiopathic_chronic', label: 'Idiopathic Chronic' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEtiology(item.id as any)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      etiology === item.id
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-cream/40 text-navy/80 border-gray/20 hover:bg-cream'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Patient Weight Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Patient Weight (kg)
                </label>
                <span className="text-sm font-bold text-navy">{patientWeightKg} kg</span>
              </div>
              <input
                type="range"
                min="15"
                max="70"
                step="1"
                value={patientWeightKg}
                onChange={(e) => setPatientWeightKg(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>15 kg (Child)</span>
                <span>35 kg (Preteen)</span>
                <span>70 kg (Adolescent)</span>
              </div>
            </div>

            {/* Islet Yield Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Purified Islet Yield (IEQ / kg)
                </label>
                <span className="text-sm font-bold text-teal">{isletYieldIeqPerKg.toLocaleString()} IEQ/kg</span>
              </div>
              <input
                type="range"
                min="1500"
                max="8000"
                step="250"
                value={isletYieldIeqPerKg}
                onChange={(e) => setIsletYieldIeqPerKg(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>&lt; 2,500 (Suboptimal)</span>
                <span>3,500 – 5,000 (Target)</span>
                <span>&gt; 5,000 (Insulin Independent)</span>
              </div>
            </div>

            {/* Total IEQ Yield Summary Box */}
            <div className="bg-cream/60 border border-gray/15 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Total Infused Islet Equivalents</p>
                <p className="text-2xl font-black text-navy font-jakarta mt-0.5">
                  {auditResult.totalIeq.toLocaleString()} <span className="text-sm font-semibold text-teal">IEQ</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-semibold uppercase">Clean-Room Lab (48805)</p>
                <p className="text-lg font-bold text-teal mt-0.5">$4,800</p>
              </div>
            </div>
          </div>

          {/* Access & Isolation Protocols */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal" />
              2. Surgical Access &amp; cGMP Compliance
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Portal Vein Infusion Access Route
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'mesenteric_cutdown', label: 'Mesenteric Vein Cutdown' },
                  { id: 'transhepatic_catheter', label: 'Transhepatic Access (36481)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPortalAccessRoute(item.id as any)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      portalAccessRoute === item.id
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-cream/40 text-navy/80 border-gray/20 hover:bg-cream'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={cGmpIsolationReportAttached}
                  onChange={(e) => setCGmpIsolationReportAttached(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">cGMP Clean-Room Laboratory Certificate Attached (48805)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Itemized laboratory worksheet with tissue weights, enzyme lot numbers, viability dyes, and microbial cultures.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={delayedInfusionMod58}
                  onChange={(e) => setDelayedInfusionMod58(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Staged Delayed Infusion (Modifier -58 on 48554)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Islet infusion performed &gt;6 hours post-pancreatectomy in ICU or staged second operative entry.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={intensivePostopGlycemicIcu}
                  onChange={(e) => setIntensivePostopGlycemicIcu(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Critical Care ICU Glycemic Titration (99291-25)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Continuous IV insulin infusion titration preventing hyperglycemia toxicity to freshly grafted islets.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Audit Ledger & Financial Impact */}
        <div className="lg:col-span-6 space-y-6">
          {/* Revenue Scoreboard */}
          <div className="bg-navy text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase text-cream/70 font-semibold tracking-wider">Gross Clean Allowed</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-mint font-jakarta mt-1">
                  ${auditResult.grossValue.toLocaleString()}
                </p>
                <p className="text-[11px] text-cream/60 mt-0.5">Includes surgical, lab &amp; autotransplant</p>
              </div>
              <div>
                <p className="text-xs uppercase text-amber-300 font-semibold tracking-wider">Revenue At Risk</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-jakarta mt-1">
                  ${auditResult.atRiskValue.toLocaleString()}
                </p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">Vulnerable to islet isolation bundling</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-cream/80 font-medium">Yield Tier: {isletYieldIeqPerKg >= 5000 ? 'Optimal' : isletYieldIeqPerKg >= 3000 ? 'Moderate' : 'Guarded'}</span>
              <button
                type="button"
                onClick={handleCopyPacket}
                className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-cream px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied Packet!' : 'Copy Clean Claim Packet'}
              </button>
            </div>
          </div>

          {/* Live CPT Ledger */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal" />
                TPIAT Coding Ledger
              </h3>
              <span className="text-xs bg-mint/20 text-navy font-semibold px-2 py-0.5 rounded-full border border-mint/40">
                {auditResult.items.length} Billable Services
              </span>
            </div>

            <div className="divide-y divide-gray/10 max-h-72 overflow-y-auto pr-1">
              {auditResult.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-navy bg-cream px-1.5 py-0.5 rounded text-[11px]">
                        {item.code}{item.modifier ? `-${item.modifier}` : ''}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1 rounded">
                        {item.rvu.toFixed(1)} RVU
                      </span>
                      <span className="text-slate-700 font-medium">{item.description}</span>
                    </div>
                    {item.editReason && (
                      <p className="text-[11px] text-slate-500 italic pl-1 border-l-2 border-teal/40">
                        {item.editReason}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-navy whitespace-nowrap text-right">
                    ${item.estAllowed.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Defenses & Payer Scrubber Warnings */}
          {(auditResult.warnings.length > 0 || auditResult.recommendations.length > 0) && (
            <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Payer Scrubber &amp; Audit Defenses
              </h3>

              {auditResult.warnings.map((w, idx) => (
                <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}

              {auditResult.recommendations.map((r, idx) => (
                <div key={idx} className="p-3 bg-teal/5 border border-teal/20 rounded-xl flex items-start gap-2.5 text-xs text-navy/90">
                  <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}

          {/* Lead Capture Box */}
          <div className="bg-cream/50 border border-gray/20 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-teal" />
              Request Pediatric Pancreas &amp; TPIAT RCM Audit
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Get an expert review of your islet isolation laboratory billing, commercial autotransplant coverage policies, and delayed infusion modifier strategies.
            </p>

            {submitSuccess ? (
              <div className="p-4 bg-mint/20 border border-mint/40 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-teal mx-auto mb-2" />
                <p className="text-sm font-bold text-navy">Audit Request Received</p>
                <p className="text-xs text-slate-600 mt-1">
                  Our pediatric hepatobiliary RCM team will analyze your TPIAT billing setup and follow up within 1 business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:outline-none focus:border-teal"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Work Email *"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:outline-none focus:border-teal"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Children's Hospital / Transplant Center"
                    value={contactPractice}
                    onChange={(e) => setContactPractice(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:outline-none focus:border-teal"
                  />
                  <input
                    type="tel"
                    placeholder="Direct Phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:outline-none focus:border-teal"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal hover:bg-teal/90 text-white font-bold text-xs py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Sending Request...' : 'Get Free TPIAT Revenue Audit'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
