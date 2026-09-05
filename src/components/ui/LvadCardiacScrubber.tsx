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
  Heart,
  HeartPulse,
  Eye,
  GitBranch,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function LvadCardiacScrubber() {
  // 1. Primary Mechanical Circulatory Support (MCS) Procedure
  const [procedureType, setProcedureType] = useState<
    'durable_lvad' | 'temporary_vad' | 'bivad_implant' | 'lvad_exchange'
  >('durable_lvad');

  const [simulateDowncode, setSimulateDowncode] = useState<boolean>(false); // Payer downcodes durable 33979 to temporary 33975

  // 2. Reoperation Sternotomy Add-On (+33530)
  const [isRedoSternotomy, setIsRedoSternotomy] = useState<boolean>(true);
  const [priorSternotomyOver30Days, setPriorSternotomyOver30Days] = useState<boolean>(true);
  const [extensiveAdhesiolysisDocumented, setExtensiveAdhesiolysisDocumented] = useState<boolean>(true);

  // 3. Concomitant Valvular Procedures
  const [hasTricuspidRepair, setHasTricuspidRepair] = useState<boolean>(true); // CPT 33464-51
  const [hasAorticValveClosure, setHasAorticValveClosure] = useState<boolean>(false); // CPT 33405-51

  // 4. Surgical Team Configuration
  const [surgicalTeamMode, setSurgicalTeamMode] = useState<
    'solo' | 'assistant_mod80' | 'co_surgeon_mod62'
  >('co_surgeon_mod62');

  // 5. Postoperative Vasoplegia & Acute RV Failure Critical Care (99291-24)
  const [hasRvFailureCriticalCare, setHasRvFailureCriticalCare] = useState<boolean>(true);
  const [distinctHemodynamicTime, setDistinctHemodynamicTime] = useState<boolean>(true);

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

    const isCoSurgeon = surgicalTeamMode === 'co_surgeon_mod62';
    const teamMod = isCoSurgeon ? '62' : surgicalTeamMode === 'assistant_mod80' ? '80' : 'None';
    const surgeonMultiplier = isCoSurgeon ? 0.625 : 1.0;

    // --- 1. PRIMARY MCS IMPLANTATION ---
    if (procedureType === 'durable_lvad') {
      const standardFee = 6850.0;
      const standardRvu = 88.5;

      if (simulateDowncode) {
        const downcodedFee = 4250.0;
        const downcodedRvu = 54.2;
        const loss = (standardFee - downcodedFee) * surgeonMultiplier;
        penaltyAtRisk += loss;

        lines.push({
          code: '33979',
          desc: 'Insertion of ventricular assist device, implantable intracorporeal; durable long-term LVAD',
          mod: 'Downcoded -> 33975',
          rvu: Number((downcodedRvu * surgeonMultiplier).toFixed(1)),
          fee: Number((downcodedFee * surgeonMultiplier).toFixed(2)),
          status: 'fatal',
          note: `PAYER DOWNCODING: Commercial plan downgraded durable implantable LVAD (33979) to temporary extracorporeal system (33975), slashing -$${loss.toFixed(2)}.`,
        });
        alerts.push({
          type: 'fatal',
          title: 'Durable LVAD Downcoded to Temporary System (33975)',
          desc: 'Payer audit claims lack of documented destination therapy / bridge-to-transplant FDA indications. Rebuttal must cite INTERMACS profile & device serial number.',
          statute: 'CMS National Coverage Determination (NCD) 20.9.1',
        });
        totalRvu += downcodedRvu * surgeonMultiplier;
        expectedReimbursement += downcodedFee * surgeonMultiplier;
      } else {
        const fee = standardFee * surgeonMultiplier;
        const rvu = standardRvu * surgeonMultiplier;
        totalRvu += rvu;
        expectedReimbursement += fee;

        lines.push({
          code: '33979',
          desc: 'Insertion of ventricular assist device, implantable intracorporeal; durable LVAD',
          mod: teamMod,
          rvu: Number(rvu.toFixed(1)),
          fee: Number(fee.toFixed(2)),
          status: 'clean',
          note: 'Durable continuous-flow intracorporeal LVAD implantation on cardiopulmonary bypass.',
        });
        alerts.push({
          type: 'clean',
          title: 'Durable Intracorporeal LVAD Verified (33979)',
          desc: 'Implantation of FDA-approved continuous-flow ventricular assist device verified under INTERMACS registry reporting guidelines.',
          statute: 'CPT Cardiac Surgery Guidelines / STS Registry Standards',
        });
      }
    } else if (procedureType === 'temporary_vad') {
      const tempFee = 4250.0 * surgeonMultiplier;
      const tempRvu = 54.2 * surgeonMultiplier;
      totalRvu += tempRvu;
      expectedReimbursement += tempFee;

      lines.push({
        code: '33975',
        desc: 'Insertion of ventricular assist device; extracorporeal, single ventricle',
        mod: teamMod,
        rvu: Number(tempRvu.toFixed(1)),
        fee: Number(tempFee.toFixed(2)),
        status: 'clean',
        note: 'Centrifugal temporary mechanical circulatory support for acute cardiogenic shock.',
      });
    } else if (procedureType === 'bivad_implant') {
      const bivadFee = 7950.0 * surgeonMultiplier;
      const bivadRvu = 104.2 * surgeonMultiplier;
      totalRvu += bivadRvu;
      expectedReimbursement += bivadFee;

      lines.push({
        code: '33980',
        desc: 'Insertion of ventricular assist device, implantable intracorporeal; biventricular (BIVAD)',
        mod: teamMod,
        rvu: Number(bivadRvu.toFixed(1)),
        fee: Number(bivadFee.toFixed(2)),
        status: 'clean',
        note: 'Dual pump biventricular assist device implantation.',
      });
      alerts.push({
        type: 'clean',
        title: 'Biventricular Assist Device Implantation Validated (33980)',
        desc: 'Simultaneous left and right ventricular intracorporeal pump placements verified with separate cannulation tracts.',
        statute: 'CMS Physician Fee Schedule Manual',
      });
    } else if (procedureType === 'lvad_exchange') {
      const exFee = 6120.0 * surgeonMultiplier;
      const exRvu = 79.8 * surgeonMultiplier;
      totalRvu += exRvu;
      expectedReimbursement += exFee;

      lines.push({
        code: '33981',
        desc: 'Replacement of ventricular assist device pump, implantable intracorporeal',
        mod: teamMod,
        rvu: Number(exRvu.toFixed(1)),
        fee: Number(exFee.toFixed(2)),
        status: 'clean',
        note: 'Pump exchange for driveline fracture, pump thrombosis, or electronic failure.',
      });
    }

    // --- 2. REDO STERNOTOMY ADD-ON (+33530) ---
    if (isRedoSternotomy) {
      const redoFee = 1180.0 * surgeonMultiplier;
      const redoRvu = 14.5 * surgeonMultiplier;

      if (!priorSternotomyOver30Days || !extensiveAdhesiolysisDocumented) {
        penaltyAtRisk += redoFee;
        lines.push({
          code: '+33530',
          desc: 'Reoperation, open cardiac procedure; >30 days following previous open surgery',
          mod: 'UNBUNDLED (FATAL)',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'FATAL NCCI BUNDLE: +33530 billed without documenting >30 days surgical interval or detailed adhesiolysis time.',
        });
        alerts.push({
          type: 'fatal',
          title: 'Redo Sternotomy Add-On Bundling Rejection (+33530)',
          desc: 'Commercial payers reject +33530 unless operative note explicitly documents surgical interval >30 days and dense mediastinal/pericardial adhesiolysis with oscillating saw dissection.',
          statute: 'CPT Parenthetical Notes / NCCI Policy Manual Ch. V, Sec. D.4',
        });
      } else {
        totalRvu += redoRvu;
        expectedReimbursement += redoFee;
        lines.push({
          code: '+33530',
          desc: 'Reoperation, cardiovascular procedure; more than 30 days after prior open surgery',
          mod: isCoSurgeon ? '62' : 'None',
          rvu: Number(redoRvu.toFixed(1)),
          fee: Number(redoFee.toFixed(2)),
          status: 'clean',
          note: 'Modifier 51 exempt add-on. Prior sternotomy >30 days and extensive retrosternal adhesiolysis substantiated.',
        });
        alerts.push({
          type: 'clean',
          title: 'Redo Sternotomy Add-On Defended (+33530)',
          desc: 'Compliant add-on billing: Prior surgery interval >30 days and sharp dissection of right ventricle from posterior sternum validated.',
          statute: 'AMA CPT Cardiac Reoperation Standards',
        });
      }
    }

    // --- 3. CONCOMITANT VALVULAR PROCEDURES ---
    if (hasTricuspidRepair) {
      const tricuspidFee = 2450.0 * 0.5 * surgeonMultiplier; // 50% multiple surgery reduction
      const tricuspidRvu = 31.8 * 0.5 * surgeonMultiplier;
      totalRvu += tricuspidRvu;
      expectedReimbursement += tricuspidFee;

      lines.push({
        code: '33464',
        desc: 'Valvuloplasty, tricuspid valve, with ring annuloplasty',
        mod: isCoSurgeon ? '62, 51' : '51',
        rvu: Number(tricuspidRvu.toFixed(1)),
        fee: Number(tricuspidFee.toFixed(2)),
        status: 'clean',
        note: 'Concurrent tricuspid annuloplasty to prevent post-LVAD right ventricular distention.',
      });
      alerts.push({
        type: 'clean',
        title: 'Concomitant Tricuspid Annuloplasty Supported (33464-51)',
        desc: 'Separate cardiac chamber procedure justified to prevent severe post-implant RV failure. Multiple procedure modifier -51 appended.',
        statute: 'STS/AATS Consensus on Concomitant Procedures during LVAD',
      });
    }

    if (hasAorticValveClosure) {
      const avFee = 2850.0 * 0.5 * surgeonMultiplier;
      const avRvu = 36.4 * 0.5 * surgeonMultiplier;
      totalRvu += avRvu;
      expectedReimbursement += avFee;

      lines.push({
        code: '33405',
        desc: 'Replacement or primary oversewing of aortic valve to eliminate aortic insufficiency',
        mod: isCoSurgeon ? '62, 51' : '51',
        rvu: Number(avRvu.toFixed(1)),
        fee: Number(avFee.toFixed(2)),
        status: 'clean',
        note: 'Oversewing/bioprosthetic replacement of incompetent aortic valve to eliminate LVAD recirculating volume loops.',
      });
    }

    // --- 4. POSTOPERATIVE ACUTE RV FAILURE / VASOPLEGIA CRITICAL CARE ---
    if (hasRvFailureCriticalCare) {
      const ccFee = 420.0;
      const ccRvu = 5.2;

      if (!distinctHemodynamicTime) {
        penaltyAtRisk += ccFee;
        lines.push({
          code: '99291',
          desc: 'Critical care, evaluation and management of critically ill patient; first 30-74 minutes',
          mod: 'UNBUNDLED (GLOBAL)',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'FATAL GLOBAL PERIOD DENIAL: Inpatient critical care billed during 90-day surgical global period without Modifier 24 or distinct non-surgical dictation.',
        });
        alerts.push({
          type: 'fatal',
          title: 'Post-Op Critical Care Global Period Denial (99291-24)',
          desc: 'Payers reject ICU bedside management within 90-day global period unless Modifier -24 is appended and clinical documentation substantiates severe acute RV decompensation or vasoplegic shock independent of routine surgical recovery.',
          statute: 'CMS IOM 100-04, Ch. 12, §30.6.12.E',
        });
      } else {
        totalRvu += ccRvu;
        expectedReimbursement += ccFee;
        lines.push({
          code: '99291',
          desc: 'Critical care, evaluation and management; first 30-74 min (Acute RV Failure / Vasoplegia)',
          mod: '24',
          rvu: ccRvu,
          fee: ccFee,
          status: 'clean',
          note: 'Unrelated post-operative critical care in CVICU for inhaled epoprostenol / inotropic titration.',
        });
        alerts.push({
          type: 'clean',
          title: 'Modifier -24 Post-Op Critical Care Validated (99291)',
          desc: 'Distinct organ system failure documented: Inhaled nitric oxide, milrinone/epinephrine titration, and pulmonary artery catheter monitoring separate from standard wound checks.',
          statute: 'CMS Global Surgery Critical Care Carve-Out Exception',
        });
      }
    }

    return {
      lines,
      alerts,
      totalRvu: Number(totalRvu.toFixed(1)),
      expectedReimbursement: Number(expectedReimbursement.toFixed(2)),
      penaltyAtRisk: Number(penaltyAtRisk.toFixed(2)),
    };
  }, [
    procedureType,
    simulateDowncode,
    isRedoSternotomy,
    priorSternotomyOver30Days,
    extensiveAdhesiolysisDocumented,
    hasTricuspidRepair,
    hasAorticValveClosure,
    surgicalTeamMode,
    hasRvFailureCriticalCare,
    distinctHemodynamicTime,
  ]);

  // ANSI 837P EDI Claim String Generator
  const generateEdiClaim = () => {
    const claimDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let edi = `ISA*00*          *00*          *ZZ*SUBMITTER      *ZZ*PAYER          *${claimDate.slice(2)}*1200*^*00501*000000001*0*P*:~\n`;
    edi += `GS*HC*SUBMITTER*PAYER*${claimDate}*1200*1*X*005010X222A1~\n`;
    edi += `ST*837*0001*005010X222A1~\n`;
    edi += `BHT*0019*00*REF${claimDate}*${claimDate}*1200*CH~\n`;
    edi += `NM1*85*2*CARDIAC MCS SURGERY CLINIC*****XX*1999999991~\n`;
    edi += `NM1*IL*1*DOE*JOHN****MI*CARD9928174~\n`;
    edi += `CLM*MCS-${claimDate}*${scrubberResult.expectedReimbursement.toFixed(2)}***11:B:1*Y*A*Y*Y~\n`;

    scrubberResult.lines.forEach((l, idx) => {
      const cleanMod = l.mod.replace(/[^0-9A-Z]/g, '');
      const modSegment = cleanMod && cleanMod !== 'None' ? `:${cleanMod}` : '';
      edi += `LX*${idx + 1}~\n`;
      edi += `SV1*HC:${l.code}${modSegment}*${l.fee.toFixed(2)}*UN*1***1~\n`;
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
        procedureType,
        isRedoSternotomy,
        surgicalTeamMode,
        simulateDowncode,
        hasTricuspidRepair,
        hasRvFailureCriticalCare,
        expectedReimbursement: scrubberResult.expectedReimbursement,
        penaltyAtRisk: scrubberResult.penaltyAtRisk,
        totalRvu: scrubberResult.totalRvu,
        contactName,
        contactEmail,
        practiceName,
        auditNotes,
      };

      await sendLeadToKiran('lvad_cardiac_rcm_audit', payload);
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
            <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-rose-500/30">
              <HeartPulse className="w-3.5 h-3.5" />
              Cardiothoracic Surgery &amp; Mechanical Circulatory Support (MCS)
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-jakarta tracking-tight">
              Durable LVAD Implantation &amp; Cardiac Reoperation Scrubber
            </h2>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
              Audit durable continuous-flow LVAD implants (CPT 33979), counter commercial payer downcoding to temporary VAD systems (33975), defend redo sternotomy adhesiolysis add-ons (+33530), and validate concomitant tricuspid/aortic repairs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setShowLeadModal(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Request Cardiac MCS Audit
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Total Work RVUs</span>
            <span className="text-xl font-bold font-mono text-rose-400">
              {scrubberResult.totalRvu} wRVUs
            </span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Expected Reimbursement</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              ${scrubberResult.expectedReimbursement.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Revenue at Risk / Clawback</span>
            <span className={`text-xl font-bold font-mono ${scrubberResult.penaltyAtRisk > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              ${scrubberResult.penaltyAtRisk.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Active Claim Lines</span>
            <span className="text-xl font-bold font-mono text-white">
              {scrubberResult.lines.length} CPT Units
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Clinical Configuration & Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Box 1: Primary MCS Procedure */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Heart className="w-5 h-5 text-rose-600" />
              1. Mechanical Circulatory Support (MCS) Modality
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Implant Category &amp; Indication
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'durable_lvad',
                      code: 'CPT 33979',
                      title: 'Durable Intracorporeal LVAD',
                      desc: 'HeartMate 3 / continuous-flow intracorporeal LVAD for BTT or Destination Therapy.',
                    },
                    {
                      id: 'bivad_implant',
                      code: 'CPT 33980',
                      title: 'Biventricular Assist Device (BIVAD)',
                      desc: 'Simultaneous left and right ventricular intracorporeal pump implantations.',
                    },
                    {
                      id: 'lvad_exchange',
                      code: 'CPT 33981',
                      title: 'LVAD Pump Exchange / Replacement',
                      desc: 'Surgical pump replacement for driveline infection, thrombosis, or device malfunction.',
                    },
                    {
                      id: 'temporary_vad',
                      code: 'CPT 33975',
                      title: 'Temporary Extracorporeal VAD',
                      desc: 'Centrifugal paracorporeal ventricular support for acute cardiogenic shock.',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProcedureType(item.id as any)}
                      className={`text-left p-3.5 rounded-lg border transition-all ${
                        procedureType === item.id
                          ? 'border-rose-600 bg-rose-50/50 shadow-sm ring-1 ring-rose-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-navy">{item.title}</span>
                        <span className="text-xs font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Downcoding Simulator Toggle */}
              {procedureType === 'durable_lvad' && (
                <label className="flex items-center justify-between p-3.5 bg-rose-50 rounded-lg border border-rose-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-rose-900">
                      Simulate Commercial Downcoding to Temporary VAD (33975)
                    </div>
                    <div className="text-[11px] text-rose-700 mt-0.5">
                      Payer downcodes durable LVAD (33979) claiming unproven Destination Therapy criteria (-$2,600 / -34 wRVU clawback).
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

          {/* Box 2: Redo Sternotomy Adhesiolysis (+33530) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Scissors className="w-5 h-5 text-rose-600" />
              2. Reoperative Sternotomy &amp; Mediastinal Adhesiolysis (+33530)
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-slate-800">Prior Open Cardiac Surgery Sternotomy (+33530)</div>
                  <div className="text-[11px] text-slate-500">Patient underwent prior CABG, valve replacement, or congenital repair</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={isRedoSternotomy}
                    onChange={(e) => setIsRedoSternotomy(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                </div>
              </label>

              {isRedoSternotomy && (
                <div className="space-y-2 pl-4 border-l-2 border-rose-200">
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-slate-800">Prior Surgical Interval &gt; 30 Days Documented</div>
                      <div className="text-[11px] text-slate-500">Meets mandatory CPT statutory timing criteria for +33530</div>
                    </div>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={priorSternotomyOver30Days}
                        onChange={(e) => setPriorSternotomyOver30Days(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-slate-800">Extensive Mediastinal Adhesiolysis Dictated</div>
                      <div className="text-[11px] text-slate-500">Details oscillating saw dissection, retrosternal adhesion clearance, and cannulation isolation</div>
                    </div>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={extensiveAdhesiolysisDocumented}
                        onChange={(e) => setExtensiveAdhesiolysisDocumented(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Box 3: Concomitant Valvular Procedures & Surgical Team */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Activity className="w-5 h-5 text-rose-600" />
              3. Concomitant Valvular Procedures &amp; Surgical Team
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Concomitant Intraoperative Procedures
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-slate-800">Tricuspid Ring Annuloplasty (33464-51)</div>
                      <div className="text-[11px] text-slate-500">Prevent severe post-LVAD right ventricular distention</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasTricuspidRepair}
                      onChange={(e) => setHasTricuspidRepair(e.target.checked)}
                      className="h-4 w-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-slate-800">Aortic Valve Oversewing / Closure (33405-51)</div>
                      <div className="text-[11px] text-slate-500">Eliminate aortic insufficiency recirculating loop</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasAorticValveClosure}
                      onChange={(e) => setHasAorticValveClosure(e.target.checked)}
                      className="h-4 w-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Surgical Team Coordination Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'solo', label: 'Solo Surgeon', mod: 'No Mod' },
                    { id: 'co_surgeon_mod62', label: 'Co-Surgeons (Mod 62)', mod: '62.5% Fee' },
                    { id: 'assistant_mod80', label: 'Assistant (Mod 80)', mod: '16% Fee' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSurgicalTeamMode(mode.id as any)}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        surgicalTeamMode === mode.id
                          ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold ring-1 ring-rose-500'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{mode.label}</div>
                      <div className="text-[10px] font-mono text-rose-700 font-semibold">{mode.mod}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Box 4: Post-Op Vasoplegia / Acute RV Failure Critical Care */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <HeartPulse className="w-5 h-5 text-rose-600" />
              4. CVICU Critical Care for Postoperative RV Failure (99291-24)
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-slate-800">Postoperative Acute RV Failure Critical Care (99291)</div>
                  <div className="text-[11px] text-slate-500">Inhaled nitric oxide, inotropic titration, and PA catheter hemodynamic optimization</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={hasRvFailureCriticalCare}
                    onChange={(e) => setHasRvFailureCriticalCare(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                </div>
              </label>

              {hasRvFailureCriticalCare && (
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 pl-6 cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-slate-800">Modifier -24 Appended &amp; Non-Surgical Time Dictated</div>
                    <div className="text-[11px] text-slate-500">Substantiates severe physiological decompensation distinct from standard post-op care</div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={distinctHemodynamicTime}
                      onChange={(e) => setDistinctHemodynamicTime(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Audit Alerts & 837P EDI Generator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Claim Line Ledger */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="font-bold text-navy text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-600" />
                Clean Claim Ledger
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                837P Scrubbed
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {scrubberResult.lines.map((line, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-sm text-navy">{line.code}</span>
                      {line.mod && line.mod !== 'None' && (
                        <span className={`ml-2 text-xs font-mono px-1.5 py-0.5 rounded font-bold ${
                          line.status === 'fatal' ? 'bg-rose-100 text-rose-800' : 'bg-rose-50 text-rose-700'
                        }`}>
                          Mod {line.mod}
                        </span>
                      )}
                      <p className="text-xs text-slate-600 mt-0.5">{line.desc}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-slate-900">
                        ${line.fee.toFixed(2)}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {line.rvu} wRVU
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 italic">{line.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Compliance Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 font-bold text-navy text-base mb-4 border-b border-slate-100 pb-3">
              <Zap className="w-4 h-4 text-amber-500" />
              Real-Time Audit Guidance
            </div>

            <div className="space-y-3">
              {scrubberResult.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                    alert.type === 'fatal'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : alert.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {alert.type === 'fatal' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    ) : alert.type === 'warning' ? (
                      <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                    {alert.title}
                  </div>
                  <p className="text-[11px] text-slate-700">{alert.desc}</p>
                  <div className="mt-1.5 text-[10px] font-mono font-semibold text-slate-500">
                    Authority: {alert.statute}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ANSI 837P EDI Stream */}
          <div className="bg-slate-900 rounded-xl p-4 text-slate-300 font-mono text-[11px] shadow-sm border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                <FileCode className="w-3.5 h-3.5 text-rose-400" />
                ANSI X12 837P Professional Claim Stream
              </div>
              <button
                type="button"
                onClick={handleCopyEdi}
                className="inline-flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy EDI'}
              </button>
            </div>
            <pre className="whitespace-pre-wrap overflow-x-auto text-[10px] leading-tight text-rose-300/90 max-h-48">
              {generateEdiClaim()}
            </pre>
          </div>
        </div>
      </div>

      {/* Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setShowLeadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              &times;
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy font-jakarta">
                  Request Cardiac MCS Practice Audit
                </h3>
                <p className="text-xs text-slate-500">
                  Transmits audit findings directly to Kiran (Aethera Healthcare RCM Director).
                </p>
              </div>
            </div>

            {leadSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-emerald-900">Audit Request Transmitted</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Kiran will review your surgical MCS claim parameters and contact you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Dr. Robert Martinez / Practice Admin"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="robert@cardiothoracic-institute.org"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cardiothoracic Group / Health System Name
                  </label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="e.g. Metro Cardiovascular Institute"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Scrubber Notes / Audit Questions
                  </label>
                  <textarea
                    rows={3}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="Describe any active commercial downcoding, redo sternotomy unbundling denials, or co-surgeon audits..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">HIPAA Zero-PHI Guarantee:</span> Zero patient identifiers are transmitted or stored. Transmits strictly operational billing metrics directly to senior billing leadership.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Transmitting to Kiran...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Transmit Audit Request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
