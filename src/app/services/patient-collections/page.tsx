import Head from 'next/head';
import Link from 'next/link';
import { CreditCard, CheckCircle, Shield, BarChart3 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

const includedItems = [
  'Patient statement generation and mailing',
  'Automated payment plan setup',
  'Collection agency referral management',
  'Payment posting and reconciliation',
  'Patient communication and follow-up',
  'Financial hardship program administration',
  'Credit card and ACH payment processing',
  'Payment portal management',
  'Insurance payment coordination',
  'Write-off and adjustment processing',
  'Collections reporting and analytics',
  'Compliance with collection regulations',
];

const processSteps = [
  'Account aging and segmentation',
  'Initial patient contact',
  'Payment arrangement negotiation',
  'Statement generation and distribution',
  'Payment processing and posting',
  'Follow-up communication',
  'Agency referral when appropriate',
  'Resolution and closure',
];

const kpis = [
  { metric: 'Collection Rate', value: '>65%' },
  { metric: 'Patient Payment Plan Enrollment', value: '>40%' },
  { metric: 'Days in Collection', value: '<45 days' },
  { metric: 'Compliance Rate', value: '100%' },
];

const challenges = [
  'Patient payment resistance',
  'Complex insurance payment issues',
  'Collection agency compliance',
  'Financial hardship cases',
  'Multiple payment method management',
  'Patient communication challenges',
  'Regulatory compliance complexity',
];

const faqs = [
  {
    question: 'How do you handle patient payment plans?',
    answer: 'We offer flexible payment plans tailored to each patient\'s financial situation, with automated setup and monthly payment processing. Our payment plan enrollment rate exceeds 40% of eligible accounts.'
  },
  {
    question: 'Do you use collection agencies?',
    answer: "We work with carefully selected, compliant collection agencies for accounts that don't respond to our direct patient collection efforts. We maintain oversight of all agency activities to ensure compliance."
  },
  {
    question: 'How do you ensure compliance with collection regulations?',
    answer: 'We maintain strict compliance with all federal and state collection regulations including the FDCPA, TCPA, and state-specific requirements. All staff receive annual training on compliance requirements.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, ACH payments, and offer online payment portals for patient convenience. Our payment processing systems are fully PCI compliant and secure.'
  },
  {
    question: 'How do you handle financial hardship cases?',
    answer: 'We have established financial hardship programs that allow patients to apply for reduced payments or payment deferrals. Applications are reviewed compassionately while maintaining practice financial integrity.'
  }
];

const relatedServices = [
  { name: 'Payment Posting', href: '/services/payment-posting' },
  { name: 'Patient Collections', href: '/services/patient-collections' },
  { name: 'AR Follow-Up', href: '/services/ar-followup' },
];

export default function PatientCollections() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "serviceType": "Patient Collections Services",
              "provider": {
                "@type": "Organization",
                "name": "Aethera Healthcare Solutions",
                "url": "https://aetherahealthcare-website.pages.dev",
                "logo": "https://aetherahealthcare-website.pages.dev/logo.png"
              },
              "description": "Professional patient collections that maximize revenue while preserving relationships. Expert handling of statement generation, payment plans, and collection agency coordination.",
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
                Patient Collections Services
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Professional patient collections that maximize revenue while preserving relationships.
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
                  Effective Collections with Compassionate Communication
                </h2>
                <p className="text-gray mb-6">
                  Our professional patient collections services maximize revenue recovery while maintaining positive patient relationships through compliant, respectful communication strategies.
                </p>
                <p className="text-gray mb-6">
                  We handle statement generation, payment plan administration, collection agency coordination, and direct patient communication with full compliance with all federal and state regulations.
                </p>
                <p className="text-gray">
                  With our patient-centered approach to collections, you can increase collections, reduce days in accounts receivable, and maintain high patient satisfaction scores.
                </p>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8 h-full">
                  <div className="flex items-center mb-6">
                    <CreditCard className="h-10 w-10 text-teal mr-4" />
                    <h3 className="text-2xl font-bold text-navy">Our Approach</h3>
                  </div>
                  <p className="text-gray mb-6">
                    We combine automated collection workflows with personalized communication to optimize collections while preserving patient relationships and ensuring compliance.
                  </p>
                  <div className="border-t border-gray/10 pt-6">
                    <h4 className="font-bold text-navy mb-4">Quality Assurance</h4>
                    <p className="text-gray">
                      Every collection activity undergoes compliance review and every patient communication is monitored for regulatory adherence and patient satisfaction.
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
            title="Complete Patient Collections Management"
            description="Every aspect of patient collections covered for maximum recovery and relationship preservation."
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
            title="Collections Workflow"
            description="Eight-step process ensuring effective collections while maintaining patient relationships."
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
            title="Collections Excellence"
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
            title="Collections Complexity Made Simple"
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
            description="Answers to common questions about our patient collections services."
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
                Ready to Improve Your Collection Rate?
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Schedule a free consultation to see how Aethera can maximize your patient collections.
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
            description="Additional services that complement our patient collections expertise."
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