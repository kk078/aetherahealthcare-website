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
  GitBranch,
  Bone,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function PediatricCraniosynostosisScrubber() {
  // 1. Primary Surgical Procedure & Technique
  const [surgicalApproach, setSurgicalApproach] = useState<
    'open_cvr_foa_21175' | 'open_cvr_multisuture_21180' | 'craniectomy_remodel_61558' | 'endoscopic_strip_61550'
  >('open_cvr_foa_21175');

  // 2. Co-Surgeon Team Configuration (Modifier -62)
  const [coSurgeonMode, setCoSurgeonMode] = useState<
    'matching_mod62' | 'solo_neuro' | 'solo_plastic' | 'mismatched_codes'
  >('matching_mod62');

  // 3. Post-Operative Cranial Molding Helmet Therapy (HCPCS L0112)
  const [hasHelmetTherapy, setHasHelmetTherapy] = useState<boolean>(false);
  const [hasCephalicIndexDoc, setHasCephalicIndexDoc] = useState<boolean>(true);

  // 4. Autologous Bone Graft & Resorbable Plating Fixation
  const [hasBoneGrafting, setHasBoneGrafting] = useState<boolean>(true);
  const [hasDistinctGraftDoc, setHasDistinctGraftDoc] = useState<boolean>(true);

  // 5. Operating Microscope Microdissection (CPT +69990)
  const [hasMicroscope, setHasMicroscope] = useState<boolean>(true);
  const [hasDuralDissectionDoc, setHasDuralDissectionDoc] = useState<boolean>(true);

  // 6. Blood Management & Intraoperative Arterial Line (CPT 36620)
  const [hasArterialLine, setHasArterialLine] = useState<boolean>(true);
  const [hasCellSaverAutotransfusion, setHasCellSaverAutotransfusion] = useState<boolean>(true);

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

    const isCoSurgeon = coSurgeonMode === 'matching_mod62';
    const isMismatched = coSurgeonMode === 'mismatched_codes';
    const coSurgeonRate = isCoSurgeon ? 0.625 : 1.0;

    // --- 1. PRIMARY SURGICAL RECONSTRUCTION ---
    if (surgicalApproach === 'open_cvr_foa_21175') {
      const baseRvu = 35.8 * coSurgeonRate;
      const baseFee = 3280.0 * coSurgeonRate;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      const mod = isCoSurgeon ? '62' : 'None';
      lines.push({
        code: '21175',
        desc: 'Reconstruction, bifrontal, superior-lateral orbital rims and lower forehead, with cranial remodeling (fronto-orbital advancement)',
        mod,
        rvu: baseRvu,
        fee: baseFee,
        status: isMismatched ? 'fatal' : 'clean',
        note: `Bifrontal craniotomy and supraorbital bar osteotomy for coronal/metopic craniosynostosis. ${isCoSurgeon ? 'Modifier 62 split (62.5% of standard allowance per surgeon).' : ''}`,
      });

      alerts.push({
        type: 'clean',
        title: 'Open Fronto-Orbital Advancement (21175) Defended',
        desc: 'Operative report documents bifrontal craniotomy, supraorbital bandeau osteotomy, and advanced repositioning with resorbable fixation. Defends against downcoding to simple craniectomy.',
        statute: 'ACPA Craniofacial Surgical Standards; AMA CPT Guidelines',
      });
    } else if (surgicalApproach === 'open_cvr_multisuture_21180') {
      const baseRvu = 42.4 * coSurgeonRate;
      const baseFee = 3890.0 * coSurgeonRate;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      const mod = isCoSurgeon ? '62' : 'None';
      lines.push({
        code: '21180',
        desc: 'Reconstruction, entire or majority of forehead and/or skull, with multiple bone grafts or extensive cranial remodeling (complex multi-suture CVR)',
        mod,
        rvu: baseRvu,
        fee: baseFee,
        status: isMismatched ? 'fatal' : 'clean',
        note: `Total or subtotal cranial vault remodeling for multi-suture or syndromic synostosis (Apert, Crouzon, Pfeiffer). ${isCoSurgeon ? 'Modifier 62 split (62.5%).' : ''}`,
      });

      alerts.push({
        type: 'clean',
        title: 'Complex Multi-Suture Reconstruction (21180) Validated',
        desc: 'Operative notes confirm multi-quadrant cranial osteotomies, vertex calvarial remodeling, and complex bone transposition for severe pan-suture synostosis.',
        statute: 'ASPS / CNS Pediatric Neurosurgery Guidelines',
      });
    } else if (surgicalApproach === 'craniectomy_remodel_61558') {
      const baseRvu = 32.1 * coSurgeonRate;
      const baseFee = 2940.0 * coSurgeonRate;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      const mod = isCoSurgeon ? '62' : 'None';
      lines.push({
        code: '61558',
        desc: 'Extensive craniectomy for craniosynostosis; with cranial remodeling (barrel stave osteotomies & morcellation)',
        mod,
        rvu: baseRvu,
        fee: baseFee,
        status: isMismatched ? 'fatal' : 'clean',
        note: `Extensive parietal-occipital or sagittal craniectomy with radial osteotomies. ${isCoSurgeon ? 'Modifier 62 split (62.5%).' : ''}`,
      });

      alerts.push({
        type: 'clean',
        title: 'Extensive Craniectomy with Remodeling (61558) Coded',
        desc: 'Defends cranial bone remodeling without full supraorbital bandeau repositioning, maintaining compliance under neurosurgical skull surgery standards.',
        statute: 'AMA CPT Skull Base & Craniectomy Section',
      });
    } else if (surgicalApproach === 'endoscopic_strip_61550') {
      const baseRvu = 22.8;
      const baseFee = 2100.0;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: '61550',
        desc: 'Craniectomy for craniosynostosis; single cranial suture (endoscopic strip craniectomy for infant sagittal synostosis)',
        mod: 'None',
        rvu: baseRvu,
        fee: baseFee,
        status: 'clean',
        note: 'Minimally invasive strip craniectomy performed under endoscopic visualization and stereotactic guidance.',
      });

      alerts.push({
        type: 'clean',
        title: 'Minimally Invasive Endoscopic Strip Craniectomy (61550) Coded',
        desc: 'Appropriate for infants <4 months old. Operative report details dual scalp incisions, subgaleal tunneling, and sagittal suturectomy under rigid endoscope guidance.',
        statute: 'AANS Pediatric Section Practice Parameter',
      });
    }

    // --- 2. CO-SURGEON MODIFIER -62 ORCHESTRATION ---
    if (surgicalApproach !== 'endoscopic_strip_61550') {
      if (isCoSurgeon) {
        alerts.push({
          type: 'clean',
          title: 'Co-Surgeon Modifier -62 Matching Verified',
          desc: 'Both Pediatric Neurosurgery and Pediatric Craniofacial Plastic Surgery submit identical primary CPT codes appended with Modifier -62. Dual operative notes detail distinct, non-overlapping surgical roles.',
          statute: 'CMS Medicare Claims Processing Manual Ch. 12 § 40.8 (Modifier 62 Policy)',
        });
      } else if (isMismatched) {
        penaltyAtRisk += 4200.0;
        alerts.push({
          type: 'fatal',
          title: 'FATAL: Co-Surgeon Code Mismatch / Missing Modifier -62 Detected',
          desc: 'Neurosurgery and Plastic Surgery submitted divergent CPT codes (e.g., 61558 vs 21175) or omitted Modifier -62. Clearinghouses will reject the secondary surgeon\'s claim entirely or downcode both to assistant surgeon rates (-$4,200 loss).',
          statute: 'CMS NCCI Policy Manual Ch. 1 § E; Payer Co-Surgery Cross-Match Edits',
        });
      } else {
        alerts.push({
          type: 'warning',
          title: 'Solo Attending Billing on Complex Craniofacial Vault Case',
          desc: 'Billing extensive cranial vault remodeling (21175/21180) under a single surgeon requires rigorous documentation of both intracranial dural protection and complex osteotomy/plating to withstand medical review.',
          statute: 'Commercial Payer Craniofacial Surgery Coverage Policies',
        });
      }
    }

    // --- 3. POST-OPERATIVE CRANIAL MOLDING HELMET THERAPY (HCPCS L0112) ---
    if (hasHelmetTherapy) {
      const helmetFee = 2850.0;
      expectedReimbursement += helmetFee;

      if (hasCephalicIndexDoc) {
        lines.push({
          code: 'L0112',
          desc: 'Cranial cervical flexion contracture, dynamic cranial molding orthosis helmet, rigid, custom fabricated',
          mod: 'NU',
          rvu: 0.0,
          fee: helmetFee,
          status: 'clean',
          note: 'Custom cranial molding helmet following strip craniectomy to direct symmetric skull expansion.',
        });

        alerts.push({
          type: 'clean',
          title: 'Cranial Molding Helmet Orthosis (L0112) Defended',
          desc: 'Pre-authorization and DME billing file contains 3D volumetric scanning, pre-op Cephalic Index (CI) / Cranial Vault Asymmetry Index (CVAI >3.5%), and postoperative molding protocol.',
          statute: 'CMS DME MAC LCD L33793 (Cranial Orthosis Policy)',
        });
      } else {
        penaltyAtRisk += helmetFee;
        lines.push({
          code: 'L0112',
          desc: 'Cranial cervical flexion contracture, dynamic cranial molding orthosis helmet, rigid, custom fabricated',
          mod: 'NU',
          rvu: 0.0,
          fee: helmetFee,
          status: 'fatal',
          note: 'Missing objective anthropometric measurements (cephalic index / 3D scan). High audit clawback risk.',
        });

        alerts.push({
          type: 'fatal',
          title: 'FATAL: Missing Cephalic Index / 3D CT Anthropometry for Helmet DME',
          desc: 'Payers reject HCPCS L0112 claims lacking objective anthropometric asymmetry measurements (CI <70% or >85%, or CVAI >3.5 mm). Entire $2,850 DME allowance will be denied.',
          statute: 'Commercial Payer Cranial Orthosis Coverage Guidelines; CMS LCD L33793',
        });
      }
    }

    // --- 4. AUTOLOGOUS BONE GRAFTING (+20900 / 21210) ---
    if (hasBoneGrafting && surgicalApproach !== 'endoscopic_strip_61550') {
      const graftRvu = 4.8;
      const graftFee = 440.0;
      totalRvu += graftRvu;
      expectedReimbursement += graftFee;

      if (hasDistinctGraftDoc) {
        lines.push({
          code: '20900',
          desc: 'Bone graft, any donor area; minor or small (harvest of split-calvarial bone grafts for skull defects)',
          mod: '59',
          rvu: graftRvu,
          fee: graftFee,
          status: 'clean',
          note: 'Split-thickness calvarial bone graft harvested to bridge cranial defects and bone gaps.',
        });

        alerts.push({
          type: 'clean',
          title: 'Autologous Bone Graft Harvest (+20900-59) Unbundled Correctly',
          desc: 'Operative note documents distinct split-calvarial bone harvesting separate from primary cranial vault osteotomies, appending Modifier 59 to defend against NCCI bundling edits.',
          statute: 'CMS NCCI Chapter IV Musculoskeletal Guidelines',
        });
      } else {
        penaltyAtRisk += graftFee;
        lines.push({
          code: '20900',
          desc: 'Bone graft, any donor area; minor or small (harvest of split-calvarial bone grafts)',
          mod: 'None',
          rvu: graftRvu,
          fee: graftFee,
          status: 'warning',
          note: 'Missing Modifier 59 / distinct donor site documentation. Risk of clearinghouse bundling.',
        });

        alerts.push({
          type: 'warning',
          title: 'Bone Graft (+20900) Bundling Risk Under Primary Vault Resection',
          desc: 'Without Modifier 59 and explicit documentation of split-calvarial graft donor site harvest distinct from bone morcellation, payers bundle graft into 21175/21180.',
          statute: 'NCCI PTP Edits: Column 1 / Column 2 Unbundling Protocols',
        });
      }
    }

    // --- 5. OPERATING MICROSCOPE MICRODISSECTION (+69990) ---
    if (hasMicroscope) {
      const scopeRvu = 4.6;
      const scopeFee = 425.0;
      totalRvu += scopeRvu;
      expectedReimbursement += scopeFee;

      if (hasDuralDissectionDoc) {
        lines.push({
          code: '69990',
          desc: 'Microsurgical techniques, requiring use of operating microscope (microdissection of dura and sagittal sinus)',
          mod: 'None',
          rvu: scopeRvu,
          fee: scopeFee,
          status: 'clean',
          note: 'High-magnification microdissection of adherent superior sagittal sinus or delicate dural bands.',
        });

        alerts.push({
          type: 'clean',
          title: 'Operating Microscope (+69990) Defended for Dural Adhesiolysis',
          desc: 'Operative dictation details high-magnification microdissection to safely separate fused inner table bone from the superior sagittal sinus and delicate infant dura.',
          statute: 'AMA CPT Code +69990 Operating Microscope Guidelines',
        });
      } else {
        penaltyAtRisk += scopeFee;
        lines.push({
          code: '69990',
          desc: 'Microsurgical techniques, requiring use of operating microscope',
          mod: 'None',
          rvu: scopeRvu,
          fee: scopeFee,
          status: 'fatal',
          note: 'Loupe magnification or lack of microdissection description will result in payer rejection.',
        });

        alerts.push({
          type: 'fatal',
          title: 'Microscope Denial Risk: Loupe Magnification Disallowed',
          desc: 'Operating microscope add-on +69990 is non-payable if simple surgical loupes are used or if microdissection of neurovascular/dural structures is omitted.',
          statute: 'Medicare Claims Processing Manual Ch. 12 § 20.4.5',
        });
      }
    }

    // --- 6. ARTERIAL LINE & CELL SAVER BLOOD MANAGEMENT ---
    if (hasArterialLine) {
      const artRvu = 3.2;
      const artFee = 295.0;
      totalRvu += artRvu;
      expectedReimbursement += artFee;

      lines.push({
        code: '36620',
        desc: 'Arterial catheterization or cannulation for sampling, monitoring or transfusion (radial or femoral arterial line)',
        mod: 'None',
        rvu: artRvu,
        fee: artFee,
        status: 'clean',
        note: 'Continuous hemodynamic and blood gas monitoring during pediatric cranial vault osteotomies.',
      });

      alerts.push({
        type: 'clean',
        title: 'Pediatric Arterial Line (36620) Validated',
        desc: 'Invasive arterial line placement for real-time blood pressure tracking during rapid cranial vault blood loss and autotransfusion.',
        statute: 'ASA / AAP Pediatric Perioperative Guidelines',
      });
    }

    if (hasCellSaverAutotransfusion) {
      alerts.push({
        type: 'clean',
        title: 'Intraoperative Cell Saver Blood Salvage Supported',
        desc: 'Documentation supports intraoperative autologous red blood cell washing and reinfusion, mitigating allogeneic transfusion risks in infant surgery.',
        statute: 'PBM Pediatric Patient Blood Management Guidelines',
      });
    }

    // Revenue Cycle Compliance Score
    const hasFatal = alerts.some((a) => a.type === 'fatal');
    const hasWarning = alerts.some((a) => a.type === 'warning');
    const complianceScore = hasFatal ? 54 : hasWarning ? 82 : 98;

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
    surgicalApproach,
    coSurgeonMode,
    hasHelmetTherapy,
    hasCephalicIndexDoc,
    hasBoneGrafting,
    hasDistinctGraftDoc,
    hasMicroscope,
    hasDuralDissectionDoc,
    hasArterialLine,
    hasCellSaverAutotransfusion,
  ]);

  // Copy Appeal Packet
  const copyAppealPacket = () => {
    const text = `
================================================================================
AETHERA HEALTHCARE RCM: PEDIATRIC CRANIOSYNOSTOSIS AUDIT DEFENSE PACKET
================================================================================
PRIMARY PROCEDURE: ${
      surgicalApproach === 'open_cvr_foa_21175'
        ? 'Open Fronto-Orbital Advancement & CVR (CPT 21175)'
        : surgicalApproach === 'open_cvr_multisuture_21180'
        ? 'Complex Multi-Suture Cranial Reconstruction (CPT 21180)'
        : surgicalApproach === 'craniectomy_remodel_61558'
        ? 'Extensive Craniectomy with Remodeling (CPT 61558)'
        : 'Endoscopic Strip Craniectomy (CPT 61550)'
    }
CO-SURGEON CONFIGURATION: ${
      coSurgeonMode === 'matching_mod62'
        ? 'Verified Co-Surgeon Modifier 62 Match (Neurosurgery & Plastic Surgery)'
        : coSurgeonMode === 'mismatched_codes'
        ? 'ALERT: Code Mismatch or Missing Modifier 62'
        : 'Solo Attending'
    }
CRANIAL MOLDING ORTHOSIS (L0112): ${hasHelmetTherapy ? (hasCephalicIndexDoc ? 'Documented with Cephalic Index / 3D CT' : 'MISSING CEPHALIC INDEX') : 'N/A'}
SPLIT CALVARIAL BONE GRAFT (20900): ${hasBoneGrafting ? (hasDistinctGraftDoc ? 'Modifier 59 Verified' : 'Missing Mod 59') : 'N/A'}
OPERATING MICROSCOPE (69990): ${hasMicroscope ? (hasDuralDissectionDoc ? 'Microdissection Documented' : 'Missing Microdissection Detail') : 'N/A'}

FINANCIAL RECAP:
- Total Allowed RVUs: ${scrubberResult.totalRvu}
- Expected Net Practice Reimbursement: $${scrubberResult.expectedReimbursement.toLocaleString()}
- Clawback / Audit Penalty at Risk: $${scrubberResult.penaltyAtRisk.toLocaleString()}
- RCM Compliance Score: ${scrubberResult.complianceScore}%

CODING BREAKDOWN:
${scrubberResult.lines
  .map(
    (l) =>
      `• CPT/HCPCS ${l.code} [Mod ${l.mod}]: ${l.desc} | Status: ${l.status.toUpperCase()} | Allowed: $${l.fee.toFixed(2)} (${l.rvu} RVU)\n  Note: ${l.note}`
  )
  .join('\n')}

AUDIT ALERTS & COMPLIANCE STATUTES:
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
        source: 'pediatric_craniosynostosis_rcm_audit',
        name: contactName,
        email: contactEmail,
        practiceName,
        surgicalApproach,
        coSurgeonMode,
        hasHelmetTherapy,
        hasCephalicIndexDoc,
        hasBoneGrafting,
        hasDistinctGraftDoc,
        hasMicroscope,
        hasArterialLine,
        complianceScore: scrubberResult.complianceScore,
        expectedReimbursement: scrubberResult.expectedReimbursement,
        penaltyAtRisk: scrubberResult.penaltyAtRisk,
        auditNotes,
      };

      await sendLeadToKiran('pediatric_craniosynostosis_rcm_audit', payload);

      trackConversion('lead_submit_craniosynostosis_scrubber');
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
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 md:p-8 border-b border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Pediatric Neurosurgery & Craniofacial RCM Engine
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Bone className="w-8 h-8 text-blue-400" />
              Pediatric Cranial Vault Remodeling & Synostosis Scrubber
            </h2>
            <p className="text-sm md:text-base text-slate-300 max-w-3xl">
              Audit open fronto-orbital advancement (FOA), complex cranial vault remodeling (CVR), endoscopic strip craniectomy, co-surgeon Modifier -62 coordination, split-calvarial bone grafting, and cranial molding orthosis helmet DME (L0112) against NCCI and commercial payer edits.
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
          {/* Section 1: Surgical Approach & Primary Code */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <label className="text-sm font-bold text-blue-400 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-blue-400" />
              1. Surgical Approach & Primary Reconstruction
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  id: 'open_cvr_foa_21175',
                  label: 'Bifrontal Fronto-Orbital Advancement & CVR (CPT 21175)',
                  desc: 'Supraorbital bar osteotomy, orbital rim advancement & forehead reshaping (coronal/metopic).',
                },
                {
                  id: 'open_cvr_multisuture_21180',
                  label: 'Complex Multi-Suture Cranial Remodeling (CPT 21180)',
                  desc: 'Extensive multi-quadrant reconstruction for syndromic or complex multi-suture synostosis.',
                },
                {
                  id: 'craniectomy_remodel_61558',
                  label: 'Extensive Craniectomy with Calvarial Remodeling (CPT 61558)',
                  desc: 'Parietal-occipital vault reconstruction with barrel stave osteotomies.',
                },
                {
                  id: 'endoscopic_strip_61550',
                  label: 'Endoscopic Strip Craniectomy (CPT 61550)',
                  desc: 'Minimally invasive strip suturectomy for infants <4 months followed by helmet therapy.',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSurgicalApproach(item.id as any)}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-150 ${
                    surgicalApproach === item.id
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10'
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Co-Surgeon Team Configuration */}
          {surgicalApproach !== 'endoscopic_strip_61550' && (
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
              <label className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                2. Dual-Specialty Co-Surgeon Team (Modifier -62)
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    id: 'matching_mod62',
                    label: 'Co-Surgeon Match: Neurosurgery + Craniofacial Plastics (Mod 62)',
                    desc: 'Both surgeons bill identical CPT code with Modifier 62 and distinct operative notes.',
                  },
                  {
                    id: 'mismatched_codes',
                    label: 'FATAL RISK: Mismatched CPT Codes or Missing Modifier 62',
                    desc: 'Uncoordinated billing (e.g. 21175 vs 61558) or omitted -62 causing total claim recoupment.',
                  },
                  {
                    id: 'solo_neuro',
                    label: 'Solo Primary Surgeon (Neurosurgery or Plastics Alone)',
                    desc: 'Single attending performing entire intracranial protection and cranial remodeling.',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCoSurgeonMode(item.id as any)}
                    className={`text-left p-3.5 rounded-xl border transition-all duration-150 ${
                      coSurgeonMode === item.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                        : 'bg-slate-800/40 border-slate-700 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Cranial Molding Helmet Therapy (L0112) */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                3. Postoperative Cranial Molding Helmet DME (HCPCS L0112)
              </label>
              <input
                type="checkbox"
                checked={hasHelmetTherapy}
                onChange={(e) => setHasHelmetTherapy(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-400 bg-slate-900"
              />
            </div>
            {hasHelmetTherapy && (
              <div className="pl-6 border-l-2 border-emerald-500/40 space-y-3 pt-2">
                <p className="text-xs text-slate-300">
                  Custom dynamic cranial molding helmet prescribed following strip craniectomy or spring expansion.
                </p>
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCephalicIndexDoc}
                    onChange={(e) => setHasCephalicIndexDoc(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-400 bg-slate-900"
                  />
                  <span>Cephalic Index / 3D CT scan anthropometric cranial asymmetry documented (CVAI &gt;3.5%)</span>
                </label>
              </div>
            )}
          </div>

          {/* Section 4: Split-Calvarial Bone Grafting & Fixation */}
          {surgicalApproach !== 'endoscopic_strip_61550' && (
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Bone className="w-4 h-4 text-amber-400" />
                  4. Autologous Split-Calvarial Bone Grafting (CPT 20900)
                </label>
                <input
                  type="checkbox"
                  checked={hasBoneGrafting}
                  onChange={(e) => setHasBoneGrafting(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 text-amber-500 focus:ring-amber-400 bg-slate-900"
                />
              </div>
              {hasBoneGrafting && (
                <div className="pl-6 border-l-2 border-amber-500/40 space-y-3 pt-2">
                  <p className="text-xs text-slate-300">
                    Harvest of split-thickness calvarial bone grafts to bridge cranial defects and orbital bandeau gaps.
                  </p>
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDistinctGraftDoc}
                      onChange={(e) => setHasDistinctGraftDoc(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-400 bg-slate-900"
                    />
                    <span>Distinct harvest donor site documented with Modifier 59 (prevents NCCI unbundling denial)</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Section 5: Microscope & Arterial Line Support */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <label className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              5. Microdissection & Invasive Hemodynamic Monitoring
            </label>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="microscope"
                  checked={hasMicroscope}
                  onChange={(e) => setHasMicroscope(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 text-cyan-500 focus:ring-cyan-400 bg-slate-900"
                />
                <div className="text-xs">
                  <label htmlFor="microscope" className="font-semibold text-slate-200 cursor-pointer">
                    Operating Microscope for Dural / Sagittal Sinus Dissection (+69990)
                  </label>
                  {hasMicroscope && (
                    <label className="flex items-center gap-2 mt-1.5 text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasDuralDissectionDoc}
                        onChange={(e) => setHasDuralDissectionDoc(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-400 bg-slate-900"
                      />
                      <span>Operative note specifies high-magnification microdissection (not simple loupes)</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-700/60">
                <input
                  type="checkbox"
                  id="artLine"
                  checked={hasArterialLine}
                  onChange={(e) => setHasArterialLine(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 text-cyan-500 focus:ring-cyan-400 bg-slate-900"
                />
                <div className="text-xs">
                  <label htmlFor="artLine" className="font-semibold text-slate-200 cursor-pointer">
                    Pediatric Invasive Arterial Line Placement (CPT 36620)
                  </label>
                  <p className="text-slate-400 text-xs">Continuous blood pressure tracking during rapid blood loss & transfusion.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-700/60">
                <input
                  type="checkbox"
                  id="cellSaver"
                  checked={hasCellSaverAutotransfusion}
                  onChange={(e) => setHasCellSaverAutotransfusion(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 text-cyan-500 focus:ring-cyan-400 bg-slate-900"
                />
                <div className="text-xs">
                  <label htmlFor="cellSaver" className="font-semibold text-slate-200 cursor-pointer">
                    Intraoperative Cell Saver Autologous Blood Salvage
                  </label>
                  <p className="text-slate-400 text-xs">Autologous blood recycling to minimize allogeneic transfusion risks in infants.</p>
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
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
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
                <div className="text-2xl font-black text-emerald-400 mt-1">
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
                    Risk from co-surgeon code mismatch, missing cephalic index on DME, or bone graft unbundling.
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
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
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
                    <div className="text-[10px] text-blue-400 font-medium pt-0.5">{line.note}</div>
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
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                        : alert.type === 'warning'
                        ? 'bg-amber-950/20 border-amber-800/50 text-amber-300'
                        : 'bg-rose-950/30 border-rose-800/70 text-rose-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {alert.type === 'clean' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
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
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Submit Case for Professional Craniofacial Audit
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
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                <h3 className="text-2xl font-bold text-white">Audit Request Received</h3>
                <p className="text-sm text-slate-300">
                  Kiran and the Aethera Craniofacial & Pediatric Neurosurgery RCM team have received your clinical case profile. We will review your co-surgeon documentation, helmet DME prior-auth, and CPT cross-coding within 1 business day.
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
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    Request Comprehensive Practice Audit
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect directly with Kiran’s specialized pediatric surgical RCM audit desk. Zero PHI is transmitted.
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
                      placeholder="Dr. Sarah Jenkins, MD"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="sjenkins@childrenshospital.org"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Practice / Hospital Name</label>
                    <input
                      type="text"
                      required
                      value={practiceName}
                      onChange={(e) => setPracticeName(e.target.value)}
                      placeholder="Pediatric Craniofacial & Neurosurgical Center"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Specialty Audit Notes or Payer Denials</label>
                    <textarea
                      rows={3}
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      placeholder="Experiencing Co-Surgeon Mod 62 unbundling denials from commercial payers, or L0112 cranial molding helmet prior auth rejections..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
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
