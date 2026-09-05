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
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

type PrimaryPelvicProcedure = 'sacrocolpopexy' | 'colporrhaphy_ap' | 'colporrhaphy_ant' | 'sacrospinous_fixation';

interface PelvicProcedureConfig {
  id: PrimaryPelvicProcedure;
  name: string;
  code: string;
  desc: string;
  fee: number;
  bundlesCystoscopy: boolean;
}

const PELVIC_PROCEDURES: Record<PrimaryPelvicProcedure, PelvicProcedureConfig> = {
  sacrocolpopexy: {
    id: 'sacrocolpopexy',
    name: 'Laparoscopic / Robotic Sacrocolpopexy',
    code: '57425',
    desc: 'Laparoscopy, surgical, colpopexy (suspension of vaginal apex with synthetic mesh)',
    fee: 980.0,
    bundlesCystoscopy: true,
  },
  colporrhaphy_ap: {
    id: 'colporrhaphy_ap',
    name: 'Combined Anteroposterior Colporrhaphy (A&P Repair)',
    code: '57260',
    desc: 'Combined anteroposterior colporrhaphy; cystocele and rectocele repair',
    fee: 810.0,
    bundlesCystoscopy: true,
  },
  colporrhaphy_ant: {
    id: 'colporrhaphy_ant',
    name: 'Anterior Colporrhaphy Alone (Cystocele Repair)',
    code: '57240',
    desc: 'Anterior colporrhaphy, repair of cystocele with or without repair of urethrocele',
    fee: 590.0,
    bundlesCystoscopy: true,
  },
  sacrospinous_fixation: {
    id: 'sacrospinous_fixation',
    name: 'Sacrospinous Ligament Fixation',
    code: '57282',
    desc: 'Colpopexy, vaginal; extra-peritoneal (sacrospinous, iliococcygeus)',
    fee: 690.0,
    bundlesCystoscopy: true,
  },
};

export default function UrogynecologyScrubber() {
  const [primaryProcedure, setPrimaryProcedure] = useState<PrimaryPelvicProcedure>('sacrocolpopexy');
  const [performConcurrentSling, setPerformConcurrentSling] = useState<boolean>(true); // CPT 57288

  // Cystoscopy Verification vs Diagnostic Trap
  const [cystoscopyType, setCystoscopyType] = useState<'none' | 'routine_patency' | 'distinct_diagnostic'>('routine_patency');

  // POP-Q Staging & Conservative Trial
  const [popqStage, setPopqStage] = useState<'stage_1' | 'stage_2' | 'stage_3_4'>('stage_3_4');
  const [hasFailedConservativeTrial, setHasFailedConservativeTrial] = useState<boolean>(true);

  // Urodynamics Component Stacking
  const [includeUrodynamics, setIncludeUrodynamics] = useState<boolean>(false);
  const [includeCmgVoiding, setIncludeCmgVoiding] = useState<boolean>(true); // 51729
  const [includeSphincterEmg, setIncludeSphincterEmg] = useState<boolean>(true); // +51784
  const [includeAbdominalPressure, setIncludeAbdominalPressure] = useState<boolean>(true); // +51797
  const [includeUroflowmetry, setIncludeUroflowmetry] = useState<boolean>(true); // 51741
  const [udsModifierType, setUdsModifierType] = useState<'global' | '26_professional' | 'tc_technical'>('global');

  // Lead Modal & UI States
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showLeadModal, setShowLeadModal] = useState<boolean>(false);
  const [leadSuccess, setLeadSuccess] = useState<boolean>(false);
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [practiceName, setPracticeName] = useState<string>('');
  const [auditNotes, setAuditNotes] = useState<string>('');

  const currentPelvic = PELVIC_PROCEDURES[primaryProcedure];

  // Audit Calculations
  const auditResults = useMemo(() => {
    interface ClaimLine {
      code: string;
      desc: string;
      units: number;
      modifiers: string[];
      fee: number;
      isBundled: boolean;
      status: 'clean' | 'bundled_denial' | 'modified_reimbursed' | 'compliance_risk';
      note: string;
    }

    const lines: ClaimLine[] = [];
    const complianceFlags: { type: 'error' | 'warning' | 'info'; title: string; message: string }[] = [];
    let grossCharges = 0;
    let compliantReimbursement = 0;
    let riskPreventedAmount = 0;

    // 1. Primary Pelvic Reconstructive Procedure
    lines.push({
      code: currentPelvic.code,
      desc: currentPelvic.desc,
      units: 1,
      modifiers: [],
      fee: currentPelvic.fee,
      isBundled: false,
      status: 'clean',
      note: 'Primary pelvic floor reconstruction code. 100% allowable reimbursement base.',
    });
    grossCharges += currentPelvic.fee;
    compliantReimbursement += currentPelvic.fee;

    // POP-Q Medical Necessity Validation
    if (popqStage === 'stage_1') {
      riskPreventedAmount += currentPelvic.fee;
      complianceFlags.push({
        type: 'error',
        title: 'Prior Authorization Denial: Inadequate POP-Q Prolapse Staging',
        message: `Stage I pelvic organ prolapse does not meet medical necessity criteria for surgical reconstruction (${currentPelvic.code}) under commercial payer LCDs. Requires documented Stage II or greater symptomatic descent.`,
      });
    } else if (popqStage === 'stage_2' && !hasFailedConservativeTrial) {
      riskPreventedAmount += currentPelvic.fee;
      complianceFlags.push({
        type: 'warning',
        title: 'Missing Conservative Therapy Documentation for Stage II Prolapse',
        message: 'Payers require documented failure or contraindication of 3+ months of conservative management (pessary trial or pelvic floor physical therapy) prior to approving surgical repair for Stage II prolapse.',
      });
    }

    // 2. Concurrent Mid-Urethral Sling (CPT 57288)
    if (performConcurrentSling) {
      const slingGross = 720.0;
      const slingAllowed = slingGross * 0.5; // 50% multiple surgery reduction
      lines.push({
        code: '57288',
        desc: 'Sling operation for stress urinary incontinence (e.g., retropubic or transobturator mid-urethral sling)',
        units: 1,
        modifiers: ['51'],
        fee: slingAllowed,
        isBundled: false,
        status: 'clean',
        note: 'Secondary surgical procedure. Subject to 50% multiple procedure reduction under Modifier 51.',
      });
      grossCharges += slingGross;
      compliantReimbursement += slingAllowed;
    }

    // 3. Cystourethroscopy (CPT 52000) Bundling Evaluation
    if (cystoscopyType === 'routine_patency') {
      grossCharges += 280.0;
      riskPreventedAmount += 280.0;
      lines.push({
        code: '52000',
        desc: 'Cystourethroscopy (post-surgical ureteral patency & bladder integrity check)',
        units: 1,
        modifiers: [],
        fee: 0,
        isBundled: true,
        status: 'bundled_denial',
        note: `Statutorily BUNDLED into ${currentPelvic.code}${performConcurrentSling ? ' and 57288' : ''}. Per ACOG, AUGS, and CMS NCCI Chapter VII, verifying ureteral patency via IV indigo carmine/fluorescein is an integral safety component of pelvic reconstruction and cannot be unbundled.`,
      });
      complianceFlags.push({
        type: 'error',
        title: `Fatal NCCI Bundling Edit: 52000 Bundled into ${currentPelvic.code}`,
        message: `Billing diagnostic cystoscopy (52000) solely to evaluate ureteral jets or suture breach following pelvic floor repair violates CMS NCCI policy. Unbundling with Modifier 59 without an independent diagnostic finding results in CARC CO-97 denial and audit liability.`,
      });
    } else if (cystoscopyType === 'distinct_diagnostic') {
      const cytoGross = 280.0;
      const cytoAllowed = cytoGross * 0.5;
      lines.push({
        code: '52000',
        desc: 'Diagnostic cystourethroscopy (distinct medical necessity indication)',
        units: 1,
        modifiers: ['59', 'XU'],
        fee: cytoAllowed,
        isBundled: false,
        status: 'modified_reimbursed',
        note: 'Billed with Modifier 59/XU. Documentation must detail a separate diagnostic indication (e.g. gross hematuria, bladder mass) outside the operative repair.',
      });
      grossCharges += cytoGross;
      compliantReimbursement += cytoAllowed;
    }

    // 4. In-Office Complex Urodynamics (UDS) Stacking
    if (includeUrodynamics) {
      const modArr: string[] = [];
      let multiplier = 1.0;
      if (udsModifierType === '26_professional') {
        modArr.push('26');
        multiplier = 0.45; // Professional fee split
      } else if (udsModifierType === 'tc_technical') {
        modArr.push('TC');
        multiplier = 0.55; // Technical fee split
      }

      if (includeCmgVoiding) {
        const fee = 290.0 * multiplier;
        lines.push({
          code: '51729',
          desc: 'Complex cystometrogram (CMG) with voiding pressure studies (intravesical, intra-abdominal) and bladder output study',
          units: 1,
          modifiers: [...modArr],
          fee,
          isBundled: false,
          status: 'clean',
          note: `Primary urodynamics code. ${udsModifierType !== 'global' ? `Reported with Modifier ${modArr[0]}.` : 'Billed globally.'}`,
        });
        grossCharges += 290.0;
        compliantReimbursement += fee;
      }

      if (includeSphincterEmg) {
        const fee = 115.0 * multiplier;
        lines.push({
          code: '+51784',
          desc: 'Electromyography studies (EMG) of anal or urethral sphincter, other than needle (add-on code)',
          units: 1,
          modifiers: [...modArr],
          fee,
          isBundled: false,
          status: 'clean',
          note: 'CPT add-on code (+). No modifier 51 required. Evaluates sphincter coordination during filling/voiding.',
        });
        grossCharges += 115.0;
        compliantReimbursement += fee;
      }

      if (includeAbdominalPressure) {
        const fee = 135.0 * multiplier;
        lines.push({
          code: '+51797',
          desc: 'Voiding pressure studies, intra-abdominal (add-on code, list separately in addition to primary CMG)',
          units: 1,
          modifiers: [...modArr],
          fee,
          isBundled: false,
          status: 'clean',
          note: 'Add-on code (+). Measures rectal/balloon intra-abdominal pressure to calculate true detrusor pressure.',
        });
        grossCharges += 135.0;
        compliantReimbursement += fee;
      }

      if (includeUroflowmetry) {
        const fee = 85.0 * multiplier;
        lines.push({
          code: '51741',
          desc: 'Complex uroflowmetry (e.g. calibrated electronic flow rate recording)',
          units: 1,
          modifiers: [...modArr],
          fee,
          isBundled: false,
          status: 'clean',
          note: 'Evaluates flow curves and peak voiding velocity prior to catheter insertion.',
        });
        grossCharges += 85.0;
        compliantReimbursement += fee;
      }
    }

    return {
      lines,
      complianceFlags,
      grossCharges,
      compliantReimbursement,
      riskPreventedAmount,
    };
  }, [
    primaryProcedure,
    performConcurrentSling,
    cystoscopyType,
    popqStage,
    hasFailedConservativeTrial,
    includeUrodynamics,
    includeCmgVoiding,
    includeSphincterEmg,
    includeAbdominalPressure,
    includeUroflowmetry,
    udsModifierType,
    currentPelvic,
  ]);

  // ANSI 837P Claim Stream Generation
  const ansi837pLines = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const dateStr = today;
    let segs: string[] = [];
    segs.push(`ISA*00*          *00*          *ZZ*UROGYNCLINIC   *ZZ*MEDICAREPAYER  *${today.slice(2)}*1200*^*00501*000000491*0*P*:~`);
    segs.push(`GS*HC*UROGYNCLINIC*MEDICAREPAYER*${dateStr}*1200*491*X*005010X222A1~`);
    segs.push(`ST*837*0001*005010X222A1~`);
    segs.push(`BHT*0019*00*URO20260905*${dateStr}*1200*CH~`);
    segs.push(`NM1*85*2*PELVIC HEALTH & UROGYNECOLOGY SPECIALISTS*****XX*1748392015~`);
    segs.push(`CLM*URO-2026-0905*${auditResults.compliantReimbursement.toFixed(2)}***11:B:1*Y*A*Y*Y~`);
    segs.push(`HI*BK:N81.3*BF:N39.3*BF:R35.0~`); // Uterovaginal prolapse incomplete, Stress urinary incontinence, Frequency

    auditResults.lines.forEach((line, idx) => {
      const modStr = line.modifiers.length > 0 ? `:${line.modifiers.join(':')}` : '';
      segs.push(`LX*${idx + 1}~`);
      segs.push(`SV1*HC:${line.code}${modStr}*${line.fee.toFixed(2)}*UN*${line.units}***1:2~`);
      segs.push(`DTP*472*D8*${dateStr}~`);
    });

    segs.push(`SE*${segs.length + 1}*0001~`);
    segs.push(`GE*1*491~`);
    segs.push(`IEA*1*000000491~`);
    return segs.join('\n');
  }, [auditResults]);

  const handleCopy = () => {
    navigator.clipboard.writeText(ansi837pLines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await sendLeadToKiran('Urogynecology Pelvic Floor Audit Dossier', {
        contactName,
        contactEmail,
        practiceName,
        primaryProcedure: currentPelvic.name,
        performConcurrentSling,
        cystoscopyType,
        grossCharges: auditResults.grossCharges,
        compliantReimbursement: auditResults.compliantReimbursement,
        riskPreventedAmount: auditResults.riskPreventedAmount,
        notes: auditNotes,
      });
      trackConversion('lead_submit_urogynecology_scrubber');
      setLeadSuccess(true);
      setTimeout(() => {
        setShowLeadModal(false);
        setLeadSuccess(false);
      }, 3000);
    } catch {
      alert('Error delivering audit packet. Please email kirkmar078@gmail.com directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200">
              <Activity className="w-3.5 h-3.5" />
              FPMRS & Urogynecology Intelligence
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              ACOG / AUGS & CMS Compliant
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-jakarta">
            Urogynecology &amp; Pelvic Floor Bundling Scrubber
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Evaluate sacrocolpopexy and mid-urethral sling bundling, resolve routine cystoscopy (52000) unbundling clawbacks, validate POP-Q prolapse medical necessity, and stack complex multi-channel urodynamics (UDS).
          </p>
        </div>

        <button
          onClick={() => setShowLeadModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal text-navy font-bold text-sm hover:bg-mint transition-all shadow-sm shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Request Pelvic Floor RCM Review
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Configurator Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Primary Pelvic Floor Surgery */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. Primary Pelvic Floor Reconstructive Surgery
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(PELVIC_PROCEDURES) as PrimaryPelvicProcedure[]).map((key) => {
                const proc = PELVIC_PROCEDURES[key];
                const isSelected = primaryProcedure === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPrimaryProcedure(key)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-pink-600 bg-pink-50/50 ring-2 ring-pink-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900">CPT {proc.code}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        isSelected ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        ${proc.fee}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium line-clamp-2">{proc.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Concurrent Mid-Urethral Sling */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  2. Concurrent Mid-Urethral Sling (CPT 57288)
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Retropubic (TVT) or transobturator (TOT) sling performed during same operative encounter
                </p>
              </div>
              <input
                type="checkbox"
                checked={performConcurrentSling}
                onChange={(e) => setPerformConcurrentSling(e.target.checked)}
                className="rounded text-pink-600 focus:ring-pink-500 h-5 w-5"
              />
            </div>
            {performConcurrentSling && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Secondary Procedure Modifier 51 Applied</span>
                <span className="font-mono font-bold text-slate-800">$360.00 (50% of $720.00)</span>
              </div>
            )}
          </div>

          {/* Cystoscopy Unbundling Audit Trap */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                3. Cystourethroscopy (CPT 52000) Intent
              </label>
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                Major CMS Audit Trap
              </span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="cystoscopy"
                  checked={cystoscopyType === 'none'}
                  onChange={() => setCystoscopyType('none')}
                  className="text-pink-600 focus:ring-pink-500 h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">No cystoscopy performed</span>
                  <p className="text-[11px] text-slate-500">Pure anatomical repair without endourologic evaluation</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer ${
                cystoscopyType === 'routine_patency'
                  ? 'border-rose-300 bg-rose-50/60'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="cystoscopy"
                  checked={cystoscopyType === 'routine_patency'}
                  onChange={() => setCystoscopyType('routine_patency')}
                  className="text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-900">
                      Routine post-repair patency / integrity check
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded">
                      NCCI Bundled!
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Checking ureteral jets with dye or confirming no bladder stitch breach (Non-reimbursable separately)
                  </p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer ${
                cystoscopyType === 'distinct_diagnostic'
                  ? 'border-emerald-300 bg-emerald-50/60'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="cystoscopy"
                  checked={cystoscopyType === 'distinct_diagnostic'}
                  onChange={() => setCystoscopyType('distinct_diagnostic')}
                  className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-900">
                      Distinct diagnostic indication (Modifier 59 / XU)
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded">
                      Reimbursable
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Pre-planned diagnostic evaluation for persistent gross hematuria or bladder mass
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* POP-Q Staging & Prior-Auth Defense */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              4. Pelvic Organ Prolapse Staging (POP-Q)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPopqStage('stage_1')}
                className={`py-2.5 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                  popqStage === 'stage_1'
                    ? 'bg-rose-600 text-white border-rose-600 shadow'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Stage 0 / I
                <span className="block text-[10px] font-normal opacity-90">&gt; -1 cm (Denied)</span>
              </button>

              <button
                type="button"
                onClick={() => setPopqStage('stage_2')}
                className={`py-2.5 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                  popqStage === 'stage_2'
                    ? 'bg-amber-600 text-white border-amber-600 shadow'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Stage II
                <span className="block text-[10px] font-normal opacity-90">-1 cm to +1 cm</span>
              </button>

              <button
                type="button"
                onClick={() => setPopqStage('stage_3_4')}
                className={`py-2.5 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                  popqStage === 'stage_3_4'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Stage III / IV
                <span className="block text-[10px] font-normal opacity-90">&gt; +1 cm (Procidentia)</span>
              </button>
            </div>

            {popqStage === 'stage_2' && (
              <label className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFailedConservativeTrial}
                  onChange={(e) => setHasFailedConservativeTrial(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span>Documented 3+ month failure of pessary trial or pelvic floor physiotherapy</span>
              </label>
            )}
          </div>

          {/* In-Office Complex Urodynamics (UDS) Module */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="uds-toggle-checkbox" className="cursor-pointer">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  5. In-Office Complex Urodynamics (UDS) Testing
                </span>
                <span className="text-xs text-slate-500 block">Multi-channel urodynamics workup for urinary incontinence</span>
              </label>
              <input
                id="uds-toggle-checkbox"
                type="checkbox"
                checked={includeUrodynamics}
                onChange={(e) => setIncludeUrodynamics(e.target.checked)}
                className="rounded text-pink-600 focus:ring-pink-500 h-5 w-5"
              />
            </div>

            {includeUrodynamics && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUdsModifierType('global')}
                    className={`py-1.5 px-2 text-xs font-bold rounded border ${
                      udsModifierType === 'global' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Global (Office)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUdsModifierType('26_professional')}
                    className={`py-1.5 px-2 text-xs font-bold rounded border ${
                      udsModifierType === '26_professional' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Mod -26 (Physician)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUdsModifierType('tc_technical')}
                    className={`py-1.5 px-2 text-xs font-bold rounded border ${
                      udsModifierType === 'tc_technical' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Mod -TC (Facility)
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCmgVoiding}
                      onChange={(e) => setIncludeCmgVoiding(e.target.checked)}
                      className="rounded text-pink-600 focus:ring-pink-500 h-4 w-4"
                    />
                    <span className="font-bold">51729</span> Complex CMG with voiding pressure studies
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSphincterEmg}
                      onChange={(e) => setIncludeSphincterEmg(e.target.checked)}
                      className="rounded text-pink-600 focus:ring-pink-500 h-4 w-4"
                    />
                    <span className="font-bold">+51784</span> Electromyography (EMG) studies of sphincter
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAbdominalPressure}
                      onChange={(e) => setIncludeAbdominalPressure(e.target.checked)}
                      className="rounded text-pink-600 focus:ring-pink-500 h-4 w-4"
                    />
                    <span className="font-bold">+51797</span> Intra-abdominal voiding pressure studies
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeUroflowmetry}
                      onChange={(e) => setIncludeUroflowmetry(e.target.checked)}
                      className="rounded text-pink-600 focus:ring-pink-500 h-4 w-4"
                    />
                    <span className="font-bold">51741</span> Complex electronic uroflowmetry
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Audit Engine & EDI Claims Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Revenue & Audit KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Gross Charges</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                ${auditResults.grossCharges.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-slate-500">Unscrubbed total</span>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm text-center">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Compliant Net</span>
              <p className="text-xl font-extrabold text-emerald-700 mt-1 font-mono">
                ${auditResults.compliantReimbursement.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-emerald-600">Expected allowable</span>
            </div>

            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 shadow-sm text-center">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wide">Denial Exposure</span>
              <p className="text-xl font-extrabold text-rose-700 mt-1 font-mono">
                ${auditResults.riskPreventedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-rose-600">Prevented bundling/denial</span>
            </div>
          </div>

          {/* Compliance Alerts Feed */}
          {auditResults.complianceFlags.length > 0 ? (
            <div className="space-y-3">
              {auditResults.complianceFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-sm flex gap-3 items-start ${
                    flag.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                    flag.type === 'error' ? 'text-rose-600' : 'text-amber-600'
                  }`} />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider mb-1">{flag.title}</h4>
                    <p className="text-xs leading-relaxed opacity-90">{flag.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 text-emerald-900 text-sm flex gap-3 items-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-950">
                  Clean FPMRS Surgical &amp; Diagnostic Episode
                </h4>
                <p className="text-xs text-emerald-800">
                  All pelvic floor reconstruction and urodynamic test combinations adhere to CMS Chapter VII and ACOG/AUGS clinical policy.
                </p>
              </div>
            </div>
          )}

          {/* Line-by-Line Claim Scrubber Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-pink-600" />
                Scrubbed FPMRS Claim Lines ({auditResults.lines.length})
              </span>
              <span className="text-[10px] font-semibold text-slate-500">CMS-1500 / 837P Format</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {auditResults.lines.map((line, idx) => (
                <div key={idx} className="p-3.5 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200">
                        {line.code}
                      </span>
                      {line.modifiers.map((mod, mIdx) => (
                        <span
                          key={mIdx}
                          className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-100 text-pink-800"
                        >
                          Mod {mod}
                        </span>
                      ))}
                      <span className="text-[11px] text-slate-500 font-mono">x{line.units}</span>
                    </div>

                    <div className="text-right">
                      <span className={`font-mono font-bold text-xs ${
                        line.isBundled ? 'line-through text-rose-500' : 'text-slate-900'
                      }`}>
                        ${line.fee.toFixed(2)}
                      </span>
                      {line.isBundled && (
                        <span className="block text-[9px] font-bold text-rose-600 uppercase">Bundled</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 mt-1 font-medium">{line.desc}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{line.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* EDI 837P Segment Box */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 shadow-sm border border-slate-800">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-pink-400" />
                ANSI X12 837P Electronic Claim Output
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy EDI'}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed max-h-44 p-2 bg-slate-950 rounded border border-slate-800">
              {ansi837pLines}
            </pre>
          </div>
        </div>
      </div>

      {/* Clinical Guidance Footnote */}
      <div className="mt-8 p-5 bg-pink-50/70 border border-pink-200 rounded-xl">
        <h4 className="text-xs font-bold uppercase tracking-wider text-pink-900 flex items-center gap-1.5 mb-2">
          <Info className="w-4 h-4 text-pink-600" />
          ACOG / AUGS & CMS Pelvic Floor Reconstruction Coding Rules
        </h4>
        <ul className="text-xs text-pink-950 space-y-1.5 list-disc list-inside leading-relaxed">
          <li>
            <strong>Cystoscopy Patency Check (52000):</strong> Is statutorily bundled into primary surgical procedures (57425, 57288, 57260). Payers routinely demand post-payment recoupment if billed with Modifier 59 without a pre-existing medical necessity indication.
          </li>
          <li>
            <strong>Concurrent Sling (57288) with Prolapse Repair:</strong> Always requires Modifier 51 and prior authorization approval on both codes when performed simultaneously for mixed pelvic floor disorders.
          </li>
          <li>
            <strong>Urodynamics Component Stacking:</strong> Ensure physician professional interpretation (-26) is cleanly segregated from facility equipment fees (-TC) when performed outside a hospital outpatient department.
          </li>
        </ul>
      </div>

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-pink-600" />
                <h3 className="font-bold text-lg text-slate-900 font-jakarta">
                  FPMRS &amp; Urogynecology Revenue Cycle Audit
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
                <h4 className="text-lg font-bold text-slate-900">Audit Dossier Transmitted</h4>
                <p className="text-sm text-slate-600">
                  Kiran and the Aethera Pelvic Health RCM audit team have received your simulation. We will deliver your bespoke pelvic floor coding and prior-authorization appeal dossier within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Have our certified urogynecology billing and coding experts review your operative reports, cystoscopy unbundling appeals, and multi-channel urodynamic claim rejections.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Dr. Eleanor Vance, MD / Practice Administrator"
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="evance@pelvichealthspecialists.com"
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Practice / Health System</label>
                  <input
                    type="text"
                    required
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="Center for Urogynecology & Pelvic Reconstruction"
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specific Denials or Operative Challenges</label>
                  <textarea
                    rows={3}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="E.g. Commercial payers clawing back 52000 when billed with 57425 or denying sling 57288 prior authorizations..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Audit Dossier...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Transmit Pelvic Floor Audit Request
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
