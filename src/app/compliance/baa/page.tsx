'use client';

import Link from 'next/link';
import { FileText, Shield, CheckCircle, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

const baaElements = [
  {
    title: 'Permitted Uses and Disclosures',
    description: 'We use and disclose PHI only as permitted by the BAA and HIPAA, primarily for providing our medical billing and revenue cycle management services.'
  },
  {
    title: 'Safeguards Implementation',
    description: 'We implement administrative, physical, and technical safeguards to protect the confidentiality, integrity, and availability of PHI.'
  },
  {
    title: 'Reporting Obligations',
    description: 'We promptly report any use or disclosure of PHI not provided for by the BAA, including breaches of unsecured PHI, to the covered entity.'
  },
  {
    title: 'Subcontractor Requirements',
    description: 'We ensure that any subcontractors who access PHI agree to the same restrictions and conditions that apply to us under the BAA.'
  },
  {
    title: 'PHI Return or Destruction',
    description: 'Upon termination of the BAA, we return or destroy all PHI received from the covered entity, unless retention is required by law.'
  },
  {
    title: 'Audit Rights',
    description: 'We make our internal practices, books, and records available to the covered entity or the Secretary of Health and Human Services for compliance verification.'
  }
];

const keyProvisions = [
  'PHI is used solely for providing medical billing services',
  'Comprehensive security measures protect all PHI',
  'Immediate reporting of any unauthorized disclosures',
  'All subcontractors sign equivalent BAAs',
  'Prompt return or destruction of PHI upon termination',
  'Full cooperation with compliance audits'
];

export default function BusinessAssociateAgreement() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-playfair mb-6">
                Business Associate Agreement
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Understanding our commitment to protecting your protected health information through comprehensive BAA compliance.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  What is a Business Associate Agreement?
                </h2>
                <p className="text-gray mb-6">
                  A Business Associate Agreement (BAA) is a contract between a covered entity (healthcare provider or health plan)
                  and a business associate (vendor or service provider) that outlines the responsibilities and obligations for
                  protecting protected health information (PHI).
                </p>
                <p className="text-gray mb-6">
                  Under HIPAA, any vendor or service provider that creates, receives, maintains, or transmits PHI on behalf
                  of a covered entity must sign a BAA before accessing any PHI. This ensures that all parties handling
                  sensitive health information maintain the same high standards of privacy and security.
                </p>
                <p className="text-gray">
                  Aethera Healthcare Solutions executes BAAs with all covered entity clients before accessing any PHI,
                  demonstrating our commitment to protecting your patients' sensitive health information.
                </p>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8 h-full">
                  <div className="flex items-center mb-6">
                    <Shield className="h-10 w-10 text-teal mr-4" />
                    <h3 className="text-2xl font-bold text-navy">Why BAAs Matter</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray">Legal requirement under HIPAA</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray">Protects patient privacy and security</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray">Establishes clear responsibilities</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray">Provides breach notification requirements</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray">Ensures regulatory compliance</p>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Key Provisions */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="BAA ELEMENTS"
            title="Our BAA Commitments"
            description="Six key provisions that form the foundation of our Business Associate Agreement compliance."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {baaElements.map((element, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10 h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-teal text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <Shield className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-navy">{element.title}</h3>
                  </div>
                  <p className="text-gray">{element.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Key Provisions List */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  Key BAA Provisions We Implement
                </h2>
                <ul className="space-y-4">
                  {keyProvisions.map((provision, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-teal flex-shrink-0 mt-1 mr-3" />
                      <p className="text-gray">{provision}</p>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-gradient-to-br from-navy to-teal rounded-2xl p-8 text-white h-full">
                  <h3 className="text-2xl font-bold mb-6">Our BAA Process</h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        1
                      </div>
                      <p>Review and execution of BAA before accessing PHI</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        2
                      </div>
                      <p>Annual review and update of BAA provisions</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        3
                      </div>
                      <p>Immediate reporting of any PHI breaches or unauthorized disclosures</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        4
                      </div>
                      <p>Quarterly compliance audits and assessments</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        5
                      </div>
                      <p>Annual training for all staff on BAA requirements</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Subcontractors */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <div className="bg-white rounded-2xl p-8 h-full border border-gray/10">
                  <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                    Subcontractor Compliance
                  </h2>
                  <p className="text-gray mb-6">
                    We maintain the same high standards for all subcontractors and technology vendors who may access
                    PHI in the course of providing services to us. Every vendor in our supply chain must execute
                    equivalent Business Associate Agreements before accessing any PHI.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray">Annual vendor risk assessments</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray">Quarterly compliance monitoring</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray">Immediate termination for non-compliance</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray">Annual security training for vendor personnel</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8 border-2 border-teal">
                  <h3 className="text-2xl font-bold text-navy mb-6">Vendor Categories</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        1
                      </div>
                      <div>
                        <p className="font-bold text-navy">Technology Vendors</p>
                        <p className="text-gray text-sm">Cloud storage, software platforms, communication tools</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        2
                      </div>
                      <div>
                        <p className="font-bold text-navy">Consulting Services</p>
                        <p className="text-gray text-sm">Specialized expertise, temporary staffing</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        3
                      </div>
                      <div>
                        <p className="font-bold text-navy">Data Processing</p>
                        <p className="text-gray text-sm">Data analysis, reporting services, automation tools</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        4
                      </div>
                      <div>
                        <p className="font-bold text-navy">Support Services</p>
                        <p className="text-gray text-sm">IT support, facilities management, security services</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Request BAA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center">
            <FadeIn>
              <div className="flex justify-center mb-6">
                <FileText className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-6">
                Request a Business Associate Agreement
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Contact our compliance team to request a BAA for your practice.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/contact"
                  className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
                >
                  Request BAA
                </Link>
                <Link
                  href="mailto:compliance@aetherahealthcare.com"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
                >
                  Email Compliance Team
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="BAA FAQ"
            title="Frequently Asked Questions"
            description="Common questions about our Business Associate Agreement compliance."
          />

          <div className="grid grid-cols-1 gap-8 mt-16">
            <FadeIn>
              <div className="bg-white rounded-xl p-6 border border-gray/10">
                <h3 className="text-lg font-bold text-navy mb-2">Do you sign BAAs with all clients?</h3>
                <p className="text-gray">
                  Yes, we execute Business Associate Agreements with all covered entity clients before accessing any
                  protected health information. This is a mandatory requirement under HIPAA regulations.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="bg-white rounded-xl p-6 border border-gray/10">
                <h3 className="text-lg font-bold text-navy mb-2">How long does it take to execute a BAA?</h3>
                <p className="text-gray">
                  Our standard BAA execution process takes 1-3 business days once we receive the request.
                  For urgent requests, we can expedite the process to same-day execution.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-white rounded-xl p-6 border border-gray/10">
                <h3 className="text-lg font-bold text-navy mb-2">What happens if there's a breach of PHI?</h3>
                <p className="text-gray">
                  We maintain a comprehensive incident response plan that includes immediate breach identification,
                  prompt notification to affected parties and the covered entity, and full cooperation with any
                  investigation. We also provide support for breach notification and mitigation efforts.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="bg-white rounded-xl p-6 border border-gray/10">
                <h3 className="text-lg font-bold text-navy mb-2">Do subcontractors need BAAs too?</h3>
                <p className="text-gray">
                  Yes, we require all subcontractors and technology vendors who may access PHI to execute equivalent
                  Business Associate Agreements. We maintain oversight of our entire vendor ecosystem to ensure
                  compliance at every level.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}