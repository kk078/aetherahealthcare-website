import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';
import GuideCard from '@/components/ui/GuideCard';
import RcmHeroBand from '@/components/ui/RcmHeroBand';

export const metadata = {
  title: { absolute: 'Specialty Billing Guides | Aethera Healthcare Solutions' },
  description: 'Download Aethera\'s specialty-specific revenue cycle and billing overview guides — covering coding, denials, reimbursement, and compliance for 18 specialties.',
};

// Specialty billing decks hosted at /decks/<slug>.pdf
const decks = [
  { slug: 'cardiology', name: 'Cardiology', focus: 'E/M · Procedures · Devices · Cardiac Rehab' },
  { slug: 'dermatology', name: 'Dermatology', focus: 'Destruction · Mohs · Biologics · Cosmetic' },
  { slug: 'dental', name: 'Dental', focus: 'PPO · Medicaid · Cross-Coding · Membership' },
  { slug: 'endocrinology', name: 'Endocrinology', focus: 'Chronic Care · CGM/Pumps · Hormones · Thyroid' },
  { slug: 'familymedicine', name: 'Family Medicine', focus: 'Acute · Preventive · CCM · Procedures' },
  { slug: 'gastroenterology', name: 'Gastroenterology', focus: 'Endoscopy · Hepatology · IBD Biologics' },
  { slug: 'hemonc', name: 'Hematology & Oncology', focus: 'Chemo · Procedures · Radiation · Trials' },
  { slug: 'internalmedicine', name: 'Internal Medicine', focus: 'Preventive · CCM · Hospitalist · Procedures' },
  { slug: 'nephrology', name: 'Nephrology', focus: 'CKD · Dialysis · Transplant · Vascular Access' },
  { slug: 'neurology', name: 'Neurology', focus: 'Headache · EEG/EMG · Infusions · Neuromodulation' },
  { slug: 'obgyn', name: 'OB/GYN', focus: 'Global OB · GYN Surgery · Prenatal · IVF' },
  { slug: 'orthopedic', name: 'Orthopedics', focus: 'Injections · Surgery · PT · DME/Implants' },
  { slug: 'pediatrics', name: 'Pediatrics', focus: 'Well-Child · Vaccines · Procedures' },
  { slug: 'pharmacy', name: 'Pharmacy', focus: 'Medicare Part D · 340B · MTM · Specialty Rx' },
  { slug: 'psychiatry', name: 'Psychiatry', focus: 'Therapy · Med Mgmt · Telehealth · BHI' },
  { slug: 'pulmonology', name: 'Pulmonology', focus: 'PFT · Sleep · Inhalation · Critical Care' },
  { slug: 'rheumatology', name: 'Rheumatology', focus: 'Infusions · Injections · Labs · Chronic Care' },
  { slug: 'urology', name: 'Urology', focus: 'Cystoscopy · Prostate · Stones · Urodynamics' },
];

export default function Decks() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <RcmHeroBand
        eyebrow="Guides"
        title="Specialty billing guides"
        subtitle="Free, specialty-specific overviews of how we handle revenue cycle management — the codes, denials, payer rules, and compliance that matter most for your practice."
        primary={{ href: '/free-assessment', label: 'Get a Free Assessment' }}
        chips={['18 specialties', 'Free download', 'No login']}
      />

      {/* Deck grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="DOWNLOAD A GUIDE"
            title="Built for Your Specialty"
            description="Each guide is a concise PDF covering the billing challenges and opportunities specific to that specialty. View instantly, or have your copy emailed to you."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {decks.map((d, index) => (
              <GuideCard key={d.slug} slug={d.slug} name={d.name} focus={d.focus} index={index} />
            ))}
          </div>

          <FadeIn>
            <div className="mt-14 text-center bg-cream rounded-2xl p-8">
              <h3 className="text-xl font-bold text-navy mb-2">Don&apos;t see your specialty?</h3>
              <p className="text-gray mb-5 max-w-2xl mx-auto">
                We support 26+ specialties. Tell us about your practice and we&apos;ll put together the right overview for you.
              </p>
              <a
                href="/contact"
                className="inline-block bg-teal hover:bg-navy text-white font-semibold py-2.5 px-6 rounded-full transition-colors duration-200 text-sm"
              >
                Talk to Us
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
