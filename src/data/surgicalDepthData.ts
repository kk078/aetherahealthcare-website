export interface ProcedureDepthProfile {
  primaryCpt: string;
  addlCpt?: string;
  codeLabel: string;
  globalDays: string;
  workRvu: number;
  medicareAllowable: string;
  cmsCoverageGuideline: string;
  operativeDictationRequirement: string;
  aiFailureMode: string;
  humanSignerCredential: string;
  carcCode: string;
}

export interface DepthStratum {
  id: string;
  stratumNumber: number;
  name: string;
  anatomicalPlane: string;
  depthRangeMm: [number, number]; // [min, max]
  depthDisplay: string;
  histologicalComposition: string;
  surgicalSignificance: string;
  colorClass: string;
  accentHex: string;
  procedures: {
    debridement: ProcedureDepthProfile;
    tumorExcision: ProcedureDepthProfile;
    incisionDrainage: ProcedureDepthProfile;
    woundRepair: ProcedureDepthProfile;
  };
  interactiveDictationCheck: {
    compliantPhrase: string;
    compliantOutcome: string;
    nonCompliantPhrase: string;
    nonCompliantOutcome: string;
    auditPenaltyRisk: string;
  };
}

export const SURGICAL_DEPTH_DOMAINS = [
  { id: 'debridement', label: 'Wound Debridement & Excavation', icon: 'Scissors' },
  { id: 'tumorExcision', label: 'Soft Tissue Mass & Tumor Excision', icon: 'Layers' },
  { id: 'incisionDrainage', label: 'Incision & Drainage (I&D)', icon: 'Activity' },
  { id: 'woundRepair', label: 'Surgical Wound Closure & Planes', icon: 'Maximize2' },
] as const;

export type SurgicalDomainId = typeof SURGICAL_DEPTH_DOMAINS[number]['id'];

export const HISTOLOGICAL_STRATA: DepthStratum[] = [
  {
    id: 'stratum-1',
    stratumNumber: 1,
    name: 'Epidermis & Dermis',
    anatomicalPlane: 'Superficial Cutaneous Mantle (Stratified Squamous & Dermal Matrix)',
    depthRangeMm: [0, 3],
    depthDisplay: '0.0 mm – 3.0 mm',
    histologicalComposition:
      'Keratinized stratified squamous epithelium (stratum corneum, lucidum, granulosum, spinosum, basale) resting upon papillary and reticular dermis composed of type I/III collagen fibrils, elastic fibers, and microvascular capillary loops.',
    surgicalSignificance:
      'Superficial debridement and simple layered closures reside strictly within this boundary. Crossing the dermal-subcutaneous junction fundamentally shifts billing classification from nursing/wound care to surgical excision.',
    colorClass: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    accentHex: '#F59E0B',
    procedures: {
      debridement: {
        primaryCpt: '97597',
        addlCpt: '97598',
        codeLabel: 'Debridement, open wound (e.g., fibrin, devitalized epidermis/dermis), first 20 sq cm',
        globalDays: '0-Day Global',
        workRvu: 0.58,
        medicareAllowable: '$84.60',
        cmsCoverageGuideline:
          'CMS IOM Pub. 100-04, Chapter 12, § 40.1: Governed by active wound care management. Limited to skin and epidermis/dermis removal; does not extend into subcutaneous fat.',
        operativeDictationRequirement:
          '"Selective debridement of devitalized epidermis and sloughing hyperkeratotic dermis using waterjet/curette until healthy bleeding dermal papillae reached. Subcutaneous fat was not involved."',
        aiFailureMode:
          'Autonomous LLMs mistake "sharp removal of yellow fibrinous exudate" for surgical subcutaneous debridement (11042), upcoding the claim by 45% and triggering automated OIG audit flags.',
        humanSignerCredential: 'CWCA (Certified Wound Care Associate) / CPC',
        carcCode: 'CO-97 (Procedure bundled into standard E/M) or CO-151 (Medical necessity denied for surgical level)',
      },
      tumorExcision: {
        primaryCpt: '11400–11646',
        codeLabel: 'Excision of Benign / Malignant Lesion (Cutaneous only, including margins)',
        globalDays: '0-Day Global',
        workRvu: 1.12,
        medicareAllowable: '$134.20',
        cmsCoverageGuideline:
          'CPT Surgical Coding Guidelines: Measured by excised diameter including narrowest margins. Excision confined to full-thickness dermis; does not involve subcutaneous tissue.',
        operativeDictationRequirement:
          '"Full thickness skin excision including epidermis and full dermis with 3 mm margins measured prior to excision. Specimen pinned and oriented for histopathology."',
        aiFailureMode:
          'Generative AI frequently fails to calculate excised lesion diameter (lesion + 2x margin) and attempts to unbundle simple closure (12001) which is bundled under NCCI Column 1.',
        humanSignerCredential: 'CPC / Dermatology Specialist Coder',
        carcCode: 'CO-97 (Inclusive procedure: simple closure cannot be billed separately with lesion excision)',
      },
      incisionDrainage: {
        primaryCpt: '10060',
        codeLabel: 'Incision and drainage of abscess; simple or single (Cutaneous/subcutaneous)',
        globalDays: '0-Day Global',
        workRvu: 1.54,
        medicareAllowable: '$126.80',
        cmsCoverageGuideline:
          'CMS LCD L34024: Requires documentation of frank purulent material drained from epidermal/dermal or superficial subcutaneous space without complex loculation breakdown or packing.',
        operativeDictationRequirement:
          '"No. 11 scalpel used to make a 1.0 cm linear incision over the maximal point of fluctuance. 4 cc of purulent exudate expressed; cavity irrigated with sterile saline."',
        aiFailureMode:
          'AI assigns complicated I&D code 10061 whenever notes mention "gauze placed," failing to verify true ribbon gauze wound packing or septal loculation breakdown.',
        humanSignerCredential: 'CPC / CEDC (Certified Emergency Department Coder)',
        carcCode: 'CO-16 (Claim lacks documentation substantiating complicated I&D criteria)',
      },
      woundRepair: {
        primaryCpt: '12001',
        addlCpt: '12002–12021',
        codeLabel: 'Simple repair of superficial wounds of scalp, neck, axillae, trunk, or extremities; 2.5 cm or less',
        globalDays: '0-Day Global',
        workRvu: 0.95,
        medicareAllowable: '$98.40',
        cmsCoverageGuideline:
          'CPT Manual Repair Guidelines: Used when the wound involves primarily epidermis or dermis, or subcutaneous tissue without significant involvement of deeper tissues, requiring simple one-layer closure.',
        operativeDictationRequirement:
          '"Wound irrigated and closed with 4-0 Ethilon interrupted simple sutures re-approximating the epidermal-dermal edges without tension in a single layer."',
        aiFailureMode:
          'Autonomous tools code intermediate repair (12031) simply because the physician used two sutures, failing to establish true multi-layered anatomical fascial closure.',
        humanSignerCredential: 'CPC (Certified Professional Coder)',
        carcCode: 'CO-151 (Payment adjusted because documentation does not support intermediate layered closure)',
      },
    },
    interactiveDictationCheck: {
      compliantPhrase:
        'Sharp curettage of non-viable epidermis and superficial reticular dermis until pinpoint bleeding noted; depth did not reach adipose tissue.',
      compliantOutcome: 'CPT 97597 correctly substantiated. 100% clean claim approval across all Medicare Administrative Contractors.',
      nonCompliantPhrase:
        'Wound was cleaned sharply with scalpel to remove dead skin. Dressing applied.',
      nonCompliantOutcome:
        'Immediate denial CO-16: Missing anatomical tissue depth, surface area measurement in sq cm, and instruments used.',
      auditPenaltyRisk: 'Clawback of total professional fee + $12,500 False Claims Act penalty if billed as 11042.',
    },
  },
  {
    id: 'stratum-2',
    stratumNumber: 2,
    name: 'Subcutaneous Adipose Tissue',
    anatomicalPlane: 'Hypodermal Adipose Architecture & Superficial Fascia (Camper / Scarpa Planes)',
    depthRangeMm: [3, 18],
    depthDisplay: '3.0 mm – 18.0 mm',
    histologicalComposition:
      'Unilocular adipocytes clustered into distinct lobules separated by fibrous retinacula cutis septa, containing the superficial neurovascular plexus, lymphatic collectors, and superficial fascial condensations.',
    surgicalSignificance:
      'The gateway to formal surgical debridement (CPT 11042). Billing at this level requires unmistakable operative narrative proof of yellow adipose excision down to viable margins.',
    colorClass: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
    accentHex: '#EAB308',
    procedures: {
      debridement: {
        primaryCpt: '11042',
        addlCpt: '11045',
        codeLabel: 'Debridement, subcutaneous tissue (includes epidermis and dermis, if performed); first 20 sq cm or less',
        globalDays: '0-Day Global',
        workRvu: 1.50,
        medicareAllowable: '$148.50',
        cmsCoverageGuideline:
          'CMS IOM Pub. 100-04, Ch. 12, § 40.1 & LCD 38904: Debridement must physically extend into and excise subcutaneous adipose tissue. Surface area (sq cm) must be documented post-debridement.',
        operativeDictationRequirement:
          '"Sharp scalpel excision carried through non-viable dermis directly into devitalized subcutaneous adipose tissue. Necrotic yellowish fat excised until viable, uniform bleeding subcutaneous fat visualized across a 15 sq cm area."',
        aiFailureMode:
          'AI assigns 11042 without verifying the post-debridement wound dimensions in square centimeters or unbundles separate E/M without genuine Modifier -25 documentation.',
        humanSignerCredential: 'CGSC (Certified General Surgery Coder) / CPC',
        carcCode: 'CO-97 (NCCI edit failure when billed concurrently with lesion excisions in adjacent sites)',
      },
      tumorExcision: {
        primaryCpt: '21930',
        codeLabel: 'Excision, tumor, soft tissue of back or flank, subcutaneous; less than 3 cm',
        globalDays: '90-Day Global',
        workRvu: 4.88,
        medicareAllowable: '$395.20',
        cmsCoverageGuideline:
          'Musculoskeletal Section Guidelines: Applies to tumors originating in or confined to subcutaneous tissue superficial to deep muscular fascia. Code choice governed by gross tumor diameter.',
        operativeDictationRequirement:
          '"Dissection carried through dermis into subcutaneous fat. A well-circumscribed 2.4 cm lipomatous mass was dissected off surrounding subcutaneous fat. Deep muscular fascia was inspected and remained intact."',
        aiFailureMode:
          'Autonomous models confuse "subcutaneous lipoma" with "subfascial mass" (21931), improperly upcoding to a code paying 65% higher RVUs and triggering an automatic pre-payment medical review.',
        humanSignerCredential: 'CGSC / CPC',
        carcCode: 'CO-151 (Pre-payment medical review clawback for lack of operative confirmation of subfascial plane)',
      },
      incisionDrainage: {
        primaryCpt: '10061',
        codeLabel: 'Incision and drainage of abscess; complicated or multiple (Subcutaneous space)',
        globalDays: '0-Day Global',
        workRvu: 2.76,
        medicareAllowable: '$218.40',
        cmsCoverageGuideline:
          'CMS Manual 100-04: Requires documentation of multiple incisions, breakdown of internal fibrous loculations, insertion of continuous drains, or extensive iodoform ribbon gauze packing.',
        operativeDictationRequirement:
          '"A 3 cm incision made over fluctuant subcutaneous mass. Hemostat introduced to bluntly disrupt multiple dense fibrous loculations and septae. 25 cc foul pus evacuated; cavity packed with 1/4-inch iodoform gauze."',
        aiFailureMode:
          'AI blindly accepts coder suggestions for 10061 on simple boils where only a simple wick was placed, violating CMS definition of complicated packing.',
        humanSignerCredential: 'CEDC / CPC',
        carcCode: 'CO-151 (Downgraded to simple I&D 10060 upon commercial payer audit)',
      },
      woundRepair: {
        primaryCpt: '12031',
        addlCpt: '12032–12057',
        codeLabel: 'Repair, intermediate, wounds of scalp, axillae, trunk and/or extremities; 2.5 cm or less',
        globalDays: '0-Day Global',
        workRvu: 2.10,
        medicareAllowable: '$186.70',
        cmsCoverageGuideline:
          'CPT Manual Definition: Requires layered closure of one or more deeper layers of subcutaneous tissue and superficial (non-muscle) fascia, in addition to the skin.',
        operativeDictationRequirement:
          '"Subcutaneous adipose layer and superficial fascia approximated with interrupted 3-0 Vicryl buried sutures to obliterate dead space. Epidermis closed with running 4-0 Monocryl subcuticular suture."',
        aiFailureMode:
          'AI misses intermediate repair when doctor writes "closed in layers" without specifying the buried absorbable sutures in the subcutaneous stratum.',
        humanSignerCredential: 'CPC',
        carcCode: 'CO-16 (Missing documentation of distinct anatomical closure strata)',
      },
    },
    interactiveDictationCheck: {
      compliantPhrase:
        'Necrotic subcutaneous fat was excised with Metzenbaum scissors down to clean, glistening, healthy bleeding adipose tissue across 18 sq cm.',
      compliantOutcome: 'CPT 11042 successfully authenticated. Medical necessity fully defensible under CMS LCD 38904.',
      nonCompliantPhrase:
        'Ulcer was debrided deep into tissue until clean. Patient tolerated well.',
      nonCompliantOutcome:
        'Immediate denial CO-151: "deep into tissue" is medically ambiguous and fails statutory subcutaneous definition.',
      auditPenaltyRisk: '100% payment denial on Medicare post-payment audit.',
    },
  },
  {
    id: 'stratum-3',
    stratumNumber: 3,
    name: 'Deep Muscular Fascia',
    anatomicalPlane: 'Deep Investing Aponeurotic Fascia (Fascia Lata, Crural, Rectus Sheath Planes)',
    depthRangeMm: [18, 25],
    depthDisplay: '18.0 mm – 25.0 mm',
    histologicalComposition:
      'High-tensile dense regular connective tissue arranged in tight orthogonal sheets of parallel collagen bundles (aponeurotic fascia), containing sensory mechanoreceptors, pacinian corpuscles, and compartment perforator arteries.',
    surgicalSignificance:
      'The critical legal demarcation line between Integumentary procedures (10000 series) and Musculoskeletal procedures (20000 series). Crossing this glistening white plane escalates RVU valuation significantly.',
    colorClass: 'text-teal-300 border-teal-500/40 bg-teal-500/10',
    accentHex: '#14B8A6',
    procedures: {
      debridement: {
        primaryCpt: '11043',
        addlCpt: '11046',
        codeLabel: 'Debridement, muscle and/or fascia (includes epidermis, dermis, and subcutaneous tissue, if performed); first 20 sq cm',
        globalDays: '0-Day Global',
        workRvu: 3.42,
        medicareAllowable: '$274.90',
        cmsCoverageGuideline:
          'CMS IOM Pub. 100-04, Ch. 12, § 40.1: Must document explicit sharp debridement of deep investing muscular fascia. Debridement of superficial fascia does NOT qualify for 11043.',
        operativeDictationRequirement:
          '"The deep investing muscular fascia was incised; non-viable, dusky, non-elastic fascial margins sharply debrided with tenotomy scissors until glistening, pristine white viable fibrous fascia visualized."',
        aiFailureMode:
          'AI misinterprets "Scarpa\'s fascia" in abdominal debridement as deep fascia, billing 11043 instead of 11042. Scarpa\'s fascia is histologically superficial fascia, leading to mandatory refund demands.',
        humanSignerCredential: 'CGSC (Certified General Surgery Coder)',
        carcCode: 'CO-97 (Overpayment recoupment: billed 11043 when only superficial fascia involved)',
      },
      tumorExcision: {
        primaryCpt: '21931',
        codeLabel: 'Excision, tumor, soft tissue of back or flank, subfascial (e.g., intramuscular); less than 3 cm',
        globalDays: '90-Day Global',
        workRvu: 6.84,
        medicareAllowable: '$542.10',
        cmsCoverageGuideline:
          'Musculoskeletal Section: Subfascial tumor resides below or within the deep investing muscular fascia. Operative report must detail incision of the fascia and dissection from myofascial plane.',
        operativeDictationRequirement:
          '"Lumbodorsal deep fascia incised sharply for 5 cm. The well-encapsulated 2.8 cm mass lying immediately beneath the fascia was dissected free with sharp bipolar cautery. Fascia re-approximated."',
        aiFailureMode:
          'AI overlooks the required 90-day global surgery rules, failing to apply Modifier -58 or -79 if the patient has a secondary procedure within 3 months.',
        humanSignerCredential: 'CGSC / CPC',
        carcCode: 'CO-236 (Procedure or modifier not compatible with global period)',
      },
      incisionDrainage: {
        primaryCpt: '20005',
        codeLabel: 'Incision and drainage of soft tissue abscess, subfascial (i.e., involves deep fascial planes)',
        globalDays: '10-Day Global',
        workRvu: 3.82,
        medicareAllowable: '$312.60',
        cmsCoverageGuideline:
          'CPT Musculoskeletal: For abscesses located deep to the deep fascia. Differentiates from 10060/10061 which are integumentary. Requires incision of muscular investing sheath.',
        operativeDictationRequirement:
          '"Incision deepened through subcutaneous fat to expose deep muscular fascia. Fascia sharply opened releasing 60 cc of purulent loculated fluid from the subfascial compartment."',
        aiFailureMode:
          'Autonomous software fails to recognize that 20005 has a 10-day global fee period unlike 10060 (0-day), leading to unbilled or uncoordinated post-op care.',
        humanSignerCredential: 'CGSC / CEDC',
        carcCode: 'CO-4 (Modifier missing for subsequent post-op evaluations within 10-day window)',
      },
      woundRepair: {
        primaryCpt: '13100',
        addlCpt: '13101–13153',
        codeLabel: 'Repair, complex, trunk; 1.1 cm to 2.5 cm (Requires layered fascial closure & extensive undermining)',
        globalDays: '0-Day Global',
        workRvu: 3.95,
        medicareAllowable: '$328.40',
        cmsCoverageGuideline:
          'CPT Manual Complex Repair: Requires more than layered closure; involves extensive undermining (greater than the maximum width of the defect), debridement of wound edges, and deep fascial anchoring sutures.',
        operativeDictationRequirement:
          '"Extensive subcutaneous undermining carried out >3 cm circumferentially in the subfascial plane. Heavy 0-PDS sutures used to anchor deep fascial layers followed by multi-layered soft tissue reconstruction."',
        aiFailureMode:
          'AI upcodes intermediate closures to complex 13100 whenever undermining is mentioned, failing to verify the strict CPT requirement that undermining must exceed defect width.',
        humanSignerCredential: 'CGSC / CPC',
        carcCode: 'CO-151 (Complex closure criteria not substantiated by defect geometry in operative report)',
      },
    },
    interactiveDictationCheck: {
      compliantPhrase:
        'The deep crural investing fascia was incised and 22 sq cm of devitalized, non-glistening fascial tissue was resected until healthy, white, glistening fascia remained.',
      compliantOutcome: 'CPT 11043 substantiated without question. Passes all NCCI Column 1 edits.',
      nonCompliantPhrase:
        'Debrided wound through superficial fascia to clean tissue. Dressing placed.',
      nonCompliantOutcome:
        'Upcoding error: "superficial fascia" is Stratum 2 (CPT 11042). Billing 11043 represents a $126.40 unearned overpayment.',
      auditPenaltyRisk: 'Target of OIG Corporate Integrity Agreement audits for systemic false upcoding.',
    },
  },
  {
    id: 'stratum-4',
    stratumNumber: 4,
    name: 'Skeletal Muscle Compartment',
    anatomicalPlane: 'Contractile Myofibrillar Bellies (Epimysium, Perimysium & Deep Vascular Pedicles)',
    depthRangeMm: [25, 45],
    depthDisplay: '25.0 mm – 45.0 mm',
    histologicalComposition:
      'Striated, multinucleated skeletal muscle fibers bound in bundles (fascicles) by perimysial collagen sheaths, surrounded by an epimysium mantle. Dense capillary perfusion networks, motor axons, and neuromuscular junctions.',
    surgicalSignificance:
      'Requires explicit documentation of muscle non-viability (the 4 C\'s: Color, Consistency, Contractility, and Capillary Bleeding). Probabilistic AI routinely hallucinates muscle excision from simple muscular visualization.',
    colorClass: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
    accentHex: '#F43F5E',
    procedures: {
      debridement: {
        primaryCpt: '11043',
        addlCpt: '11046',
        codeLabel: 'Debridement, muscle and/or fascia (includes epidermis, dermis, and subcutaneous tissue); first 20 sq cm',
        globalDays: '0-Day Global',
        workRvu: 3.42,
        medicareAllowable: '$274.90',
        cmsCoverageGuideline:
          'CMS IOM Pub. 100-04, Ch. 12: Documentation must specifically record the non-viable muscle tissue characteristics and surgical excision technique down to bleeding, contractile muscle.',
        operativeDictationRequirement:
          '"Non-viable, friable, non-contractile, dusky skeletal muscle of the anterior tibialis belly was sharply excised with currette and scalpel until healthy red, contractile muscle with brisk punctate bleeding was reached."',
        aiFailureMode:
          'AI flags CPT 11044 (bone debridement) when operative notes state "muscle debrided down near bone," overbilling Medicare by $87.20.',
        humanSignerCredential: 'CGSC / CPC',
        carcCode: 'CO-151 (Medical review downgrade if operative note describes muscle as merely rinsed or wiped)',
      },
      tumorExcision: {
        primaryCpt: '21932',
        codeLabel: 'Excision, tumor, soft tissue of back or flank, subfascial (intramuscular); 3 cm or greater',
        globalDays: '90-Day Global',
        workRvu: 10.15,
        medicareAllowable: '$814.50',
        cmsCoverageGuideline:
          'Musculoskeletal Surgical Guidelines: Deep tumor originating within the substance of the muscle bellies. Requires longitudinal myotomy and complete mobilization from muscle fibers.',
        operativeDictationRequirement:
          '"Longitudinal myotomy performed in the latissimus dorsi muscle fibers. A 4.2 cm deep intramuscular neoplasm was dissected circumferential to gross margins. Muscular belly closed in tiers."',
        aiFailureMode:
          'AI fails to correlate pathology gross measurement with operative measurement; CPT tumor codes mandate selection based on physician\'s in-situ measurement prior to excision.',
        humanSignerCredential: 'CGSC / CPC',
        carcCode: 'CO-16 (Discrepancy between operative dimensions and surgical pathology report)',
      },
      incisionDrainage: {
        primaryCpt: '26990 / 27301',
        codeLabel: 'Incision and drainage, deep abscess, infected bursa, or hematoma, thigh or knee region; deep to fascia/intramuscular',
        globalDays: '90-Day Global',
        workRvu: 7.20,
        medicareAllowable: '$612.30',
        cmsCoverageGuideline:
          'CMS Global Surgery Policy: Major surgical procedure carrying a 90-day global period. Requires formal operative dictation in an inpatient or ASC surgical suite.',
        operativeDictationRequirement:
          '"Quadriceps muscle fibers split bluntly following fascial opening. 150 cc of intramuscular purulence evacuated from vastus intermedius plane. Jackson-Pratt drain placed."',
        aiFailureMode:
          'Autonomous ambient scribing tools fail to recognize that this code carries a 90-day global surgical period, failing to apply required Modifier -78 on subsequent revisions.',
        humanSignerCredential: 'CGSC / CEDC',
        carcCode: 'CO-97 (Subsequent debridement within 90 days denied without Modifier -78 or -58)',
      },
      woundRepair: {
        primaryCpt: '13101',
        codeLabel: 'Repair, complex, trunk; each additional 5 cm or fraction thereof (Muscular plane re-approximation)',
        globalDays: '0-Day Global',
        workRvu: 1.84,
        medicareAllowable: '$152.80',
        cmsCoverageGuideline:
          'CPT Manual Add-On Code: Billed in conjunction with primary complex repair 13100. Must have explicit measurement of extended defect length.',
        operativeDictationRequirement:
          '"Torn muscle fascia and transected muscle bellies re-approximated with figure-of-eight 0-Vicryl sutures over a length of 7.5 cm (primary 2.5 cm + add-on 5.0 cm). Evicel sealant applied."',
        aiFailureMode:
          'AI bills add-on code without primary parent code 13100 on the same claim line, causing an immediate clearinghouse claim rejection.',
        humanSignerCredential: 'CGSC / CPC',
        carcCode: 'CO-16 (Add-on code billed without primary base code)',
      },
    },
    interactiveDictationCheck: {
      compliantPhrase:
        'Devitalized, dark non-contractile muscle tissue in the soleus belly was sharply debrided with tenotomy scissors until uniform capillary bleeding and contraction were observed.',
      compliantOutcome: 'CPT 11043 authenticated with zero audit vulnerability. Full reimbursement protected.',
      nonCompliantPhrase:
        'Muscle was probed and found to be soft. Irrigation completed.',
      nonCompliantOutcome:
        'Immediate denial CO-151: "Probing" does not constitute excision or debridement under CMS Pub 100-04.',
      auditPenaltyRisk: '100% recoupment of debridement fee on post-payment audit.',
    },
  },
  {
    id: 'stratum-5',
    stratumNumber: 5,
    name: 'Periosteum & Cortical Bone',
    anatomicalPlane: 'Osteogenic Cambium, Cortical Osteons & Trabecular Marrow Spaces',
    depthRangeMm: [45, 60],
    depthDisplay: '45.0 mm – 60.0+ mm',
    histologicalComposition:
      'Outer fibrous periosteum containing sensory nerve endings, inner osteogenic cambium layer, lamellar dense cortical bone organized into Haversian systems (osteons), and deep cancellous trabecular bone filled with vascular hematopoietic marrow.',
    surgicalSignificance:
      'The #1 highest audited CPT code in outpatient surgical and wound care (CPT 11044). CMS Recovery Audit Contractors (RAC) claw back millions annually because providers "felt bone with a probe" but did not excise it.',
    colorClass: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10',
    accentHex: '#06B6D4',
    procedures: {
      debridement: {
        primaryCpt: '11044',
        addlCpt: '11047',
        codeLabel: 'Debridement, bone (includes epidermis, dermis, subcutaneous tissue, muscle and/or fascia); first 20 sq cm or less',
        globalDays: '0-Day Global',
        workRvu: 4.60,
        medicareAllowable: '$362.10',
        cmsCoverageGuideline:
          'CMS LCD L38904 & OIG Work Plan (OEI-02-15-00410): Must document physical removal of non-viable bone using rongeur, bone curette, burr, or saw down to healthy bleeding bone.',
        operativeDictationRequirement:
          '"Cortical bone of the calcaneus was exposed and soft with osteomyelitic erosion. A sharp bone rongeur and curette were used to excise 4 sq cm of non-viable cortical bone until bleeding, hard, viable cancellous bone was reached."',
        aiFailureMode:
          'CRITICAL FAILURE: Autonomous AI sees words "bone palpable at base of ulcer" or "wound extends to bone" and automatically assigns CPT 11044. Palpating or visualizing bone is NOT bone debridement! Triggers False Claims Act liability.',
        humanSignerCredential: 'CGSC (Certified General Surgery Coder) / CPC',
        carcCode: 'CO-151 (Fatal audit clawback: bone was only exposed/inspected, not resected)',
      },
      tumorExcision: {
        primaryCpt: '20240 / 24134',
        codeLabel: 'Biopsy, bone, open, superficial OR Sequestrectomy for osteomyelitis',
        globalDays: '90-Day Global',
        workRvu: 6.95,
        medicareAllowable: '$588.20',
        cmsCoverageGuideline:
          'Musculoskeletal Surgery Guidelines: Open operative exposure of bone with cortical window creation, bone marrow curettage, and submission for permanent histopathology and microbiological culture.',
        operativeDictationRequirement:
          '"Cortical window created in tibia using osteotome. Non-viable cortical sequestrum resected; bone curettings sent for anaerobic/fungal culture and histopathology."',
        aiFailureMode:
          'AI assigns simple soft tissue biopsy code (20200) instead of bone biopsy code (20240), forfeiting over $320 in legitimate physician compensation.',
        humanSignerCredential: 'CGSC / CPC',
        carcCode: 'CO-16 (Underbilling revenue leakage caused by AI failing to capture cortical osteotomy)',
      },
      incisionDrainage: {
        primaryCpt: '26992 / 27303',
        codeLabel: 'Incision and drainage, deep abscess, infected bursa, or hematoma, with bone cortical fenestration/saucerization',
        globalDays: '90-Day Global',
        workRvu: 9.85,
        medicareAllowable: '$784.60',
        cmsCoverageGuideline:
          'Requires formal operative documentation of intramedullary bone trephination or de-roofing of subperiosteal abscess cavity.',
        operativeDictationRequirement:
          '"Periosteum elevated off femur; subperiosteal abscess drained. High-speed burr used to fenestrate the cortex into the medullary canal to release intramedullary purulence."',
        aiFailureMode:
          'AI misinterprets this major 90-day surgical procedure as a minor subcutaneous I&D (10061), causing massive reimbursement loss.',
        humanSignerCredential: 'CGSC',
        carcCode: 'CO-4 (Missing laterality modifiers -RT/-LT or pre-authorization approval)',
      },
      woundRepair: {
        primaryCpt: '15734 / 15738',
        codeLabel: 'Muscle, myocutaneous, or fasciocutaneous flap (Required to cover exposed cortical bone without periosteum)',
        globalDays: '90-Day Global',
        workRvu: 18.50,
        medicareAllowable: '$1,420.80',
        cmsCoverageGuideline:
          'CPT Flap Guidelines: Skin grafts will not survive on bare cortical bone devoid of periosteum; requires vascularized rotational or free tissue transfer.',
        operativeDictationRequirement:
          '"Bare cortical tibia exposed measuring 4x3 cm lacking periosteal bed. Hemisoleus rotational muscle flap mobilized on its vascular pedicle and inset over exposed bone defect."',
        aiFailureMode:
          'AI attempts to bill skin graft (15100) over bare bone devoid of periosteum, resulting in immediate claim denial for biological impossibility under LCD guidelines.',
        humanSignerCredential: 'CGSC / CPC',
        carcCode: 'CO-50 (Non-covered procedure: split-thickness graft non-viable over avascular cortical bone)',
      },
    },
    interactiveDictationCheck: {
      compliantPhrase:
        'A bone rongeur was used to excise 3 sq cm of necrotic, softened, osteomyelitic cortical bone from the first metatarsal head until bleeding cortical puncta and hard bleeding bone were achieved.',
      compliantOutcome: 'CPT 11044 fully verified and legally compliant. Passes OIG RAC scrutiny with 100% documentation defensibility.',
      nonCompliantPhrase:
        'Deep ulcer extending to bone. Bone probed with sterile metal probe at base of wound. Wound dressed.',
      nonCompliantOutcome:
        'CRITICAL FRAUD ALERT: Probing bone is CPT 97597 or E/M only! Billing CPT 11044 constitutes federal False Claims Act violation ($11,000+ statutory fine).',
      auditPenaltyRisk: 'Immediate OIG demand for recoupment, treble damages, and corporate integrity monitoring.',
    },
  },
];
