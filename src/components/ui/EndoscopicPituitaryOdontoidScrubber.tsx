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
  Brain,
  Layers,
  Copy,
  Sliders,
  Crosshair,
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

export default function EndoscopicPituitaryOdontoidScrubber() {
  // Clinical Inputs
  const [procedureType, setProcedureType] = useState<'transnasal_odontoid' | 'pituitary_macroadenoma' | 'clival_chordoma'>('transnasal_odontoid');
  const [dualSurgeonMod62, setDualSurgeonMod62] = useState<boolean>(true);
  const [useNasoseptalFlap, setUseNasoseptalFlap] = useState<boolean>(true);
  const [useStereotacticNav, setUseStereotacticNav] = useState<boolean>(true);
  const [useLumbarDrain, setUseLumbarDrain] = useState<boolean>(true);
  const [useMicroscopeOrEndoscope, setUseMicroscopeOrEndoscope] = useState<boolean>(true);

  // Lead capture state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPractice, setContactPractice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic Audit Computation
  const auditResult = useMemo(() => {
    const items: LineItem[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let grossValue = 0;
    let atRiskValue = 0;

    // 1. Primary Decompression / Resection
    let primaryCode = '61575';
    let primaryRvu = 58.6;
    let primaryFee = 4100;
    let primaryDesc = 'Transnasal approach to skull base, brain stem or upper spinal cord for odontoid decompression';

    if (procedureType === 'transnasal_odontoid') {
      primaryCode = '61575';
      primaryRvu = 58.6;
      primaryFee = 4100;
      primaryDesc = 'Transoral / transnasal approach for odontoidectomy and brainstem / spinal cord decompression';
    } else if (procedureType === 'clival_chordoma') {
      primaryCode = '61600';
      primaryRvu = 51.4;
      primaryFee = 3600;
      primaryDesc = 'Resection or excision of neoplastic lesion of base of anterior cranial fossa; extradural';
    } else {
      primaryCode = '61548';
      primaryRvu = 43.8;
      primaryFee = 3060;
      primaryDesc = 'Hypophysectomy or excision of pituitary tumor, transnasal or transseptal approach';
    }

    grossValue += primaryFee;
    items.push({
      code: primaryCode,
      modifier: dualSurgeonMod62 ? '62' : '',
      description: primaryDesc,
      rvu: primaryRvu,
      estAllowed: primaryFee,
      status: 'compliant',
      editReason: dualSurgeonMod62
        ? 'Modifier -62 justified: Otolaryngologist performs sphenoidotomy/clivus approach and neurosurgeon performs odontoid/tumor decompression.'
        : 'Primary cranial base resection recorded at full allowable.',
    });

    if (!dualSurgeonMod62) {
      warnings.push('PAYER AUDIT: Expanded endoscopic skull base surgery without documented co-surgeon Modifier -62 often triggers peer-to-peer operative scope scrutiny.');
    } else {
      recommendations.push('Ensure both ENT and Neurosurgery submit separate dictations with matching CPT codes and Modifier -62.');
    }

    // 2. Vascularized Hadad-Bassagasteguy Nasoseptal Flap (CPT 15730)
    if (useNasoseptalFlap) {
      const flapRvu = 24.5;
      const flapFee = 1720;
      grossValue += flapFee;
      items.push({
        code: '15730',
        modifier: '59',
        description: 'Vascularized pedicle flap reconstruction (Hadad-Bassagasteguy nasoseptal flap based on posterior septal artery)',
        rvu: flapRvu,
        estAllowed: flapFee,
        status: 'compliant',
        editReason: 'Reconstructs high-flow CSF fistulae at skull base defect. Unbundled from approach with documentation of artery pedicle dissection.',
      });
      recommendations.push('Operative report must explicitly document dissection of the posterior septal branch of the sphenopalatine artery to defend CPT 15730 against bundling.');
    } else {
      warnings.push('HIGH CSF LEAK RISK: Sellar/clival skull base defect closure without vascularized mucosal flap carries elevated postoperative CSF leak risk.');
    }

    // 3. Stereotactic Neuronavigation (CPT +61782)
    if (useStereotacticNav) {
      const navRvu = 4.3;
      const navFee = 300;
      grossValue += navFee;
      items.push({
        code: '+61782',
        modifier: '',
        description: 'Stereotactic computer-assisted volumetric intracranial procedure; cranial, extradural (skull base navigation)',
        rvu: navRvu,
        estAllowed: navFee,
        status: 'compliant',
        editReason: 'Exempt from Modifier -51 multi-procedure fee reduction. Correlates pre-op MRI/CT with intraoperative clival anatomy.',
      });
    }

    // 4. Lumbar Spinal CSF Drain (CPT 62272)
    if (useLumbarDrain) {
      const drainRvu = 2.4;
      const drainFee = 170;
      grossValue += drainFee;
      items.push({
        code: '62272',
        modifier: '59',
        description: 'Lumbar puncture, therapeutic, for continuous CSF drainage to protect skull base reconstruction',
        rvu: drainRvu,
        estAllowed: drainFee,
        status: 'compliant',
        editReason: 'Modifier -59 required: Performed at separate anatomical site (lumbar spine) to decompress dural pressure.',
      });
    }

    // 5. Operating Microscope / Endoscope (+69990)
    if (useMicroscopeOrEndoscope) {
      const microRvu = 4.8;
      const microFee = 340;
      grossValue += microFee;
      items.push({
        code: '+69990',
        modifier: '',
        description: 'Microsurgical techniques requiring operating microscope (or micro-inspection of dural margin)',
        rvu: microRvu,
        estAllowed: microFee,
        status: 'compliant',
        editReason: 'Allowed under CMS Chapter VIII when microvascular dissection around optic chiasm, basilar artery, or dura is documented.',
      });
    }

    // Revenue At Risk calculation
    if (useNasoseptalFlap) atRiskValue += 1720;
    if (procedureType === 'transnasal_odontoid') atRiskValue += 1040; // Downcoding from 61575 to 61548
    if (useStereotacticNav) atRiskValue += 300;

    return {
      items,
      warnings,
      recommendations,
      grossValue,
      atRiskValue,
      primaryCode,
    };
  }, [
    procedureType,
    dualSurgeonMod62,
    useNasoseptalFlap,
    useStereotacticNav,
    useLumbarDrain,
    useMicroscopeOrEndoscope,
  ]);

  // Lead submission
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactName) return;

    setIsSubmitting(true);
    try {
      await sendLeadToKiran('endoscopic_skull_base_rcm_audit', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        procedureType,
        dualSurgeonMod62,
        useNasoseptalFlap,
        useStereotacticNav,
        grossValue: auditResult.grossValue,
        atRiskValue: auditResult.atRiskValue,
        primaryCode: auditResult.primaryCode,
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Submission failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPacket = () => {
    const text = `--- AETHERA HEALTHCARE ENDOSCOPIC SKULL BASE RCM AUDIT PACKET ---
Procedure: ${procedureType.replace('_', ' ').toUpperCase()}
Dual-Surgeon (Mod 62): ${dualSurgeonMod62 ? 'YES (ENT + Neurosurgery)' : 'NO'}
Vascularized Nasoseptal Flap (+15730): ${useNasoseptalFlap ? 'YES' : 'NO'}
Neuronavigation (+61782): ${useStereotacticNav ? 'YES' : 'NO'}
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
            <Brain className="w-3.5 h-3.5" />
            Expanded Endonasal Skull Base &amp; Sellar Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Endoscopic Skull Base Pituitary &amp; Odontoid Scrubber
          </h2>
          <p className="mt-2 text-sm sm:text-base text-cream/90 max-w-3xl leading-relaxed">
            Eliminate downcoding on transnasal odontoidectomy (61575), unbundle vascularized Hadad nasoseptal flaps (+15730), capture cranial stereotactic navigation (+61782), and align ENT &amp; Neurosurgery Modifier -62 co-surgery claims.
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-teal" />
              1. Pathology &amp; Anatomical Target
            </h3>

            {/* Target Pathology */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Surgical Target &amp; Pathology
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'transnasal_odontoid', label: 'Odontoid Resection (61575)' },
                  { id: 'pituitary_macroadenoma', label: 'Pituitary Sellar (61548)' },
                  { id: 'clival_chordoma', label: 'Clival Chordoma (61600)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProcedureType(item.id as any)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      procedureType === item.id
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-cream/40 text-navy/80 border-gray/20 hover:bg-cream'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Co-Surgeon Modifier 62 Toggle */}
            <div className="pt-2">
              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={dualSurgeonMod62}
                  onChange={(e) => setDualSurgeonMod62(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Dual-Attending Co-Surgery (Modifier -62: ENT + Neurosurgery)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Rhinologist performs binasal approach and reconstruction; neurosurgeon resects tumor or odontoid peg.
                  </span>
                </div>
              </label>
            </div>

            {/* Mapped Primary Code Box */}
            <div className="bg-cream/60 border border-gray/15 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Mapped Primary CPT Code</p>
                <p className="text-2xl font-black text-navy font-jakarta mt-0.5 font-mono">{auditResult.primaryCode}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-semibold uppercase">Primary Surgical Fee</p>
                <p className="text-lg font-bold text-teal mt-0.5">${(auditResult.items[0]?.estAllowed || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Reconstruction & Ancillary Protocols */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal" />
              2. Reconstruction, Flaps &amp; Navigation
            </h3>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={useNasoseptalFlap}
                  onChange={(e) => setUseNasoseptalFlap(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Hadad-Bassagasteguy Nasoseptal Flap (+15730-59)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Vascularized pedicle mucoperiosteal flap for multilayer dural skull base reconstruction.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={useStereotacticNav}
                  onChange={(e) => setUseStereotacticNav(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Stereotactic Cranial Neuronavigation (+61782)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Image-guided surgical tracking of internal carotid arteries, clival boundaries, and sella.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={useLumbarDrain}
                  onChange={(e) => setUseLumbarDrain(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Prophylactic Lumbar CSF Drain Placement (62272-59)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Intraoperative spinal drain placement reducing CSF pressure against skull base graft.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={useMicroscopeOrEndoscope}
                  onChange={(e) => setUseMicroscopeOrEndoscope(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Operating Microscope Microvascular Add-on (+69990)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    High-magnification visualization during arachnoid dissection and optic nerve preservation.
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
                <p className="text-[11px] text-cream/60 mt-0.5">Dual-surgeon eligible claim</p>
              </div>
              <div>
                <p className="text-xs uppercase text-amber-300 font-semibold tracking-wider">Revenue At Risk</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-jakarta mt-1">
                  ${auditResult.atRiskValue.toLocaleString()}
                </p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">Vulnerable to flap &amp; approach bundling</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-cream/80 font-medium">Primary Code: {auditResult.primaryCode}</span>
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
                Skull Base Coding Ledger
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
              Request Endoscopic Skull Base &amp; Pituitary RCM Audit
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Get an expert review of your dual-attending Modifier -62 claims, nasoseptal flap unbundling defenses, and transnasal odontoid coding.
            </p>

            {submitSuccess ? (
              <div className="p-4 bg-mint/20 border border-mint/40 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-teal mx-auto mb-2" />
                <p className="text-sm font-bold text-navy">Audit Request Received</p>
                <p className="text-xs text-slate-600 mt-1">
                  Our skull base surgical RCM team will review your coding structure and contact you within 1 business day.
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
                    placeholder="Skull Base Institute / Hospital"
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
                  {isSubmitting ? 'Sending Request...' : 'Get Free Skull Base Revenue Audit'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
