import Head from 'next/head';
import Link from 'next/link';
import { Shield, CheckCircle, BarChart3 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: "Denial Management & Appeals | Aethera Healthcare Solutions",
  description: "Expert denial management and appeal services for healthcare providers. Reduce denial rates, maximize recovery, and protect your revenue with our proactive approach.",
};

const includedItems = [
  'Denial identification and categorization',
  'Root cause analysis',
  'Insurance appeal preparation and submission',
  'Payer communication and negotiation',
  'Denial prevention strategies',
  'Trend analysis and reporting',
  'Write-off management',
  'Recovery tracking',
  'Compliance monitoring',
  'Staff training on denial prevention',
  'Workflow optimization',
  'Performance benchmarking',
];

const processSteps = [
  'Denial identification and logging',
  'Root cause analysis',
  'Appeal preparation',
  'Payer communication',
  'Appeal submission',
  'Appeal tracking',
  'Resolution documentation',
  'Prevention implementation',
];

const kpis = [
  { metric: 'Denial Rate', value: '<5%' },
  { metric: 'Appeal Success Rate', value: '>65%' },
  { metric: 'Recovery Rate', value: '>75%' },
  { metric: 'Prevention Effectiveness', value: '>80%' },
];

const challenges = [
  'High denial rates impacting cash flow',
  'Complex appeal processes and requirements',
  'Lack of denial root cause analysis',
  'Inefficient denial tracking systems',
  'Missed appeal deadlines',
  'Inadequate prevention strategies',
  'Poor payer communication',
];

const faqs = [
  {
    question: 'What is your typical denial rate?',
    answer: 'Our clients typically see denial rates drop to below 5% within 90 days of implementation. This compares to industry averages of 10-15% for practices handling billing internally.'
  },
  {
    question: 'How quickly do you respond to denials?',
    answer: 'We identify and log denials within 24 hours of receipt. Appeals are prepared and submitted within 72 hours, with urgent denials prioritized for same-day handling.'
  },
  {
    question: 'What is your appeal success rate?',
    answer: 'Our overall appeal success rate exceeds 65%, with some payers showing success rates above 80%. This is achieved through detailed documentation, payer-specific expertise, and persistent follow-up.'
  },
  {
    question: 'How do you prevent future denials?',
    answer: 'We conduct root cause analysis on all denials, implement targeted prevention strategies, and provide ongoing staff training. We also monitor denial trends to identify systemic issues.'
  },
  {
    question: 'What reporting do you provide on denials?',
    answer: 'We provide daily denial reports, weekly trend analysis, monthly performance dashboards, and quarterly business reviews. All reports are available through our real-time provider portal.'
  }
];

const relatedServices = [
  { name: 'Claims & Billing', href: '/services/claims-billing' },
  { name: 'Medical Coding', href: '/services/medical-coding' },
  { name: 'AR Follow-Up', href: '/services/ar-followup' },
];

export default function DenialManagement() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "serviceType": "Denial Management Services",
              "provider": {
                "@type": "Organization",
                "name": "Aethera Healthcare Solutions",
                "url": "https://aetherahealthcare-website.pages.dev",
                "logo": "https://aetherahealthcare-website.pages.dev/logo.png"
              },
              "description": "Expert denial management and appeal services for healthcare providers. Reduce denial rates, maximize recovery, and protect your revenue with our proactive approach.",
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
                Denial Management Services
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Proactive denial prevention and expert appeal services that protect your revenue.
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
                  Expert Denial Management That Recovers Revenue
                </h2>
                <p className="text-gray mb-6">
                  Our comprehensive denial management services reduce denial rates, maximize appeal success, and implement prevention strategies that protect your bottom line.
                </p>
                <p className="text-gray mb-6">
                  We combine advanced analytics with expert human review to identify denial patterns, respond quickly to payer decisions, and implement targeted prevention measures.
                </p>
                <p className="text-gray">
                  With our proactive approach to denial management, you can reduce write-offs, accelerate payments, and improve your overall collection rate.
                </p>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8 h-full">
                  <div className="flex items-center mb-6">
                    <Shield className="h-10 w-10 text-teal mr-4" />
                    <h3 className="text-2xl font-bold text-navy">Our Approach</h3>
                  </div>
                  <p className="text-gray mb-6">
                    We take a three-pronged approach: rapid response to denials, expert appeal preparation, and proactive prevention strategies tailored to your practice.
                  </p>
                  <div className="border-t border-gray/10 pt-6">
                    <h4 className="font-bold text-navy mb-4">Quality Assurance</h4>
                    <p className="text-gray">
                      Every denial undergoes detailed root cause analysis and every appeal is reviewed by our compliance team before submission.
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
            title="Complete Denial Management"
            description="Every aspect of denial handling covered for maximum recovery and prevention."
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
            title="Denial Management Workflow"
            description="Eight-step process ensuring comprehensive denial handling and prevention."
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
            title="Denial Excellence"
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
            title="Denial Complexity Made Simple"
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
            description="Answers to common questions about our denial management services."
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
                Ready to Reduce Your Denial Rate?
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Schedule a free consultation to see how Aethera can recover your denied claims and prevent future denials.
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
            description="Additional services that complement our denial management expertise."
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