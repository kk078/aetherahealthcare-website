'use client';

import Head from 'next/head';
import Link from 'next/link';
import {
  CheckCircle,
  DollarSign,
  Shield,
  Clock,
  FileText,
  CreditCard,
  Users,
  Calendar,
  BarChart3,
  Headphones,
  Zap
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';
import ServiceCard from '@/components/ui/ServiceCard';
import CTABanner from '@/components/ui/CTABanner';
import ROICalculator from '@/components/ui/ROICalculator';

const socialProofStats = [
  { value: '500+', label: 'Practices Served', icon: Users },
  { value: '$12M+', label: 'Revenue Recovered', icon: DollarSign },
  { value: '95%', label: 'Clean Claim Rate', icon: CheckCircle },
  { value: '<30 Days', label: 'Average AR', icon: Clock },
];

const services = [
  {
    icon: <FileText className="h-8 w-8" />,
    title: 'Medical Coding',
    description: 'Accurate ICD-10, CPT, and HCPCS coding for maximum reimbursement.',
    href: '/services/medical-coding',
  },
  {
    icon: <DollarSign className="h-8 w-8" />,
    title: 'Claims & Billing',
    description: 'End-to-end claim submission and billing management.',
    href: '/services/claims-billing',
  },
  {
    icon: <CreditCard className="h-8 w-8" />,
    title: 'Payment Posting',
    description: 'Efficient payment application and reconciliation.',
    href: '/services/payment-posting',
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Denial Management',
    description: 'Proactive denial prevention and appeal services.',
    href: '/services/denial-management',
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Provider Credentialing',
    description: 'Complete credentialing and enrollment services.',
    href: '/services/credentialing',
  },
  {
    icon: <CheckCircle className="h-8 w-8" />,
    title: 'Eligibility Verification',
    description: 'Real-time insurance verification and benefits.',
    href: '/services/eligibility-verification',
  },
  {
    icon: <Calendar className="h-8 w-8" />,
    title: 'Prior Authorization',
    description: 'Streamlined prior auth submission and tracking.',
    href: '/services/prior-authorization',
  },
  {
    icon: <CreditCard className="h-8 w-8" />,
    title: 'Patient Collections',
    description: 'Professional patient statement management.',
    href: '/services/patient-collections',
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Compliance & Auditing',
    description: 'HIPAA compliance and revenue cycle audits.',
    href: '/services/compliance-auditing',
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: 'Telehealth Billing',
    description: 'Specialized billing for telehealth services.',
    href: '/services/telehealth-billing',
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: 'AR Follow-Up',
    description: 'Dedicated accounts receivable management.',
    href: '/services/ar-followup',
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: 'Reporting & Analytics',
    description: 'Comprehensive financial and operational reporting.',
    href: '/services/reporting-analytics',
  },
];

const specialties = [
  'Primary Care',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Surgery',
  'Urology',
  'Other',
];

const testimonials = [
  {
    quote: 'Aethera increased our collections by 18% in the first quarter. Their team is responsive, knowledgeable, and truly partners with us to optimize our revenue cycle.',
    author: 'Dr. Sarah Johnson',
    role: 'Practice Owner',
    specialty: 'Family Medicine',
  },
  {
    quote: 'The denial rate dropped from 12% to 3% after switching to Aethera. Their proactive approach and attention to detail have been game-changers for our practice.',
    author: 'Dr. Michael Chen',
    role: 'Medical Director',
    specialty: 'Cardiology',
  },
  {
    quote: 'We\'ve saved over 20 hours per week in administrative tasks since partnering with Aethera. Their real-time portal gives us complete visibility into our financial performance.',
    author: 'Dr. Emily Rodriguez',
    role: 'Office Manager',
    specialty: 'Dermatology',
  },
];

const steps = [
  'Discovery',
  'Agreement',
  'Setup',
  'Portal',
  'Migration',
  'Go Live',
];

const faqs = [
  {
    question: 'How quickly can you start managing our billing?',
    answer: 'Most practices are fully operational with Aethera within 30-45 days. Our onboarding process is designed to be seamless with minimal disruption to your workflow.'
  },
  {
    question: 'What makes Aethera different from other billing companies?',
    answer: 'We combine expert human billing professionals with advanced technology to deliver superior results. Our dedicated account teams understand the nuances of each specialty and work proactively to maximize your revenue.'
  },
  {
    question: 'How do you ensure HIPAA compliance?',
    answer: 'We maintain comprehensive HIPAA compliance with annual training, business associate agreements, encrypted data transmission, and secure facilities. We undergo regular third-party security audits.'
  },
  {
    question: 'What reporting do you provide?',
    answer: 'We provide real-time access to our provider portal with detailed analytics on collections, denials, AR days, and more. Monthly executive summaries and quarterly business reviews are included.'
  },
  {
    question: 'Do you work with all insurance types?',
    answer: 'Yes, we handle Medicare, Medicaid, commercial insurance, and workers\' compensation claims. Our team stays current with payer-specific requirements and updates.'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Aethera Healthcare Solutions",
              "url": "https://aetherahealthcare-website.pages.dev",
              "logo": "https://aetherahealthcare-website.pages.dev/logo.png",
              "description": "Aethera Healthcare Solutions is your full-service medical billing partner handling coding, claims, payments, denials, and collections so you can focus on patients.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Lakeland",
                "addressRegion": "FL",
                "postalCode": "33801",
                "streetAddress": "PO Box 1234"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-863-694-0325",
                "contactType": "customer service",
                "email": "info@aetherahealthcare.com"
              },
              "sameAs": [
                "https://www.linkedin.com/company/aethera-healthcare-solutions"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Aethera Healthcare Solutions",
              "url": "https://aetherahealthcare-website.pages.dev",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://aetherahealthcare-website.pages.dev/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </Head>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal/20 to-navy/80"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-6">
                Your Practice Deserves Every Dollar Earned
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto mb-10">
                Aethera Healthcare Solutions is your full-service medical billing partner. We handle coding, claims, payments, denials, and collections — so you can focus on patients.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/contact"
                  className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors duration-300 text-center"
                >
                  Schedule Free Consultation
                </Link>
                <Link
                  href="/services"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full transition-colors duration-300 text-center"
                >
                  Explore Services →
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Social Proof Stats Bar */}
      <section className="py-10 bg-white border-b border-gray/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {socialProofStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <FadeIn key={index} delay={index * 0.1}>
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-teal/10 rounded-full p-3 mb-3">
                      <Icon className="h-6 w-6 text-teal" />
                    </div>
                    <p className="text-3xl font-bold text-navy">{stat.value}</p>
                    <p className="text-gray text-sm mt-1">{stat.label}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="OUR SERVICES"
            title="Comprehensive Revenue Cycle Management"
            description="We handle every aspect of medical billing so you can focus on what matters most - patient care."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <ServiceCard
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  href={service.href}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why Aethera */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <SectionHeader
                label="WHY CHOOSE US"
                title="Your Partner in Revenue Optimization"
                description="We combine expert human knowledge with advanced technology to deliver superior results."
                className="text-left mb-8"
              />

              <div className="space-y-8">
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-teal w-8 h-8 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-navy mb-2">Dedicated Account Team</h3>
                    <p className="text-gray">
                      Each practice is assigned a specialized team with deep knowledge of your specialty and payer mix.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-teal w-8 h-8 rounded-full flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-navy mb-2">Real-Time Provider Portal</h3>
                    <p className="text-gray">
                      24/7 access to your financial data with real-time dashboards, claim status, and performance metrics.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-teal w-8 h-8 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-navy mb-2">Transparent Reporting</h3>
                    <p className="text-gray">
                      Comprehensive monthly reports and quarterly business reviews with actionable insights.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-teal w-8 h-8 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-navy mb-2">HIPAA Compliant</h3>
                    <p className="text-gray">
                      Comprehensive security program with encrypted data transmission and secure facilities.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="bg-navy rounded-2xl p-8 text-white h-full">
                <h3 className="text-2xl font-bold mb-6">Performance Targets</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-3xl font-bold text-mint">95%+</p>
                    <p className="mt-2">Clean Claim Rate</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-mint">&lt;5%</p>
                    <p className="mt-2">Denial Rate</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-mint">&lt;30</p>
                    <p className="mt-2">Days in AR</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-mint">96%+</p>
                    <p className="mt-2">Net Collection Rate</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-mint">65%+</p>
                    <p className="mt-2">Appeal Success Rate</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-mint">24h</p>
                    <p className="mt-2">Payment Posting SLA</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-mint">48h</p>
                    <p className="mt-2">Claim Submission SLA</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-mint">95%+</p>
                    <p className="mt-2">Coding Accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="OUR PROCESS"
            title="Simple, Seamless Onboarding"
            description="Getting started with Aethera is straightforward and designed to minimize disruption to your practice."
          />

          <div className="flex flex-col md:flex-row justify-between mt-16 relative">
            {/* Connecting line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-teal transform md:-translate-x-1/2 hidden md:block"></div>

            {steps.map((step, index) => (
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
      </section>

      {/* Specialties */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="SPECIALTIES"
            title="We Serve All Medical Specialties"
            description="Our specialized teams understand the unique billing requirements of each medical field."
          />

          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {specialties.map((specialty, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <span className="bg-cream text-teal px-4 py-2 rounded-full text-sm">
                  {specialty}
                </span>
              </FadeIn>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/specialties"
              className="text-teal font-medium hover:text-mint transition-colors"
            >
              View all specialties we serve →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Practices Choose Us */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="WHY PRACTICES CHOOSE US"
            title="What Sets Us Apart"
            description="Three key reasons practices partner with Aethera for their revenue cycle management."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeIn>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10 h-full">
                <h3 className="text-xl font-bold text-navy mb-4">Personal, Not Corporate</h3>
                <p className="text-gray">
                  We intentionally work with a select number of practices. Your account manager knows your specialty, your payers, and your team by name.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10 h-full">
                <h3 className="text-xl font-bold text-navy mb-4">Results You Can Measure</h3>
                <p className="text-gray">
                  Clean claim rates above 95%, denial rates below 5%, and average AR under 30 days. We put performance targets in writing.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10 h-full">
                <h3 className="text-xl font-bold text-navy mb-4">Zero Risk to Start</h3>
                <p className="text-gray">
                  No setup fees. No long-term contracts. 90 days' notice to cancel. We earn your business every month.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-16 md:py-24 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-4">Revenue Calculator</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-4">Calculate Your Revenue Potential</h2>
            <p className="text-cream/80 max-w-2xl mx-auto">See how much additional revenue Aethera could recover for your practice. Adjust the inputs below to match your current situation.</p>
          </div>
          <ROICalculator />
        </div>
      </section>


      {/* Explore Resources */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="text-teal text-sm font-bold uppercase tracking-widest">EXPLORE AETHERA</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy font-playfair mt-2">Everything You Need to Decide</h2>
              <p className="text-gray mt-3 max-w-2xl mx-auto">Real case studies. A live billing dashboard. Your payers. Your EHR. And a free assessment to start.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { href: '/case-studies', label: 'Case Studies', title: 'Real Results from Real Practices', desc: '6 detailed case studies showing how much revenue Aethera recovered by specialty, challenge, and outcome.', cta: 'Read Case Studies', accent: 'text-teal', border: 'border-teal' },
              { href: '/free-assessment', label: 'Free Assessment', title: 'See What Your Practice Is Missing', desc: 'A no-obligation revenue cycle audit identifying denial leakage, AR gaps, and undercoding. Delivered in 5 business days.', cta: 'Get Free Assessment', accent: 'text-mint', border: 'border-mint' },
              { href: '/portal', label: 'Provider Portal', title: '24/7 Real-Time Billing Visibility', desc: 'Live claims dashboard, denial queue, AR aging, and KPI benchmarks accessible from any device at any time.', cta: 'See the Portal', accent: 'text-teal', border: 'border-navy' },
              { href: '/integrations', label: 'EHR Integrations', title: 'Works With Your Current System', desc: 'Epic, Cerner, athenahealth, eClinicalWorks, Kareo, and 45+ more. Setup in 1-4 weeks, zero workflow disruption.', cta: 'View Integrations', accent: 'text-teal', border: 'border-teal' },
              { href: '/payers', label: 'Payer Network', title: '900+ Insurers We Work With', desc: 'From Medicare and Medicaid to regional Blues plans and workers comp carriers. We know your payers rules cold.', cta: 'See Payer Network', accent: 'text-teal', border: 'border-navy' },
              { href: '/specialties', label: 'Specialties', title: 'Billing Built for Your Specialty', desc: 'Cardiology, orthopedics, dermatology, psychiatry, family medicine and more. Specialty-specific coding expertise.', cta: 'Find Your Specialty', accent: 'text-mint', border: 'border-mint' },
            ].map((card, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <Link href={card.href} className={`group block bg-white rounded-2xl p-6 border-2 ${card.border} hover:shadow-lg transition-all duration-200 h-full`}>
                  <span className={`text-xs font-bold uppercase tracking-widest ${card.accent}`}>{card.label}</span>
                  <h3 className="text-lg font-bold text-navy font-playfair mt-2 mb-2 group-hover:text-teal transition-colors">{card.title}</h3>
                  <p className="text-gray text-sm leading-relaxed mb-4">{card.desc}</p>
                  <span className={`text-sm font-semibold ${card.accent} group-hover:underline`}>{card.cta} &rarr;</span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Banner */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <CTABanner
            title="Ready to Maximize Your Revenue?"
            buttonText="Schedule Free Consultation"
            href="/contact"
          />
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="FAQ"
            title="Frequently Asked Questions"
            description="Get answers to common questions about our services and process."
          />

          <div className="grid grid-cols-1 gap-8 mt-16">
            {faqs.map((faq, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-cream rounded-xl p-6 border border-gray/10">
                  <h3 className="text-lg font-bold text-navy mb-2">{faq.question}</h3>
                  <p className="text-gray">{faq.answer}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/faq" className="text-teal font-medium hover:text-mint transition-colors">
              View all FAQs &rarr;
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
