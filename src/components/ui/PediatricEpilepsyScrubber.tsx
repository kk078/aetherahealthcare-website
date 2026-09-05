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
  Brain,
  Eye,
  GitBranch,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function PediatricEpilepsyScrubber() {
  // 1. Stage 1: Diagnostic Intracranial Monitoring Modality
  const [monitoringType, setMonitoringType] = useState<
    'seeg_robotic_depth' | 'subdural_grid_craniotomy' | 'both_hybrid'
  >('seeg_robotic_depth');

  const [hasRoboticNav, setHasRoboticNav] = useState<boolean>(true); // CPT +61781 (stereotactic navigation)
  const [documentedMultipleTrajectories, setDocumentedMultipleTrajectories] = useState<boolean>(true);

  // 2. Stage 2: Therapeutic Resection / Disconnection Surgery
  const [resectionType, setResectionType] = useState<
    'hemispherotomy_complete' | 'laser_interstitial_thermal' | 'temporal_lobectomy'
  >('hemispherotomy_complete');

  const [isStagedWithinGlobal, setIsStagedWithinGlobal] = useState<boolean>(true);
  const [hasModifier58, setHasModifier58] = useState<boolean>(true);
  const [simulateDowncode, setSimulateDowncode] = useState<boolean>(false); // Payer downcodes hemispherotomy 61543 to lobectomy 61537

  // 3. Continuous Long-Term Video-EEG Monitoring (95724)
  const [includeVideoEegMonitoring, setIncludeVideoEegMonitoring] = useState<boolean>(true);
  const [separatePhysicianReport, setSeparatePhysicianReport] = useState<boolean>(true);

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

    // --- 1. STAGE 1: INTRACRANIAL MONITORING ---
    if (monitoringType === 'seeg_robotic_depth') {
      const seegFee = 4250.0;
      const seegRvu = 56.4;
      totalRvu += seegRvu;
      expectedReimbursement += seegFee;

      lines.push({
        code: '61760',
        desc: 'Stereotactic implantation of depth electrodes into brain for seizure onset localization',
        mod: 'None',
        rvu: seegRvu,
        fee: seegFee,
        status: 'clean',
        note: 'Robotic multi-lead stereotactic depth electrode implantation.',
      });
      alerts.push({
        type: 'clean',
        title: 'Robotic Stereo-EEG (sEEG) Depth Implantation Verified (61760)',
        desc: 'Documented multi-planar robotic stereotaxy with depth electrode anchor placement for refractory focal epilepsy.',
        statute: 'NAEC Guidelines for Specialized Epilepsy Centers',
      });
    } else if (monitoringType === 'subdural_grid_craniotomy') {
      const gridFee = 4650.0;
      const gridRvu = 61.2;
      totalRvu += gridRvu;
      expectedReimbursement += gridFee;

      lines.push({
        code: '61533',
        desc: 'Craniotomy with implantation of subdural electrode grid or strips for seizure localization',
        mod: 'None',
        rvu: gridRvu,
        fee: gridFee,
        status: 'clean',
        note: 'Open craniotomy with subdural cortical grid placement.',
      });
    } else if (monitoringType === 'both_hybrid') {
      const seegFee = 4250.0;
      const seegRvu = 56.4;
      const gridFee = 4650.0 * 0.5;
      const gridRvu = 61.2 * 0.5;
      totalRvu += seegRvu + gridRvu;
      expectedReimbursement += seegFee + gridFee;

      lines.push({
        code: '61760',
        desc: 'Stereotactic implantation of depth electrodes (sEEG)',
        mod: 'None',
        rvu: seegRvu,
        fee: seegFee,
        status: 'clean',
        note: 'Primary stereotactic depth lead placement.',
      });
      lines.push({
        code: '61533',
        desc: 'Craniotomy with implantation of subdural electrode grid',
        mod: '51',
        rvu: Number(gridRvu.toFixed(1)),
        fee: Number(gridFee.toFixed(2)),
        status: 'clean',
        note: 'Concomitant open craniotomy for subdural grid placement (50% multiple procedure reduction).',
      });
    }

    // Robotic Stereotactic Navigation Add-on (+61781)
    if (hasRoboticNav) {
      const navFee = 540.0;
      const navRvu = 6.8;

      if (!documentedMultipleTrajectories) {
        penaltyAtRisk += navFee;
        lines.push({
          code: '+61781',
          desc: 'Stereotactic computer-assisted navigation; cranial, intradural (List separately)',
          mod: 'UNBUNDLED (DENIED)',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'FATAL NCCI UNBUNDLING: Robotic stereotactic navigation billed without documenting fiducial registration and distinct target trajectories.',
        });
        alerts.push({
          type: 'fatal',
          title: 'Robotic Stereotactic Navigation Unbundling Rejection (+61781)',
          desc: 'Commercial payers reject +61781 unless operative dictation details volumetric imaging registration, robotic arm accuracy calibration, and entry trajectory coordinates.',
          statute: 'CPT Parenthetical Rules / NCCI Policy Manual Ch. VIII, Sec. A',
        });
      } else {
        totalRvu += navRvu;
        expectedReimbursement += navFee;
        lines.push({
          code: '+61781',
          desc: 'Stereotactic computer-assisted navigation; cranial, intradural (robotic guidance)',
          mod: 'None',
          rvu: navRvu,
          fee: navFee,
          status: 'clean',
          note: 'Modifier 51 exempt add-on. Supported by robotic trajectory log and multi-planar coordinate mapping.',
        });
        alerts.push({
          type: 'clean',
          title: 'Cranial Stereotactic Neuronavigation Defended (+61781)',
          desc: 'Autonomous coordinate planning and robotic arm registration substantiated in operative record.',
          statute: 'AMA CPT Guidelines for Stereotactic Navigation',
        });
      }
    }

    // --- 2. STAGE 2: RESECTIVE / DISCONNECTION SURGERY ---
    if (resectionType === 'hemispherotomy_complete') {
      const standardFee = 5850.0;
      const standardRvu = 78.5;

      if (simulateDowncode) {
        const downFee = 3250.0;
        const downRvu = 44.2;
        const loss = standardFee - downFee;
        penaltyAtRisk += loss;

        lines.push({
          code: '61543',
          desc: 'Craniotomy for partial or complete hemispherotomy / hemispheric disconnection',
          mod: isStagedWithinGlobal ? (hasModifier58 ? '58 (Downcoded -> 61537)' : 'Downcoded -> 61537') : 'Downcoded -> 61537',
          rvu: downRvu,
          fee: downFee,
          status: 'fatal',
          note: `PAYER DOWNCODING: Insurer downgraded complete hemispherotomy (61543) to simple single-lobe cortical resection (61537), slashing -$${loss.toFixed(2)}.`,
        });
        alerts.push({
          type: 'fatal',
          title: 'Hemispherotomy Downcoded to Simple Lobectomy (61537)',
          desc: 'Commercial audit claims operative notes only describe temporal/frontal resections rather than complete ventricular disconnections. Appeal must detail transventricular corpus callosotomy and peri-insular isolation.',
          statute: 'AANS/CNS Neurosurgical Coding Guidelines',
        });
        totalRvu += downRvu;
        expectedReimbursement += downFee;
      } else {
        let modStr = 'None';
        let isFatalGlobal = false;

        if (isStagedWithinGlobal) {
          if (!hasModifier58) {
            isFatalGlobal = true;
            penaltyAtRisk += standardFee;
            modStr = 'UNBUNDLED (GLOBAL)';
          } else {
            modStr = '58';
          }
        }

        if (isFatalGlobal) {
          lines.push({
            code: '61543',
            desc: 'Craniotomy for partial or complete hemispherotomy',
            mod: modStr,
            rvu: 0,
            fee: 0,
            status: 'fatal',
            note: 'FATAL GLOBAL SURGERY DENIAL: Second-stage hemispherotomy performed during 90-day sEEG global period without Modifier 58.',
          });
          alerts.push({
            type: 'fatal',
            title: 'Fatal Postoperative Global Period Denial (Missing Modifier 58)',
            desc: 'Clearinghouses automatically reject resection procedures within 90 days of diagnostic electrode implantation unless Modifier -58 is appended to signify planned staged protocol.',
            statute: 'CMS IOM 100-04, Ch. 12, §40.1.B',
          });
        } else {
          totalRvu += standardRvu;
          expectedReimbursement += standardFee;
          lines.push({
            code: '61543',
            desc: 'Craniotomy for partial or complete hemispherotomy (functional/anatomical)',
            mod: modStr,
            rvu: standardRvu,
            fee: standardFee,
            status: 'clean',
            note: 'Complete surgical disconnection including transventricular callosotomy, temporal resection, and opercular disconnects.',
          });
          alerts.push({
            type: 'clean',
            title: 'Functional Hemispherotomy Substantiated (61543)',
            desc: 'Complete hemispheric isolation documented under intractable pediatric hemimegalencephaly or Rasmussen encephalitis protocol.',
            statute: 'AANS Pediatric Neurosurgical Section Protocol',
          });
        }
      }
    } else if (resectionType === 'laser_interstitial_thermal') {
      const littFee = 4950.0;
      const littRvu = 64.2;
      let modStr = isStagedWithinGlobal ? (hasModifier58 ? '58' : 'UNBUNDLED (GLOBAL)') : 'None';

      if (isStagedWithinGlobal && !hasModifier58) {
        penaltyAtRisk += littFee;
        lines.push({
          code: '61736',
          desc: 'Laser interstitial thermal therapy (LITT) of brain; intracranial lesion/seizure focus',
          mod: modStr,
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'FATAL GLOBAL PERIOD DENIAL: LITT laser ablation billed without Modifier 58 in global period.',
        });
        alerts.push({
          type: 'fatal',
          title: 'Fatal Postoperative Global Period Denial: LITT Laser Ablation',
          desc: 'Missing Modifier 58 on planned MRI-guided laser ablation.',
          statute: 'CMS Staged Procedure Policy',
        });
      } else {
        totalRvu += littRvu;
        expectedReimbursement += littFee;
        lines.push({
          code: '61736',
          desc: 'Laser interstitial thermal therapy (LITT) of brain; first stereotactic target',
          mod: modStr,
          rvu: littRvu,
          fee: littFee,
          status: 'clean',
          note: 'MRI-guided stereotactic laser ablation for hypothalamic hamartoma or focal cortical dysplasia.',
        });
      }
    } else if (resectionType === 'temporal_lobectomy') {
      const lobFee = 3850.0;
      const lobRvu = 51.5;
      totalRvu += lobRvu;
      expectedReimbursement += lobFee;

      lines.push({
        code: '61538',
        desc: 'Craniotomy with removal of temporal lobe (lobectomy) for seizure disorder',
        mod: isStagedWithinGlobal ? (hasModifier58 ? '58' : 'UNBUNDLED (GLOBAL)') : 'None',
        rvu: lobRvu,
        fee: lobFee,
        status: 'clean',
        note: 'Anterior temporal lobectomy with amygdalohippocampectomy.',
      });
    }

    // --- 3. CONTINUOUS VIDEO-EEG MONITORING (95724) ---
    if (includeVideoEegMonitoring) {
      const eegFee = 480.0;
      const eegRvu = 6.2;

      if (!separatePhysicianReport) {
        penaltyAtRisk += eegFee;
        lines.push({
          code: '95724',
          desc: 'Electroencephalogram (EEG) continuous monitoring; 24 hr, with video, physician review',
          mod: 'UNBUNDLED (SPLIT)',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'FATAL SPLIT-BILLING ERROR: Continuous video-EEG professional interpretation billed without distinct daily signed physician report.',
        });
        alerts.push({
          type: 'fatal',
          title: 'Continuous Video-EEG Professional Component Denial (95724)',
          desc: 'Payers reject 95724 professional interpretation unless accompanied by daily signed physician report documenting seizure onset spikes, baseline background, and antiepileptic titration.',
          statute: 'CMS IOM 100-04, Ch. 13, §100.1',
        });
      } else {
        totalRvu += eegRvu;
        expectedReimbursement += eegFee;
        lines.push({
          code: '95724',
          desc: 'Continuous video-EEG monitoring with daily physician review and interpretation (24 hr)',
          mod: '26',
          rvu: eegRvu,
          fee: eegFee,
          status: 'clean',
          note: 'Modifier 26 professional component verified with signed epileptologist electroclinical correlation note.',
        });
        alerts.push({
          type: 'clean',
          title: 'Continuous Video-EEG Monitoring Defended (95724-26)',
          desc: 'Daily formal interpretation documented with electroclinical ictal onset capture and spike wave analysis.',
          statute: 'ACNS Guideline for Long-Term Video-EEG Monitoring',
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
    monitoringType,
    hasRoboticNav,
    documentedMultipleTrajectories,
    resectionType,
    isStagedWithinGlobal,
    hasModifier58,
    simulateDowncode,
    includeVideoEegMonitoring,
    separatePhysicianReport,
  ]);

  // ANSI 837P EDI Claim String Generator
  const generateEdiClaim = () => {
    const claimDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let edi = `ISA*00*          *00*          *ZZ*SUBMITTER      *ZZ*PAYER          *${claimDate.slice(2)}*1200*^*00501*000000001*0*P*:~\n`;
    edi += `GS*HC*SUBMITTER*PAYER*${claimDate}*1200*1*X*005010X222A1~\n`;
    edi += `ST*837*0001*005010X222A1~\n`;
    edi += `BHT*0019*00*REF${claimDate}*${claimDate}*1200*CH~\n`;
    edi += `NM1*85*2*PEDIATRIC EPILEPSY SURGERY*****XX*1988888882~\n`;
    edi += `NM1*IL*1*CHILD*JANE****MI*EPI9981244~\n`;
    edi += `CLM*EPI-${claimDate}*${scrubberResult.expectedReimbursement.toFixed(2)}***11:B:1*Y*A*Y*Y~\n`;

    scrubberResult.lines.forEach((l, idx) => {
      const cleanMod = l.mod.replace(/[^0-9A-Z]/g, '');
      const modSegment = cleanMod && cleanMod !== 'None' ? `:${cleanMod}` : '';
      edi += `LX*${idx + 1}~\n`;
      edi += `SV1*HC:${l.code}${modSegment}*${l.fee.toFixed(2)}*UN*1***1~\n`;
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
        monitoringType,
        resectionType,
        hasRoboticNav,
        isStagedWithinGlobal,
        hasModifier58,
        simulateDowncode,
        includeVideoEegMonitoring,
        expectedReimbursement: scrubberResult.expectedReimbursement,
        penaltyAtRisk: scrubberResult.penaltyAtRisk,
        totalRvu: scrubberResult.totalRvu,
        contactName,
        contactEmail,
        practiceName,
        auditNotes,
      };

      await sendLeadToKiran('pediatric_epilepsy_rcm_audit', payload);
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
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-purple-900/40 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-purple-500/30">
              <Brain className="w-3.5 h-3.5" />
              Pediatric Neurosurgery &amp; Comprehensive Epilepsy Center (NAEC Level 4)
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-jakarta tracking-tight">
              Pediatric Hemispherotomy &amp; Stereo-EEG Scrubber
            </h2>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
              Audit stereo-electroencephalography (sEEG 61760), cranial robotic stereotactic neuronavigation (+61781), staged complete hemispherotomy disconnections (61543), and continuous video-EEG monitoring (95724).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setShowLeadModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Request Pediatric Epilepsy Audit
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Total Work RVUs</span>
            <span className="text-xl font-bold font-mono text-purple-400">
              {scrubberResult.totalRvu} wRVUs
            </span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Expected Reimbursement</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              ${scrubberResult.expectedReimbursement.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Revenue at Risk / Clawback</span>
            <span className={`text-xl font-bold font-mono ${scrubberResult.penaltyAtRisk > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              ${scrubberResult.penaltyAtRisk.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Active Claim Lines</span>
            <span className="text-xl font-bold font-mono text-white">
              {scrubberResult.lines.length} CPT Units
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Box 1: Stage 1 Diagnostic Monitoring */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Brain className="w-5 h-5 text-purple-600" />
              1. Stage 1: Invasive Intracranial Seizure Mapping
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Diagnostic Electrode Technique
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'seeg_robotic_depth',
                      code: 'CPT 61760',
                      title: 'Stereo-EEG (sEEG)',
                      desc: 'Multi-lead robotic depth electrode trajectories.',
                    },
                    {
                      id: 'subdural_grid_craniotomy',
                      code: 'CPT 61533',
                      title: 'Subdural Grid Craniotomy',
                      desc: 'Open craniotomy with subdural strip/grid placement.',
                    },
                    {
                      id: 'both_hybrid',
                      code: '61760 + 61533',
                      title: 'Hybrid sEEG & Grid',
                      desc: 'Combined depth leads and subdural surface coverage.',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMonitoringType(item.id as any)}
                      className={`text-left p-3.5 rounded-lg border transition-all ${
                        monitoringType === item.id
                          ? 'border-purple-600 bg-purple-50/50 shadow-sm ring-1 ring-purple-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-sm text-navy">{item.title}</div>
                      <div className="text-xs font-mono font-bold text-purple-700 mt-0.5">{item.code}</div>
                      <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Robotic Navigation Add-On */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-slate-800">Robotic Stereotactic Cranial Navigation (+61781)</div>
                    <div className="text-[11px] text-slate-500">ROSA or StealthStation robotic arm coordinate alignment</div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={hasRoboticNav}
                      onChange={(e) => setHasRoboticNav(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </div>
                </label>

                {hasRoboticNav && (
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 pl-6 cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-slate-800">Distinct Volumetric Registration &amp; Trajectory Coordinates Dictated</div>
                      <div className="text-[11px] text-slate-500">Defends +61781 from NCCI bundling into primary electrode insertion</div>
                    </div>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={documentedMultipleTrajectories}
                        onChange={(e) => setDocumentedMultipleTrajectories(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Box 2: Stage 2 Resection / Hemispherotomy Disconnection */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Scissors className="w-5 h-5 text-purple-600" />
              2. Stage 2: Therapeutic Disconnection or Resection Surgery
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Definitive Surgical Resection / Ablation Modality
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'hemispherotomy_complete',
                      code: 'CPT 61543',
                      title: 'Complete Hemispherotomy',
                      desc: 'Transventricular disconnection of entire cerebral hemisphere.',
                    },
                    {
                      id: 'laser_interstitial_thermal',
                      code: 'CPT 61736',
                      title: 'LITT Laser Ablation',
                      desc: 'Stereotactic MRI-guided laser ablation of seizure focus.',
                    },
                    {
                      id: 'temporal_lobectomy',
                      code: 'CPT 61538',
                      title: 'Temporal Lobectomy',
                      desc: 'Anterior temporal resection with amygdalohippocampectomy.',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setResectionType(item.id as any)}
                      className={`text-left p-3.5 rounded-lg border transition-all ${
                        resectionType === item.id
                          ? 'border-purple-600 bg-purple-50/50 shadow-sm ring-1 ring-purple-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-sm text-navy">{item.title}</div>
                      <div className="text-xs font-mono font-bold text-purple-700 mt-0.5">{item.code}</div>
                      <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Staged Procedure Modifier 58 Safeguards */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 block">
                  Staged Protocol Within 90-Day Surgical Global Period
                </span>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-slate-700">Second Stage Resection within 90 Days of Electrode Placement</span>
                  <input
                    type="checkbox"
                    checked={isStagedWithinGlobal}
                    onChange={(e) => setIsStagedWithinGlobal(e.target.checked)}
                    className="h-4 w-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                </label>

                {isStagedWithinGlobal && (
                  <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Append Modifier -58 (Staged / Related Procedure)</span>
                      <span className="text-[11px] text-slate-500">Informs payer this is a prospectively planned two-stage epilepsy surgery</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasModifier58}
                      onChange={(e) => setHasModifier58(e.target.checked)}
                      className="h-4 w-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                    />
                  </label>
                )}
              </div>

              {/* Downcoding Simulator Toggle */}
              {resectionType === 'hemispherotomy_complete' && (
                <label className="flex items-center justify-between p-3.5 bg-rose-50 rounded-lg border border-rose-200 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-rose-900">
                      Simulate Commercial Downcoding to Simple Lobectomy (61537)
                    </div>
                    <div className="text-[11px] text-rose-700 mt-0.5">
                      Payer downgrades complete hemispherotomy (61543) claiming only partial lobar resection (-$2,600 / -34 wRVU clawback).
                    </div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={simulateDowncode}
                      onChange={(e) => setSimulateDowncode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Box 3: Continuous Long-Term Video-EEG Monitoring (95724) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Activity className="w-5 h-5 text-purple-600" />
              3. Inpatient Continuous Video-EEG Monitoring (CPT 95724-26)
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-slate-800">Continuous Inpatient Video-EEG Interpretation (95724)</div>
                  <div className="text-[11px] text-slate-500">24-hour continuous intracranial recording with daily epileptologist report</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={includeVideoEegMonitoring}
                    onChange={(e) => setIncludeVideoEegMonitoring(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </div>
              </label>

              {includeVideoEegMonitoring && (
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 pl-6 cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-slate-800">Independent Daily Signed Interpretation Documented</div>
                    <div className="text-[11px] text-slate-500">Separates professional interpretation from hospital technical monitoring</div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={separatePhysicianReport}
                      onChange={(e) => setSeparatePhysicianReport(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Ledger & Alerts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Claim Line Ledger */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="font-bold text-navy text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Clean Claim Ledger
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                837P Scrubbed
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {scrubberResult.lines.map((line, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-sm text-navy">{line.code}</span>
                      {line.mod && line.mod !== 'None' && (
                        <span className={`ml-2 text-xs font-mono px-1.5 py-0.5 rounded font-bold ${
                          line.status === 'fatal' ? 'bg-rose-100 text-rose-800' : 'bg-purple-50 text-purple-700'
                        }`}>
                          Mod {line.mod}
                        </span>
                      )}
                      <p className="text-xs text-slate-600 mt-0.5">{line.desc}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-slate-900">
                        ${line.fee.toFixed(2)}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {line.rvu} wRVU
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 italic">{line.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Compliance Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 font-bold text-navy text-base mb-4 border-b border-slate-100 pb-3">
              <Zap className="w-4 h-4 text-amber-500" />
              Real-Time Audit Guidance
            </div>

            <div className="space-y-3">
              {scrubberResult.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                    alert.type === 'fatal'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : alert.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {alert.type === 'fatal' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    ) : alert.type === 'warning' ? (
                      <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                    {alert.title}
                  </div>
                  <p className="text-[11px] text-slate-700">{alert.desc}</p>
                  <div className="mt-1.5 text-[10px] font-mono font-semibold text-slate-500">
                    Authority: {alert.statute}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ANSI 837P EDI Stream */}
          <div className="bg-slate-900 rounded-xl p-4 text-slate-300 font-mono text-[11px] shadow-sm border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                <FileCode className="w-3.5 h-3.5 text-purple-400" />
                ANSI X12 837P Professional Claim Stream
              </div>
              <button
                type="button"
                onClick={handleCopyEdi}
                className="inline-flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy EDI'}
              </button>
            </div>
            <pre className="whitespace-pre-wrap overflow-x-auto text-[10px] leading-tight text-purple-300/90 max-h-48">
              {generateEdiClaim()}
            </pre>
          </div>
        </div>
      </div>

      {/* Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setShowLeadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              &times;
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy font-jakarta">
                  Request Pediatric Epilepsy Practice Audit
                </h3>
                <p className="text-xs text-slate-500">
                  Transmits audit findings directly to Kiran (Aethera Healthcare RCM Director).
                </p>
              </div>
            </div>

            {leadSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-emerald-900">Audit Request Transmitted</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Kiran will review your epilepsy surgery RCM configuration and contact you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Chen / Practice Manager"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="sarah@pediatricepilepsy.org"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Epilepsy Center / Hospital Name
                  </label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="e.g. Children's Hospital Comprehensive Epilepsy Center"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Scrubber Notes / Audit Questions
                  </label>
                  <textarea
                    rows={3}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="Describe any sEEG unbundling denials, staged procedure Modifier 58 issues, or hemispherotomy downcoding..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">HIPAA Zero-PHI Guarantee:</span> Zero patient identifiers are transmitted or stored. Transmits strictly operational billing metrics directly to senior billing leadership.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Transmitting to Kiran...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Transmit Audit Request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
