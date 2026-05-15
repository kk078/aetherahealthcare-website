'use client';

import Head from 'next/head';
import Link from 'next/link';
import { CheckCircle, FileText, Settings, Upload, Users, Zap } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

const steps = [
  {
    icon: <FileText className="h-8 w-8" />,
    title: 'Discovery & Assessment',
    description: 'We conduct a comprehensive analysis of your current revenue cycle to identify opportunities for improvement.',
    details: [
      'Revenue cycle performance review',
      'Current billing processes assessment',
      'Payer mix and contract analysis',
      'Technology platform evaluation',
      'Staff workflow observation'
    ]
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Agreement & Onboarding',
    description: 'We finalize our partnership and begin the transition process with minimal disruption to your operations.',
    details: [
      'Service agreement execution',
      'Business Associate Agreement signing',
      'Data migration planning',
      'Staff introduction and training schedule',
      'Go-live timeline establishment'
    ]
  },
  {
    icon: <Settings className="h-8 w-8" />,
    title: 'System Setup & Configuration',
    description: 'We configure our systems to match your practice requirements and integrate with your existing technology.',
    details: [
      'Practice information setup',
      'Provider and location configuration',
      'Payer panel activation',
      'Fee schedule implementation',
      'Workflow customization'
    ]
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: 'Portal Access & Training',
    description: 'Your team receives access to our provider portal and comprehensive training on all features and reporting.',
    details: [
      'Portal account creation',
      'Role-based access configuration',
      'Reporting dashboard walkthrough',
      'Claim status monitoring training',
      'Communication protocol establishment'
    ]
  },
  {
    icon: <Upload className="h-8 w-8" />,
    title: 'Data Migration',
    description: 'We securely migrate your existing patient, insurance, and claim data with complete accuracy verification.',
    details: [
      'Patient demographic import',
      'Insurance information transfer',
      'Outstanding claim identification',
      'AR balance reconciliation',
      'Data quality validation'
    ]
  },
  {
    icon: <CheckCircle className="h-8 w-8" />,
    title: 'Go Live & Support',
    description: 'We begin processing your claims with dedicated support during the transition and ongoing optimization.',
    details: [
      'Claim submission commencement',
      'Daily monitoring and reporting',
      'Issue resolution support',
      'Performance tracking initiation',
      'Continuous improvement implementation'
    ]
  }
];

const timeline = [
  { week: 'Week 1', activity: 'Contract execution and BAA signing' },
  { week: 'Week 2', activity: 'System setup and configuration' },
  { week: 'Week 3', activity: 'Staff training and portal access' },
  { week: 'Week 4', activity: 'Data migration and validation' },
  { week: 'Week 5', activity: 'Parallel processing and testing' },
  { week: 'Week 6', activity: 'Full go-live and ongoing support' }
];

const benefits = [
  'Minimal disruption to your practice operations',
  'Dedicated project manager throughout the process',
  'Real-time status updates and communication',
  'Comprehensive staff training and support',
  'Performance guarantees from day one',
  'Seamless transition with no claim delays'
];

export default function Process() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Our Onboarding Process | Aethera Healthcare Solutions",
              "description": "A seamless 6-week process designed to minimize disruption and maximize your revenue from day one.",
              "url": "https://aetherahealthcare-website.pages.dev/process",
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
                Our Onboarding Process
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                A seamless 6-week process designed to minimize disruption and maximize your revenue from day one.
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
                Simple, Seamless Onboarding
              </h2>
              <p className="text-gray text-lg mb-8">
                Our proven 6-step process ensures a smooth transition to Aethera with minimal disruption to your practice operations.
                We assign a dedicated project manager to guide you through every step and maintain communication throughout.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="bg-teal text-white px-4 py-2 rounded-full text-sm">
                  6 Weeks Average
                </span>
                <span className="bg-mint text-navy px-4 py-2 rounded-full text-sm">
                  Dedicated Project Manager
                </span>
                <span className="bg-cream text-teal px-4 py-2 rounded-full text-sm">
                  No Claim Delays
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="OUR PROCESS"
            title="6-Step Implementation"
            description="Each step is designed to ensure a smooth transition with minimal disruption to your practice."
          />

          <div className="mt-16">
            <div className="flex flex-col md:flex-row justify-between relative">
              {/* Connecting line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-teal transform md:-translate-x-1/2 hidden md:block"></div>

              {steps.map((step, index) => (
                <FadeIn key={index} delay={index * 0.2} className="flex mb-12 md:mb-0">
                  <div className="flex flex-col items-center md:items-start w-full md:w-auto">
                    <div className="flex items-center">
                      <div className="bg-teal text-white rounded-full w-16 h-16 flex items-center justify-center z-10">
                        {step.icon}
                      </div>
                      <div className="ml-4 md:ml-6">
                        <h3 className="text-xl font-bold text-navy">{step.title}</h3>
                        <p className="text-gray mt-2">{step.description}</p>
                        <ul className="mt-3 space-y-1">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start text-sm text-gray">
                              <CheckCircle className="h-4 w-4 text-teal flex-shrink-0 mt-0.5 mr-2" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="IMPLEMENTATION TIMELINE"
            title="6-Week Average Timeline"
            description="Most practices are fully operational with Aethera within 6 weeks of contract signing."
          />

          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {timeline.map((item, index) => (
                <FadeIn key={index} delay={index * 0.1}>
                  <div className="bg-cream rounded-xl p-6 border border-gray/10 h-full">
                    <div className="flex items-center mb-4">
                      <div className="bg-teal text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">
                        {item.week.split(' ')[1]}
                      </div>
                      <h3 className="text-lg font-bold text-navy">{item.week}</h3>
                    </div>
                    <p className="text-gray">{item.activity}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="BENEFITS"
            title="Why Our Process Works"
            description="We've refined our onboarding process to ensure maximum success with minimal disruption."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {benefits.map((benefit, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10 flex items-start">
                  <CheckCircle className="h-6 w-6 text-teal flex-shrink-0 mt-1 mr-3" />
                  <p className="text-gray">{benefit}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Data Migration */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  Secure Data Migration
                </h2>
                <p className="text-gray mb-6">
                  Our secure data migration process ensures complete accuracy and compliance with all healthcare regulations including HIPAA.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-teal flex-shrink-0 mt-1 mr-3" />
                    <p className="text-gray">Encrypted data transfer with end-to-end security</p>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-teal flex-shrink-0 mt-1 mr-3" />
                    <p className="text-gray">Complete data validation and verification</p>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-teal flex-shrink-0 mt-1 mr-3" />
                    <p className="text-gray">No disruption to patient care during migration</p>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-teal flex-shrink-0 mt-1 mr-3" />
                    <p className="text-gray">Full audit trail and documentation</p>
                  </li>
                </ul>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-gradient-to-br from-navy to-teal rounded-2xl p-8 text-white h-full">
                  <h3 className="text-2xl font-bold mb-6">Migration Security</h3>
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                        1
                      </div>
                      <p>Data encrypted before transfer</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                        2
                      </div>
                      <p>Secure FTP with 256-bit encryption</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                        3
                      </div>
                      <p>Multi-factor authentication required</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                        4
                      </div>
                      <p>Post-migration data validation</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                        5
                      </div>
                      <p>Complete audit documentation</p>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Begin your journey to optimized revenue cycle management today.
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