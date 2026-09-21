export interface SafeHarborQuestion {
  id: string;
  category: string;
  question: string;
  explanation: string;
  statute: string;
  penaltyRisk: string;
  options: {
    id: string;
    label: string;
    description: string;
    riskScore: number; // 0 = fully compliant, 10 = moderate, 25 = severe
    statusBadge: 'safe' | 'moderate' | 'critical';
  }[];
}

export interface RiskTier {
  minScore: number;
  maxScore: number;
  label: string;
  statusColor: string;
  legalImplication: string;
  oigTargetLevel: string;
  recommendation: string;
}

export const SAFE_HARBOR_QUESTIONS: SafeHarborQuestion[] = [
  {
    id: 'q1_coder_sovereignty',
    category: 'False Claims Act & Scienter',
    question: 'How are primary CPT/HCPCS codes and unbundling modifiers assigned in your current billing workflow?',
    explanation: 'Under 31 U.S.C. § 3729(b)(1), "knowing" submission includes reckless disregard or deliberate ignorance. Autonomous AI assigning codes without human clinical review exposes providers to per-claim civil penalties.',
    statute: 'False Claims Act (31 U.S.C. § 3729) & Civil Monetary Penalties Law',
    penaltyRisk: '$13,508 to $27,018 civil penalty per false claim line plus 3x damages',
    options: [
      {
        id: 'opt1_human_certified',
        label: 'AAPC / AHIMA Certified Human Specialist Signs Every Code',
        description: 'Software acts as algorithmic scrubber; a credentialed coder manually reviews operative notes and signs off before submission.',
        riskScore: 0,
        statusBadge: 'safe',
      },
      {
        id: 'opt1_spot_check',
        label: 'Clearinghouse Rules with Periodic Human Spot-Checks (~10-20%)',
        description: 'Most claims flow untouched through automated rules; only high-dollar or rejected claims receive human review.',
        riskScore: 12,
        statusBadge: 'moderate',
      },
      {
        id: 'opt1_autonomous_ai',
        label: 'Autonomous AI / Ambient Scribe Directly Submits to Payer Clearinghouse',
        description: 'Generative AI model assigns codes and modifiers from clinical conversation notes with zero human gatekeeper.',
        riskScore: 25,
        statusBadge: 'critical',
      },
    ],
  },
  {
    id: 'q2_ncci_unbundling',
    category: 'CMS NCCI Policy & Modifiers',
    question: 'How does your system substantiate Modifier -59, -X{EPSU}, or -25 when bypassing NCCI PTP edits?',
    explanation: 'The CMS NCCI Policy Manual specifies that modifiers bypassing bundling edits must be supported by explicit clinical documentation of a separate anatomical site or distinct encounter.',
    statute: 'CMS NCCI Policy Manual Chapter 1 § E & MLN Matters MM11168',
    penaltyRisk: 'Immediate post-payment recoupment (CARC CO-97), mandatory 100% pre-payment review, and RAC audits',
    options: [
      {
        id: 'opt2_operative_documentation',
        label: 'Independent Operative Verification by Specialty Coder',
        description: 'Every modifier attachment requires an excerpt citation proving a distinct incision, separate lesion, or unassociated encounter.',
        riskScore: 0,
        statusBadge: 'safe',
      },
      {
        id: 'opt2_clearinghouse_override',
        label: 'Billing Staff Manually Appends -59 Whenever Claim Rejects',
        description: 'Staff adds modifier reflexively to bypass clearinghouse rejections without reviewing the operative dictation.',
        riskScore: 15,
        statusBadge: 'moderate',
      },
      {
        id: 'opt2_ai_auto_append',
        label: 'AI Automatically Appends -59/-25 to Maximize Clean Claim Acceptance',
        description: 'Algorithm attaches unbundling modifiers without clinical validation whenever NCCI edit rules are triggered.',
        riskScore: 25,
        statusBadge: 'critical',
      },
    ],
  },
  {
    id: 'q3_drug_waste',
    category: 'CMS Part B Biologicals & Waste',
    question: 'How are single-dose injectable vials (J-codes) and discarded medication waste reported?',
    explanation: 'Section 90004 of the Infrastructure Act and CMS Transmittal 12165 mandate reporting discarded drug waste on a separate line with Modifier -JW, or attesting zero waste with Modifier -JZ.',
    statute: 'CMS Transmittal 12165 / Medicare Claims Processing Manual Chapter 17 § 40',
    penaltyRisk: '100% claim line denial plus federal clawback for billing unadministered medication',
    options: [
      {
        id: 'opt3_jw_jz_split',
        label: 'Deterministic J-Code Conversion with Dual-Line -JW / -JZ Accounting',
        description: 'Automated 11-digit NDC conversion with verified nurse MAR disposal logs for single-dose discarded units.',
        riskScore: 0,
        statusBadge: 'safe',
      },
      {
        id: 'opt3_manual_nursing',
        label: 'Manual Staff Entry from Nursing Flowsheets (Prone to Omission)',
        description: 'Waste is reported inconsistently; claims frequently bill full vial contents on a single line without Modifier -JW.',
        riskScore: 10,
        statusBadge: 'moderate',
      },
      {
        id: 'opt3_unreported_waste',
        label: 'Full Vial Billed as Administered; Waste Ignored or Unbilled',
        description: 'Entire vial volume is billed under primary HCPCS code regardless of amount discarded into hazardous disposal.',
        riskScore: 25,
        statusBadge: 'critical',
      },
    ],
  },
  {
    id: 'q4_phi_data_residency',
    category: 'HIPAA Security & Enclave Isolation',
    question: 'Where is Protected Health Information (PHI) processed and stored when interacting with AI algorithms?',
    explanation: 'HIPAA Security Rule (45 C.F.R. § 164.312) mandates access controls, audit controls, and integrity controls. Sending PHI to multi-tenant consumer AI APIs without BAA or sovereign enclave breaches federal privacy laws.',
    statute: 'HIPAA Security Rule 45 C.F.R. Part 160 & Part 164 Subparts A and C',
    penaltyRisk: 'HHS Office for Civil Rights (OCR) Tier 4 penalties up to $2,067,813 per calendar year',
    options: [
      {
        id: 'opt4_sovereign_enclave',
        label: 'US Sovereign Dedicated Cloud Enclaves with Hardware Nitro Isolation & BAA',
        description: 'Zero data retention, no third-party training, US data residency, and encrypted hardware boundary execution.',
        riskScore: 0,
        statusBadge: 'safe',
      },
      {
        id: 'opt4_standard_cloud',
        label: 'Commercial Multi-Tenant Cloud with Standard Vendor BAA',
        description: 'Vendor has BAA, but data is processed in shared multi-tenant infrastructure with generic log retention.',
        riskScore: 10,
        statusBadge: 'moderate',
      },
      {
        id: 'opt4_public_api',
        label: 'Public LLM API or Web Extension without Sovereign Infrastructure BAA',
        description: 'Staff or browser extensions pass patient notes to public generative AI endpoints for summarization or coding.',
        riskScore: 25,
        statusBadge: 'critical',
      },
    ],
  },
  {
    id: 'q5_audit_trail_integrity',
    category: 'CMS RAC Defense & Audit Trail',
    question: 'What forensic proof can your practice produce if a CMS Recovery Audit Contractor (RAC) issues an ADR subpoena?',
    explanation: 'CMS RAC and DOJ investigators demand contemporaneous proof of who assigned each code, which specific operative line justified it, and cryptographic proof that notes were not altered post-audit.',
    statute: 'Medicare Program Integrity Manual Chapter 3 § 3.2.3 & Federal Rules of Evidence 902(13)',
    penaltyRisk: 'Automatic extrapolation of error rates across all historic claims resulting in massive recoupment demands',
    options: [
      {
        id: 'opt5_cryptographic_ledger',
        label: 'Sequential SHA-256 Merkle Ledger with 1-Click RAC Evidence Packet',
        description: 'Cryptographically locked chain linking raw EMR note, NCCI ruleset, and certified coder digital signature.',
        riskScore: 0,
        statusBadge: 'safe',
      },
      {
        id: 'opt5_standard_pms_logs',
        label: 'Standard Practice Management System (PMS) User Edit Timestamps',
        description: 'Basic system timestamps indicating user account changes, with no cryptographic non-repudiation.',
        riskScore: 12,
        statusBadge: 'moderate',
      },
      {
        id: 'opt5_no_audit_trail',
        label: 'No Sequential Chain of Custody; AI Edits Merged Without History',
        description: 'Claims are submitted directly; impossible to reconstruct whether AI or human determined specific line items.',
        riskScore: 25,
        statusBadge: 'critical',
      },
    ],
  },
  {
    id: 'q6_global_period_unbundling',
    category: 'Global Surgical Package Compliance',
    question: 'How are post-operative visits (E/M codes) during 010-day and 090-day surgical global periods adjudicated?',
    explanation: 'CMS Pub 100-04 Chapter 12 § 40 defines all normal post-operative care as included in the surgical fee. Billing Modifier -24 or -25 during a global period requires an unrelated clinical diagnosis or documented acute complication.',
    statute: 'CMS Medicare Claims Processing Manual Chapter 12 § 40 (Global Surgery)',
    penaltyRisk: 'OIG Work Plan continuous audit target; 100% recoupment of post-op E/M charges plus audit penalties',
    options: [
      {
        id: 'opt6_global_scrubber',
        label: 'Automated Global Calendar Scrubber with Certified Physician Attestation',
        description: 'Calculates exact surgical end dates; prevents billing E/M unless distinct unrelated diagnosis (Modifier -24) is proven.',
        riskScore: 0,
        statusBadge: 'safe',
      },
      {
        id: 'opt6_manual_calendar',
        label: 'Manual Front-Desk / Billing Calendar Checks (Frequent Leakage)',
        description: 'Staff manually counts days; routine follow-ups are occasionally unbundled or legitimate billable visits are missed.',
        riskScore: 10,
        statusBadge: 'moderate',
      },
      {
        id: 'opt6_ai_unbundled_em',
        label: 'Autonomous System Bills Routine Post-Op Visits as Independent Level 3/4 E/M',
        description: 'AI bills standard post-operative suture removal or wound checks with Modifier -24 without medical necessity.',
        riskScore: 25,
        statusBadge: 'critical',
      },
    ],
  },
];

export const RISK_TIERS: RiskTier[] = [
  {
    minScore: 0,
    maxScore: 20,
    label: 'SOVEREIGN SAFE-HARBOR (Audit-Proof)',
    statusColor: 'text-emerald-400',
    legalImplication: 'Full protection under False Claims Act safe-harbor standards. Cryptographic chain of custody proves human clinical verification for every submitted code.',
    oigTargetLevel: 'Negligible (Audit Risk < 1%)',
    recommendation: 'Maintain current sovereign protocol. Your workflow establishes exemplary defense against CMS RAC and commercial payer SIU investigations.',
  },
  {
    minScore: 21,
    maxScore: 60,
    label: 'MODERATE REGULATORY EXPOSURE',
    statusColor: 'text-amber-400',
    legalImplication: 'Significant vulnerabilities exist in clearinghouse overrides or unverified modifier attachments. Payer post-payment audits may trigger recoupments.',
    oigTargetLevel: 'Elevated (Audit Risk ~18-35%)',
    recommendation: 'Implement mandatory specialty-certified coder sign-offs for all NCCI edits and single-dose vial drug waste. Eliminate reflexive clearinghouse overrides.',
  },
  {
    minScore: 61,
    maxScore: 150,
    label: 'CRITICAL FALSE CLAIMS ACT EXPOSURE',
    statusColor: 'text-rose-400',
    legalImplication: 'Severe legal exposure under 31 U.S.C. § 3729. Autonomous AI code submissions without human clinical verification satisfy statutory definitions of reckless disregard.',
    oigTargetLevel: 'Severe (Immediate Target for RAC / OIG Investigation)',
    recommendation: 'Immediately suspend autonomous AI code submission. Deploy Aethera Sovereign Gate to mandate certified human sign-off on all CPT, HCPCS, and Modifier lines.',
  },
];
