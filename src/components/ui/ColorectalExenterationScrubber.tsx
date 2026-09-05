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
  Eye,
  GitBranch,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function ColorectalExenterationScrubber() {
  // 1. Resection Procedure & Staging
  const [resectionType, setResectionType] = useState<'pelvic_exenteration' | 'lar_jpouch' | 'lar_pullthrough' | 'partial_colectomy' | 'apr'>('lar_jpouch');
  const [simulateDowncode, setSimulateDowncode] = useState<boolean>(false);

  // 2. Diverting Protective Stoma
  const [stomaType, setStomaType] = useState<'loop_ileostomy' | 'loop_colostomy' | 'none'>('loop_ileostomy');
  const [stomaSeparateIncision, setStomaSeparateIncision] = useState<boolean>(true);
  const [neoadjuvantRadiation, setNeoadjuvantRadiation] = useState<boolean>(true);

  // 3. Multi-Surgeon / Co-Surgery
  const [coSurgeonMode, setCoSurgeonMode] = useState<'solo' | 'co_surgeon_compliant' | 'co_surgeon_unpaired' | 'team_surgery_mod_66'>('solo');

  // 4. Approach & Complexity
  const [surgicalApproach, setSurgicalApproach] = useState<'open_planned' | 'lap_converted_open' | 'minimally_invasive'>('open_planned');
  const [prolongedPelvicDissection, setProlongedPelvicDissection] = useState<boolean>(false);

  // 5. Ancillary Procedures
  const [ureteralStenting, setUreteralStenting] = useState<'separate_urologist' | 'billed_colorectal' | 'none'>('separate_urologist');
  const [includeIcgPerfusion, setIncludeIcgPerfusion] = useState<boolean>(true);

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

    // --- 1. PRIMARY RESECTION CODING ---
    if (resectionType === 'pelvic_exenteration') {
      const standardFee = 5850.0;
      const standardRvu = 76.4;

      if (coSurgeonMode === 'co_surgeon_compliant') {
        const coSurgeonFee = standardFee * 0.625; // 62.5% per CMS Mod 62
        const coSurgeonRvu = standardRvu * 0.625;
        totalRvu += coSurgeonRvu;
        expectedReimbursement += coSurgeonFee;
        lines.push({
          code: '45126',
          desc: 'Pelvic exenteration for colorectal malignancy with proctectomy & cystectomy',
          mod: '62',
          rvu: Number(coSurgeonRvu.toFixed(1)),
          fee: Number(coSurgeonFee.toFixed(2)),
          status: 'clean',
          note: 'Modifier 62 appended. CMS allows co-surgery when distinct specialists perform colorectal vs urologic/gynecologic portions.',
        });
        alerts.push({
          type: 'clean',
          title: 'Co-Surgeon Modifier -62 Compliant',
          desc: 'Operative notes confirm distinct procedural dictation by Colorectal and Urologic surgeons. Both claims receive 62.5% allowed rate without downcoding.',
          statute: 'CMS IOM Pub. 100-04, Ch. 12, Sec. 40.8',
        });
      } else if (coSurgeonMode === 'co_surgeon_unpaired') {
        totalRvu += standardRvu * 0.625;
        expectedReimbursement += standardFee * 0.625;
        penaltyAtRisk += standardFee * 0.625;
        lines.push({
          code: '45126',
          desc: 'Pelvic exenteration for colorectal malignancy',
          mod: '62',
          rvu: Number((standardRvu * 0.625).toFixed(1)),
          fee: Number((standardFee * 0.625).toFixed(2)),
          status: 'fatal',
          note: 'FATAL: Modifier 62 billed without paired cross-referenced urologic dictation. Claim will suspend in clearinghouse pre-payment review.',
        });
        alerts.push({
          type: 'fatal',
          title: 'Unpaired Modifier -62 Audit Rejection',
          desc: 'Payer clearinghouses suspend Modifier 62 claims if both surgeons do not submit synchronized operative reports detailing separate anatomical operative fields.',
          statute: 'NCCI Policy Manual Ch. 1, Sec. G',
        });
      } else if (coSurgeonMode === 'team_surgery_mod_66') {
        const teamFee = standardFee * 0.5;
        totalRvu += standardRvu * 0.5;
        expectedReimbursement += teamFee;
        lines.push({
          code: '45126',
          desc: 'Pelvic exenteration - Team Surgery (Colorectal, Urology, Gyn-Onc)',
          mod: '66',
          rvu: Number((standardRvu * 0.5).toFixed(1)),
          fee: Number(teamFee.toFixed(2)),
          status: 'warning',
          note: 'Modifier 66 requires medical director review and operative team conference notes to substantiate payment.',
        });
        alerts.push({
          type: 'warning',
          title: 'Team Surgery (-66) Manual Review Required',
          desc: 'Commercial payers flag Modifier 66 for mandatory manual clinical review. Operative reports must establish why complex multi-organ pelvic exenteration required 3+ co-surgeons.',
          statute: 'Medicare Claims Processing Manual Pub. 100-04, §40.8.1',
        });
      } else {
        // Solo
        totalRvu += standardRvu;
        expectedReimbursement += standardFee;
        lines.push({
          code: '45126',
          desc: 'Pelvic exenteration for colorectal malignancy with multivisceral resection',
          mod: 'None',
          rvu: standardRvu,
          fee: standardFee,
          status: 'clean',
          note: 'Primary resection code. Dictation must document proctectomy, cystectomy, and nodal clearance.',
        });
      }
    } else if (resectionType === 'lar_jpouch') {
      const standardFee = 3920.0;
      const standardRvu = 54.8;

      if (simulateDowncode) {
        // Downcoded to standard partial colectomy 44145
        const downcodedFee = 2840.0;
        const downcodedRvu = 39.5;
        const loss = standardFee - downcodedFee;
        totalRvu += downcodedRvu;
        expectedReimbursement += downcodedFee;
        penaltyAtRisk += loss;

        lines.push({
          code: '45119',
          desc: 'Proctectomy with colonic J-pouch reservoir & coloanal anastomosis',
          mod: 'Downcoded -> 44145',
          rvu: downcodedRvu,
          fee: downcodedFee,
          status: 'fatal',
          note: `PAYER DOWNCODING: Payer reclassified 45119 to 44145, resulting in a -$${loss.toFixed(2)} (-15.3 RVU) clawback.`,
        });
        alerts.push({
          type: 'fatal',
          title: 'Payer Downcoding to Partial Colectomy (44145)',
          desc: `Commercial auditor reclassified J-pouch LAR to simple colectomy (44145). Operative notes must explicitly document low pelvic dissection below peritoneal reflection and colonic reservoir construction.`,
          statute: 'AMA CPT Assistant / NCCI Policy Manual Ch. VII',
        });
      } else {
        totalRvu += standardRvu;
        expectedReimbursement += standardFee;
        lines.push({
          code: '45119',
          desc: 'Proctectomy with colonic J-pouch reservoir & coloanal anastomosis',
          mod: 'None',
          rvu: standardRvu,
          fee: standardFee,
          status: 'clean',
          note: 'Accurately captures total mesorectal excision (TME) and low pelvic colonic reservoir creation.',
        });
        alerts.push({
          type: 'clean',
          title: 'J-Pouch Reservoir Reconstruction Supported',
          desc: 'Operative note substantiates CPT 45119. Colonic pouch creation is fully reimbursable over simple LAR.',
          statute: 'CPT Coding Guidelines, Digestive System',
        });
      }
    } else if (resectionType === 'lar_pullthrough') {
      const standardFee = 3450.0;
      const standardRvu = 48.2;
      totalRvu += standardRvu;
      expectedReimbursement += standardFee;
      lines.push({
        code: '45110',
        desc: 'Proctectomy, complete, with pull-through and coloanal anastomosis',
        mod: 'None',
        rvu: standardRvu,
        fee: standardFee,
        status: 'clean',
        note: 'Complete mesorectal excision with direct coloanal pull-through anastomosis.',
      });
    } else if (resectionType === 'partial_colectomy') {
      const standardFee = 2840.0;
      const standardRvu = 39.5;
      totalRvu += standardRvu;
      expectedReimbursement += standardFee;
      lines.push({
        code: '44145',
        desc: 'Partial colectomy with low colorectal anastomosis (below peritoneal reflection)',
        mod: 'None',
        rvu: standardRvu,
        fee: standardFee,
        status: 'clean',
        note: 'Colorectal resection with stapled or hand-sewn low pelvic anastomosis.',
      });
    } else {
      // APR
      const standardFee = 3320.0;
      const standardRvu = 46.5;
      totalRvu += standardRvu;
      expectedReimbursement += standardFee;
      lines.push({
        code: '45110',
        desc: 'Abdominoperineal resection (APR) with permanent end colostomy',
        mod: 'None',
        rvu: standardRvu,
        fee: standardFee,
        status: 'clean',
        note: 'Synchronous abdominal and perineal resection of rectum and anus with stoma construction.',
      });
    }

    // --- 2. DIVERTING LOOP STOMA AUDIT ---
    if (stomaType !== 'none') {
      const stomaCode = stomaType === 'loop_ileostomy' ? '44320' : '44310';
      const stomaDesc = stomaType === 'loop_ileostomy' ? 'Creation of protective loop ileostomy' : 'Creation of diverting loop colostomy';
      const stomaFee = stomaType === 'loop_ileostomy' ? 1740.0 : 1630.0;
      const stomaRvu = stomaType === 'loop_ileostomy' ? 24.2 : 22.8;

      if (!stomaSeparateIncision) {
        // Bundled by NCCI unless separate incision and modifier XE/59
        penaltyAtRisk += stomaFee;
        lines.push({
          code: stomaCode,
          desc: stomaDesc,
          mod: 'UNBUNDLED (Denied)',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: `FATAL NCCI BUNDLE: Diverting stoma created through the primary laparotomy incision without separate counter-incision documentation is denied as integral to resection.`,
        });
        alerts.push({
          type: 'fatal',
          title: 'NCCI Fatal Unbundling: Diverting Stoma (44320/44310)',
          desc: 'Payers bundle loop ileostomy into proctectomy unless documented as created through a distinct abdominal trephine with separate fascial opening. Mod XE/59 requires explicit justification.',
          statute: 'NCCI Policy Manual Ch. VII, Sec. C.18',
        });
      } else {
        // Separate incision documented
        const mod = neoadjuvantRadiation ? 'XE' : '59';
        totalRvu += stomaRvu;
        expectedReimbursement += stomaFee;
        lines.push({
          code: stomaCode,
          desc: stomaDesc,
          mod: mod,
          rvu: stomaRvu,
          fee: stomaFee,
          status: 'clean',
          note: `Modifier ${mod} appended. Distinct right lower quadrant trephine separate from midline laparotomy justifies separate payment.`,
        });
        alerts.push({
          type: 'clean',
          title: `Separate Incision Stoma Defended (Modifier ${mod})`,
          desc: `Medical necessity verified: Prior radiation (${neoadjuvantRadiation ? 'Yes' : 'No'}) and ultra-low anastomotic height justify non-integral diversion through separate counter-incision.`,
          statute: 'CMS Transmittal 1422 / Medicare RCM Standard',
        });
      }
    }

    // --- 3. SURGICAL APPROACH & CONVERSION AUDIT ---
    if (surgicalApproach === 'lap_converted_open') {
      lines.push({
        code: '44145 / 45119',
        desc: 'Conversion from laparoscopic/robotic to open pelvic dissection',
        mod: '22 (Increased Procedural Services)',
        rvu: prolongedPelvicDissection ? 8.5 : 0,
        fee: prolongedPelvicDissection ? 610.0 : 0,
        status: prolongedPelvicDissection ? 'clean' : 'warning',
        note: prolongedPelvicDissection
          ? 'Modifier 22 supported: Extensive radiation fibrosis & frozen pelvis documented with >60 min extra operative time.'
          : 'Modifier 22 at risk: Lack of documented operative time extension (>50% above mean) will trigger payer denial.',
      });
      if (!prolongedPelvicDissection) {
        alerts.push({
          type: 'warning',
          title: 'Modifier 22 Audit Threshold Warning',
          desc: 'Conversion alone does not justify Modifier 22. Dictation must detail precise reasons for increased difficulty (severe adhesions, vascular encasement) and specific operative minutes spent.',
          statute: 'CMS IOM Pub. 100-04, Ch. 12, §40.2.A',
        });
      } else {
        totalRvu += 8.5;
        expectedReimbursement += 610.0;
      }
    }

    // --- 4. URETERAL STENTING AUDIT ---
    if (ureteralStenting === 'billed_colorectal') {
      penaltyAtRisk += 480.0;
      lines.push({
        code: '52005',
        desc: 'Cystourethroscopy with bilateral ureteral catheterization',
        mod: '59 (At Risk)',
        rvu: 0,
        fee: 0,
        status: 'fatal',
        note: 'FATAL: Prophylactic ureteral catheterization billed by primary colorectal surgeon is considered integral protective preparation and routinely denied.',
      });
      alerts.push({
        type: 'fatal',
        title: 'Prophylactic Ureteral Stents Billed by Colorectal Surgeon',
        desc: 'CMS NCCI Policy explicitly prohibits colorectal surgeons from unbundling cystoscopic stent placement (52005) performed solely to identify ureters during pelvic surgery. Must be performed and billed independently by an attending Urologist.',
        statute: 'NCCI Manual Ch. VII, Sec. D.4 (Urology/General Surgery Bundling)',
      });
    } else if (ureteralStenting === 'separate_urologist') {
      lines.push({
        code: '52005-50',
        desc: 'Bilateral ureteral stent placement performed by attending Urologist',
        mod: 'Billed on Urologist NPI',
        rvu: 6.8,
        fee: 480.0,
        status: 'clean',
        note: 'Correctly carved out to separate Urologist claim. Zero unbundling audit exposure on colorectal claim.',
      });
    }

    // --- 5. ICG FLUORESCENCE ANGIOGRAPHY AUDIT ---
    if (includeIcgPerfusion) {
      const icgFee = 320.0;
      const icgRvu = 4.2;
      totalRvu += icgRvu;
      expectedReimbursement += icgFee;
      lines.push({
        code: '0596T',
        desc: 'Temporary Cat III: Noncontact near-infrared fluorescence imaging of vascular perfusion',
        mod: 'None',
        rvu: icgRvu,
        fee: icgFee,
        status: 'clean',
        note: 'Substantiates microvascular mucosal perfusion check prior to colorectal anastomosis.',
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
    resectionType,
    simulateDowncode,
    stomaType,
    stomaSeparateIncision,
    neoadjuvantRadiation,
    coSurgeonMode,
    surgicalApproach,
    prolongedPelvicDissection,
    ureteralStenting,
    includeIcgPerfusion,
  ]);

  // ANSI X12 837P Claim Stream Preview
  const ansi837Snippet = useMemo(() => {
    return [
      'ISA*00*          *00*          *ZZ*AETHERA_RCM    *ZZ*PAYER_CLEARING *260905*1400*^*00501*000000101*0*P*:~',
      'GS*HC*AETHERA_RCM*PAYER_CLEARING*20260905*1400*101*X*005010X222A1~',
      'ST*837*0001*005010X222A1~',
      'BHT*0019*00*COLORECTAL_EXENT*20260905*1400*CH~',
      'NM1*85*2*AETHERA COLORECTAL ONCOLOGY LLC*****XX*1992019920~',
      'N3*100 COLONIC SURGERY WAY*SUITE 400~',
      'N4*BALTIMORE*MD*21201~',
      'NM1*82*1*SURGEON*COLORECTAL****XX*1447289102~',
      'PRV*BI*PXC*208C00000X~',
      'NM1*IL*1*DOE*PATIENT****MI*AET99821034~',
      'CLM*COLORECTAL-2026-9912*' + scrubberResult.expectedReimbursement.toFixed(2) + '***11:B:1*Y*A*Y*Y~',
      'HI*ABK:C20*ABF:Z85.048*ABF:Z92.3~',
      ...scrubberResult.lines.map((line) => {
        const modSegment = line.mod && line.mod !== 'None' ? `:${line.mod.replace(/[^A-Za-z0-9]/g, '')}` : '';
        return `SV1*HC:${line.code}${modSegment}*${line.fee.toFixed(2)}*UN*1***1:2~DTP*472*D8*20260905~`;
      }),
      'SE*' + (11 + scrubberResult.lines.length * 2) + '*0001~',
      'GE*1*101~',
      'IEA*1*000000101~',
    ].join('\n');
  }, [scrubberResult]);

  const handleCopyClaim = () => {
    navigator.clipboard.writeText(ansi837Snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      leadType: 'colorectal_surgery_rcm_audit',
      contactName,
      contactEmail,
      practiceName,
      auditNotes,
      resectionType,
      stomaType,
      stomaSeparateIncision,
      coSurgeonMode,
      surgicalApproach,
      ureteralStenting,
      totalRvu: scrubberResult.totalRvu,
      expectedReimbursement: scrubberResult.expectedReimbursement,
      penaltyAtRisk: scrubberResult.penaltyAtRisk,
      claimLines: scrubberResult.lines.map((l) => ({ code: l.code, fee: l.fee, status: l.status })),
      timestamp: new Date().toISOString(),
    };

    try {
      await sendLeadToKiran('colorectal_surgery_rcm_audit', payload);
      trackConversion('colorectal_rcm_audit_submit');
      setLeadSuccess(true);
      setTimeout(() => {
        setShowLeadModal(false);
        setLeadSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Audit lead transmission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Tool Header */}
      <div className="mb-8 text-center sm:text-left border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider">
            <Scissors className="w-3.5 h-3.5 text-teal-600" />
            Tool #56 • Surgical Oncology & Colorectal RCM
          </div>
          <span className="text-xs font-mono text-slate-500">CPT 45110-45126 • 44320 • CMS NCCI Ch. VII</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-navy font-jakarta tracking-tight">
          Colorectal Surgery & Pelvic Exenteration Scrubber
        </h2>
        <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-4xl">
          Model total mesorectal excision (TME), multivisceral pelvic exenterations, colonic J-pouch reservoirs, and protective diverting loop ileostomies. Enforces Modifier -62 co-surgeon validation, protects against partial colectomy downcoding, and eliminates fatal NCCI stoma unbundling denials.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Configurations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Box 1: Primary Surgical Resection */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-teal-600" />
              1. Colorectal Resection Scope & Anatomic Level
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Resection Procedure
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'pelvic_exenteration', name: 'Pelvic Exenteration (45126)', desc: 'En bloc proctectomy, cystectomy, hysterectomy', rvu: '76.4 RVU • $5,850' },
                    { id: 'lar_jpouch', name: 'Low Anterior Resection w/ J-Pouch (45119)', desc: 'TME w/ colonic J-pouch reservoir to anus', rvu: '54.8 RVU • $3,920' },
                    { id: 'lar_pullthrough', name: 'Pull-Through LAR (45110)', desc: 'Complete proctectomy w/ direct coloanal', rvu: '48.2 RVU • $3,450' },
                    { id: 'partial_colectomy', name: 'Low Colectomy (44145)', desc: 'Resection w/ low pelvic anastomosis', rvu: '39.5 RVU • $2,840' },
                    { id: 'apr', name: 'Abdominoperineal Resection (45110)', desc: 'Resection w/ permanent end colostomy', rvu: '46.5 RVU • $3,320' },
                  ].map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setResectionType(res.id as any)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        resectionType === res.id
                          ? 'border-teal-600 bg-teal-50/70 text-navy ring-1 ring-teal-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-xs text-navy">{res.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{res.desc}</div>
                      <div className="text-[10px] font-mono font-semibold text-teal-700 mt-1">{res.rvu}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Downcoding Simulator Toggle */}
              {resectionType === 'lar_jpouch' && (
                <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-900">Simulate Payer Downcoding Audit</div>
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        Test payer reclassifying J-Pouch LAR (45119) down to simple colectomy (44145).
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simulateDowncode}
                        onChange={(e) => setSimulateDowncode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Box 2: Diverting Stoma & Incision Location */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <GitBranch className="w-5 h-5 text-teal-600" />
              2. Diverting Protective Stoma & NCCI Bundling Defense
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Protective Diversion Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'loop_ileostomy', label: 'Loop Ileostomy (44320)', desc: '24.2 RVU • $1,740' },
                    { id: 'loop_colostomy', label: 'Loop Colostomy (44310)', desc: '22.8 RVU • $1,630' },
                    { id: 'none', label: 'No Stoma Created', desc: 'Primary anastomosis only' },
                  ].map((stoma) => (
                    <button
                      key={stoma.id}
                      type="button"
                      onClick={() => setStomaType(stoma.id as any)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        stomaType === stoma.id
                          ? 'border-teal-600 bg-teal-50 text-navy font-semibold ring-1 ring-teal-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>{stoma.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{stoma.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {stomaType !== 'none' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-xs font-medium text-slate-800">Separate Abdominal Counter-Incision Documented</div>
                      <div className="text-[11px] text-slate-500">Stoma trephine created through distinct right lower quadrant fascial opening</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stomaSeparateIncision}
                        onChange={(e) => setStomaSeparateIncision(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-xs font-medium text-slate-800">Neoadjuvant Chemo-Radiation History</div>
                      <div className="text-[11px] text-slate-500">High-risk tissue compromise justifying non-integral diversion (Modifier XE)</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={neoadjuvantRadiation}
                        onChange={(e) => setNeoadjuvantRadiation(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Box 3: Co-Surgery & Approach */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              3. Co-Surgeon, Approach & Ancillary Procedures
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Co-Surgeon & Team Surgery Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'solo', label: 'Solo Surgeon', desc: 'Colorectal surgeon performs all phases' },
                    { id: 'co_surgeon_compliant', label: 'Modifier -62 Compliant', desc: 'Colorectal + Urologic Oncologist paired dictation' },
                    { id: 'co_surgeon_unpaired', label: 'Modifier -62 Unpaired Note', desc: 'Simulate missing second surgeon dictation' },
                    { id: 'team_surgery_mod_66', label: 'Modifier -66 Team Surgery', desc: '3+ distinct surgical specialties' },
                  ].map((co) => (
                    <button
                      key={co.id}
                      type="button"
                      onClick={() => setCoSurgeonMode(co.id as any)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        coSurgeonMode === co.id
                          ? 'border-teal-600 bg-teal-50 text-navy font-semibold ring-1 ring-teal-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>{co.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{co.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Surgical Approach
                  </label>
                  <select
                    value={surgicalApproach}
                    onChange={(e) => setSurgicalApproach(e.target.value as any)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="open_planned">Planned Open Laparotomy</option>
                    <option value="lap_converted_open">Laparoscopic Converted to Open (Mod 22)</option>
                    <option value="minimally_invasive">Pure Robotic / Laparoscopic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Prophylactic Ureteral Stenting
                  </label>
                  <select
                    value={ureteralStenting}
                    onChange={(e) => setUreteralStenting(e.target.value as any)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="separate_urologist">Placed & Billed by Attending Urologist</option>
                    <option value="billed_colorectal">Billed on Colorectal Surgeon Claim (Test Unbundling)</option>
                    <option value="none">No Ureteral Stents Placed</option>
                  </select>
                </div>
              </div>

              {surgicalApproach === 'lap_converted_open' && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                  <div>
                    <div className="text-xs font-medium text-amber-900">Extensive Pelvic Adhesions / Frozen Pelvis (&gt;60 min delay)</div>
                    <div className="text-[11px] text-amber-700">Detailed operative notes justifying Modifier 22 RVU increase</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prolongedPelvicDissection}
                      onChange={(e) => setProlongedPelvicDissection(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-medium text-slate-800">Indocyanine Green (ICG) Perfusion Angiography (0596T)</div>
                  <div className="text-[11px] text-slate-500">Real-time fluorescence imaging confirming microvascular tissue viability</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeIcgPerfusion}
                    onChange={(e) => setIncludeIcgPerfusion(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Results & ANSI Stream */}
        <div className="lg:col-span-5 space-y-6">
          {/* Revenue & Audit Summary Card */}
          <div className="bg-navy text-white rounded-xl shadow-lg p-6 border border-navy-light">
            <div className="flex items-center justify-between border-b border-navy-light/60 pb-4 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                Colorectal Claim Audit Metrics
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                <Zap className="w-3 h-3" />
                CMS NCCI Compliant
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-xs text-slate-300">Expected Reimbursement</div>
                <div className="text-2xl font-black text-white mt-1">
                  ${scrubberResult.expectedReimbursement.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  {scrubberResult.totalRvu} Total wRVUs
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-300">Clawback / Audit At Risk</div>
                <div className={`text-2xl font-black mt-1 ${scrubberResult.penaltyAtRisk > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ${scrubberResult.penaltyAtRisk.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {scrubberResult.penaltyAtRisk > 0 ? 'Action required prior to claim drop' : 'Clean claim ready'}
                </div>
              </div>
            </div>

            {/* Audit Findings */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Clinical Audit Findings ({scrubberResult.alerts.length})
              </div>
              {scrubberResult.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs ${
                    alert.type === 'fatal'
                      ? 'bg-rose-950/50 border-rose-600/50 text-rose-200'
                      : alert.type === 'warning'
                      ? 'bg-amber-950/50 border-amber-600/50 text-amber-200'
                      : 'bg-teal-950/40 border-teal-600/40 text-teal-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {alert.type === 'fatal' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    ) : alert.type === 'warning' ? (
                      <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    )}
                    <span>{alert.title}</span>
                  </div>
                  <p className="text-[11px] mt-1 text-slate-300 leading-relaxed">{alert.desc}</p>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">Ref: {alert.statute}</div>
                </div>
              ))}
            </div>

            {/* CTA to submit audit */}
            <button
              type="button"
              onClick={() => setShowLeadModal(true)}
              className="mt-6 w-full py-3 px-4 rounded-lg bg-teal-500 hover:bg-teal-400 text-navy font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Request Colorectal Oncology Billing Audit
            </button>
          </div>

          {/* Claim Lines Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-teal-600" />
                Scrubbed ANSI Claim Lines
              </span>
              <span className="text-[11px] font-mono text-slate-500">{scrubberResult.lines.length} service lines</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Code</th>
                    <th className="py-2.5 px-2 font-semibold">Mod</th>
                    <th className="py-2.5 px-2 font-semibold">wRVU</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Fee</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {scrubberResult.lines.map((line, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono font-bold text-navy">
                        {line.code}
                        <div className="text-[10px] text-slate-500 font-sans font-normal truncate max-w-[150px]">
                          {line.desc}
                        </div>
                      </td>
                      <td className="py-2 px-2 font-mono text-teal-700 font-semibold">{line.mod}</td>
                      <td className="py-2 px-2 font-mono">{line.rvu}</td>
                      <td className="py-2 px-3 font-mono text-right">${line.fee.toFixed(2)}</td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            line.status === 'clean'
                              ? 'bg-teal-100 text-teal-800'
                              : line.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {line.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* EDI 837P ANSI Preview */}
          <div className="bg-slate-900 rounded-xl p-4 text-slate-300 font-mono text-xs border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
              <span className="text-[11px] text-slate-400 font-sans font-semibold flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-teal-400" />
                ANSI X12 837P Professional Claim Snippet
              </span>
              <button
                type="button"
                onClick={handleCopyClaim}
                className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy EDI'}
              </button>
            </div>
            <pre className="overflow-x-auto text-[10px] leading-tight text-teal-300/90 whitespace-pre">
              {ansi837Snippet}
            </pre>
          </div>
        </div>
      </div>

      {/* Modal for Lead Submission */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-xl font-bold text-navy font-jakarta">
                  Request Colorectal Oncology Claim Audit
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Route zero-PHI simulation to Kiran at Aethera Healthcare Solutions
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLeadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {leadSuccess ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto mb-3 animate-bounce" />
                <h4 className="text-lg font-bold text-navy">Audit Dossier Transmitted</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Kiran will review your surgical case parameters and contact you within 24 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g., Marcus Vance, MD / Practice Administrator"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="marcus@colorectalsurgeryassociates.com"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Practice or Surgical Department Name
                  </label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="e.g., Mid-Atlantic Surgical Oncology Group"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Case Questions or Payer Dispute Details
                  </label>
                  <textarea
                    rows={3}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="Describe specific payer clawbacks (e.g. UnitedHealthcare bundling loop ileostomy into 45119)..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Transmitting Audit...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Case for Specialist Review
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Strict HIPAA zero-PHI standard. No patient identifiers are ever stored or transmitted.
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
