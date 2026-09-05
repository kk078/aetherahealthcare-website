'use client';

import React, { useState, useMemo } from 'react';
import {
  Bone,
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
  Activity,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

type FusionApproach = 'tlif_plif' | 'acdf' | 'alif' | 'posterolateral';

interface ApproachConfig {
  id: FusionApproach;
  name: string;
  category: 'Lumbar' | 'Cervical';
  primaryCode: string;
  primaryDesc: string;
  primaryFee: number;
  addonCode: string;
  addonDesc: string;
  addonFee: number;
  bundlesDecompressionSameLevel: boolean;
  eligibleForCoSurgeonMod62: boolean;
}

const APPROACHES: Record<FusionApproach, ApproachConfig> = {
  tlif_plif: {
    id: 'tlif_plif',
    name: 'TLIF / PLIF (Transforaminal/Posterior Lumbar Interbody Fusion)',
    category: 'Lumbar',
    primaryCode: '22633',
    primaryDesc: 'Arthrodesis, combined posterior/posterolateral interbody fusion, single interspace',
    primaryFee: 1680.0,
    addonCode: '+22634',
    addonDesc: 'Each additional interspace, combined interbody & posterolateral',
    addonFee: 520.0,
    bundlesDecompressionSameLevel: true,
    eligibleForCoSurgeonMod62: false,
  },
  acdf: {
    id: 'acdf',
    name: 'ACDF (Anterior Cervical Discectomy & Fusion)',
    category: 'Cervical',
    primaryCode: '22551',
    primaryDesc: 'Arthrodesis, anterior interbody, including disc space preparation, cervical below C2',
    primaryFee: 1540.0,
    addonCode: '+22552',
    addonDesc: 'Each additional interspace, cervical below C2',
    addonFee: 430.0,
    bundlesDecompressionSameLevel: true,
    eligibleForCoSurgeonMod62: true,
  },
  alif: {
    id: 'alif',
    name: 'ALIF (Anterior Lumbar Interbody Fusion)',
    category: 'Lumbar',
    primaryCode: '22558',
    primaryDesc: 'Arthrodesis, anterior interbody technique, lumbar, single interspace',
    primaryFee: 1510.0,
    addonCode: '+22554',
    addonDesc: 'Each additional interspace, thoracic or lumbar',
    addonFee: 420.0,
    bundlesDecompressionSameLevel: false,
    eligibleForCoSurgeonMod62: true,
  },
  posterolateral: {
    id: 'posterolateral',
    name: 'Posterolateral Lumbar Fusion (Without Interbody Cage)',
    category: 'Lumbar',
    primaryCode: '22612',
    primaryDesc: 'Arthrodesis, posterior or posterolateral, lumbar, single level',
    primaryFee: 1420.0,
    addonCode: '+22614',
    addonDesc: 'Each additional level, lumbar',
    addonFee: 440.0,
    bundlesDecompressionSameLevel: false,
    eligibleForCoSurgeonMod62: false,
  },
};

export default function SpineArthrodesisScrubber() {
  const [approach, setApproach] = useState<FusionApproach>('tlif_plif');
  const [numInterspaces, setNumInterspaces] = useState<number>(2); // 1 primary + 1 addon

  // Decompression / Laminectomy
  const [decompressionType, setDecompressionType] = useState<'none' | 'same_level' | 'separate_level'>('same_level');

  // Co-Surgeon Modifier -62
  const [isCoSurgeonCase, setIsCoSurgeonCase] = useState<boolean>(false);
  const [applyMod62ToInstrumentation, setApplyMod62ToInstrumentation] = useState<boolean>(false); // Trap error

  // Instrumentation
  const [includeBiomechCage, setIncludeBiomechCage] = useState<boolean>(true); // CPT +22853
  const [posteriorInstrumentation, setPosteriorInstrumentation] = useState<'none' | 'non_segmental' | 'segmental_3_6'>('segmental_3_6'); // 22840 vs 22842
  const [anteriorInstrumentation, setAnteriorInstrumentation] = useState<boolean>(false); // 22845

  // Bone Grafts
  const [includeLocalAutograft, setIncludeLocalAutograft] = useState<boolean>(true); // +20936
  const [includeMorselizedAllograft, setIncludeMorselizedAllograft] = useState<boolean>(true); // +20930
  const [applyMod51ToGrafts, setApplyMod51ToGrafts] = useState<boolean>(false); // Trap error

  // Technology & Monitoring
  const [includeNavigation, setIncludeNavigation] = useState<boolean>(true); // +61783
  const [includeIonm, setIncludeIonm] = useState<boolean>(true); // 95940 / G0453

  // Lead Modal & UI States
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showLeadModal, setShowLeadModal] = useState<boolean>(false);
  const [leadSuccess, setLeadSuccess] = useState<boolean>(false);
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [practiceName, setPracticeName] = useState<string>('');
  const [auditNotes, setAuditNotes] = useState<string>('');

  const currentApproach = APPROACHES[approach];

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

    // 1. Primary Arthrodesis
    const primaryCoSurgeonMods = isCoSurgeonCase && currentApproach.eligibleForCoSurgeonMod62 ? ['62'] : [];
    const primaryMultiplier = primaryCoSurgeonMods.includes('62') ? 0.625 : 1.0;
    const primaryFee = currentApproach.primaryFee * primaryMultiplier;

    lines.push({
      code: currentApproach.primaryCode,
      desc: currentApproach.primaryDesc,
      units: 1,
      modifiers: primaryCoSurgeonMods,
      fee: primaryFee,
      isBundled: false,
      status: 'clean',
      note: primaryCoSurgeonMods.includes('62')
        ? 'Co-surgeon split (62.5% Medicare allowable). Requires matching operative reports.'
        : 'Primary arthrodesis code. Base level of spinal fusion.',
    });
    grossCharges += currentApproach.primaryFee;
    compliantReimbursement += primaryFee;

    if (isCoSurgeonCase && !currentApproach.eligibleForCoSurgeonMod62) {
      complianceFlags.push({
        type: 'error',
        title: 'Modifier -62 Co-Surgery Disallowed for TLIF/PLIF',
        message: `${currentApproach.primaryCode} is flagged by Medicare fee schedule as Modifier 62 co-surgery indicator '0' or '1' with strict medical review required. Co-surgery is typically valid for anterior approaches (ALIF 22558 or ACDF 22551) with general/vascular access surgeons, not routine posterior TLIFs.`,
      });
    }

    // 2. Add-on Interspaces
    const addOnLevels = Math.max(0, numInterspaces - 1);
    if (addOnLevels > 0) {
      const addonFee = currentApproach.addonFee * addOnLevels * primaryMultiplier;
      lines.push({
        code: currentApproach.addonCode,
        desc: `${currentApproach.addonDesc} (${addOnLevels} additional interspace${addOnLevels > 1 ? 's' : ''})`,
        units: addOnLevels,
        modifiers: primaryCoSurgeonMods,
        fee: addonFee,
        isBundled: false,
        status: 'clean',
        note: `Add-on code (+). Exempt from multiple procedure reduction (Mod 51).`,
      });
      grossCharges += currentApproach.addonFee * addOnLevels;
      compliantReimbursement += addonFee;
    }

    // 3. Decompression & Laminectomy Audit (63047 / 63048)
    if (decompressionType === 'same_level') {
      if (currentApproach.bundlesDecompressionSameLevel) {
        grossCharges += 1120.0;
        riskPreventedAmount += 1120.0;
        lines.push({
          code: '63047',
          desc: 'Laminectomy/decompression at same interspace as fusion',
          units: 1,
          modifiers: [],
          fee: 0,
          isBundled: true,
          status: 'bundled_denial',
          note: `Statutorily BUNDLED under CMS NCCI edits into ${currentApproach.primaryCode}. In a TLIF/PLIF or ACDF, canal decompression & facetectomy are considered the surgical corridor and component of the interbody arthrodesis. Billing separately triggers CARC CO-97 denial or OIG post-payment clawback.`,
        });
        complianceFlags.push({
          type: 'error',
          title: `Fatal NCCI Bundling Edit: 63047 Bundled into ${currentApproach.primaryCode}`,
          message: `CPT 63047 cannot be billed for decompression performed at the same vertebral interspace as CPT 22633 or 22551. Modifier 59 cannot unbundle decompression within the fusion corridor unless performed at a completely separate non-fusion spinal level.`,
        });
      } else {
        const decompFee = 1120.0 * 0.5; // 50% multiple procedure
        lines.push({
          code: '63047',
          desc: 'Laminectomy/decompression at same level as posterolateral fusion',
          units: 1,
          modifiers: ['51'],
          fee: decompFee,
          isBundled: false,
          status: 'clean',
          note: 'Posterolateral fusion (22612) does not bundle 63047 per NCCI PTP edits, subject to standard 50% multiple procedure reduction.',
        });
        grossCharges += 1120.0;
        compliantReimbursement += decompFee;
      }
    } else if (decompressionType === 'separate_level') {
      const decompFee = 1120.0 * 0.5;
      lines.push({
        code: '63047',
        desc: 'Laminectomy/decompression at distinct non-fusion spinal level',
        units: 1,
        modifiers: ['59', 'XS'],
        fee: decompFee,
        isBundled: false,
        status: 'modified_reimbursed',
        note: 'Distinct anatomical segment (XS/59). Compliant unbundling with documented non-fusion stenosis decompression.',
      });
      grossCharges += 1120.0;
      compliantReimbursement += decompFee;
    }

    // 4. Interbody Biomechanical Cage (+22853)
    if (includeBiomechCage && (approach === 'tlif_plif' || approach === 'acdf' || approach === 'alif')) {
      const cageFee = 340.0 * numInterspaces;
      lines.push({
        code: '+22853',
        desc: `Insertion of intervertebral biomechanical device(s) (e.g. synthetic cage/spacer), per interspace`,
        units: numInterspaces,
        modifiers: [],
        fee: cageFee,
        isBundled: false,
        status: 'clean',
        note: `Billed as 1 unit per interspace grafted (${numInterspaces} units). Do NOT append modifier 51.`,
      });
      grossCharges += cageFee;
      compliantReimbursement += cageFee;
    }

    // 5. Posterior Instrumentation (+22840 or +22842)
    if (posteriorInstrumentation === 'segmental_3_6') {
      const instFee = 940.0;
      const hasInstMod62Error = isCoSurgeonCase && applyMod62ToInstrumentation;
      if (hasInstMod62Error) {
        riskPreventedAmount += instFee;
        complianceFlags.push({
          type: 'error',
          title: 'Modifier -62 Disallowed on Instrumentation (+22842)',
          message: 'CMS Medicare Claims Processing Manual (Pub. 100-04, Ch. 12) strictly disallows Modifier 62 on spinal instrumentation add-on codes. Add-on instrumentation must be billed exclusively by the primary operating surgeon without -62.',
        });
      }
      lines.push({
        code: '+22842',
        desc: 'Posterior segmental instrumentation (e.g., pedicle screws), 3 to 6 vertebral segments',
        units: 1,
        modifiers: hasInstMod62Error ? ['62 (INVALID)'] : [],
        fee: hasInstMod62Error ? 0 : instFee,
        isBundled: false,
        status: hasInstMod62Error ? 'compliance_risk' : 'clean',
        note: hasInstMod62Error
          ? 'Modifier -62 on +22842 results in total payer claim denial. Must be billed solo.'
          : 'Compliant add-on code. Segments must be explicitly named in operative report.',
      });
      grossCharges += instFee;
      if (!hasInstMod62Error) compliantReimbursement += instFee;
    } else if (posteriorInstrumentation === 'non_segmental') {
      const instFee = 710.0;
      lines.push({
        code: '+22840',
        desc: 'Posterior non-segmental instrumentation (e.g., Harrington rod or simple cross-link)',
        units: 1,
        modifiers: [],
        fee: instFee,
        isBundled: false,
        status: 'clean',
        note: 'Single level non-segmental fixator.',
      });
      grossCharges += instFee;
      compliantReimbursement += instFee;
    }

    // 6. Anterior Instrumentation (+22845)
    if (anteriorInstrumentation) {
      const antInstFee = 680.0;
      const hasAntInstMod62Error = isCoSurgeonCase && applyMod62ToInstrumentation;
      if (hasAntInstMod62Error) {
        riskPreventedAmount += antInstFee;
        complianceFlags.push({
          type: 'error',
          title: 'Modifier -62 Disallowed on Anterior Plate (+22845)',
          message: 'Anterior instrumentation (+22845) has a CMS co-surgery indicator of "0" (Co-surgeons NOT permitted). The access surgeon cannot bill 22845-62.',
        });
      }
      lines.push({
        code: '+22845',
        desc: 'Anterior instrumentation; 2 to 3 vertebral segments (anterior cervical/lumbar plate)',
        units: 1,
        modifiers: hasAntInstMod62Error ? ['62 (INVALID)'] : [],
        fee: hasAntInstMod62Error ? 0 : antInstFee,
        isBundled: false,
        status: hasAntInstMod62Error ? 'compliance_risk' : 'clean',
        note: hasAntInstMod62Error
          ? 'Co-surgeon modifier disallowed by CMS. Bill under spine surgeon exclusively.'
          : 'Add-on code. Fully payable without multiple surgery deduction.',
      });
      grossCharges += antInstFee;
      if (!hasAntInstMod62Error) compliantReimbursement += antInstFee;
    }

    // 7. Bone Grafts (+20936 Local Autograft & +20930 Morselized Allograft)
    if (includeLocalAutograft) {
      const graftFee = 85.0;
      if (applyMod51ToGrafts) {
        riskPreventedAmount += 42.5;
        complianceFlags.push({
          type: 'warning',
          title: 'Modifier -51 Incorrectly Appended to Add-on Graft (+20936)',
          message: '+20936 is an official CPT add-on code. Appending Modifier 51 causes clearinghouses or payers to miscalculate a 50% discount or reject the claim format.',
        });
      }
      lines.push({
        code: '+20936',
        desc: 'Autograft for spine surgery only (includes harvesting local bone from operative site)',
        units: 1,
        modifiers: applyMod51ToGrafts ? ['51 (UNNECESSARY)'] : [],
        fee: graftFee,
        isBundled: false,
        status: applyMod51ToGrafts ? 'compliance_risk' : 'clean',
        note: 'Add-on code exempt from modifier 51. Report local bone collected from laminectomy/shave.',
      });
      grossCharges += graftFee;
      compliantReimbursement += graftFee;
    }

    if (includeMorselizedAllograft) {
      const graftFee = 120.0;
      lines.push({
        code: '+20930',
        desc: 'Allograft, morselized, or placement of osteopromotive material (demineralized matrix)',
        units: 1,
        modifiers: [],
        fee: graftFee,
        isBundled: false,
        status: 'clean',
        note: 'Add-on code exempt from modifier 51. Add-on per spine procedure, not per level.',
      });
      grossCharges += graftFee;
      compliantReimbursement += graftFee;
    }

    // 8. Computer-Assisted Navigation (+61783)
    if (includeNavigation) {
      const navFee = 260.0;
      lines.push({
        code: '+61783',
        desc: 'Stereotactic computer-assisted volumetric navigation, spinal (add-on code)',
        units: 1,
        modifiers: [],
        fee: navFee,
        isBundled: false,
        status: 'clean',
        note: 'Requires separate intraoperative navigation registration documentation.',
      });
      grossCharges += navFee;
      compliantReimbursement += navFee;
    }

    // 9. Neuromonitoring (IONM)
    if (includeIonm) {
      const ionmFee = 380.0;
      lines.push({
        code: '95940',
        desc: 'Continuous intraoperative neurophysiology monitoring, in-room, per 15 minutes (or G0453 remote)',
        units: 4,
        modifiers: [],
        fee: ionmFee,
        isBundled: false,
        status: 'clean',
        note: 'Must be billed by independent neurophysiologist/monitoring specialist, not operating surgeon.',
      });
      grossCharges += ionmFee;
      compliantReimbursement += ionmFee;
    }

    return {
      lines,
      complianceFlags,
      grossCharges,
      compliantReimbursement,
      riskPreventedAmount,
    };
  }, [
    approach,
    numInterspaces,
    decompressionType,
    isCoSurgeonCase,
    applyMod62ToInstrumentation,
    includeBiomechCage,
    posteriorInstrumentation,
    anteriorInstrumentation,
    includeLocalAutograft,
    includeMorselizedAllograft,
    applyMod51ToGrafts,
    includeNavigation,
    includeIonm,
    currentApproach,
  ]);

  // ANSI 837P Claim Stream Generation
  const ansi837pLines = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const dateStr = today;
    let segs: string[] = [];
    segs.push(`ISA*00*          *00*          *ZZ*SPINECLINIC    *ZZ*MEDICAREPAYER  *${today.slice(2)}*1200*^*00501*000000481*0*P*:~`);
    segs.push(`GS*HC*SPINECLINIC*MEDICAREPAYER*${dateStr}*1200*481*X*005010X222A1~`);
    segs.push(`ST*837*0001*005010X222A1~`);
    segs.push(`BHT*0019*00*SPN20260905*${dateStr}*1200*CH~`);
    segs.push(`NM1*85*2*SPINE & RECONSTRUCTIVE SURGERY SPECIALISTS*****XX*1982736450~`);
    segs.push(`CLM*SPN-2026-0905*${auditResults.compliantReimbursement.toFixed(2)}***11:B:1*Y*A*Y*Y~`);
    segs.push(`HI*BK:M43.16*BF:M51.26*BF:M48.061*BF:M54.16~`); // Spondylolisthesis, HNP lumbar, Stenosis lumbar

    auditResults.lines.forEach((line, idx) => {
      const modStr = line.modifiers.length > 0 ? `:${line.modifiers.join(':')}` : '';
      segs.push(`LX*${idx + 1}~`);
      segs.push(`SV1*HC:${line.code}${modStr}*${line.fee.toFixed(2)}*UN*${line.units}***1:2:3~`);
      segs.push(`DTP*472*D8*${dateStr}~`);
    });

    segs.push(`SE*${segs.length + 1}*0001~`);
    segs.push(`GE*1*481~`);
    segs.push(`IEA*1*000000481~`);
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
      await sendLeadToKiran('Spine Arthrodesis Scrubber Audit Dossier', {
        contactName,
        contactEmail,
        practiceName,
        approach: currentApproach.name,
        numInterspaces,
        grossCharges: auditResults.grossCharges,
        compliantReimbursement: auditResults.compliantReimbursement,
        riskPreventedAmount: auditResults.riskPreventedAmount,
        notes: auditNotes,
      });
      trackConversion('lead_submit_spine_scrubber');
      setLeadSuccess(true);
      setTimeout(() => {
        setShowLeadModal(false);
        setLeadSuccess(false);
      }, 3000);
    } catch {
      alert('Error delivering audit packet. Please submit an inquiry via our contact form or schedule a consultation directly.');
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
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Bone className="w-3.5 h-3.5" />
              Spine Surgery & Arthrodesis Intelligence
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              CMS NCCI 2026 Validated
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-jakarta">
            Complex Spine Arthrodesis & Multi-Level Scrubber
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Simulate multi-level interbody fusions (TLIF, ACDF, ALIF), test NCCI decompression bundling edits, audit Modifier -62 co-surgery rules, and eliminate instrumentation claim clawbacks.
          </p>
        </div>

        <button
          onClick={() => setShowLeadModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal text-navy font-bold text-sm hover:bg-mint transition-all shadow-sm shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Request Surgical RCM Audit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Configurator Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Arthrodesis Approach Selection */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. Surgical Approach & Fusion Technique
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(APPROACHES) as FusionApproach[]).map((key) => {
                const app = APPROACHES[key];
                const isSelected = approach === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setApproach(key);
                      // Auto adjust anterior plate default
                      if (key === 'acdf' || key === 'alif') {
                        setAnteriorInstrumentation(true);
                      } else {
                        setAnteriorInstrumentation(false);
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900">{app.category}: {app.primaryCode}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        ${app.primaryFee}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium line-clamp-2">{app.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Interspaces */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Fusion Interspaces / Vertebral Levels
              </label>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                {numInterspaces} {numInterspaces === 1 ? 'Interspace' : 'Interspaces'}
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumInterspaces(num)}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                    numInterspaces === num
                      ? 'bg-slate-900 text-white border-slate-900 shadow'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {num} {num === 1 ? 'Level (Base)' : `Levels (+${num - 1})`}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Primary code: <strong className="text-slate-800">{currentApproach.primaryCode}</strong> (1st level) + Add-on code:{' '}
              <strong className="text-slate-800">{currentApproach.addonCode}</strong> (x{Math.max(0, numInterspaces - 1)})
            </p>
          </div>

          {/* Decompression & Laminectomy (NCCI Bundling Trap) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                3. Laminectomy / Canal Decompression (CPT 63047)
              </label>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                High Audit Target
              </span>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="decompression"
                  checked={decompressionType === 'none'}
                  onChange={() => setDecompressionType('none')}
                  className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">No separate decompression billed</span>
                  <p className="text-[11px] text-slate-500">Decompression only incidental to fusion discectomy</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer ${
                decompressionType === 'same_level'
                  ? 'border-rose-300 bg-rose-50/60'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="decompression"
                  checked={decompressionType === 'same_level'}
                  onChange={() => setDecompressionType('same_level')}
                  className="text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-900">Billed at same interspace as fusion</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded">
                      NCCI Bundled!
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    63047 billed with 22633 or 22551 at same surgical site (Triggers denial / recoupment)
                  </p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer ${
                decompressionType === 'separate_level'
                  ? 'border-emerald-300 bg-emerald-50/60'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="decompression"
                  checked={decompressionType === 'separate_level'}
                  onChange={() => setDecompressionType('separate_level')}
                  className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-900">Billed at distinct non-fusion level</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded">
                      Modifier 59 / XS
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Separate spinal segment with documented canal stenosis requiring decompression
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Co-Surgeon Modifier 62 and Instrumentation Setup */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              4. Co-Surgery & Instrumentation Auditing
            </label>

            {/* Co-Surgeon Toggle */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-slate-800">
                  Two Surgeons / Co-Surgeon Case (Modifier -62)
                </span>
                <input
                  type="checkbox"
                  checked={isCoSurgeonCase}
                  onChange={(e) => setIsCoSurgeonCase(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </label>
              <p className="text-[11px] text-slate-500">
                E.g. General/Vascular access surgeon performing anterior exposure + Spine surgeon performing arthrodesis.
              </p>

              {isCoSurgeonCase && (
                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyMod62ToInstrumentation}
                      onChange={(e) => setApplyMod62ToInstrumentation(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                    />
                    <span className="text-rose-700 font-semibold">
                      Test Compliance Error: Bill Modifier -62 on Instrumentation (+22842 / +22845)
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Instrumentation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Posterior Rod/Screw Fixation
                </label>
                <select
                  value={posteriorInstrumentation}
                  onChange={(e) => setPosteriorInstrumentation(e.target.value as any)}
                  className="w-full text-xs font-semibold p-2 bg-white border border-slate-300 rounded-md focus:ring-indigo-500"
                >
                  <option value="none">None</option>
                  <option value="segmental_3_6">+22842 Segmental (3-6 segments)</option>
                  <option value="non_segmental">+22840 Non-segmental</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-center">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anteriorInstrumentation}
                    onChange={(e) => setAnteriorInstrumentation(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>+22845 Anterior Plate</span>
                </label>
                <span className="text-[11px] text-slate-500 mt-1">2 to 3 vertebral segments</span>
              </div>
            </div>

            {/* Biomechanical Cage */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 cursor-pointer block">
                  +22853 Interbody Biomechanical Cage / PEEK Device
                </label>
                <p className="text-[11px] text-slate-500">1 unit per interspace ({numInterspaces} units total)</p>
              </div>
              <input
                type="checkbox"
                checked={includeBiomechCage}
                onChange={(e) => setIncludeBiomechCage(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
            </div>
          </div>

          {/* Bone Grafts & Biologics */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                5. Bone Grafts & Biologics
              </label>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                Add-on Codes (No Mod 51)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeLocalAutograft}
                  onChange={(e) => setIncludeLocalAutograft(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div>
                  <span className="font-bold text-slate-800">+20936 Local Autograft</span>
                  <p className="text-[10px] text-slate-500">Harvested from laminectomy site</p>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeMorselizedAllograft}
                  onChange={(e) => setIncludeMorselizedAllograft(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div>
                  <span className="font-bold text-slate-800">+20930 Morselized Allograft</span>
                  <p className="text-[10px] text-slate-500">DBM or allograft matrix</p>
                </div>
              </label>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={applyMod51ToGrafts}
                onChange={(e) => setApplyMod51ToGrafts(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
              />
              <span className="text-amber-800 text-[11px] font-semibold">
                Test Compliance Error: Apply Modifier -51 to Bone Graft Add-on Codes
              </span>
            </label>
          </div>

          {/* Navigation & Neuromonitoring */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              6. Navigation & Intraoperative Neuromonitoring
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeNavigation}
                  onChange={(e) => setIncludeNavigation(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div>
                  <span className="font-bold text-slate-800">+61783 Stereotactic Navigation</span>
                  <p className="text-[10px] text-slate-500">Spinal volumetric navigation</p>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeIonm}
                  onChange={(e) => setIncludeIonm(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div>
                  <span className="font-bold text-slate-800">95940 IONM Monitoring</span>
                  <p className="text-[10px] text-slate-500">In-room SSEP / MEP monitoring</p>
                </div>
              </label>
            </div>
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
              <span className="text-[10px] text-slate-500">Standard fee schedule</span>
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
              <span className="text-[10px] text-rose-600">Bundling & clawback risk</span>
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
                  100% NCCI & Modifier -62 Compliant Episode
                </h4>
                <p className="text-xs text-emerald-800">
                  All CPT primary arthrodesis, add-on levels, instrumentation, and bone graft add-ons meet CMS Chapter IV spine surgical guidelines.
                </p>
              </div>
            </div>
          )}

          {/* Line-by-Line Claim Scrubber Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Scrubbed Surgical Claim Lines ({auditResults.lines.length})
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
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            mod.includes('INVALID') || mod.includes('UNNECESSARY')
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
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
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
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
      <div className="mt-8 p-5 bg-indigo-50/70 border border-indigo-200 rounded-xl">
        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 mb-2">
          <Info className="w-4 h-4 text-indigo-600" />
          AANS / AAOS & CMS Spine Surgery Coding Rules
        </h4>
        <ul className="text-xs text-indigo-950 space-y-1.5 list-disc list-inside leading-relaxed">
          <li>
            <strong>Combined Interbody & Posterolateral (22633):</strong> Includes posterior decompression (laminectomy/facetectomy) and discectomy performed at the same level. Do NOT bill 63047 or 63075 at the same interspace.
          </li>
          <li>
            <strong>Modifier -62 Co-Surgery Limits:</strong> Permitted on primary interbody arthrodesis (22558, 22551) when two surgeons of distinct specialties (e.g. vascular access + neurosurgery/orthopedics) co-perform. <strong>Never</strong> append Modifier 62 to instrumentation (+22845, +22842) or bone graft codes.
          </li>
          <li>
            <strong>Add-on Graft Codes (+20930, +20936):</strong> Are exempt from modifier 51 multiple procedure reductions. Local bone collected during laminectomy must be reported with +20936, not structural graft codes (+20931).
          </li>
        </ul>
      </div>

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bone className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-lg text-slate-900 font-jakarta">
                  Spine Surgical Revenue Cycle Audit
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
                  Kiran and the Aethera Spine RCM surgical audit team have received your clinical simulation. We will deliver your bespoke multi-level instrumentation optimization protocol within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Have our certified surgical coding specialists review your complex spine operative reports, prior authorization denials, and co-surgeon documentation to recoup lost revenue.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Dr. Marcus Vance, MD / Practice Administrator"
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="mvance@spinesurgeryassociates.com"
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Practice / Health System</label>
                  <input
                    type="text"
                    required
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="Comprehensive Spine & Neurosurgery Institute"
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specific Denials or Operative Challenges</label>
                  <textarea
                    rows={3}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="E.g. Payers denying CPT 63047 when billed with TLIF 22633 or clawing back Modifier 62 ALIF co-surgery..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Audit Dossier...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Transmit Spine Surgical Audit Request
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Direct confidential transmission to Kiran &amp; senior billing leadership. Zero PHI retention.
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
