'use client';

import Link from 'next/link';
import { FileText, CheckCircle, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

const terms = [
  {
    title: 'Description of Services',
    content: 'Aethera Healthcare Solutions provides comprehensive medical billing and revenue cycle management services including medical coding, claims submission, payment posting, denial management, provider credentialing, eligibility verification, prior authorization, patient collections, compliance auditing, telehealth billing, AR follow-up, and reporting analytics.'
  },
  {
    title: 'Eligibility',
    content: 'Our services are available to licensed healthcare providers and medical practices. By using our services, you represent and warrant that you are a licensed healthcare provider in good standing and have the authority to enter into this agreement.'
  },
  {
    title: 'Account Responsibilities',
    content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.'
  },
  {
    title: 'Service Fees and Payment',
    content: 'Our fees are based on the pricing model selected in your service agreement. Payment terms are Net 30 days from invoice date. Late payments may be subject to finance charges as permitted by law.'
  },
  {
    title: 'Client Responsibilities',
    content: 'You are responsible for providing accurate and timely information, maintaining current provider credentials, ensuring clinical documentation adequacy, authorizing our billing services, and complying with provider enrollment requirements.'
  },
  {
    title: 'Our Responsibilities',
    content: 'We are responsible for accurate coding and billing, timely claim submission, payment posting within SLA, denial management and appeals, regular reporting, HIPAA compliance, and dedicated account management.'
  },
  {
    title: 'Service Level Agreement',
    content: 'We guarantee a 95%+ clean claim rate, charge submission within 48 hours, payment posting within 24 hours, denial follow-up within 5 business days, and monthly reporting by the 10th of the following month.'
  }
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-playfair mb-6">
                Terms of Service
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
                Agreement to Terms
              </h2>
              <p className="text-gray mb-6">
                These Terms of Service ("Terms") govern your access to and use of the services provided by Aethera
                Healthcare Solutions ("we," "us," or "our"). By accessing or using our services, you agree to be bound
                by these Terms and all applicable laws and regulations.
              </p>
              <p className="text-gray mb-6">
                If you do not agree to these Terms, you may not access or use our services. These Terms apply to all
                visitors, users, and others who access or use our services, including our website, provider portal,
                and medical billing services.
              </p>
              <p className="text-gray">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will
                provide notice of any material changes by updating the "Last Updated" date at the top of this page.
                Your continued use of our services after any such changes constitutes acceptance of the new Terms.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            {terms.map((term, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="mb-12 last:mb-0">
                  <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                    {index + 1}. {term.title}
                  </h2>
                  <p className="text-gray">
                    {term.content}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Terms */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                8. Intellectual Property
              </h2>
              <p className="text-gray mb-6">
                All content, features, and functionality of our services, including but not limited to software,
                text, displays, images, video, and audio, and the selection and arrangement thereof, are owned by
                Aethera Healthcare Solutions or its licensors and are protected by United States and international
                copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
              <p className="text-gray">
                You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly
                perform, republish, download, store, or transmit any of the material on our services without our
                express written permission.
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
                9. Confidentiality Obligations
              </h2>
              <p className="text-gray mb-6">
                Both parties agree to maintain the confidentiality of proprietary information received from the other
                party. Confidential information includes but is not limited to business plans, financial information,
                technical data, and patient health information.
              </p>
              <div className="bg-white rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-navy mb-4">Confidentiality Requirements:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>Limit access to confidential information to authorized personnel only</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>Implement appropriate security measures to protect confidential information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>Not disclose confidential information to third parties without prior written consent</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>Return or destroy confidential information upon termination of the agreement</span>
                  </li>
                </ul>
              </div>
              <p className="text-gray">
                These confidentiality obligations survive the termination of this agreement for a period of three years.
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
                10. Limitation of Liability
              </h2>
              <p className="text-gray mb-6">
                To the fullest extent permitted by law, in no event shall Aethera Healthcare Solutions, its affiliates,
                or their licensors be liable for any indirect, incidental, special, consequential, or punitive damages,
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                resulting from your access to or use of or inability to access or use the services.
              </p>
              <p className="text-gray">
                Our total liability to you for any claim arising out of or relating to these Terms or our services,
                regardless of the form of action, is limited to the amount paid by you to us under these Terms in
                the twelve months preceding the event giving rise to the claim.
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
                11. Indemnification
              </h2>
              <p className="text-gray">
                You agree to defend, indemnify, and hold harmless Aethera Healthcare Solutions and its affiliates,
                licensors, and service providers, and their respective officers, directors, employees, contractors,
                agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages,
                judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out
                of or relating to your violation of these Terms or your use of our services, including but not limited
                to your violation of any law or regulation or third-party rights.
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
                12. Term and Termination
              </h2>
              <p className="text-gray mb-6">
                These Terms remain in effect until terminated by either party. We may terminate or suspend your access
                to our services immediately, without prior notice or liability, for any reason whatsoever, including
                without limitation if you breach these Terms.
              </p>
              <div className="bg-cream rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-navy mb-4">Termination Process:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>Either party may terminate with 90 days written notice</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>We may terminate immediately for material breach</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>Transition assistance provided during wind-down period</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>Certain provisions survive termination</span>
                  </li>
                </ul>
              </div>
              <p className="text-gray">
                Upon termination, your right to use our services will cease immediately. We will provide reasonable
                transition assistance including data export and AR wind-down services as specified in your service agreement.
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
                13. Dispute Resolution
              </h2>
              <p className="text-gray mb-6">
                Any dispute, claim, or controversy arising out of or relating to these Terms or the breach, termination,
                enforcement, interpretation, or validity thereof, including the determination of the scope or applicability
                of this agreement to arbitrate, shall be determined by arbitration in the State of Florida.
              </p>
              <div className="bg-white rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-navy mb-4">Arbitration Process:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>Mediation required before arbitration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>Arbitration administered by JAMS</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>Arbitrator selection by mutual agreement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span>Decision binding and final</span>
                  </li>
                </ul>
              </div>
              <p className="text-gray">
                The arbitrator may award any relief that would be available in court. The parties agree that the
                arbitrator shall have no authority to award punitive damages. Each party shall bear its own costs
                and expenses and an equal share of the arbitrator's fees and expenses.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Additional Sections */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <FadeIn>
              <div>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  14. Governing Law
                </h2>
                <p className="text-gray">
                  These Terms shall be governed by and construed in accordance with the laws of the State of Florida,
                  without regard to its conflict of law provisions. Any legal action or proceeding arising under these
                  Terms shall be brought exclusively in the federal or state courts located in the State of Florida.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  15. Force Majeure
                </h2>
                <p className="text-gray">
                  We shall not be liable for any failure to perform our obligations under these Terms due to causes
                  beyond our reasonable control, including but not limited to acts of God, war, terrorism, riots,
                  embargoes, acts of civil or military authorities, fire, floods, accidents, strikes, or shortages
                  of transportation facilities, fuel, energy, labor, or materials.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  16. Entire Agreement
                </h2>
                <p className="text-gray">
                  These Terms, together with our Privacy Policy and any service agreements executed by the parties,
                  constitute the entire agreement between you and Aethera Healthcare Solutions regarding the use of
                  our services and supersede all prior and contemporaneous understandings.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  17. Severability
                </h2>
                <p className="text-gray">
                  If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions
                  shall remain in full force and effect. Any invalid or unenforceable provision shall be reformed
                  to the minimum extent necessary to make it valid and enforceable.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                Questions About These Terms?
              </h2>
              <p className="text-gray max-w-2xl mx-auto mb-8">
                Contact our legal team for any questions about these Terms of Service.
              </p>
              <Link
                href="mailto:legal@aetherahealthcare.com"
                className="bg-teal hover:bg-navy text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
              >
                Email Legal Team
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}