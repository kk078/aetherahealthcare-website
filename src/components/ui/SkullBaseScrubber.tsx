'use client';

import React, { useState, useMemo } from 'react';
import {
  Brain,
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
  Eye,
  Crosshair,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function SkullBaseScrubber() {
  // 1. Skull Base Approach & Acoustic Neuroma Resection
  const [approachType, setApproachType] = useState<
    'translabyrinthine' | 'retrosigmoid' | 'middle_fossa'
  >('translabyrinthine');

  const [tumorComplexity, setTumorComplexity] = useState<
    'large_cpa_compression' | 'medium_iac_cpa' | 'intracanalicular_small'
  >('large_cpa_compression');

  // 2. Dual-Attending Co-Surgeon Modifier -62 Configuration
  const [coSurgeonMode, setCoSurgeonMode] = useState<
    'compliant_matching_62' | 'mismatched_codes' | 'missing_mod62' | 'solo_surgeon'
  >('compliant_matching_62');

  const [surgeonRole, setSurgeonRole] = useState<'neurotology' | 'neurosurgery'>(
    'neurotology'
  );

  // 3. Operating Microscope Add-On (+69990)
  const [hasMicroscopeAddon, setHasMicroscopeAddon] = useState<boolean>(true);
  const [microdissectionDocumented, setMicrodissectionDocumented] = useState<boolean>(true);

  // 4. Continuous Intraoperative Cranial Nerve Neuromonitoring (IONM)
  const [hasCranialNerveMonitoring, setHasCranialNerveMonitoring] = useState<boolean>(true);
  const [dedicatedNeurophysiologist, setDedicatedNeurophysiologist] = useState<boolean>(true);

  // 5. Autologous Fat Graft Harvest for Skull Base Dural Defect (20926)
  const [hasFatGraftHarvest, setHasFatGraftHarvest] = useState<boolean>(true);
  const [distinctIncisionDocumented, setDistinctIncisionDocumented] = useState<boolean>(true);

  // 6. Postoperative Staged CSF Leak Repair / Re-exploration
  const [hasStagedReexploration, setHasStagedReexploration] = useState<boolean>(false);
  const [hasModifier58or78, setHasModifier58or78] = useState<boolean>(true);

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

    const isCoSurgeon = coSurgeonMode === 'compliant_matching_62';
    const isMismatched = coSurgeonMode === 'mismatched_codes';
    const isMissing62 = coSurgeonMode === 'missing_mod62';
    const isSolo = coSurgeonMode === 'solo_surgeon';

    const coSurgeonMultiplier = isCoSurgeon ? 0.625 : 1.0;

    // --- 1. PRIMARY SKULL BASE APPROACH & RESECTION ---
    let primaryCode = '61526';
    let primaryDesc = 'Translabyrinthine approach, acoustic neuroma resection';
    let baseRvu = 68.4;
    let baseFee = 5820.0;

    if (approachType === 'retrosigmoid') {
      primaryCode = '61530';
      primaryDesc = 'Retrosigmoid / suboccipital approach, acoustic neuroma resection';
      baseRvu = 62.1;
      baseFee = 5290.0;
    } else if (approachType === 'middle_fossa') {
      primaryCode = '61590';
      primaryDesc = 'Infratemporal / middle cranial fossa approach, skull base lesion';
      baseRvu = 58.7;
      baseFee = 4980.0;
    }

    if (isCoSurgeon) {
      const allowedFee = baseFee * coSurgeonMultiplier;
      const billedRvu = Number((baseRvu * coSurgeonMultiplier).toFixed(1));
      totalRvu += billedRvu;
      expectedReimbursement += allowedFee;

      lines.push({
        code: primaryCode,
        desc: `${primaryDesc} (${surgeonRole === 'neurotology' ? 'Neurotology' : 'Neurosurgery'} Co-Surgeon)`,
        mod: '62',
        rvu: billedRvu,
        fee: allowedFee,
        status: 'clean',
        note: 'Modifier -62 properly appended with matching primary CPT and distinct dictated op notes.',
      });

      alerts.push({
        type: 'clean',
        title: 'Compliant Dual-Attending Co-Surgery (Modifier 62)',
        desc: `Both surgeons bill ${primaryCode}-62. Reimbursement is calculated at 62.5% of the fee schedule allowance (${allowedFee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}). Operative reports must detail independent surgical roles.`,
        statute: 'CMS IOM Pub. 100-04, Chapter 12, Section 40.8; AMA CPT Modifier -62 Guidelines',
      });
    } else if (isMismatched) {
      // Approach surgeon billed 61590/61526, resection billed 61605 without cross-pairing
      const allowedFee = baseFee * 0.625;
      const billedRvu = Number((baseRvu * 0.625).toFixed(1));
      totalRvu += billedRvu;
      penaltyAtRisk += baseFee; // Risk of complete denial for both surgeons

      lines.push({
        code: surgeonRole === 'neurotology' ? primaryCode : '61605',
        desc: `${primaryDesc} (Mismatched Code Pairing)`,
        mod: '62',
        rvu: billedRvu,
        fee: allowedFee,
        status: 'fatal',
        note: 'FATAL CLAIM REJECTION: Approach surgeon billed approach CPT while Resection surgeon billed resection CPT with non-matching codes under Mod 62.',
      });

      alerts.push({
        type: 'fatal',
        title: 'Mismatched Primary Codes on Co-Surgeon Claims',
        desc: `Clearinghouses and Medicare MACs reject claims when co-surgeons bill differing primary CPT codes under Modifier -62. Both surgeons must agree on the identical primary skull base code (e.g., ${primaryCode}-62) or bill paired approach/resection codes with exact matching.`,
        statute: 'Medicare Claims Processing Manual, Ch. 12 § 40.8(D); NCCI Policy Manual Ch. VIII',
      });
    } else if (isMissing62) {
      // One surgeon omitted Mod 62, billed 100% causing duplicate denial
      totalRvu += baseRvu;
      penaltyAtRisk += baseFee;

      lines.push({
        code: primaryCode,
        desc: `${primaryDesc} (Missing Modifier 62)`,
        mod: 'None',
        rvu: baseRvu,
        fee: baseFee,
        status: 'fatal',
        note: 'DUPLICATE CLAIM DENIAL: Billed at 100% without Modifier 62; second surgeon claim will trigger CARC 18 (Exact duplicate service).',
      });

      alerts.push({
        type: 'fatal',
        title: 'Modifier 62 Omission - Duplicate Claim Clawback Risk',
        desc: `Omitting Modifier -62 leads payers to treat the claim as a solo surgeon encounter. When the second surgeon submits their claim, it is immediately denied under CARC 18 (Duplicate claim), delaying tens of thousands in reimbursement.`,
        statute: 'CMS Claims Processing Manual Ch. 12 § 40.8; CARC 18 Disallowance',
      });
    } else {
      // Solo surgeon
      totalRvu += baseRvu;
      expectedReimbursement += baseFee;

      lines.push({
        code: primaryCode,
        desc: `${primaryDesc} (Solo Attending)`,
        mod: 'None',
        rvu: baseRvu,
        fee: baseFee,
        status: 'clean',
        note: 'Solo surgeon performing full approach and intradural tumor resection (100% allowance).',
      });
    }

    // --- 2. OPERATING MICROSCOPE ADD-ON (+69990) ---
    if (hasMicroscopeAddon) {
      const micFee = 540.0;
      const micRvu = 5.4;

      if (microdissectionDocumented) {
        totalRvu += micRvu;
        expectedReimbursement += micFee;

        lines.push({
          code: '+69990',
          desc: 'Microsurgical technique including operating microscope (List separately in addition to code for primary procedure)',
          mod: 'None',
          rvu: micRvu,
          fee: micFee,
          status: 'clean',
          note: 'Clean add-on: Detailed microdissection of tumor capsule away from facial nerve (CN VII) and brainstem documented.',
        });

        alerts.push({
          type: 'clean',
          title: 'Operating Microscope (+69990) Compliant',
          desc: 'Microdissection documentation under high-power optical magnification satisfies AMA CPT and CMS NCCI Chapter VIII exceptions for skull base acoustic neuroma dissection.',
          statute: 'AMA CPT Assistant Oct 2021; CMS NCCI Manual Ch. VIII, Sec. E',
        });
      } else {
        totalRvu += micRvu;
        penaltyAtRisk += micFee;

        lines.push({
          code: '+69990',
          desc: 'Microsurgical technique including operating microscope',
          mod: 'None',
          rvu: micRvu,
          fee: micFee,
          status: 'warning',
          note: 'AUDIT RISK: Operative report merely states microscope was "used for illumination/visualization" rather than microdissection.',
        });

        alerts.push({
          type: 'warning',
          title: 'Operating Microscope (+69990) Unbundling Audit',
          desc: 'Payers routinely recoup +69990 when notes describe the microscope solely for illumination or surgical visualization. Operative dictation must explicitly detail microdissection of the tumor from delicate neurovascular structures.',
          statute: 'NCCI Edits Policy on CPT +69990; OIG Work Plan Neurosurgical Microdissection',
        });
      }
    }

    // --- 3. INTRAOPERATIVE CRANIAL NERVE MONITORING (IONM 95940) ---
    if (hasCranialNerveMonitoring) {
      const ionmFee = 780.0;
      const ionmRvu = 7.6;

      if (dedicatedNeurophysiologist) {
        totalRvu += ionmRvu;
        expectedReimbursement += ionmFee;

        lines.push({
          code: '95940 x16',
          desc: 'Continuous intraoperative neurophysiology monitoring, from outside the OR or within the OR (15 min increments, 4 hours)',
          mod: 'None',
          rvu: ionmRvu,
          fee: ionmFee,
          status: 'clean',
          note: 'Clean IONM: Continuous real-time facial nerve (CN VII) EMG and BAEP monitoring performed by dedicated monitoring specialist.',
        });
      } else {
        penaltyAtRisk += ionmFee;

        lines.push({
          code: '95940 x16',
          desc: 'Continuous intraoperative neurophysiology monitoring',
          mod: 'None',
          rvu: ionmRvu,
          fee: ionmFee,
          status: 'fatal',
          note: 'PROHIBITED BILLING: Operating neurosurgeon or ENT attempted to bill continuous IONM (95940). NCCI prohibits primary operating surgeon from billing IONM.',
        });

        alerts.push({
          type: 'fatal',
          title: 'Primary Surgeon IONM Billing Prohibition',
          desc: 'Under CMS NCCI rules, the operating surgeon cannot bill baseline or continuous IONM codes (95940/95941). Monitoring must be billed by an independent, dedicated clinical neurophysiologist.',
          statute: 'CMS Medlearn Matters MM8050; NCCI Chapter XI Section H',
        });
      }
    }

    // --- 4. AUTOLOGOUS FAT GRAFT HARVEST FOR MASTOID OBLITERATION (20926) ---
    if (hasFatGraftHarvest) {
      const fatFee = 890.0;
      const fatRvu = 8.5;

      if (distinctIncisionDocumented) {
        totalRvu += fatRvu;
        expectedReimbursement += fatFee;

        lines.push({
          code: '20926',
          desc: 'Tissue grafts, other (e.g., paratenon, fat, dermis); autologous abdominal fat harvest for skull base defect',
          mod: '59',
          rvu: fatRvu,
          fee: fatFee,
          status: 'clean',
          note: 'Clean graft: Harvested from distinct abdominal incision with Modifier -59/XS, preventing CSF rhinorrhea/otorrhea.',
        });

        alerts.push({
          type: 'clean',
          title: 'Autologous Fat Graft Harvest (+20926-59) Defended',
          desc: 'Abdominal subcutaneous fat harvest through an independent surgical site is separately reportable when used to obliterate the translabyrinthine petrous defect to prevent post-op CSF leak.',
          statute: 'CPT Assistant; NCCI Separate Anatomical Site Modifier XS / 59 Rules',
        });
      } else {
        totalRvu += fatRvu;
        penaltyAtRisk += fatFee;

        lines.push({
          code: '20926',
          desc: 'Tissue grafts, other (autologous fat graft harvest)',
          mod: 'None',
          rvu: fatRvu,
          fee: fatFee,
          status: 'warning',
          note: 'UNBUNDLING REJECTION: Lacks Modifier 59 / XS or separate incision note; payer will bundle into craniectomy closure.',
        });

        alerts.push({
          type: 'warning',
          title: 'Autologous Fat Graft Unbundling Denial Risk',
          desc: 'Payers bundle CPT 20926 into primary skull base craniectomy unless Modifier 59 or XS is appended with explicit documentation of a separate incision in the abdomen or thigh.',
          statute: 'CMS NCCI Policy Manual Ch. IV & Ch. VIII',
        });
      }
    }

    // --- 5. STAGED POST-OP RE-EXPLORATION (CPT 61312) ---
    if (hasStagedReexploration) {
      const reopFee = 3200.0;
      const reopRvu = 38.2;

      if (hasModifier58or78) {
        totalRvu += reopRvu;
        expectedReimbursement += reopFee * 0.7; // Mod 78 reduces to intra-op rate (typically 70%)

        lines.push({
          code: '61312',
          desc: 'Craniectomy or craniotomy for evacuation of hematoma or CSF leak re-exploration within global',
          mod: '78',
          rvu: reopRvu,
          fee: reopFee * 0.7,
          status: 'clean',
          note: 'Proper Modifier -78 appended for unplanned return to the operating room for related procedure during global period.',
        });
      } else {
        totalRvu += reopRvu;
        penaltyAtRisk += reopFee;

        lines.push({
          code: '61312',
          desc: 'Craniectomy for evacuation of hematoma / CSF leak repair',
          mod: 'None',
          rvu: reopRvu,
          fee: reopFee,
          status: 'fatal',
          note: 'GLOBAL SURGICAL BUNDLING DENIAL: Re-exploration within 90-day global period submitted without Modifier 78 or 58.',
        });

        alerts.push({
          type: 'fatal',
          title: 'Post-Op Return to OR Missing Modifier 78/58',
          desc: 'Any secondary craniectomy or CSF leak repair within the 90-day global period of acoustic neuroma surgery is automatically rejected as inclusive care unless Modifier -78 (unplanned return to OR) or -58 (staged) is appended.',
          statute: 'CMS Claims Processing Manual Ch. 12 § 40.1; CARC 97 Global Surgery Edit',
        });
      }
    }

    return {
      lines,
      alerts,
      totalRvu: Number(totalRvu.toFixed(1)),
      expectedReimbursement: Number(expectedReimbursement.toFixed(2)),
      penaltyAtRisk: Number(penaltyAtRisk.toFixed(2)),
    };
  }, [
    approachType,
    tumorComplexity,
    coSurgeonMode,
    surgeonRole,
    hasMicroscopeAddon,
    microdissectionDocumented,
    hasCranialNerveMonitoring,
    dedicatedNeurophysiologist,
    hasFatGraftHarvest,
    distinctIncisionDocumented,
    hasStagedReexploration,
    hasModifier58or78,
  ]);

  // ANSI 837P EDI Generator
  const generateEdiClaim = () => {
    const claimDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let edi = `ISA*00*          *00*          *ZZ*SUBMITTER      *ZZ*PAYER          *${claimDate.slice(2)}*1200*^*00501*000000001*0*P*:~\n`;
    edi += `GS*HC*SUBMITTER*PAYER*${claimDate}*1200*1*X*005010X222A1~\n`;
    edi += `ST*837*0001*005010X222A1~\n`;
    edi += `BHT*0019*00*REF${claimDate}*${claimDate}*1200*CH~\n`;
    edi += `NM1*85*2*SKULL BASE SURGICAL ASSOCIATES*****XX*1999999992~\n`;
    edi += `NM1*IL*1*SMITH*JANE****MI*SKULL9918231~\n`;
    edi += `CLM*SKULL-${claimDate}*${scrubberResult.expectedReimbursement.toFixed(2)}***11:B:1*Y*A*Y*Y~\n`;

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
        approachType,
        tumorComplexity,
        coSurgeonMode,
        surgeonRole,
        hasMicroscopeAddon,
        hasCranialNerveMonitoring,
        hasFatGraftHarvest,
        hasStagedReexploration,
        expectedReimbursement: scrubberResult.expectedReimbursement,
        penaltyAtRisk: scrubberResult.penaltyAtRisk,
        totalRvu: scrubberResult.totalRvu,
        contactName,
        contactEmail,
        practiceName,
        auditNotes,
      };

      await sendLeadToKiran('skull_base_rcm_audit', payload);
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
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-sky-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-900/40 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <Brain className="h-3.5 w-3.5" />
              <span>Tool #64 · Skull Base &amp; Neurotology RCM Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-jakarta tracking-tight">
              Lateral Skull Base &amp; Acoustic Neuroma Scrubber
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
              Audit complex lateral skull base surgeries (CPT 61526, 61530, 61590), resolve dual-attending
              Modifier -62 co-surgeon discrepancies between ENT and neurosurgery, defend operating microscope
              (+69990) microdissection add-ons, and secure continuous facial nerve monitoring (95940).
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
            <Activity className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-jakarta">
              {scrubberResult.totalRvu}
            </span>
            <span className="text-xs text-slate-500">wRVUs</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {coSurgeonMode === 'compliant_matching_62'
              ? '62.5% Co-surgeon proportion'
              : 'Full procedure valuation'}
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
              ? 'At risk from duplicate edits or unbundling'
              : 'Zero identified denial exposure'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Audit Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 font-jakarta flex items-center gap-2 border-b border-slate-100 pb-3">
              <Crosshair className="h-5 w-5 text-indigo-600" />
              Surgical Approach &amp; Pathology
            </h2>

            {/* Approach Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Lateral Skull Base Approach
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setApproachType('translabyrinthine')}
                  className={`px-4 py-2.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                    approachType === 'translabyrinthine'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm">Translabyrinthine (CPT 61526)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Complete mastoidectomy, labyrinthectomy, skeletonizing facial nerve to IAC
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setApproachType('retrosigmoid')}
                  className={`px-4 py-2.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                    approachType === 'retrosigmoid'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm">Retrosigmoid / Suboccipital (CPT 61530)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Suboccipital craniectomy, cerebellar retraction, CPA hearing preservation
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setApproachType('middle_fossa')}
                  className={`px-4 py-2.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                    approachType === 'middle_fossa'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm">Middle Cranial Fossa (CPT 61590)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Temporal craniotomy, extradural petrous drilling for intracanalicular lesions
                  </div>
                </button>
              </div>
            </div>

            {/* Co-Surgeon Modifier -62 Configuration */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Dual-Attending Co-Surgeon (Modifier 62) Status
              </label>
              <select
                value={coSurgeonMode}
                onChange={(e) => setCoSurgeonMode(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="compliant_matching_62">
                  Compliant: Both ENT &amp; Neurosurgery Bill Matching Primary Code with Mod 62
                </option>
                <option value="mismatched_codes">
                  Payer Audit Risk: Non-Matching Primary CPT Codes Between Surgeons
                </option>
                <option value="missing_mod62">
                  Fatal Clawback Risk: Omitted Modifier 62 (Duplicate Claim Denial)
                </option>
                <option value="solo_surgeon">
                  Solo Surgeon Encounter (Single Attending Performs Full Procedure)
                </option>
              </select>
            </div>

            {/* Reporting Surgeon Role */}
            {coSurgeonMode !== 'solo_surgeon' && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Claim Submitter Specialty Perspective
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSurgeonRole('neurotology')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      surgeonRole === 'neurotology'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Neurotology / ENT
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurgeonRole('neurosurgery')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      surgeonRole === 'neurosurgery'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Neurosurgery
                  </button>
                </div>
              </div>
            )}

            {/* Microdissection (+69990) */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Operating Microscope (+69990)</span>
                <input
                  type="checkbox"
                  checked={hasMicroscopeAddon}
                  onChange={(e) => setHasMicroscopeAddon(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </h3>
              {hasMicroscopeAddon && (
                <div className="pl-3 border-l-2 border-indigo-200 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={microdissectionDocumented}
                      onChange={(e) => setMicrodissectionDocumented(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Operative report documents microdissection off cranial nerves</span>
                  </label>
                </div>
              )}
            </div>

            {/* Cranial Nerve Monitoring (IONM) */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Continuous Facial Nerve Monitoring (95940)</span>
                <input
                  type="checkbox"
                  checked={hasCranialNerveMonitoring}
                  onChange={(e) => setHasCranialNerveMonitoring(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </h3>
              {hasCranialNerveMonitoring && (
                <div className="pl-3 border-l-2 border-indigo-200 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dedicatedNeurophysiologist}
                      onChange={(e) => setDedicatedNeurophysiologist(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Billed by independent clinical neurophysiologist (not surgeon)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Autologous Fat Graft Harvest (20926) */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Autologous Fat Graft Harvest (CPT 20926)</span>
                <input
                  type="checkbox"
                  checked={hasFatGraftHarvest}
                  onChange={(e) => setHasFatGraftHarvest(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </h3>
              {hasFatGraftHarvest && (
                <div className="pl-3 border-l-2 border-indigo-200 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={distinctIncisionDocumented}
                      onChange={(e) => setDistinctIncisionDocumented(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Distinct abdominal incision documented with Modifier 59 / XS</span>
                  </label>
                </div>
              )}
            </div>

            {/* Staged Post-Op Re-exploration within Global */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Post-Op CSF Leak Repair / Re-exploration</span>
                <input
                  type="checkbox"
                  checked={hasStagedReexploration}
                  onChange={(e) => setHasStagedReexploration(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </h3>
              {hasStagedReexploration && (
                <div className="pl-3 border-l-2 border-indigo-200 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasModifier58or78}
                      onChange={(e) => setHasModifier58or78(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span>Append Modifier 78 (Unplanned return to OR) / 58 (Staged)</span>
                  </label>
                </div>
              )}
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
                <Layers className="h-4 w-4 text-indigo-600" />
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
                      <td className="py-3 px-4 font-mono font-bold text-indigo-950">
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
                <FileCode className="h-4 w-4 text-indigo-400" />
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
                  Request Skull Base RCM Audit
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct review by certified surgical neurotology coders (zero PHI retained).
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
                  Kiran and the senior surgical billing team have received your skull base audit profile.
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
                    placeholder="Dr. Jordan Ellis, MD / Practice Administrator"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-indigo-500"
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
                    placeholder="jordan.ellis@skullbaseclinic.org"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Practice or Hospital Institute Name
                  </label>
                  <input
                    type="text"
                    required
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="Skull Base & Acoustic Neuroma Surgical Center"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-indigo-500"
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
                    placeholder="Frequent Modifier 62 co-surgeon denials with commercial plans, microscope unbundling rejections..."
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-indigo-500"
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
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
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
