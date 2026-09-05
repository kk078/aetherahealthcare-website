'use client';

import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Send,
  Loader2,
  ArrowRight,
  Sparkles,
  Info,
  DollarSign,
  HelpCircle,
  FileCode,
  CheckCircle2,
  Beaker,
  Stethoscope,
  BadgeAlert,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

interface TrialLineItem {
  id: string;
  cptCode: string;
  description: string;
  standardCategory: 'routine_care' | 'research_only' | 'investigational_item' | 'ide_device';
  sponsorPaidDefault: boolean;
}

const SAMPLE_STUDY_ITEMS: TrialLineItem[] = [
  {
    id: 'em_visit',
    cptCode: '99214',
    description: 'Office Visit — Level 4 Established Patient (Safety & toxicity monitoring)',
    standardCategory: 'routine_care',
    sponsorPaidDefault: false,
  },
  {
    id: 'routine_cbc',
    cptCode: '85025',
    description: 'Complete Blood Count (CBC) with automated differential',
    standardCategory: 'routine_care',
    sponsorPaidDefault: false,
  },
  {
    id: 'routine_cmp',
    cptCode: '80053',
    description: 'Comprehensive Metabolic Panel (CMP - Renal & hepatic surveillance)',
    standardCategory: 'routine_care',
    sponsorPaidDefault: false,
  },
  {
    id: 'ct_scan',
    cptCode: '71260',
    description: 'Computed Tomography (CT) Thorax with contrast (Response evaluation)',
    standardCategory: 'routine_care',
    sponsorPaidDefault: false,
  },
  {
    id: 'protocol_biopsy',
    cptCode: '88305',
    description: 'Protocol-Mandated Extra Tissue Biopsy (Purely for biomarker research)',
    standardCategory: 'research_only',
    sponsorPaidDefault: true,
  },
  {
    id: 'investigational_drug',
    cptCode: 'J9999 / Unlisted',
    description: 'Investigational Monoclonal Antibody Drug Administration',
    standardCategory: 'investigational_item',
    sponsorPaidDefault: true,
  },
  {
    id: 'ide_device_cat_b',
    cptCode: 'C1882',
    description: 'Category B Investigational Medical Device (Pre-approved FDA IDE)',
    standardCategory: 'ide_device',
    sponsorPaidDefault: false,
  },
];

export default function ClinicalTrialScrubber() {
  const [nctNumber, setNctNumber] = useState<string>('NCT04882195');
  const [studyType, setStudyType] = useState<'ncd_310_qualifying' | 'ide_cat_b' | 'ide_cat_a'>('ncd_310_qualifying');
  const [selectedItems, setSelectedItems] = useState<string[]>([
    'em_visit',
    'routine_cbc',
    'routine_cmp',
    'protocol_biopsy',
    'investigational_drug',
  ]);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadOrg, setLeadOrg] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  // Validate NCT format
  const isNctValid = useMemo(() => {
    return /^NCT\d{8}$/i.test(nctNumber.trim());
  }, [nctNumber]);

  // Billing Classifications
  const scrubbedResults = useMemo(() => {
    const items = SAMPLE_STUDY_ITEMS.filter((item) => selectedItems.includes(item.id));

    let medicareCoveredLines = 0;
    let sponsorLines = 0;

    const classified = items.map((item) => {
      if (item.standardCategory === 'routine_care') {
        medicareCoveredLines++;
        return {
          ...item,
          billTo: 'Medicare Part B',
          modifier: 'Modifier Q1',
          secondaryDx: 'Z00.6',
          status: 'Covered Routine Cost (NCD 310.1)',
          ediLoop: `Loop 2300 REF*P4*${nctNumber.toUpperCase() || 'NCTXXXXXXXX'} & SV1 with Modifier Q1`,
          guidance:
            'Covered by Medicare as reasonable and necessary routine clinical care. Must append Modifier Q1 and include diagnosis Z00.6.',
        };
      } else if (item.standardCategory === 'ide_device') {
        if (studyType === 'ide_cat_b') {
          medicareCoveredLines++;
          return {
            ...item,
            billTo: 'Medicare Part B (Pre-authorized)',
            modifier: 'Modifier Q0 / QA',
            secondaryDx: 'Z00.6',
            status: 'Category B IDE Device (Covered with Approval)',
            ediLoop: 'Loop 2300 REF*P4 (NCT#) + REF*LX (FDA IDE#)',
            guidance:
              'Covered under Medicare IDE policy with prior CMS approval letter. IDE number must appear on claim.',
          };
        } else {
          sponsorLines++;
          return {
            ...item,
            billTo: 'Trial Sponsor (Invoice)',
            modifier: 'Modifier Q0 (Non-covered)',
            secondaryDx: 'None',
            status: 'Category A Device (Non-Covered by Medicare)',
            ediLoop: 'Do NOT bill to Medicare; invoice study sponsor directly.',
            guidance:
              'Category A devices are experimental. Medicare strictly refuses payment; device must be provided cost-free by sponsor.',
          };
        }
      } else {
        // research_only or investigational_item
        sponsorLines++;
        return {
          ...item,
          billTo: 'Clinical Trial Sponsor',
          modifier: 'Modifier Q0 (if billed) or Direct Invoice',
          secondaryDx: 'N/A',
          status: 'Sponsor-Funded Research Item',
          ediLoop: 'Invoice directly to Clinical Research Organization (CRO) / Sponsor.',
          guidance:
            'Research-only biopsies, investigational drugs, and protocol visits cannot be billed to Medicare. Double billing violates the False Claims Act.',
        };
      }
    });

    return {
      classified,
      medicareCoveredLines,
      sponsorLines,
    };
  }, [selectedItems, studyType, nctNumber]);

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const copyReport = () => {
    const reportText = `CMS CLINICAL TRIAL BILLING & COVERAGE ANALYSIS SCRUB REPORT
Generated via Aethera Healthcare Solutions (https://aetherahealthcare.com/tools/clinical-trial-billing)

TRIAL METADATA:
• National Clinical Trial Number: ${nctNumber.toUpperCase()} (Validation: ${isNctValid ? 'VALID' : 'INVALID FORMAT'})
• Trial Policy Category: ${studyType.toUpperCase()} (NCD 310.1)

LINE ITEM COVERAGE SCRUBBING (${scrubbedResults.classified.length} items evaluated):
${scrubbedResults.classified
  .map(
    (item) => `[${item.cptCode}] ${item.description}
  -> Bill To: ${item.billTo} | Required Modifier: ${item.modifier}
  -> Secondary Diagnosis: ${item.secondaryDx}
  -> EDI Specification: ${item.ediLoop}
  -> Compliance Note: ${item.guidance}`
  )
  .join('\n\n')}

COMPLIANCE SUMMARY:
• Medicare Part B Billable Routine Lines: ${scrubbedResults.medicareCoveredLines}
• Trial Sponsor / CRO Billable Lines: ${scrubbedResults.sponsorLines}

AETHERA COVERAGE ANALYSIS PROTOCOL:
1. Ensure 8-digit NCT number is populated in Field 19 (CMS-1500) or Loop 2300 REF*P4 on 837P.
2. Link secondary diagnosis ICD-10 Z00.6 to all routine service lines.
3. Verify that the clinical trial agreement (CTA) confirms the sponsor does not provide free routine items.
4. Schedule an Institutional Clinical Trial Billing Audit with Aethera: https://aetherahealthcare.com/contact`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail) return;
    setLeadLoading(true);

    try {
      await sendLeadToKiran('clinical_trial_billing_audit_request', {
        source: 'Clinical Trial Billing & Coverage Analysis Scrubber',
        name: leadName || 'Clinical Research Director',
        email: leadEmail,
        phone: leadPhone || 'Not provided',
        organization: leadOrg || 'Research Hospital / Medical Center',
        message: `Requested Clinical Trial Billing & Coverage Analysis (CTCA) Audit.
Trial NCT#: ${nctNumber}
Study Type: ${studyType}
Medicare Covered Lines: ${scrubbedResults.medicareCoveredLines}
Sponsor Invoiced Lines: ${scrubbedResults.sponsorLines}`,
      });
      setLeadSubmitted(true);
    } catch {
      setLeadSubmitted(true);
    } finally {
      setLeadLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Tool Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" />
              CMS NCD 310.1 &amp; FDA IDE Trial Compliance Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-jakarta">
              Clinical Trial Billing &amp; Coverage Analysis Scrubber
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
              Separate Medicare-covered routine costs from sponsor-funded investigational items under CMS National
              Coverage Determination 310.1. Validate 8-digit NCT numbers, verify Modifier Q1/Q0 compliance, and prevent
              False Claims Act double-billing recoupments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors shadow-sm"
              title="Copy complete clinical trial scrub summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              {copied ? 'Scrub Report Copied!' : 'Copy Scrub Report'}
            </button>
          </div>
        </div>

        {/* NCD 310.1 Alert */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong className="font-semibold text-amber-950">CMS Double-Billing Ban:</strong> Billing Medicare for
            services paid for by the study sponsor or promised free in the informed consent document constitutes an
            actionable False Claims Act violation. Routine costs require <strong>Modifier Q1 + ICD-10 Z00.6</strong> and
            an 8-digit NCT identifier in Loop 2300.
          </div>
        </div>
      </div>

      {/* Trial Configuration Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Protocol Inputs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Beaker className="w-4 h-4 text-emerald-600" />
              1. Trial Protocol Parameters
            </h3>

            {/* NCT Number Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  NCT Identifier (ClinicalTrials.gov)
                </label>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isNctValid
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isNctValid ? 'Valid NCT#' : 'Requires NCT+8 Digits'}
                </span>
              </div>
              <input
                type="text"
                value={nctNumber}
                onChange={(e) => setNctNumber(e.target.value.toUpperCase())}
                placeholder="NCT04882195"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Field 19 / Loop 2300 REF*P4 requires exact 8-digit NCT format.
              </p>
            </div>

            {/* Trial Classification */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Study Regulatory Category
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'ncd_310_qualifying',
                    label: 'Qualifying Clinical Trial (NCD 310.1)',
                    sub: 'Routine care covered, investigational drug sponsor-paid',
                  },
                  {
                    id: 'ide_cat_b',
                    label: 'FDA Category B IDE Device Trial',
                    sub: 'Non-experimental device & routine care covered',
                  },
                  {
                    id: 'ide_cat_a',
                    label: 'FDA Category A IDE Device Trial',
                    sub: 'Experimental device non-covered; routine care only',
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setStudyType(t.id as any)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      studyType === t.id
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        studyType === t.id ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {t.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrub Verdict Summary */}
          <div className="bg-gradient-to-br from-slate-900 via-navy to-slate-950 text-white rounded-2xl p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Coverage Split Summary
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal/20 text-teal border border-teal/30">
                {scrubbedResults.classified.length} Procedures
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] text-slate-300 font-medium">Medicare Part B</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {scrubbedResults.medicareCoveredLines}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Bill with Modifier Q1</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] text-slate-300 font-medium">Sponsor Invoiced</div>
                <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
                  {scrubbedResults.sponsorLines}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Research budget invoice</div>
              </div>
            </div>

            {/* Mandatory Secondary Code Box */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Required Secondary Diagnosis:
              </div>
              <p className="font-mono text-xs text-white">ICD-10 Z00.6</p>
              <p className="text-[11px] text-slate-300">
                Encounter for examination of normal comparison and control in clinical research program.
              </p>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Line Item Selection & EDI Scrubber */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  2. Select Clinical Trial Protocol Services
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check procedures administered during the clinical trial study visit.
                </p>
              </div>
            </div>

            {/* Procedures Cards List */}
            <div className="space-y-3">
              {SAMPLE_STUDY_ITEMS.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                const scrubResult = scrubbedResults.classified.find((c) => c.id === item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-50/90 border-emerald-500 ring-1 ring-emerald-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                              CPT {item.cptCode}
                            </span>
                            <span className="text-sm font-bold text-slate-900">{item.description}</span>
                          </div>
                          {scrubResult && (
                            <p className="text-xs text-slate-600 leading-relaxed">{scrubResult.guidance}</p>
                          )}
                        </div>
                      </div>

                      {scrubResult && (
                        <div className="text-right shrink-0 space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              scrubResult.billTo.includes('Medicare')
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {scrubResult.billTo}
                          </span>
                          <div className="text-[11px] font-mono text-slate-500 font-medium">
                            {scrubResult.modifier}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* EDI Segment Output if Selected */}
                    {isSelected && scrubResult && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 bg-white/70 p-3 rounded-lg flex items-start gap-2.5">
                        <FileCode className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="text-xs font-mono text-slate-800 leading-relaxed">
                          <strong className="text-slate-900 font-sans font-semibold">EDI 837P Mapping:</strong>{' '}
                          {scrubResult.ediLoop}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Free Clinical Trial Audit CTA */}
      <div className="bg-gradient-to-br from-navy via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-10 shadow-xl">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Institutional Research Billing Audit
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Schedule a Clinical Trial Coverage Analysis (CTCA) &amp; Billing Audit
          </h3>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Our certified clinical research billing specialists review your study protocol, develop compliant coverage
            analysis matrices, and eliminate False Claims Act double-billing risks.
          </p>
        </div>

        {leadSubmitted ? (
          <div className="mt-8 max-w-xl mx-auto p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Trial Audit Request Submitted</h4>
            <p className="text-sm text-slate-300">
              Our Clinical Research Billing Pod has received your study protocol details and will deliver your coverage
              analysis roadmap within 1 business day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLeadSubmit} className="mt-8 max-w-xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Raymond Hayes"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="rhayes@academicmedical.edu"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Institution / Research Site</label>
                <input
                  type="text"
                  placeholder="Baylor Research Institute"
                  value={leadOrg}
                  onChange={(e) => setLeadOrg(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="(555) 789-0123"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={leadLoading}
              className="w-full py-3 px-6 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 mt-2"
            >
              {leadLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Trial Audit Protocol...
                </>
              ) : (
                <>
                  Request Clinical Trial Coverage Analysis Audit
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400">
              HIPAA &amp; GCP compliant. Handled under formal non-disclosure agreement (NDA) if requested.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
