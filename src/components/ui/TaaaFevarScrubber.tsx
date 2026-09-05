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
  ShieldAlert,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function TaaaFevarScrubber() {
  // 1. Primary Aortic Repair Modality
  const [repairModality, setRepairModality] = useState<
    'fevar_4_vessel_34844' | 'fevar_3_vessel_34843' | 'fevar_2_vessel_34842' | 'open_crawford_33877'
  >('fevar_4_vessel_34844');

  // 2. Prophylactic Spinal Cord Lumbar CSF Drain (CPT 62272)
  const [hasCsfDrain, setHasCsfDrain] = useState<boolean>(true);
  const [hasSeparateCsfIndicationDoc, setHasSeparateCsfIndicationDoc] = useState<boolean>(true);

  // 3. Selective Visceral Branch Bridging Stents (+37236 / +36245)
  const [hasBridgingStents, setHasBridgingStents] = useState<boolean>(true);
  const [hasVisceralVesselIdentified, setHasVisceralVesselIdentified] = useState<boolean>(true);

  // 4. Co-Surgeon Team (Modifier -62 Vascular + Cardiothoracic)
  const [coSurgeonMode, setCoSurgeonMode] = useState<
    'matching_mod62' | 'solo_vascular' | 'mismatched_codes'
  >('matching_mod62');

  // 5. Post-Operative Vascular Critical Care (CPT 99291 with Modifier 25)
  const [hasPostOpCriticalCare, setHasPostOpCriticalCare] = useState<boolean>(true);

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

    // --- 1. PRIMARY AORTIC REPAIR MODALITY ---
    if (repairModality === 'fevar_4_vessel_34844') {
      const baseRvu = 58.4 * coSurgeonRate;
      const baseFee = 5380.0 * coSurgeonRate;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      const mod = isCoSurgeon ? '62' : 'None';
      lines.push({
        code: '34844',
        desc: 'Endovascular repair of visceral aorta (eg, aneurysm, pseudoaneurysm, dissection, penetrating ulcer) with 4 visceral branches (celiac, SMA, right & left renal)',
        mod,
        rvu: baseRvu,
        fee: baseFee,
        status: isMismatched ? 'fatal' : 'clean',
        note: `Modular fenestrated/branched graft incorporating all 4 visceral target vessels. ${isCoSurgeon ? 'Modifier 62 split (62.5%).' : ''}`,
      });

      alerts.push({
        type: 'clean',
        title: '4-Vessel FEVAR (34844) Defended',
        desc: 'Operative summary explicitly names revascularization of celiac axis, superior mesenteric artery, right renal artery, and left renal artery with directional cuffs.',
        statute: 'SVS Vascular Quality Initiative; AMA CPT Endovascular Aorta Guidelines',
      });
    } else if (repairModality === 'fevar_3_vessel_34843') {
      const baseRvu = 51.2 * coSurgeonRate;
      const baseFee = 4720.0 * coSurgeonRate;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      const mod = isCoSurgeon ? '62' : 'None';
      lines.push({
        code: '34843',
        desc: 'Endovascular repair of visceral aorta with 3 visceral branches (eg, SMA, right & left renal arteries)',
        mod,
        rvu: baseRvu,
        fee: baseFee,
        status: isMismatched ? 'fatal' : 'clean',
        note: `Fenestrated/branched endograft across 3 visceral vessels. ${isCoSurgeon ? 'Modifier 62 split (62.5%).' : ''}`,
      });

      alerts.push({
        type: 'clean',
        title: '3-Vessel FEVAR (34843) Validated',
        desc: 'Documentation substantiates target vessel cannulation and deployment for 3 visceral arteries.',
        statute: 'AMA CPT Code 34843 Descriptor Rules',
      });
    } else if (repairModality === 'fevar_2_vessel_34842') {
      const baseRvu = 43.6 * coSurgeonRate;
      const baseFee = 4020.0 * coSurgeonRate;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      const mod = isCoSurgeon ? '62' : 'None';
      lines.push({
        code: '34842',
        desc: 'Endovascular repair of visceral aorta with 2 visceral branches (eg, bilateral renal fenestrations)',
        mod,
        rvu: baseRvu,
        fee: baseFee,
        status: isMismatched ? 'fatal' : 'clean',
        note: `Endovascular repair incorporating 2 target visceral vessels. ${isCoSurgeon ? 'Modifier 62 split (62.5%).' : ''}`,
      });

      alerts.push({
        type: 'clean',
        title: '2-Vessel FEVAR (34842) Coded',
        desc: 'Validates 2-vessel visceral branching without downcoding to infrarenal standard EVAR.',
        statute: 'CMS NCCI Endovascular Aortic Repair Coding Policy',
      });
    } else if (repairModality === 'open_crawford_33877') {
      const baseRvu = 68.2 * coSurgeonRate;
      const baseFee = 6280.0 * coSurgeonRate;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      const mod = isCoSurgeon ? '62' : 'None';
      lines.push({
        code: '33877',
        desc: 'Repair of thoracoabdominal aortic aneurysm with graft, with or without cardiopulmonary bypass (Crawford Extent I-IV open replacement)',
        mod,
        rvu: baseRvu,
        fee: baseFee,
        status: isMismatched ? 'fatal' : 'clean',
        note: `Open thoracoabdominal incision, aortic cross-clamping, visceral patch re-implantation, and intercostal artery re-attachment. ${isCoSurgeon ? 'Modifier 62 split (62.5%).' : ''}`,
      });

      alerts.push({
        type: 'clean',
        title: 'Open Crawford TAAA Repair (33877) Supported',
        desc: 'High-complexity open repair encompassing thoracic and abdominal aorta with visceral revascularization. Defends against unbundling of individual vessel anastomoses.',
        statute: 'STS / SVS Aortic Guidelines; AMA CPT Cardiovascular Section',
      });
    }

    // --- 2. CO-SURGEON MODIFIER -62 ORCHESTRATION ---
    if (isCoSurgeon) {
      alerts.push({
        type: 'clean',
        title: 'Vascular & Cardiac Co-Surgeon Modifier -62 Matching Verified',
        desc: 'Both attending surgeons submit identical primary aortic procedure code (e.g., 34844 or 33877) with Modifier -62. Operative notes confirm complementary, non-overlapping surgical roles.',
        statute: 'CMS Medicare Claims Processing Manual Ch. 12 § 40.8 (Modifier 62)',
      });
    } else if (isMismatched) {
      penaltyAtRisk += 4800.0;
      alerts.push({
        type: 'fatal',
        title: 'FATAL: Co-Surgeon Code Mismatch / Missing Modifier -62',
        desc: 'Surgical teams submitted divergent CPT codes or omitted Modifier -62. Commercial clearinghouses will reject the secondary surgeon\'s claim entirely or downcode both to assistant surgeon rates (-$4,800 loss).',
        statute: 'CMS NCCI Policy Manual Ch. 1 § E; Payer Co-Surgery Cross-Match Edits',
      });
    }

    // --- 3. PROPHYLACTIC LUMBAR CSF DRAINAGE (+62272) ---
    if (hasCsfDrain) {
      const csfRvu = 4.8;
      const csfFee = 440.0;
      totalRvu += csfRvu;
      expectedReimbursement += csfFee;

      if (hasSeparateCsfIndicationDoc) {
        lines.push({
          code: '62272',
          desc: 'Spinal puncture, therapeutic, for drainage of cerebrospinal fluid (placement of continuous lumbar intrathecal drainage catheter for spinal cord protection)',
          mod: '59',
          rvu: csfRvu,
          fee: csfFee,
          status: 'clean',
          note: 'Prophylactic lumbar CSF drain placed prior to aortic clamping or branch coverage to mitigate spinal cord ischemia and paraplegia.',
        });

        alerts.push({
          type: 'clean',
          title: 'Spinal Cord Protection Lumbar Drain (62272-59) Unbundled',
          desc: 'Operative note documents pre-procedure percutaneous lumbar catheter placement and neuroprotective CSF pressure protocol (<10 mmHg) with Modifier 59.',
          statute: 'SVS Clinical Practice Guidelines for TAAA Paraplegia Prevention; NCCI Mod 59',
        });
      } else {
        penaltyAtRisk += csfFee;
        lines.push({
          code: '62272',
          desc: 'Spinal puncture, therapeutic, for drainage of cerebrospinal fluid',
          mod: 'None',
          rvu: csfRvu,
          fee: csfFee,
          status: 'fatal',
          note: 'Missing Modifier 59 and neuroprotective documentation. Payers bundle CSF drain into primary repair.',
        });

        alerts.push({
          type: 'fatal',
          title: 'FATAL: Lumbar CSF Drainage Bundled into Aortic Repair',
          desc: 'Clearinghouses bundle lumbar catheter placement into major vascular procedures unless Modifier 59 is appended and distinct neuroprotective rationale is documented.',
          statute: 'CMS NCCI Policy Manual Chapter VIII (Nervous System & Spinal Access)',
        });
      }
    }

    // --- 4. SELECTIVE VISCERAL BRIDGING STENTS ---
    if (hasBridgingStents && repairModality !== 'open_crawford_33877') {
      const stentRvu = 8.5;
      const stentFee = 780.0;
      totalRvu += stentRvu;
      expectedReimbursement += stentFee;

      if (hasVisceralVesselIdentified) {
        lines.push({
          code: '37236',
          desc: 'Transcatheter placement of an intravascular stent(s), open or percutaneous, antegrade or retrograde; initial artery (balloon-expandable covered visceral bridging stent)',
          mod: '51',
          rvu: stentRvu,
          fee: stentFee,
          status: 'clean',
          note: 'Deployment of covered bridging stent (Viabahn / VBX) connecting endograft branch cuff to target renal or visceral artery.',
        });

        alerts.push({
          type: 'clean',
          title: 'Visceral Bridging Covered Stent (37236-51) Defended',
          desc: 'Documentation details selective target vessel cannulation, balloon-expandable covered stent deployment, and flare verification at visceral ostium.',
          statute: 'AMA CPT Transcatheter Stent Placement Guidelines; Modifier 51 MPPR',
        });
      } else {
        penaltyAtRisk += stentFee;
        lines.push({
          code: '37236',
          desc: 'Transcatheter placement of intravascular stent; initial artery',
          mod: 'None',
          rvu: stentRvu,
          fee: stentFee,
          status: 'warning',
          note: 'Missing Modifier 51 or specific branch anatomical description. Potential unbundling denial.',
        });

        alerts.push({
          type: 'warning',
          title: 'Bridging Stent Missing Modifier 51 / Branch Identity',
          desc: 'Secondary transcatheter stent placement requires Modifier 51 to comply with multiple procedure reduction rules and distinct target vessel documentation.',
          statute: 'Medicare Multiple Procedure Payment Reduction (MPPR) Protocols',
        });
      }
    }

    // --- 5. POST-OPERATIVE SURGICAL CRITICAL CARE ---
    if (hasPostOpCriticalCare) {
      const ccRvu = 6.2;
      const ccFee = 580.0;
      totalRvu += ccRvu;
      expectedReimbursement += ccFee;

      lines.push({
        code: '99291',
        desc: 'Critical care, evaluation and management of the critically ill or critically injured patient; first 30-74 minutes (post-TAAA surgical ICU resuscitation)',
        mod: '25',
        rvu: ccRvu,
        fee: ccFee,
        status: 'clean',
        note: 'Attending surgeon direct management of vasoplegia, spinal cord perfusion pressure, and coagulopathy in ICU.',
      });

      alerts.push({
        type: 'clean',
        title: 'Post-Aortic Critical Care (99291-25) Segregated',
        desc: 'Intensive care records document continuous titrations for spinal cord perfusion pressure (>80 mmHg) and coagulopathy, defending against global surgical bundling.',
        statute: 'Medicare Claims Processing Manual Ch. 12 § 30.6.12 (Critical Care Policy)',
      });
    }

    // Compliance Score
    const hasFatal = alerts.some((a) => a.type === 'fatal');
    const hasWarning = alerts.some((a) => a.type === 'warning');
    const complianceScore = hasFatal ? 50 : hasWarning ? 82 : 98;

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
    repairModality,
    coSurgeonMode,
    hasCsfDrain,
    hasSeparateCsfIndicationDoc,
    hasBridgingStents,
    hasVisceralVesselIdentified,
    hasPostOpCriticalCare,
  ]);

  // Copy Appeal Packet
  const copyAppealPacket = () => {
    const text = `
================================================================================
AETHERA HEALTHCARE RCM: TAAA & COMPLEX FEVAR AUDIT DEFENSE PACKET
================================================================================
PRIMARY REPAIR MODALITY: ${
      repairModality === 'fevar_4_vessel_34844'
        ? '4-Vessel FEVAR Visceral Aortic Repair (CPT 34844)'
        : repairModality === 'fevar_3_vessel_34843'
        ? '3-Vessel FEVAR Visceral Aortic Repair (CPT 34843)'
        : repairModality === 'fevar_2_vessel_34842'
        ? '2-Vessel FEVAR Visceral Aortic Repair (CPT 34842)'
        : 'Open Crawford Extent I-IV TAAA Graft Replacement (CPT 33877)'
    }
CO-SURGEON STATUS: ${
      coSurgeonMode === 'matching_mod62'
        ? 'Co-Surgeon Modifier -62 Matching Verified (Vascular & Cardiac Surgery)'
        : coSurgeonMode === 'mismatched_codes'
        ? 'ALERT: Code Mismatch or Missing Modifier 62'
        : 'Solo Attending'
    }
SPINAL CORD LUMBAR CSF DRAIN (62272): ${hasCsfDrain ? (hasSeparateCsfIndicationDoc ? 'Modifier 59 Defended for Paraplegia Protection' : 'ALERT: Missing Mod 59') : 'N/A'}
BRIDGING VISCERAL STENTS (37236): ${hasBridgingStents ? (hasVisceralVesselIdentified ? 'Modifier 51 Appended with Vessel Names' : 'Missing Mod 51') : 'N/A'}
POST-OP SURGICAL ICU CRITICAL CARE: ${hasPostOpCriticalCare ? 'Critical Care 99291-25 Appended' : 'N/A'}

FINANCIAL RECAP:
- Total Allowed RVUs: ${scrubberResult.totalRvu}
- Expected Net Practice Reimbursement: $${scrubberResult.expectedReimbursement.toLocaleString()}
- Clawback / Audit Penalty at Risk: $${scrubberResult.penaltyAtRisk.toLocaleString()}
- RCM Compliance Score: ${scrubberResult.complianceScore}%

CLAIM LINE BREAKDOWN:
${scrubberResult.lines
  .map(
    (l) =>
      `• CPT ${l.code} [Mod ${l.mod}]: ${l.desc} | Status: ${l.status.toUpperCase()} | Allowed: $${l.fee.toFixed(2)} (${l.rvu} RVU)\n  Note: ${l.note}`
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
        source: 'taaa_fevar_rcm_audit',
        name: contactName,
        email: contactEmail,
        practiceName,
        repairModality,
        coSurgeonMode,
        hasCsfDrain,
        hasSeparateCsfIndicationDoc,
        hasBridgingStents,
        hasVisceralVesselIdentified,
        hasPostOpCriticalCare,
        complianceScore: scrubberResult.complianceScore,
        expectedReimbursement: scrubberResult.expectedReimbursement,
        penaltyAtRisk: scrubberResult.penaltyAtRisk,
        auditNotes,
      };

      await sendLeadToKiran('taaa_fevar_rcm_audit', payload);

      trackConversion('lead_submit_taaa_fevar_scrubber');
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
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 p-6 md:p-8 border-b border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Complex Aortic &amp; Endovascular RCM Engine
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Heart className="w-8 h-8 text-rose-400" />
              Complex Fenestrated/Branched EVAR (FEVAR) &amp; TAAA Scrubber
            </h2>
            <p className="text-sm md:text-base text-slate-300 max-w-3xl">
              Audit multi-vessel fenestrated/branched visceral aortic endografts (CPT 34841–34848), open Crawford TAAA resections (33877), prophylactic spinal cord protective lumbar CSF drainage (62272-59), visceral bridging stents (+37236-51), and co-surgeon Modifier -62 matching.
            </p>
          </div>

          <button
            onClick={() => setShowLeadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-semibold text-sm shadow-lg shadow-rose-500/20 transition-all duration-200"
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
          {/* Section 1: Primary Aortic Repair Modality */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <label className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-rose-400" />
              1. Aortic Repair Modality &amp; Visceral Branch Tier
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  id: 'fevar_4_vessel_34844',
                  label: '4-Vessel FEVAR Endovascular Repair (CPT 34844)',
                  desc: 'Endograft incorporating celiac, SMA, right renal, and left renal target vessels.',
                },
                {
                  id: 'fevar_3_vessel_34843',
                  label: '3-Vessel FEVAR Endovascular Repair (CPT 34843)',
                  desc: 'Fenestrated/branched module incorporating 3 target visceral branches.',
                },
                {
                  id: 'fevar_2_vessel_34842',
                  label: '2-Vessel FEVAR Endovascular Repair (CPT 34842)',
                  desc: 'Branched repair incorporating 2 target visceral branches (e.g. bilateral renals).',
                },
                {
                  id: 'open_crawford_33877',
                  label: 'Open Crawford Extent I–IV TAAA Repair (CPT 33877)',
                  desc: 'Open thoracoabdominal incision, aortic graft replacement & visceral re-implantation.',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRepairModality(item.id as any)}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-150 ${
                    repairModality === item.id
                      ? 'bg-rose-600/20 border-rose-500 text-white shadow-md shadow-rose-500/10'
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
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <label className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              2. Vascular &amp; Cardiac Co-Surgeon Team (Modifier -62)
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  id: 'matching_mod62',
                  label: 'Co-Surgeon Match: Vascular + Cardiac Surgery (Mod 62)',
                  desc: 'Both surgeons bill identical CPT code with Modifier 62 and distinct operative notes.',
                },
                {
                  id: 'mismatched_codes',
                  label: 'FATAL RISK: Mismatched CPT Codes or Missing Modifier 62',
                  desc: 'Unaligned coding between surgeons triggering total clearinghouse claim recoupment.',
                },
                {
                  id: 'solo_vascular',
                  label: 'Solo Primary Attending Surgeon',
                  desc: 'Single surgeon performing complete access, endograft deployment & cannulation.',
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

          {/* Section 3: Prophylactic Lumbar CSF Drainage */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                3. Prophylactic Spinal Cord Lumbar CSF Drain (CPT 62272)
              </label>
              <input
                type="checkbox"
                checked={hasCsfDrain}
                onChange={(e) => setHasCsfDrain(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 text-amber-500 focus:ring-amber-400 bg-slate-900"
              />
            </div>
            {hasCsfDrain && (
              <div className="pl-6 border-l-2 border-amber-500/40 space-y-3 pt-2">
                <p className="text-xs text-slate-300">
                  Percutaneous lumbar intrathecal drainage catheter placed to maintain spinal cord perfusion pressure and prevent paraplegia.
                </p>
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSeparateCsfIndicationDoc}
                    onChange={(e) => setHasSeparateCsfIndicationDoc(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-400 bg-slate-900"
                  />
                  <span>Operative note specifies neuroprotective CSF pressure target (&lt;10 mmHg) with Modifier 59</span>
                </label>
              </div>
            )}
          </div>

          {/* Section 4: Selective Bridging Stents & Critical Care */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <label className="text-sm font-bold text-teal-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              4. Visceral Bridging Stents &amp; Post-Op Resuscitation
            </label>
            <div className="space-y-3">
              {repairModality !== 'open_crawford_33877' && (
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="bridgingStent"
                    checked={hasBridgingStents}
                    onChange={(e) => setHasBridgingStents(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-400 bg-slate-900"
                  />
                  <div className="text-xs">
                    <label htmlFor="bridgingStent" className="font-semibold text-slate-200 cursor-pointer">
                      Covered Visceral Bridging Stents (+37236-51)
                    </label>
                    {hasBridgingStents && (
                      <label className="flex items-center gap-2 mt-1.5 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasVisceralVesselIdentified}
                          onChange={(e) => setHasVisceralVesselIdentified(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-slate-600 text-teal-500 focus:ring-teal-400 bg-slate-900"
                        />
                        <span>Operative note names specific branch vessels with Modifier 51 appended</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-700/60">
                <input
                  type="checkbox"
                  id="postOpCc"
                  checked={hasPostOpCriticalCare}
                  onChange={(e) => setHasPostOpCriticalCare(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-400 bg-slate-900"
                />
                <div className="text-xs">
                  <label htmlFor="postOpCc" className="font-semibold text-slate-200 cursor-pointer">
                    Surgical ICU Hemodynamic Critical Care (CPT 99291-25)
                  </label>
                  <p className="text-slate-400 text-xs">Direct attending ICU management of spinal cord perfusion pressure &gt;80 mmHg.</p>
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
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : scrubberResult.complianceScore >= 70
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
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
                <div className="text-2xl font-black text-rose-400 mt-1">
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
                    Risk from co-surgeon code mismatch, CSF drain bundling, or bridging stent unbundling rejection.
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
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
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
                    <div className="text-[10px] text-rose-400 font-medium pt-0.5">{line.note}</div>
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
                        ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                        : alert.type === 'warning'
                        ? 'bg-amber-950/20 border-amber-800/50 text-amber-300'
                        : 'bg-red-950/30 border-red-800/70 text-red-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {alert.type === 'clean' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
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
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Submit Case for Professional Aortic Audit
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
                <CheckCircle2 className="w-16 h-16 text-rose-400 mx-auto" />
                <h3 className="text-2xl font-bold text-white">Audit Request Received</h3>
                <p className="text-sm text-slate-300">
                  Kiran and the Aethera Complex Aortic & Vascular Surgery RCM team have received your clinical profile. We will inspect your FEVAR branch documentation, CSF drain unbundling appeals, and Modifier -62 matching within 1 business day.
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
                    <ShieldCheck className="w-5 h-5 text-rose-400" />
                    Request Comprehensive Practice Audit
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect directly with Kiran’s specialized complex aortic RCM audit desk. Zero PHI is transmitted.
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
                      placeholder="Dr. Christopher Sterling, MD / Chief of Vascular Surgery"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="csterling@aorticcenter.org"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Hospital / Aortic Center Name</label>
                    <input
                      type="text"
                      required
                      value={practiceName}
                      onChange={(e) => setPracticeName(e.target.value)}
                      placeholder="Comprehensive Thoracoabdominal Aortic Institute"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Specialty Audit Notes or Payer Denials</label>
                    <textarea
                      rows={3}
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      placeholder="Commercial payers bundling 4-vessel FEVAR 34844 into lower tiers, denying CSF drain 62272, or unbundling Co-Surgeon Mod 62..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
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
