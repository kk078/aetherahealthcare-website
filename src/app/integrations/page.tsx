import Link from 'next/link';
import { CheckCircle, Shield, Settings, ArrowRight, Zap } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';
import EhrLogo from '@/components/ui/EhrLogo';

export const metadata = {
  title: { absolute: 'EHR & Practice Management Integrations | Aethera Healthcare Solutions' },
  description: 'Aethera integrates with Epic, Cerner, athenahealth, Kareo, eClinicalWorks, and 50+ EHR systems. No workflow disruption — setup in 1–4 weeks.',
};

const featuredEHRs = [
  { name: 'Epic', slug: 'epic', initials: 'EP', type: 'Hospital & Ambulatory', method: 'HL7 FHIR API', setup: '3–4 weeks', note: 'Full bidirectional integration: charge capture, eligibility, claim status, and ERA posting.' },
  { name: 'Oracle Cerner', slug: 'oracle-cerner', initials: 'CR', type: 'Hospital', method: 'HL7 2.x / FHIR', setup: '3–4 weeks', note: 'Charge Router integration with real-time claim scrubbing and ERA reconciliation.' },
  { name: 'athenahealth', slug: 'athenahealth', initials: 'AT', type: 'Ambulatory PM', method: 'Native API', setup: '1–2 weeks', note: 'One of our most seamless integrations — charges flow automatically, no manual export needed.' },
  { name: 'eClinicalWorks', slug: 'eclinicalworks', initials: 'EC', type: 'Ambulatory PM', method: 'Direct Interface', setup: '2–3 weeks', note: 'Full charge import with provider, location, and fee schedule mapping.' },
  { name: 'Kareo / Tebra', slug: 'tebra', initials: 'KA', type: 'Small Practice PM', method: 'CSV / API', setup: '1–2 weeks', note: 'Ideal for solo and small group practices. Simple setup, immediate charge flow.' },
  { name: 'NextGen Healthcare', slug: 'nextgen', initials: 'NG', type: 'Ambulatory', method: 'HL7 Interface', setup: '2–3 weeks', note: 'Strong modifier and code set support. Denial data feeds back into NextGen automatically.' },
  { name: 'DrChrono', slug: 'drchrono', initials: 'DC', type: 'Mobile-First PM', method: 'REST API', setup: '1–2 weeks', note: 'Built for mobile-heavy practices. Real-time charge submission from any device.' },
  { name: 'Modernizing Medicine (EMA)', slug: 'modernizing-medicine', initials: 'MM', type: 'Specialty-Focused', method: 'Direct Export', setup: '2–3 weeks', note: 'Specialty-specific charge sheets supported. Particularly strong for dermatology and orthopedics.' },
  { name: 'Practice Fusion', slug: 'practice-fusion', initials: 'PF', type: 'Cloud PM', method: 'CCD / API', setup: '1–2 weeks', note: 'Simple charge export integration. Eligibility verification feeds back into the scheduler.' },
  { name: 'CharmHealth', slug: 'charmhealth', initials: 'CH', type: 'Cloud PM', method: 'REST API', setup: '1–2 weeks', note: 'Full eligibility, claims, and ERA integration. Works well for multi-specialty groups.' },
  { name: 'Allscripts / Veradigm', slug: 'veradigm', initials: 'AL', type: 'Ambulatory', method: 'HL7 Interface', setup: '2–3 weeks', note: 'Legacy system expertise included. We handle the technical lift so your staff doesn\'t have to.' },
  { name: 'Meditech', slug: 'meditech', initials: 'MT', type: 'Hospital', method: 'HL7 ADT / ORM', setup: '3–4 weeks', note: 'Full inpatient and outpatient support. Integrated with MEDITECH Expanse and legacy versions.' },
];

const otherSystems = [
  'AthenaOne', 'Greenway Health', 'CureMD', 'IntelliChart', 'Amazing Charts',
  'WebPT', 'TherapyNotes', 'SimplePractice', 'Jane App', 'Netsmart',
  'PointClickCare', 'MatrixCare', 'Brightree', 'RevenueWell', 'Updox',
  'Healow', 'Phreesia', 'Bridge', 'iPatientCare', 'Nuvelo',
  'Aprima', 'CompuMed', 'CareCloud', 'Azalea Health', 'Meditab',
];

const steps = [
  { icon: <Settings className="h-7 w-7" />, step: '01', title: 'Discovery', desc: 'We assess your current system, document your charge capture workflow, and identify integration requirements specific to your version and configuration.' },
  { icon: <Zap className="h-7 w-7" />, step: '02', title: 'Configuration', desc: 'We configure the integration — mapping providers, locations, code sets, and fee schedules. No action required from your IT team in most cases.' },
  { icon: <CheckCircle className="h-7 w-7" />, step: '03', title: 'Parallel Testing', desc: 'We run parallel processing with sample charges to validate accuracy, confirm ERA posting, and verify all data flows correctly before going live.' },
  { icon: <ArrowRight className="h-7 w-7" />, step: '04', title: 'Go Live', desc: 'Full integration with real-time monitoring and a dedicated integration specialist on call for the first 30 days.' },
];

const colorMap = ['bg-navy', 'bg-teal', 'bg-mint', 'bg-navy/70', 'bg-teal/70', 'bg-mint/70'];


// Slugs whose official logo file exists in /public/images/ehr/. Add a slug here
// once you drop its <slug>.svg (or .png) in; until then the initials badge shows.
const EHR_LOGOS_AVAILABLE = new Set<string>([]);

export default function Integrations() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-6">
              We Work With Your EHR
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-xl text-cream max-w-3xl mx-auto mb-10">
              No rip-and-replace. No workflow disruption. Aethera integrates directly with your existing EHR and practice management system so your staff keeps working exactly as they do today.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="flex flex-wrap justify-center gap-4">
              {['50+ EHR Systems', 'Setup in 1–4 Weeks', 'Zero Workflow Disruption', 'HIPAA-Compliant Transfer'].map((b, i) => (
                <span key={i} className="bg-white/15 border border-white/30 text-white px-5 py-2 rounded-full text-sm font-medium">✓ {b}</span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Featured EHRs */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="SUPPORTED SYSTEMS"
            title="Featured EHR Integrations"
            description="Direct integrations with the most widely used electronic health records and practice management systems."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {featuredEHRs.map((ehr, i) => (
              <FadeIn key={i} delay={(i % 4) * 0.1}>
                <div className="bg-white rounded-xl p-6 border border-gray/10 shadow-sm h-full flex gap-5">
                  <EhrLogo slug={ehr.slug} initials={ehr.initials} name={ehr.name} colorClass={colorMap[i % colorMap.length]} hasLogo={EHR_LOGOS_AVAILABLE.has(ehr.slug)} />
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-navy">{ehr.name}</h3>
                      <span className="text-xs bg-cream text-gray border border-gray/20 px-2 py-0.5 rounded-full">{ehr.type}</span>
                    </div>
                    <p className="text-gray text-sm mb-3">{ehr.note}</p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="text-teal font-semibold">Method: {ehr.method}</span>
                      <span className="text-gray">·</span>
                      <span className="text-teal font-semibold">Setup: {ehr.setup}</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Other Systems */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="ALSO SUPPORTED"
            title="25+ Additional Systems"
            description="We also integrate with these platforms and can accommodate custom integrations via HL7, FHIR, or CSV."
          />
          <div className="flex flex-wrap gap-2 mt-12 justify-center">
            {otherSystems.map((s, i) => (
              <FadeIn key={i} delay={0.05}>
                <span className="bg-cream border border-gray/20 rounded-lg px-4 py-2.5 text-navy text-sm font-medium">{s}</span>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="THE PROCESS" title="How Integration Works" description="A structured 4-step process that takes 1–4 weeks from kickoff to go-live." />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            {steps.map((s, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="bg-white rounded-xl p-6 border border-gray/10 h-full">
                  <div className="text-teal mb-3">{s.icon}</div>
                  <div className="text-3xl font-bold text-teal/20 font-playfair mb-2">{s.step}</div>
                  <h3 className="font-bold text-navy mb-2">{s.title}</h3>
                  <p className="text-gray text-sm">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div className="flex items-center mb-4">
                <Shield className="h-7 w-7 text-teal mr-3" />
                <h2 className="text-3xl font-bold text-navy font-playfair">Data Security Throughout</h2>
              </div>
              <p className="text-gray mb-6">Every data transfer between your EHR and Aethera's systems is fully HIPAA-compliant, encrypted end-to-end, and logged for audit purposes.</p>
              <div className="space-y-3">
                {[
                  'TLS 1.3 encryption on all data in transit',
                  'AES-256 encryption for data at rest',
                  'Minimum necessary PHI principle — we only access what billing requires',
                  'Full audit trail on every data access event',
                  'Business Associate Agreement (BAA) executed before any access',
                  'Annual third-party security assessment',
                ].map((item, i) => (
                  <div key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <p className="text-gray text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-cream rounded-2xl p-8 border border-gray/10">
                <h3 className="text-xl font-bold text-navy font-playfair mb-4">Don't See Your System?</h3>
                <p className="text-gray mb-5 text-sm">
                  We support custom integrations via HL7 2.x, HL7 FHIR, CCD, CSV upload, and secure file transfer. If you use it, we can almost certainly connect to it. Contact us for a custom integration assessment.
                </p>
                <Link prefetch={false} href="/contact" className="inline-flex items-center bg-teal hover:bg-navy text-white font-bold py-3 px-6 rounded-full transition-colors text-sm">
                  Ask About Your System <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-4">
                Start Your Integration Assessment Today
              </h2>
              <p className="text-cream text-lg max-w-xl mx-auto mb-8">
                Tell us your EHR and we'll outline exactly how the integration works, what it requires, and how long it takes.
              </p>
              <Link prefetch={false} href="/free-assessment" className="inline-flex items-center bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors">
                Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
