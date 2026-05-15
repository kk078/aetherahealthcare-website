import Head from 'next/head';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';
import PricingCard from '@/components/ui/PricingCard';

export const metadata = {
  title: "Pricing | Transparent Medical Billing Rates | Aethera Healthcare",
  description: "Transparent pricing for medical billing services. Choose from percentage-based or per-claim pricing models with no hidden fees. Get a free consultation today.",
};

const pricingPlans = [
  {
    title: 'Percentage-Based',
    price: '4-8%',
    description: 'Percentage of collections, lowest risk for practices',
    features: [
      'No setup fees or hidden costs',
      'All services included',
      'Monthly reporting',
      'Dedicated account manager',
      '24/7 support',
      'Performance guarantees',
      'Compliance management',
      'Telehealth billing',
      'Patient collections',
      'AR follow-up',
      'Denial management',
      'Reporting & analytics'
    ],
    href: '/contact'
  },
  {
    title: 'Per-Claim',
    price: '$3.50-$7.00',
    description: 'Fixed rate per claim processed',
    features: [
      'No setup fees or hidden costs',
      'All services included',
      'Monthly reporting',
      'Dedicated account manager',
      '24/7 support',
      'Performance guarantees',
      'Compliance management',
      'Telehealth billing',
      'Patient collections',
      'AR follow-up',
      'Denial management',
      'Reporting & analytics'
    ],
    href: '/contact'
  },
  {
    title: 'Flat Fee',
    price: 'Custom',
    description: 'Fixed monthly fee based on practice size',
    features: [
      'No setup fees or hidden costs',
      'All services included',
      'Monthly reporting',
      'Dedicated account manager',
      '24/7 support',
      'Performance guarantees',
      'Compliance management',
      'Telehealth billing',
      'Patient collections',
      'AR follow-up',
      'Denial management',
      'Reporting & analytics'
    ],
    href: '/contact'
  },
  {
    title: 'Hybrid',
    price: 'Base + %',
    description: 'Combination of fixed fee and percentage',
    features: [
      'No setup fees or hidden costs',
      'All services included',
      'Monthly reporting',
      'Dedicated account manager',
      '24/7 support',
      'Performance guarantees',
      'Compliance management',
      'Telehealth billing',
      'Patient collections',
      'AR follow-up',
      'Denial management',
      'Reporting & analytics'
    ],
    href: '/contact'
  }
];

const addons = [
  { name: 'Credentialing Services', price: '$150-300 per provider' },
  { name: 'Revenue Cycle Assessment', price: '$1,500-3,000' },
  { name: 'Custom Reporting', price: '$200-500 per report' },
  { name: 'Implementation Services', price: '$500-2,000' },
  { name: 'Training & Education', price: '$200-400 per session' },
  { name: 'Audit Preparation', price: '$1,000-2,500' }
];

const comparison = [
  {
    feature: 'Pricing Structure',
    aethera: 'Flexible models with no hidden fees',
    inHouse: 'Fixed salary + benefits + overhead',
    other: 'Percentage-based with hidden fees'
  },
  {
    feature: 'Staffing',
    aethera: 'Dedicated team of experts',
    inHouse: 'Single employee with limited expertise',
    other: 'Variable quality and training'
  },
  {
    feature: 'Technology',
    aethera: 'Advanced RCM platform included',
    inHouse: 'Basic practice management system',
    other: 'Outdated systems or manual processes'
  },
  {
    feature: 'Compliance',
    aethera: 'Comprehensive compliance program',
    inHouse: 'Limited compliance knowledge',
    other: 'Inconsistent compliance practices'
  },
  {
    feature: 'Reporting',
    aethera: 'Real-time dashboards and analytics',
    inHouse: 'Basic financial reports',
    other: 'Limited or delayed reporting'
  },
  {
    feature: 'Denial Management',
    aethera: 'Proactive denial prevention and appeals',
    inHouse: 'Reactive denial handling',
    other: 'Minimal denial management'
  },
  {
    feature: 'Collections',
    aethera: 'Specialized patient collections team',
    inHouse: 'Office staff with limited collections training',
    other: 'Basic collections processes'
  }
];

const faqs = [
  {
    question: 'Are there any setup fees?',
    answer: 'No, we do not charge any setup fees. Our pricing is completely transparent with no hidden costs.'
  },
  {
    question: 'Do you require long-term contracts?',
    answer: 'No, we operate on a month-to-month basis with 90 days written notice required for termination. This gives you flexibility without long-term commitment.'
  },
  {
    question: 'What happens if we switch from another billing company?',
    answer: 'We provide complete data migration services at no cost and work with your previous billing company to ensure a smooth transition with no disruption to your cash flow.'
  },
  {
    question: 'How do you handle performance guarantees?',
    answer: 'We guarantee a 95%+ clean claim rate, <5% denial rate, and <30 days in AR. If we don\'t meet these benchmarks, we work with you to identify and resolve issues at no additional cost.'
  },
  {
    question: 'Can we customize the services included?',
    answer: 'Yes, we can customize our service offerings based on your specific needs while maintaining our core performance guarantees.'
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "OfferCatalog",
              "name": "Aethera Healthcare Solutions Pricing",
              "description": "Transparent pricing for medical billing services. Choose from percentage-based or per-claim pricing models with no hidden fees. Get a free consultation today.",
              "url": "https://aetherahealthcare-website.pages.dev/pricing",
              "publisher": {
                "@type": "Organization",
                "name": "Aethera Healthcare Solutions",
                "url": "https://aetherahealthcare-website.pages.dev",
                "logo": "https://aetherahealthcare-website.pages.dev/logo.png"
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
                Simple, Transparent Pricing
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                No hidden fees. No setup charges. No long-term contracts. Choose the pricing model that works best for your practice.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="PRICING PLANS"
            title="Flexible Options for Every Practice"
            description="Choose from four pricing models designed to fit your practice's needs and budget."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {pricingPlans.map((plan, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <PricingCard
                  title={plan.title}
                  price={plan.price}
                  description={plan.description}
                  features={plan.features}
                  href={plan.href}
                  isPopular={index === 0}
                />
              </FadeIn>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray">
              All plans include comprehensive revenue cycle management services with no additional fees.
            </p>
          </div>
        </div>
      </section>

      {/* Add-on Services */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="ADD-ON SERVICES"
            title="Additional Services"
            description="Enhance your revenue cycle management with these optional services."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {addons.map((addon, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-cream rounded-xl p-6 border border-gray/10">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-navy">{addon.name}</h3>
                    <span className="text-teal font-bold">{addon.price}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="COMPARISON"
            title="Aethera vs. Alternatives"
            description="See how Aethera compares to in-house billing and other billing companies."
          />

          <div className="overflow-x-auto mt-16">
            <table className="min-w-full bg-white rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="py-4 px-6 text-left font-bold">Feature</th>
                  <th className="py-4 px-6 text-left font-bold">Aethera Healthcare</th>
                  <th className="py-4 px-6 text-left font-bold">In-House Billing</th>
                  <th className="py-4 px-6 text-left font-bold">Other Billing Companies</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-cream' : 'bg-white'}>
                    <td className="py-4 px-6 font-bold text-navy">{row.feature}</td>
                    <td className="py-4 px-6 text-gray">{row.aethera}</td>
                    <td className="py-4 px-6 text-gray">{row.inHouse}</td>
                    <td className="py-4 px-6 text-gray">{row.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="PRICING FAQ"
            title="Frequently Asked Questions"
            description="Answers to common questions about our pricing and billing services."
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
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-6">
                Ready to Optimize Your Revenue?
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Schedule a free consultation to see how Aethera can improve your collections.
              </p>
              <Link
                href="/contact"
                className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
              >
                Schedule Free Consultation
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}