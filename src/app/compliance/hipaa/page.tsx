import Head from 'next/head';
import Link from 'next/link';
import { Shield, CheckCircle, Users, FileText } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: "HIPAA Compliance Program | Aethera Healthcare Solutions",
  description: "Comprehensive HIPAA compliance program for healthcare providers. Learn about our administrative, physical, and technical safeguards for protecting patient health information.",
};

const administrativeSafeguards = [
  {
    title: 'Security Management Process',
    description: 'Comprehensive risk analysis and risk management procedures to identify and address potential security threats.'
  },
  {
    title: 'Assigned Security Responsibility',
    description: 'Designation of a Security Officer responsible for developing and implementing our security policies.'
  },
  {
    title: 'Workforce Security',
    description: 'Authorization and clearance procedures for workforce members accessing electronic protected health information.'
  },
  {
    title: 'Information Access Management',
    description: 'Policies and procedures for authorizing access to electronic protected health information.'
  },
  {
    title: 'Security Awareness Training',
    description: 'Regular training programs to educate workforce members about security reminders, password management, and login monitoring.'
  },
  {
    title: 'Security Incident Procedures',
    description: 'Response and reporting procedures for security incidents affecting electronic protected health information.'
  },
  {
    title: 'Contingency Plan',
    description: 'Data backup, disaster recovery, and emergency operations procedures to ensure business continuity.'
  },
  {
    title: 'Evaluation',
    description: 'Periodic assessment of the effectiveness of our security policies and procedures.'
  },
  {
    title: 'Business Associate Agreements',
    description: 'Execution of business associate agreements with all vendors and subcontractors who access PHI.'
  }
];

const physicalSafeguards = [
  {
    title: 'Facility Access Controls',
    description: 'Policies and procedures to limit physical access to our facilities and equipment.'
  },
  {
    title: 'Workstation Use',
    description: 'Policies and procedures for the proper use of workstations and devices that access electronic PHI.'
  },
  {
    title: 'Workstation Security',
    description: 'Physical safeguards for workstations to ensure proper authentication and access control.'
  },
  {
    title: 'Device and Media Controls',
    description: 'Procedures for the receipt and removal of hardware and electronic media containing electronic PHI.'
  }
];

const technicalSafeguards = [
  {
    title: 'Access Control',
    description: 'Unique user identification, emergency access procedures, automatic logoff, and encryption for PHI.'
  },
  {
    title: 'Audit Controls',
    description: 'Activity logs and monitoring capabilities to record and examine access and other activities.'
  },
  {
    title: 'Integrity Controls',
    description: 'Mechanisms to authenticate electronic PHI and ensure it has not been altered or destroyed.'
  },
  {
    title: 'Transmission Security',
    description: 'Encryption and other security measures to protect electronic PHI during transmission.'
  }
];

const breachNotification = [
  {
    title: 'Discovery and Reporting',
    description: 'Immediate identification and reporting of any potential breaches of unsecured PHI.'
  },
  {
    title: 'Notification Timeline',
    description: 'Compliance with the 60-day notification requirement for breaches affecting individuals.'
  },
  {
    title: 'Content of Notification',
    description: 'Detailed information about the breach including description, types of information involved, and steps individuals can take.'
  },
  {
    title: 'HHS Reporting',
    description: 'Timely reporting to the Department of Health and Human Services for breaches affecting more than 500 individuals.'
  }
];

const patientRights = [
  {
    title: 'Right to Access PHI',
    description: 'Individuals have the right to access their protected health information upon request.'
  },
  {
    title: 'Right to Request Amendments',
    description: 'Individuals can request amendments to their PHI if they believe it is incorrect or incomplete.'
  },
  {
    title: 'Right to Accounting of Disclosures',
    description: 'Individuals can request an accounting of disclosures of their PHI for purposes other than treatment, payment, and healthcare operations.'
  },
  {
    title: 'Right to Request Restrictions',
    description: 'Individuals can request restrictions on the use and disclosure of their PHI.'
  },
  {
    title: 'Right to Confidential Communications',
    description: 'Individuals can request confidential communications of their PHI through alternative means or locations.'
  }
];

export default function HipaaCompliance() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "HIPAA Compliance Program | Aethera Healthcare Solutions",
              "description": "Comprehensive HIPAA compliance program for healthcare providers. Learn about our administrative, physical, and technical safeguards for protecting patient health information.",
              "url": "https://aetherahealthcare-website.pages.dev/compliance/hipaa",
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
                HIPAA Compliance
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Our comprehensive approach to protecting your health information in compliance with HIPAA regulations.
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
                  Comprehensive HIPAA Compliance Program
                </h2>
                <p className="text-gray mb-6">
                  The Health Insurance Portability and Accountability Act (HIPAA) establishes national standards
                  for protecting individuals' medical records and personal health information. At Aethera Healthcare Solutions,
                  we maintain a comprehensive compliance program that exceeds HIPAA requirements.
                </p>
                <p className="text-gray mb-6">
                  Our program encompasses all required administrative, physical, and technical safeguards to ensure
                  the confidentiality, integrity, and availability of electronic protected health information (ePHI).
                </p>
                <p className="text-gray">
                  We conduct annual risk assessments, provide ongoing employee training, and maintain detailed
                  documentation of all compliance activities to ensure continuous adherence to HIPAA regulations.
                </p>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8 h-full">
                  <div className="flex items-center mb-6">
                    <Shield className="h-10 w-10 text-teal mr-4" />
                    <h3 className="text-2xl font-bold text-navy">Our HIPAA Commitment</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray">Annual risk assessments and security evaluations</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray">Mandatory employee training for all workforce members</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray">Documented incident response procedures</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray">6-year retention of compliance documentation</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray">Regular third-party security audits</p>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Administrative Safeguards */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="ADMINISTRATIVE SAFEGUARDS"
            title="Management and Organizational Controls"
            description="Policies and procedures for managing the selection, development, and implementation of security measures."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {administrativeSafeguards.map((safeguard, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10">
                  <h3 className="text-lg font-bold text-navy mb-2">{safeguard.title}</h3>
                  <p className="text-gray">{safeguard.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Physical Safeguards */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="PHYSICAL SAFEGUARDS"
            title="Facility and Equipment Security"
            description="Physical measures, policies, and procedures to protect electronic information systems and related buildings and equipment."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            {physicalSafeguards.map((safeguard, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-cream rounded-xl p-6 border border-gray/10">
                  <div className="flex items-center mb-4">
                    <div className="bg-teal text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <Shield className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-navy">{safeguard.title}</h3>
                  </div>
                  <p className="text-gray">{safeguard.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Safeguards */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="TECHNICAL SAFEGUARDS"
            title="Technology and Data Protection"
            description="Technology and related policies to protect electronic protected health information and control access to it."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            {technicalSafeguards.map((safeguard, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10">
                  <div className="flex items-center mb-4">
                    <div className="bg-teal text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <Shield className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-navy">{safeguard.title}</h3>
                  </div>
                  <p className="text-gray">{safeguard.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Breach Notification */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="BREACH NOTIFICATION"
            title="Incident Response and Reporting"
            description="Procedures for identifying, responding to, and reporting breaches of unsecured protected health information."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            {breachNotification.map((item, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-cream rounded-xl p-6 border border-gray/10">
                  <div className="flex items-center mb-4">
                    <div className="bg-teal text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-navy">{item.title}</h3>
                  </div>
                  <p className="text-gray">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Rights */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="PATIENT RIGHTS"
            title="Individual Privacy Rights"
            description="Protections ensuring individuals have appropriate access to and control over their health information."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            {patientRights.map((right, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10">
                  <div className="flex items-center mb-4">
                    <div className="bg-teal text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-navy">{right.title}</h3>
                  </div>
                  <p className="text-gray">{right.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Our Program */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-white">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-6">
                Our HIPAA Compliance Program
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Leadership</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-mint flex-shrink-0 mt-0.5 mr-2" />
                      <span>Designated Privacy Officer</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-mint flex-shrink-0 mt-0.5 mr-2" />
                      <span>Designated Security Officer</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-mint flex-shrink-0 mt-0.5 mr-2" />
                      <span>Compliance Committee</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Training & Awareness</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-mint flex-shrink-0 mt-0.5 mr-2" />
                      <span>Annual mandatory training</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-mint flex-shrink-0 mt-0.5 mr-2" />
                      <span>New hire orientation</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-mint flex-shrink-0 mt-0.5 mr-2" />
                      <span>Security awareness reminders</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Documentation</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-mint flex-shrink-0 mt-0.5 mr-2" />
                      <span>Risk assessments (6 years)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-mint flex-shrink-0 mt-0.5 mr-2" />
                      <span>Training records (6 years)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-mint flex-shrink-0 mt-0.5 mr-2" />
                      <span>Incident reports (6 years)</span>
                    </li>
                  </ul>
                </div>
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
                Questions About Our HIPAA Compliance?
              </h2>
              <p className="text-gray max-w-2xl mx-auto mb-8">
                Contact our Privacy Officer or Security Officer for any questions about our HIPAA compliance program.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="mailto:privacy@aetherahealthcare.com"
                  className="bg-teal hover:bg-navy text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
                >
                  Email Privacy Officer
                </Link>
                <Link
                  href="mailto:security@aetherahealthcare.com"
                  className="bg-transparent border-2 border-teal text-teal hover:bg-teal/10 font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
                >
                  Email Security Officer
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}