import Head from 'next/head';
import Link from 'next/link';
import { Users, CheckCircle, Shield, BarChart3 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

const includedItems = [
  'Initial provider enrollment',
  'Re-enrollment and revalidation',
  'Payer panel applications',
  'Hospital privileges applications',
  'CAQH profile maintenance',
  'License verification and renewal tracking',
  'DEA registration and renewal',
  'Board certification verification',
  'Malpractice insurance verification',
  'Sanctions and exclusions screening',
  'Ongoing monitoring and compliance',
  'Credentialing file management',
];

const processSteps = [
  'File review and gap analysis',
  'Document collection and verification',
  'Application preparation',
  'Submission to payers/hospitals',
  'Status monitoring and follow-up',
  'Approval tracking',
  'Panel activation',
  'Ongoing compliance monitoring',
];

const kpis = [
  { metric: 'Credentialing Accuracy', value: '100%' },
  { metric: 'Average Turnaround Time', value: '<60 days' },
  { metric: 'Recredentialing Compliance', value: '100%' },
  { metric: 'Payer Panel Activation', value: '>95%' },
];

const challenges = [
  'Lengthy credentialing processes',
  'Complex documentation requirements',
  'Multiple payer-specific applications',
  'Ongoing recredentialing deadlines',
  'Sanctions and exclusions monitoring',
  'Provider panel management',
  'Compliance with changing regulations',
];

const faqs = [
  {
    question: 'How long does the credentialing process take?',
    answer: 'Initial credentialing typically takes 60-90 days, depending on payer requirements. We provide weekly status updates and work expeditiously to activate panels as quickly as possible.'
  },
  {
    question: 'Do you handle hospital privileges as well?',
    answer: "Yes, we manage the complete credentialing process including hospital privileges applications, medical staff appointments, and ongoing compliance requirements for hospital affiliations."
  },
  {
    question: 'How do you ensure compliance with recredentialing deadlines?',
    answer: 'We maintain a comprehensive tracking system that monitors all recredentialing deadlines and initiates the process 120 days in advance to ensure no lapses in panel participation.'
  },
  {
    question: 'What is CAQH and do you manage it?',
    answer: 'CAQH (Council for Affordable Quality Healthcare) is a standardized credentialing database used by most commercial payers. We maintain complete and accurate CAQH profiles for all providers.'
  },
  {
    question: 'How do you handle sanctions and exclusions monitoring?',
    answer: 'We conduct monthly screenings of all providers against the OIG Exclusion List, SAM.gov, and state Medicaid exclusion databases. Any issues are immediately reported and resolved.'
  }
];

const relatedServices = [
  { name: 'Compliance & Auditing', href: '/services/compliance-auditing' },
  { name: 'Eligibility Verification', href: '/services/eligibility-verification' },
  { name: 'Prior Authorization', href: '/services/prior-authorization' },
];

export default function Credentialing() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "serviceType": "Provider Credentialing Services",
              "provider": {
                "@type": "Organization",
                "name": "Aethera Healthcare Solutions",
                "url": "https://aetherahealthcare-website.pages.dev",
                "logo": "https://aetherahealthcare-website.pages.dev/logo.png"
              },
              "description": "Complete credentialing and enrollment services for healthcare providers. Streamline provider panel enrollment and maintain compliance with payer requirements.",
              "areaServed": "United States",
              "category": "Healthcare Services",
              "offers": {
                "@type": "Offer",
                "category": "Professional Service",
                "priceSpecification": {
                  "@type": "PriceSpecification",
                  "description": "Contact for pricing details"
                }
              }
            })
          }}
        />
      </Head>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-playfair mb-6">
                Provider Credentialing Services
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Complete credentialing management that gets your providers on panels faster.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Service Description */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  Expert Credentialing for Seamless Provider Enrollment
                </h2>
                <p className="text-gray mb-6">
                  Our comprehensive credentialing services ensure your providers are enrolled with all necessary payers and facilities quickly and accurately, with ongoing compliance management.
                </p>
                <p className="text-gray mb-6">
                  We handle initial credentialing, recredentialing, hospital privileges, CAQH maintenance, and ongoing monitoring to keep your panels active and compliant.
                </p>
                <p className="text-gray">
                  With our expert credentialing team, you can eliminate credentialing delays, reduce administrative burden, and ensure continuous revenue flow from all panels.
                </p>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8 h-full">
                  <div className="flex items-center mb-6">
                    <Users className="h-10 w-10 text-teal mr-4" />
                    <h3 className="text-2xl font-bold text-navy">Our Approach</h3>
                  </div>
                  <p className="text-gray mb-6">
                    We combine detailed process management with expert knowledge of payer requirements to ensure complete and compliant credentialing.
                  </p>
                  <div className="border-t border-gray/10 pt-6">
                    <h4 className="font-bold text-navy mb-4">Quality Assurance</h4>
                    <p className="text-gray">
                      Every credentialing file undergoes comprehensive review and every application is verified for accuracy before submission.
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="WHAT'S INCLUDED"
            title="Complete Credentialing Management"
            description="Every aspect of provider credentialing covered for maximum efficiency and compliance."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            {includedItems.map((item, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-teal flex-shrink-0 mt-1 mr-3" />
                  <p className="text-gray">{item}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="OUR PROCESS"
            title="Credentialing Workflow"
            description="Eight-step process ensuring complete and compliant provider enrollment."
          />

          <div className="mt-16">
            <div className="flex flex-col md:flex-row justify-between relative">
              {/* Connecting line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-teal transform md:-translate-x-1/2 hidden md:block"></div>

              {processSteps.map((step, index) => (
                <FadeIn key={index} delay={index * 0.2} className="flex mb-12 md:mb-0">
                  <div className="flex flex-col items-center md:items-start w-full md:w-auto">
                    <div className="flex items-center">
                      <div className="bg-teal text-white rounded-full w-8 h-8 flex items-center justify-center font-bold z-10">
                        {index + 1}
                      </div>
                      <div className="ml-4 md:ml-6">
                        <h3 className="text-xl font-bold text-navy">{step}</h3>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="PERFORMANCE METRICS"
            title="Credentialing Excellence"
            description="Measurable results that drive your revenue cycle success."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {kpis.map((kpi, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 text-center border border-gray/10">
                  <p className="text-3xl font-bold text-teal mb-2">{kpi.value}</p>
                  <p className="text-gray">{kpi.metric}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Common Challenges */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="CHALLENGES WE SOLVE"
            title="Credentialing Complexity Made Simple"
            description="We handle the complexities so you don't have to."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {challenges.map((challenge, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-cream rounded-xl p-6 border border-gray/10">
                  <div className="flex items-center mb-4">
                    <Shield className="h-6 w-6 text-teal mr-3" />
                    <h3 className="text-lg font-bold text-navy">Challenge {index + 1}</h3>
                  </div>
                  <p className="text-gray">{challenge}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="FAQ"
            title="Frequently Asked Questions"
            description="Answers to common questions about our credentialing services."
          />

          <div className="grid grid-cols-1 gap-8 mt-16">
            {faqs.map((faq, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10">
                  <h3 className="text-lg font-bold text-navy mb-2">{faq.question}</h3>
                  <p className="text-gray">{faq.answer}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-6">
                Ready to Streamline Your Credentialing Process?
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Schedule a free consultation to see how Aethera can accelerate your provider panel enrollment.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/contact"
                  className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
                >
                  Schedule Free Consultation
                </Link>
                <Link
                  href="/pricing"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
                >
                  View Pricing Options
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="RELATED SERVICES"
            title="Complete Revenue Cycle Management"
            description="Additional services that complement our credentialing expertise."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {relatedServices.map((service, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10">
                  <BarChart3 className="h-10 w-10 text-teal mb-4" />
                  <h3 className="text-xl font-bold text-navy mb-2">{service.name}</h3>
                  <Link
                    href={service.href}
                    className="text-teal font-medium hover:text-mint transition-colors"
                  >
                    Learn more →
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}