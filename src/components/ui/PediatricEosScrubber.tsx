'use client';

import React, { useState, useMemo } from 'react';
import {
  Bone,
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
  Activity,
  GitBranch,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function PediatricEosScrubber() {
  // 1. Construct Strategy & Encounter Phase
  const [constructType, setConstructType] = useState<
    'mcgr_primary' | 'traditional_rods' | 'veptr_rib' | 'staged_surgical_distraction' | 'mcgr_clinic_lengthening'
  >('mcgr_primary');

  // 2. Staged Procedure Modifier -58 (for surgical distractions & revisions)
  const [hasModifier58Staged, setHasModifier58Staged] = useState<boolean>(true);
  const [hasPlannedStagedPlanDoc, setHasPlannedStagedPlanDoc] = useState<boolean>(true);

  // 3. Rib Anchor / Pelvic Fixation (+22848)
  const [hasPelvicOrRibAnchors, setHasPelvicOrRibAnchors] = useState<boolean>(true);
  const [distinctAnchorSiteDoc, setDistinctAnchorSiteDoc] = useState<boolean>(true);

  // 4. Concomitant Ponte Posterior Column Osteotomy (22212)
  const [hasPonteOsteotomy, setHasPonteOsteotomy] = useState<boolean>(false);
  const [hasModifier51Osteotomy, setHasModifier51Osteotomy] = useState<boolean>(true);

  // 5. Outpatient MCGR Non-Invasive Lengthening Protocol (99214 + 72082)
  const [hasDetailedMdmExam, setHasDetailedMdmExam] = useState<boolean>(true);
  const [hasExpansionTelemetryDoc, setHasExpansionTelemetryDoc] = useState<boolean>(true);

  // 6. Continuous Intraoperative Neuromonitoring (IONM 95940)
  const [hasIonmMonitoring, setHasIonmMonitoring] = useState<boolean>(true);
  const [dedicatedNeurophysiologist, setDedicatedNeurophysiologist] = useState<boolean>(true);

  // UI & Lead Modal States
  const [copied, setCopied] = useState<boolean>(false);
  const [showLeadModal, setShowLeadModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [leadSuccess, setLeadSuccess] = useState<boolean>(false);

  // Lead Form Fields
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

    // --- 1. CONSTRUCT STRATEGY & PRIMARY INTERVENTION ---
    if (constructType === 'mcgr_primary') {
      const baseRvu = 12.8;
      const baseFee = 1650.0;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: '22842',
        desc: 'Posterior segmental instrumentation (e.g., pedicle fixation, dual rod construct); 7 to 12 vertebral segments (MCGR MAGEC rods)',
        mod: 'None',
        rvu: baseRvu,
        fee: baseFee,
        status: 'clean',
        note: 'Index implantation: Dual magnetically controlled growing rods spanning thoracic curve with proximal and distal foundation anchors.',
      });

      alerts.push({
        type: 'clean',
        title: 'MCGR Implantation (22842) Segment Tier Verified',
        desc: 'Posterior segmental instrumentation spanning 7 to 12 levels meets CPT 22842 requirements. Defends against commercial payer downcoding to non-segmental wiring.',
        statute: 'SRS Pediatric Spine Coding Guide; AMA CPT Guidelines',
      });
    } else if (constructType === 'traditional_rods') {
      const baseRvu = 12.8;
      const baseFee = 1650.0;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: '22842',
        desc: 'Posterior segmental instrumentation, 7 to 12 vertebral segments (traditional dual growing rods with tandem connectors)',
        mod: 'None',
        rvu: baseRvu,
        fee: baseFee,
        status: 'clean',
        note: 'Index traditional growing construct: Dual stainless steel/titanium rods with end-to-end or domino connectors.',
      });
    } else if (constructType === 'veptr_rib') {
      const baseRvu = 12.8;
      const baseFee = 1650.0;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: '22842',
        desc: 'Posterior segmental instrumentation, 7 to 12 segments (VEPTR rib-to-spine/rib-to-rib construct)',
        mod: 'None',
        rvu: baseRvu,
        fee: baseFee,
        status: 'clean',
        note: 'VEPTR implantation for thoracic insufficiency syndrome (TIS) with rib cradles and caudal hooks.',
      });
    } else if (constructType === 'staged_surgical_distraction') {
      const distractRvu = 14.2;
      const distractFee = 1380.0;
      totalRvu += distractRvu;
      expectedReimbursement += distractFee;

      if (hasModifier58Staged && hasPlannedStagedPlanDoc) {
        lines.push({
          code: '22849',
          desc: 'Reinsertion of spinal fixation instrumentation / surgical distraction of growing rod construct',
          mod: '58',
          rvu: distractRvu,
          fee: distractFee,
          status: 'clean',
          note: 'Clean staged distraction: Modifier -58 appended. Open exposure of domino connectors, lengthening by 1.5 cm, and re-tightening lock screws.',
        });

        alerts.push({
          type: 'clean',
          title: 'Staged Surgical Distraction (+22849-58) Validated',
          desc: 'Modifier -58 protects 6-month planned surgical lengthenings from 90-day global surgery post-op bundling denials from prior spine procedures.',
          statute: 'CMS Claims Processing Manual Ch. 12 Section 40.1; Modifier 58 Rules',
        });
      } else {
        penaltyAtRisk += distractFee;

        lines.push({
          code: '22849',
          desc: 'Reinsertion of spinal fixation instrumentation',
          mod: 'None',
          rvu: distractRvu,
          fee: distractFee,
          status: 'fatal',
          note: 'FATAL GLOBAL PERIOD BUNDLING: Billed without Modifier -58. Payers will reject as inclusive of index surgery 90-day global period.',
        });

        alerts.push({
          type: 'fatal',
          title: 'Missing Staged Modifier -58 on Growing Rod Distraction',
          desc: 'Payers reject surgical growing rod lengthenings unless submitted with Modifier -58 and backed by initial operative notes documenting serial staged intervals.',
          statute: 'CMS NCCI Policy Manual Ch. IV Section G; CARC 97 Rejection',
        });
      }
    } else {
      // mcgr_clinic_lengthening
      const emRvu = 2.8;
      const emFee = 240.0;
      const xrayRvu = 1.1;
      const xrayFee = 95.0;

      if (hasDetailedMdmExam && hasExpansionTelemetryDoc) {
        totalRvu += emRvu + xrayRvu;
        expectedReimbursement += emFee + xrayFee;

        lines.push({
          code: '99214',
          desc: 'Office or other outpatient visit, established patient, high complexity MDM (neurologic exam & magnetic distraction protocol)',
          mod: '25',
          rvu: emRvu,
          fee: emFee,
          status: 'clean',
          note: 'Clean E/M: Detailed neurological evaluation of spinal cord function, motor/sensory exam, and external remote controller (ERC) rod expansion.',
        });

        lines.push({
          code: '72082',
          desc: 'Radiologic examination, spine, entire thoracic and lumbar, including skull, cervical and sacral spine; 2 or 3 views (standing EOS/X-ray)',
          mod: 'None',
          rvu: xrayRvu,
          fee: xrayFee,
          status: 'clean',
          note: 'Pre- and post-lengthening radiographic verification measuring rod actuator expansion gap and curve correction.',
        });

        alerts.push({
          type: 'clean',
          title: 'Outpatient MCGR Distraction Clinic Coding Compliant',
          desc: 'Non-invasive external magnetic distraction lacks a dedicated CPT code. Compliant billing relies on 99214-25 supported by documented neurologic examination and 72082 radiographs.',
          statute: 'SRS/AAOS Coding Guidance for Magnetically Controlled Growing Rods',
        });
      } else {
        totalRvu += emRvu + xrayRvu;
        penaltyAtRisk += emFee;

        lines.push({
          code: '99214',
          desc: 'Office visit, established patient',
          mod: 'None',
          rvu: emRvu,
          fee: emFee,
          status: 'warning',
          note: 'DOWNCODING CLAWBACK RISK: Lacks comprehensive neurological exam or explicit millimeter expansion metrics; payers will downcode to 99212/99213.',
        });

        alerts.push({
          type: 'warning',
          title: 'MCGR Distraction Clinic E/M Downcoding Risk',
          desc: 'Commercial payers audit 99214 for MCGR lengthenings. Note must detail lower extremity reflexes, gait, actuator magnet alignment, and measured distraction (e.g., 3.0 mm).',
          statute: 'AMA CPT Evaluation and Management Guidelines 2024',
        });
      }
    }

    // --- 2. RIB ANCHOR / PELVIC FIXATION ADD-ON (+22848) ---
    if (
      (constructType === 'mcgr_primary' ||
        constructType === 'traditional_rods' ||
        constructType === 'veptr_rib') &&
      hasPelvicOrRibAnchors
    ) {
      const anchorRvu = 5.5;
      const anchorFee = 510.0;

      if (distinctAnchorSiteDoc) {
        totalRvu += anchorRvu;
        expectedReimbursement += anchorFee;

        lines.push({
          code: '+22848',
          desc: 'Pelvic fixation other than sacrum (e.g., iliac/S2AI screws) or rib fixation (e.g., VEPTR rib cradles and thoracic foundation)',
          mod: 'Add-on',
          rvu: anchorRvu,
          fee: anchorFee,
          status: 'clean',
          note: 'Clean add-on: Proximal rib cradle anchors or distal S2-alar-iliac (S2AI) pelvic screws documented as distinct non-sacral fixation.',
        });

        alerts.push({
          type: 'clean',
          title: 'Pelvic/Rib Fixation Add-On (+22848) Defended',
          desc: 'Add-on +22848 is fully payable with primary posterior instrumentation (22842) when stabilizing ribs (VEPTR) or the pelvis in neuromusclar EOS.',
          statute: 'CPT Assistant; CMS NCCI Policy Manual Ch. IV Section G',
        });
      } else {
        penaltyAtRisk += anchorFee;

        lines.push({
          code: '+22848',
          desc: 'Pelvic fixation other than sacrum',
          mod: 'Add-on',
          rvu: anchorRvu,
          fee: anchorFee,
          status: 'warning',
          note: 'UNBUNDLING DENIAL: Lacks explicit documentation of distinct rib cradles or iliac wing purchase; payer bundled into 22842.',
        });

        alerts.push({
          type: 'warning',
          title: 'Rib/Pelvic Fixation Add-On Unbundling Warning',
          desc: 'Payers reject +22848 unless operative report describes independent exposure, fluoroscopic trajectory, and hardware sizing in ribs or ilium.',
          statute: 'CMS NCCI Edits Policy Manual Ch. IV Section G',
        });
      }
    }

    // --- 3. PONTE POSTERIOR COLUMN OSTEOTOMY (22212) ---
    if (
      (constructType === 'mcgr_primary' ||
        constructType === 'traditional_rods' ||
        constructType === 'veptr_rib') &&
      hasPonteOsteotomy
    ) {
      const ponteRvu = 24.5 * 0.5; // 50% multiple procedure reduction
      const ponteFee = 2280.0 * 0.5;

      if (hasModifier51Osteotomy) {
        totalRvu += ponteRvu;
        expectedReimbursement += ponteFee;

        lines.push({
          code: '22212',
          desc: 'Osteotomy of spine, posterior approach, 1 vertebral segment; thoracic (Ponte posterior column osteotomy)',
          mod: '51',
          rvu: ponteRvu,
          fee: ponteFee,
          status: 'clean',
          note: 'Clean osteotomy: Complete facetectomy, spinous process resection, and flavum release for severe rigid curve mobilization with Modifier -51.',
        });

        alerts.push({
          type: 'clean',
          title: 'Ponte Osteotomy (22212-51) Validated',
          desc: 'Posterior column osteotomy is separately reportable from growing construct instrumentation when performed to correct rigid angular deformity.',
          statute: 'Scoliosis Research Society Coding Guidelines; CPT Assistant',
        });
      } else {
        totalRvu += ponteRvu;
        penaltyAtRisk += ponteFee;

        lines.push({
          code: '22212',
          desc: 'Osteotomy of spine, posterior approach',
          mod: 'None',
          rvu: ponteRvu,
          fee: ponteFee,
          status: 'fatal',
          note: 'MISSING MODIFIER 51: Secondary major spine procedure billed without multiple procedure modifier; claims clearinghouse rejection.',
        });

        alerts.push({
          type: 'fatal',
          title: 'Missing Multiple Procedure Modifier -51 on Osteotomy',
          desc: 'Ponte osteotomy performed alongside spinal instrumentation requires Modifier -51 to avoid immediate clearinghouse rejection.',
          statute: 'CMS Multiple Procedure Payment Reduction (MPPR) Rules',
        });
      }
    }

    // --- 4. INTRAOPERATIVE NEUROMONITORING (IONM 95940) ---
    if (
      (constructType === 'mcgr_primary' ||
        constructType === 'traditional_rods' ||
        constructType === 'veptr_rib' ||
        constructType === 'staged_surgical_distraction') &&
      hasIonmMonitoring
    ) {
      const ionmRvu = 7.6;
      const ionmFee = 780.0;

      if (dedicatedNeurophysiologist) {
        totalRvu += ionmRvu;
        expectedReimbursement += ionmFee;

        lines.push({
          code: '95940 x16',
          desc: 'Continuous intraoperative neurophysiology monitoring (15-min increments, 4 hours: MEP, SSEP, and free-run EMG)',
          mod: 'None',
          rvu: ionmRvu,
          fee: ionmFee,
          status: 'clean',
          note: 'Clean IONM: Real-time spinal cord transcranial motor evoked potentials and SSEPs monitored by dedicated neurophysiologist.',
        });
      } else {
        penaltyAtRisk += ionmFee;

        lines.push({
          code: '95940 x16',
          desc: 'Continuous intraoperative neurophysiology monitoring',
          mod: 'None',
          rvu: ionmRvu,
          fee: ionmFee,
          status: 'fatal',
          note: 'PROHIBITED SURGEON BILLING: Primary operating spine surgeon attempted to bill IONM. Prohibited under CMS NCCI rules.',
        });

        alerts.push({
          type: 'fatal',
          title: 'Primary Spine Surgeon IONM Prohibition',
          desc: 'Under CMS NCCI rules, the operating spine surgeon cannot bill continuous IONM (95940). Must be billed independently by a dedicated clinical neurophysiologist.',
          statute: 'CMS Medlearn Matters MM8050; NCCI Chapter XI Section H',
        });
      }
    }

    return {
      lines,
      alerts,
      totalRvu,
      expectedReimbursement,
      penaltyAtRisk,
    };
  }, [
    constructType,
    hasModifier58Staged,
    hasPlannedStagedPlanDoc,
    hasPelvicOrRibAnchors,
    distinctAnchorSiteDoc,
    hasPonteOsteotomy,
    hasModifier51Osteotomy,
    hasDetailedMdmExam,
    hasExpansionTelemetryDoc,
    hasIonmMonitoring,
    dedicatedNeurophysiologist,
  ]);

  // ANSI 837P EDI Generator
  const generateEdiClaim = () => {
    const claimDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let edi = `ISA*00*          *00*          *ZZ*SUBMITTER      *ZZ*PAYER          *${claimDate.slice(2)}*1200*^*00501*000000001*0*P*:~\n`;
    edi += `GS*HC*SUBMITTER*PAYER*${claimDate}*1200*1*X*005010X222A1~\n`;
    edi += `ST*837*0001*005010X222A1~\n`;
    edi += `BHT*0019*00*REF${claimDate}*${claimDate}*1200*CH~\n`;
    edi += `NM1*85*2*PEDIATRIC SPINE & SCOLIOSIS CENTER*****XX*1966666663~\n`;
    edi += `NM1*IL*1*LUCAS*NOAH****MI*EOS9938210~\n`;
    edi += `CLM*EOS-${claimDate}*${scrubberResult.expectedReimbursement.toFixed(2)}***11:B:1*Y*A*Y*Y~\n`;

    scrubberResult.lines.forEach((l, idx) => {
      const cleanMod = l.mod.replace(/[^0-9A-Z]/g, '');
      const modSegment = cleanMod && cleanMod !== 'None' && cleanMod !== 'Addon' ? `:${cleanMod}` : '';
      edi += `LX*${idx + 1}~\n`;
      edi += `SV1*HC:${l.code.split(' ')[0].replace('+', '')}${modSegment}*${l.fee.toFixed(2)}*UN*1***1~\n`;
      edi += `DTP*472*D8*${claimDate}~\n`;
    });

    edi += `SE*${7 + scrubberResult.lines.length * 3}*0001~\n`;
    edi += `GE*1*1~\n`;
    edi += `IEA*1*000000001~`;
    return edi;
  };

  const handleCopyEdi = () => {
    navigator.clipboard.writeText(generateEdiClaim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        constructType,
        hasModifier58Staged,
        hasPlannedStagedPlanDoc,
        hasPelvicOrRibAnchors,
        distinctAnchorSiteDoc,
        hasPonteOsteotomy,
        hasDetailedMdmExam,
        hasIonmMonitoring,
        expectedReimbursement: scrubberResult.expectedReimbursement,
        penaltyAtRisk: scrubberResult.penaltyAtRisk,
        totalRvu: scrubberResult.totalRvu,
        contactName,
        contactEmail,
        practiceName,
        auditNotes,
      };

      await sendLeadToKiran('pediatric_eos_rcm_audit', payload);
      trackConversion('calculator', scrubberResult.penaltyAtRisk);

      setLeadSuccess(true);
      setTimeout(() => {
        setShowLeadModal(false);
        setLeadSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Lead submission failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 font-inter text-slate-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-emerald-900/40 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <Bone className="h-3.5 w-3.5" />
              <span>Tool #68 · Pediatric Early-Onset Scoliosis (EOS) Scrubber</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pediatric Early-Onset Scoliosis (EOS) &amp; Growing Rod Scrubber
            </h2>
            <p className="text-emerald-100/80 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
              Audit magnetically controlled growing rods (MCGR), VEPTR rib-to-spine distraction, staged surgical
              lengthenings with Modifier -58, pelvic foundation anchors (+22848), and outpatient magnetic distraction clinics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLeadModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Send className="h-4 w-4" />
              <span>Request EOS RCM Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Total Work RVUs</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {scrubberResult.totalRvu.toFixed(2)}{' '}
            <span className="text-sm font-semibold text-slate-500">wRVUs</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Estimated physician effort units</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Expected Reimbursement</span>
            <ShieldCheck className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-600">
            ${scrubberResult.expectedReimbursement.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Clean claim modeled commercial rate</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            <span>At-Risk Revenue</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            ${scrubberResult.penaltyAtRisk.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Clawbacks from missing Mod 58 &amp; downcoding</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Claim Compliance Status</span>
            <Zap className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold">
            {scrubberResult.penaltyAtRisk === 0 ? (
              <span className="text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="h-5 w-5" /> 100% Clean Claim
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1.5">
                <AlertTriangle className="h-5 w-5" /> Action Required
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {scrubberResult.lines.length} billable service lines scrubbed
          </div>
        </div>
      </div>

      {/* Main Interactive Controls & Audit Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical & Clinical Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Construct Strategy & Encounter Phase */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Bone className="h-5 w-5 text-emerald-600" />
              1. Growth-Friendly Construct Strategy &amp; Phase
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  id: 'mcgr_primary',
                  title: 'MCGR Primary Implantation (CPT 22842)',
                  desc: 'Magnetically controlled growing rods (MAGEC) 7-12 segments with foundation anchors. (12.80 wRVU)',
                },
                {
                  id: 'traditional_rods',
                  title: 'Traditional Dual Growing Rods (CPT 22842)',
                  desc: 'Stainless steel/titanium growing constructs requiring 6-month surgical distraction intervals. (12.80 wRVU)',
                },
                {
                  id: 'veptr_rib',
                  title: 'VEPTR Implantation for Thoracic Insufficiency (CPT 22842 + 22848)',
                  desc: 'Rib-to-spine or rib-to-rib expansion thoracoplasty with expandable titanium ribs. (18.30 wRVU)',
                },
                {
                  id: 'staged_surgical_distraction',
                  title: 'Staged Surgical Rod Lengthening / Exchange (CPT 22849-58)',
                  desc: 'Inpatient operative lengthening or connector exchange requiring staged Modifier -58. (14.20 wRVU)',
                },
                {
                  id: 'mcgr_clinic_lengthening',
                  title: 'Outpatient Non-Invasive MCGR Distraction Clinic (99214-25 + 72082)',
                  desc: 'External remote controller (ERC) magnetic expansion with EOS radiograph protocol. (3.90 wRVU)',
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    constructType === item.id
                      ? 'border-emerald-500 bg-emerald-50/50 text-slate-900 shadow-sm ring-1 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="constructType"
                      checked={constructType === item.id}
                      onChange={() => setConstructType(item.id as any)}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-semibold text-sm">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section 2: Staged Procedure Modifier -58 Defense (if surgical distraction) */}
          {constructType === 'staged_surgical_distraction' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-600" />
                2. Staged Procedure Modifier -58 Defense
              </h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasModifier58Staged}
                    onChange={(e) => setHasModifier58Staged(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-800">
                      Append Modifier -58 (Staged Procedure) to Surgical Lengthening (22849-58)
                    </span>
                    <p className="text-xs text-slate-500">
                      Exempts planned serial distraction from the 90-day global surgery post-op period of index instrumentation.
                    </p>
                  </div>
                </label>

                <div className="pl-6 border-l-2 border-teal-200 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPlannedStagedPlanDoc}
                      onChange={(e) => setHasPlannedStagedPlanDoc(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>
                      Index operative note documented that 6-month serial distractions are a planned staged component
                    </span>
                  </label>
                  {(!hasModifier58Staged || !hasPlannedStagedPlanDoc) && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      Fatal: Without Modifier -58 and prior plan documentation, commercial payers deny the entire $1,380.00 lengthening claim as post-op global care.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Outpatient MCGR Distraction Compliance (if clinic visit) */}
          {constructType === 'mcgr_clinic_lengthening' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                2. Outpatient Magnetic Distraction Compliance
              </h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDetailedMdmExam}
                    onChange={(e) => setHasDetailedMdmExam(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-800">
                      Comprehensive Neurologic Examination &amp; High-Complexity MDM (99214)
                    </span>
                    <p className="text-xs text-slate-500">
                      Detailed assessment of spinal cord integrity, deep tendon reflexes, clonus, and motor exam in growing spine.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasExpansionTelemetryDoc}
                    onChange={(e) => setHasExpansionTelemetryDoc(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-800">
                      Millimeter Expansion Documented with 2-View Radiographs (72082)
                    </span>
                    <p className="text-xs text-slate-500">
                      Explicit notation of actuator stroke length expanded (e.g. 3.0 mm) verified on pre/post EOS spine X-rays.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Section 4: Rib Anchors / Pelvic Foundation (+22848) */}
          {(constructType === 'mcgr_primary' ||
            constructType === 'traditional_rods' ||
            constructType === 'veptr_rib') && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Layers className="h-5 w-5 text-sky-600" />
                2. Pelvic or Rib Anchor Foundation Add-On (+22848)
              </h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPelvicOrRibAnchors}
                    onChange={(e) => setHasPelvicOrRibAnchors(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-800">
                      Report Non-Sacral Pelvic or Rib Fixation (+22848)
                    </span>
                    <p className="text-xs text-slate-500">
                      VEPTR proximal rib cradles or distal S2AI pelvic fixation for neuromuscular pelvic obliquity. (5.50 wRVUs)
                    </p>
                  </div>
                </label>

                {hasPelvicOrRibAnchors && (
                  <div className="pl-6 border-l-2 border-sky-200 space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={distinctAnchorSiteDoc}
                        onChange={(e) => setDistinctAnchorSiteDoc(e.target.checked)}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span>
                        Operative report specifically details distinct rib cradle placement or iliac bone purchase
                      </span>
                    </label>
                    {!distinctAnchorSiteDoc && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        Warning: Payers will bundle +22848 into primary instrumentation unless distinct rib or iliac trajectories are dictated.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Concomitant Ponte Osteotomy (22212) */}
          {(constructType === 'mcgr_primary' ||
            constructType === 'traditional_rods' ||
            constructType === 'veptr_rib') && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Scissors className="h-5 w-5 text-indigo-600" />
                3. Posterior Column Osteotomy (Ponte 22212)
              </h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPonteOsteotomy}
                    onChange={(e) => setHasPonteOsteotomy(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-800">
                      Perform Posterior Column Osteotomy for Severe Deformity (CPT 22212)
                    </span>
                    <p className="text-xs text-slate-500">
                      Complete facetectomy and ligamentum flavum resection to mobilize stiff thoracic kyphoscoliosis.
                    </p>
                  </div>
                </label>

                {hasPonteOsteotomy && (
                  <div className="pl-6 border-l-2 border-indigo-200 space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasModifier51Osteotomy}
                        onChange={(e) => setHasModifier51Osteotomy(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Append Multiple Procedure Modifier -51 to secondary major osteotomy code</span>
                    </label>
                    {!hasModifier51Osteotomy && (
                      <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        Fatal: Without Modifier -51, clearinghouses reject secondary osteotomies performed with growing constructs.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 6: Intraoperative Neuromonitoring (IONM 95940) */}
          {constructType !== 'mcgr_clinic_lengthening' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                4. Intraoperative Spinal Cord Neuromonitoring (IONM 95940)
              </h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasIonmMonitoring}
                    onChange={(e) => setHasIonmMonitoring(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-800">
                      Continuous MEP &amp; SSEP Monitoring (CPT 95940 x16)
                    </span>
                    <p className="text-xs text-slate-500">
                      15-minute increments for 4 hours of transcranial MEP spinal tract surveillance during construct distraction.
                    </p>
                  </div>
                </label>

                {hasIonmMonitoring && (
                  <div className="pl-6 border-l-2 border-purple-200 space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dedicatedNeurophysiologist}
                        onChange={(e) => setDedicatedNeurophysiologist(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>
                        Billed by independent clinical neurophysiologist (not operating spine surgeon)
                      </span>
                    </label>
                    {!dedicatedNeurophysiologist && (
                      <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        Fatal: Operating surgeon cannot bill continuous IONM (95940). Strict CMS NCCI prohibition.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Scrubber Output, Clean Claim EDI, & Alerts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Audit Alerts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Clinical Audit Findings
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                {scrubberResult.alerts.length} Rules Fired
              </span>
            </h3>

            <div className="space-y-3">
              {scrubberResult.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    alert.type === 'clean'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : alert.type === 'warning'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : 'bg-rose-50/70 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="font-bold text-sm mb-1 flex items-center gap-1.5">
                    {alert.type === 'clean' && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                    {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />}
                    {alert.type === 'fatal' && <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />}
                    <span>{alert.title}</span>
                  </div>
                  <p className="text-slate-700 mb-1.5">{alert.desc}</p>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Authority: {alert.statute}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Claim Itemized Fee Schedule */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="h-5 w-5 text-blue-600" />
                Scrubbed Service Lines
              </h3>
              <button
                onClick={handleCopyEdi}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'EDI Copied!' : 'Copy 837P EDI'}</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {scrubberResult.lines.map((line, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-slate-900">{line.code}</span>
                      {line.mod !== 'None' && line.mod !== 'Add-on' && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-mono">
                          -{line.mod}
                        </span>
                      )}
                      {line.mod === 'Add-on' && (
                        <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 text-[11px] font-mono">
                          Add-on
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">${line.fee.toFixed(2)}</div>
                      <div className="text-[11px] text-slate-500">{line.rvu.toFixed(2)} wRVUs</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{line.desc}</p>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">{line.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Billed Yield</span>
                <span className="text-xl font-black text-slate-900">
                  ${scrubberResult.expectedReimbursement.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Work RVUs</span>
                <span className="text-xl font-black text-emerald-600">
                  {scrubberResult.totalRvu.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RCM Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowLeadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
            >
              &times;
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Free Pediatric Spine Coding Audit</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Request Practice Early-Onset Scoliosis Revenue Review
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Our pediatric spine billing experts will audit your MCGR implantations, serial growing rod distractions,
              VEPTR expanders, and outpatient distraction clinic coding to defend your practice against payer clawbacks.
            </p>

            {leadSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center text-emerald-800">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-base">Audit Request Received</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Kiran and the Aethera pediatric orthopedic review team will inspect your EOS billing data and contact you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Dr. Benjamin Foster, MD / Surgical Administrator"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="b.foster@childrensspine.org"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Practice / Children&apos;s Hospital Name
                  </label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="Pediatric Orthopedic & Spine Deformity Center"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Specific Denials or Target Cases
                  </label>
                  <textarea
                    rows={3}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="E.g., Global surgery denials on 6-month staged growing rod lengthenings (22849), downcoding on outpatient MCGR distraction visits."
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Transmitting Telemetry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Confidential Practice Audit</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    HIPAA-compliant zero-PHI protocol. Telemetry sent directly to Kiran.
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
