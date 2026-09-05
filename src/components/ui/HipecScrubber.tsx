'use client';

import React, { useState, useMemo } from 'react';
import {
  Droplets,
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

export default function HipecScrubber() {
  // 1. Primary Cytoreductive Surgery (CRS) & Peritonectomy
  const [cytoreductionScope, setCytoreductionScope] = useState<
    'extensive_49205' | 'intermediate_49204' | 'pelvic_exenteration_45126' | 'omentectomy_49255'
  >('extensive_49205');

  // 2. Hyperthermic Intraperitoneal Chemoperfusion (HIPEC 96560)
  const [hasHipecPerfusion, setHasHipecPerfusion] = useState<boolean>(true);
  const [hasPerfusionTelemetryDoc, setHasPerfusionTelemetryDoc] = useState<boolean>(true);

  // 3. Concomitant Bowel Resection (Colectomy / LAR 44140)
  const [hasBowelResection, setHasBowelResection] = useState<boolean>(true);
  const [hasModifier51Bowel, setHasModifier51Bowel] = useState<boolean>(true);

  // 4. Concomitant Visceral Resection (Splenectomy 38100)
  const [hasSplenectomy, setHasSplenectomy] = useState<boolean>(true);
  const [hasDistinctOrganDoc, setHasDistinctOrganDoc] = useState<boolean>(true);

  // 5. Dual-Specialty Co-Surgeon Modifier -62 (Surgical Oncology + GYN Oncology)
  const [coSurgeonMode, setCoSurgeonMode] = useState<
    'matching_mod62' | 'solo_surgeon' | 'mismatched_codes'
  >('matching_mod62');

  // 6. Post-HIPEC Surgical Critical Care (99291 with Modifier 24)
  const [hasPostOpCriticalCare, setHasPostOpCriticalCare] = useState<boolean>(true);
  const [hasModifier24CriticalCare, setHasModifier24CriticalCare] = useState<boolean>(true);

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

    // --- 1. PRIMARY CYTOREDUCTIVE SURGERY (CRS) ---
    if (cytoreductionScope === 'extensive_49205') {
      const baseRvu = 28.5 * coSurgeonRate;
      const baseFee = 2650.0 * coSurgeonRate;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      const mod = isCoSurgeon ? '62' : 'None';
      lines.push({
        code: '49205',
        desc: 'Excision or destruction of peritoneal implants; largest tumor diameter >10 cm (multivisceral peritonectomy)',
        mod,
        rvu: baseRvu,
        fee: baseFee,
        status: isMismatched ? 'fatal' : 'clean',
        note: `Multivisceral peritoneal stripping (diaphragm, pelvic peritoneum, mesentery) for peritoneal carcinomatosis. ${isCoSurgeon ? 'Modifier 62 split (62.5%).' : ''}`,
      });

      alerts.push({
        type: 'clean',
        title: 'Extensive Cytoreductive Peritonectomy (49205) Defended',
        desc: 'Documentation confirms debulking of confluent peritoneal nodules >10.0 cm across multiple abdominal regions. Defends against downcoding to simple omentectomy.',
        statute: 'SSO Surgical Oncology Standards; AMA CPT Guidelines',
      });
    } else if (cytoreductionScope === 'intermediate_49204') {
      const baseRvu = 23.2 * coSurgeonRate;
      const baseFee = 2150.0 * coSurgeonRate;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      const mod = isCoSurgeon ? '62' : 'None';
      lines.push({
        code: '49204',
        desc: 'Excision or destruction of peritoneal implants; largest tumor diameter 5.1 to 10.0 cm',
        mod,
        rvu: baseRvu,
        fee: baseFee,
        status: isMismatched ? 'fatal' : 'clean',
        note: `Intermediate cytoreduction with localized peritonectomy. ${isCoSurgeon ? 'Modifier 62 split (62.5%).' : ''}`,
      });
    } else if (cytoreductionScope === 'pelvic_exenteration_45126') {
      const baseRvu = 51.4 * coSurgeonRate;
      const baseFee = 4780.0 * coSurgeonRate;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      const mod = isCoSurgeon ? '62' : 'None';
      lines.push({
        code: '45126',
        desc: 'Pelvic exenteration for colorectal or gynecologic malignancy, with proctectomy and cystectomy/hysterectomy',
        mod,
        rvu: baseRvu,
        fee: baseFee,
        status: isMismatched ? 'fatal' : 'clean',
        note: 'Complete en bloc radical pelvic exenteration in conjunction with hyperthermic chemotherapy.',
      });
    } else {
      const baseRvu = 12.5 * coSurgeonRate;
      const baseFee = 1180.0 * coSurgeonRate;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: '49255',
        desc: 'Omentectomy, epiploectomy, resection of omentum (separate procedure)',
        mod: isCoSurgeon ? '62' : 'None',
        rvu: baseRvu,
        fee: baseFee,
        status: 'clean',
        note: 'Total infragastric or infracolic omentectomy as part of staged cytoreduction.',
      });
    }

    if (isMismatched) {
      penaltyAtRisk += expectedReimbursement;
      alerts.push({
        type: 'fatal',
        title: 'Co-Surgeon Modifier -62 Code Mismatch Fatal Denial',
        desc: 'Both attending surgeons (surgical oncologist and gynecologic oncologist) must bill identical primary CPT codes with Modifier -62. Mismatched coding results in 100% claim rejection.',
        statute: 'CMS Claims Processing Manual Ch. 12 Section 40.8',
      });
    }

    // --- 2. HIPEC PERFUSION ADMINISTRATION (96560) ---
    if (hasHipecPerfusion) {
      const hipecRvu = 3.2;
      const hipecFee = 480.0;

      if (hasPerfusionTelemetryDoc) {
        totalRvu += hipecRvu;
        expectedReimbursement += hipecFee;

        lines.push({
          code: '96560',
          desc: 'Intraperitoneal chemotherapy administration, including monitoring (90-minute hyperthermic peritoneal chemoperfusion)',
          mod: '59',
          rvu: hipecRvu,
          fee: hipecFee,
          status: 'clean',
          note: 'Clean HIPEC perfusion: Documented closed-circuit inflow/outflow catheter placement, target 41-43°C bath, mitomycin-C/cisplatin dosing, and 90-min dwell.',
        });

        alerts.push({
          type: 'clean',
          title: 'HIPEC Chemoperfusion (+96560-59) Validated',
          desc: 'Perfusion administration is defended with explicit telemetry: target temperatures, chemotherapeutic agent delivery, pump circulation rates, and physiologic monitoring.',
          statute: 'SSO/PSOGI Standards on Intraperitoneal Chemoperfusion; CPT Assistant',
        });
      } else {
        penaltyAtRisk += hipecFee;

        lines.push({
          code: '96560',
          desc: 'Intraperitoneal chemotherapy administration',
          mod: 'None',
          rvu: hipecRvu,
          fee: hipecFee,
          status: 'fatal',
          note: 'EXPERIMENTAL / BUNDLING DENIAL: Lacks Modifier -59 or explicit 90-minute closed-circuit perfusion telemetry; payer bundled into laparotomy.',
        });

        alerts.push({
          type: 'fatal',
          title: 'HIPEC Perfusion Experimental Bundling Denial Risk',
          desc: 'Commercial payers reject 96560 as inclusive of exploratory laparotomy unless Modifier -59 is appended with detailed perfusion parameters.',
          statute: 'CMS NCCI Policy Manual Ch. XI Section G; CARC 96 Denial',
        });
      }
    }

    // --- 3. CONCOMITANT BOWEL RESECTION (44140) ---
    if (hasBowelResection) {
      const bowelRvu = 24.8 * 0.5; // 50% multiple procedure reduction
      const bowelFee = 2300.0 * 0.5;

      if (hasModifier51Bowel) {
        totalRvu += bowelRvu;
        expectedReimbursement += bowelFee;

        lines.push({
          code: '44140',
          desc: 'Colectomy, partial; with anastomosis (segmental bowel resection for tumor invasion)',
          mod: '51',
          rvu: bowelRvu,
          fee: bowelFee,
          status: 'clean',
          note: 'Clean secondary visceral resection: Segmental colectomy for transmural tumor invasion with primary stapled anastomosis; Modifier -51 appended.',
        });

        alerts.push({
          type: 'clean',
          title: 'Concomitant Colectomy (44140-51) Defended',
          desc: 'Segmental bowel resection for oncologic tumor clearance is distinct from peritoneal implant stripping and payable with Modifier -51 under NCCI.',
          statute: 'CMS NCCI Edits Policy Manual Ch. VI Section B; CPT Assistant',
        });
      } else {
        totalRvu += bowelRvu;
        penaltyAtRisk += bowelFee;

        lines.push({
          code: '44140',
          desc: 'Colectomy, partial; with anastomosis',
          mod: 'None',
          rvu: bowelRvu,
          fee: bowelFee,
          status: 'warning',
          note: 'UNBUNDLING RISK: Missing Modifier -51; commercial payers will bundle bowel resection into cytoreduction (49205).',
        });

        alerts.push({
          type: 'warning',
          title: 'Bowel Resection Bundling Alert',
          desc: 'Payers bundle 44140 into cytoreduction unless Modifier -51 is appended and separate mesenteric dissection is documented.',
          statute: 'CMS Multiple Procedure Payment Reduction (MPPR) Rules',
        });
      }
    }

    // --- 4. CONCOMITANT SPLENECTOMY (38100) ---
    if (hasSplenectomy) {
      const spleenRvu = 18.5 * 0.5; // 50% multiple procedure reduction
      const spleenFee = 1720.0 * 0.5;

      if (hasDistinctOrganDoc) {
        totalRvu += spleenRvu;
        expectedReimbursement += spleenFee;

        lines.push({
          code: '38100',
          desc: 'Splenectomy; total (en bloc splenic resection for splenic flexure/hilar peritoneal disease)',
          mod: '51',
          rvu: spleenRvu,
          fee: spleenFee,
          status: 'clean',
          note: 'Clean visceral resection: En bloc splenectomy with ligation of splenic artery and vein at pancreatic tail.',
        });
      } else {
        penaltyAtRisk += spleenFee;

        lines.push({
          code: '38100',
          desc: 'Splenectomy; total',
          mod: 'None',
          rvu: spleenRvu,
          fee: spleenFee,
          status: 'warning',
          note: 'INCIDENTAL SPLENECTOMY RISK: Note fails to document tumor involvement of spleen; payer will deny as incidental iatrogenic trauma.',
        });

        alerts.push({
          type: 'warning',
          title: 'Incidental Splenectomy Clawback Risk',
          desc: 'Payers reject 38100 during cytoreduction as incidental capsular tear repair unless pathology and operative notes confirm malignant infiltration.',
          statute: 'CMS NCCI Policy Manual Ch. V Section B',
        });
      }
    }

    // --- 5. POST-HIPEC CRITICAL CARE (99291 WITH MODIFIER 24) ---
    if (hasPostOpCriticalCare) {
      const ccRvu = 4.5;
      const ccFee = 420.0;

      if (hasModifier24CriticalCare) {
        totalRvu += ccRvu;
        expectedReimbursement += ccFee;

        lines.push({
          code: '99291',
          desc: 'Critical care, evaluation and management of the critically ill patient; first 30-74 minutes (post-HIPEC ICU resuscitation)',
          mod: '24',
          rvu: ccRvu,
          fee: ccFee,
          status: 'clean',
          note: 'Clean critical care: Day 1 ICU management of massive third-spacing, coagulopathy, and vasopressor titration; Modifier -24 appended.',
        });

        alerts.push({
          type: 'clean',
          title: 'Post-Op ICU Critical Care (+99291-24) Validated',
          desc: 'Modifier -24 allows reporting of intensive physiological resuscitation during the 90-day surgical global period when acute organ failure is documented.',
          statute: 'CMS Claims Processing Manual Ch. 12 Section 30.6.12; Critical Care Guidelines',
        });
      } else {
        penaltyAtRisk += ccFee;

        lines.push({
          code: '99291',
          desc: 'Critical care, first 30-74 minutes',
          mod: 'None',
          rvu: ccRvu,
          fee: ccFee,
          status: 'fatal',
          note: 'FATAL GLOBAL REJECTION: Critical care billed during surgical global period without Modifier -24. Payer bundled into surgical fee.',
        });

        alerts.push({
          type: 'fatal',
          title: 'Missing Modifier -24 on Post-HIPEC ICU Care',
          desc: 'Commercial payers reject ICU critical care billed by the operating surgeon within the global period unless Modifier -24 is appended.',
          statute: 'CMS Global Surgery Policy; CARC 97 Rejection',
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
    cytoreductionScope,
    hasHipecPerfusion,
    hasPerfusionTelemetryDoc,
    hasBowelResection,
    hasModifier51Bowel,
    hasSplenectomy,
    hasDistinctOrganDoc,
    coSurgeonMode,
    hasPostOpCriticalCare,
    hasModifier24CriticalCare,
  ]);

  // ANSI 837P EDI Generator
  const generateEdiClaim = () => {
    const claimDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let edi = `ISA*00*          *00*          *ZZ*SUBMITTER      *ZZ*PAYER          *${claimDate.slice(2)}*1200*^*00501*000000001*0*P*:~\n`;
    edi += `GS*HC*SUBMITTER*PAYER*${claimDate}*1200*1*X*005010X222A1~\n`;
    edi += `ST*837*0001*005010X222A1~\n`;
    edi += `BHT*0019*00*REF${claimDate}*${claimDate}*1200*CH~\n`;
    edi += `NM1*85*2*SURGICAL ONCOLOGY PERITONEAL CENTER*****XX*1955555554~\n`;
    edi += `NM1*IL*1*WILLIAMS*ELENA****MI*HIPEC8829104~\n`;
    edi += `CLM*HIPEC-${claimDate}*${scrubberResult.expectedReimbursement.toFixed(2)}***11:B:1*Y*A*Y*Y~\n`;

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
        cytoreductionScope,
        hasHipecPerfusion,
        hasPerfusionTelemetryDoc,
        hasBowelResection,
        hasSplenectomy,
        coSurgeonMode,
        hasPostOpCriticalCare,
        expectedReimbursement: scrubberResult.expectedReimbursement,
        penaltyAtRisk: scrubberResult.penaltyAtRisk,
        totalRvu: scrubberResult.totalRvu,
        contactName,
        contactEmail,
        practiceName,
        auditNotes,
      };

      await sendLeadToKiran('hipec_rcm_audit', payload);
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
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-amber-900/40 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
              <Droplets className="h-3.5 w-3.5" />
              <span>Tool #69 · Cytoreductive Surgery &amp; HIPEC Scrubber</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cytoreductive Surgery &amp; HIPEC Perfusion Scrubber
            </h2>
            <p className="text-amber-100/80 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
              Audit extensive multivisceral peritonectomy (49205), defend 90-minute hyperthermic chemoperfusion
              (+96560), safeguard concomitant bowel/splenic resections with Modifier -51, and coordinate Modifier -62 co-surgery.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLeadModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Send className="h-4 w-4" />
              <span>Request HIPEC RCM Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Total Work RVUs</span>
            <Activity className="h-4 w-4 text-amber-600" />
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
          <div className="text-xs text-slate-500 mt-1">Clean claim modeled commercial yield</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            <span>At-Risk Revenue</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">
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
          {/* Section 1: Primary Cytoreductive Scope */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Scissors className="h-5 w-5 text-amber-600" />
              1. Cytoreductive Surgery (CRS) Scope
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  id: 'extensive_49205',
                  title: 'CPT 49205: Extensive Peritonectomy / Implants >10 cm',
                  desc: 'Multivisceral peritonectomy, stripping diaphragmatic peritoneum, pelvic peritonectomy, and mesenteric debulking. (28.50 wRVU)',
                },
                {
                  id: 'intermediate_49204',
                  title: 'CPT 49204: Intermediate Cytoreduction (5.1 to 10 cm)',
                  desc: 'Debulking of peritoneal implants measuring 5.1 to 10.0 cm in largest diameter. (23.20 wRVU)',
                },
                {
                  id: 'pelvic_exenteration_45126',
                  title: 'CPT 45126: Total Pelvic Exenteration with Proctectomy',
                  desc: 'En bloc pelvic exenteration for advanced rectal/ovarian carcinomatosis. (51.40 wRVU)',
                },
                {
                  id: 'omentectomy_49255',
                  title: 'CPT 49255: Isolated Total Omentectomy',
                  desc: 'Total infragastric or infracolic omentectomy without extensive peritoneal stripping. (12.50 wRVU)',
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    cytoreductionScope === item.id
                      ? 'border-amber-500 bg-amber-50/50 text-slate-900 shadow-sm ring-1 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="cytoreductionScope"
                      checked={cytoreductionScope === item.id}
                      onChange={() => setCytoreductionScope(item.id as any)}
                      className="mt-1 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-semibold text-sm">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section 2: HIPEC Chemoperfusion (96560) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-orange-600" />
              2. Hyperthermic Chemoperfusion (HIPEC 96560)
            </h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHipecPerfusion}
                  onChange={(e) => setHasHipecPerfusion(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                />
                <div className="text-sm">
                  <span className="font-semibold text-slate-800">
                    Perform 90-Minute Heated Intraperitoneal Chemoperfusion (CPT 96560)
                  </span>
                  <p className="text-xs text-slate-500">
                    Closed-circuit perfusion with heated chemotherapeutic bath (41-43&deg;C) utilizing Mitomycin-C or Cisplatin.
                  </p>
                </div>
              </label>

              {hasHipecPerfusion && (
                <div className="pl-6 border-l-2 border-orange-200 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPerfusionTelemetryDoc}
                      onChange={(e) => setHasPerfusionTelemetryDoc(e.target.checked)}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span>
                      Document catheter placement, temperature telemetry (41-43&deg;C), agent dose, and 90-min duration with Modifier -59
                    </span>
                  </label>
                  {!hasPerfusionTelemetryDoc && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      Fatal: Commercial payers reject 96560 as experimental or bundled into laparotomy unless detailed perfusion parameters and Modifier -59 are documented.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Concomitant Bowel Resection (44140) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="h-5 w-5 text-teal-600" />
              3. Concomitant Segmental Colectomy / LAR (44140)
            </h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasBowelResection}
                  onChange={(e) => setHasBowelResection(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <div className="text-sm">
                  <span className="font-semibold text-slate-800">
                    Perform Segmental Colectomy for Transmural Tumor Infiltration (CPT 44140)
                  </span>
                  <p className="text-xs text-slate-500">
                    Resection of sigmoid or right colon with anastomosis distinct from peritoneal debulking. (24.80 wRVU)
                  </p>
                </div>
              </label>

              {hasBowelResection && (
                <div className="pl-6 border-l-2 border-teal-200 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasModifier51Bowel}
                      onChange={(e) => setHasModifier51Bowel(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Append Multiple Procedure Modifier -51 to secondary bowel resection code</span>
                  </label>
                  {!hasModifier51Bowel && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Warning: Payers will bundle colectomy into primary cytoreduction (49205) without Modifier -51 and distinct pathology documentation.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Concomitant Splenectomy (38100) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-indigo-600" />
              4. Concomitant En Bloc Splenectomy (38100)
            </h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSplenectomy}
                  onChange={(e) => setHasSplenectomy(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div className="text-sm">
                  <span className="font-semibold text-slate-800">
                    Perform En Bloc Splenectomy for Omental / Splenic Hilar Carcinomatosis (CPT 38100)
                  </span>
                  <p className="text-xs text-slate-500">
                    Total splenectomy with vascular control at pancreatic tail. (18.50 wRVU)
                  </p>
                </div>
              </label>

              {hasSplenectomy && (
                <div className="pl-6 border-l-2 border-indigo-200 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDistinctOrganDoc}
                      onChange={(e) => setHasDistinctOrganDoc(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      Operative report confirms splenectomy was performed for direct oncologic tumor invasion (not incidental trauma)
                    </span>
                  </label>
                  {!hasDistinctOrganDoc && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Warning: Payers routinely deny splenectomy as incidental injury unless tumor invasion is specifically documented.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Dual-Specialty Co-Surgeon Modifier -62 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-purple-600" />
              5. Co-Surgeon Modifier -62 Alignment
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'matching_mod62',
                    title: 'Matching Mod 62',
                    desc: 'Surgical Oncologist + GYN Oncologist both bill same CPT with Mod 62.',
                  },
                  {
                    id: 'solo_surgeon',
                    title: 'Solo Surgeon',
                    desc: 'Single attending performing entire cytoreduction & HIPEC.',
                  },
                  {
                    id: 'mismatched_codes',
                    title: 'Mismatched Codes',
                    desc: 'Different primary CPT codes billed by co-surgeons (audit risk).',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCoSurgeonMode(item.id as any)}
                    className={`p-3 text-left rounded-xl border transition-all ${
                      coSurgeonMode === item.id
                        ? 'border-purple-500 bg-purple-50/50 text-slate-900 font-semibold shadow-sm ring-1 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 text-xs'
                    }`}
                  >
                    <div className="font-semibold text-sm">{item.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              {coSurgeonMode === 'mismatched_codes' && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 mt-2">
                  Fatal: Modifier -62 claims require identical primary CPT codes and distinct operative operative dictations from both surgeons. Mismatched codes trigger automated claim denial for both providers.
                </p>
              )}
            </div>
          </div>

          {/* Section 6: Post-HIPEC ICU Critical Care */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-rose-600" />
              6. Post-HIPEC ICU Surgical Critical Care (99291)
            </h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPostOpCriticalCare}
                  onChange={(e) => setHasPostOpCriticalCare(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                <div className="text-sm">
                  <span className="font-semibold text-slate-800">
                    Day 1 ICU Resuscitation for Massive Third-Spacing &amp; Sepsis (CPT 99291)
                  </span>
                  <p className="text-xs text-slate-500">
                    Titration of inotropes/vasopressors and fluid management following heated peritoneal chemotherapy.
                  </p>
                </div>
              </label>

              {hasPostOpCriticalCare && (
                <div className="pl-6 border-l-2 border-rose-200 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasModifier24CriticalCare}
                      onChange={(e) => setHasModifier24CriticalCare(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Append Modifier -24 to critical care visit to bypass surgical global period bundling</span>
                  </label>
                  {!hasModifier24CriticalCare && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      Fatal: Without Modifier -24, payers automatically bundle ICU critical care encounters into the 90-day global surgery package.
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
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-mono">
                          -{line.mod}
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
                <span className="text-xl font-black text-amber-600">
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

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-semibold mb-3 border border-amber-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Free HIPEC &amp; Surgical Oncology Coding Audit</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Request Practice Cytoreductive Oncology Revenue Review
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Our oncology surgical coding specialists will review your cytoreductive peritonectomies, heated chemoperfusion
              telemetry, and co-surgeon Modifier -62 claims to eliminate recurring payer unbundling clawbacks.
            </p>

            {leadSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center text-emerald-800">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-base">Audit Request Received</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Kiran and the Aethera surgical oncology coding team will inspect your HIPEC telemetry and follow up within 24 hours.
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
                    placeholder="Dr. Gregory Sterling, MD / Surgical Oncology Director"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    placeholder="g.sterling@cancercenter.org"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Practice / Cancer Institute Name
                  </label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="Comprehensive Peritoneal Surface Oncology Institute"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    placeholder="E.g., Payer rejections on HIPEC perfusion 96560 as experimental, unbundling denials on concomitant segmental colectomy 44140."
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
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
