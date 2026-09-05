import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SpecialtyBadge from '@/components/ui/SpecialtyBadge';
import RcmHeroBand from '@/components/ui/RcmHeroBand';

const specialtyLinks: Record<string, string> = {
  'Family Medicine': '/medical-billing/family-medicine',
  'Internal Medicine': '/medical-billing/internal-medicine',
  'Pediatrics': '/medical-billing/pediatrics',
  'Cardiology': '/medical-billing/cardiology',
  'Dermatology': '/medical-billing/dermatology',
  'Endocrinology': '/medical-billing/internal-medicine',
  'Gastroenterology': '/medical-billing/gastroenterology',
  'Neurology': '/medical-billing/neurology',
  'Pulmonology': '/medical-billing/pulmonology',
  'Rheumatology': '/medical-billing/rheumatology',
  'Pain Management & Spine': '/medical-billing/pain-management',
  'Obstetrics & Gynecology (OB/GYN)': '/medical-billing/obgyn',
  'Ophthalmology & Optometry': '/medical-billing/ophthalmology',
  'Medical Oncology & Hematology': '/medical-billing/oncology',
  'General Surgery': '/medical-billing/orthopedics',
  'Orthopedic Surgery': '/medical-billing/orthopedics',
  'Plastic Surgery': '/medical-billing/plastic-reconstructive-surgery',
  'Plastic & Reconstructive Surgery': '/medical-billing/plastic-reconstructive-surgery',
  'Urology': '/medical-billing/urology',
  'Radiology': '/medical-billing/radiology',
  'Physical Therapy & Rehabilitation': '/medical-billing/physical-therapy',
  'Pathology': '/medical-billing/pathology',
  'Anesthesiology': '/medical-billing/anesthesia',
  'Podiatry & Wound Care': '/medical-billing/podiatry',
  'Ambulatory Surgery Centers (ASC)': '/medical-billing/asc',
  'Emergency Medicine': '/medical-billing/emergency-medicine',
  'Urgent Care': '/medical-billing/urgent-care',
  'Nephrology & Dialysis': '/medical-billing/nephrology',
  'Otolaryngology & ENT': '/medical-billing/ent',
  'Infectious Disease': '/medical-billing/infectious-disease',
  'Allergy & Immunology': '/medical-billing/allergy-immunology',
  'Interventional Radiology': '/medical-billing/interventional-radiology',
  'Oral & Maxillofacial Surgery': '/medical-billing/oral-surgery',
  'Addiction Medicine & SUD': '/medical-billing/addiction-medicine',
  'Gynecologic Oncology': '/medical-billing/gynecologic-oncology',
  'Home Health & Hospice Care': '/medical-billing/home-health-hospice',
  'Wound Care & Hyperbaric Medicine': '/medical-billing/wound-care',
  'FQHC & Community Health Clinics': '/medical-billing/fqhc',
  'Sleep Medicine & Polysomnography': '/medical-billing/sleep-medicine',
  'Neonatal & Pediatric Intensive Care (NICU/PICU)': '/medical-billing/nicu-picu',
  'Radiation Oncology & Proton Therapy': '/medical-billing/radiation-oncology',
  'Cardiac Electrophysiology & Catheter Ablation': '/medical-billing/cardiac-electrophysiology',
  'Ophthalmology & Vitreoretinal Surgery': '/medical-billing/retina-vitreous',
  'Vascular Surgery & Endovascular Interventions': '/medical-billing/vascular-surgery',
  'Pharmacy Services': '/services/pharmacy-billing',
  'Dental': '/services/dental-billing',
  "Workers' Compensation": '/services/workers-compensation-billing',
};

const specialties = [
  {
    category: 'Primary Care',
    items: [
      {
        name: 'Family Medicine',
        description: 'Comprehensive care for patients of all ages with expertise in preventive medicine, chronic disease management, and acute care.',
        cptCodes: '99201-99215, 99381-99397',
        challenges: 'High patient volume, complex comorbidities, coordination of care across multiple specialists.'
      },
      {
        name: 'Internal Medicine',
        description: 'Specialized care for adult patients with complex medical conditions, focusing on prevention, diagnosis, and treatment.',
        cptCodes: '99201-99215, 99385-99396',
        challenges: 'Complex chronic conditions, medication management, and coordination with multiple specialists.'
      },
      {
        name: 'Pediatrics',
        description: 'Comprehensive healthcare for infants, children, and adolescents with focus on growth, development, and preventive care.',
        cptCodes: '99201-99215, 99381-99384, 99391-99394',
        challenges: 'Growth and development tracking, vaccine compliance, and family-centered care approaches.'
      },
      {
        name: 'Urgent Care',
        description: 'Walk-in acute injury and illness care, minor procedures, CLIA-waived diagnostic testing, and occupational health billing.',
        cptCodes: '99202-99214, S9088, 12001-12004, 71045',
        challenges: 'Facility add-on S9088 reimbursement denials, high self-pay patient volume, and upfront eligibility verification.'
      }
    ]
  },
  {
    category: 'Medical Specialties',
    items: [
      {
        name: 'Cardiology',
        description: 'Diagnosis and treatment of heart conditions including arrhythmias, heart failure, and coronary artery disease.',
        cptCodes: '92920-92944, 93000-93010, 93224-93272',
        challenges: 'Complex procedure coding, stress testing requirements, and cardiac rehab billing.'
      },
      {
        name: 'Dermatology',
        description: 'Medical and surgical treatment of skin conditions, including skin cancer, acne, and cosmetic procedures.',
        cptCodes: '17000-17999, 27300-27305, 99201-99215',
        challenges: 'Destruction codes, Mohs surgery complexity, and cosmetic procedure exclusions.'
      },
      {
        name: 'Endocrinology',
        description: 'Management of hormonal disorders including diabetes, thyroid disorders, and metabolic conditions.',
        cptCodes: '99201-99215, 95250-95251, 95252-95253',
        challenges: 'Continuous glucose monitoring, insulin pump management, and diabetes education billing.'
      },
      {
        name: 'Gastroenterology',
        description: 'Diagnosis and treatment of digestive system disorders including endoscopic procedures.',
        cptCodes: '43180-43285, 45300-45398, 99201-99215',
        challenges: 'Complex endoscopy coding, modifier usage, and screening vs. diagnostic procedures.'
      },
      {
        name: 'Neurology',
        description: 'Diagnosis and treatment of disorders affecting the brain, spinal cord, and nervous system.',
        cptCodes: '95800-96020, 99201-99215, 95900-95910',
        challenges: 'EMG/NCS coding complexity, migraine management protocols, and infusion billing.'
      },
      {
        name: 'Pulmonology',
        description: 'Management of respiratory conditions including asthma, COPD, and sleep disorders.',
        cptCodes: '94002-94799, 99201-99215, 95800-95811',
        challenges: 'Pulmonary function testing, sleep study interpretation, and oxygen therapy billing.'
      },
      {
        name: 'Rheumatology',
        description: 'Diagnosis and management of autoimmune and inflammatory conditions affecting joints and connective tissues.',
        cptCodes: '99201-99215, 99231-99233, 20600-20610',
        challenges: 'Injections and infusions, chronic care management, and complex medication billing.'
      },
      {
        name: 'Pain Management & Spine',
        description: 'Interventional spinal injections, nerve blocks, fluoroscopy guidance, and radiofrequency ablation.',
        cptCodes: '62321-62323, 64483-64484, 64490-64495, 64635',
        challenges: 'Fluoroscopy bundling under NCCI PTP edits, rolling 12-month injection frequency caps, and bilateral modifier compliance.'
      },
      {
        name: 'Obstetrics & Gynecology (OB/GYN)',
        description: 'Global maternity delivery packages, split antepartum/postpartum care, and in-office surgical procedures.',
        cptCodes: '59400, 59510, 57454, 58300, 76801-76817',
        challenges: 'Mid-pregnancy payer switches requiring global package unbundling, buy-and-bill LARC reimbursement, and modifier 25 documentation.'
      },
      {
        name: 'Ophthalmology & Optometry',
        description: 'Complex cataract surgery, retina intravitreal injections, diagnostic OCT imaging, and surgical co-management.',
        cptCodes: '66984, 66982, 67028, 92004-92014, 92134',
        challenges: 'High-cost anti-VEGF drug pre-authorization, complex cataract substantiation, and modifier 54/55 surgical co-management tracking.'
      },
      {
        name: 'Medical Oncology & Hematology',
        description: 'Chemotherapy infusion administration sequencing, high-cost immunotherapy J-codes, and clinical trial modifiers.',
        cptCodes: '96413, 96415, 96372, J9000-J9999',
        challenges: 'Multi-drug infusion hierarchy rules, mandatory JW/JZ drug wastage tracking, and pre-authorization denials for target biotherapies.'
      },
      {
        name: 'Nephrology & Dialysis',
        description: 'ESRD monthly capitation payment (MCP) tiers, in-center hemodialysis and peritoneal dialysis supervision, and CKD coordination.',
        cptCodes: '90951-90970, 90935-90945, 90989, 99202-99215',
        challenges: 'Partial-month MCP day calculations during patient hospital stays, dialysis facility duplicate claims, and vascular access coding.'
      }
    ]
  },
  {
    category: 'Surgical Specialties',
    items: [
      {
        name: 'General Surgery',
        description: 'Surgical treatment of abdominal, breast, skin, and soft tissue conditions.',
        cptCodes: '10000-10021, 49000-49659, 99211-99215',
        challenges: 'Multiple procedure bundling, global period considerations, and wound care management.'
      },
      {
        name: 'Orthopedic Surgery',
        description: 'Surgical and non-surgical treatment of musculoskeletal conditions and injuries.',
        cptCodes: '20000-29999, 99211-99215, 97001-97799',
        challenges: 'Implant and supply coding, fracture care bundling, and physical therapy coordination.'
      },
      {
        name: 'Plastic Surgery',
        description: 'Reconstructive and cosmetic surgical procedures to restore form and function.',
        cptCodes: '15000-19999, 99211-99215, 92950-92951',
        challenges: 'Cosmetic vs. reconstructive distinctions, multiple procedure bundling, and graft coding.'
      },
      {
        name: 'Urology',
        description: 'Diagnosis and treatment of conditions affecting the urinary tract and male reproductive system.',
        cptCodes: '50010-55899, 99211-99215, 93000-93010',
        challenges: 'Stone procedure coding, prostate procedures, and chemotherapy administration.'
      },
      {
        name: 'Otolaryngology & ENT',
        description: 'Functional endoscopic sinus surgery (FESS), balloon sinuplasty, diagnostic nasal endoscopy, and multi-antigen allergy immunotherapy.',
        cptCodes: '31231-31298, 95165, 92557, 69210, 69436',
        challenges: 'Multiple endoscopy reduction rule deductions, same-day E/M modifier 25 documentation, and allergy vial billing limits.'
      },
      {
        name: 'Oral & Maxillofacial Surgery',
        description: 'Dual dental (CDT) and medical (CPT) cross-coding, orthognathic surgery, TMJ arthroplasty, and facial trauma reconstruction.',
        cptCodes: '21141-21206, 21240, 40810, D7210-D7999',
        challenges: 'Dental vs medical payer coverage disputes, cosmetic exclusion pre-authorizations, and bone graft site-of-service rules.'
      },
      {
        name: 'Gynecologic Oncology',
        description: 'Complex radical pelvic resections, retroperitoneal lymphadenectomies, HIPEC perfusion, and co-surgeon Modifier 62 coordination.',
        cptCodes: '58210, 58548, 38571-38572, 49220, 96560',
        challenges: 'Radical vs simple hysterectomy downcoding audits, lymph node dissection bundling, and multi-surgeon co-surgery documentation.'
      }
    ]
  },
  {
    category: 'Diagnostic/Support',
    items: [
      {
        name: 'Radiology',
        description: 'Diagnostic imaging services including X-ray, CT, MRI, and ultrasound interpretation.',
        cptCodes: '70010-79999, 99211-99215, 93000-93010',
        challenges: 'Imaging supervision and interpretation, contrast administration, and multiple views coding.'
      },
      {
        name: 'Pathology',
        description: 'Laboratory services including tissue examination, cytology, and molecular diagnostics.',
        cptCodes: '80047-89398, 99211-99215, 93000-93010',
        challenges: 'Specimen handling, slide preparation, and complex diagnostic testing billing.'
      },
      {
        name: 'Anesthesiology',
        description: 'Pain management and anesthetic services for surgical and non-surgical procedures.',
        cptCodes: '00100-01999, 99100-99140, 64400-64530',
        challenges: 'Time-based billing, modifier usage, and pain management procedure coding.'
      },
      {
        name: 'Physical Therapy & Rehabilitation',
        description: 'Outpatient rehabilitation, physical and occupational therapy, therapeutic exercises, and neuromuscular re-education.',
        cptCodes: '97110, 97140, 97112, 97161-97163',
        challenges: 'Medicare 8-minute rule calculation, annual therapy cap threshold tracking with Modifier KX, and Plan of Care recertification.'
      },
      {
        name: 'Emergency Medicine',
        description: 'Hospital-based emergency department staffing and independent physician groups managing high-acuity adult and pediatric encounters.',
        cptCodes: '99281-99285, 99291-99292, 99221-99223',
        challenges: 'Level 5 (99285) downcoding audits, Critical Care time documentation, and No Surprises Act Qualified Payment Amount (QPA) disputes.'
      },
      {
        name: 'Interventional Radiology',
        description: 'Selective catheterization, vascular tree navigation, transcatheter embolization, revascularization, and radiological supervision.',
        cptCodes: '36200-36248, 37241-37243, 37220-37235, 75710',
        challenges: 'Vascular family branch hierarchy downcoding and diagnostic angiography unbundling denials.'
      }
    ]
  },
  {
    category: 'Pharmacy, Dental & Specialty Lines',
    items: [
      {
        name: 'Pharmacy Services',
        description: 'Revenue cycle for retail, specialty, compounding, and long-term care pharmacies — adjudication, PBM rejects, DIR, and 340B.',
        cptCodes: 'NDC, NCPDP D.0, DAW 0-9, J-codes (Part B)',
        challenges: 'PBM claim rejects, DIR fee clawbacks, specialty drug prior authorizations, and 340B program integrity.'
      },
      {
        name: 'Dental',
        description: 'CDT and medical-dental cross-coding for general, specialty, and DSO practices, including oral surgery and sleep appliances.',
        cptCodes: 'D0100-D9999 (CDT) + medical CPT/ICD-10 cross-codes',
        challenges: 'Medical cross-coding, predeterminations, PPO downgrades, and aging insurance A/R.'
      },
      {
        name: "Workers' Compensation",
        description: 'Multi-state workers\' comp billing with jurisdiction fee schedules, eBilling, narratives, and lien recovery.',
        cptCodes: 'CMS-1500, state fee schedules, 99455/99456, DWC forms',
        challenges: 'State-specific fee schedules, utilization review, bill-review reductions, and lien deadlines.'
      },
      {
        name: 'Addiction Medicine & SUD',
        description: 'Opioid Treatment Program (OTP) weekly bundles, OBOT buprenorphine induction, and residential per diem billing.',
        cptCodes: 'G2086-G2088, G2074-G2080, H0001-H0035, G0480-G0483',
        challenges: 'Concurrent review denials, ASAM level-of-care step-downs, and definitive urine drug screen recoupment audits.'
      },
      {
        name: 'Home Health & Hospice Care',
        description: 'PDGM 30-day periods, OASIS-E HIPPS scoring, timely 5-day NOA filing, and hospice statutory aggregate cap reconciliation.',
        cptCodes: 'G0151-G0154, G0299-G0300, Q5001-Q5009, 0023 HIPPS, G0156',
        challenges: 'PDGM LUPA threshold visit drops, late NOA penalties (CARC 253), and hospice annual aggregate cap clawbacks.'
      },
      {
        name: 'Wound Care & Hyperbaric Medicine',
        description: 'Surgical excisional debridement, Cellular & Tissue-Based Products (CTPs/skin substitutes) with Modifier JW/JZ, and HBOT.',
        cptCodes: '11042-11047, 97597-97598, Q4100-Q4280, 99183, G0277, 29580',
        challenges: 'Skin substitute CTP wastage billing (JW/JZ), debridement depth downcoding, and HBOT 30-day conservative therapy prior auth.'
      },
      {
        name: 'FQHC & Community Health Clinics',
        description: 'CMS Prospective Payment System (PPS) encounters, Medicaid wrap reconciliations, and same-day medical & behavioral health billing.',
        cptCodes: 'G0466-G0470, G0511, G0512, 0521/0900 (UB-04), 99213-99215',
        challenges: 'Unbilled same-day behavioral health encounters, delayed Medicaid wrap reconciliations, and sliding fee discount schedule leakage.'
      },
      {
        name: 'Sleep Medicine & Polysomnography',
        description: 'In-lab polysomnography (PSG), Home Sleep Apnea Testing (HSAT Types II–IV), split-night CPAP titrations, and 90-day PAP compliance.',
        cptCodes: '95800, 95806, 95810, 95811, 95782, G0398-G0400, 94660',
        challenges: 'HSAT vs in-lab prior authorization denials, split-night study threshold failures, and CMS 90-day CPAP compliance telemetry clawbacks.'
      },
      {
        name: 'Neonatal & Pediatric Intensive Care (NICU/PICU)',
        description: 'Global per-day critical care management (initial/subsequent), delivery room resuscitation, umbilical vascular lines, and concurrent subspecialist care.',
        cptCodes: '99468-99476, 99465, 36510, 36660, 94610, 99477',
        challenges: 'Per-day global bundling disputes, day-28 and 24-month age threshold transitions, and concurrent neonatology/pediatric surgery claim rejections.'
      },
      {
        name: 'Radiation Oncology & Proton Therapy',
        description: 'IMRT treatment planning, stereotactic body radiotherapy (SBRT), medical physics consultations, weekly 5-fraction management, and proton therapy.',
        cptCodes: '77261-77263, 77300, 77301, 77334, 77338, 77385-77386, 77371-77373, 77427, 77520-77525',
        challenges: 'IMRT planning (77301) unbundling NCCI edits, weekly 5-fraction math reconciliations, and commercial proton beam investigational denials.'
      },
      {
        name: 'Cardiac Electrophysiology & Catheter Ablation',
        description: 'Comprehensive AFib ablation (PVI), 3D electroanatomical mapping, intracardiac echocardiography, lead extraction, and remote pacemaker/ICD monitoring.',
        cptCodes: '93653, 93656, 93613, 93662, 93655, 93657, 33249, 33235, 93294–93298',
        challenges: 'Diagnostic EP bundling into 93656, missing documentation for 3D mapping and ICE add-ons, and remote device 90-day interval clawbacks.'
      },
      {
        name: 'Plastic & Reconstructive Surgery',
        description: 'Functional reconstructive surgery, federal WHCRA post-mastectomy breast reconstruction, blepharoplasty visual field proof, and panniculectomy medical necessity appeals.',
        cptCodes: '19357-19364, 15823, 15830, 19318, 14000-14061, 15100, 21120',
        challenges: 'Cosmetic exclusion rejections (CARC CO-24), Schnur sliding scale tissue weight disputes, and commercial WHCRA contralateral symmetry denials.'
      },
      {
        name: 'Ophthalmology & Vitreoretinal Surgery',
        description: 'Anti-VEGF intravitreal injections, buy-and-bill drug reimbursement, bilateral surgery modifiers (-50 vs -LT/-RT), pars plana vitrectomy, and OCT diagnostic compliance.',
        cptCodes: '67028, 67108, 67113, 67210, 67228, 92134, 92235, 92240, J0178, J2778, Q5128',
        challenges: 'Intravitreal bilateral modifier denials, high-cost anti-VEGF drug margin leakage, Modifier JW/JZ wastage audits, and OCT frequency threshold edits.'
      },
      {
        name: 'Vascular Surgery & Endovascular Interventions',
        description: 'Endovascular aneurysm repair (EVAR/TEVAR), lower extremity revascularization (PAD hierarchy), dialysis vascular access creation & salvage, and venous ablation.',
        cptCodes: '34701–34716, 37220–37235, 36475, 36478, 36821, 36830, 36901–36909, 36245–36248, 37252',
        challenges: 'Vascular territory unbundling rejections, selective catheter placement NCCI bundling edits, dialysis access thrombectomy downcodings, and OBL facility fee disputes.'
      }
    ]
  }
];

export const metadata = {
  title: "Medical Billing Specialties We Serve",
  description: "Expert billing and revenue cycle management across 42+ medical specialties, each with specialty-specific coding and payer knowledge. See the specialties Aethera serves.",
  alternates: {
    canonical: 'https://aetherahealthcare.com/specialties',
  },
  openGraph: {
    title: 'Medical Billing Specialties | Aethera Healthcare Solutions',
    description: 'Expert medical billing across 42+ specialties — Cardiology, Electrophysiology, Plastic Surgery, Retina & Ophthalmology, Vascular Surgery, NICU/PICU, Radiation Oncology, FQHC, Sleep Medicine, Addiction Medicine, Home Health & Hospice, Wound Care, and more.',
    url: 'https://aetherahealthcare.com/specialties',
    type: 'website',
  },
};

export default function SpecialtiesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Medical Billing Specialties | Aethera Healthcare Solutions",
    "description": "Expert billing and revenue cycle management for over 42 medical specialties with deep specialty-specific knowledge.",
    "url": "https://aetherahealthcare.com/specialties",
    "publisher": {
      "@type": "Organization",
      "name": "Aethera Healthcare Solutions",
      "url": "https://aetherahealthcare.com",
      "logo": "https://aetherahealthcare.com/logo.png"
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <RcmHeroBand
        eyebrow="Specialties"
        title="Billing built for your specialty"
        subtitle="Expert billing and revenue cycle management across 42+ medical specialties — with coding depth and payer knowledge specific to your field."
        primary={{ href: '/free-assessment', label: 'Get a Free Assessment' }}
        secondary={{ href: '/services', label: 'View Services' }}
        chips={['42+ specialties', 'Specialty-specific coding', '900+ payers']}
      />

      {/* Introduction */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-jakarta mb-6">
                Deep Specialty Expertise
              </h2>
              <p className="text-gray text-lg mb-8">
                Our team includes certified coders and billing specialists with extensive experience in each medical specialty we serve.
                We understand the unique coding requirements, payer policies, and compliance considerations specific to your field.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <SpecialtyBadge name="25+ Specialties" />
                <SpecialtyBadge name="Certified Specialists" />
                <SpecialtyBadge name="Specialty-Specific Knowledge" />
                <SpecialtyBadge name="Compliance Experts" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Specialties List */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {specialties.map((category, categoryIndex) => (
            <FadeIn key={categoryIndex} delay={categoryIndex * 0.2}>
              <div className="mb-16 last:mb-0">
                <h3 className="text-2xl font-bold text-navy mb-8 border-b-2 border-teal pb-2">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {category.items.map((specialty, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-md p-6 border border-gray/10 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-bold text-navy">{specialty.name}</h4>
                        <SpecialtyBadge name={category.category.split(' ')[0]} />
                      </div>
                      <p className="text-gray mb-4">{specialty.description}</p>
                      <div className="mb-4">
                        <p className="text-sm font-medium text-teal mb-1">Common CPT Code Ranges:</p>
                        <p className="text-sm text-gray">{specialty.cptCodes}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-teal mb-1">Typical Billing Challenges:</p>
                        <p className="text-sm text-gray">{specialty.challenges}</p>
                      </div>
                      {specialtyLinks[specialty.name] && (
                        <div className="mt-5 pt-4 border-t border-gray/10 flex items-center justify-between">
                          <span className="text-xs text-gray font-medium">Dedicated Specialty Playbook</span>
                          <Link
                            prefetch={false}
                            href={specialtyLinks[specialty.name]}
                            className="inline-flex items-center text-xs font-bold text-teal hover:text-navy group transition-colors"
                          >
                            Explore Playbook <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-jakarta mb-6">
                Specialized Billing for Your Specialty
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Let our experts handle your specialty-specific billing and coding needs.
              </p>
              <Link prefetch={false}
                href="/contact"
                className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
              >
                Schedule Free Consultation
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}