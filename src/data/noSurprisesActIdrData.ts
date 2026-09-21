export interface IdrCaseScenario {
  id: string;
  title: string;
  specialty: string;
  cptCodes: string[];
  serviceDescription: string;
  facilityType: string;
  payerName: string;
  qpaAmount: number; // Payer's deflated Qualifying Payment Amount
  billedCharges: number; // For statutory exclusion demonstration
  sovereignOfferAmount: number; // Fair market certified final offer
  patientAcuityDescription: string;
  clinicianCredentials: string;
  goodFaithContractingEffort: string;
  prevailingProbability: number; // 0 to 100
  nonQpaFactors: {
    factorName: string;
    statutoryReference: string;
    substantiatingEvidence: string;
  }[];
  statutoryTimeline: {
    cleanClaimReceiptDate: string;
    initialPaymentDate: string;
    openNegotiationNoticeDate: string;
    openNegotiationExpiryDate: string;
    idrInitiationDeadlineDate: string; // Exactly 4 business days after open negotiation
  };
  briefExcerpts: {
    heading: string;
    body: string;
  }[];
}

export const NSA_IDR_SCENARIOS: IdrCaseScenario[] = [
  {
    id: 'case-trauma-splenectomy',
    title: 'Emergency Trauma Damage Control Laparotomy with Splenectomy',
    specialty: 'Trauma & Acute Care General Surgery',
    cptCodes: ['CPT 38100', 'CPT 47350-51', 'CPT 99291-25'],
    serviceDescription: 'Emergent exploratory laparotomy, total splenectomy for Grade IV splenic rupture, complex hepatorrhaphy, and 74 minutes of bedside critical care resuscitation.',
    facilityType: 'In-Network Level 1 Trauma Center (Hospital POS 21)',
    payerName: 'UnitedHealthcare Commercial HMO (Change Healthcare Pricing)',
    qpaAmount: 1420.0,
    billedCharges: 16800.0,
    sovereignOfferAmount: 4850.0,
    patientAcuityDescription: '34yo unrestrained driver with traumatic hemorrhagic shock, hemodynamically unstable with MAP 48 mmHg and 2.4L hemoperitoneum requiring massive transfusion protocol.',
    clinicianCredentials: 'Dual Board-Certified in General Surgery and Surgical Critical Care (FACS); 14 years trauma center on-call experience.',
    goodFaithContractingEffort: 'Provider made 3 formal requests to execute in-network commercial contract within prior 18 months; payer refused to negotiate above 110% of Medicare allowable.',
    prevailingProbability: 94,
    nonQpaFactors: [
      {
        factorName: 'Patient Acuity & Complexity (45 CFR § 149.510(c)(4)(ii)(B))',
        statutoryReference: '45 CFR § 149.510(c)(4)(ii)(B)',
        substantiatingEvidence: 'Massive transfusion protocol (6 units PRBC, 4 FFP), intraoperative cardiac arrest with return of spontaneous circulation, and emergent splenectomy to control exsanguination.',
      },
      {
        factorName: 'Clinician Training & Specialty Experience (45 CFR § 149.510(c)(4)(ii)(A))',
        statutoryReference: '45 CFR § 149.510(c)(4)(ii)(A)',
        substantiatingEvidence: 'Operating surgeon possesses subspecialty fellowship certification in Surgical Critical Care and serves as Level 1 Trauma Medical Director.',
      },
      {
        factorName: 'Facility Regional Trauma Status (45 CFR § 149.510(c)(4)(ii)(D))',
        statutoryReference: '45 CFR § 149.510(c)(4)(ii)(D)',
        substantiatingEvidence: 'Facility is the sole state-designated Level 1 Trauma Center within a 90-mile catchment radius, requiring 24/7 in-house surgical response.',
      },
    ],
    statutoryTimeline: {
      cleanClaimReceiptDate: 'Day 0: Clean Claim Received by Payer',
      initialPaymentDate: 'Day 28: Initial Payment Notice Issued ($1,420 QPA)',
      openNegotiationNoticeDate: 'Day 32: Provider Dispatches Open Negotiation Notice',
      openNegotiationExpiryDate: 'Day 62: 30-Business-Day Negotiation Period Concludes',
      idrInitiationDeadlineDate: 'Day 66: Strictly 4 Business Days to File Federal IDR via CMS Portal',
    },
    briefExcerpts: [
      {
        heading: 'I. Rebuttal of Payer\'s Deflated Qualifying Payment Amount (QPA)',
        body: 'Pursuant to the judicial mandate in Texas Medical Association v. HHS (TMA III) and 45 CFR § 149.510(c)(4), the Certified IDR Entity is legally prohibited from presuming the QPA ($1,420.00) is reasonable or appropriate. The payer\'s QPA reflects low-acuity scheduled general surgical procedures and fails to account for emergency damage control resuscitation.',
      },
      {
        heading: 'II. Demonstrable Credible Information on Patient Acuity',
        body: 'The patient presented in Class IV hemorrhagic shock with immediate threat to life. Operating narrative documents profound coagulopathy and 2,400 mL hemoperitoneum. CPT 38100 with trauma critical care 99291 represents emergency life-saving care far exceeding standard splenectomy complexity.',
      },
      {
        heading: 'III. Final Offer Justification',
        body: 'Provider\'s certified offer of $4,850.00 reflects fair market commercial compensation for Level 1 emergency trauma care and should be selected in its entirety under baseball-style adjudication.',
      },
    ],
  },
  {
    id: 'case-anesthesia-aaa',
    title: 'Emergency General Anesthesia for Ruptured Abdominal Aortic Aneurysm',
    specialty: 'Adult Anesthesiology',
    cptCodes: ['CPT 00790-AA', 'Physical Status 5 (P5)', 'Modifier -99 (Emergency)'],
    serviceDescription: 'Complete general anesthesia for ruptured infrarenal abdominal aortic aneurysm repair, including rapid sequence induction, dual arterial line placement, central venous access, and TEE monitoring.',
    facilityType: 'In-Network Acute Hospital (Operating Suite POS 21)',
    payerName: 'Aetna Commercial PPO (CVS Health)',
    qpaAmount: 840.0,
    billedCharges: 4200.0,
    sovereignOfferAmount: 2660.0,
    patientAcuityDescription: '72yo male presenting with sudden vascular collapse and retroperitoneal aneurysm rupture; ASA Physical Status 5 (moribund patient not expected to survive without operation).',
    clinicianCredentials: 'Board-Certified Anesthesiologist with Cardiac/Vascular Anesthesia Fellowship credentialing; 18 years clinical practice.',
    goodFaithContractingEffort: 'Anesthesia group provided continuous emergency on-call coverage to the hospital; payer terminated prior contract after attempting a 42% unilateral fee schedule reduction.',
    prevailingProbability: 96,
    nonQpaFactors: [
      {
        factorName: 'ASA Physical Status 5 Complexity (45 CFR § 149.510(c)(4)(ii)(B))',
        statutoryReference: '45 CFR § 149.510(c)(4)(ii)(B)',
        substantiatingEvidence: 'Extreme patient acuity requiring simultaneous cross-clamping hemodynamic stabilization, inotropic infusions, and continuous transesophageal echocardiography.',
      },
      {
        factorName: 'Vascular Subspecialty Expertise (45 CFR § 149.510(c)(4)(ii)(A))',
        statutoryReference: '45 CFR § 149.510(c)(4)(ii)(A)',
        substantiatingEvidence: 'Clinician possesses Advanced Perioperative TEE Certification from the National Board of Echocardiography (NBE).',
      },
    ],
    statutoryTimeline: {
      cleanClaimReceiptDate: 'Day 0: Clean Claim Received by Payer',
      initialPaymentDate: 'Day 26: Payer Dispatches $840.00 ($30/unit QPA rate)',
      openNegotiationNoticeDate: 'Day 30: Open Negotiation Notice Sent by Certified Mail',
      openNegotiationExpiryDate: 'Day 60: 30-Business-Day Negotiation Period Terminates without Agreement',
      idrInitiationDeadlineDate: 'Day 64: 4-Business-Day Federal Portal Submission Enforced',
    },
    briefExcerpts: [
      {
        heading: 'I. Inapplicability of Median In-Network QPA Conversion Factor',
        body: 'The payer calculated the QPA at approximately $30 per anesthesia unit, which conflates elective outpatient endoscopy sedation with high-risk vascular emergency anesthesia. Under 45 CFR § 149.510, unit conversion factors must reflect the complexity of the service.',
      },
      {
        heading: 'II. ASA Physical Status Unit Justification',
        body: 'The patient was classified as ASA P5 under ASA Relative Value Guide rules. The provider\'s offer of $2,660.00 represents 28 total base, time, and qualifying units calculated at a commercially reasonable $95/unit regional market rate.',
      },
    ],
  },
  {
    id: 'case-neonatal-critical-care',
    title: 'Emergency Neonatal Resuscitation & Initial Intensive Care (Day 1)',
    specialty: 'Neonatal-Perinatal Medicine / Pediatrics',
    cptCodes: ['CPT 99468', 'CPT 31500', 'CPT 36660'],
    serviceDescription: 'Initial inpatient neonatal critical care, emergency endotracheal intubation, and umbilical arterial line placement in extremely low birth weight (ELBW) premature infant.',
    facilityType: 'In-Network Hospital Level III NICU (POS 21)',
    payerName: 'Elevance / Anthem Blue Cross Blue Shield',
    qpaAmount: 980.0,
    billedCharges: 5400.0,
    sovereignOfferAmount: 3150.0,
    patientAcuityDescription: '24-week gestational age neonate weighing 620 grams presenting with severe respiratory distress syndrome, surfactant deficiency, bradycardia, and hypothermia.',
    clinicianCredentials: 'Board-Certified in Neonatal-Perinatal Medicine; Chief of Neonatology at Regional Perinatal Center.',
    goodFaithContractingEffort: 'Neonatology practice participated in in-network negotiations for 12 months; health plan excluded neonatal subspecialty rates from commercial fee schedule.',
    prevailingProbability: 92,
    nonQpaFactors: [
      {
        factorName: 'Critical Acuity of Extremely Premature Infant (45 CFR § 149.510(c)(4)(ii)(B))',
        statutoryReference: '45 CFR § 149.510(c)(4)(ii)(B)',
        substantiatingEvidence: '620-gram micro-preemie requiring emergent delivery-room resuscitation, high-frequency oscillatory ventilation, and central umbilical cannulation.',
      },
      {
        factorName: 'Level III NICU Regional Capability (45 CFR § 149.510(c)(4)(ii)(D))',
        statutoryReference: '45 CFR § 149.510(c)(4)(ii)(D)',
        substantiatingEvidence: 'Facility provides sole Level III neonatal intensive care capabilities within the entire county service area.',
      },
    ],
    statutoryTimeline: {
      cleanClaimReceiptDate: 'Day 0: Clean Claim Transmitted',
      initialPaymentDate: 'Day 30: Remittance Advice with $980.00 QPA',
      openNegotiationNoticeDate: 'Day 35: Formal Open Negotiation Notice Dispatched',
      openNegotiationExpiryDate: 'Day 65: Open Negotiation Concludes with Zero Payer Counter',
      idrInitiationDeadlineDate: 'Day 69: CMS Portal Portal IDR Initiation Completed on Day 3',
    },
    briefExcerpts: [
      {
        heading: 'I. Demonstration of Extreme Clinical Complexity',
        body: 'Neonatal critical care under CPT 99468 requires constant direct physician presence and direction of intensive cardiopulmonary support for a critically ill infant. The payer\'s $980 QPA grossly understates the clinical labor and specialized skill necessary to stabilize a 620-gram infant.',
      },
      {
        heading: 'II. Selection of Provider Final Offer',
        body: 'Provider\'s certified offer of $3,150.00 aligns directly with fair regional commercial reimbursement for initial neonatal critical care. The IDR entity must select this offer pursuant to 45 CFR § 149.510.',
      },
    ],
  },
  {
    id: 'case-ortho-femur-fracture',
    title: 'Emergency Open Reduction & Internal Fixation of Comminuted Femur Fracture',
    specialty: 'Orthopedic Trauma Surgery',
    cptCodes: ['CPT 27506', 'CPT 20690'],
    serviceDescription: 'Emergency open treatment of severe comminuted femoral shaft fracture with intramedullary nail and proximal/distal interlocking screws, with temporary external fixation application.',
    facilityType: 'In-Network Community Hospital Emergency Room (POS 21)',
    payerName: 'Cigna Healthcare Commercial PPO',
    qpaAmount: 1850.0,
    billedCharges: 9800.0,
    sovereignOfferAmount: 5200.0,
    patientAcuityDescription: '29yo construction worker with high-velocity crush trauma, open Winquist Grade IV comminuted femoral shaft fracture with impending compartment syndrome.',
    clinicianCredentials: 'Orthopedic Surgeon with Orthopedic Trauma Association (OTA) Fellowship credentials.',
    goodFaithContractingEffort: 'Provider attempted network contracting; payer maintained regional closed network for orthopedic surgical specialties.',
    prevailingProbability: 91,
    nonQpaFactors: [
      {
        factorName: 'Impending Compartment Syndrome & Fracture Comminution (45 CFR § 149.510(c)(4)(ii)(B))',
        statutoryReference: '45 CFR § 149.510(c)(4)(ii)(B)',
        substantiatingEvidence: 'Intraoperative compartment pressure measurements exceeding 35 mmHg; extensive skeletal traction and anatomic reduction required 3.5 operative hours.',
      },
      {
        factorName: 'Specialized Trauma Fellowship Training (45 CFR § 149.510(c)(4)(ii)(A))',
        statutoryReference: '45 CFR § 149.510(c)(4)(ii)(A)',
        substantiatingEvidence: 'Fellowship training in complex limb salvage and pelvic/femoral reconstruction at an OTA-accredited trauma fellowship program.',
      },
    ],
    statutoryTimeline: {
      cleanClaimReceiptDate: 'Day 0: Clean Claim Received',
      initialPaymentDate: 'Day 29: Payer Issues $1,850 QPA',
      openNegotiationNoticeDate: 'Day 31: Open Negotiation Request Transmitted with Clinical Records',
      openNegotiationExpiryDate: 'Day 61: 30-Business-Day Negotiation Period Closes Unresolved',
      idrInitiationDeadlineDate: 'Day 65: Federal IDR Online Portal Initiation Submitted on Business Day 2',
    },
    briefExcerpts: [
      {
        heading: 'I. Inadequacy of Payer\'s Low-Acuity QPA',
        body: 'The payer\'s $1,850.00 QPA represents straightforward closed femoral shaft fractures treated in elective settings. The operative record demonstrates severe multi-fragmentary Winquist IV comminution with tissue contamination requiring extensive debridement and locked intramedullary nailing.',
      },
      {
        heading: 'II. Selection of Sovereign Offer',
        body: 'The provider\'s final offer of $5,200.00 accurately captures the acute surgical complexity and fellowship training of the trauma surgeon, and should be chosen under 45 CFR § 149.510.',
      },
    ],
  },
];
