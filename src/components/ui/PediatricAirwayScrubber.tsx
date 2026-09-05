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
  Stethoscope,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function PediatricAirwayScrubber() {
  // 1. Primary Airway Reconstructive Procedure
  const [procedureType, setProcedureType] = useState<
    'ltr_single_stage' | 'ltr_double_stage' | 'cricotracheal_resection' | 'endoscopic_balloon_dilation'
  >('ltr_single_stage');

  const [simulateDowncode, setSimulateDowncode] = useState<boolean>(false); // Payer downcodes CTR 31584 to tracheoplasty 31750

  // 2. Cotton-Myer Stenosis Grade
  const [stenosisGrade, setStenosisGrade] = useState<'grade_2' | 'grade_3' | 'grade_4'>('grade_3');

  // 3. Autologous Costal Cartilage Rib Graft Harvest (CPT 20902)
  const [hasCostalCartilageHarvest, setHasCostalCartilageHarvest] = useState<boolean>(true);
  const [separateInframammaryIncision, setSeparateInframammaryIncision] = useState<boolean>(true);

  // 4. Staged Postoperative Surveillance Microlaryngoscopy & Stent Removal within Global (CPT 31622 / 31575)
  const [hasPostOpSurveillance, setHasPostOpSurveillance] = useState<boolean>(true);
  const [stagedModifier58Documented, setStagedModifier58Documented] = useState<boolean>(true);

  // 5. Concomitant Supraglottoplasty (CPT 31541-51)
  const [hasSupraglottoplasty, setHasSupraglottoplasty] = useState<boolean>(false);

  // 6. Tracheostomy Revision / TCF Closure (CPT 31610 / 31614)
  const [hasTracheostomyRevision, setHasTracheostomyRevision] = useState<boolean>(false);

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

    // --- 1. PRIMARY AIRWAY RECONSTRUCTION ---
    if (procedureType === 'ltr_single_stage') {
      const ltrFee = 4250.0;
      const ltrRvu = 48.6;
      totalRvu += ltrRvu;
      expectedReimbursement += ltrFee;

      lines.push({
        code: '31587',
        desc: 'Laryngoplasty, open; for laryngeal stenosis with graft, single-stage without tracheostomy',
        mod: 'None',
        rvu: ltrRvu,
        fee: ltrFee,
        status: 'clean',
        note: 'Clean primary LTR: Anterior/posterior cricoid cartilage division, costal graft fixation, endotracheal stenting.',
      });

      alerts.push({
        type: 'clean',
        title: 'Single-Stage LTR (CPT 31587) Compliant',
        desc: 'Operative dictation supports full open laryngotracheoplasty with intraluminal stenting. Patient successfully extubated post-op without secondary tracheostomy.',
        statute: 'AMA CPT Codebook; AAP Pediatric Otolaryngology Guidelines',
      });
    } else if (procedureType === 'ltr_double_stage') {
      const ltrFee = 4450.0;
      const ltrRvu = 51.2;
      totalRvu += ltrRvu;
      expectedReimbursement += ltrFee;

      lines.push({
        code: '31590',
        desc: 'Laryngeal reinnervation by neuromuscular pedicle or complex double-stage LTR with stent',
        mod: 'None',
        rvu: ltrRvu,
        fee: ltrFee,
        status: 'clean',
        note: 'Clean double-stage LTR: Cartilage grafting with endoluminal T-tube/stent insertion and retained tracheostomy.',
      });
    } else if (procedureType === 'cricotracheal_resection') {
      const ctrStandardFee = 5600.0;
      const ctrStandardRvu = 58.4;

      if (simulateDowncode) {
        const downcodedFee = 2850.0;
        const downcodedRvu = 29.1;
        totalRvu += downcodedRvu;
        expectedReimbursement += downcodedFee;
        penaltyAtRisk += ctrStandardFee - downcodedFee;

        lines.push({
          code: '31750',
          desc: 'Tracheoplasty; cervical (Downcoded from 31584 Cricotracheal Resection)',
          mod: 'None',
          rvu: downcodedRvu,
          fee: downcodedFee,
          status: 'fatal',
          note: 'PAYER DOWNCODING CLAWBACK: Health plan reclassified complete cricotracheal resection (31584) to basic cervical tracheoplasty (31750), slashing 29.3 wRVUs ($2,750 loss).',
        });

        alerts.push({
          type: 'fatal',
          title: 'Cricotracheal Resection Downcoding Clawback',
          desc: 'Commercial clearinghouses downcode complete circum-cricoid resection with thyrotracheal anastomosis (31584) to simple scar tracheoplasty (31750). Operative reports detailing full subglottic resection, bilateral recurrent laryngeal nerve preservation, and tension-release maneuvers overturn this reduction immediately.',
          statute: 'CPT Assistant; ASPO Pediatric Airway Consensus Panel',
        });
      } else {
        totalRvu += ctrStandardRvu;
        expectedReimbursement += ctrStandardFee;

        lines.push({
          code: '31584',
          desc: 'Laryngoplasty; with cricotracheal resection (CTR) and thyrotracheal anastomosis',
          mod: 'None',
          rvu: ctrStandardRvu,
          fee: ctrStandardFee,
          status: 'clean',
          note: 'Clean CTR: Resection of stenotic cricoid ring, suprahyoid laryngeal release, and tension-free anastomosis.',
        });

        alerts.push({
          type: 'clean',
          title: 'Cricotracheal Resection (31584) Fully Defended',
          desc: `Severe Grade ${stenosisGrade === 'grade_4' ? 'IV' : 'III'} stenosis documentation justifies primary cricotracheal resection over simple endoscopic or stenting approaches.`,
          statute: 'Cotton-Myer Subglottic Stenosis Classification Guidelines',
        });
      }
    } else {
      // Endoscopic balloon dilation
      const dilFee = 1450.0;
      const dilRvu = 16.8;
      totalRvu += dilRvu;
      expectedReimbursement += dilFee;

      lines.push({
        code: '31630',
        desc: 'Bronchoscopy, rigid or flexible; with tracheal or bronchial dilation or stent placement',
        mod: 'None',
        rvu: dilRvu,
        fee: dilFee,
        status: 'clean',
        note: 'Endoscopic high-pressure balloon dilation of subglottic stenosis.',
      });
    }

    // --- 2. AUTOLOGOUS COSTAL CARTILAGE HARVEST (20902) ---
    if (hasCostalCartilageHarvest && procedureType !== 'endoscopic_balloon_dilation') {
      const ribFee = 980.0;
      const ribRvu = 9.4;

      if (separateInframammaryIncision) {
        totalRvu += ribRvu;
        expectedReimbursement += ribFee;

        lines.push({
          code: '20902',
          desc: 'Bone or cartilage graft, any area, minor or small (e.g., costal cartilage rib graft harvest)',
          mod: '59',
          rvu: ribRvu,
          fee: ribFee,
          status: 'clean',
          note: 'Clean harvest: Separate right inframammary thoracotomy incision documented; Modifier 59 / XS appended.',
        });

        alerts.push({
          type: 'clean',
          title: 'Costal Cartilage Rib Harvest (CPT 20902-59) Defended',
          desc: 'Autologous rib cartilage harvest is performed via a completely distinct anatomical site and operative incision from the neck airway exposure. Modifier 59 or XS satisfies CMS NCCI Chapter VI distinct service standards.',
          statute: 'CMS NCCI Policy Manual Ch. VI § D; CPT Assistant July 2020',
        });
      } else {
        totalRvu += ribRvu;
        penaltyAtRisk += ribFee;

        lines.push({
          code: '20902',
          desc: 'Bone or cartilage graft (autologous rib harvest)',
          mod: 'None',
          rvu: ribRvu,
          fee: ribFee,
          status: 'fatal',
          note: 'UNBUNDLING REJECTION: Missing Modifier 59/XS and separate thoracotomy site notation; claim will trigger CARC 97 (Included in primary service).',
        });

        alerts.push({
          type: 'fatal',
          title: 'Rib Cartilage Harvest Unbundling Denial',
          desc: 'Payers reject CPT 20902 as integral to CPT 31587 when billed without Modifier 59 / XS or when the operative report does not clearly designate a separate thoracotomy incision and prep.',
          statute: 'CARC 97 Bundled Service Denial; CMS NCCI Column 1/Column 2 Edits',
        });
      }
    }

    // --- 3. STAGED SURVEILLANCE BRONCHOSCOPY WITHIN GLOBAL (31622) ---
    if (hasPostOpSurveillance) {
      const bronchFee = 680.0;
      const bronchRvu = 6.2;

      if (stagedModifier58Documented) {
        totalRvu += bronchRvu;
        expectedReimbursement += bronchFee;

        lines.push({
          code: '31622',
          desc: 'Bronchoscopy, rigid or flexible; diagnostic, with cell washing (Staged Post-Op Airway Assessment)',
          mod: '58',
          rvu: bronchRvu,
          fee: bronchFee,
          status: 'clean',
          note: 'Clean staged procedure: Post-op stent removal / airway caliber evaluation in OR with Modifier -58.',
        });

        alerts.push({
          type: 'clean',
          title: 'Staged Post-Op Airway Evaluation (Modifier 58) Protected',
          desc: 'Appending Modifier -58 protects postoperative surveillance bronchoscopy from 90-day surgical global period rejections when the initial operative note establishes planned staged airway reassessment.',
          statute: 'CMS Claims Processing Manual Ch. 12 § 40.1; AMA CPT Modifier -58 Guidelines',
        });
      } else {
        totalRvu += bronchRvu;
        penaltyAtRisk += bronchFee;

        lines.push({
          code: '31622',
          desc: 'Bronchoscopy, diagnostic (Missing Modifier 58)',
          mod: 'None',
          rvu: bronchRvu,
          fee: bronchFee,
          status: 'fatal',
          note: 'GLOBAL PERIOD REJECTION: Postoperative bronchoscopy within 90-day global period submitted without Modifier 58; rejected under CARC B13.',
        });

        alerts.push({
          type: 'fatal',
          title: 'Post-Op Airway Bronchoscopy Billed Without Modifier 58',
          desc: 'Secondary bronchoscopy or stent removal within 90 days of primary airway surgery will be denied by all commercial and Medicaid payers as inclusive post-op care unless Modifier -58 is properly appended.',
          statute: 'CARC B13 Previously Paid Global Care Edit',
        });
      }
    }

    // --- 4. CONCOMITANT SUPRAGLOTTOPLASTY (31541-51) ---
    if (hasSupraglottoplasty) {
      const supraFee = 920.0 * 0.5; // Modifier 51 secondary procedure 50%
      const supraRvu = 10.1 * 0.5;
      totalRvu += supraRvu;
      expectedReimbursement += supraFee;

      lines.push({
        code: '31541',
        desc: 'Laryngoscopy, direct, operative, with excision of tumor and/or stripping of vocal cords or epiglottis',
        mod: '51',
        rvu: supraRvu,
        fee: supraFee,
        status: 'clean',
        note: 'Secondary procedure: Supraglottoplasty / aryepiglottic fold release with Modifier 51.',
      });
    }

    // --- 5. TRACHEOSTOMY REVISION / TCF CLOSURE (31610 / 31614) ---
    if (hasTracheostomyRevision) {
      const trachFee = 1150.0 * 0.5;
      const trachRvu = 12.4 * 0.5;
      totalRvu += trachRvu;
      expectedReimbursement += trachFee;

      lines.push({
        code: '31610',
        desc: 'Tracheostomy, planned (separate procedure) or closure of tracheocutaneous fistula',
        mod: '51',
        rvu: trachRvu,
        fee: trachFee,
        status: 'clean',
        note: 'Secondary procedure: Stoma revision or decannulation tracheocutaneous fistula closure.',
      });
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
    stenosisGrade,
    hasCostalCartilageHarvest,
    separateInframammaryIncision,
    hasPostOpSurveillance,
    stagedModifier58Documented,
    hasSupraglottoplasty,
    hasTracheostomyRevision,
  ]);

  // ANSI 837P EDI Generator
  const generateEdiClaim = () => {
    const claimDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let edi = `ISA*00*          *00*          *ZZ*SUBMITTER      *ZZ*PAYER          *${claimDate.slice(2)}*1200*^*00501*000000001*0*P*:~\n`;
    edi += `GS*HC*SUBMITTER*PAYER*${claimDate}*1200*1*X*005010X222A1~\n`;
    edi += `ST*837*0001*005010X222A1~\n`;
    edi += `BHT*0019*00*REF${claimDate}*${claimDate}*1200*CH~\n`;
    edi += `NM1*85*2*PEDIATRIC AIRWAY SURGEONS*****XX*1999999993~\n`;
    edi += `NM1*IL*1*MILLER*TIMOTHY****MI*AIR9920145~\n`;
    edi += `CLM*AIRWAY-${claimDate}*${scrubberResult.expectedReimbursement.toFixed(2)}***11:B:1*Y*A*Y*Y~\n`;

    scrubberResult.lines.forEach((l, idx) => {
      const cleanMod = l.mod.replace(/[^0-9A-Z]/g, '');
      const modSegment = cleanMod && cleanMod !== 'None' ? `:${cleanMod}` : '';
      edi += `LX*${idx + 1}~\n`;
      edi += `SV1*HC:${l.code.split(' ')[0]}${modSegment}*${l.fee.toFixed(2)}*UN*1***1~\n`;
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
        simulateDowncode,
        stenosisGrade,
        hasCostalCartilageHarvest,
        separateInframammaryIncision,
        hasPostOpSurveillance,
        stagedModifier58Documented,
        hasSupraglottoplasty,
        hasTracheostomyRevision,
        expectedReimbursement: scrubberResult.expectedReimbursement,
        penaltyAtRisk: scrubberResult.penaltyAtRisk,
        totalRvu: scrubberResult.totalRvu,
        contactName,
        contactEmail,
        practiceName,
        auditNotes,
      };

      await sendLeadToKiran('pediatric_airway_rcm_audit', payload);
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
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-teal-900/40 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
              <Baby className="h-3.5 w-3.5" />
              <span>Tool #65 · Pediatric Aerodigestive &amp; Airway RCM Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-jakarta tracking-tight">
              Pediatric Laryngotracheal Reconstruction Scrubber
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
              Audit pediatric laryngotracheoplasty (CPT 31587, 31590) and cricotracheal resection (31584),
              defend autologous costal cartilage rib harvest (+20902-59) against unbundling denials, prevent
              downcoding to simple tracheoplasty, and protect staged postoperative bronchoscopy (Modifier -58).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowLeadModal(true)}
            className="whitespace-nowrap px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-sm shadow-lg hover:shadow-teal-500/20 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Request Expert Audit
          </button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Work RVUs
            </span>
            <Activity className="h-5 w-5 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-jakarta">
              {scrubberResult.totalRvu}
            </span>
            <span className="text-xs text-slate-500">wRVUs</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {procedureType === 'cricotracheal_resection'
              ? 'High-complexity resection tier'
              : 'Multi-component reconstructive valuation'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Clean Projected Allowance
            </span>
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 font-jakarta">
              ${scrubberResult.expectedReimbursement.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Estimated allowable based on CMS PFS &amp; commercial index</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Revenue at Risk / Penalties
            </span>
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold font-jakarta ${
                scrubberResult.penaltyAtRisk > 0 ? 'text-rose-600' : 'text-slate-400'
              }`}
            >
              ${scrubberResult.penaltyAtRisk.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {scrubberResult.penaltyAtRisk > 0
              ? 'At risk from downcoding or missing modifiers'
              : 'Zero identified denial exposure'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Audit Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 font-jakarta flex items-center gap-2 border-b border-slate-100 pb-3">
              <Scissors className="h-5 w-5 text-teal-600" />
              Surgical Procedure &amp; Staging
            </h2>

            {/* Procedure Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Primary Airway Reconstruction Technique
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setProcedureType('ltr_single_stage')}
                  className={`px-4 py-2.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                    procedureType === 'ltr_single_stage'
                      ? 'border-teal-600 bg-teal-50/50 text-teal-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm">Single-Stage LTR (CPT 31587)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Anterior/posterior split, costal cartilage graft, endotracheal tube stenting
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setProcedureType('ltr_double_stage')}
                  className={`px-4 py-2.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                    procedureType === 'ltr_double_stage'
                      ? 'border-teal-600 bg-teal-50/50 text-teal-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm">Double-Stage LTR (CPT 31590)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Staged airway expansion with Montgomery T-tube and tracheostomy maintenance
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setProcedureType('cricotracheal_resection')}
                  className={`px-4 py-2.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                    procedureType === 'cricotracheal_resection'
                      ? 'border-teal-600 bg-teal-50/50 text-teal-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm">Cricotracheal Resection (CTR 31584)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Complete cricoid stenosis excision with primary thyrotracheal anastomosis
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setProcedureType('endoscopic_balloon_dilation')}
                  className={`px-4 py-2.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                    procedureType === 'endoscopic_balloon_dilation'
                      ? 'border-teal-600 bg-teal-50/50 text-teal-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm">Endoscopic Balloon Dilation (CPT 31630)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Serial radial expansion for early or revision subglottic stenosis
                  </div>
                </button>
              </div>
            </div>

            {/* Downcode Simulation for CTR */}
            {procedureType === 'cricotracheal_resection' && (
              <div className="pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateDowncode}
                    onChange={(e) => setSimulateDowncode(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                  />
                  <span>Simulate Payer Downcoding: Downcode CTR (31584) to Tracheoplasty (31750)</span>
                </label>
              </div>
            )}

            {/* Cotton-Myer Stenosis Grade */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Cotton-Myer Stenosis Severity
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStenosisGrade('grade_2')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    stenosisGrade === 'grade_2'
                      ? 'border-teal-600 bg-teal-50 text-teal-900'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Grade II (51-70%)
                </button>
                <button
                  type="button"
                  onClick={() => setStenosisGrade('grade_3')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    stenosisGrade === 'grade_3'
                      ? 'border-teal-600 bg-teal-50 text-teal-900'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Grade III (71-99%)
                </button>
                <button
                  type="button"
                  onClick={() => setStenosisGrade('grade_4')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    stenosisGrade === 'grade_4'
                      ? 'border-teal-600 bg-teal-50 text-teal-900'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Grade IV (No Lumen)
                </button>
              </div>
            </div>

            {/* Costal Cartilage Rib Harvest (20902) */}
            {procedureType !== 'endoscopic_balloon_dilation' && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Autologous Costal Cartilage Harvest (20902)</span>
                  <input
                    type="checkbox"
                    checked={hasCostalCartilageHarvest}
                    onChange={(e) => setHasCostalCartilageHarvest(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                </h3>
                {hasCostalCartilageHarvest && (
                  <div className="pl-3 border-l-2 border-teal-200 space-y-2">
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={separateInframammaryIncision}
                        onChange={(e) => setSeparateInframammaryIncision(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                      />
                      <span>Separate inframammary incision documented with Modifier 59 / XS</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Staged Post-Op Bronchoscopy (31622 with Mod 58) */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Staged Surveillance Bronchoscopy &amp; Stent Removal</span>
                <input
                  type="checkbox"
                  checked={hasPostOpSurveillance}
                  onChange={(e) => setHasPostOpSurveillance(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
              </h3>
              {hasPostOpSurveillance && (
                <div className="pl-3 border-l-2 border-teal-200 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stagedModifier58Documented}
                      onChange={(e) => setStagedModifier58Documented(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                    />
                    <span>Append Modifier -58 (Staged procedure during post-op period)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Concomitant Procedures */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Concomitant Airway Reconstructions
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSupraglottoplasty}
                    onChange={(e) => setHasSupraglottoplasty(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                  />
                  <span>Supraglottoplasty / aryepiglottic fold division (CPT 31541-51)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasTracheostomyRevision}
                    onChange={(e) => setHasTracheostomyRevision(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                  />
                  <span>Closure of tracheocutaneous fistula / stoma revision (CPT 31610-51)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Scrubber Audit Findings & ANSI 837P Claim */}
        <div className="lg:col-span-7 space-y-6">
          {/* Audit Alerts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-jakarta flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Automated Coding &amp; Statutory Compliance Audits
            </h2>

            <div className="space-y-3">
              {scrubberResult.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    alert.type === 'fatal'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : alert.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {alert.type === 'fatal' ? (
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : alert.type === 'warning' ? (
                      <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-sm">{alert.title}</div>
                      <div className="mt-1">{alert.desc}</div>
                      <div className="mt-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        Authority: {alert.statute}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Claim Lines Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 font-jakarta flex items-center gap-2">
                <Layers className="h-4 w-4 text-teal-600" />
                CMS-1500 / 837P Professional Claim Itemization
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {scrubberResult.lines.length} Line Items
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">CPT / HCPCS</th>
                    <th className="py-3 px-4">Mod</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">wRVU</th>
                    <th className="py-3 px-4 text-right">Est. Allowable</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scrubberResult.lines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-950">
                        {line.code}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                        {line.mod}
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-700">
                        <div>{line.desc}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{line.note}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800">
                        {line.rvu.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${line.fee.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            line.status === 'clean'
                              ? 'bg-emerald-100 text-emerald-800'
                              : line.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {line.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ANSI 837P EDI Claim Viewer */}
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 shadow-inner border border-slate-800">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Simulated ANSI ASC X12 837P EDI Transmission
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyEdi}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy EDI'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed max-h-48">
              {generateEdiClaim()}
            </pre>
          </div>
        </div>
      </div>

      {/* Practice Audit Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-jakarta">
                  Request Pediatric Airway RCM Audit
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct review by certified pediatric surgical otolaryngology coders (zero PHI retained).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLeadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {leadSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Audit Request Dispatched</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Kiran and the senior surgical billing team have received your pediatric airway audit profile.
                  Expect an audit summary within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Dr. Samantha Cruz, MD / Pediatric ENT Director"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="samantha.cruz@childrenshospital.org"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Children's Hospital / Specialty Center Name
                  </label>
                  <input
                    type="text"
                    required
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="Children's Hospital Pediatric Airway Center"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Current Billing Bottlenecks &amp; Notes
                  </label>
                  <textarea
                    rows={3}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="Commercial payers rejecting rib graft harvest 20902, CTR downcoding to simple tracheoplasty..."
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLeadModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Routing...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Submit Audit Request
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
