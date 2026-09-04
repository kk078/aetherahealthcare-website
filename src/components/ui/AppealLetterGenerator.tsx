'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Copy,
  Check,
  Printer,
  Sparkles,
  Building2,
} from 'lucide-react';

interface DenialTemplate {
  code: string;
  name: string;
  reason: string;
  legalCitation: string;
  clinicalArgument: (data: FormData) => string;
}

interface FormData {
  practiceName: string;
  providerName: string;
  providerNpi: string;
  payerName: string;
  patientName: string;
  memberId: string;
  dos: string;
  claimId: string;
  billedAmount: string;
  appealLevel: string;
}

const TEMPLATES: Record<string, DenialTemplate> = {
  '50': {
    code: 'CARC 50',
    name: 'Medical Necessity / LCD Denial',
    reason: 'Non-covered services — not deemed medically necessary under payer policy.',
    legalCitation: 'CMS Medicare Claims Processing Manual (Pub. 100-04, Ch. 1) & ACA § 2719',
    clinicalArgument: (d) => `The documentation submitted establishes that the services rendered to ${d.patientName} on ${d.dos} were medically necessary, clinically indicated, and fully supported by the patient's presenting symptoms, severity of illness, and prior failed conservative therapies.

The procedure and diagnostic workup were furnished in accordance with accepted standards of medical practice and meet the specific criteria outlined under your published Clinical Coverage Guidelines and Local Coverage Determination (LCD). Enclosed please find the complete contemporaneous medical record, including clinical progress notes, objective test findings, and pathology reports documenting medical necessity.`,
  },
  '197': {
    code: 'CARC 197',
    name: 'Prior Authorization Absent / Denied',
    reason: 'Precertification/authorization/notification absent.',
    legalCitation: 'ERISA 29 CFR § 2560.503-1 & CMS Claims Processing Manual Ch. 29',
    clinicalArgument: (d) => `We are appealing the denial of Claim #${d.claimId} based on absence of prior authorization. The patient presented with acute, urgent clinical symptoms that precluded obtaining pre-service authorization without delaying vital, time-sensitive patient care.

Under your policy exceptions for urgent/emergent medical necessity, retrospective clinical review is permitted when delay would jeopardize the patient's health. Enclosed please find the operative and clinical records validating the emergent nature of the intervention, along with documented proof of medical necessity.`,
  },
  '16': {
    code: 'CARC 16',
    name: 'Incomplete Claim / Missing Information',
    reason: 'Claim lacks information needed for adjudication.',
    legalCitation: 'HIPAA Standard Transactions 45 CFR Part 162 & X12 837P Standards',
    clinicalArgument: (d) => `This letter accompanies our corrected claim submission for Claim #${d.claimId}. The initial remittance cited CARC 16 for missing or incomplete billing elements.

We have audited and confirmed all required data loops:
1. Rendering Provider NPI (${d.providerNpi}) and billing taxonomy are verified in Box 24J/33A.
2. Distinct ICD-10 diagnosis pointers are accurately assigned to each individual service line.
3. Relevant supporting modifiers and clinical attachments are enclosed herein.

Please re-adjudicate this corrected claim and release prompt reimbursement.`,
  },
  '29': {
    code: 'CARC 29',
    name: 'Timely Filing Limit Exceeded',
    reason: 'The time limit for filing has expired.',
    legalCitation: 'CMS Claims Processing Manual, Pub. 100-04, Ch. 1, § 70 & Clearinghouse 277CA Audit Rules',
    clinicalArgument: (d) => `We respectfully contest the timely filing denial issued for Claim #${d.claimId} (Date of Service: ${d.dos}).

Enclosed is verifiable electronic clearinghouse audit documentation (EDI 277CA Acceptance Report and 999 Functional Acknowledgement) establishing that our initial claim was successfully transmitted and accepted by your electronic payer gateway on [Insert Date of First Transmission], which falls well within your contractual filing window of [Insert Days, e.g., 90 or 180] days from the date of service.

The clearinghouse batch confirmation demonstrates timely transmission in compliance with federal electronic transaction standards.`,
  },
  '97': {
    code: 'CARC 97',
    name: 'Bundled Service / Distinct Procedure',
    reason: 'Benefit included in payment for another procedure.',
    legalCitation: 'CMS National Correct Coding Initiative (NCCI) Policy Manual, Ch. 1',
    clinicalArgument: (d) => `We are appealing the bundling reduction of secondary procedures billed under Claim #${d.claimId}.

Under CMS NCCI guidelines, the secondary procedure represents a distinct, separately identifiable medical service supported by Modifier -25 or -59/-XS. The medical record clearly demonstrates:
1. Independent clinical decision-making separate from the minor surgical/diagnostic procedure.
2. A distinct anatomical site or separate patient encounter on the same date of service.
3. Supporting documentation meeting all American Medical Association (AMA) CPT coding conventions.`,
  },
  '22': {
    code: 'CARC 22',
    name: 'Coordination of Benefits (COB)',
    reason: 'Care may be covered by another payer per coordination of benefits.',
    legalCitation: 'NAIC Coordination of Benefits Model Regulation & ACA Rules',
    clinicalArgument: (d) => `We are appealing the COB denial for Claim #${d.claimId}.

Enclosed is the primary Explanation of Benefits (EOB / 835 Remittance) from the primary commercial/Medicare insurer, demonstrating that primary adjudication was fully completed. The remaining balance represents the patient's deductible/coinsurance or non-covered balance properly forwarded to your plan as secondary/tertiary coverage.

Please process this secondary claim in accordance with standard NAIC coordination of benefits rules.`,
  },
};

export default function AppealLetterGenerator() {
  const [selectedCode, setSelectedCode] = useState<string>('50');
  const [copied, setCopied] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    practiceName: 'Tampa Bay Medical Specialists, LLC',
    providerName: 'Dr. Robert Harrison, MD',
    providerNpi: '1982736450',
    payerName: 'Aetna Appeals & Grievances Unit',
    patientName: 'Jane Doe',
    memberId: 'W987654321',
    dos: '04/18/2026',
    claimId: 'CLM-982410',
    billedAmount: '$850.00',
    appealLevel: 'Level 1 Formal Appeal',
  });

  const activeTemplate = TEMPLATES[selectedCode] || TEMPLATES['50'];

  const generatedLetter = `DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

TO:
${formData.payerName}
Appeals & Dispute Resolution Department

FROM:
${formData.practiceName}
Attn: ${formData.providerName} (NPI: ${formData.providerNpi})

RE: FORMAL WRITTEN APPEAL — ${formData.appealLevel.toUpperCase()}
Patient Name: ${formData.patientName}
Member / Subscriber ID: ${formData.memberId}
Date of Service: ${formData.dos}
Claim / Reference Number: ${formData.claimId}
Total Disputed Amount: ${formData.billedAmount}
Denial Reason: ${activeTemplate.code} — ${activeTemplate.reason}

Dear Appeals Committee:

Please accept this formal written appeal on behalf of ${formData.patientName} and ${formData.providerName} regarding the denial of Claim #${formData.claimId}. We request an immediate re-adjudication and reversal of this denial pursuant to ${activeTemplate.legalCitation}.

CLINICAL & REGULATORY RATIONALE:
${activeTemplate.clinicalArgument(formData)}

SUPPORTING DOCUMENTATION ENCLOSED:
1. Complete signed clinical notes, operative reports, and encounter documentation.
2. Primary Explanation of Benefits (EOB) and Electronic Remittance Advice (835).
3. Relevant CMS NCCI guidelines and published payer coverage criteria.

Under applicable federal regulations and state prompt-pay statutes, we request a formal written determination within thirty (30) days of receipt of this appeal.

Sincerely,

__________________________________________
${formData.providerName}, Provider NPI: ${formData.providerNpi}
${formData.practiceName}
Phone: (813) 519-4640 | Direct Partner Desk: kirkmar078@gmail.com`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden font-inter">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-[#003087] to-teal p-6 text-white">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cream text-xs font-semibold uppercase tracking-wider mb-2">
          <FileText className="h-3.5 w-3.5 text-mint" /> Healthcare Denial Appeal Library
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-jakarta">
          Medical Denial Appeal Letter Generator
        </h2>
        <p className="text-xs sm:text-sm text-cream/90 max-w-2xl mt-1">
          Generate formal, clinically grounded appeal letters with statutory citations (ERISA, ACA § 2719, CMS NCCI)
          tailored to your specific denial reason.
        </p>

        {/* Template Selector Pills */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">
            Select Denial Type:
          </p>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCode(key)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedCode === key
                    ? 'bg-mint text-navy font-bold shadow-xs'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {t.code}: {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor & Live Letter Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 p-6 bg-slate-50 border-r border-slate-200 space-y-3.5">
          <h3 className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-teal" /> Claim &amp; Provider Variables
          </h3>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Practice Name</label>
            <input
              type="text"
              value={formData.practiceName}
              onChange={(e) => setFormData({ ...formData, practiceName: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Provider Name</label>
              <input
                type="text"
                value={formData.providerName}
                onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Provider NPI</label>
              <input
                type="text"
                value={formData.providerNpi}
                onChange={(e) => setFormData({ ...formData, providerNpi: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Payer Name</label>
            <input
              type="text"
              value={formData.payerName}
              onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Patient Name</label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Member ID</label>
              <input
                type="text"
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Date of Service</label>
              <input
                type="text"
                value={formData.dos}
                onChange={(e) => setFormData({ ...formData, dos: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Claim #</label>
              <input
                type="text"
                value={formData.claimId}
                onChange={(e) => setFormData({ ...formData, claimId: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Disputed $</label>
              <input
                type="text"
                value={formData.billedAmount}
                onChange={(e) => setFormData({ ...formData, billedAmount: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Appeal Level</label>
            <select
              value={formData.appealLevel}
              onChange={(e) => setFormData({ ...formData, appealLevel: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-teal"
            >
              <option value="Level 1 Formal Appeal">Level 1 Formal Written Appeal</option>
              <option value="Level 2 Reconsideration">Level 2 Reconsideration / Grievance</option>
              <option value="External Independent Review">External Independent Review Organization (IRO)</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('open-expert-modal', {
                    detail: {
                      mode: 'chat',
                      initialQuery: `Can you draft a clinical appeal for denial ${activeTemplate.code} (${activeTemplate.name}) for claim ${formData.claimId}?`,
                    },
                  })
                );
              }}
              className="w-full py-2 px-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold hover:bg-teal-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>Ask AI Expert for Clinical Narrative</span>
            </button>
          </div>
        </div>

        {/* Right Live Document Preview (7 Cols) */}
        <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <span className="text-xs font-bold text-navy uppercase tracking-wide">
                Live Letter Preview ({activeTemplate.code})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-bold text-[#003087] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>

            {/* Simulated Paper Document */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 font-mono text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap select-all max-h-[520px] overflow-y-auto">
              {generatedLetter}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Statutory Legal Standard: {activeTemplate.legalCitation}</span>
            <Link href="/free-assessment" className="text-teal font-bold hover:underline">
              Let Aethera Handle 100% of Appeals →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
