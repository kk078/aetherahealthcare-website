import { SOURCES } from './autonomyReferences';

export const ATLAS_REVIEWED = '2026-09-23';
export const ATLAS_SOURCES = {
  ncci: SOURCES.ncci,
  drugs: SOURCES.drugs,
  wound: SOURCES.wound,
  model: { label: 'BodyParts3D — dataset and anatomical identifiers', url: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html' },
  license: { label: 'BodyParts3D — current reuse license', url: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html' },
  anatomy: { label: 'OpenStax — Anatomy and Physiology 2e', url: 'https://openstax.org/details/books/anatomy-and-physiology-2e' },
  dental: { label: 'ADA — oral evaluation and cancer assessment', url: 'https://www.ada.org/resources/ada-library/oral-health-topics/cancer-head-and-neck' },
  em: { label: 'CMS — evaluation and management services', url: 'https://www.cms.gov/files/document/mln006764-evaluation-management-services.pdf' },
  gynecology: { label: 'CMS — published procedure description for 58571', url: 'https://data.cms.gov/tools/medicare-physician-other-practitioner-look-up-tool/provider/1073752556' },
  knee: { label: 'CMS — published procedure description for 27447', url: 'https://data.cms.gov/tools/medicare-physician-other-practitioner-look-up-tool/provider/1306865225' },
  ent: { label: 'CMS — published procedure description for 31575', url: 'https://data.cms.gov/tools/medicare-physician-other-practitioner-look-up-tool/provider/1801038070' },
} as const;
export type AtlasSource = keyof typeof ATLAS_SOURCES;
export type RegionId = 'whole' | 'head' | 'spine' | 'thorax' | 'abdomen' | 'pelvis' | 'upper-limb' | 'lower-limb' | 'surface';
export type AtlasLayer = 'all' | 'skeleton' | 'organs' | 'nervous' | 'surface';
export const REGIONS: { id: RegionId; name: string; lesson: string; checkpoints: string[] }[] = [
  { id: 'whole', name: 'Whole body', lesson: 'Start with anatomical position. Left and right always refer to the patient, even when the model rotates. Anatomy supplies context; the documented service determines the code.', checkpoints: ['Identify the body region and the precise structure.', 'Separate the diagnosis from the service performed.', 'Check the current code set, payer rules and date of service.'] },
  { id: 'head', name: 'Head & neck', lesson: 'Explore the skull, vitreous bodies of the eyes and brain. The site, approach, laterality and purpose of a procedure distinguish services that may involve neighboring structures.', checkpoints: ['Record the exact site and side, including eye or ear when relevant.', 'Distinguish diagnostic evaluation from a therapeutic procedure.', 'For dental services, check tooth or surface documentation and the applicable CDT entry.'] },
  { id: 'spine', name: 'Spine & nervous system', lesson: 'The vertebral column and spinal cord are different structures. A spinal operation requires documentation of the approach, levels and work actually performed.', checkpoints: ['Do not infer an anterior or posterior approach from the presence of an implant.', 'Identify spinal region, operated levels and the primary procedure.', 'Review add-on code instructions and the applicable edit pairs.'] },
  { id: 'thorax', name: 'Heart, lungs & chest', lesson: 'Explore the heart, lungs, rib cage and airway. Diagnostic testing, surgery and monitoring during another service have different billing contexts.', checkpoints: ['Distinguish a separate diagnostic test from integral monitoring.', 'Identify whether the billed work is technical, professional or global.', 'Record the procedure and clinical indication; organ selection alone establishes neither.'] },
  { id: 'abdomen', name: 'Digestive organs', lesson: 'Explore the liver, gallbladder, stomach, pancreas and intestines. Endoscopic route, extent and intervention matter when describing a digestive-system procedure.', checkpoints: ['Document the route and extent of the examination.', 'Identify each intervention and the site where it occurred.', 'Check whether diagnostic work is included in a therapeutic endoscopy.'] },
  { id: 'pelvis', name: 'Kidneys & pelvis', lesson: 'The kidneys are retroperitoneal, above the bony pelvis. This study group also includes the bladder, prostate and pelvic bones. Female reproductive organs are not present in this male model.', checkpoints: ['Distinguish kidney, ureter, bladder and urethral work.', 'Check approach, laterality and the precise service.', 'Use a separate female-anatomy reference for obstetric and gynecologic lessons.'] },
  { id: 'upper-limb', name: 'Shoulder, arm & hand', lesson: 'Explore the shoulder girdle and the bones of the arm, forearm and hand. Bone, tendon, joint and peripheral-nerve procedures are different services.', checkpoints: ['Document right or left and the exact joint, nerve, tendon or digit.', 'Distinguish open surgery from arthroscopy or other endoscopy.', 'Use finger-specific modifiers only where the code and payer instructions call for them.'] },
  { id: 'lower-limb', name: 'Hip, knee & foot', lesson: 'Explore the femur, patella, tibia, fibula and foot bones. The specific joint, compartment, side and procedure determine the applicable code family.', checkpoints: ['Document the side and the exact procedure.', 'For knee arthroscopy, identify the compartment and treated structures.', 'Do not equate a highlighted bone with a diagnosis or a completed operation.'] },
  { id: 'surface', name: 'Skin & tissue review', lesson: 'The surface mesh shows external shape. It does not measure a wound or show patient-specific tissue depth. Debridement examples require the tissue actually removed and treated area.', checkpoints: ['Record the tissue removed, not just the depth of the wound.', 'Use procedure-specific size and area rules.', 'Distinguish biopsy, excision, destruction, repair and debridement.'] },
];

export interface AtlasCode {
  code: string;
  system: 'CPT' | 'CDT' | 'HCPCS modifier';
  regions: RegionId[];
  title: string;
  checkpoint: string;
  source: AtlasSource;
  page?: number;
}
// Short educational summaries, not licensed full descriptors or a code-selection engine.
export const ATLAS_CODES: AtlasCode[] = [
  { code: '29827', system: 'CPT', regions: ['upper-limb'], title: 'Arthroscopic rotator-cuff repair', checkpoint: 'The report must establish the repair and arthroscopic approach; a shoulder finding alone is insufficient.', source: 'ncci', page: 88 },
  { code: '64721', system: 'CPT', regions: ['upper-limb'], title: 'Median-nerve surgery at the carpal tunnel', checkpoint: 'Distinguish open from endoscopic release. A conversion to open surgery does not justify reporting both approaches for the same wrist.', source: 'ncci', page: 163 },
  { code: '29848', system: 'CPT', regions: ['upper-limb'], title: 'Endoscopic carpal-tunnel release', checkpoint: 'Confirm the completed approach and side. Compare with the open procedure before considering separate reporting.', source: 'ncci', page: 163 },
  { code: '29881', system: 'CPT', regions: ['lower-limb'], title: 'Knee meniscectomy, one meniscal compartment', checkpoint: 'Review medial versus lateral work and included chondroplasty; do not add a code merely because another compartment was inspected.', source: 'ncci', page: 87 },
  { code: '29880', system: 'CPT', regions: ['lower-limb'], title: 'Knee meniscectomy, both meniscal compartments', checkpoint: 'Requires the described medial and lateral meniscal work. A knee image cannot establish what was performed.', source: 'ncci', page: 87 },
  { code: '27447', system: 'CPT', regions: ['lower-limb'], title: 'Total knee arthroplasty', checkpoint: 'Review the full descriptor and operative record. The reference to both compartments does not mean both knees.', source: 'knee' },
  { code: '43235', system: 'CPT', regions: ['abdomen'], title: 'Diagnostic upper gastrointestinal endoscopy', checkpoint: 'Endoscopic guidance alone is not a complete diagnostic examination. Review the route, extent and any therapeutic work.', source: 'ncci', page: 229 },
  { code: '45378', system: 'CPT', regions: ['abdomen'], title: 'Diagnostic colonoscopy', checkpoint: 'An examination limited to the anus is not a colonoscopy. Document extent, indication and interventions.', source: 'ncci', page: 137 },
  { code: '47562', system: 'CPT', regions: ['abdomen'], title: 'Laparoscopic gallbladder removal', checkpoint: 'Verify the actual procedure and whether additional work changes the applicable code; identifying the gallbladder does not select a code.', source: 'ncci', page: 133 },
  { code: '52000', system: 'CPT', regions: ['pelvis'], title: 'Diagnostic cystourethroscopy', checkpoint: 'A scope performed only to check urinary-tract integrity at the end of another operation is not separately reportable under the cited NCCI guidance.', source: 'ncci', page: 140 },
  { code: '58571', system: 'CPT', regions: ['pelvis'], title: 'Laparoscopic total hysterectomy with adnexal removal', checkpoint: 'This example includes a uterus weighing 250 g or less and removal of tube(s) and/or ovary(s). Verify all descriptor elements. Female anatomy is not shown in this model.', source: 'gynecology' },
  { code: '31575', system: 'CPT', regions: ['head'], title: 'Diagnostic flexible laryngoscopy', checkpoint: 'Document the completed examination. Do not use the diagnostic example as a substitute for a therapeutic procedure descriptor.', source: 'ent' },
  { code: 'D0120', system: 'CDT', regions: ['head'], title: 'Periodic oral evaluation for an established patient', checkpoint: 'Use the current CDT entry and dental documentation. A medical CPT example does not replace a dental code or determine dental-plan coverage.', source: 'dental' },
  { code: '11102', system: 'CPT', regions: ['surface'], title: 'Tangential biopsy of a first skin lesion', checkpoint: 'Differentiate tangential, punch and incisional technique. Review same-lesion bundling before adding a biopsy to a removal.', source: 'ncci', page: 80 },
  { code: '11104', system: 'CPT', regions: ['surface'], title: 'Punch biopsy of a first skin lesion', checkpoint: 'Technique matters. Additional lesions and other same-site procedures require their own descriptor and edit review.', source: 'ncci', page: 80 },
  { code: '11106', system: 'CPT', regions: ['surface'], title: 'Incisional biopsy of a first skin lesion', checkpoint: 'Document the biopsy technique and lesion. A photograph does not distinguish which procedure was performed.', source: 'ncci', page: 80 },
  { code: '11042', system: 'CPT', regions: ['surface'], title: 'Subcutaneous-tissue debridement', checkpoint: 'The base example covers the first 20 cm² or less. Verify the tissue actually removed and area; wound depth alone is insufficient.', source: 'wound' },
  { code: '11043', system: 'CPT', regions: ['surface'], title: 'Muscle or fascia debridement', checkpoint: 'The base example covers the first 20 cm² or less. Document removal of muscle or fascia; exposed tissue alone does not establish removal.', source: 'wound' },
  { code: '11044', system: 'CPT', regions: ['surface'], title: 'Bone debridement', checkpoint: 'The base example covers the first 20 cm² or less. Confirm bone was actually debrided and review applicable area rules.', source: 'wound' },
  { code: '93000–93010', system: 'CPT', regions: ['thorax'], title: 'ECG service family', checkpoint: 'This is a code family, not a billable range. Distinguish acquisition, interpretation and the complete service; integral monitoring is different.', source: 'ncci', page: 60 },
  { code: '94010', system: 'CPT', regions: ['thorax'], title: 'Spirometry', checkpoint: 'Distinguish the performed test from bronchodilator responsiveness or provocation testing. Review component inclusion.', source: 'ncci', page: 239 },
  { code: '90832 / 90834 / 90837', system: 'CPT', regions: ['head', 'whole'], title: 'Individual psychotherapy without an E/M component', checkpoint: 'These are alternative time-based services. Review documented psychotherapy time and whether an E/M-associated add-on pathway applies.', source: 'ncci', page: 227 },
  { code: '97110', system: 'CPT', regions: ['upper-limb', 'lower-limb', 'spine'], title: 'Therapeutic exercise', checkpoint: 'Review the current timed-service definition, treatment documentation and applicable therapy unit rules; a body region alone does not establish units.', source: 'ncci', page: 246 },
  { code: '88305', system: 'CPT', regions: ['whole'], title: 'Selected surgical-pathology specimens', checkpoint: 'The specimen and examination determine the code. CMS uses a different reporting instruction for prostate needle-biopsy specimens.', source: 'ncci', page: 213 },
  { code: '99213', system: 'CPT', regions: ['whole'], title: 'Established-patient office/outpatient E/M example', checkpoint: 'Review medical decision making or eligible total time and the applicable service requirements; a diagnosis or organ does not select the level.', source: 'em' },
  { code: '99291', system: 'CPT', regions: ['whole'], title: 'Initial critical-care service example', checkpoint: 'Critical care requires qualifying care and time documentation. Exclude time attributable to separately reportable procedures.', source: 'ncci', page: 232 },
  { code: 'JW / JZ', system: 'HCPCS modifier', regions: ['whole'], title: 'Selected single-dose drug reporting modifiers', checkpoint: 'Review the drug, payment setting, container, administration and discarded amount. These are not procedure codes or automatic instructions for every drug.', source: 'drugs' },
];

export interface AtlasSpecialty { name: string; region: RegionId; focus: string; examples: string[]; }
// Broad learning pathways, not an ABMS taxonomy or a claim of exhaustive subspecialty coverage.
export const ATLAS_SPECIALTIES: AtlasSpecialty[] = [
  { name: 'Family medicine', region: 'whole', focus: 'Symptoms, documented assessment, preventive versus problem-oriented services, and the basis for E/M level selection.', examples: ['99213'] },
  { name: 'Internal medicine', region: 'whole', focus: 'Multisystem encounters, chronic-condition documentation, and services actually furnished.', examples: ['99213'] },
  { name: 'Pediatrics & neonatology', region: 'whole', focus: 'Age-specific service requirements and congenital anatomy. This adult model must not be treated as pediatric anatomy.', examples: ['99213'] },
  { name: 'Geriatrics', region: 'whole', focus: 'Encounter setting, multiple conditions, documented assessment and applicable E/M rules.', examples: ['99213'] },
  { name: 'Emergency medicine', region: 'whole', focus: 'Emergency-department versus critical-care pathways; preserve distinct service and time documentation.', examples: ['99291'] },
  { name: 'Critical care', region: 'thorax', focus: 'Qualifying critical care, treatment time and separately reportable services.', examples: ['99291'] },
  { name: 'Cardiology', region: 'thorax', focus: 'Heart anatomy, ECG acquisition versus interpretation, and diagnostic testing versus monitoring.', examples: ['93000–93010'] },
  { name: 'Cardiothoracic surgery', region: 'thorax', focus: 'Cardiac, pulmonary and chest-wall sites, operative approach and the exact operation documented.', examples: ['93000–93010'] },
  { name: 'Pulmonology & sleep medicine', region: 'thorax', focus: 'Airway and lung anatomy, performed testing and the distinction between component and comprehensive services.', examples: ['94010'] },
  { name: 'Vascular surgery', region: 'thorax', focus: 'Named vessel, side, access, intervention and imaging documentation. The aorta is shown; a complete peripheral vessel tree is not.', examples: [] },
  { name: 'Gastroenterology', region: 'abdomen', focus: 'Endoscopic route, extent, site, sampling and treatment.', examples: ['43235', '45378'] },
  { name: 'General surgery', region: 'abdomen', focus: 'Organ, operative approach, resection or repair, and included work.', examples: ['47562'] },
  { name: 'Hepatobiliary & pancreatic surgery', region: 'abdomen', focus: 'Liver, gallbladder and pancreas; identify the actual operation rather than inferring a service from an organ.', examples: ['47562'] },
  { name: 'Colorectal surgery', region: 'abdomen', focus: 'Bowel segment, approach and the difference between a diagnostic examination and operative treatment.', examples: ['45378'] },
  { name: 'Urology', region: 'pelvis', focus: 'Kidney, bladder and prostate context; diagnostic work versus checks integral to an operation.', examples: ['52000'] },
  { name: 'Nephrology', region: 'pelvis', focus: 'Renal anatomy and the distinct documentation and payment rules for visits, dialysis and other services.', examples: ['99213'] },
  { name: 'Obstetrics & gynecology', region: 'pelvis', focus: 'Use an additional female reproductive anatomy reference. Distinguish obstetric packages, procedures and documented surgical extent.', examples: ['58571'] },
  { name: 'Urogynecology', region: 'pelvis', focus: 'Female pelvic anatomy, approach and separately documented work. The male model does not show the relevant reproductive structures.', examples: ['52000', '58571'] },
  { name: 'Neurology', region: 'head', focus: 'Brain, spinal cord and clinical assessment; the model shows the brain but not the spinal cord, and does not represent a neurologic diagnosis.', examples: ['99213'] },
  { name: 'Neurosurgery & spine surgery', region: 'spine', focus: 'Approach, level, decompression, fusion and add-on eligibility require operative documentation.', examples: ['64721'] },
  { name: 'Orthopedics & sports medicine', region: 'lower-limb', focus: 'Specific joint, side, compartments and completed repair or replacement.', examples: ['29827', '29881', '29880', '27447'] },
  { name: 'Hand & upper-extremity surgery', region: 'upper-limb', focus: 'Nerve, tendon, bone or joint, precise site, side and operative approach.', examples: ['64721', '29848'] },
  { name: 'Podiatry & foot/ankle surgery', region: 'lower-limb', focus: 'Foot and ankle site, digit, side, diagnosis and the precise documented intervention.', examples: ['11042'] },
  { name: 'Rheumatology', region: 'upper-limb', focus: 'Joint and systemic disease documentation; distinguish evaluation from a separate procedure.', examples: ['99213'] },
  { name: 'Physical medicine & rehabilitation', region: 'spine', focus: 'Function, treatment plan, performed services and discipline-specific requirements.', examples: ['97110'] },
  { name: 'Physical & occupational therapy', region: 'lower-limb', focus: 'Intervention, direct treatment documentation and applicable timed-unit rules.', examples: ['97110'] },
  { name: 'Otolaryngology', region: 'head', focus: 'Precise ear, nose, pharyngeal or laryngeal site and diagnostic versus therapeutic work.', examples: ['31575'] },
  { name: 'Ophthalmology & optometry', region: 'head', focus: 'Eye, laterality, testing, examination and procedure-specific requirements. Only the vitreous bodies of the eyes are rendered; use a dedicated eye-anatomy reference for other structures.', examples: [] },
  { name: 'Dental & oral/maxillofacial care', region: 'head', focus: 'Dental versus medical code systems, oral evaluation and tooth/surface documentation.', examples: ['D0120'] },
  { name: 'Dermatology', region: 'surface', focus: 'Site, lesion, technique and whether the work is biopsy, destruction, excision or repair.', examples: ['11102', '11104', '11106'] },
  { name: 'Plastic & reconstructive surgery', region: 'surface', focus: 'Defect, site, dimensions, technique and the distinction between repair, tissue transfer and grafting.', examples: ['11102'] },
  { name: 'Wound care', region: 'surface', focus: 'Tissue actually removed, area and procedure-specific documentation.', examples: ['11042', '11043', '11044'] },
  { name: 'Anesthesiology & pain medicine', region: 'spine', focus: 'Anesthesia versus pain treatment, technique, time, personnel and procedural context; no units are inferred from the model.', examples: [] },
  { name: 'Radiology & nuclear medicine', region: 'whole', focus: 'Modality, body region, views, contrast and professional versus technical service components.', examples: [] },
  { name: 'Pathology & laboratory medicine', region: 'whole', focus: 'Specimen identity, performed test or examination and reporting requirements.', examples: ['88305'] },
  { name: 'Oncology & hematology', region: 'whole', focus: 'Documented treatment, drug administration, specimen work and separate service requirements.', examples: ['JW / JZ', '88305'] },
  { name: 'Endocrinology', region: 'whole', focus: 'Hormonal and multisystem conditions, documented evaluation and separately performed tests.', examples: ['99213'] },
  { name: 'Infectious disease & allergy/immunology', region: 'whole', focus: 'Clinical assessment, testing and treatment documentation; anatomy alone does not establish etiology.', examples: ['99213'] },
  { name: 'Psychiatry & behavioral health', region: 'head', focus: 'Clinical assessment, psychotherapy time and whether E/M-associated reporting applies. Brain appearance does not establish a mental-health diagnosis.', examples: ['90832 / 90834 / 90837'] },
  { name: 'Transplantation', region: 'whole', focus: 'Organ, donor/recipient role, operative work and transplant-specific coverage requirements.', examples: [] },
];

export const ATLAS_QUIZ = [
  { question: 'The model is rotated. Whose right and left determine laterality?', answers: ['The patient’s', 'The viewer’s'], correct: 0, explanation: 'Laterality refers to the patient. Rotating the model does not change the anatomical side.', source: 'anatomy' as AtlasSource },
  { question: 'A wound extends to bone. What establishes the debridement code?', answers: ['The deepest tissue visible', 'The tissue actually removed and applicable area rules'], correct: 1, explanation: 'Wound depth alone does not prove bone was debrided. Review the documented tissue removed and treated area.', source: 'wound' as AtlasSource },
  { question: 'Does selecting a shoulder on the atlas establish that 29827 can be billed?', answers: ['Yes, the region determines the code', 'No, the documented procedure and coding requirements must match'], correct: 1, explanation: 'Anatomy provides context. The example requires the specified repair and approach, with other applicable coding requirements.', source: 'ncci' as AtlasSource },
];

export function atlasSourceUrl(code: AtlasCode) {
  return ATLAS_SOURCES[code.source].url + (code.page ? `#page=${code.page}` : '');
}
