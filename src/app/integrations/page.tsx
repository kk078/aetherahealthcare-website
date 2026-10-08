import { marketingMetadata } from '@/lib/marketing';
import { canonicalUrl } from '@/lib/siteConfig';
import Link from 'next/link';
import { CheckCircle, Shield, Settings, ArrowRight, Zap } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';
import EhrLogo from '@/components/ui/EhrLogo';
import RcmHeroBand from '@/components/ui/RcmHeroBand';

export const metadata = {
  alternates: { canonical: canonicalUrl('/integrations') },
  title: { absolute: 'EHR & Practice Management Integrations | Aethera Healthcare Solutions' },
  description: 'Discuss your EHR and practice management workflow. Access, interface availability, secure intake and implementation timing are confirmed during discovery.',

  ...marketingMetadata("/integrations", 'EHR & Practice Management Integrations | Aethera Healthcare Solutions', 'Discuss your EHR and practice management workflow. Access, interface availability, secure intake and implementation timing are confirmed during discovery.'),
};

const featuredEHRs = [
  { name: 'Epic', slug: 'epic', initials: 'EP', type: 'Hospital & Ambulatory', method: 'Confirm during discovery', setup: 'Agreed after scope review', note: 'Workflow and interface availability depend on your product version, account permissions and vendor requirements. Confirm feasibility before committing.' },
  { name: 'Oracle Cerner', slug: 'oracle-cerner', initials: 'CR', type: 'Hospital', method: 'Confirm during discovery', setup: 'Agreed after scope review', note: 'Workflow and interface availability depend on your product version, account permissions and vendor requirements. Confirm feasibility before committing.' },
  { name: 'athenahealth', slug: 'athenahealth', initials: 'AT', type: 'Ambulatory PM', method: 'Confirm during discovery', setup: 'Agreed after scope review', note: 'Workflow and interface availability depend on your product version, account permissions and vendor requirements. Confirm feasibility before committing.' },
  { name: 'eClinicalWorks', slug: 'eclinicalworks', initials: 'EC', type: 'Ambulatory PM', method: 'Confirm during discovery', setup: 'Agreed after scope review', note: 'Workflow and interface availability depend on your product version, account permissions and vendor requirements. Confirm feasibility before committing.' },
  { name: 'Kareo / Tebra', slug: 'tebra', initials: 'KA', type: 'Small Practice PM', method: 'Confirm during discovery', setup: 'Agreed after scope review', note: 'Workflow and interface availability depend on your product version, account permissions and vendor requirements. Confirm feasibility before committing.' },
  { name: 'NextGen Healthcare', slug: 'nextgen', initials: 'NG', type: 'Ambulatory', method: 'Confirm during discovery', setup: 'Agreed after scope review', note: 'Workflow and interface availability depend on your product version, account permissions and vendor requirements. Confirm feasibility before committing.' },
  { name: 'DrChrono', slug: 'drchrono', initials: 'DC', type: 'Mobile-First PM', method: 'Confirm during discovery', setup: 'Agreed after scope review', note: 'Workflow and interface availability depend on your product version, account permissions and vendor requirements. Confirm feasibility before committing.' },
  { name: 'Modernizing Medicine (EMA)', slug: 'modernizing-medicine', initials: 'MM', type: 'Specialty-Focused', method: 'Confirm during discovery', setup: 'Agreed after scope review', note: 'Workflow and interface availability depend on your product version, account permissions and vendor requirements. Confirm feasibility before committing.' },
  { name: 'Practice Fusion', slug: 'practice-fusion', initials: 'PF', type: 'Cloud PM', method: 'Confirm during discovery', setup: 'Agreed after scope review', note: 'Workflow and interface availability depend on your product version, account permissions and vendor requirements. Confirm feasibility before committing.' },
  { name: 'CharmHealth', slug: 'charmhealth', initials: 'CH', type: 'Cloud PM', method: 'Confirm during discovery', setup: 'Agreed after scope review', note: 'Workflow and interface availability depend on your product version, account permissions and vendor requirements. Confirm feasibility before committing.' },
  { name: 'Allscripts / Veradigm', slug: 'veradigm', initials: 'AL', type: 'Ambulatory', method: 'Confirm during discovery', setup: 'Agreed after scope review', note: 'Workflow and interface availability depend on your product version, account permissions and vendor requirements. Confirm feasibility before committing.' },
  { name: 'Meditech', slug: 'meditech', initials: 'MT', type: 'Hospital', method: 'Confirm during discovery', setup: 'Agreed after scope review', note: 'Workflow and interface availability depend on your product version, account permissions and vendor requirements. Confirm feasibility before committing.' },
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
  { icon: <Zap className="h-7 w-7" />, step: '02', title: 'Configuration', desc: 'After scope approval, agree mapping for providers, locations and applicable billing data with your authorized team.' },
  { icon: <CheckCircle className="h-7 w-7" />, step: '03', title: 'Parallel Testing', desc: 'We run parallel processing with sample charges to validate accuracy, confirm ERA posting, and verify all data flows correctly before going live.' },
  { icon: <ArrowRight className="h-7 w-7" />, step: '04', title: 'Go Live', desc: 'Go live only after validation and approval, with responsibilities and support arrangements confirmed in writing.' },
];

const colorMap = ['bg-navy', 'bg-teal', 'bg-mint', 'bg-navy/70', 'bg-teal/70', 'bg-mint/70'];


// Slugs whose official logo file exists in /public/images/ehr/. Add a slug here
// once you drop its <slug>.svg (or .png) in; until then the initials badge shows.
const EHR_LOGOS_AVAILABLE = new Set<string>([]);

export default function Integrations() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <RcmHeroBand
        eyebrow="EHR Integrations"
        title="Plan billing around your EHR"
        subtitle="Tell us your system and workflow. We assess available interfaces, permissions and secure exchange options before agreeing implementation scope."
        primary={{ href: '/free-assessment', label: 'Get a Free Assessment' }}
        secondary={{ href: '/contact', label: 'Talk to an Expert' }}
        chips={['Discovery before commitment', 'BAA before records', 'Scope agreed in writing']}
      />

      {/* Featured EHRs */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="SYSTEMS TO DISCUSS"
            title="EHR Workflow Assessment"
            description="These product names identify systems you may use. Listing a system does not imply a vendor partnership, certification or a working API connection."
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
            label="ADDITIONAL SYSTEMS"
            title="Other Practice Systems"
            description="If you use one of these systems, we can assess your available exports, permissions and vendor requirements."
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
          <SectionHeader label="THE PROCESS" title="How Integration Works" description="Agree requirements, validate the available exchange method and confirm a timeline before going live." />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            {steps.map((s, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="bg-white rounded-xl p-6 border border-gray/10 h-full">
                  <div className="text-teal mb-3">{s.icon}</div>
                  <div className="text-3xl font-bold text-teal/20 font-jakarta mb-2">{s.step}</div>
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
                <h2 className="text-3xl font-bold text-navy font-jakarta">Confirm Security Before Access</h2>
              </div>
              <p className="text-gray mb-6">Before exchanging clinical records, review the agreed controls, access permissions, BAA and approved intake channel.</p>
              <div className="space-y-3">
                {[
                  'Confirm encryption for the approved transfer channel',
                  'Confirm storage protection and retention requirements',
                  'Minimum necessary PHI principle — we only access what billing requires',
                  'Agree access logging and audit responsibilities',
                  'Business Associate Agreement (BAA) executed before any access',
                  'Request applicable security documentation before access',
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
                <h3 className="text-xl font-bold text-navy font-jakarta mb-4">Don&apos;t See Your System?</h3>
                <p className="text-gray mb-5 text-sm">
                  Ask us to assess the exchange methods your vendor permits, including applicable interfaces or secure exports. Feasibility and delivery timing require discovery.
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
              <h2 className="text-3xl md:text-4xl font-bold text-white font-jakarta mb-4">
                Start Your Integration Assessment Today
              </h2>
              <p className="text-cream text-lg max-w-xl mx-auto mb-8">
                Tell us your EHR and we&apos;ll outline exactly how the integration works, what it requires, and how long it takes.
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
