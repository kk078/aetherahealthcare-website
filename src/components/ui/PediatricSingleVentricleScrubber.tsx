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
  Heart,
  Layers,
  Copy,
  Sliders,
  GitBranch,
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

export default function PediatricSingleVentricleScrubber() {
  // Surgical Stage & Scenario Inputs
  const [surgicalStage, setSurgicalStage] = useState<'stage1_norwood' | 'stage2_glenn' | 'stage3_fontan'>('stage1_norwood');
  const [shuntType, setShuntType] = useState<'sano_rv_pa' | 'blalock_taussig_shunt'>('sano_rv_pa');
  const [includePaReconstruction, setIncludePaReconstruction] = useState<boolean>(true);
  const [delayedSternalClosure, setDelayedSternalClosure] = useState<boolean>(true);
  const [includeEcmoStandby, setIncludeEcmoStandby] = useState<boolean>(true);
  const [stagedModifier58, setStagedModifier58] = useState<boolean>(true);

  // Lead capture state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPractice, setContactPractice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic Audit Calculation
  const auditResult = useMemo(() => {
    const items: LineItem[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let grossValue = 0;
    let atRiskValue = 0;

    if (surgicalStage === 'stage1_norwood') {
      // Primary Norwood Arch Reconstruction (CPT 33619)
      const norwoodRvu = 96.5;
      const norwoodFee = 6800;
      grossValue += norwoodFee;
      items.push({
        code: '33619',
        modifier: '',
        description: 'Repair of single ventricle with aortic arch reconstruction (Norwood procedure with neo-aorta)',
        rvu: norwoodRvu,
        estAllowed: norwoodFee,
        status: 'compliant',
        editReason: 'Primary reconstructive repair for hypoplastic left heart syndrome (HLHS) with pulmonary homograft arch augmentation under hypothermic circulatory arrest.',
      });

      // Systemic-to-Pulmonary Blood Source
      if (shuntType === 'sano_rv_pa') {
        const sanoRvu = 38.2;
        const sanoFee = 2650;
        grossValue += sanoFee;
        items.push({
          code: '33766',
          modifier: '59',
          description: 'Anastomosis, right ventricle to pulmonary artery conduit (Sano modification shunt)',
          rvu: sanoRvu,
          estAllowed: sanoFee,
          status: 'compliant',
          editReason: 'Right ventriculotomy with non-valved Gore-Tex conduit to confluence of branch pulmonary arteries.',
        });
        recommendations.push('Document separate incision and ventriculotomy to defend CPT 33766 Sano shunt from primary arch closure bundling.');
      } else {
        const btRvu = 34.5;
        const btFee = 2400;
        grossValue += btFee;
        items.push({
          code: '33750',
          modifier: '59',
          description: 'Systemic-to-pulmonary artery shunt; subclavian to pulmonary artery (modified Blalock-Taussig shunt)',
          rvu: btRvu,
          estAllowed: btFee,
          status: 'compliant',
          editReason: 'PTFE graft between innominate/subclavian artery and branch pulmonary artery.',
        });
      }

      // Concomitant Branch Pulmonary Artery Reconstruction (+33688)
      if (includePaReconstruction) {
        const paRvu = 22.4;
        const paFee = 1580;
        grossValue += paFee;
        items.push({
          code: '+33688',
          modifier: '',
          description: 'Repair of branch pulmonary artery stenosis or hypoplasia (pericardial patch angioplasty)',
          rvu: paRvu,
          estAllowed: paFee,
          status: 'compliant',
          editReason: 'Extensive longitudinal patch arterioplasty of LPA/RPA beyond the confluence. Exempt from Modifier -51.',
        });
        atRiskValue += paFee;
      }

      // Delayed Sternal Closure (+33530)
      if (delayedSternalClosure) {
        const sternalRvu = 16.8;
        const sternalFee = 1180;
        grossValue += sternalFee;
        items.push({
          code: '33530',
          modifier: '58',
          description: 'Delayed sternal closure after open-chest cardiac resuscitation (staged procedure)',
          rvu: sternalRvu,
          estAllowed: sternalFee,
          status: 'compliant',
          editReason: 'Planned staged closure 48-72h postoperatively following mediastinal decompression for neonatal myocardial edema.',
        });
        recommendations.push('Apply Modifier -58 to delayed sternal closure (+33530) to bypass 90-day post-Norwood global bundling.');
      }
    } else if (surgicalStage === 'stage2_glenn') {
      // Stage 2: Bidirectional Glenn (CPT 33767)
      const glennRvu = 54.0;
      const glennFee = 3780;
      grossValue += glennFee;
      items.push({
        code: '33767',
        modifier: stagedModifier58 ? '58' : '',
        description: 'Bidirectional cavopulmonary anastomosis (Glenn procedure; superior vena cava to right pulmonary artery)',
        rvu: glennRvu,
        estAllowed: glennFee,
        status: 'compliant',
        editReason: stagedModifier58
          ? 'Modifier -58 validates planned staged palliative re-operation within previous surgical global period.'
          : 'Stage 2 cavopulmonary shunt performed under CPB.',
      });

      if (!stagedModifier58) {
        warnings.push('CRITICAL CLAWBACK: Omission of Modifier -58 on Stage 2 Glenn will trigger 100% denial ($3,780) under previous Norwood global fee rules.');
        atRiskValue += glennFee;
      }
    } else {
      // Stage 3: Extracardiac Conduit Fontan (CPT 33737)
      const fontanRvu = 58.5;
      const fontanFee = 4100;
      grossValue += fontanFee;
      items.push({
        code: '33737',
        modifier: stagedModifier58 ? '58' : '',
        description: 'Total cavopulmonary connection with extracardiac conduit (Fontan completion with fenestration)',
        rvu: fontanRvu,
        estAllowed: fontanFee,
        status: 'compliant',
        editReason: stagedModifier58
          ? 'Modifier -58 appended: Staged completion of single-ventricle circulation.'
          : 'Extracardiac conduit Fontan completion.',
      });

      if (!stagedModifier58) {
        warnings.push('CRITICAL CLAWBACK: Omission of Modifier -58 on Stage 3 Fontan risks immediate global period rejection.');
        atRiskValue += fontanFee;
      }
    }

    // Post-Cardiotomy ECMO Standby / Cannulation
    if (includeEcmoStandby) {
      const ecmoRvu = 28.5;
      const ecmoFee = 1990;
      grossValue += ecmoFee;
      items.push({
        code: '33946',
        modifier: '59',
        description: 'Extracorporeal membrane oxygenation (ECMO) / venoarterial (VA) cannulation, central thoracic',
        rvu: ecmoRvu,
        estAllowed: ecmoFee,
        status: 'compliant',
        editReason: 'Central cannulation of aortic root and right atrium with circuit transition for failure to wean from cardiopulmonary bypass.',
      });
      recommendations.push('Ensure operative note contains detailed hemodynamic collapse documentation justifying VA-ECMO deployment (+33946).');
    }

    return {
      items,
      warnings,
      recommendations,
      grossValue,
      atRiskValue,
    };
  }, [
    surgicalStage,
    shuntType,
    includePaReconstruction,
    delayedSternalClosure,
    includeEcmoStandby,
    stagedModifier58,
  ]);

  // Lead submission
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactName) return;

    setIsSubmitting(true);
    try {
      await sendLeadToKiran('pediatric_single_ventricle_rcm_audit', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        surgicalStage,
        shuntType,
        includePaReconstruction,
        delayedSternalClosure,
        includeEcmoStandby,
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
    const text = `--- AETHERA HEALTHCARE PEDIATRIC SINGLE-VENTRICLE RCM AUDIT PACKET ---
Surgical Stage: ${surgicalStage.replace('_', ' ').toUpperCase()}
Shunt Strategy: ${shuntType.replace(/_/g, ' ').toUpperCase()}
PA Reconstruction (+33688): ${includePaReconstruction ? 'YES' : 'NO'}
Delayed Sternal Closure (+33530): ${delayedSternalClosure ? 'YES (Mod 58)' : 'NO'}
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
            <Heart className="w-3.5 h-3.5" />
            Pediatric Congenital Cardiac Surgery Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Pediatric Single-Ventricle Norwood &amp; Glenn Scrubber
          </h2>
          <p className="mt-2 text-sm sm:text-base text-cream/90 max-w-3xl leading-relaxed">
            Eliminate multi-thousand dollar global period clawbacks on staged palliation for hypoplastic left heart syndrome (HLHS). Defend Norwood arch reconstruction (33619), Sano shunts (33766), pulmonary artery angioplasty (+33688), and delayed sternal closure (+33530).
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Stage & Options */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-teal" />
              1. Palliative Reconstructive Stage
            </h3>

            {/* Stage Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Congenital Cardiac Surgical Stage
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'stage1_norwood', label: 'Stage 1 Norwood (33619)' },
                  { id: 'stage2_glenn', label: 'Stage 2 Glenn (33767)' },
                  { id: 'stage3_fontan', label: 'Stage 3 Fontan (33737)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSurgicalStage(item.id as any)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      surgicalStage === item.id
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-cream/40 text-navy/80 border-gray/20 hover:bg-cream'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shunt Option for Stage 1 */}
            {surgicalStage === 'stage1_norwood' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Systemic-to-Pulmonary Shunt Option
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'sano_rv_pa', label: 'Sano RV-PA Conduit (33766)' },
                    { id: 'blalock_taussig_shunt', label: 'Modified BTT Shunt (33750)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setShuntType(item.id as any)}
                      className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                        shuntType === item.id
                          ? 'bg-navy text-white border-navy shadow-sm'
                          : 'bg-cream/40 text-navy/80 border-gray/20 hover:bg-cream'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modifier 58 Staging Toggle */}
            {(surgicalStage === 'stage2_glenn' || surgicalStage === 'stage3_fontan') && (
              <div className="pt-2">
                <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                  <input
                    type="checkbox"
                    checked={stagedModifier58}
                    onChange={(e) => setStagedModifier58(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                  />
                  <div>
                    <span className="text-xs font-bold text-navy block">Apply Staged Procedure Modifier -58</span>
                    <span className="text-[11px] text-slate-500 leading-snug">
                      Proves surgery is a planned staged sequence of single-ventricle palliation to override 90-day global fee denials.
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Clean Code Preview Box */}
            <div className="bg-cream/60 border border-gray/15 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Primary Procedural CPT</p>
                <p className="text-2xl font-black text-navy font-jakarta mt-0.5 font-mono">{auditResult.items[0]?.code}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-semibold uppercase">Base Surgical Allowable</p>
                <p className="text-lg font-bold text-teal mt-0.5">${(auditResult.items[0]?.estAllowed || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Ancillary Reconstructions & Interventions */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal" />
              2. Concomitant Reconstructions &amp; ICU Care
            </h3>

            <div className="space-y-3 pt-1">
              {surgicalStage === 'stage1_norwood' && (
                <>
                  <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                    <input
                      type="checkbox"
                      checked={includePaReconstruction}
                      onChange={(e) => setIncludePaReconstruction(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                    />
                    <div>
                      <span className="text-xs font-bold text-navy block">Branch Pulmonary Artery Reconstruction (+33688)</span>
                      <span className="text-[11px] text-slate-500 leading-snug">
                        Extensive autologous pericardial patch angioplasty of bilateral branch pulmonary arteries.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                    <input
                      type="checkbox"
                      checked={delayedSternalClosure}
                      onChange={(e) => setDelayedSternalClosure(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                    />
                    <div>
                      <span className="text-xs font-bold text-navy block">Delayed Sternal Closure in ICU / OR (+33530-58)</span>
                      <span className="text-[11px] text-slate-500 leading-snug">
                        Planned secondary chest closure following open-chest hemodynamic stabilization on post-op Day 2-4.
                      </span>
                    </div>
                  </label>
                </>
              )}

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={includeEcmoStandby}
                  onChange={(e) => setIncludeEcmoStandby(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Central VA-ECMO Cannulation (CPT 33946-59)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Emergency extracorporeal support for acute ventricular dysfunction or low cardiac output syndrome.
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
                <p className="text-[11px] text-cream/60 mt-0.5">Includes primary repair &amp; add-ons</p>
              </div>
              <div>
                <p className="text-xs uppercase text-amber-300 font-semibold tracking-wider">Revenue At Risk</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-jakarta mt-1">
                  ${auditResult.atRiskValue.toLocaleString()}
                </p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">Vulnerable to global fee clawbacks</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-cream/80 font-medium">Stage: {surgicalStage.replace('_', ' ').toUpperCase()}</span>
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
                Single-Ventricle Coding Ledger
              </h3>
              <span className="text-xs bg-mint/20 text-navy font-semibold px-2 py-0.5 rounded-full border border-mint/40">
                {auditResult.items.length} Billable Codes
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
              Request Pediatric Congenital Cardiac RCM Audit
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Get an expert review of your Norwood, Glenn, and Fontan surgical coding, pulmonary artery reconstruction add-ons, and staged procedure modifier compliance.
            </p>

            {submitSuccess ? (
              <div className="p-4 bg-mint/20 border border-mint/40 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-teal mx-auto mb-2" />
                <p className="text-sm font-bold text-navy">Audit Request Received</p>
                <p className="text-xs text-slate-600 mt-1">
                  Our congenital heart RCM specialists will review your multi-stage billing data and contact you within 1 business day.
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
                    placeholder="Children's Hospital / Cardiac Center"
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
                  {isSubmitting ? 'Sending Request...' : 'Get Free Congenital Cardiac Audit'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
