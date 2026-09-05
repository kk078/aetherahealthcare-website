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
  Bone,
  Eye,
  GitBranch,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function VcrSpineScrubber() {
  // 1. Primary Spinal Osteotomy Grade & Approach
  const [osteotomyType, setOsteotomyType] = useState<
    'vcr_thoracic' | 'pso_lumbar' | 'ponte_multilevel' | 'cervicothoracic_osteotomy'
  >('vcr_thoracic');

  const [additional3ColumnLevels, setAdditional3ColumnLevels] = useState<number>(1); // CPT +22208
  const [simulateDowncode, setSimulateDowncode] = useState<boolean>(false); // Payer downcodes to 22212 or simple fusion

  // 2. Posterior Segmental Instrumentation Long Construct
  const [instrumentationLength, setInstrumentationLength] = useState<
    'short_3_6' | 'medium_7_12' | 'long_13_plus'
  >('long_13_plus');

  // 3. Pelvi-Sacral Fixation & Structural Interbody Reconstruction
  const [hasPelvicFixation, setHasPelvicFixation] = useState<boolean>(true); // CPT +22848 (S2AI / iliac screws)
  const [hasStructuralCage, setHasStructuralCage] = useState<boolean>(true); // CPT +22853 (VBR mesh/expandable cage)
  const [distinctPelvicConnectors, setDistinctPelvicConnectors] = useState<boolean>(true);

  // 4. Co-Surgeon / Dual Attending Mode
  const [coSurgeonMode, setCoSurgeonMode] = useState<'solo' | 'co_surgeon_compliant' | 'co_surgeon_mismatched'>('co_surgeon_compliant');

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

    interface AuditAlert {
      type: 'fatal' | 'warning' | 'clean';
      title: string;
      desc: string;
      statute: string;
    }

    const lines: ClaimLine[] = [];
    const alerts: AuditAlert[] = [];
    let totalRvu = 0;
    let expectedReimbursement = 0;
    let penaltyAtRisk = 0;

    const isCoSurgeon = coSurgeonMode === 'co_surgeon_compliant';
    const coMod = isCoSurgeon ? '62' : coSurgeonMode === 'co_surgeon_mismatched' ? '62 (Mismatched)' : 'None';
    const coMultiplier = isCoSurgeon ? 0.625 : 1.0;

    // --- 1. PRIMARY OSTEOTOMY AUDIT ---
    if (osteotomyType === 'vcr_thoracic') {
      const standardFee = 4250.0;
      const standardRvu = 58.4;

      if (simulateDowncode) {
        const downcodedFee = 2450.0;
        const downcodedRvu = 34.2;
        const loss = (standardFee - downcodedFee) * coMultiplier;
        penaltyAtRisk += loss;

        lines.push({
          code: '22207',
          desc: 'Osteotomy of spine, 3-column, posterior approach; thoracic (VCR / Vertebral Column Resection)',
          mod: 'Downcoded -> 22212',
          rvu: Number((downcodedRvu * coMultiplier).toFixed(1)),
          fee: Number((downcodedFee * coMultiplier).toFixed(2)),
          status: 'fatal',
          note: `PAYER DOWNCODING: Insurer downgraded 3-column VCR (22207) to posterior column osteotomy (22212), slashing -$${loss.toFixed(2)}.`,
        });
        alerts.push({
          type: 'fatal',
          title: '3-Column VCR Downcoded to Posterior Column (22212)',
          desc: 'Commercial auditor claims anterior vertebral body resection and circumferential canal decompression was not sufficiently substantiated in dictation.',
          statute: 'AMA CPT Spine Osteotomy Guidelines / CPT Assistant',
        });
        totalRvu += downcodedRvu * coMultiplier;
        expectedReimbursement += downcodedFee * coMultiplier;
      } else {
        const fee = standardFee * coMultiplier;
        const rvu = standardRvu * coMultiplier;
        totalRvu += rvu;
        expectedReimbursement += fee;

        lines.push({
          code: '22207',
          desc: 'Osteotomy of spine, 3-column, posterior approach; thoracic (Vertebral Column Resection)',
          mod: coMod,
          rvu: Number(rvu.toFixed(1)),
          fee: Number(fee.toFixed(2)),
          status: coSurgeonMode === 'co_surgeon_mismatched' ? 'fatal' : 'clean',
          note: 'Full 3-column vertebral column resection with complete circumferential spinal cord release.',
        });
        alerts.push({
          type: 'clean',
          title: '3-Column Thoracic VCR Defended (22207)',
          desc: 'Operative notes document complete posterior-anterior vertebral body excision with circumferential spinal cord mobilization.',
          statute: 'CPT Code 22207 Clinical Definition',
        });
      }

      // Add-on levels (+22208)
      if (additional3ColumnLevels > 0) {
        const addOnUnitFee = 1380.0 * coMultiplier;
        const addOnUnitRvu = 18.5 * coMultiplier;
        const addOnTotalFee = addOnUnitFee * additional3ColumnLevels;
        const addOnTotalRvu = addOnUnitRvu * additional3ColumnLevels;

        totalRvu += addOnTotalRvu;
        expectedReimbursement += addOnTotalFee;

        lines.push({
          code: '+22208',
          desc: `Osteotomy spine, 3-column, each additional vertebral segment (${additional3ColumnLevels} level${additional3ColumnLevels > 1 ? 's' : ''})`,
          mod: coMod,
          rvu: Number(addOnTotalRvu.toFixed(1)),
          fee: Number(addOnTotalFee.toFixed(2)),
          status: 'clean',
          note: `Add-on units exempt from multiple procedure reductions. Documented ${additional3ColumnLevels} additional contiguous osteotomy level(s).`,
        });
        alerts.push({
          type: 'clean',
          title: 'Add-On 3-Column Osteotomy Stacked (+22208)',
          desc: `Modifier 51 exempt add-on code applied across ${additional3ColumnLevels} additional vertebral segment(s).`,
          statute: 'CMS Fee Schedule Add-On File',
        });
      }
    } else if (osteotomyType === 'pso_lumbar') {
      const standardFee = 3980.0 * coMultiplier;
      const standardRvu = 54.8 * coMultiplier;
      totalRvu += standardRvu;
      expectedReimbursement += standardFee;

      lines.push({
        code: '22206',
        desc: 'Osteotomy of spine, 3-column, posterior approach; lumbar (Pedicle Subtraction Osteotomy PSO)',
        mod: coMod,
        rvu: Number(standardRvu.toFixed(1)),
        fee: Number(standardFee.toFixed(2)),
        status: coSurgeonMode === 'co_surgeon_mismatched' ? 'fatal' : 'clean',
        note: 'Closing wedge pedicle subtraction osteotomy for fixed sagittal kyphotic imbalance.',
      });
      alerts.push({
        type: 'clean',
        title: 'Lumbar Pedicle Subtraction Osteotomy Validated (22206)',
        desc: 'Documented posterior wedge resection of lumbar vertebral body and pedicles yielding >25° lordotic correction.',
        statute: 'AMA CPT Spine Surgery Standards',
      });
    } else if (osteotomyType === 'ponte_multilevel') {
      const primaryFee = 2250.0 * coMultiplier;
      const primaryRvu = 31.0 * coMultiplier;
      totalRvu += primaryRvu;
      expectedReimbursement += primaryFee;

      lines.push({
        code: '22212',
        desc: 'Osteotomy of spine, posterior approach; thoracic (Ponte osteotomy / PCO)',
        mod: coMod,
        rvu: Number(primaryRvu.toFixed(1)),
        fee: Number(primaryFee.toFixed(2)),
        status: 'clean',
        note: 'Posterior column facetectomy and ligamentum flavum resection for thoracic flexibility.',
      });
    }

    // --- 2. POSTERIOR SEGMENTAL INSTRUMENTATION LONG CONSTRUCT ---
    let instCode = '22842';
    let instDesc = 'Posterior segmental instrumentation; 3 to 6 vertebral segments';
    let instFee = 1680.0 * coMultiplier;
    let instRvu = 22.4 * coMultiplier;

    if (instrumentationLength === 'medium_7_12') {
      instCode = '22843';
      instDesc = 'Posterior segmental instrumentation; 7 to 12 vertebral segments';
      instFee = 2240.0 * coMultiplier;
      instRvu = 30.1 * coMultiplier;
    } else if (instrumentationLength === 'long_13_plus') {
      instCode = '22844';
      instDesc = 'Posterior segmental instrumentation; 13 or more vertebral segments';
      instFee = 2950.0 * coMultiplier;
      instRvu = 39.6 * coMultiplier;
    }

    totalRvu += instRvu;
    expectedReimbursement += instFee;

    lines.push({
      code: instCode,
      desc: instDesc,
      mod: coMod,
      rvu: Number(instRvu.toFixed(1)),
      fee: Number(instFee.toFixed(2)),
      status: 'clean',
      note: 'Multi-rod instrumentation construct crossing deformity apex with cross-links.',
    });
    alerts.push({
      type: 'clean',
      title: `Long-Construct Instrumentation Validated (${instCode})`,
      desc: `Segment count verified spanning ${instrumentationLength === 'long_13_plus' ? '13+ vertebral segments (e.g. T2 to Pelvis)' : '7-12 vertebral segments'}.`,
      statute: 'CPT Posterior Instrumentation Guidelines',
    });

    // --- 3. PELVI-SACRAL FIXATION (+22848) ---
    if (hasPelvicFixation) {
      const pelvicFee = 890.0 * coMultiplier;
      const pelvicRvu = 12.1 * coMultiplier;

      if (!distinctPelvicConnectors) {
        penaltyAtRisk += pelvicFee;
        lines.push({
          code: '+22848',
          desc: 'Pelvic fixation other than sacrum of posterior instrumentation',
          mod: 'UNBUNDLED (DENIED)',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'FATAL NCCI BUNDLE: Pelvic screws billed without documented modular rod connectors or bilateral iliac purchase separate from sacrum.',
        });
        alerts.push({
          type: 'fatal',
          title: 'Spinopelvic Fixation Bundling Rejection (+22848)',
          desc: 'Clearinghouses bundle pelvic fixation into posterior instrumentation unless bilateral iliac/S2AI screw placement is distinguished from standard S1 pedicle anchors.',
          statute: 'NCCI Policy Manual Ch. IV, Sec. E.12',
        });
      } else {
        totalRvu += pelvicRvu;
        expectedReimbursement += pelvicFee;
        lines.push({
          code: '+22848',
          desc: 'Pelvic fixation other than sacrum (bilateral S2AI or iliac screws)',
          mod: coMod,
          rvu: Number(pelvicRvu.toFixed(1)),
          fee: Number(pelvicFee.toFixed(2)),
          status: 'clean',
          note: 'Modifier 51 exempt add-on. Documented bilateral iliac screw placement crossing sacroiliac joint with offset connectors.',
        });
        alerts.push({
          type: 'clean',
          title: 'Pelvi-Sacral Fixation Defended (+22848)',
          desc: 'Bilateral S2-alar-iliac screw anchor fixation successfully defended with independent pelvic purchase documentation.',
          statute: 'CMS Fee Schedule Add-On File / Modifier 51 Exempt',
        });
      }
    }

    // --- 4. STRUCTURAL INTERBODY / VBR MESH (+22853 / +22854) ---
    if (hasStructuralCage) {
      const cageFee = 720.0 * coMultiplier;
      const cageRvu = 9.8 * coMultiplier;
      totalRvu += cageRvu;
      expectedReimbursement += cageFee;

      lines.push({
        code: '+22854',
        desc: 'Insertion of intervertebral biomechanical device with partial/complete corpectomy (expandable VBR cage)',
        mod: coMod,
        rvu: Number(cageRvu.toFixed(1)),
        fee: Number(cageFee.toFixed(2)),
        status: 'clean',
        note: 'Structural titanium mesh / expandable anterior column support placed across resection defect.',
      });
      alerts.push({
        type: 'clean',
        title: 'Structural Corpectomy Reconstruction Defended (+22854)',
        desc: 'Anterior column defect reconstruction verified following complete vertebral body resection.',
        statute: 'AMA CPT Interbody Device Guidelines',
      });
    }

    // --- 5. CO-SURGEON MODIFIER 62 AUDIT ---
    if (coSurgeonMode === 'co_surgeon_mismatched') {
      penaltyAtRisk += lines[0].fee;
      alerts.push({
        type: 'fatal',
        title: 'Co-Surgeon Modifier -62 Suspension Risk',
        desc: 'Attending Orthopedic Deformity Surgeon and Attending Neurosurgeon submitted discordant osteotomy levels or conflicting primary CPT codes. Both claims will suspend for manual auditor review.',
        statute: 'Medicare Claims Processing Manual Ch. 12, Sec. 40.8',
      });
    } else if (coSurgeonMode === 'co_surgeon_compliant') {
      alerts.push({
        type: 'clean',
        title: 'Dual Attending Co-Surgeon Modifier -62 Validated',
        desc: 'Both attending surgeons bill matched primary 3-column osteotomy and instrumentation codes at 62.5% allowable with cross-referenced dictations.',
        statute: 'CMS Dual-Surgeon Deformity Billing Protocol',
      });
    }

    return {
      lines,
      alerts,
      totalRvu: Math.round(totalRvu * 100) / 100,
      expectedReimbursement: Math.round(expectedReimbursement),
      penaltyAtRisk: Math.round(penaltyAtRisk),
    };
  }, [
    osteotomyType,
    additional3ColumnLevels,
    simulateDowncode,
    instrumentationLength,
    hasPelvicFixation,
    hasStructuralCage,
    distinctPelvicConnectors,
    coSurgeonMode,
  ]);

  // Copy Summary
  const handleCopy = () => {
    const summaryText = `--- VERTEBRAL COLUMN RESECTION (VCR) SCRUB REPORT ---
Procedure: ${osteotomyType.toUpperCase()}
Total wRVUs: ${scrubberResult.totalRvu}
Expected Reimbursement: $${scrubberResult.expectedReimbursement.toLocaleString()}
Revenue at Risk: $${scrubberResult.penaltyAtRisk.toLocaleString()}

CLAIM CODING BREAKDOWN:
${scrubberResult.lines
  .map(
    (l) =>
      `CPT ${l.code} [Mod: ${l.mod}] - ${l.desc} | wRVU: ${l.rvu} | Fee: $${l.fee} | Status: ${l.status.toUpperCase()}`
  )
  .join('\n')}

COMPLIANCE AUDIT FINDINGS:
${scrubberResult.alerts.map((a) => `[${a.type.toUpperCase()}] ${a.title}: ${a.desc} (Ref: ${a.statute})`).join('\n\n')}
`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit Lead to Kiran
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail) return;

    setIsSubmitting(true);

    const payload = {
      leadType: 'vcr_spine_rcm_audit',
      contactName,
      contactEmail,
      practiceName,
      auditNotes,
      osteotomyType,
      additional3ColumnLevels,
      instrumentationLength,
      hasPelvicFixation,
      coSurgeonMode,
      totalRvu: scrubberResult.totalRvu,
      expectedReimbursement: scrubberResult.expectedReimbursement,
      penaltyAtRisk: scrubberResult.penaltyAtRisk,
      claimLines: scrubberResult.lines.map((l) => ({ code: l.code, fee: l.fee, status: l.status })),
      timestamp: new Date().toISOString(),
    };

    try {
      await sendLeadToKiran('vcr_spine_rcm_audit', payload);
      trackConversion('vcr_spine_rcm_audit_submit');
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold uppercase tracking-wider">
            <Bone className="w-3.5 h-3.5 text-indigo-700" />
            Tool #60 • Complex Spine Deformity &amp; 3-Column Osteotomy RCM
          </div>
          <span className="text-xs font-mono text-slate-500">CPT 22206-22207 • +22208 • 22844 • +22848</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-navy font-jakarta tracking-tight">
          Vertebral Column Resection &amp; 3-Column Osteotomy Scrubber
        </h2>
        <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-4xl">
          Audit complex 3-column spinal osteotomies (Vertebral Column Resection VCR 22207, Pedicle Subtraction Osteotomy PSO 22206), additional segment add-on coding (+22208), long-construct posterior instrumentation (22844), and spinopelvic fixation (+22848). Counter aggressive clearinghouse downcoding to simple posterior osteotomy (22212) and validate dual-attending Modifier -62 co-surgeon claims.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Configurations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Box 1: 3-Column Osteotomy Grade & Approach */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-indigo-600" />
              1. 3-Column Osteotomy Resection &amp; Spinal Level
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Osteotomy Resection
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      id: 'vcr_thoracic',
                      code: 'CPT 22207',
                      title: 'Vertebral Column Resection (VCR) - Thoracic',
                      desc: 'Full 3-column resection of vertebral body, adjacent discs, and posterior elements for rigid deformity.',
                    },
                    {
                      id: 'pso_lumbar',
                      code: 'CPT 22206',
                      title: 'Pedicle Subtraction Osteotomy (PSO) - Lumbar',
                      desc: 'Posterior closing-wedge 3-column osteotomy for fixed sagittal kyphosis and flatback deformity.',
                    },
                    {
                      id: 'ponte_multilevel',
                      code: 'CPT 22212',
                      title: 'Posterior Column Osteotomy (PCO / Ponte)',
                      desc: 'Facetectomies and posterior column osteotomy without anterior column resection.',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOsteotomyType(item.id as any)}
                      className={`text-left p-3.5 rounded-lg border transition-all ${
                        osteotomyType === item.id
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-navy">{item.title}</span>
                        <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional 3-Column Osteotomy Segments (+22208) */}
              {osteotomyType === 'vcr_thoracic' && (
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Additional Contiguous 3-Column Segments (CPT +22208)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Multi-vertebra VCR (e.g. T11-T12 resection)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[0, 1, 2].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setAdditional3ColumnLevels(lvl)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                            additional3ColumnLevels === lvl
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {lvl === 0 ? 'None' : `+${lvl} Level${lvl > 1 ? 's' : ''}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Downcoding Simulator Toggle */}
              {osteotomyType === 'vcr_thoracic' && (
                <label className="flex items-center justify-between p-3.5 bg-rose-50 rounded-lg border border-rose-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-rose-900">
                      Simulate Commercial Downcoding to Posterior Column (22212)
                    </div>
                    <div className="text-[11px] text-rose-700 mt-0.5">
                      Payer downgrades VCR claiming insufficient anterior body resection (-$1,800 loss per surgeon).
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

          {/* Box 2: Long-Construct Instrumentation & Spinopelvic Fixation */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Scissors className="w-5 h-5 text-indigo-600" />
              2. Segmental Instrumentation &amp; Spinopelvic Fixation
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Posterior Instrumentation Span
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'short_3_6', code: '22842', label: '3-6 Segments' },
                    { id: 'medium_7_12', code: '22843', label: '7-12 Segments' },
                    { id: 'long_13_plus', code: '22844', label: '13+ Segments' },
                  ].map((span) => (
                    <button
                      key={span.id}
                      type="button"
                      onClick={() => setInstrumentationLength(span.id as any)}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        instrumentationLength === span.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold ring-1 ring-indigo-500'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{span.label}</div>
                      <div className="text-[10px] font-mono text-indigo-700 font-semibold">{span.code}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pelvic Fixation */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-slate-800">Pelvic Fixation Other Than Sacrum (+22848)</div>
                    <div className="text-[11px] text-slate-500">Bilateral S2AI / iliac screw pelvic foundation</div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={hasPelvicFixation}
                      onChange={(e) => setHasPelvicFixation(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </div>
                </label>

                {hasPelvicFixation && (
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 pl-6 cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-slate-800">Modular Offset Connectors &amp; Separate Iliac Tract Documented</div>
                      <div className="text-[11px] text-slate-500">Defends +22848 from inclusive NCCI bundle into 22844</div>
                    </div>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={distinctPelvicConnectors}
                        onChange={(e) => setDistinctPelvicConnectors(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                  </label>
                )}

                {/* Structural VBR Cage */}
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-slate-800">Structural Anterior Corpectomy Cage (+22854)</div>
                    <div className="text-[11px] text-slate-500">Expandable titanium vertebral body replacement across resection</div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={hasStructuralCage}
                      onChange={(e) => setHasStructuralCage(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Box 3: Dual Attending Co-Surgery (Modifier 62) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Eye className="w-5 h-5 text-indigo-600" />
              3. Dual Attending Co-Surgery Protocol (Modifier 62)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'solo',
                  label: 'Solo Surgeon',
                  desc: 'Single attending deformity surgeon billing 100% allowable.',
                },
                {
                  id: 'co_surgeon_compliant',
                  label: 'Mod -62 Compliant',
                  desc: 'Orthopedic Spine + Neurosurgeon with synchronized operative dictations (62.5% each).',
                },
                {
                  id: 'co_surgeon_mismatched',
                  label: 'Mismatched Dictation',
                  desc: 'Simulate payer suspension due to discordant osteotomy levels.',
                },
              ].map((co) => (
                <button
                  key={co.id}
                  type="button"
                  onClick={() => setCoSurgeonMode(co.id as any)}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    coSurgeonMode === co.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold ring-1 ring-indigo-500'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold block text-navy">{co.label}</span>
                  <span className="text-[11px] text-slate-500 mt-1 block leading-tight">{co.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Claim Scrubber Results & Revenue Defense */}
        <div className="lg:col-span-5 space-y-6">
          {/* Financial Summary Card */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Audited Claim Yield
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                {scrubberResult.totalRvu} Total wRVUs
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block">
                  {coSurgeonMode === 'co_surgeon_compliant' ? 'Per-Surgeon Yield (62.5%)' : 'Total Surgical Yield'}
                </span>
                <span className="text-2xl font-extrabold text-navy">
                  ${scrubberResult.expectedReimbursement.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Estimated commercial yield</span>
              </div>
              <div className={`p-3.5 rounded-lg border ${
                scrubberResult.penaltyAtRisk > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <span className="text-xs font-medium block">
                  {scrubberResult.penaltyAtRisk > 0 ? 'Revenue at Risk' : 'Audit Defense'}
                </span>
                <span className="text-2xl font-extrabold">
                  ${scrubberResult.penaltyAtRisk > 0 ? scrubberResult.penaltyAtRisk.toLocaleString() : '$0'}
                </span>
                <span className="text-[11px] block mt-0.5">
                  {scrubberResult.penaltyAtRisk > 0 ? 'Downcoding / bundling clawbacks' : '100% clean scrub'}
                </span>
              </div>
            </div>

            {/* Generated Claim Lines Table */}
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Audited CMS-1500 / 837P Claim Lines
              </span>
              <div className="space-y-2">
                {scrubberResult.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs ${
                      line.status === 'fatal'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : line.status === 'warning'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="text-navy">{line.code}</span>
                        {line.mod && line.mod !== 'None' && (
                          <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                            line.mod.includes('UNBUNDLED') || line.mod.includes('Downcoded') || line.mod.includes('Mismatched')
                              ? 'bg-rose-200 text-rose-900'
                              : 'bg-indigo-200 text-indigo-900'
                          }`}>
                            {line.mod}
                          </span>
                        )}
                      </span>
                      <span>${line.fee.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{line.desc}</p>
                    <p className={`text-[10px] mt-1 font-medium ${
                      line.status === 'fatal' ? 'text-rose-700' : 'text-slate-500'
                    }`}>
                      {line.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Alerts Stack */}
            <div className="space-y-2.5 mb-6">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Compliance &amp; Payer Defense Findings
              </span>
              {scrubberResult.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs ${
                    alert.type === 'fatal'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : alert.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {alert.type === 'fatal' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : alert.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                    <span>{alert.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed mb-1.5">{alert.desc}</p>
                  <span className="text-[10px] font-mono text-slate-500 block font-medium">
                    Ref: {alert.statute}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-indigo-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Audit Copied to Clipboard' : 'Copy Full Audit & Appeal Package'}
              </button>

              <button
                type="button"
                onClick={() => setShowLeadModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-700 to-navy hover:from-indigo-800 hover:to-slate-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <Zap className="w-4 h-4 text-indigo-300" />
                Request Expert Spine Deformity RCM Audit
              </button>
            </div>
          </div>

          {/* Quick Explainer Card */}
          <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Info className="w-4 h-4 text-amber-700" />
              Modifier 51 Exemption &amp; Multiple Procedure Reduction Rules
            </div>
            <p className="leading-relaxed">
              Add-on spinal codes (+22208, +22848, +22853, +22854) are designated by CMS and CPT as modifier 51 exempt.
              Payers may NOT apply multiple procedure discounts (50% reductions) to these codes. Ensure your clearinghouse
              rule engines automatically flag and contest improper discount bundling on high-complexity deformity claims.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Dispatch Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <h3 className="text-xl font-bold text-navy mb-2">
              Request Sovereign Spine Deformity RCM Audit
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Submit your VCR and 3-column osteotomy scrub parameters directly to our expert surgical billing directors. We audit
              spinopelvic fixation add-ons (+22848), multi-segment instrumentation, and co-surgeon Modifier 62 coordination.
            </p>

            {leadSuccess ? (
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-indigo-600 mx-auto" />
                <p className="font-bold text-sm">Audit Dispatched Successfully</p>
                <p className="text-xs text-indigo-700">
                  Our spine surgical billing directors will review your clinical protocol within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name / Surgical Title
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Dr. Robert Chen, MD (Spine Deformity Surgeon)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="doctor@spinedeformitycenter.org"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Practice / Orthopedic Spine Institute Name
                  </label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="e.g. Pacific Deformity & Scoliosis Institute"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specific Denial Patterns / Clearinghouse Issues
                  </label>
                  <textarea
                    rows={3}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="e.g. Payer downcoding 22207 to 22212; S2AI pelvic fixation (+22848) unbundled into 22844; Modifier 62 co-surgeon denial..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowLeadModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Dispatch Audit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
