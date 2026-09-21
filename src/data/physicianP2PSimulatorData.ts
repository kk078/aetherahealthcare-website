export interface P2PDialogueTurn {
  speaker: 'payer' | 'physician';
  speakerTitle: string;
  speakerAffiliation: string;
  statement: string;
  statutoryContext?: string;
  audioVoicePitch?: number; // Pitch variation for speech synthesis
  options?: {
    id: string;
    label: string;
    tone: 'passive' | 'aggressive' | 'sovereign';
    text: string;
    authorityScoreDelta: number;
    feedback: string;
    statutoryCitation: string;
    nextTurnIndex?: number;
  }[];
}

export interface P2PScenario {
  id: string;
  title: string;
  specialty: string;
  cptOrHcpcs: string;
  payerName: string;
  payerAlgorithm: string;
  denialBasis: string;
  atRiskRevenue: string;
  governingStatute: string;
  initialDirectorName: string;
  initialDirectorBoard: string;
  dialogueScript: P2PDialogueTurn[];
  successfulResolution: {
    authorizationNumber: string;
    reversalBasis: string;
    physicianRoi: string;
    statutorySafeHarborInvoked: string;
  };
}

export const P2P_SCENARIOS: P2PScenario[] = [
  {
    id: 'p2p-spine-fusion',
    title: 'Lumbar Posterolateral Arthrodesis Prior Auth Denial',
    specialty: 'Orthopedic Spine Surgery / Neurosurgery',
    cptOrHcpcs: 'CPT 22612 + 22842',
    payerName: 'Optum / UnitedHealthcare Medicare Advantage',
    payerAlgorithm: 'Optum PriorAuth AI / InterQual Criteria Engine',
    denialBasis: 'Failure to document 6 consecutive months of conservative physical therapy; proprietary algorithm deemed fusion investigational.',
    atRiskRevenue: '$28,450 (Facility & Professional Combined)',
    governingStatute: 'CMS-4201-F (42 CFR § 422.101(b)) & Medicare LCD L34165',
    initialDirectorName: 'Dr. Arthur Vance, MD (Internal Medicine / Utilization Review)',
    initialDirectorBoard: 'Board Certified in Internal Medicine (Non-Spine Specialist)',
    dialogueScript: [
      {
        speaker: 'payer',
        speakerTitle: 'Payer Medical Director',
        speakerAffiliation: 'Optum Care Solutions / UHC Utilization Management',
        statement: 'Thank you for connecting, Doctor. I am reviewing the prior authorization request for CPT 22612, single-level lumbar arthrodesis, for your 64-year-old patient. Under our InterQual clinical guidelines, spinal fusion requires at least 6 continuous months of formal physical therapy within the past calendar year. Your chart documentation only reflects 14 weeks. On that basis, the service is deemed not medically necessary.',
        statutoryContext: 'Payer uses proprietary InterQual guideline variations to impose therapy durations exceeding Traditional Medicare Local Coverage Determinations.',
        options: [
          {
            id: 'opt-passive',
            label: 'A. Clinical Plea (Passive / Subjective)',
            tone: 'passive',
            text: 'Look, Dr. Vance, the patient is in agonizing pain. She cannot sleep or walk more than 10 yards. 14 weeks was all she could tolerate because therapy was aggravating her facet arthropathy. We really believe surgery is her only hope.',
            authorityScoreDelta: -30,
            feedback: 'DENIAL UPHELD: Citing patient suffering or subjective clinical opinion without statutory authority allows the medical director to uphold the denial based on rigid corporate criteria.',
            statutoryCitation: 'Subjective clinical appeal fails to refute InterQual contractual thresholds.',
          },
          {
            id: 'opt-aggressive',
            label: 'B. Hostile Accusation (Adversarial)',
            tone: 'aggressive',
            text: 'This is outrageous and bordering on criminal malpractice. You have never laid hands on this patient or seen her MRI. You are just a bureaucrat denying life-saving surgery to hit corporate bonus targets. I am reporting you to the state medical board!',
            authorityScoreDelta: -45,
            feedback: 'CALL TERMINATED: Payer director terminates the call due to hostile language. Claim is routed to formal written grievance queue, causing a 60-day delay while the patient deteriorates.',
            statutoryCitation: 'Emotional escalation forfeits the real-time peer-to-peer opportunity.',
          },
          {
            id: 'opt-sovereign',
            label: 'C. Sovereign Statutory Strike (CMS-4201-F & Board Parity)',
            tone: 'sovereign',
            text: 'Good afternoon, Dr. Vance. Before discussing therapy duration, let us establish statutory jurisdiction. Under CMS Final Rule 4201-F (42 CFR § 422.101(b)), Medicare Advantage Organizations cannot apply clinical criteria more restrictive than Traditional Medicare Local Coverage Determinations. Medicare LCD L34165 requires documented dynamic instability and failure of conservative management, which 14 weeks of therapy plus epidural steroid injections fully satisfy. Furthermore, on the record, may I confirm your NPI and whether you hold active board certification in Orthopedic Spine or Neurological Surgery?',
            authorityScoreDelta: +50,
            feedback: 'SOVEREIGN ADVANTAGE: Invoking CMS-4201-F establishes that the payer cannot use proprietary InterQual limits over Medicare LCDs. Inquiring about board certification triggers peer-parity statutory requirements under 42 CFR § 422.566.',
            statutoryCitation: 'CMS-4201-F (42 CFR § 422.101) & 42 CFR § 422.566(d) Peer Specialization Mandate',
          },
        ],
      },
      {
        speaker: 'payer',
        speakerTitle: 'Payer Medical Director',
        speakerAffiliation: 'Optum Care Solutions / UHC Utilization Management',
        statement: 'Doctor, while I note your reference to CMS-4201-F, our health plan policy maintains internal coverage guidelines for surgical elective spine procedures. However, regarding the radiographic findings, our algorithm flagged absence of documented flexion-extension motion. Does the record substantiate translational instability exceeding 3 millimeters?',
        statutoryContext: 'Payer director retreats from the 6-month therapy requirement and pivots to radiographic criteria.',
        options: [
          {
            id: 'opt-rad-sovereign',
            label: 'A. Anatomical & Radiographic Verification (Rohen/PFS Aligned)',
            tone: 'sovereign',
            text: 'Yes, Dr. Vance. Standing flexion-extension radiographs performed on August 14th by board-certified musculoskeletal radiologists demonstrate 4.8 millimeters of translational anterolisthesis at L4-L5 with facet vacuum phenomenon, accompanied by severe central canal stenosis (< 6mm AP diameter) on MRI. This exceeds LCD L34165 instability thresholds. Certified coder analysis has confirmed CPT 22612 and instrumentation +22842 are fully substantiated. We demand immediate reversal and issuance of the prior authorization tracking number today.',
            authorityScoreDelta: +50,
            feedback: 'OVERTURN ACHIEVED: Providing specific millimeter measurements and referencing LCD L34165 closes every technical loophole. Payer medical director cannot defend the denial.',
            statutoryCitation: 'Medicare Part B LCD L34165 Section B.2 (Spinal Instability Objective Criteria)',
          },
          {
            id: 'opt-rad-passive',
            label: 'B. General MRI Referral (Vague)',
            tone: 'passive',
            text: 'Her MRI definitely showed stenosis and spondylolisthesis. I don\'t have the exact millimeters in front of me, but my clinical note states the spine was unstable.',
            authorityScoreDelta: -20,
            feedback: 'DENIAL SUSTAINED: Without exact millimeter measurements from flexion-extension views, payer director defers authorization pending supplemental written imaging reports.',
            statutoryCitation: 'LCD L34165 requires explicit measurement of translational or angular motion.',
          },
        ],
      },
    ],
    successfulResolution: {
      authorizationNumber: 'AUTH-MA-2026-88492-SPINE',
      reversalBasis: 'Overturned pursuant to CMS-4201-F preemption over proprietary InterQual guidelines; clinical documentation verifies 4.8mm dynamic translational instability exceeding LCD L34165 standards.',
      physicianRoi: '8-minute P2P discussion recovered $28,450.00 allowable without secondary administrative appeals.',
      statutorySafeHarborInvoked: '42 CFR § 422.101(b) Medicare Advantage Coverage Parity Rule',
    },
  },
  {
    id: 'p2p-two-midnight-tka',
    title: 'Total Knee Inpatient Admission Two-Midnight Rule Denial',
    specialty: 'Adult Reconstructive Orthopedics',
    cptOrHcpcs: 'CPT 27447 (Inpatient Admission Status)',
    payerName: 'Humana Medicare Advantage (Carelon MBM)',
    payerAlgorithm: 'nH Predict / Carelon Post-Acute Decision Engine',
    denialBasis: 'Payer claims total knee arthroplasty must be performed in ambulatory surgery center or outpatient observation (POS 22/24), denying Inpatient POS 21.',
    atRiskRevenue: '$16,800 (Inpatient DRG 470 payment clawback differential)',
    governingStatute: 'CMS Two-Midnight Rule (42 CFR § 412.3) & CMS-4201-F Mandate',
    initialDirectorName: 'Dr. Rebecca Stone, MD (Physical Medicine & Rehabilitation)',
    initialDirectorBoard: 'Board Certified in PM&R (Non-Orthopedic Arthroplasty Specialist)',
    dialogueScript: [
      {
        speaker: 'payer',
        speakerTitle: 'Payer Utilization Director',
        speakerAffiliation: 'Carelon Medical Benefits / Humana MA',
        statement: 'Hello, Doctor. We are conducting a concurrent inpatient stay review for your patient who underwent total knee arthroplasty yesterday. CPT 27447 is no longer on the CMS Inpatient-Only list. The patient is ambulating with a walker and vitals are stable. Our algorithm classifies this as an outpatient observation stay. We are issuing an adverse determination reclassifying the stay to outpatient status.',
        statutoryContext: 'Commercial payers leverage the removal of TKA from the Inpatient-Only (IPO) list to automatically downcode hospital admissions to outpatient observation.',
        options: [
          {
            id: 'opt-tka-passive',
            label: 'A. Bed Availability Argument (Passive)',
            tone: 'passive',
            text: 'Well, our hospital doesn\'t have an observation unit open this weekend, so the nurse supervisor admitted him to the general surgical floor. He really wasn\'t ready to go home.',
            authorityScoreDelta: -35,
            feedback: 'DOWNCODED: Administrative convenience or lack of observation beds is explicitly rejected by CMS and private payers as justification for acute inpatient status.',
            statutoryCitation: 'CMS Benefit Policy Manual Ch. 1 § 10 (Inpatient Hospital Services Defined)',
          },
          {
            id: 'opt-tka-sovereign',
            label: 'B. Sovereign Two-Midnight Rule & Complex Acuity Affirmation',
            tone: 'sovereign',
            text: 'Dr. Stone, removal of CPT 27447 from the IPO list does NOT mandate outpatient placement when clinical acuity spans two midnights. Under CMS-4201-F, Medicare Advantage plans must adhere to the Two-Midnight Rule (42 CFR § 412.3). The attending surgeon reasonably expected the patient to require medically necessary hospital care spanning two midnights based on: 1) severe Stage 3b chronic kidney disease requiring IV hydration monitoring, 2) morbid obesity (BMI 43.8) with severe OSA on continuous telemetry, and 3) post-op hypotension requiring IV boluses. Under 42 CFR § 412.3(d)(1), the clinical decision rests with physician judgment, not an algorithm.',
            authorityScoreDelta: +50,
            feedback: 'SOVEREIGN ADVANTAGE: CMS-4201-F explicitly required all Medicare Advantage plans to adopt the Two-Midnight Rule starting Jan 1, 2024. Payer algorithms cannot override physician expectation of a two-midnight stay supported by comorbidity documentation.',
            statutoryCitation: '42 CFR § 412.3(a)-(d) Two-Midnight Benchmark & CMS-4201-F Payer Mandate',
          },
        ],
      },
      {
        speaker: 'payer',
        speakerTitle: 'Payer Utilization Director',
        speakerAffiliation: 'Carelon Medical Benefits / Humana MA',
        statement: 'Doctor, the documentation does show the continuous pulse oximetry and nephrology consult. However, Carelon criteria state that telemetry monitoring alone does not justify an acute inpatient bed when room-air sats are above 90%. How do you reconcile this with our published clinical bulletin?',
        statutoryContext: 'Payer attempts to substitute proprietary clinical bulletin criteria for CMS two-midnight presumption.',
        options: [
          {
            id: 'opt-tka-reconcile-sovereign',
            label: 'A. Invoke Federal Preemption & Fiduciary Notice',
            tone: 'sovereign',
            text: 'Dr. Stone, plan bulletins cannot supersede federal regulation. CMS published explicit guidance in Medicare Managed Care Manual Chapter 4 and CMS-4201-F: MA plans cannot create proprietary criteria that deny inpatient stays when the Two-Midnight Benchmark is met. If this claim is denied, we will immediately escalate to the CMS Regional Office and request external independent review under 42 CFR § 422.618 with an audit referral for systemic non-compliance under OIG Report OEI-09-18-00260.',
            authorityScoreDelta: +50,
            feedback: 'OVERTURN ACHIEVED: Citing CMS Regional Office escalation and OIG audit referrals for Two-Midnight non-compliance compels the medical director to approve inpatient status.',
            statutoryCitation: '42 CFR § 422.618 & OIG Oversight on Systemic Inpatient Denials',
          },
        ],
      },
    ],
    successfulResolution: {
      authorizationNumber: 'AUTH-INPATIENT-2026-44910',
      reversalBasis: 'Inpatient status fully approved under 42 CFR § 412.3 Two-Midnight Rule and CMS-4201-F; documented ASA III comorbidities and nocturnal telemetry satisfy acute clinical benchmark.',
      physicianRoi: '6-minute P2P call preserved $16,800.00 DRG 470 payment rate vs $4,200 observation payment loss.',
      statutorySafeHarborInvoked: 'Two-Midnight Rule (42 CFR § 412.3)',
    },
  },
  {
    id: 'p2p-cardiac-stent',
    title: 'Diagnostic Cath + Emergent Coronary Stenting Bundling Denial',
    specialty: 'Interventional Cardiology',
    cptOrHcpcs: 'CPT 93458 + 92928-XU',
    payerName: 'Cigna Healthcare / CareAllies Utilization Review',
    payerAlgorithm: 'PXDX Automated Review / Optum Claims Edit Engine',
    denialBasis: 'Clearinghouse automated scrubber unbundled CPT 93458 (Diagnostic Coronary Angiogram), asserting it is incidental to PCI CPT 92928 under NCCI Column 2 edits.',
    atRiskRevenue: '$6,420 (Facility & Professional Cardiology Allowable)',
    governingStatute: 'CMS NCCI Policy Manual Ch. XI § E & ERISA § 502(a)',
    initialDirectorName: 'Dr. Harold Sterling, MD (Family Medicine / Utilization Review)',
    initialDirectorBoard: 'Board Certified in Family Medicine',
    dialogueScript: [
      {
        speaker: 'payer',
        speakerTitle: 'Payer Medical Reviewer',
        speakerAffiliation: 'Cigna Clinical Claims Review',
        statement: 'Doctor, our claim scrubber denied payment for CPT 93458 on the same date of service as CPT 92928. Under our national coding policy and NCCI Column 2 edits, diagnostic cardiac catheterization is bundled into percutaneous coronary intervention when performed in the same operative session. We cannot reimburse both procedures.',
        statutoryContext: 'Payers apply blanket NCCI unbundling edits ignoring Chapter XI exceptions for ad-hoc interventions based on newly discovered culprit lesions.',
        options: [
          {
            id: 'opt-cath-sovereign',
            label: 'A. Sovereign CMS Chapter XI Section E Exception Substantiation',
            tone: 'sovereign',
            text: 'Dr. Sterling, your automated scrubber misapplies NCCI guidelines. CMS NCCI Policy Manual Chapter XI, Section E explicitly provides that diagnostic catheterization is separately reportable with Modifier -XU if: 1) no prior catheterization was available within 30 days, or 2) the diagnostic catheterization established the initial medical necessity for an emergent therapeutic intervention. The patient presented with unstable angina and non-diagnostic stress test. The diagnostic angiogram revealed an unmapped 94% proximal LAD lesion with FFR of 0.68, which directly prompted immediate stent placement. The diagnostic run was not roadmapping—it was an independent diagnostic study.',
            authorityScoreDelta: +50,
            feedback: 'SOVEREIGN ADVANTAGE: Citing the specific Chapter XI Section E exception and presenting FFR hemodynamic measurements disproves the automated bundling assertion instantly.',
            statutoryCitation: 'CMS NCCI Policy Manual Chapter XI Section E (Cardiovascular System)',
          },
          {
            id: 'opt-cath-passive',
            label: 'B. Time-Based Explanation (Weak)',
            tone: 'passive',
            text: 'We spent an extra 45 minutes on the angiogram before we even touched the stent. It takes a lot of skill to do both.',
            authorityScoreDelta: -25,
            feedback: 'DENIAL UPHELD: Time spent or surgical effort does not overcome NCCI Column 2 bundling edits without satisfying structural coding criteria.',
            statutoryCitation: 'NCCI edits are not bypassable by operative duration alone.',
          },
        ],
      },
      {
        speaker: 'payer',
        speakerTitle: 'Payer Medical Reviewer',
        speakerAffiliation: 'Cigna Clinical Claims Review',
        statement: 'Doctor, I see your point regarding Chapter XI. However, did the hemodynamic documentation confirm that non-culprit vessels were evaluated, or was imaging confined strictly to the LAD intervention site?',
        statutoryContext: 'Medical reviewer probes whether the angiogram was complete or merely therapeutic guidance.',
        options: [
          {
            id: 'opt-cath-complete-sovereign',
            label: 'A. Verified Full Hemodynamic & Vessel Survey Confirmation',
            tone: 'sovereign',
            text: 'The cineangiographic record and signed catheterization report document complete selective cannulation and biplane imaging of the left main, LCx, and right coronary artery with left ventriculography (LVEDP 22 mmHg), confirming non-obstructive disease in the RCA/LCx before therapeutic catheter exchange to the LAD. This satisfies CPT 93458 in its entirety. Modifier -XU is legally justified. We request immediate reversal of CARC 97.',
            authorityScoreDelta: +50,
            feedback: 'OVERTURN ACHIEVED: Proving full diagnostic evaluation of all three coronary systems eliminates any claim that catheterization was incidental to LAD stenting.',
            statutoryCitation: 'AMA CPT Descriptor 93458 & CMS Transmittal 1421 (-XU Modifier)',
          },
        ],
      },
    ],
    successfulResolution: {
      authorizationNumber: 'AUTH-CARDIAC-2026-99312',
      reversalBasis: 'Reversal granted under CMS NCCI Chapter XI Section E exception criteria; diagnostic study established medical necessity with complete multi-vessel hemodynamic evaluation.',
      physicianRoi: '5-minute peer-to-peer discussion recovered $6,420.00 unbundled allowable.',
      statutorySafeHarborInvoked: 'CMS NCCI Chapter XI § E Interventional Exception',
    },
  },
  {
    id: 'p2p-biologic-step-therapy',
    title: 'Oncology / Specialty Biologic Step-Therapy Override Denial',
    specialty: 'Neurology / Specialty Pharmacy',
    cptOrHcpcs: 'HCPCS J0585 (Botox 100 Units for Chronic Migraine)',
    payerName: 'Elevance Health (Carelon Pharmacy Solutions)',
    payerAlgorithm: 'Carelon Formulary Engine / PBM Automated Step-Scrubber',
    denialBasis: 'Failure to exhaust mandatory 90-day step-therapy trials of generic prophylactic drugs (propranolol, topiramate, amitriptyline).',
    atRiskRevenue: '$2,850 (Drug Acquisition & Administration Cost)',
    governingStatute: 'State Step-Therapy Override Act & ERISA § 502(a)',
    initialDirectorName: 'Dr. Karen Miller, PharmD / Medical Director',
    initialDirectorBoard: 'Clinical Pharmacy / Formulary Review',
    dialogueScript: [
      {
        speaker: 'payer',
        speakerTitle: 'PBM Medical Director',
        speakerAffiliation: 'Carelon Specialty Pharmacy Review',
        statement: 'Doctor, our pharmacy benefit guidelines require step-therapy with two first-line oral preventive medications before approving onabotulinumtoxinA (J0585) for chronic migraine. Our claims history shows no pharmacy fills for topiramate or propranolol within the past 180 days. The prior authorization is denied.',
        statutoryContext: 'Automated PBM algorithms batch-deny specialty biologics based solely on pharmacy dispensing records, ignoring clinical chart contraindications.',
        options: [
          {
            id: 'opt-biologic-sovereign',
            label: 'A. Sovereign Statutory Step-Therapy Override Invocation',
            tone: 'sovereign',
            text: 'Dr. Miller, under State Step-Therapy Override Statutes and Department of Labor ERISA § 502 guidelines, step-therapy must be immediately waived when formulary alternatives are clinically contraindicated or would cause patient harm. The patient has documented moderate-to-severe asthma (FEV1 62%), which creates an absolute contraindication to propranolol. Furthermore, she has a history of nephrolithiasis and severe cognitive slowing on topiramate documented in 2024. Forcing a re-trial violates statutory safety protections. Chart records date-stamped with these adverse events were attached to the original transmission. We demand an immediate statutory step-therapy exception approval.',
            authorityScoreDelta: +50,
            feedback: 'SOVEREIGN ADVANTAGE: Citing medical contraindications under state step-therapy override laws forces the PBM to grant an immediate exception. Algorithmic formulary criteria cannot mandate contraindicated drugs.',
            statutoryCitation: 'State Step-Therapy Reform Act & 29 CFR § 2560.503-1',
          },
          {
            id: 'opt-biologic-passive',
            label: 'B. Patient Resistance Argument (Passive)',
            tone: 'passive',
            text: 'The patient really hates taking daily pills and prefers injections every three months. She told me she doesn\'t want topiramate.',
            authorityScoreDelta: -30,
            feedback: 'DENIAL UPHELD: Patient preference or reluctance to take oral pills does not meet legal step-therapy exception criteria.',
            statutoryCitation: 'Formulary exceptions require verified clinical harm or contraindications.',
          },
        ],
      },
      {
        speaker: 'payer',
        speakerTitle: 'PBM Medical Director',
        speakerAffiliation: 'Carelon Specialty Pharmacy Review',
        statement: 'Doctor, the clinical notes do substantiate the asthma diagnosis and nephrolithiasis history. What about amitriptyline or tricyclic alternatives? Was there a documented adverse effect or contraindication?',
        statutoryContext: 'PBM attempts to enforce the third-tier step therapy agent.',
        options: [
          {
            id: 'opt-biologic-tricyclic-sovereign',
            label: 'A. Electrocardiographic Contraindication Verification',
            tone: 'sovereign',
            text: 'Yes. Baseline 12-lead ECG performed on June 2nd demonstrates a prolonged corrected QT interval (QTc 492 milliseconds). Initiating tricyclic antidepressants like amitriptyline carries documented arrhythmogenic risk of Torsades de Pointes. Under clinical safety standards, this represents an absolute contraindication. The patient meets all American Headache Society criteria with 19 headache days per month. We demand immediate authorization release for CPT 64615 and HCPCS J0585.',
            authorityScoreDelta: +50,
            feedback: 'OVERTURN ACHIEVED: Presenting concrete ECG findings (QTc 492ms) renders continued denial legally and clinically indefensible.',
            statutoryCitation: 'American Academy of Neurology / AHS Guideline for Chronic Migraine',
          },
        ],
      },
    ],
    successfulResolution: {
      authorizationNumber: 'AUTH-PHARM-2026-11782-BOTOX',
      reversalBasis: 'Statutory step-therapy exception approved; documented clinical contraindications (asthma, nephrolithiasis, QTc 492ms) legally supersede formulary step requirements.',
      physicianRoi: '4-minute P2P discussion unlocked $2,850.00 quarterly biologic reimbursement.',
      statutorySafeHarborInvoked: 'State Step-Therapy Override Act & ERISA § 502',
    },
  },
];
