import { TOOLS } from './toolRegistry';
import payersData from './payers.data.json';
import denialRefData from './denialReference.json';
import { DENIAL_CODES } from './denialCodes';

export type SearchCategory = 'all' | 'payers' | 'denials' | 'tools' | 'specialties' | 'services' | 'actions';

export interface SearchItem {
  id: string;
  category: 'payers' | 'denials' | 'tools' | 'specialties' | 'services' | 'actions';
  title: string;
  subtitle?: string;
  description?: string;
  href?: string;
  badge?: string;
  badgeVariant?: 'blue' | 'teal' | 'emerald' | 'amber' | 'purple' | 'slate';
  keywords: string[];
  denialDetail?: {
    code: string;
    type: 'CARC' | 'RARC';
    difficulty?: 'correctable' | 'preventable' | 'hard';
    category: string;
    rootCause?: string;
    workIt?: string;
    prevent?: string;
    rarc?: string;
  };
  payerDetail?: {
    slug: string;
    payerId?: string | null;
    type: string;
    timelyFiling?: string | null;
    portalUrl?: string | null;
  };
  actionDetail?: {
    type: 'expert_chat' | 'expert_callback' | 'theme_toggle' | 'print_page';
  };
}

// 91 Interactive Tools
const TOOL_ITEMS: SearchItem[] = TOOLS.map(tool => ({
  id: tool.href, category: 'tools', title: tool.name, subtitle: tool.tag,
  description: tool.desc, href: tool.href, keywords: [tool.name, tool.category, tool.tag],
}));

const SPECIALTY_ITEMS: SearchItem[] = [
  {
    id: 'spec-cardiology',
    category: 'specialties',
    title: 'Cardiology Billing & Coding',
    subtitle: 'Cath lab, echocardiograms, stress testing & modifier -26/-TC',
    href: '/services/cardiology-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['cardiology', 'heart', 'cath lab', 'echo', 'ekg', 'cpt 93000', '93224', 'cardiac'],
  },
  {
    id: 'spec-orthopedic',
    category: 'specialties',
    title: 'Orthopedic Billing & Coding',
    subtitle: 'Global surgical periods, modifier -58/-78/-79 & DME',
    href: '/services/orthopedic-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['orthopedic', 'surgery', 'fracture', 'joint', 'dme', 'modifiers', 'global period', 'bones'],
  },
  {
    id: 'spec-dermatology',
    category: 'specialties',
    title: 'Dermatology Billing & Coding',
    subtitle: 'Mohs micrographic surgery, biopsies & destruction codes',
    href: '/services/dermatology-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['dermatology', 'skin', 'mohs', 'biopsy', 'lesion', 'destruction', 'cpt 17000', 'cosmetic'],
  },
  {
    id: 'spec-psychiatry',
    category: 'specialties',
    title: 'Psychiatry & Behavioral Health Billing',
    subtitle: 'Psychotherapy add-on codes (+90833), intake & IOP/PHP',
    href: '/services/psychiatry-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['psychiatry', 'mental health', 'behavioral', 'psychotherapy', '90837', '90833', 'counseling'],
  },
  {
    id: 'spec-family-med',
    category: 'specialties',
    title: 'Family Medicine & Primary Care Billing',
    subtitle: 'E/M level selection, chronic care management (CCM) & AWV',
    href: '/services/family-medicine-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['family medicine', 'primary care', 'e/m', '99214', 'ccm', 'annual wellness', 'preventive'],
  },
  {
    id: 'spec-dental',
    category: 'specialties',
    title: 'Dental & Cross-Coding Billing',
    subtitle: 'CDT to CPT/ICD cross-coding for medical insurance billing',
    href: '/services/dental-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['dental', 'cdt', 'cross coding', 'oral surgery', 'sleep apnea', 'tmd', 'periodontics'],
  },
  {
    id: 'spec-pharmacy',
    category: 'specialties',
    title: 'Specialty Pharmacy Billing',
    subtitle: 'J-codes, Buy & Bill, NDC units & manufacturer copay cards',
    href: '/services/pharmacy-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pharmacy', 'buy and bill', 'j-code', 'ndc', 'infusion', 'biologics', 'specialty rx'],
  },
  {
    id: 'spec-workers-comp',
    category: 'specialties',
    title: "Workers' Compensation Billing",
    subtitle: 'State fee schedule rules, CMS-1500 attachments & W/C claims',
    href: '/services/workers-compensation-billing',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['workers comp', 'work comp', 'injury', 'pip', 'state fund', 'adjuster', 'cms-1500'],
  },
  {
    id: 'spec-neurology',
    category: 'specialties',
    title: 'Neurology Billing & Neurophysiology Coding',
    subtitle: 'EMG/NCS nerve studies, EEG monitoring & Botox migraine chemodenervation',
    href: '/medical-billing/neurology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['neurology', 'emg', 'ncs', 'eeg', 'nerve conduction', 'botox', 'migraine', '64615', '95886', 'neuro'],
  },
  {
    id: 'spec-pain-mgmt',
    category: 'specialties',
    title: 'Interventional Pain Management & Spine Billing',
    subtitle: 'Epidural steroid injections (ESI), facet blocks & radiofrequency ablation (RFA)',
    href: '/medical-billing/pain-management',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pain management', 'spine', 'esi', 'epidural', 'facet block', 'rfa', 'fluoroscopy', '62323', '64483', '64635'],
  },
  {
    id: 'spec-obgyn',
    category: 'specialties',
    title: 'OB/GYN & Women’s Health Billing',
    subtitle: 'Global maternity delivery packages, LARC buy-and-bill & colposcopy',
    href: '/medical-billing/obgyn',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['obgyn', 'obstetrics', 'gynecology', 'maternity', '59400', 'global care', 'larc', 'iud', 'colposcopy', 'women'],
  },
  {
    id: 'spec-ophthalmology',
    category: 'specialties',
    title: 'Ophthalmology & Optometry Billing',
    subtitle: 'Cataract surgery, anti-VEGF eye injections, OCT retinal imaging & co-management',
    href: '/medical-billing/ophthalmology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['ophthalmology', 'eye', 'optometry', 'cataract', '66984', 'retina', 'anti-vegf', 'eylea', 'oct', 'modifier 55'],
  },
  {
    id: 'spec-urology',
    category: 'specialties',
    title: 'Urology Billing & Coding',
    subtitle: 'Cystoscopy bundling, TURP, urodynamic testing & prostate oncology',
    href: '/medical-billing/urology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['urology', 'cystoscopy', 'turp', 'prostate', 'urodynamics', '52000', '52601', 'bladder', 'stones'],
  },
  {
    id: 'spec-radiology',
    category: 'specialties',
    title: 'Radiology & Diagnostic Imaging Billing',
    subtitle: 'Professional/Technical split (26/TC), MPPR reductions & CDS/AUC compliance',
    href: '/medical-billing/radiology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['radiology', 'imaging', 'x-ray', 'ct', 'mri', 'ultrasound', '26/tc', 'mppr', 'idtf', 'mammography'],
  },
  {
    id: 'spec-pt',
    category: 'specialties',
    title: 'Physical Therapy & Rehabilitation Billing',
    subtitle: 'Medicare 8-minute rule calculations, KX modifier threshold caps & POC tracking',
    href: '/medical-billing/physical-therapy',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['physical therapy', 'pt', 'occupational therapy', 'rehab', '8-minute rule', 'kx modifier', '97110', '97140'],
  },
  {
    id: 'spec-oncology',
    category: 'specialties',
    title: 'Medical Oncology & Hematology Billing',
    subtitle: 'Chemotherapy infusion sequencing, JW/JZ waste tracking & buy-and-bill J-codes',
    href: '/medical-billing/oncology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['oncology', 'hematology', 'cancer', 'chemo', 'chemotherapy', '96413', 'j-codes', 'infusion', 'jw modifier', 'waste'],
  },
  {
    id: 'spec-gi',
    category: 'specialties',
    title: 'Gastroenterology Billing & Endoscopy Coding',
    subtitle: 'Screening vs diagnostic colonoscopy (Mod 33/PT) & multiple endoscopy reductions',
    href: '/medical-billing/gastroenterology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['gastroenterology', 'gi', 'colonoscopy', 'endoscopy', 'polypectomy', 'modifier 33', '45378', 'digestive'],
  },
  {
    id: 'spec-internal-med',
    category: 'specialties',
    title: 'Internal Medicine Billing & Coding',
    subtitle: 'Complex adult chronic disease management, CCM/TCM codes & MDM E/M leveling',
    href: '/medical-billing/internal-medicine',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['internal medicine', 'adult care', 'internist', 'chronic care', 'ccm', '99490', 'tcm', 'hcc risk'],
  },
  {
    id: 'spec-pediatrics',
    category: 'specialties',
    title: 'Pediatric Practice Billing & Immunization Coding',
    subtitle: 'Vaccine administration (90460/90474), well-child checks & VFC Medicaid rules',
    href: '/medical-billing/pediatrics',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatrics', 'peds', 'well-child', 'vaccines', '90460', 'vfc', 'immunization', 'children'],
  },
  {
    id: 'spec-podiatry',
    category: 'specialties',
    title: 'Podiatry & Advanced Wound Care Billing',
    subtitle: 'Excisional debridement (11042), Q-modifiers (Q7/Q8/Q9) & skin substitute grafts',
    href: '/medical-billing/podiatry',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['podiatry', 'foot', 'wound care', 'debridement', '11042', 'q-codes', 'skin graft', 'unna boot', 'q7', 'q8', 'q9', 'nails'],
  },
  {
    id: 'spec-anesthesia',
    category: 'specialties',
    title: 'Anesthesiology & Pain Sedation Billing',
    subtitle: 'ASA base units, 15-minute time increments & medical direction concurrency (AA/QZ/QK)',
    href: '/medical-billing/anesthesia',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['anesthesia', 'anesthesiology', 'crna', 'sedation', 'asa units', 'concurrency', 'time units', '00100', 'qk', 'qz', 'pain'],
  },
  {
    id: 'spec-asc',
    category: 'specialties',
    title: 'Ambulatory Surgery Centers (ASC) Billing',
    subtitle: 'Dual UB-04 / 837I facility and 837P surgeon billing, Revenue Code 0490 & implant C-codes',
    href: '/medical-billing/asc',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['asc', 'ambulatory surgery', 'facility billing', 'ub-04', '837i', 'revenue code 0490', '0278', 'implants', 'opps', 'surgical center'],
  },
  {
    id: 'spec-pathology',
    category: 'specialties',
    title: 'Pathology & Clinical Laboratory Billing',
    subtitle: 'Surgical pathology specimen levels (88305), IHC stains, CLIA compliance & MolDX Z-codes',
    href: '/medical-billing/pathology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pathology', 'clinical lab', 'laboratory', 'clia', '88305', 'ihc', '88342', 'moldx', 'z-code', 'histology', 'biopsy'],
  },
  {
    id: 'spec-emergency',
    category: 'specialties',
    title: 'Emergency Medicine & Hospitalist Billing',
    subtitle: 'High-acuity ED visit coding (99281–99285), Critical Care time & No Surprises Act QPA dispute',
    href: '/medical-billing/emergency-medicine',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['emergency medicine', 'er billing', 'hospitalist', '99285', 'critical care', '99291', 'no surprises act', 'qpa', 'trauma'],
  },
  {
    id: 'spec-urgent-care',
    category: 'specialties',
    title: 'Urgent Care & Walk-In Clinic Billing',
    subtitle: 'Facility add-on code S9088, rapid CLIA point-of-care lab testing & front-desk financial clearance',
    href: '/medical-billing/urgent-care',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['urgent care', 'walk-in clinic', 's9088', 's9083', 'clia waived', 'point of care', 'strep', 'flu', 'laceration', 'immediate care'],
  },
  {
    id: 'spec-nephrology',
    category: 'specialties',
    title: 'Nephrology & Dialysis Center Billing',
    subtitle: 'ESRD monthly capitation payment (MCP 90951–90970), in-center dialysis & vascular access',
    href: '/medical-billing/nephrology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['nephrology', 'dialysis', 'esrd', 'mcp', 'kidney', 'hemodialysis', 'peritoneal', '90951', '90970', 'fistula', 'ckd'],
  },
  {
    id: 'spec-ent',
    category: 'specialties',
    title: 'Otolaryngology & ENT Billing',
    subtitle: 'FESS sinus surgery (31231–31298), balloon sinuplasty & multi-antigen allergy immunotherapy',
    href: '/medical-billing/ent',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['ent', 'otolaryngology', 'sinus', 'fess', 'balloon sinuplasty', '31231', '31254', 'allergy', '95165', 'ear nose throat'],
  },
  {
    id: 'spec-rheumatology',
    category: 'specialties',
    title: 'Rheumatology & Biologic Infusion Billing',
    subtitle: 'High-cost Buy & Bill biologic J-codes, JW/JZ waste modifiers & ultrasound arthrocentesis',
    href: '/medical-billing/rheumatology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['rheumatology', 'biologics', 'infusion', 'remicade', 'rituxan', 'j-code', '20610', 'arthrocentesis', 'jw modifier', 'arthritis'],
  },
  {
    id: 'spec-pulmonology',
    category: 'specialties',
    title: 'Pulmonology & Sleep Medicine Billing',
    subtitle: 'Complete PFT panels (94010–94729), polysomnography (95810) & HSAT home sleep studies',
    href: '/medical-billing/pulmonology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pulmonology', 'sleep medicine', 'pft', 'spirometry', 'polysomnography', '95810', 'hsat', 'sleep apnea', 'cpap', 'bronchoscopy'],
  },
  {
    id: 'spec-infectious-disease',
    category: 'specialties',
    title: 'Infectious Disease & OPAT Billing',
    subtitle: 'High-complexity cognitive consults (99205/99215), OPAT home infusions & remote monitoring',
    href: '/medical-billing/infectious-disease',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['infectious disease', 'opat', 'infusion', 'antibiotics', 'g0498', 'g2212', 'prolonged service', 'inpatient consult', 'microbiology', 'hiv'],
  },
  {
    id: 'spec-allergy-immunology',
    category: 'specialties',
    title: 'Allergy, Asthma & Clinical Immunology Billing',
    subtitle: 'Percutaneous testing (95004), antigen compounding (95165) & asthma biologic J-codes',
    href: '/medical-billing/allergy-immunology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['allergy', 'immunology', 'asthma', 'antigen', '95165', '95004', 'skin prick', 'xolair', 'dupixent', 'venom immunotherapy'],
  },
  {
    id: 'spec-interventional-radiology',
    category: 'specialties',
    title: 'Interventional Radiology & Endovascular Billing',
    subtitle: 'Selective catheterization (36200–36248), transcatheter embolization (37241) & vascular supervision',
    href: '/medical-billing/interventional-radiology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['interventional radiology', 'endovascular', 'catheterization', '36245', '36200', 'embolization', '37241', 'vascular family', 'angioplasty', 'stent'],
  },
  {
    id: 'spec-oral-surgery',
    category: 'specialties',
    title: 'Oral & Maxillofacial Surgery Billing (CDT/CPT)',
    subtitle: 'Dual dental-to-medical cross-coding, orthognathic reconstruction, TMJ arthroplasty & bone grafts',
    href: '/medical-billing/oral-surgery',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['oral surgery', 'maxillofacial', 'cdt cross-coding', 'd-codes', 'orthognathic', 'tmj', '21141', '21240', 'bone graft', 'dental extraction'],
  },
  {
    id: 'spec-addiction-medicine',
    category: 'specialties',
    title: 'Addiction Medicine & SUD Billing',
    subtitle: 'Opioid Treatment Program (OTP) bundles, OBOT buprenorphine induction & definitive UDT',
    href: '/medical-billing/addiction-medicine',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['addiction medicine', 'sud', 'substance use', 'otp', 'methadone', 'buprenorphine', 'suboxone', 'g2086', 'g0480', 'kipu'],
  },
  {
    id: 'spec-gynecologic-oncology',
    category: 'specialties',
    title: 'Gynecologic Oncology & Pelvic Surgery Billing',
    subtitle: 'Radical hysterectomy (58210), pelvic lymphadenectomy (38571), HIPEC & Modifier 62 co-surgery',
    href: '/medical-billing/gynecologic-oncology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['gynecologic oncology', 'gyn onc', 'pelvic surgery', 'hysterectomy', '58210', 'hipec', 'lymphadenectomy', '38571', 'modifier 62', 'debulking'],
  },
  {
    id: 'spec-home-health-hospice',
    category: 'specialties',
    title: 'Home Health & Hospice Care Billing',
    subtitle: 'PDGM 30-day episodes, OASIS-E HIPPS scoring, 5-day NOA filing & hospice aggregate caps',
    href: '/medical-billing/home-health-hospice',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['home health', 'hospice', 'pdgm', 'hipps', 'oasis', 'noa', 'lupa', 'palliative', 'visiting nurse', 'g0154', 'q5001'],
  },
  {
    id: 'spec-wound-care',
    category: 'specialties',
    title: 'Wound Care & Hyperbaric Medicine Billing',
    subtitle: 'Excisional debridement (11042), CTP skin substitute wastage (JW/JZ) & HBOT (G0277)',
    href: '/medical-billing/wound-care',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['wound care', 'hyperbaric', 'hbot', 'debridement', '11042', 'skin substitute', 'ctp', 'q4101', 'apligraf', 'modifier jw', 'g0277'],
  },
  {
    id: 'spec-fqhc',
    category: 'specialties',
    title: 'FQHC & Community Health Clinic Billing',
    subtitle: 'Prospective Payment System (PPS) encounter rates, same-day MH splits & Medicaid wrap-around',
    href: '/medical-billing/fqhc',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['fqhc', 'rhc', 'community health', 'pps', 'g0467', 'g0466', 'g0470', 'sliding fee', 'wrap-around', 'section 330', 'look-alike', 'ub-04', '0521', '0900'],
  },
  {
    id: 'spec-sleep-medicine',
    category: 'specialties',
    title: 'Sleep Medicine & Polysomnography Billing',
    subtitle: 'In-lab PSG (95810), split-night titration (95811), HSAT (95800) & 90-day CPAP compliance',
    href: '/medical-billing/sleep-medicine',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['sleep medicine', 'polysomnography', 'psg', 'hsat', 'cpap', 'apnea', '95810', '95811', '95800', 'g0398', 'compliance', 'ahi', 'airview'],
  },
  {
    id: 'spec-nicu-picu',
    category: 'specialties',
    title: 'NICU & Pediatric Intensive Care Billing',
    subtitle: 'Per-day global critical care (99468–99476), resuscitation (99465) & line placement coding',
    href: '/medical-billing/nicu-picu',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['nicu', 'picu', 'neonatal', 'pediatric critical care', '99468', '99469', '99471', '99472', '99465', 'umbilical line', '36510', 'resuscitation'],
  },
  {
    id: 'spec-radiation-oncology',
    category: 'specialties',
    title: 'Radiation Oncology & Proton Therapy Billing',
    subtitle: 'IMRT planning (77301), weekly fraction management (77427), physics & proton therapy (77520)',
    href: '/medical-billing/radiation-oncology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['radiation oncology', 'proton therapy', 'imrt', 'sbrt', 'srs', '77301', '77427', '77300', '77334', '77520', 'astronomy', 'dosimetry'],
  },
  {
    id: 'spec-cardiac-ep',
    category: 'specialties',
    title: 'Cardiac Electrophysiology & Catheter Ablation Billing',
    subtitle: 'Ablation CPT 93656/93653, 3D mapping (93613), ICE & remote CIED monitoring',
    href: '/medical-billing/cardiac-electrophysiology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['cardiac ep', 'electrophysiology', 'ablation', 'afib', 'pvi', 'svt', 'vt', '93656', '93653', '93613', '93662', 'pacemaker', 'icd', 'telemetry'],
  },
  {
    id: 'spec-plastic-surgery',
    category: 'specialties',
    title: 'Plastic & Reconstructive Surgery Billing',
    subtitle: 'Reconstructive prior-auths, Schnur scale, WHCRA breast reconstruction & tissue flaps',
    href: '/medical-billing/plastic-reconstructive-surgery',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['plastic surgery', 'reconstructive', 'breast reduction', 'schnur', '19318', 'blepharoplasty', '15823', 'panniculectomy', '15830', 'whcra', 'flaps', '14000'],
  },
  {
    id: 'spec-retina-vitreous',
    category: 'specialties',
    title: 'Ophthalmology & Vitreoretinal Surgery Billing',
    subtitle: 'Anti-VEGF intravitreal injections (67028), buy-and-bill J-codes, bilateral modifiers & vitrectomy',
    href: '/medical-billing/retina-vitreous',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['retina', 'ophthalmology', 'anti-vegf', 'eylea', 'j0178', 'lucentis', 'vabysmo', 'vitrectomy', '67028', '67108', 'oct', '92134', 'fluorescein'],
  },
  {
    id: 'spec-vascular-surgery',
    category: 'specialties',
    title: 'Vascular Surgery & Endovascular Interventions Billing',
    subtitle: 'EVAR/TEVAR aneurysm repair, lower extremity PAD hierarchy, dialysis fistula & venous ablation',
    href: '/medical-billing/vascular-surgery',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['vascular surgery', 'endovascular', 'pad', 'revascularization', 'evar', 'tevar', '34701', '37224', '37226', 'av fistula', '36821', 'thrombectomy', 'obl'],
  },
  {
    id: 'spec-spine-surgery',
    category: 'specialties',
    title: 'Orthopedic Spine Surgery & Complex Arthrodesis Billing',
    subtitle: 'ACDF (22551), TLIF/PLIF (22633), segmental instrumentation, Modifier 62 co-surgery & neuromonitoring',
    href: '/medical-billing/spine-surgery',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['spine surgery', 'orthopedic spine', 'neurosurgery', 'arthrodesis', 'tlif', 'plif', 'acdf', 'alif', '22633', '22551', '22842', '22845', '20930', '20936', 'modifier 62'],
  },
  {
    id: 'spec-urogynecology',
    category: 'specialties',
    title: 'Gynecologic Minimally Invasive Surgery & Urogynecology Billing',
    subtitle: 'Sacrocolpopexy (57425), mid-urethral sling (57288), multi-channel urodynamics & prolapse repair',
    href: '/medical-billing/urogynecology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['urogynecology', 'fpmrs', 'sacrocolpopexy', '57425', 'sling', '57288', 'urodynamics', '51729', 'colporrhaphy', '57260', 'pop-q', 'cystoscopy', '52000'],
  },
  {
    id: 'spec-cardiothoracic-surgery',
    category: 'specialties',
    title: 'Cardiothoracic Surgery & ECMO Billing',
    subtitle: 'CABG arterial/venous combos, endoscopic vein harvest (+33508), valve repairs & ECMO cannulation',
    href: '/medical-billing/cardiothoracic-surgery',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['cardiothoracic surgery', 'cardiovascular surgery', 'cabg', '33533', '33517', '33508', 'ecmo', '33946', '33947', '33954', 'aortic valve', 'mitral valve', '33405', '33430', 'iabp', 'impella'],
  },
  {
    id: 'spec-pediatric-orthopedics',
    category: 'specialties',
    title: 'Pediatric Orthopedics & Scoliosis Deformity Billing',
    subtitle: 'Spinal deformity fusions (22800–22804), pelvic fixation (+22848), osteotomies & clubfoot casting',
    href: '/medical-billing/pediatric-orthopedics',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric orthopedics', 'scoliosis', 'spinal deformity', 'arthrodesis', '22800', '22802', '22804', '22844', '22848', 's2ai', 'ponte osteotomy', '22210', 'ponseti', 'clubfoot', 'ddh'],
  },
  {
    id: 'spec-trauma-critical-care',
    category: 'specialties',
    title: 'Surgical Critical Care & Trauma Surgery Billing',
    subtitle: 'Damage control laparotomy (49000/49002), modifier 58 vs 78 & critical care time carve-outs',
    href: '/medical-billing/trauma-critical-care',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['trauma surgery', 'surgical critical care', 'acute care surgery', 'damage control laparotomy', '49000', '49002', '13160', '11044', '32100', '32110', 'wound vac', 'barker vac', 'modifier 58', 'modifier 78', '99291', '99292', 'central line', '36556', 'a-line', '36620'],
  },
  {
    id: 'spec-pediatric-pulmonology',
    category: 'specialties',
    title: 'Pediatric Allergy, Pulmonology & Cystic Fibrosis Billing',
    subtitle: 'Pediatric spirometry unbundling defense (94010 vs 94060), sweat test & CFTR prior authorization',
    href: '/medical-billing/pediatric-pulmonology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric pulmonology', 'pediatric allergy', 'cystic fibrosis', 'cftr', 'trikafta', 'kalydeco', 'spirometry', 'pft', '94010', '94060', '94726', 'sweat chloride', '82435', 'allergy prick', '95004', 'aerosol', '94640'],
  },
  {
    id: 'spec-hepatobiliary-surgery',
    category: 'specialties',
    title: 'Hepatobiliary Surgery & Complex Liver Resection Billing',
    subtitle: 'Anatomic hepatectomies (47125/47130), downcoding defense, vascular repairs & Roux-en-Y',
    href: '/medical-billing/hepatobiliary-surgery',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['hepatobiliary surgery', 'liver resection', 'hepatectomy', 'trisegmentectomy', '47125', '47130', '47122', '47120', 'roux-en-y', '47760', 'vascular reconstruction', '35221', 'ious', '76998', 'modifier 62', 'co-surgeon'],
  },
  {
    id: 'spec-pediatric-heme-onc',
    category: 'specialties',
    title: 'Pediatric Hematology-Oncology & Cellular Therapy Billing',
    subtitle: 'Pediatric CAR-T cell infusions (0540T/Q2042), stem cell transplants & CRS critical care',
    href: '/medical-billing/pediatric-heme-onc',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric oncology', 'pediatric hematology', 'car-t', 'kymriah', '0540t', 'q2042', 'stem cell transplant', 'bmt', '38240', '38241', '38205', 'bone marrow biopsy', '38222', 'intrathecal chemo', '96450', 'crs', '99291'],
  },
  {
    id: 'spec-colorectal-surgery',
    category: 'specialties',
    title: 'Colorectal Surgery & Complex Pelvic Exenteration Billing',
    subtitle: 'TME, low anterior resection (45119/45110), pelvic exenteration (45126) & protective loop stomas',
    href: '/medical-billing/colorectal-surgery',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['colorectal surgery', 'pelvic exenteration', 'lar', 'low anterior resection', 'j-pouch', '45119', '45110', '45126', 'loop ileostomy', '44320', 'co-surgeon', 'modifier 62', 'modifier 66', 'tme'],
  },
  {
    id: 'spec-pediatric-neuro-oncology',
    category: 'specialties',
    title: 'Pediatric Neuro-Oncology & Posterior Fossa Surgery Billing',
    subtitle: 'Posterior fossa craniotomies (61518/61520), continuous IONM (95940/95941), and neuronavigation',
    href: '/medical-billing/pediatric-neuro-oncology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric neurosurgery', 'pediatric neuro-oncology', 'posterior fossa', 'medulloblastoma', 'ependymoma', 'craniotomy', '61518', '61520', 'ionm', '95940', '95941', 'evd', '61107', 'vp shunt', '62223'],
  },
  {
    id: 'spec-pancreatic-surgery',
    category: 'specialties',
    title: 'Complex Pancreatic Surgery & Whipple Resection Billing',
    subtitle: 'Whipple pancreaticoduodenectomy (48150/48153), mesenteric vein reconstruction (+35221), and co-surgery',
    href: '/medical-billing/pancreatic-surgery',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pancreatic surgery', 'whipple', 'pancreaticoduodenectomy', '48150', '48153', '48154', '48155', '48140', '48548', 'vascular reconstruction', '35221', 'lymphadenectomy', '38747', 'jejunostomy', '44010', 'modifier 62', 'surgical oncology', 'hpb'],
  },
  {
    id: 'spec-pediatric-craniofacial',
    category: 'specialties',
    title: 'Pediatric Craniofacial & Cleft Palate Surgery Billing',
    subtitle: 'Cleft palatoplasty (42200-42210), midface LeFort I (21141), cranial vault (21175) & Mod 58',
    href: '/medical-billing/pediatric-craniofacial',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric craniofacial', 'cleft palate', 'palatoplasty', '42200', '42205', '42210', 'alveolar bone graft', 'midface lefort', '21141', 'cranial vault remodeling', '21175', 'craniosynostosis', 'modifier 58', 'vpi', 'velopharyngeal insufficiency', 'pediatric plastic surgery'],
  },
  {
    id: 'spec-complex-spine-deformity',
    category: 'specialties',
    title: 'Complex Spine Deformity & Vertebral Column Resection Billing',
    subtitle: '3-column osteotomy (22206/22207), add-on segments (+22208), long constructs & pelvic fixation',
    href: '/medical-billing/complex-spine-deformity',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['complex spine deformity', 'vertebral column resection', 'vcr', '3-column osteotomy', 'pedicle subtraction osteotomy', 'pso', '22206', '22207', '22208', 'posterior osteotomy', '22210', '22212', '22214', 'spinal deformity', 'arthrodesis', '22842', '22843', '22844', 'pelvic fixation', '22848', 'biomechanical interbody', '22853', 'ionm', '95940', '95941', 'modifier 62', 'co-surgery'],
  },
  {
    id: 'spec-pediatric-transplant',
    category: 'specialties',
    title: 'Pediatric Solid Organ Transplant & Intestinal Rehabilitation Billing',
    subtitle: 'STEP enteroplasty (44130), allotransplant (44135/47135), organ acquisition Worksheet D-4 & Mod 24',
    href: '/medical-billing/pediatric-transplant',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric transplant', 'intestinal rehabilitation', 'short bowel syndrome', 'step enteroplasty', 'serial transverse enteroplasty', '44130', 'intestinal allotransplantation', '44132', '44133', '44135', 'liver transplant', '47135', 'reduced-size liver', '47140', 'split liver', '47141', 'kidney transplant', '50360', '50365', 'organ acquisition', 'worksheet d-4', 'back-table bench surgery', '44715', '44720', 'post-transplant critical care', '99291', 'modifier 24'],
  },
  {
    id: 'spec-cardiac-lvad-reoperation',
    category: 'specialties',
    title: 'Complex Adult Cardiac Reoperation & Ventricular Assist Devices (LVAD) Billing',
    subtitle: 'Durable LVAD (33979), redo sternotomy add-on (+33530), and concomitant valve repairs',
    href: '/medical-billing/cardiac-lvad-reoperation',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['cardiac surgery', 'lvad', 'left ventricular assist device', 'mechanical circulatory support', 'mcs', 'heart failure', '33979', 'temporary vad', '33975', 'redo sternotomy', '33530', 'tricuspid annuloplasty', '33464', 'aortic valve closure', '33405', 'rv failure', 'critical care', '99291', 'modifier 62', 'co-surgery'],
  },
  {
    id: 'spec-pediatric-epilepsy-surgery',
    category: 'specialties',
    title: 'Pediatric Epilepsy Surgery & Hemispherotomy Billing',
    subtitle: 'Stereo-EEG (61760), robotic neuronavigation (+61781), staged hemispherotomy (61543) & Mod 58',
    href: '/medical-billing/pediatric-epilepsy-surgery',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric neurosurgery', 'pediatric epilepsy', 'epilepsy surgery', 'stereo-eeg', 'seeg', 'depth electrodes', '61760', 'subdural grid', '61533', 'cranial neuronavigation', '61781', 'hemispherotomy', 'hemispherectomy', '61543', 'laser ablation', 'litt', '61736', 'video-eeg', '95724', 'modifier 58'],
  },
  {
    id: 'spec-skull-base-surgery',
    category: 'specialties',
    title: 'Complex Lateral Skull Base Surgery & Acoustic Neuroma Billing',
    subtitle: 'Translabyrinthine (61526), retrosigmoid (61530), dual-attending Mod 62 & +69990',
    href: '/medical-billing/skull-base-surgery',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['skull base surgery', 'acoustic neuroma', 'vestibular schwannoma', 'translabyrinthine', '61526', 'retrosigmoid', '61530', 'middle fossa', '61590', 'infratemporal', 'co-surgery', 'modifier 62', 'operating microscope', '69990', 'cranial nerve monitoring', 'facial nerve', '95940', 'fat graft', '20926'],
  },
  {
    id: 'spec-pediatric-airway',
    category: 'specialties',
    title: 'Pediatric Airway Reconstruction & Complex Laryngotracheal Stenosis Billing',
    subtitle: 'Single/double-stage LTR (31587, 31590), CTR (31584), rib graft (+20902) & Mod 58',
    href: '/medical-billing/pediatric-airway',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric airway', 'pediatric ent', 'laryngotracheal reconstruction', 'ltr', 'subglottic stenosis', 'cricotracheal resection', 'ctr', '31587', '31590', '31584', 'costal cartilage', 'rib graft', '20902', 'tracheoplasty', '31750', 'balloon dilation', '31630', 'staged bronchoscopy', '31622', 'modifier 58', 'modifier 59'],
  },
  {
    id: 'spec-adult-congenital-heart-disease',
    category: 'specialties',
    title: 'Adult Congenital Heart Disease (ACHD) & Fontan Conversion Billing',
    subtitle: 'Fontan conversion (33737), redo sternotomy (+33530), cryoablation Maze (+33257/+33258) & PVR',
    href: '/medical-billing/adult-congenital-heart-disease',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['adult congenital heart disease', 'achd', 'fontan conversion', 'extracardiac conduit', 'tcpc', '33737', 'fontan revision', '33735', 'rvot reconstruction', '33608', 'redo sternotomy', '33530', 'cryoablation maze', '33257', '33258', 'pulmonary valve replacement', 'pvr', '33475', 'modifier 51', 'fenestration device closure', '93581', 'ecmo', '33946'],
  },
  {
    id: 'spec-pediatric-facial-reanimation',
    category: 'specialties',
    title: 'Pediatric Complex Facial Reanimation & Free Gracilis Transfer Billing',
    subtitle: 'Cross-face sural graft (64890), free gracilis (15756), masseteric transfer (64864) & Mod 58',
    href: '/medical-billing/pediatric-facial-reanimation',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric facial reanimation', 'moebius syndrome', 'facial paralysis', 'cross-face nerve graft', 'cfng', 'sural nerve', '64890', '64891', 'free gracilis transfer', '15756', 'masseteric nerve transposition', '64864', 'operating microscope', '69990', 'fascia lata', '20926', 'modifier 58', 'staged procedure'],
  },
  {
    id: 'spec-pediatric-spine-eos',
    category: 'specialties',
    title: 'Pediatric Early-Onset Scoliosis (EOS) & Growing Rods Billing',
    subtitle: 'MCGR (22842), staged distraction (+22849-58), VEPTR (+22848), and outpatient clinics',
    href: '/medical-billing/pediatric-spine-eos',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric spine', 'early-onset scoliosis', 'eos', 'growing rods', 'mcgr', 'magec', '22842', 'veptr', 'thoracic insufficiency', '22848', 'staged distraction', '22849', '22850', 'modifier 58', 'ponte osteotomy', '22212', '99214', '72082'],
  },
  {
    id: 'spec-hipec-surgical-oncology',
    category: 'specialties',
    title: 'Cytoreductive Surgery (CRS) & HIPEC Chemoperfusion Billing',
    subtitle: 'Multivisceral peritonectomy (49205), HIPEC perfusion (+96560), Mod 62 & colectomy (44140)',
    href: '/medical-billing/hipec-surgical-oncology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['hipec', 'cytoreductive surgery', 'crs', 'peritonectomy', '49205', '49204', 'hyperthermic chemoperfusion', '96560', 'co-surgery', 'modifier 62', 'colectomy', '44140', 'splenectomy', '38100', 'critical care', '99291', 'modifier 24'],
  },
  {
    id: 'spec-pediatric-craniosynostosis',
    category: 'specialties',
    title: 'Pediatric Craniosynostosis & Cranial Vault Remodeling Billing',
    subtitle: 'FOA (21175), complex CVR (21180), co-surgeon Mod 62 matching, bone graft (20900) & helmet DME',
    href: '/medical-billing/pediatric-craniosynostosis',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric craniosynostosis', 'cranial vault remodeling', 'fronto-orbital advancement', 'foa', '21175', '21180', 'craniectomy', '61558', 'strip craniectomy', '61550', 'co-surgeon', 'modifier 62', 'cranial molding orthosis', 'helmet dme', 'l0112', 'bone graft', '20900', 'pediatric neurosurgery', 'craniofacial plastics'],
  },
  {
    id: 'spec-robotic-urologic-oncology',
    category: 'specialties',
    title: 'Cytoreductive Prostatectomy & High-Risk Robotic Urologic Oncology Billing',
    subtitle: 'RARP (55866), extended pelvic LND (+38572), partial nephrectomy (50543) & neobladder (51596)',
    href: '/medical-billing/robotic-urologic-oncology',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['robotic urology', 'urologic oncology', 'rarp', 'prostatectomy', '55866', 'extended lymphadenectomy', '38572', 'partial nephrectomy', '50543', 'radical cystectomy', '51596', 'neobladder', 'ileal conduit', 'modifier 22', 'modifier 59', 's2900'],
  },
  {
    id: 'spec-pediatric-cdh-ecmo',
    category: 'specialties',
    title: 'Pediatric Congenital Diaphragmatic Hernia (CDH) & ECMO Billing',
    subtitle: 'CDH repair (39503), Gore-Tex patch (+49568), VA-ECMO cutdown (+33946) & staged silo (49605-58)',
    href: '/medical-billing/pediatric-cdh-ecmo',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric cdh', 'congenital diaphragmatic hernia', '39503', 'bochdalek', 'ecmo', 'va-ecmo', '33946', '33947', 'patch closure', '49568', 'silo', '49605', 'modifier 58', 'modifier 59', 'neonatal critical care', '99468', 'pediatric surgery'],
  },
  {
    id: 'spec-taaa-fenestrated-evar',
    category: 'specialties',
    title: 'Thoracoabdominal Aortic Aneurysm (TAAA) & FEVAR Billing',
    subtitle: 'Visceral FEVAR (34841-34848), Crawford open repair (33877), lumbar CSF drain (62272) & Mod 62',
    href: '/medical-billing/taaa-fenestrated-evar',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['taaa', 'fevar', 'bevar', 'thoracoabdominal aneurysm', 'crawford repair', '33877', '34844', '34843', '34842', 'lumbar csf drain', '62272', 'visceral branches', 'bridging stent', '37236', 'modifier 62', 'co-surgeon', 'vascular surgery', 'aortic surgery'],
  },
  {
    id: 'spec-pediatric-vascular-malformations',
    category: 'specialties',
    title: 'Pediatric Vascular Malformations, Hemangiomas & Sclerotherapy Billing',
    subtitle: 'Image-guided sclerotherapy (37241/49185), Bleomycin J9040, dual imaging & Mod 58',
    href: '/medical-billing/pediatric-vascular-malformations',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric vascular malformations', 'hemangiomas', 'sclerotherapy', 'venous malformation', 'lymphatic malformation', 'avm', '37241', '49185', '37242', 'bleomycin', 'j9040', 'sotradecol', '76937', '77002', 'modifier 58', 'interventional radiology', 'pediatric ir'],
  },
  {
    id: 'spec-orthopedic-oncology-limb-salvage',
    category: 'specialties',
    title: 'Complex Orthopedic Oncology & Limb Salvage Reconstruction Billing',
    subtitle: 'Radical bone resection (27075/27645), modular mega-prosthesis (27599-22) & rotational flaps',
    href: '/medical-billing/orthopedic-oncology-limb-salvage',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['orthopedic oncology', 'sarcoma', 'bone cancer', 'osteosarcoma', 'limb salvage', 'mega-prosthesis', '27075', '27645', '27077', '27599', '27299', 'modifier 22', 'rotational muscle flap', 'gastrocnemius flap', '15734', 'free flap', '15756', 'modifier 62', 'co-surgery', 'surgical oncology'],
  },
  {
    id: 'spec-pediatric-dbs-neuromodulation',
    category: 'specialties',
    title: 'Pediatric Deep Brain Stimulation & Neuromodulation Billing',
    subtitle: 'Stereotactic lead with MER (61867/+61868), headframe bundling & dual-channel IPGs',
    href: '/medical-billing/pediatric-dbs-neuromodulation',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric dbs', 'deep brain stimulation', 'neuromodulation', 'pediatric neurosurgery', 'dystonia', 'epilepsy', '61867', '61868', '61863', 'microelectrode recording', 'mer mapping', 'ipg generator', '61886', '61885', 'headframe', '20660', 'modifier 59', 'modifier 58', 'fluoroscopy', '77003'],
  },
  {
    id: 'spec-panfacial-trauma-reconstruction',
    category: 'specialties',
    title: 'Open Craniofacial Fracture & Panfacial Trauma Reconstruction Billing',
    subtitle: 'Le Fort I/II/III (21422–21436), ZMC (21360/21365), mandibular plating & IMF',
    href: '/medical-billing/panfacial-trauma-reconstruction',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['panfacial trauma', 'craniofacial fracture', 'le fort iii', '21435', '21436', 'le fort ii', '21423', 'le fort i', '21422', 'zmc fracture', '21365', 'mandibular fracture', '21462', 'imf', 'intermaxillary fixation', '21110', 'orbital blowout', '21390', 'bone graft', '20900', 'omfs', 'facial trauma', 'level 1 trauma'],
  },
  {
    id: 'spec-pediatric-biochemical-genetics',
    category: 'specialties',
    title: 'Pediatric Inborn Errors of Metabolism & Biochemical Genetics Billing',
    subtitle: 'Tandem MS/MS amino acids (82139), urine organics (83918) & medical formula prior-auth',
    href: '/medical-billing/pediatric-biochemical-genetics',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric biochemical genetics', 'inborn errors of metabolism', 'metabolic genetics', 'amino acids', '82139', '82136', 'urine organic acids', '83918', 'acylcarnitine', '82010', 'prolonged consultation', '99417', 'medical food', 'metabolic formula', 'b4162', 'b4157', 'rare disease', 'msud', 'pku', 'mma'],
  },
  {
    id: 'spec-skull-base-cerebrovascular-bypass',
    category: 'specialties',
    title: 'Complex Skull Base Cerebrovascular Bypass & Microvascular EC-IC Anastomosis Billing',
    subtitle: 'STA-MCA bypass (61711), orbitozygomatic approaches & autologous graft harvest',
    href: '/medical-billing/skull-base-cerebrovascular-bypass',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['cerebrovascular bypass', 'skull base bypass', 'ec-ic bypass', 'sta-mca', '61711', 'vein graft harvest', '35500', 'radial artery', '35600', 'orbitozygomatic craniotomy', '61592', 'aneurysm', 'giant aneurysm', 'operating microscope', '69990', 'modifier 62', 'co-surgery', 'neurosurgery'],
  },
  {
    id: 'spec-pediatric-mibg-radiopharmaceutical',
    category: 'specialties',
    title: 'Pediatric Targeted Radioiodine & MIBG Therapy Billing',
    subtitle: 'Therapeutic I-131 MIBG (79445), HCPCS A9508 pass-through, medical physics & stem cell rescue',
    href: '/medical-billing/pediatric-mibg-radiopharmaceutical',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric mibg', 'i-131 mibg', 'iobenguane', '79445', 'a9508', 'neuroblastoma', 'medical physics', '77336', 'spect ct dosimetry', '78830', 'stem cell rescue', '38240', 'nuclear oncology', 'radiopharmaceutical'],
  },
  {
    id: 'spec-complex-robotic-hernia-reconstruction',
    category: 'specialties',
    title: 'Multi-Compartment Complex Robotic & Laparoscopic Hernia Reconstruction Billing',
    subtitle: 'CPT 2023+ anterior hernia (49591–49618), TAR component separation (+49622) & mesh (+49623)',
    href: '/medical-billing/complex-robotic-hernia-reconstruction',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['complex hernia', 'robotic hernia', 'abdominal wall reconstruction', 'tar', 'transversus abdominis release', '49622', '49623', '49591', '49593', '49595', '49613', '49615', '49617', 'mesh placement', 'ventral hernia', 'incisional hernia'],
  },
  {
    id: 'spec-pediatric-tpiat-islet-transplant',
    category: 'specialties',
    title: 'Pediatric Total Pancreatectomy with Islet Autotransplantation (TPIAT) Billing',
    subtitle: 'Total pancreatectomy (48155), cGMP islet processing (48805) & intraportal infusion (+48554)',
    href: '/medical-billing/pediatric-tpiat-islet-transplant',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric tpiat', 'islet autotransplantation', 'pancreatectomy', '48155', 'islet isolation', '48805', '48554', 'prss1', 'hereditary pancreatitis', 'chronic pancreatitis', 'cellular therapy', 'portal vein'],
  },
  {
    id: 'spec-endoscopic-pituitary-odontoid-resection',
    category: 'specialties',
    title: 'Endoscopic Transnasal Odontoid & Pituitary Skull Base Resection Billing',
    subtitle: 'Transnasal odontoidectomy (61575), pituitary resection (61548) & nasoseptal flap (+15730)',
    href: '/medical-billing/endoscopic-pituitary-odontoid-resection',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['endoscopic skull base', 'transnasal odontoidectomy', '61575', 'pituitary adenoma', '61548', 'nasoseptal flap', '15730', 'neuronavigation', '61782', 'modifier 62', 'co-surgery', 'rhinology', 'neurosurgery'],
  },
  {
    id: 'spec-pediatric-single-ventricle-palliation',
    category: 'specialties',
    title: 'Pediatric Single-Ventricle Congenital Heart Disease Palliation Billing',
    subtitle: 'Stage 1 Norwood (33619), Sano/BT shunt, Glenn (33767), Fontan (33737) & delayed sternal closure (+33530)',
    href: '/medical-billing/pediatric-single-ventricle-palliation',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric single ventricle', 'norwood', '33619', 'sano shunt', '33766', 'blalock taussig', '33750', 'glenn', '33767', 'fontan', '33737', 'hlhs', 'pulmonary artery reconstruction', '33688', 'delayed sternal closure', '33530', 'modifier 58', 'congenital heart surgery'],
  },
  {
    id: 'spec-minimally-invasive-adult-spine-deformity',
    category: 'specialties',
    title: 'Multi-Level Minimally Invasive Adult Spinal Deformity & Lateral Interbody Fusion Billing',
    subtitle: 'LLIF/XLIF (22558/+22552), ALLR anterior release (+Mod 22), percutaneous instrumentation & S2AI (+22848)',
    href: '/medical-billing/minimally-invasive-adult-spine-deformity',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['adult spinal deformity', 'llif', 'xlif', 'lateral lumbar interbody fusion', '22558', '22552', 'allr', 'modifier 22', 'percutaneous instrumentation', '22842', '22843', 'spinopelvic fixation', '22848', 'biomechanical cages', '22853', 'neuronavigation', '61783', 'ionm', '95940'],
  },
  {
    id: 'spec-pediatric-sacrococcygeal-teratoma',
    category: 'specialties',
    title: 'Pediatric Sacrococcygeal Teratoma (SCT) & Congenital Presacral Tumor Billing',
    subtitle: 'En-bloc coccygectomy (27075-59), combined abdominoperineal (49000-59) & levatorplasty',
    href: '/medical-billing/pediatric-sacrococcygeal-teratoma',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric sct', 'sacrococcygeal teratoma', 'presacral tumor', 'coccygectomy', '27075', 'altman type', '49220', '45120', 'abdominoperineal approach', '49000', 'median sacral artery', '37617', 'levatorplasty', '49900', 'neonatal surgery', 'pediatric surgical oncology'],
  },
  {
    id: 'spec-adult-retroperitoneal-sarcoma',
    category: 'specialties',
    title: 'Complex Adult Retroperitoneal Sarcoma & Multivisceral Compartment Resection Billing',
    subtitle: 'Sarcoma excision >10 cm (49205), en-bloc nephrectomy (50240-59) & IVC replacement (35281)',
    href: '/medical-billing/adult-retroperitoneal-sarcoma',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['retroperitoneal sarcoma', 'multivisceral resection', '49205', 'radical nephrectomy', '50240', 'adrenalectomy', '60540', 'colectomy', '44140', 'ivc replacement', '35281', 'modifier 62', 'co-surgery', 'surgical oncology'],
  },
  {
    id: 'spec-pediatric-tef-esophageal-atresia',
    category: 'specialties',
    title: 'Pediatric Tracheoesophageal Fistula & Esophageal Atresia (TEF/EA) Repair Billing',
    subtitle: 'Thoracic esophagoplasty (43312/43305), bronchoscopy (+31622-59) & staged Foker (Mod -58)',
    href: '/medical-billing/pediatric-tef-esophageal-atresia',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric tef', 'esophageal atresia', 'tracheoesophageal fistula', '43312', '43305', '43314', 'foker elongation', 'modifier 58', 'gastrostomy', '43653', 'bronchoscopy', '31622', 'neonatal surgery', 'pediatric thoracic surgery'],
  },
  {
    id: 'spec-diep-flap-breast-reconstruction',
    category: 'specialties',
    title: 'Complex Adult Reconstructive Microsurgery & Autologous DIEP Flap Breast Reconstruction Billing',
    subtitle: 'Bilateral DIEP flap (19364-50), microscope (+69990), ICG (+15860) & WHCRA statutory parity',
    href: '/medical-billing/diep-flap-breast-reconstruction',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['diep flap', 'breast reconstruction', 'autologous microsurgery', '19364', 'modifier 50', 'bilateral flap', 'operating microscope', '69990', 'icg angiography', '15860', 'second vein anastomosis', '35201', 'whcra', 'plastic reconstructive surgery'],
  },
  {
    id: 'spec-pediatric-hirschsprung-pull-through',
    category: 'specialties',
    title: 'Pediatric Hirschsprung Disease & Transanal Endorectal Pull-Through (TERPT / Soave / Duhamel) Billing',
    subtitle: 'Pull-through proctectomy (45120/45112), leveling biopsies (+44150-59) & staged diversion (Mod -58)',
    href: '/medical-billing/pediatric-hirschsprung-pull-through',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['pediatric hirschsprung', 'pull through', 'soave', 'terpt', 'duhamel', 'swenson', 'aganglionic megacolon', '45120', '45112', 'leveling biopsies', '44150', 'laparoscopy', '49320', 'modifier 58', 'staged colostomy', '44620', 'neonatal colorectal surgery'],
  },
  {
    id: 'spec-head-and-neck-free-flap-reconstruction',
    category: 'specialties',
    title: 'Complex Adult Head & Neck Microvascular Free Flap Reconstruction (Fibula / ALT Free Flap) Billing',
    subtitle: 'Composite fibula (20955), ALT (15756), rigid plating (+21247-59), microscope (+69990) & tracheostomy (+31600-59)',
    href: '/medical-billing/head-and-neck-free-flap-reconstruction',
    badge: 'Specialty',
    badgeVariant: 'blue',
    keywords: ['head and neck free flap', 'fibula free flap', '20955', 'alt free flap', '15756', 'mandibular plating', '21247', 'microscope', '69990', 'neck dissection', '38724', 'tracheostomy', '31600', 'modifier 62', 'co-surgery', 'microvascular reconstruction'],
  },
  {
    id: 'spec-all',
    category: 'specialties',
    title: 'All Billing Specialties Overview',
    subtitle: 'Tailored workflows across 86+ medical and surgical specialties',
    href: '/specialties',
    badge: 'All Specialties',
    badgeVariant: 'teal',
    keywords: ['specialties', 'all', 'pediatrics', 'neurology', 'gastroenterology', 'urology', 'oncology', 'radiology', 'pain management', 'podiatry', 'anesthesia', 'asc', 'oral surgery', 'interventional radiology', 'addiction medicine', 'gynecologic oncology', 'home health', 'hospice', 'wound care', 'fqhc', 'sleep medicine', 'nicu', 'picu', 'radiation oncology', 'cardiac electrophysiology', 'plastic surgery', 'retina', 'ophthalmology', 'vascular surgery', 'spine surgery', 'urogynecology', 'cardiothoracic surgery', 'pediatric orthopedics', 'trauma surgery', 'surgical critical care', 'pediatric pulmonology', 'cystic fibrosis', 'hepatobiliary surgery', 'liver resection', 'pediatric hematology', 'pediatric cellular therapy', 'colorectal surgery', 'pelvic exenteration', 'pediatric neurosurgery', 'posterior fossa surgery', 'pancreatic surgery', 'whipple resection', 'pediatric craniofacial', 'cleft palate', 'spine deformity', 'vertebral column resection', 'pediatric transplant', 'step enteroplasty', 'cardiac reoperation', 'lvad', 'pediatric epilepsy', 'hemispherotomy', 'skull base surgery', 'acoustic neuroma', 'pediatric airway', 'laryngotracheal reconstruction', 'adult congenital heart disease', 'fontan conversion', 'pediatric facial reanimation', 'free gracilis', 'pediatric spine', 'early-onset scoliosis', 'growing rods', 'mcgr', 'hipec', 'cytoreductive surgery', 'pediatric craniosynostosis', 'cranial vault remodeling', 'robotic urology', 'robotic oncology', 'pediatric cdh', 'congenital diaphragmatic hernia', 'ecmo', 'taaa', 'fevar', 'aortic aneurysm', 'pediatric vascular malformations', 'sclerotherapy', 'orthopedic oncology', 'limb salvage', 'mega-prosthesis', 'pediatric dbs', 'deep brain stimulation', 'panfacial trauma', 'facial fractures', 'le fort', 'biochemical genetics', 'metabolic disorders', 'skull base bypass', 'ec-ic bypass', 'pediatric mibg', 'neuroblastoma', 'robotic hernia', 'tar component separation', 'pediatric tpiat', 'islet transplant', 'endoscopic skull base', 'odontoidectomy', 'single ventricle', 'norwood', 'glenn', 'fontan', 'adult spine deformity', 'llif', 'xlif', 'pediatric sct', 'sacrococcygeal teratoma', 'retroperitoneal sarcoma', 'pediatric tef', 'esophageal atresia', 'diep flap', 'breast reconstruction', 'pediatric hirschsprung', 'head and neck free flap'],
  },
];

// Core Services
const SERVICE_ITEMS: SearchItem[] = [
  {
    id: 'srv-coding',
    category: 'services',
    title: 'Medical Coding Services',
    subtitle: 'AAPC & AHIMA certified coders for ICD-10, CPT, and HCPCS',
    href: '/services/medical-coding',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['coding', 'medical coding', 'icd-10', 'cpt', 'aapc', 'ahima', 'modifiers', 'hcpcs'],
  },
  {
    id: 'srv-claims',
    category: 'services',
    title: 'Claims Submission & Billing',
    subtitle: 'Daily 24-hour EDI scrubbing and automated transmission',
    href: '/services/claims-billing',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['claims', 'submission', 'edi', '837p', '837i', 'billing', 'scrubbing'],
  },
  {
    id: 'srv-payment',
    category: 'services',
    title: 'Payment Posting & Reconciliation',
    subtitle: 'Automated 835 ERA posting, zero-pay audits & manual EOBs',
    href: '/services/payment-posting',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['payment', 'posting', 'era', '835', 'eob', 'reconciliation', 'zero pay'],
  },
  {
    id: 'srv-denials',
    category: 'services',
    title: 'Denial Management & Appeals',
    subtitle: '48-hour denial triage with AI-assisted clinical appeal letters',
    href: '/services/denial-management',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['denial', 'management', 'appeals', 'overturn', 'peer to peer', 'underpayments'],
  },
  {
    id: 'srv-credentialing',
    category: 'services',
    title: 'Provider Credentialing & Contracting',
    subtitle: 'CAQH, NPI, PECOS and payer contract fee negotiations',
    href: '/services/credentialing',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['credentialing', 'caqh', 'enrollment', 'pecos', 'medicare enrollment', 'fee schedule'],
  },
  {
    id: 'srv-eligibility',
    category: 'services',
    title: 'Eligibility & Benefits Verification',
    subtitle: 'Real-time 270/271 EDI checks 48h prior to patient visits',
    href: '/services/eligibility-verification',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['eligibility', 'benefits', 'verification', '270', '271', 'copay', 'coverage'],
  },
  {
    id: 'srv-prior-auth',
    category: 'services',
    title: 'Prior Authorization Management',
    subtitle: 'Fast-track precertification submission and tracking',
    href: '/services/prior-authorization',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['prior authorization', 'prior auth', 'precertification', 'auth', 'peer to peer'],
  },
  {
    id: 'srv-collections',
    category: 'services',
    title: 'Patient Billing & Collections',
    subtitle: 'Clear statements, online payment portals & empathetic recovery',
    href: '/services/patient-collections',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['patient collections', 'patient billing', 'statement', 'portal', 'balance'],
  },
  {
    id: 'srv-compliance',
    category: 'services',
    title: 'Compliance & Chart Auditing',
    subtitle: 'Quarterly E/M audits, HIPAA safeguards and risk reviews',
    href: '/services/compliance-auditing',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['compliance', 'auditing', 'hipaa', 'chart audit', 'e/m audit', 'risk'],
  },
  {
    id: 'srv-ar-followup',
    category: 'services',
    title: 'AR Follow-Up & Aging Recovery',
    subtitle: 'Systematic aging bucket teardown from day 31 to 120+',
    href: '/services/ar-followup',
    badge: 'Core Service',
    badgeVariant: 'teal',
    keywords: ['ar follow up', 'aging', 'aging recovery', 'aging report', 'unpaid claims'],
  },
];

// Key Conversion Actions & Guides
const ACTION_ITEMS: SearchItem[] = [
  {
    id: 'act-portal-demo',
    category: 'actions',
    title: 'Provider Portal & Analytics Live Sandbox',
    subtitle: 'Interactive live demo of 24/7 claims, denial queue & AR aging dashboard',
    description: 'Explore live KPI cards, interactive 5-bucket AR aging bars, and real-time denial appeal tracking.',
    href: '/portal',
    badge: 'Live Sandbox',
    badgeVariant: 'teal',
    keywords: ['portal', 'dashboard', 'demo', 'sandbox', 'kpis', 'aging', 'claims stream', 'analytics'],
  },
  {
    id: 'act-free-pilot',
    category: 'actions',
    title: 'Start Free 50-Claim Pilot',
    subtitle: 'Zero risk. 50 real claims audited & processed in 14 days',
    description: 'We agree on success criteria in writing, audit 50 claims, and prove our clean-claim accuracy with no long-term commitment.',
    href: '/free-assessment',
    badge: 'Guaranteed Pilot',
    badgeVariant: 'emerald',
    keywords: ['pilot', 'free', 'trial', 'assessment', 'start', '50 claims', 'guarantee', 'onboarding'],
  },
  {
    id: 'act-schedule-call',
    category: 'actions',
    title: 'Book a Strategy Call with Kiran',
    subtitle: '15-minute 1-on-1 practice discovery & revenue analysis',
    description: 'Discuss your specialty, current clearinghouse, denial bottlenecks, and revenue cycle lift directly with leadership.',
    href: '/schedule',
    badge: 'Direct Calendar',
    badgeVariant: 'emerald',
    keywords: ['book', 'schedule', 'call', 'meeting', 'kiran', 'discovery', 'demo', 'consultation'],
  },
  {
    id: 'act-ai-expert',
    category: 'actions',
    title: 'Ask AI Expert / Talk to an Expert',
    subtitle: 'Live RCM AI specialist with direct escalation to Kiran',
    description: 'Ask any question about CARC denial codes, payer timely filing limits, and medical billing fees.',
    href: '#expert-assistant',
    badge: 'Agentic AI',
    badgeVariant: 'purple',
    keywords: ['ai', 'agent', 'expert', 'talk to expert', 'assistant', 'chat', 'kiran', 'help'],
    actionDetail: { type: 'expert_chat' },
  },
  {
    id: 'act-theme-toggle',
    category: 'actions',
    title: 'Toggle Clinical Low-Glare Mode (Dark / Light)',
    subtitle: 'Switch between low-glare clinical dark mode and daytime light mode',
    description: 'High-contrast low-glare theme designed for night-shift billing and clinical workflows.',
    href: '#theme-toggle',
    badge: 'Appearance',
    badgeVariant: 'teal',
    keywords: ['dark mode', 'dark', 'light mode', 'light', 'theme', 'clinical dark', 'glare', 'night mode', 'contrast'],
    actionDetail: { type: 'theme_toggle' },
  },
  {
    id: 'act-print-report',
    category: 'actions',
    title: 'Print Executive Report / Save as PDF',
    subtitle: '1-click export of current view to clean PDF with Aethera letterhead',
    description: 'Exports current dashboard, fee benchmarks, or appeal letters directly to PDF or physical printer.',
    href: '#print',
    badge: 'Export',
    badgeVariant: 'blue',
    keywords: ['print', 'pdf', 'export', 'download report', 'save pdf', 'document', 'save as pdf'],
    actionDetail: { type: 'print_page' },
  },
  {
    id: 'act-pricing',
    category: 'actions',
    title: 'Pricing & Performance Fee Plans',
    subtitle: '3.5%–5.0% performance-based model — we only get paid when you do',
    description: 'Transparent tiered pricing by monthly collection volume. Zero hidden fees, zero software licensing surcharges.',
    href: '/pricing',
    badge: 'Pricing',
    badgeVariant: 'amber',
    keywords: ['pricing', 'fee', 'cost', 'percentage', 'roi', 'contract', 'rate', 'performance'],
  },
  {
    id: 'act-glossary',
    category: 'actions',
    title: 'Healthcare RCM Clinical & Financial Glossary',
    subtitle: 'Searchable encyclopedia of EDI 837/835, NCCI PTP edits, CARC/RARC codes & RVUs',
    description: 'Instant definitions and clinical impact for 30+ core healthcare revenue cycle management terms.',
    href: '/glossary',
    badge: 'Knowledge Base',
    badgeVariant: 'teal',
    keywords: ['glossary', 'dictionary', 'acronyms', 'edi', '837p', '835', 'ncci', 'ptp', 'mue', 'modifier 25', 'modifier 59', 'carc', 'rarc', 'rvu', 'gpci', 'terms'],
  },
  {
    id: 'act-state-of-denials',
    category: 'actions',
    title: 'State of Denials Benchmark Report',
    subtitle: 'Free 2026 national report on healthcare claim denials by specialty',
    href: '/state-of-denials',
    badge: 'Benchmark',
    badgeVariant: 'slate',
    keywords: ['state of denials', 'report', 'benchmark', 'rejection rates', 'research', 'whitepaper'],
  },
  {
    id: 'act-integrations',
    category: 'actions',
    title: '50+ Certified EHR Integrations',
    subtitle: 'Epic, Cerner, AthenaHealth, eClinicalWorks, Kareo, NextGen & more',
    href: '/integrations',
    badge: 'Platform',
    badgeVariant: 'slate',
    keywords: ['integrations', 'ehr', 'emr', 'epic', 'athena', 'cerner', 'ecw', 'kareo', 'nextgen'],
  },
  {
    id: 'act-billing-companies',
    category: 'actions',
    title: 'White-Label for Medical Billing Companies',
    subtitle: 'Scalable back-office billing, coding & AR partnership',
    href: '/for-billing-companies',
    badge: 'Partner',
    badgeVariant: 'slate',
    keywords: ['billing companies', 'white label', 'back office', 'subcontractor', 'partner'],
  },
  {
    id: 'act-fqhc-rhc',
    category: 'actions',
    title: 'FQHC & Rural Health Clinic RCM & Wrap Recovery Funnel',
    subtitle: 'Capture unbilled same-day behavioral health visits & eliminate Medicaid wrap reconciliation delays',
    description: 'Specialized RCM for Section 330 health centers and RHCs with real-time PPS encounter scrubbers and automated 835 wrap ledgers.',
    href: '/lp/fqhc-rhc-billing',
    badge: 'Campaign',
    badgeVariant: 'emerald',
    keywords: ['fqhc', 'rhc', 'community health', 'pps', 'wrap around', 'medicaid wrap', 'same day', 'sliding fee', 'g0467', 'g0470'],
  },
  {
    id: 'act-home-health-hospice',
    category: 'actions',
    title: 'Home Health & Hospice PDGM & LUPA Defense Funnel',
    subtitle: 'Overcome PDGM 30-day LUPA cuts, late NOA penalties & statutory hospice aggregate caps',
    description: 'Post-acute revenue cycle management with real-time OASIS-E HIPPS scrubbers and automated 5-day Notice of Admission electronic submission.',
    href: '/lp/home-health-hospice-billing',
    badge: 'Campaign',
    badgeVariant: 'teal',
    keywords: ['home health', 'hospice', 'pdgm', 'lupa', 'noa', 'hipps', 'oasis', 'cap clawback', 'palliative', 'visiting nurse'],
  },
  {
    id: 'act-behavioral-health',
    category: 'actions',
    title: 'Behavioral Health & Addiction Medicine Billing Funnel',
    subtitle: 'Overcome ASAM concurrent review clawbacks, H0001-H2036 daily per-diems & 30-day pilot',
    description: 'Specialized RCM for SUD rehab, PHP/IOP mental health facilities, and psychiatric group practices with real-time auth tracking.',
    href: '/lp/behavioral-health-billing',
    badge: 'Campaign',
    badgeVariant: 'emerald',
    keywords: ['behavioral health', 'addiction medicine', 'substance use', 'sud', 'php', 'iop', 'residential', 'asam', 'concurrent review', 'h0015', 'h0004', 'mental health'],
  },
  {
    id: 'act-asc-surgical',
    category: 'actions',
    title: 'Ambulatory Surgery Center (ASC) RCM & Implant Carve-Outs',
    subtitle: 'UB-04 & CMS-1500 dual billing, MPPR protection & 30-case surgical audit pilot',
    href: '/lp/asc-surgical-billing',
    badge: 'Campaign',
    badgeVariant: 'teal',
    keywords: ['asc', 'ambulatory surgery', 'implant carve-out', 'mppr', 'surgical billing', 'ub-04', 'or suite', 'pilot'],
  },
  {
    id: 'act-dsnp-ma',
    category: 'actions',
    title: 'D-SNP & Medicare Advantage Risk Recovery Funnel',
    subtitle: 'Stop losing 20% co-insurance on dual-eligibles with automated crossover billing',
    href: '/lp/medicare-advantage-rcm',
    badge: 'Campaign',
    badgeVariant: 'amber',
    keywords: ['dsnp', 'medicare advantage', 'crossover', 'dual eligible', 'qmb', 'balance billing', 'medicaid secondary'],
  },
  {
    id: 'act-enterprise-cbo',
    category: 'actions',
    title: 'Enterprise Health System CBO Consolidation Funnel',
    subtitle: 'Multi-site CBO centralization, multi-EHR interoperability & sub-25 day AR',
    href: '/lp/enterprise-rcm',
    badge: 'Campaign',
    badgeVariant: 'purple',
    keywords: ['enterprise', 'cbo', 'health system', 'mso', 'multi-site', 'epic', 'athena', 'cash flow', 'rfp'],
  },
  {
    id: 'act-solo-practice',
    category: 'actions',
    title: 'Solo Practice Overhead Reduction & Billing Funnel',
    subtitle: 'Cut 40%+ in-house billing overhead with dedicated AAPC certified specialists',
    href: '/lp/solo-practice-rcm',
    badge: 'Campaign',
    badgeVariant: 'emerald',
    keywords: ['solo practice', 'independent physician', 'small group', 'overhead', 'savings', 'biller turnover'],
  },
  {
    id: 'act-denial-recovery-pilot',
    category: 'actions',
    title: 'PPC 50-Claim Denial Recovery Pilot',
    subtitle: 'Zero-risk 14-day turnaround audit of 50 real denied claims',
    href: '/lp/denial-recovery-pilot',
    badge: 'Campaign',
    badgeVariant: 'amber',
    keywords: ['denial recovery', 'ppc', 'pilot', '50 claims', 'fast track', 'denials', 'appeals'],
  },
  {
    id: 'act-switch-billing',
    category: 'actions',
    title: 'Zero-Downtime Billing Vendor Switch Guarantee',
    subtitle: '30-day parallel cutover, 100% EHR data migration & uninterrupted cash flow',
    href: '/lp/switch-medical-billing',
    badge: 'Campaign',
    badgeVariant: 'blue',
    keywords: ['switch', 'transition', 'billing vendor', 'fire biller', 'migration', 'zero downtime'],
  },
  {
    id: 'act-contact',
    category: 'actions',
    title: 'Contact Billing Desk & Support',
    subtitle: 'Online Email Request | Schedule Consultation directly with Kiran',
    href: '/contact',
    badge: 'Support',
    badgeVariant: 'slate',
    keywords: ['contact', 'email', 'phone', 'support', 'address', 'tampa', 'kiran'],
  },
];

let cachedPayerItems: SearchItem[] | null = null;
let cachedDenialItems: SearchItem[] | null = null;

export function getPayerSearchItems(): SearchItem[] {
  if (cachedPayerItems) return cachedPayerItems;

  const rawPayers = (payersData as { payers: Array<{
    slug: string;
    name: string;
    aka?: string[];
    type: string;
    payerId?: string | null;
    clearinghouseId?: string | null;
    parStatus?: string | null;
    timelyFiling?: string | null;
    portalUrl?: string | null;
  }> }).payers || [];

  cachedPayerItems = rawPayers.map((p) => ({
    id: `payer-${p.slug}`,
    category: 'payers',
    title: p.name,
    subtitle: [
      p.type ? `${p.type} Plan` : '',
      p.payerId ? `Payer ID: ${p.payerId}` : p.clearinghouseId ? `EDI ID: ${p.clearinghouseId}` : '',
      p.parStatus ? `Status: ${p.parStatus}` : '',
      p.timelyFiling ? `Filing: ${p.timelyFiling.slice(0, 35)}…` : '',
    ]
      .filter(Boolean)
      .join(' • '),
    description: p.timelyFiling || `Payer profile with clearinghouse EDI routing, timely filing deadlines, and claims routing.`,
    href: `/payers/directory/${p.slug}`,
    badge: p.type || 'Payer',
    badgeVariant: p.type === 'BCBS' ? 'blue' : p.type === 'Medicare' ? 'purple' : 'teal',
    keywords: [
      p.name.toLowerCase(),
      p.slug.toLowerCase(),
      p.type?.toLowerCase() || '',
      p.payerId?.toLowerCase() || '',
      p.clearinghouseId?.toLowerCase() || '',
      ...(p.aka || []).map((a) => a.toLowerCase()),
      'payer',
      'clearinghouse',
      'edi',
      'insurance',
      'timely filing',
      'portal',
    ],
    payerDetail: {
      slug: p.slug,
      payerId: p.payerId,
      type: p.type,
      timelyFiling: p.timelyFiling,
      portalUrl: p.portalUrl,
    },
  }));

  return cachedPayerItems;
}

export function getDenialSearchItems(): SearchItem[] {
  if (cachedDenialItems) return cachedDenialItems;

  const items: SearchItem[] = [];

  // Guided top codes
  for (const c of DENIAL_CODES) {
    items.push({
      id: `denial-guided-${c.code}`,
      category: 'denials',
      title: `CARC ${c.code}: ${c.label}`,
      subtitle: `${c.category} • ${c.difficulty ? c.difficulty.toUpperCase() : ''} ${c.rarc ? `• Paired: ${c.rarc}` : ''}`,
      description: c.rootCause,
      href: `/tools/denial-code-lookup?code=${encodeURIComponent(c.code)}`,
      badge: `CARC ${c.code}`,
      badgeVariant: c.difficulty === 'correctable' ? 'emerald' : c.difficulty === 'preventable' ? 'amber' : 'purple',
      keywords: [
        `carc ${c.code}`,
        `co-${c.code}`,
        `co ${c.code}`,
        `pr-${c.code}`,
        c.code,
        c.label.toLowerCase(),
        c.category.toLowerCase(),
        c.rarc?.toLowerCase() || '',
        ...c.aliases.map((a) => a.toLowerCase()),
        'denial',
        'rejection',
      ],
      denialDetail: {
        code: c.code,
        type: 'CARC',
        difficulty: c.difficulty,
        category: c.category,
        rootCause: c.rootCause,
        workIt: c.workIt,
        prevent: c.prevent,
        rarc: c.rarc,
      },
    });
  }

  // Reference codes (CARC and RARC)
  const refCodes = (denialRefData as { codes: Array<{
    code: string;
    type: 'CARC' | 'RARC';
    description: string;
    category: string;
    difficulty?: 'correctable' | 'preventable' | 'hard';
    workIt?: string;
    prevent?: string;
    handle?: string;
  }> }).codes || [];

  const guidedCodeSet = new Set(DENIAL_CODES.map((c) => c.code));

  for (const r of refCodes) {
    if (r.type === 'CARC' && guidedCodeSet.has(r.code)) continue;

    items.push({
      id: `denial-ref-${r.type}-${r.code}`,
      category: 'denials',
      title: `${r.type} ${r.code}: ${r.description}`,
      subtitle: `${r.category || 'General Remittance'}${r.difficulty ? ` • ${r.difficulty.toUpperCase()}` : ''}`,
      description: r.workIt || r.handle || r.description,
      href: `/tools/denial-code-lookup?code=${encodeURIComponent(r.code)}`,
      badge: `${r.type} ${r.code}`,
      badgeVariant: r.type === 'CARC' ? 'blue' : 'slate',
      keywords: [
        `${r.type.toLowerCase()} ${r.code}`,
        `${r.type.toLowerCase()}-${r.code}`,
        r.code,
        r.description.toLowerCase(),
        r.category?.toLowerCase() || '',
        'denial',
      ],
      denialDetail: {
        code: r.code,
        type: r.type,
        difficulty: r.difficulty,
        category: r.category,
        workIt: r.workIt || r.handle,
        prevent: r.prevent,
      },
    });
  }

  cachedDenialItems = items;
  return cachedDenialItems;
}

export function getAllSearchItems(): SearchItem[] {
  return [
    ...ACTION_ITEMS,
    ...TOOL_ITEMS,
    ...SPECIALTY_ITEMS,
    ...SERVICE_ITEMS,
    ...getPayerSearchItems(),
    ...getDenialSearchItems(),
  ];
}

export function searchIndex(
  query: string,
  categoryFilter: SearchCategory = 'all',
  limit = 25
): SearchItem[] {
  const q = query.trim().toLowerCase();
  const allItems = getAllSearchItems();

  if (!q) {
    const defaultList = [
      ...ACTION_ITEMS.slice(0, 3),
      ...TOOL_ITEMS.slice(0, 4),
      ...getPayerSearchItems().slice(0, 3),
      ...getDenialSearchItems().slice(0, 3),
      ...SPECIALTY_ITEMS.slice(0, 2),
    ];

    if (categoryFilter === 'all') {
      return defaultList.slice(0, limit);
    }
    return allItems.filter((item) => item.category === categoryFilter).slice(0, limit);
  }

  // Normalize query to strip punctuation for code searching (e.g. "CO-16" -> "co 16" or "16")
  const strippedCode = q.replace(/^(carc|rarc|co|pr|oa|pi|cr)[-\s]?/i, '').trim();
  const queryTerms = q.split(/\s+/).filter(Boolean);

  const matched = allItems.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }

    // Direct code lookup shortcut:
    if (item.category === 'denials' && item.denialDetail) {
      if (strippedCode && item.denialDetail.code.toLowerCase() === strippedCode) {
        return true;
      }
    }

    const titleLower = item.title.toLowerCase();
    const subLower = item.subtitle?.toLowerCase() || '';
    const descLower = item.description?.toLowerCase() || '';
    const badgeLower = item.badge?.toLowerCase() || '';

    return queryTerms.every((term) => {
      if (titleLower.includes(term)) return true;
      if (badgeLower.includes(term)) return true;
      if (subLower.includes(term)) return true;
      if (descLower.includes(term)) return true;
      return item.keywords.some((k) => k.includes(term));
    });
  });

  // Relevance ranking
  matched.sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();

    // Direct code hit
    if (strippedCode) {
      const aCodeHit = a.denialDetail?.code.toLowerCase() === strippedCode;
      const bCodeHit = b.denialDetail?.code.toLowerCase() === strippedCode;
      if (aCodeHit && !bCodeHit) return -1;
      if (bCodeHit && !aCodeHit) return 1;
    }

    const aExact = aTitle.startsWith(q) ? 100 : aTitle.includes(q) ? 50 : 0;
    const bExact = bTitle.startsWith(q) ? 100 : bTitle.includes(q) ? 50 : 0;

    const aBadge = a.badge?.toLowerCase().includes(q) ? 40 : 0;
    const bBadge = b.badge?.toLowerCase().includes(q) ? 40 : 0;

    return (bExact + bBadge) - (aExact + aBadge);
  });

  return matched.slice(0, limit);
}
