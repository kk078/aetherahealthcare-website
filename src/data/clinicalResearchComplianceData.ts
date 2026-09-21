// CMS NCD 310.1 & Clinical Research IDE/IND Compliance Auditor Data Models
// Statutory Authorities: CMS NCD 310.1 (Routine Costs in Clinical Trials),
// 42 CFR § 405 Subpart B (Category A & B IDE Regulations),
// 21 CFR Part 312 (Investigational New Drug Application),
// False Claims Act (31 U.S.C. § 3729), Medicare Claims Processing Manual Ch. 32 § 68-69.

export type TrialCategory = 'category-a' | 'category-b' | 'ind-oncology';
export type LedgerDestination = 'MEDICARE_PART_A_B' | 'SPONSOR_CTA_GRANT' | 'NON_COVERED_SPONSOR_FREE';
export type ServiceClassification = 'ROUTINE_CARE' | 'INVESTIGATIONAL_PROCEDURE' | 'INVESTIGATIONAL_DEVICE_DRUG' | 'RESEARCH_ONLY_DATA';

export interface BillingLineItem {
  id: string;
  code: string; // CPT, HCPCS, or Revenue code
  description: string;
  grossCharge: number;
  classification: ServiceClassification;
  appropriateModifier: string; // e.g., "-Q1", "-Q0", "-QA", "None"
  destination: LedgerDestination;
  statutoryBasis: string;
  fcaDoubleDipRisk: boolean;
  complianceRule: string;
}

export interface ClinicalResearchTrial {
  id: string;
  title: string;
  shortName: string;
  category: TrialCategory;
  categoryLabel: string;
  nctNumber: string; // ClinicalTrials.gov NCT identifier
  protocolNumber: string; // FDA IDE or IND reference
  sponsorName: string;
  macJurisdiction: string;
  macContractor: string;
  clinicalIndication: string;
  coverageWithEvidenceDevelopment: boolean;
  macPriorApprovalObtained: boolean;
  irbApprovalDate: string;
  lineItems: BillingLineItem[];
  coverageAttestationText: string;
}

export interface IdeCategoryDefinition {
  name: string;
  regulation: string;
  deviceStatus: string;
  routineStatus: string;
  medicareDeviceCovered: boolean;
  medicareRoutineCovered: boolean;
  modifierDevice: string;
  modifierRoutine: string;
  modifierProcedure: string;
  sponsorSuppliedAgentBilledToMedicare: boolean;
  statutoryDescription: string;
}

export interface NcdCriterion {
  id: string;
  title: string;
  description: string;
  isMandatory: boolean;
  statuteRef: string;
}

export interface LedgerBreakdown {
  medicareTotal: number;
  medicareItemsCount: number;
  sponsorTotal: number;
  sponsorItemsCount: number;
  nonCoveredDeviceTotal: number;
  nonCoveredItemsCount: number;
  grossTotal: number;
}

export interface FcaRiskEvaluation {
  scenarioId: string;
  title: string;
  severity: 'CRITICAL_FCA_VIOLATION' | 'PROHIBITED_DEVICE_BILLING' | 'CLEARINGHOUSE_REJECTION' | 'COMPLIANT_SPLIT';
  statutoryViolation: string;
  potentialPenalty: string;
  correctiveAction: string;
}

export const IDE_CATEGORY_DEFINITIONS: Record<TrialCategory, IdeCategoryDefinition> = {
  'category-a': {
    name: 'FDA IDE Category A (Experimental / Innovative)',
    regulation: '42 CFR § 405.201(b) & Medicare Benefit Policy Manual Ch. 14 § 10',
    deviceStatus: 'Non-Covered by Medicare ($0 Payment)',
    routineStatus: 'Covered under CMS NCD 310.1 / CED',
    medicareDeviceCovered: false,
    medicareRoutineCovered: true,
    modifierDevice: 'Non-Billable to Medicare (Billed to Sponsor or Rev 0624 $0 Token)',
    modifierRoutine: '-Q1 (Routine Clinical Care in Approved Clinical Research Study)',
    modifierProcedure: '-Q0 (Investigational Clinical Service / Implantation)',
    sponsorSuppliedAgentBilledToMedicare: false,
    statutoryDescription:
      'Devices for which the initial questions of safety and effectiveness have not been resolved and CMS/FDA considers the device experimental or innovative. CMS never reimburses for the Category A device itself. However, routine clinical care and complication management are covered under NCD 310.1 if CED requirements are satisfied.',
  },
  'category-b': {
    name: 'FDA IDE Category B (Investigational / Non-Experimental)',
    regulation: '42 CFR § 405.201(b) & 42 CFR § 405.203',
    deviceStatus: 'Covered by Medicare at Allowed Amount (Requires Local MAC Pre-Approval)',
    routineStatus: 'Covered under CMS NCD 310.1',
    medicareDeviceCovered: true,
    medicareRoutineCovered: true,
    modifierDevice: '-QA (FDA Investigational Device Exemption) or -Q0',
    modifierRoutine: '-Q1 (Routine Clinical Care in Approved Clinical Research Study)',
    modifierProcedure: '-Q0 (Investigational Clinical Service)',
    sponsorSuppliedAgentBilledToMedicare: false,
    statutoryDescription:
      'Devices in Class II or Class III where the incremental risk is low and initial questions of safety have been resolved. CMS may cover both the Category B device (up to comparable conventional device allowed amounts) and all routine care if pre-approved by the local Medicare Administrative Contractor (MAC).',
  },
  'ind-oncology': {
    name: 'FDA IND (Investigational New Drug) Clinical Trial',
    regulation: '21 CFR Part 312 & CMS NCD 310.1 § 2',
    deviceStatus: 'Sponsor-Supplied Investigational Agent ($0 Medicare Payment)',
    routineStatus: 'Covered under CMS NCD 310.1',
    medicareDeviceCovered: false,
    medicareRoutineCovered: true,
    modifierDevice: 'N/A (Sponsor Provided; Billing Medicare is False Claims Act Violation)',
    modifierRoutine: '-Q1 (Routine Clinical Care in Approved Clinical Research Study)',
    modifierProcedure: '-Q0 (Chemotherapy / Biotherapy IV Infusion Administration CPT 96413)',
    sponsorSuppliedAgentBilledToMedicare: false,
    statutoryDescription:
      'Investigational therapeutic pharmaceuticals provided without charge by trial sponsors. Billing Medicare for sponsor-supplied drug products is an automatic violation of the False Claims Act. Routine supportive care, administration services, toxicity management, and standard staging scans remain fully covered under NCD 310.1 with Modifier -Q1.',
  },
};

export const NCD_310_1_CRITERIA: NcdCriterion[] = [
  {
    id: 'crit-1',
    title: 'Medicare Benefit Category Qualification',
    description:
      'The subject or purpose of the trial must evaluate an item or service that falls within a Medicare benefit category (e.g., physicians services, inpatient hospital, durable medical equipment).',
    isMandatory: true,
    statuteRef: 'CMS NCD 310.1 § 1.A',
  },
  {
    id: 'crit-2',
    title: 'Therapeutic Intent Requirement',
    description:
      'The trial must have therapeutic intent and not be designed exclusively to test toxicity or healthy volunteer pharmacodynamics.',
    isMandatory: true,
    statuteRef: 'CMS NCD 310.1 § 1.B',
  },
  {
    id: 'crit-3',
    title: 'Enrolls Patients with Diagnosed Medical Condition',
    description:
      'Trials of therapeutic intent must enroll patients with diagnosed conditions rather than healthy cohorts (with limited exceptions for preventive cancer screening trials).',
    isMandatory: true,
    statuteRef: 'CMS NCD 310.1 § 1.C',
  },
  {
    id: 'crit-4',
    title: 'Valid Scientific Question & Clinical Relevance',
    description:
      'The principal purpose of the trial must be to test whether the intervention improves net health outcomes in the Medicare-eligible population.',
    isMandatory: false,
    statuteRef: 'AHRQ / CMS Desirable Standard 1',
  },
  {
    id: 'crit-5',
    title: 'Scientific Integrity & Rigorous Methodology',
    description:
      'Conforms to accepted standards of statistical hypothesis testing, randomization, and blinding where clinically ethical.',
    isMandatory: false,
    statuteRef: 'AHRQ / CMS Desirable Standard 2',
  },
  {
    id: 'crit-6',
    title: 'Human Subjects Protection (IRB Oversight)',
    description:
      'Conducted with full Institutional Review Board (IRB) approval, continuing oversight, and federal informed consent compliance per 45 CFR Part 46 / 21 CFR Part 56.',
    isMandatory: false,
    statuteRef: 'AHRQ / CMS Desirable Standard 3',
  },
  {
    id: 'crit-7',
    title: 'ClinicalTrials.gov Registration (NCT#)',
    description:
      'Must be registered on the National Library of Medicine ClinicalTrials.gov registry prior to first patient enrollment, generating a mandatory 8-digit NCT number.',
    isMandatory: false,
    statuteRef: '42 U.S.C. § 282(j) & CMS Value Code D4',
  },
  {
    id: 'crit-8',
    title: 'Explicit Written Research Protocol',
    description:
      'Protocol clearly itemizes routine care versus protocol-induced data collection procedures to enable non-ambiguous split billing.',
    isMandatory: false,
    statuteRef: 'AHRQ / CMS Desirable Standard 5',
  },
  {
    id: 'crit-9',
    title: 'Principal Investigator Qualification & GCP Credentialing',
    description:
      'All investigators and key clinical personnel have documented Good Clinical Practice (GCP) certification and active medical staff privileges.',
    isMandatory: false,
    statuteRef: 'AHRQ / CMS Desirable Standard 6',
  },
  {
    id: 'crit-10',
    title: 'Financial Conflict of Interest Disclosure',
    description:
      'All commercial funding, investigator consulting fees, and corporate sponsor relationships are documented and managed per 42 CFR Part 50 Subpart F.',
    isMandatory: false,
    statuteRef: 'AHRQ / CMS Desirable Standard 7',
  },
];

export const CLINICAL_RESEARCH_TRIALS: ClinicalResearchTrial[] = [
  {
    id: 'tmvr-novel-leaflet',
    title: 'Transcatheter Mitral Valve Replacement (TMVR) - Novel Biomimetic Leaflet System',
    shortName: 'TMVR Novel Leaflet Trial',
    category: 'category-a',
    categoryLabel: 'FDA IDE Category A (Experimental)',
    nctNumber: 'NCT04829184',
    protocolNumber: 'IDE #G210088',
    sponsorName: 'Cardiovascular Innovations Research Consortium',
    macJurisdiction: 'Novitas Solutions (Jurisdiction H & L - TX, PA, NJ, MD)',
    macContractor: 'Novitas Solutions, Inc.',
    clinicalIndication: 'Severe symptomatic mitral regurgitation in high/prohibitive surgical risk patients',
    coverageWithEvidenceDevelopment: true,
    macPriorApprovalObtained: true,
    irbApprovalDate: '2024-01-15',
    lineItems: [
      {
        id: 'tmvr-device',
        code: 'Rev 0624 / C1882',
        description: 'TMVR Novel Biomimetic Delivery System & Prosthetic Valve (Category A Experimental Device)',
        grossCharge: 38500,
        classification: 'INVESTIGATIONAL_DEVICE_DRUG',
        appropriateModifier: 'None (Billed to Sponsor / Zero-Charge Token)',
        destination: 'NON_COVERED_SPONSOR_FREE',
        statutoryBasis: '42 CFR § 405.201(b) - Category A Device Non-Covered by Medicare',
        fcaDoubleDipRisk: true,
        complianceRule:
          'CRITICAL RULE: Category A experimental device cannot be paid by Medicare. Must be supplied free of charge by trial sponsor or absorbed by facility. Billing to Medicare constitutes statutory overpayment and False Claims Act liability.',
      },
      {
        id: 'tmvr-procedure',
        code: 'CPT 0483T / 33418',
        description: 'Transcatheter Mitral Valve Implantation Percutaneous Femoral Vein / Transseptal Access',
        grossCharge: 4850,
        classification: 'INVESTIGATIONAL_PROCEDURE',
        appropriateModifier: '-Q0 (Investigational Clinical Service)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 & CED - Investigational Implantation Surgical Service',
        fcaDoubleDipRisk: false,
        complianceRule:
          'Covered by Medicare Part B when billed with Modifier -Q0, Condition Code 30, and Value Code D4 (NCT04829184).',
      },
      {
        id: 'tmvr-tee',
        code: 'CPT 93355',
        description: 'Intraoperative Transesophageal Echocardiography (TEE) for Guidance of Transcatheter Structural Heart Repair',
        grossCharge: 820,
        classification: 'ROUTINE_CARE',
        appropriateModifier: '-Q1 (Routine Clinical Care)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 § 1 - Routine Clinical Care Service',
        fcaDoubleDipRisk: false,
        complianceRule:
          'Standard of care guidance for structural heart intervention. Fully covered by Medicare Part B with Modifier -Q1.',
      },
      {
        id: 'tmvr-icu',
        code: 'Rev 0200',
        description: 'Inpatient Cardiovascular Intensive Care Unit (CICU) Level-of-Care Post-Procedure (3 Days)',
        grossCharge: 11400,
        classification: 'ROUTINE_CARE',
        appropriateModifier: '-Q1 (Routine Clinical Care)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 § 1 - Standard Inpatient Hospital Bed Days',
        fcaDoubleDipRisk: false,
        complianceRule:
          'Routine post-operative monitoring required regardless of whether procedure was investigational or conventional. Covered under Medicare Part A with Condition Code 30.',
      },
      {
        id: 'tmvr-ct-corelab',
        code: 'CPT 75574',
        description: 'Protocol-Mandated 24-Hour 4D Cardiac CT (Solely for Trial Core Lab Registry Volumetric Analysis)',
        grossCharge: 1650,
        classification: 'RESEARCH_ONLY_DATA',
        appropriateModifier: 'None (Billed to Sponsor CTA Ledger)',
        destination: 'SPONSOR_CTA_GRANT',
        statutoryBasis: 'CMS NCD 310.1 § 2 - Items Conducted Solely for Data Collection Are Non-Covered',
        fcaDoubleDipRisk: true,
        complianceRule:
          'NOT medically necessary for direct patient care; mandated exclusively by study protocol. MUST be routed to Clinical Trial Agreement (CTA) Sponsor Ledger. Billing to Medicare is prohibited.',
      },
      {
        id: 'tmvr-routine-labs',
        code: 'CPT 80053 / 85610',
        description: 'Routine Post-Op Comprehensive Metabolic Panel & PT/INR Coagulation Monitoring',
        grossCharge: 145,
        classification: 'ROUTINE_CARE',
        appropriateModifier: '-Q1 (Routine Clinical Care)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 § 1 - Routine Diagnostic Testing',
        fcaDoubleDipRisk: false,
        complianceRule:
          'Standard medical monitoring for post-surgical anticoagulation. Covered by Medicare Part B with Modifier -Q1.',
      },
    ],
    coverageAttestationText:
      'We hereby certify that TMVR Novel Biomimetic Leaflet Trial (IDE #G210088, NCT04829184) complies with 42 CFR § 405 Subpart B and CMS NCD 310.1. The Category A investigational device ($38,500) has been segregated to Sponsor Free-of-Charge Ledger. Routine clinical services (CPT 0483T, 93355, Rev 0200, 80053) are submitted under Medicare Part A/B with Modifiers -Q0/-Q1, Condition Code 30, and Value Code D4.',
  },
  {
    id: 'dual-chamber-leadless-pacemaker',
    title: 'Dual-Chamber Leadless Transcatheter Pacemaker System Trial',
    shortName: 'Leadless Pacemaker Trial',
    category: 'category-b',
    categoryLabel: 'FDA IDE Category B (Investigational / Incremental)',
    nctNumber: 'NCT03892833',
    protocolNumber: 'IDE #G190245',
    sponsorName: 'CardioRhythm Bioengineering Corporation',
    macJurisdiction: 'Noridian Healthcare Solutions (Jurisdiction F & E - CA, NV, AZ, WA, OR)',
    macContractor: 'Noridian Healthcare Solutions, LLC',
    clinicalIndication: 'Symptomatic atrioventricular block requiring dual-chamber synchronous ventricular pacing',
    coverageWithEvidenceDevelopment: false,
    macPriorApprovalObtained: true,
    irbApprovalDate: '2023-11-10',
    lineItems: [
      {
        id: 'pacemaker-device',
        code: 'HCPCS C1785 / Rev 0624',
        description: 'Dual-Chamber Leadless Pacemaker Implantable Pulse Generator (Category B Investigational Device)',
        grossCharge: 14200,
        classification: 'INVESTIGATIONAL_DEVICE_DRUG',
        appropriateModifier: '-QA (FDA Investigational Device Exemption) or -Q0',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: '42 CFR § 405.203 - Category B Device Covered Under MAC Pre-Approval',
        fcaDoubleDipRisk: false,
        complianceRule:
          'Covered by Medicare Part A/B because Category B status is pre-approved by Noridian MAC under 42 CFR § 405.203. Billed with Modifier -QA, Revenue Code 0624, Condition Code 30, and IDE #G190245.',
      },
      {
        id: 'pacemaker-insertion',
        code: 'CPT 33274',
        description: 'Transcatheter Insertion or Replacement of Permanent Leadless Pacemaker, Right Ventricular / Atrial',
        grossCharge: 1750,
        classification: 'INVESTIGATIONAL_PROCEDURE',
        appropriateModifier: '-Q0 (Investigational Clinical Service)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 - Investigational Surgical Insertion',
        fcaDoubleDipRisk: false,
        complianceRule:
          'Implantation procedure is covered under Medicare Part B with Modifier -Q0 and Condition Code 30.',
      },
      {
        id: 'pacemaker-fluoro',
        code: 'CPT 71045 / 76000',
        description: 'Intraoperative Fluoroscopy & Cine Angiography Guidance for Transcatheter Delivery',
        grossCharge: 310,
        classification: 'ROUTINE_CARE',
        appropriateModifier: '-Q1 (Routine Clinical Care)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 § 1 - Routine Standard Clinical Care',
        fcaDoubleDipRisk: false,
        complianceRule:
          'Routine imaging guidance standard for transcatheter device placement. Covered by Medicare with Modifier -Q1.',
      },
      {
        id: 'pacemaker-obs',
        code: 'Rev 0762',
        description: 'Hospital Outpatient Observation Bed & Post-Implant Telemetry (23 Hours)',
        grossCharge: 2950,
        classification: 'ROUTINE_CARE',
        appropriateModifier: '-Q1 (Routine Clinical Care)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 § 1 - Routine Post-Procedure Hospital Observation',
        fcaDoubleDipRisk: false,
        complianceRule:
          'Standard outpatient observation for puncture site hemostasis and threshold testing. Covered under Medicare Part B OPPS with Condition Code 30.',
      },
      {
        id: 'pacemaker-telemetry-protocol',
        code: 'CPT 93279',
        description: 'Unscheduled Trial-Protocol Interrogation & Waveform Transmission at Day 14 (Sponsor Study Endpoint)',
        grossCharge: 380,
        classification: 'RESEARCH_ONLY_DATA',
        appropriateModifier: 'None (Billed to Sponsor CTA Ledger)',
        destination: 'SPONSOR_CTA_GRANT',
        statutoryBasis: 'CMS NCD 310.1 § 2 - Extra Protocol Interrogation Solely for Sponsor Data Analysis',
        fcaDoubleDipRisk: true,
        complianceRule:
          'Exceeds clinical standard-of-care interval. Required strictly to fulfill study protocol registry. Must be billed to trial sponsor; billing Medicare creates False Claims Act liability.',
      },
    ],
    coverageAttestationText:
      'We hereby certify that Dual-Chamber Leadless Pacemaker System (IDE #G190245, NCT03892833) satisfies 42 CFR § 405.203 Category B criteria. Prior authorization was formally granted by Noridian MAC. The implantable device (C1785) and procedure (CPT 33274) are billed to Medicare with Modifiers -QA/-Q0, Condition Code 30, and Value Code D4.',
  },
  {
    id: 'bispecific-antibody-myeloma',
    title: 'Phase II/III Humanized BCMA Bispecific T-Cell Engager in Refractory Multiple Myeloma',
    shortName: 'Bispecific Myeloma IND Trial',
    category: 'ind-oncology',
    categoryLabel: 'FDA IND Oncology Clinical Trial',
    nctNumber: 'NCT04523789',
    protocolNumber: 'IND #158920',
    sponsorName: 'Global Oncology Biotherapeutics & NCI Cooperative Group',
    macJurisdiction: 'National Government Services (Jurisdiction K & 6 - NY, MA, CT, IL, ME)',
    macContractor: 'National Government Services, Inc.',
    clinicalIndication: 'Relapsed or refractory multiple myeloma after >= 3 prior lines including proteasome inhibitor & IMiD',
    coverageWithEvidenceDevelopment: false,
    macPriorApprovalObtained: true,
    irbApprovalDate: '2023-09-22',
    lineItems: [
      {
        id: 'bispecific-drug',
        code: 'HCPCS J9999 / Investigational Biologic',
        description: 'Investigational Humanized Bispecific BCMA T-Cell Engager Infusion 30mg (Sponsor Supplied)',
        grossCharge: 18900,
        classification: 'INVESTIGATIONAL_DEVICE_DRUG',
        appropriateModifier: 'None (Provided Free by Sponsor IND Grant)',
        destination: 'NON_COVERED_SPONSOR_FREE',
        statutoryBasis: '21 CFR § 312.7 & False Claims Act (31 U.S.C. § 3729) - Free Investigational Drug',
        fcaDoubleDipRisk: true,
        complianceRule:
          'CRITICAL COMPLIANCE: Drug is provided free by pharmaceutical sponsor. Billing Medicare, Medicaid, or commercial insurance for sponsor-donated drugs is federal criminal fraud and False Claims Act violation.',
      },
      {
        id: 'bispecific-infusion',
        code: 'CPT 96413',
        description: 'Chemotherapy / Biotherapy IV Infusion Administration, First Hour',
        grossCharge: 265,
        classification: 'INVESTIGATIONAL_PROCEDURE',
        appropriateModifier: '-Q0 (Investigational Clinical Administration)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 § 1 - Administration of Investigational Item',
        fcaDoubleDipRisk: false,
        complianceRule:
          'CMS covers the clinical administration of an investigational drug even when the drug itself is non-covered/free. Billed with Modifier -Q0.',
      },
      {
        id: 'bispecific-premeds',
        code: 'HCPCS J1100 / J1200',
        description: 'Standard Pre-medication Protocol (IV Dexamethasone 20mg + Diphenhydramine 50mg + Acetaminophen)',
        grossCharge: 88,
        classification: 'ROUTINE_CARE',
        appropriateModifier: '-Q1 (Routine Clinical Care)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 § 1 - Routine Supportive Pharmaceutical Care',
        fcaDoubleDipRisk: false,
        complianceRule:
          'Routine supportive antiemetic/antihistaminic care necessary for patient safety. Fully covered under Medicare Part B with Modifier -Q1.',
      },
      {
        id: 'bispecific-pk-draws',
        code: 'CPT 36415 / Research Core Lab',
        description: 'Serial Pharmacokinetic (PK) Blood Draws at 0.5h, 2h, 6h, 12h, and 24h Post-Infusion',
        grossCharge: 1420,
        classification: 'RESEARCH_ONLY_DATA',
        appropriateModifier: 'None (Billed to Sponsor Study Budget CTA)',
        destination: 'SPONSOR_CTA_GRANT',
        statutoryBasis: 'CMS NCD 310.1 § 2 - Data Collection Exclusively for Investigational Drug Dossier',
        fcaDoubleDipRisk: true,
        complianceRule:
          'Research PK draws have zero patient care utility; conducted solely to generate FDA approval pharmacokinetics. Billed exclusively to Sponsor Study Grant. NEVER bill to Medicare.',
      },
      {
        id: 'bispecific-crs-inpatient',
        code: 'Rev 0110 / CPT 99223 / J3262',
        description: 'Inpatient Hospital Stay & IV Tocilizumab for Grade 2 Cytokine Release Syndrome (Complication Management)',
        grossCharge: 9650,
        classification: 'ROUTINE_CARE',
        appropriateModifier: '-Q1 (Routine Clinical Care)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 § 1 - Management of Clinical Trial Treatment Complications',
        fcaDoubleDipRisk: false,
        complianceRule:
          'CMS NCD 310.1 explicitly guarantees Medicare coverage for complications arising from investigational agents. Inpatient bed days and rescue Tocilizumab are fully covered under Medicare Part A/B with Modifier -Q1.',
      },
      {
        id: 'bispecific-staging-pet',
        code: 'CPT 78815',
        description: 'Baseline & Restaging Whole-Body Tumor Imaging Fluorodeoxyglucose PET/CT Scan (Week 12)',
        grossCharge: 2800,
        classification: 'ROUTINE_CARE',
        appropriateModifier: '-Q1 (Routine Clinical Care)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 § 1 - Standard Disease Staging at Clinically Accepted Intervals',
        fcaDoubleDipRisk: false,
        complianceRule:
          'Routine restaging PET/CT at clinically customary 12-week intervals is covered under Medicare Part B with Modifier -Q1.',
      },
    ],
    coverageAttestationText:
      'We hereby certify that Bispecific Myeloma IND Trial (IND #158920, NCT04523789) is an authorized clinical study under 21 CFR Part 312. The investigational biologic ($18,900) is provided free by the trial sponsor. Routine administration, supportive premedications, and CRS complication therapy are billed to Medicare with Modifiers -Q0/-Q1, Condition Code 30, and Value Code D4.',
  },
  {
    id: 'bioresorbable-scaffold-pad',
    title: 'Sirolimus-Eluting Bioresorbable Peripheral Scaffold for Below-the-Knee Critical Limb Ischemia',
    shortName: 'Bioresorbable Scaffold CLI Trial',
    category: 'category-b',
    categoryLabel: 'FDA IDE Category B (Endovascular Scaffold)',
    nctNumber: 'NCT05112340',
    protocolNumber: 'IDE #G220119',
    sponsorName: 'Peripheral Vascular Therapeutics Consortium',
    macJurisdiction: 'First Coast Service Options (Jurisdiction N - FL, PR, USVI)',
    macContractor: 'First Coast Service Options, Inc.',
    clinicalIndication: 'Critical limb ischemia (Rutherford Category 4-5) with infrapopliteal arterial stenosis',
    coverageWithEvidenceDevelopment: false,
    macPriorApprovalObtained: true,
    irbApprovalDate: '2024-02-01',
    lineItems: [
      {
        id: 'scaffold-device',
        code: 'HCPCS C1874 / Rev 0624',
        description: 'Sirolimus-Eluting Bioresorbable Vascular Scaffold System (Category B IDE Device)',
        grossCharge: 9800,
        classification: 'INVESTIGATIONAL_DEVICE_DRUG',
        appropriateModifier: '-QA (FDA Investigational Device Exemption) or -Q0',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: '42 CFR § 405.203 - Category B Peripheral Device Covered with MAC Authorization',
        fcaDoubleDipRisk: false,
        complianceRule:
          'First Coast MAC pre-approval active. Reimbursable by Medicare up to baseline metallic drug-eluting stent allowance. Billed with Modifier -QA, Revenue Code 0624, Condition Code 30, and IDE #G220119.',
      },
      {
        id: 'scaffold-intervention',
        code: 'CPT 37228',
        description: 'Revascularization, Endovascular, Open or Percutaneous, Tibial/Peroneal Artery with Angioplasty',
        grossCharge: 3200,
        classification: 'INVESTIGATIONAL_PROCEDURE',
        appropriateModifier: '-Q0 (Investigational Clinical Service)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 - Investigational Surgical Service',
        fcaDoubleDipRisk: false,
        complianceRule:
          'Investigational endovascular procedure covered under Medicare Part B with Modifier -Q0 and Condition Code 30.',
      },
      {
        id: 'scaffold-angiography',
        code: 'CPT 75710',
        description: 'Extremity Angiography, Unilateral, Radiological Supervision and Interpretation',
        grossCharge: 640,
        classification: 'ROUTINE_CARE',
        appropriateModifier: '-Q1 (Routine Clinical Care)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 § 1 - Routine Standard Diagnostic Angiography',
        fcaDoubleDipRisk: false,
        complianceRule:
          'Standard procedural diagnostic imaging required for vessel sizing and stent landing. Covered by Medicare with Modifier -Q1.',
      },
      {
        id: 'scaffold-facility',
        code: 'Rev 0490',
        description: 'Hospital Outpatient Ambulatory Surgical Center / Catheterization Suite Facility Fee',
        grossCharge: 4100,
        classification: 'ROUTINE_CARE',
        appropriateModifier: '-Q1 (Routine Clinical Care)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 § 1 - Hospital Outpatient Facility Resource Costs',
        fcaDoubleDipRisk: false,
        complianceRule:
          'Standard procedural facility overhead covered under Medicare Part A / OPPS with Condition Code 30 and Value Code D4.',
      },
      {
        id: 'scaffold-qva-corelab',
        code: 'CPT 76499 / Research Core Fee',
        description: 'Core Lab Independent Quantitative Vascular Angiography (QVA) Minimum Lumen Diameter Analysis',
        grossCharge: 850,
        classification: 'RESEARCH_ONLY_DATA',
        appropriateModifier: 'None (Billed to Sponsor CTA Ledger)',
        destination: 'SPONSOR_CTA_GRANT',
        statutoryBasis: 'CMS NCD 310.1 § 2 - Protocol Endpoint Analysis for Regulatory Submission',
        fcaDoubleDipRisk: true,
        complianceRule:
          'QVA core-lab endpoint analysis has no impact on bedside patient clinical decision-making; mandated by sponsor for FDA PMA submission. Must be billed to sponsor CTA budget.',
      },
      {
        id: 'scaffold-duplex',
        code: 'CPT 93925',
        description: 'Duplex Scan of Lower Extremity Arteries at 30-Day Follow-Up',
        grossCharge: 420,
        classification: 'ROUTINE_CARE',
        appropriateModifier: '-Q1 (Routine Clinical Care)',
        destination: 'MEDICARE_PART_A_B',
        statutoryBasis: 'CMS NCD 310.1 § 1 - Routine Post-Intervention Patency Surveillance',
        fcaDoubleDipRisk: false,
        complianceRule:
          'Routine surveillance duplex to verify tibial vessel runoff patency. Covered under Medicare Part B with Modifier -Q1.',
      },
    ],
    coverageAttestationText:
      'We hereby certify that Bioresorbable Scaffold CLI Trial (IDE #G220119, NCT05112340) meets 42 CFR § 405.203 Category B requirements with First Coast MAC authorization. The investigational scaffold (C1874) and deployment (CPT 37228) are billed with Modifiers -QA/-Q0, Condition Code 30, and Value Code D4.',
  },
];

export function calculateLedgerBreakdown(trial: ClinicalResearchTrial): LedgerBreakdown {
  let medicareTotal = 0;
  let medicareItemsCount = 0;
  let sponsorTotal = 0;
  let sponsorItemsCount = 0;
  let nonCoveredDeviceTotal = 0;
  let nonCoveredItemsCount = 0;

  for (const item of trial.lineItems) {
    if (item.destination === 'MEDICARE_PART_A_B') {
      medicareTotal += item.grossCharge;
      medicareItemsCount += 1;
    } else if (item.destination === 'SPONSOR_CTA_GRANT') {
      sponsorTotal += item.grossCharge;
      sponsorItemsCount += 1;
    } else if (item.destination === 'NON_COVERED_SPONSOR_FREE') {
      nonCoveredDeviceTotal += item.grossCharge;
      nonCoveredItemsCount += 1;
    }
  }

  const grossTotal = medicareTotal + sponsorTotal + nonCoveredDeviceTotal;

  return {
    medicareTotal,
    medicareItemsCount,
    sponsorTotal,
    sponsorItemsCount,
    nonCoveredDeviceTotal,
    nonCoveredItemsCount,
    grossTotal,
  };
}

export function evaluateFcaRiskScenario(
  scenarioType: 'double-billing-sponsor-item' | 'bill-cat-a-device-to-medicare' | 'missing-q-modifier' | 'compliant-split-billing',
  billedAmount: number
): FcaRiskEvaluation {
  switch (scenarioType) {
    case 'double-billing-sponsor-item':
      return {
        scenarioId: 'fca-double-dip',
        title: 'Double Billing Sponsor-Paid Item or Drug to Medicare',
        severity: 'CRITICAL_FCA_VIOLATION',
        statutoryViolation: 'Federal False Claims Act (31 U.S.C. § 3729(a)(1)(A)) & Civil Monetary Penalties Law (42 U.S.C. § 1320a-7a)',
        potentialPenalty: `Mandatory civil penalty under 31 U.S.C. § 3729 of $13,508 to $27,018 per false claim, plus treble damages (3x $${billedAmount.toLocaleString()} = $${(
          billedAmount * 3
        ).toLocaleString()}), mandatory OIG exclusion referral, and corporate integrity agreement.`,
        correctiveAction:
          'Immediately strip line item from Medicare 837I/837P claim file. Redirect line item exclusively to Clinical Trial Agreement (CTA) Sponsor Grant Invoice ledger.',
      };

    case 'bill-cat-a-device-to-medicare':
      return {
        scenarioId: 'cat-a-device-overpayment',
        title: 'Billed FDA Category A Experimental Device to Medicare',
        severity: 'PROHIBITED_DEVICE_BILLING',
        statutoryViolation: '42 CFR § 405.201(b) & Medicare Claims Processing Manual Ch. 32 § 68',
        potentialPenalty: `Full clawback of $${billedAmount.toLocaleString()} device charge, 100% prepayment review audit by MAC, and potential RAC targeted probe audit of all clinical research accounts.`,
        correctiveAction:
          'Reclassify Category A device as Non-Covered with Revenue Code 0624 and $0 payment token, or bill directly to research grant sponsor per CTA agreement.',
      };

    case 'missing-q-modifier':
      return {
        scenarioId: 'missing-q-mod',
        title: 'Omission of Mandatory Modifier -Q0 or -Q1 on Research Claim',
        severity: 'CLEARINGHOUSE_REJECTION',
        statutoryViolation: 'CMS MLN Matters MM8401 & Medicare Claims Processing Manual Ch. 32 § 69.6',
        potentialPenalty:
          'Immediate claim rejection at clearinghouse/MAC level with Claim Adjustment Reason Code (CARC) 4 and Remittance Advice Remark Code (RARC) MA130 / N519 ("Missing/incomplete clinical trial modifier"). Delay in cash flow of 45-90 days.',
        correctiveAction:
          'Append Modifier -Q1 to routine care line items or -Q0 to investigational clinical services, accompanied by Condition Code 30 and Value Code D4.',
      };

    case 'compliant-split-billing':
    default:
      return {
        scenarioId: 'compliant-split',
        title: 'Sovereign Dual-Ledger Compliant Split Billing',
        severity: 'COMPLIANT_SPLIT',
        statutoryViolation: 'None (Full Compliance with CMS NCD 310.1 & 42 CFR § 405 Subpart B)',
        potentialPenalty: '$0 Liability (Protected under Sovereign Human Review & Cryptographic Trial Ledger)',
        correctiveAction:
          'Execute clean electronic claim transmission with verified NCT number in Value Code D4, Condition Code 30, and strict modifier segregation.',
      };
  }
}
