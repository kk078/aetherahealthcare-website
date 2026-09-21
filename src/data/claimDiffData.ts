export interface ClaimLineItem {
  code: string;
  system: 'CPT' | 'HCPCS' | 'ICD-10';
  modifiers: string[];
  units: number;
  charge: string;
  isError?: boolean;
  errorReason?: string;
  isCorrected?: boolean;
  correctionNote?: string;
}

export interface ClaimDiffCase {
  id: string;
  caseNumber: number;
  title: string;
  specialty: string;
  patientScenario: string;
  clinicalEncounterSnippet: string;
  
  // AI Claim (Unverified Black-Box)
  aiClaim: {
    status: 'DENIED / AUDIT CLAWBACK' | 'FEDERAL FRAUD TRIPWIRE' | 'REVENUE LEAKAGE' | 'REVENUE LEAKAGE / DOWNCODED';
    statusColor: string;
    lines: ClaimLineItem[];
    totalBilled: string;
    fatalErrorSummary: string;
    carcCode: string;
    carcDescription: string;
    financialPenaltyRisk: string;
    oigCitation: string;
  };

  // Aethera Sovereign Human Claim
  sovereignClaim: {
    status: 'APPROVED & PAID 100%' | 'SOVEREIGN SEALED';
    statusColor: string;
    lines: ClaimLineItem[];
    totalApproved: string;
    humanInterventionSummary: string;
    credentialedReviewer: string;
    cmsManualReference: string;
    protectedRevenue: string;
    sha256Seal: string;
  };
}

export const CLAIM_DIFF_CASES: ClaimDiffCase[] = [
  {
    id: 'mohs-surgery',
    caseNumber: 1,
    title: 'Mohs Micrographic Surgery & Complex Bilobed Flap',
    specialty: 'Dermatology & Cutaneous Oncology',
    patientScenario:
      '68yo patient with recurrent 1.8 cm basal cell carcinoma of the left nasal ala. Mohs stage 1 (5 tissue blocks examined), stage 2 (3 blocks examined, negative margins). Resulting 2.2 x 1.8 cm full-thickness defect repaired via bilobed local transposition flap (4.0 sq cm total defect/flap area).',
    clinicalEncounterSnippet:
      '"Stage I: 5 horizontal frozen sections mapped, positive at 3 o\'clock. Stage II: 3 sections mapped, margins clear. Defect measuring 2.2 x 1.8 cm repaired using an adjacent tissue transfer bilobed flap designed from nasal dorsum. Buried 4-0 Vicryl and 5-0 Prolene cutaneous closure."',
    aiClaim: {
      status: 'DENIED / AUDIT CLAWBACK',
      statusColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
      lines: [
        {
          code: '17311',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$612.40',
        },
        {
          code: '17312',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$348.10',
        },
        {
          code: '14060',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$780.50',
          isError: true,
          errorReason: 'Missing Modifier -59 or -XU to unbundle surgical excision from adjacent tissue transfer under NCCI edits.',
        },
        {
          code: '12014',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$242.00',
          isError: true,
          errorReason: 'FATAL UNBUNDLING: AI billed intermediate closure separately. Under NCCI Chapter 1, repair is bundled into adjacent tissue transfer 14060.',
        },
      ],
      totalBilled: '$1,983.00',
      fatalErrorSummary:
        'AI unbundled intermediate closure 12014 with flap 14060 and omitted mandatory NCCI modifier on the flap reconstruction. Payer clearinghouse triggered automated claim-level denial for unbundling fraud.',
      carcCode: 'CO-97',
      carcDescription: 'The benefit for this service is included in the payment/allowance for another service/procedure that has already been adjudicated.',
      financialPenaltyRisk: '$1,983.00 total claim forfeiture + placement on Commercial Special Investigation Unit (SIU) prepayment review.',
      oigCitation: 'OIG Work Plan Focus: Dermatologic Mohs Surgery and Concurrent Flap Repairs (OEI-09-20-00430).',
    },
    sovereignClaim: {
      status: 'APPROVED & PAID 100%',
      statusColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
      lines: [
        {
          code: '17311',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$612.40',
          isCorrected: false,
        },
        {
          code: '17312',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$348.10',
          isCorrected: false,
        },
        {
          code: '14060',
          system: 'CPT',
          modifiers: ['-59'],
          units: 1,
          charge: '$780.50',
          isCorrected: true,
          correctionNote: 'Certified coder appended Modifier -59 to substantiate distinct surgical reconstruction procedure per NCCI Policy Manual Ch. 3 § D.',
        },
      ],
      totalApproved: '$1,741.00',
      humanInterventionSummary:
        'Certified Dermatology Coder deleted the illicit unbundled intermediate closure (12014) and appended Modifier -59 to 14060 with surgical operative diagram linkage. Claim paid on primary submission in 11 days.',
      credentialedReviewer: 'Elena Vance, CPC, CPB (Dermatology Specialist, 12 yrs exp)',
      cmsManualReference: 'CMS IOM Pub. 100-04, Chapter 12, § 40.1 & NCCI Chapter 3 § D (Adjacent Tissue Transfer)',
      protectedRevenue: '$1,741.00 paid cleanly; $4,850 in potential RAC clawbacks and audit fines prevented.',
      sha256Seal: '8f9e1a3b7c2d4e5f6a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f',
    },
  },
  {
    id: 'spinal-co-surgery',
    caseNumber: 2,
    title: 'Multi-Level Spinal Arthrodesis with Co-Surgeons',
    specialty: 'Orthopedic Spine & Neurosurgery',
    patientScenario:
      '64yo patient with severe L3-L5 degenerative spondylolisthesis and neurogenic claudication. Underwent L3-L5 posterior lumbar interbody fusion (PLIF), bilateral pedicle screw fixation, and L3-L5 decompressive laminectomy performed simultaneously by two attending surgeons of distinct specialties (Neurosurgeon + Orthopedic Spine Surgeon).',
    clinicalEncounterSnippet:
      '"Dr. Miller (Neurosurgery) performed the neural decompression, medial facetectomies, and disc space preparation. Dr. Harris (Orthopedics) performed the interbody cage insertion, autograft packing, and bilateral pedicle screw instrumented fusion at L3-L4 and L4-L5."',
    aiClaim: {
      status: 'DENIED / AUDIT CLAWBACK',
      statusColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
      lines: [
        {
          code: '22633',
          system: 'CPT',
          modifiers: ['-80'],
          units: 1,
          charge: '$3,850.00',
          isError: true,
          errorReason: 'FATAL MODIFIER ERROR: AI billed Modifier -80 (Assistant Surgeon) instead of -62 (Two Surgeons). Co-surgeon requires -62; -80 pays only 16% instead of 62.5%!',
        },
        {
          code: '22634',
          system: 'CPT',
          modifiers: ['-80'],
          units: 1,
          charge: '$1,920.00',
          isError: true,
          errorReason: 'Incorrect assistant modifier replicated on add-on interspace.',
        },
        {
          code: '63047',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$1,480.00',
          isError: true,
          errorReason: 'NCCI COLUMN 1 EDIT: Laminectomy 63047 is bundled into combined PLIF code 22633 at the same interspace and cannot be unbundled.',
        },
        {
          code: '22842',
          system: 'CPT',
          modifiers: ['-62'],
          units: 1,
          charge: '$2,100.00',
          isError: true,
          errorReason: 'CMS MPFS POLICY ERROR: Co-surgery modifier -62 is NOT permitted on instrumentation code 22842 (Co-surgeon Indicator = 0).',
        },
      ],
      totalBilled: '$9,350.00 per surgeon',
      fatalErrorSummary:
        'AI downgraded Co-Surgeons to Assistant Surgeons (-80), forfeited 46% of physician fees, billed bundled laminectomy 63047, and appended Modifier -62 to an instrumentation code that has CMS Co-Surgeon Indicator 0.',
      carcCode: 'CO-4 / CO-236',
      carcDescription: 'The procedure code is inconsistent with the modifier used or a required modifier is missing. Procedure or modifier not compatible with fee schedule.',
      financialPenaltyRisk: '$14,280 in legitimate surgeon revenue lost due to improper assistant surgeon downcoding.',
      oigCitation: 'OIG Report A-05-18-00045: Questionable Billing for Spinal Fusions and Co-Surgeon Indicators.',
    },
    sovereignClaim: {
      status: 'APPROVED & PAID 100%',
      statusColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
      lines: [
        {
          code: '22633',
          system: 'CPT',
          modifiers: ['-62'],
          units: 1,
          charge: '$3,850.00',
          isCorrected: true,
          correctionNote: 'Correctly appended Modifier -62 for both distinct specialty surgeons with separate dictations detailing specific operative roles.',
        },
        {
          code: '22634',
          system: 'CPT',
          modifiers: ['-62'],
          units: 1,
          charge: '$1,920.00',
          isCorrected: true,
          correctionNote: 'Add-on interspace billed with Modifier -62 under CMS MPFS Indicator 2.',
        },
        {
          code: '22842',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$2,100.00',
          isCorrected: true,
          correctionNote: 'Billed exclusively under primary instrumentation surgeon without -62 per CMS fee schedule indicator rules.',
        },
      ],
      totalApproved: '$7,870.00 per surgeon (125% combined)',
      humanInterventionSummary:
        'Certified General Surgery Coder (CGSC) removed bundled 63047, corrected assistant modifier -80 to co-surgeon -62 on fusion codes, and decoupled instrumentation 22842 to the designated orthopedist. Both claims paid in full.',
      credentialedReviewer: 'Marcus Sterling, CGSC, CPC (Complex Spine Specialist, 15 yrs exp)',
      cmsManualReference: 'CMS IOM Pub. 100-04, Chapter 12, § 40.8 (Co-Surgeons) & Medicare Physician Fee Schedule DB',
      protectedRevenue: '$15,740.00 total practice reimbursement secured without a single payer dispute.',
      sha256Seal: '4a1b2c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    },
  },
  {
    id: 'chemo-drug-waste',
    caseNumber: 3,
    title: 'Oncology Chemotherapy Biologic Infusion & Waste',
    specialty: 'Hematology & Medical Oncology',
    patientScenario:
      '58yo patient with HER2+ metastatic breast cancer receiving IV infusion of Trastuzumab (Herceptin) 420 mg multi-dose reconstituted vial. Prescribed dose based on BSA: 340 mg administered. Discarded remainder from single-use container: 80 mg. Total IV chemotherapy infusion time: 92 minutes. Pre-medication Diphenhydramine 50 mg IV push given 30 mins prior.',
    clinicalEncounterSnippet:
      '"Administered Trastuzumab 340 mg IV over 92 minutes. Prepared from 420 mg single-dose vial; exactly 80 mg discarded in presence of RN witness. Pre-medicated with Diphenhydramine 50 mg IV push at 08:30."',
    aiClaim: {
      status: 'FEDERAL FRAUD TRIPWIRE',
      statusColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
      lines: [
        {
          code: 'J9355',
          system: 'HCPCS',
          modifiers: [],
          units: 42,
          charge: '$3,780.00',
          isError: true,
          errorReason: 'FATAL CMS DRUG MANDATE BREACH: AI billed total vial content (420 mg / 42 units) on a single line without Modifier -JW or -JZ. Under CMS CR 13059, billing discarded drugs as administered constitutes False Claims Act fraud!',
        },
        {
          code: '96413',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$310.00',
        },
        {
          code: '96415',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$145.00',
        },
        {
          code: '96374',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$110.00',
          isError: true,
          errorReason: 'AI billed pre-medication as initial injection 96374 instead of subsequent/concurrent add-on 96375, triggering clearinghouse rejection CO-97.',
        },
      ],
      totalBilled: '$4,345.00',
      fatalErrorSummary:
        'AI failed to split administered drug from discarded waste, omitting mandatory CMS Modifiers -JW and -JZ. Billing discarded cancer drug as administered constitutes a federal False Claims Act felony ($11,000+ penalty per claim).',
      carcCode: 'CO-16 / OIG AUDIT',
      carcDescription: 'Claim lacks information which is needed for adjudication. Mandatory CMS JW/JZ modifier missing.',
      financialPenaltyRisk: '$32,500+ in federal False Claims Act statutory penalties plus mandatory self-disclosure to HHS OIG.',
      oigCitation: 'CMS Transmittal 12171 / CR 13059 & OIG Review of Medicare Payments for Discarded Drugs (A-04-20-08055).',
    },
    sovereignClaim: {
      status: 'APPROVED & PAID 100%',
      statusColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
      lines: [
        {
          code: 'J9355',
          system: 'HCPCS',
          modifiers: ['-JZ'],
          units: 34,
          charge: '$3,060.00',
          isCorrected: true,
          correctionNote: 'Administered dose (340 mg = 34 units) isolated on Line 1 with mandatory CMS Modifier -JZ (zero waste on this line).',
        },
        {
          code: 'J9355',
          system: 'HCPCS',
          modifiers: ['-JW'],
          units: 8,
          charge: '$720.00',
          isCorrected: true,
          correctionNote: 'Discarded waste (80 mg = 8 units) isolated on Line 2 with mandatory CMS Modifier -JW (discarded single-use vial drug).',
        },
        {
          code: '96413',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$310.00',
          isCorrected: false,
        },
        {
          code: '96415',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$145.00',
          isCorrected: false,
        },
        {
          code: '96375',
          system: 'CPT',
          modifiers: ['-XU'],
          units: 1,
          charge: '$65.00',
          isCorrected: true,
          correctionNote: 'Corrected to subsequent IV push 96375 with Modifier -XU to unbundle non-chemotherapy pre-medication from chemotherapy base.',
        },
      ],
      totalApproved: '$4,300.00',
      humanInterventionSummary:
        'Certified Hematology & Oncology Coder (CHONC) mathematically calculated exact milligram splits, appended mandatory CMS Modifiers -JZ and -JW, and corrected pre-medication sequence. 100% compliant reimbursement approved.',
      credentialedReviewer: 'David Ross, CHONC, CPC (Oncology Billing Auditor, 14 yrs exp)',
      cmsManualReference: 'CMS IOM Pub. 100-04, Chapter 17, § 40 (Discarded Drugs) & CMS Transmittal 12171',
      protectedRevenue: '$4,300.00 collected; practice protected from catastrophic False Claims Act audit prosecution.',
      sha256Seal: '9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
    },
  },
  {
    id: 'anesthesia-concurrency',
    caseNumber: 4,
    title: 'Anesthesia Concurrency & Emergency Airway Crisis',
    specialty: 'Anesthesiology & Critical Care',
    patientScenario:
      'Anesthesiologist medically directing two concurrent OR rooms with CRNAs. Room 1: 52yo laparoscopic cholecystectomy (07:30 to 09:15, 105 mins). Room 2: 67yo total knee arthroplasty (08:00 to 10:00, 120 mins). At 08:15 in Room 1, patient developed acute severe laryngospasm on extubation requiring the anesthesiologist to spend 40 uninterrupted minutes personally managing the emergency airway, unable to oversee Room 2.',
    clinicalEncounterSnippet:
      '"Dr. Patel was directing CRNA Adams in OR 1 and CRNA Davis in OR 2. At 08:15 in OR 1, patient developed complete laryngospasm. Dr. Patel personally took over the airway, administered succinylcholine, and managed the patient continuously until 08:55."',
    aiClaim: {
      status: 'DENIED / AUDIT CLAWBACK',
      statusColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
      lines: [
        {
          code: '00790',
          system: 'CPT',
          modifiers: ['-QK'],
          units: 105,
          charge: '$1,480.00',
          isError: true,
          errorReason: 'TEFRA 7 RULE BREACH: Medical direction -QK is prohibited during personal management of an emergency. Doctor personally performed the airway crisis!',
        },
        {
          code: '00840',
          system: 'CPT',
          modifiers: ['-QK'],
          units: 120,
          charge: '$1,620.00',
          isError: true,
          errorReason: 'CONCURRENCY CONFLICT: Between 08:15 and 08:55, Dr. Patel was trapped in Room 1 and could not fulfill TEFRA requirement to be immediately available in Room 2.',
        },
      ],
      totalBilled: '$3,100.00',
      fatalErrorSummary:
        'AI blindly billed medical direction (-QK) for both rooms across the entire case duration. In reality, the 40-minute emergency broke medical direction in Room 2 under federal TEFRA 7 rules (42 CFR § 415.110).',
      carcCode: 'CO-23 / RAC OVERPAYMENT',
      carcDescription: 'The impact of prior payer(s) adjudication including payments and/or adjustments. Case concurrency overlap invalidates medical direction.',
      financialPenaltyRisk: 'Recoupment of 100% of medical direction fees ($3,100) + treble damages under OIG Anesthesia Concurrency Work Plan.',
      oigCitation: 'OIG Work Plan: Review of Medicare Payments for Anesthesia Services (Medical Direction Concurrency Rules).',
    },
    sovereignClaim: {
      status: 'APPROVED & PAID 100%',
      statusColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
      lines: [
        {
          code: '00790',
          system: 'CPT',
          modifiers: ['-AA'],
          units: 105,
          charge: '$1,850.00',
          isCorrected: true,
          correctionNote: 'Converted to Modifier -AA (Personally performed) for Room 1 due to continuous personal management of the critical airway event.',
        },
        {
          code: '00840',
          system: 'CPT',
          modifiers: ['-QZ'],
          units: 120,
          charge: '$1,620.00',
          isCorrected: true,
          correctionNote: 'Room 2 converted to Modifier -QZ (CRNA non-medically directed service) for the broken direction period, legally shielding the anesthesiologist from false billing.',
        },
      ],
      totalApproved: '$3,470.00',
      humanInterventionSummary:
        'Certified Anesthesia Coder (CANPC) re-calculated exact minute splits, segmented Room 1 to -AA personally performed (higher 100% allowable rate) and shifted Room 2 to CRNA un-directed -QZ. Avoided audit clawback while legitimately increasing compliant payment by $370.',
      credentialedReviewer: 'Sarah Jenkins, CANPC, CPC (Anesthesia Compliance Officer, 16 yrs exp)',
      cmsManualReference: 'CMS IOM Pub. 100-04, Chapter 12, § 50 & 42 CFR § 415.110 (TEFRA 7 Conditions of Payment)',
      protectedRevenue: '$3,470.00 legally protected with zero concurrency audit vulnerability.',
      sha256Seal: '1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    },
  },
  {
    id: 'ed-critical-care',
    caseNumber: 5,
    title: 'Emergency Medicine Critical Care vs E/M Downcoding',
    specialty: 'Emergency Medicine & Trauma',
    patientScenario:
      '72yo patient presenting to ED in septic shock secondary to acute pyelonephritis (blood pressure 78/42, lactate 4.6, altered mental status). ED physician spent 48 minutes of direct bedside critical care resuscitating patient with fluid boluses and pressors, in addition to performing an ultrasound-guided non-tunneled internal jugular central venous line (18 minutes separate procedure time). Patient admitted to ICU.',
    clinicalEncounterSnippet:
      '"Total critical care time spent managing this patient\'s septic shock and titrating norepinephrine was 48 minutes, exclusive of time spent placing the central venous line. Central line placement took 18 minutes using real-time dynamic ultrasound guidance."',
    aiClaim: {
      status: 'REVENUE LEAKAGE / DOWNCODED',
      statusColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      lines: [
        {
          code: '99285',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$385.00',
          isError: true,
          errorReason: 'SEVERE DOWNCODING: AI downcoded to ED Level 5 (99285) because notes mentioned "admitted to ICU", missing $265 in legitimate critical care physician reimbursement.',
        },
        {
          code: '36556',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$295.00',
        },
        {
          code: '76937',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$78.00',
          isError: true,
          errorReason: 'AI billed ultrasound guidance without mandatory Modifier -26 (Professional component) on hospital place of service 23.',
        },
      ],
      totalBilled: '$758.00',
      fatalErrorSummary:
        'AI ambient scribing tool failed to capture critical care time (CPT 99291), forfeiting $265 in legitimate revenue, and billed technical ultrasound imaging in a hospital facility (Place of Service 23) causing an automatic clearinghouse rejection.',
      carcCode: 'CO-4 / REVENUE LEAK',
      carcDescription: 'The procedure code is inconsistent with the modifier used. Technical component billed in inpatient/ED facility.',
      financialPenaltyRisk: '$343 in lost physician revenue per high-acuity encounter ($145,000+ annual practice revenue leakage).',
      oigCitation: 'CMS IOM Pub. 100-04, Ch. 12, § 30.6.12: Emergency Department Critical Care Services.',
    },
    sovereignClaim: {
      status: 'APPROVED & PAID 100%',
      statusColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
      lines: [
        {
          code: '99291',
          system: 'CPT',
          modifiers: ['-25'],
          units: 1,
          charge: '$650.00',
          isCorrected: true,
          correctionNote: 'Properly captured 48 minutes of net critical care time with Modifier -25 to unbundle from separate surgical central line procedure.',
        },
        {
          code: '36556',
          system: 'CPT',
          modifiers: [],
          units: 1,
          charge: '$295.00',
          isCorrected: false,
        },
        {
          code: '76937',
          system: 'CPT',
          modifiers: ['-26'],
          units: 1,
          charge: '$42.00',
          isCorrected: true,
          correctionNote: 'Appended Modifier -26 (Professional component only) for ultrasound guidance performed in hospital facility setting.',
        },
      ],
      totalApproved: '$987.00',
      humanInterventionSummary:
        'Certified Emergency Department Coder (CEDC) audited provider time logs, confirmed procedural central line time was strictly deducted from critical care time, applied Modifier -25, and restricted ultrasound guidance to professional component -26. Paid 100% on day 14.',
      credentialedReviewer: 'Rachel Chen, CEDC, CPC (Emergency Medicine Auditor, 11 yrs exp)',
      cmsManualReference: 'CMS IOM Pub. 100-04, Ch. 12, § 30.6.12 & CPT Assistant (Critical Care Time Calculations)',
      protectedRevenue: '$987.00 full allowable captured; stopped $145,000 in annual physician practice downcoding leakage.',
      sha256Seal: '5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c',
    },
  },
];
