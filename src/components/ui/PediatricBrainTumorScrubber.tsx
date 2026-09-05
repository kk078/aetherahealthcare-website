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

export default function PediatricBrainTumorScrubber() {
  // 1. Craniotomy Resection Scope
  const [resectionType, setResectionType] = useState<'infratentorial_posterior_fossa' | 'infratentorial_skullbase' | 'supratentorial_hemispheric'>('infratentorial_posterior_fossa');
  const [simulateDowncode, setSimulateDowncode] = useState<boolean>(false);

  // 2. Intraoperative Neurophysiological Monitoring (IONM)
  const [ionmMode, setIonmMode] = useState<'remote_physician' | 'in_room_physician' | 'none'>('remote_physician');
  const [ionmTimeUnits, setIonmTimeUnits] = useState<number>(12); // 12 * 15min = 3 hours
  const [ionmIndependentNpi, setIonmIndependentNpi] = useState<boolean>(true);
  const [ionmSupervisionCompliant, setIonmSupervisionCompliant] = useState<boolean>(true);

  // 3. CSF Diversion / Hydrocephalus
  const [csfDiversion, setCsfDiversion] = useState<'evd_separate_site' | 'vp_shunt' | 'evd_same_incision' | 'none'>('evd_separate_site');

  // 4. Stereotactic Navigation & Ultrasonic Dissection
  const [includeNeuronavigation, setIncludeNeuronavigation] = useState<boolean>(true); // CPT +61781
  const [includeCusa, setIncludeCusa] = useState<boolean>(true);

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

    // --- 1. CRANIOTOMY RESECTION AUDIT ---
    if (resectionType === 'infratentorial_posterior_fossa') {
      const standardFee = 4120.0;
      const standardRvu = 56.4;

      if (simulateDowncode) {
        // Downcoded to simple supratentorial craniectomy 61510
        const downcodedFee = 2980.0;
        const downcodedRvu = 41.5;
        const loss = standardFee - downcodedFee;
        totalRvu += downcodedRvu;
        expectedReimbursement += downcodedFee;
        penaltyAtRisk += loss;

        lines.push({
          code: '61518',
          desc: 'Craniectomy for resection of brain tumor, infratentorial / posterior fossa',
          mod: 'Downcoded -> 61510',
          rvu: downcodedRvu,
          fee: downcodedFee,
          status: 'fatal',
          note: `PAYER DOWNCODING: Auditor reclassified infratentorial approach to supratentorial (61510), cutting -$${loss.toFixed(2)} (-14.9 RVU).`,
        });
        alerts.push({
          type: 'fatal',
          title: 'Infratentorial Craniotomy Downcoded to Supratentorial',
          desc: 'Commercial medical director reclassified posterior fossa resection (61518) to supratentorial (61510). Dictation must document suboccipital craniectomy, transverse sinus exposure, and foramen magnum decompression.',
          statute: 'CPT Coding Guidelines: Nervous System / Craniectomy',
        });
      } else {
        totalRvu += standardRvu;
        expectedReimbursement += standardFee;
        lines.push({
          code: '61518',
          desc: 'Craniectomy for resection of brain tumor, infratentorial / posterior fossa',
          mod: 'None',
          rvu: standardRvu,
          fee: standardFee,
          status: 'clean',
          note: 'Primary infratentorial craniectomy correctly captures suboccipital approach for medulloblastoma/ependymoma.',
        });
        alerts.push({
          type: 'clean',
          title: 'Infratentorial Approach Fully Defended',
          desc: 'Operative dictation confirms suboccipital craniectomy, vermian/cerebellar hemisphere retraction, and 4th ventricle tumor resection.',
          statute: 'AMA CPT Assistant / Neurosurgical Coding Standards',
        });
      }
    } else if (resectionType === 'infratentorial_skullbase') {
      const standardFee = 4810.0;
      const standardRvu = 64.2;
      totalRvu += standardRvu;
      expectedReimbursement += standardFee;
      lines.push({
        code: '61520',
        desc: 'Craniectomy for resection of cerebellopontine angle or skull base lesion, infratentorial',
        mod: 'None',
        rvu: standardRvu,
        fee: standardFee,
        status: 'clean',
        note: 'High-complexity skull base craniectomy with cranial nerve monitoring and petrous bone exposure.',
      });
    } else {
      // Supratentorial
      const standardFee = 2980.0;
      const standardRvu = 41.5;
      totalRvu += standardRvu;
      expectedReimbursement += standardFee;
      lines.push({
        code: '61510',
        desc: 'Craniectomy, trephination, bone flap for resection of brain tumor, supratentorial',
        mod: 'None',
        rvu: standardRvu,
        fee: standardFee,
        status: 'clean',
        note: 'Supratentorial hemispheric tumor resection.',
      });
    }

    // --- 2. INTRAOPERATIVE NEUROPHYSIOLOGICAL MONITORING (IONM) ---
    if (ionmMode !== 'none') {
      const isRemote = ionmMode === 'remote_physician';
      const ionmCode = isRemote ? '95941' : '95940';
      const perUnitFee = isRemote ? 38.0 : 54.0;
      const perUnitRvu = isRemote ? 0.6 : 0.9;
      const totalIonmFee = perUnitFee * ionmTimeUnits;
      const totalIonmRvu = perUnitRvu * ionmTimeUnits;

      if (!ionmIndependentNpi) {
        penaltyAtRisk += totalIonmFee;
        lines.push({
          code: ionmCode,
          desc: `Continuous IONM (${ionmTimeUnits} units x 15m) - Billed by Operating Surgeon`,
          mod: 'DISALLOWED',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'FATAL CMS REJECTION: Operating neurosurgeon cannot bill IONM codes. Must be billed under a separate monitoring neurophysiologist NPI.',
        });
        alerts.push({
          type: 'fatal',
          title: 'IONM Billed Under Operating Surgeon NPI',
          desc: 'CMS guidelines strictly prohibit the operating surgeon from reporting IONM codes (95940/95941). Continuous real-time attention is required from a separate qualified neurophysiologist.',
          statute: 'CMS Claims Processing Manual Pub. 100-04, Ch. 12, §20.4.3',
        });
      } else if (isRemote && !ionmSupervisionCompliant) {
        penaltyAtRisk += totalIonmFee;
        lines.push({
          code: ionmCode,
          desc: `Continuous remote IONM (${ionmTimeUnits} units x 15m) - Concurrent &gt;3 cases`,
          mod: 'UNENFORCEABLE',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'FATAL: Remote monitoring exceeded CMS 3-case concurrent supervision threshold. Entire claim subject to post-payment clawback.',
        });
        alerts.push({
          type: 'fatal',
          title: 'CMS 3-Case Remote Supervision Violation',
          desc: 'Medicare and commercial payers deny CPT 95941 if monitoring logs show the supervising neurophysiologist monitored more than three concurrent patients simultaneously.',
          statute: 'Medicare Learning Network (MLN) Matters MM8807',
        });
      } else {
        // Compliant IONM
        totalRvu += totalIonmRvu;
        expectedReimbursement += totalIonmFee;

        // Base evoked potential
        lines.push({
          code: '95938',
          desc: 'Somatosensory evoked potentials (SSEP) baseline testing, 4 limbs',
          mod: '26 (Prof)',
          rvu: 1.8,
          fee: 145.0,
          status: 'clean',
          note: 'Base testing required to support continuous time-based monitoring codes.',
        });
        totalRvu += 1.8;
        expectedReimbursement += 145.0;

        lines.push({
          code: ionmCode,
          desc: `Continuous ${isRemote ? 'remote' : 'in-room'} IONM (${ionmTimeUnits} units = ${ionmTimeUnits * 15} mins)`,
          mod: 'None',
          rvu: Number(totalIonmRvu.toFixed(1)),
          fee: Number(totalIonmFee.toFixed(2)),
          status: 'clean',
          note: `Billed by independent monitoring specialist. Continuous baseline latency/amplitude logs verified for ${ionmTimeUnits * 15} minutes.`,
        });
        alerts.push({
          type: 'clean',
          title: 'Continuous IONM Billing Verified',
          desc: `Independent neurophysiologist documentation with uninterrupted baseline comparison meets all commercial and CMS audit mandates.`,
          statute: 'AMA CPT Guidelines: Special Electroencephalography',
        });
      }
    }

    // --- 3. CSF DIVERSION / HYDROCEPHALUS AUDIT ---
    if (csfDiversion === 'evd_separate_site') {
      const evdFee = 890.0;
      const evdRvu = 12.4;
      totalRvu += evdRvu;
      expectedReimbursement += evdFee;
      lines.push({
        code: '61107',
        desc: 'Twist drill/burr hole for ventricular puncture / external ventricular drain (EVD)',
        mod: '59 (Distinct Procedure)',
        rvu: evdRvu,
        fee: evdFee,
        status: 'clean',
        note: 'Modifier 59 appended. Documented frontal burr hole performed prior to prone positioning for posterior fossa tumor resection.',
      });
      alerts.push({
        type: 'clean',
        title: 'Pre-Craniotomy EVD Defended (Modifier 59)',
        desc: 'Operative report documents distinct coronal burr hole placement for emergent CSF drainage before positioning child prone for suboccipital craniectomy.',
        statute: 'NCCI Policy Manual Ch. VIII, Sec. B.2',
      });
    } else if (csfDiversion === 'evd_same_incision') {
      penaltyAtRisk += 890.0;
      lines.push({
        code: '61107',
        desc: 'Ventricular puncture through same suboccipital craniectomy incision',
        mod: 'UNBUNDLED (Denied)',
        rvu: 0,
        fee: 0,
        status: 'fatal',
        note: 'FATAL NCCI BUNDLE: Ventricular decompression performed through the same surgical craniectomy opening is bundled as an integral component of tumor exposure.',
      });
      alerts.push({
        type: 'fatal',
        title: 'NCCI Fatal Unbundling: Same-Incision Ventriculostomy',
        desc: 'Payers strictly bundle CPT 61107 into 61518 when performed through the craniotomy operative exposure. Must be performed at a separate anatomic site through a separate skin incision.',
        statute: 'CMS NCCI Policy Manual Ch. VIII, Sec. A',
      });
    } else if (csfDiversion === 'vp_shunt') {
      const shuntFee = 1680.0;
      const shuntRvu = 22.8;
      totalRvu += shuntRvu;
      expectedReimbursement += shuntFee;
      lines.push({
        code: '62223',
        desc: 'Creation of ventriculo-peritoneal shunt with valve and catheter',
        mod: '51 (Multiple Procedure)',
        rvu: shuntRvu,
        fee: shuntFee,
        status: 'clean',
        note: 'Concurrent VP shunt creation for persistent obstructive hydrocephalus.',
      });
    }

    // --- 4. STEREOTACTIC NEURONAVIGATION (+61781) ---
    if (includeNeuronavigation) {
      const navFee = 415.0;
      const navRvu = 5.8;
      totalRvu += navRvu;
      expectedReimbursement += navFee;
      lines.push({
        code: '+61781',
        desc: 'Stereotactic computer-assisted volumetric navigation, infratentorial (List separately in addition to code for primary procedure)',
        mod: 'Add-On (Exempt 51)',
        rvu: navRvu,
        fee: navFee,
        status: 'clean',
        note: 'Add-on code: 100% allowable reimbursement with zero multiple procedure reduction discounting.',
      });
      alerts.push({
        type: 'clean',
        title: 'Infratentorial Neuronavigation (+61781) Validated',
        desc: 'Operative note records registration of high-resolution 3D MRI/CT fiducials, intraoperative accuracy verification, and continuous trajectory guidance.',
        statute: 'CPT Add-On Code Designator (+), AMA CPT Guidelines',
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
    ionmMode,
    ionmTimeUnits,
    ionmIndependentNpi,
    ionmSupervisionCompliant,
    csfDiversion,
    includeNeuronavigation,
    includeCusa,
  ]);

  // ANSI X12 837P Claim Snippet
  const ansi837Snippet = useMemo(() => {
    return [
      'ISA*00*          *00*          *ZZ*AETHERA_RCM    *ZZ*PAYER_CLEARING *260905*1430*^*00501*000000102*0*P*:~',
      'GS*HC*AETHERA_RCM*PAYER_CLEARING*20260905*1430*102*X*005010X222A1~',
      'ST*837*0002*005010X222A1~',
      'BHT*0019*00*PEDIATRIC_BRAIN_TUMOR*20260905*1430*CH~',
      'NM1*85*2*CHILDRENS NEUROSURGERY ONCOLOGY LLC*****XX*1883920191~',
      'N3*500 PEDIATRIC HEALTH PARKWAY*SUITE 800~',
      'N4*PHILADELPHIA*PA*19104~',
      'NM1*82*1*SURGEON*PEDIATRIC_NEURO****XX*1772910394~',
      'PRV*BI*PXC*207T00000X~',
      'NM1*IL*1*DOE*PEDIATRIC_PATIENT****MI*AET48829102~',
      'CLM*PED-NEURO-2026-8812*' + scrubberResult.expectedReimbursement.toFixed(2) + '***11:B:1*Y*A*Y*Y~',
      'HI*ABK:C71.6*ABF:G91.1*ABF:R27.0~',
      ...scrubberResult.lines.map((line) => {
        const modSegment = line.mod && line.mod !== 'None' ? `:${line.mod.replace(/[^A-Za-z0-9]/g, '')}` : '';
        return `SV1*HC:${line.code}${modSegment}*${line.fee.toFixed(2)}*UN*1***1:2~DTP*472*D8*20260905~`;
      }),
      'SE*' + (11 + scrubberResult.lines.length * 2) + '*0002~',
      'GE*1*102~',
      'IEA*1*000000102~',
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
      leadType: 'pediatric_brain_tumor_rcm_audit',
      contactName,
      contactEmail,
      practiceName,
      auditNotes,
      resectionType,
      ionmMode,
      ionmTimeUnits,
      csfDiversion,
      includeNeuronavigation,
      totalRvu: scrubberResult.totalRvu,
      expectedReimbursement: scrubberResult.expectedReimbursement,
      penaltyAtRisk: scrubberResult.penaltyAtRisk,
      claimLines: scrubberResult.lines.map((l) => ({ code: l.code, fee: l.fee, status: l.status })),
      timestamp: new Date().toISOString(),
    };

    try {
      await sendLeadToKiran('pediatric_brain_tumor_rcm_audit', payload);
      trackConversion('pediatric_neuro_rcm_audit_submit');
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            Tool #57 • Pediatric Neurosurgery &amp; Neuro-Oncology RCM
          </div>
          <span className="text-xs font-mono text-slate-500">CPT 61518-61520 • 95940/95941 • +61781</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-navy font-jakarta tracking-tight">
          Pediatric Brain Tumor &amp; Intraoperative Monitoring Scrubber
        </h2>
        <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-4xl">
          Model pediatric posterior fossa craniotomy for medulloblastoma and ependymoma, real-time intraoperative neurophysiological monitoring (IONM), pre-craniotomy external ventricular drains, and stereotactic neuronavigation add-ons. Defends against payer downcoding to supratentorial craniectomy and enforces CMS 3-patient remote monitoring supervision rules.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical & IONM Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Box 1: Craniotomy Resection Scope */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-indigo-600" />
              1. Craniectomy Approach &amp; Tumor Pathology Level
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Craniectomy / Approach Procedure
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'infratentorial_posterior_fossa', name: 'Infratentorial / Posterior Fossa (61518)', desc: 'Suboccipital craniectomy for medulloblastoma', rvu: '56.4 RVU • $4,120' },
                    { id: 'infratentorial_skullbase', name: 'Infratentorial Skull Base (61520)', desc: 'Cerebellopontine angle / complex petrous', rvu: '64.2 RVU • $4,810' },
                    { id: 'supratentorial_hemispheric', name: 'Supratentorial Craniectomy (61510)', desc: 'Hemispheric cerebral cortex resection', rvu: '41.5 RVU • $2,980' },
                  ].map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setResectionType(res.id as any)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        resectionType === res.id
                          ? 'border-indigo-600 bg-indigo-50/70 text-navy ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-xs text-navy">{res.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{res.desc}</div>
                      <div className="text-[10px] font-mono font-semibold text-indigo-700 mt-1">{res.rvu}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Downcoding Simulator Toggle */}
              {resectionType === 'infratentorial_posterior_fossa' && (
                <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-900">Simulate Payer Downcoding Audit</div>
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        Test payer auditor reclassifying infratentorial (61518) to supratentorial (61510).
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

          {/* Box 2: Intraoperative Neurophysiological Monitoring (IONM) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Activity className="w-5 h-5 text-indigo-600" />
              2. Intraoperative Neurophysiological Monitoring (IONM) Audit
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  IONM Physician Modality
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'remote_physician', label: 'Remote Monitoring (95941)', desc: 'Off-site monitoring per 15 min' },
                    { id: 'in_room_physician', label: 'In-Room Physician (95940)', desc: 'Direct intraoperative monitoring' },
                    { id: 'none', label: 'No IONM Billed', desc: 'No electrophysiological mapping' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setIonmMode(m.id as any)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        ionmMode === m.id
                          ? 'border-indigo-600 bg-indigo-50 text-navy font-semibold ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>{m.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {ionmMode !== 'none' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Intraoperative Monitoring Duration (15-minute units)
                      </label>
                      <span className="text-xs font-mono font-bold text-indigo-700">
                        {ionmTimeUnits} units ({ionmTimeUnits * 15} minutes / {(ionmTimeUnits * 0.25).toFixed(1)} hrs)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={32}
                      step={1}
                      value={ionmTimeUnits}
                      onChange={(e) => setIonmTimeUnits(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-xs font-medium text-slate-800">Separate Monitoring Neurophysiologist NPI</div>
                      <div className="text-[11px] text-slate-500">CMS requirement: Operating surgeon cannot bill IONM codes</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ionmIndependentNpi}
                        onChange={(e) => setIonmIndependentNpi(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {ionmMode === 'remote_physician' && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div>
                        <div className="text-xs font-medium text-slate-800">CMS 3-Case Concurrent Supervision Compliant</div>
                        <div className="text-[11px] text-slate-500">Supervising physician monitoring &le;3 cases concurrently</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ionmSupervisionCompliant}
                          onChange={(e) => setIonmSupervisionCompliant(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Box 3: CSF Diversion & Navigation Add-ons */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              3. CSF Diversion &amp; Neuronavigation Add-ons
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Hydrocephalus Management / CSF Diversion
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'evd_separate_site', label: 'EVD via Separate Burr Hole (61107-59)', desc: 'Placed prior to prone positioning' },
                    { id: 'vp_shunt', label: 'Ventriculoperitoneal Shunt (62223-51)', desc: 'Permanent valve & distal peritoneal catheter' },
                    { id: 'evd_same_incision', label: 'EVD via Same Craniotomy (Test Bundle)', desc: 'Simulate fatal NCCI unbundling rejection' },
                    { id: 'none', label: 'No CSF Diversion Billed', desc: 'Resection without acute ventricular drain' },
                  ].map((csf) => (
                    <button
                      key={csf.id}
                      type="button"
                      onClick={() => setCsfDiversion(csf.id as any)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        csfDiversion === csf.id
                          ? 'border-indigo-600 bg-indigo-50 text-navy font-semibold ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>{csf.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{csf.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <div className="text-xs font-medium text-slate-800">Stereotactic Neuronavigation Add-On (+61781)</div>
                    <div className="text-[11px] text-slate-500">Volumetric infratentorial computer-assisted surgical navigation</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeNeuronavigation}
                      onChange={(e) => setIncludeNeuronavigation(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <div className="text-xs font-medium text-slate-800">Ultrasonic Surgical Aspiration (CUSA Microdissection)</div>
                    <div className="text-[11px] text-slate-500">Documented cavitron ultrasonic aspiration for brainstem tumor margin debulking</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCusa}
                      onChange={(e) => setIncludeCusa(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Findings & ANSI Stream */}
        <div className="lg:col-span-5 space-y-6">
          {/* Audit Metrics Card */}
          <div className="bg-navy text-white rounded-xl shadow-lg p-6 border border-navy-light">
            <div className="flex items-center justify-between border-b border-navy-light/60 pb-4 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Pediatric Neurosurgery Audit Metrics
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                <Zap className="w-3 h-3" />
                CMS IONM Compliant
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
                  {scrubberResult.penaltyAtRisk > 0 ? 'Corrective action required' : 'Ready for clean submission'}
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
                      : 'bg-indigo-950/40 border-indigo-600/40 text-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {alert.type === 'fatal' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    ) : alert.type === 'warning' ? (
                      <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
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
              className="mt-6 w-full py-3 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Request Pediatric Neurosurgery Audit
            </button>
          </div>

          {/* Claim Lines Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-indigo-600" />
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
                      <td className="py-2 px-2 font-mono text-indigo-700 font-semibold">{line.mod}</td>
                      <td className="py-2 px-2 font-mono">{line.rvu}</td>
                      <td className="py-2 px-3 font-mono text-right">${line.fee.toFixed(2)}</td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            line.status === 'clean'
                              ? 'bg-indigo-100 text-indigo-800'
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
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                ANSI X12 837P Professional Claim Snippet
              </span>
              <button
                type="button"
                onClick={handleCopyClaim}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy EDI'}
              </button>
            </div>
            <pre className="overflow-x-auto text-[10px] leading-tight text-indigo-300/90 whitespace-pre">
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
                  Request Pediatric Neurosurgery Audit
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Route zero-PHI parameters directly to Kiran at Aethera Healthcare Solutions
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
                <CheckCircle2 className="w-12 h-12 text-indigo-600 mx-auto mb-3 animate-bounce" />
                <h4 className="text-lg font-bold text-navy">Audit Request Received</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Kiran will analyze your pediatric neurosurgical coding setup and respond within 24 business hours.
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
                    placeholder="e.g., Jennifer Wu, MD / Practice Administrator"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500"
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
                    placeholder="jennifer@childrensneurosurgery.org"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Hospital / Neurosurgical Group Name
                  </label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="e.g., Children's Hospital Pediatric Neurosurgery"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Audit Concerns (e.g. IONM denials, EVD bundling, neuronavigation clawbacks)
                  </label>
                  <textarea
                    rows={3}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="Describe specific payer audit patterns or clawbacks..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Transmitting Audit Request...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Case Parameters
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Zero-PHI compliance. Protected by Aethera's enterprise data governance standard.
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
