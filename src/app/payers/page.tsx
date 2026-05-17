import Link from 'next/link';
import { Shield, CheckCircle, Globe, Zap, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'Insurance Payer Network | 900+ Payers | Aethera Healthcare Solutions',
  description: 'Aethera Healthcare Solutions works with 900+ insurance payers including Medicare, Medicaid, and all major commercial insurers. Real-time eligibility verification included.',
};

const payerGroups = [
  {
    category: 'Government Programs',
    color: 'bg-navy/5 border-navy/20',
    labelColor: 'bg-navy text-white',
    payers: [
      'Medicare Part A', 'Medicare Part B', 'Medicare Part C (MA)', 'Medicare Part D',
      'Medicaid — All 50 States', 'TRICARE Prime', 'TRICARE for Life', 'TRICARE Select',
      'Veterans Affairs (VA)', 'CHAMPVA', 'Indian Health Service', 'Federal FEHB',
      'Railroad Medicare', 'Black Lung Program',
    ],
  },
  {
    category: 'Major Commercial Payers',
    color: 'bg-teal/5 border-teal/20',
    labelColor: 'bg-teal text-white',
    payers: [
      'UnitedHealthcare', 'UnitedHealthcare Community Plan', 'Anthem / Elevance Health',
      'Blue Cross Blue Shield (All State Plans)', 'Aetna', 'Cigna / Evernorth', 'Humana',
      'Molina Healthcare', 'Centene / WellCare', 'CVS / Aetna', 'Kaiser Permanente',
      'Magellan Health', 'Beacon Health Options', 'Optum Health',
    ],
  },
  {
    category: 'Regional Payers',
    color: 'bg-mint/5 border-mint/20',
    labelColor: 'bg-mint text-navy',
    payers: [
      'Florida Blue', 'AvMed', 'Simply Healthcare', 'Sunshine Health (FL)',
      'AmeriHealth Caritas', 'Independence Blue Cross', 'Harvard Pilgrim Health',
      'Tufts Health Plan', 'BCBS of Michigan', 'Highmark', 'Capital BlueCross',
      'Geisinger Health Plan', 'UPMC Health Plan', 'PreferredOne',
    ],
  },
  {
    category: 'Specialty & Alternative Payers',
    color: 'bg-cream border-gray/20',
    labelColor: 'bg-gray text-white',
    payers: [
      'Workers\' Compensation (All State Funds)', 'Auto / PIP Insurance',
      'Liability Insurance', 'ERISA Self-Funded Plans', 'HSA / HRA Plans',
      'ACA Marketplace Plans', 'Short-Term Health Plans', 'Association Health Plans',
      'Catastrophic Plans', 'Student Health Plans',
    ],
  },
];

const clearinghouses = [
  { name: 'Change Healthcare', desc: 'Largest clearinghouse in the US with broadest payer connectivity' },
  { name: 'Availity', desc: 'Real-time eligibility and claims for major commercial payers' },
  { name: 'Waystar', desc: 'Advanced analytics and automated claim workflows' },
  { name: 'NaviNet', desc: 'Payer-to-provider portal integration for real-time transactions' },
  { name: 'Office Ally', desc: 'Cost-effective routing for smaller regional payers' },
  { name: 'TriZetto / Cognizant', desc: 'Enterprise-grade clearinghouse for high-volume practices' },
];

export default function Payers() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-6">
              We Work With Your Payers
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-xl text-cream max-w-3xl mx-auto mb-10">
              Aethera connects with 900+ payers nationwide — from Medicare and Medicaid to every major commercial insurer. If they pay claims, we know how to work with them.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="flex flex-wrap justify-center gap-4">
              {['900+ Payers', 'All 50 States', 'Real-Time Eligibility', 'All Payer Types'].map((b, i) => (
                <span key={i} className="bg-white/15 border border-white/30 text-white px-5 py-2 rounded-full text-sm font-medium">
                  ✓ {b}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white border-b border-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '900+', label: 'Payers Connected' },
              { value: '99.8%', label: 'Electronic Claim Rate' },
              { value: '94%', label: 'Eligibility Denials Prevented' },
              { value: '48h', label: 'Avg. Clearinghouse Turnaround' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-teal">{s.value}</p>
                <p className="text-gray text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payer Groups */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="PAYER NETWORK"
            title="Payers We Work With"
            description="Our payer network spans government programs, national commercial carriers, regional plans, and specialty payers."
          />
          <div className="space-y-10 mt-12">
            {payerGroups.map((group, gi) => (
              <FadeIn key={gi} delay={gi * 0.1}>
                <div className={`rounded-2xl border p-6 ${group.color}`}>
                  <div className="flex items-center mb-5">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${group.labelColor}`}>
                      {group.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.payers.map((payer, pi) => (
                      <span key={pi} className="bg-white border border-gray/20 rounded-lg px-4 py-2.5 text-navy text-sm font-medium shadow-sm">
                        {payer}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Clearinghouses */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="CLEARINGHOUSE PARTNERS"
            title="Optimal Routing for Every Claim"
            description="We partner with the industry's leading clearinghouses, automatically selecting the best route for each payer."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {clearinghouses.map((ch, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-cream rounded-xl p-6 border border-gray/10 h-full">
                  <div className="flex items-center mb-3">
                    <Globe className="h-5 w-5 text-teal mr-2 flex-shrink-0" />
                    <h3 className="font-bold text-navy">{ch.name}</h3>
                  </div>
                  <p className="text-gray text-sm">{ch.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Real-Time Eligibility */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div className="flex items-center mb-4">
                <Zap className="h-7 w-7 text-teal mr-3" />
                <h2 className="text-3xl font-bold text-navy font-playfair">Real-Time Eligibility Verification</h2>
              </div>
              <p className="text-gray mb-6">
                We verify patient insurance eligibility in real time before every appointment — eliminating eligibility-related denials at the source. Our system checks coverage, co-pays, deductibles, and benefit limits automatically.
              </p>
              <div className="space-y-3">
                {[
                  '94% of eligibility denials prevented through real-time verification',
                  'Automated benefit checks run 24–48 hours before appointments',
                  'Co-pay and deductible data surfaced at check-in',
                  'Coverage gap alerts sent to front desk staff immediately',
                  'Secondary insurance verification included at no extra cost',
                ].map((item, i) => (
                  <div key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <p className="text-gray text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-navy rounded-2xl p-8 text-white">
                <Shield className="h-10 w-10 text-mint mb-4" />
                <h3 className="text-xl font-bold font-playfair mb-4">Payer Contract Expertise</h3>
                <p className="text-cream/80 mb-5 text-sm">
                  We don't just submit to your payers — we know them. Our team maintains active knowledge of each payer's specific rules, fee schedules, timely filing deadlines, and prior auth requirements.
                </p>
                <div className="space-y-3">
                  {[
                    'Payer-specific modifier requirements',
                    'Timely filing limits per payer (30–365 days)',
                    'Prior auth requirements by procedure and payer',
                    'Local Coverage Determination (LCD) compliance',
                    'Annual fee schedule updates applied proactively',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-mint mr-3 flex-shrink-0"></div>
                      <p className="text-cream/80 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Missing Payer */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h3 className="text-xl font-bold text-navy font-playfair mb-3">Don't See Your Payer?</h3>
            <p className="text-gray mb-6">We likely work with them. With 900+ payers in our network, if you don't see a specific plan listed, contact us for a payer-specific confirmation.</p>
            <Link href="/contact" className="inline-flex items-center bg-teal hover:bg-navy text-white font-bold py-3 px-8 rounded-full transition-colors duration-300">
              Ask About Your Payer <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-4">
                Maximize Reimbursement Across All Your Payers
              </h2>
              <p className="text-cream text-lg max-w-xl mx-auto mb-8">
                Our payer expertise means fewer denials, faster payments, and more money in your practice.
              </p>
              <Link href="/free-assessment" className="inline-flex items-center bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors">
                Get Your Free Assessment <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
