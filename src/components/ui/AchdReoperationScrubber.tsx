'use client';

import React, { useState, useMemo } from 'react';
import {
  Heart,
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

export default function AchdReoperationScrubber() {
  // 1. Primary ACHD Surgical Reconstruction
  const [primaryProcedure, setPrimaryProcedure] = useState<
    'fontan_conversion_33737' | 'fontan_revision_33735' | 'rvot_reconstruction_33608' | 'isolated_pvr_33475'
  >('fontan_conversion_33737');

  // 2. Redo Sternotomy / Thoracotomy Adhesiolysis (+33530)
  const [isRedoSternotomy, setIsRedoSternotomy] = useState<boolean>(true);
  const [hasDenseAdhesionsDoc, setHasDenseAdhesionsDoc] = useState<boolean>(true);

  // 3. Concomitant Arrhythmia Cryoablation / Maze (+33257 / +33258)
  const [mazeCryoablation, setMazeCryoablation] = useState<
    'none' | 'limited_33257' | 'extensive_33258'
  >('extensive_33258');
  const [hasCryoLesionMapDoc, setHasCryoLesionMapDoc] = useState<boolean>(true);

  // 4. Concomitant Pulmonary Valve Replacement (33475)
  const [hasConcomitantPvr, setHasConcomitantPvr] = useState<boolean>(true);
  const [hasModifier51Pvr, setHasModifier51Pvr] = useState<boolean>(true);

  // 5. Fontan Fenestration Closure or Creation
  const [fenestrationStrategy, setFenestrationStrategy] = useState<
    'none' | 'surgical_fenestration' | 'transcatheter_closure_93581'
  >('transcatheter_closure_93581');
  const [hasDiagnosticCathSeparation, setHasDiagnosticCathSeparation] = useState<boolean>(true);

  // 6. Post-Cardiotomy ECMO Cannulation (+33946)
  const [hasEcmoSupport, setHasEcmoSupport] = useState<boolean>(false);
  const [hasSeparateEcmoDoc, setHasSeparateEcmoDoc] = useState<boolean>(true);

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

    // --- 1. PRIMARY ACHD SURGICAL PROCEDURE ---
    if (primaryProcedure === 'fontan_conversion_33737') {
      const rvu = 52.8;
      const fee = 4850.0;
      totalRvu += rvu;
      expectedReimbursement += fee;

      lines.push({
        code: '33737',
        desc: 'Total cavopulmonary connection (TCPC) with extracardiac conduit (Fontan conversion)',
        mod: 'None',
        rvu,
        fee,
        status: 'clean',
        note: 'Primary complex ACHD reconstruction. Total cavopulmonary anastomosis with PTFE/Dacron tube graft and atrial remodeling.',
      });

      alerts.push({
        type: 'clean',
        title: 'Fontan Conversion (33737) Downcoding Defense',
        desc: 'Commercial payers frequently downcode 33737 to isolated revision 33735. Documentation confirms takedown of dilated right atrium, IVC-to-PA extracardiac conduit, and hemodynamic reconstruction.',
        statute: 'AMA CPT Guidelines; STS ACHD Coding Compendium',
      });
    } else if (primaryProcedure === 'fontan_revision_33735') {
      const rvu = 41.5;
      const fee = 3800.0;
      totalRvu += rvu;
      expectedReimbursement += fee;

      lines.push({
        code: '33735',
        desc: 'Atrial septectomy or revision of prior cavopulmonary connection / Fontan',
        mod: 'None',
        rvu,
        fee,
        status: 'clean',
        note: 'Revision of existing Fontan circuit or interatrial baffle revision without extracardiac conduit replacement.',
      });
    } else if (primaryProcedure === 'rvot_reconstruction_33608') {
      const rvu = 43.1;
      const fee = 3950.0;
      totalRvu += rvu;
      expectedReimbursement += fee;

      lines.push({
        code: '33608',
        desc: 'Repair of right ventricular outflow tract (RVOT) with valved conduit (congenital)',
        mod: 'None',
        rvu,
        fee,
        status: 'clean',
        note: 'Complete RVOT conduit replacement/reconstruction with cryopreserved homograft or prosthetic conduit.',
      });
    } else {
      const rvu = 29.5;
      const fee = 2720.0;
      totalRvu += rvu;
      expectedReimbursement += fee;

      lines.push({
        code: '33475',
        desc: 'Replacement, pulmonary valve, open, with or without cardiopulmonary bypass',
        mod: 'None',
        rvu,
        fee,
        status: 'clean',
        note: 'Isolated surgical pulmonary valve replacement in repaired congenital heart disease.',
      });
    }

    // --- 2. REDO STERNOTOMY ADHESIOLYSIS ADD-ON (+33530) ---
    if (isRedoSternotomy) {
      const redoRvu = 8.44;
      const redoFee = 780.0;

      if (hasDenseAdhesionsDoc) {
        totalRvu += redoRvu;
        expectedReimbursement += redoFee;

        lines.push({
          code: '+33530',
          desc: 'Reoperation, open cardiac procedure, more than 30 days following previous surgery',
          mod: 'Add-on',
          rvu: redoRvu,
          fee: redoFee,
          status: 'clean',
          note: 'Clean redo add-on: Prolonged dissection of dense substernal/mediastinal adhesions off aorta, conduit, and right ventricle before cannulation.',
        });

        alerts.push({
          type: 'clean',
          title: 'Redo Sternotomy (+33530) Validated',
          desc: 'CMS NCCI allows add-on +33530 with major congenital heart procedures when the reoperation occurs >30 days from initial surgery and extensive mediastinal adhesiolysis is documented.',
          statute: 'CMS NCCI Policy Manual Ch. V; CPT Assistant Oct 2023',
        });
      } else {
        penaltyAtRisk += redoFee;

        lines.push({
          code: '+33530',
          desc: 'Reoperation, open cardiac procedure (>30 days)',
          mod: 'Add-on',
          rvu: redoRvu,
          fee: redoFee,
          status: 'warning',
          note: 'AUDIT RISK: Operative note lacks specific documentation of severe retrosternal adhesions and prolonged entry time. Payer will reject add-on.',
        });

        alerts.push({
          type: 'warning',
          title: 'Redo Sternotomy Adhesiolysis Clawback Risk',
          desc: 'Payers reject +33530 if operative report fails to explicitly document oscillating saw dissection, retrosternal scarring, or adhesion release prior to bypass.',
          statute: 'CMS Claim Processing Manual 100-04, Ch. 12',
        });
      }
    }

    // --- 3. CONCOMITANT CRYOABLATION MAZE (+33257 / +33258) ---
    if (mazeCryoablation === 'limited_33257') {
      const mazeRvu = 2.5;
      const mazeFee = 240.0;

      if (hasCryoLesionMapDoc) {
        totalRvu += mazeRvu;
        expectedReimbursement += mazeFee;

        lines.push({
          code: '+33257',
          desc: 'Operative tissue ablation and reconstruction of atria, limited (e.g., modified maze procedure), with cardiopulmonary bypass',
          mod: 'Add-on',
          rvu: mazeRvu,
          fee: mazeFee,
          status: 'clean',
          note: 'Clean ablation add-on: Cavotricuspid isthmus (CTI) or coronary sinus cryolesions for intra-atrial reentrant tachycardia.',
        });
      } else {
        penaltyAtRisk += mazeFee;

        lines.push({
          code: '+33257',
          desc: 'Operative tissue ablation, limited',
          mod: 'Add-on',
          rvu: mazeRvu,
          fee: mazeFee,
          status: 'fatal',
          note: 'UNBUNDLING REJECTION: Missing cryogenic lesion map, energy delivery duration, or temperature telemetry.',
        });

        alerts.push({
          type: 'fatal',
          title: 'Cryoablation Maze Unbundling Denial Risk',
          desc: 'Payers disallow +33257 unless distinct anatomic lesion lines (e.g. isthmus, right atrial free wall) and cryothermal probe temperatures (-60°C) are specified.',
          statute: 'HRS/STS Guideline on Surgical Arrhythmia Ablation',
        });
      }
    } else if (mazeCryoablation === 'extensive_33258') {
      const mazeRvu = 4.5;
      const mazeFee = 425.0;

      if (hasCryoLesionMapDoc) {
        totalRvu += mazeRvu;
        expectedReimbursement += mazeFee;

        lines.push({
          code: '+33258',
          desc: 'Operative tissue ablation and reconstruction of atria, extensive (e.g., full maze procedure), with cardiopulmonary bypass',
          mod: 'Add-on',
          rvu: mazeRvu,
          fee: mazeFee,
          status: 'clean',
          note: 'Clean extensive maze add-on: Bi-atrial or extensive right atrial lesion sets with pulmonary venous isolation or IVC/SVC line connections.',
        });

        alerts.push({
          type: 'clean',
          title: 'Extensive Maze Add-On (+33258) Protected',
          desc: 'Extensive operative tissue ablation (+33258) is reportable during open Fontan conversion when multi-lesion sets are applied for complex refractory atrial flutter.',
          statute: 'CPT Assistant; STS Congenital Heart Surgery Coding Rules',
        });
      } else {
        penaltyAtRisk += mazeFee;

        lines.push({
          code: '+33258',
          desc: 'Operative tissue ablation, extensive',
          mod: 'Add-on',
          rvu: mazeRvu,
          fee: mazeFee,
          status: 'fatal',
          note: 'BUNDLING RISK: Lacks comprehensive lesion documentation; will be downgraded or denied as incidental to atriotomy closure.',
        });

        alerts.push({
          type: 'fatal',
          title: 'Extensive Maze Documentation Failure',
          desc: 'Commercial payers reject +33258 if operative summary states "cryoablation performed" without detailing each individual anatomical line.',
          statute: 'CMS NCCI Policy Manual Ch. V Section C',
        });
      }
    }

    // --- 4. CONCOMITANT PULMONARY VALVE REPLACEMENT (33475) ---
    if (hasConcomitantPvr && primaryProcedure !== 'isolated_pvr_33475') {
      const pvrRvu = 29.5 * 0.5; // 50% multiple procedure rule
      const pvrFee = 2720.0 * 0.5;

      if (hasModifier51Pvr) {
        totalRvu += pvrRvu;
        expectedReimbursement += pvrFee;

        lines.push({
          code: '33475',
          desc: 'Replacement, pulmonary valve, open, with cardiopulmonary bypass (concomitant to Fontan conversion)',
          mod: '51',
          rvu: pvrRvu,
          fee: pvrFee,
          status: 'clean',
          note: 'Secondary major cardiac reconstruction: Bioprosthetic pulmonary valve implantation during Fontan conversion with Modifier -51 applied.',
        });
      } else {
        totalRvu += pvrRvu;
        penaltyAtRisk += pvrFee;

        lines.push({
          code: '33475',
          desc: 'Replacement, pulmonary valve, open',
          mod: 'None',
          rvu: pvrRvu,
          fee: pvrFee,
          status: 'fatal',
          note: 'MISSING MODIFIER 51: Secondary major valve procedure billed without multiple procedure modifier; claims clearinghouse rejection.',
        });

        alerts.push({
          type: 'fatal',
          title: 'Missing Multiple Procedure Modifier -51 on Concomitant PVR',
          desc: 'When pulmonary valve replacement is performed synchronously with Fontan conversion (33737), Modifier -51 is required to acknowledge fee schedule reduction.',
          statute: 'CMS Multiple Procedure Payment Reduction (MPPR) Rules',
        });
      }
    }

    // --- 5. FONTAN FENESTRATION CLOSURE (93581) ---
    if (fenestrationStrategy === 'transcatheter_closure_93581') {
      const fenRvu = 18.2;
      const fenFee = 1680.0;

      if (hasDiagnosticCathSeparation) {
        totalRvu += fenRvu;
        expectedReimbursement += fenFee;

        lines.push({
          code: '93581',
          desc: 'Percutaneous transcatheter closure of congenital interatrial communication (Fontan fenestration closure)',
          mod: 'None',
          rvu: fenRvu,
          fee: fenFee,
          status: 'clean',
          note: 'Clean device deployment: Fluoroscopic and intracardiac echo-guided Amplatzer/Gore device closure of failing Fontan fenestration.',
        });
      } else {
        penaltyAtRisk += 850.0; // cath bundling loss

        lines.push({
          code: '93581',
          desc: 'Percutaneous transcatheter closure of Fontan fenestration',
          mod: 'None',
          rvu: fenRvu,
          fee: fenFee,
          status: 'warning',
          note: 'NCCI BUNDLING: Diagnostic heart catheterization (93530) bundled into 93581 unless independent diagnostic necessity is documented.',
        });

        alerts.push({
          type: 'warning',
          title: 'Diagnostic Catheterization Bundling Alert',
          desc: 'Under CMS NCCI edits, diagnostic heart cath (93530/93531) is bundled into device closure (93581). Only billable with Modifier -59/XU if prior cath was inconclusive or hemodynamics necessitated separate pre-intervention evaluation.',
          statute: 'NCCI Edits Chapter XI, Cardiovascular Interventions',
        });
      }
    }

    // --- 6. CENTRAL ECMO CANNULATION (+33946) ---
    if (hasEcmoSupport) {
      const ecmoRvu = 15.6;
      const ecmoFee = 1450.0;

      if (hasSeparateEcmoDoc) {
        totalRvu += ecmoRvu;
        expectedReimbursement += ecmoFee;

        lines.push({
          code: '33946',
          desc: 'Extracorporeal membrane oxygenation (ECMO)/extracorporeal life support (ECLS) initiation; veno-arterial, central cannulation',
          mod: '59',
          rvu: ecmoRvu,
          fee: ecmoFee,
          status: 'clean',
          note: 'Clean central ECMO: Documented inability to separate from cardiopulmonary bypass due to elevated pulmonary vascular resistance in failing single ventricle.',
        });

        alerts.push({
          type: 'clean',
          title: 'Post-Cardiotomy ECMO Initiation (+33946-59) Supported',
          desc: 'ECMO central cannulation is distinct from standard CPB cannulation when initiated for post-cardiotomy hemodynamic collapse. Modifier 59 defends against NCCI bundling.',
          statute: 'STS Post-Cardiotomy MCS Coding Standards',
        });
      } else {
        penaltyAtRisk += ecmoFee;

        lines.push({
          code: '33946',
          desc: 'ECMO initiation, central cannulation',
          mod: 'None',
          rvu: ecmoRvu,
          fee: ecmoFee,
          status: 'fatal',
          note: 'BUNDLING REJECTION: Payer treated ECMO cannulation as routine CPB cannulation due to lack of Modifier -59 and hemodynamic failure notes.',
        });

        alerts.push({
          type: 'fatal',
          title: 'ECMO Cannulation Bundled into Cardiopulmonary Bypass',
          desc: 'Commercial payers reject 33946 as inclusive of primary open cardiac surgery unless Modifier 59 and separate time-stamped post-weaning failure is documented.',
          statute: 'CMS NCCI Policy Manual Ch. V Section E',
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
    primaryProcedure,
    isRedoSternotomy,
    hasDenseAdhesionsDoc,
    mazeCryoablation,
    hasCryoLesionMapDoc,
    hasConcomitantPvr,
    hasModifier51Pvr,
    fenestrationStrategy,
    hasDiagnosticCathSeparation,
    hasEcmoSupport,
    hasSeparateEcmoDoc,
  ]);

  // ANSI 837P EDI Generator
  const generateEdiClaim = () => {
    const claimDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let edi = `ISA*00*          *00*          *ZZ*SUBMITTER      *ZZ*PAYER          *${claimDate.slice(2)}*1200*^*00501*000000001*0*P*:~\n`;
    edi += `GS*HC*SUBMITTER*PAYER*${claimDate}*1200*1*X*005010X222A1~\n`;
    edi += `ST*837*0001*005010X222A1~\n`;
    edi += `BHT*0019*00*REF${claimDate}*${claimDate}*1200*CH~\n`;
    edi += `NM1*85*2*ADULT CONGENITAL CARDIAC SURGERY*****XX*1988888881~\n`;
    edi += `NM1*IL*1*DOE*ALEX****MI*ACHD8829102~\n`;
    edi += `CLM*ACHD-${claimDate}*${scrubberResult.expectedReimbursement.toFixed(2)}***11:B:1*Y*A*Y*Y~\n`;

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
        primaryProcedure,
        isRedoSternotomy,
        hasDenseAdhesionsDoc,
        mazeCryoablation,
        hasCryoLesionMapDoc,
        hasConcomitantPvr,
        hasModifier51Pvr,
        fenestrationStrategy,
        hasDiagnosticCathSeparation,
        hasEcmoSupport,
        expectedReimbursement: scrubberResult.expectedReimbursement,
        penaltyAtRisk: scrubberResult.penaltyAtRisk,
        totalRvu: scrubberResult.totalRvu,
        contactName,
        contactEmail,
        practiceName,
        auditNotes,
      };

      await sendLeadToKiran('achd_reoperation_rcm_audit', payload);
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
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-red-900/40 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-3 border border-rose-500/30">
              <Heart className="h-3.5 w-3.5" />
              <span>Tool #66 · Adult Congenital Heart Disease (ACHD) &amp; Fontan Scrubber</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Adult Congenital Heart Disease (ACHD) &amp; Fontan Conversion Scrubber
            </h2>
            <p className="text-rose-100/80 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
              Scrub complex Fontan conversion (33737), defend redo sternotomy adhesiolysis add-ons (+33530), safeguard
              concomitant arrhythmia cryoablation Maze (+33257/+33258), and audit pulmonary valve replacements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLeadModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Send className="h-4 w-4" />
              <span>Request ACHD RCM Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Total Work RVUs</span>
            <Activity className="h-4 w-4 text-rose-600" />
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
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
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
          <div className="text-xs text-slate-500 mt-1">Clawbacks from unbundling &amp; missing mods</div>
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
          {/* Section 1: Primary Surgical Reconstruction */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-600" />
              1. Primary ACHD Surgical Reconstruction
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  primaryProcedure === 'fontan_conversion_33737'
                    ? 'border-rose-500 bg-rose-50/50 text-slate-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="primaryProcedure"
                    checked={primaryProcedure === 'fontan_conversion_33737'}
                    onChange={() => setPrimaryProcedure('fontan_conversion_33737')}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="font-semibold text-sm">
                      CPT 33737: Fontan Conversion with Extracardiac Conduit (TCPC)
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Takedown of dilated right atrium, PTFE/Dacron tube graft to pulmonary artery, and total cavopulmonary connection. (52.80 wRVUs)
                    </div>
                  </div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  primaryProcedure === 'fontan_revision_33735'
                    ? 'border-rose-500 bg-rose-50/50 text-slate-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="primaryProcedure"
                    checked={primaryProcedure === 'fontan_revision_33735'}
                    onChange={() => setPrimaryProcedure('fontan_revision_33735')}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="font-semibold text-sm">
                      CPT 33735: Fontan Revision / Atrial Septectomy
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Revision of prior cavopulmonary connection or interatrial baffle revision without extracardiac conduit replacement. (41.50 wRVUs)
                    </div>
                  </div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  primaryProcedure === 'rvot_reconstruction_33608'
                    ? 'border-rose-500 bg-rose-50/50 text-slate-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="primaryProcedure"
                    checked={primaryProcedure === 'rvot_reconstruction_33608'}
                    onChange={() => setPrimaryProcedure('rvot_reconstruction_33608')}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="font-semibold text-sm">
                      CPT 33608: RVOT Reconstruction with Valved Conduit
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Repaired Tetralogy of Fallot or Ross procedure reoperation with homograft/bioprosthetic RVOT conduit replacement. (43.10 wRVUs)
                    </div>
                  </div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  primaryProcedure === 'isolated_pvr_33475'
                    ? 'border-rose-500 bg-rose-50/50 text-slate-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="primaryProcedure"
                    checked={primaryProcedure === 'isolated_pvr_33475'}
                    onChange={() => setPrimaryProcedure('isolated_pvr_33475')}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="font-semibold text-sm">
                      CPT 33475: Isolated Surgical Pulmonary Valve Replacement (PVR)
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Surgical replacement of native or prosthetic pulmonary valve on cardiopulmonary bypass. (29.50 wRVUs)
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Redo Sternotomy / Mediastinal Adhesiolysis (+33530) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Scissors className="h-5 w-5 text-indigo-600" />
              2. Redo Sternotomy Adhesiolysis (+33530)
            </h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRedoSternotomy}
                  onChange={(e) => setIsRedoSternotomy(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div className="text-sm">
                  <span className="font-semibold text-slate-800">
                    Reoperation &gt;30 Days Following Previous Cardiac Surgery (+33530)
                  </span>
                  <p className="text-xs text-slate-500">
                    Patient has history of prior median sternotomy / thoracotomy for congenital cardiac palliation. (8.44 wRVUs)
                  </p>
                </div>
              </label>

              {isRedoSternotomy && (
                <div className="pl-6 border-l-2 border-indigo-200 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDenseAdhesionsDoc}
                      onChange={(e) => setHasDenseAdhesionsDoc(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      Operative report documents prolonged dissection of dense substernal/epicardial adhesions prior to CPB
                    </span>
                  </label>
                  {!hasDenseAdhesionsDoc && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Warning: Lack of explicit adhesion documentation triggers Medicare and commercial clawbacks for +33530.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Concomitant Arrhythmia Cryoablation / Maze */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              3. Intraoperative Cryoablation Maze for Atrial Tachycardia
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'none', label: 'No Ablation', sub: 'No arrhythmia lesions' },
                  { id: 'limited_33257', label: '+33257 Limited', sub: 'Isthmus / CTI lines (2.50 wRVU)' },
                  { id: 'extensive_33258', label: '+33258 Extensive', sub: 'Bi-atrial / Maze lines (4.50 wRVU)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMazeCryoablation(item.id as any)}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      mazeCryoablation === item.id
                        ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-semibold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 text-xs'
                    }`}
                  >
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>

              {mazeCryoablation !== 'none' && (
                <div className="pl-4 border-l-2 border-amber-200 mt-3 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasCryoLesionMapDoc}
                      onChange={(e) => setHasCryoLesionMapDoc(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>
                      Anatomic lesion map documented with cryothermal temperatures (&le; -60&deg;C) and burn durations
                    </span>
                  </label>
                  {!hasCryoLesionMapDoc && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      Fatal: Payers bundle CPT +33257/+33258 into Fontan revision as incidental atriotomy closure unless specific lesion lines are detailed.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Concomitant Pulmonary Valve Replacement (33475) */}
          {primaryProcedure !== 'isolated_pvr_33475' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-teal-600" />
                4. Concomitant Pulmonary Valve Replacement (33475)
              </h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasConcomitantPvr}
                    onChange={(e) => setHasConcomitantPvr(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-800">
                      Perform Concomitant Surgical PVR (CPT 33475)
                    </span>
                    <p className="text-xs text-slate-500">
                      Implant bioprosthetic pulmonary valve during Fontan conversion or RVOT reconstruction.
                    </p>
                  </div>
                </label>

                {hasConcomitantPvr && (
                  <div className="pl-6 border-l-2 border-teal-200 space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasModifier51Pvr}
                        onChange={(e) => setHasModifier51Pvr(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Append Multiple Procedure Modifier -51 to secondary major cardiac procedure</span>
                    </label>
                    {!hasModifier51Pvr && (
                      <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        Fatal: Without Modifier -51, clearinghouses and commercial payers reject secondary major open cardiac codes as duplicate or improperly bundled.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Fontan Fenestration Strategy */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="h-5 w-5 text-sky-600" />
              5. Fontan Fenestration Management &amp; Interventions
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'none', label: 'No Fenestration', sub: 'Complete TCPC circuit' },
                  { id: 'surgical_fenestration', label: 'Surgical Punch', sub: 'Inherent to 33737' },
                  { id: 'transcatheter_closure_93581', label: 'Device Closure 93581', sub: 'Amplatzer plug (18.2 wRVU)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFenestrationStrategy(item.id as any)}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      fenestrationStrategy === item.id
                        ? 'border-sky-500 bg-sky-50/50 text-slate-900 font-semibold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 text-xs'
                    }`}
                  >
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>

              {fenestrationStrategy === 'transcatheter_closure_93581' && (
                <div className="pl-4 border-l-2 border-sky-200 mt-3 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDiagnosticCathSeparation}
                      onChange={(e) => setHasDiagnosticCathSeparation(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span>
                      Separate diagnostic indication documented for heart cath (93530) vs therapeutic device closure (93581)
                    </span>
                  </label>
                  {!hasDiagnosticCathSeparation && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Notice: Routine diagnostic hemodynamic cath is bundled into 93581 under NCCI. Requires Modifier -59/XU and distinct prior decision notes.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 6: Post-Cardiotomy ECMO Support */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              6. Post-Cardiotomy Mechanical Circulatory Support (ECMO 33946)
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasEcmoSupport}
                  onChange={(e) => setHasEcmoSupport(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <div className="text-sm">
                  <span className="font-semibold text-slate-800">
                    Central VA-ECMO Initiation for Failing Single Ventricle Physiology (CPT 33946)
                  </span>
                  <p className="text-xs text-slate-500">
                    Inability to separate from CPB due to acute Fontan circuit hypertension or myocardial failure. (15.60 wRVUs)
                  </p>
                </div>
              </label>

              {hasEcmoSupport && (
                <div className="pl-6 border-l-2 border-purple-200 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSeparateEcmoDoc}
                      onChange={(e) => setHasSeparateEcmoDoc(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>
                      Document distinct post-weaning failure of CPB and append Modifier -59 to ECMO cannulation (33946)
                    </span>
                  </label>
                  {!hasSeparateEcmoDoc && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      Fatal: Missing Modifier -59 causes commercial payers to bundle ECMO cannulation as standard cardiopulmonary bypass cannulation.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
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
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-mono">
                          -{line.mod}
                        </span>
                      )}
                      {line.mod === 'Add-on' && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[11px] font-mono">
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
                <span className="text-xl font-black text-rose-600">
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

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 text-xs font-semibold mb-3 border border-rose-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Free ACHD Surgical Coding Audit</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Request Full Practice ACHD Revenue Review
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Our board-certified congenital cardiac coding specialists will review your Fontan conversions, redo
              sternotomies, and concomitant cryoablation Maze documentation to overturn historical clawbacks.
            </p>

            {leadSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center text-emerald-800">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-base">Audit Request Received</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Kiran and the Aethera surgical review team will inspect your ACHD coding telemetry and follow up within 24 hours.
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
                    placeholder="Dr. Jordan Vance, MD / Practice Administrator"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                    placeholder="j.vance@childrensheart.org"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Practice / Heart Institute Name
                  </label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="Pediatric & Adult Congenital Cardiac Institute"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                    placeholder="E.g., High denial volume on +33530 redo sternotomies and commercial payer clawbacks on concomitant cryoablation 33258."
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
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
