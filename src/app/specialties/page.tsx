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
  'Pulmonology': '/medical-billing/internal-medicine',
  'Rheumatology': '/medical-billing/internal-medicine',
  'Pain Management & Spine': '/medical-billing/pain-management',
  'Obstetrics & Gynecology (OB/GYN)': '/medical-billing/obgyn',
  'Ophthalmology & Optometry': '/medical-billing/ophthalmology',
  'Medical Oncology & Hematology': '/medical-billing/oncology',
  'General Surgery': '/medical-billing/orthopedics',
  'Orthopedic Surgery': '/medical-billing/orthopedics',
  'Plastic Surgery': '/medical-billing/dermatology',
  'Urology': '/medical-billing/urology',
  'Radiology': '/medical-billing/radiology',
  'Physical Therapy & Rehabilitation': '/medical-billing/physical-therapy',
  'Pathology': '/medical-billing/pathology',
  'Anesthesiology': '/medical-billing/anesthesia',
  'Podiatry & Wound Care': '/medical-billing/podiatry',
  'Ambulatory Surgery Centers (ASC)': '/medical-billing/asc',
  'Emergency Medicine': '/medical-billing/emergency-medicine',
  'Urgent Care': '/medical-billing/urgent-care',
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
      }
    ]
  }
];

export const metadata = {
  title: "Medical Billing Specialties We Serve",
  description: "Expert billing and revenue cycle management across 25+ medical specialties, each with specialty-specific coding and payer knowledge. See the specialties Aethera serves.",
};

export default function Specialties() {
  return (
    <div className="min-h-screen flex flex-col">
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Medical Specialties We Serve | Aethera Healthcare Solutions",
              "description": "Expert billing and revenue cycle management for over 25 medical specialties with deep specialty-specific knowledge.",
              "url": "https://aetherahealthcare.com/specialties",
              "publisher": {
                "@type": "Organization",
                "name": "Aethera Healthcare Solutions",
                "url": "https://aetherahealthcare.com",
                "logo": "https://aetherahealthcare.com/logo.png"
              }
            })
          }}
        />
      </>
      <Navbar />

      <RcmHeroBand
        eyebrow="Specialties"
        title="Billing built for your specialty"
        subtitle="Expert billing and revenue cycle management across 26+ medical specialties — with coding depth and payer knowledge specific to your field."
        primary={{ href: '/free-assessment', label: 'Get a Free Assessment' }}
        secondary={{ href: '/services', label: 'View Services' }}
        chips={['26+ specialties', 'Specialty-specific coding', '900+ payers']}
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