'use client';

import Link from 'next/link';
import { Shield, FileText, Users, Lock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

const sections = [
  {
    title: 'Information We Collect',
    content: 'We collect information necessary to provide our medical billing and revenue cycle management services, including practice information, provider credentials, payer enrollment data, patient health information, demographics, insurance information, clinical documentation, and billing records.'
  },
  {
    title: 'How We Use Information',
    content: 'We use information to provide billing and claims processing services, payment posting and reconciliation, denial management and appeals, reporting and analytics, communication with providers, and improving our services.'
  },
  {
    title: 'How We Protect Information',
    content: 'We implement AES-256 encryption at rest, TLS 1.3 encryption in transit, role-based access control, multi-factor authentication, regular security audits, employee background checks, and annual security training.'
  },
  {
    title: 'Information Sharing and Disclosure',
    content: 'We share PHI only as authorized for treatment, payment, and healthcare operations, with business associates and subcontractors under BAA, for legal requirements, and never sell personal information.'
  },
  {
    title: 'Data Retention',
    content: 'We retain medical billing records for 7 years minimum, audit logs for 7 years, and website analytics for 26 months, in compliance with federal and state regulations.'
  },
  {
    title: 'Your Rights',
    content: 'You have rights to access your information, correct inaccurate information, accounting of disclosures, restriction requests, confidential communication preferences, and filing complaints.'
  }
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-playfair mb-6">
                Privacy Policy
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Last Updated: May 14, 2026
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                Introduction and Scope
              </h2>
              <p className="text-gray mb-6">
                This Privacy Policy describes how Aethera Healthcare Solutions ("we," "us," or "our") collects, uses,
                and protects information when you visit our website or use our medical billing and revenue cycle
                management services. We are committed to protecting your privacy and complying with all applicable
                healthcare privacy laws, including the Health Insurance Portability and Accountability Act (HIPAA).
              </p>
              <p className="text-gray mb-6">
                This policy applies to information collected through our website, our services, and our interactions
                with healthcare providers and their patients. By using our services or visiting our website, you
                acknowledge that you have read and understand this Privacy Policy.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Definitions */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                Definitions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-navy mb-4">Protected Health Information (PHI)</h3>
                  <p className="text-gray">
                    Individually identifiable health information that is created or received by a healthcare provider,
                    health plan, employer, or healthcare clearinghouse, and relates to the past, present, or future
                    physical or mental health condition of an individual.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-4">Personally Identifiable Information (PII)</h3>
                  <p className="text-gray">
                    Information that can be used to distinguish or trace an individual's identity, including demographic
                    data, medical information, and other data that is linked or linkable to a specific individual.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-4">Covered Entity</h3>
                  <p className="text-gray">
                    A healthcare provider, health plan, or healthcare clearinghouse that is required to comply with HIPAA.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy mb-4">Business Associate</h3>
                  <p className="text-gray">
                    A person or entity that performs certain functions or activities involving the use or disclosure of
                    PHI on behalf of, or provides services to, a covered entity.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            {sections.map((section, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="mb-12 last:mb-0">
                  <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                    {section.title}
                  </h2>
                  <p className="text-gray">
                    {section.content}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                Cookies and Tracking Technologies
              </h2>
              <p className="text-gray mb-4">
                We use cookies and similar tracking technologies to track activity on our website and hold certain information.
                Cookies are files with small amounts of data which may include an anonymous unique identifier. Cookies are
                sent to your browser from a website and stored on your device.
              </p>
              <div className="bg-white rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-navy mb-4">Types of Cookies We Use:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span><strong>Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be switched off.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span><strong>Analytics Cookies:</strong> These cookies allow us to count visits and traffic sources to measure and improve site performance.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span><strong>Functional Cookies:</strong> These cookies enable enhanced functionality and personalization.</span>
                  </li>
                </ul>
              </div>
              <p className="text-gray">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                However, if you do not accept cookies, you may not be able to use some portions of our website.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                Children's Privacy
              </h2>
              <p className="text-gray">
                Our website and services are not directed to children under the age of 13. We do not knowingly collect
                personally identifiable information from children under 13. If you are a parent or guardian and you are
                aware that your child has provided us with personal information, please contact us so that we can take
                steps to delete such information.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                Changes to This Privacy Policy
              </h2>
              <p className="text-gray mb-6">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
                new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this
                Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they
                are posted on this page.
              </p>
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-bold text-navy mb-4">How We Notify You:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>Posting updated policy on our website</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>Updating the "Last Updated" date</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>Email notification for significant changes (when contact information is available)</span>
                  </li>
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-white text-center">
            <FadeIn>
              <div className="flex justify-center mb-6">
                <Users className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-6">
                Privacy Questions or Concerns?
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Contact our Privacy Officer for any questions about this Privacy Policy or our privacy practices.
              </p>
              <Link
                href="mailto:privacy@aetherahealthcare.com"
                className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
              >
                Email Privacy Officer
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}