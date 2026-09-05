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
  Award,
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

export default function OrthopedicOncologyScrubber() {
  // Clinical parameters
  const [resectionSite, setResectionSite] = useState<'distal_femur' | 'proximal_tibia' | 'pelvis' | 'proximal_humerus'>('distal_femur');
  const [reconstructionType, setReconstructionType] = useState<'modular_femur' | 'modular_tibia' | 'custom_pelvic' | 'modular_humerus'>('modular_femur');
  const [softTissueCoverage, setSoftTissueCoverage] = useState<'gastroc_flap' | 'free_flap' | 'local_flap' | 'primary_closure'>('gastroc_flap');
  const [surgicalTeam, setSurgicalTeam] = useState<'co_surgeons_62' | 'single_attending' | 'assistant_as'>('co_surgeons_62');
  const [implantCarveOut, setImplantCarveOut] = useState<'invoice_attached' | 'standard_flat'>('invoice_attached');
  const [implantCost, setImplantCost] = useState<number>(58000); // $58,000 mega-prosthesis

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

    // 1. Radical Bone Resection Line
    if (resectionSite === 'distal_femur') {
      const allowed = 3850;
      items.push({
        code: '27075',
        modifier: surgicalTeam === 'co_surgeons_62' ? '62' : '',
        description: 'Radical resection of tumor, femur (distal segment en bloc)',
        rvu: 36.4,
        estAllowed: allowed,
        status: 'compliant',
        editReason: 'Document en bloc margin clearance with intraoperative frozen section pathology verification',
      });
      grossValue += allowed;
    } else if (resectionSite === 'proximal_tibia') {
      const allowed = 3620;
      items.push({
        code: '27645',
        modifier: surgicalTeam === 'co_surgeons_62' ? '62' : '',
        description: 'Radical resection of tumor; tibia (proximal segment en bloc)',
        rvu: 34.2,
        estAllowed: allowed,
        status: 'compliant',
      });
      grossValue += allowed;
    } else if (resectionSite === 'pelvis') {
      const allowed = 5400;
      items.push({
        code: '27077',
        modifier: surgicalTeam === 'co_surgeons_62' ? '62' : '',
        description: 'Radical resection of tumor, pelvis; total ischiectomy or internal hemipelvectomy',
        rvu: 52.8,
        estAllowed: allowed,
        status: 'compliant',
        editReason: 'Major complex internal hemipelvectomy: ensure vascular & visceral mobilization dictation',
      });
      grossValue += allowed;
    } else if (resectionSite === 'proximal_humerus') {
      const allowed = 3280;
      items.push({
        code: '23220',
        modifier: surgicalTeam === 'co_surgeons_62' ? '62' : '',
        description: 'Radical resection of bone tumor, humerus (proximal humeral en bloc)',
        rvu: 30.5,
        estAllowed: allowed,
        status: 'compliant',
      });
      grossValue += allowed;
    }

    // 2. Mega-Prosthesis Endoprosthetic Reconstruction Line
    if (reconstructionType === 'modular_femur') {
      const allowed = 4650;
      items.push({
        code: '27599',
        modifier: '22',
        description: 'Unlisted procedure, femur or knee (Benchmarked to CPT 27487 + Modifier 22: Distal Femoral Mega-Prosthesis)',
        rvu: 44.5,
        estAllowed: allowed,
        status: 'compliant',
        editReason: 'Modifier 22 justified: >15cm diaphyseal defect, extensive modular stemmed anchor, and extensor mechanism preservation',
      });
      grossValue += allowed;
    } else if (reconstructionType === 'modular_tibia') {
      const allowed = 4850;
      items.push({
        code: '27599',
        modifier: '22',
        description: 'Unlisted procedure, femur or knee (Benchmarked to CPT 27487 + Modifier 22: Proximal Tibia Mega-Prosthesis with Patellar Tendon Reconstruction)',
        rvu: 46.2,
        estAllowed: allowed,
        status: 'compliant',
        editReason: 'Modifier 22 justified: Complex allograft-prosthetic composite (APC) / modular reconstruction with synthetic mesh tendon reattachment',
      });
      grossValue += allowed;
    } else if (reconstructionType === 'custom_pelvic') {
      const allowed = 6100;
      items.push({
        code: '27299',
        modifier: '22',
        description: 'Unlisted procedure, pelvis or hip joint (Benchmarked to CPT 27138 + Modifier 22: Custom 3D-Printed Titanium Hemipelvectomy Mega-Prosthesis)',
        rvu: 58.0,
        estAllowed: allowed,
        status: 'compliant',
        editReason: 'Modifier 22 defended: Patient-specific titanium lattice reconstructive implant anchored across sacrum and ilium',
      });
      grossValue += allowed;
    } else if (reconstructionType === 'modular_humerus') {
      const allowed = 3950;
      items.push({
        code: '23929',
        modifier: '22',
        description: 'Unlisted procedure, shoulder (Benchmarked to CPT 23472 + Modifier 22: Modular Proximal Humerus Mega-Prosthesis with Latissimus Transfer)',
        rvu: 37.8,
        estAllowed: allowed,
        status: 'compliant',
      });
      grossValue += allowed;
    }

    // Payer Downcoding Hazard Check
    warnings.push('Downcoding Risk: Commercial health plans frequently downgrade CPT 27599-22 / 27299-22 to routine primary total knee (27447) or hip arthroplasty (27130), causing an immediate $3,200+ reimbursement clawback.');

    // 3. Soft-Tissue Flap Coverage Line
    if (softTissueCoverage === 'gastroc_flap') {
      const allowed = 2150;
      const mod = surgicalTeam === 'co_surgeons_62' ? '62' : '59';
      items.push({
        code: '15734',
        modifier: mod,
        description: 'Muscle, myocutaneous, or fasciocutaneous flap; trunk or extremity (Rotational medial gastrocnemius coverage)',
        rvu: 20.8,
        estAllowed: allowed,
        status: 'compliant',
        editReason: 'Distinct surgical incision & pedicle mobilization: defends against NCCI bundling into mega-prosthesis joint exposure',
      });
      grossValue += allowed;
    } else if (softTissueCoverage === 'free_flap') {
      const allowed = 3450;
      items.push({
        code: '15756',
        modifier: surgicalTeam === 'co_surgeons_62' ? '62' : '59',
        description: 'Free muscle or myocutaneous flap with microvascular anastomosis (e.g. Anterolateral Thigh ALT Flap)',
        rvu: 33.5,
        estAllowed: allowed,
        status: 'compliant',
        editReason: 'Microvascular free tissue transfer: requires separate recipient vessel dissection and microvascular anastomosis log',
      });
      grossValue += allowed;
    } else if (softTissueCoverage === 'local_flap') {
      const allowed = 1250;
      items.push({
        code: '14020',
        modifier: '59',
        description: 'Adjacent tissue transfer or rearrangement; defect 10.1 sq cm to 30.0 sq cm',
        rvu: 12.1,
        estAllowed: allowed,
        status: 'compliant',
      });
      grossValue += allowed;
    } else {
      warnings.push('Primary closure without vascularized flap coverage carries high risk of deep prosthetic hardware infection and wound necrosis.');
    }

    // 4. Co-Surgeon / Surgical Team Coordination
    if (surgicalTeam === 'co_surgeons_62') {
      recommendations.push('Modifier -62 Co-Surgeon Protocol: Both the Orthopedic Oncologist and the Reconstructive Plastic Surgeon must bill identical primary resection (27075) and reconstruction (27599) codes with Modifier -62 and cross-reference operative notes.');
    } else if (surgicalTeam === 'single_attending') {
      recommendations.push('Single Surgeon Billing: Apply Modifier -51 to secondary muscle flap (15734) to adhere to standard multiple procedure fee reduction calculations.');
    }

    // 5. Modular Oncologic Implant Hardware Carve-Out
    if (implantCarveOut === 'invoice_attached') {
      items.push({
        code: 'L8699',
        modifier: '',
        description: `Prosthetic implant, not otherwise specified (Modular Oncologic Mega-Prosthesis Hardware - Cost: $${implantCost.toLocaleString()})`,
        rvu: 0,
        estAllowed: implantCost,
        status: 'compliant',
        editReason: 'Pass-through implant reimbursement: CMS-1500 Box 19 / 2410 loop invoice documentation required',
      });
      grossValue += implantCost;
      recommendations.push(`Implant Pass-Through: Manufacturer invoice for $${implantCost.toLocaleString()} must be attached to the claim with FDA 510(k) or custom device documentation.`);
    } else {
      atRiskValue += implantCost;
      warnings.push(`FATAL REVENUE LEAK: $${implantCost.toLocaleString()} in modular hardware is uncarved. Under standard commercial DRG or fee schedules, the hospital/practice will absorb the entire hardware cost without separate invoice pass-through.`);
    }

    return {
      items,
      warnings,
      recommendations,
      grossValue: Math.round(grossValue),
      atRiskValue: Math.round(atRiskValue),
      cleanClaimScore: atRiskValue === 0 ? 98 : Math.max(40, Math.round(100 - (atRiskValue / (grossValue || 1)) * 100)),
    };
  }, [resectionSite, reconstructionType, softTissueCoverage, surgicalTeam, implantCarveOut, implantCost]);

  // Handle Form Submission
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail) return;
    setIsSubmitting(true);
    try {
      await sendLeadToKiran('orthopedic_oncology_rcm_audit', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        resectionSite,
        reconstructionType,
        softTissueCoverage,
        surgicalTeam,
        implantCarveOut,
        implantCost,
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
            <Award className="w-3.5 h-3.5" />
            Musculoskeletal Sarcoma &amp; Reconstruction Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Orthopedic Oncology &amp; Limb Salvage Mega-Prosthesis Scrubber
          </h2>
          <p className="mt-2 text-sm sm:text-base text-cream/90 max-w-3xl leading-relaxed">
            Eliminate multi-thousand dollar downcoding clawbacks on radical bone tumor resections (27075/27645), modular oncologic mega-prosthesis reconstruction (27599/27299-22), rotational muscle flaps (15734), and catastrophic hardware invoice pass-throughs.
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-xl shadow-md border border-gray/10 p-6 space-y-5">
            <h2 className="text-lg font-bold text-navy flex items-center gap-2 border-b border-gray/10 pb-3 font-jakarta">
              <Stethoscope className="w-5 h-5 text-teal" />
              1. Oncologic Resection &amp; Mega-Prosthesis Assembly
            </h2>

            {/* Resection Site */}
            <div>
              <label className="block text-xs font-semibold text-gray mb-1.5 uppercase tracking-wider">
                Radical En-Bloc Bone Resection Site
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'distal_femur', label: 'Distal Femur (CPT 27075)' },
                  { id: 'proximal_tibia', label: 'Proximal Tibia (CPT 27645)' },
                  { id: 'pelvis', label: 'Pelvis / Hemipelvectomy (27077)' },
                  { id: 'proximal_humerus', label: 'Proximal Humerus (23220)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setResectionSite(s.id as any)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition-all text-left ${
                      resectionSite === s.id
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-cream/40 text-navy border-gray/20 hover:bg-cream'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reconstruction Type */}
            <div>
              <label className="block text-xs font-semibold text-gray mb-1.5 uppercase tracking-wider">
                Modular Endoprosthetic Reconstruction (Mega-Prosthesis)
              </label>
              <select
                value={reconstructionType}
                onChange={(e) => setReconstructionType(e.target.value as any)}
                className="w-full bg-white border border-gray/20 rounded-lg p-2.5 text-xs sm:text-sm font-semibold text-navy focus:ring-2 focus:ring-teal focus:border-teal"
              >
                <option value="modular_femur">Modular Distal Femoral Mega-Prosthesis (27599 + Mod 22)</option>
                <option value="modular_tibia">Proximal Tibia Mega-Prosthesis with Extensor Reconstruction (27599 + Mod 22)</option>
                <option value="custom_pelvic">Custom 3D-Printed Titanium Hemipelvectomy Saddle (27299 + Mod 22)</option>
                <option value="modular_humerus">Modular Proximal Humerus Mega-Prosthesis (23929 + Mod 22)</option>
              </select>
            </div>

            {/* Soft-Tissue Flap Coverage */}
            <div>
              <label className="block text-xs font-semibold text-gray mb-1.5 uppercase tracking-wider">
                Concomitant Soft-Tissue Flap Coverage
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'gastroc_flap', label: 'Rotational Gastrocnemius Flap (15734)' },
                  { id: 'free_flap', label: 'Microvascular Free ALT Flap (15756)' },
                  { id: 'local_flap', label: 'Adjacent Tissue Transfer (14020)' },
                  { id: 'primary_closure', label: 'Primary Direct Closure' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSoftTissueCoverage(f.id as any)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-left ${
                      softTissueCoverage === f.id
                        ? 'bg-teal text-white border-teal shadow-sm'
                        : 'bg-cream/40 text-navy border-gray/20 hover:bg-cream'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Surgical Team Organization */}
            <div>
              <label className="block text-xs font-semibold text-gray mb-1.5 uppercase tracking-wider">
                Surgical Team &amp; Co-Surgeon Modifier -62
              </label>
              <select
                value={surgicalTeam}
                onChange={(e) => setSurgicalTeam(e.target.value as any)}
                className="w-full bg-white border border-gray/20 rounded-lg p-2.5 text-xs sm:text-sm font-semibold text-navy focus:ring-2 focus:ring-teal focus:border-teal"
              >
                <option value="co_surgeons_62">Co-Surgeons (Mod -62: Orthopedic Oncology + Reconstructive Plastics)</option>
                <option value="single_attending">Single Attending Orthopedic Oncologist (Mod -51 on flap)</option>
                <option value="assistant_as">Primary Surgeon + Certified PA/First Assist (Mod -AS)</option>
              </select>
            </div>

            {/* Implant Carve-Out */}
            <div>
              <label className="block text-xs font-semibold text-gray mb-1.5 uppercase tracking-wider">
                Catastrophic Modular Implant Invoice Handling
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImplantCarveOut('invoice_attached')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-left ${
                    implantCarveOut === 'invoice_attached'
                      ? 'bg-mint text-navy border-mint shadow-sm'
                      : 'bg-cream/40 text-navy border-gray/20 hover:bg-cream'
                  }`}
                >
                  Pass-Through Invoice Attached (L8699)
                </button>
                <button
                  type="button"
                  onClick={() => setImplantCarveOut('standard_flat')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-left ${
                    implantCarveOut === 'standard_flat'
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-cream/40 text-navy border-gray/20 hover:bg-cream'
                  }`}
                >
                  Uncarved Standard DRG / Case Rate
                </button>
              </div>
            </div>
          </div>

          {/* Lead Capture Box */}
          <div className="bg-cream rounded-xl p-6 border border-gray/10 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-teal" />
              <h3 className="text-sm font-bold text-navy font-jakarta">
                Free Orthopedic Oncology RCM Audit &amp; Benchmark
              </h3>
            </div>
            <p className="text-xs text-gray">
              Receive our comprehensive Orthopedic Oncology Reimbursement Packet, featuring Modifier -22 justification protocols, rotational flap unbundling defenses, and custom mega-prosthesis invoice recovery workflows.
            </p>
            {submitSuccess ? (
              <div className="bg-teal/10 border border-teal text-teal p-3.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Audit packet transmitted to {contactEmail}. Kiran and our surgical oncology RCM leads will connect within 24 hours.
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Your Name / Surgical Coordinator"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="bg-white border border-gray/20 rounded-lg px-3 py-2 text-xs text-navy focus:ring-1 focus:ring-teal"
                  />
                  <input
                    type="email"
                    placeholder="Institutional Email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="bg-white border border-gray/20 rounded-lg px-3 py-2 text-xs text-navy focus:ring-1 focus:ring-teal"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Cancer Center / Hospital"
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
                    {auditResult.cleanClaimScore > 85 ? 'High First-Pass Yield' : 'Severe Revenue Leak'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray uppercase tracking-wider">Total Claim Exposure</span>
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
                  NCCI Bundling &amp; Downcoding Traps
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
                Limb Preservation Billing Guidelines
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
                Simulated ANSI X12 837P Claim Stream
              </span>
              <div className="bg-navy text-cream font-mono text-[10px] sm:text-[11px] p-3 rounded-lg overflow-x-auto whitespace-pre leading-relaxed border border-navy/40">
                {`ISA*00*          *00*          *ZZ*AETHERA-RCM    *ZZ*PAYER-EDI      *260905*1200*^*00501*000000075*0*P*:~
GS*HC*AETHERA-RCM*PAYER-EDI*20260905*1200*75*X*005010X222A1~
ST*837*0075*005010X222A1~
BHT*0019*00*ORTH-ONC-20260905*20260905*1200*CH~
NM1*85*2*AETHERA ORTHOPEDIC ONCOLOGY ASSOCIATES*****XX*1883920194~
CLM*ORTH-ONC-CLAIM-01*${auditResult.grossValue}***11:B:1*Y*A*Y*Y~
${auditResult.items
  .map(
    (item, idx) =>
      `LX*${idx + 1}~\nSV1*HC:${item.code}${item.modifier ? `:${item.modifier}` : ''}*${item.estAllowed}*UN*1***1:2~`
  )
  .join('\n')}
SE*${12 + auditResult.items.length * 2}*0075~
GE*1*75~
IEA*1*000000075~`}
              </div>
            </div>
          </div>

          {/* Conversion Bridge */}
          <ToolConversionBridge
            toolName="Orthopedic Oncology & Limb Salvage Mega-Prosthesis Scrubber"
            contextText="Orthopedic oncology practices lose hundreds of thousands of dollars to unlisted mega-prosthesis downcoding, missing rotational muscle flap modifiers, and absorbed implant hardware costs."
          />
        </div>
      </div>
    </div>
  );
}
