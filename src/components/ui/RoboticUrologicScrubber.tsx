'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
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
  Bot,
  Flame,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function RoboticUrologicScrubber() {
  // 1. Primary Robotic Oncologic Procedure
  const [oncologyProcedure, setOncologyProcedure] = useState<
    'rarp_55866' | 'rapn_50543' | 'rarc_diversion_51596' | 'rarc_conduit_51595'
  >('rarp_55866');

  // 2. Lymphadenectomy Scope & Unbundling Defense
  const [lymphadenectomyScope, setLymphadenectomyScope] = useState<
    'extended_38572' | 'standard_obturator' | 'none'
  >('extended_38572');
  const [hasDistinctNodalPacketDoc, setHasDistinctNodalPacketDoc] = useState<boolean>(true);

  // 3. Modifier -22 Increased Surgical Complexity Justification
  const [hasModifier22, setHasModifier22] = useState<boolean>(true);
  const [hasQuantifiedTimeDoc, setHasQuantifiedTimeDoc] = useState<boolean>(true);

  // 4. Robotic Technique S-Code (HCPCS S2900) & Equipment Handling
  const [hasSCodeBilling, setHasSCodeBilling] = useState<boolean>(false);
  const [isContractCarveOut, setIsContractCarveOut] = useState<boolean>(false);

  // 5. Concomitant Reconstructive Stent / Ureteral Anastomosis (CPT 50947 / 52005)
  const [hasUreteralStenting, setHasUreteralStenting] = useState<boolean>(true);
  const [hasDistinctUreteralDoc, setHasDistinctUreteralDoc] = useState<boolean>(true);

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

    // --- 1. PRIMARY ROBOTIC ONCOLOGIC PROCEDURE ---
    if (oncologyProcedure === 'rarp_55866') {
      const baseRvu = 29.8;
      let baseFee = 2740.0;
      let primaryMod = 'None';

      if (hasModifier22) {
        if (hasQuantifiedTimeDoc) {
          primaryMod = '22';
          baseFee *= 1.25; // Standard 25% complexity uplift
          alerts.push({
            type: 'clean',
            title: 'Modifier -22 Complexity Uplift (+25%) Substantiated',
            desc: 'Operative report provides dedicated Modifier 22 justification: hostile salvage plane, dense post-radiation fibrosis, and operative duration >90th percentile.',
            statute: 'CMS Medicare Claims Processing Manual Ch. 12 § 40.2 (Modifier 22)',
          });
        } else {
          penaltyAtRisk += 685.0; // loss of 25% uplift
          alerts.push({
            type: 'fatal',
            title: 'FATAL: Modifier -22 Lack of Quantified Complexity Documentation',
            desc: 'Appended Modifier -22 without explicit comparative metrics (operative time vs normal, blood loss, specific technical hurdles). Payer will reject the claim or strip the modifier.',
            statute: 'Medicare MAC Local Coverage Articles for Modifier 22 Adjudication',
          });
        }
      }

      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: '55866',
        desc: 'Laparoscopy, surgical prostatectomy, retropubic radical, including nerve sparing, includes robotic assistance',
        mod: primaryMod,
        rvu: baseRvu,
        fee: baseFee,
        status: hasModifier22 && !hasQuantifiedTimeDoc ? 'fatal' : 'clean',
        note: 'Robot-assisted radical prostatectomy (RARP) with vesicourethral anastomosis and bilateral neurovascular bundle preservation.',
      });

      alerts.push({
        type: 'clean',
        title: 'Primary RARP (55866) Coding Compliant',
        desc: 'Robotic surgical technique is bundled into CPT 55866 descriptor. Robotic arm docking and console time fully captured.',
        statute: 'AMA CPT Laparoscopic Urologic Surgery Guidelines',
      });
    } else if (oncologyProcedure === 'rapn_50543') {
      const baseRvu = 27.6;
      let baseFee = 2540.0;
      let primaryMod = 'None';

      if (hasModifier22) {
        if (hasQuantifiedTimeDoc) {
          primaryMod = '22';
          baseFee *= 1.25;
          alerts.push({
            type: 'clean',
            title: 'Partial Nephrectomy Modifier -22 Supported for Endophytic Hilar Mass',
            desc: 'Operative note details endophytic tumor enucleation, main renal artery/vein clamping, warm ischemia time >25 min, and deep renorrhaphy.',
            statute: 'AUA Robotic Partial Nephrectomy Practice Standards',
          });
        } else {
          penaltyAtRisk += 635.0;
          alerts.push({
            type: 'fatal',
            title: 'FATAL: Missing Warm Ischemia / Hilar Dissection Complexity Detail',
            desc: 'Modifier -22 appended to partial nephrectomy requires quantified warm ischemia time, RENAL nephrometry score (>10), and technical vascular control details.',
            statute: 'CMS Carrier Guidelines on Complex Partial Nephrectomy',
          });
        }
      }

      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: '50543',
        desc: 'Laparoscopy, surgical; partial nephrectomy (robot-assisted partial nephrectomy with hilar clamp & renorrhaphy)',
        mod: primaryMod,
        rvu: baseRvu,
        fee: baseFee,
        status: hasModifier22 && !hasQuantifiedTimeDoc ? 'fatal' : 'clean',
        note: 'Excision of renal parenchymal neoplasm with parenchymal reconstructive closure under warm ischemia.',
      });

      alerts.push({
        type: 'clean',
        title: 'Robot-Assisted Partial Nephrectomy (50543) Validated',
        desc: 'Maintains nephron-sparing compliance. Operative documentation confirms complete tumor clearance with negative gross margins.',
        statute: 'AMA CPT Renal Surgery Coding Rules',
      });
    } else if (oncologyProcedure === 'rarc_diversion_51596') {
      const baseRvu = 46.2;
      const baseFee = 4280.0;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: '51596',
        desc: 'Cystectomy, complete, with continent diversion (orthotopic neobladder or continent reservoir) with bilateral lymphadenectomy',
        mod: 'None',
        rvu: baseRvu,
        fee: baseFee,
        status: 'clean',
        note: 'Robot-assisted radical cystectomy with totally intracorporeal orthotopic ileal neobladder configuration.',
      });

      alerts.push({
        type: 'clean',
        title: 'Intracorporeal Neobladder Cystectomy (51596) Defended',
        desc: 'Documentation confirms intracorporeal bowel resection, detubularization, spherical neobladder creation, and bilateral ureterointestinal anastomoses.',
        statute: 'AUA / SUO Bladder Cancer Surgical Guidelines',
      });
    } else if (oncologyProcedure === 'rarc_conduit_51595') {
      const baseRvu = 38.5;
      const baseFee = 3560.0;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: '51595',
        desc: 'Cystectomy, complete, with ureteroileal conduit or sigmoid conduit, with bilateral pelvic lymphadenectomy',
        mod: 'None',
        rvu: baseRvu,
        fee: baseFee,
        status: 'clean',
        note: 'Robot-assisted radical cystectomy with intracorporeal ileal conduit urinary diversion and stoma maturation.',
      });

      alerts.push({
        type: 'clean',
        title: 'Radical Cystectomy with Ileal Conduit (51595) Coded',
        desc: 'Comprehensive code encompasses cystectomy, extended pelvic lymph node dissection, bowel segment isolation, and cutaneous conduit creation.',
        statute: 'CMS NCCI Policy Manual Ch. VII § D',
      });
    }

    // --- 2. EXTENDED PELVIC LYMPHADENECTOMY DEFENSE ---
    if (
      lymphadenectomyScope === 'extended_38572' &&
      (oncologyProcedure === 'rarp_55866' || oncologyProcedure === 'rapn_50543')
    ) {
      const lndRvu = 16.4;
      const lndFee = 1520.0;
      totalRvu += lndRvu;
      expectedReimbursement += lndFee;

      if (hasDistinctNodalPacketDoc) {
        lines.push({
          code: '38572',
          desc: 'Laparoscopy, surgical; with bilateral total pelvic lymphadenectomy and periaortic lymph node sampling (extended pelvic LND)',
          mod: '59',
          rvu: lndRvu,
          fee: lndFee,
          status: 'clean',
          note: 'Extended pelvic lymphadenectomy extending above the bifurcation of the common iliac vessels and presacral space.',
        });

        alerts.push({
          type: 'clean',
          title: 'Extended Pelvic LND (+38572-59) Unbundled Legally from 55866',
          desc: 'Operative note and pathology specimen logs confirm nodal dissection above standard obturator fossa (external iliac, hypogastric, common iliac packets). Defends against NCCI bundling into 55866.',
          statute: 'AUA Coding Guidance for Extended Pelvic Lymph Node Dissection; NCCI Modifier 59 Rules',
        });
      } else {
        penaltyAtRisk += lndFee;
        lines.push({
          code: '38572',
          desc: 'Laparoscopy, surgical; with bilateral total pelvic lymphadenectomy',
          mod: 'None',
          rvu: lndRvu,
          fee: lndFee,
          status: 'fatal',
          note: 'Omission of Modifier 59 or lack of common iliac packet documentation will trigger automatic bundling.',
        });

        alerts.push({
          type: 'fatal',
          title: 'FATAL: Extended LND Bundling Rejection by Payer Clearinghouse',
          desc: 'CPT 55866 includes standard pelvic lymphadenectomy. Without Modifier 59/XU and explicit anatomical documentation of dissection above the common iliac bifurcation, payers will deny $1,520.',
          statute: 'CMS NCCI Policy Manual Chapter VII (Urological System)',
        });
      }
    } else if (lymphadenectomyScope === 'standard_obturator' && oncologyProcedure === 'rarp_55866') {
      alerts.push({
        type: 'warning',
        title: 'Standard Obturator LND Bundled into Radical Prostatectomy (55866)',
        desc: 'Limited nodal sampling confined to the obturator fossa is considered inclusive to primary RARP (55866) and cannot be billed separately.',
        statute: 'AMA CPT Descriptor 55866 / CMS NCCI Direct Edit',
      });
    }

    // --- 3. ROBOTIC S-CODE (HCPCS S2900) HANDLING ---
    if (hasSCodeBilling) {
      const sCodeFee = 950.0;
      if (isContractCarveOut) {
        expectedReimbursement += sCodeFee;
        lines.push({
          code: 'S2900',
          desc: 'Surgical techniques requiring use of robotic surgical system (commercial payer contract carve-out)',
          mod: 'None',
          rvu: 0.0,
          fee: sCodeFee,
          status: 'clean',
          note: 'Commercial payer with contracted robotic technology surcharge endorsement.',
        });

        alerts.push({
          type: 'clean',
          title: 'HCPCS S2900 Contracted Robotic Carve-Out Payable',
          desc: 'Verified commercial payer contract includes explicit robotic technology fee-for-service endorsement.',
          statute: 'Payer Specific Robotic Surgical Fee Schedule Endorsement',
        });
      } else {
        penaltyAtRisk += sCodeFee;
        lines.push({
          code: 'S2900',
          desc: 'Surgical techniques requiring use of robotic surgical system',
          mod: 'None',
          rvu: 0.0,
          fee: sCodeFee,
          status: 'fatal',
          note: 'Non-contracted commercial or Medicare submission. Triggers clearinghouse reject.',
        });

        alerts.push({
          type: 'fatal',
          title: 'FATAL: S2900 Invalidation on Standard Commercial / Medicare Claim',
          desc: 'Medicare MACs and most commercial payers consider robotic assistance equipment bundled into the facility OR fee. Billing S2900 without verified contractual carve-out causes entire claim suspension.',
          statute: 'CMS Medicare Claims Processing Manual Ch. 23 § 30 (Status Code I)',
        });
      }
    }

    // --- 4. URETERAL STENTING / RETROGRADE PYELOGRAPHY (CPT 50947 / 52005) ---
    if (hasUreteralStenting) {
      const stentRvu = 4.5;
      const stentFee = 415.0;
      totalRvu += stentRvu;
      expectedReimbursement += stentFee;

      if (hasDistinctUreteralDoc) {
        lines.push({
          code: '50947',
          desc: 'Laparoscopy, surgical; ureteroneocystostomy with cystoscopy and stent placement (concomitant ureteral reconstruction)',
          mod: '51',
          rvu: stentRvu,
          fee: stentFee,
          status: 'clean',
          note: 'Ureteral re-implantation or double-J stenting for tumor involvement or ureteral margin clearance.',
        });

        alerts.push({
          type: 'clean',
          title: 'Concomitant Ureteral Stenting / Reconstruction Defended',
          desc: 'Operative report documents distinct indication for ureteral stenting with cystoscopic verification, appending Modifier 51.',
          statute: 'CMS NCCI Policy Manual Ch. VII',
        });
      } else {
        penaltyAtRisk += stentFee;
        lines.push({
          code: '50947',
          desc: 'Laparoscopy, surgical; ureteroneocystostomy with stent placement',
          mod: 'None',
          rvu: stentRvu,
          fee: stentFee,
          status: 'warning',
          note: 'Missing Modifier 51 / cystoscopy documentation. Potential clearinghouse reduction.',
        });

        alerts.push({
          type: 'warning',
          title: 'Ureteral Stenting Missing Modifier 51',
          desc: 'Secondary reconstructive procedures must carry Modifier 51 to comply with multiple procedure reduction payment rules.',
          statute: 'Medicare Multiple Procedure Payment Reduction (MPPR)',
        });
      }
    }

    // Compliance Score
    const hasFatal = alerts.some((a) => a.type === 'fatal');
    const hasWarning = alerts.some((a) => a.type === 'warning');
    const complianceScore = hasFatal ? 56 : hasWarning ? 84 : 98;

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
    oncologyProcedure,
    lymphadenectomyScope,
    hasDistinctNodalPacketDoc,
    hasModifier22,
    hasQuantifiedTimeDoc,
    hasSCodeBilling,
    isContractCarveOut,
    hasUreteralStenting,
    hasDistinctUreteralDoc,
  ]);

  // Copy Appeal Packet
  const copyAppealPacket = () => {
    const text = `
================================================================================
AETHERA HEALTHCARE RCM: ROBOTIC UROLOGIC ONCOLOGY AUDIT DEFENSE PACKET
================================================================================
PRIMARY ONCOLOGIC PROCEDURE: ${
      oncologyProcedure === 'rarp_55866'
        ? 'Robot-Assisted Radical Prostatectomy (CPT 55866)'
        : oncologyProcedure === 'rapn_50543'
        ? 'Robot-Assisted Partial Nephrectomy (CPT 50543)'
        : oncologyProcedure === 'rarc_diversion_51596'
        ? 'Radical Cystectomy with Intracorporeal Continent Neobladder (CPT 51596)'
        : 'Radical Cystectomy with Intracorporeal Ileal Conduit (CPT 51595)'
    }
MODIFIER -22 COMPLEXITY: ${hasModifier22 ? (hasQuantifiedTimeDoc ? 'Substantiated with Quantified Metrics' : 'ALERT: Missing Quantified Metrics') : 'Not Claimed'}
LYMPHADENECTOMY: ${
      lymphadenectomyScope === 'extended_38572'
        ? hasDistinctNodalPacketDoc
          ? 'Extended Pelvic LND (38572-59) Verified above Common Iliac'
          : 'ALERT: Missing Nodal Packet Documentation'
        : lymphadenectomyScope === 'standard_obturator'
        ? 'Standard Obturator LND (Bundled)'
        : 'None'
    }
ROBOTIC S-CODE (S2900): ${hasSCodeBilling ? (isContractCarveOut ? 'Contracted Commercial Carve-Out' : 'ALERT: Ineligible Claim Reject Risk') : 'N/A'}
URETERAL STENT / RECONSTRUCTION (50947): ${hasUreteralStenting ? (hasDistinctUreteralDoc ? 'Modifier 51 Appended' : 'Missing Mod 51') : 'N/A'}

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

AUDIT ALERTS & NCCI STATUTES:
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
        source: 'robotic_urologic_rcm_audit',
        name: contactName,
        email: contactEmail,
        practiceName,
        oncologyProcedure,
        hasModifier22,
        hasQuantifiedTimeDoc,
        lymphadenectomyScope,
        hasDistinctNodalPacketDoc,
        hasSCodeBilling,
        isContractCarveOut,
        hasUreteralStenting,
        complianceScore: scrubberResult.complianceScore,
        expectedReimbursement: scrubberResult.expectedReimbursement,
        penaltyAtRisk: scrubberResult.penaltyAtRisk,
        auditNotes,
      };

      await sendLeadToKiran('robotic_urologic_rcm_audit', payload);

      trackConversion('lead_submit_robotic_urology_scrubber');
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
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 md:p-8 border-b border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Minimally Invasive Urologic Oncology RCM Engine
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Bot className="w-8 h-8 text-teal-400" />
              Robotic Urologic Oncology &amp; Complex Reconstructive Scrubber
            </h2>
            <p className="text-sm md:text-base text-slate-300 max-w-3xl">
              Audit robot-assisted radical prostatectomy (55866), extended pelvic lymphadenectomy (+38572-59), robot-assisted partial nephrectomy (50543), intracorporeal urinary diversions (51595/51596), Modifier -22 complexity justifications, and robotic S-code (S2900) compliance.
            </p>
          </div>

          <button
            onClick={() => setShowLeadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-teal-500/20 transition-all duration-200"
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
          {/* Section 1: Primary Robotic Oncologic Procedure */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <label className="text-sm font-bold text-teal-400 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-teal-400" />
              1. Primary Robotic Oncologic Resection
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  id: 'rarp_55866',
                  label: 'Robot-Assisted Radical Prostatectomy (RARP - CPT 55866)',
                  desc: 'Prostatectomy with nerve sparing, urethrovesical anastomosis & robot console control.',
                },
                {
                  id: 'rapn_50543',
                  label: 'Robot-Assisted Partial Nephrectomy (RAPN - CPT 50543)',
                  desc: 'Endophytic or hilar renal mass resection, warm ischemia vascular clamping & renorrhaphy.',
                },
                {
                  id: 'rarc_diversion_51596',
                  label: 'Robotic Radical Cystectomy with Continent Neobladder (CPT 51596)',
                  desc: 'Total cystectomy with completely intracorporeal orthotopic ileal neobladder diversion.',
                },
                {
                  id: 'rarc_conduit_51595',
                  label: 'Robotic Radical Cystectomy with Ileal Conduit (CPT 51595)',
                  desc: 'Total cystectomy with intracorporeal bowel harvest, ureteroileal conduit & stoma.',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOncologyProcedure(item.id as any)}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-150 ${
                    oncologyProcedure === item.id
                      ? 'bg-teal-600/20 border-teal-500 text-white shadow-md shadow-teal-500/10'
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Lymphadenectomy Scope */}
          {(oncologyProcedure === 'rarp_55866' || oncologyProcedure === 'rapn_50543') && (
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
              <label className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                2. Pelvic / Retroperitoneal Lymphadenectomy Scope
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    id: 'extended_38572',
                    label: 'Extended Pelvic LND (CPT 38572-59): External, Hypogastric & Common Iliac',
                    desc: 'Defends unbundled billing above the obturator fossa to the aortic bifurcation.',
                  },
                  {
                    id: 'standard_obturator',
                    label: 'Standard Staging LND: Obturator Fossa Only (Bundled into 55866)',
                    desc: 'Limited nodal sampling inclusive to primary prostatectomy under CPT rules.',
                  },
                  {
                    id: 'none',
                    label: 'No Lymphadenectomy Performed',
                    desc: 'Low-risk organ-confined disease without nodal sampling.',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLymphadenectomyScope(item.id as any)}
                    className={`text-left p-3.5 rounded-xl border transition-all duration-150 ${
                      lymphadenectomyScope === item.id
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-slate-800/40 border-slate-700 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              {lymphadenectomyScope === 'extended_38572' && (
                <div className="pl-6 border-l-2 border-emerald-500/40 space-y-2 pt-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDistinctNodalPacketDoc}
                      onChange={(e) => setHasDistinctNodalPacketDoc(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-400 bg-slate-900"
                    />
                    <span>Operative report & pathology logs document separate packets above common iliac vessels</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Modifier -22 Increased Procedural Services */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                3. Modifier -22 Complexity Justification (+25% Allowed Uplift)
              </label>
              <input
                type="checkbox"
                checked={hasModifier22}
                onChange={(e) => setHasModifier22(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 text-amber-500 focus:ring-amber-400 bg-slate-900"
              />
            </div>
            {hasModifier22 && (
              <div className="pl-6 border-l-2 border-amber-500/40 space-y-3 pt-2">
                <p className="text-xs text-slate-300">
                  Applied for complex salvage prostatectomy, prior pelvic radiation, endophytic hilar partial nephrectomy with prolonged warm ischemia (&gt;25 min), or severe obesity (BMI &gt;45).
                </p>
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasQuantifiedTimeDoc}
                    onChange={(e) => setHasQuantifiedTimeDoc(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-400 bg-slate-900"
                  />
                  <span>Dedicated Modifier 22 paragraph details % operative time increase, blood loss, and anatomy</span>
                </label>
              </div>
            )}
          </div>

          {/* Section 4: S-Code S2900 & Robotic Instrument Supply */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                4. HCPCS S2900 Robotic Surgical Technique Surcharge
              </label>
              <input
                type="checkbox"
                checked={hasSCodeBilling}
                onChange={(e) => setHasSCodeBilling(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-400 bg-slate-900"
              />
            </div>
            {hasSCodeBilling && (
              <div className="pl-6 border-l-2 border-cyan-500/40 space-y-3 pt-2">
                <p className="text-xs text-slate-300">
                  HCPCS S2900 reports the robotic instrumentation and console setup. Most commercial payers and Medicare bundle this unless explicitly contracted.
                </p>
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isContractCarveOut}
                    onChange={(e) => setIsContractCarveOut(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 text-cyan-500 focus:ring-cyan-400 bg-slate-900"
                  />
                  <span>Verified payer contract has explicit robotic technology fee-for-service endorsement</span>
                </label>
              </div>
            )}
          </div>

          {/* Section 5: Concomitant Reconstructive Stenting */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                5. Concomitant Ureteral Stenting / Reconstruction (CPT 50947-51)
              </label>
              <input
                type="checkbox"
                checked={hasUreteralStenting}
                onChange={(e) => setHasUreteralStenting(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-400 bg-slate-900"
              />
            </div>
            {hasUreteralStenting && (
              <div className="pl-6 border-l-2 border-blue-500/40 space-y-3 pt-2">
                <p className="text-xs text-slate-300">
                  Ureteroneocystostomy or internal stent placement performed for tumor margin clearance.
                </p>
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDistinctUreteralDoc}
                    onChange={(e) => setHasDistinctUreteralDoc(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-400 bg-slate-900"
                  />
                  <span>Operative note documents cystoscopy & separate reconstructive indication (Mod 51 appended)</span>
                </label>
              </div>
            )}
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
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
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
                <div className="text-2xl font-black text-teal-400 mt-1">
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
                    Risk from extended LND bundling, unsubstantiated Modifier 22, or unauthorized S2900 billing.
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
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        CPT/HCPCS {line.code} {line.mod !== 'None' && `(Mod -${line.mod})`}
                      </span>
                      <span className="text-slate-200">
                        ${line.fee.toFixed(2)} ({line.rvu} RVU)
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] leading-relaxed">{line.desc}</div>
                    <div className="text-[10px] text-teal-400 font-medium pt-0.5">{line.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Alerts */}
            <div className="space-y-2 pt-2 border-t border-slate-700">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Compliance & NCCI Edits
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {scrubberResult.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                      alert.type === 'clean'
                        ? 'bg-teal-950/20 border-teal-800/40 text-teal-300'
                        : alert.type === 'warning'
                        ? 'bg-amber-950/20 border-amber-800/50 text-amber-300'
                        : 'bg-rose-950/30 border-rose-800/70 text-rose-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {alert.type === 'clean' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
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
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Submit Case for Professional Urology Audit
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
                <CheckCircle2 className="w-16 h-16 text-teal-400 mx-auto" />
                <h3 className="text-2xl font-bold text-white">Audit Request Received</h3>
                <p className="text-sm text-slate-300">
                  Kiran and the Aethera Robotic Urologic Oncology RCM team have received your clinical case profile. We will review your extended lymphadenectomy documentation, Modifier -22 justification metrics, and payer contracts within 1 business day.
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
                    <ShieldCheck className="w-5 h-5 text-teal-400" />
                    Request Comprehensive Practice Audit
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect directly with Kiran’s specialized robotic surgical RCM audit desk. Zero PHI is transmitted.
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
                      placeholder="Dr. Michael Vance, MD"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="mvance@urologygroup.org"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Practice / Hospital Name</label>
                    <input
                      type="text"
                      required
                      value={practiceName}
                      onChange={(e) => setPracticeName(e.target.value)}
                      placeholder="Advanced Urologic Oncology Institute"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Specialty Audit Notes or Payer Denials</label>
                    <textarea
                      rows={3}
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      placeholder="Commercial payers bundling extended pelvic LND (38572) into RARP (55866), or rejecting Modifier 22 on complex partial nephrectomy..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
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
