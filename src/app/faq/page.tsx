'use client';

import Head from 'next/head';
import { useState } from 'react';
import {
  ChevronDown,
  HelpCircle,
  DollarSign,
  FileText,
  Shield,
  Zap,
  Users,
  Clock
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

const faqCategories = [
  {
    id: 'general',
    title: 'General Questions',
    icon: <HelpCircle className="h-5 w-5" />,
    questions: [
      {
        question: 'What is Revenue Cycle Management (RCM)?',
        answer: 'Revenue Cycle Management (RCM) is the financial process that healthcare facilities use to track patient care episodes from registration and appointment scheduling to the final payment of a balance. It encompasses all administrative and clinical functions that contribute to the capture, management, and collection of patient service revenues.'
      },
      {
        question: 'Why should I outsource my medical billing?',
        answer: 'Outsourcing medical billing provides access to specialized expertise, advanced technology, and proven processes that are difficult to replicate in-house. Benefits include higher clean claim rates, faster payment posting, reduced administrative costs, and improved compliance. Our clients typically see 15-25% improvement in collections within the first year.'
      },
      {
        question: 'How do you work with my existing EHR system?',
        answer: 'We integrate seamlessly with all major EHR systems through secure data interfaces. Our team works with your IT department to establish secure connections that allow us to access necessary data while maintaining compliance with all security requirements. Most implementations are completed within 30-45 days.'
      },
      {
        question: 'What makes Aethera different from other billing companies?',
        answer: 'We combine expert human billing professionals with advanced technology to deliver superior results. Our dedicated account teams understand the nuances of each specialty and work proactively to maximize your revenue. We also maintain comprehensive compliance programs and offer transparent reporting with real-time access to your financial data.'
      }
    ]
  },
  {
    id: 'services',
    title: 'Services',
    icon: <FileText className="h-5 w-5" />,
    questions: [
      {
        question: 'What coding certifications do your coders hold?',
        answer: 'Our coding team holds current certifications including Certified Professional Coder (CPC), Certified Coding Specialist (CCS), and specialty-specific credentials. All coders participate in ongoing education to stay current with annual guideline updates and maintain an average accuracy rate of 98%+.'
      },
      {
        question: 'How do you handle claim denials?',
        answer: 'We take a proactive approach to denial management with dedicated teams that identify denial patterns, respond quickly to payer decisions, and implement targeted prevention strategies. Our standard denial response time is 72 hours, and our overall appeal success rate exceeds 65%.'
      },
      {
        question: 'Which clearinghouses do you use?',
        answer: 'We partner with leading clearinghouses including Change Healthcare, Availity, and NaviHealth to ensure broad payer connectivity and optimal claim routing. Our system automatically selects the best clearinghouse for each payer based on historical performance data.'
      },
      {
        question: 'Do you handle workers compensation billing?',
        answer: 'Yes, we have specialized teams that handle workers compensation billing including lien management, coordination of benefits, and compliance with state-specific requirements. Our workers compensation specialists maintain current knowledge of changing regulations in all states where we serve clients.'
      }
    ]
  },
  {
    id: 'pricing',
    title: 'Pricing',
    icon: <DollarSign className="h-5 w-5" />,
    questions: [
      {
        question: 'What are your rates?',
        answer: 'We offer flexible pricing models including percentage-based (4-8% of collections), per-claim ($3.50-$7.00 per claim), flat fee (custom pricing based on practice size), and hybrid models. Most practices find the percentage-based model provides the best value with predictable costs tied to performance.'
      },
      {
        question: 'Are there any hidden fees?',
        answer: 'No, we do not charge any hidden fees. Our pricing is completely transparent with all costs disclosed upfront. There are no setup fees, no minimum contracts, and no termination penalties. You only pay for the services you receive.'
      },
      {
        question: 'Do you require long-term contracts?',
        answer: 'No, we operate on a month-to-month basis with 90 days written notice required for termination. This gives you flexibility without long-term commitment while allowing us to invest in your success with confidence.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept ACH transfers, wire transfers, and all major credit cards. Most clients prefer ACH transfers for convenience and cost savings. We provide detailed monthly invoices with breakdowns of all charges.'
      }
    ]
  },
  {
    id: 'onboarding',
    title: 'Onboarding',
    icon: <Users className="h-5 w-5" />,
    questions: [
      {
        question: 'How long does it take to get started?',
        answer: 'Most practices are fully operational with Aethera within 30-45 days. Our streamlined onboarding process includes system setup, data migration, staff training, and parallel processing to ensure a seamless transition with no disruption to your workflow.'
      },
      {
        question: 'What do you need from us to get started?',
        answer: 'We require access to your practice management system, current fee schedules, payer contract information, and provider credentialing details. Our onboarding team provides a detailed checklist and works with your staff to gather all necessary information efficiently.'
      },
      {
        question: 'Can you import our existing patient data?',
        answer: 'Yes, we can securely import your existing patient demographic data, insurance information, and outstanding claim data. Our data migration process includes validation and verification to ensure complete accuracy with no disruption to your cash flow.'
      },
      {
        question: 'Will there be any claim delays during the transition?',
        answer: 'No, we implement a parallel processing approach during the transition period to ensure no claims are delayed. We begin processing new claims immediately while your existing team continues handling current claims until the transition is complete.'
      }
    ]
  },
  {
    id: 'technology',
    title: 'Technology',
    icon: <Zap className="h-5 w-5" />,
    questions: [
      {
        question: 'What technology platform do you use?',
        answer: 'We use a proprietary RCM platform built specifically for medical billing with advanced features including real-time claim scrubbing, automated eligibility verification, intelligent denial management, and comprehensive analytics. Our platform integrates with all major EHR systems and practice management software.'
      },
      {
        question: 'How do I submit charges to you?',
        answer: 'Charges can be submitted electronically through your EHR system, uploaded via secure portal, or transmitted through traditional billing file formats. Most practices prefer electronic submission through their existing systems for maximum efficiency.'
      },
      {
        question: 'Can I see the status of my claims?',
        answer: 'Yes, our provider portal provides real-time access to claim status, payment information, and key performance metrics. You can monitor your accounts 24/7 with customizable dashboards and automated alerts for important events.'
      },
      {
        question: 'How secure is your technology platform?',
        answer: 'Our platform maintains bank-level security with AES-256 encryption, multi-factor authentication, and continuous monitoring. We undergo annual third-party security assessments and maintain comprehensive compliance with HIPAA, SOC 2, and PCI DSS requirements.'
      }
    ]
  },
  {
    id: 'compliance',
    title: 'Compliance',
    icon: <Shield className="h-5 w-5" />,
    questions: [
      {
        question: 'Are you HIPAA compliant?',
        answer: 'Yes, we maintain comprehensive HIPAA compliance with annual risk assessments, mandatory employee training, business associate agreements, encrypted data transmission, and secure facilities. We undergo regular third-party security audits and maintain detailed documentation of all compliance activities.'
      },
      {
        question: 'Do you sign Business Associate Agreements?',
        answer: 'Yes, we execute Business Associate Agreements with all covered entity clients before accessing any protected health information. Our standard BAA covers all subcontractors and technology vendors who may access PHI in the course of providing services.'
      },
      {
        question: 'How do you protect our data?',
        answer: 'We implement comprehensive security measures including AES-256 encryption at rest, TLS 1.3 encryption in transit, role-based access controls, multi-factor authentication, and continuous monitoring. Our data centers maintain SOC 2 and SSAE 18 compliance with 24/7 security personnel.'
      },
      {
        question: 'Do you undergo security audits?',
        answer: 'Yes, we undergo annual third-party security assessments and maintain SOC 2 Type II compliance. We also conduct quarterly internal audits and continuous vulnerability scanning to ensure the highest levels of security and compliance.'
      }
    ]
  }
];

export default function FAQ() {
  const [openCategory, setOpenCategory] = useState('general');
  const [openQuestions, setOpenQuestions] = useState<{[key: string]: boolean}>({});

  const toggleQuestion = (categoryId: string, questionIndex: number) => {
    const key = `${categoryId}-${questionIndex}`;
    setOpenQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is Revenue Cycle Management (RCM)?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Revenue Cycle Management (RCM) is the financial process that healthcare facilities use to track patient care episodes from registration and appointment scheduling to the final payment of a balance. It encompasses all administrative and clinical functions that contribute to the capture, management, and collection of patient service revenues."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Why should I outsource my medical billing?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Outsourcing medical billing provides access to specialized expertise, advanced technology, and proven processes that are difficult to replicate in-house. Benefits include higher clean claim rates, faster payment posting, reduced administrative costs, and improved compliance. Our clients typically see 15-25% improvement in collections within the first year."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do you work with my existing EHR system?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We integrate seamlessly with all major EHR systems through secure data interfaces. Our team works with your IT department to establish secure connections that allow us to access necessary data while maintaining compliance with all security requirements. Most implementations are completed within 30-45 days."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What makes Aethera different from other billing companies?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We combine expert human billing professionals with advanced technology to deliver superior results. Our dedicated account teams understand the nuances of each specialty and work proactively to maximize your revenue. We also maintain comprehensive compliance programs and offer transparent reporting with real-time access to your financial data."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What coding certifications do your coders hold?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our coding team holds current certifications including Certified Professional Coder (CPC), Certified Coding Specialist (CCS), and specialty-specific credentials. All coders participate in ongoing education to stay current with annual guideline updates and maintain an average accuracy rate of 98%+."
                  }
                }
              ]
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
                Frequently Asked Questions
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Find answers to common questions about our services, pricing, onboarding, and compliance.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                We're Here to Help
              </h2>
              <p className="text-gray text-lg mb-8">
                Browse our comprehensive FAQ to find answers to your questions. If you don't see what you're looking for,
                our team is always available to provide personalized assistance.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="bg-teal text-white px-4 py-2 rounded-full text-sm">
                  30+ Questions Answered
                </span>
                <span className="bg-mint text-navy px-4 py-2 rounded-full text-sm">
                  Organized by Category
                </span>
                <span className="bg-cream text-teal px-4 py-2 rounded-full text-sm">
                  Regularly Updated
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="FAQ CATEGORIES"
            title="Browse by Topic"
            description="Find answers to your questions organized by category for easy navigation."
          />

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {faqCategories.map((category) => (
              <FadeIn key={category.id} delay={0.1}>
                <button
                  onClick={() => setOpenCategory(category.id)}
                  className={`flex items-center px-6 py-3 rounded-full transition-colors ${
                    openCategory === category.id
                      ? 'bg-teal text-white'
                      : 'bg-white text-navy hover:bg-cream border border-gray/20'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.title}
                </button>
              </FadeIn>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            {faqCategories
              .filter(category => category.id === openCategory)
              .map((category) => (
                <FadeIn key={category.id}>
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray/10">
                      <h2 className="text-2xl font-bold text-navy flex items-center">
                        <span className="mr-3">{category.icon}</span>
                        {category.title}
                      </h2>
                    </div>
                    <div className="divide-y divide-gray/10">
                      {category.questions.map((faq, index) => {
                        const isOpen = openQuestions[`${category.id}-${index}`];
                        return (
                          <div key={index} className="p-6">
                            <button
                              onClick={() => toggleQuestion(category.id, index)}
                              className="flex justify-between items-start w-full text-left"
                            >
                              <h3 className="text-lg font-bold text-navy flex-grow pr-4">
                                {faq.question}
                              </h3>
                              <ChevronDown
                                className={`h-6 w-6 text-teal flex-shrink-0 transition-transform ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            {isOpen && (
                              <div className="mt-4 pl-0 md:pl-6">
                                <p className="text-gray">{faq.answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </FadeIn>
              ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center">
            <FadeIn>
              <div className="flex justify-center mb-6">
                <HelpCircle className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-6">
                Still Have Questions?
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Our team is ready to provide personalized answers and assistance.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href="mailto:support@aetherahealthcare.com"
                  className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
                >
                  Email Support
                </a>
                <a
                  href="/contact"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
                >
                  Contact Us
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}