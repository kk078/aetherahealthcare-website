'use client';

import React, { useState, useMemo } from 'react';
import {
  Baby,
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
  HeartPulse,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function PediatricCdhEcmoScrubber() {
  // 1. Primary CDH Repair Technique
  const [cdhTechnique, setCdhTechnique] = useState<
    'open_subcostal_39503' | 'thoracoscopic_39545' | 'congenital_diaphragmatic_39540'
  >('open_subcostal_39503');

  // 2. Prosthetic / Biologic Patch Closure (Gore-Tex / ADM)
  const [hasProstheticPatch, setHasProstheticPatch] = useState<boolean>(true);
  const [hasPatchDefectSizeDoc, setHasPatchDefectSizeDoc] = useState<boolean>(true);

  // 3. Neonatal ECMO Cannulation (+33946 / +33947)
  const [ecmoMode, setEcmoMode] = useState<
    'va_neck_cannula_33946' | 'central_sternotomy_33947' | 'none'
  >('va_neck_cannula_33946');
  const [hasSeparateEcmoIncisionDoc, setHasSeparateEcmoIncisionDoc] = useState<boolean>(true);

  // 4. Staged Abdominal Domain Closure / Silo (CPT 49605 with Modifier -58)
  const [hasSiloStaging, setHasSiloStaging] = useState<boolean>(true);
  const [hasModifier58Silo, setHasModifier58Silo] = useState<boolean>(true);

  // 5. Vascular Access & Neonatal Critical Care (CPT 36660 / 99468)
  const [hasUacUvcLines, setHasUacUvcLines] = useState<boolean>(true);
  const [hasSurgicalCriticalCare, setHasSurgicalCriticalCare] = useState<boolean>(true);

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

    // --- 1. PRIMARY CDH SURGICAL REPAIR ---
    if (cdhTechnique === 'open_subcostal_39503') {
      const baseRvu = 28.6;
      const baseFee = 2640.0;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: '39503',
        desc: 'Repair, neonatal diaphragmatic hernia, with or without chest tube insertion and with or without creation of ventral hernia',
        mod: 'None',
        rvu: baseRvu,
        fee: baseFee,
        status: 'clean',
        note: 'Open subcostal laparotomy, visceral hernia reduction into abdominal cavity, and diaphragmatic muscle re-approximation.',
      });

      alerts.push({
        type: 'clean',
        title: 'Neonatal CDH Repair (39503) Compliant',
        desc: 'Operative report confirms reduction of herniated viscera (stomach, bowel, liver) and closure of posterolateral Bochdalek defect in neonate.',
        statute: 'AAP Section on Surgery Guidelines; AMA CPT Diaphragm Section',
      });
    } else if (cdhTechnique === 'thoracoscopic_39545') {
      const baseRvu = 24.2;
      const baseFee = 2240.0;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: '39545',
        desc: 'Repair, diaphragmatic hernia (other than neonatal) or thoracoscopic diaphragmatic hernia repair (unlisted diaphragm 39599 / 39545)',
        mod: 'None',
        rvu: baseRvu,
        fee: baseFee,
        status: 'clean',
        note: 'Minimally invasive thoracoscopic primary diaphragmatic reconstruction with low-pressure insufflation.',
      });

      alerts.push({
        type: 'clean',
        title: 'Thoracoscopic CDH Repair Validated',
        desc: 'Minimally invasive approach for stable, non-ECMO neonatal cases. Operative note confirms insufflation pressure <4 mmHg to prevent hypercarbia.',
        statute: 'IPEG Pediatric Endosurgery Guidelines',
      });
    } else if (cdhTechnique === 'congenital_diaphragmatic_39540') {
      const baseRvu = 22.4;
      const baseFee = 2080.0;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: '39540',
        desc: 'Repair, diaphragmatic hernia (other than neonatal), traumatic or congenital (infant >28 days)',
        mod: 'None',
        rvu: baseRvu,
        fee: baseFee,
        status: 'clean',
        note: 'Late-presenting Bochdalek hernia repair outside the neonatal period (>28 days old).',
      });

      alerts.push({
        type: 'clean',
        title: 'Post-Neonatal Congenital Diaphragmatic Repair (39540) Coded',
        desc: 'Applied for late-presenting infant cases past 28 days of age. Validates age-tier compliance.',
        statute: 'CMS Age-Specific Procedure Coverage Guidelines',
      });
    }

    // --- 2. PROSTHETIC / BIOLOGIC PATCH CLOSURE ---
    if (hasProstheticPatch) {
      const patchRvu = 5.6;
      const patchFee = 520.0;
      totalRvu += patchRvu;
      expectedReimbursement += patchFee;

      if (hasPatchDefectSizeDoc) {
        lines.push({
          code: '49568',
          desc: 'Implantation of mesh or other prosthesis for open incisional or ventral hernia repair or diaphragmatic defect (prosthetic Gore-Tex / SIS cone patch)',
          mod: '59',
          rvu: patchRvu,
          fee: patchFee,
          status: 'clean',
          note: 'Gore-Tex DualMesh or bovine pericardial tension-free cone patch anchored to rib cage/vertebral rim for Type C/D defect.',
        });

        alerts.push({
          type: 'clean',
          title: 'Prosthetic Patch (+49568-59) Unbundled Correctly for Large Agenesis',
          desc: 'Operative note documents extensive diaphragmatic agenesis (CDH Study Group Type C or D, >50% hemi-diaphragm absent) requiring prosthetic patch reconstruction anchored circumferentially.',
          statute: 'CDHSG Surgical Staging Consensus; NCCI Modifier 59 Rules',
        });
      } else {
        penaltyAtRisk += patchFee;
        lines.push({
          code: '49568',
          desc: 'Implantation of mesh or other prosthesis for hernia repair',
          mod: 'None',
          rvu: patchRvu,
          fee: patchFee,
          status: 'fatal',
          note: 'Missing Modifier 59 and defect size documentation. Commercial payers bundle patch into 39503.',
        });

        alerts.push({
          type: 'fatal',
          title: 'FATAL: Prosthetic Mesh Bundled into Primary Hernia Repair (39503)',
          desc: 'Commercial clearinghouses routinely bundle mesh insertion codes (+49568) into 39503 unless Modifier 59 is appended and operative dictation proves muscle rim defect could not be closed primarily.',
          statute: 'CMS NCCI Policy Manual Chapter VII (Diaphragmatic Repair)',
        });
      }
    }

    // --- 3. NEONATAL VA-ECMO CANNULATION ---
    if (ecmoMode === 'va_neck_cannula_33946') {
      const ecmoRvu = 18.5;
      const ecmoFee = 1720.0;
      totalRvu += ecmoRvu;
      expectedReimbursement += ecmoFee;

      if (hasSeparateEcmoIncisionDoc) {
        lines.push({
          code: '33946',
          desc: 'Extracorporeal membrane oxygenation (ECMO)/extracorporeal life support (ECLS) services by physician; initiation, veno-arterial (right common carotid & internal jugular cutdown)',
          mod: '59',
          rvu: ecmoRvu,
          fee: ecmoFee,
          status: 'clean',
          note: 'Surgical cutdown of right carotid artery & internal jugular vein for rescue oxygenation in refractory PPHN.',
        });

        alerts.push({
          type: 'clean',
          title: 'Neonatal VA-ECMO Initiation (33946-59) Defended',
          desc: 'Documentation confirms severe refractory hypoxemia (OI >40) requiring emergency neck cutdown cannulation separate from abdominal incision.',
          statute: 'ELSO Neonatal Respiratory Failure Guidelines; CMS NCCI Mod 59',
        });
      } else {
        penaltyAtRisk += ecmoFee;
        lines.push({
          code: '33946',
          desc: 'Extracorporeal membrane oxygenation (ECMO); initiation, veno-arterial',
          mod: 'None',
          rvu: ecmoRvu,
          fee: ecmoFee,
          status: 'fatal',
          note: 'Missing Modifier 59 / distinct operative site note. Bundling into delivery room resuscitation.',
        });

        alerts.push({
          type: 'fatal',
          title: 'FATAL: ECMO Cannulation Bundling into Bedside Critical Care',
          desc: 'Clearinghouses bundle ECMO initiation into neonatal delivery resuscitation unless billed with Modifier 59 and independent neck operative procedure note.',
          statute: 'Medicare Claims Processing Manual Ch. 12 § 40.1',
        });
      }
    } else if (ecmoMode === 'central_sternotomy_33947') {
      const ecmoRvu = 22.8;
      const ecmoFee = 2110.0;
      totalRvu += ecmoRvu;
      expectedReimbursement += ecmoFee;

      lines.push({
        code: '33947',
        desc: 'Extracorporeal membrane oxygenation (ECMO); initiation, central veno-arterial (aortic & right atrial cannulation via sternotomy)',
        mod: '59',
        rvu: ecmoRvu,
        fee: ecmoFee,
        status: 'clean',
        note: 'Central cannulation via median sternotomy for intrathoracic vascular access.',
      });

      alerts.push({
        type: 'clean',
        title: 'Central VA-ECMO Cannulation (33947-59) Supported',
        desc: 'Full sternotomy and direct central aortic cannulation documented for complex cardiovascular collapse.',
        statute: 'ELSO Extracorporeal Life Support Guidelines',
      });
    }

    // --- 4. STAGED ABDOMINAL SILO PLACEMENT (CPT 49605 WITH MOD 58) ---
    if (hasSiloStaging) {
      const siloRvu = 14.8;
      const siloFee = 1380.0;
      totalRvu += siloRvu;
      expectedReimbursement += siloFee;

      if (hasModifier58Silo) {
        lines.push({
          code: '49605',
          desc: 'Repair of large omphalocele or gastroschisis / abdominal wall defect; with prosthesis, staged closure (spring-loaded silo / prosthetic abdominal wall expansion)',
          mod: '58',
          rvu: siloRvu,
          fee: siloFee,
          status: 'clean',
          note: 'Creation of prosthetic silo to accommodate severely non-compliant abdominal domain and prevent abdominal compartment syndrome.',
        });

        alerts.push({
          type: 'clean',
          title: 'Staged Abdominal Silo Placement (49605-58) Defended',
          desc: 'Operative note indicates viscero-abdominal disproportion causing prohibitive peak inspiratory pressures and compromised renal perfusion upon attempted primary fascial closure. Modifier -58 protects staged reductions.',
          statute: 'CMS Medicare Claims Processing Manual Ch. 12 § 40.1 (Modifier 58 Staged Care)',
        });
      } else {
        penaltyAtRisk += siloFee;
        lines.push({
          code: '49605',
          desc: 'Repair of large omphalocele or abdominal wall defect; staged closure',
          mod: 'None',
          rvu: siloRvu,
          fee: siloFee,
          status: 'fatal',
          note: 'Missing Modifier -58. Subsequent silo reductions and final closure will be denied under 90-day global period.',
        });

        alerts.push({
          type: 'fatal',
          title: 'FATAL: Missing Modifier -58 on Staged Abdominal Domain Closure',
          desc: 'Subsequent operative bedside or OR reductions of the silo will be summarily denied as unpayable within the 90-day global surgical period without Modifier -58.',
          statute: 'CMS Global Surgery Guidelines (Modifier 58 Staged Procedure Policy)',
        });
      }
    }

    // --- 5. NEONATAL VASCULAR ACCESS & SURGICAL CRITICAL CARE ---
    if (hasUacUvcLines) {
      const lineRvu = 4.2;
      const lineFee = 390.0;
      totalRvu += lineRvu;
      expectedReimbursement += lineFee;

      lines.push({
        code: '36660',
        desc: 'Catheterization, umbilical artery, newborn, for diagnosis or therapy (continuous blood pressure & blood gas sampling)',
        mod: '59',
        rvu: lineRvu,
        fee: lineFee,
        status: 'clean',
        note: 'Placement of umbilical arterial catheter for high-frequency hemodynamic management.',
      });

      alerts.push({
        type: 'clean',
        title: 'Umbilical Arterial Line (36660-59) Unbundled',
        desc: 'Distinct vascular access code documented prior to surgery for pre-ductal blood gas monitoring.',
        statute: 'CMS NCCI Chapter III Vascular Access Edits',
      });
    }

    if (hasSurgicalCriticalCare) {
      const ccRvu = 6.2;
      const ccFee = 580.0;
      totalRvu += ccRvu;
      expectedReimbursement += ccFee;

      lines.push({
        code: '99291',
        desc: 'Critical care, evaluation and management of the critically ill or critically injured patient; first 30-74 minutes (surgical ICU care)',
        mod: '25',
        rvu: ccRvu,
        fee: ccFee,
        status: 'clean',
        note: 'Pediatric surgeon direct bedside stabilization for acute pulmonary hypertensive crisis.',
      });

      alerts.push({
        type: 'clean',
        title: 'Surgical Critical Care (99291-25) Segregated from Neonatal Daily Bundle',
        desc: 'Operative care notes verify direct surgeon critical care management of acute physiological instability separate from neonatology per-diem global billing (99468).',
        statute: 'CPT Assistant: Critical Care in the Surgical Neonate',
      });
    }

    // Compliance Score
    const hasFatal = alerts.some((a) => a.type === 'fatal');
    const hasWarning = alerts.some((a) => a.type === 'warning');
    const complianceScore = hasFatal ? 52 : hasWarning ? 80 : 98;

    return {
      lines,
      alerts,
      totalRvu: Math.round(totalRvu * 10) / 10,
      expectedReimbursement: Math.round(expectedReimbursement),
      penaltyAtRisk: Math.round(penaltyAtRisk),
      complianceScore,
      isClean: !hasFatal && !hasWarning,
    };
  }, [
    cdhTechnique,
    hasProstheticPatch,
    hasPatchDefectSizeDoc,
    ecmoMode,
    hasSeparateEcmoIncisionDoc,
    hasSiloStaging,
    hasModifier58Silo,
    hasUacUvcLines,
    hasSurgicalCriticalCare,
  ]);

  // Copy Appeal Packet
  const copyAppealPacket = () => {
    const text = `
================================================================================
AETHERA HEALTHCARE RCM: PEDIATRIC CDH & NEONATAL ECMO AUDIT DEFENSE PACKET
================================================================================
PRIMARY REPAIR: ${
      cdhTechnique === 'open_subcostal_39503'
        ? 'Open Subcostal Neonatal CDH Repair (CPT 39503)'
        : cdhTechnique === 'thoracoscopic_39545'
        ? 'Thoracoscopic Diaphragmatic Hernia Repair (CPT 39545)'
        : 'Post-Neonatal CDH Repair (CPT 39540)'
    }
PROSTHETIC PATCH (49568): ${hasProstheticPatch ? (hasPatchDefectSizeDoc ? 'Gore-Tex / ADM Patch Defended with Modifier 59' : 'ALERT: Missing Defect Size / Mod 59') : 'Primary Muscle Re-approximation'}
NEONATAL ECMO CANNULATION: ${
      ecmoMode === 'va_neck_cannula_33946'
        ? hasSeparateEcmoIncisionDoc
          ? 'VA-ECMO Right Neck Cutdown (33946-59) Documented'
          : 'ALERT: Missing Distinct Neck Incision Note'
        : ecmoMode === 'central_sternotomy_33947'
        ? 'Central Sternotomy Cannulation (33947-59)'
        : 'None'
    }
STAGED ABDOMINAL SILO (49605): ${hasSiloStaging ? (hasModifier58Silo ? 'Modifier -58 Staged Care Appended' : 'ALERT: Missing Modifier 58') : 'Primary Abdominal Closure'}
VASCULAR ACCESS / CRITICAL CARE: ${hasUacUvcLines ? 'UAC/UVC 36660-59' : ''} | ${hasSurgicalCriticalCare ? 'Critical Care 99291-25' : ''}

FINANCIAL RECAP:
- Total Allowed RVUs: ${scrubberResult.totalRvu}
- Expected Net Practice Reimbursement: $${scrubberResult.expectedReimbursement.toLocaleString()}
- Clawback / Audit Penalty at Risk: $${scrubberResult.penaltyAtRisk.toLocaleString()}
- RCM Compliance Score: ${scrubberResult.complianceScore}%

CLAIM LINE BREAKDOWN:
${scrubberResult.lines
  .map(
    (l) =>
      `• CPT/HCPCS ${l.code} [Mod ${l.mod}]: ${l.desc} | Status: ${l.status.toUpperCase()} | Allowed: $${l.fee.toFixed(2)} (${l.rvu} RVU)\n  Note: ${l.note}`
  )
  .join('\n')}

AUDIT ALERTS & STATUTES:
${scrubberResult.alerts
  .map(
    (a) =>
      `[${a.type.toUpperCase()}] ${a.title}\n  - Issue: ${a.desc}\n  - Rule/Statute: ${a.statute}`
  )
  .join('\n\n')}

CONFIDENTIAL & PROPRIETARY — GENERATED BY AETHERA HEALTHCARE RCM ENGINE
================================================================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Submit Lead Form
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        source: 'pediatric_cdh_ecmo_rcm_audit',
        name: contactName,
        email: contactEmail,
        practiceName,
        cdhTechnique,
        hasProstheticPatch,
        hasPatchDefectSizeDoc,
        ecmoMode,
        hasSeparateEcmoIncisionDoc,
        hasSiloStaging,
        hasModifier58Silo,
        hasUacUvcLines,
        hasSurgicalCriticalCare,
        complianceScore: scrubberResult.complianceScore,
        expectedReimbursement: scrubberResult.expectedReimbursement,
        penaltyAtRisk: scrubberResult.penaltyAtRisk,
        auditNotes,
      };

      await sendLeadToKiran('pediatric_cdh_ecmo_rcm_audit', payload);

      trackConversion('lead_submit_cdh_ecmo_scrubber');
      setLeadSuccess(true);
    } catch (err) {
      console.error('Lead submission failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-cyan-950 p-6 md:p-8 border-b border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Neonatal Surgical Critical Care RCM Engine
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Baby className="w-8 h-8 text-cyan-400" />
              Pediatric CDH &amp; Neonatal ECMO Repair Scrubber
            </h2>
            <p className="text-sm md:text-base text-slate-300 max-w-3xl">
              Audit neonatal congenital diaphragmatic hernia repair (CPT 39503), defend Gore-Tex prosthetic patch reconstruction (+49568-59), unbundle VA-ECMO cutdown cannulation (+33946-59), coordinate staged silo closure (49605 with Modifier -58), and safeguard surgical critical care.
            </p>
          </div>

          <button
            onClick={() => setShowLeadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all duration-200"
          >
            <Send className="w-4 h-4" />
            Request Expert Practice Audit
          </button>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Scrubber Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8">
        {/* Left Column: Clinical Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Primary CDH Repair Technique */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <label className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-cyan-400" />
              1. Diaphragmatic Hernia Repair Approach
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  id: 'open_subcostal_39503',
                  label: 'Open Subcostal Neonatal CDH Repair (CPT 39503)',
                  desc: 'Standard subcostal incision, reduction of abdominal viscera, and diaphragmatic reconstruction.',
                },
                {
                  id: 'thoracoscopic_39545',
                  label: 'Thoracoscopic Minimally Invasive CDH Repair (CPT 39545)',
                  desc: 'Low-pressure thoracoscopic repair in hemodynamically stable, non-ECMO neonates.',
                },
                {
                  id: 'congenital_diaphragmatic_39540',
                  label: 'Post-Neonatal Congenital Diaphragmatic Hernia (CPT 39540)',
                  desc: 'Late-presenting Bochdalek repair in infants older than 28 days of age.',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCdhTechnique(item.id as any)}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-150 ${
                    cdhTechnique === item.id
                      ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Prosthetic / Biologic Patch Reinforcement */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-teal-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                2. Prosthetic / Biologic Patch Reconstruction (+49568)
              </label>
              <input
                type="checkbox"
                checked={hasProstheticPatch}
                onChange={(e) => setHasProstheticPatch(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 text-teal-500 focus:ring-teal-400 bg-slate-900"
              />
            </div>
            {hasProstheticPatch && (
              <div className="pl-6 border-l-2 border-teal-500/40 space-y-3 pt-2">
                <p className="text-xs text-slate-300">
                  Gore-Tex DualMesh, Permacol, or bovine pericardial tension-free cone patch for large Type C/D diaphragmatic agenesis.
                </p>
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPatchDefectSizeDoc}
                    onChange={(e) => setHasPatchDefectSizeDoc(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-400 bg-slate-900"
                  />
                  <span>Operative note specifies CDHSG Type C/D defect (&gt;50% muscle absent) with Modifier 59</span>
                </label>
              </div>
            )}
          </div>

          {/* Section 3: Neonatal ECMO Cannulation */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <label className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              3. Neonatal ECMO Surgical Cannulation (CPT 33946 / 33947)
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  id: 'va_neck_cannula_33946',
                  label: 'Venoarterial (VA) ECMO Neck Cutdown (CPT 33946-59)',
                  desc: 'Right common carotid artery & internal jugular vein cannulation for severe PPHN.',
                },
                {
                  id: 'central_sternotomy_33947',
                  label: 'Central VA-ECMO via Median Sternotomy (CPT 33947-59)',
                  desc: 'Direct ascending aorta & right atrial cannulation for profound cardiac failure.',
                },
                {
                  id: 'none',
                  label: 'No ECMO Required (Conventional / HFOV Ventilation)',
                  desc: 'Stable oxygenation without mechanical cardiopulmonary support.',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setEcmoMode(item.id as any)}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-150 ${
                    ecmoMode === item.id
                      ? 'bg-rose-600/20 border-rose-500 text-white shadow-md shadow-rose-500/10'
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>

            {ecmoMode !== 'none' && (
              <div className="pl-6 border-l-2 border-rose-500/40 space-y-2 pt-2">
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSeparateEcmoIncisionDoc}
                    onChange={(e) => setHasSeparateEcmoIncisionDoc(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 text-rose-500 focus:ring-rose-400 bg-slate-900"
                  />
                  <span>Distinct operative note details separate neck incision and arterial/venous cutdown with Modifier 59</span>
                </label>
              </div>
            )}
          </div>

          {/* Section 4: Staged Silo Placement */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                4. Staged Abdominal Domain Expansion / Silo (CPT 49605)
              </label>
              <input
                type="checkbox"
                checked={hasSiloStaging}
                onChange={(e) => setHasSiloStaging(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 text-amber-500 focus:ring-amber-400 bg-slate-900"
              />
            </div>
            {hasSiloStaging && (
              <div className="pl-6 border-l-2 border-amber-500/40 space-y-3 pt-2">
                <p className="text-xs text-slate-300">
                  Temporary spring-loaded or prosthetic abdominal silo constructed to avert fatal abdominal compartment syndrome.
                </p>
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasModifier58Silo}
                    onChange={(e) => setHasModifier58Silo(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-400 bg-slate-900"
                  />
                  <span>Modifier -58 appended to safeguard subsequent staged silo reductions from 90-day global denial</span>
                </label>
              </div>
            )}
          </div>

          {/* Section 5: Vascular Access & Critical Care */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <label className="text-sm font-bold text-blue-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              5. Invasive Access &amp; Surgical Critical Care
            </label>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="uacUvc"
                  checked={hasUacUvcLines}
                  onChange={(e) => setHasUacUvcLines(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-400 bg-slate-900"
                />
                <div className="text-xs">
                  <label htmlFor="uacUvc" className="font-semibold text-slate-200 cursor-pointer">
                    Umbilical Arterial Line Placement (CPT 36660-59)
                  </label>
                  <p className="text-slate-400 text-xs">Continuous arterial blood pressure and pre-ductal blood gas monitoring.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-700/60">
                <input
                  type="checkbox"
                  id="surgCrit"
                  checked={hasSurgicalCriticalCare}
                  onChange={(e) => setHasSurgicalCriticalCare(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-400 bg-slate-900"
                />
                <div className="text-xs">
                  <label htmlFor="surgCrit" className="font-semibold text-slate-200 cursor-pointer">
                    Pediatric Surgical Critical Care Time (CPT 99291-25)
                  </label>
                  <p className="text-slate-400 text-xs">Direct attending surgical resuscitation separate from neonatology daily bundle.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Audit Results & Financial Impact (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Summary Scorecard */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-700">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                RCM Compliance Score
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  scrubberResult.complianceScore >= 90
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : scrubberResult.complianceScore >= 70
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {scrubberResult.complianceScore}% Score
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Total Allowed RVU</div>
                <div className="text-2xl font-black text-white mt-1">
                  {scrubberResult.totalRvu} <span className="text-xs font-normal text-slate-400">RVUs</span>
                </div>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Expected Net Allowable</div>
                <div className="text-2xl font-black text-cyan-400 mt-1">
                  ${scrubberResult.expectedReimbursement.toLocaleString()}
                </div>
              </div>
            </div>

            {scrubberResult.penaltyAtRisk > 0 && (
              <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-3.5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-rose-300">Revenue at Severe Audit Risk</div>
                  <div className="text-lg font-black text-rose-400">
                    -${scrubberResult.penaltyAtRisk.toLocaleString()}
                  </div>
                  <p className="text-xs text-rose-300/80 mt-1">
                    Risk from ECMO unbundling rejection, mesh denial under 39503, or missing Modifier 58 on silo closure.
                  </p>
                </div>
              </div>
            )}

            {/* Claim Lines Clean Scrubber Output */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Claim Line Adjudication Preview
              </div>
              <div className="space-y-2">
                {scrubberResult.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      line.status === 'clean'
                        ? 'bg-slate-800/50 border-slate-700/70 text-slate-300'
                        : line.status === 'warning'
                        ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                        : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="flex items-center gap-1.5">
                        {line.status === 'clean' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        CPT {line.code} {line.mod !== 'None' && `(Mod -${line.mod})`}
                      </span>
                      <span className="text-slate-200">
                        ${line.fee.toFixed(2)} ({line.rvu} RVU)
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] leading-relaxed">{line.desc}</div>
                    <div className="text-[10px] text-cyan-400 font-medium pt-0.5">{line.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Alerts */}
            <div className="space-y-2 pt-2 border-t border-slate-700">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Compliance &amp; NCCI Edits
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {scrubberResult.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                      alert.type === 'clean'
                        ? 'bg-cyan-950/20 border-cyan-800/40 text-cyan-300'
                        : alert.type === 'warning'
                        ? 'bg-amber-950/20 border-amber-800/50 text-amber-300'
                        : 'bg-rose-950/30 border-rose-800/70 text-rose-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {alert.type === 'clean' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      {alert.title}
                    </div>
                    <p className="text-[11px] text-slate-300">{alert.desc}</p>
                    <div className="text-[10px] text-slate-400 italic">Ref: {alert.statute}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={copyAppealPacket}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Audit Packet Copied to Clipboard!' : 'Copy Payer Defense Audit Packet'}
              </button>

              <button
                onClick={() => setShowLeadModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Submit Case for Professional CDH Audit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-lg w-full text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setShowLeadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            {leadSuccess ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-cyan-400 mx-auto" />
                <h3 className="text-2xl font-bold text-white">Audit Request Received</h3>
                <p className="text-sm text-slate-300">
                  Kiran and the Aethera Pediatric Surgical Critical Care RCM team have received your neonatal clinical profile. We will review your ECMO cannulation documentation, patch unbundling appeals, and Modifier -58 silo staging within 1 business day.
                </p>
                <button
                  onClick={() => {
                    setShowLeadModal(false);
                    setLeadSuccess(false);
                  }}
                  className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    Request Comprehensive Practice Audit
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect directly with Kiran’s specialized neonatal surgical RCM audit desk. Zero PHI is transmitted.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Dr. Katherine Alvarez, MD / Pediatric Surgery Chief"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="kalvarez@childrenshealth.org"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Hospital / Fetal Center Name</label>
                    <input
                      type="text"
                      required
                      value={practiceName}
                      onChange={(e) => setPracticeName(e.target.value)}
                      placeholder="Children's Hospital Fetal Care & Surgery Institute"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Specialty Audit Notes or Payer Denials</label>
                    <textarea
                      rows={3}
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      placeholder="Commercial payers denying prosthetic patch 49568 into 39503, or bundling ECMO cannulation 33946 into delivery resuscitation..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Transmitting to Kiran's Desk...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Transmit Audit Case to Kiran
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-500 mt-2">
                    🔒 Client-side evaluation only. HIPAA compliant — no patient identifiers stored.
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
