'use client';

import React, { useState, useMemo } from 'react';
import {
  Smile,
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

export default function PediatricFacialReanimationScrubber() {
  // 1. Surgical Strategy & Stage Selection
  const [reanimationStrategy, setReanimationStrategy] = useState<
    'stage1_cfng' | 'stage2_gracilis_cfng' | 'single_stage_masseteric' | 'dual_innervation'
  >('dual_innervation');

  // 2. Stage 1 Cross-Face Sural Nerve Grafting (64890 / +64891)
  const [hasSuralNerveHarvestDoc, setHasSuralNerveHarvestDoc] = useState<boolean>(true);
  const [nerveGraftSegments, setNerveGraftSegments] = useState<number>(2); // 1 primary + 2 add-on units (12 cm total)

  // 3. Staged Procedure Modifier -58 (for Stage 2)
  const [hasModifier58Staged, setHasModifier58Staged] = useState<boolean>(true);
  const [hasStagedPlanDocumented, setHasStagedPlanDocumented] = useState<boolean>(true);

  // 4. Concomitant Masseteric Motor Nerve Transposition (64864)
  const [hasMassetericTransposition, setHasMassetericTransposition] = useState<boolean>(true);
  const [hasModifier51Masseteric, setHasModifier51Masseteric] = useState<boolean>(true);

  // 5. Operating Microscope Add-On (+69990)
  const [hasMicroscopeAddon, setHasMicroscopeAddon] = useState<boolean>(true);
  const [hasMicrovascularDoc, setHasMicrovascularDoc] = useState<boolean>(true);

  // 6. Autologous Fascia Lata / Tendon Suspension (+20926)
  const [hasFasciaLataSuspension, setHasFasciaLataSuspension] = useState<boolean>(true);
  const [hasSeparateFasciaIncision, setHasSeparateFasciaIncision] = useState<boolean>(true);

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

    // --- STAGE 1: CROSS-FACE SURAL NERVE GRAFT (CFNG) ---
    if (reanimationStrategy === 'stage1_cfng') {
      const baseRvu = 14.8;
      const baseFee = 1380.0;
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: '64890',
        desc: 'Nerve graft (includes obtaining graft), single strand, hand or foot, or other peripheral nerve; up to 4 cm (sural nerve to facial nerve)',
        mod: 'None',
        rvu: baseRvu,
        fee: baseFee,
        status: 'clean',
        note: 'Cross-face nerve graft (CFNG). Harvest of sural nerve and end-to-side coaptation to contralateral healthy buccal/zygomatic branch.',
      });

      // Add-on units for nerve length across upper lip tunnel
      if (nerveGraftSegments > 0) {
        const addonRvu = 5.2 * nerveGraftSegments;
        const addonFee = 480.0 * nerveGraftSegments;
        totalRvu += addonRvu;
        expectedReimbursement += addonFee;

        lines.push({
          code: `+64891 x${nerveGraftSegments}`,
          desc: `Nerve graft, single strand, each additional 4 cm length (${nerveGraftSegments * 4} cm additional length across facial tunnel)`,
          mod: 'Add-on',
          rvu: addonRvu,
          fee: addonFee,
          status: 'clean',
          note: `Clean add-on: Extended sural nerve cable graft totaling ${4 + nerveGraftSegments * 4} cm tunneled through upper lip to paralyzed cheek.`,
        });
      }

      if (hasSuralNerveHarvestDoc) {
        alerts.push({
          type: 'clean',
          title: 'Sural Nerve Donor Harvest Included in 64890',
          desc: 'AMA CPT descriptors for 64890/64891 include nerve harvest. Defends against improper clearinghouse bundling or unbundling audits.',
          statute: 'CPT Assistant; AMA CPT Guidelines for Nervous System',
        });
      } else {
        alerts.push({
          type: 'warning',
          title: 'Donor Site Harvest Documentation Warning',
          desc: 'Operative notes must detail separate calf incision for sural nerve harvest to validate multi-segment cable length (+64891).',
          statute: 'CMS NCCI Policy Manual Ch. VIII Section C',
        });
      }
    }

    // --- STAGE 2 OR SINGLE-STAGE FREE GRACILIS FLAP (15756) ---
    if (
      reanimationStrategy === 'stage2_gracilis_cfng' ||
      reanimationStrategy === 'single_stage_masseteric' ||
      reanimationStrategy === 'dual_innervation'
    ) {
      const flapRvu = 41.25;
      const flapFee = 3850.0;
      totalRvu += flapRvu;
      expectedReimbursement += flapFee;

      const isStage2 =
        reanimationStrategy === 'stage2_gracilis_cfng' ||
        reanimationStrategy === 'dual_innervation';

      if (isStage2) {
        if (hasModifier58Staged && hasStagedPlanDocumented) {
          lines.push({
            code: '15756',
            desc: 'Free muscle or myocutaneous flap with microvascular anastomosis (microneurovascular free gracilis transfer)',
            mod: '58',
            rvu: flapRvu,
            fee: flapFee,
            status: 'clean',
            note: 'Clean staged transfer: Modifier -58 appended. Microvascular free gracilis flap inset to modiolus and zygoma with facial artery/vein anastomosis.',
          });

          alerts.push({
            type: 'clean',
            title: 'Staged Modifier -58 Protection Validated',
            desc: 'Modifier -58 explicitly exempts Stage 2 free gracilis transfer from 90-day global surgery post-op bundling of the Stage 1 nerve graft.',
            statute: 'CMS Claim Processing Manual Ch. 12 Section 40.1; Modifier 58 Rules',
          });
        } else {
          penaltyAtRisk += flapFee;

          lines.push({
            code: '15756',
            desc: 'Free muscle flap with microvascular anastomosis',
            mod: 'None',
            rvu: flapRvu,
            fee: flapFee,
            status: 'fatal',
            note: 'FATAL GLOBAL PERIOD REJECTION: Stage 2 free muscle transfer billed without Modifier -58. Payers will reject as inclusive of Stage 1 global.',
          });

          alerts.push({
            type: 'fatal',
            title: 'Missing Staged Modifier -58 on Stage 2 Transfer',
            desc: 'Commercial payers automatically deny second-stage facial reanimation if performed within 90 days of prior surgical intervention unless Modifier -58 is present.',
            statute: 'CMS NCCI Global Surgery Policy; CARC 97 / B15 Denials',
          });
        }
      } else {
        // Single-stage masseteric
        lines.push({
          code: '15756',
          desc: 'Free muscle flap with microvascular anastomosis (single-stage gracilis reanimation)',
          mod: 'None',
          rvu: flapRvu,
          fee: flapFee,
          status: 'clean',
          note: 'Primary single-stage dynamic facial reanimation. Free gracilis flap with masseteric motor nerve innervation.',
        });
      }

      // --- MASSETERIC MOTOR NERVE TRANSPOSITION (64864) ---
      const needsMasseteric =
        reanimationStrategy === 'single_stage_masseteric' ||
        reanimationStrategy === 'dual_innervation';

      if (needsMasseteric && hasMassetericTransposition) {
        const nerveRvu = 16.8 * 0.5; // 50% multiple procedure reduction
        const nerveFee = 1550.0 * 0.5;

        if (hasModifier51Masseteric) {
          totalRvu += nerveRvu;
          expectedReimbursement += nerveFee;

          lines.push({
            code: '64864',
            desc: 'Transposition and/or transposition of facial and motor nerve (masseteric nerve branch of V3 to gracilis obturator nerve)',
            mod: '51',
            rvu: nerveRvu,
            fee: nerveFee,
            status: 'clean',
            note: 'Clean neurotization: Subzygomatic dissection of masseteric nerve branch and tension-free coaptation with Modifier -51 appended.',
          });

          alerts.push({
            type: 'clean',
            title: 'Masseteric Nerve Transposition (64864-51) Defended',
            desc: 'Motor nerve transposition (V-to-VII / masseteric) is separately reportable from the free gracilis muscle flap (15756) under NCCI guidelines.',
            statute: 'AMA CPT Assistant Oct 2022; NCCI Chapter VIII Nervous System',
          });
        } else {
          totalRvu += nerveRvu;
          penaltyAtRisk += nerveFee;

          lines.push({
            code: '64864',
            desc: 'Transposition of facial/motor nerve',
            mod: 'None',
            rvu: nerveRvu,
            fee: nerveFee,
            status: 'warning',
            note: 'UNBUNDLING RISK: Missing Modifier -51 or -59; commercial payers will bundle nerve transposition as inherent to free muscle coaptation.',
          });

          alerts.push({
            type: 'warning',
            title: 'Masseteric Nerve Transposition Bundling Alert',
            desc: 'Payers attempt to bundle 64864 into 15756. Documentation must explicitly state separate deep subzygomatic nerve dissection.',
            statute: 'NCCI Edits Policy Manual Ch. I Section G',
          });
        }
      }

      // --- OPERATING MICROSCOPE ADD-ON (+69990) ---
      if (hasMicroscopeAddon) {
        const scopeRvu = 3.48;
        const scopeFee = 320.0;

        if (hasMicrovascularDoc) {
          totalRvu += scopeRvu;
          expectedReimbursement += scopeFee;

          lines.push({
            code: '+69990',
            desc: 'Microsurgical techniques, requiring use of operating microscope (list separately in addition to code for primary procedure)',
            mod: 'Add-on',
            rvu: scopeRvu,
            fee: scopeFee,
            status: 'clean',
            note: 'Clean microsurgical add-on: Operating microscope used for 9-0 / 10-0 nylon microvascular anastomoses (facial vessels) and epineurial neurorrhaphy.',
          });

          alerts.push({
            type: 'clean',
            title: 'Operating Microscope (+69990) Supported with 15756',
            desc: 'Under CMS NCCI rules, CPT +69990 is fully payable with free tissue flap 15756 when microsurgical vascular anastomosis is documented.',
            statute: 'CMS NCCI Policy Manual Ch. VIII Section E; MM6310',
          });
        } else {
          penaltyAtRisk += scopeFee;

          lines.push({
            code: '+69990',
            desc: 'Microsurgical techniques, operating microscope',
            mod: 'Add-on',
            rvu: scopeRvu,
            fee: scopeFee,
            status: 'warning',
            note: 'INSUFFICIENT DOCUMENTATION: Note mentions loupe magnification or fails to document operating microscope microdissection steps.',
          });

          alerts.push({
            type: 'warning',
            title: 'Operating Microscope (+69990) Loupe Downgrade Risk',
            desc: 'Payers reject +69990 if surgical loupes are used. The operative note must explicitly specify the operating microscope was brought onto the surgical field.',
            statute: 'CPT Assistant; CMS Transmittal 1879',
          });
        }
      }

      // --- AUTOLOGOUS FASCIA LATA / MODIOLUS TENDON SUSPENSION (+20926) ---
      if (hasFasciaLataSuspension) {
        const fasciaRvu = 8.5;
        const fasciaFee = 790.0;

        if (hasSeparateFasciaIncision) {
          totalRvu += fasciaRvu;
          expectedReimbursement += fasciaFee;

          lines.push({
            code: '20926',
            desc: 'Tissue grafts, other (autologous fascia lata harvest for dynamic oral commissure / modiolus tendon suspension)',
            mod: '59',
            rvu: fasciaRvu,
            fee: fasciaFee,
            status: 'clean',
            note: 'Clean tendon sling: Harvested via distinct lateral thigh incision with Modifier -59/XS appended to prevent NCCI bundling into gracilis harvest.',
          });

          alerts.push({
            type: 'clean',
            title: 'Fascia Lata Harvest (+20926-59) Validated',
            desc: 'Autologous fascia lata harvest for modiolus suspension through an independent thigh incision is separately reportable with Modifier -59/XS.',
            statute: 'CPT Assistant; CMS NCCI Separate Anatomical Site Rules',
          });
        } else {
          penaltyAtRisk += fasciaFee;

          lines.push({
            code: '20926',
            desc: 'Tissue grafts, other (fascia lata harvest)',
            mod: 'None',
            rvu: fasciaRvu,
            fee: fasciaFee,
            status: 'fatal',
            note: 'FATAL BUNDLING: Billed without Modifier -59/XS or without documentation of separate thigh incision; bundled into free gracilis flap.',
          });

          alerts.push({
            type: 'fatal',
            title: 'Fascia Lata Harvest Bundled into Gracilis Flap',
            desc: 'Clearinghouses automatically bundle 20926 into 15756 unless Modifier -59 or -XS is appended with explicit separate donor incision notes.',
            statute: 'CMS NCCI Policy Manual Ch. IV Section B',
          });
        }
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
    reanimationStrategy,
    hasSuralNerveHarvestDoc,
    nerveGraftSegments,
    hasModifier58Staged,
    hasStagedPlanDocumented,
    hasMassetericTransposition,
    hasModifier51Masseteric,
    hasMicroscopeAddon,
    hasMicrovascularDoc,
    hasFasciaLataSuspension,
    hasSeparateFasciaIncision,
  ]);

  // ANSI 837P EDI Generator
  const generateEdiClaim = () => {
    const claimDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let edi = `ISA*00*          *00*          *ZZ*SUBMITTER      *ZZ*PAYER          *${claimDate.slice(2)}*1200*^*00501*000000001*0*P*:~\n`;
    edi += `GS*HC*SUBMITTER*PAYER*${claimDate}*1200*1*X*005010X222A1~\n`;
    edi += `ST*837*0001*005010X222A1~\n`;
    edi += `BHT*0019*00*REF${claimDate}*${claimDate}*1200*CH~\n`;
    edi += `NM1*85*2*PEDIATRIC CRANIOFACIAL MICROSURGERY*****XX*1977777772~\n`;
    edi += `NM1*IL*1*AVERY*MIA****MI*FACIAL7729101~\n`;
    edi += `CLM*PEDS-FACIAL-${claimDate}*${scrubberResult.expectedReimbursement.toFixed(2)}***11:B:1*Y*A*Y*Y~\n`;

    scrubberResult.lines.forEach((l, idx) => {
      const cleanMod = l.mod.replace(/[^0-9A-Z]/g, '');
      const modSegment = cleanMod && cleanMod !== 'None' && cleanMod !== 'Addon' ? `:${cleanMod}` : '';
      edi += `LX*${idx + 1}~\n`;
      edi += `SV1*HC:${l.code.split(' ')[0].replace('+', '')}${modSegment}*${l.fee.toFixed(2)}*UN*1***1~\n`;
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
        reanimationStrategy,
        hasSuralNerveHarvestDoc,
        nerveGraftSegments,
        hasModifier58Staged,
        hasStagedPlanDocumented,
        hasMassetericTransposition,
        hasModifier51Masseteric,
        hasMicroscopeAddon,
        hasFasciaLataSuspension,
        expectedReimbursement: scrubberResult.expectedReimbursement,
        penaltyAtRisk: scrubberResult.penaltyAtRisk,
        totalRvu: scrubberResult.totalRvu,
        contactName,
        contactEmail,
        practiceName,
        auditNotes,
      };

      await sendLeadToKiran('pediatric_facial_rcm_audit', payload);
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
      <div className="bg-gradient-to-r from-violet-950 via-slate-900 to-fuchsia-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-violet-900/40 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold mb-3 border border-fuchsia-500/30">
              <Smile className="h-3.5 w-3.5" />
              <span>Tool #67 · Pediatric Facial Reanimation &amp; Microsurgery Scrubber</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pediatric Facial Reanimation &amp; Free Gracilis Scrubber
            </h2>
            <p className="text-fuchsia-100/80 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
              Audit dynamic smile reconstruction for congenital Moebius syndrome and pediatric facial paralysis. Validate
              staged Modifier -58 on Stage 2 free gracilis transfer (15756), defend masseteric transposition (64864-51), and protect +69990.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLeadModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Send className="h-4 w-4" />
              <span>Request Facial Microsurgery Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Total Work RVUs</span>
            <Activity className="h-4 w-4 text-fuchsia-600" />
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
          <div className="text-xs text-slate-500 mt-1">Clean claim modeled commercial rate</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            <span>At-Risk Revenue</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            ${scrubberResult.penaltyAtRisk.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Clawbacks from global bundling &amp; unbundling</div>
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
          {/* Section 1: Reanimation Strategy & Surgical Stage */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Smile className="h-5 w-5 text-fuchsia-600" />
              1. Surgical Reanimation Strategy &amp; Staging
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'stage1_cfng',
                  title: 'Stage 1: Cross-Face Sural Nerve Graft (CFNG)',
                  desc: 'Sural nerve harvest & coaptation to contralateral facial nerve. (64890 + 64891)',
                },
                {
                  id: 'stage2_gracilis_cfng',
                  title: 'Stage 2: Free Gracilis Innervated by CFNG',
                  desc: 'Microvascular gracilis transfer 6-9 months later with staged Modifier -58. (15756-58)',
                },
                {
                  id: 'single_stage_masseteric',
                  title: 'Single-Stage: Gracilis with Masseteric Nerve',
                  desc: 'Immediate motor power via V3 masseteric nerve transposition. (15756 + 64864-51)',
                },
                {
                  id: 'dual_innervation',
                  title: 'Dual-Innervation: CFNG + Masseteric V3',
                  desc: 'Spontaneous smile + powerful excursion combining CFNG and masseteric transfer.',
                },
              ].map((strat) => (
                <button
                  key={strat.id}
                  type="button"
                  onClick={() => setReanimationStrategy(strat.id as any)}
                  className={`p-3.5 text-left rounded-xl border transition-all ${
                    reanimationStrategy === strat.id
                      ? 'border-fuchsia-500 bg-fuchsia-50/60 text-slate-900 font-semibold shadow-sm ring-1 ring-fuchsia-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="font-semibold text-sm">{strat.title}</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">{strat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Stage 1 Sural Nerve Details (if Stage 1) */}
          {reanimationStrategy === 'stage1_cfng' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Scissors className="h-5 w-5 text-indigo-600" />
                2. Cross-Face Sural Nerve Graft Length &amp; Harvest (64890 / +64891)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Additional 4-cm Nerve Graft Units (+64891 Add-on)
                  </label>
                  <div className="flex items-center gap-3">
                    {[0, 1, 2, 3].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setNerveGraftSegments(val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          nerveGraftSegments === val
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        +{val} ({4 + val * 4} cm total)
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSuralNerveHarvestDoc}
                    onChange={(e) => setHasSuralNerveHarvestDoc(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-800">
                      Document separate lower extremity incision for sural nerve harvest
                    </span>
                    <p className="text-xs text-slate-500">
                      Sural nerve harvest is bundled into 64890 by definition, but separate donor site details protect +64891 length add-on units.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Section 3: Stage 2 Staged Modifier -58 Enforcement */}
          {(reanimationStrategy === 'stage2_gracilis_cfng' ||
            reanimationStrategy === 'dual_innervation') && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                2. Staged Procedure Modifier -58 Defense
              </h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasModifier58Staged}
                    onChange={(e) => setHasModifier58Staged(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-800">
                      Append Modifier -58 (Staged Procedure) to Free Gracilis Flap (15756-58)
                    </span>
                    <p className="text-xs text-slate-500">
                      Exempts the second-stage microsurgical muscle transfer from the postoperative global period of Stage 1.
                    </p>
                  </div>
                </label>

                <div className="pl-6 border-l-2 border-emerald-200 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasStagedPlanDocumented}
                      onChange={(e) => setHasStagedPlanDocumented(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      Initial operative note explicitly documented that Stage 2 free muscle transfer was a planned staged component
                    </span>
                  </label>
                  {(!hasModifier58Staged || !hasStagedPlanDocumented) && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      Fatal: Commercial payers will deny the entire $3,850.00 free flap (15756) as inclusive of the Stage 1 global period without Modifier -58 and prior plan documentation.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Concomitant Masseteric Motor Transposition (64864) */}
          {(reanimationStrategy === 'single_stage_masseteric' ||
            reanimationStrategy === 'dual_innervation') && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-teal-600" />
                3. Masseteric Motor Nerve Transposition (64864)
              </h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMassetericTransposition}
                    onChange={(e) => setHasMassetericTransposition(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-800">
                      Perform Subzygomatic Masseteric Nerve Transposition (CPT 64864)
                    </span>
                    <p className="text-xs text-slate-500">
                      Dissection of motor branch of CN V3 and coaptation to anterior branch of gracilis obturator nerve.
                    </p>
                  </div>
                </label>

                {hasMassetericTransposition && (
                  <div className="pl-6 border-l-2 border-teal-200 space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasModifier51Masseteric}
                        onChange={(e) => setHasModifier51Masseteric(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Append Multiple Procedure Modifier -51 to secondary nerve transposition</span>
                    </label>
                    {!hasModifier51Masseteric && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        Warning: Payers will attempt to bundle 64864 into the free flap (15756) as routine neurotization unless Modifier -51 is appended.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Operating Microscope Add-On (+69990) */}
          {reanimationStrategy !== 'stage1_cfng' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                4. Operating Microscope Microvascular Add-On (+69990)
              </h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMicroscopeAddon}
                    onChange={(e) => setHasMicroscopeAddon(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-800">
                      Report Operating Microscope Add-On (+69990)
                    </span>
                    <p className="text-xs text-slate-500">
                      Microvascular arterial/venous anastomosis and epineurial microneural coaptation under microscope magnification. (3.48 wRVUs)
                    </p>
                  </div>
                </label>

                {hasMicroscopeAddon && (
                  <div className="pl-6 border-l-2 border-amber-200 space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasMicrovascularDoc}
                        onChange={(e) => setHasMicrovascularDoc(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>
                        Operative report specifically documents operating microscope brought into field for microvascular anastomoses
                      </span>
                    </label>
                    {!hasMicrovascularDoc && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        Warning: Surgical loupes do not qualify for +69990. Operating microscope must be specified.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 6: Fascia Lata / Modiolus Sling (+20926) */}
          {reanimationStrategy !== 'stage1_cfng' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-600" />
                5. Autologous Fascia Lata / Modiolus Suspension (+20926-59)
              </h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFasciaLataSuspension}
                    onChange={(e) => setHasFasciaLataSuspension(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-800">
                      Autologous Fascia Lata Tendon Harvest &amp; Suspension (CPT 20926)
                    </span>
                    <p className="text-xs text-slate-500">
                      Harvested to anchor modiolus and suspend oral commissure to prevent oral incompetence. (8.50 wRVUs)
                    </p>
                  </div>
                </label>

                {hasFasciaLataSuspension && (
                  <div className="pl-6 border-l-2 border-purple-200 space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasSeparateFasciaIncision}
                        onChange={(e) => setHasSeparateFasciaIncision(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>
                        Document separate lateral thigh incision and append Modifier -59 or -XS to CPT 20926
                      </span>
                    </label>
                    {!hasSeparateFasciaIncision && (
                      <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        Fatal: Without Modifier -59/XS, payers bundle fascia harvest into gracilis muscle procurement.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
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
                        <span className="px-1.5 py-0.5 rounded bg-fuchsia-100 text-fuchsia-800 text-[11px] font-mono">
                          -{line.mod}
                        </span>
                      )}
                      {line.mod === 'Add-on' && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[11px] font-mono">
                          Add-on
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
                <span className="text-xl font-black text-fuchsia-600">
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

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-700 text-xs font-semibold mb-3 border border-fuchsia-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Free Pediatric Microsurgery Coding Audit</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Request Full Practice Microsurgical RCM Review
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Our certified pediatric plastic &amp; reconstructive microsurgery coders will audit your facial reanimation
              claims, defend staged Modifier -58 submissions, and overturn unbundling denials.
            </p>

            {leadSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center text-emerald-800">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-base">Audit Request Received</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Kiran and the Aethera surgical coding team will inspect your facial reanimation claim telemetry and follow up within 24 hours.
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
                    placeholder="Dr. Samantha Chen, MD / Surgical Director"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
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
                    placeholder="s.chen@childrensplastics.org"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Practice / Children&apos;s Hospital Name
                  </label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="Pediatric Craniofacial & Plastic Surgery Center"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
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
                    placeholder="E.g., Global period clawbacks on Stage 2 free gracilis transfer, commercial denials on masseteric transposition 64864."
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
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
