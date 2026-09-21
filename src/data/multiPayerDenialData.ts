export interface PayerArchetype {
  id: string;
  name: string;
  category: 'Medicare Advantage' | 'Traditional Medicare' | 'Commercial Payer' | 'National HMO/PPO';
  commonAlgorithms: string[];
  governingStatute: string;
  statutoryAppealWindowDays: number;
  auditPrevalence: string;
  description: string;
}

export interface DenialDefenseProfile {
  id: string;
  payerId: string;
  cptCode: string;
  procedureTitle: string;
  specialty: string;
  carcCode: string;
  carcDescription: string;
  rarcCode: string;
  rarcDescription: string;
  algorithmicTriggerMechanism: string;
  financialImpactPerCase: string;
  humanDefenseStrategy: string;
  statutoryLegalBasis: string;
  peerToPeerTalkingPoints: string[];
  reconsiderationExcerpts: {
    sectionHeading: string;
    text: string;
  }[];
}

export const PAYER_ARCHETYPES: PayerArchetype[] = [
  {
    id: 'medicare-advantage',
    name: 'Medicare Advantage (UHC / Humana / Aetna MA)',
    category: 'Medicare Advantage',
    commonAlgorithms: ['nH Predict (NaviHealth)', 'Optum PriorAuth AI', 'Change Healthcare ClaimCheck'],
    governingStatute: 'CMS-4201-F (42 CFR § 422.101) & CMS Two-Midnight Rule (42 CFR § 412.3)',
    statutoryAppealWindowDays: 60,
    auditPrevalence: 'Extremely High (OIG Report OEI-09-18-00260 found 13% of MA prior auth denials met Medicare coverage rules)',
    description: 'Proprietary machine learning models often terminate post-acute inpatient rehabilitation or deny surgical prior auth by asserting clinical criteria more restrictive than traditional Medicare NCDs/LCDs.',
  },
  {
    id: 'traditional-medicare',
    name: 'Traditional Medicare Part B (Novitas / Noridian / Palmetto MACs)',
    category: 'Traditional Medicare',
    commonAlgorithms: ['CMS FISS Automated Claim Scrubbing', 'RAC Post-Payment Data Mining', 'UPIC Predictive Modeling'],
    governingStatute: 'Social Security Act § 1862(a)(1)(A) (Medical Necessity) & CMS IOM Pub. 100-04 Ch. 12',
    statutoryAppealWindowDays: 120,
    auditPrevalence: 'Targeted RAC & TPE (Targeted Probe and Educate) based on aberrant billing curves and modifier outliers',
    description: 'Deterministic CMS NCCI edits, Medically Unlikely Edits (MUEs), and Local Coverage Determinations (LCDs) strictly enforced without proprietary payer discretion.',
  },
  {
    id: 'commercial-elevance-bcbs',
    name: 'Major Commercial (Elevance Health / Blue Cross Blue Shield)',
    category: 'Commercial Payer',
    commonAlgorithms: ['AIM Specialty Health / Carelon Medical Benefits Management', 'Cotiviti Scrubber AI'],
    governingStatute: 'ERISA § 502(a) (29 U.S.C. § 1132) & Department of Labor Claims Procedure 29 CFR § 2560.503-1',
    statutoryAppealWindowDays: 180,
    auditPrevalence: 'High on multi-procedure surgical days, reconstructive coding, and out-of-network facility charges',
    description: 'Third-party benefit managers (e.g., Carelon) use non-disclosed clinical guidelines to deny advanced imaging and surgical procedures, frequently categorizing procedures as investigational or unproven.',
  },
  {
    id: 'commercial-cigna-uhc',
    name: 'National Commercial HMO/PPO (Cigna Healthcare / UnitedHealthcare)',
    category: 'National HMO/PPO',
    commonAlgorithms: ['PXDX (Cigna Automated Claim Review)', 'Optum Claims Edit Engine', 'Milliman Care Guidelines (MCG) AI'],
    governingStatute: 'Affordable Care Act § 2719 (42 U.S.C. § 300gg-19) & 45 CFR § 147.136',
    statutoryAppealWindowDays: 180,
    auditPrevalence: 'Continuous automated line-item downcoding of Evaluation & Management (E/M) and unbundling of secondary surgical codes',
    description: 'Automated algorithms batch-review claims and deny or downcode complex medical management without medical director physical review of submitted chart documentation.',
  },
];

export const DENIAL_DEFENSE_PROFILES: DenialDefenseProfile[] = [
  {
    id: 'ma-spine-arthrodesis',
    payerId: 'medicare-advantage',
    cptCode: '22612',
    procedureTitle: 'Posterolateral Lumbar Arthrodesis with Interbody Fusion',
    specialty: 'Orthopedic / Neurological Spine Surgery',
    carcCode: 'CO-50',
    carcDescription: 'These are non-covered services because this is not deemed a "medical necessity" by the payer.',
    rarcCode: 'N807',
    rarcDescription: 'Payment denied because the documentation does not support the level of service billed.',
    algorithmicTriggerMechanism: 'NaviHealth / Optum automated algorithms flag lumbar fusion for patients over 65, classifying conservative therapy duration (< 6 months of documented physical therapy) as non-compliant with proprietary algorithm thresholds.',
    financialImpactPerCase: '$18,450 – $32,600 facility & professional allowable at risk',
    humanDefenseStrategy: 'Invoke CMS-4201-F: Medicare Advantage plans are legally prohibited from applying more restrictive coverage criteria than National Coverage Determinations (NCDs) or relevant Local Coverage Determinations (LCDs). Provide radiographic confirmation of grade II spondylolisthesis with dynamic instability.',
    statutoryLegalBasis: '42 CFR § 422.101(b) mandates that MA plans must comply with NCDs, LCDs, and general coverage and benefit conditions. Internal payer guidelines that exceed Medicare criteria are legally preempted.',
    peerToPeerTalkingPoints: [
      'State to the Medical Director: "Under CMS Final Rule 4201-F, effective Jan 1, 2024, Medicare Advantage plans must adhere to Medicare National and Local Coverage Determinations without substituting proprietary algorithmic criteria."',
      'Reference flexion-extension lumbar radiographs demonstrating >4mm translational instability at L4-L5.',
      'Document failed 12-week supervised physical therapy, facet radiofrequency ablation, and epidural steroid injections with progressive motor neurological deficit.',
      'Request medical director\'s name, national provider identifier (NPI), and confirmation that they hold an active board certification in orthopedic spine or neurological surgery.',
    ],
    reconsiderationExcerpts: [
      {
        sectionHeading: 'I. Statutory Preemption Under CMS-4201-F',
        text: 'Pursuant to 42 CFR § 422.101(b) and CMS Final Rule 2024 (CMS-4201-F), Medicare Advantage Organizations (MAOs) are statutorily required to provide coverage for all Medicare Part A and Part B items and services under the same clinical coverage criteria established by Traditional Medicare NCDs and LCDs. The MAO\'s reliance on internal, undisclosed algorithmic guidelines (e.g. InterQual/MCG variations) to deny CPT 22612 violates federal regulation where traditional Medicare LCD criteria for spinal instability are fully met.',
      },
      {
        sectionHeading: 'II. Radiographic & Clinical Demonstration of Instability',
        text: 'The operative records and preoperative imaging dated [Date] unequivocally establish Grade II anterolisthesis with dynamic instability exceeding 4.2mm on flexion-extension views, accompanied by neurogenic claudication refractory to 14 weeks of structured physical therapy, NSAIDs, and fluoroscopically guided epidural injections.',
      },
      {
        sectionHeading: 'III. Sovereign Human Coder Attestation',
        text: 'Certified professional coding analysis confirms CPT 22612 satisfies all CMS Chapter 12 surgical documentation criteria. Independent human review of the operative narrative substantiates decortication of transverse processes, autologous bone grafting, and pedicle screw instrumentation (+22842). Request immediate reversal of denial CO-50.',
      },
    ],
  },
  {
    id: 'trad-cardiac-stent',
    payerId: 'traditional-medicare',
    cptCode: '92928',
    procedureTitle: 'Percutaneous Transcatheter Intracoronary Stent Placement (LAD)',
    specialty: 'Interventional Cardiology',
    carcCode: 'CO-97',
    carcDescription: 'The benefit for this service is included in the payment/allowance for another service/procedure that has already been adjudicated.',
    rarcCode: 'M144',
    rarcDescription: 'Pre-/post-operative care and all associated surgical procedures are included in the global allowance.',
    algorithmicTriggerMechanism: 'Medicare MAC automated clearinghouse edits cross-reference concurrent diagnostic coronary angiography (CPT 93458) with therapeutic stenting (CPT 92928) on the same date of service, automatically unbundling or denying the diagnostic component without modifier -59/-XU.',
    financialImpactPerCase: '$4,120 – $7,850 facility Medicare reimbursement',
    humanDefenseStrategy: 'Establish clinical separation between the planned diagnostic angiogram and the subsequent ad-hoc therapeutic intervention. Diagnostic angiogram CPT 93458 qualifies for Modifier -59/-XU under CMS IOM Pub. 100-04 Ch. 12 § 40.1 only if: (1) no prior angiogram was available within 30 days, or (2) patient condition acutely worsened.',
    statutoryLegalBasis: 'CMS National Correct Coding Initiative (NCCI) Policy Manual for Medicare Services, Chapter XI, Section E (Interventional Cardiology). Diagnostic catheterization performed at the time of a percutaneous coronary intervention (PCI) is separately billable if clinical conditions meet established criteria.',
    peerToPeerTalkingPoints: [
      'Highlight that diagnostic angiography revealed critical 92% culprit lesion in proximal LAD that was previously unmapped and necessitated emergent PCI during the same session.',
      'Verify that the diagnostic angiogram was performed to establish initial coronary anatomy rather than roadmapping the therapeutic stent deployment.',
      'Show signed hemodynamics report with resting FFR/iFR showing 0.71, crossing the ischemic threshold.',
    ],
    reconsiderationExcerpts: [
      {
        sectionHeading: 'I. Compliance with CMS Chapter XI Interventional Cardiology Guidelines',
        text: 'Under CMS NCCI Policy Manual Chapter XI, Section E, diagnostic cardiac catheterization (CPT 93458) is separately payable when performed immediately prior to PCI (CPT 92928) provided: a) no prior catheterization was available, b) patient clinical presentation changed acutely, or c) the diagnostic study established the medical necessity of the intervention. Both hemodynamics and cineangiographic frames confirm these criteria.',
      },
      {
        sectionHeading: 'II. Modifier -XU Validation & Distinct Service Substantiation',
        text: 'Modifier -XU (Unusual Non-Overlapping Service) was properly appended to CPT 93458-XU-51 to reflect that coronary evaluation spanned non-culprit vessels (LCx, RCA) prior to the clinical determination to perform percutaneous revascularization of the proximal LAD.',
      },
    ],
  },
  {
    id: 'commercial-total-knee',
    payerId: 'commercial-elevance-bcbs',
    cptCode: '27447',
    procedureTitle: 'Total Knee Arthroplasty (Inpatient vs. Outpatient Status Denial)',
    specialty: 'Orthopedic Surgery',
    carcCode: 'CO-197',
    carcDescription: 'Precertification/authorization/notification/pre-treatment absent or exceeded.',
    rarcCode: 'N54',
    rarcDescription: 'Claim information indicates the service was performed in an inappropriate place of service.',
    algorithmicTriggerMechanism: 'Elevance/Carelon algorithms automatically audit TKA place of service, issuing retroactive clawback or claim denials if billed as Inpatient (POS 21) rather than Ambulatory Surgical Center (POS 24) or Hospital Outpatient (POS 22), regardless of severe patient comorbidities.',
    financialImpactPerCase: '$14,200 – $24,800 reimbursement differential / clawback risk',
    humanDefenseStrategy: 'Deploy Milliman / InterQual comorbidity exception criteria. Document severe end-stage chronic kidney disease (Stage 3b), sleep apnea on CPAP, and BMI 44 requiring telemetry monitoring that disqualified patient from outpatient discharge.',
    statutoryLegalBasis: 'ERISA § 502(a) (29 U.S.C. § 1132) and Department of Labor Regulation 29 CFR § 2560.503-1(h)(3) requiring full and fair review with consultation of an independent healthcare professional possessing appropriate clinical experience.',
    peerToPeerTalkingPoints: [
      'Emphasize that the patient\'s ASA Physical Status was Class III with multiple severe systemic disorders.',
      'Cite post-operative urinary retention and persistent hypotension requiring IV vasopressor titration, preventing safe same-day or 23-hour ambulatory discharge.',
      'Remind medical director that denying inpatient status when acute clinical instability is documented breaches ERISA fiduciary duties under 29 U.S.C. § 1104.',
    ],
    reconsiderationExcerpts: [
      {
        sectionHeading: 'I. Inpatient Admission Medical Necessity Justification',
        text: 'While CPT 27447 was removed from the CMS Inpatient-Only (IPO) list, clinical decision-making regarding admission status remains governed by physician assessment of clinical acuity. The patient presented with ASA III comorbidities: unstable hypertension, morbid obesity, and nocturnal hypoxemia necessitating continuous cardiac telemetry.',
      },
      {
        sectionHeading: 'II. ERISA Fiduciary Duty Violation Notice',
        text: 'Plan Administrator is notified that retroactively reclassifying this medically indicated inpatient admission to outpatient observation constitutes an arbitrary and capricious determination under ERISA § 502(a)(1)(B). We demand production of the clinical guidelines and identity of the medical reviewer pursuant to 29 CFR § 2560.503-1.',
      },
    ],
  },
  {
    id: 'commercial-neuro-mri',
    payerId: 'commercial-cigna-uhc',
    cptCode: '70553',
    procedureTitle: 'Magnetic Resonance Imaging, Brain with and without Contrast',
    specialty: 'Diagnostic Radiology / Neurology',
    carcCode: 'CO-151',
    carcDescription: 'Payment adjusted because the payer deems the information submitted does not support this level of service.',
    rarcCode: 'M25',
    rarcDescription: 'The information submitted does not support the frequency of this service.',
    algorithmicTriggerMechanism: 'Cigna PXDX algorithm batch-denies multi-sequence MRI brain with contrast for patients presenting with headaches, demanding initial unenhanced MRI (70551) first, failing to detect clinical "red flags" (papilledema, unilateral sensorimotor loss).',
    financialImpactPerCase: '$1,250 – $2,800 facility and professional payment loss',
    humanDefenseStrategy: 'Highlight clinical signs of raised intracranial pressure and focal neurological deficits that trigger American College of Radiology (ACR) Appropriateness Criteria: Headache with Neurologic Deficit (Rating 9 - Usually Appropriate for MRI with and without contrast).',
    statutoryLegalBasis: 'Affordable Care Act § 2719 & 45 CFR § 147.136(b)(2)(ii) establishing that internal appeals must take into account all comments, documents, records, and other information submitted without deference to the initial adverse determination.',
    peerToPeerTalkingPoints: [
      'Cite documented right papilledema on funduscopic exam and sixth nerve palsy, which mandate post-contrast sequences to evaluate for venous sinus thrombosis or intracranial neoplasm.',
      'Reference ACR Appropriateness Criteria: Headache with "Red Flag" clinical indicators.',
      'Point out that performing non-contrast MRI alone would delay diagnosis and breach standard of care.',
    ],
    reconsiderationExcerpts: [
      {
        sectionHeading: 'I. American College of Radiology Appropriateness Criteria',
        text: 'The automated denial of CPT 70553 fails to recognize ACR Appropriateness Criteria for "Headache - New Neurologic Deficit" (Variant 2), which rates MRI brain with and without IV contrast with the highest appropriateness score (9/9). Unenhanced MRI is clinically insufficient to assess dural venous sinus flow voids and leptomeningeal enhancement.',
      },
      {
        sectionHeading: 'II. Failure of Automated Review Under ACA § 2719',
        text: 'The denial notice indicates processing via automated claim adjudication without human clinical review. Pursuant to ACA § 2719 and 45 CFR § 147.136, the claimant is entitled to a full clinical review conducted by an independent radiologist or neurologist who was not involved in the initial automated algorithmic screening.',
      },
    ],
  },
  {
    id: 'ma-mohs-reconstruction',
    payerId: 'medicare-advantage',
    cptCode: '14020',
    procedureTitle: 'Adjacent Tissue Transfer (Bilobed Flap), Forehead (Defect 6.2 sq cm)',
    specialty: 'Dermatology / Plastic Surgery',
    carcCode: 'CO-97',
    carcDescription: 'The benefit for this service is included in the payment/allowance for another service/procedure that has already been adjudicated.',
    rarcCode: 'N657',
    rarcDescription: 'This should be billed with the primary procedure.',
    algorithmicTriggerMechanism: 'Commercial and MA claim scrubbers automatically bundle CPT 14020 into Mohs surgery stage 1 (CPT 17311), asserting that defect closure is included in the surgical excision global fee.',
    financialImpactPerCase: '$980 – $1,850 professional allowable denial',
    humanDefenseStrategy: 'Directly refute bundled closure under CPT coding guidelines: Mohs micrographic surgery codes (17311-17315) encompass excision and microscopic examination ONLY. Intermediate, complex, or adjacent tissue transfer repairs are explicitly defined as separately reportable with modifier -59 or -XU.',
    statutoryLegalBasis: 'AMA CPT Assistant (August 2013, November 2018) and CMS NCCI Policy Manual Chapter III, Section G: "Surgical repair of surgical defects resulting from Mohs micrographic surgery may be reported separately."',
    peerToPeerTalkingPoints: [
      'Quote AMA CPT guidelines directly: "The repair of a surgical defect resulting from Mohs micrographic surgery may be reported separately with the appropriate repair or reconstructive surgery code."',
      'Provide operative narrative documenting secondary donor defect creation, undermining in the subgaleal plane, and precise measurements of both primary and secondary defects (6.2 sq cm total).',
      'Cite CMS-4201-F: Medicare Advantage cannot disallow separate surgical repair when Traditional Medicare Part B explicitly reimburses both under LCD L34938.',
    ],
    reconsiderationExcerpts: [
      {
        sectionHeading: 'I. CPT Definition & NCCI Manual Conformance',
        text: 'Pursuant to AMA CPT Guidelines (Surgery: Integumentary System) and CMS NCCI Policy Manual Chapter III, Mohs micrographic surgery does not include reconstructive repair of the surgical wound. CPT 14020 represents adjacent tissue transfer requiring significant surgical mobilization of adjacent tissue planes and is distinct from simple closure.',
      },
      {
        sectionHeading: 'II. Operative Diagram & Area Calculation Substantiation',
        text: 'The operative report contains photographic calibration and surgical measurements: primary circular defect of 2.1 cm diameter (3.46 sq cm) plus secondary rotational flap defect totaling 6.2 sq cm combined area, squarely within the 0.1 to 10.0 sq cm parameters for CPT 14020.',
      },
    ],
  },
  {
    id: 'commercial-biologic-infusion',
    payerId: 'commercial-cigna-uhc',
    cptCode: 'J0585',
    procedureTitle: 'OnabotulinumtoxinA (Botox) Injection, 100 Units (Refractory Migraine)',
    specialty: 'Neurology / Physical Medicine & Rehabilitation',
    carcCode: 'CO-57',
    carcDescription: 'Payment denied/reduced because the payer deems the service was not medically necessary without prior trial of preferred step-therapy formulary agents.',
    rarcCode: 'N115',
    rarcDescription: 'This decision was based on a local coverage determination (LCD).',
    algorithmicTriggerMechanism: 'Payer automated pharmacy benefits management (PBM) algorithm flags J0585 for failure to exhaust mandatory 3-tier step therapy (demanding 60-day trials of beta blockers, topiramate, and amitriptyline).',
    financialImpactPerCase: '$1,150 – $2,400 drug & administration denial',
    humanDefenseStrategy: 'Document explicit contraindications to step-therapy agents: severe asthma (contraindicating beta-blockers), history of nephrolithiasis and cognitive impairment on topiramate, and cardiac arrhythmia (contraindicating tricyclic antidepressants).',
    statutoryLegalBasis: 'State Step-Therapy Override Protocols (e.g., Texas Insurance Code § 1369.0546 / NY Public Health Law § 4902) requiring statutory step-therapy exception approval within 72 hours when preferred drugs are medically contraindicated.',
    peerToPeerTalkingPoints: [
      'Document that patient meets International Headache Society (IHS) criteria for chronic migraine (>15 headache days/month for >3 months).',
      'Detail physician-verified contraindications to each preferred formulary tier with clinical lab and history dates.',
      'Cite state step-therapy override statutes compelling immediate exemption approval.',
    ],
    reconsiderationExcerpts: [
      {
        sectionHeading: 'I. Clinical Inapplicability of Step-Therapy Protocol',
        text: 'The patient suffers from intractable chronic migraine (ICD-10 G43.719) with 18 disabling headache days per month. The payer\'s step-therapy requirement is clinically contraindicated: 1) Propranolol is contraindicated due to severe reactive airway disease (FEV1 < 65%); 2) Topiramate caused symptomatic nephrolithiasis; 3) Amitriptyline is contraindicated by baseline prolonged QTc interval (488ms).',
      },
      {
        sectionHeading: 'II. Compliance with Statutory Step-Therapy Override Protections',
        text: 'Under applicable state insurance law and federal mental health and parity regulations, step therapy must be waived when an insured patient has experienced adverse reactions or has documented medical contraindications to formulary alternatives. Demand immediate authorization and payment release for CPT 64615 and HCPCS J0585.',
      },
    ],
  },
];
