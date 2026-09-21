export interface DissectionLayerStep {
  layerNumber: number;
  layerName: string;
  depthMm: string;
  anatomicalStructures: string[];
  surgicalTechnique: string;
  cptRelevance: string;
}

export interface RohenMicroDissectionProfile {
  systemId: string;
  primaryHotspotId: string;
  procedureTitle: string;
  rohenCitation: {
    edition: string;
    chapterNumber: number;
    pages: string;
    dissectionPlates: string;
    keyFigureLabels: string[];
  };
  rvuEconomics: {
    primaryCpt: string;
    cptDescriptor: string;
    workRvu: number;
    peRvu: number;
    mpRvu: number;
    totalFacilityRvu: number;
    conversionFactor2026: number; // $32.35
    estimatedFacilityMedicarePayment: string;
    globalPeriod: '000' | '010' | '090' | 'XXX' | 'ZZZ';
    mueThreshold: number;
    addOnCodes: {
      code: string;
      descriptor: string;
      rvuImpact: string;
    }[];
  };
  tissuePlanes: DissectionLayerStep[];
  requiredDictationExcerpts: string[];
  payerAuditTripwires: string[];
  sovereignSignerSpec: {
    credential: string;
    title: string;
    statutoryLiability: string;
    verificationChecklist: string[];
  };
}

export const ROHEN_MICRO_DISSECTIONS: Record<string, RohenMicroDissectionProfile> = {
  'head-neck': {
    systemId: 'head-neck',
    primaryHotspotId: 'tmj-condyle',
    procedureTitle: 'Open Temporomandibular Joint Condylectomy & Disc Arthroplasty',
    rohenCitation: {
      edition: 'Rohen 7th Edition: Color Atlas of Anatomy',
      chapterNumber: 2,
      pages: 'Pages 54–62 (Sections 2.2.3 & 2.2.4)',
      dissectionPlates: 'Plate 2.14: Infratemporal Fossa & Plate 2.18: Deep Craniofacial Skeleton',
      keyFigureLabels: [
        'Condylus mandibulae (Head of mandible)',
        'Discus articularis (Articular fibrocartilage disc)',
        'Arteria maxillaris (Maxillary artery - pterygoid segment)',
        'Nervus auriculotemporalis (Auriculotemporal nerve)',
        'Ligamentum temporomandibulare (Lateral ligament)',
      ],
    },
    rvuEconomics: {
      primaryCpt: '21050',
      cptDescriptor: 'Condylectomy, temporomandibular joint (separate procedure)',
      workRvu: 14.82,
      peRvu: 8.94,
      mpRvu: 1.48,
      totalFacilityRvu: 25.24,
      conversionFactor2026: 32.35,
      estimatedFacilityMedicarePayment: '$816.51',
      globalPeriod: '090',
      mueThreshold: 2, // Bilateral max 2
      addOnCodes: [
        {
          code: '+20926',
          descriptor: 'Tissue graft, other (e.g. temporalis fascia harvest for interposition)',
          rvuImpact: '+6.12 Total RVUs ($197.98)',
        },
        {
          code: '21085',
          descriptor: 'Impression and custom interocclusal splint appliance',
          rvuImpact: '+4.55 Total RVUs ($147.19)',
        },
      ],
    },
    tissuePlanes: [
      {
        layerNumber: 1,
        layerName: 'Preauricular Cutaneous & Superficial Fascia',
        depthMm: '0 – 3 mm',
        anatomicalStructures: ['Integument', 'Superficial temporal fascia', 'Preauricular crease'],
        surgicalTechnique: 'Curvilinear incision anterior to the tragus carried through subdermal adipose.',
        cptRelevance: 'Incision and approach are bundled into CPT 21050; skin closure cannot be unbundled.',
      },
      {
        layerNumber: 2,
        layerName: 'Temporoparietal Fascia & Facial Nerve Margin',
        depthMm: '3 – 8 mm',
        anatomicalStructures: ['Temporoparietal fascia (TPF)', 'Frontal branch of CN VII', 'Superficial temporal vessels'],
        surgicalTechnique: 'Blunt dissection in the sub-TPF avascular plane to retract temporal branch of CN VII anteriorly.',
        cptRelevance: 'Facial nerve identification is inclusive. Never bill CPT 64716 with joint arthroplasty.',
      },
      {
        layerNumber: 3,
        layerName: 'Deep Temporal Fascia & Periosteal Reflection',
        depthMm: '8 – 14 mm',
        anatomicalStructures: ['Deep temporal fascia (intermediate layer)', 'Zygomatic arch periosteum'],
        surgicalTechnique: 'Incision through the superficial layer of deep temporal fascia down to periosteum of zygomatic arch.',
        cptRelevance: 'Subperiosteal tunnel creation substantiates major surgical package complexity.',
      },
      {
        layerNumber: 4,
        layerName: 'Articular Capsule & Glenoid Fossa Exposure',
        depthMm: '14 – 22 mm',
        anatomicalStructures: ['Capsula articularis', 'Discus articularis', 'Upper joint space'],
        surgicalTechnique: 'T-shaped capsular incision exposing superior and inferior joint compartments.',
        cptRelevance: 'Operative note must document entry into both compartments for arthroplasty.',
      },
      {
        layerNumber: 5,
        layerName: 'Mandibular Condyle & Pterygoid Insertion',
        depthMm: '22 – 32 mm',
        anatomicalStructures: ['Collum mandibulae', 'Pterygoideus lateralis insertion', 'Internal maxillary artery'],
        surgicalTechnique: 'Subcapsular reciprocating saw osteotomy of condylar neck; careful retraction protecting maxillary artery.',
        cptRelevance: 'Primary resection code 21050 fully substantiated.',
      },
    ],
    requiredDictationExcerpts: [
      '"Sub-TPF dissection performed preserving frontal branches of facial nerve."',
      '"Joint capsule entered through horizontal incision; articular disc inspected and mobilized."',
      '"Osteotomy of condylar neck completed under copious irrigation; bone edges smoothed with diamond burr."',
      '"Hemostasis confirmed in pterygoid venous plexus with bipolar cautery."',
    ],
    payerAuditTripwires: [
      'Payer bundles diagnostic arthroscopy (29800) into open condylectomy (21050) under NCCI PTP Column 2.',
      'Unbundling facial nerve monitoring (95940) by operating surgeon disallowed under CMS global surgery rules.',
      'Bilateral procedure requires Modifier -50 (150% payment rule) on commercial claims.',
    ],
    sovereignSignerSpec: {
      credential: 'COMSC / CPC (Oral & Maxillofacial / Craniofacial Coder)',
      title: 'AAPC Certified Maxillofacial Coding Specialist',
      statutoryLiability: 'Signs under 31 U.S.C. § 3729 attesting condylectomy was therapeutic, not cosmetic.',
      verificationChecklist: [
        'Confirm pre-op CT/MRI documents severe osteoarthritis or bony ankylosis (ICD-10 M26.621/M26.622).',
        'Verify separate operative site if temporalis fascia graft harvest (+20926) was performed.',
        'Validate tooth/jaw modifier (e.g. -RT, -LT, or -50) for unilateral vs bilateral condylectomy.',
        'Ensure cosmetic exclusion language is absent from EMR progress notes.',
      ],
    },
  },

  'spine-trunk': {
    systemId: 'spine-trunk',
    primaryHotspotId: 'l4-l5-disc',
    procedureTitle: 'Transforaminal Lumbar Interbody Fusion (TLIF) with Decompression & Instrumentation',
    rohenCitation: {
      edition: 'Rohen 7th Edition: Color Atlas of Anatomy',
      chapterNumber: 3,
      pages: 'Pages 198–244 (Sections 3.3 & 3.4)',
      dissectionPlates: 'Plate 3.12: Vertebral Canal & Cauda Equina; Plate 3.15: Lumbar Facet Anatomy',
      keyFigureLabels: [
        'Discus intervertebralis (Anulus fibrosus & Nucleus pulposus)',
        'Radix spinalis (L4 & L5 exiting and traversing nerve roots)',
        'Dura mater spinalis (Thecal sac)',
        'Ligamentum flavum (Yellow ligament)',
        'Processus articularis superior et inferior (Zygapophyseal joint)',
      ],
    },
    rvuEconomics: {
      primaryCpt: '22633',
      cptDescriptor: 'Arthrodesis, combined posterior or posterolateral technique with posterior interbody technique including laminectomy and/or discectomy, lumbar; single interspace',
      workRvu: 26.85,
      peRvu: 14.20,
      mpRvu: 3.82,
      totalFacilityRvu: 44.87,
      conversionFactor2026: 32.35,
      estimatedFacilityMedicarePayment: '$1,451.54',
      globalPeriod: '090',
      mueThreshold: 1,
      addOnCodes: [
        {
          code: '+22634',
          descriptor: 'Each additional interspace and segment (List separately in addition to code for primary procedure)',
          rvuImpact: '+18.42 Total RVUs ($595.89)',
        },
        {
          code: '+22842',
          descriptor: 'Posterior segmental instrumentation (e.g., pedicle screws, rods; 3 to 6 vertebral segments)',
          rvuImpact: '+16.80 Total RVUs ($543.48)',
        },
        {
          code: '+20930',
          descriptor: 'Allograft, structural or morselized, for spine arthrodesis only',
          rvuImpact: 'Packaged status in hospital; tracked for facility implant reimbursement',
        },
      ],
    },
    tissuePlanes: [
      {
        layerNumber: 1,
        layerName: 'Midline Dorsal Integument & Thoracolumbar Fascia',
        depthMm: '0 – 12 mm',
        anatomicalStructures: ['Cutis', 'Subcutis', 'Fascia thoracolumbalis posterior layer'],
        surgicalTechnique: 'Midline incision with electrocautery division through supraspinous ligament.',
        cptRelevance: 'Superficial exposure is bundled into 22633.',
      },
      {
        layerNumber: 2,
        layerName: 'Paraspinal Muscular Subperiosteal Detachment',
        depthMm: '12 – 35 mm',
        anatomicalStructures: ['M. multifidus', 'M. longissimus thoracis', 'Spinous processes L4-S1'],
        surgicalTechnique: 'Subperiosteal Cobb elevator elevation laterally to tips of transverse processes.',
        cptRelevance: 'Bilateral muscle release establishes base for posterolateral fusion bed.',
      },
      {
        layerNumber: 3,
        layerName: 'Interlaminar Window & Ligamentum Flavum Excision',
        depthMm: '35 – 45 mm',
        anatomicalStructures: ['Ligamentum flavum', 'Lamina L4 & L5', 'Superior articular process'],
        surgicalTechnique: 'Kerrison rongeur flavectomy and inferior facetectomy exposing thecal sac.',
        cptRelevance: 'Decompression at the fusion level is included in 22633; do not unbundle 63047 at L4-L5.',
      },
      {
        layerNumber: 4,
        layerName: 'Neural Foramen & Kambin Triangle Identification',
        depthMm: '45 – 52 mm',
        anatomicalStructures: ['Exiting nerve root L4', 'Traversing nerve root L5', 'Epidural venous plexus'],
        surgicalTechnique: 'Bipolar cauterization of epidural veins; gentle medial retraction of thecal sac.',
        cptRelevance: 'Distinct decompression at adjacent un-fused level requires CPT +63052 with Modifier -59.',
      },
      {
        layerNumber: 5,
        layerName: 'Intervertebral Disc Space & Endplate Preparation',
        depthMm: '52 – 62 mm',
        anatomicalStructures: ['Anulus fibrosus', 'Vertebral endplates L4-L5', 'PEEK/Titanium cage'],
        surgicalTechnique: 'Annulotomy, curettage of cartilaginous endplates without breaching subchondral bone; cage insertion.',
        cptRelevance: 'Interbody arthrodesis component of 22633 completed.',
      },
    ],
    requiredDictationExcerpts: [
      '"Subperiosteal dissection carried laterally to expose the transverse processes bilaterally."',
      '"Complete discectomy performed; cartilaginous endplates meticulously prepared down to bleeding subchondral bone."',
      '"Interbody spacer packed with autologous bone graft inserted under fluoroscopic visualization."',
      '"Pedicle screws placed bilaterally under navigation; final tightening torque confirmed."',
    ],
    payerAuditTripwires: [
      'Payer automated scrubbers deny unbundled laminectomy (63030/63047) billed at the same interspace as 22633 under NCCI PTP edit.',
      'Bone graft codes 20936/20930 denied if billed without primary spinal arthrodesis base code.',
      'Commercial payers require 6 weeks conservative management documentation in pre-service clinical notes.',
    ],
    sovereignSignerSpec: {
      credential: 'COSC / CPC (Certified Orthopedic Surgery Coder)',
      title: 'AAPC Certified Spine Coding Specialist',
      statutoryLiability: 'Personal attestation under False Claims Act preventing fraudulent unbundling of decompression.',
      verificationChecklist: [
        'Audit operative note to ensure decompression (63052) was performed at a non-fused level before appending -59.',
        'Verify exact number of interspaces instrumented matches add-on codes (+22634, +22842).',
        'Check implant log verifies FDA-approved interbody cage and pedicle screw serial numbers.',
        'Cross-check neuromonitoring technician note for independent continuous time logs.',
      ],
    },
  },

  'cardiac-thorax': {
    systemId: 'cardiac-thorax',
    primaryHotspotId: 'coronary-lad',
    procedureTitle: 'Coronary Artery Bypass Graft (CABG) with Left Internal Mammary Artery & Vein Grafts',
    rohenCitation: {
      edition: 'Rohen 7th Edition: Color Atlas of Anatomy',
      chapterNumber: 4,
      pages: 'Pages 260–304 (Sections 4.2 & 4.3)',
      dissectionPlates: 'Plate 4.8: Heart in Situ & Coronary Arteries; Plate 4.14: Thoracic Wall & Internal Mammary Artery',
      keyFigureLabels: [
        'Ramus interventricularis anterior (Left Anterior Descending - LAD)',
        'Arteria thoracica interna (Internal mammary / thoracic artery - LIMA)',
        'Vena cava superior & Aorta ascendens (Cannulation sites)',
        'Sinus coronarius (Coronary sinus)',
        'Ramus circumflexus (Circumflex branch of LCA)',
      ],
    },
    rvuEconomics: {
      primaryCpt: '33533',
      cptDescriptor: 'Coronary artery bypass, using arterial graft(s); single arterial graft',
      workRvu: 31.50,
      peRvu: 16.85,
      mpRvu: 4.60,
      totalFacilityRvu: 52.95,
      conversionFactor2026: 32.35,
      estimatedFacilityMedicarePayment: '$1,712.93',
      globalPeriod: '090',
      mueThreshold: 1,
      addOnCodes: [
        {
          code: '+33517',
          descriptor: 'Coronary artery bypass, using venous graft(s) and arterial graft(s); single vein graft (List separately in addition to code for primary procedure)',
          rvuImpact: '+4.15 Total RVUs ($134.25)',
        },
        {
          code: '+33518',
          descriptor: 'Two venous grafts in addition to primary arterial bypass',
          rvuImpact: '+7.80 Total RVUs ($252.33)',
        },
        {
          code: '35572',
          descriptor: 'Harvest of open saphenous vein graft for bypass (List separately)',
          rvuImpact: '+7.45 Total RVUs ($241.01)',
        },
      ],
    },
    tissuePlanes: [
      {
        layerNumber: 1,
        layerName: 'Median Sternotomy Cutaneous & Pectoral Fascia',
        depthMm: '0 – 8 mm',
        anatomicalStructures: ['Cutis', 'Pectoralis major sternal origin', 'Sternal periosteum'],
        surgicalTechnique: 'Midline longitudinal incision from sternal notch to xiphoid process.',
        cptRelevance: 'Standard sternotomy approach is bundled into 33533.',
      },
      {
        layerNumber: 2,
        layerName: 'Sternal Division & Anterior Mediastinum',
        depthMm: '8 – 22 mm',
        anatomicalStructures: ['Manubrium & Corpus sterni', 'Thymic remnants', 'Internal thoracic vessels'],
        surgicalTechnique: 'Midline oscillating sternal saw division; hemostasis with bone wax and electrocautery.',
        cptRelevance: 'Sternal re-entry for revision CABG requires CPT 33530.',
      },
      {
        layerNumber: 3,
        layerName: 'Internal Mammary Artery Pedicle Harvest',
        depthMm: '15 – 28 mm (lateral retrosternal)',
        anatomicalStructures: ['Left internal mammary artery (LIMA)', 'Endothoracic fascia', 'Intercostal branches'],
        surgicalTechnique: 'Skeletonized or pedicled mobilization of LIMA from 1st rib down to bifurcation.',
        cptRelevance: 'LIMA harvest is included in primary arterial code 33533; cannot bill 35572 for LIMA.',
      },
      {
        layerNumber: 4,
        layerName: 'Pericardial Sac & Cardiopulmonary Bypass Cannulation',
        depthMm: '28 – 45 mm',
        anatomicalStructures: ['Pericardium fibrosum', 'Ascending aorta', 'Right atrial appendage'],
        surgicalTechnique: 'Pericardiotomy; aortic pursestring and dual-stage venous cannulation to pump.',
        cptRelevance: 'Cardiopulmonary bypass is bundled into primary surgical package 33533.',
      },
      {
        layerNumber: 5,
        layerName: 'Epicardium & Coronary Arteriotomy',
        depthMm: '45 – 55 mm',
        anatomicalStructures: ['Epicardial adipose', 'LAD lumen', 'Obtuse marginal branch (OM1)'],
        surgicalTechnique: 'Micro-arteriotomy of LAD; end-to-side continuous 7-0/8-0 polypropylene anastomosis.',
        cptRelevance: 'Substantiates CPT 33533 for LIMA-to-LAD anastomosis.',
      },
    ],
    requiredDictationExcerpts: [
      '"LIMA harvested as a pedicle from origin to bifurcation with excellent pulsatile flow."',
      '"Ascending aorta and right atrium cannulated; cardiopulmonary bypass initiated smoothly."',
      '"LAD arteriotomy performed measuring 5 mm; LIMA spatulated and anastomosed with running 8-0 Prolene."',
      '"Transit-time Doppler flow probe demonstrated 48 mL/min with PI of 1.8 indicating patent anastomosis."',
    ],
    payerAuditTripwires: [
      'Billing venous graft only codes (33510-33516) when a LIMA graft was used triggers 100% denial; must use combo codes 33533 + 33517.',
      'Harvest of LIMA cannot be billed separately with 35500; 35500 is only for upper extremity vein harvest.',
      'Endoscopic vein harvest (33508) denied if documentation does not explicitly describe endoscopic video equipment.',
    ],
    sovereignSignerSpec: {
      credential: 'CCC / CPC (Certified Cardiothoracic Surgery Coder)',
      title: 'AAPC Certified Cardiothoracic Surgery Coder',
      statutoryLiability: 'Prevents systemic multi-vessel upcoding and arterial/venous combination code misclassification.',
      verificationChecklist: [
        'Confirm precise count of arterial grafts vs venous grafts from bypass log.',
        'Verify separate operative report for saphenous vein harvest if billed with 35572/33508.',
        'Check cardiopulmonary bypass perfusion record confirms cross-clamp and pump times.',
        'Cross-reference post-operative ICU transfer documentation.',
      ],
    },
  },
};

ROHEN_MICRO_DISSECTIONS['abdominal'] = {
  systemId: 'abdominal',
  primaryHotspotId: 'pancreas-head',
  procedureTitle: 'Pancreaticoduodenectomy (Whipple Procedure) with Regional Lymphadenectomy',
  rohenCitation: {
    edition: 'Rohen 7th Edition: Color Atlas of Anatomy',
    chapterNumber: 5,
    pages: 'Pages 310–358 (Sections 5.2 & 5.3)',
    dissectionPlates: 'Plate 5.12: Duodenum, Pancreas & Bile Ducts; Plate 5.16: Celiac Trunk & Superior Mesenteric Vessels',
    keyFigureLabels: [
      'Caput pancreatis (Head of pancreas)',
      'Ductus choledochus (Common bile duct)',
      'Vena portae hepatis (Hepatic portal vein)',
      'Arteria mesenterica superior (SMA)',
      'Ampulla hepatopancreatica (Vater)',
    ],
  },
  rvuEconomics: {
    primaryCpt: '48150',
    cptDescriptor: 'Pancreatectomy, proximal subtotal with total duodenectomy, partial gastrectomy, choledochoenterostomy and gastrojejunostomy (Whipple-type procedure); with pancreatoenterostomy',
    workRvu: 48.20,
    peRvu: 24.80,
    mpRvu: 6.95,
    totalFacilityRvu: 79.95,
    conversionFactor2026: 32.35,
    estimatedFacilityMedicarePayment: '$2,586.38',
    globalPeriod: '090',
    mueThreshold: 1,
    addOnCodes: [
      {
        code: '+38747',
        descriptor: 'Abdominal lymphadenectomy, regional, including celiac, gastric, portal, and peripancreatic nodes (List separately)',
        rvuImpact: '+12.40 Total RVUs ($401.14)',
      },
      {
        code: '35221',
        descriptor: 'Repair blood vessel, direct; intra-abdominal (e.g. portal vein resection/reconstruction)',
        rvuImpact: '+32.10 Total RVUs ($1,038.44)',
      },
    ],
  },
  tissuePlanes: [
    {
      layerNumber: 1,
      layerName: 'Upper Midline or Chevron Abdominal Wall Incision',
      depthMm: '0 – 25 mm',
      anatomicalStructures: ['Cutis', 'Linea alba', 'Peritoneum parietale'],
      surgicalTechnique: 'Midline incision carried from xiphoid to below umbilicus entering peritoneal cavity.',
      cptRelevance: 'Abdominal entry and exploration are bundled into 48150.',
    },
    {
      layerNumber: 2,
      layerName: 'Kocher Maneuver & Retroperitoneal Mobilization',
      depthMm: '25 – 65 mm',
      anatomicalStructures: ['Duodenum pars descendens', 'Fascia of Treitz', 'Inferior vena cava', 'Left renal vein'],
      surgicalTechnique: 'Extensive incising of lateral duodenal peritoneal reflection mobilizing head of pancreas off IVC.',
      cptRelevance: 'Kocherization is inclusive in standard Whipple resection package.',
    },
    {
      layerNumber: 3,
      layerName: 'Porta Hepatis & Biliary Tree Skeletonization',
      depthMm: '45 – 75 mm',
      anatomicalStructures: ['Common hepatic duct', 'Proper hepatic artery', 'Portal vein trunk'],
      surgicalTechnique: 'Ligation of gastroduodenal artery (GDA); transection of common hepatic duct above cystic duct junction.',
      cptRelevance: 'Choledochoenterostomy reconstruction is covered by 48150.',
    },
    {
      layerNumber: 4,
      layerName: 'Pancreatic Neck Tunneling & Division',
      depthMm: '60 – 85 mm',
      anatomicalStructures: ['Pancreatic neck', 'Superior mesenteric vein (SMV)', 'Confluence of SMV-splenic vein'],
      surgicalTechnique: 'Blunt creation of retropancreatic tunnel over SMV/portal vein; division of pancreatic neck.',
      cptRelevance: 'If portal vein invasion requires resection and patch/graft, bill 35221 with Modifier -59.',
    },
    {
      layerNumber: 5,
      layerName: 'Three-Part Reconstruction (Pancreas, Bile Duct, Stomach)',
      depthMm: '30 – 80 mm',
      anatomicalStructures: ['Proximal jejunum', 'Duct of Wirsung', 'Hepatic duct', 'Stomach antrum'],
      surgicalTechnique: 'End-to-side duct-to-mucosa pancreaticojejunostomy, end-to-side hepaticojejunostomy, and gastrojejunostomy.',
      cptRelevance: 'All three anastomoses are bundled into CPT 48150.',
    },
  ],
  requiredDictationExcerpts: [
    '"Extensive Kocher maneuver performed exposing the inferior vena cava and left renal vein."',
    '"GDA identified, test-clamped confirming hepatic artery pulsation, and doubly ligated."',
    '"Pancreatic neck transected with cold scalpel; frozen section margin sent and confirmed negative for adenocarcinoma."',
    '"Duct-to-mucosa pancreaticojejunostomy constructed with interrupted 5-0 PDS over a pediatric feeding tube stent."',
  ],
  payerAuditTripwires: [
    'Unbundling cholecystectomy (47600) is strictly prohibited under NCCI PTP edit; gallbladder removal is an inclusive component of 48150.',
    'Gastrojejunostomy (43820) cannot be billed separately; it is named in the CPT descriptor of 48150.',
    'Pylorus-preserving Whipple requires CPT 48153 instead of 48150.',
  ],
  sovereignSignerSpec: {
    credential: 'CGSC / CPC (Certified General Surgery Coder)',
    title: 'AAPC Certified Surgical Coding Specialist',
    statutoryLiability: 'Prevents systemic unbundling of cholecystectomy and bowel anastomoses under 31 U.S.C. § 3729.',
    verificationChecklist: [
      'Verify pathology report matches margins and confirms diagnosis (ICD-10 C25.0 malignant neoplasm of head of pancreas).',
      'Confirm whether pylorus was preserved (CPT 48153) or resected with partial gastrectomy (CPT 48150).',
      'Check if vascular graft or patch angioplasty (+35221) was performed for portal vein involvement.',
      'Ensure cholecystectomy was not separately line-itemed.',
    ],
  },
};

ROHEN_MICRO_DISSECTIONS['urinary-pelvis'] = {
  systemId: 'urinary-pelvis',
  primaryHotspotId: 'prostate-plexus',
  procedureTitle: 'Robotic-Assisted Laparoscopic Radical Prostatectomy with Pelvic Lymphadenectomy',
  rohenCitation: {
    edition: 'Rohen 7th Edition: Color Atlas of Anatomy',
    chapterNumber: 6,
    pages: 'Pages 370–412 (Sections 6.2 & 6.3)',
    dissectionPlates: 'Plate 6.10: Pelvic Cavity in Male; Plate 6.14: Neurovascular Bundle & Denonvilliers Fascia',
    keyFigureLabels: [
      'Prostata & Vesicula seminalis',
      'Plexus venosus prostaticus (Santorini plexus)',
      'Nervi splanchnici pelvici (Cavernous neurovascular bundle)',
      'Ductus deferens & Ureter pelvinus',
      'Musculus levator ani & Diaphragma urogenitale',
    ],
  },
  rvuEconomics: {
    primaryCpt: '55866',
    cptDescriptor: 'Laparoscopy, surgical prostatectomy, retropubic radical, including nerve sparing, includes robotic assistance when performed',
    workRvu: 28.50,
    peRvu: 15.20,
    mpRvu: 3.90,
    totalFacilityRvu: 47.60,
    conversionFactor2026: 32.35,
    estimatedFacilityMedicarePayment: '$1,539.86',
    globalPeriod: '090',
    mueThreshold: 1,
    addOnCodes: [
      {
        code: '+38571',
        descriptor: 'Laparoscopy, surgical; with bilateral total pelvic lymphadenectomy',
        rvuImpact: '+18.15 Total RVUs ($587.15)',
      },
    ],
  },
  tissuePlanes: [
    {
      layerNumber: 1,
      layerName: 'Transperitoneal Robotic Trocar Placement',
      depthMm: '0 – 40 mm',
      anatomicalStructures: ['Abdominal wall', 'Peritoneum', 'Retropubic space of Retzius'],
      surgicalTechnique: '6-port transperitoneal robotic access; bladder dropped by incising urachus and obliterated umbilical arteries.',
      cptRelevance: 'Robotic port placement and robotic guidance code (S2900) are bundled by Medicare.',
    },
    {
      layerNumber: 2,
      layerName: 'Endopelvic Fascia Incision & Puboprostatic Ligaments',
      depthMm: '35 – 55 mm',
      anatomicalStructures: ['Fascia endopelvina', 'Ligamenta puboprostatica', 'Levator ani fibers'],
      surgicalTechnique: 'Bilateral opening of endopelvic fascia; puboprostatic ligaments divided.',
      cptRelevance: 'Included in radical prostatectomy base code 55866.',
    },
    {
      layerNumber: 3,
      layerName: 'Santorini Venous Plexus Ligation & Apical Dissection',
      depthMm: '45 – 65 mm',
      anatomicalStructures: ['Dorsal venous complex (DVC)', 'Urethral sphincter', 'Apex of prostate'],
      surgicalTechnique: 'Cold division of DVC after suture suspension; precise urethral transection preserving external sphincter length.',
      cptRelevance: 'Urethral division and sphincter sparing included.',
    },
    {
      layerNumber: 4,
      layerName: 'Neurovascular Bundle (NVB) Sparing Plane',
      depthMm: '50 – 70 mm',
      anatomicalStructures: ['Cavernous nerves', 'Prostatic capsule', 'Denonvilliers fascia'],
      surgicalTechnique: 'Interfascial or intrafascial athermal dissection peeling posterolateral neurovascular bundles off prostate capsule.',
      cptRelevance: 'Nerve-sparing is explicitly included in the descriptor for 55866; cannot bill 64716.',
    },
    {
      layerNumber: 5,
      layerName: 'Urethrovesical Anastomosis (Van Velthoven Reconstruction)',
      depthMm: '40 – 60 mm',
      anatomicalStructures: ['Bladder neck', 'Urethral stump', 'Foley catheter (18 Fr)'],
      surgicalTechnique: 'Running barbed suture 360-degree watertight urethrovesical anastomosis.',
      cptRelevance: 'Anastomosis and catheter insertion are bundled into 55866.',
    },
  ],
  requiredDictationExcerpts: [
    '"Space of Retzius developed dropping bladder to expose puboprostatic ligaments bilaterally."',
    '"Dorsal venous complex ligated with 2-0 Vicryl and divided with cold robotic shears."',
    '"Bilateral nerve-sparing performed in the intrafascial plane preserving cavernous bundles."',
    '"Watertight urethrovesical anastomosis constructed with running 3-0 V-Loc; bladder filled with 180 cc saline confirming no leak."',
  ],
  payerAuditTripwires: [
    'Billing HCPCS S2900 (Robotic surgical technique) to Medicare triggers automatic statutory denial (status code B/E).',
    'Unbundling cystoscopy (52000) performed at conclusion of prostatectomy to check anastomosis is prohibited under NCCI.',
    'Pelvic lymph node dissection requires CPT 38571 with documented nodal counts and regional packets.',
  ],
  sovereignSignerSpec: {
    credential: 'CUC / CPC (Certified Urology Coder)',
    title: 'AAPC Certified Urology Coding Specialist',
    statutoryLiability: 'Attests to medical necessity of bilateral lymphadenectomy vs diagnostic biopsy.',
    verificationChecklist: [
      'Verify pathology report details Gleason score and clinical stage (ICD-10 C61).',
      'Confirm pelvic lymph node dissection documentation describes obturator and external iliac nodal boundaries.',
      'Ensure robotic instrumentation add-on charges are correctly billed to commercial payers with prior contract authorization.',
      'Check post-op Foley catheter insertion was not line-itemed.',
    ],
  },
};

ROHEN_MICRO_DISSECTIONS['upper-limb'] = {
  systemId: 'upper-limb',
  primaryHotspotId: 'median-nerve-ct',
  procedureTitle: 'Open Carpal Tunnel Release with Extensive Neurolysis & Tenosynovectomy',
  rohenCitation: {
    edition: 'Rohen 7th Edition: Color Atlas of Anatomy',
    chapterNumber: 7,
    pages: 'Pages 430–476 (Sections 7.3 & 7.4)',
    dissectionPlates: 'Plate 7.16: Carpal Tunnel & Deep Palmar Spaces; Plate 7.20: Palmar Neurovascular Arches',
    keyFigureLabels: [
      'Nervus medianus & Ramus recurrens (Thenar motor branch)',
      'Retinaculum flexorum (Transverse carpal ligament)',
      'Tendines musculorum flexorum digitorum superficialis et profundi',
      'Arcus palmaris superficialis et profundus',
      'Canalis carpi (Bony boundaries: Scaphoid, Trapezium, Hamate, Pisiform)',
    ],
  },
  rvuEconomics: {
    primaryCpt: '64721',
    cptDescriptor: 'Neuroplasty and/or transposition; median nerve at carpal tunnel',
    workRvu: 6.80,
    peRvu: 4.95,
    mpRvu: 0.90,
    totalFacilityRvu: 12.65,
    conversionFactor2026: 32.35,
    estimatedFacilityMedicarePayment: '$409.23',
    globalPeriod: '090',
    mueThreshold: 2, // Bilateral max 2
    addOnCodes: [
      {
        code: '29848',
        descriptor: 'Endoscopy, wrist, surgical, with release of transverse carpal ligament (Alternative approach)',
        rvuImpact: 'Alternative primary code (7.25 Total RVUs)',
      },
      {
        code: '25111',
        descriptor: 'Excision of ganglion cyst, wrist; flexor tendon sheath (If concurrent separate lesion)',
        rvuImpact: '+8.10 Total RVUs ($262.04)',
      },
    ],
  },
  tissuePlanes: [
    {
      layerNumber: 1,
      layerName: 'Palmar Cutaneous & Longitudinal Palmar Crease',
      depthMm: '0 – 2 mm',
      anatomicalStructures: ['Cutis', 'Palmaris brevis fibers', 'Palmar cutaneous branch of median nerve (PCBMN)'],
      surgicalTechnique: 'Curvilinear incision in line with radial border of ring finger to avoid PCBMN.',
      cptRelevance: 'Superficial skin incision is bundled into 64721.',
    },
    {
      layerNumber: 2,
      layerName: 'Palmar Aponeurosis & Distal Forearm Fascia',
      depthMm: '2 – 4 mm',
      anatomicalStructures: ['Aponeurosis palmaris', 'Superficial palmar fascia'],
      surgicalTechnique: 'Sharp longitudinal split of palmar fascia under direct loupe magnification.',
      cptRelevance: 'Fascial divide bundled into carpal tunnel release.',
    },
    {
      layerNumber: 3,
      layerName: 'Transverse Carpal Ligament (Flexor Retinaculum)',
      depthMm: '4 – 7 mm',
      anatomicalStructures: ['Retinaculum flexorum', 'Superficial palmar arterial arch margin'],
      surgicalTechnique: 'Complete longitudinal divide of transverse carpal ligament from distal margin proximal into forearm fascia.',
      cptRelevance: 'Primary mechanical release defining CPT 64721.',
    },
    {
      layerNumber: 4,
      layerName: 'Median Nerve Epineurium & Recurrent Motor Branch',
      depthMm: '7 – 12 mm',
      anatomicalStructures: ['Median nerve trunk', 'Thenar motor branch (extraligamentous / subligamentous)'],
      surgicalTechnique: 'Micro-inspection of median nerve; epineurotomy/internal neurolysis if fibrosis is documented.',
      cptRelevance: 'Internal neurolysis requiring operating microscope may support CPT 64727 with -59.',
    },
    {
      layerNumber: 5,
      layerName: 'Flexor Tendon Sheaths & Carpal Bony Bed',
      depthMm: '12 – 18 mm',
      anatomicalStructures: ['Flexor digitorum tendons', 'Vagina tendinum', 'Volar carpal ligaments'],
      surgicalTechnique: 'Inspection of tenosynovium; flexor synovectomy performed if rheumatoid hypertrophy present.',
      cptRelevance: 'Tenosynovectomy (25115) can only be unbundled if significant pathologic synovitis is proven.',
    },
  ],
  requiredDictationExcerpts: [
    '"Longitudinal incision placed in palmar crease protecting the palmar cutaneous nerve branch."',
    '"Transverse carpal ligament completely divided under direct vision out to distal fat pad."',
    '"Recurrent thenar motor branch identified arising extraligamentous and protected."',
    '"Median nerve inspected demonstrating visible hour-glass constriction with immediate release."',
  ],
  payerAuditTripwires: [
    'Billing internal neurolysis (64727) routinely with standard carpal tunnel release triggers immediate RAC clawback; operating microscope note required.',
    'Modifier -50 required for bilateral carpal tunnel release performed under same anesthesia.',
    'Endoscopic release (29848) and open release (64721) are mutually exclusive on same wrist.',
  ],
  sovereignSignerSpec: {
    credential: 'COSC / CPC (Hand & Upper Extremity Specialist)',
    title: 'AAPC Certified Hand Surgery Coder',
    statutoryLiability: 'Protects against unbundled neurolysis and unauthorized bilateral modifier misuse.',
    verificationChecklist: [
      'Confirm pre-operative EMG / nerve conduction study confirms severe carpal tunnel syndrome (ICD-10 G56.01/G56.02).',
      'Verify whether open (64721) or endoscopic (29848) technique was documented.',
      'Check anatomical side modifier (-RT, -LT, or -50) matches surgical consent and site marking.',
      'Audit operative note for documentation of operating microscope if 64727 is billed.',
    ],
  },
};

ROHEN_MICRO_DISSECTIONS['lower-limb'] = {
  systemId: 'lower-limb',
  primaryHotspotId: 'femoral-triangle',
  procedureTitle: 'Femoral-Popliteal Bypass with Autologous Reversed Greater Saphenous Vein',
  rohenCitation: {
    edition: 'Rohen 7th Edition: Color Atlas of Anatomy',
    chapterNumber: 8,
    pages: 'Pages 488–534 (Sections 8.2 & 8.3)',
    dissectionPlates: 'Plate 8.12: Femoral Triangle (Scarpa) & Plate 8.16: Popliteal Fossa Anatomy',
    keyFigureLabels: [
      'Arteria femoralis communis, superficialis & profunda',
      'Vena femoralis & Vena saphena magna (Cribriform fascia)',
      'Nervus femoralis & Ramus saphenus',
      'Canalis adductorius (Hunter canal)',
      'Arteria poplitea (Trifurcation branches)',
    ],
  },
  rvuEconomics: {
    primaryCpt: '35556',
    cptDescriptor: 'Bypass graft, with vein; femoral-popliteal',
    workRvu: 24.80,
    peRvu: 14.20,
    mpRvu: 3.65,
    totalFacilityRvu: 42.65,
    conversionFactor2026: 32.35,
    estimatedFacilityMedicarePayment: '$1,379.73',
    globalPeriod: '090',
    mueThreshold: 1,
    addOnCodes: [
      {
        code: '+35572',
        descriptor: 'Harvest of open greater saphenous vein graft for bypass (When harvested through separate incisions)',
        rvuImpact: '+7.45 Total RVUs ($241.01)',
      },
      {
        code: '35226',
        descriptor: 'Repair blood vessel, direct; neck/extremity (If concurrent patch angioplasty needed)',
        rvuImpact: '+18.60 Total RVUs ($601.71)',
      },
    ],
  },
  tissuePlanes: [
    {
      layerNumber: 1,
      layerName: 'Groin & Popliteal Integumentary Incisions',
      depthMm: '0 – 10 mm',
      anatomicalStructures: ['Cutis', 'Camper and Scarpa subcutaneous adipose layers'],
      surgicalTechnique: 'Longitudinal groin incision over common femoral pulse; medial infracondylar popliteal exposure.',
      cptRelevance: 'Surgical approach bundled into primary bypass code 35556.',
    },
    {
      layerNumber: 2,
      layerName: 'Fascia Lata & Cribriform Fascia Opening',
      depthMm: '10 – 22 mm',
      anatomicalStructures: ['Fascia lata', 'Fascia cribrosa', 'Saphenofemoral junction'],
      surgicalTechnique: 'Incision through fascia lata directly over femoral sheath; ligation of circumflex and pudendal branches.',
      cptRelevance: 'Vascular dissection bundled into 35556.',
    },
    {
      layerNumber: 3,
      layerName: 'Common, Superficial & Deep Femoral Artery Isolation',
      depthMm: '22 – 38 mm',
      anatomicalStructures: ['CFA', 'SFA', 'Profunda femoris artery', 'Femoral nerve branches'],
      surgicalTechnique: 'Vessel loops placed around CFA, SFA, and profunda; systemic heparinization (80 units/kg).',
      cptRelevance: 'Heparin administration and vessel control inclusive.',
    },
    {
      layerNumber: 4,
      layerName: 'Saphenous Vein Tunneling & Hydrostatic Preparation',
      depthMm: 'Subfascial or Subcutaneous Tunnel',
      anatomicalStructures: ['Vena saphena magna', 'Adductor canal', 'Sartorius muscle'],
      surgicalTechnique: 'Vein harvested, distended with heparinized saline; tunneled in anatomical sub-sartorial plane.',
      cptRelevance: 'Vein preparation and tunneling covered under 35556; harvest code 35572 tracked separately.',
    },
    {
      layerNumber: 5,
      layerName: 'Proximal & Distal Micro-Vascular Anastomoses',
      depthMm: '35 – 55 mm',
      anatomicalStructures: ['Arterial inflow (CFA)', 'Arterial outflow (Popliteal artery above/below knee)'],
      surgicalTechnique: 'End-to-side running 6-0 polypropylene anastomoses; intraoperative completion Doppler/angiogram.',
      cptRelevance: 'Completion angiogram (75710) billable with Modifier -59 only if performed for documented complication.',
    },
  ],
  requiredDictationExcerpts: [
    '"Longitudinal incision placed over femoral pulse; common, superficial, and profunda femoral arteries controlled."',
    '"Greater saphenous vein harvested, gently distended under low pressure, and all side branches doubly ligated."',
    '"Subfascial tunnel created traversing the popliteal fossa without twisting or kinking."',
    '"Proximal and distal anastomoses constructed with running 6-0 Prolene; strong triphasic Doppler signals verified in pedal vessels."',
  ],
  payerAuditTripwires: [
    'Bypass using prosthetic graft (e.g. PTFE/Dacron) requires CPT 35656 instead of vein code 35556; using wrong code triggers recoupment.',
    'Diagnostic angiography (75710) bundled if performed purely for completion assessment without documented problem.',
    'Post-operative thrombectomy within 90 days requires Modifier -78 (unplanned return to OR).',
  ],
  sovereignSignerSpec: {
    credential: 'CCVTC / CPC (Certified Cardiovascular & Thoracic Coder)',
    title: 'AAPC Certified Vascular Coding Specialist',
    statutoryLiability: 'Prevents autologous vein vs synthetic prosthetic graft misrepresentation under 31 U.S.C. § 3729.',
    verificationChecklist: [
      'Confirm graft material: Autologous vein (35556) vs synthetic PTFE/Dacron (35656).',
      'Verify distal anastomosis level: Above knee vs below knee popliteal artery.',
      'Check whether separate harvest incision (+35572) was documented for saphenous vein.',
      'Audit completion arteriogram documentation before appending modifier to diagnostic radiology codes.',
    ],
  },
};

ROHEN_MICRO_DISSECTIONS['tissue-planes'] = {
  systemId: 'tissue-planes',
  primaryHotspotId: 'periosteum-stratum',
  procedureTitle: 'Complex Surgical Excisional Debridement of Necrotizing Fasciitis to Bone',
  rohenCitation: {
    edition: 'Rohen 7th Edition: Color Atlas of Anatomy',
    chapterNumber: 1,
    pages: 'Pages 2–16 (General Anatomy & Tissue Stratification)',
    dissectionPlates: 'Plate 1.2: General Organization of Integument & Deep Fascia; Plate 1.6: Muscle Septa & Periosteum',
    keyFigureLabels: [
      'Epidermis & Dermis (Stratum corneum to reticulare)',
      'Tela subcutanea (Hypodermis / Adipose strata)',
      'Fascia muscularis profunda (Deep investing fascia)',
      'Epimysium & Perimysium (Striated muscle fascicles)',
      'Periosteum & Subchondral cortex',
    ],
  },
  rvuEconomics: {
    primaryCpt: '11044',
    cptDescriptor: 'Debridement, bone (includes epidermis, dermis, subcutaneous tissue, muscle and/or fascia, if performed); first 20 sq cm or less',
    workRvu: 5.10,
    peRvu: 3.45,
    mpRvu: 0.65,
    totalFacilityRvu: 9.20,
    conversionFactor2026: 32.35,
    estimatedFacilityMedicarePayment: '$297.62',
    globalPeriod: '000',
    mueThreshold: 1,
    addOnCodes: [
      {
        code: '+11047',
        descriptor: 'Debridement, bone; each additional 20 sq cm, or part thereof (List separately in addition to code for primary procedure)',
        rvuImpact: '+3.15 Total RVUs ($101.90)',
      },
      {
        code: '97605',
        descriptor: 'Negative pressure wound therapy (NPWT/wound vac) placement, non-durable medical equipment',
        rvuImpact: '+1.10 Total RVUs ($35.59)',
      },
    ],
  },
  tissuePlanes: [
    {
      layerNumber: 1,
      layerName: 'Epidermal & Dermal Necrosis Excision',
      depthMm: '0 – 2.5 mm',
      anatomicalStructures: ['Stratum corneum', 'Stratum spinosum', 'Dermis reticulare'],
      surgicalTechnique: 'Sharp scalpel excision of devitalized, non-blanching, necrotic integumentary margins.',
      cptRelevance: 'Superficial debridement (11042) is bundled into deepest layer code 11044.',
    },
    {
      layerNumber: 2,
      layerName: 'Subcutaneous Adipose Liquefaction Debridement',
      depthMm: '2.5 – 12 mm',
      anatomicalStructures: ['Subcutaneous adipose lobules', 'Superficial veins', 'Subdermal lymphatic plexus'],
      surgicalTechnique: 'Radical excision of gray, non-viable, dishwater-fluid infiltrated adipose down to fascia.',
      cptRelevance: 'Subcutaneous debridement (11042) included; cannot bill 11042 and 11044 together on same wound.',
    },
    {
      layerNumber: 3,
      layerName: 'Deep Fascial Investing Envelope Excision',
      depthMm: '12 – 22 mm',
      anatomicalStructures: ['Fascia profunda', 'Intermuscular septa'],
      surgicalTechnique: 'Complete fasciectomy of infected, dusky fascial sheets until healthy bleeding fascia identified.',
      cptRelevance: 'Fascial debridement (11043) is bundled into bone debridement 11044.',
    },
    {
      layerNumber: 4,
      layerName: 'Myonecrosis Resection & Muscle Fascicle Curettage',
      depthMm: '22 – 40 mm',
      anatomicalStructures: ['Epimysium', 'Striated muscle belly'],
      surgicalTechnique: 'Serial sharp debridement of non-contractile, dusky muscle fibers using electrocautery and curette.',
      cptRelevance: 'Muscle debridement (11043) included in bone debridement 11044.',
    },
    {
      layerNumber: 5,
      layerName: 'Cortical Bone Burr & Periosteal Decortication',
      depthMm: '40 – 55 mm',
      anatomicalStructures: ['Periosteum', 'Cortex osseus', 'Medullary canal margin'],
      surgicalTechnique: 'Decortication of necrotic, unviable cortical bone using high-speed diamond burr and bone curette until punctate bleeding.',
      cptRelevance: 'Substantiates highest complexity CPT 11044.',
    },
  ],
  requiredDictationExcerpts: [
    '"Wound measured 45 cm² with purulent drainage and non-viable devitalized tissue extending into cortical bone."',
    '"Excised all necrotic skin, subcutaneous fat, and fascia; non-viable muscle resected until contractile bleeding tissue seen."',
    '"Cortical bone debrided with sharp curette and burr until punctate bleeding was achieved across 28 cm² of bone surface."',
    '"Post-debridement surface area measured and verified; wound packed open with negative pressure sponge."',
  ],
  payerAuditTripwires: [
    'Summing wound depths across separate anatomical wounds into a single debridement line is prohibited; code deepest level per wound.',
    'Surface area (sq cm) must be explicitly recorded before and after debridement; missing dimensions trigger 100% technical denial.',
    'Debridement of bone cannot be billed if physician only scraped superficial bone without cortical removal.',
  ],
  sovereignSignerSpec: {
    credential: 'CGSC / CPCD (Certified Surgical / Dermatology Coder)',
    title: 'AAPC Certified Debridement & Wound Care Specialist',
    statutoryLiability: 'Guarantees compliance with CMS LCD L35125 preventing false bone debridement upcoding.',
    verificationChecklist: [
      'Confirm operative dictation states bone was debrided (cortical bone removal, curettage, or burring).',
      'Verify wound measurements in square centimeters (sq cm) to calculate add-on codes (+11047).',
      'Ensure multiple wounds on separate anatomical sites use Modifier -59 or -XS.',
      'Validate that wound photography and clinical notes document medical necessity (ICD-10 M86 osteomyelitis / I96 gangrene).',
    ],
  },
};
