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
  Baby,
  Eye,
  GitBranch,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function PediatricTransplantScrubber() {
  // 1. Primary Transplant / Rehabilitation Modality
  const [procedureType, setProcedureType] = useState<
    'step_enteroplasty' | 'isolated_small_bowel' | 'combined_liver_intestine' | 'multivisceral_graft'
  >('combined_liver_intestine');

  // 2. Organ Acquisition Carve-Out Configuration
  const [organAcquisitionMode, setOrganAcquisitionMode] = useState<
    'institutional_cost_report' | 'improperly_billed_on_1500'
  >('institutional_cost_report');

  // 3. Back-Table Vascular Bench Reconstruction (+44720 / +44721)
  const [hasBenchArterialRecon, setHasBenchArterialRecon] = useState<boolean>(true); // CPT +44720
  const [hasBenchVenousRecon, setHasBenchVenousRecon] = useState<boolean>(true); // CPT +44721
  const [separateBenchDictation, setSeparateBenchDictation] = useState<boolean>(true);

  // 4. Clinical Medical Necessity & Investigational Defense (for STEP 44130)
  const [hasTpnDependence, setHasTpnDependence] = useState<boolean>(true);
  const [hasDocumentedClabsi, setHasDocumentedClabsi] = useState<boolean>(true);
  const [simulateExperimentalDenial, setSimulateExperimentalDenial] = useState<boolean>(false);

  // 5. Acute Rejection Critical Care Monitoring (99291)
  const [includeRejectionCriticalCare, setIncludeRejectionCriticalCare] = useState<boolean>(true);
  const [distinctImmunosuppressionTime, setDistinctImmunosuppressionTime] = useState<boolean>(true);

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

    // --- 1. PRIMARY RECONSTRUCTION / TRANSPLANT ---
    if (procedureType === 'step_enteroplasty') {
      const stepFee = 2480.0;
      const stepRvu = 34.6;

      if (simulateExperimentalDenial || (!hasTpnDependence && !hasDocumentedClabsi)) {
        penaltyAtRisk += stepFee;
        lines.push({
          code: '44130',
          desc: 'Intestinal length addition by enteroplasty (Serial Transverse Enteroplasty / STEP)',
          mod: 'DENIED (EXPERIMENTAL)',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'FATAL INVESTIGATIONAL DENIAL: Commercial payer rejected STEP procedure as experimental non-covered surgery.',
        });
        alerts.push({
          type: 'fatal',
          title: 'Commercial "Experimental / Investigational" Non-Coverage Denial',
          desc: 'Insurer policy categorized STEP enteroplasty as non-proven. Operative appeal must cite NASPGHAN & ACG pediatric short bowel syndrome guidelines.',
          statute: 'NASPGHAN Pediatric Intestinal Rehabilitation Standard',
        });
      } else {
        totalRvu += stepRvu;
        expectedReimbursement += stepFee;
        lines.push({
          code: '44130',
          desc: 'Intestinal length addition by enteroplasty (STEP procedure)',
          mod: 'None',
          rvu: stepRvu,
          fee: stepFee,
          status: 'clean',
          note: 'Autologous intestinal reconstruction verified with documented parenteral nutrition dependence.',
        });
        alerts.push({
          type: 'clean',
          title: 'STEP Enteroplasty Medical Necessity Substantiated (44130)',
          desc: 'Prior authorization substantiated: TPN dependence and recurrent line sepsis documented under ICD-10 K91.2 (short bowel syndrome).',
          statute: 'ACG Clinical Guideline: Short Bowel Syndrome Rehabilitation',
        });
      }
    } else if (procedureType === 'isolated_small_bowel') {
      const transplantFee = 5450.0;
      const transplantRvu = 72.4;
      totalRvu += transplantRvu;
      expectedReimbursement += transplantFee;

      lines.push({
        code: '44135',
        desc: 'Intestinal allotransplantation; heterotopic/orthotopic isolated small bowel',
        mod: 'None',
        rvu: transplantRvu,
        fee: transplantFee,
        status: 'clean',
        note: 'Primary recipient intestinal allotransplantation with vascular anastomoses.',
      });
      alerts.push({
        type: 'clean',
        title: 'Recipient Intestinal Allotransplantation Validated (44135)',
        desc: 'Transplant recipient surgical implantation verified. UNOS donor allocation ID cross-referenced on CMS-1500 box 19.',
        statute: 'OPTN / UNOS Pediatric Transplant Policy',
      });
    } else if (procedureType === 'combined_liver_intestine') {
      const intestineFee = 5450.0;
      const intestineRvu = 72.4;
      const liverFee = 6800.0 * 0.5; // Multiple surgery discount
      const liverRvu = 89.2 * 0.5;

      totalRvu += intestineRvu + liverRvu;
      expectedReimbursement += intestineFee + liverFee;

      lines.push({
        code: '44135',
        desc: 'Intestinal allotransplantation (composite recipient)',
        mod: 'None',
        rvu: intestineRvu,
        fee: intestineFee,
        status: 'clean',
        note: 'Primary small bowel allograft implantation.',
      });

      lines.push({
        code: '47135',
        desc: 'Liver allotransplantation, orthotopic, partial or whole, from cadaver or living donor',
        mod: '51',
        rvu: Number(liverRvu.toFixed(1)),
        fee: Number(liverFee.toFixed(2)),
        status: 'clean',
        note: 'Combined en-bloc composite liver implantation (paid at 50% multiple surgery reduction).',
      });

      alerts.push({
        type: 'clean',
        title: 'Composite Combined Liver-Intestinal Transplant Validated',
        desc: 'En-bloc graft implantation documented with dual venous outflow (caval and mesenteric) and biliary reconstruction.',
        statute: 'CMS Transplant Reimbursement Manual Ch. 12',
      });
    }

    // --- 2. ORGAN ACQUISITION COST CENTER AUDIT ---
    if (organAcquisitionMode === 'improperly_billed_on_1500') {
      penaltyAtRisk += 4200.0;
      lines.push({
        code: '44133',
        desc: 'Enterectomy, donor; cadaver donor graft procurement',
        mod: 'FATAL CONFLICT',
        rvu: 0,
        fee: 0,
        status: 'fatal',
        note: 'FATAL BILLING ERROR: Donor organ acquisition billed on recipient CMS-1500 claim. Must be cost-reported on Medicare Worksheet D-4.',
      });
      alerts.push({
        type: 'fatal',
        title: 'Organ Acquisition Cost Allocation Violation',
        desc: 'Donor procurement travel, cannulation, and graft excision cannot be billed under the recipient insurance ID. Must be reimbursed via hospital organ acquisition cost center (Form CMS-2552-10).',
        statute: 'CMS Medicare Provider Reimbursement Manual 15-1, §2805',
      });
    } else {
      alerts.push({
        type: 'clean',
        title: 'Organ Acquisition Compliance Verified',
        desc: 'Procurement costs properly routed to hospital organ acquisition cost center. Recipient claim isolated strictly to professional surgical implantation.',
        statute: 'CMS Transplant Cost Accounting Standard',
      });
    }

    // --- 3. BACK-TABLE VASCULAR BENCH RECONSTRUCTION ---
    if (hasBenchArterialRecon) {
      const artFee = 980.0;
      const artRvu = 12.8;

      if (!separateBenchDictation) {
        penaltyAtRisk += artFee;
        lines.push({
          code: '+44720',
          desc: 'Back-table reconstruction of cadaver or living donor arterial vascular bed',
          mod: 'UNBUNDLED (DENIED)',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'FATAL BUNDLING: Bench reconstruction denied as inclusive to primary transplant without distinct back-table operative note.',
        });
        alerts.push({
          type: 'fatal',
          title: 'Bench Vascular Reconstruction Unbundling Denial (+44720)',
          desc: 'Payer bundled back-table arterial conduits (interposition SMA graft) into recipient transplant due to lack of separate bench dictation.',
          statute: 'NCCI Policy Manual Ch. VII, Sec. D.4',
        });
      } else {
        totalRvu += artRvu;
        expectedReimbursement += artFee;
        lines.push({
          code: '+44720',
          desc: 'Back-table reconstruction of cadaver or living donor arterial vascular bed',
          mod: 'None',
          rvu: artRvu,
          fee: artFee,
          status: 'clean',
          note: 'Modifier 51 exempt. Documented bench arterial jump graft tailoring prior to recipient implantation.',
        });
        alerts.push({
          type: 'clean',
          title: 'Back-Table Arterial Reconstruction Defended (+44720)',
          desc: 'Distinct back-table operative record verified establishing donor vascular tailoring prior to cold ischemia termination.',
          statute: 'AMA CPT Back-Table Organ Preparation Guidelines',
        });
      }
    }

    if (hasBenchVenousRecon && separateBenchDictation) {
      const venFee = 920.0;
      const venRvu = 12.1;
      totalRvu += venRvu;
      expectedReimbursement += venFee;
      lines.push({
        code: '+44721',
        desc: 'Back-table reconstruction of cadaver or living donor venous vascular bed',
        mod: 'None',
        rvu: venRvu,
        fee: venFee,
        status: 'clean',
        note: 'Modifier 51 exempt. Documented portal/mesenteric venous branch venoplasty.',
      });
    }

    // --- 4. REJECTION CRITICAL CARE (99291) ---
    if (includeRejectionCriticalCare) {
      const critFee = 380.0;
      const critRvu = 5.2;

      if (!distinctImmunosuppressionTime) {
        penaltyAtRisk += critFee;
        lines.push({
          code: '99291',
          desc: 'Critical care, evaluation and management of critically ill pediatric patient; first 30-74 minutes',
          mod: 'GLOBAL SURGICAL BUNDLE',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'POSTOP BUNDLE DENIAL: Billed within 90-day global without Modifier 24 or documented hemodynamic instability separate from surgical recovery.',
        });
        alerts.push({
          type: 'fatal',
          title: 'Post-Transplant Critical Care Global Period Bundle',
          desc: 'Critical care denied as routine postoperative surgical care. Must append Modifier 24 and document immunosuppressive toxicity or septic shock.',
          statute: 'CMS Claims Processing Manual Ch. 12, Sec. 30.6.12',
        });
      } else {
        totalRvu += critRvu;
        expectedReimbursement += critFee;
        lines.push({
          code: '99291',
          desc: 'Critical care, first 30-74 minutes (acute allograft rejection crisis)',
          mod: '24',
          rvu: critRvu,
          fee: critFee,
          status: 'clean',
          note: 'Modifier 24 defended: Documented severe acute cellular rejection (ACR) requiring bedside hemodynamic stabilization.',
        });
        alerts.push({
          type: 'clean',
          title: 'Acute Allograft Rejection Critical Care Defended (Modifier 24)',
          desc: 'Intensive bedside care documented with continuous vasopressor titration and thymoglobulin infusion monitoring outside routine surgical recovery.',
          statute: 'CMS Global Surgical Modifier 24 Standard',
        });
      }
    }

    return {
      lines,
      alerts,
      totalRvu: Math.round(totalRvu * 100) / 100,
      expectedReimbursement: Math.round(expectedReimbursement),
      penaltyAtRisk: Math.round(penaltyAtRisk),
    };
  }, [
    procedureType,
    organAcquisitionMode,
    hasBenchArterialRecon,
    hasBenchVenousRecon,
    separateBenchDictation,
    hasTpnDependence,
    hasDocumentedClabsi,
    simulateExperimentalDenial,
    includeRejectionCriticalCare,
    distinctImmunosuppressionTime,
  ]);

  // Copy Summary
  const handleCopy = () => {
    const summaryText = `--- PEDIATRIC TRANSPLANT & INTESTINAL REHABILITATION SCRUB REPORT ---
Procedure: ${procedureType.toUpperCase()}
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
      leadType: 'pediatric_transplant_rcm_audit',
      contactName,
      contactEmail,
      practiceName,
      auditNotes,
      procedureType,
      organAcquisitionMode,
      hasBenchArterialRecon,
      includeRejectionCriticalCare,
      totalRvu: scrubberResult.totalRvu,
      expectedReimbursement: scrubberResult.expectedReimbursement,
      penaltyAtRisk: scrubberResult.penaltyAtRisk,
      claimLines: scrubberResult.lines.map((l) => ({ code: l.code, fee: l.fee, status: l.status })),
      timestamp: new Date().toISOString(),
    };

    try {
      await sendLeadToKiran('pediatric_transplant_rcm_audit', payload);
      trackConversion('pediatric_transplant_rcm_audit_submit');
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold uppercase tracking-wider">
            <Baby className="w-3.5 h-3.5 text-emerald-700" />
            Tool #61 • Pediatric Transplant &amp; Intestinal Rehab RCM
          </div>
          <span className="text-xs font-mono text-slate-500">CPT 44130 • 44135 • +44720 • 99291-24</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-navy font-jakarta tracking-tight">
          Pediatric Intestinal Rehabilitation &amp; Transplant Scrubber
        </h2>
        <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-4xl">
          Audit Serial Transverse Enteroplasty (STEP procedure 44130), isolated small bowel transplantation (44135), combined liver-intestine grafts, and back-table vascular reconstructions (+44720). Defend organ acquisition cost-center carving against illegal professional claim rejections, and protect acute allograft rejection critical care (99291-24) within global surgical periods.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Configurations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Box 1: Primary Reconstruction / Transplant Type */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-emerald-600" />
              1. Surgical Modality &amp; Intestinal Graft Scope
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Procedure Selection
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      id: 'combined_liver_intestine',
                      code: 'CPT 44135 + 47135',
                      title: 'Combined Composite Liver-Intestinal Transplant',
                      desc: 'En-bloc composite liver and small bowel transplantation for intestinal failure-associated liver disease.',
                    },
                    {
                      id: 'isolated_small_bowel',
                      code: 'CPT 44135',
                      title: 'Isolated Small Bowel Allotransplantation',
                      desc: 'Cadaver or living-donor intestinal transplantation with mesenteric vascular anastomoses.',
                    },
                    {
                      id: 'step_enteroplasty',
                      code: 'CPT 44130',
                      title: 'Serial Transverse Enteroplasty (STEP Procedure)',
                      desc: 'Autologous surgical lengthening and tapering of dilated small bowel for short bowel syndrome.',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProcedureType(item.id as any)}
                      className={`text-left p-3.5 rounded-lg border transition-all ${
                        procedureType === item.id
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-navy">{item.title}</span>
                        <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP Enteroplasty Prior Auth Safeguards */}
              {procedureType === 'step_enteroplasty' && (
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 block">
                    STEP Enteroplasty Medical Necessity Substantiation
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasTpnDependence}
                      onChange={(e) => setHasTpnDependence(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-700">Total Parenteral Nutrition (TPN) Dependence Documented</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDocumentedClabsi}
                      onChange={(e) => setHasDocumentedClabsi(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-700">Recurrent Catheter-Associated Bloodstream Infection (CLABSI)</span>
                  </label>

                  <label className="flex items-center justify-between p-2 rounded bg-rose-50 border border-rose-200 cursor-pointer mt-2">
                    <span className="text-xs font-semibold text-rose-900">
                      Simulate Payer &quot;Investigational / Experimental&quot; Exclusion Denial
                    </span>
                    <input
                      type="checkbox"
                      checked={simulateExperimentalDenial}
                      onChange={(e) => setSimulateExperimentalDenial(e.target.checked)}
                      className="h-4 w-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Box 2: Organ Acquisition Cost Allocation */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              2. Organ Acquisition Cost Center Carve-Out (Medicare Worksheet D-4)
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Configure how donor procurement and organ preservation expenses are billed to avoid fatal claim suspensions:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'institutional_cost_report',
                    title: 'Hospital Cost Report (Compliant)',
                    desc: 'Donor procurement, perfusion, and travel routed to Worksheet D-4 cost center.',
                  },
                  {
                    id: 'improperly_billed_on_1500',
                    title: 'Billed on CMS-1500 (Fatal Error)',
                    desc: 'Simulate rejection when donor enterectomy (44133) is billed under recipient ID.',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOrganAcquisitionMode(item.id as any)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      organAcquisitionMode === item.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs block text-navy">{item.title}</span>
                    <span className="text-[11px] text-slate-500 mt-1 block font-normal">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Box 3: Back-Table Vascular Bench Surgery */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Scissors className="w-5 h-5 text-emerald-600" />
              3. Back-Table Vascular Bench Surgery (+44720 / +44721)
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-slate-800">Bench Arterial Reconstruction (+44720)</div>
                  <div className="text-[11px] text-slate-500">SMA arterial jump conduit tailoring on donor back-table</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={hasBenchArterialRecon}
                    onChange={(e) => setHasBenchArterialRecon(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-slate-800">Bench Venous Reconstruction (+44721)</div>
                  <div className="text-[11px] text-slate-500">Portal vein extension or mesenteric venoplasty</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={hasBenchVenousRecon}
                    onChange={(e) => setHasBenchVenousRecon(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 pl-6 cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-slate-800">Distinct Back-Table Operative Dictation in Chart</div>
                  <div className="text-[11px] text-slate-500">Prevents NCCI bundle into recipient implantation code</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={separateBenchDictation}
                    onChange={(e) => setSeparateBenchDictation(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </div>
              </label>
            </div>
          </div>

          {/* Box 4: Acute Rejection Critical Care (99291-24) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Activity className="w-5 h-5 text-emerald-600" />
              4. Acute Allograft Rejection Critical Care (Modifier 24)
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-slate-800">Bedside Rejection Crisis Critical Care (99291)</div>
                  <div className="text-[11px] text-slate-500">Evaluation and management of acute graft rejection in PICU</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={includeRejectionCriticalCare}
                    onChange={(e) => setIncludeRejectionCriticalCare(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </div>
              </label>

              {includeRejectionCriticalCare && (
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 pl-6 cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-slate-800">Append Modifier -24 &amp; Document Organ Toxicity</div>
                    <div className="text-[11px] text-slate-500">Carves out service from 90-day surgical global period</div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={distinctImmunosuppressionTime}
                      onChange={(e) => setDistinctImmunosuppressionTime(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </div>
                </label>
              )}
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
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {scrubberResult.totalRvu} Total wRVUs
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block">Compliant Yield</span>
                <span className="text-2xl font-extrabold text-navy">
                  ${scrubberResult.expectedReimbursement.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Professional surgical allowance</span>
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
                  {scrubberResult.penaltyAtRisk > 0 ? 'Denials / recoupment risk' : '100% clean scrub'}
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
                            line.mod.includes('DENIED') || line.mod.includes('CONFLICT') || line.mod.includes('BUNDLE')
                              ? 'bg-rose-200 text-rose-900'
                              : 'bg-emerald-200 text-emerald-900'
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
                      : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {alert.type === 'fatal' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : alert.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Audit Copied to Clipboard' : 'Copy Full Audit & Appeal Package'}
              </button>

              <button
                type="button"
                onClick={() => setShowLeadModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <Zap className="w-4 h-4 text-emerald-300" />
                Request Expert Transplant RCM Audit
              </button>
            </div>
          </div>

          {/* Quick Explainer Card */}
          <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Info className="w-4 h-4 text-amber-700" />
              Medicare Cost Report Worksheet D-4 Rules
            </div>
            <p className="leading-relaxed">
              Organ procurement organization (OPO) fees, donor surgical procurement team travel, perfusion solutions,
              and donor HLA histocompatibility testing are legally mandated to pass through hospital organ acquisition
              cost centers. Never permit billing coordinators to place these expenses on professional CMS-1500 claims,
              which causes automated rejection and triggers federal compliance audits.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Dispatch Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <h3 className="text-xl font-bold text-navy mb-2">
              Request Sovereign Pediatric Transplant RCM Audit
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Submit your pediatric intestinal rehabilitation or transplant scrub parameters directly to our senior billing specialists. We verify
              organ acquisition cost carving, STEP prior auth defense, back-table bench surgery (+44720), and Modifier 24 critical care.
            </p>

            {leadSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">Audit Dispatched Successfully</p>
                <p className="text-xs text-emerald-700">
                  Our transplant surgical billing directors will review your clinical protocol within 2 business hours.
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
                    placeholder="e.g. Dr. Laura Gomez, MD (Pediatric Transplant Surgery)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
                    placeholder="doctor@pediatrictransplantcenter.org"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Children&apos;s Hospital / Transplant Center Name
                  </label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="e.g. Children&apos;s Hospital Intestinal Rehabilitation Program"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
                    placeholder="e.g. Payer rejected STEP enteroplasty as experimental; clearinghouse bundled +44720 bench reconstruction into 44135; organ acquisition cost confusion..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
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
