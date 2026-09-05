'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Loader2,
  FileCode,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Sparkles,
  Scissors,
  Eye,
  GitBranch,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function WhippleResectionScrubber() {
  // 1. Primary Pancreatic Resection Scope
  const [resectionType, setResectionType] = useState<'whipple_classic' | 'whipple_pylorus_preserving' | 'total_pancreatectomy' | 'distal_pancreatectomy' | 'pancreaticojejunostomy'>('whipple_classic');
  const [simulateDowncode, setSimulateDowncode] = useState<boolean>(false);

  // 2. Mesenteric / Portal Vein Vascular Reconstruction
  const [vascularReconstruction, setVascularReconstruction] = useState<'smv_vein_graft' | 'portal_direct_anastomosis' | 'none'>('smv_vein_graft');
  const [simulateVascularBundle, setSimulateVascularBundle] = useState<boolean>(false);

  // 3. Enteral Nutrition & Ancillary Services
  const [feedingJejunostomy, setFeedingJejunostomy] = useState<boolean>(true); // CPT 44010
  const [separateStomaTract, setSeparateStomaTract] = useState<boolean>(true);
  const [includeLymphadenectomy, setIncludeLymphadenectomy] = useState<boolean>(true); // CPT +38747

  // 4. Multi-Surgeon / Co-Surgery
  const [coSurgeonMode, setCoSurgeonMode] = useState<'solo' | 'co_surgeon_compliant' | 'co_surgeon_unpaired'>('solo');

  // Lead Modal & UI States
  const [copied, setCopied] = useState<boolean>(false);
  const [showLeadModal, setShowLeadModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [leadSuccess, setLeadSuccess] = useState<boolean>(false);

  // Form Fields
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [practiceName, setPracticeName] = useState<string>('');
  const [auditNotes, setAuditNotes] = useState<string>('');

  // Scrubber Calculations
  const scrubberResult = useMemo(() => {
    interface ClaimLine {
      code: string;
      desc: string;
      mod: string;
      rvu: number;
      fee: number;
      status: 'clean' | 'warning' | 'fatal';
      note: string;
    }

    const lines: ClaimLine[] = [];
    const alerts: { type: 'fatal' | 'warning' | 'clean'; title: string; desc: string; statute: string }[] = [];

    let totalRvu = 0;
    let expectedReimbursement = 0;
    let penaltyAtRisk = 0;

    // --- 1. PRIMARY PANCREATIC RESECTION ---
    if (resectionType === 'whipple_classic') {
      const standardFee = 5680.0;
      const standardRvu = 74.5;

      let baseFee = standardFee;
      let baseRvu = standardRvu;
      let lineMod = 'None';
      let lineStatus: 'clean' | 'warning' | 'fatal' = 'clean';
      let lineNote = 'Complete pancreaticoduodenectomy with antrectomy, choledochoenterostomy, and pancreaticojejunostomy.';

      if (simulateDowncode) {
        const loss = standardFee - 5190.0;
        baseFee = 5190.0;
        baseRvu = 68.2;
        lineStatus = 'fatal';
        lineMod = 'Downcoded -> 48153';
        lineNote = `PAYER DOWNCODING: Plan reclassified 48150 to 48153, slashing -$${loss.toFixed(2)} (-6.3 RVU) by alleging unverified antrectomy.`;
        penaltyAtRisk += loss;
        alerts.push({
          type: 'fatal',
          title: 'Pylorus-Preserving Downcode Clawback (48153)',
          desc: 'Commercial auditor claims gastric antrectomy was not fully documented or resected. Operative notes must specify distal hemigastrectomy/antrectomy specimen margins.',
          statute: 'AMA CPT Assistant / Digestive System Guidelines',
        });
      }

      if (coSurgeonMode === 'co_surgeon_compliant') {
        baseFee = baseFee * 0.625;
        baseRvu = baseRvu * 0.625;
        lineMod = simulateDowncode ? '62 (Downcoded)' : '62';
        alerts.push({
          type: 'clean',
          title: 'Co-Surgeon Modifier -62 Validated',
          desc: 'Operative notes confirm distinct resection vs reconstructive dictation by Surgical Oncologist and HPB surgeon at 62.5% CMS allowable.',
          statute: 'CMS IOM Pub. 100-04, Ch. 12, §40.8',
        });
      } else if (coSurgeonMode === 'co_surgeon_unpaired') {
        lineMod = '62 (Unpaired)';
        lineStatus = 'fatal';
        lineNote = 'FATAL: Modifier 62 co-surgery billed without paired synchronized dictation from second surgeon.';
        penaltyAtRisk += baseFee;
        alerts.push({
          type: 'fatal',
          title: 'Unpaired Modifier -62 Clearinghouse Rejection',
          desc: 'Payer clearinghouses suspend Modifier 62 Whipple claims if both attending surgeons do not provide paired cross-referenced operative reports.',
          statute: 'NCCI Policy Manual Ch. 1, Sec. G',
        });
      }

      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: '48150',
        desc: 'Pancreaticoduodenectomy with partial gastrectomy (classic Whipple)',
        mod: lineMod,
        rvu: Number(baseRvu.toFixed(1)),
        fee: Number(baseFee.toFixed(2)),
        status: lineStatus,
        note: lineNote,
      });
    } else if (resectionType === 'whipple_pylorus_preserving') {
      const standardFee = 5190.0;
      const standardRvu = 68.2;
      totalRvu += standardRvu;
      expectedReimbursement += standardFee;
      lines.push({
        code: '48153',
        desc: 'Pancreaticoduodenectomy without partial gastrectomy (pylorus-preserving PPPD)',
        mod: 'None',
        rvu: standardRvu,
        fee: standardFee,
        status: 'clean',
        note: 'Pylorus and gastric antrum preserved with end-to-side duodenojejunostomy.',
      });
    } else if (resectionType === 'total_pancreatectomy') {
      const standardFee = 5870.0;
      const standardRvu = 76.8;
      totalRvu += standardRvu;
      expectedReimbursement += standardFee;
      lines.push({
        code: '48155',
        desc: 'Total pancreatectomy with duodenectomy, splenectomy & lymphadenectomy',
        mod: 'None',
        rvu: standardRvu,
        fee: standardFee,
        status: 'clean',
        note: 'Complete resection of pancreatic parenchyma, duodenum, and spleen for multifocal neoplasm.',
      });
    } else if (resectionType === 'distal_pancreatectomy') {
      const standardFee = 3210.0;
      const standardRvu = 42.1;
      totalRvu += standardRvu;
      expectedReimbursement += standardFee;
      lines.push({
        code: '48140',
        desc: 'Pancreatectomy, distal subtotal, with or without splenectomy',
        mod: 'None',
        rvu: standardRvu,
        fee: standardFee,
        status: 'clean',
        note: 'Distal body and tail resection with vascular preservation or splenectomy.',
      });
    } else {
      // Pancreaticojejunostomy
      const standardFee = 3390.0;
      const standardRvu = 44.5;
      totalRvu += standardRvu;
      expectedReimbursement += standardFee;
      lines.push({
        code: '48548',
        desc: 'Pancreaticojejunostomy (Puestow procedure) side-to-side longitudinal anastomosis',
        mod: 'None',
        rvu: standardRvu,
        fee: standardFee,
        status: 'clean',
        note: 'Longitudinal duct filleting and Roux-en-Y drainage for chronic pancreatitis.',
      });
    }

    // --- 2. MESENTERIC / PORTAL VEIN RECONSTRUCTION ---
    if (vascularReconstruction !== 'none') {
      const isVeinGraft = vascularReconstruction === 'smv_vein_graft';
      const vascCode = isVeinGraft ? '+35221' : '+35251';
      const vascDesc = isVeinGraft
        ? 'Repair blood vessel with vein graft, superior mesenteric vein / portal vein'
        : 'Repair blood vessel with direct end-to-end anastomosis, mesenteric vessel';
      const vascFee = isVeinGraft ? 1610.0 : 1310.0;
      const vascRvu = isVeinGraft ? 22.4 : 18.2;

      if (simulateVascularBundle) {
        penaltyAtRisk += vascFee;
        lines.push({
          code: vascCode,
          desc: vascDesc,
          mod: 'UNBUNDLED (Denied)',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: `FATAL: Payer unlawfully bundled mesenteric vascular reconstruction into Whipple resection.`,
        });
        alerts.push({
          type: 'fatal',
          title: 'Unlawful Bundling of Vascular Reconstruction Add-On',
          desc: `Payers frequently deny ${vascCode} as integral to tumor mobilization. NCCI Chapter V allows add-on vascular reconstruction when explicit microvascular vein patch/graft dictation is present.`,
          statute: 'NCCI Policy Manual Ch. V, Sec. E.1 / CPT Add-On Guidance',
        });
      } else {
        totalRvu += vascRvu;
        expectedReimbursement += vascFee;
        lines.push({
          code: vascCode,
          desc: vascDesc,
          mod: 'Add-On (Exempt 51)',
          rvu: vascRvu,
          fee: vascFee,
          status: 'clean',
          note: 'Add-on code: 100% allowable reimbursement with zero multiple procedure reduction discounting.',
        });
        alerts.push({
          type: 'clean',
          title: 'Vascular Reconstruction Add-On Defended',
          desc: `Operative dictation confirms tumor involvement of SMV/portal vein requiring formal vascular clamp control, segmental resection, and interposition graft.`,
          statute: 'AMA CPT Code +35221 / Vascular Surgery Standard',
        });
      }
    }

    // --- 3. ENTERAL FEEDING JEJUNOSTOMY AUDIT ---
    if (feedingJejunostomy) {
      const tubeFee = 275.0;
      const tubeRvu = 3.8;

      if (!separateStomaTract) {
        penaltyAtRisk += tubeFee;
        lines.push({
          code: '44010',
          desc: 'Construction of feeding jejunostomy tube',
          mod: 'UNBUNDLED (Denied)',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'FATAL NCCI BUNDLE: Jejunostomy tube placed without documentation of separate abdominal stab incision is denied as integral.',
        });
        alerts.push({
          type: 'fatal',
          title: 'NCCI Fatal Unbundling: Feeding Jejunostomy (44010)',
          desc: 'Commercial clearinghouses bundle enteral access into Whipple reconstruction unless operative dictation establishes a distinct transabdominal exit site (Modifier 59/XE).',
          statute: 'NCCI Policy Manual Ch. VII, Sec. C.14',
        });
      } else {
        totalRvu += tubeRvu;
        expectedReimbursement += tubeFee;
        lines.push({
          code: '44010',
          desc: 'Construction of feeding jejunostomy tube (separate stab tract)',
          mod: '59',
          rvu: tubeRvu,
          fee: tubeFee,
          status: 'clean',
          note: 'Modifier 59 supported: Documented distinct left upper quadrant exit separate from midline laparotomy.',
        });
        alerts.push({
          type: 'clean',
          title: 'Feeding Jejunostomy Defended (Modifier 59)',
          desc: 'Separate abdominal stab wound exit site documented for postoperative nutritional decompression and enteral hyperalimentation.',
          statute: 'CMS Transmittal 1422 / Medicare Surgical Standard',
        });
      }
    }

    // --- 4. REGIONAL RETROPERITONEAL LYMPHADENECTOMY ---
    if (includeLymphadenectomy) {
      const lymphFee = 620.0;
      const lymphRvu = 8.6;
      totalRvu += lymphRvu;
      expectedReimbursement += lymphFee;
      lines.push({
        code: '+38747',
        desc: 'Abdominal lymphadenectomy, regional, including celiac, gastric, portal, and mesenteric',
        mod: 'Add-On (Exempt 51)',
        rvu: lymphRvu,
        fee: lymphFee,
        status: 'clean',
        note: 'Comprehensive oncologic nodal clearance along superior mesenteric artery and celiac axis.',
      });
    }

    return {
      lines,
      alerts,
      totalRvu: Number(totalRvu.toFixed(1)),
      expectedReimbursement: Number(expectedReimbursement.toFixed(2)),
      penaltyAtRisk: Number(penaltyAtRisk.toFixed(2)),
    };
  }, [
    resectionType,
    simulateDowncode,
    vascularReconstruction,
    simulateVascularBundle,
    feedingJejunostomy,
    separateStomaTract,
    includeLymphadenectomy,
    coSurgeonMode,
  ]);

  // ANSI X12 837P Claim Preview
  const ansi837Snippet = useMemo(() => {
    return [
      'ISA*00*          *00*          *ZZ*AETHERA_RCM    *ZZ*PAYER_CLEARING *260905*1500*^*00501*000000103*0*P*:~',
      'GS*HC*AETHERA_RCM*PAYER_CLEARING*20260905*1500*103*X*005010X222A1~',
      'ST*837*0003*005010X222A1~',
      'BHT*0019*00*WHIPPLE_RESECTION*20260905*1500*CH~',
      'NM1*85*2*PANCREATICOBILIARY SURGERY ASSOCIATES*****XX*1992019925~',
      'N3*300 HEALTHCARE BOULEVARD*SUITE 600~',
      'N4*HOUSTON*TX*77030~',
      'NM1*82*1*SURGEON*PANCREATIC****XX*1662910482~',
      'PRV*BI*PXC*2084S0012X~',
      'NM1*IL*1*DOE*PATIENT****MI*AET66291043~',
      'CLM*WHIPPLE-2026-7712*' + scrubberResult.expectedReimbursement.toFixed(2) + '***11:B:1*Y*A*Y*Y~',
      'HI*ABK:C25.0*ABF:K86.1*ABF:Z85.07~',
      ...scrubberResult.lines.map((line) => {
        const modSegment = line.mod && line.mod !== 'None' ? `:${line.mod.replace(/[^A-Za-z0-9]/g, '')}` : '';
        return `SV1*HC:${line.code}${modSegment}*${line.fee.toFixed(2)}*UN*1***1:2~DTP*472*D8*20260905~`;
      }),
      'SE*' + (11 + scrubberResult.lines.length * 2) + '*0003~',
      'GE*1*103~',
      'IEA*1*000000103~',
    ].join('\n');
  }, [scrubberResult]);

  const handleCopyClaim = () => {
    navigator.clipboard.writeText(ansi837Snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      leadType: 'whipple_surgery_rcm_audit',
      contactName,
      contactEmail,
      practiceName,
      auditNotes,
      resectionType,
      vascularReconstruction,
      feedingJejunostomy,
      coSurgeonMode,
      totalRvu: scrubberResult.totalRvu,
      expectedReimbursement: scrubberResult.expectedReimbursement,
      penaltyAtRisk: scrubberResult.penaltyAtRisk,
      claimLines: scrubberResult.lines.map((l) => ({ code: l.code, fee: l.fee, status: l.status })),
      timestamp: new Date().toISOString(),
    };

    try {
      await sendLeadToKiran('whipple_surgery_rcm_audit', payload);
      trackConversion('whipple_rcm_audit_submit');
      setLeadSuccess(true);
      setTimeout(() => {
        setShowLeadModal(false);
        setLeadSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Audit lead transmission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Tool Header */}
      <div className="mb-8 text-center sm:text-left border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold uppercase tracking-wider">
            <Scissors className="w-3.5 h-3.5 text-amber-700" />
            Tool #58 • Complex Pancreatic Surgery &amp; HPB RCM
          </div>
          <span className="text-xs font-mono text-slate-500">CPT 48150-48155 • +35221 • +38747 • 44010</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-navy font-jakarta tracking-tight">
          Whipple Procedure &amp; Pancreatic Resection Scrubber
        </h2>
        <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-4xl">
          Model classic and pylorus-preserving Whipple pancreaticoduodenectomy, mesenteric/portal vein reconstruction add-ons (+35221), regional lymphadenectomy (+38747), and feeding jejunostomies (44010). Defend against aggressive commercial antrectomy downcoding and co-surgeon Modifier -62 audits.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Configurations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Box 1: Pancreatic Resection Scope */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-amber-600" />
              1. Pancreatic Resection Scope &amp; Gastric Margins
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Pancreatic Resection Procedure
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'whipple_classic', name: 'Classic Whipple w/ Antrectomy (48150)', desc: 'Partial gastrectomy + duodenectomy', rvu: '74.5 RVU • $5,680' },
                    { id: 'whipple_pylorus_preserving', name: 'Pylorus-Preserving PPPD (48153)', desc: 'Preserved pylorus + duodenojejunostomy', rvu: '68.2 RVU • $5,190' },
                    { id: 'total_pancreatectomy', name: 'Total Pancreatectomy (48155)', desc: 'Pancreas, duodenum & splenectomy', rvu: '76.8 RVU • $5,870' },
                    { id: 'distal_pancreatectomy', name: 'Distal Pancreatectomy (48140)', desc: 'Body/tail resection w/ spleen', rvu: '42.1 RVU • $3,210' },
                    { id: 'pancreaticojejunostomy', name: 'Puestow Procedure (48548)', desc: 'Longitudinal ductal decompression', rvu: '44.5 RVU • $3,390' },
                  ].map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setResectionType(res.id as any)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        resectionType === res.id
                          ? 'border-amber-600 bg-amber-50/70 text-navy ring-1 ring-amber-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-xs text-navy">{res.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{res.desc}</div>
                      <div className="text-[10px] font-mono font-semibold text-amber-800 mt-1">{res.rvu}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Downcoding Simulator Toggle */}
              {resectionType === 'whipple_classic' && (
                <label className="flex items-center justify-between p-3.5 bg-rose-50 rounded-lg border border-rose-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-rose-900">Simulate Payer Antrectomy Downcoding Audit</div>
                    <div className="text-[11px] text-rose-700 mt-0.5">
                      Test commercial auditor dropping 48150 down to pylorus-preserving 48153 (-$490 clawback).
                    </div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={simulateDowncode}
                      onChange={(e) => setSimulateDowncode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Box 2: Mesenteric / Portal Vein Vascular Reconstruction */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <GitBranch className="w-5 h-5 text-amber-600" />
              2. Mesenteric / Portal Vein Vascular Reconstruction
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Vascular Resection &amp; Anastomosis Add-On
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'smv_vein_graft', label: 'SMV Vein Graft (+35221)', desc: '22.4 RVU • $1,610' },
                    { id: 'portal_direct_anastomosis', label: 'Direct Repair (+35251)', desc: '18.2 RVU • $1,310' },
                    { id: 'none', label: 'No Vascular Repair', desc: 'Zero venous resection' },
                  ].map((vasc) => (
                    <button
                      key={vasc.id}
                      type="button"
                      onClick={() => setVascularReconstruction(vasc.id as any)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        vascularReconstruction === vasc.id
                          ? 'border-amber-600 bg-amber-50 text-navy font-semibold ring-1 ring-amber-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>{vasc.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{vasc.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {vascularReconstruction !== 'none' && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-amber-900">Simulate Vascular Add-On Bundling Denial</div>
                    <div className="text-[11px] text-amber-700">Test clearinghouse denying +35221 as integral to parenchymal resection</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simulateVascularBundle}
                      onChange={(e) => setSimulateVascularBundle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Box 3: Enteral Jejunostomy, Lymphadenectomy & Co-Surgery */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              3. Enteral Feeding Access, Lymph Nodes &amp; Co-Surgeons
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Co-Surgeon Mode (Modifier 62)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'solo', label: 'Solo Surgeon', desc: 'Single attending surgeon' },
                    { id: 'co_surgeon_compliant', label: 'Mod -62 Compliant', desc: 'Paired dictation (62.5%)' },
                    { id: 'co_surgeon_unpaired', label: 'Mod -62 Unpaired', desc: 'Simulate suspension' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCoSurgeonMode(c.id as any)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        coSurgeonMode === c.id
                          ? 'border-amber-600 bg-amber-50 text-navy font-semibold ring-1 ring-amber-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>{c.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-slate-800">Feeding Jejunostomy Tube Placement (44010)</div>
                    <div className="text-[11px] text-slate-500">Postoperative enteral hyperalimentation access</div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={feedingJejunostomy}
                      onChange={(e) => setFeedingJejunostomy(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </div>
                </label>

                {feedingJejunostomy && (
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 pl-6 cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-slate-800">Separate Abdominal Counter-Incision Documented</div>
                      <div className="text-[11px] text-slate-500">Distinct LUQ stab incision preventing NCCI primary bundle</div>
                    </div>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={separateStomaTract}
                        onChange={(e) => setSeparateStomaTract(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </div>
                  </label>
                )}

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-slate-800">Regional Retroperitoneal Lymphadenectomy (+38747)</div>
                    <div className="text-[11px] text-slate-500">Celiac, SMA, portal and hepatic nodal basin clearance</div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={includeLymphadenectomy}
                      onChange={(e) => setIncludeLymphadenectomy(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Findings & ANSI Stream */}
        <div className="lg:col-span-5 space-y-6">
          {/* Audit Metrics Card */}
          <div className="bg-navy text-white rounded-xl shadow-lg p-6 border border-navy-light">
            <div className="flex items-center justify-between border-b border-navy-light/60 pb-4 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Whipple Surgical Audit Metrics
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Zap className="w-3 h-3" />
                CMS NCCI Compliant
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-xs text-slate-300">Expected Reimbursement</div>
                <div className="text-2xl font-black text-white mt-1">
                  ${scrubberResult.expectedReimbursement.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  {scrubberResult.totalRvu} Total wRVUs
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-300">Clawback / Audit At Risk</div>
                <div className={`text-2xl font-black mt-1 ${scrubberResult.penaltyAtRisk > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ${scrubberResult.penaltyAtRisk.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {scrubberResult.penaltyAtRisk > 0 ? 'Documentation defense needed' : 'Clean claim verified'}
                </div>
              </div>
            </div>

            {/* Audit Findings */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Clinical Audit Findings ({scrubberResult.alerts.length})
              </div>
              {scrubberResult.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs ${
                    alert.type === 'fatal'
                      ? 'bg-rose-950/50 border-rose-600/50 text-rose-200'
                      : alert.type === 'warning'
                      ? 'bg-amber-950/50 border-amber-600/50 text-amber-200'
                      : 'bg-teal-950/40 border-teal-600/40 text-teal-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {alert.type === 'fatal' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    ) : alert.type === 'warning' ? (
                      <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    )}
                    <span>{alert.title}</span>
                  </div>
                  <p className="text-[11px] mt-1 text-slate-300 leading-relaxed">{alert.desc}</p>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">Ref: {alert.statute}</div>
                </div>
              ))}
            </div>

            {/* CTA to submit audit */}
            <button
              type="button"
              onClick={() => setShowLeadModal(true)}
              className="mt-6 w-full py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Request Pancreatic Surgery Claim Audit
            </button>
          </div>

          {/* Claim Lines Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-amber-600" />
                Scrubbed ANSI Claim Lines
              </span>
              <span className="text-[11px] font-mono text-slate-500">{scrubberResult.lines.length} service lines</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Code</th>
                    <th className="py-2.5 px-2 font-semibold">Mod</th>
                    <th className="py-2.5 px-2 font-semibold">wRVU</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Fee</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {scrubberResult.lines.map((line, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono font-bold text-navy">
                        {line.code}
                        <div className="text-[10px] text-slate-500 font-sans font-normal truncate max-w-[150px]">
                          {line.desc}
                        </div>
                      </td>
                      <td className="py-2 px-2 font-mono text-amber-700 font-semibold">{line.mod}</td>
                      <td className="py-2 px-2 font-mono">{line.rvu}</td>
                      <td className="py-2 px-3 font-mono text-right">${line.fee.toFixed(2)}</td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            line.status === 'clean'
                              ? 'bg-emerald-100 text-emerald-800'
                              : line.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {line.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* EDI 837P ANSI Preview */}
          <div className="bg-slate-900 rounded-xl p-4 text-slate-300 font-mono text-xs border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
              <span className="text-[11px] text-slate-400 font-sans font-semibold flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                ANSI X12 837P Professional Claim Snippet
              </span>
              <button
                type="button"
                onClick={handleCopyClaim}
                className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy EDI'}
              </button>
            </div>
            <pre className="overflow-x-auto text-[10px] leading-tight text-amber-300/90 whitespace-pre">
              {ansi837Snippet}
            </pre>
          </div>
        </div>
      </div>

      {/* Modal for Lead Submission */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-xl font-bold text-navy font-jakarta">
                  Request Pancreatic Surgery Claim Audit
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Route zero-PHI parameters directly to Kiran at Aethera Healthcare Solutions
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLeadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {leadSuccess ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-amber-600 mx-auto mb-3 animate-bounce" />
                <h4 className="text-lg font-bold text-navy">Audit Request Received</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Kiran will examine your pancreatic case billing profile and respond within 24 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g., Jonathan Reed, MD / Surgical Administrator"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="jreed@pancreatobiliarysurgeons.com"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Surgical Group or Hospital Department
                  </label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="e.g., Houston HPB & Surgical Oncology Institute"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Audit Notes (e.g. 48150 downcodings, vascular bundle denials, Modifier 62 suspensions)
                  </label>
                  <textarea
                    rows={3}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="Detail specific payer challenges or clawbacks..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Transmitting Audit Request...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Case Parameters
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Zero-PHI compliance. Protected by Aethera's enterprise data governance standard.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
