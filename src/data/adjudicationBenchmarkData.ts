export interface AdjudicationBenchmarkCase {
  id: string;
  title: string;
  specialty: string;
  clinicalNarrative: string;
  aiOutcome: {
    billedCodes: string[];
    modifiersApplied: string[];
    day0Status: string;
    day0CleanClaimRate: string;
    day180AuditResult: string;
    clawbackAmount: string;
    fcaRiskExposure: string;
    failureMechanisms: string[];
    regulatoryViolations: string[];
  };
  sovereignOutcome: {
    billedCodes: string[];
    modifiersApplied: string[];
    day0Status: string;
    day0CleanClaimRate: string;
    day180AuditResult: string;
    clawbackAmount: string;
    fcaRiskExposure: string;
    clinicalProtections: string[];
    regulatoryDefensePackets: string[];
  };
  rvuDifferential: {
    aiTotalRvu: number;
    sovereignTotalRvu: number;
    medicareConversionFactor2026: number; // $32.35
    netReimbursementRetained: string;
    clawbackAvoided: string;
  };
  racAuditSimulation: {
    auditTriggerEvent: string;
    contractorType: 'RAC (Recovery Audit Contractor)' | 'UPIC' | 'Commercial SIU' | 'DOJ / OIG Subpoena';
    targetAlgorithmFlaw: string;
    statutoryRemedy: string;
  };
}

export const BENCHMARK_CASES: AdjudicationBenchmarkCase[] = [
  {
    id: 'case-multilevel-spine',
    title: '3-Level Lumbar Posterolateral Arthrodesis with Posterior Instrumentation & Interbody Fusion',
    specialty: 'Orthopedic Spine / Neurosurgery',
    clinicalNarrative: '62-year-old male with severe L3-S1 degenerative spondylolisthesis and spinal stenosis underwent L3-L4, L4-L5, and L5-S1 posterolateral arthrodesis with autologous bone graft, posterior pedicle screw instrumentation spanning 4 segments, and L4-L5 interbody fusion with structural cage.',
    aiOutcome: {
      billedCodes: ['22612', '22614', '22614', '22842', '22853'],
      modifiersApplied: ['-59', '-59'],
      day0Status: 'Accepted by Clearinghouse (EDI 837P Clean Rate 99.1%)',
      day0CleanClaimRate: '99.1% First-Pass Electronic Submission',
      day180AuditResult: 'POST-PAYMENT RECOVERY AUDIT: 100% Recoupment of 22614 Add-on Codes',
      clawbackAmount: '$14,820.00 clawback + 9.5% interest',
      fcaRiskExposure: 'High Risk under 31 U.S.C. § 3729 (Modifier -59 misrepresentation)',
      failureMechanisms: [
        'AI algorithm appended Modifier -59 to add-on code 22614; CMS NCCI rules explicitly prohibit modifier -59 on add-on codes (+)',
        'Failed to report primary interbody code 22558 required as parent for structural cage +22853',
        'Did not capture separate bone graft harvest code (+20936 autograft local)',
      ],
      regulatoryViolations: [
        'CMS IOM Pub. 100-04 Ch. 12 § 30 (Spinal Arthrodesis Add-On Billing Rules)',
        'NCCI Policy Manual Ch. IV § D (Musculoskeletal Add-On Edit Matrix)',
      ],
    },
    sovereignOutcome: {
      billedCodes: ['22612', '+22614', '+22614', '22558-51', '+22853', '+22842', '+20936'],
      modifiersApplied: ['-51 on secondary base code 22558', 'No illegal modifier -59 on add-on codes'],
      day0Status: 'Accepted with Full Medical Necessity Crosswalk',
      day0CleanClaimRate: '100% Clean Electronic Dispatch',
      day180AuditResult: 'RAC AUDIT CLOSED: 100% Upheld, Zero Clawback, Zero Penalties',
      clawbackAmount: '$0.00 Clawback (Retained $31,480 total allowable)',
      fcaRiskExposure: 'Zero FCA Risk (Complete SHA-256 Merkle Audit Log)',
      clinicalProtections: [
        'Certified coder verified operative operative interspace levels from fluoroscopic time-stamped images',
        'Properly paired structural interbody device +22853 with base code 22558',
        'Separately captured autologous local bone graft (+20936) substantiating transverse process decortication',
      ],
      regulatoryDefensePackets: [
        'Pre-compiled RAC defense packet linking fluoroscopy frames to vertebral interspaces',
        'CMS NCCI Chapter IV compliant add-on billing hierarchy',
      ],
    },
    rvuDifferential: {
      aiTotalRvu: 48.2,
      sovereignTotalRvu: 72.4,
      medicareConversionFactor2026: 32.35,
      netReimbursementRetained: '+$7,831.64 Legitimate Additional Allowable',
      clawbackAvoided: '$14,820.00 Clawback Prevented',
    },
    racAuditSimulation: {
      auditTriggerEvent: 'Automated Medicare RAC data mining query flags modifier -59 on CPT add-on code 22614 with 22842.',
      contractorType: 'RAC (Recovery Audit Contractor)',
      targetAlgorithmFlaw: 'Autonomous AI hallucinated modifier -59 to force electronic claim acceptance past clearinghouse edits without human understanding of add-on code relationships.',
      statutoryRemedy: 'Aethera sovereign coder structured claim correctly with parent interbody codes and authentic add-ons without modifier -59, eliminating RAC audit vulnerability completely.',
    },
  },
  {
    id: 'case-mohs-flap',
    title: 'Mohs Micrographic Surgery (Stage 1, 5 Tissue Blocks) with Complex Adjacent Tissue Transfer',
    specialty: 'Dermatology / Oculoplastic Surgery',
    clinicalNarrative: '71-year-old female with recurrent infiltrating basal cell carcinoma of the left nasal ala and cheek underwent Mohs micrographic surgery Stage 1 (5 tissue blocks, clear margins achieved) followed by 5.8 sq cm bilobed transposition flap reconstruction requiring extensive subSMAS undermining.',
    aiOutcome: {
      billedCodes: ['17311', '14020'],
      modifiersApplied: ['No modifier appended on 14020'],
      day0Status: 'Processed with Immediate Line-Item Bundling Denial',
      day0CleanClaimRate: '82% (Line 2 Denied Under CARC 97)',
      day180AuditResult: 'Permanent Loss of Reconstructive Payment ($1,620 uncollected)',
      clawbackAmount: '$1,620.00 initial loss (Payer treated flap as included in Mohs)',
      fcaRiskExposure: 'Moderate Compliance Audit Risk (Downcoding / uncollected revenue)',
      failureMechanisms: [
        'AI failed to append Modifier -59 or -XU to adjacent tissue transfer CPT 14020',
        'Clearinghouse scrubber treated CPT 14020 as incidental wound closure included in Mohs excision global fee',
        'Autonomous tool took zero appeal action on remittance CARC 97 denial',
      ],
      regulatoryViolations: [
        'AMA CPT Assistant (Nov 2018): Adjacent tissue transfer explicitly payable with Mohs surgery',
        'Failure to assert CMS NCCI Chapter III Section G distinct reconstructive service exemption',
      ],
    },
    sovereignOutcome: {
      billedCodes: ['17311-LT', '14020-XU-LT'],
      modifiersApplied: ['-LT (Left Nasal Ala/Cheek)', '-XU (Unusual Non-Overlapping Reconstructive Service)'],
      day0Status: 'Adjudicated and Fully Paid on First Submission',
      day0CleanClaimRate: '100% First-Pass Clean Adjudication',
      day180AuditResult: 'AUDIT IMMUNE: Full Reimbursement Retained ($2,740.00)',
      clawbackAmount: '$0.00 Clawback (Zero Uncollected Revenue)',
      fcaRiskExposure: 'Zero FCA Risk (Pre-Adjudicated Operative Diagram On File)',
      clinicalProtections: [
        'Certified coder verified secondary donor defect measurements and primary defect diameter totaling 5.8 sq cm',
        'Appended Modifier -XU rather than generic -59, providing precise regulatory justification under CMS Transmittal 1421',
        'Embedded photographic margins confirmation report in claim narrative segment',
      ],
      regulatoryDefensePackets: [
        'AMA CPT Assistant Chapter III Exception Reference Card attached to clearinghouse attachment segment',
        'Exact square centimeter tissue transfer formula calculation verified by human eye',
      ],
    },
    rvuDifferential: {
      aiTotalRvu: 19.8,
      sovereignTotalRvu: 34.6,
      medicareConversionFactor2026: 32.35,
      netReimbursementRetained: '+$1,620.00 Revenue Captured',
      clawbackAvoided: '$1,620.00 First-Pass Reversal Avoided',
    },
    racAuditSimulation: {
      auditTriggerEvent: 'Commercial Payer Claims Editing automated system bundles adjacent tissue transfer into Mohs resection.',
      contractorType: 'Commercial SIU',
      targetAlgorithmFlaw: 'Autonomous AI was oblivious to the requirement for Modifier -XU and photographic defect verification, abandoning $1,620 in revenue without human intervention.',
      statutoryRemedy: 'Aethera sovereign coder appended -XU-LT and substantiated secondary tissue movement under AMA CPT guidelines, ensuring 100% payment release.',
    },
  },
  {
    id: 'case-cabg-grafts',
    title: 'Coronary Artery Bypass Graft (CABG): LIMA to LAD + 2 Saphenous Vein Grafts with Endoscopic Harvesting',
    specialty: 'Cardiothoracic Surgery',
    clinicalNarrative: '67-year-old male with triple-vessel coronary artery disease underwent emergency coronary artery bypass grafting utilizing Left Internal Mammary Artery (LIMA) to Left Anterior Descending (LAD), plus two saphenous vein grafts to Diagonal and Obtuse Marginal branches, with endoscopic vein harvest.',
    aiOutcome: {
      billedCodes: ['33533', '33511', '33508'],
      modifiersApplied: ['-51 on 33511'],
      day0Status: 'Accepted with Pending Post-Payment Claims Scrutiny',
      day0CleanClaimRate: '96.4%',
      day180AuditResult: 'POST-PAYMENT RECOVERY: Complete recoupment of 33511 due to incorrect code family',
      clawbackAmount: '$2,840.00 Clawback + Penalty',
      fcaRiskExposure: 'Severe Coding Error (Venous-only code billed in combined arterial-venous bypass)',
      failureMechanisms: [
        'AI mistakenly coded CPT 33511 (Coronary artery bypass, vein only; 2 coronary arterial grafts); should have billed combined add-on code +33518',
        'CPT 33511 is for VEIN-ONLY CABG and is mutually exclusive with arterial CABG 33533 under NCCI edits',
        'Triggered automated UPIC audit for contradictory surgical methodology',
      ],
      regulatoryViolations: [
        'CMS NCCI Chapter XI Section B (Cardiovascular System Coding Hierarchy)',
        'AMA CPT Guidelines for Combined Arterial-Venous Coronary Artery Bypass',
      ],
    },
    sovereignOutcome: {
      billedCodes: ['33533', '+33518', '+33508'],
      modifiersApplied: ['No modifier on add-on +33518 (Exempt from -51)', 'Add-on +33508 for Endoscopic Vein Harvest'],
      day0Status: '100% Compliant Adjudication',
      day0CleanClaimRate: '100% First-Pass Clean Adjudication',
      day180AuditResult: 'RAC / UPIC AUDIT PROOF: Zero Errors Found',
      clawbackAmount: '$0.00 Clawback (Retained $6,450 professional fee)',
      fcaRiskExposure: 'Zero FCA Risk',
      clinicalProtections: [
        'Certified thoracic coder recognized combined arterial-venous CABG hierarchy',
        'Appropriately paired arterial base code 33533 with venous add-on +33518 (2 venous grafts)',
        'Verified endoscopic harvest narrative supporting add-on code +33508',
      ],
      regulatoryDefensePackets: [
        'Surgical perfusion record and bypass timing cross-referenced to operative note',
        'Zero modifier -51 applied to add-on codes, preserving full RVU credit',
      ],
    },
    rvuDifferential: {
      aiTotalRvu: 44.1,
      sovereignTotalRvu: 61.8,
      medicareConversionFactor2026: 32.35,
      netReimbursementRetained: '+$2,840.00 Penalty Avoidance',
      clawbackAvoided: '$2,840.00 Clawback Prevented',
    },
    racAuditSimulation: {
      auditTriggerEvent: 'Medicare UPIC algorithm identifies impossible combination: arterial base code 33533 + venous-only base code 33511 on same claim.',
      contractorType: 'UPIC',
      targetAlgorithmFlaw: 'Autonomous AI lacked semantic domain knowledge of cardiac coding rules, selecting standalone venous code instead of combination add-on code +33518.',
      statutoryRemedy: 'Aethera sovereign coder correctly assigned +33518 add-on hierarchy, preventing an immediate fraud referral and recovering 100% of thoracic surgeon compensation.',
    },
  },
  {
    id: 'case-trauma-laparotomy',
    title: 'Damage Control Trauma Laparotomy with Splenectomy & Complex Hepatorrhaphy',
    specialty: 'Trauma / Acute Care Surgery',
    clinicalNarrative: '34-year-old motor vehicle collision patient with hemoperitoneum and Grade IV splenic rupture with Grade III liver laceration underwent emergency exploratory laparotomy, total splenectomy, and complex liver suturing with abdominal temporary vacuum pack closure.',
    aiOutcome: {
      billedCodes: ['49000', '38100', '47350'],
      modifiersApplied: ['-59 on 49000', '-59 on 38100'],
      day0Status: 'Accepted with Downcoding Inquiry',
      day0CleanClaimRate: '91.2%',
      day180AuditResult: 'AUDIT CLAWBACK: $4,980 recouped; 49000 bundled into splenectomy',
      clawbackAmount: '$4,980.00 Recoupment (Exploratory laparotomy unbundling violation)',
      fcaRiskExposure: 'Critical Risk: Illegal Unbundling of Exploratory Laparotomy under False Claims Act',
      failureMechanisms: [
        'AI billed exploratory laparotomy 49000 with modifier -59; laparotomy is universally bundled into open abdominal procedures in the same incision',
        'Slapping modifier -59 on 49000 is a textbook False Claims Act red flag prosecuted by the OIG',
        'Failed to capture temporary abdominal wound closure (+49010 or 13101) or high-acuity critical care time',
      ],
      regulatoryViolations: [
        'CMS NCCI Chapter VI Section A (Digestive System General Policies)',
        '31 U.S.C. § 3729(a)(1)(A) (Knowingly presenting a false or fraudulent claim)',
      ],
    },
    sovereignOutcome: {
      billedCodes: ['38100', '47350-51', '99291-25'],
      modifiersApplied: ['-51 on secondary definitive surgical procedure 47350', '-25 on critical care evaluation & management'],
      day0Status: '100% Legitimate Clean Adjudication',
      day0CleanClaimRate: '100% First-Pass Clean Adjudication',
      day180AuditResult: 'RAC / OIG DEFENSE SEAL: Complete Audit Clearance',
      clawbackAmount: '$0.00 Clawback (Retained $5,820 professional fee)',
      fcaRiskExposure: 'Zero FCA Risk (Zero Unbundled Codes)',
      clinicalProtections: [
        'Certified trauma coder removed exploratory laparotomy 49000, eliminating severe unbundling fraud exposure',
        'Accurately sequenced splenectomy (higher RVU) as primary procedure over liver repair',
        'Separately captured 74 minutes of preoperative trauma resuscitation critical care (CPT 99291-25)',
      ],
      regulatoryDefensePackets: [
        'Trauma flow sheet time logs cross-referenced to support bedside critical care',
        'Operative narrative and anesthesia records verified for distinct procedure times',
      ],
    },
    rvuDifferential: {
      aiTotalRvu: 38.6,
      sovereignTotalRvu: 56.4,
      medicareConversionFactor2026: 32.35,
      netReimbursementRetained: '+$3,214.00 Captured + $4,980 Clawback Eliminated',
      clawbackAvoided: '$4,980.00 Illegal Unbundling Recoupment Prevented',
    },
    racAuditSimulation: {
      auditTriggerEvent: 'OIG Data Analytics identifies pattern of CPT 49000-59 billed alongside major visceral resections across hospital system.',
      contractorType: 'DOJ / OIG Subpoena',
      targetAlgorithmFlaw: 'Autonomous AI blindly appended modifier -59 to circumvent NCCI clearinghouse edits without legal knowledge of exploratory incision bundling.',
      statutoryRemedy: 'Aethera sovereign human coder eliminated 49000, added compliant trauma critical care 99291-25, protecting the hospital from millions in treble False Claims Act penalties.',
    },
  },
];
