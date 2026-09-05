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
  Layers,
  Copy,
  Sliders,
  Compass,
  Zap,
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

export default function AdultSpineDeformityLlifScrubber() {
  // Surgical Configuration State
  const [llifLevels, setLlifLevels] = useState<number>(3); // 1 to 5 interspaces
  const [allrRelease, setAllrRelease] = useState<boolean>(true); // Anterior Longitudinal Ligament Release (Mod 22)
  const [posteriorFixation, setPosteriorFixation] = useState<'none' | 'short_3_6' | 'long_7_12'>('short_3_6');
  const [includePelvicFixation, setIncludePelvicFixation] = useState<boolean>(true); // +22848 S2AI
  const [includeInterbodyCages, setIncludeInterbodyCages] = useState<boolean>(true); // +22853 per level
  const [includeStereotacticNav, setIncludeStereotacticNav] = useState<boolean>(true); // +61783
  const [includeIonm, setIncludeIonm] = useState<boolean>(true); // +95940

  // Lead capture state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPractice, setContactPractice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic Ledger & Fee Engine
  const auditResult = useMemo(() => {
    const items: LineItem[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let grossValue = 0;
    let atRiskValue = 0;

    // 1. Primary Lateral Interbody Fusion (CPT 22558)
    const primaryRvu = 39.4;
    const primaryFee = 2850;
    grossValue += primaryFee;
    items.push({
      code: '22558',
      modifier: allrRelease ? '22' : '',
      description: `Arthrodesis, anterior/lateral interbody technique; lumbar (initial interspace)${
        allrRelease ? ' [Modifier -22: Anterior Longitudinal Ligament Release]' : ''
      }`,
      rvu: allrRelease ? primaryRvu * 1.25 : primaryRvu,
      estAllowed: allrRelease ? Math.round(primaryFee * 1.25) : primaryFee,
      status: 'compliant',
      editReason: allrRelease
        ? 'Modifier -22 appended for extensive anterior longitudinal ligament release (ALLR) and lordotic realignment.'
        : 'Initial retroperitoneal transpsoas interbody arthrodesis corridor.',
    });

    if (allrRelease) {
      recommendations.push(
        'Submit dedicated Modifier -22 justification note detailing exact operative time increase (>45 mins) and vascular mobilization for ALLR.'
      );
      atRiskValue += Math.round(primaryFee * 0.25);
    }

    // 2. Additional Interbody Interspaces (+22552)
    if (llifLevels > 1) {
      const additionalCount = llifLevels - 1;
      const addOnRvu = 9.8 * additionalCount;
      const addOnFee = 720 * additionalCount;
      grossValue += addOnFee;
      items.push({
        code: `+22552 (x${additionalCount})`,
        modifier: '',
        description: `Arthrodesis, lateral interbody technique; each additional interspace (${additionalCount} levels)`,
        rvu: addOnRvu,
        estAllowed: addOnFee,
        status: 'compliant',
        editReason: 'Add-on code explicitly exempt from Modifier -51 multiple-procedure reductions.',
      });
      atRiskValue += addOnFee;
      recommendations.push(
        `Ensure each interspace (${additionalCount} add-on levels) has explicit discectomy, endplate preparation, and trial notes to survive automated NCCI edits.`
      );
    }

    // 3. Biomechanical Interbody Cages (+22853)
    if (includeInterbodyCages) {
      const cageCount = llifLevels;
      const cageRvu = 7.5 * cageCount;
      const cageFee = 540 * cageCount;
      grossValue += cageFee;
      items.push({
        code: `+22853 (x${cageCount})`,
        modifier: '',
        description: `Insertion of intervertebral biomechanical device(s) / synthetic expandable cage(s) (${cageCount} cages)`,
        rvu: cageRvu,
        estAllowed: cageFee,
        status: 'compliant',
        editReason: 'Reported per disc space treated. Never downcoded to single unit.',
      });
    }

    // 4. Posterior Percutaneous Instrumentation (+22842 or +22843)
    if (posteriorFixation === 'short_3_6') {
      const postRvu = 20.5;
      const postFee = 1520;
      grossValue += postFee;
      items.push({
        code: '+22842',
        modifier: '',
        description: 'Posterior non-segmental/segmental instrumentation; 3 to 6 vertebral segments (percutaneous)',
        rvu: postRvu,
        estAllowed: postFee,
        status: 'compliant',
        editReason: 'Multi-level posterior pedicle screw construct spanning 3-6 vertebrae.',
      });
    } else if (posteriorFixation === 'long_7_12') {
      const postRvu = 27.8;
      const postFee = 2080;
      grossValue += postFee;
      items.push({
        code: '+22843',
        modifier: '',
        description: 'Posterior segmental instrumentation; 7 to 12 vertebral segments (deformity construct)',
        rvu: postRvu,
        estAllowed: postFee,
        status: 'compliant',
        editReason: 'Extensive adult degenerative scoliosis correction spanning 7-12 segments.',
      });
    }

    // 5. Spinopelvic Fixation (+22848)
    if (includePelvicFixation && posteriorFixation !== 'none') {
      const pelvicRvu = 11.2;
      const pelvicFee = 840;
      grossValue += pelvicFee;
      items.push({
        code: '+22848',
        modifier: '',
        description: 'Pelvic fixation, other than sacrum; insertion of S2-alar-iliac (S2AI) or iliac screws (bilateral)',
        rvu: pelvicRvu,
        estAllowed: pelvicFee,
        status: 'compliant',
        editReason: 'Bilateral distal spinopelvic anchors to prevent L5-S1 pseudoarthrosis and construct failure.',
      });
      recommendations.push(
        'Verify CPT +22848 is reported with posterior instrumentation (+22842/+22843). Never bill alone.'
      );
    } else if (includePelvicFixation && posteriorFixation === 'none') {
      warnings.push('Coding mismatch: Pelvic fixation (+22848) requires concurrent posterior segmental instrumentation.');
    }

    // 6. Computer-Assisted 3D Navigation (+61783)
    if (includeStereotacticNav) {
      const navRvu = 6.2;
      const navFee = 460;
      grossValue += navFee;
      items.push({
        code: '+61783',
        modifier: '',
        description: 'Stereotactic computer-assisted (navigational) procedure; spinal (3D fluoro/CT matching)',
        rvu: navRvu,
        estAllowed: navFee,
        status: 'compliant',
        editReason: 'Real-time navigation used to plan transpsoas trajectory and verify pedicle screw coordinates.',
      });
    }

    // 7. Intraoperative Neuromonitoring (+95940)
    if (includeIonm) {
      const ionmRvu = 5.8;
      const ionmFee = 420;
      grossValue += ionmFee;
      items.push({
        code: '+95940',
        modifier: '',
        description: 'Continuous intraoperative neurophysiology monitoring, from outside the OR; per 15 minutes (or 95941)',
        rvu: ionmRvu,
        estAllowed: ionmFee,
        status: 'compliant',
        editReason: 'Dedicated real-time lumbar plexus EMG/SSEP monitoring to prevent femoral neuropathy during psoas retraction.',
      });
    }

    return {
      items,
      warnings,
      recommendations,
      grossValue,
      atRiskValue,
    };
  }, [
    llifLevels,
    allrRelease,
    posteriorFixation,
    includePelvicFixation,
    includeInterbodyCages,
    includeStereotacticNav,
    includeIonm,
  ]);

  // Handle lead submission
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactName) return;

    setIsSubmitting(true);
    try {
      await sendLeadToKiran('adult_spine_deformity_llif_audit', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        llifLevels,
        allrRelease,
        posteriorFixation,
        includePelvicFixation,
        includeInterbodyCages,
        includeStereotacticNav,
        includeIonm,
        grossValue: auditResult.grossValue,
        atRiskValue: auditResult.atRiskValue,
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Lead submission failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPacket = () => {
    const text = `--- AETHERA HEALTHCARE ADULT SPINE DEFORMITY & LLIF RCM AUDIT PACKET ---
LLIF Interspaces: ${llifLevels} level(s)
ALLR Hyperlordotic Release (Mod 22): ${allrRelease ? 'YES' : 'NO'}
Posterior Fixation: ${posteriorFixation.toUpperCase()}
Pelvic Fixation (+22848): ${includePelvicFixation ? 'YES' : 'NO'}
Cages (+22853): ${includeInterbodyCages ? `${llifLevels} interspaces` : 'NO'}
3D Navigation (+61783): ${includeStereotacticNav ? 'YES' : 'NO'}
Gross Clean Allowed: $${auditResult.grossValue.toLocaleString()}
Revenue At Risk: $${auditResult.atRiskValue.toLocaleString()}

CODING BREAKDOWN:
${auditResult.items.map((i) => `${i.code}${i.modifier ? `-${i.modifier}` : ''} | RVU: ${i.rvu.toFixed(1)} | $${i.estAllowed.toLocaleString()} | ${i.description}`).join('\n')}

AUDIT DEFENSE DIRECTIVES:
${auditResult.recommendations.map((r, idx) => `${idx + 1}. ${r}`).join('\n')}
${auditResult.warnings.map((w, idx) => `! WARNING ${idx + 1}: ${w}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0284c7] text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-mint/20 text-mint border border-mint/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" />
            Minimally Invasive Spine Deformity Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Adult Spine Deformity &amp; Multi-Level LLIF Scrubber
          </h2>
          <p className="mt-2 text-sm sm:text-base text-cream/90 max-w-3xl leading-relaxed">
            Eliminate severe undercoding and modifier unbundling rejections on multi-level lateral lumbar interbody fusions (LLIF/XLIF). Defend primary arthrodesis (22558), multi-level add-ons (+22552), ALLR anterior release (+Mod 22), percutaneous instrumentation (+22842–+22843), and spinopelvic iliac anchors (+22848).
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Configurations */}
        <div className="lg:col-span-6 space-y-6">
          {/* LLIF Interspace Level Selector */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal" />
              1. Lateral Interbody Corridors (LLIF/XLIF)
            </h3>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Number of Lateral Fusion Levels
                </label>
                <span className="text-sm font-bold text-teal">{llifLevels} Interspace{llifLevels > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLlifLevels(lvl)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      llifLevels === lvl
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-cream/40 text-navy/80 border-gray/20 hover:bg-cream'
                    }`}
                  >
                    {lvl} {lvl === 1 ? 'Lvl' : 'Lvls'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Level 1 bills CPT 22558 ($2,850). Levels 2–{llifLevels} bill add-on +22552 (${720 * (llifLevels - 1)}).
              </p>
            </div>

            {/* ALLR Modifier 22 Toggle */}
            <div className="pt-1">
              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={allrRelease}
                  onChange={(e) => setAllrRelease(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Anterior Longitudinal Ligament Release (ALLR) (+Mod 22)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Hyperlordotic cage placement requiring complete resection of ALL to restore focal sagittal lordosis.
                  </span>
                </div>
              </label>
            </div>

            {/* Interbody Cages Toggle */}
            <div>
              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={includeInterbodyCages}
                  onChange={(e) => setIncludeInterbodyCages(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Biomechanical Interbody Cages (+22853 x {llifLevels})</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Reimbursable per disc space treated (${540 * llifLevels} total).
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Posterior Fixation & Deformity Realignment */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal" />
              2. Posterior Percutaneous Fixation &amp; Ancillaries
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Posterior Segmental Construct
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'Stand-Alone / None' },
                  { id: 'short_3_6', label: '3–6 Segments (+22842)' },
                  { id: 'long_7_12', label: '7–12 Segments (+22843)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPosteriorFixation(item.id as any)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      posteriorFixation === item.id
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
              {posteriorFixation !== 'none' && (
                <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                  <input
                    type="checkbox"
                    checked={includePelvicFixation}
                    onChange={(e) => setIncludePelvicFixation(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                  />
                  <div>
                    <span className="text-xs font-bold text-navy block">Spinopelvic S2AI / Iliac Screws (+22848)</span>
                    <span className="text-[11px] text-slate-500 leading-snug">
                      Bilateral sacropelvic fixation for distal fusion anchor (+$840).
                    </span>
                  </div>
                </label>
              )}

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={includeStereotacticNav}
                  onChange={(e) => setIncludeStereotacticNav(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Stereotactic 3D Neuronavigation (+61783)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Computer-assisted navigation for lateral corridor trajectory and screw placement (+$460).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={includeIonm}
                  onChange={(e) => setIncludeIonm(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Continuous Neuromonitoring (IONM +95940)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Psoas muscle traversal neurophysiology monitoring to protect femoral nerve branches.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Scoreboard & Audit Ledger */}
        <div className="lg:col-span-6 space-y-6">
          {/* Revenue Scoreboard */}
          <div className="bg-[#0f172a] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase text-cream/70 font-semibold tracking-wider">Gross Clean Allowed</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-mint font-jakarta mt-1">
                  ${auditResult.grossValue.toLocaleString()}
                </p>
                <p className="text-[11px] text-cream/60 mt-0.5">Primary + Add-Ons + Instrumentation</p>
              </div>
              <div>
                <p className="text-xs uppercase text-amber-300 font-semibold tracking-wider">Revenue At Risk</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-jakarta mt-1">
                  ${auditResult.atRiskValue.toLocaleString()}
                </p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">Vulnerable to add-on bundling edits</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-cream/80 font-medium">
                {llifLevels} Level{llifLevels > 1 ? 's' : ''} | {posteriorFixation.replace('_', ' ').toUpperCase()}
              </span>
              <button
                type="button"
                onClick={handleCopyPacket}
                className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-cream px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied Packet!' : 'Copy Claim Breakdown'}
              </button>
            </div>
          </div>

          {/* Live CPT Ledger */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal" />
                Spine Deformity Billing Ledger
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

          {/* Payer Scrubbers & Audit Defenses */}
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

          {/* Lead Capture Form */}
          <div className="bg-cream/50 border border-gray/20 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-teal" />
              Request Complex Spine Deformity RCM Audit
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Get an expert revenue cycle evaluation of your multi-level LLIF cases, ALLR Modifier -22 documentation, percutaneous instrumentation add-ons, and S2AI screw claims.
            </p>

            {submitSuccess ? (
              <div className="p-4 bg-mint/20 border border-mint/40 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-teal mx-auto mb-2" />
                <p className="text-sm font-bold text-navy">Audit Request Received</p>
                <p className="text-xs text-slate-600 mt-1">
                  Our orthopedic &amp; neurological spine RCM team will analyze your multi-level claims data and reach out within 1 business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Surgeon / Admin Name *"
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
                    placeholder="Spine Practice / Institute"
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
                  {isSubmitting ? 'Sending Request...' : 'Get Free Spine Deformity Audit'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
