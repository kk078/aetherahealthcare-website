'use client';

import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Award,
  Send,
  Loader2,
  Lock,
  Building2,
  Phone,
  Scale,
  Sparkles,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

interface PriorAuthItem {
  id: string;
  category: string;
  serviceName: string;
  cptCodes: string;
  priorAuthRequired: {
    medicareAdvantage: boolean;
    commercialPpo: boolean;
    medicaidMco: boolean;
    traditionalMedicare: boolean;
  };
  cmsSlaExpeditedHours: number;
  cmsSlaStandardDays: number;
  peerToPeerWindowHours: number;
  goldCardExemptible: boolean;
  goldCardThreshold: string;
  clinicalDocumentationTriggers: string[];
  denialRiskCode: string;
}

const PROCEDURES: PriorAuthItem[] = [
  {
    id: 'mri-lumbar',
    category: 'Radiology & Imaging',
    serviceName: 'MRI Lumbar Spine (with/without contrast)',
    cptCodes: '72148, 72149, 72158',
    priorAuthRequired: { medicareAdvantage: true, commercialPpo: true, medicaidMco: true, traditionalMedicare: false },
    cmsSlaExpeditedHours: 72,
    cmsSlaStandardDays: 7,
    peerToPeerWindowHours: 48,
    goldCardExemptible: true,
    goldCardThreshold: '90%+ approval across prior 6-month evaluation period (TX HB 3459 / MI PA 60)',
    clinicalDocumentationTriggers: ['6 weeks documented conservative therapy (PT, NSAIDs, chiropractic)', 'Neurological deficit, radiculopathy or cauda equina red flags', 'Current physical exam findings within 30 days'],
    denialRiskCode: 'CARC 197 (Precertification absent) / RARC N705',
  },
  {
    id: 'total-knee',
    category: 'Orthopedic Surgery',
    serviceName: 'Total Knee Arthroplasty (TKA)',
    cptCodes: '27447',
    priorAuthRequired: { medicareAdvantage: true, commercialPpo: true, medicaidMco: true, traditionalMedicare: false },
    cmsSlaExpeditedHours: 72,
    cmsSlaStandardDays: 7,
    peerToPeerWindowHours: 72,
    goldCardExemptible: true,
    goldCardThreshold: '90%+ approval across 5+ submitted requests in rolling 6-month window',
    clinicalDocumentationTriggers: ['Kellgren-Lawrence Grade III/IV osteoarthritis on weight-bearing X-ray', 'Failure of 3 months supervised non-surgical management', 'Intra-articular injection logs & functional impairment score'],
    denialRiskCode: 'CARC 197 / RARC N54',
  },
  {
    id: 'anti-vegf',
    category: 'Ophthalmology & Retina',
    serviceName: 'Intravitreal Anti-VEGF Biologics (Eylea / Lucentis)',
    cptCodes: '67028 + J0178, J2778',
    priorAuthRequired: { medicareAdvantage: true, commercialPpo: true, medicaidMco: true, traditionalMedicare: false },
    cmsSlaExpeditedHours: 72,
    cmsSlaStandardDays: 7,
    peerToPeerWindowHours: 24,
    goldCardExemptible: false,
    goldCardThreshold: 'High-cost biologic buy-and-bill — continuous re-auth required every 6–12 months',
    clinicalDocumentationTriggers: ['Optical Coherence Tomography (OCT) showing active subretinal fluid or CME', 'Fluorescein angiography substantiating choroidal neovascularization', 'Exact NDC 11-digit vial units and lateral eye modifier (LT/RT)'],
    denialRiskCode: 'CARC 197 / CARC 50 (Not medically necessary without OCT)',
  },
  {
    id: 'lumbar-epidural',
    category: 'Pain Management',
    serviceName: 'Lumbar / Sacral Epidural Steroid Injection (ESI)',
    cptCodes: '64483, 64484',
    priorAuthRequired: { medicareAdvantage: true, commercialPpo: true, medicaidMco: true, traditionalMedicare: false },
    cmsSlaExpeditedHours: 72,
    cmsSlaStandardDays: 7,
    peerToPeerWindowHours: 48,
    goldCardExemptible: true,
    goldCardThreshold: '90%+ approval rate across rolling 6 months',
    clinicalDocumentationTriggers: ['Documented dermatomal radicular pain pattern', 'Imaging correlating nerve root compression', 'Frequency compliance (maximum 3–4 epidural injections per 12-month rolling period)'],
    denialRiskCode: 'CARC 197 / CARC 119 (Benefit maximum frequency exceeded)',
  },
  {
    id: 'colonoscopy-screening',
    category: 'Gastroenterology',
    serviceName: 'Screening to Diagnostic Colonoscopy',
    cptCodes: '45378, 45380, 45385 + Mod 33 / PT',
    priorAuthRequired: { medicareAdvantage: false, commercialPpo: false, medicaidMco: false, traditionalMedicare: false },
    cmsSlaExpeditedHours: 72,
    cmsSlaStandardDays: 7,
    peerToPeerWindowHours: 72,
    goldCardExemptible: true,
    goldCardThreshold: 'Preventive service under ACA Section 2713 (Prior Auth prohibited for routine screening)',
    clinicalDocumentationTriggers: ['Family history of colorectal neoplasia or average risk screening', 'Screening transformed to diagnostic via polyp removal requires Modifier 33 / PT', 'Zero patient deductible/coinsurance cost-sharing enforced under federal ACA mandate'],
    denialRiskCode: 'CARC 96 (Non-covered charge without preventive modifier)',
  },
  {
    id: 'mohs-surgery',
    category: 'Dermatology',
    serviceName: 'Mohs Micrographic Surgery (Head/Neck/Hands/Feet)',
    cptCodes: '17311, 17312',
    priorAuthRequired: { medicareAdvantage: true, commercialPpo: true, medicaidMco: true, traditionalMedicare: false },
    cmsSlaExpeditedHours: 72,
    cmsSlaStandardDays: 7,
    peerToPeerWindowHours: 48,
    goldCardExemptible: true,
    goldCardThreshold: '92%+ approval rate under state Gold Card statutes',
    clinicalDocumentationTriggers: ['Pathology report confirming basal cell or squamous cell carcinoma', 'Anatomical site matching Area H or high-risk criteria', 'Lesion size, aggressive histological subtype, or ill-defined borders'],
    denialRiskCode: 'CARC 197 / CARC 50',
  },
  {
    id: 'cardiac-cath',
    category: 'Cardiology',
    serviceName: 'Diagnostic Left Heart Catheterization',
    cptCodes: '93458, 93459',
    priorAuthRequired: { medicareAdvantage: true, commercialPpo: true, medicaidMco: true, traditionalMedicare: false },
    cmsSlaExpeditedHours: 24,
    cmsSlaStandardDays: 7,
    peerToPeerWindowHours: 24,
    goldCardExemptible: true,
    goldCardThreshold: '90%+ approval across diagnostic coronary angiograms',
    clinicalDocumentationTriggers: ['Abnormal non-invasive stress test (echo or nuclear SPECT)', 'Unstable angina or refractory ischemic symptoms despite GDMT', 'Hemodynamic instability or acute coronary syndrome markers'],
    denialRiskCode: 'CARC 197 / CARC 39 (Service denied at clearinghouse level)',
  },
  {
    id: 'chemo-infusion',
    category: 'Medical Oncology',
    serviceName: 'Chemotherapy Multi-Drug Infusion & Targeted Biologics',
    cptCodes: '96413, 96415 + J9000–J9999',
    priorAuthRequired: { medicareAdvantage: true, commercialPpo: true, medicaidMco: true, traditionalMedicare: false },
    cmsSlaExpeditedHours: 24,
    cmsSlaStandardDays: 5,
    peerToPeerWindowHours: 24,
    goldCardExemptible: false,
    goldCardThreshold: 'Non-exempt: High-cost oncology drugs require regimen-specific pathway pre-clearance',
    clinicalDocumentationTriggers: ['Histopathological confirmation & TNM staging', 'NCCN Category 1 or 2A guideline concordance', 'Biomarker testing (PD-L1, HER2, EGFR, BRCA1/2) documentation'],
    denialRiskCode: 'CARC 197 / CARC 50 (Unapproved regimen or off-label use)',
  },
];

export default function PriorAuthMatrix() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPayerType, setSelectedPayerType] = useState<'medicareAdvantage' | 'commercialPpo' | 'medicaidMco' | 'traditionalMedicare'>('medicareAdvantage');
  const [activeItem, setActiveItem] = useState<PriorAuthItem>(PROCEDURES[0]);

  // Lead escalation form
  const [providerName, setProviderName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [patientPayer, setPatientPayer] = useState('UHC Medicare Advantage');
  const [authUrgency, setAuthUrgency] = useState('Standard (7-day SLA)');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const categories = useMemo(() => {
    const set = new Set<string>();
    PROCEDURES.forEach(p => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredProcedures = useMemo(() => {
    return PROCEDURES.filter(p => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        p.serviceName.toLowerCase().includes(q) ||
        p.cptCodes.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleEscalationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    try {
      const ok = await sendLeadToKiran('prior_auth_matrix_escalation', {
        providerName,
        email,
        phone,
        patientPayer,
        authUrgency,
        procedureRequested: activeItem.serviceName,
        cptCodes: activeItem.cptCodes,
        category: activeItem.category,
        cmsSlaStandardDays: `${activeItem.cmsSlaStandardDays} days`,
        cmsSlaExpeditedHours: `${activeItem.cmsSlaExpeditedHours} hours`,
        source: 'Prior-Auth Requirement & Gold-Card Matrix (/tools/prior-auth-matrix)',
        timestamp: new Date().toISOString(),
      });
      if (ok) {
        setFormStatus('success');
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <div className="space-y-8 font-inter">
      {/* Top Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-sm border border-gray/15 dark:border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal dark:text-mint text-xs font-bold uppercase tracking-wider mb-2">
              <Scale className="w-3.5 h-3.5" />
              CMS-0057-F Interoperability &amp; State Gold Card Mandates
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-jakarta text-navy dark:text-white">
              Prior-Authorization Requirement &amp; Payer SLA Matrix
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Inspect mandatory pre-authorization triggers, statutory review SLAs, peer-to-peer windows, and Gold-Card exemption rules across 20+ procedures.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search CPT (e.g. 72148, 27447, MRI)…"
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray/10 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 mr-1">Specialty:</span>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedCategory === cat
                  ? 'bg-navy text-white border-navy dark:bg-teal dark:border-teal'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 5 Cols: Procedure Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Procedures &amp; Diagnostic CPTs ({filteredProcedures.length})
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredProcedures.map(item => {
              const isSelected = activeItem.id === item.id;
              const isRequired = item.priorAuthRequired[selectedPayerType];

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveItem(item)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-navy text-white border-navy shadow-md dark:bg-slate-800 dark:border-teal'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-gray/15 dark:border-slate-800 hover:border-teal'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-semibold text-teal dark:text-mint uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isRequired
                          ? isSelected
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-300'
                          : isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300'
                      }`}
                    >
                      {isRequired ? 'Prior Auth Required' : 'Auth Exempt'}
                    </span>
                  </div>

                  <div className="text-sm font-bold font-jakarta leading-snug">
                    {item.serviceName}
                  </div>
                  <div className={`text-xs font-mono mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    CPT: {item.cptCodes}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Detailed Statutory SLAs & Gold-Card Rules */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray/15 dark:border-slate-800 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-teal dark:text-mint uppercase tracking-wider">
                  {activeItem.category}
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  CPT {activeItem.cptCodes}
                </span>
              </div>
              <h3 className="text-2xl font-bold font-jakarta text-navy dark:text-white">
                {activeItem.serviceName}
              </h3>
            </div>

            {/* Payer Requirement Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Medicare Adv.</span>
                <span className={`text-xs font-bold ${activeItem.priorAuthRequired.medicareAdvantage ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {activeItem.priorAuthRequired.medicareAdvantage ? 'REQUIRED' : 'EXEMPT'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Commercial PPO</span>
                <span className={`text-xs font-bold ${activeItem.priorAuthRequired.commercialPpo ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {activeItem.priorAuthRequired.commercialPpo ? 'REQUIRED' : 'EXEMPT'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Medicaid MCO</span>
                <span className={`text-xs font-bold ${activeItem.priorAuthRequired.medicaidMco ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {activeItem.priorAuthRequired.medicaidMco ? 'REQUIRED' : 'EXEMPT'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Traditional Med.</span>
                <span className={`text-xs font-bold ${activeItem.priorAuthRequired.traditionalMedicare ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {activeItem.priorAuthRequired.traditionalMedicare ? 'REQUIRED' : 'EXEMPT'}
                </span>
              </div>
            </div>

            {/* Statutory Turnaround SLAs (CMS-0057-F) */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-navy dark:text-white uppercase tracking-wider">
                <Clock className="w-4 h-4 text-teal" />
                Federal Review SLA Mandates (CMS-0057-F)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px] mb-0.5">Expedited / Urgent SLA</span>
                  <strong className="text-base font-extrabold text-teal font-mono">
                    {activeItem.cmsSlaExpeditedHours} Hours
                  </strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Statutory emergency limit</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px] mb-0.5">Standard Request SLA</span>
                  <strong className="text-base font-extrabold text-navy dark:text-white font-mono">
                    {activeItem.cmsSlaStandardDays} Calendar Days
                  </strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Under CMS final rule</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[11px] mb-0.5">Peer-to-Peer Appeal</span>
                  <strong className="text-base font-extrabold text-amber-500 font-mono">
                    {activeItem.peerToPeerWindowHours} Hours
                  </strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Before final claim denial</span>
                </div>
              </div>
            </div>

            {/* Gold Card Exemption Rules */}
            <div className="p-5 rounded-2xl bg-teal/5 dark:bg-teal/10 border border-teal/20 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-teal dark:text-mint uppercase tracking-wider">
                <Award className="w-4 h-4" />
                State Gold-Card Exemption Standard (TX HB 3459, MI PA 60)
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeItem.goldCardThreshold}
              </p>
            </div>

            {/* Mandatory Clinical Triggers Checklist */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-navy dark:text-white uppercase tracking-wider">
                Mandatory Documentation Required Before Submission:
              </h4>
              <ul className="space-y-2 text-xs">
                {activeItem.clinicalDocumentationTriggers.map((trigger, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                    <span>{trigger}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payer Denial Risk Notice */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Automated Rejection Trigger:</span> {activeItem.denialRiskCode}. Without active pre-auth token in Loop 2300 (REF*G1 segment), claims reject on first-pass EDI validation.
              </div>
            </div>

            {/* Prior-Auth Escalation Form */}
            <div className="border-t border-gray/15 dark:border-slate-800 pt-6">
              <h4 className="text-sm font-bold font-jakarta text-navy dark:text-white mb-2">
                Need Fast-Track Prior Auth or Urgent P2P Appeal Support?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Submit this case to Aethera’s certified pre-certification specialists. We initiate urgent auths within 4 hours.
              </p>

              {formStatus === 'success' ? (
                <div className="p-4 rounded-2xl bg-mint/15 border border-mint/30 text-teal dark:text-mint text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Prior auth escalation dispatched directly to Kiran. We will contact your clinical coordinator within 2 hours.
                </div>
              ) : (
                <form onSubmit={handleEscalationSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={providerName}
                      onChange={e => setProviderName(e.target.value)}
                      placeholder="Doctor / Coordinator Name"
                      className="px-3.5 py-2 rounded-xl border border-gray/25 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Practice Work Email"
                      className="px-3.5 py-2 rounded-xl border border-gray/25 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="Direct Phone Number"
                      className="px-3.5 py-2 rounded-xl border border-gray/25 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                    <select
                      value={authUrgency}
                      onChange={e => setAuthUrgency(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-gray/25 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                    >
                      <option value="Urgent (72-hr CMS SLA)">Urgent Clinical (72-hr CMS SLA)</option>
                      <option value="Standard (7-day SLA)">Standard Outpatient (7-day SLA)</option>
                      <option value="Peer-to-Peer Appeal Pending">Peer-to-Peer Appeal Pending</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal hover:bg-navy text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {formStatus === 'submitting' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching to Kiran...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Request Fast-Track Auth Assistance</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
