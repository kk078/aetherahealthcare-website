'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ClipboardCheck,
  Calculator,
  ArrowRight,
  CalendarClock,
  ListChecks,
  TrendingDown,
  Gauge,
  BookOpen,
  FileCheck2,
  DollarSign,
  FileCode,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  Receipt,
  FileCode2,
  Code2,
  Award,
  ExternalLink,
  ShieldAlert,
  Activity,
  Scale,
  Scissors,
  Dna,
  Building2,
  Ambulance,
  Radiation,
  Droplets,
  Baby,
  HeartPulse,
  Eye,
  GitBranch,
  Bone,
  Heart,
} from 'lucide-react';

interface ToolItem {
  href: string;
  icon: typeof FileCheck2;
  name: string;
  desc: string;
  category: 'scrubbers' | 'calculators' | 'edi' | 'assessments';
  tag: string;
  badge?: string;
}

const TOOLS_LIST: ToolItem[] = [
  {
    href: '/tools/cardiothoracic-cannulation-scrubber',
    icon: Heart,
    name: 'Cardiothoracic Bypass & Cannulation Scrubber',
    desc: 'Audit CABG arterial-venous graft combinations (33533 + +33517 add-ons), endoscopic vein harvest (+33508), concomitant valve replacements (33405/33430), and ECMO/ECLS cannulation bundling rules.',
    category: 'scrubbers',
    tag: 'Cardiothoracic',
    badge: 'New',
  },
  {
    href: '/tools/scoliosis-deformity-scrubber',
    icon: Baby,
    name: 'Pediatric Scoliosis & Multi-Rod Deformity Scrubber',
    desc: 'Audit spinal deformity arthrodesis (22800, 22802, 22804), prevent payer interspace downcoding, safeguard pelvic fixation (+22848 S2AI screws), and validate multi-level Ponte osteotomy claims.',
    category: 'scrubbers',
    tag: 'Pediatric Orthopedics',
    badge: 'New',
  },
  {
    href: '/tools/spine-arthrodesis-scrubber',
    icon: Bone,
    name: 'Spine Arthrodesis & Multi-Level Instrumentation Scrubber',
    desc: 'Audit complex spinal fusions (TLIF 22633, ACDF 22551, ALIF 22558), detect NCCI laminectomy bundling (63047), audit Modifier -62 co-surgery rules, and validate instrumentation & bone graft add-ons.',
    category: 'scrubbers',
    tag: 'Spine Surgery',
    badge: 'New',
  },
  {
    href: '/tools/urogynecology-scrubber',
    icon: Activity,
    name: 'Urogynecology & Pelvic Floor Reconstruction Scrubber',
    desc: 'Audit sacrocolpopexy (57425) and mid-urethral sling (57288) bundling, prevent routine cystoscopy (52000) unbundling clawbacks, validate POP-Q prolapse staging, and stack multi-channel urodynamics (UDS).',
    category: 'scrubbers',
    tag: 'Urogynecology',
    badge: 'New',
  },
  {
    href: '/tools/retina-injection-scrubber',
    icon: Eye,
    name: 'Anti-VEGF Intravitreal Injection & Bilateral Scrubber',
    desc: 'Audit anti-VEGF dosage and wastage (Modifiers JW/JZ), calculate Medicare Part B bilateral modifier logic (-50 vs -RT/-LT), and enforce 28-day LCD frequency limits.',
    category: 'scrubbers',
    tag: 'Ophthalmology',
    badge: 'New',
  },
  {
    href: '/tools/pad-revascularization-scrubber',
    icon: GitBranch,
    name: 'Endovascular & PAD Revascularization Scrubber',
    desc: 'Enforce CPT vascular territory hierarchy (iliac, fem/pop, tibial/peroneal), suppress bundled angioplasties and catheter placements (36245–36248), and audit diagnostic angiography exemptions.',
    category: 'scrubbers',
    tag: 'Vascular Surgery',
    badge: 'New',
  },
  {
    href: '/tools/cardiac-ep-scrubber',
    icon: HeartPulse,
    name: 'Cardiac Electrophysiology & Catheter Ablation Scrubber',
    desc: 'Audit AFib/VT catheter ablation (93656/93653) bundling against diagnostic EP studies (93619/93620), capture 3D mapping and ICE add-ons, and verify remote telemetry 90-day interval cadence.',
    category: 'scrubbers',
    tag: 'Cardiac EP',
    badge: 'New',
  },
  {
    href: '/tools/reconstructive-prior-auth-scrubber',
    icon: Scissors,
    name: 'Reconstructive vs Cosmetic Prior-Authorization Scrubber',
    desc: 'Calculate Schnur sliding scale BSA thresholds for breast reduction (19318), audit blepharoplasty visual field criteria (15823), verify panniculectomy indications (15830), and validate federal WHCRA mandates.',
    category: 'scrubbers',
    tag: 'Plastic Surgery',
    badge: 'New',
  },
  {
    href: '/tools/nicu-critical-care-scrubber',
    icon: Baby,
    name: 'NICU & Pediatric Critical Care Scrubber',
    desc: 'Validate inpatient per-day neonatal critical care codes (CPT 99468–99476), weight-banded intensive step-down tiers (99477–99480), and scrub out CPT bundled catheterizations (36510/36660) and intubations.',
    category: 'scrubbers',
    tag: 'NICU / PICU',
    badge: 'New',
  },
  {
    href: '/tools/rad-onc-scrubber',
    icon: Radiation,
    name: 'Radiation Oncology IMRT Bundling & Fraction Scrubber',
    desc: 'Audit IMRT planning (CPT 77301) bundling edits against simulation and dosimetry, compute CPT 77427 weekly treatment management fraction math, and generate ANSI X12 837P claim lines.',
    category: 'scrubbers',
    tag: 'Radiation Oncology',
    badge: 'New',
  },
  {
    href: '/tools/dialysis-mcp-calculator',
    icon: Droplets,
    name: 'Dialysis Monthly Capitation Payment (MCP) Tier Calculator',
    desc: 'Compute physician allowable reimbursement under CPT 90951–90962 and 90966, calculate inpatient hospital stay pro-rations, and model downcoding revenue recovery.',
    category: 'calculators',
    tag: 'Nephrology',
    badge: 'New',
  },
  {
    href: '/tools/fqhc-pps-scrubber',
    icon: Building2,
    name: 'FQHC PPS Encounter Rate & Same-Day Service Scrubber',
    desc: 'Calculate CMS FQHC PPS encounter rates with GAF geographic adjustments, validate same-day mental health statutory exceptions (Modifier 59/XE), and model Medicaid wrap-around reconciliations.',
    category: 'scrubbers',
    tag: 'FQHC / RHC',
    badge: 'New',
  },
  {
    href: '/tools/ambulance-fee-calculator',
    icon: Ambulance,
    name: 'Ambulance & EMS Fee Schedule Calculator',
    desc: 'Compute Medicare Ambulance Fee Schedule reimbursement for BLS, ALS1, ALS2, and SCT, apply statutory rural mileage multipliers, and validate 2-character origin/destination modifier pairs.',
    category: 'calculators',
    tag: 'Ambulance / EMS',
    badge: 'New',
  },
  {
    href: '/tools/moldx-zcode-scrubber',
    icon: Dna,
    name: 'Molecular Diagnostics MolDX® Z-Code & LCD Scrubber',
    desc: 'Verify DEX Z-Codes and LCD coverage criteria for molecular pathology, next-generation sequencing panels, and PGx under CMS MolDX requirements.',
    category: 'scrubbers',
    tag: 'MolDX',
    badge: 'New',
  },
  {
    href: '/tools/ctp-skin-substitute-calculator',
    icon: Scissors,
    name: 'Skin Substitute & CTP Wastage Modifier JW / JZ Calculator',
    desc: 'Calculate single-use skin substitute administered vs discarded sq cm, determine mandatory Modifiers JW and JZ, and generate dual-line 837P Loop 2400 snippets.',
    category: 'calculators',
    tag: 'Wound Care',
    badge: 'New',
  },
  {
    href: '/tools/critical-care-scrubber',
    icon: Clock,
    name: 'Emergency & Critical Care Time Documentation Scrubber',
    desc: 'Evaluate CPT 99291 and 99292 time thresholds, automatically deduct bedside procedure times, and verify split/shared visit substantive portion rules.',
    category: 'scrubbers',
    tag: 'Critical Care',
    badge: 'New',
  },
  {
    href: '/tools/anesthesia-concurrency-auditor',
    icon: Activity,
    name: 'Anesthesia Concurrency & Medical Direction Auditor',
    desc: 'Audit operating room concurrency logs under 42 CFR § 415.110. Model 1:4 TEFRA direction rules, verify Modifiers QK, QY, QX, QZ, and calculate Modifier AD penalties.',
    category: 'calculators',
    tag: 'Concurrency',
    badge: 'New',
  },
  {
    href: '/tools/global-period-scrubber',
    icon: Scissors,
    name: 'Surgical Global Period & Post-Op Modifier Scrubber',
    desc: 'Scrub surgical follow-ups against 0-day, 10-day, and 90-day global fee packages under CMS Ch. 12 § 40.1. Validate Modifiers 24, 58, 78, 79, 54, and 55.',
    category: 'scrubbers',
    tag: 'Global Surgery',
    badge: 'New',
  },
  {
    href: '/tools/dmepos-validator',
    icon: ShieldCheck,
    name: 'DMEPOS Medical Necessity & Prior Auth Validator',
    desc: 'Validate Medicare DMEPOS claims across Oxygen, CPAP, Mobility Assistive Equipment, and Orthotics. Verify SWO, Face-to-Face timing, and DME MAC jurisdiction routing.',
    category: 'scrubbers',
    tag: 'DMEPOS Rules',
    badge: 'New',
  },
  {
    href: '/tools/msp-determination-engine',
    icon: Scale,
    name: 'Medicare Secondary Payer (MSP) Determination Engine',
    desc: 'Evaluate statutory primary vs secondary liability under Section 1862(b) of the Social Security Act across Working Aged, Disability, ESRD 30-mo coordination, and No-Fault/WC.',
    category: 'scrubbers',
    tag: 'MSP Rules',
    badge: 'New',
  },
  {
    href: '/tools/clinical-trial-billing',
    icon: FileCheck2,
    name: 'Clinical Trial Billing & Coverage Analysis Scrubber',
    desc: 'Separate Medicare routine care (Modifier Q1 + Z00.6) from sponsor-funded investigational items under CMS NCD 310.1 and FDA IDE Category A/B rules.',
    category: 'scrubbers',
    tag: 'Clinical Trials',
    badge: 'New',
  },
  {
    href: '/tools/hcc-raf-calculator',
    icon: Activity,
    name: 'CMS HCC Risk Adjustment & RAF Score Benchmarker',
    desc: 'Model risk score erosion transitioning from CMS-HCC v28 to v24. Estimate Medicare Advantage capitation changes, capture disease interactions, and review MEAT criteria.',
    category: 'calculators',
    tag: 'Risk Adjustment',
    badge: 'New',
  },
  {
    href: '/tools/mips-score-forecaster',
    icon: Award,
    name: 'CMS MIPS Performance Score & Penalty Forecaster',
    desc: 'Forecast MIPS composite scores out of 100 points. Model Part B payment penalties (up to -9.0%) or positive incentive bonuses across Quality, Interoperability, Improvement Activities, and Cost.',
    category: 'calculators',
    tag: 'MIPS QPP',
    badge: 'New',
  },
  {
    href: '/tools/denial-overturn-predictor',
    icon: ShieldAlert,
    name: 'Claim Denial Overturn Probability & Strategy Predictor',
    desc: 'Calculate statistical likelihood of overturning CARC denials (CO-50, CO-197, CO-97, CO-16, CO-29), track statutory appeal deadlines, and copy ERISA/CMS legal citations.',
    category: 'scrubbers',
    tag: 'Appeal Predictor',
    badge: 'New',
  },
  {
    href: '/tools/prompt-pay-statutes',
    icon: Scale,
    name: '50-State Prompt-Payment Statute & Penalty Matrix',
    desc: 'Look up electronic clean-claim deadlines (15–30 days), compute accrued annual interest penalties (12%–18%), and generate formal demand notices across 50 states.',
    category: 'calculators',
    tag: 'Prompt Pay',
    badge: 'New',
  },
  {
    href: '/tools/underpayment-analyzer',
    icon: DollarSign,
    name: 'Payer Contract Underpayment & Variance Analyzer',
    desc: 'Calculate silent PPO fee schedule downcoding, compare contracted allowable vs actual paid rates, and compute state prompt-pay statutory interest penalties.',
    category: 'calculators',
    tag: 'Contract Audit',
    badge: 'New',
  },
  {
    href: '/tools/payer-dispute-directory',
    icon: FileText,
    name: 'Payer Dispute & Electronic Appeals Directory',
    desc: 'Directory of 16+ national commercial, Medicare Advantage, and Medicaid payers with Level 1 & 2 appeal deadlines, electronic dispute portal URLs, and clearinghouse escalation contacts.',
    category: 'scrubbers',
    tag: 'Appeals',
    badge: 'New',
  },
  {
    href: '/tools/prior-auth-matrix',
    icon: Scale,
    name: 'Prior-Auth Requirement & Payer Gold-Card Matrix',
    desc: 'Inspect mandatory prior auth triggers, statutory review SLAs under CMS-0057-F, peer-to-peer deadlines, and state Gold Card exemption rules across 20+ procedures.',
    category: 'scrubbers',
    tag: 'Prior Auth',
    badge: 'New',
  },
  {
    href: '/tools/modifier-compliance-engine',
    icon: FileCheck2,
    name: 'Modifier 25 & 59 / X{EPSU} Compliance Engine',
    desc: 'Evaluate same-day E/M visits and surgical unbundling against CMS NCCI guidelines. Generate legal audit-defense attestations and eliminate CARC 97 recoupments.',
    category: 'scrubbers',
    tag: 'Compliance',
    badge: 'New',
  },
  {
    href: '/tools/anesthesia-calculator',
    icon: Calculator,
    name: 'Anesthesia ASA Unit & Reimbursement Calculator',
    desc: 'Calculate total ASA anesthesia units (Base + 15-Min Time + Physical Modifiers + Qualifying Circumstances) and model CMS medical direction concurrency splits (AA, QZ, QK, QX).',
    category: 'calculators',
    tag: 'Anesthesia RVG',
    badge: 'New',
  },
  {
    href: '/tools/platform-telemetry',
    icon: Activity,
    name: 'Platform Telemetry & Clearinghouse SLA Dashboard',
    desc: 'Transparent live telemetry inspecting direct clearinghouse throughput, global edge network distribution, sub-millisecond EDI relays, and zero-persistence HIPAA data isolation.',
    category: 'assessments',
    tag: 'Telemetry',
    badge: 'New',
  },
  {
    href: '/tools/good-faith-estimate-generator',
    icon: ShieldAlert,
    name: 'No Surprises Act GFE Generator',
    desc: 'Generate CMS-compliant Good Faith Estimates (45 CFR § 149.610) for self-pay and uninsured patients with statutory dispute disclaimers and PDF export.',
    category: 'scrubbers',
    tag: 'Compliance',
    badge: 'New',
  },
  {
    href: '/tools/patient-liability-estimator',
    icon: Receipt,
    name: 'Patient Out-of-Pocket Liability Estimator',
    desc: 'Calculate exact point-of-service patient financial responsibility: remaining deductibles, coinsurance splits, copays, and bad-debt risk indicators.',
    category: 'calculators',
    tag: 'Financial',
    badge: 'New',
  },
  {
    href: '/tools/edi-270-271-validator',
    icon: FileCode2,
    name: 'ANSI X12 270/271 Eligibility Validator',
    desc: 'Decode raw ANSI X12 271 real-time eligibility responses. Parse EB benefit segments, remaining deductibles, and prevent CO-27 eligibility denials.',
    category: 'edi',
    tag: 'EDI Parser',
    badge: 'New',
  },
  {
    href: '/tools/edi-837-scrubber',
    icon: Code2,
    name: 'ANSI X12 837 Claim File Scrubber',
    desc: 'Diagnostic syntax scrubber for 837P (Professional) and 837I (Institutional) claims. Catch missing NPIs, invalid modifiers, and prevent 277CA rejections.',
    category: 'edi',
    tag: 'EDI Scrubber',
    badge: 'New',
  },
  {
    href: '/tools/practice-benchmark-scorecard',
    icon: Award,
    name: 'MGMA Practice Health Index & Scorecard',
    desc: 'Benchmark your practice against official MGMA / HFMA standards. Calculate overall Practice Health Score (0–100) and quantify annual recoverable cash lift.',
    category: 'assessments',
    tag: 'Benchmark',
    badge: 'New',
  },
  {
    href: '/tools/credentialing-timeline-estimator',
    icon: CalendarClock,
    name: 'Provider Credentialing Timeline Estimator',
    desc: 'Map CAQH, Medicare PECOS, state Medicaid, and commercial payer enrollment timelines to prevent billing freezes for newly hired physicians.',
    category: 'assessments',
    tag: 'Onboarding',
    badge: 'New',
  },
  {
    href: '/tools/ncci-claim-scrubber',
    icon: FileCheck2,
    name: 'CMS NCCI Claim Scrubber',
    desc: 'Test CPT code pairs against official CMS PTP bundling rules. Check modifier -25 and -59/-XS indicators to prevent CARC 97 denials.',
    category: 'scrubbers',
    tag: 'Scrubber',
  },
  {
    href: '/tools/appeal-letter-generator',
    icon: FileText,
    name: 'Appeal Letter Generator',
    desc: 'Generate legal-grade, formal appeal letters with statutory citations (ERISA, ACA § 2719, CMS NCCI) for CARC 50, 197, 16, 29, 97, and 22.',
    category: 'scrubbers',
    tag: 'Playbook',
  },
  {
    href: '/tools/practice-proposal-wizard',
    icon: Sparkles,
    name: 'Custom Practice Proposal Wizard',
    desc: 'Build a tailored revenue cycle proposal in 3 minutes. Calculate estimated collections lift, target AR days, and transparent performance pricing.',
    category: 'assessments',
    tag: 'Proposal',
  },
  {
    href: '/tools/fee-schedule-benchmarker',
    icon: DollarSign,
    name: 'Fee Schedule Benchmarker',
    desc: 'Compare your commercial payer reimbursement allowances against 2026 Medicare and regional PPO percentiles to quantify underpayments.',
    category: 'calculators',
    tag: 'Calculator',
  },
  {
    href: '/tools/era-835-decoder',
    icon: FileCode,
    name: '835 ERA Remittance Decoder',
    desc: 'Parse raw 835 EDI segments (CLP, CAS, SVC). Translate adjustment reason codes (CO, PR, OA) into clear financial allocations and action items.',
    category: 'edi',
    tag: 'Parser',
  },
  {
    href: '/tools/timely-filing-matrix',
    icon: Clock,
    name: 'Multi-Payer Timely Filing Matrix',
    desc: 'Compare initial claim deadlines, corrected claim cutoffs, and appeal windows across 50 state Medicaid programs and commercial PPOs.',
    category: 'scrubbers',
    tag: 'Reference',
  },
  {
    href: '/tools/denial-code-lookup',
    icon: Search,
    name: 'Denial Code Lookup (1,283+ Codes)',
    desc: 'Search CARC/RARC denial codes and get plain-English reasons, how to work each one, and how to prevent it.',
    category: 'scrubbers',
    tag: 'Reference',
  },
  {
    href: '/tools/clean-claim-scorecard',
    icon: ClipboardCheck,
    name: 'Clean-Claim Scorecard',
    desc: 'Score your front-end, coding, and submission workflow against 14 controls — and see which denials each gap invites.',
    category: 'assessments',
    tag: 'Self-assessment',
  },
  {
    href: '/tools/ar-cost-calculator',
    icon: Calculator,
    name: 'A/R Days Cost Calculator',
    desc: 'See the cash tied up in slow A/R and the yearly carrying cost of staying above your target days-in-A/R.',
    category: 'calculators',
    tag: 'Calculator',
  },
  {
    href: '/tools/timely-filing-calculator',
    icon: CalendarClock,
    name: 'Timely Filing Calculator',
    desc: 'Enter a date of service and the payer filing limit to get the exact submission deadline, days remaining, and a risk flag.',
    category: 'calculators',
    tag: 'Calculator',
  },
  {
    href: '/tools/eligibility-checklist',
    icon: ListChecks,
    name: 'Eligibility & Prior-Auth Checklist',
    desc: 'Score your pre-visit verification against the checks that prevent CO-27, CO-197, and eligibility denials before they happen.',
    category: 'assessments',
    tag: 'Self-assessment',
  },
  {
    href: '/tools/denial-cost-calculator',
    icon: TrendingDown,
    name: 'Denial Cost Calculator',
    desc: 'See what denials really cost — lost reimbursement plus rework — per week, month, and year, and the combined annual impact.',
    category: 'calculators',
    tag: 'Calculator',
  },
  {
    href: '/tools/rvu-calculator',
    icon: Gauge,
    name: 'RVU Payment Calculator',
    desc: 'Turn work, PE, and malpractice RVUs into an estimated Medicare allowed amount using GPCI and the conversion factor.',
    category: 'calculators',
    tag: 'Calculator',
  },
  {
    href: '/tools/payer-provider-manuals',
    icon: BookOpen,
    name: 'Payer Manual & Policy Finder',
    desc: 'Jump straight to provider manuals, medical/payment policies, credentialing, and eligibility pages for 200+ payers, Medicaid programs, and Medicare MACs.',
    category: 'scrubbers',
    tag: 'Reference',
  },
  {
    href: '/glossary',
    icon: BookOpen,
    name: 'Healthcare RCM & Billing Glossary',
    desc: 'Authoritative clinical and financial dictionary covering 30+ core terms: EDI 837/835, NCCI PTP edits, CARC/RARC denial codes, and RVU benchmarks.',
    category: 'scrubbers',
    tag: 'Knowledge Base',
  },
];

export default function ToolsDirectory() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTools = TOOLS_LIST.filter(t => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.tag.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Premier Featured Banner: Provider Portal Sandbox */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy via-[#0d2247] to-teal p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/20 text-mint text-xs font-bold uppercase tracking-wider border border-mint/30">
              <Sparkles className="h-3.5 w-3.5" /> Featured Interactive Simulation
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Live Provider Portal &amp; Telemetry Sandbox
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Step into an active hospital revenue cycle command center. Explore simulated real-time 837/835 EDI transactions, 5-bucket AR aging telemetry, automated denial resolution streams, and payer performance scorecards with zero login.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-mint hover:bg-white text-navy font-bold text-xs sm:text-sm transition-all shadow-md hover:scale-105"
            >
              Launch Live Portal Sandbox <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Subtle decorative background watermark */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
          <Gauge className="h-64 w-64 text-white" />
        </div>
      </div>

      {/* Filter Toolbar & Search Bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray/20 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'all', label: `All Tools (${TOOLS_LIST.length})` },
              { key: 'scrubbers', label: 'Compliance & Scrubbers' },
              { key: 'calculators', label: 'Financial Calculators' },
              { key: 'edi', label: 'EDI & Interoperability' },
              { key: 'assessments', label: 'Practice Audits' },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === tab.key
                    ? 'bg-navy text-white border-navy shadow-xs'
                    : 'bg-cream text-navy border-gray/20 hover:border-teal'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${TOOLS_LIST.length} free tools & engines…`}
              className="w-full pl-9 pr-3 py-1.5 border border-gray/25 rounded-xl text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map(t => (
          <Link
            key={t.href}
            prefetch={false}
            href={t.href}
            className="group block h-full bg-white rounded-2xl border border-gray/15 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-teal/10 text-teal group-hover:bg-teal group-hover:text-white transition-colors">
                  <t.icon className="h-5 w-5" />
                </span>
                <div className="flex items-center gap-1.5">
                  {t.badge && (
                    <span className="bg-mint/20 text-teal text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-teal/20">
                      {t.badge}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t.tag}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-navy mb-2 group-hover:text-teal transition-colors">
                {t.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{t.desc}</p>
            </div>

            <div className="pt-3 border-t border-gray/10 flex items-center justify-between text-xs font-semibold text-teal group-hover:text-navy transition-colors">
              <span>Open Free Tool</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray/20">
          <p className="text-slate-600 font-semibold text-sm">No tools match your query.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-3 text-xs font-bold text-teal hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
