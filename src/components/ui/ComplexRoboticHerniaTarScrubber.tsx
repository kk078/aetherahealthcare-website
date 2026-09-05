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
  Layers,
  Copy,
  Sliders,
  Scissors,
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

export default function ComplexRoboticHerniaTarScrubber() {
  // Clinical Inputs
  const [herniaType, setHerniaType] = useState<'initial' | 'recurrent'>('recurrent');
  const [acuity, setAcuity] = useState<'reducible' | 'incarcerated'>('reducible');
  const [defectSizeCm, setDefectSizeCm] = useState<number>(12); // in cm
  const [performTar, setPerformTar] = useState<boolean>(true);
  const [placeMesh, setPlaceMesh] = useState<boolean>(true);
  const [nonContiguousDefects, setNonContiguousDefects] = useState<boolean>(false);
  const [extensiveAdhesiolysis, setExtensiveAdhesiolysis] = useState<boolean>(true);
  const [assistantSurgeonMod80, setAssistantSurgeonMod80] = useState<boolean>(false);

  // Lead capture state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPractice, setContactPractice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Size tier evaluation under CPT 2023+
  const sizeCategory = useMemo(() => {
    if (defectSizeCm < 3) return 'less_than_3cm';
    if (defectSizeCm <= 10) return '3_to_10cm';
    return 'greater_than_10cm';
  }, [defectSizeCm]);

  // Dynamic Audit Computation
  const auditResult = useMemo(() => {
    const items: LineItem[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let grossValue = 0;
    let atRiskValue = 0;

    // 1. Primary Hernia Code Selection (CPT 49591 - 49618)
    let primaryCode = '49591';
    let primaryRvu = 16.5;
    let primaryFee = 1150;
    let primaryDesc = 'Repair of anterior abdominal wall hernia';

    if (herniaType === 'initial') {
      if (acuity === 'reducible') {
        if (sizeCategory === 'less_than_3cm') {
          primaryCode = '49591';
          primaryRvu = 16.5;
          primaryFee = 1150;
          primaryDesc = 'Repair of initial anterior abdominal wall hernia, reducible, < 3 cm';
        } else if (sizeCategory === '3_to_10cm') {
          primaryCode = '49593';
          primaryRvu = 22.8;
          primaryFee = 1590;
          primaryDesc = 'Repair of initial anterior abdominal wall hernia, reducible, 3 cm to 10 cm';
        } else {
          primaryCode = '49595';
          primaryRvu = 28.4;
          primaryFee = 1980;
          primaryDesc = 'Repair of initial anterior abdominal wall hernia, reducible, > 10 cm';
        }
      } else {
        // Incarcerated / Strangulated
        if (sizeCategory === 'less_than_3cm') {
          primaryCode = '49592';
          primaryRvu = 19.8;
          primaryFee = 1380;
          primaryDesc = 'Repair of initial anterior abdominal wall hernia, incarcerated/strangulated, < 3 cm';
        } else if (sizeCategory === '3_to_10cm') {
          primaryCode = '49594';
          primaryRvu = 26.2;
          primaryFee = 1830;
          primaryDesc = 'Repair of initial anterior abdominal wall hernia, incarcerated/strangulated, 3 cm to 10 cm';
        } else {
          primaryCode = '49596';
          primaryRvu = 33.1;
          primaryFee = 2310;
          primaryDesc = 'Repair of initial anterior abdominal wall hernia, incarcerated/strangulated, > 10 cm';
        }
      }
    } else {
      // Recurrent
      if (acuity === 'reducible') {
        if (sizeCategory === 'less_than_3cm') {
          primaryCode = '49613';
          primaryRvu = 18.2;
          primaryFee = 1270;
          primaryDesc = 'Repair of recurrent anterior abdominal wall hernia, reducible, < 3 cm';
        } else if (sizeCategory === '3_to_10cm') {
          primaryCode = '49615';
          primaryRvu = 24.9;
          primaryFee = 1740;
          primaryDesc = 'Repair of recurrent anterior abdominal wall hernia, reducible, 3 cm to 10 cm';
        } else {
          primaryCode = '49617';
          primaryRvu = 31.5;
          primaryFee = 2200;
          primaryDesc = 'Repair of recurrent anterior abdominal wall hernia, reducible, > 10 cm';
        }
      } else {
        // Recurrent Incarcerated / Strangulated
        if (sizeCategory === 'less_than_3cm') {
          primaryCode = '49614';
          primaryRvu = 21.6;
          primaryFee = 1510;
          primaryDesc = 'Repair of recurrent anterior abdominal wall hernia, incarcerated/strangulated, < 3 cm';
        } else if (sizeCategory === '3_to_10cm') {
          primaryCode = '49616';
          primaryRvu = 28.7;
          primaryFee = 2010;
          primaryDesc = 'Repair of recurrent anterior abdominal wall hernia, incarcerated/strangulated, 3 cm to 10 cm';
        } else {
          primaryCode = '49618';
          primaryRvu = 36.4;
          primaryFee = 2540;
          primaryDesc = 'Repair of recurrent anterior abdominal wall hernia, incarcerated/strangulated, > 10 cm';
        }
      }
    }

    grossValue += primaryFee;
    items.push({
      code: primaryCode,
      modifier: extensiveAdhesiolysis ? '22' : '',
      description: primaryDesc,
      rvu: primaryRvu,
      estAllowed: primaryFee,
      status: 'compliant',
      editReason: extensiveAdhesiolysis
        ? 'Modifier -22 attached: Operative report must specify >60 minutes severe hostile peritoneal enterolysis with bowel deserosalization repair.'
        : 'CPT 2023+ unified anterior abdominal wall hernia code correctly matched to defect size and recurrence status.',
    });

    // 2. Posterior Component Separation / TAR Add-on (+49622)
    if (performTar) {
      const tarRvu = 18.5;
      const tarFee = 1290;
      grossValue += tarFee;
      items.push({
        code: '+49622',
        modifier: '',
        description: 'Posterior component separation with transversus abdominis release (TAR add-on)',
        rvu: tarRvu,
        estAllowed: tarFee,
        status: 'compliant',
        editReason: 'Exempt from Modifier -51 multi-procedure fee reduction. Operative note must document medial release of transversus abdominis muscle fibers and dissection into retroperitoneal space.',
      });
      recommendations.push('Document transversus abdominis muscle incision separate from the posterior rectus sheath to defend TAR add-on code +49622 against unbundling edits.');
    } else {
      warnings.push('NOTICE: Large hernia repair (>10 cm) without posterior component separation limits myofascial advancement and forfeits reimbursable TAR add-on code +49622 ($1,290).');
    }

    // 3. Implantation of Mesh or Prosthesis (+49623)
    if (placeMesh) {
      const meshRvu = 8.6;
      const meshFee = 600;
      grossValue += meshFee;
      items.push({
        code: '+49623',
        modifier: '',
        description: 'Implantation of mesh or other prosthesis for anterior abdominal wall hernia repair (add-on)',
        rvu: meshRvu,
        estAllowed: meshFee,
        status: 'compliant',
        editReason: 'Under CPT 2023+, mesh placement is no longer bundled into primary hernia repairs and must be billed using add-on code +49623.',
      });
      recommendations.push('Bill +49623 for retrorectus or preperitoneal synthetic/biologic mesh placement. Ensure product name, dimensions, and fixation method (suture vs tacks) are dictated.');
    } else {
      warnings.push('CLINICAL ADVISORY: High-risk hernia reconstruction without prosthetic reinforcement exhibits elevated recurrence risk and forfeits mesh add-on code +49623 ($600).');
    }

    // 4. Non-Contiguous Defects Audit
    if (nonContiguousDefects) {
      const secondaryFee = 850;
      grossValue += secondaryFee;
      items.push({
        code: '49591',
        modifier: '59',
        description: 'Secondary distinct non-contiguous anterior wall defect repair (< 3 cm)',
        rvu: 12.2,
        estAllowed: secondaryFee,
        status: 'compliant',
        editReason: 'Modifier -59 or -XS justified: Documentation establishes physically distinct fascial orifice separated by intact fascia requiring independent suture closure.',
      });
      recommendations.push('Do NOT sum the diameters of separate hernia orifices. Report the largest hernia defect as primary, and append Modifier -59/-XS to distinct non-contiguous repairs.');
    }

    // 5. Assistant Surgeon (Modifier 80)
    if (assistantSurgeonMod80) {
      const assistFee = Math.round(grossValue * 0.16);
      items.push({
        code: primaryCode,
        modifier: '80',
        description: 'Assistant Surgeon professional fee (16% allowable)',
        rvu: primaryRvu * 0.16,
        estAllowed: assistFee,
        status: 'compliant',
        editReason: 'Qualified surgical assistant documented throughout extensive abdominal wall reconstruction and robotic docking.',
      });
      grossValue += assistFee;
    }

    // At risk value computation
    if (performTar) atRiskValue += 1290;
    if (placeMesh) atRiskValue += 600;
    if (acuity === 'incarcerated') atRiskValue += 500;
    if (extensiveAdhesiolysis) atRiskValue += 350;

    return {
      items,
      warnings,
      recommendations,
      grossValue,
      atRiskValue,
      primaryCode,
    };
  }, [
    herniaType,
    acuity,
    defectSizeCm,
    sizeCategory,
    performTar,
    placeMesh,
    nonContiguousDefects,
    extensiveAdhesiolysis,
    assistantSurgeonMod80,
  ]);

  // Lead submission
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactName) return;

    setIsSubmitting(true);
    try {
      await sendLeadToKiran('complex_robotic_hernia_rcm_audit', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        herniaType,
        acuity,
        defectSizeCm,
        performTar,
        placeMesh,
        nonContiguousDefects,
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
    const text = `--- AETHERA HEALTHCARE COMPLEX ROBOTIC HERNIA & TAR CODING PACKET ---
Hernia Status: ${herniaType.toUpperCase()} | Acuity: ${acuity.toUpperCase()}
Defect Maximum Diameter: ${defectSizeCm} cm (Tier: ${sizeCategory.replace(/_/g, ' ')})
Posterior Component Separation (TAR +49622): ${performTar ? 'YES' : 'NO'}
Mesh Implantation (+49623): ${placeMesh ? 'YES' : 'NO'}
Non-Contiguous Defects: ${nonContiguousDefects ? 'YES (Mod 59)' : 'NO'}
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
            <Scissors className="w-3.5 h-3.5" />
            CPT 2023+ Abdominal Wall Reconstruction &amp; Robotic Hernia Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Complex Robotic Hernia &amp; TAR Component Separation Scrubber
          </h2>
          <p className="mt-2 text-sm sm:text-base text-cream/90 max-w-3xl leading-relaxed">
            Eliminate denials under modern CPT 2023+ anterior abdominal wall hernia rules (49591–49618). Unbundle transversus abdominis release (TAR add-on +49622), capture retrorectus mesh placement (+49623), defend non-contiguous defects (Mod -59), and optimize complex adhesiolysis (+Mod 22).
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal" />
              1. Hernia Morphology &amp; CPT Sizing
            </h3>

            {/* Hernia Chronicity */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Hernia Chronicity
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'initial', label: 'Initial Ventral / Incisional' },
                  { id: 'recurrent', label: 'Recurrent Ventral / Incisional' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHerniaType(item.id as any)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      herniaType === item.id
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-cream/40 text-navy/80 border-gray/20 hover:bg-cream'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Surgical Acuity */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Clinical Presentation &amp; Acuity
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'reducible', label: 'Reducible Hernia Defect' },
                  { id: 'incarcerated', label: 'Incarcerated / Strangulated' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAcuity(item.id as any)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      acuity === item.id
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-cream/40 text-navy/80 border-gray/20 hover:bg-cream'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Defect Sizing Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Maximum Defect Diameter (cm)
                </label>
                <span className="text-sm font-bold text-teal">{defectSizeCm} cm</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={defectSizeCm}
                onChange={(e) => setDefectSizeCm(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>&lt; 3 cm (Tier 1)</span>
                <span>3 cm – 10 cm (Tier 2)</span>
                <span>&gt; 10 cm (Tier 3 Massive)</span>
              </div>
            </div>

            {/* Active Code Mapping Box */}
            <div className="bg-cream/60 border border-gray/15 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Mapped Primary CPT Code</p>
                <p className="text-2xl font-black text-navy font-jakarta mt-0.5 font-mono">{auditResult.primaryCode}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-semibold uppercase">Assigned Sizing Tier</p>
                <span className="inline-block mt-0.5 text-xs font-bold px-2.5 py-1 bg-teal/15 text-teal rounded-lg">
                  {defectSizeCm < 3 ? '< 3 cm' : defectSizeCm <= 10 ? '3 to 10 cm' : '> 10 cm Complex'}
                </span>
              </div>
            </div>
          </div>

          {/* Surgical Reconstructive Techniques */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal" />
              2. Complex Reconstruction &amp; Component Release
            </h3>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={performTar}
                  onChange={(e) => setPerformTar(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Transversus Abdominis Release (+49622 TAR Add-on)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Posterior component separation with neurovascular bundle preservation and retromuscular space development.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={placeMesh}
                  onChange={(e) => setPlaceMesh(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Implantation of Prosthetic Mesh (+49623 Add-on)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Retrorectus sublay or preperitoneal prosthetic or biologic mesh fixation with transfascial sutures.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={nonContiguousDefects}
                  onChange={(e) => setNonContiguousDefects(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Non-Contiguous Hernia Defects Repaired (Modifier -59)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Physically separated defects (e.g. midline + subcostal or swiss-cheese fascial bridges) closed independently.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={extensiveAdhesiolysis}
                  onChange={(e) => setExtensiveAdhesiolysis(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Severe Hostile Adhesiolysis &gt; 60 Mins (Modifier -22)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Enterolysis exceeding one hour with extensive dense bowel loops adherent to prior mesh or scarred peritoneum.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={assistantSurgeonMod80}
                  onChange={(e) => setAssistantSurgeonMod80(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Assistant Surgeon Participating (Modifier -80)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Reimbursable assistant surgeon support for prolonged multi-port robotic abdominal wall reconstruction.
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
                <p className="text-[11px] text-amber-200/80 mt-0.5">Vulnerable to TAR &amp; mesh bundling</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-cream/80 font-medium">Size Tier: {sizeCategory.replace(/_/g, ' ')}</span>
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
                Surgical Claim Coding Ledger
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
              Request Complex Abdominal Wall Reconstruction RCM Audit
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Get an expert review of your robotic hernia coding, transversus abdominis release add-on reimbursement, and operative note dictation templates.
            </p>

            {submitSuccess ? (
              <div className="p-4 bg-mint/20 border border-mint/40 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-teal mx-auto mb-2" />
                <p className="text-sm font-bold text-navy">Audit Request Received</p>
                <p className="text-xs text-slate-600 mt-1">
                  Our surgical reconstruction RCM team will review your CPT 2023+ hernia coding structure and contact you within 1 business day.
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
                    placeholder="Surgery Center / Practice"
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
                  {isSubmitting ? 'Sending Request...' : 'Get Free Hernia Revenue Audit'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
