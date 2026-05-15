import Head from 'next/head';
import Link from 'next/link';
import { CreditCard, CheckCircle, Shield, BarChart3 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: "Payment Posting Services | ERA Processing | Aethera Healthcare",
  description: "Professional payment posting services including ERA processing, EOB posting, and patient payment application. Optimize your cash flow with accurate payment processing.",
};

const includedItems = [
  'Electronic remittance advice (ERA) processing',
  'Paper explanation of benefits (EOB) posting',
  'Patient payment application',
  'Insurance payment posting',
  'Write-off processing',
  'Adjustment entry',
  'Refund processing',
  'Deduction and recoupment tracking',
  'Secondary payment posting',
  'Patient statement generation',
  'Payment reconciliation',
  'Cash application reporting',
];

const processSteps = [
  'Payment receipt and identification',
  'ERA/EOB download and import',
  'Payment matching to claims',
  'Adjustment and write-off posting',
  'Patient payment application',
  'Secondary payment processing',
  'Refund identification and processing',
  'Reconciliation and reporting',
];

const kpis = [
  { metric: 'Payment Posting Accuracy', value: '>99%' },
  { metric: 'Posting Timeliness', value: '<24 hours' },
  { metric: 'Patient Statement Accuracy', value: '>98%' },
  { metric: 'Refund Processing Time', value: '<5 days' },
];

const challenges = [
  'Complex ERA/EOB formats from different payers',
  'Patient payment identification and matching',
  'Adjustment and write-off compliance',
  'Secondary payment coordination',
  'Refund tracking and processing',
  'Patient statement accuracy',
  'Payment reconciliation discrepancies',
];

const faqs = [
  {
    question: 'How quickly do you post payments?',
    answer: 'We post electronic payments (ERA) within 24 hours of receipt and paper payments within 48 hours. Patient payments are applied the same day they are received.'
  },
  {
    question: 'How do you handle patient payments?',
    answer: 'Patient payments are applied directly to the responsible account with detailed tracking. We provide patient payment reports and can customize payment application rules per practice.'
  },
  {
    question: 'What reports do you provide on payments?',
    answer: 'We provide daily payment summaries, monthly aging reports, refund tracking reports, and detailed payment application reports. All reports are available through our provider portal.'
  },
  {
    question: 'How do you handle refunds?',
    answer: 'We track all refund requests, process them within 5 business days, and provide detailed refund reports. Our team works with payers to resolve overpayment issues quickly.'
  },
  {
    question: 'Can you customize payment posting rules?',
    answer: 'Yes, we work with each practice to understand their specific payment posting requirements and customize our process accordingly. This includes write-off policies, adjustment handling, and patient payment application.'
  }
];

const relatedServices = [
  { name: 'Claims & Billing', href: '/services/claims-billing' },
  { name: 'Patient Collections', href: '/services/patient-collections' },
  { name: 'Reporting & Analytics', href: '/services/reporting-analytics' },
];

export default function PaymentPosting() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "serviceType": "Payment Posting Services",
              "provider": {
                "@type": "Organization",
                "name": "Aethera Healthcare Solutions",
                "url": "https://aetherahealthcare-website.pages.dev",
                "logo": "https://aetherahealthcare-website.pages.dev/logo.png"
              },
              "description": "Professional payment posting services including ERA processing, EOB posting, and patient payment application. Optimize your cash flow with accurate payment processing.",
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
                Payment Posting Services
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Accurate payment application and reconciliation that optimizes your cash flow.
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
                  Efficient Payment Processing for Maximum Cash Flow
                </h2>
                <p className="text-gray mb-6">
                  Our payment posting services ensure every dollar is accurately applied to the correct account, with detailed tracking and reporting for complete financial visibility.
                </p>
                <p className="text-gray mb-6">
                  We handle electronic remittance advices, paper EOBs, patient payments, and insurance payments with precision, reducing days in accounts receivable and accelerating collections.
                </p>
                <p className="text-gray">
                  With our comprehensive payment posting, you can eliminate payment posting errors, reduce write-off discrepancies, and optimize your practice's cash flow.
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
                    We combine automated payment processing technology with expert human review to ensure 99%+ payment posting accuracy and complete reconciliation.
                  </p>
                  <div className="border-t border-gray/10 pt-6">
                    <h4 className="font-bold text-navy mb-4">Quality Assurance</h4>
                    <p className="text-gray">
                      Every payment undergoes automated matching and human verification to ensure accurate application and complete reconciliation.
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
            title="Complete Payment Management"
            description="Every aspect of payment processing covered for maximum accuracy and efficiency."
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
            title="Payment Posting Workflow"
            description="Eight-step process ensuring accurate payment application and reconciliation."
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
            title="Payment Excellence"
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
            title="Payment Complexity Made Simple"
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
            description="Answers to common questions about our payment posting services."
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
                Ready to Optimize Your Payment Posting?
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Schedule a free consultation to see how Aethera can improve your cash flow and reduce posting errors.
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
            description="Additional services that complement our payment posting expertise."
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