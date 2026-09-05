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
  Smile,
  Eye,
  GitBranch,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function PediatricCraniofacialScrubber() {
  // 1. Primary Surgical Procedure
  const [procedureType, setProcedureType] = useState<
    'palatoplasty_primary' | 'palatoplasty_alveolar_bone_graft' | 'palatal_lengthening_pharyngeal' | 'lefort_i_osteotomy' | 'cranial_vault_remodeling'
  >('palatoplasty_alveolar_bone_graft');

  // 2. Bone Graft Coding Configuration
  const [separateGraftHarvestCode, setSeparateGraftHarvestCode] = useState<boolean>(false); // Trying to bill 20900/21210 alongside 42210
  const [graftDonorSite, setGraftDonorSite] = useState<'iliac_crest' | 'tibia' | 'calvarial' | 'allograft'>('iliac_crest');

  // 3. Functional Impairment vs. Cosmetic Exclusion Safeguards
  const [hasDocumentedVPI, setHasDocumentedVPI] = useState<boolean>(true); // Velopharyngeal insufficiency
  const [hasSpeechPathologyExam, setHasSpeechPathologyExam] = useState<boolean>(true);
  const [hasOrthodonticClassIII, setHasOrthodonticClassIII] = useState<boolean>(true);
  const [simulateCosmeticDenial, setSimulateCosmeticDenial] = useState<boolean>(false);

  // 4. Staged Global Period Sequencing
  const [isStagedRevision, setIsStagedRevision] = useState<boolean>(true);
  const [withinGlobalPeriod, setWithinGlobalPeriod] = useState<boolean>(true);
  const [modifier58Applied, setModifier58Applied] = useState<boolean>(true);

  // 5. Multi-Disciplinary Co-Surgery (e.g. Craniofacial Plastics + Pediatric Neurosurgery)
  const [coSurgeonMode, setCoSurgeonMode] = useState<'solo' | 'co_surgeon_compliant' | 'co_surgeon_mismatched'>('solo');

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

    // --- 1. PRIMARY PROCEDURE DEFINITIONS ---
    if (procedureType === 'palatoplasty_primary') {
      const rvu = 15.82;
      const fee = 1180.0;
      totalRvu += rvu;
      expectedReimbursement += fee;

      let mod = '';
      if (withinGlobalPeriod && isStagedRevision) {
        mod = modifier58Applied ? '58' : 'MISSING 58';
      }

      lines.push({
        code: '42200',
        desc: 'Palatoplasty for cleft palate, soft and/or hard palate only',
        mod: mod || 'None',
        rvu,
        fee,
        status: !mod.includes('MISSING') ? 'clean' : 'fatal',
        note: modifier58Applied
          ? 'Primary cleft palatoplasty billed with Modifier 58 for planned staged reconstruction.'
          : 'FATAL: Billed within 90-day global without Modifier 58 triggers duplicate/inclusive denial.',
      });
    } else if (procedureType === 'palatoplasty_alveolar_bone_graft') {
      const rvu = 23.45;
      const fee = 1750.0;
      totalRvu += rvu;
      expectedReimbursement += fee;

      let mod = '';
      if (withinGlobalPeriod && isStagedRevision) {
        mod = modifier58Applied ? '58' : 'MISSING 58';
      }

      lines.push({
        code: '42210',
        desc: 'Palatoplasty for cleft palate; with bone graft to alveolar ridge (includes obtaining graft)',
        mod: mod || 'None',
        rvu,
        fee,
        status: !mod.includes('MISSING') ? 'clean' : 'fatal',
        note: '42210 bundled code: specifically includes obtaining donor bone graft and inserting into maxilla.',
      });
    } else if (procedureType === 'palatal_lengthening_pharyngeal') {
      const rvu = 19.88;
      const fee = 1480.0;
      totalRvu += rvu;
      expectedReimbursement += fee;

      let mod = '';
      if (withinGlobalPeriod && isStagedRevision) {
        mod = modifier58Applied ? '58' : 'MISSING 58';
      }

      lines.push({
        code: '42205',
        desc: 'Palatoplasty for cleft palate, with closure of alveolar ridge; soft tissue only',
        mod: mod || 'None',
        rvu,
        fee,
        status: !mod.includes('MISSING') ? 'clean' : 'fatal',
        note: 'Secondary palatoplasty for velopharyngeal insufficiency (VPI) rehabilitation.',
      });
    } else if (procedureType === 'lefort_i_osteotomy') {
      const rvu = 34.6;
      const fee = 2580.0;
      totalRvu += rvu;
      expectedReimbursement += fee;

      let mod = coSurgeonMode === 'co_surgeon_compliant' ? '62' : '';

      lines.push({
        code: '21141',
        desc: 'Reconstruction midface, LeFort I; single piece, segment movement in any direction, without bone graft',
        mod: mod || 'None',
        rvu: coSurgeonMode === 'co_surgeon_compliant' ? rvu * 0.625 : rvu,
        fee: coSurgeonMode === 'co_surgeon_compliant' ? fee * 0.625 : fee,
        status: coSurgeonMode === 'co_surgeon_mismatched' ? 'fatal' : 'clean',
        note:
          coSurgeonMode === 'co_surgeon_compliant'
            ? 'Modifier 62 applied across matched surgical claims (paid at 62.5% standard allowance).'
            : 'Maxillary advancement for severe midface retrusion secondary to cleft palate.',
      });
    } else if (procedureType === 'cranial_vault_remodeling') {
      const rvu = 39.85;
      const fee = 2980.0;
      totalRvu += rvu;
      expectedReimbursement += fee;

      let mod = coSurgeonMode === 'co_surgeon_compliant' ? '62' : '';

      lines.push({
        code: '21175',
        desc: 'Reconstruction, bifrontal, superior-lateral orbital rims and lower forehead, advancement or alteration',
        mod: mod || 'None',
        rvu: coSurgeonMode === 'co_surgeon_compliant' ? rvu * 0.625 : rvu,
        fee: coSurgeonMode === 'co_surgeon_compliant' ? fee * 0.625 : fee,
        status: coSurgeonMode === 'co_surgeon_mismatched' ? 'fatal' : 'clean',
        note: 'Frontal-orbital advancement (FOA) for craniosynostosis (plagiocephaly/trigonocephaly).',
      });
    }

    // --- 2. BONE GRAFT UNBUNDLING AUDIT ---
    if (separateGraftHarvestCode) {
      const illegalGraftFee = 720.0;
      penaltyAtRisk += illegalGraftFee;

      if (procedureType === 'palatoplasty_alveolar_bone_graft') {
        lines.push({
          code: '20900',
          desc: 'Bone graft, any donor area; minor or small (e.g., iliac crest harvest)',
          mod: 'UNBUNDLED (PTP DENIAL)',
          rvu: 0,
          fee: 0,
          status: 'fatal',
          note: 'FATAL PTP NCCI CONFLICT: CPT 42210 descriptor explicitly states "includes obtaining graft". Separate harvest is unallowable.',
        });
        alerts.push({
          type: 'fatal',
          title: 'Illegal Bone Graft Harvest Unbundling (42210 + 20900/21210)',
          desc: `Descriptor for 42210 explicitly encompasses harvesting autologous bone from ${graftDonorSite.replace('_', ' ')}. Separate billing of 20900, 20902, or 21210 violates NCCI Chapter III edits and triggers automated denial without appeal rights.`,
          statute: 'NCCI Policy Manual Ch. III, Sec. D.8 & AMA CPT 42210 Instructions',
        });
      } else {
        // When done with other procedures, graft may require distinct justification
        lines.push({
          code: '21210',
          desc: 'Graft, bone; nasal, maxillary or malar areas (includes obtaining graft)',
          mod: '59',
          rvu: 14.5,
          fee: 1080.0,
          status: 'clean',
          note: 'Modifier 59 defended: Bone grafting performed alongside LeFort osteotomy or separate defect site.',
        });
        alerts.push({
          type: 'clean',
          title: 'Maxillofacial Bone Graft Validated (Modifier 59)',
          desc: `Distinct anatomical defect grafting supported with donor site harvest documentation (${graftDonorSite.replace('_', ' ')}).`,
          statute: 'AMA CPT Bone Graft Guidelines',
        });
      }
    } else if (procedureType === 'palatoplasty_alveolar_bone_graft') {
      alerts.push({
        type: 'clean',
        title: 'Compliant Graft Inclusivity',
        desc: `Alveolar bone grafting correctly billed under comprehensive CPT 42210. Donor site harvest from ${graftDonorSite.replace('_', ' ')} documented within operative report without unbundled harvest line items.`,
        statute: 'NCCI Comprehensive Surgical Guidelines',
      });
    }

    // --- 3. STAGED RECONSTRUCTION & MODIFIER 58 ---
    if (withinGlobalPeriod && isStagedRevision) {
      if (!modifier58Applied) {
        penaltyAtRisk += lines[0].fee;
        alerts.push({
          type: 'fatal',
          title: 'Fatal Postoperative Period Denial: Missing Modifier 58',
          desc: 'Procedure executed within the 90-day global surgical period of previous cleft surgery without Modifier 58. Commercial clearinghouses will reject claim as duplicate postoperative care.',
          statute: 'CMS Claims Processing Manual Pub. 100-04, Ch. 12, Sec. 40.1',
        });
      } else {
        alerts.push({
          type: 'clean',
          title: 'Modifier 58 Defended: Staged Cleft Protocol',
          desc: 'Secondary surgery documented as a prospectively planned multi-stage congenital cleft protocol. 100% of global fee retained.',
          statute: 'CMS Global Surgery Guidelines / Modifier 58',
        });
      }
    }

    // --- 4. COSMETIC EXCLUSION & MEDICAL NECESSITY DEFENSE ---
    if (simulateCosmeticDenial || (!hasDocumentedVPI && !hasOrthodonticClassIII)) {
      penaltyAtRisk += 2500.0;
      alerts.push({
        type: 'warning',
        title: 'Commercial Payer "Cosmetic Surgery" Exclusion Risk',
        desc: 'Commercial payers frequently deny cleft palate revisions, secondary rhinoplasties, and orthognathic surgery as cosmetic. Pre-authorization and claim submission must establish velopharyngeal dysfunction or masticatory collapse.',
        statute: 'ACA Section 1557 / State Congenital Defect Mandates',
      });
    } else {
      alerts.push({
        type: 'clean',
        title: 'Functional Defect Substantiated (Overturns Cosmetic Exclusions)',
        desc: `Medical necessity verified: Documented ${hasDocumentedVPI ? 'velopharyngeal insufficiency (VPI) with hypernasal speech' : ''} ${hasSpeechPathologyExam ? 'and formal videofluoroscopic / nasopharyngoscopic exam' : ''} ${hasOrthodonticClassIII ? 'with severe Class III malocclusion' : ''}.`,
        statute: 'State Cleft Lip & Palate Coverage Mandates / ICD-10 Q37.9, Q38.5',
      });
    }

    // --- 5. CO-SURGEON MODIFIER 62 AUDIT ---
    if (coSurgeonMode === 'co_surgeon_mismatched') {
      penaltyAtRisk += 1200.0;
      alerts.push({
        type: 'fatal',
        title: 'Modifier 62 Co-Surgery Desynchronization',
        desc: 'Pediatric Craniofacial Surgeon and Pediatric Neurosurgeon submitted differing primary CPT codes or mismatched clinical indications. Both claims will suspend pending synchronized operative dictations.',
        statute: 'Medicare Claims Processing Manual Ch. 12, Sec. 40.8',
      });
    } else if (coSurgeonMode === 'co_surgeon_compliant') {
      alerts.push({
        type: 'clean',
        title: 'Co-Surgeon Modifier 62 Verified',
        desc: 'Both specialties dictate separate surgical operative reports sharing identical primary CPT with Modifier 62 and cross-referencing co-surgeon role.',
        statute: 'CMS Inter-Specialty Co-Surgery Standard',
      });
    }

    return {
      lines,
      alerts,
      totalRvu: Math.round(totalRvu * 100) / 100,
      expectedReimbursement: Math.round(expectedReimbursement),
      penaltyAtRisk: Math.round(penaltyAtRisk),
    };
  }, [
    procedureType,
    separateGraftHarvestCode,
    graftDonorSite,
    hasDocumentedVPI,
    hasSpeechPathologyExam,
    hasOrthodonticClassIII,
    simulateCosmeticDenial,
    isStagedRevision,
    withinGlobalPeriod,
    modifier58Applied,
    coSurgeonMode,
  ]);

  // Copy Appeal / Scrub Summary
  const handleCopy = () => {
    const summaryText = `--- PEDIATRIC CRANIOFACIAL & CLEFT PALATE SCRUB REPORT ---
Procedure: ${procedureType.toUpperCase()}
Total wRVUs: ${scrubberResult.totalRvu}
Expected Reimbursement: $${scrubberResult.expectedReimbursement.toLocaleString()}
Revenue at Risk: $${scrubberResult.penaltyAtRisk.toLocaleString()}

CLAIM CODING BREAKDOWN:
${scrubberResult.lines
  .map(
    (l) =>
      `CPT ${l.code} [Mod: ${l.mod}] - ${l.desc} | wRVU: ${l.rvu} | Fee: $${l.fee} | Status: ${l.status.toUpperCase()}`
  )
  .join('\n')}

COMPLIANCE AUDIT FINDINGS:
${scrubberResult.alerts.map((a) => `[${a.type.toUpperCase()}] ${a.title}: ${a.desc} (Ref: ${a.statute})`).join('\n\n')}
`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit Audit Lead to Kiran
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail) return;

    setIsSubmitting(true);

    const payload = {
      leadType: 'pediatric_craniofacial_rcm_audit',
      contactName,
      contactEmail,
      practiceName,
      auditNotes,
      procedureType,
      graftDonorSite,
      separateGraftHarvestCode,
      hasDocumentedVPI,
      coSurgeonMode,
      totalRvu: scrubberResult.totalRvu,
      expectedReimbursement: scrubberResult.expectedReimbursement,
      penaltyAtRisk: scrubberResult.penaltyAtRisk,
      claimLines: scrubberResult.lines.map((l) => ({ code: l.code, fee: l.fee, status: l.status })),
      timestamp: new Date().toISOString(),
    };

    try {
      await sendLeadToKiran('pediatric_craniofacial_rcm_audit', payload);
      trackConversion('pediatric_craniofacial_rcm_audit_submit');
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold uppercase tracking-wider">
            <Smile className="w-3.5 h-3.5 text-teal-700" />
            Tool #59 • Pediatric Craniofacial &amp; Cleft Palate RCM
          </div>
          <span className="text-xs font-mono text-slate-500">CPT 42200-42210 • 21141-21175 • Mod 58 / 62</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-navy font-jakarta tracking-tight">
          Pediatric Craniofacial &amp; Cleft Palate Staging Scrubber
        </h2>
        <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-4xl">
          Audit complex pediatric cleft palatoplasty (42200-42210), midface LeFort osteotomies (21141), and cranial vault remodeling (21175). Defend against illegal bone graft harvest unbundling (20900), commercial cosmetic surgery exclusion denials, and missing staged procedure Modifier -58 penalties.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Configurations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Box 1: Primary Craniofacial Procedure */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-teal-600" />
              1. Primary Craniofacial / Cleft Procedure Scope
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Procedure Selection
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      id: 'palatoplasty_alveolar_bone_graft',
                      code: 'CPT 42210',
                      title: 'Palatoplasty with Alveolar Bone Graft',
                      desc: 'Secondary palatoplasty with iliac/tibial bone grafting to alveolar cleft. INCLUDES graft harvest.',
                    },
                    {
                      id: 'palatoplasty_primary',
                      code: 'CPT 42200',
                      title: 'Primary Cleft Palatoplasty (Soft/Hard)',
                      desc: 'Initial closure of infant cleft palate without alveolar ridge grafting.',
                    },
                    {
                      id: 'palatal_lengthening_pharyngeal',
                      code: 'CPT 42205',
                      title: 'Palatoplasty with Alveolar Soft Closure',
                      desc: 'Closure of alveolar ridge soft tissue or secondary revision for velopharyngeal insufficiency.',
                    },
                    {
                      id: 'lefort_i_osteotomy',
                      code: 'CPT 21141',
                      title: 'Midface LeFort I Osteotomy',
                      desc: 'Maxillary advancement for severe midface hypoplasia and skeletal Class III malocclusion.',
                    },
                    {
                      id: 'cranial_vault_remodeling',
                      code: 'CPT 21175',
                      title: 'Cranial Vault Remodeling (Frontal-Orbital)',
                      desc: 'Bifrontal advancement and supraorbital bar alteration for craniosynostosis.',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProcedureType(item.id as any)}
                      className={`text-left p-3.5 rounded-lg border transition-all ${
                        procedureType === item.id
                          ? 'border-teal-600 bg-teal-50/50 shadow-sm ring-1 ring-teal-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-navy">{item.title}</span>
                        <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: Bone Graft Harvest & Donor Site Audit */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Scissors className="w-5 h-5 text-teal-600" />
              2. Bone Graft Harvest &amp; Donor Site Audit
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Bone Graft Donor Site Source
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'iliac_crest', label: 'Iliac Crest' },
                    { id: 'tibia', label: 'Proximal Tibia' },
                    { id: 'calvarial', label: 'Calvarium (Skull)' },
                    { id: 'allograft', label: 'Allograft / DBM' },
                  ].map((site) => (
                    <button
                      key={site.id}
                      type="button"
                      onClick={() => setGraftDonorSite(site.id as any)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                        graftDonorSite === site.id
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {site.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={separateGraftHarvestCode}
                    onChange={(e) => setSeparateGraftHarvestCode(e.target.checked)}
                    className="mt-1 h-4 w-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800">
                      Attempt Separate Billing of Donor Harvest (CPT 20900 / 21210)
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Check this box to test what happens when coders attempt to bill a separate graft harvest line item alongside CPT 42210.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Box 3: Staged Global Period & Modifier 58 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <GitBranch className="w-5 h-5 text-teal-600" />
              3. Staged Congenital Protocol &amp; Global Period (Mod 58)
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={withinGlobalPeriod}
                    onChange={(e) => setWithinGlobalPeriod(e.target.checked)}
                    className="mt-1 h-4 w-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-navy block">Within 90-Day Global Period</span>
                    <span className="text-xs text-slate-500">Performed within 90 days of prior cleft or craniofacial surgery</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modifier58Applied}
                    disabled={!withinGlobalPeriod}
                    onChange={(e) => setModifier58Applied(e.target.checked)}
                    className="mt-1 h-4 w-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 disabled:opacity-50"
                  />
                  <div>
                    <span className="text-xs font-bold text-navy block">Append Modifier -58</span>
                    <span className="text-xs text-slate-500">Documented as prospectively planned staged reconstructive surgery</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Box 4: Commercial Cosmetic Exclusion & Functional Substantiation */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              4. Commercial Cosmetic Exclusion &amp; Medical Necessity Defense
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Substantiate functional speech, airway, or masticatory collapse to defeat commercial payer &quot;cosmetic surgery&quot; exclusions:
              </p>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDocumentedVPI}
                  onChange={(e) => setHasDocumentedVPI(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800">
                    Velopharyngeal Insufficiency (VPI) Documented (Hypernasality / Nasal Air Emission)
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSpeechPathologyExam}
                  onChange={(e) => setHasSpeechPathologyExam(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800">
                    Objective Videonasopharyngoscopy / Speech Pathology Evaluation in Chart
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasOrthodonticClassIII}
                  onChange={(e) => setHasOrthodonticClassIII(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800">
                    Severe Malocclusion Class III / Masticatory Functional Compromise (for LeFort)
                  </span>
                </div>
              </label>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateCosmeticDenial}
                    onChange={(e) => setSimulateCosmeticDenial(e.target.checked)}
                    className="mt-0.5 h-4 w-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-rose-800">
                      Simulate Commercial Cosmetic Denial Trigger (Payer Claims Aesthetic Exclusion)
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Box 5: Co-Surgery Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-navy font-bold text-base mb-4 border-b border-slate-100 pb-3">
              <Eye className="w-5 h-5 text-teal-600" />
              5. Multi-Specialty Co-Surgery Configuration (Modifier 62)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'solo',
                  label: 'Solo Surgeon',
                  desc: 'Single craniofacial plastic surgeon handles entire case.',
                },
                {
                  id: 'co_surgeon_compliant',
                  label: 'Compliant Co-Surgeons (Mod 62)',
                  desc: 'Plastics + Pediatric Neurosurgery with synchronized operative dictations.',
                },
                {
                  id: 'co_surgeon_mismatched',
                  label: 'Mismatched Dictations',
                  desc: 'Different CPT codes or conflicting indications reported by surgeons.',
                },
              ].map((co) => (
                <button
                  key={co.id}
                  type="button"
                  onClick={() => setCoSurgeonMode(co.id as any)}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    coSurgeonMode === co.id
                      ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold ring-1 ring-teal-500'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold block text-navy">{co.label}</span>
                  <span className="text-[11px] text-slate-500 mt-1 block leading-tight">{co.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Claim Scrubber Results & Revenue Defense */}
        <div className="lg:col-span-5 space-y-6">
          {/* Financial Summary Card */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Audited Claim Yield
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                {scrubberResult.totalRvu} Total wRVUs
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <span className="text-xs text-slate-500 block">Compliant Allowance</span>
                <span className="text-2xl font-extrabold text-navy">
                  ${scrubberResult.expectedReimbursement.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Estimated commercial yield</span>
              </div>
              <div className={`p-3.5 rounded-lg border ${
                scrubberResult.penaltyAtRisk > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <span className="text-xs font-medium block">
                  {scrubberResult.penaltyAtRisk > 0 ? 'Revenue at Risk' : 'Audit Defense'}
                </span>
                <span className="text-2xl font-extrabold">
                  ${scrubberResult.penaltyAtRisk > 0 ? scrubberResult.penaltyAtRisk.toLocaleString() : '$0'}
                </span>
                <span className="text-[11px] block mt-0.5">
                  {scrubberResult.penaltyAtRisk > 0 ? 'Denials / recoupment risk' : '100% clean scrub'}
                </span>
              </div>
            </div>

            {/* Generated Claim Lines Table */}
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Audited CMS-1500 / 837P Claim Lines
              </span>
              <div className="space-y-2">
                {scrubberResult.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs ${
                      line.status === 'fatal'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : line.status === 'warning'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="text-navy">{line.code}</span>
                        {line.mod && line.mod !== 'None' && (
                          <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                            line.mod.includes('UNBUNDLED') || line.mod.includes('MISSING')
                              ? 'bg-rose-200 text-rose-900'
                              : 'bg-teal-200 text-teal-900'
                          }`}>
                            {line.mod}
                          </span>
                        )}
                      </span>
                      <span>${line.fee.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{line.desc}</p>
                    <p className={`text-[10px] mt-1 font-medium ${
                      line.status === 'fatal' ? 'text-rose-700' : 'text-slate-500'
                    }`}>
                      {line.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Alerts Stack */}
            <div className="space-y-2.5 mb-6">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Compliance &amp; Payer Defense Findings
              </span>
              {scrubberResult.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs ${
                    alert.type === 'fatal'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : alert.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-teal-50/60 border-teal-200 text-teal-950'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {alert.type === 'fatal' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : alert.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    )}
                    <span>{alert.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed mb-1.5">{alert.desc}</p>
                  <span className="text-[10px] font-mono text-slate-500 block font-medium">
                    Ref: {alert.statute}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Audit Copied to Clipboard' : 'Copy Full Audit & Appeal Package'}
              </button>

              <button
                type="button"
                onClick={() => setShowLeadModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-teal-700 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <Zap className="w-4 h-4 text-teal-300" />
                Request Expert Craniofacial RCM Audit
              </button>
            </div>
          </div>

          {/* Quick Explainer Card */}
          <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Info className="w-4 h-4 text-amber-700" />
              State Cleft Palate Mandates &amp; ACA Section 1557 Safeguards
            </div>
            <p className="leading-relaxed">
              Over 35 states enforce statutory mandates requiring commercial health insurers to cover comprehensive
              cleft lip and palate rehabilitative care without arbitrary cosmetic exclusions. Any denial claiming
              palatoplasty revisions or alveolar bone grafts are &quot;cosmetic&quot; can be immediately overturned by
              citing state-specific mandates and ACA Section 1557 non-discrimination protections.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Dispatch Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <h3 className="text-xl font-bold text-navy mb-2">
              Request Sovereign Craniofacial RCM Audit
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Submit your pediatric craniofacial scrub parameters directly to our expert surgical billing team. We verify
              alveolar graft unbundling defense, Modifier 58 staged sequences, and cosmetic denial overturns.
            </p>

            {leadSuccess ? (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
                <p className="font-bold text-sm">Audit Dispatched Successfully</p>
                <p className="text-xs text-teal-700">
                  Our surgical billing directors will review your clinical protocol within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name / Surgical Title
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Jenkins, MD (Pediatric Craniofacial)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="doctor@childrenshospital.org"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hospital / Children&apos;s Health System Name
                  </label>
                  <input
                    type="text"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder="e.g. Children&apos;s National Health System"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specific Denial Patterns / Clearinghouse Issues
                  </label>
                  <textarea
                    rows={3}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder="e.g. Commercial payer denied alveolar bone grafting as bundled into 42200; appealing cosmetic exclusion for teen rhinoplasty..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowLeadModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Dispatch Audit Request
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
