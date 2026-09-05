import payersData from './payers.data.json';
import denialRefData from './denialReference.json';
import { DENIAL_CODES } from './denialCodes';

export type SearchCategory = 'all' | 'payers' | 'denials' | 'tools' | 'specialties' | 'services' | 'actions';

export interface SearchItem {
  id: string;
  category: 'payers' | 'denials' | 'tools' | 'specialties' | 'services' | 'actions';
  title: string;
  subtitle?: string;
  description?: string;
  href?: string;
  badge?: string;
  badgeVariant?: 'blue' | 'teal' | 'emerald' | 'amber' | 'purple' | 'slate';
  keywords: string[];
  denialDetail?: {
    code: string;
    type: 'CARC' | 'RARC';
    difficulty?: 'correctable' | 'preventable' | 'hard';
    category: string;
    rootCause?: string;
    workIt?: string;
    prevent?: string;
    rarc?: string;
  };
  payerDetail?: {
    slug: string;
    payerId?: string | null;
    type: string;
    timelyFiling?: string | null;
    portalUrl?: string | null;
  };
  actionDetail?: {
    type: 'expert_chat' | 'expert_callback' | 'theme_toggle' | 'print_page';
  };
}

// 33 Interactive Tools
const TOOL_ITEMS: SearchItem[] = [
  {
    id: 'tool-denial-lookup',
    category: 'tools',
    title: 'Denial Code Lookup (1,283+ Codes)',
    subtitle: 'Free searchable CARC & RARC denial directory with playbooks',
    description: 'Find root causes, overturn strategies, and prevention steps for any medical claim denial code.',
    href: '/tools/denial-code-lookup',
    badge: 'Directory Tool',
    badgeVariant: 'teal',
    keywords: ['carc', 'rarc', 'denial', 'lookup', 'code', 'reject', 'overturn', 'appeal', 'reason', 'remark'],
  },
  {
    id: 'tool-denial-cost',
    category: 'tools',
    title: 'Denial Cost Calculator',
    subtitle: 'Calculate lost revenue and recovery potential',
    description: 'Quantify your clinic’s annual cash loss from initial claim rejections and calculate recovered revenue.',
    href: '/tools/denial-cost-calculator',
    badge: 'ROI Calculator',
    badgeVariant: 'emerald',
    keywords: ['denial', 'cost', 'calculator', 'loss', 'recovery', 'revenue', 'roi', 'claims', 'rejection'],
  },
  {
    id: 'tool-timely-filing',
    category: 'tools',
    title: 'Timely Filing & Appeal Calculator',
    subtitle: 'Payer deadlines, clearinghouse routing & appeal windows across 10,600+ plans',
    description: 'Calculate exact submission deadlines and appeal cutoffs for commercial, Medicare, and Medicaid payers.',
    href: '/tools/timely-filing-calculator',
    badge: 'Compliance Tool',
    badgeVariant: 'amber',
    keywords: ['timely', 'filing', 'deadline', 'appeal', 'limit', 'days', 'calculator', 'late', 'cutoff'],
  },
  {
    id: 'tool-clean-claim',
    category: 'tools',
    title: 'Clean Claim Scorecard',
    subtitle: 'Benchmark your first-pass claim acceptance',
    description: 'Audit front-office and billing accuracy against the 95%+ national top-tier benchmark.',
    href: '/tools/clean-claim-scorecard',
    badge: 'Audit Tool',
    badgeVariant: 'blue',
    keywords: ['clean', 'claim', 'scorecard', 'benchmark', 'audit', 'first-pass', 'acceptance', 'rate'],
  },
  {
    id: 'tool-ar-cost',
    category: 'tools',
    title: 'AR Carrying Cost Calculator',
    subtitle: 'Measure the cost of unpaid claims past 60/90 days',
    description: 'Understand how much cash is locked in aging accounts receivable and how speeding collections lifts net profit.',
    href: '/tools/ar-cost-calculator',
    badge: 'Cashflow Tool',
    badgeVariant: 'purple',
    keywords: ['ar', 'accounts', 'receivable', 'cost', 'carrying', 'aging', '90 days', 'cashflow'],
  },
  {
    id: 'tool-rvu',
    category: 'tools',
    title: 'RVU Reimbursement Calculator',
    subtitle: 'Calculate wRVU and Medicare fee schedule payments',
    description: 'Model physician compensation and Medicare allowable rates using work RVUs and geographic practice cost indices (GPCI).',
    href: '/tools/rvu-calculator',
    badge: 'Reimbursement',
    badgeVariant: 'blue',
    keywords: ['rvu', 'wrvu', 'relative value', 'medicare', 'fee schedule', 'conversion factor', 'allowable'],
  },
  {
    id: 'tool-eligibility',
    category: 'tools',
    title: 'Eligibility Verification Checklist',
    subtitle: 'Pre-visit checklist preventing front-end rejections',
    description: '10-point front-office verification workflow to eliminate CO-27 coverage and patient ID denials.',
    href: '/tools/eligibility-checklist',
    badge: 'Front Office',
    badgeVariant: 'teal',
    keywords: ['eligibility', 'verification', 'checklist', 'intake', 'copay', 'deductible', 'front-desk', 'benefits'],
  },
  {
    id: 'tool-payer-manuals',
    category: 'tools',
    title: 'Payer Provider Manual Finder',
    subtitle: 'Direct links to official payer guidelines & portals',
    description: 'Search official billing guidelines, fee schedules, and claims manuals for major health plans.',
    href: '/tools/payer-provider-manuals',
    badge: 'Reference',
    badgeVariant: 'slate',
    keywords: ['payer', 'provider', 'manual', 'guidelines', 'portal', 'availity', 'optum', 'policy'],
  },
  {
    id: 'tool-ncci-scrubber',
    category: 'tools',
    title: 'CMS NCCI Claim Scrubber & Modifier Validator',
    subtitle: 'Test CPT bundling rules & modifier 25 / 59 / XS indicators',
    description: 'Verify procedure-to-procedure (PTP) edits against official CMS NCCI rules to prevent CARC 97 denials.',
    href: '/tools/ncci-claim-scrubber',
    badge: 'Claim Scrubber',
    badgeVariant: 'emerald',
    keywords: ['ncci', 'scrubber', 'ptp', 'bundling', 'modifier 25', 'modifier 59', 'xs', 'cpt', 'unbundling', 'claim check'],
  },
  {
    id: 'tool-appeal-generator',
    category: 'tools',
    title: 'Medical Denial Appeal Letter Generator',
    subtitle: 'Formal letters with ERISA & ACA statutory citations',
    description: 'Generate legal-grade dispute letters for CARC 50, 197, 16, 29, 97, and 22 with clinical rationales.',
    href: '/tools/appeal-letter-generator',
    badge: 'Appeal Playbook',
    badgeVariant: 'blue',
    keywords: ['appeal', 'letter', 'generator', 'template', 'carc 50', 'erisa', 'dispute', 'reconsideration', 'overturn'],
  },
  {
    id: 'tool-proposal-wizard',
    category: 'tools',
    title: 'Custom Practice Proposal & SLA Wizard',
    subtitle: '3-minute tailored RCM proposal, pricing & collections lift',
    description: 'Model collections lift and custom performance pricing (3.5%–5.0%) for your medical specialty and EHR.',
    href: '/tools/practice-proposal-wizard',
    badge: 'Proposal Wizard',
    badgeVariant: 'purple',
    keywords: ['proposal', 'wizard', 'sla', 'pricing', 'quote', 'collections lift', 'roi', 'assessment', 'custom'],
  },
  {
    id: 'tool-fee-benchmarker',
    category: 'tools',
    title: 'CPT Fee Schedule & Reimbursement Benchmarker',
    subtitle: 'Compare commercial payer allowances against 2026 Medicare',
    description: 'Quantify your practice’s annual underpayment gap against 135%–160% regional commercial PPO benchmarks.',
    href: '/tools/fee-schedule-benchmarker',
    badge: 'Fee Benchmark',
    badgeVariant: 'amber',
    keywords: ['fee schedule', 'reimbursement', 'benchmarker', 'medicare allowable', 'cpt', 'underpayment', 'gap', 'rates'],
  },
  {
    id: 'tool-era-decoder',
    category: 'tools',
    title: '835 Electronic Remittance Advice (ERA) Decoder',
    subtitle: 'Parse raw 835 EDI loops (CLP, CAS, SVC) into plain English',
    description: 'Translate CO, PR, and OA adjustment reason codes into clear financial allocations and action items.',
    href: '/tools/era-835-decoder',
    badge: 'ERA Parser',
    badgeVariant: 'teal',
    keywords: ['835', 'era', 'remittance', 'clp', 'cas', 'decoder', 'parser', 'eob', 'co-45', 'pr-1', 'edi'],
  },
  {
    id: 'tool-timely-matrix',
    category: 'tools',
    title: 'Multi-Payer Timely Filing & Deadline Matrix',
    subtitle: '50-state Medicaid & commercial payer filing cutoffs',
    description: 'Compare initial claim deadlines, corrected claim windows, and appeal cutoffs across all major plans.',
    href: '/tools/timely-filing-matrix',
    badge: 'Deadline Matrix',
    badgeVariant: 'slate',
    keywords: ['timely filing', 'matrix', 'state medicaid', 'appeal deadline', 'cutoff', 'california', 'texas', 'florida'],
  },
  {
    id: 'tool-rcm-glossary',
    category: 'tools',
    title: 'Healthcare RCM & Medical Billing Glossary',
    subtitle: 'Authoritative encyclopedia of 30+ core reimbursement & EDI terms',
    description: 'Instant definitions, clinical impact, and practice scenarios for NCCI, PTP, MUE, CARC, RARC, and RVUs.',
    href: '/glossary',
    badge: 'Knowledge Base',
    badgeVariant: 'teal',
    keywords: ['glossary', 'dictionary', 'acronyms', 'rcm terms', 'definitions', '837p', '835', 'ncci', 'carc', 'rvu'],
  },
  {
    id: 'tool-good-faith-estimate',
    category: 'tools',
    title: 'No Surprises Act GFE Generator',
    subtitle: 'CMS-compliant Good Faith Estimates under 45 CFR § 149.610',
    description: 'Generate itemized Good Faith Estimates for uninsured and self-pay patients with mandatory dispute disclaimers.',
    href: '/tools/good-faith-estimate-generator',
    badge: 'Compliance',
    badgeVariant: 'emerald',
    keywords: ['good faith estimate', 'gfe', 'no surprises act', 'nsa', 'uninsured', 'self pay', '45 cfr 149.610', 'dispute'],
  },
  {
    id: 'tool-patient-liability',
    category: 'tools',
    title: 'Patient Out-of-Pocket Liability Estimator',
    subtitle: 'Calculate point-of-service deductibles, coinsurance & copays',
    description: 'Estimate patient responsibility at check-in, calculate plan versus patient splits, and assess bad debt risk.',
    href: '/tools/patient-liability-estimator',
    badge: 'Financial',
    badgeVariant: 'teal',
    keywords: ['patient liability', 'copay', 'coinsurance', 'deductible', 'out of pocket', 'pos', 'bad debt', 'calculator'],
  },
  {
    id: 'tool-edi-270-271',
    category: 'tools',
    title: 'ANSI X12 270/271 Eligibility Validator',
    subtitle: 'Real-time eligibility response parser & EB segment inspector',
    description: 'Inspect and decode raw 271 eligibility transactions, parse EB benefit segments, and prevent CO-27 denials.',
    href: '/tools/edi-270-271-validator',
    badge: 'EDI Parser',
    badgeVariant: 'blue',
    keywords: ['270', '271', 'eligibility', 'ansi x12', 'eb segment', 'copay', 'parser', 'benefits', 'verification'],
  },
  {
    id: 'tool-edi-837',
    category: 'tools',
    title: 'ANSI X12 837 Claim File Scrubber',
    subtitle: '837P / 837I diagnostic syntax validator & 277CA predictor',
    description: 'Scrub electronic claims for missing NPIs in Loop 2010AA, invalid modifiers in Loop 2400, and predict clearinghouse rejects.',
    href: '/tools/edi-837-scrubber',
    badge: 'EDI Scrubber',
    badgeVariant: 'purple',
    keywords: ['837', '837p', '837i', 'claim scrubber', '277ca', 'loop 2010aa', 'npi', 'clearinghouse', 'syntax'],
  },
  {
    id: 'tool-practice-benchmark',
    category: 'tools',
    title: 'MGMA Practice Health Index & Scorecard',
    subtitle: 'Benchmark Days in AR, denial rates, and annual cash lift',
    description: 'Calculate your composite Practice Health Score (0–100) and quantify annual recoverable cash lift against MGMA benchmarks.',
    href: '/tools/practice-benchmark-scorecard',
    badge: 'Benchmark',
    badgeVariant: 'amber',
    keywords: ['mgma', 'practice health', 'benchmark', 'scorecard', 'days in ar', 'denial rate', 'cash lift', 'audit'],
  },
  {
    id: 'tool-credentialing-timeline',
    category: 'tools',
    title: 'Provider Credentialing Timeline Estimator',
    subtitle: 'CAQH, Medicare PECOS & commercial payer onboarding roadmap',
    description: 'Plan physician lead times, map 16-week credentialing critical paths, and prevent billing freezes for new hires.',
    href: '/tools/credentialing-timeline-estimator',
    badge: 'Onboarding',
    badgeVariant: 'slate',
    keywords: ['credentialing', 'timeline', 'caqh', 'pecos', 'medicare 855i', 'onboarding', 'payer enrollment', 'lead time'],
  },
  {
    id: 'tool-portal-sandbox',
    category: 'tools',
    title: 'Live Provider Portal & Telemetry Sandbox',
    subtitle: 'Interactive RCM command center simulation with live ANSI loops',
    description: 'Explore live 837/835 transaction streams, 5-bucket AR aging telemetry, and payer performance scorecards.',
    href: '/portal',
    badge: 'Live Sandbox',
    badgeVariant: 'teal',
    keywords: ['portal', 'sandbox', 'telemetry', 'dashboard', 'live simulation', '837', '835', 'kpi'],
  },
  {
    id: 'tool-anesthesia-calc',
    category: 'tools',
    title: 'Anesthesia ASA Unit & Reimbursement Calculator',
    subtitle: 'ASA base units, 15-min time rounding, modifiers & CMS concurrency',
    description: 'Calculate total billable anesthesia units, physical status modifiers (P1–P6), qualifying circumstances, and commercial vs Medicare yields.',
    href: '/tools/anesthesia-calculator',
    badge: 'Anesthesia RVG',
    badgeVariant: 'teal',
    keywords: ['anesthesia', 'asa units', 'rvg', 'concurrency', 'crna', 'modifier aa', 'modifier qz', 'base units', 'time units', '99100'],
  },
  {
    id: 'tool-platform-telemetry',
    category: 'tools',
    title: 'Platform Telemetry & Clearinghouse SLA Dashboard',
    subtitle: 'Live edge latency, 837/835 dispatch throughput & zero-session security',
    description: 'Real-time telemetry measuring client TTFB, Core Web Vitals, direct clearinghouse gateway SLAs, and HIPAA zero-knowledge memory sweeping.',
    href: '/tools/platform-telemetry',
    badge: 'Telemetry',
    badgeVariant: 'blue',
    keywords: ['telemetry', 'clearinghouse sla', 'performance', 'latency', 'ttfb', '837 dispatch', '835 auto post', 'hipaa', 'zero session'],
  },
  {
    id: 'tool-prior-auth-matrix',
    category: 'tools',
    title: 'Prior-Auth Requirement & Payer Gold-Card Matrix',
    subtitle: 'CMS-0057-F turnaround SLAs, state Gold Card rules & peer-to-peer deadlines',
    description: 'Inspect mandatory pre-authorization triggers, statutory 72-hr/7-day review SLAs, and Gold Card exemption criteria across 20+ procedures.',
    href: '/tools/prior-auth-matrix',
    badge: 'Prior Auth',
    badgeVariant: 'amber',
    keywords: ['prior auth', 'precertification', 'gold card', 'cms-0057-f', 'peer to peer', 'mri prior auth', 'carc 197', 'pre-auth turnaround'],
  },
  {
    id: 'tool-modifier-compliance',
    category: 'tools',
    title: 'Modifier 25 & 59 / X{EPSU} Compliance Engine',
    subtitle: 'CMS NCCI unbundling rules, same-day E/M validation & audit attestations',
    description: 'Clinical qualification gates for Modifier 25 and distinct procedural services (Modifier 59, XE, XS, XP, XU) to eliminate CARC 97 denials.',
    href: '/tools/modifier-compliance-engine',
    badge: 'Compliance',
    badgeVariant: 'teal',
    keywords: ['modifier 25', 'modifier 59', 'modifier xs', 'modifier xe', 'ncci', 'unbundling', 'carc 97', 'same day em', 'audit attestation'],
  },
  {
    id: 'tool-underpayment-analyzer',
    category: 'tools',
    title: 'Payer Contract Underpayment & Variance Analyzer',
    subtitle: 'Silent PPO fee schedule downcoding, contract variance & state prompt-pay penalties',
    description: 'Compare contracted allowable fee schedules against actual remittances, detect silent PPO underpayment leakage, and calculate statutory prompt-pay interest penalties.',
    href: '/tools/underpayment-analyzer',
    badge: 'Contract Audit',
    badgeVariant: 'amber',
    keywords: ['underpayment', 'variance', 'contract', 'fee schedule', 'prompt pay', 'statutory interest', 'dispute letter', 'silent ppo', 'remittance audit'],
  },
  {
    id: 'tool-payer-dispute',
    category: 'tools',
    title: 'Payer Dispute & Electronic Appeals Directory',
    subtitle: 'Level 1 & Level 2 appeal deadlines, clearinghouse dispute portals & escalation contacts',
    description: 'National directory of 16+ major commercial, Medicare Advantage, and Medicaid payers with Level 1/2 dispute filing timeframes, electronic appeal URLs, and escalation protocols.',
    href: '/tools/payer-dispute-directory',
    badge: 'Appeals',
    badgeVariant: 'teal',
    keywords: ['payer dispute', 'appeals directory', 'level 1 appeal', 'level 2 appeal', 'appeal deadline', 'unitedhealthcare', 'aetna', 'cigna', 'humana', 'dispute portal'],
  },
  {
    id: 'tool-denial-overturn',
    category: 'tools',
    title: 'Claim Denial Overturn Probability & Strategy Predictor',
    subtitle: 'Predict Level 1 appeal overturn probability across CARC codes & ERISA citations',
    description: 'Calculate likelihood of overturning CARC denials (CO-50, CO-197, CO-97, CO-16, CO-29), track statutory appeal deadlines, and copy ERISA/CMS legal citations.',
    href: '/tools/denial-overturn-predictor',
    badge: 'Appeal Predictor',
    badgeVariant: 'purple',
    keywords: ['denial overturn', 'probability', 'appeal strategy', 'carc 50', 'carc 197', 'carc 97', 'carc 16', 'carc 29', 'erisa appeal', 'redetermination'],
  },
  {
    id: 'tool-prompt-pay-statutes',
    category: 'tools',
    title: '50-State Prompt-Payment Statute & Penalty Matrix',
    subtitle: 'Statutory clean claim deadlines (15–30d) & annual interest penalties (12%–18%)',
    description: 'Directory of clean-claim prompt-payment mandates across 50 states, statutory annual late interest penalty rates, and formal legal demand letter generation.',
    href: '/tools/prompt-pay-statutes',
    badge: 'Prompt Pay',
    badgeVariant: 'amber',
    keywords: ['prompt pay', 'statute', 'state laws', 'clean claim deadline', 'interest penalty', 'texas prompt pay', 'florida prompt pay', 'late claim penalty', 'demand letter'],
  },
  {
    id: 'tool-hcc-raf',
    category: 'tools',
    title: 'CMS HCC Risk Adjustment & RAF Score Benchmarker',
    subtitle: 'CMS-HCC v28 vs v24 risk model comparison, disease interactions & capitation revenue',
    description: 'Calculate and model patient risk adjustment factor (RAF) score erosion between CMS-HCC v28 and v24, benchmark Medicare Advantage revenue impacts, and audit MEAT criteria.',
    href: '/tools/hcc-raf-calculator',
    badge: 'Risk Adjustment',
    badgeVariant: 'emerald',
    keywords: ['hcc', 'raf', 'risk adjustment', 'cms v28', 'v24', 'meat criteria', 'medicare advantage', 'capitation', 'diabetes hcc', 'ckd stage 4', 'chf'],
  },
  {
    id: 'tool-mips-forecaster',
    category: 'tools',
    title: 'CMS MIPS Performance Score & Penalty Forecaster',
    subtitle: 'Forecast MIPS composite score out of 100 & Medicare Part B payment adjustments (-9.0% to +3.6%)',
    description: 'Forecast Merit-based Incentive Payment System (MIPS) composite scores across Quality, Interoperability, Improvement Activities, and Cost to avoid the 75-point penalty cliff.',
    href: '/tools/mips-score-forecaster',
    badge: 'MIPS QPP',
    badgeVariant: 'purple',
    keywords: ['mips', 'qpp', 'penalty', 'macra', 'part b adjustment', 'quality measures', 'promoting interoperability', 'improvement activities', 'cost category', 'cehrt'],
  },
  {
    id: 'tool-msp-determination',
    category: 'tools',
    title: 'Medicare Secondary Payer (MSP) Determination Engine',
    subtitle: 'Working Aged, Disability & ESRD 30-month coordination period rules & 837P Loop 2320 mapping',
    description: 'Determine statutory primary vs secondary payer order pursuant to Section 1862(b) of the Social Security Act and generate ANSI X12 837P Loop 2320 crossover claim segments.',
    href: '/tools/msp-determination-engine',
    badge: 'MSP Rules',
    badgeVariant: 'amber',
    keywords: ['msp', 'medicare secondary', 'working aged', 'disability', 'esrd coordination', 'loop 2320', 'co-22', 'conditional payment', 'workers comp', 'no fault'],
  },
  {
    id: 'tool-clinical-trial-billing',
    category: 'tools',
    title: 'Clinical Trial Billing & Coverage Analysis Scrubber',
    subtitle: 'Separate Medicare routine care (Modifier Q1 + Z00.6) from sponsor-funded items under NCD 310.1',
    description: 'Separate Medicare-covered routine costs from sponsor-funded investigational items under CMS NCD 310.1 and FDA IDE Category A/B rules with 8-digit NCT validation.',
    href: '/tools/clinical-trial-billing',
    badge: 'Clinical Trials',
    badgeVariant: 'teal',
    keywords: ['clinical trial', 'ncd 310.1', 'nct', 'modifier q1', 'modifier q0', 'ide category b', 'coverage analysis', 'z00.6', 'research billing', 'false claims'],
  },
  {
    id: 'tool-global-period-scrubber',
    category: 'tools',
    title: 'Surgical Global Period & Post-Op Modifier Scrubber',
    subtitle: 'Evaluate 0, 10 & 90-day surgical packages, validate Modifiers 24/58/78/79 under CMS Chapter 12',
    description: 'Scrub postoperative surgical visits against 0-day, 10-day, and 90-day global fee packages under CMS Ch. 12 § 40.1. Validate Modifiers 24, 58, 78, 79, 54, and 55 and generate Loop 2400 SV1 lines.',
    href: '/tools/global-period-scrubber',
    badge: 'Global Surgery',
    badgeVariant: 'purple',
    keywords: ['global period', 'post-op', 'modifier 24', 'modifier 58', 'modifier 78', 'modifier 79', 'unbundling', '90-day global', 'surgical package', 'co-97'],
  },
  {
    id: 'tool-dmepos-validator',
    category: 'tools',
    title: 'DMEPOS Medical Necessity & Prior Auth Validator',
    subtitle: 'Standard Written Order (SWO), Face-to-Face timing, LCD benchmarks & DME MAC jurisdiction routing',
    description: 'Validate Medicare DMEPOS claims across Oxygen, CPAP, Mobility Assistive Equipment, CGMs, and Orthotics. Verify SWO, Face-to-Face timing, required Prior Authorizations, and KX/GA/CG modifiers mapped to DME MAC Jurisdictions A, B, C, and D.',
    href: '/tools/dmepos-validator',
    badge: 'DMEPOS Rules',
    badgeVariant: 'emerald',
    keywords: ['dmepos', 'dme', 'cmn', 'swo', 'prior auth', 'cpap', 'oxygen', 'wheelchair', 'cgm', 'dme mac', 'modifier kx', 'jurisdiction c'],
  },
];

// Specialties
const SPECIALTY_ITEMS: SearchItem[] = [
  {
    id: 'spec-cardiology',
    category: 'specialties',
    title: 'Cardiology Billing & Coding',
    subtitle: 'Cath lab, echocardiograms, stress testing & modifier -26/-TC',
    href: '/services/cardiology-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['cardiology', 'heart', 'cath lab', 'echo', 'ekg', 'cpt 93000', '93224', 'cardiac'],
  },
  {
    id: 'spec-orthopedic',
    category: 'specialties',
    title: 'Orthopedic Billing & Coding',
    subtitle: 'Global surgical periods, modifier -58/-78/-79 & DME',
    href: '/services/orthopedic-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['orthopedic', 'surgery', 'fracture', 'joint', 'dme', 'modifiers', 'global period', 'bones'],
  },
  {
    id: 'spec-dermatology',
    category: 'specialties',
    title: 'Dermatology Billing & Coding',
    subtitle: 'Mohs micrographic surgery, biopsies & destruction codes',
    href: '/services/dermatology-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['dermatology', 'skin', 'mohs', 'biopsy', 'lesion', 'destruction', 'cpt 17000', 'cosmetic'],
  },
  {
    id: 'spec-psychiatry',
    category: 'specialties',
    title: 'Psychiatry & Behavioral Health Billing',
    subtitle: 'Psychotherapy add-on codes (+90833), intake & IOP/PHP',
    href: '/services/psychiatry-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['psychiatry', 'mental health', 'behavioral', 'psychotherapy', '90837', '90833', 'counseling'],
  },
  {
    id: 'spec-family-med',
    category: 'specialties',
    title: 'Family Medicine & Primary Care Billing',
    subtitle: 'E/M level selection, chronic care management (CCM) & AWV',
    href: '/services/family-medicine-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['family medicine', 'primary care', 'e/m', '99214', 'ccm', 'annual wellness', 'preventive'],
  },
  {
    id: 'spec-dental',
    category: 'specialties',
    title: 'Dental & Cross-Coding Billing',
    subtitle: 'CDT to CPT/ICD cross-coding for medical insurance billing',
    href: '/services/dental-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['dental', 'cdt', 'cross coding', 'oral surgery', 'sleep apnea', 'tmd', 'periodontics'],
  },
  {
    id: 'spec-pharmacy',
    category: 'specialties',
    title: 'Specialty Pharmacy Billing',
    subtitle: 'J-codes, Buy & Bill, NDC units & manufacturer copay cards',
    href: '/services/pharmacy-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pharmacy', 'buy and bill', 'j-code', 'ndc', 'infusion', 'biologics', 'specialty rx'],
  },
  {
    id: 'spec-workers-comp',
    category: 'specialties',
    title: "Workers' Compensation Billing",
    subtitle: 'State fee schedule rules, CMS-1500 attachments & W/C claims',
    href: '/services/workers-compensation-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['workers comp', 'work comp', 'injury', 'pip', 'state fund', 'adjuster', 'cms-1500'],
  },
  {
    id: 'spec-neurology',
    category: 'specialties',
    title: 'Neurology Billing & Neurophysiology Coding',
    subtitle: 'EMG/NCS nerve studies, EEG monitoring & Botox migraine chemodenervation',
    href: '/medical-billing/neurology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['neurology', 'emg', 'ncs', 'eeg', 'nerve conduction', 'botox', 'migraine', '64615', '95886', 'neuro'],
  },
  {
    id: 'spec-pain-mgmt',
    category: 'specialties',
    title: 'Interventional Pain Management & Spine Billing',
    subtitle: 'Epidural steroid injections (ESI), facet blocks & radiofrequency ablation (RFA)',
    href: '/medical-billing/pain-management',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pain management', 'spine', 'esi', 'epidural', 'facet block', 'rfa', 'fluoroscopy', '62323', '64483', '64635'],
  },
  {
    id: 'spec-obgyn',
    category: 'specialties',
    title: 'OB/GYN & Women’s Health Billing',
    subtitle: 'Global maternity delivery packages, LARC buy-and-bill & colposcopy',
    href: '/medical-billing/obgyn',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['obgyn', 'obstetrics', 'gynecology', 'maternity', '59400', 'global care', 'larc', 'iud', 'colposcopy', 'women'],
  },
  {
    id: 'spec-ophthalmology',
    category: 'specialties',
    title: 'Ophthalmology & Optometry Billing',
    subtitle: 'Cataract surgery, anti-VEGF eye injections, OCT retinal imaging & co-management',
    href: '/medical-billing/ophthalmology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['ophthalmology', 'eye', 'optometry', 'cataract', '66984', 'retina', 'anti-vegf', 'eylea', 'oct', 'modifier 55'],
  },
  {
    id: 'spec-urology',
    category: 'specialties',
    title: 'Urology Billing & Coding',
    subtitle: 'Cystoscopy bundling, TURP, urodynamic testing & prostate oncology',
    href: '/medical-billing/urology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['urology', 'cystoscopy', 'turp', 'prostate', 'urodynamics', '52000', '52601', 'bladder', 'stones'],
  },
  {
    id: 'spec-radiology',
    category: 'specialties',
    title: 'Radiology & Diagnostic Imaging Billing',
    subtitle: 'Professional/Technical split (26/TC), MPPR reductions & CDS/AUC compliance',
    href: '/medical-billing/radiology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['radiology', 'imaging', 'x-ray', 'ct', 'mri', 'ultrasound', '26/tc', 'mppr', 'idtf', 'mammography'],
  },
  {
    id: 'spec-pt',
    category: 'specialties',
    title: 'Physical Therapy & Rehabilitation Billing',
    subtitle: 'Medicare 8-minute rule calculations, KX modifier threshold caps & POC tracking',
    href: '/medical-billing/physical-therapy',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['physical therapy', 'pt', 'occupational therapy', 'rehab', '8-minute rule', 'kx modifier', '97110', '97140'],
  },
  {
    id: 'spec-oncology',
    category: 'specialties',
    title: 'Medical Oncology & Hematology Billing',
    subtitle: 'Chemotherapy infusion sequencing, JW/JZ waste tracking & buy-and-bill J-codes',
    href: '/medical-billing/oncology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['oncology', 'hematology', 'cancer', 'chemo', 'chemotherapy', '96413', 'j-codes', 'infusion', 'jw modifier', 'waste'],
  },
  {
    id: 'spec-gi',
    category: 'specialties',
    title: 'Gastroenterology Billing & Endoscopy Coding',
    subtitle: 'Screening vs diagnostic colonoscopy (Mod 33/PT) & multiple endoscopy reductions',
    href: '/medical-billing/gastroenterology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['gastroenterology', 'gi', 'colonoscopy', 'endoscopy', 'polypectomy', 'modifier 33', '45378', 'digestive'],
  },
  {
    id: 'spec-internal-med',
    category: 'specialties',
    title: 'Internal Medicine Billing & Coding',
    subtitle: 'Complex adult chronic disease management, CCM/TCM codes & MDM E/M leveling',
    href: '/medical-billing/internal-medicine',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['internal medicine', 'adult care', 'internist', 'chronic care', 'ccm', '99490', 'tcm', 'hcc risk'],
  },
  {
    id: 'spec-pediatrics',
    category: 'specialties',
    title: 'Pediatric Practice Billing & Immunization Coding',
    subtitle: 'Vaccine administration (90460/90474), well-child checks & VFC Medicaid rules',
    href: '/medical-billing/pediatrics',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatrics', 'peds', 'well-child', 'vaccines', '90460', 'vfc', 'immunization', 'children'],
  },
  {
    id: 'spec-podiatry',
    category: 'specialties',
    title: 'Podiatry & Advanced Wound Care Billing',
    subtitle: 'Excisional debridement (11042), Q-modifiers (Q7/Q8/Q9) & skin substitute grafts',
    href: '/medical-billing/podiatry',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['podiatry', 'foot', 'wound care', 'debridement', '11042', 'q-codes', 'skin graft', 'unna boot', 'q7', 'q8', 'q9', 'nails'],
  },
  {
    id: 'spec-anesthesia',
    category: 'specialties',
    title: 'Anesthesiology & Pain Sedation Billing',
    subtitle: 'ASA base units, 15-minute time increments & medical direction concurrency (AA/QZ/QK)',
    href: '/medical-billing/anesthesia',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['anesthesia', 'anesthesiology', 'crna', 'sedation', 'asa units', 'concurrency', 'time units', '00100', 'qk', 'qz', 'pain'],
  },
  {
    id: 'spec-asc',
    category: 'specialties',
    title: 'Ambulatory Surgery Centers (ASC) Billing',
    subtitle: 'Dual UB-04 / 837I facility and 837P surgeon billing, Revenue Code 0490 & implant C-codes',
    href: '/medical-billing/asc',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['asc', 'ambulatory surgery', 'facility billing', 'ub-04', '837i', 'revenue code 0490', '0278', 'implants', 'opps', 'surgical center'],
  },
  {
    id: 'spec-pathology',
    category: 'specialties',
    title: 'Pathology & Clinical Laboratory Billing',
    subtitle: 'Surgical pathology specimen levels (88305), IHC stains, CLIA compliance & MolDX Z-codes',
    href: '/medical-billing/pathology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pathology', 'clinical lab', 'laboratory', 'clia', '88305', 'ihc', '88342', 'moldx', 'z-code', 'histology', 'biopsy'],
  },
  {
    id: 'spec-emergency',
    category: 'specialties',
    title: 'Emergency Medicine & Hospitalist Billing',
    subtitle: 'High-acuity ED visit coding (99281–99285), Critical Care time & No Surprises Act QPA dispute',
    href: '/medical-billing/emergency-medicine',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['emergency medicine', 'er billing', 'hospitalist', '99285', 'critical care', '99291', 'no surprises act', 'qpa', 'trauma'],
  },
  {
    id: 'spec-urgent-care',
    category: 'specialties',
    title: 'Urgent Care & Walk-In Clinic Billing',
    subtitle: 'Facility add-on code S9088, rapid CLIA point-of-care lab testing & front-desk financial clearance',
    href: '/medical-billing/urgent-care',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['urgent care', 'walk-in clinic', 's9088', 's9083', 'clia waived', 'point of care', 'strep', 'flu', 'laceration', 'immediate care'],
  },
  {
    id: 'spec-nephrology',
    category: 'specialties',
    title: 'Nephrology & Dialysis Center Billing',
    subtitle: 'ESRD monthly capitation payment (MCP 90951–90970), in-center dialysis & vascular access',
    href: '/medical-billing/nephrology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['nephrology', 'dialysis', 'esrd', 'mcp', 'kidney', 'hemodialysis', 'peritoneal', '90951', '90970', 'fistula', 'ckd'],
  },
  {
    id: 'spec-ent',
    category: 'specialties',
    title: 'Otolaryngology & ENT Billing',
    subtitle: 'FESS sinus surgery (31231–31298), balloon sinuplasty & multi-antigen allergy immunotherapy',
    href: '/medical-billing/ent',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['ent', 'otolaryngology', 'sinus', 'fess', 'balloon sinuplasty', '31231', '31254', 'allergy', '95165', 'ear nose throat'],
  },
  {
    id: 'spec-rheumatology',
    category: 'specialties',
    title: 'Rheumatology & Biologic Infusion Billing',
    subtitle: 'High-cost Buy & Bill biologic J-codes, JW/JZ waste modifiers & ultrasound arthrocentesis',
    href: '/medical-billing/rheumatology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['rheumatology', 'biologics', 'infusion', 'remicade', 'rituxan', 'j-code', '20610', 'arthrocentesis', 'jw modifier', 'arthritis'],
  },
  {
    id: 'spec-pulmonology',
    category: 'specialties',
    title: 'Pulmonology & Sleep Medicine Billing',
    subtitle: 'Complete PFT panels (94010–94729), polysomnography (95810) & HSAT home sleep studies',
    href: '/medical-billing/pulmonology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pulmonology', 'sleep medicine', 'pft', 'spirometry', 'polysomnography', '95810', 'hsat', 'sleep apnea', 'cpap', 'bronchoscopy'],
  },
  {
    id: 'spec-infectious-disease',
    category: 'specialties',
    title: 'Infectious Disease & OPAT Billing',
    subtitle: 'High-complexity cognitive consults (99205/99215), OPAT home infusions & remote monitoring',
    href: '/medical-billing/infectious-disease',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['infectious disease', 'opat', 'infusion', 'antibiotics', 'g0498', 'g2212', 'prolonged service', 'inpatient consult', 'microbiology', 'hiv'],
  },
  {
    id: 'spec-allergy-immunology',
    category: 'specialties',
    title: 'Allergy, Asthma & Clinical Immunology Billing',
    subtitle: 'Percutaneous testing (95004), antigen compounding (95165) & asthma biologic J-codes',
    href: '/medical-billing/allergy-immunology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['allergy', 'immunology', 'asthma', 'antigen', '95165', '95004', 'skin prick', 'xolair', 'dupixent', 'venom immunotherapy'],
  },
  {
    id: 'spec-interventional-radiology',
    category: 'specialties',
    title: 'Interventional Radiology & Endovascular Billing',
    subtitle: 'Selective catheterization (36200–36248), transcatheter embolization (37241) & vascular supervision',
    href: '/medical-billing/interventional-radiology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['interventional radiology', 'endovascular', 'catheterization', '36245', '36200', 'embolization', '37241', 'vascular family', 'angioplasty', 'stent'],
  },
  {
    id: 'spec-oral-surgery',
    category: 'specialties',
    title: 'Oral & Maxillofacial Surgery Billing (CDT/CPT)',
    subtitle: 'Dual dental-to-medical cross-coding, orthognathic reconstruction, TMJ arthroplasty & bone grafts',
    href: '/medical-billing/oral-surgery',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['oral surgery', 'maxillofacial', 'cdt cross-coding', 'd-codes', 'orthognathic', 'tmj', '21141', '21240', 'bone graft', 'dental extraction'],
  },
  {
    id: 'spec-all',
    category: 'specialties',
    title: 'All Billing Specialties Overview',
    subtitle: 'Tailored workflows across 30+ medical and surgical specialties',
    href: '/specialties',
    badge: 'All Specialties',
    badgeVariant: 'teal',
    keywords: ['specialties', 'all', 'pediatrics', 'neurology', 'gastroenterology', 'urology', 'oncology', 'radiology', 'pain management', 'podiatry', 'anesthesia', 'asc', 'oral surgery', 'interventional radiology'],
  },
];

// Core Services
const SERVICE_ITEMS: SearchItem[] = [
  {
    id: 'srv-coding',
    category: 'services',
    title: 'Medical Coding Services',
    subtitle: 'AAPC & AHIMA certified coders for ICD-10, CPT, and HCPCS',
    href: '/services/medical-coding',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['coding', 'medical coding', 'icd-10', 'cpt', 'aapc', 'ahima', 'modifiers', 'hcpcs'],
  },
  {
    id: 'srv-claims',
    category: 'services',
    title: 'Claims Submission & Billing',
    subtitle: 'Daily 24-hour EDI scrubbing and automated transmission',
    href: '/services/claims-billing',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['claims', 'submission', 'edi', '837p', '837i', 'billing', 'scrubbing'],
  },
  {
    id: 'srv-payment',
    category: 'services',
    title: 'Payment Posting & Reconciliation',
    subtitle: 'Automated 835 ERA posting, zero-pay audits & manual EOBs',
    href: '/services/payment-posting',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['payment', 'posting', 'era', '835', 'eob', 'reconciliation', 'zero pay'],
  },
  {
    id: 'srv-denials',
    category: 'services',
    title: 'Denial Management & Appeals',
    subtitle: '48-hour denial triage with AI-assisted clinical appeal letters',
    href: '/services/denial-management',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['denial', 'management', 'appeals', 'overturn', 'peer to peer', 'underpayments'],
  },
  {
    id: 'srv-credentialing',
    category: 'services',
    title: 'Provider Credentialing & Contracting',
    subtitle: 'CAQH, NPI, PECOS and payer contract fee negotiations',
    href: '/services/credentialing',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['credentialing', 'caqh', 'enrollment', 'pecos', 'medicare enrollment', 'fee schedule'],
  },
  {
    id: 'srv-eligibility',
    category: 'services',
    title: 'Eligibility & Benefits Verification',
    subtitle: 'Real-time 270/271 EDI checks 48h prior to patient visits',
    href: '/services/eligibility-verification',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['eligibility', 'benefits', 'verification', '270', '271', 'copay', 'coverage'],
  },
  {
    id: 'srv-prior-auth',
    category: 'services',
    title: 'Prior Authorization Management',
    subtitle: 'Fast-track precertification submission and tracking',
    href: '/services/prior-authorization',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['prior authorization', 'prior auth', 'precertification', 'auth', 'peer to peer'],
  },
  {
    id: 'srv-collections',
    category: 'services',
    title: 'Patient Billing & Collections',
    subtitle: 'Clear statements, online payment portals & empathetic recovery',
    href: '/services/patient-collections',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['patient collections', 'patient billing', 'statement', 'portal', 'balance'],
  },
  {
    id: 'srv-compliance',
    category: 'services',
    title: 'Compliance & Chart Auditing',
    subtitle: 'Quarterly E/M audits, HIPAA safeguards and risk reviews',
    href: '/services/compliance-auditing',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['compliance', 'auditing', 'hipaa', 'chart audit', 'e/m audit', 'risk'],
  },
  {
    id: 'srv-ar-followup',
    category: 'services',
    title: 'AR Follow-Up & Aging Recovery',
    subtitle: 'Systematic aging bucket teardown from day 31 to 120+',
    href: '/services/ar-followup',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['ar follow up', 'aging', 'aging recovery', 'aging report', 'unpaid claims'],
  },
];

// Key Conversion Actions & Guides
const ACTION_ITEMS: SearchItem[] = [
  {
    id: 'act-portal-demo',
    category: 'actions',
    title: 'Provider Portal & Analytics Live Sandbox',
    subtitle: 'Interactive live demo of 24/7 claims, denial queue & AR aging dashboard',
    description: 'Explore live KPI cards, interactive 5-bucket AR aging bars, and real-time denial appeal tracking.',
    href: '/portal',
    badge: 'Live Sandbox',
    badgeVariant: 'teal',
    keywords: ['portal', 'dashboard', 'demo', 'sandbox', 'kpis', 'aging', 'claims stream', 'analytics'],
  },
  {
    id: 'act-free-pilot',
    category: 'actions',
    title: 'Start Free 50-Claim Pilot',
    subtitle: 'Zero risk. 50 real claims audited & processed in 14 days',
    description: 'We agree on success criteria in writing, audit 50 claims, and prove our clean-claim accuracy with no long-term commitment.',
    href: '/free-assessment',
    badge: 'Guaranteed Pilot',
    badgeVariant: 'emerald',
    keywords: ['pilot', 'free', 'trial', 'assessment', 'start', '50 claims', 'guarantee', 'onboarding'],
  },
  {
    id: 'act-schedule-call',
    category: 'actions',
    title: 'Book a Strategy Call with Kiran',
    subtitle: '15-minute 1-on-1 practice discovery & revenue analysis',
    description: 'Discuss your specialty, current clearinghouse, denial bottlenecks, and revenue cycle lift directly with leadership.',
    href: '/schedule',
    badge: 'Direct Calendar',
    badgeVariant: 'emerald',
    keywords: ['book', 'schedule', 'call', 'meeting', 'kiran', 'discovery', 'demo', 'consultation'],
  },
  {
    id: 'act-ai-expert',
    category: 'actions',
    title: 'Ask AI Expert / Talk to an Expert',
    subtitle: 'Live RCM AI specialist with direct escalation to Kiran',
    description: 'Ask any question about CARC denial codes, payer timely filing limits, and medical billing fees.',
    href: '#expert-assistant',
    badge: 'Agentic AI',
    badgeVariant: 'purple',
    keywords: ['ai', 'agent', 'expert', 'talk to expert', 'assistant', 'chat', 'kiran', 'help'],
    actionDetail: { type: 'expert_chat' },
  },
  {
    id: 'act-theme-toggle',
    category: 'actions',
    title: 'Toggle Clinical Low-Glare Mode (Dark / Light)',
    subtitle: 'Switch between low-glare clinical dark mode and daytime light mode',
    description: 'High-contrast low-glare theme designed for night-shift billing and clinical workflows.',
    href: '#theme-toggle',
    badge: 'Appearance',
    badgeVariant: 'teal',
    keywords: ['dark mode', 'dark', 'light mode', 'light', 'theme', 'clinical dark', 'glare', 'night mode', 'contrast'],
    actionDetail: { type: 'theme_toggle' },
  },
  {
    id: 'act-print-report',
    category: 'actions',
    title: 'Print Executive Report / Save as PDF',
    subtitle: '1-click export of current view to clean PDF with Aethera letterhead',
    description: 'Exports current dashboard, fee benchmarks, or appeal letters directly to PDF or physical printer.',
    href: '#print',
    badge: 'Export',
    badgeVariant: 'blue',
    keywords: ['print', 'pdf', 'export', 'download report', 'save pdf', 'document', 'save as pdf'],
    actionDetail: { type: 'print_page' },
  },
  {
    id: 'act-pricing',
    category: 'actions',
    title: 'Pricing & Performance Fee Plans',
    subtitle: '3.5%–5.0% performance-based model — we only get paid when you do',
    description: 'Transparent tiered pricing by monthly collection volume. Zero hidden fees, zero software licensing surcharges.',
    href: '/pricing',
    badge: 'Pricing',
    badgeVariant: 'amber',
    keywords: ['pricing', 'fee', 'cost', 'percentage', 'roi', 'contract', 'rate', 'performance'],
  },
  {
    id: 'act-glossary',
    category: 'actions',
    title: 'Healthcare RCM Clinical & Financial Glossary',
    subtitle: 'Searchable encyclopedia of EDI 837/835, NCCI PTP edits, CARC/RARC codes & RVUs',
    description: 'Instant definitions and clinical impact for 30+ core healthcare revenue cycle management terms.',
    href: '/glossary',
    badge: 'Knowledge Base',
    badgeVariant: 'teal',
    keywords: ['glossary', 'dictionary', 'acronyms', 'edi', '837p', '835', 'ncci', 'ptp', 'mue', 'modifier 25', 'modifier 59', 'carc', 'rarc', 'rvu', 'gpci', 'terms'],
  },
  {
    id: 'act-state-of-denials',
    category: 'actions',
    title: 'State of Denials Benchmark Report',
    subtitle: 'Free 2026 national report on healthcare claim denials by specialty',
    href: '/state-of-denials',
    badge: 'Benchmark',
    badgeVariant: 'slate',
    keywords: ['state of denials', 'report', 'benchmark', 'rejection rates', 'research', 'whitepaper'],
  },
  {
    id: 'act-integrations',
    category: 'actions',
    title: '50+ Certified EHR Integrations',
    subtitle: 'Epic, Cerner, AthenaHealth, eClinicalWorks, Kareo, NextGen & more',
    href: '/integrations',
    badge: 'Platform',
    badgeVariant: 'slate',
    keywords: ['integrations', 'ehr', 'emr', 'epic', 'athena', 'cerner', 'ecw', 'kareo', 'nextgen'],
  },
  {
    id: 'act-billing-companies',
    category: 'actions',
    title: 'White-Label for Medical Billing Companies',
    subtitle: 'Scalable back-office billing, coding & AR partnership',
    href: '/for-billing-companies',
    badge: 'Partner',
    badgeVariant: 'slate',
    keywords: ['billing companies', 'white label', 'back office', 'subcontractor', 'partner'],
  },
  {
    id: 'act-asc-surgical',
    category: 'actions',
    title: 'Ambulatory Surgery Center (ASC) RCM & Implant Carve-Outs',
    subtitle: 'UB-04 & CMS-1500 dual billing, MPPR protection & 30-case surgical audit pilot',
    href: '/lp/asc-surgical-billing',
    badge: 'Campaign',
    badgeVariant: 'teal',
    keywords: ['asc', 'ambulatory surgery', 'implant carve-out', 'mppr', 'surgical billing', 'ub-04', 'or suite', 'pilot'],
  },
  {
    id: 'act-dsnp-ma',
    category: 'actions',
    title: 'D-SNP & Medicare Advantage Risk Recovery Funnel',
    subtitle: 'Stop losing 20% co-insurance on dual-eligibles with automated crossover billing',
    href: '/lp/medicare-advantage-rcm',
    badge: 'Campaign',
    badgeVariant: 'amber',
    keywords: ['dsnp', 'medicare advantage', 'crossover', 'dual eligible', 'qmb', 'balance billing', 'medicaid secondary'],
  },
  {
    id: 'act-enterprise-cbo',
    category: 'actions',
    title: 'Enterprise Health System CBO Consolidation Funnel',
    subtitle: 'Multi-site CBO centralization, multi-EHR interoperability & sub-25 day AR',
    href: '/lp/enterprise-rcm',
    badge: 'Campaign',
    badgeVariant: 'purple',
    keywords: ['enterprise', 'cbo', 'health system', 'mso', 'multi-site', 'epic', 'athena', 'cash flow', 'rfp'],
  },
  {
    id: 'act-solo-practice',
    category: 'actions',
    title: 'Solo Practice Overhead Reduction & Billing Funnel',
    subtitle: 'Cut 40%+ in-house billing overhead with dedicated AAPC certified specialists',
    href: '/lp/solo-practice-rcm',
    badge: 'Campaign',
    badgeVariant: 'emerald',
    keywords: ['solo practice', 'independent physician', 'small group', 'overhead', 'savings', 'biller turnover'],
  },
  {
    id: 'act-denial-recovery-pilot',
    category: 'actions',
    title: 'PPC 50-Claim Denial Recovery Pilot',
    subtitle: 'Zero-risk 14-day turnaround audit of 50 real denied claims',
    href: '/lp/denial-recovery-pilot',
    badge: 'Campaign',
    badgeVariant: 'amber',
    keywords: ['denial recovery', 'ppc', 'pilot', '50 claims', 'fast track', 'denials', 'appeals'],
  },
  {
    id: 'act-switch-billing',
    category: 'actions',
    title: 'Zero-Downtime Billing Vendor Switch Guarantee',
    subtitle: '30-day parallel cutover, 100% EHR data migration & uninterrupted cash flow',
    href: '/lp/switch-medical-billing',
    badge: 'Campaign',
    badgeVariant: 'blue',
    keywords: ['switch', 'transition', 'billing vendor', 'fire biller', 'migration', 'zero downtime'],
  },
  {
    id: 'act-contact',
    category: 'actions',
    title: 'Contact Billing Desk & Support',
    subtitle: 'Phone: (813) 519-4640 | Direct Partner: kirkmar078@gmail.com',
    href: '/contact',
    badge: 'Support',
    badgeVariant: 'slate',
    keywords: ['contact', 'email', 'phone', 'support', 'address', 'tampa', 'kiran'],
  },
];

let cachedPayerItems: SearchItem[] | null = null;
let cachedDenialItems: SearchItem[] | null = null;

export function getPayerSearchItems(): SearchItem[] {
  if (cachedPayerItems) return cachedPayerItems;

  const rawPayers = (payersData as { payers: Array<{
    slug: string;
    name: string;
    aka?: string[];
    type: string;
    payerId?: string | null;
    clearinghouseId?: string | null;
    parStatus?: string | null;
    timelyFiling?: string | null;
    portalUrl?: string | null;
  }> }).payers || [];

  cachedPayerItems = rawPayers.map((p) => ({
    id: `payer-${p.slug}`,
    category: 'payers',
    title: p.name,
    subtitle: [
      p.type ? `${p.type} Plan` : '',
      p.payerId ? `Payer ID: ${p.payerId}` : p.clearinghouseId ? `EDI ID: ${p.clearinghouseId}` : '',
      p.parStatus ? `Status: ${p.parStatus}` : '',
      p.timelyFiling ? `Filing: ${p.timelyFiling.slice(0, 35)}…` : '',
    ]
      .filter(Boolean)
      .join(' • '),
    description: p.timelyFiling || `Payer profile with clearinghouse EDI routing, timely filing deadlines, and claims routing.`,
    href: `/payers/directory/${p.slug}`,
    badge: p.type || 'Payer',
    badgeVariant: p.type === 'BCBS' ? 'blue' : p.type === 'Medicare' ? 'purple' : 'teal',
    keywords: [
      p.name.toLowerCase(),
      p.slug.toLowerCase(),
      p.type?.toLowerCase() || '',
      p.payerId?.toLowerCase() || '',
      p.clearinghouseId?.toLowerCase() || '',
      ...(p.aka || []).map((a) => a.toLowerCase()),
      'payer',
      'clearinghouse',
      'edi',
      'insurance',
      'timely filing',
      'portal',
    ],
    payerDetail: {
      slug: p.slug,
      payerId: p.payerId,
      type: p.type,
      timelyFiling: p.timelyFiling,
      portalUrl: p.portalUrl,
    },
  }));

  return cachedPayerItems;
}

export function getDenialSearchItems(): SearchItem[] {
  if (cachedDenialItems) return cachedDenialItems;

  const items: SearchItem[] = [];

  // Guided top codes
  for (const c of DENIAL_CODES) {
    items.push({
      id: `denial-guided-${c.code}`,
      category: 'denials',
      title: `CARC ${c.code}: ${c.label}`,
      subtitle: `${c.category} • ${c.difficulty ? c.difficulty.toUpperCase() : ''} ${c.rarc ? `• Paired: ${c.rarc}` : ''}`,
      description: c.rootCause,
      href: `/tools/denial-code-lookup?code=${encodeURIComponent(c.code)}`,
      badge: `CARC ${c.code}`,
      badgeVariant: c.difficulty === 'correctable' ? 'emerald' : c.difficulty === 'preventable' ? 'amber' : 'purple',
      keywords: [
        `carc ${c.code}`,
        `co-${c.code}`,
        `co ${c.code}`,
        `pr-${c.code}`,
        c.code,
        c.label.toLowerCase(),
        c.category.toLowerCase(),
        c.rarc?.toLowerCase() || '',
        ...c.aliases.map((a) => a.toLowerCase()),
        'denial',
        'rejection',
      ],
      denialDetail: {
        code: c.code,
        type: 'CARC',
        difficulty: c.difficulty,
        category: c.category,
        rootCause: c.rootCause,
        workIt: c.workIt,
        prevent: c.prevent,
        rarc: c.rarc,
      },
    });
  }

  // Reference codes (CARC and RARC)
  const refCodes = (denialRefData as { codes: Array<{
    code: string;
    type: 'CARC' | 'RARC';
    description: string;
    category: string;
    difficulty?: 'correctable' | 'preventable' | 'hard';
    workIt?: string;
    prevent?: string;
    handle?: string;
  }> }).codes || [];

  const guidedCodeSet = new Set(DENIAL_CODES.map((c) => c.code));

  for (const r of refCodes) {
    if (r.type === 'CARC' && guidedCodeSet.has(r.code)) continue;

    items.push({
      id: `denial-ref-${r.type}-${r.code}`,
      category: 'denials',
      title: `${r.type} ${r.code}: ${r.description}`,
      subtitle: `${r.category || 'General Remittance'}${r.difficulty ? ` • ${r.difficulty.toUpperCase()}` : ''}`,
      description: r.workIt || r.handle || r.description,
      href: `/tools/denial-code-lookup?code=${encodeURIComponent(r.code)}`,
      badge: `${r.type} ${r.code}`,
      badgeVariant: r.type === 'CARC' ? 'blue' : 'slate',
      keywords: [
        `${r.type.toLowerCase()} ${r.code}`,
        `${r.type.toLowerCase()}-${r.code}`,
        r.code,
        r.description.toLowerCase(),
        r.category?.toLowerCase() || '',
        'denial',
      ],
      denialDetail: {
        code: r.code,
        type: r.type,
        difficulty: r.difficulty,
        category: r.category,
        workIt: r.workIt || r.handle,
        prevent: r.prevent,
      },
    });
  }

  cachedDenialItems = items;
  return cachedDenialItems;
}

export function getAllSearchItems(): SearchItem[] {
  return [
    ...ACTION_ITEMS,
    ...TOOL_ITEMS,
    ...SPECIALTY_ITEMS,
    ...SERVICE_ITEMS,
    ...getPayerSearchItems(),
    ...getDenialSearchItems(),
  ];
}

export function searchIndex(
  query: string,
  categoryFilter: SearchCategory = 'all',
  limit = 25
): SearchItem[] {
  const q = query.trim().toLowerCase();
  const allItems = getAllSearchItems();

  if (!q) {
    const defaultList = [
      ...ACTION_ITEMS.slice(0, 3),
      ...TOOL_ITEMS.slice(0, 4),
      ...getPayerSearchItems().slice(0, 3),
      ...getDenialSearchItems().slice(0, 3),
      ...SPECIALTY_ITEMS.slice(0, 2),
    ];

    if (categoryFilter === 'all') {
      return defaultList.slice(0, limit);
    }
    return allItems.filter((item) => item.category === categoryFilter).slice(0, limit);
  }

  // Normalize query to strip punctuation for code searching (e.g. "CO-16" -> "co 16" or "16")
  const strippedCode = q.replace(/^(carc|rarc|co|pr|oa|pi|cr)[-\s]?/i, '').trim();
  const queryTerms = q.split(/\s+/).filter(Boolean);

  const matched = allItems.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }

    // Direct code lookup shortcut:
    if (item.category === 'denials' && item.denialDetail) {
      if (strippedCode && item.denialDetail.code.toLowerCase() === strippedCode) {
        return true;
      }
    }

    const titleLower = item.title.toLowerCase();
    const subLower = item.subtitle?.toLowerCase() || '';
    const descLower = item.description?.toLowerCase() || '';
    const badgeLower = item.badge?.toLowerCase() || '';

    return queryTerms.every((term) => {
      if (titleLower.includes(term)) return true;
      if (badgeLower.includes(term)) return true;
      if (subLower.includes(term)) return true;
      if (descLower.includes(term)) return true;
      return item.keywords.some((k) => k.includes(term));
    });
  });

  // Relevance ranking
  matched.sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();

    // Direct code hit
    if (strippedCode) {
      const aCodeHit = a.denialDetail?.code.toLowerCase() === strippedCode;
      const bCodeHit = b.denialDetail?.code.toLowerCase() === strippedCode;
      if (aCodeHit && !bCodeHit) return -1;
      if (bCodeHit && !aCodeHit) return 1;
    }

    const aExact = aTitle.startsWith(q) ? 100 : aTitle.includes(q) ? 50 : 0;
    const bExact = bTitle.startsWith(q) ? 100 : bTitle.includes(q) ? 50 : 0;

    const aBadge = a.badge?.toLowerCase().includes(q) ? 40 : 0;
    const bBadge = b.badge?.toLowerCase().includes(q) ? 40 : 0;

    return (bExact + bBadge) - (aExact + aBadge);
  });

  return matched.slice(0, limit);
}
