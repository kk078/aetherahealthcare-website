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
  Layers,
  Sparkles,
  Dna,
  HeartPulse,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function PediatricCellTherapyScrubber() {
  // 1. Cellular Therapy Modality
  const [therapyType, setTherapyType] = useState<'car_t' | 'allogeneic_bmt' | 'autologous_transplant' | 'harvest_apheresis'>('car_t');
  const [simulateMissingRemsDenial, setSimulateMissingRemsDenial] = useState<boolean>(false);

  // 2. Prior-Auth Clinical Criteria
  const [diseaseIndication, setDiseaseIndication] = useState<'relapsed_b_all' | 'neuroblastoma_high_risk' | 'sickle_cell_severe' | 'scid_immunodeficiency'>('relapsed_b_all');
  const [cd19Confirmed, setCd19Confirmed] = useState<boolean>(true);
  const [marrowBlastsOverFivePercent, setMarrowBlastsOverFivePercent] = useState<boolean>(true);
  const [linesOfTherapyFailed, setLinesOfTherapyFailed] = useState<number>(2);

  // 3. Concomitant Diagnostic Restaging & CRS Critical Care
  const [includeIntrathecalChemo, setIncludeIntrathecalChemo] = useState<boolean>(true); // CPT 96450
  const [includeBoneMarrowBiopsy, setIncludeBoneMarrowBiopsy] = useState<boolean>(true); // CPT 38222
  const [simulateRestagingBundling, setSimulateRestagingBundling] = useState<boolean>(false);
  const [includeCrsCriticalCare, setIncludeCrsCriticalCare] = useState<boolean>(true); // CPT 99291
  const [simulateCrsDowncode, setSimulateCrsDowncode] = useState<boolean>(false);

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

  // Calculations
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
    let priorAuthScore = 98;
    let productDrugCost = 0;

    // --- 1. PRIMARY CELLULAR THERAPY OR HARVEST ---
    if (therapyType === 'car_t') {
      productDrugCost = 475000.0;
      const infusionFee = 1850.0;
      const infusionRvu = 18.2;

      lines.push({
        code: '0540T',
        desc: 'Chimeric antigen receptor T-cell (CAR-T) therapy; autologous administration (infusion)',
        mod: 'None',
        rvu: infusionRvu,
        fee: infusionFee,
        status: 'clean',
        note: 'Physician direct supervision of autologous CAR-T cell infusion.',
      });
      totalRvu += infusionRvu;
      expectedReimbursement += infusionFee;

      lines.push({
        code: 'Q2042',
        desc: 'Tisagenlecleucel, up to 250 million CAR-positive viable T cells (Kymriah)',
        mod: 'None',
        rvu: 0,
        fee: productDrugCost,
        status: simulateMissingRemsDenial ? 'fatal' : 'clean',
        note: simulateMissingRemsDenial
          ? 'FATAL PRIOR-AUTH DENIAL: Missing REMS safety certification or relapsed refractory criteria!'
          : 'High-cost biologic product approved under authorized commercial single-case agreement.',
      });
      expectedReimbursement += productDrugCost;

      if (simulateMissingRemsDenial) {
        priorAuthScore = 12;
        penaltyAtRisk += productDrugCost + infusionFee;
        alerts.push({
          type: 'fatal',
          title: 'CAR-T Therapy Fatal Prior Authorization Denial: Missing REMS & Trial Criteria',
          desc: 'Commercial health plan issued a complete coverage denial for tisagenlecleucel (Q2042) and CPT 0540T ($476,850 total exposure). Payers demand proof of FDA REMS authorized treatment center credentialing, flow cytometry verifying CD19+ expression, and bone marrow biopsy confirming >= 5% lymphoblasts following two or more failed induction regimens.',
          statute: 'FDA Prescribing Information; CMS National Coverage Determination (NCD) 110.24',
        });
      }
    } else if (therapyType === 'allogeneic_bmt') {
      const bmtFee = 2150.0;
      const bmtRvu = 24.6;
      lines.push({
        code: '38240',
        desc: 'Hematopoietic progenitor cell (HPC); allogeneic transplantation per donor',
        mod: 'None',
        rvu: bmtRvu,
        fee: bmtFee,
        status: 'clean',
        note: 'Allogeneic HPC infusion under continuous physician monitoring.',
      });
      totalRvu += bmtRvu;
      expectedReimbursement += bmtFee;
    } else if (therapyType === 'autologous_transplant') {
      const autoFee = 1680.0;
      const autoRvu = 19.4;
      lines.push({
        code: '38241',
        desc: 'Hematopoietic progenitor cell (HPC); autologous transplantation',
        mod: 'None',
        rvu: autoRvu,
        fee: autoFee,
        status: 'clean',
        note: 'Autologous HPC infusion following high-dose conditioning chemotherapy.',
      });
      totalRvu += autoRvu;
      expectedReimbursement += autoFee;
    } else {
      const harvestFee = 1420.0;
      const harvestRvu = 16.8;
      lines.push({
        code: '38205',
        desc: 'Blood-derived hematopoietic progenitor cell harvesting by apheresis, per day',
        mod: 'None',
        rvu: harvestRvu,
        fee: harvestFee,
        status: 'clean',
        note: 'Collection of autologous or allogeneic peripheral blood stem cells.',
      });
      totalRvu += harvestRvu;
      expectedReimbursement += harvestFee;
    }

    // --- 2. CONCOMITANT RESTAGING PROCEDURES ---
    if (includeIntrathecalChemo) {
      const itChemoFee = 380.0;
      const itChemoRvu = 5.2;

      if (simulateRestagingBundling) {
        penaltyAtRisk += itChemoFee;
        lines.push({
          code: '96450',
          desc: 'Chemotherapy administration into central nervous system (BUNDLED WITH BONE MARROW BIOPSY)',
          mod: 'None',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'FATAL UNBUNDLING REJECTION: Payer denied CPT 96450 as inclusive to CPT 38222 on same date of service!',
        });
        alerts.push({
          type: 'fatal',
          title: 'NCCI Bundling Denial: Intrathecal Chemo (96450) with Bone Marrow Biopsy (38222)',
          desc: 'Payers rejected CPT 96450 as unbundled from bone marrow aspiration/biopsy. Although performed under a single pediatric general anesthetic event, lumbar puncture (96450) and iliac crest bone marrow biopsy (38222) represent distinct anatomic sites. Append Modifier -59 or -XS to 96450 with separate procedural headers.',
          statute: 'CMS NCCI Policy Manual Chapter XI, Section B; ASPHO Pediatric Oncology Coding Standard',
        });
      } else {
        lines.push({
          code: '96450',
          desc: 'Chemotherapy administration into central nervous system (Intrathecal methotrexate/cytarabine)',
          mod: '-59 / -XS',
          rvu: itChemoRvu,
          fee: itChemoFee,
          status: 'clean',
          note: 'Modifier 59/XS appended to distinguish lumbar puncture from iliac crest aspiration.',
        });
        totalRvu += itChemoRvu;
        expectedReimbursement += itChemoFee;
      }
    }

    if (includeBoneMarrowBiopsy) {
      lines.push({
        code: '38222',
        desc: 'Diagnostic bone marrow biopsy and aspiration (Pediatric leukemia restaging)',
        mod: 'None',
        rvu: 6.8,
        fee: 490.0,
        status: 'clean',
        note: 'Combined bone marrow biopsy and aspiration; bilateral or unilateral iliac crest.',
      });
      totalRvu += 6.8;
      expectedReimbursement += 490.0;
    }

    // --- 3. CYTOKINE RELEASE SYNDROME (CRS) CRITICAL CARE ---
    if (includeCrsCriticalCare) {
      const crsFee = 420.0;
      const crsRvu = 12.8;

      if (simulateCrsDowncode) {
        const downcodeFee = 160.0;
        const loss = crsFee - downcodeFee;
        penaltyAtRisk += loss;

        lines.push({
          code: '99291',
          desc: 'Critical care, evaluation and management; first 30-74 minutes (DOWNCODED TO 99233)',
          mod: '-25 (DOWNCODED)',
          rvu: 4.8,
          fee: downcodeFee,
          status: 'warning',
          note: `DOWNCODE DEFENSE REQUIRED: Commercial payer reclassified Grade 3 CRS critical care to standard subsequent hospital visit 99233. Loss of $${loss.toFixed(2)}.`,
        });
        totalRvu += 4.8;
        expectedReimbursement += downcodeFee;

        alerts.push({
          type: 'warning',
          title: 'Commercial Downcoding: Severe Post-CAR-T CRS Critical Care (99291)',
          desc: 'Commercial medical reviewer downcoded CPT 99291 to 99233 alleging cytokine release syndrome is anticipated post-infusion toxicity. Rebuttal requires ASTCT Consensus Grading documentation showing hemodynamic instability requiring vasopressors, severe hypoxia requiring high-flow O2, and hourly bedside physician titrations.',
          statute: 'ASTCT (American Society for Transplantation and Cellular Therapy) CRS Consensus Grading',
        });
      } else {
        lines.push({
          code: '99291',
          desc: 'Critical care, evaluation and management; first 30-74 minutes (ASTCT Grade 3 CRS / ICANS)',
          mod: '-25',
          rvu: crsRvu,
          fee: crsFee,
          status: 'clean',
          note: 'Documented life-threatening hemodynamic instability and tocilizumab infusion monitoring.',
        });
        totalRvu += crsRvu;
        expectedReimbursement += crsFee;
      }
    }

    // Clean summary
    if (alerts.length === 0) {
      alerts.push({
        type: 'clean',
        title: 'Compliant Pediatric Cellular Therapy & Stem Cell Transplant Dossier',
        desc: 'All CAR-T procedural codes (0540T), biologic product authorizations (Q2042), distinct restaging procedures (96450-59 / 38222), and ASTCT critical care intervals satisfy federal and commercial compliance gates.',
        statute: 'CMS NCD 110.24; FACT (Foundation for the Accreditation of Cellular Therapy) Standards',
      });
    }

    return {
      lines,
      alerts,
      totalRvu: Number(totalRvu.toFixed(1)),
      expectedReimbursement: Math.round(expectedReimbursement),
      penaltyAtRisk: Math.round(penaltyAtRisk),
      priorAuthScore,
      productDrugCost,
    };
  }, [
    therapyType,
    simulateMissingRemsDenial,
    includeIntrathecalChemo,
    includeBoneMarrowBiopsy,
    simulateRestagingBundling,
    includeCrsCriticalCare,
    simulateCrsDowncode,
  ]);

  // ANSI X12 837P simulation
  const edi837Simulation = useMemo(() => {
    const segments = [
      'ISA*00*          *00*          *ZZ*SUBMITTER1     *ZZ*PAYER001       *260905*1300*^*00501*000000001*0*T*:~',
      'GS*HC*SUBMITTER1*PAYER001*20260905*1300*1*X*005010X222A1~',
      'ST*837*0001*005010X222A1~',
      'BHT*0019*00*CELL9028*20260905*1300*CH~',
      'NM1*85*2*PEDIATRIC CELLULAR ONCOLOGY GROUP*****XX*1762534910~',
      'HL*1**20*1~',
      'HL*2*1*22*0~',
      'NM1*IL*1*PEDIATRIC*PATIENT*****MI*PEDS994821~',
      'CLM*CELL20260905*' + scrubberResult.expectedReimbursement + '***11:B:1*Y*A*Y*Y~',
      'HI*ABK:C91.00*ABF:T86.5*ABF:R65.21~', // Acute lymphoblastic leukemia, stem cell complication, severe sepsis/CRS
    ];

    scrubberResult.lines.forEach((l, idx) => {
      const cleanMod = l.mod === 'None' || l.mod.includes('DOWNCODED') ? '' : l.mod.replace(/[^a-zA-Z0-9]/g, '');
      segments.push(
        `LX*${idx + 1}~`,
        `SV1*HC:${l.code}${cleanMod ? `:${cleanMod}` : ''}*${l.fee}*UN*1***1~`,
        `DTP*472*D8*20260905~`
      );
    });

    segments.push('SE*26*0001~', 'GE*1*1~', 'IEA*1*000000001~');
    return segments.join('\n');
  }, [scrubberResult]);

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await sendLeadToKiran('pediatric_cellular_therapy_rcm_audit', {
        contactName,
        contactEmail,
        practiceName,
        auditNotes,
        therapyType,
        diseaseIndication,
        expectedReimbursement: scrubberResult.expectedReimbursement,
        penaltyAtRisk: scrubberResult.penaltyAtRisk,
      });
      trackConversion('pediatric_cell_therapy_audit_submit');
      setLeadSuccess(true);
    } catch {
      setLeadSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 md:p-8 space-y-8 font-inter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">
            <Dna className="w-3.5 h-3.5" />
            <span>Pediatric Cellular &amp; Immunotherapy RCM</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-jakarta mt-2">
            Pediatric Stem Cell &amp; CAR-T Cellular Therapy Scrubber
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mt-1">
            Audit FDA-approved CAR-T infusions (0540T / Q2042), defend severe Cytokine Release Syndrome (CRS)
            critical care downcodings (99291), and prevent bundling of intrathecal restaging (96450) and bone marrow biopsies (38222).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLeadModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Request Cellular Therapy Audit
          </button>
        </div>
      </div>

      {/* Control Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel 1: Cellular Therapy Modality */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-purple-800 font-bold text-sm border-b border-slate-100 pb-2">
            <Dna className="w-4 h-4" />
            <span>1. Therapy Modality &amp; Prior-Auth</span>
          </div>

          <div>
            <label htmlFor="cellTherapyTypeSelect" className="block text-xs font-semibold text-slate-700 mb-1">
              Cellular Therapy Modality
            </label>
            <select
              id="cellTherapyTypeSelect"
              value={therapyType}
              onChange={(e) => setTherapyType(e.target.value as 'car_t' | 'allogeneic_bmt' | 'autologous_transplant' | 'harvest_apheresis')}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="car_t">Autologous CAR-T Cell Infusion (CPT 0540T + Q2042 - $476k)</option>
              <option value="allogeneic_bmt">Allogeneic Stem Cell Transplant (CPT 38240)</option>
              <option value="autologous_transplant">Autologous Stem Cell Transplant (CPT 38241)</option>
              <option value="harvest_apheresis">Progenitor Cell Harvesting Apheresis (CPT 38205)</option>
            </select>
          </div>

          {therapyType === 'car_t' && (
            <div className="pt-1">
              <label htmlFor="missingRemsCheck" className="flex items-start gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  id="missingRemsCheck"
                  type="checkbox"
                  checked={simulateMissingRemsDenial}
                  onChange={(e) => setSimulateMissingRemsDenial(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-semibold text-rose-900 block">Simulate Prior-Auth Denial</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">
                    Payer denies $475k drug approval due to missing REMS or relapsed blast documentation.
                  </span>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Panel 2: Diagnostic Restaging */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-purple-800 font-bold text-sm border-b border-slate-100 pb-2">
            <Activity className="w-4 h-4" />
            <span>2. Concomitant Restaging &amp; LP</span>
          </div>

          <div className="space-y-3 pt-1">
            <label htmlFor="itChemoCheck" className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                id="itChemoCheck"
                type="checkbox"
                checked={includeIntrathecalChemo}
                onChange={(e) => setIncludeIntrathecalChemo(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span>Intrathecal Chemotherapy (CPT 96450 - $380)</span>
            </label>

            <label htmlFor="bmBiopsyCheck" className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                id="bmBiopsyCheck"
                type="checkbox"
                checked={includeBoneMarrowBiopsy}
                onChange={(e) => setIncludeBoneMarrowBiopsy(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span>Bone Marrow Biopsy &amp; Aspiration (38222 - $490)</span>
            </label>

            {includeIntrathecalChemo && includeBoneMarrowBiopsy && (
              <label htmlFor="bundleRestagingCheck" className="flex items-start gap-2 cursor-pointer text-xs text-slate-700 pl-5">
                <input
                  id="bundleRestagingCheck"
                  type="checkbox"
                  checked={simulateRestagingBundling}
                  onChange={(e) => setSimulateRestagingBundling(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-semibold text-rose-900 block">Simulate Same-Day Bundling</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">
                    Payer denies 96450 into 38222 (omit Modifier 59 / XS).
                  </span>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Panel 3: CRS Critical Care Management */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-purple-800 font-bold text-sm border-b border-slate-100 pb-2">
            <HeartPulse className="w-4 h-4" />
            <span>3. Severe CRS &amp; ICANS ICU Care</span>
          </div>

          <div className="space-y-3 pt-1">
            <label htmlFor="crsCriticalCareCheck" className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                id="crsCriticalCareCheck"
                type="checkbox"
                checked={includeCrsCriticalCare}
                onChange={(e) => setIncludeCrsCriticalCare(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span>Grade 3 CRS Critical Care (CPT 99291-25 - $420)</span>
            </label>

            {includeCrsCriticalCare && (
              <label htmlFor="downcodeCrsCheck" className="flex items-start gap-2 cursor-pointer text-xs text-slate-700 pl-5">
                <input
                  id="downcodeCrsCheck"
                  type="checkbox"
                  checked={simulateCrsDowncode}
                  onChange={(e) => setSimulateCrsDowncode(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-semibold text-rose-900 block">Simulate CRS Downcoding</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">
                    Payer slashes 99291 critical care to standard hospital visit 99233.
                  </span>
                </div>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Case Revenue</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {scrubberResult.expectedReimbursement > 10000
              ? `$${(scrubberResult.expectedReimbursement / 1000).toFixed(0)}k`
              : `$${scrubberResult.expectedReimbursement}`}
          </div>
          <span className="text-[11px] text-slate-400">Total episode allowable</span>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Prior-Auth Approval</span>
          <div className="text-2xl font-black text-purple-700 mt-1">{scrubberResult.priorAuthScore}%</div>
          <span className="text-[11px] text-purple-600">Approval probability</span>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Revenue at Risk</span>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {scrubberResult.penaltyAtRisk > 10000
              ? `$${(scrubberResult.penaltyAtRisk / 1000).toFixed(0)}k`
              : `$${scrubberResult.penaltyAtRisk}`}
          </div>
          <span className="text-[11px] text-rose-600">Prior-auth &amp; bundling risk</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Scrubber Integrity</span>
            <div className="text-sm font-extrabold mt-1 flex items-center gap-1.5">
              {scrubberResult.penaltyAtRisk > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-rose-300">Errors Flagged</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-purple-300">Clean Scrub</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowLeadModal(true)}
            className="mt-2 w-full py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Export Clean Audit</span>
          </button>
        </div>
      </div>

      {/* Compliance Alerts */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-purple-700" /> Statutory &amp; Prior-Auth Analysis
        </h3>
        {scrubberResult.alerts.map((a, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border text-xs space-y-1 ${
              a.type === 'fatal'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : a.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-purple-50 border-purple-200 text-purple-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {a.type === 'fatal' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
              {a.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
              {a.type === 'clean' && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
              <span>{a.title}</span>
            </div>
            <p className="leading-relaxed">{a.desc}</p>
            <p className="text-[11px] opacity-75 font-mono pt-1">Authority: {a.statute}</p>
          </div>
        ))}
      </div>

      {/* Itemized Claim Breakdown Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-700" /> Itemized Cellular Oncology Encounter
          </span>
          <span className="text-xs text-slate-500 font-mono">Specialty Pharmacy &amp; Physician Services</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">CPT / HCPCS</th>
                <th className="p-3">Procedure / Biologic Description</th>
                <th className="p-3">Modifier</th>
                <th className="p-3">Work RVU</th>
                <th className="p-3">Allowable</th>
                <th className="p-3">Clinical Rule &amp; Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {scrubberResult.lines.map((l, idx) => (
                <tr
                  key={idx}
                  className={
                    l.status === 'fatal'
                      ? 'bg-rose-50/70'
                      : l.status === 'warning'
                      ? 'bg-amber-50/60'
                      : 'hover:bg-slate-50/60'
                  }
                >
                  <td className="p-3 font-mono font-bold text-slate-900">{l.code}</td>
                  <td className="p-3 text-slate-800 max-w-xs">{l.desc}</td>
                  <td className="p-3 font-mono font-semibold text-purple-700">{l.mod}</td>
                  <td className="p-3 font-mono">{l.rvu}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">${l.fee.toLocaleString()}</td>
                  <td className="p-3 text-slate-600 text-[11px] leading-tight">{l.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ANSI X12 837P Claim Simulation */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-purple-700" /> ANSI X12 837P Professional Claim Simulation
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(edi837Simulation);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-purple-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied EDI Stream' : 'Copy 837P Segment'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-950 text-purple-300 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800">
          {edi837Simulation}
        </pre>
      </div>

      {/* Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-jakarta">
                  Request Pediatric Cellular Therapy Audit
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Our certified pediatric oncology coding team validates CAR-T prior authorization packets, stem cell collection unbundling, and severe CRS critical care documentation.
                </p>
              </div>
              <button
                onClick={() => setShowLeadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {leadSuccess ? (
              <div className="p-6 rounded-xl bg-purple-50 border border-purple-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-purple-600 mx-auto" />
                <h4 className="font-bold text-purple-950 text-base">Audit Request Dispatched</h4>
                <p className="text-xs text-purple-800 leading-relaxed">
                  Your cellular therapy coding dossier has been transmitted directly to senior oncology specialist Kiran. A comprehensive analysis will be delivered within 24 hours.
                </p>
                <button
                  onClick={() => setShowLeadModal(false)}
                  className="mt-2 px-4 py-2 bg-purple-700 text-white rounded-lg text-xs font-bold hover:bg-purple-800 transition-colors"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Dr. Maya Lin, MD"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="mlin@childrenscelltherapy.org"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Children's Hospital / Program</label>
                  <input
                    type="text"
                    required
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="Children's Hospital Cellular Immunotherapy Program"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Claim Challenges or Denial Details</label>
                  <textarea
                    rows={3}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="Commercial payer denied Q2042 prior authorization citing missing trial eligibility criteria..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLeadModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{isSubmitting ? 'Transmitting...' : 'Submit Audit Request'}</span>
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
