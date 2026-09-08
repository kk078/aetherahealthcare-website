interface DenialRule {
  carc: string;
  name: string;
  category: string;
  appealDeadlineDays: {
    medicare: number;
    commercial: number;
    medicaid: number;
  };
  keyDocumentationNeeded: string[];
  remediationSteps: string[];
  statutoryCitation: string;
  strategyTemplate: string;
}

export const DENIAL_RULES: Record<string, DenialRule> = {
  'CO-50': {
    carc: 'CO-50',
    name: 'These are non-covered services because this is not deemed a medical necessity by the payer.',
    category: 'Medical Necessity',
    appealDeadlineDays: { medicare: 120, commercial: 180, medicaid: 60 },
    keyDocumentationNeeded: [
      'Attending physician Letter of Medical Necessity (LMN)',
      'Specific LCD/NCD coverage indication matching primary ICD-10',
      'Documented failure of conservative therapy (minimum 6–12 weeks where applicable)',
      'Diagnostic pathology or imaging reports confirming clinical diagnosis',
    ],
    remediationSteps: [
      'Audit the denying payer\'s specific clinical coverage policy bulletin (CPB) against chart notes.',
      'Highlight documented conservative treatment trial failure and physical exam objective findings.',
      'Submit formal Level 1 Redetermination or Reconsideration with physician-signed LMN attached.',
    ],
    statutoryCitation: 'CMS Medicare Claims Processing Manual Pub. 100-04, Ch. 29 & ERISA 29 CFR § 2560.503-1(h)',
    strategyTemplate:
      'Pursuant to ERISA regulations 29 CFR § 2560.503-1(h) and published Local Coverage Determination criteria, the contested services satisfy all medical necessity guidelines. Enclosed clinical records substantiate conservative management failure and objective diagnostic indicators warranting immediate overturn.',
  },
  'CO-197': {
    carc: 'CO-197',
    name: 'Precertification / authorization / notification / pre-treatment absent.',
    category: 'Prior Authorization',
    appealDeadlineDays: { medicare: 120, commercial: 180, medicaid: 45 },
    keyDocumentationNeeded: [
      'Proof of urgent/emergent presentation overriding elective pre-auth rules',
      'Payer portal confirmation timestamp or written retro-auth request',
      'Clinical justification demonstrating emergency medical stabilization (EMTALA/Prudent Layperson)',
      'State Gold-Card exemption documentation (if in TX, MI, or GA)',
    ],
    remediationSteps: [
      'Determine if the service was urgent/emergent; if so, cite EMTALA and Prudent Layperson Standard.',
      'Check if provider qualifies for state Gold Card prior-auth exemption (e.g., Texas HB 3459 / Michigan PA 60).',
      'Request retrospective authorization within payer-specified appeal grace periods.',
    ],
    statutoryCitation: 'Emergency Medical Treatment and Active Labor Act (EMTALA) 42 U.S.C. § 1395dd & CMS-0057-F',
    strategyTemplate:
      'The disputed treatment was provided under acute clinical presentation meeting statutory Prudent Layperson emergency criteria. Retrospective clinical review is hereby demanded pursuant to emergency exception protocols and CMS Interoperability mandate CMS-0057-F.',
  },
  'CO-97': {
    carc: 'CO-97',
    name: 'The benefit for this service is included in the payment/allowance for another service/procedure.',
    category: 'Bundling / NCCI',
    appealDeadlineDays: { medicare: 120, commercial: 180, medicaid: 90 },
    keyDocumentationNeeded: [
      'Operative note detailing distinct anatomic site, separate incision, or distinct session',
      'Procedure-to-procedure (PTP) CMS NCCI edit modifier indicator verification (Indicator 1)',
      'Separate and distinct ICD-10 diagnosis linkage in Loop 2400',
      'Documented independent medical decision-making for same-day E/M visits',
    ],
    remediationSteps: [
      'Verify CMS NCCI PTP edit table: confirm modifier indicator is "1" (allowed with appropriate modifier).',
      'Validate appropriate modifier usage: append Modifier 59, XE, XS, XP, or XU with distinct anatomic documentation.',
      'Submit corrected claim or formal appeal citing CMS NCCI Policy Manual Chapter 1.',
    ],
    statutoryCitation: 'CMS National Correct Coding Initiative (NCCI) Policy Manual, Chapter 1, Section E',
    strategyTemplate:
      'Pursuant to CMS NCCI guidelines, procedure code [CPT] represents a distinct, separately identifiable surgical service performed at a separate anatomic site/encounter. Clinical operative notes enclosed substantiate valid unbundling under Modifier [MOD].',
  },
  'CO-16': {
    carc: 'CO-16',
    name: 'Claim/service lacks information or has submission/billing error(s).',
    category: 'Information Deficit',
    appealDeadlineDays: { medicare: 120, commercial: 180, medicaid: 90 },
    keyDocumentationNeeded: [
      'Associated RARC remittance code identifying exact missing loop/segment',
      'Valid ordering physician NPI and primary taxonomy in Box 17/Loop 2310A',
      'Itemized invoice or NDC unit conversion for specialty pharmaceuticals',
      'CLIA certificate number in Box 23 / Loop 2300 for laboratory testing',
    ],
    remediationSteps: [
      'Decode the accompanying RARC code (e.g., M51, N257, MA130) to identify the specific missing data element.',
      'Correct the electronic ANSI 837 claim file rather than submitting a full formal appeal.',
      'Resubmit electronically as a Corrected Claim (Claim Frequency Type 7) with original ICN/CCN.',
    ],
    statutoryCitation: 'HIPAA Standard Electronic Transaction Standards 45 CFR § 162.1102',
    strategyTemplate:
      'Corrected claim resubmission providing previously omitted diagnostic information as identified in remit remark code. Claim resubmitted electronically under Frequency Code 7 with original payer reference number.',
  },
  'CO-29': {
    carc: 'CO-29',
    name: 'The time limit for filing has expired.',
    category: 'Timely Filing',
    appealDeadlineDays: { medicare: 120, commercial: 60, medicaid: 30 },
    keyDocumentationNeeded: [
      'Clearinghouse EDI 277 / 999 1st-tier acceptance report with date/time stamp',
      'Original payer claim control number (CCN) from previous remit',
      'Proof of timely submission to wrong payer or primary payer EOB for secondary claims',
      'State insurance commissioner prompt-filing waiver documentation for administrative delays',
    ],
    remediationSteps: [
      'Obtain electronic audit trail from clearinghouse proving initial clean submission before deadline.',
      'Check secondary billing rules: secondary timely filing runs from primary remit date, not date of service.',
      'Submit Level 1 dispute with clearinghouse acceptance certificate attached.',
    ],
    statutoryCitation: 'Medicare Claims Processing Manual Ch. 1 § 70 & State Prompt Pay Statutory Filing Provisions',
    strategyTemplate:
      'Timely filing appeal submitting certified EDI 277CA clearinghouse acceptance report proving initial submission on [DATE], well within the contractual [DAYS]-day filing limitation period. Immediate claim reprocessing is demanded.',
  },
  'CO-22': {
    carc: 'CO-22',
    name: 'This care may be covered by another payer per coordination of benefits.',
    category: 'Coordination of Benefits',
    appealDeadlineDays: { medicare: 120, commercial: 180, medicaid: 60 },
    keyDocumentationNeeded: [
      'Updated patient coordination of benefits (COB) questionnaire',
      'Primary payer explanation of benefits (EOB / 835) showing paid or non-covered status',
      'Medicare Secondary Payer (MSP) questionnaire and eligibility verification record',
      'Date of termination from former commercial policy',
    ],
    remediationSteps: [
      'Contact patient to complete COB questionnaire with health plan or verify primary policy termination.',
      'If primary payer has paid, submit electronic secondary claim (Loop 2320) with primary payment info.',
      'If this plan is primary, submit attestation of no other active coverage.',
    ],
    statutoryCitation: 'NAIC Coordination of Benefits Model Regulation & 42 CFR § 411.20',
    strategyTemplate:
      'Coordination of Benefits resolution: Enclosed verification confirms patient has updated primary payer coordination records with health plan. Primary EOB / secondary submission data enclosed for immediate adjudication.',
  },
};


/** A checklist completion score, not an outcome probability. */
export function appealReadiness(documents: readonly boolean[]): number {
  if (!documents.length) return 0;
  return Math.round(documents.filter(Boolean).length / documents.length * 100);
}
