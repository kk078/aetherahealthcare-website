'use client';

import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  Scale,
  Sparkles,
  BookOpen,
  ArrowRight,
  Send,
  Loader2,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

export default function ModifierComplianceEngine() {
  const [activeTab, setActiveTab] = useState<'mod25' | 'mod59'>('mod25');

  // Modifier 25 Questions
  const [q25MinorProcedure, setQ25MinorProcedure] = useState<boolean | null>(null);
  const [q25DecisionOrCondition, setQ25DecisionOrCondition] = useState<boolean | null>(null);
  const [q25SeparateMdm, setQ25SeparateMdm] = useState<boolean | null>(null);
  const [q25DifferentDiagnosis, setQ25DifferentDiagnosis] = useState<boolean | null>(null);

  // Modifier 59 / X{EPSU} Questions
  const [xDistinctType, setXDistinctType] = useState<'session' | 'structure' | 'practitioner' | 'unusual' | 'none'>('structure');
  const [q59NcciEditPair, setQ59NcciEditPair] = useState<string>('99214_11102');

  // Copy justification state
  const [copiedJustification, setCopiedJustification] = useState(false);

  // Lead request
  const [contactName, setContactName] = useState('');
  const [practiceEmail, setPracticeEmail] = useState('');
  const [auditNotes, setAuditNotes] = useState('');
  const [leadStatus, setLeadStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Compute Modifier 25 Compliance Status
  const mod25Compliant = q25MinorProcedure && q25DecisionOrCondition && q25SeparateMdm;
  const mod25Risk =
    q25MinorProcedure === false || q25SeparateMdm === false;

  const handleCopyJustification = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedJustification(true);
    setTimeout(() => setCopiedJustification(false), 2000);
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadStatus('submitting');
    try {
      const ok = await sendLeadToKiran('modifier_compliance_audit_request', {
        contactName,
        email: practiceEmail,
        notes: auditNotes || 'Routine modifier audit request',
        activeWorkflow: activeTab === 'mod25' ? 'Modifier 25 Same-Day E/M' : 'Modifier 59 / X{EPSU} Distinct Service',
        source: 'Modifier Compliance Engine (/tools/modifier-compliance-engine)',
        submittedAt: new Date().toISOString(),
      });
      if (ok) {
        setLeadStatus('success');
      } else {
        setLeadStatus('error');
      }
    } catch {
      setLeadStatus('error');
    }
  };

  const mod25JustificationText = `CLINICAL MODIFIER 25 AUDIT ATTESTATION
Pursuant to CMS Claims Processing Manual (Pub. 100-04, Ch. 12, § 30.6.6) and CPT guidelines:
1. A significant, separately identifiable Evaluation and Management service was provided concurrently on the date of procedure.
2. The E/M service addressed medical complexity distinct from the standard pre-, intra-, and post-procedure work inherent to the surgical/injection code.
3. Documentation substantiates independent history, medical decision-making (MDM), and distinct management plan.
4. Modifier 25 is appended to the appropriate E/M level (99202–99215) with primary diagnosis indicated in Box 24E.`;

  const modXJustificationText = `CMS NCCI SUB-MODIFIER ATTESTATION (${xDistinctType === 'structure' ? 'MODIFIER XS' : xDistinctType === 'session' ? 'MODIFIER XE' : xDistinctType === 'practitioner' ? 'MODIFIER XP' : 'MODIFIER XU'})
Pursuant to CMS Transmittal 1421 / CR 8863:
1. The secondary procedure qualifies as a distinct procedural service meeting official NCCI PTP modifier indicators.
2. Distinct anatomical structure / separate lesion / separate encounter verified in operative documentation.
3. Modifier ${xDistinctType === 'structure' ? 'XS' : xDistinctType === 'session' ? 'XE' : xDistinctType === 'practitioner' ? 'XP' : 'XU'} appended to column 2 code to substantiate appropriate unbundling.`;

  return (
    <div className="space-y-8 font-inter">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray/15 dark:border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray/10 dark:border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal dark:text-mint text-xs font-bold uppercase tracking-wider mb-2">
              <Scale className="w-3.5 h-3.5" />
              CMS NCCI PTP &amp; OIG Audit Defense
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-jakarta text-navy dark:text-white">
              Modifier 25 &amp; 59 / X&#123;EPSU&#125; Compliance Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Prevent CARC 97 unbundling clawbacks and commercial payer audits with step-by-step clinical justification logic.
            </p>
          </div>

          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('mod25')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'mod25'
                  ? 'bg-navy text-white dark:bg-teal shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-navy dark:hover:text-white'
              }`}
            >
              Modifier 25 (Same-Day E/M)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mod59')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'mod59'
                  ? 'bg-navy text-white dark:bg-teal shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-navy dark:hover:text-white'
              }`}
            >
              Modifier 59 / X&#123;EPSU&#125;
            </button>
          </div>
        </div>

        {/* Tab 1: Modifier 25 Decision Tree */}
        {activeTab === 'mod25' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
            {/* Left 7 Cols: 4 Clinical Qualification Gates */}
            <div className="lg:col-span-7 space-y-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Clinical Qualification Gates (CMS Claims Processing Manual § 30.6.6)
              </div>

              {/* Gate 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-bold text-navy dark:text-white">
                    1. Is the procedure a minor surgical service or injection (0 or 10-day global period)?
                  </span>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQ25MinorProcedure(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        q25MinorProcedure === true ? 'bg-teal text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setQ25MinorProcedure(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        q25MinorProcedure === false ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Examples: Joint injection (20610), skin biopsy (11102), laceration repair, cerumen removal (69210). If major surgery (90-day global), Modifier 57 applies instead!
                </p>
              </div>

              {/* Gate 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-bold text-navy dark:text-white">
                    2. Did the provider evaluate a new clinical problem or make the decision for surgery during this visit?
                  </span>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQ25DecisionOrCondition(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        q25DecisionOrCondition === true ? 'bg-teal text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setQ25DecisionOrCondition(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        q25DecisionOrCondition === false ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  A scheduled visit solely for a planned injection does NOT qualify for a separate E/M unless unexpected complications or new symptoms arise.
                </p>
              </div>

              {/* Gate 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-bold text-navy dark:text-white">
                    3. Does clinical documentation stand alone without reference to the procedure?
                  </span>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQ25SeparateMdm(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        q25SeparateMdm === true ? 'bg-teal text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setQ25SeparateMdm(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        q25SeparateMdm === false ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  If you remove the procedure notes completely, does the remaining record substantiate full E/M history, exam, and medical decision making?
                </p>
              </div>

              {/* Gate 4 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-bold text-navy dark:text-white">
                    4. Does the visit carry a distinct ICD-10 diagnosis code? (Helpful, but not legally mandatory under CMS rules)
                  </span>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQ25DifferentDiagnosis(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        q25DifferentDiagnosis === true ? 'bg-teal text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setQ25DifferentDiagnosis(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        q25DifferentDiagnosis === false ? 'bg-slate-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Same Dx
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  CMS guidelines explicitly state that a separate diagnosis is NOT required, but pairing with a distinct ICD-10 reduces commercial prepay audits by 46%.
                </p>
              </div>
            </div>

            {/* Right 5 Cols: Compliance Verdict & Attestation Generator */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-[11px] font-bold text-teal uppercase tracking-wider">
                    Audit Verification Status
                  </span>
                  <span className="text-xs font-mono text-slate-400">CMS § 30.6.6</span>
                </div>

                {mod25Compliant ? (
                  <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2 font-bold text-sm text-mint">
                      <CheckCircle2 className="w-5 h-5 text-mint" />
                      Modifier 25 Fully Substantiated
                    </div>
                    <p className="text-xs leading-relaxed text-emerald-100">
                      All core CMS criteria are satisfied. Append Modifier 25 to the evaluation and management code (e.g. <strong>99214-25</strong>) and link to Box 24E.
                    </p>
                  </div>
                ) : mod25Risk ? (
                  <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      High Audit / Recoupment Risk
                    </div>
                    <p className="text-xs leading-relaxed text-rose-100">
                      Do NOT append Modifier 25. Standard pre-procedure examination work is already factored into the procedure RVU. Billing an E/M invites CARC 97 denials and OIG false claim scrutiny.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs leading-relaxed">
                    Complete the 4 clinical qualification gates on the left to evaluate audit risk and generate legal attestation text.
                  </div>
                )}

                {/* Audit Attestation Text Area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Audit Defense Attestation</span>
                    <button
                      type="button"
                      onClick={() => handleCopyJustification(mod25JustificationText)}
                      className="inline-flex items-center gap-1 text-[11px] text-teal hover:text-white transition"
                    >
                      {copiedJustification ? <Check className="w-3.5 h-3.5 text-mint" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedJustification ? 'Copied' : 'Copy Attestation'}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                    {mod25JustificationText}
                  </pre>
                </div>
              </div>

              {/* Free Modifier Audit Lead Capture */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray/15 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-navy dark:text-white uppercase tracking-wider">
                  Facing Commercial Modifier 25 Pre-Pay Audits?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Payers like Cigna and UnitedHealthcare routinely flag high Modifier 25 billers. Let Aethera audit 20 sample charts to verify bulletproof medical necessity.
                </p>

                {leadStatus === 'success' ? (
                  <div className="p-3 rounded-xl bg-mint/15 border border-mint/30 text-teal dark:text-mint text-xs font-semibold">
                    Request submitted directly to Kiran. We will reach out shortly.
                  </div>
                ) : (
                  <form onSubmit={handleAuditSubmit} className="space-y-2 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="Contact Name"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray/25 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Practice Work Email"
                      value={practiceEmail}
                      onChange={e => setPracticeEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray/25 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={leadStatus === 'submitting'}
                      className="w-full py-2 rounded-xl bg-teal text-white font-bold hover:bg-navy transition flex items-center justify-center gap-1.5"
                    >
                      {leadStatus === 'submitting' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Request Free Chart Review
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Modifier 59 / X{EPSU} Decision Tree */}
        {activeTab === 'mod59' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
            {/* Left 7 Cols: Specific Sub-Modifier Selector */}
            <div className="lg:col-span-7 space-y-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                CMS Specific Distinct Sub-Modifier Rules (CR 8863)
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setXDistinctType('structure')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    xDistinctType === 'structure'
                      ? 'bg-navy text-white border-navy shadow-md dark:bg-slate-800 dark:border-teal'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-gray/15 dark:border-slate-800 hover:border-teal'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold font-jakarta text-sm">Modifier XS: Separate Organ / Structure</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal/20 text-teal dark:text-mint">Recommended</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    A service performed on a separate organ, distinct anatomical site, contralateral limb, or different skin lesion. Takes legal precedence over general Modifier 59 on Medicare Part B claims.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setXDistinctType('session')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    xDistinctType === 'session'
                      ? 'bg-navy text-white border-navy shadow-md dark:bg-slate-800 dark:border-teal'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-gray/15 dark:border-slate-800 hover:border-teal'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold font-jakarta text-sm">Modifier XE: Separate Encounter</span>
                    <span className="text-xs font-mono text-slate-400">Same Date / Different Time</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    A service that is distinct because it occurred during a separate patient encounter on the same date of service (e.g. morning clinic visit, afternoon emergency return).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setXDistinctType('practitioner')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    xDistinctType === 'practitioner'
                      ? 'bg-navy text-white border-navy shadow-md dark:bg-slate-800 dark:border-teal'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-gray/15 dark:border-slate-800 hover:border-teal'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold font-jakarta text-sm">Modifier XP: Separate Practitioner</span>
                    <span className="text-xs font-mono text-slate-400">Different Clinician</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    A service that is distinct because it was performed by a different practitioner within the same group practice or multi-specialty clinic.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setXDistinctType('unusual')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    xDistinctType === 'unusual'
                      ? 'bg-navy text-white border-navy shadow-md dark:bg-slate-800 dark:border-teal'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-gray/15 dark:border-slate-800 hover:border-teal'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold font-jakarta text-sm">Modifier XU: Unusual Non-Overlapping Service</span>
                    <span className="text-xs font-mono text-slate-400">Non-Overlapping Component</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    The use of a service that is distinct because it does not overlap usual components of the main service (e.g. diagnostic testing performed for unrelated indications).
                  </p>
                </button>
              </div>
            </div>

            {/* Right 5 Cols: Modifier Recommendation & Attestation */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-5">
                <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-teal uppercase tracking-wider">Recommended Coding</span>
                  <span className="text-xs font-mono text-mint">CMS Approved</span>
                </div>

                <div className="p-4 rounded-2xl bg-teal/15 border border-teal/30 space-y-2">
                  <div className="text-lg font-bold text-white font-jakarta">
                    Append {xDistinctType === 'structure' ? 'Modifier XS' : xDistinctType === 'session' ? 'Modifier XE' : xDistinctType === 'practitioner' ? 'Modifier XP' : 'Modifier XU'}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    CMS explicitly instructs MACs to prioritize specific -X modifiers over general Modifier 59. Commercial payers (UHC, BCBS) also resolve claims faster without manual documentation requests when specific -X modifiers are used.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Audit Defense Phrasing</span>
                    <button
                      type="button"
                      onClick={() => handleCopyJustification(modXJustificationText)}
                      className="inline-flex items-center gap-1 text-[11px] text-teal hover:text-white transition"
                    >
                      {copiedJustification ? <Check className="w-3.5 h-3.5 text-mint" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedJustification ? 'Copied' : 'Copy Attestation'}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                    {modXJustificationText}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
