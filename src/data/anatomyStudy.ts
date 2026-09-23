import type { RegionId } from './anatomyEducation';

export type CutPlane = 'off' | 'sagittal' | 'coronal' | 'transverse';
export type ModelLayer = 'skeleton' | 'organs' | 'nervous' | 'surface';
export type LayerOpacity = Record<ModelLayer, number>;
export const DEFAULT_OPACITY: LayerOpacity = { skeleton: 1, organs: 1, nervous: 1, surface: .18 };
export interface StudyStep { name: string; structure: string; note: string; }
export interface StudyModule { id: string; name: string; region: RegionId; pages: string; focus: string; missing: string; steps: StudyStep[]; }

// Original learning prompts, with the supplied reference used for coverage only.
// Model names/geometry remain independently sourced from BodyParts3D.
export const STUDY_MODULES: StudyModule[] = [
  { id: 'orientation', name: 'Orientation & body systems', region: 'whole', pages: '1–18', focus: 'Establish patient laterality and distinguish the body surface, skeleton and organs before considering a documented service.', missing: 'The surface is a reference shape. It does not expose wound layers or establish a diagnosis.', steps: [
    { name: 'External surface', structure: 'FMA7163', note: 'Rotate the adult male surface. Right and left refer to the person represented, not your screen.' },
    { name: 'A paired bone', structure: 'FMA23130', note: 'Identify the right humerus. A body-part label supplies anatomical context; the record must still establish the condition and service.' },
    { name: 'An internal organ', structure: 'FMA7088', note: 'Identify the heart as an organ. An organ name cannot distinguish evaluation, diagnostic testing or surgery.' },
  ] },
  { id: 'head', name: 'Head, brain & sensory structures', region: 'head', pages: '19–186', focus: 'Compare a containing bone structure, the brain and the limited ocular structures available in this model.', missing: 'Cranial nerves, detailed orbital muscles, dental structures and complete eye/ear anatomy are not modelled here.', steps: [
    { name: 'Skull', structure: 'FMA46565', note: 'Study the skull as a grouped bony structure. Individual foramina and adjacent soft tissues need a dedicated, validated regional model.' },
    { name: 'Brain', structure: 'FMA50801', note: 'Compare the brain with its surrounding skull using context mode. This is structural anatomy, not a lesion map or functional brain scan.' },
    { name: 'Right vitreous body', structure: 'FMA58828', note: 'This represents the vitreous body only. It must not be used as a complete eyeball, retinal or orbital dissection.' },
  ] },
  { id: 'spine', name: 'Spine & trunk', region: 'spine', pages: '187–242', focus: 'Use front and back views to establish orientation, then distinguish anatomical levels and the documented operative approach.', missing: 'The spinal cord, peripheral nerves and back-muscle layers are absent. The grouped column does not provide individually selectable surgical levels.', steps: [
    { name: 'Vertebral column', structure: 'FMA13478', note: 'The model combines vertebrae and intervertebral discs. Its cutaway is a surface rendering, not a spinal canal scan.' },
    { name: 'Rib cage', structure: 'FMA7480', note: 'Compare the thoracic bony enclosure with the spine. Selecting these structures does not establish a surgical exposure or approach.' },
  ] },
  { id: 'thorax', name: 'Heart, lungs & thorax', region: 'thorax', pages: '243–290', focus: 'Study organ relationships and separate anatomical learning from the acquisition, interpretation or performance of a service.', missing: 'No validated heartbeat, ventilation or valve-motion simulation is provided. Internal surfaces are not a clinical section dataset.', steps: [
    { name: 'Rib cage', structure: 'FMA7480', note: 'Use opacity and context to understand how the bony enclosure relates to the organs.' },
    { name: 'Heart', structure: 'FMA7088', note: 'Rotate the heart and compare it in context. Diagnostic test components and surgery require different documentation.' },
    { name: 'Right lung', structure: 'FMA7309', note: 'Identify the patient’s right lung; then compare the left lung using the structure list. The model is not a ventilation or pathology simulation.' },
    { name: 'Aorta', structure: 'FMA3734', note: 'Identify the named vessel. Vascular coding also depends on the actual intervention, access, territory and applicable rules.' },
  ] },
  { id: 'abdomen', name: 'Digestive & abdominal organs', region: 'abdomen', pages: '291–322', focus: 'Recognize the organ and anatomic site before reviewing route, extent and intervention in the documented procedure.', missing: 'Peritoneal reflections, surgical planes and a complete regional vascular/ductal dissection are not exposed as separate layers.', steps: [
    { name: 'Liver', structure: 'FMA7197', note: 'Compare the liver with neighboring digestive structures using context mode.' },
    { name: 'Gallbladder', structure: 'FMA7202', note: 'Locate the gallbladder and return to the whole region. The completed operation, not location alone, determines the procedure family.' },
    { name: 'Pancreas', structure: 'FMA7198', note: 'Isolation reveals the organ without overlying structures. It does not reproduce a surgical dissection or establish resection extent.' },
    { name: 'Large intestine', structure: 'FMA7201', note: 'Use bowel anatomy as context for extent and site documentation. The selected surface cannot establish endoscopic completion.' },
  ] },
  { id: 'pelvis', name: 'Urinary & pelvic anatomy', region: 'pelvis', pages: '323–367', focus: 'Identify the urinary structure and distinguish it from the service, approach, extent and laterality documented.', missing: 'The book includes female pelvic anatomy, but the current model does not. Female reproductive organs and a complete pelvic-floor model require additional validated assets.', steps: [
    { name: 'Right kidney', structure: 'FMA7204', note: 'The kidney is above the bony pelvis in the retroperitoneum. The atlas groups it with urinary/pelvic lessons for navigation.' },
    { name: 'Urinary bladder', structure: 'FMA15900', note: 'A bladder surface does not establish what a cystoscopic examination inspected or treated.' },
    { name: 'Prostate', structure: 'FMA9600', note: 'Identify the prostate in the male model. The structure alone cannot distinguish evaluation, sampling or operative treatment.' },
  ] },
  { id: 'upper-limb', name: 'Shoulder, arm, wrist & hand', region: 'upper-limb', pages: '368–431', focus: 'Distinguish bone and joint location from tendon, nerve or soft-tissue work, and identify the precise side and site.', missing: 'Rotator-cuff tendons, the brachial plexus, median nerve and wrist ligaments need additional validated geometry. Their procedures remain text-based learning topics.', steps: [
    { name: 'Right scapula', structure: 'FMA13395', note: 'Study the bony shoulder context. This surface does not display a rotator-cuff tear or repair.' },
    { name: 'Right humerus', structure: 'FMA23130', note: 'Locate the upper-arm bone and compare neighboring structures with context enabled.' },
    { name: 'Right radius', structure: 'FMA23464', note: 'Confirm the patient’s side and the specific forearm bone before considering any procedure documentation.' },
    { name: 'Right hand bones', structure: 'FMA9713-bones', note: 'This is a grouped bony view. Carpal-tunnel lessons require a separate account of the nerve and release approach.' },
  ] },
  { id: 'lower-limb', name: 'Hip, knee, ankle & foot', region: 'lower-limb', pages: '432–502', focus: 'Locate the specific joint and side, then review the structures and compartments actually treated.', missing: 'Menisci, cruciate/collateral ligaments and lower-limb muscle layers are not present. A geometric cut through bone must not be labelled a meniscal or ligament view.', steps: [
    { name: 'Right femur', structure: 'FMA24474', note: 'Locate the femur and its relationships in the lower limb.' },
    { name: 'Right patella', structure: 'FMA24486', note: 'Study the patella in context. A patellar surface does not represent the medial and lateral menisci.' },
    { name: 'Right tibia', structure: 'FMA24477', note: 'Use bony anatomy to orient the knee and lower leg. The operative record establishes compartment-specific work.' },
    { name: 'Right foot bones', structure: 'FMA11343-bones', note: 'Distinguish the anatomical location from the actual foot or ankle intervention and its reporting requirements.' },
  ] },
];

export const CODE_LIBRARY_SCOPE = [
  { name: 'CPT', purpose: 'Professional and outpatient services', status: 'Selected sourced examples; complete licensed library not loaded', source: 'https://www.ama-assn.org/practice-management/cpt/cpt-licensing-frequently-asked-questions-faqs' },
  { name: 'HCPCS Level II', purpose: 'Applicable drugs, supplies, equipment and services', status: 'Selected modifier examples; complete code library not loaded', source: 'https://www.cms.gov/medicare/coding-billing/healthcare-common-procedure-system/quarterly-update' },
  { name: 'ICD-10-CM', purpose: 'Diagnosis classification and required specificity', status: 'Official source linked; diagnosis catalogue not loaded', source: 'https://www.cms.gov/medicare/coding-billing/icd-10-codes' },
  { name: 'ICD-10-PCS', purpose: 'Inpatient hospital procedure classification', status: 'Official source linked; inpatient procedure catalogue not loaded', source: 'https://www.cms.gov/medicare/coding-billing/icd-10-codes' },
  { name: 'CDT', purpose: 'Dental procedures', status: 'Selected sourced example; complete licensed library not loaded', source: 'https://pages.ada.org/media-kit/business-product-portfolio' },
  { name: 'NCCI & coverage', purpose: 'Edits, inclusion rules and applicable policy review', status: 'Selected NCCI references; no automated claim validation', source: 'https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits' },
  { name: 'CARC / RARC', purpose: 'Remittance adjustment reasons and remarks', status: 'Official reference linked; remittance code library not loaded', source: 'https://x12.org/codes/claim-adjustment-reason-codes' },
];

export const RCM_LEARNING_STEPS = [
  { title: 'Before the service', text: 'Identify the payer, benefit, setting, referral and authorization requirements. Authorization and eligibility are separate checks; neither establishes a final payment amount.' },
  { title: 'Read the clinical record', text: 'Identify the documented diagnosis, precise site, laterality, completed service, approach and extent. Resolve missing facts rather than inferring them from the model.' },
  { title: 'Review coding and edits', text: 'Use the code system and release applicable to the date of service. Check descriptor requirements, instructions, modifiers and setting-specific edits.' },
  { title: 'Prepare and track the claim', text: 'Distinguish professional, facility and dental reporting. Check required claim fields and track acceptance separately from adjudication.' },
  { title: 'Interpret the remittance', text: 'Read adjustment group, reason and remark information together. Separate contractual adjustments, patient responsibility and denials using the actual remittance and applicable rules.' },
  { title: 'Resolve and learn', text: 'Determine whether correction, additional documentation, reconsideration or appeal is appropriate. Verify payer-specific filing requirements and record the reason for any change.' },
];
