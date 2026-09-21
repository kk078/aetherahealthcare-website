/**
 * Anatomical Atlas & Healthcare RCM Coding Matrix
 * Derived from Rohen, Yokochi, Lütjen-Drecoll: Color Atlas of Anatomy (7th Edition)
 * Purely for Medical Billing, Coding, and Revenue Cycle Management (RCM)
 */

export interface AnatomicalCode {
  code: string;
  system: 'CPT' | 'CDT' | 'HCPCS' | 'ICD-10';
  name: string;
  category: string;
  description: string;
  globalPeriod?: string; // 0-day, 10-day, 90-day, or XXX/ZZZ
  crossCodeNotice?: string;
}

export interface AnatomicalModifier {
  modifier: string;
  name: string;
  rule: string;
  attestationRequirement: string;
}

export interface AnatomicalSystem {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  rohenPages: string;
  dissectionFiguresCount: number;
  imagePath: string;
  anatomicalLandmarks: string[];
  clinicalOverview: string;
  codes: AnatomicalCode[];
  mandatoryModifiers: AnatomicalModifier[];
  ncciBundlingTrap: {
    ruleTitle: string;
    carcCode: string;
    conflictDescription: string;
    algorithmicDetection: string;
    humanResolution: string;
  };
  clinicalCaseScenario: {
    patientCondition: string;
    operativeFindings: string;
    unbundledAIFailure: string;
    certifiedHumanSignOff: string;
    financialVariance: string;
  };
  sovereignGateSignOff: {
    auditorCredentials: string;
    requiredDocumentation: string[];
    attestationStatement: string;
  };
}

export const ANATOMY_SYSTEMS: AnatomicalSystem[] = [
  {
    id: 'head-neck',
    chapterNumber: 2,
    title: 'Head, Craniofacial Skeleton & Cranial Nerves',
    subtitle: 'Maxillofacial, TMJ, Cranial Nerves V & VII, Sensory Organs & Dentition',
    rohenPages: 'Pages 19–186 (Sections 2.1–2.5)',
    dissectionFiguresCount: 312,
    imagePath: '/images/anatomy/head-neck-3d.jpg',
    anatomicalLandmarks: [
      'Calvaria, Orbit & Zygoma',
      'Temporomandibular Joint (Condyle, Disc, Ligaments)',
      'Trigeminal Nerve (CN V: V1 Ophthalmic, V2 Maxillary, V3 Mandibular)',
      'Facial Nerve (CN VII: Temporal, Zygomatic, Buccal, Mandibular, Cervical)',
      'Permanent Dentition & Alveolar Arches (Teeth 1–32)',
      'Carotid Sheath & Cervical Vertebrae (C1–C7)'
    ],
    clinicalOverview:
      'Craniofacial surgery and head/neck RCM require surgical precision across bony osteotomies, nerve branch blocks, and dental-to-medical cross-coding. Payers enforce strict documentation standards regarding facial nerve monitoring, bilateral TMJ procedures, and ophthalmic injection waste.',
    codes: [
      {
        code: '21010',
        system: 'CPT',
        name: 'Arthrotomy, Temporomandibular Joint',
        category: 'Musculoskeletal / Head Surgery',
        description: 'Surgical exploration, debridement, or joint mobilization of the TMJ.',
        globalPeriod: '90-day global'
      },
      {
        code: '21141',
        system: 'CPT',
        name: 'LeFort I Osteotomy, Single Piece',
        category: 'Maxillofacial Reconstruction',
        description: 'Transverse osteotomy of the midface with bone graft or rigid fixation for malocclusion or deformity.',
        globalPeriod: '90-day global'
      },
      {
        code: '64400',
        system: 'CPT',
        name: 'Injection, Anesthetic Agent; Trigeminal Nerve',
        category: 'Nervous System Somatic Block',
        description: 'Peripheral nerve block of any division of cranial nerve V (V1, V2, or V3).',
        globalPeriod: '0-day global'
      },
      {
        code: 'D7240',
        system: 'CDT',
        name: 'Removal of Impacted Tooth — Completely Bony',
        category: 'Oral & Maxillofacial Surgery',
        description: 'Most complex surgical impaction requiring mucosal incision, mucoperiosteal flap, and extensive ostectomy.',
        crossCodeNotice: 'Cross-codes to CPT 41899 or CMS-1500 with ICD-10 K01.1 when performed in ASC/Hospital under general anesthesia.'
      },
      {
        code: '67028',
        system: 'CPT',
        name: 'Intravitreal Injection of Pharmacologic Agent',
        category: 'Eye & Ocular Adnexa',
        description: 'Pars plana intravitreal injection of biologic agent (anti-VEGF) for macular degeneration or diabetic retinopathy.',
        globalPeriod: '0-day global'
      },
      {
        code: 'J9035',
        system: 'HCPCS',
        name: 'Injection, Bevacizumab, 10 mg',
        category: 'Ophthalmic / Oncology Biologic',
        description: 'Preservative-free anti-VEGF biologic. Mandates single-dose vial waste documentation via -JW/-JZ.'
      }
    ],
    mandatoryModifiers: [
      {
        modifier: '-RT / -LT',
        name: 'Laterality (Right / Left)',
        rule: 'Mandatory on all orbit, temporal bone, TMJ, and mandibular procedures to designate operative side.',
        attestationRequirement: 'Operative report must specify exact side; conflicting laterality triggers immediate CARC 16 denial.'
      },
      {
        modifier: '-50',
        name: 'Bilateral Procedure',
        rule: 'Appended when identical surgical or block procedures are performed on both left and right sides during the same operative session.',
        attestationRequirement: 'Both anatomical sites must be described in separate surgical paragraphs with independent findings.'
      },
      {
        modifier: '-E1 to -E4',
        name: 'Eyelid Identifiers',
        rule: '-E1 (Upper Left), -E2 (Lower Left), -E3 (Upper Right), -E4 (Lower Right). Mandatory on tarsal and blepharoplasty claims.',
        attestationRequirement: 'Photographic visual field obstruction must substantiate functional vs cosmetic medical necessity.'
      },
      {
        modifier: '-JW / -JZ',
        name: 'Drug Waste / Zero Waste Attestation',
        rule: 'CMS mandate: single-dose vial biologics must report -JW (discarded milligrams) or -JZ (zero waste).',
        attestationRequirement: 'Certified coder audits pharmacy draw log against CMS HCPCS billing units before submission.'
      }
    ],
    ncciBundlingTrap: {
      ruleTitle: 'Facial Nerve Neuromonitoring Bundled into Craniofacial Surgery',
      carcCode: 'CARC 97: Procedure bundled into primary surgical service',
      conflictDescription:
        'CPT 95940 (Continuous intraoperative neurophysiology monitoring) is automatically bundled by Medicare and commercial payers into major parotidectomy (42410-42426) or skull base craniotomies unless performed by an independent neurophysiologist in real time.',
      algorithmicDetection:
        'Algorithm detects CPT 95940 submitted with the same NPI as primary operating surgeon.',
      humanResolution:
        'Certified human coder removes 95940 if billed by surgeon, or ensures separate independent neuromonitoring provider group bills with modifier -26 and time-based documentation.'
    },
    clinicalCaseScenario: {
      patientCondition: 'Severe refractory left trigeminal neuralgia (V2/V3) with concurrent left impacted third molar pericoronitis.',
      operativeFindings: 'Left suboccipital craniectomy with microvascular decompression of cranial nerve V (61458), followed by surgical extraction of completely bony impacted tooth #17 (D7240).',
      unbundledAIFailure:
        'Generative AI assigned both procedures to medical billing without modifier -59, and failed to split dental hospital facility charges from surgical decompression, triggering total claim rejection ($14,200).',
      certifiedHumanSignOff:
        'Aethera CPC partitioned dental claim lines to CMS-1500 with ICD-10 K01.1 under general anesthesia justification, appended modifier -LT to 61458, and separated facility dental anesthesia codes.',
      financialVariance: '100% of allowed charges ($13,850) adjudicated clean within 14 days; zero audit clawbacks.'
    },
    sovereignGateSignOff: {
      auditorCredentials: 'AAPC CPC / COC (Certified Outpatient Coder)',
      requiredDocumentation: [
        'Pre-operative CT/MRI showing nerve compression or bone impaction',
        'Operative report specifying incision depth, facial nerve isolation, and closure',
        'Pathology / histology tissue confirmation report'
      ],
      attestationStatement:
        'I attest that I have reviewed the operative narrative, verified anatomical laterality, and substantiated that all unbundled modifier exceptions meet AMA/CMS medical necessity criteria.'
    }
  },
  {
    id: 'spine-trunk',
    chapterNumber: 3,
    title: 'Vertebral Column, Spinal Cord & Trunk',
    subtitle: 'Cervical, Thoracic & Lumbar Segments, Discs, Facet Joints & Abdominal Wall',
    rohenPages: 'Pages 187–242',
    dissectionFiguresCount: 148,
    imagePath: '/images/anatomy/spine-trunk-3d.jpg',
    anatomicalLandmarks: [
      'Cervical Vertebrae (C1–C7) & Lordotic Curve',
      'Thoracic Vertebrae (T1–T12) & Costovertebral Articulations',
      'Lumbar Vertebrae (L1–L5) & Intervertebral Discs',
      'Sacrum (S1) & Sacroiliac Articulation',
      'Spinal Cord (Conus Medullaris, Cauda Equina)',
      'Anterior Abdominal Wall Musculature & Inguinal Rings'
    ],
    clinicalOverview:
      'Spine surgery RCM represents the highest financial risk in orthopedic and neurosurgical billing. Add-on codes for multiple contiguous interspaces, anterior/posterior instrumentation, and interbody cages are heavily audited by Medicare Recovery Audit Contractors (RAC).',
    codes: [
      {
        code: '22551',
        system: 'CPT',
        name: 'Arthrodesis, Anterior Interbody, Cervical (ACDF); First Interspace',
        category: 'Spine Arthrodesis',
        description: 'Anterior cervical decompression and interbody fusion below C2; includes discectomy.',
        globalPeriod: '90-day global'
      },
      {
        code: '+22552',
        system: 'CPT',
        name: 'Arthrodesis, Anterior Interbody, Cervical; Each Additional Interspace',
        category: 'Spine Add-on',
        description: 'Add-on code reported in conjunction with primary 22551 for multi-level ACDF.',
        globalPeriod: 'ZZZ (Add-on)'
      },
      {
        code: '+22845',
        system: 'CPT',
        name: 'Anterior Instrumentation; 2 to 3 Vertebral Segments',
        category: 'Spine Instrumentation Add-on',
        description: 'Anterior plating or rigid spinal fixation spanning 2 to 3 contiguous vertebrae.',
        globalPeriod: 'ZZZ (Add-on)'
      },
      {
        code: '+22853',
        system: 'CPT',
        name: 'Insertion of Intervertebral Biomechanical Device(s) (e.g., PEEK cage)',
        category: 'Spine Device Add-on',
        description: 'Placement of synthetic cage or interbody spacer into intervertebral disc space.',
        globalPeriod: 'ZZZ (Add-on)'
      },
      {
        code: '64483',
        system: 'CPT',
        name: 'Transforaminal Epidural Injection; Lumbar/Sacral, Single Level',
        category: 'Interventional Spine',
        description: 'Fluoroscopically guided transforaminal epidural steroid injection (TFESI).',
        globalPeriod: '0-day global'
      },
      {
        code: '49593',
        system: 'CPT',
        name: 'Repair of Anterior Abdominal Hernia, Total Defect 1 cm to 4 cm',
        category: 'Abdominal Wall Surgery',
        description: '2023 AMA code: Open or laparoscopic repair of epigastric/umbilical/incisional hernia.',
        globalPeriod: '90-day global'
      }
    ],
    mandatoryModifiers: [
      {
        modifier: '-62',
        name: 'Two Surgeons (Co-Surgery)',
        rule: 'Mandatory when a neurosurgeon and an access surgeon (general/vascular) jointly perform anterior spine fusion.',
        attestationRequirement: 'Both surgeons must generate distinct dictated operative reports identifying their separate surgical tasks.'
      },
      {
        modifier: '-59 / -XS',
        name: 'Distinct Procedural Service / Separate Structure',
        rule: 'Used to report distinct spinal levels (e.g. cervical ACDF combined with separate lumbar decompression).',
        attestationRequirement: 'Documentation must demonstrate separate incisions or entirely non-contiguous anatomical levels.'
      },
      {
        modifier: '-22',
        name: 'Increased Procedural Services',
        rule: 'Severe scar tissue, altered spine anatomy, morbid obesity, or massive previous instrumentation requiring >50% extra surgical time.',
        attestationRequirement: 'Explicit operative paragraph detailing exact extra surgical minutes, blood loss, and surgical complexity factors.'
      }
    ],
    ncciBundlingTrap: {
      ruleTitle: 'Fluoroscopy Guidance Bundled into Transforaminal Epidural',
      carcCode: 'CARC 97: Fluoroscopic guidance bundled into base nerve injection',
      conflictDescription:
        'CPT 77003 (Fluoroscopic guidance for spinal injection) is an absolute NCCI column 1-2 edit when billed with transforaminal epidural 64483 or 64484. The injection descriptor already includes fluoroscopic guidance.',
      algorithmicDetection:
        'Scrubber flags CPT 77003 billed on the same date of service with CPT 64483.',
      humanResolution:
        'Certified coder automatically removes 77003 to prevent claim rejection or RAC recoupment, ensuring clean adjudication.'
    },
    clinicalCaseScenario: {
      patientCondition: 'C5-C6 and C6-C7 cervical spondylotic myelopathy with progressive upper extremity numbness.',
      operativeFindings: '2-level anterior cervical discectomy and fusion (ACDF) at C5-C6 and C6-C7, with PEEK cages and anterior 4-hole plate instrumentation.',
      unbundledAIFailure:
        'Generative AI billed CPT 22551 twice (unbundling base code instead of reporting add-on +22552) and attempted to bill operating microscope +69990 (which is prohibited under CMS NCCI for spinal fusions).',
      certifiedHumanSignOff:
        'Aethera Certified Coder restructured claim to CPT 22551 (first interspace C5-C6), +22552 (second interspace C6-C7), +22845 (instrumentation C5-C7), +22853 x2 (cages), and deleted the disallowed 69990.',
      financialVariance: 'Preserved $8,940 in compliant reimbursement while eliminating 100% of audit recoupment exposure.'
    },
    sovereignGateSignOff: {
      auditorCredentials: 'AAPC CPC / CIRCC / CASCC',
      requiredDocumentation: [
        'Pre-operative MRI/CT showing cervical nerve root or cord compression',
        'Operative report documenting exact disc spaces operated upon',
        'Implant invoice and post-operative radiographic verification'
      ],
      attestationStatement:
        'I verify that the operative report explicitly details each intervertebral interspace, that add-on codes are linked to the primary base code, and no bundled microscopic or guidance codes were submitted.'
    }
  },
  {
    id: 'cardiac-thorax',
    chapterNumber: 4,
    title: 'Thoracic Organs: Heart, Coronary Circulation & Lungs',
    subtitle: 'Coronary Arteries (LAD, LCx, RCA), Valves, Conduction System & Pulmonary Lobes',
    rohenPages: 'Pages 243–290',
    dissectionFiguresCount: 162,
    imagePath: '/images/anatomy/cardiac-thorax-3d.jpg',
    anatomicalLandmarks: [
      'Ascending Aorta & Pulmonary Artery',
      'Coronary Arteries: Left Anterior Descending (LAD), Left Circumflex (LCx), Right Coronary (RCA)',
      'Cardiac Valves: Mitral, Tricuspid, Aortic, Pulmonic',
      'Cardiac Conduction System: SA Node, AV Node, Bundle Branches',
      'Bronchial Tree & Bronchopulmonary Segments',
      'Right Lung (3 Lobes) & Left Lung (2 Lobes, Lingula)'
    ],
    clinicalOverview:
      'Cardiovascular and thoracic coding requires precise anatomical vessel tracking. Medicare and commercial payers reject claims that fail to specify exact coronary artery branch modifiers (-LD, -LC, -RC, -LM, -RI) or that improperly unbundle diagnostic angiograms from interventional stent placement.',
    codes: [
      {
        code: '92928',
        system: 'CPT',
        name: 'Percutaneous Transcatheter Placement of Intracoronary Stent; Single Major Vessel',
        category: 'Interventional Cardiology',
        description: 'Drug-eluting or bare metal stent placement in a single major coronary artery or branch.',
        globalPeriod: '0-day global'
      },
      {
        code: '+92929',
        system: 'CPT',
        name: 'Percutaneous Intracoronary Stent; Each Additional Branch',
        category: 'Cardiology Add-on',
        description: 'Stent placement in each additional branch of a major coronary artery.',
        globalPeriod: 'ZZZ (Add-on)'
      },
      {
        code: '93458',
        system: 'CPT',
        name: 'Left Heart Catheterization with Coronary Angiography',
        category: 'Diagnostic Cardiology',
        description: 'Retrograde left heart cath, ventriculography, and selective coronary angiography.',
        globalPeriod: '0-day global'
      },
      {
        code: '33533',
        system: 'CPT',
        name: 'Coronary Artery Bypass, Single Arterial Graft',
        category: 'Cardiothoracic Surgery (CABG)',
        description: 'Left internal mammary artery (LIMA) to LAD coronary artery bypass.',
        globalPeriod: '90-day global'
      },
      {
        code: '33208',
        system: 'CPT',
        name: 'Insertion of New or Replacement of Permanent Pacemaker with Transvenous Leads (Dual Chamber)',
        category: 'Cardiac Electrophysiology',
        description: 'Dual chamber pacemaker generator insertion with atrial and ventricular leads.',
        globalPeriod: '90-day global'
      },
      {
        code: '32480',
        system: 'CPT',
        name: 'Removal of Lung, Other than Total Pneumonectomy; Single Lobe (Lobectomy)',
        category: 'Pulmonary / Thoracic Surgery',
        description: 'Open surgical resection of single anatomical lobe of right or left lung.',
        globalPeriod: '90-day global'
      }
    ],
    mandatoryModifiers: [
      {
        modifier: '-LD',
        name: 'Left Anterior Descending Coronary Artery',
        rule: 'Mandatory on all percutaneous coronary interventions (PCI) involving the LAD.',
        attestationRequirement: 'Catheterization report must describe stenosis and stent deployment within the LAD.'
      },
      {
        modifier: '-LC',
        name: 'Left Circumflex Coronary Artery',
        rule: 'Mandatory on all PCI interventions involving the circumflex artery.',
        attestationRequirement: 'Angiographic measurements and post-stent lumen flow must be documented in the LCx.'
      },
      {
        modifier: '-RC',
        name: 'Right Coronary Artery',
        rule: 'Mandatory on all PCI interventions involving the right coronary artery.',
        attestationRequirement: 'Operative notes must clearly distinguish the RCA from the left coronary tree.'
      },
      {
        modifier: '-LM / -RI',
        name: 'Left Main / Ramus Intermedius',
        rule: 'Mandatory for interventions in the left main trunk (-LM) or ramus intermedius branch (-RI).',
        attestationRequirement: 'High-risk left main documentation requires explicit hemodynamic and bifurcation notes.'
      }
    ],
    ncciBundlingTrap: {
      ruleTitle: 'Diagnostic Left Heart Cath Unbundled during Staged PCI',
      carcCode: 'CARC 97 / NCCI Column 1-2 Edit',
      conflictDescription:
        'Billing diagnostic catheterization (93458) during a planned therapeutic stenting session (92928) is an illegal unbundle unless the diagnostic cath was performed to establish clinical necessity for the first time during the same session.',
      algorithmicDetection:
        'Scrubber checks prior encounter history: if diagnostic cath was performed 2 days earlier, 93458 on the day of PCI is flagged as an invalid unbundle.',
      humanResolution:
        'Certified coder verifies whether acute clinical deterioration occurred. If planned, coder suppresses 93458; if acute and distinct, appends modifier -XU with physician attestation.'
    },
    clinicalCaseScenario: {
      patientCondition: 'Acute coronary syndrome with 90% LAD lesion and 85% mid-RCA lesion.',
      operativeFindings: 'Primary drug-eluting stent deployed in LAD, followed by secondary drug-eluting stent in mid-RCA.',
      unbundledAIFailure:
        'Automated software submitted CPT 92928 twice without coronary vessel modifiers, triggering an immediate duplicate claim denial (CARC 18) for $12,400.',
      certifiedHumanSignOff:
        'Aethera CPC assigned 92928-LD for the primary LAD stent and +92929-RC for the secondary RCA stent, providing complete anatomical distinction.',
      financialVariance: 'Clean first-pass payment of $11,980 achieved in 11 days.'
    },
    sovereignGateSignOff: {
      auditorCredentials: 'AAPC CPC / CCC (Certified Cardiology Coder)',
      requiredDocumentation: [
        'Cath lab hemodynamics report and angiographic percent stenosis measurements',
        'Implant serial log: stent length, diameter, and drug coating',
        'Post-intervention TIMI flow score documentation'
      ],
      attestationStatement:
        'I attest that coronary artery branch modifiers accurately reflect the dissected vessels documented in the cath lab report and that all NCCI bundling guidelines have been complied with.'
    }
  },
  {
    id: 'abdominal',
    chapterNumber: 5,
    title: 'Abdominal Viscera: GI Tract, Hepatobiliary & Pancreas',
    subtitle: 'Stomach, Duodenum, Small Intestine, Colon, Liver Segments, Gallbladder & Pancreas',
    rohenPages: 'Pages 291–329',
    dissectionFiguresCount: 138,
    imagePath: '/images/anatomy/abdominal-organs-3d.jpg',
    anatomicalLandmarks: [
      'Stomach (Cardia, Fundus, Body, Pylorus)',
      'Duodenum (Bulb, C-Loop, Ligament of Treitz)',
      'Small Intestine (Jejunum, Ileum) & Mesentery',
      'Large Intestine (Cecum, Appendix, Ascending/Transverse/Descending/Sigmoid, Rectum)',
      'Liver (Couinaud Segments I–VIII) & Falciform Ligament',
      'Gallbladder (Fundus, Cystic Duct) & Common Bile Duct',
      'Pancreas (Head, Uncinate Process, Body, Tail)'
    ],
    clinicalOverview:
      'Gastrointestinal RCM demands strict adherence to mucosal lesion management rules. Billing snare polypectomy and biopsy on the same anatomical polyp is an illegal unbundle, while exploratory laparotomies are strictly bundled into major organ resections like the Whipple procedure.',
    codes: [
      {
        code: '45385',
        system: 'CPT',
        name: 'Colonoscopy with Removal of Tumor/Polyp by Snare Technique',
        category: 'Lower GI Endoscopy',
        description: 'Endoscopic evaluation of entire colon with snare resection of single or multiple polyps.',
        globalPeriod: '0-day global'
      },
      {
        code: '45380',
        system: 'CPT',
        name: 'Colonoscopy with Directed Biopsy, Single or Multiple',
        category: 'Lower GI Endoscopy',
        description: 'Endoscopy with cold or hot forceps biopsy of suspicious mucosa or polyp.',
        globalPeriod: '0-day global'
      },
      {
        code: '43239',
        system: 'CPT',
        name: 'Esophagogastroduodenoscopy (EGD) with Directed Biopsy',
        category: 'Upper GI Endoscopy',
        description: 'Upper endoscopy with biopsy of esophagus, stomach, and/or duodenum.',
        globalPeriod: '0-day global'
      },
      {
        code: '47562',
        system: 'CPT',
        name: 'Laparoscopy, Surgical; Cholecystectomy',
        category: 'Hepatobiliary Surgery',
        description: 'Laparoscopic excision of gallbladder without cholangiography.',
        globalPeriod: '90-day global'
      },
      {
        code: '48150',
        system: 'CPT',
        name: 'Pancreaticoduodenectomy (Whipple Procedure) with Pancreaticojejunostomy',
        category: 'Complex Pancreatic Surgery',
        description: 'Resection of pancreatic head, duodenum, partial gastrectomy, and cholecystectomy.',
        globalPeriod: '90-day global'
      }
    ],
    mandatoryModifiers: [
      {
        modifier: '-XS',
        name: 'Separate Structure',
        rule: 'Required when a polypectomy is performed in one anatomical section of the colon (e.g. cecum) and a biopsy in another (e.g. descending colon).',
        attestationRequirement: 'Operative dictation must record separate anatomical distances (in cm) and distinct pathology vials.'
      },
      {
        modifier: '-33',
        name: 'Preventive Services',
        rule: 'Appended when an asymptomatic screening colonoscopy converts to a diagnostic procedure upon finding and removing a polyp.',
        attestationRequirement: 'Waives patient copay/deductible under Affordable Care Act Section 2713.'
      },
      {
        modifier: '-22',
        name: 'Increased Procedural Service',
        rule: 'Dense inflammatory adhesions, morbid obesity, or hostile abdomen extending operative time by >50%.',
        attestationRequirement: 'Surgeon must dictate explicit operative note comparison of standard vs actual operative time and blood loss.'
      }
    ],
    ncciBundlingTrap: {
      ruleTitle: 'Polypectomy and Biopsy on the Same Anatomical Lesion',
      carcCode: 'CARC 97: Biopsy bundled into primary snare excision',
      conflictDescription:
        'CMS NCCI Chapter 6 rule: When a lesion is removed by snare (45385), a biopsy (45380) on that same lesion is bundled. Reporting both constitutes fraudulent unbundling unless performed on distinct lesions in separate colon segments.',
      algorithmicDetection:
        'Scrubber detects both 45385 and 45380 on the same date of service without modifier -XS.',
      humanResolution:
        'Certified coder reviews the pathology accession log: if one polyp is documented, coder deletes 45380; if two distinct lesions are proven, coder appends modifier -XS to 45380 with separate anatomical site documentation.'
    },
    clinicalCaseScenario: {
      patientCondition: '55-year-old undergoing routine screening colonoscopy.',
      operativeFindings: '12mm pedunculated polyp snared in the ascending colon; separate 4mm flat erythematous lesion biopsied in the rectum.',
      unbundledAIFailure:
        'Commercial billing software submitted 45385 and 45380 without modifiers, resulting in automatic denial of the biopsy line ($420) and improper patient deductible billing for the entire colonoscopy.',
      certifiedHumanSignOff:
        'Aethera CPC added modifier -33 to 45385 (protecting patient 100% preventive benefit) and appended modifier -XS to 45380 with pathology cross-references.',
      financialVariance: '100% allowed reimbursement ($1,860) collected with zero patient balance dispute.'
    },
    sovereignGateSignOff: {
      auditorCredentials: 'AAPC CPC / CGIC (Certified Gastroenterology Coder)',
      requiredDocumentation: [
        'Endoscopy report detailing anatomical landmarks (cecum, ileocecal valve, appendiceal orifice)',
        'Polyp measurement in millimeters, removal method, and exact location',
        'Pathology report correlating numbered specimen containers'
      ],
      attestationStatement:
        'I verify that the colonoscopy report documents visualization of the cecum, that multiple lesions were anatomically distinct, and modifier -33 correctly reflects preventive intent.'
    }
  },
  {
    id: 'urinary-pelvis',
    chapterNumber: 6,
    title: 'Retroperitoneal Organs & Pelvic Urogenital System',
    subtitle: 'Kidneys, Renal Pelvis, Ureters, Bladder, Prostate, Uterus, Fallopian Tubes & Ovaries',
    rohenPages: 'Pages 330–367',
    dissectionFiguresCount: 154,
    imagePath: '/images/anatomy/urinary-pelvis-3d.jpg',
    anatomicalLandmarks: [
      'Right & Left Kidneys (Renal Cortex, Medulla, Calyces)',
      'Renal Pelvis & Ureteropelvic Junction (UPJ)',
      'Abdominal & Pelvic Ureters',
      'Urinary Bladder (Detrusor Muscle, Trigone, Ureteral Orifices)',
      'Prostate Gland & Seminal Vesicles',
      'Uterus, Fallopian Tubes (Fimbriae, Ampulla) & Ovaries'
    ],
    clinicalOverview:
      'Urology and Gynecology coding involves complex anatomical staging and specimen weight stratifications. Bladder tumors are billed according to millimeter size tiers, while hysterectomy codes change dramatically if uterine specimen weight exceeds 250 grams.',
    codes: [
      {
        code: '52356',
        system: 'CPT',
        name: 'Cystourethroscopy with Ureteroscopy; with Lithotripsy and Indwelling Stent',
        category: 'Endourology / Stone Surgery',
        description: 'Laser or pneumatic lithotripsy of ureteral/renal calculus including double-J stent placement.',
        globalPeriod: '0-day global'
      },
      {
        code: '52234',
        system: 'CPT',
        name: 'Cystourethroscopy with Fulguration/Resection of Bladder Tumor; Small (0.5 to 2.0 cm)',
        category: 'Bladder Oncology (TURBT)',
        description: 'Transurethral resection of single or multiple small bladder tumors.',
        globalPeriod: '0-day global'
      },
      {
        code: '55866',
        system: 'CPT',
        name: 'Laparoscopy, Surgical; Radical Prostatectomy (Robotic Assisted)',
        category: 'Urologic Oncology',
        description: 'Robotic removal of prostate, seminal vesicles, with or without pelvic lymphadenectomy.',
        globalPeriod: '90-day global'
      },
      {
        code: '58571',
        system: 'CPT',
        name: 'Laparoscopic Total Hysterectomy (TLH); Uterus 250 g or Less',
        category: 'Gynecologic Surgery',
        description: 'Total laparoscopic removal of uterus and cervix weighing 250 grams or less.',
        globalPeriod: '90-day global'
      },
      {
        code: '58572',
        system: 'CPT',
        name: 'Laparoscopic Total Hysterectomy (TLH); Uterus Greater than 250 g',
        category: 'Gynecologic Surgery',
        description: 'Total laparoscopic hysterectomy for enlarged fibroid uterus weighing over 250 grams.',
        globalPeriod: '90-day global'
      }
    ],
    mandatoryModifiers: [
      {
        modifier: '-LT / -RT',
        name: 'Laterality (Left / Right Ureter / Kidney)',
        rule: 'Mandatory on all nephrectomy, ureteroscopy, and ovarian procedures to indicate operative side.',
        attestationRequirement: 'Must match diagnostic imaging and operative narrative.'
      },
      {
        modifier: '-50',
        name: 'Bilateral Procedure',
        rule: 'Mandatory when bilateral salpingo-oophorectomy or bilateral ureteral stents are placed.',
        attestationRequirement: 'Operative notes must detail separate bilateral catheterizations or resections.'
      }
    ],
    ncciBundlingTrap: {
      ruleTitle: 'Ureteral Stent Insertion Unbundled from Lithotripsy',
      carcCode: 'CARC 97: Stent insertion bundled into ureteroscopy lithotripsy',
      conflictDescription:
        'CPT 52332 (Indwelling ureteral stent insertion) is bundled into ureteroscopy stone extraction. Under CPT guidelines, code 52356 was created specifically to include both lithotripsy AND stent insertion. Submitting 52353 + 52332 is an illegal unbundle.',
      algorithmicDetection:
        'Scrubber detects concurrent billing of 52353 and 52332 on the same side.',
      humanResolution:
        'Certified coder consolidates the two codes into the comprehensive bundled code 52356 with modifier -LT or -RT.'
    },
    clinicalCaseScenario: {
      patientCondition: '47-year-old female with menorrhagia and extensive intramural uterine fibroids.',
      operativeFindings: 'Total laparoscopic hysterectomy and bilateral salpingectomy. Operative pathology specimen weighed 340 grams.',
      unbundledAIFailure:
        'Default hospital EHR automated biller coded CPT 58571 (Uterus 250g or less), forfeiting legitimate higher reimbursement for complex surgery ($1,450 variance).',
      certifiedHumanSignOff:
        'Aethera Coder reviewed surgical pathology gross dissection report, identified specimen weight of 340g, and recoded to CPT 58572 (Uterus >250g).',
      financialVariance: 'Captured additional $1,450 in clean, audit-defensible revenue.'
    },
    sovereignGateSignOff: {
      auditorCredentials: 'AAPC CPC / CUC (Certified Urology Coder)',
      requiredDocumentation: [
        'Pathology gross examination report with documented organ weight in grams',
        'Cystoscopy operative note with documented tumor sizes and margins',
        'Operative fluoroscopic images confirming bilateral or unilateral stent position'
      ],
      attestationStatement:
        'I confirm that pathology specimen weights have been validated against operative documentation and all endourology bundles comply with CMS CPT conventions.'
    }
  },
  {
    id: 'upper-limb',
    chapterNumber: 7,
    title: 'Upper Extremity: Shoulder, Arm, Wrist & Hand',
    subtitle: 'Rotator Cuff, Brachial Plexus, Carpal Tunnel, Median Nerve & Digits (I–V)',
    rohenPages: 'Pages 368–431',
    dissectionFiguresCount: 176,
    imagePath: '/images/anatomy/upper-limb-3d.jpg',
    anatomicalLandmarks: [
      'Shoulder Girdle (Clavicle, Scapula, Acromion)',
      'Rotator Cuff Musculature (Supraspinatus, Infraspinatus, Teres Minor, Subscapularis)',
      'Shaft of Humerus & Elbow Joint (Medial/Lateral Epicondyles)',
      'Forearm (Radius & Ulna) & Interosseous Membrane',
      'Carpal Tunnel (Flexor Retinaculum, Carpal Bones, Median Nerve)',
      'Hand Digits: Thumb (I), Index (II), Middle (III), Ring (IV), Little (V)'
    ],
    clinicalOverview:
      'Orthopedic upper extremity RCM requires digit-specific modifier reporting (-FA through -F9). Using generic right/left modifiers on finger procedures triggers automated clearinghouse rejections. In shoulder arthroscopy, subacromial decompression is strictly an add-on code (+29826).',
    codes: [
      {
        code: '29827',
        system: 'CPT',
        name: 'Arthroscopy, Shoulder, Surgical; with Rotator Cuff Repair',
        category: 'Shoulder Arthroscopy',
        description: 'Complete arthroscopic repair of torn supraspinatus/infraspinatus rotator cuff tendons.',
        globalPeriod: '90-day global'
      },
      {
        code: '+29826',
        system: 'CPT',
        name: 'Arthroscopy, Shoulder; Subacromial Decompression with Acromioplasty',
        category: 'Shoulder Add-on',
        description: 'Add-on code: Arthroscopic resection of anterior inferior acromion and release of coracoacromial ligament.',
        globalPeriod: 'ZZZ (Add-on)'
      },
      {
        code: '64721',
        system: 'CPT',
        name: 'Neuroplasty and/or Transposition; Median Nerve at Carpal Tunnel',
        category: 'Hand / Peripheral Nerve',
        description: 'Open surgical transection of transverse carpal ligament for carpal tunnel release.',
        globalPeriod: '90-day global'
      },
      {
        code: '26055',
        system: 'CPT',
        name: 'Tendon Sheath Incision (e.g., for Trigger Finger)',
        category: 'Hand / Digit Surgery',
        description: 'Surgical release of A1 pulley ligament for stenosing tenosynovitis.',
        globalPeriod: '90-day global'
      }
    ],
    mandatoryModifiers: [
      {
        modifier: '-FA to -F9',
        name: 'Digit-Specific Anatomical Modifiers',
        rule: 'Left Hand: -FA (Thumb), -F1 (Index), -F2 (Middle), -F3 (Ring), -F4 (Little). Right Hand: -F5 (Thumb), -F6 (Index), -F7 (Middle), -F8 (Ring), -F9 (Little).',
        attestationRequirement: 'Mandatory on all trigger finger, tendon repair, and digit fracture claims.'
      },
      {
        modifier: '-RT / -LT',
        name: 'Upper Extremity Laterality',
        rule: 'Required on all shoulder, arm, elbow, and wrist procedures.',
        attestationRequirement: 'Operative narrative must confirm operative side matching pre-op auth.'
      }
    ],
    ncciBundlingTrap: {
      ruleTitle: 'Subacromial Decompression Billed as Stand-Alone Procedure',
      carcCode: 'CARC 16: Add-on code billed without primary qualifying procedure',
      conflictDescription:
        'CPT +29826 was reclassified by the AMA as an add-on code. Billing it alone or with an invalid base code causes automatic rejection by all commercial and Medicare payers.',
      algorithmicDetection:
        'Scrubber flags +29826 billed without a qualifying primary base code (e.g. 29827, 29828).',
      humanResolution:
        'Certified coder verifies base rotator cuff repair (29827) is present, correctly linking the add-on code.'
    },
    clinicalCaseScenario: {
      patientCondition: 'Stenosing tenosynovitis (trigger finger) involving right thumb and right middle finger.',
      operativeFindings: 'Open surgical release of right thumb A1 pulley and right 3rd digit A1 pulley.',
      unbundledAIFailure:
        'Automated software billed CPT 26055 twice with generic modifier -RT, triggering denial for second line as duplicate billing.',
      certifiedHumanSignOff:
        'Aethera CPC submitted 26055-F5 (Right Thumb) and 26055-F7 (Right Middle Finger), fully compliant with CMS digit coding.',
      financialVariance: 'Both lines approved and paid in full ($1,620 combined).'
    },
    sovereignGateSignOff: {
      auditorCredentials: 'AAPC CPC / COSC (Certified Orthopedic Surgery Coder)',
      requiredDocumentation: [
        'Operative description detailing incision site and A1 pulley release for each specific digit',
        'Pre-operative conservative management documentation (splinting, steroid injections)',
        'Post-operative active motion assessment'
      ],
      attestationStatement:
        'I certify that individual anatomical digit modifiers (-FA to -F9) are assigned in strict accordance with the operative report and that all shoulder add-on codes are linked to approved base procedures.'
    }
  },
  {
    id: 'lower-limb',
    chapterNumber: 8,
    title: 'Lower Extremity: Pelvis, Hip, Knee & Foot',
    subtitle: 'Hip Arthroplasty, Knee Compartments, Menisci, Cruciate Ligaments, Ankle & Toes (I–V)',
    rohenPages: 'Pages 432–502',
    dissectionFiguresCount: 184,
    imagePath: '/images/anatomy/lower-limb-3d.jpg',
    anatomicalLandmarks: [
      'Pelvic Girdle & Acetabulum',
      'Femoral Head, Neck & Greater Trochanter',
      'Knee Joint: Patella, Medial & Lateral Compartments',
      'Knee Ligaments: Anterior Cruciate (ACL), Posterior Cruciate (PCL), Medial Meniscus, Lateral Meniscus',
      'Tibia, Fibula & Ankle Joint (Talocrural, Medial/Lateral Malleolus)',
      'Foot Bones (Calcaneus, Talus, Tarsals, Metatarsals) & Toes (Hallux, 2nd–5th Digits)'
    ],
    clinicalOverview:
      'Lower extremity RCM features the strictest NCCI compartmental bundling rules in surgery. Within the knee, billing meniscectomy and chondroplasty in the same compartment is an illegal unbundle. In podiatric surgery, toe-specific modifiers (-TA through -T9) are mandatory.',
    codes: [
      {
        code: '27447',
        system: 'CPT',
        name: 'Arthroplasty, Knee, Condyle and Plateau; Medical and Lateral Compartments (TKA)',
        category: 'Major Joint Replacement',
        description: 'Total knee replacement including patellar resurfacing and soft tissue balancing.',
        globalPeriod: '90-day global'
      },
      {
        code: '29881',
        system: 'CPT',
        name: 'Arthroscopy, Knee, Surgical; with Meniscectomy (Medial OR Lateral)',
        category: 'Knee Arthroscopy',
        description: 'Surgical excision of torn medial or lateral meniscus.',
        globalPeriod: '90-day global'
      },
      {
        code: '29880',
        system: 'CPT',
        name: 'Arthroscopy, Knee, Surgical; with Meniscectomy (Medial AND Lateral)',
        category: 'Knee Arthroscopy',
        description: 'Bicompartmental meniscectomy involving both medial and lateral tears.',
        globalPeriod: '90-day global'
      },
      {
        code: '29888',
        system: 'CPT',
        name: 'Arthroscopically Aided Anterior Cruciate Ligament (ACL) Reconstruction',
        category: 'Knee Ligament Reconstruction',
        description: 'ACL reconstruction with autograft (patellar/hamstring) or allograft.',
        globalPeriod: '90-day global'
      },
      {
        code: '28296',
        system: 'CPT',
        name: 'Correction, Hallux Valgus (Bunionectomy) with Metatarsal Osteotomy',
        category: 'Foot / Podiatric Surgery',
        description: 'Distal metatarsal chevron osteotomy with bunion excision and soft tissue release.',
        globalPeriod: '90-day global'
      }
    ],
    mandatoryModifiers: [
      {
        modifier: '-TA to -T9',
        name: 'Toe-Specific Anatomical Modifiers',
        rule: 'Left Foot: -TA (Great toe), -T1 (2nd), -T2 (3rd), -T3 (4th), -T4 (5th). Right Foot: -T5 (Great toe), -T6 (2nd), -T7 (3rd), -T8 (4th), -T9 (5th).',
        attestationRequirement: 'Mandatory for bunionette, hammertoe correction, and toe amputations.'
      },
      {
        modifier: '-RT / -LT',
        name: 'Lower Extremity Laterality',
        rule: 'Required on all hip, knee, and ankle procedures.',
        attestationRequirement: 'Operative note must match laterality specified in pre-authorization.'
      },
      {
        modifier: '-XS',
        name: 'Separate Anatomical Compartment',
        rule: 'Required to substantiate chondroplasty performed in a knee compartment distinct from the meniscectomy.',
        attestationRequirement: 'Surgeon must explicitly document debridement in patellofemoral compartment when meniscectomy is in medial compartment.'
      }
    ],
    ncciBundlingTrap: {
      ruleTitle: 'Same-Compartment Knee Debridement Bundled into Meniscectomy',
      carcCode: 'CARC 97: Debridement bundled into primary joint resection',
      conflictDescription:
        'Billing knee chondroplasty/debridement (29877) in the same compartment as a meniscectomy (29881) is an absolute NCCI unbundling violation. CMS guidelines prohibit reporting 29877 unless performed in an entirely separate compartment.',
      algorithmicDetection:
        'Scrubber checks operative text: if chondroplasty was performed on medial femoral condyle and medial meniscectomy was performed, unbundling is flagged.',
      humanResolution:
        'Certified coder suppresses 29877 if in medial compartment; if documented in patellofemoral compartment, coder appends modifier -XS with compartmental photos.'
    },
    clinicalCaseScenario: {
      patientCondition: 'Tear of medial meniscus with symptomatic grade 3 chondromalacia of the patellofemoral joint, left knee.',
      operativeFindings: 'Partial medial meniscectomy and mechanical chondroplasty of patellar articular cartilage.',
      unbundledAIFailure:
        'Generic billing bot submitted 29881-LT and 29877-LT without compartmental modifiers, causing an immediate denial of the $1,250 chondroplasty claim line.',
      certifiedHumanSignOff:
        'Aethera CPC reviewed arthroscopic still photos, confirmed patellofemoral location, and appended modifier -XS to 29877 with documented compartmental distinction.',
      financialVariance: 'Both procedure lines adjudicated clean, collecting full $4,150 fee schedule payment.'
    },
    sovereignGateSignOff: {
      auditorCredentials: 'AAPC CPC / COSC (Certified Orthopedic Surgery Coder)',
      requiredDocumentation: [
        'Arthroscopy operative narrative detailing each specific joint compartment (medial, lateral, patellofemoral)',
        'Pre-operative weight-bearing radiographs verifying grade of osteoarthritis',
        'Operative photos corroborating cartilage lesion grades'
      ],
      attestationStatement:
        'I attest that knee arthroscopy compartmental rules were strictly verified, that chondroplasty was substantiated in a separate compartment, and digit modifiers are anatomically precise.'
    }
  },
  {
    id: 'tissue-planes',
    chapterNumber: 1,
    title: 'General Anatomy: Tissue Planes & Excision Depths',
    subtitle: 'Epidermis, Dermis, Subcutaneous Adipose, Muscular Fascia & Bone Debridement Depths',
    rohenPages: 'Pages 1–18',
    dissectionFiguresCount: 78,
    imagePath: '/images/anatomy/tissue-planes-3d.jpg',
    anatomicalLandmarks: [
      'Epidermis (Stratum Corneum to Basale) — 0 mm to 1 mm',
      'Dermis (Papillary & Reticular Layers) — 1 mm to 3 mm',
      'Subcutaneous Adipose Tissue — 3 mm to 15 mm',
      'Deep Muscular Fascia (Investing Fascia) — Depth Boundary',
      'Skeletal Muscle Bundles & Epimysium',
      'Periosteum & Cortical Bone Interface'
    ],
    clinicalOverview:
      'Integumentary coding accuracy depends on mathematical excision margins and anatomical depth planes. Upcoding debridement to muscle or bone when only subcutaneous fat was debrided is one of the most common triggers for Department of Justice (DOJ) False Claims Act audits.',
    codes: [
      {
        code: '11042',
        system: 'CPT',
        name: 'Debridement, Subcutaneous Tissue; First 20 sq cm or Less',
        category: 'Integumentary Debridement',
        description: 'Surgical debridement of open wound down to, but not including, deep fascia or muscle.',
        globalPeriod: '0-day global'
      },
      {
        code: '11043',
        system: 'CPT',
        name: 'Debridement, Muscle and/or Fascia; First 20 sq cm or Less',
        category: 'Deep Wound Debridement',
        description: 'Surgical excision of non-viable deep fascia and skeletal muscle tissue.',
        globalPeriod: '0-day global'
      },
      {
        code: '11044',
        system: 'CPT',
        name: 'Debridement, Bone; First 20 sq cm or Less',
        category: 'Complex Bone Debridement',
        description: 'Surgical debridement and curettage of non-viable cortical or trabecular bone.',
        globalPeriod: '0-day global'
      },
      {
        code: '11604',
        system: 'CPT',
        name: 'Excision, Malignant Lesion, Trunk/Arms/Legs; Excised Diameter 3.1 to 4.0 cm',
        category: 'Malignant Lesion Excision',
        description: 'Full thickness excision of malignant lesion including narrowest surgical margins.',
        globalPeriod: '10-day global'
      },
      {
        code: '13101',
        system: 'CPT',
        name: 'Repair, Complex, Trunk; 2.6 cm to 7.5 cm',
        category: 'Complex Wound Closure',
        description: 'Layered closure involving debridement of wound margins, undermining, and retention sutures.',
        globalPeriod: '10-day global'
      }
    ],
    mandatoryModifiers: [
      {
        modifier: '-58',
        name: 'Staged or Related Procedure',
        rule: 'Required when a second debridement or delayed flap closure is planned during the initial post-operative period.',
        attestationRequirement: 'Operative note must document that subsequent debridement was planned prospectively.'
      },
      {
        modifier: '-79',
        name: 'Unrelated Procedure During Post-Operative Period',
        rule: 'Required when a new, unrelated lesion excision or debridement is performed during the global period of an earlier procedure.',
        attestationRequirement: 'Diagnosis codes must confirm an entirely unrelated clinical condition.'
      }
    ],
    ncciBundlingTrap: {
      ruleTitle: 'Simple Closure Bundled into Lesion Excision',
      carcCode: 'CARC 97: Simple wound repair bundled into primary excision',
      conflictDescription:
        'CPT codes 11400–11646 inherently include simple wound closure. Billing a separate simple repair code (12001–12021) with lesion excision is an unbundling violation. Only intermediate (layered) or complex closures can be reported separately.',
      algorithmicDetection:
        'Scrubber flags concurrent billing of 11604 and 12002 at the same anatomical site.',
      humanResolution:
        'Certified coder reviews the operative description: if layered deep dermal suturing is documented, coder upgrades closure to intermediate (12032); if simple closure was performed, simple code is removed.'
    },
    clinicalCaseScenario: {
      patientCondition: 'Chronic sacral pressure ulcer stage IV with osteomyelitis.',
      operativeFindings: 'Excisional debridement of 18 sq cm of necrotic skin, subcutaneous fat, gluteal fascia, and prominent sacral cortical bone.',
      unbundledAIFailure:
        'Automated biller submitted 11042, 11043, and 11044 together (unbundling every single tissue layer traversed), triggering immediate payer audit and 100% claim rejection for multi-layer unbundling.',
      certifiedHumanSignOff:
        'Aethera CPC corrected claim to report single deepest tissue level: CPT 11044 alone (Debridement, Bone), which subsumes the more superficial layers.',
      financialVariance: 'Prevented audit clawback and recouped clean allowable reimbursement ($480).'
    },
    sovereignGateSignOff: {
      auditorCredentials: 'AAPC CPC / CPMA (Certified Professional Medical Auditor)',
      requiredDocumentation: [
        'Wound measurement in square centimeters (length x width) prior to debridement',
        'Explicit description of instrument used (scalpel, curette, scissors) and depth reached',
        'Pathology or microbiological culture report confirming osteomyelitis or non-viable bone'
      ],
      attestationStatement:
        'I confirm that the documented tissue debridement depth reached bone, that area was measured in square centimeters, and no superficial layers were unbundled.'
    }
  }
];
