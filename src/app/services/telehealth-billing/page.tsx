import Head from 'next/head';
import Link from 'next/link';
import { Zap, CheckCircle, Shield, BarChart3 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

const includedItems = [
  'Telehealth visit coding (99421-99423, 99441-99443)',
  'Virtual check-in billing (G2010, G2012)',
  'E-visit coding (99497-99498)',
  'Remote patient monitoring billing',
  'Store-and-forward telemedicine coding',
  'Payer-specific telehealth requirements',
  'State telehealth regulation compliance',
  'Telehealth platform integration',
  'Modifier usage for telehealth services',
  'Telehealth documentation requirements',
  'Cross-state licensing compliance',
  'Telehealth audit preparation',
];

const processSteps = [
  'Telehealth visit identification',
  'Appropriate code selection',
  'Modifier application',
  'Payer requirement verification',
  'Claim preparation',
  'Telehealth-specific submission',
  'Status monitoring',
  'Denial prevention and management',
];

const kpis = [
  { metric: 'Telehealth Clean Claim Rate', value: '>95%' },
  { metric: 'Telehealth Collection Rate', value: '>90%' },
  { metric: 'Coding Accuracy', value: '>98%' },
  { metric: 'Payer Compliance', value: '100%' },
];

const challenges = [
  'Payer-specific telehealth policies',
  'Complex modifier requirements',
  'Cross-state licensing issues',
  'Documentation adequacy',
  'Technology platform integration',
  'Reimbursement rate variations',
  'Regulatory compliance complexity',
];

const faqs = [
  {
    question: 'Which telehealth codes do you bill?',
    answer: 'We bill all appropriate telehealth codes including synchronous codes (99421-99423, 99441-99443), asynchronous codes (99421-99423), virtual check-in codes (G2010, G2012), and e-visit codes (99497-99498).'
  },
  {
    question: 'How do you handle payer-specific telehealth requirements?',
    answer: "We maintain detailed profiles for each payer's telehealth policies including covered services, documentation requirements, and reimbursement rates. Our team stays current with frequent policy updates."
  },
  {
    question: 'Do you support remote patient monitoring billing?',
    answer: 'Yes, we handle RPM billing including initial setup codes, device supply codes, and monitoring service codes with full compliance with CMS and payer requirements.'
  },
  {
    question: 'How do you ensure telehealth documentation compliance?',
    answer: 'We work with your team to ensure telehealth visits meet documentation requirements including consent, technology used, and clinical services provided. We provide templates and training as needed.'
  },
  {
    question: 'What about cross-state telehealth billing?',
    answer: 'We maintain current knowledge of state telehealth regulations and licensing requirements to ensure compliant billing when treating patients across state lines.'
  }
];

const relatedServices = [
  { name: 'Medical Coding', href: '/services/medical-coding' },
  { name: 'Claims & Billing', href: '/services/claims-billing' },
  { name: 'Denial Management', href: '/services/denial-management' },
];

export default function TelehealthBilling() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "serviceType": "Telehealth Billing Services",
              "provider": {
                "@type": "Organization",
                "name": "Aethera Healthcare Solutions",
                "url": "https://aetherahealthcare-website.pages.dev",
                "logo": "https://aetherahealthcare-website.pages.dev/logo.png"
              },
              "description": "Specialized telehealth billing that maximizes reimbursement for virtual care. Expert coding and compliance for telehealth visits, virtual check-ins, and remote patient monitoring.",
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
                Telehealth Billing Services
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Specialized telehealth billing that maximizes reimbursement for virtual care.
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
                  Expert Telehealth Billing for Modern Healthcare Delivery
                </h2>
                <p className="text-gray mb-6">
                  Our specialized telehealth billing services ensure accurate coding, compliant submission, and maximum reimbursement for all virtual care services including telehealth visits, virtual check-ins, and remote patient monitoring.
                </p>
                <p className="text-gray mb-6">
                  We stay current with complex and frequently changing payer policies, state regulations, and coding requirements to ensure your telehealth services are properly reimbursed.
                </p>
                <p className="text-gray">
                  With our expert telehealth billing, you can expand your virtual care offerings with confidence, knowing your telehealth revenue is optimized and compliant.
                </p>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8 h-full">
                  <div className="flex items-center mb-6">
                    <Zap className="h-10 w-10 text-teal mr-4" />
                    <h3 className="text-2xl font-bold text-navy">Our Approach</h3>
                  </div>
                  <p className="text-gray mb-6">
                    We combine deep telehealth expertise with comprehensive payer knowledge to ensure accurate coding and maximum reimbursement for all virtual care services.
                  </p>
                  <div className="border-t border-gray/10 pt-6">
                    <h4 className="font-bold text-navy mb-4">Quality Assurance</h4>
                    <p className="text-gray">
                      Every telehealth claim undergoes specialized review for payer-specific requirements and coding accuracy to ensure optimal reimbursement.
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
            title="Complete Telehealth Billing Management"
            description="Every aspect of telehealth billing covered for maximum reimbursement and compliance."
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
            title="Telehealth Billing Workflow"
            description="Eight-step process ensuring accurate telehealth billing and maximum reimbursement."
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
            title="Telehealth Billing Excellence"
            description="Measurable results that drive your telehealth revenue success."
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
            title="Telehealth Complexity Made Simple"
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
            description="Answers to common questions about our telehealth billing services."
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
                Ready to Maximize Your Telehealth Revenue?
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Schedule a free consultation to see how Aethera can optimize your telehealth billing.
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
            description="Additional services that complement our telehealth billing expertise."
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