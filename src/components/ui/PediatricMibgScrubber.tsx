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
  Radiation,
  ChevronRight,
  Layers,
  Copy,
  Zap,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

interface LineItem {
  code: string;
  modifier: string;
  description: string;
  units: number;
  estAllowed: number;
  status: 'compliant' | 'warning' | 'fatal';
  editReason?: string;
}

export default function PediatricMibgScrubber() {
  // Clinical inputs
  const [oncologyIndication, setOncologyIndication] = useState<'refractory_neuroblastoma' | 'relapsed_neuroblastoma' | 'pheochromocytoma'>('refractory_neuroblastoma');
  const [patientWeightKg, setPatientWeightKg] = useState<number>(20);
  const [targetDoseMciPerKg, setTargetDoseMciPerKg] = useState<number>(18);
  const [includeDosimetrySpect, setIncludeDosimetrySpect] = useState<boolean>(true);
  const [includeMedicalPhysics, setIncludeMedicalPhysics] = useState<boolean>(true);
  const [includeStemCellRescue, setIncludeStemCellRescue] = useState<boolean>(true);
  const [includeInpatientIsolation, setIncludeInpatientIsolation] = useState<boolean>(true);
  const [thyroidBlockadeDocumented, setThyroidBlockadeDocumented] = useState<boolean>(true);

  // Lead capture state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPractice, setContactPractice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Total prescribed isotope activity
  const totalMci = useMemo(() => {
    return Math.round(patientWeightKg * targetDoseMciPerKg);
  }, [patientWeightKg, targetDoseMciPerKg]);

  // Claim Audit Calculation
  const auditResult = useMemo(() => {
    const items: LineItem[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let grossValue = 0;
    let atRiskValue = 0;

    // 1. Primary Radiopharmaceutical Infusion (CPT 79445)
    const infusionFee = 1850;
    grossValue += infusionFee;
    items.push({
      code: '79445',
      modifier: '',
      description: 'Radiopharmaceutical therapy, by intravenous infusion (I-131 MIBG administration)',
      units: 1,
      estAllowed: infusionFee,
      status: 'compliant',
      editReason: 'Primary IV infusion of high-dose I-131 iobenguane. Administered via dedicated peripheral or central line with continuous lead shielding.',
    });

    // 2. Isotope Pass-Through Invoice (HCPCS A9508)
    const costPerMci = 135;
    const isotopeAllowed = totalMci * costPerMci;
    grossValue += isotopeAllowed;
    items.push({
      code: 'A9508',
      modifier: '',
      description: `Iodine I-131 iobenguane, therapeutic, per millicurie (${totalMci} mCi administered)`,
      units: totalMci,
      estAllowed: isotopeAllowed,
      status: 'compliant',
      editReason: `Requires attached commercial radiopharmacy manufacturer invoice with NDC and calibrated millicurie assay certificate ($${isotopeAllowed.toLocaleString()}).`,
    });
    atRiskValue += isotopeAllowed * 0.4; // 40% prone to initial invoice denials

    // 3. Continuing Medical Physics Consultation (CPT +77336)
    if (includeMedicalPhysics) {
      const physicsFee = 680;
      grossValue += physicsFee;
      items.push({
        code: '77336',
        modifier: '26',
        description: 'Continuing medical physics consultation, including radiation survey, daily clearance monitoring, and dose verification',
        units: 1,
        estAllowed: physicsFee,
        status: 'compliant',
        editReason: 'Mandated by NRC regulations for therapeutic radioactive isotopes exceeding 33 mCi. Reimbursable when certified physicist note is signed.',
      });
      recommendations.push('Attach signed Medical Physicist radiation monitoring and contamination survey logs to defend CPT 77336.');
    } else {
      warnings.push('CRITICAL: Omission of CPT 77336 creates severe NRC compliance exposure and foregoes statutory physics revenue during pediatric radiation confinement.');
    }

    // 4. Whole Body SPECT/CT & Radiation Dosimetry (CPT 78830 & 77300)
    if (includeDosimetrySpect) {
      const spectFee = 1420;
      const dosimetryFee = 380;
      grossValue += spectFee + dosimetryFee;

      items.push({
        code: '78830',
        modifier: '26',
        description: 'Radiopharmaceutical localization imaging, SPECT with concurrent CT, whole body, 2 or more days',
        units: 1,
        estAllowed: spectFee,
        status: 'compliant',
        editReason: 'Post-infusion organ clearance and tumor uptake volumetric SPECT/CT dosimetry scanning.',
      });

      items.push({
        code: '77300',
        modifier: '26',
        description: 'Basic radiation dosimetry calculation, organ-at-risk absorbed dose estimation',
        units: 1,
        estAllowed: dosimetryFee,
        status: 'compliant',
        editReason: 'Individualized bone marrow and whole-body radiation absorbed dose calculation.',
      });
      recommendations.push('Document baseline CT acquisition correlation with post-infusion day 2/day 4 scintigraphy to validate SPECT/CT CPT 78830.');
    }

    // 5. Autologous Hematopoietic Stem Cell Rescue (CPT +38240)
    if (includeStemCellRescue) {
      const stemCellFee = 3450;
      grossValue += stemCellFee;
      items.push({
        code: '38240',
        modifier: '58',
        description: 'Hematopoietic progenitor cell (HPC) transplantation; autologous stem cell rescue post-myeloablative MIBG',
        units: 1,
        estAllowed: stemCellFee,
        status: 'compliant',
        editReason: 'Cryopreserved peripheral blood stem cell reinfusion performed ~14 days post-therapy for marrow recovery. Modifier -58 distinguishes staged protocol.',
      });
      recommendations.push('Apply Modifier -58 to stem cell infusion (+38240) to establish that reinfusion is a planned staged component of myeloablative MIBG therapy.');
    }

    // 6. Lead-Shielded Isolation Room & Inpatient Critical Care (CPT 99223)
    if (includeInpatientIsolation) {
      const inpatientFee = 620;
      grossValue += inpatientFee;
      items.push({
        code: '99223',
        modifier: '25',
        description: 'Initial hospital care, high complexity decision-making (inpatient lead-lined radioactive isolation room management)',
        units: 1,
        estAllowed: inpatientFee,
        status: 'compliant',
        editReason: 'High complexity inpatient admission for severe radiation safety isolation, IV hydration, catheter management, and nausea mitigation.',
      });
    }

    // 7. Thyroid Blockade Compliance Check
    if (!thyroidBlockadeDocumented) {
      warnings.push('AUDIT WARNING: Failure to document potassium iodide (SSKI) or Lugol’s solution thyroid protection protocol risks medical necessity denial for neuroblastoma radionuclide administration.');
      atRiskValue += infusionFee;
    }

    // General high-risk warnings
    if (totalMci > 500) {
      recommendations.push(`High-dose protocol (${totalMci} mCi): Payers routinely request prior authorization corroboration and NCCN category 1 / 2A evidence for doses exceeding 500 mCi.`);
    }

    return {
      items,
      warnings,
      recommendations,
      grossValue,
      atRiskValue,
    };
  }, [
    oncologyIndication,
    patientWeightKg,
    targetDoseMciPerKg,
    totalMci,
    includeDosimetrySpect,
    includeMedicalPhysics,
    includeStemCellRescue,
    includeInpatientIsolation,
    thyroidBlockadeDocumented,
  ]);

  // Lead submission
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactName) return;

    setIsSubmitting(true);
    try {
      await sendLeadToKiran('pediatric_mibg_rcm_audit', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        oncologyIndication,
        patientWeightKg,
        targetDoseMciPerKg,
        totalMci,
        includeDosimetrySpect,
        includeMedicalPhysics,
        includeStemCellRescue,
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
    const text = `--- AETHERA HEALTHCARE PEDIATRIC MIBG THERAPY CLAIM PACKET ---
Indication: ${oncologyIndication.replace('_', ' ').toUpperCase()}
Patient Weight: ${patientWeightKg} kg | Prescribed Activity: ${targetDoseMciPerKg} mCi/kg
Total I-131 MIBG Activity: ${totalMci} mCi
Continuing Medical Physics (+77336): ${includeMedicalPhysics ? 'YES' : 'NO'}
Post-Infusion SPECT/CT (78830): ${includeDosimetrySpect ? 'YES' : 'NO'}
Autologous Stem Cell Rescue (+38240): ${includeStemCellRescue ? 'YES' : 'NO'}
Gross Clean Value: $${auditResult.grossValue.toLocaleString()}
Revenue At Risk: $${auditResult.atRiskValue.toLocaleString()}

CODING LEDGER:
${auditResult.items.map((i) => `${i.code}${i.modifier ? `-${i.modifier}` : ''} | Units: ${i.units} | $${i.estAllowed.toLocaleString()} | ${i.description}`).join('\n')}

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
            <Radiation className="w-3.5 h-3.5" />
            Pediatric Targeted Radiopharmaceutical &amp; MIBG Scrubber
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Pediatric I-131 MIBG &amp; Neuroblastoma Radionuclide Scrubber
          </h2>
          <p className="mt-2 text-sm sm:text-base text-cream/90 max-w-3xl leading-relaxed">
            Eliminate $40,000+ denials on therapeutic I-131 MIBG isotope pass-through invoices (HCPCS A9508), defend continuous medical physics oversight (+77336), substantiate post-infusion SPECT/CT dosimetry (78830), and safeguard staged stem cell rescue (+38240).
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Clinical Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Zap className="w-5 h-5 text-teal" />
              1. Patient Dosing &amp; Isotope Calculation
            </h3>

            {/* Indication selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Oncology Indication
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'refractory_neuroblastoma', label: 'Refractory Neuroblastoma' },
                  { id: 'relapsed_neuroblastoma', label: 'Relapsed Stage 4' },
                  { id: 'pheochromocytoma', label: 'Pheo / Paraganglioma' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOncologyIndication(item.id as any)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      oncologyIndication === item.id
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
                min="10"
                max="60"
                step="1"
                value={patientWeightKg}
                onChange={(e) => setPatientWeightKg(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>10 kg (Toddler)</span>
                <span>25 kg (Child)</span>
                <span>60 kg (Adolescent)</span>
              </div>
            </div>

            {/* Target Dose Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Target Radioactivity (mCi / kg)
                </label>
                <span className="text-sm font-bold text-teal">{targetDoseMciPerKg} mCi/kg</span>
              </div>
              <input
                type="range"
                min="12"
                max="21"
                step="1"
                value={targetDoseMciPerKg}
                onChange={(e) => setTargetDoseMciPerKg(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>12 mCi/kg (Standard)</span>
                <span>15 mCi/kg (Intensive)</span>
                <span>18 mCi/kg (Myeloablative)</span>
              </div>
            </div>

            {/* Calculated Dose Summary Box */}
            <div className="bg-cream/60 border border-gray/15 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Total Prescribed I-131 MIBG</p>
                <p className="text-2xl font-black text-navy font-jakarta mt-0.5">{totalMci} <span className="text-sm font-semibold text-teal">mCi (Units)</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-semibold uppercase">HCPCS A9508 Pass-Through</p>
                <p className="text-lg font-bold text-teal mt-0.5">${(totalMci * 135).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Ancillary & Safety Protocols */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal" />
              2. Ancillary Physics, Scans &amp; Rescue Services
            </h3>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={includeMedicalPhysics}
                  onChange={(e) => setIncludeMedicalPhysics(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Continuing Medical Physics Consultation (+77336-26)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    NRC radiation safety officer oversight, daily Geiger contamination survey, and clearance verification.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={includeDosimetrySpect}
                  onChange={(e) => setIncludeDosimetrySpect(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">SPECT/CT Clearance Scintigraphy &amp; Dosimetry (78830 / 77300)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Whole-body volumetric localization and absorbed organ dose calculations over multi-day inpatient confinement.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={includeStemCellRescue}
                  onChange={(e) => setIncludeStemCellRescue(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Autologous Stem Cell Rescue Planned (+38240-58)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Post-therapy hematopoietic stem cell reinfusion ~14 days post-infusion for severe marrow suppression.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={thyroidBlockadeDocumented}
                  onChange={(e) => setThyroidBlockadeDocumented(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Thyroid Blockade Documentation (Potassium Iodide / SSKI)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Mandatory clinical record proof that thyroid uptake suppression began 24-48h prior to I-131 infusion.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Audit Ledger & Financial Impact */}
        <div className="lg:col-span-6 space-y-6">
          {/* Revenue Impact Scoreboard */}
          <div className="bg-navy text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase text-cream/70 font-semibold tracking-wider">Gross Clean Allowed</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-mint font-jakarta mt-1">
                  ${auditResult.grossValue.toLocaleString()}
                </p>
                <p className="text-[11px] text-cream/60 mt-0.5">Includes drug pass-through &amp; professional fees</p>
              </div>
              <div>
                <p className="text-xs uppercase text-amber-300 font-semibold tracking-wider">Revenue At Risk</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-jakarta mt-1">
                  ${auditResult.atRiskValue.toLocaleString()}
                </p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">Vulnerable to unbundling &amp; invoice clawbacks</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-cream/80 font-medium">Isotope Units: {totalMci} mCi</span>
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

          {/* Live CPT / HCPCS Ledger */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal" />
                Clean Claim Coding Ledger
              </h3>
              <span className="text-xs bg-mint/20 text-navy font-semibold px-2 py-0.5 rounded-full border border-mint/40">
                {auditResult.items.length} Line Items
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
                      {item.units > 1 && (
                        <span className="text-[10px] bg-teal/10 text-teal font-semibold px-1 rounded">
                          x{item.units}
                        </span>
                      )}
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

          {/* Compliance & Payer Warnings */}
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
              Request Expert Pediatric Radiopharmaceutical RCM Audit
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Get an expert review of your I-131 MIBG isotope pass-through billing, radiation physics revenue defense, and commercial payer prior authorization workflows.
            </p>

            {submitSuccess ? (
              <div className="p-4 bg-mint/20 border border-mint/40 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-teal mx-auto mb-2" />
                <p className="text-sm font-bold text-navy">Audit Request Received</p>
                <p className="text-xs text-slate-600 mt-1">
                  Our pediatric oncology RCM team will review your MIBG billing configuration and follow up within 1 business day.
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
                    placeholder="Hospital / Cancer Center"
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
                  {isSubmitting ? 'Sending Request...' : 'Get Free MIBG Revenue Audit'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
