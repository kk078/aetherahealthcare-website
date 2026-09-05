'use client';

import React, { useState, useMemo } from 'react';
import {
  Dna,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Loader2,
  FileCode,
  ShieldCheck,
  Building2,
  ChevronRight,
  Info,
  Layers,
  FileText,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

interface MolecularTestPreset {
  id: string;
  name: string;
  category: string;
  cpt: string;
  defaultZCode: string;
  lcdNumber: string;
  lcdTitle: string;
  avgAllowable: number;
  clinicalCriteria: string[];
}

const PRESET_TESTS: MolecularTestPreset[] = [
  {
    id: 'brca',
    name: 'BRCA1 & BRCA2 Comprehensive Sequencing',
    category: 'Hereditary Cancer',
    cpt: '81162',
    defaultZCode: 'ZB49A',
    lcdNumber: 'LCD L38966',
    lcdTitle: 'Genetic Testing for Hereditary Breast and Ovarian Cancer Syndrome',
    avgAllowable: 1450,
    clinicalCriteria: [
      'Documented personal history of early-onset breast cancer (<50 yrs) or epithelial ovarian cancer',
      'First-degree relative with known pathogenic BRCA1/2 mutation',
      'Pre-test and post-test genetic counseling documented by certified genetic counselor or physician',
      'Signed informed patient consent for genetic testing on file',
    ],
  },
  {
    id: 'solid_tumor_ngs',
    name: 'Somatic Solid Tumor NGS Panel (51+ Genes)',
    category: 'Somatic Oncology',
    cpt: '81455',
    defaultZCode: 'ZC12K',
    lcdNumber: 'LCD L38047',
    lcdTitle: 'Genomic Sequence Analysis Panels in the Treatment of Advanced Cancer',
    avgAllowable: 2900,
    clinicalCriteria: [
      'Patient diagnosed with advanced (Stage III/IV) or recurrent solid malignant neoplasm',
      'Patient has not previously undergone identical comprehensive genomic profiling for this cancer',
      'Results will directly determine FDA-approved targeted therapy or biomarker-directed clinical trial',
      'Pathology report verifies adequate tumor specimen cellularity (≥20% viable neoplastic cells)',
    ],
  },
  {
    id: 'pgx',
    name: 'Pharmacogenomics Multi-Gene Panel (CYP2D6 / CYP2C19)',
    category: 'Pharmacogenomics (PGx)',
    cpt: '81225, 81226',
    defaultZCode: 'ZD88X',
    lcdNumber: 'LCD L38394',
    lcdTitle: 'Pharmacogenomics Testing for Targeted Drug Therapies',
    avgAllowable: 620,
    clinicalCriteria: [
      'Treating clinician actively considering initiating or modifying medication with FDA Black Box PGx warning',
      'Specific drug indication substantiated (e.g. Plavix resistance, CYP2C19 clopidogrel metabolism)',
      'Multi-gene testing strictly limited to actionable genes relevant to patient active medication regimen',
      'Clinical justification documenting why single-gene testing was clinically insufficient',
    ],
  },
  {
    id: 'nipt',
    name: 'Non-Invasive Prenatal Cell-Free DNA (NIPT)',
    category: 'Prenatal Genetics',
    cpt: '81420',
    defaultZCode: 'ZE91Q',
    lcdNumber: 'LCD L36353',
    lcdTitle: 'Cell-Free DNA Testing for Fetal Aneuploidy',
    avgAllowable: 780,
    clinicalCriteria: [
      'Singleton or twin gestation confirmed at minimum 10 weeks gestational age',
      'High-risk screening criteria documented (maternal age ≥35, abnormal ultrasound, or positive serum screen)',
      'Pre-test genetic counseling on screening accuracy vs diagnostic amniocentesis limits provided',
      'Documented patient choice electing non-invasive screening over invasive chorionic villus sampling',
    ],
  },
  {
    id: 'respiratory_multiplex',
    name: 'Infectious Disease Multiplex PCR Panel (12-25 Targets)',
    category: 'Pathogen Multiplex',
    cpt: '87633',
    defaultZCode: 'ZF33M',
    lcdNumber: 'LCD L37713',
    lcdTitle: 'Molecular Syndromic Panels for Infectious Disease Pathogen Identification',
    avgAllowable: 440,
    clinicalCriteria: [
      'Patient presents with severe acute respiratory distress requiring inpatient hospitalization or ICU level care',
      'Severe immunocompromise (bone marrow transplant, solid organ transplant, active chemotherapy)',
      'Rapid point-of-care influenza/COVID/RSV test completed first or documented unavailable',
      'Physician order specifies clinical necessity of broad pathogen panel over targeted PCR',
    ],
  },
];

const MAC_JURISDICTIONS = [
  { id: 'palmetto', name: 'Palmetto GBA (JM & JJ)', state: 'AL, GA, NC, SC, TN, VA, WV' },
  { id: 'noridian', name: 'Noridian Healthcare (JE & JF)', state: 'CA, NV, OR, WA, AK, ID, MT, ND, SD, UT, WY, AZ' },
  { id: 'cgs', name: 'CGS Administrators (JB & JC)', state: 'KY, OH' },
  { id: 'wps', name: 'WPS Government Health (J5 & J8)', state: 'IN, MI, IA, KS, MO, NE' },
  { id: 'novitas_fcso', name: 'Novitas / FCSO (Non-MolDX Prior-Auth)', state: 'FL, PA, NJ, MD, DC, DE, TX, OK, NM' },
];

export default function MolDxZCodeScrubber() {
  const [selectedTestId, setSelectedTestId] = useState<string>('brca');
  const [jurisdiction, setJurisdiction] = useState<string>('palmetto');
  const [hasZCode, setHasZCode] = useState<boolean>(true);
  const [zCodeValue, setZCodeValue] = useState<string>('ZB49A');
  const [hasLcdCriteria, setHasLcdCriteria] = useState<boolean>(true);
  const [hasInformedConsent, setHasInformedConsent] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Form State
  const [labName, setLabName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [hp, setHp] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  const currentTest = useMemo(() => {
    return PRESET_TESTS.find((t) => t.id === selectedTestId) || PRESET_TESTS[0];
  }, [selectedTestId]);

  // Sync default Z-code when test changes
  const handleSelectTest = (t: MolecularTestPreset) => {
    setSelectedTestId(t.id);
    setZCodeValue(t.defaultZCode);
  };

  // Evaluation Engine
  const evaluation = useMemo(() => {
    const isMolDxRegion = jurisdiction !== 'novitas_fcso';

    if (isMolDxRegion && (!hasZCode || !zCodeValue.trim())) {
      return {
        status: 'error' as const,
        verdictTitle: 'MOLDX REJECTION RISK: Missing DEX Z-Code (CARC 16 / RARC N382)',
        riskLevel: 'CRITICAL CLAIM REJECTION',
        explanation: `${jurisdiction.toUpperCase()} operates under the Palmetto GBA MolDX® program. All claims for CPT ${currentTest.cpt} without a registered 5-character DEX Z-Code in Loop 2400 REF02 are rejected at the clearinghouse level before adjudication.`,
        actionableSteps: [
          'Register test in DEX Diagnostics Exchange registry (dexzcodes.com)',
          'Obtain unique 5-character alphanumeric Z-Code from Palmetto MolDX',
          'Populate ANSI 837P Loop 2400 REF02 with qualifier "17"',
          'Do NOT submit claim until Z-Code is active to prevent uncorrectable timely-filing rejections',
        ],
        ediSnippet: `// Loop 2400 Line Service\nSV1*HC:${currentTest.cpt}:${currentTest.avgAllowable}.00:UN:1***1:2~\n// ERROR: Missing REF*17*<ZCODE> Segment! Claim will reject with CARC 16 / N382.`,
      };
    }

    if (!hasLcdCriteria) {
      return {
        status: 'warning' as const,
        verdictTitle: `COVERAGE EXCLUSION RISK: ${currentTest.lcdNumber} Criteria Not Documented`,
        riskLevel: 'HIGH RECOUPMENT / DENIAL RISK',
        explanation: `Claim will pass electronic front-end editing but fail medical review under ${currentTest.lcdNumber}. Commercial and Medicare payers will deny claim as not medically necessary (CARC 50 / PR-204) without clinical record substantiation.`,
        actionableSteps: [
          'Obtain requisition order from treating physician explicitly stating clinical indication',
          'Request clinical notes verifying personal and family disease criteria',
          'Ensure pathology reports are linked to test order in laboratory information system (LIS)',
          'Prepare Level 1 redetermination packet with NCCN clinical practice guidelines cited',
        ],
        ediSnippet: `REF*17*${zCodeValue.trim().toUpperCase()}~\nSV1*HC:${currentTest.cpt}:${currentTest.avgAllowable}.00:UN:1***1:2~\nNTE*ADD*MEDICAL NECESSITY DOCUMENTATION ATTACHED PER ${currentTest.lcdNumber}~`,
      };
    }

    if (!hasInformedConsent) {
      return {
        status: 'warning' as const,
        verdictTitle: 'AUDIT RECOUPMENT VULNERABILITY: Missing Genetic Informed Consent',
        riskLevel: 'MODERATE POST-PAY AUDIT RISK',
        explanation: `CMS and state genetic privacy statutes require documented patient consent prior to molecular germline testing. If targeted in a RAC or UPIC post-payment audit, payments for CPT ${currentTest.cpt} will be recouped in full.`,
        actionableSteps: [
          'Attach signed state-compliant genetic consent form to patient accession record',
          'Verify pre-test counseling note signed by ordering physician or licensed genetic counselor',
        ],
        ediSnippet: `REF*17*${zCodeValue.trim().toUpperCase()}~\nSV1*HC:${currentTest.cpt}:${currentTest.avgAllowable}.00:UN:1***1:2~`,
      };
    }

    // Fully Defensible Clean Claim
    return {
      status: 'clean' as const,
      verdictTitle: `MolDX Claim Fully Defensible: Z-Code ${zCodeValue.trim().toUpperCase()} & ${currentTest.lcdNumber} Verified`,
      riskLevel: 'LOW AUDIT RISK',
      explanation: `Compliant molecular diagnostics submission. DEX Z-Code is populated in Loop 2400 REF02 with qualifier "17", clinical LCD coverage criteria are fulfilled, and genetic counseling requirements are substantiated.`,
      actionableSteps: [
        `Claim ready for clean electronic 837P transmission to ${jurisdiction.toUpperCase()}`,
        `Average Medicare allowable: $${currentTest.avgAllowable.toLocaleString()}`,
        'Archive clinical documentation and test report for 7-year audit retention window',
      ],
      ediSnippet: `// Loop 2400 Line Item Service\nLX*1~\nSV1*HC:${currentTest.cpt}:${currentTest.avgAllowable}.00:UN:1***1:2:3~\nREF*17*${zCodeValue.trim().toUpperCase()}~`,
    };
  }, [jurisdiction, hasZCode, zCodeValue, hasLcdCriteria, hasInformedConsent, currentTest]);

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(evaluation.ediSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) return;
    setFormStatus('submitting');
    setFormError('');

    try {
      const payload = {
        name: contactName,
        email,
        phone,
        practice: labName,
        service: 'MolDX Z-Code & Molecular Diagnostic Audit',
        notes: `[Tool: MolDX Scrubber] Selected Test: ${currentTest.name} (CPT ${currentTest.cpt}) | MAC: ${jurisdiction} | Z-Code: ${zCodeValue} | Status: ${evaluation.status} | Risk: ${evaluation.riskLevel} | Comments: ${notes || 'None provided'}`,
        source: 'Free Tool: /tools/moldx-zcode-scrubber',
      };

      const ok = await sendLeadToKiran('moldx_zcode_audit_inquiry', payload);
      if (ok) {
        setFormStatus('success');
        trackConversion('assessment');
      } else {
        setFormStatus('error');
        setFormError('Submission issue. Please submit an inquiry via our contact form or schedule a consultation directly.');
      }
    } catch {
      setFormStatus('error');
      setFormError('Network error. Please submit an inquiry via our contact form or schedule a consultation directly.');
    }
  };

  return (
    <div className="space-y-12">
      {/* Tool Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Dna className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest block">
                Palmetto MolDX® &amp; 42 CFR § 410.32 Compliance Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-jakarta">
                Molecular Diagnostics MolDX® Z-Code &amp; LCD Scrubber
              </h2>
            </div>
          </div>
          <div className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-semibold text-slate-300">
            DEX™ 2026 Code Registry
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-4">
          MolDX Medicare Administrative Contractors (Palmetto GBA, Noridian, CGS, WPS) automatically reject molecular
          pathology and genetic testing claims that omit a DEX Z-Code in Loop 2400 REF02 or fail Local Coverage
          Determination (LCD) clinical indications. Scrub your molecular panels before claim release to prevent uncollectible denials.
        </p>

        {/* Section 1: Test Selection & Controls */}
        <div className="mt-8 space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
              1. Select Molecular Pathology / Genetic Testing Profile
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRESET_TESTS.map((test) => {
                const isSelected = test.id === selectedTestId;
                return (
                  <button
                    key={test.id}
                    type="button"
                    onClick={() => handleSelectTest(test)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-950/70 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-medium mb-1">
                      <span className="text-teal-400 font-bold">{test.category}</span>
                      <span className="font-mono text-[11px] text-slate-400">CPT {test.cpt}</span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-white line-clamp-1">{test.name}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{test.lcdNumber}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            {/* Column A: MAC Jurisdiction & Z-Code */}
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Target Medicare MAC Jurisdiction
                </label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                >
                  {MAC_JURISDICTIONS.map((mac) => (
                    <option key={mac.id} value={mac.id}>
                      {mac.name}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-400 mt-2">
                  Jurisdiction states: {MAC_JURISDICTIONS.find((m) => m.id === jurisdiction)?.state}
                </div>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    DEX™ Z-Code Assigned &amp; Active
                  </label>
                  <input
                    type="checkbox"
                    checked={hasZCode}
                    onChange={(e) => setHasZCode(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                </div>
                {hasZCode && (
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Registered 5-Character DEX Z-Code
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={zCodeValue}
                      onChange={(e) => setZCodeValue(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-teal-400 font-mono text-sm tracking-widest font-bold focus:outline-none focus:border-teal-500"
                      placeholder="e.g. ZB49A"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Column B: LCD Medical Necessity Criteria */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-4">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                LCD Clinical Indications Checklist ({currentTest.lcdNumber})
              </label>

              <div className="space-y-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLcdCriteria}
                    onChange={(e) => setHasLcdCriteria(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-teal-500 focus:ring-teal-400 bg-slate-900 border-slate-700"
                  />
                  <span>
                    <strong className="text-white">Clinical Indications Met: </strong>
                    Patient record confirms required diagnostic history and disease staging per LCD guidelines.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInformedConsent}
                    onChange={(e) => setHasInformedConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-teal-500 focus:ring-teal-400 bg-slate-900 border-slate-700"
                  />
                  <span>
                    <strong className="text-white">Informed Consent &amp; Pre-Test Counseling: </strong>
                    Physician or certified genetic counselor note detailing test scope and patient consent is on file.
                  </span>
                </label>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-300">Mandatory LCD Chart Elements:</div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {currentTest.clinicalCriteria.slice(0, 3).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Scrubber Verdict & EDI Snippet */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div
            className={`p-6 rounded-2xl border ${
              evaluation.status === 'clean'
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : evaluation.status === 'warning'
                ? 'bg-amber-950/40 border-amber-500/40'
                : 'bg-rose-950/40 border-rose-500/40'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                {evaluation.status === 'clean' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle
                    className={`w-6 h-6 flex-shrink-0 ${
                      evaluation.status === 'warning' ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  />
                )}
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    evaluation.status === 'clean'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : evaluation.status === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {evaluation.riskLevel}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                CPT {currentTest.cpt} · Est Allowable: ${currentTest.avgAllowable}
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white font-jakarta mb-2">
              {evaluation.verdictTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              {evaluation.explanation}
            </p>

            {/* Actionable Directives */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800/80 mb-6">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Compliance Protocol:
              </div>
              {evaluation.actionableSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* ANSI X12 837P Loop 2400 Segment */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-teal-400 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  ANSI X12 837P Loop 2400 REF*17 Segment
                </span>
                <button
                  type="button"
                  onClick={handleCopySnippet}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre p-2 bg-slate-900 rounded-lg">
                {evaluation.ediSnippet}
              </pre>
            </div>
          </div>
        </div>

        {/* Section 3: Free Lab & Pathology Audit Intake Form */}
        <div className="mt-12 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="max-w-2xl mx-auto text-center space-y-2 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white font-jakarta">
              Request a Free 20-Case Molecular Pathology &amp; Z-Code Audit
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Diagnostic laboratories lose millions when DEX Z-Codes are misassigned or lack documented LCD criteria.
              Aethera’s certified molecular coding auditors will scrub 20 of your active claims or past denials with zero obligation.
            </p>
          </div>

          {formStatus === 'success' ? (
            <div className="p-6 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Molecular Diagnostic Audit Request Received</h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Thank you, <span className="font-semibold text-white">{contactName}</span>. Your lab audit request has been sent
                directly to Kiran. We will connect within 4 business hours with your secure HIPAA file submission link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitAudit} className="max-w-2xl mx-auto space-y-4">
              {formError && (
                <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              {/* Honeypot */}
              <input
                type="text"
                name="hp"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="hidden"
                tabIndex={-1}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Laboratory / Pathology Group *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Precision Genomics"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Arthur Vance, MD, FCAP"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="avance@apexgenomics.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Specific MolDX Denials or Technical Challenges (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Noridian denying CPT 81455 solid tumor panels with CARC 16 / N382 despite Z-code submission..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="w-full py-3 px-4 rounded-xl font-bold font-jakarta text-slate-950 bg-teal-400 hover:bg-teal-300 active:scale-[0.99] transition shadow-md shadow-teal-400/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
              >
                {formStatus === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Audit Request…</span>
                  </>
                ) : (
                  <>
                    <span>Request Free 20-Case Molecular Pathology Audit</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
