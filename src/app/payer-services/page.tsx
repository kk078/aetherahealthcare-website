import Link from 'next/link';
import { Shield, CheckCircle, Zap, ArrowRight, Database, FileSearch, Users, ClipboardCheck, Scale, BarChart3 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'Payer Services | Health Plan Operations & Payment Integrity | Aethera Healthcare',
  description: 'Aethera Healthcare Solutions partners with health plans, TPAs, and risk-bearing entities to deliver claims operations, payment integrity, provider data management, credentialing (CVO), prior authorization administration, and appeals & grievances support.',
};

const stats = [
  { value: '99.4%', label: 'Claims Adjudication Accuracy' },
  { value: '6:1', label: 'Avg Payment-Integrity ROI' },
  { value: '<48 hrs', label: 'Provider Data Turnaround' },
  { value: '50 States', label: 'Regulatory Coverage' },
];

const offerings = [
  {
    icon: <Database className="h-6 w-6" />,
    title: 'Claims Operations & Adjudication Support',
    description: 'Configuration-driven claims processing, manual adjudication overflow, COB/subrogation handling, and edit/audit support to keep auto-adjudication rates high and turnaround within regulatory timelines.',
  },
  {
    icon: <FileSearch className="h-6 w-6" />,
    title: 'Payment Integrity',
    description: 'Pre- and post-pay review, DRG validation, clinical and coding audits, duplicate and overpayment recovery, and fraud-waste-abuse detection that returns multiples of program cost.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Provider Data Management',
    description: 'Roster ingestion, directory accuracy, demographic validation, and continuous provider data maintenance to meet No Surprises Act and CMS directory-accuracy requirements.',
  },
  {
    icon: <ClipboardCheck className="h-6 w-6" />,
    title: 'Credentialing & CVO',
    description: 'NCQA-aligned primary source verification, initial credentialing and recredentialing, sanctions and exclusion monitoring, and committee-ready files as a full credentials verification organization.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Prior Authorization Administration',
    description: 'Intake, clinical criteria application, medical-necessity review support, and turnaround tracking that keeps utilization management compliant with state and federal timeliness rules.',
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: 'Appeals & Grievances',
    description: 'End-to-end appeals and grievance case management, regulatory correspondence, and timeliness reporting for commercial, Medicare Advantage, and Medicaid lines of business.',
  },
];

const whoWeServe = [
  'Commercial health plans and regional insurers',
  'Medicare Advantage and D-SNP plans',
  'Medicaid managed care organizations',
  'Third-party administrators (TPAs)',
  'Risk-bearing provider groups, IPAs, and ACOs',
  'Self-funded employers and stop-loss carriers',
];

const differentiators = [
  { title: 'Provider-Side DNA', desc: 'We process millions of provider claims, so we understand both sides of the transaction — and design payer operations that reduce abrasion while protecting the medical-loss ratio.' },
  { title: 'Compliance-First', desc: 'HIPAA, SOC 2, NCQA-aligned credentialing, CMS and state-specific timeliness — built into every workflow, with audit-ready documentation by default.' },
  { title: 'Outcomes, Not Headcount', desc: 'Engagements are measured on accuracy, recovery, turnaround, and member/provider satisfaction — not hours billed. You buy results.' },
];

export default function PayerServices() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-mint/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <FadeIn>
              <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
                New Line of Business
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-6 leading-tight">
                Payer Services for Modern Health Plans
              </h1>
              <p className="text-xl text-cream mb-10">
                Aethera now serves the other side of the claim. We help health plans, TPAs, and risk-bearing entities run accurate, compliant, member-friendly operations — from claims adjudication and payment integrity to credentialing, provider data, prior authorization, and appeals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link prefetch={false} href="/contact" className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors text-center">
                  Talk to Our Payer Team
                </Link>
                <Link prefetch={false} href="/free-assessment" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full transition-colors text-center">
                  Request a Capabilities Briefing
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white border-b border-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-teal">{s.value}</p>
                <p className="text-gray text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="WHAT WE DO FOR PAYERS"
            title="End-to-End Health Plan Operations"
            description="A modular suite you can adopt as a single function or a full back-office partnership — each line built to be accurate, compliant, and measurable."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {offerings.map((o, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-6 border border-gray/10 shadow-sm h-full">
                  <div className="text-teal mb-4">{o.icon}</div>
                  <h3 className="font-bold text-navy mb-2">{o.title}</h3>
                  <p className="text-gray text-sm">{o.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Who we serve + Why Aethera */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-5">Who We Serve</h2>
              <p className="text-gray mb-6">
                Our payer services are built for organizations that bear claims, regulatory, and network responsibility — and need an operating partner that treats accuracy and compliance as non-negotiable.
              </p>
              <div className="bg-cream rounded-2xl p-7 border border-gray/10 space-y-3">
                {whoWeServe.map((item, i) => (
                  <div key={i} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <p className="text-gray text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-5">Why Aethera for Payer Services</h2>
              <div className="space-y-5">
                {differentiators.map((d, i) => (
                  <div key={i} className="bg-cream rounded-xl p-6 border border-gray/10">
                    <div className="flex items-center mb-2">
                      <Zap className="h-5 w-5 text-teal mr-2" />
                      <h3 className="font-bold text-navy">{d.title}</h3>
                    </div>
                    <p className="text-gray text-sm">{d.desc}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Compliance band */}
      <section className="py-16 md:py-24 bg-navy">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <BarChart3 className="h-10 w-10 text-mint mx-auto mb-5" />
            <h2 className="text-3xl font-bold text-white font-playfair mb-4">Built for Regulatory Reality</h2>
            <p className="text-cream/80 max-w-3xl mx-auto mb-8">
              Every payer engagement runs on HIPAA-compliant, SOC 2-aligned infrastructure with NCQA-aligned credentialing, CMS and state timeliness tracking, and audit-ready documentation — so your compliance team sleeps at night and your regulators stay satisfied.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['HIPAA', 'SOC 2', 'NCQA-Aligned', 'CMS & State Timeliness'].map((b, i) => (
                <div key={i} className="bg-white/10 rounded-xl py-4">
                  <p className="text-mint font-bold">{b}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-14 px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold text-white font-playfair mb-4">Let's Talk About Your Plan Operations</h2>
              <p className="text-cream max-w-xl mx-auto mb-8">
                Whether you need one function or a full back-office partner, we'll scope a payer-services engagement around your accuracy, recovery, and compliance goals.
              </p>
              <Link prefetch={false} href="/contact" className="inline-flex items-center bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors">
                Schedule a Capabilities Briefing <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
