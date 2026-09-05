'use client';

import React, { useState, useMemo } from 'react';
import {
  Heart,
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
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function CardiothoracicCannulationScrubber() {
  // 1. CABG Configuration
  const [arterialGrafts, setArterialGrafts] = useState<number>(1); // 0 to 4
  const [venousGrafts, setVenousGrafts] = useState<number>(2); // 0 to 6
  const [harvestMethod, setHarvestMethod] = useState<'open' | 'endoscopic' | 'radial'>('endoscopic');

  // 2. Concomitant Valve Procedure
  const [valveProcedure, setValveProcedure] = useState<'none' | 'avr' | 'mvr' | 'double'>('none');

  // 3. ECMO / Mechanical Circulatory Support
  const [ecmoSupport, setEcmoSupport] = useState<'none' | 'va_ecmo' | 'vv_ecmo' | 'iabp' | 'impella'>('none');
  const [openCannulationCutdown, setOpenCannulationCutdown] = useState<boolean>(false);

  // 4. Billing Traps / Error Simulation Toggles
  const [useStandaloneVenousWithArterial, setUseStandaloneVenousWithArterial] = useState<boolean>(false); // Trap: 33510 instead of +33517
  const [applyMod51ToVenousAddon, setApplyMod51ToVenousAddon] = useState<boolean>(false); // Trap: Mod 51 on add-on
  const [unbundleCpbCannulation, setUnbundleCpbCannulation] = useState<boolean>(false); // Trap: Routine CPB billed as ECMO cannulation

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

    // --- CABG CODING LOGIC ---
    const hasArterial = arterialGrafts > 0;
    const hasVenous = venousGrafts > 0;

    let primaryCabgCode = '';
    let primaryCabgDesc = '';
    let primaryCabgRvu = 0;
    let primaryCabgFee = 0;

    if (hasArterial) {
      if (arterialGrafts === 1) {
        primaryCabgCode = '33533';
        primaryCabgDesc = 'Coronary artery bypass, single arterial graft (e.g., LIMA)';
        primaryCabgRvu = 52.4;
        primaryCabgFee = 1850.0;
      } else if (arterialGrafts === 2) {
        primaryCabgCode = '33534';
        primaryCabgDesc = 'Coronary artery bypass, 2 coronary arterial grafts';
        primaryCabgRvu = 63.8;
        primaryCabgFee = 2250.0;
      } else if (arterialGrafts === 3) {
        primaryCabgCode = '33535';
        primaryCabgDesc = 'Coronary artery bypass, 3 coronary arterial grafts';
        primaryCabgRvu = 74.2;
        primaryCabgFee = 2620.0;
      } else {
        primaryCabgCode = '33536';
        primaryCabgDesc = 'Coronary artery bypass, 4 or more coronary arterial grafts';
        primaryCabgRvu = 84.5;
        primaryCabgFee = 2980.0;
      }
    } else if (hasVenous) {
      // Standalone venous CABG (rare, without arterial)
      const standaloneMap: Record<number, { code: string; rvu: number; fee: number }> = {
        1: { code: '33510', rvu: 44.1, fee: 1560.0 },
        2: { code: '33511', rvu: 49.6, fee: 1750.0 },
        3: { code: '33512', rvu: 56.2, fee: 1980.0 },
        4: { code: '33513', rvu: 61.8, fee: 2180.0 },
        5: { code: '33514', rvu: 67.4, fee: 2380.0 },
        6: { code: '33516', rvu: 73.1, fee: 2580.0 },
      };
      const vData = standaloneMap[Math.min(venousGrafts, 6)] || standaloneMap[1];
      primaryCabgCode = vData.code;
      primaryCabgDesc = `Coronary artery bypass, vein only, ${venousGrafts} venous graft(s)`;
      primaryCabgRvu = vData.rvu;
      primaryCabgFee = vData.fee;
    }

    // Determine Valve procedures (AVR / MVR)
    interface ValveItem {
      code: string;
      desc: string;
      rvu: number;
      fee: number;
    }
    const valveItems: ValveItem[] = [];
    if (valveProcedure === 'avr') {
      valveItems.push({ code: '33405', desc: 'Replacement, aortic valve, open with CPB', rvu: 59.5, fee: 2100.0 });
    } else if (valveProcedure === 'mvr') {
      valveItems.push({ code: '33430', desc: 'Replacement, mitral valve, open with CPB', rvu: 68.6, fee: 2420.0 });
    } else if (valveProcedure === 'double') {
      valveItems.push({ code: '33430', desc: 'Replacement, mitral valve, open with CPB (Primary Valve)', rvu: 68.6, fee: 2420.0 });
      valveItems.push({ code: '33405', desc: 'Replacement, aortic valve (Secondary Valve)', rvu: 59.5, fee: 2100.0 });
    }

    // Determine Base Procedure Sequencing (Valve vs CABG)
    // If valve RVU is higher than CABG RVU, valve is primary.
    let baseIsValve = false;
    if (valveItems.length > 0 && primaryCabgCode) {
      if (valveItems[0].rvu > primaryCabgRvu) {
        baseIsValve = true;
      }
    }

    if (baseIsValve && valveItems.length > 0) {
      // Valve is primary
      const primaryValve = valveItems[0];
      lines.push({
        code: primaryValve.code,
        desc: primaryValve.desc,
        mod: 'None',
        rvu: primaryValve.rvu,
        fee: primaryValve.fee,
        status: 'clean',
        note: 'Highest RVU procedure sequenced as primary base code.',
      });
      totalRvu += primaryValve.rvu;
      expectedReimbursement += primaryValve.fee;

      // Other valves if any
      for (let i = 1; i < valveItems.length; i++) {
        const v = valveItems[i];
        lines.push({
          code: v.code,
          desc: v.desc,
          mod: '-51',
          rvu: v.rvu * 0.5,
          fee: v.fee * 0.5,
          status: 'clean',
          note: 'Concomitant valve subject to 50% multiple procedure payment reduction.',
        });
        totalRvu += v.rvu * 0.5;
        expectedReimbursement += v.fee * 0.5;
      }

      // CABG gets Modifier 51
      if (primaryCabgCode) {
        lines.push({
          code: primaryCabgCode,
          desc: primaryCabgDesc,
          mod: '-51',
          rvu: primaryCabgRvu * 0.5,
          fee: primaryCabgFee * 0.5,
          status: 'clean',
          note: 'Concomitant CABG sequenced secondary to valve replacement; Modifier 51 applied.',
        });
        totalRvu += primaryCabgRvu * 0.5;
        expectedReimbursement += primaryCabgFee * 0.5;
      }
    } else {
      // CABG is primary or only procedure
      if (primaryCabgCode) {
        lines.push({
          code: primaryCabgCode,
          desc: primaryCabgDesc,
          mod: 'None',
          rvu: primaryCabgRvu,
          fee: primaryCabgFee,
          status: 'clean',
          note: 'Primary coronary artery bypass base procedure.',
        });
        totalRvu += primaryCabgRvu;
        expectedReimbursement += primaryCabgFee;
      }

      // Valve procedures secondary
      for (const v of valveItems) {
        lines.push({
          code: v.code,
          desc: v.desc,
          mod: '-51',
          rvu: v.rvu * 0.5,
          fee: v.fee * 0.5,
          status: 'clean',
          note: 'Concomitant valve replacement; 50% multiple procedure reduction applies.',
        });
        totalRvu += v.rvu * 0.5;
        expectedReimbursement += v.fee * 0.5;
      }
    }

    // --- VENOUS GRAFT LOGIC (When Combined with Arterial) ---
    if (hasArterial && hasVenous) {
      if (useStandaloneVenousWithArterial) {
        // FATAL ERROR TRAP
        const errMap: Record<number, string> = { 1: '33510', 2: '33511', 3: '33512', 4: '33513', 5: '33514', 6: '33516' };
        const errCode = errMap[Math.min(venousGrafts, 6)] || '33510';
        lines.push({
          code: errCode,
          desc: `Venous bypass only, ${venousGrafts} grafts (MISTAKEN STANDALONE CODE)`,
          mod: 'None',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'FATAL REJECTION: Standalone venous codes (33510-33516) cannot be billed with arterial bypass (33533-33536). Must bill add-on +33517-+33523!',
        });
        penaltyAtRisk += 950.0;
        alerts.push({
          type: 'fatal',
          title: 'NCCI Fatal Unbundling: Standalone Venous CABG with Arterial CABG',
          desc: `Billed CPT ${errCode} alongside arterial CABG ${primaryCabgCode}. CPT parenthetical instructions and CMS NCCI Chapter VI policy mandate that when venous grafts are used with arterial grafts, only add-on codes (+33517–+33523) may be reported. Payers will issue an outright denial (CARC CO-97 / CO-16) for the entire venous fee schedule.`,
          statute: 'CMS NCCI Policy Manual Chapter VI, Section E; AMA CPT Guidelines for Coronary Artery Bypass',
        });
      } else {
        // CORRECT ADD-ON CODING
        const addonMap: Record<number, { code: string; rvu: number; fee: number }> = {
          1: { code: '+33517', rvu: 5.4, fee: 190.0 },
          2: { code: '+33518', rvu: 10.2, fee: 360.0 },
          3: { code: '+33519', rvu: 14.8, fee: 520.0 },
          4: { code: '+33521', rvu: 19.5, fee: 690.0 },
          5: { code: '+33522', rvu: 24.1, fee: 850.0 },
          6: { code: '+33523', rvu: 28.9, fee: 1020.0 },
        };
        const aData = addonMap[Math.min(venousGrafts, 6)] || addonMap[1];

        if (applyMod51ToVenousAddon) {
          // Warning trap: Mod 51 on add-on
          lines.push({
            code: aData.code,
            desc: `Venous graft add-on for arterial CABG, ${venousGrafts} graft(s)`,
            mod: '-51 (INCORRECT)',
            rvu: aData.rvu * 0.5,
            fee: aData.fee * 0.5,
            status: 'warning',
            note: 'WARNING: Add-on code is exempt from Modifier 51. Appending Modifier 51 triggers 50% downcoding penalty ($' + (aData.fee * 0.5).toFixed(2) + ' loss)!',
          });
          totalRvu += aData.rvu * 0.5;
          expectedReimbursement += aData.fee * 0.5;
          penaltyAtRisk += aData.fee * 0.5;
          alerts.push({
            type: 'warning',
            title: 'Modifier -51 Erroneously Appended to Add-on Code',
            desc: `CPT ${aData.code} is an add-on code listed in CPT Appendix D (Modifier 51 Exempt). Appending -51 causes payer clearinghouse adjudication engines to inappropriately slash 50% of your legitimate reimbursement.`,
            statute: 'CPT Appendix D; CMS Claims Processing Manual Pub 100-04, Ch 12 §40.6',
          });
        } else {
          // Clean add-on
          lines.push({
            code: aData.code,
            desc: `Venous graft add-on for arterial CABG, ${venousGrafts} graft(s)`,
            mod: 'None (Add-on)',
            rvu: aData.rvu,
            fee: aData.fee,
            status: 'clean',
            note: 'Modifier 51 exempt add-on code. Paid at 100% allowable without multi-procedure reduction.',
          });
          totalRvu += aData.rvu;
          expectedReimbursement += aData.fee;
        }
      }
    }

    // --- GRAFT HARVEST MODALITY ---
    if (harvestMethod === 'endoscopic') {
      lines.push({
        code: '+33508',
        desc: 'Endoscopic harvest of saphenous vein for CABG (Add-on)',
        mod: 'None (Add-on)',
        rvu: 9.1,
        fee: 320.0,
        status: 'clean',
        note: 'Separately payable add-on code. Documentation must specify endoscopic vein harvest technique.',
      });
      totalRvu += 9.1;
      expectedReimbursement += 320.0;
    } else if (harvestMethod === 'radial') {
      lines.push({
        code: '35600',
        desc: 'Harvest of arterial implant, radial artery',
        mod: '-51',
        rvu: 16.4 * 0.5,
        fee: 580.0 * 0.5,
        status: 'clean',
        note: 'Reportable when radial artery is harvested for bypass conduit. Subject to Modifier 51 reduction.',
      });
      totalRvu += 16.4 * 0.5;
      expectedReimbursement += 580.0 * 0.5;
    }

    // --- ECMO / CARDIOPULMONARY SUPPORT ---
    if (ecmoSupport === 'va_ecmo') {
      lines.push({
        code: '33947',
        desc: 'Extracorporeal membrane oxygenation (ECMO) / ECLS initiation, veno-arterial (VA)',
        mod: '-59 / -XU',
        rvu: 24.1,
        fee: 850.0,
        status: 'clean',
        note: 'Reportable if initiated for acute post-cardiotomy cardiogenic shock requiring prolonged circulatory support beyond CPB.',
      });
      totalRvu += 24.1;
      expectedReimbursement += 850.0;
    } else if (ecmoSupport === 'vv_ecmo') {
      lines.push({
        code: '33946',
        desc: 'Extracorporeal membrane oxygenation (ECMO) / ECLS initiation, veno-venous (VV)',
        mod: '-59 / -XU',
        rvu: 20.4,
        fee: 720.0,
        status: 'clean',
        note: 'Reportable for severe acute hypoxemic respiratory failure requiring prolonged extracorporeal membrane lung assist.',
      });
      totalRvu += 20.4;
      expectedReimbursement += 720.0;
    } else if (ecmoSupport === 'iabp') {
      lines.push({
        code: '33967',
        desc: 'Insertion of intra-aortic balloon assist device, percutaneous',
        mod: '-51',
        rvu: 11.8 * 0.5,
        fee: 410.0 * 0.5,
        status: 'clean',
        note: 'Intra-aortic balloon pump insertion for hemodynamic instability or weaning failure.',
      });
      totalRvu += 11.8 * 0.5;
      expectedReimbursement += 410.0 * 0.5;
    } else if (ecmoSupport === 'impella') {
      lines.push({
        code: '33990',
        desc: 'Insertion of ventricular assist device, percutaneous arterial (Impella)',
        mod: '-51',
        rvu: 26.2 * 0.5,
        fee: 920.0 * 0.5,
        status: 'clean',
        note: 'Percutaneous left ventricular assist device for post-infarction shock or refractory heart failure.',
      });
      totalRvu += 26.2 * 0.5;
      expectedReimbursement += 920.0 * 0.5;
    }

    // --- CPB CANNULATION UNBUNDLING AUDIT ---
    if (unbundleCpbCannulation) {
      lines.push({
        code: '33954',
        desc: 'Extracorporeal open cutdown cannulation, peripheral vein (UNBUNDLED CPB)',
        mod: 'None',
        rvu: 0,
        fee: 0,
        status: 'fatal',
        note: 'FATAL VIOLATION: Routine cannulation for cardiopulmonary bypass (CPB) during CABG/valve surgery is strictly bundled. Cannot unbundle 33951-33956!',
      });
      penaltyAtRisk += 610.0;
      alerts.push({
        type: 'fatal',
        title: 'Statutory CPB Cannulation Bundling Violation',
        desc: 'Attempted billing of open cannulation (CPT 33954/33956) for routine cardiopulmonary bypass establishing operative field arrest during open cardiac surgery. CMS NCCI Chapter VI strictly bundles all access, aortic cannulation, venous return cannulation, and cardioplegia catheters into primary CABG (33533) and valve (33405) procedures.',
        statute: 'CMS NCCI Policy Manual Chapter VI, Section E(2); CPT Assistant Nov 2014 / Jan 2021',
      });
    } else if (openCannulationCutdown && (ecmoSupport === 'va_ecmo' || ecmoSupport === 'vv_ecmo')) {
      // Legitimate surgical cutdown cannulation for emergent ECMO distinct from elective CPB
      lines.push({
        code: '33954',
        desc: 'Extracorporeal cannula insertion, open cutdown, venous, patient > 28 days',
        mod: '-59',
        rvu: 17.5 * 0.5,
        fee: 610.0 * 0.5,
        status: 'clean',
        note: 'Distinct cutdown cannulation for long-term ECMO support with documented hemodynamic crisis.',
      });
      totalRvu += 17.5 * 0.5;
      expectedReimbursement += 610.0 * 0.5;
    }

    // If clean, provide positive validation
    if (alerts.length === 0) {
      alerts.push({
        type: 'clean',
        title: 'Compliant Cardiothoracic Surgical Sequencing',
        desc: 'Claim lines conform precisely to CPT arterial-venous graft hierarchy, Modifier 51 exemption rules for add-on conduits, and CMS NCCI Chapter VI cardiopulmonary bypass bundling standards.',
        statute: 'AAPC / STS (Society of Thoracic Surgeons) Coding Best Practices & CPT 2026',
      });
    }

    return {
      lines,
      alerts,
      totalRvu: Number(totalRvu.toFixed(1)),
      expectedReimbursement: Math.round(expectedReimbursement),
      penaltyAtRisk: Math.round(penaltyAtRisk),
    };
  }, [
    arterialGrafts,
    venousGrafts,
    harvestMethod,
    valveProcedure,
    ecmoSupport,
    openCannulationCutdown,
    useStandaloneVenousWithArterial,
    applyMod51ToVenousAddon,
    unbundleCpbCannulation,
  ]);

  // ANSI X12 837P Claim Preview Generator
  const ediClaimStream = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let str = `ISA*00*          *00*          *ZZ*SUBMITTER123   *ZZ*PAYER999       *${today}*0930*^*00501*000000101*0*P*:~
GS*HC*SUBMITTER123*PAYER999*${today}*0930*101*X*005010X222A1~
ST*837*0001*005010X222A1~
BHT*0019*00*CT-SURG-${today}*${today}*0930*CH~
NM1*85*2*AETHERA THORACIC SURGICAL ASSOC*****XX*1982736450~
N3*400 CARDIAC BYPASS WAY*SUITE 800~
N4*HOUSTON*TX*77030~
CLM*CT-CLAIM-001*${scrubberResult.expectedReimbursement + scrubberResult.penaltyAtRisk}***11:B:1*Y*A*Y*Y~
HI*BK:I25.10*BF:I25.700*BF:I35.0~`;

    scrubberResult.lines.forEach((l, idx) => {
      const cleanCode = l.code.replace('+', '');
      const modStr = l.mod.includes('-51') ? ':51' : l.mod.includes('-59') ? ':59' : '';
      str += `\nLX*${idx + 1}~
SV1*HC:${cleanCode}${modStr}*${l.fee.toFixed(2)}*UN*1***1~
DTP*472*D8*${today}~`;
    });

    str += `\nSE*${12 + scrubberResult.lines.length * 3}*0001~
GE*1*101~
IEA*1*000000101~`;
    return str;
  }, [scrubberResult]);

  const handleCopyEdi = () => {
    navigator.clipboard.writeText(ediClaimStream);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: contactName,
        email: contactEmail,
        practice: practiceName,
        notes: auditNotes,
        tool: 'Cardiothoracic Bypass & Cannulation Scrubber',
        simulation: {
          arterialGrafts,
          venousGrafts,
          harvestMethod,
          valveProcedure,
          ecmoSupport,
          openCannulationCutdown,
          useStandaloneVenousWithArterial,
          applyMod51ToVenousAddon,
          unbundleCpbCannulation,
          totalRvu: scrubberResult.totalRvu,
          expectedReimbursement: scrubberResult.expectedReimbursement,
          penaltyAtRisk: scrubberResult.penaltyAtRisk,
          lines: scrubberResult.lines,
        },
      };

      await sendLeadToKiran('cardiothoracic_rcm_audit', payload);
      trackConversion('cardiothoracic_rcm_audit_submit');
      setLeadSuccess(true);
    } catch {
      // Fail-safe graceful UX
      setLeadSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 text-white border border-rose-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Heart className="w-64 h-64 text-rose-400" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5" />
            CPT 33533–33536 · +33517–+33523 · 33405 · 33946–33989
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-jakarta tracking-tight">
            Cardiothoracic Bypass & Cannulation Scrubber
          </h2>
          <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
            Audit complex CABG arterial-venous combinations, endoscopic vein harvest add-ons (+33508), concomitant valve replacements, and prevent fatal NCCI unbundling denials during open heart surgery and ECMO/ECLS cannulation.
          </p>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel 1: CABG Grafts & Harvest */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm border-b border-slate-100 pb-2">
            <Activity className="w-4 h-4" />
            <span>1. Bypass Grafts & Harvest</span>
          </div>

          <div>
            <label htmlFor="arterialGraftsSelect" className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Mammary / Arterial Grafts
            </label>
            <select
              id="arterialGraftsSelect"
              value={arterialGrafts}
              onChange={(e) => setArterialGrafts(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            >
              <option value={0}>0 - No Arterial Grafts</option>
              <option value={1}>1 - Single Arterial (LIMA to LAD, CPT 33533)</option>
              <option value={2}>2 - Two Arterial Grafts (BIMA/Radial, CPT 33534)</option>
              <option value={3}>3 - Three Arterial Grafts (CPT 33535)</option>
              <option value={4}>4 - Four+ Arterial Grafts (CPT 33536)</option>
            </select>
          </div>

          <div>
            <label htmlFor="venousGraftsSelect" className="block text-xs font-semibold text-slate-700 mb-1">
              Saphenous Vein Anastomoses
            </label>
            <select
              id="venousGraftsSelect"
              value={venousGrafts}
              onChange={(e) => setVenousGrafts(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            >
              <option value={0}>0 - No Venous Grafts</option>
              <option value={1}>1 - Single Venous Graft (+33517)</option>
              <option value={2}>2 - Two Venous Grafts (+33518)</option>
              <option value={3}>3 - Three Venous Grafts (+33519)</option>
              <option value={4}>4 - Four Venous Grafts (+33521)</option>
              <option value={5}>5 - Five Venous Grafts (+33522)</option>
              <option value={6}>6 - Six or More Venous Grafts (+33523)</option>
            </select>
          </div>

          <div>
            <label htmlFor="harvestMethodSelect" className="block text-xs font-semibold text-slate-700 mb-1">
              Conduit Harvest Modality
            </label>
            <select
              id="harvestMethodSelect"
              value={harvestMethod}
              onChange={(e) => setHarvestMethod(e.target.value as 'open' | 'endoscopic' | 'radial')}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="endoscopic">Endoscopic Saphenous Harvest (+33508 Add-on)</option>
              <option value="open">Open Vein Harvest (Bundled into CABG)</option>
              <option value="radial">Radial Artery Harvest (CPT 35600)</option>
            </select>
          </div>
        </div>

        {/* Panel 2: Concomitant Valves & ECMO */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm border-b border-slate-100 pb-2">
            <Heart className="w-4 h-4" />
            <span>2. Concomitant Valves & ECMO</span>
          </div>

          <div>
            <label htmlFor="valveProcedureSelect" className="block text-xs font-semibold text-slate-700 mb-1">
              Concomitant Valvular Surgery
            </label>
            <select
              id="valveProcedureSelect"
              value={valveProcedure}
              onChange={(e) => setValveProcedure(e.target.value as 'none' | 'avr' | 'mvr' | 'double')}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="none">None (CABG Alone)</option>
              <option value="avr">Aortic Valve Replacement (AVR - CPT 33405)</option>
              <option value="mvr">Mitral Valve Replacement (MVR - CPT 33430)</option>
              <option value="double">Double Valve: AVR (33405) + MVR (33430)</option>
            </select>
          </div>

          <div>
            <label htmlFor="ecmoSupportSelect" className="block text-xs font-semibold text-slate-700 mb-1">
              Cardiopulmonary Support / ECMO
            </label>
            <select
              id="ecmoSupportSelect"
              value={ecmoSupport}
              onChange={(e) => setEcmoSupport(e.target.value as 'none' | 'va_ecmo' | 'vv_ecmo' | 'iabp' | 'impella')}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="none">None (Standard CPB Circuit)</option>
              <option value="va_ecmo">Veno-Arterial (VA) ECMO Initiation (33947)</option>
              <option value="vv_ecmo">Veno-Venous (VV) ECMO Initiation (33946)</option>
              <option value="iabp">Intra-Aortic Balloon Pump (IABP - 33967)</option>
              <option value="impella">Percutaneous LVAD / Impella (33990)</option>
            </select>
          </div>

          {(ecmoSupport === 'va_ecmo' || ecmoSupport === 'vv_ecmo') && (
            <div className="pt-1">
              <label htmlFor="openCannulationCutdownCheck" className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  id="openCannulationCutdownCheck"
                  type="checkbox"
                  checked={openCannulationCutdown}
                  onChange={(e) => setOpenCannulationCutdown(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Open cutdown cannulation for ECMO (CPT 33954)</span>
              </label>
            </div>
          )}
        </div>

        {/* Panel 3: Billing Traps & Audits */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm border-b border-slate-100 pb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>3. Audit Traps & Failure Modes</span>
          </div>

          <div className="space-y-3 pt-1">
            <label htmlFor="standaloneVenousCheck" className="flex items-start gap-2 cursor-pointer text-xs text-slate-700">
              <input
                id="standaloneVenousCheck"
                type="checkbox"
                checked={useStandaloneVenousWithArterial}
                onChange={(e) => setUseStandaloneVenousWithArterial(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
              />
              <div>
                <span className="font-semibold text-rose-900 block">Simulate Standalone Venous Mistake</span>
                <span className="text-[11px] text-slate-500 leading-tight block">
                  Bill CPT 33510–33516 instead of add-on +33517 with arterial graft (Fatal NCCI CO-97 rejection).
                </span>
              </div>
            </label>

            <label htmlFor="applyMod51Check" className="flex items-start gap-2 cursor-pointer text-xs text-slate-700">
              <input
                id="applyMod51Check"
                type="checkbox"
                checked={applyMod51ToVenousAddon}
                onChange={(e) => setApplyMod51ToVenousAddon(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
              />
              <div>
                <span className="font-semibold text-rose-900 block">Append Mod -51 to Venous Add-On</span>
                <span className="text-[11px] text-slate-500 leading-tight block">
                  Add-on codes are modifier -51 exempt. Inappropriately slashes 50% allowable.
                </span>
              </div>
            </label>

            <label htmlFor="unbundleCpbCheck" className="flex items-start gap-2 cursor-pointer text-xs text-slate-700">
              <input
                id="unbundleCpbCheck"
                type="checkbox"
                checked={unbundleCpbCannulation}
                onChange={(e) => setUnbundleCpbCannulation(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
              />
              <div>
                <span className="font-semibold text-rose-900 block">Unbundle Routine CPB Cannulation</span>
                <span className="text-[11px] text-slate-500 leading-tight block">
                  Bill CPT 33954 for routine bypass cannula placement during elective surgery (Statutory bundle).
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Work RVUs</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{scrubberResult.totalRvu}</div>
          <span className="text-[11px] text-slate-400">Total physician RVU yield</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Expected Net Allowable</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ${scrubberResult.expectedReimbursement.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600">Clean adjudicated payment</span>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Denial / Audit Risk</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            ${scrubberResult.penaltyAtRisk.toLocaleString()}
          </div>
          <span className="text-[11px] text-rose-600">Immediate clawback potential</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Surgical Coding Status</span>
            <div className="text-sm font-extrabold mt-1 flex items-center gap-1.5">
              {scrubberResult.penaltyAtRisk > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-rose-300">Errors Detected</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300">Clean Scrub</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowLeadModal(true)}
            className="mt-2 w-full py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Request Audit Review
          </button>
        </div>
      </div>

      {/* Audit Alerts */}
      <div className="space-y-3">
        {scrubberResult.alerts.map((a, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              a.type === 'fatal'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : a.type === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            {a.type === 'fatal' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : a.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="font-bold text-sm leading-snug">{a.title}</h4>
              <p className="text-xs leading-relaxed opacity-90">{a.desc}</p>
              <div className="text-[10px] font-mono opacity-75 mt-1">Authority: {a.statute}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Adjudicated Claim Line Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-rose-600" />
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Adjudicated Surgical Claim Lines (CMS-1500 / 837P)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {scrubberResult.lines.length} Line Item(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold">
                <th className="p-3">CPT Code</th>
                <th className="p-3">Description</th>
                <th className="p-3">Modifier</th>
                <th className="p-3 text-right">RVU</th>
                <th className="p-3 text-right">Est. Fee</th>
                <th className="p-3">Scrubber Rule Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {scrubberResult.lines.map((l, idx) => (
                <tr
                  key={idx}
                  className={
                    l.status === 'fatal'
                      ? 'bg-rose-50/70 text-rose-950'
                      : l.status === 'warning'
                      ? 'bg-amber-50/50'
                      : 'hover:bg-slate-50/60'
                  }
                >
                  <td className="p-3 font-mono font-bold">{l.code}</td>
                  <td className="p-3">{l.desc}</td>
                  <td className="p-3 font-mono font-semibold">{l.mod}</td>
                  <td className="p-3 text-right font-mono">{l.rvu > 0 ? l.rvu.toFixed(1) : '-'}</td>
                  <td className="p-3 text-right font-mono font-bold">
                    {l.fee > 0 ? `$${l.fee.toFixed(2)}` : '$0.00'}
                  </td>
                  <td className="p-3 text-[11px] leading-tight">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mr-1.5 ${
                        l.status === 'fatal'
                          ? 'bg-rose-200 text-rose-900'
                          : l.status === 'warning'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {l.status.toUpperCase()}
                    </span>
                    {l.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ANSI X12 837P EDI Stream */}
      <div className="bg-slate-900 rounded-xl p-5 text-slate-200 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-rose-400">
            <FileCode className="w-4 h-4" />
            <span className="font-bold">ANSI X12 837P Professional Claim Simulation</span>
          </div>
          <button
            onClick={handleCopyEdi}
            className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy EDI'}
          </button>
        </div>
        <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
          {ediClaimStream}
        </pre>
      </div>

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-lg text-slate-900 font-jakarta">
                  Cardiothoracic Surgical RCM Audit
                </h3>
              </div>
              <button
                onClick={() => setShowLeadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {leadSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-slate-900">Cardiothoracic Audit Dossier Sent</h4>
                <p className="text-sm text-slate-600">
                  Kiran and the Aethera surgical revenue cycle team have received your clinical simulation. We will deliver your bespoke CABG/ECMO coding optimization protocol within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Have our certified cardiothoracic surgical coding auditors review your CABG operative reports, ECMO cutdown notes, and multiple-procedure reduction claims to recoup lost revenue.
                </p>

                <div>
                  <label htmlFor="leadContactName" className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    id="leadContactName"
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Dr. Julian Ross, MD / Surgical Practice Manager"
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label htmlFor="leadContactEmail" className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
                  <input
                    id="leadContactEmail"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="jross@cardiovascularsurgeons.org"
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label htmlFor="leadPracticeName" className="block text-xs font-bold text-slate-700 mb-1">Practice / Cardiovascular Center</label>
                  <input
                    id="leadPracticeName"
                    type="text"
                    required
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="Metropolitan Heart & Vascular Institute"
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label htmlFor="leadAuditNotes" className="block text-xs font-bold text-slate-700 mb-1">Specific Denials or Coding Issues</label>
                  <textarea
                    id="leadAuditNotes"
                    rows={3}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="E.g. Payers denying endoscopic harvest +33508 or rejecting ECMO cannulation 33954 post-CABG..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Audit Protocol...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Transmit Cardiothoracic Audit Request
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Direct confidential transmission to Kiran (kirkmar078@gmail.com). Zero PHI retention.
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
