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
  ChevronRight,
  Layers,
  Copy,
  GitBranch,
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

export default function SkullBaseBypassAneurysmScrubber() {
  // Clinical Scenario & Surgical Selections
  const [pathologyType, setPathologyType] = useState<'giant_aneurysm' | 'moyamoya' | 'skull_base_tumor'>('giant_aneurysm');
  const [bypassType, setBypassType] = useState<'sta_mca' | 'high_flow_saphenous' | 'radial_artery'>('high_flow_saphenous');
  const [approachType, setApproachType] = useState<'orbitozygomatic' | 'subtemporal' | 'standard_craniotomy'>('orbitozygomatic');
  const [useMicroscope, setUseMicroscope] = useState<boolean>(true);
  const [useGraftHarvest, setUseGraftHarvest] = useState<boolean>(true);
  const [dualSurgeonMod62, setDualSurgeonMod62] = useState<boolean>(true);
  const [includeFlowmetry, setIncludeFlowmetry] = useState<boolean>(true);

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
    const items: LineItem[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let grossValue = 0;
    let atRiskValue = 0;

    // 1. Primary Microvascular EC-IC Bypass (CPT 61711)
    const bypassRvu = 68.4;
    const bypassFee = 4780;
    grossValue += bypassFee;

    items.push({
      code: '61711',
      modifier: dualSurgeonMod62 ? '62' : '',
      description: 'Anastomosis, arterial, extracranial-to-intracranial (e.g., STA-MCA, carotid-to-MCA graft)',
      rvu: bypassRvu,
      estAllowed: bypassFee,
      status: 'compliant',
      editReason: dualSurgeonMod62
        ? 'Modifier -62 co-surgery defended: vascular neurosurgeon performed microscopic vessel preparation and arteriotomy anastomosis.'
        : 'Primary microvascular intracranial revascularization recorded at 100% allowable rate.',
    });

    // 2. Skull Base Approach Unbundling Audit
    if (approachType === 'orbitozygomatic') {
      const approachRvu = 62.5;
      const approachFee = 4350;
      grossValue += approachFee;

      items.push({
        code: '61592',
        modifier: dualSurgeonMod62 ? '62' : '59',
        description: 'Orbitocranial approach to anterior cranial fossa, extradural / intradural with osteotomy',
        rvu: approachRvu,
        estAllowed: approachFee,
        status: 'compliant',
        editReason: 'Skull base approach is separately billable from intracranial revascularization when two-piece orbitozygomatic osteotomy is documented.',
      });
      recommendations.push('Ensure operative note contains separate approach paragraph describing supraorbital bar and zygomatic arch osteotomies to defend CPT 61592.');
    } else if (approachType === 'subtemporal') {
      const approachRvu = 54.2;
      const approachFee = 3780;
      grossValue += approachFee;

      items.push({
        code: '61590',
        modifier: dualSurgeonMod62 ? '62' : '59',
        description: 'Infratemporal preauricular approach to middle cranial fossa',
        rvu: approachRvu,
        estAllowed: approachFee,
        status: 'compliant',
        editReason: 'Middle cranial fossa approach unbundled with Modifier -59/62 from intracranial vascular reconstruction.',
      });
    } else {
      // standard craniotomy: bundled!
      items.push({
        code: '61312',
        modifier: 'UNBUNDLED',
        description: 'Craniectomy or craniotomy for evacuation of hematoma / bone flap',
        rvu: 32.1,
        estAllowed: 2240,
        status: 'fatal',
        editReason: 'CMS NCCI Chapter VIII Column 2 edit: Standard pterional craniotomy bone flap is bundled into EC-IC bypass (61711). Billing separately triggers fatal rejection.',
      });
      warnings.push('CRITICAL NCCI EDIT: Standard craniotomy is an integral surgical approach component of CPT 61711. Billing separately triggers immediate $2,240 recoupment.');
      recommendations.push('Suppress routine craniotomy codes. Only report skull base approach codes (61590–61592) when complex orbital/zygomatic osteotomies are performed.');
      atRiskValue += 2240;
    }

    // 3. Autologous Interposition Graft Harvest
    if (bypassType === 'high_flow_saphenous' && useGraftHarvest) {
      const harvestFee = 620;
      grossValue += harvestFee;
      items.push({
        code: '+35500',
        modifier: '59',
        description: 'Harvest of upper extremity or saphenous vein graft for interposition revascularization',
        rvu: 8.9,
        estAllowed: harvestFee,
        status: 'compliant',
        editReason: 'Saphenous vein harvest from separate lower extremity prep/incision unbundled with Modifier -59.',
      });
    } else if (bypassType === 'radial_artery' && useGraftHarvest) {
      const harvestFee = 710;
      grossValue += harvestFee;
      items.push({
        code: '35600',
        modifier: '59',
        description: 'Harvest of arterial graft for interposition revascularization (radial artery)',
        rvu: 10.2,
        estAllowed: harvestFee,
        status: 'compliant',
        editReason: 'Forearm radial artery dissection with modified Allen test documented; separate surgical field defended.',
      });
    }

    // 4. Operating Microscope Add-on (+69990)
    if (useMicroscope) {
      const microFee = 380;
      grossValue += microFee;
      items.push({
        code: '+69990',
        modifier: '',
        description: 'Microsurgical techniques, requiring use of operating microscope (add-on code)',
        rvu: 4.8,
        estAllowed: microFee,
        status: 'compliant',
        editReason: 'CMS NCCI guidelines: CPT 61711 is fully eligible for +69990 reimbursement when microvascular sutures (9-0 / 10-0 nylon) are documented.',
      });
    }

    // 5. Intraoperative Microvascular Flowmetry / ICG Videoangiography
    if (includeFlowmetry) {
      const flowFee = 240;
      grossValue += flowFee;
      items.push({
        code: '93985',
        modifier: '26',
        description: 'Duplex scan of arterial flow / intraoperative microvascular transit-time ultrasound flowmetry',
        rvu: 2.1,
        estAllowed: flowFee,
        status: 'compliant',
        editReason: 'Quantitative bypass graft volume flow (mL/min) and pulsatility index recorded intraoperatively.',
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
  }, [pathologyType, bypassType, approachType, useMicroscope, useGraftHarvest, dualSurgeonMod62, includeFlowmetry]);

  // Lead submission
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactName) return;

    setIsSubmitting(true);
    try {
      await sendLeadToKiran('skull_base_bypass_rcm_audit', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        pathologyType,
        bypassType,
        approachType,
        useMicroscope,
        dualSurgeonMod62,
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
    const text = `--- AETHERA HEALTHCARE RCM SKULL BASE BYPASS AUDIT ---
Pathology: ${pathologyType.toUpperCase()}
Bypass Type: ${bypassType.toUpperCase()}
Approach: ${approachType.toUpperCase()}
Operating Microscope (+69990): ${useMicroscope ? 'YES' : 'NO'}
Dual-Surgeon (Mod 62): ${dualSurgeonMod62 ? 'YES' : 'NO'}
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
            <GitBranch className="w-3.5 h-3.5" />
            Cerebrovascular &amp; Skull Base Revascularization Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Complex EC-IC Cerebrovascular Bypass &amp; Aneurysm Scrubber
          </h2>
          <p className="mt-2 text-sm sm:text-base text-cream/90 max-w-3xl leading-relaxed">
            Eliminate multi-thousand dollar denials on microvascular EC-IC arterial bypass (61711), unbundle skull base orbitozygomatic approaches (61592), defend autologous interposition vein/artery grafts (+35500/35600), and capture operating microscope add-ons (+69990).
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Brain className="w-5 h-5 text-teal" />
              1. Pathology &amp; Bypass Conduit
            </h3>

            {/* Indication selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Cerebrovascular Indication
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'giant_aneurysm', label: 'Giant Fusiform Aneurysm' },
                  { id: 'moyamoya', label: 'Moyamoya Hemispheric' },
                  { id: 'skull_base_tumor', label: 'Carotid Encasing Tumor' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPathologyType(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      pathologyType === item.id
                        ? 'border-teal bg-teal/10 text-teal'
                        : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bypass Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Bypass Revascularization Conduit
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'high_flow_saphenous', label: 'Saphenous Vein High-Flow' },
                  { id: 'radial_artery', label: 'Radial Artery Interposition' },
                  { id: 'sta_mca', label: 'Direct STA-MCA' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBypassType(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      bypassType === item.id
                        ? 'border-teal bg-teal/10 text-teal'
                        : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skull Base Approach */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Cranial Surgical Approach
              </label>
              <div className="space-y-2">
                {[
                  { id: 'orbitozygomatic', label: 'Orbitozygomatic Skull Base Approach (61592)' },
                  { id: 'subtemporal', label: 'Infratemporal Skull Base Approach (61590)' },
                  { id: 'standard_craniotomy', label: 'Standard Pterional Craniotomy (Test Bundling)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setApproachType(item.id as any)}
                    className={`w-full p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                      approachType === item.id
                        ? item.id === 'standard_craniotomy'
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
          </div>

          {/* Adjuncts & Co-Surgery */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal" />
              2. Graft Harvest, Microsurgery &amp; Co-Surgeon
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useGraftHarvest}
                  onChange={(e) => setUseGraftHarvest(e.target.checked)}
                  className="rounded text-teal focus:ring-teal h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">Autologous Harvest (+35500/35600)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useMicroscope}
                  onChange={(e) => setUseMicroscope(e.target.checked)}
                  className="rounded text-teal focus:ring-teal h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">Operating Microscope (+69990)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dualSurgeonMod62}
                  onChange={(e) => setDualSurgeonMod62(e.target.checked)}
                  className="rounded text-teal focus:ring-teal h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">Co-Surgeon Modifier -62 (Approach/Bypass)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFlowmetry}
                  onChange={(e) => setIncludeFlowmetry(e.target.checked)}
                  className="rounded text-teal focus:ring-teal h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">Intraop Doppler Flowmetry (93985-26)</span>
              </label>
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
              <span className="text-xs text-teal font-medium mt-1 inline-block">High-Acuity Skull Base Case</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray/15 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue At Risk</span>
              <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${auditResult.atRiskValue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ${auditResult.atRiskValue.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500 mt-1 inline-block">Approach Bundling &amp; Harvest Clawbacks</span>
            </div>
          </div>

          {/* Warnings Panel */}
          {auditResult.warnings.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>NCCI Skull Base Bundling Edit Detected</span>
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
              <h4 className="font-bold text-navy text-sm">Request Comprehensive Cerebrovascular Bypass Practice Audit</h4>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Have our certified neurosurgery coders review your complex EC-IC bypass operative dictations, graft harvesting notes, and co-surgeon Modifier -62 submissions.
            </p>

            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <h5 className="text-sm font-bold text-emerald-900">Audit Request Received</h5>
                <p className="text-xs text-emerald-700 mt-1">
                  Our cerebrovascular RCM expert will contact you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Physician / Neurosurgical Practice"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Work Email (e.g. jwatson@neurosurgery.org)"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Cerebrovascular Institute / Health System"
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
                      Submit Skull Base Bypass Case for Practice Audit
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
