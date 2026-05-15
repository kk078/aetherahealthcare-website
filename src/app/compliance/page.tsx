import Head from 'next/head';
import Link from 'next/link';
import { Shield, CheckCircle, FileText, Lock, Users } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: "Compliance | HIPAA, Security & Privacy | Aethera Healthcare",
  description: "Learn about Aethera Healthcare Solutions' comprehensive compliance program including HIPAA, security practices, and privacy protection for healthcare providers.",
};

const standards = [
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'HIPAA Compliance',
    description: 'Comprehensive privacy and security safeguards for protected health information.',
    href: '/compliance/hipaa'
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: 'Privacy Policy',
    description: 'Our commitment to protecting your personal and health information.',
    href: '/compliance/privacy-policy'
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: 'Terms of Service',
    description: 'Agreement governing our services and your use of our platform.',
    href: '/compliance/terms-of-service'
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: 'Business Associate Agreement',
    description: 'Understanding our BAA and how we protect your data.',
    href: '/compliance/baa'
  },
  {
    icon: <Lock className="h-8 w-8" />,
    title: 'Security Practices',
    description: 'Our comprehensive approach to data security and protection.',
    href: '/compliance/security'
  }
];

const commitments = [
  {
    title: 'Annual Risk Assessments',
    description: 'We conduct comprehensive risk assessments to identify and mitigate potential security threats.'
  },
  {
    title: 'Employee Training',
    description: 'All staff receive annual HIPAA training and security awareness education.'
  },
  {
    title: 'Incident Response',
    description: 'We maintain a documented incident response plan and conduct regular testing.'
  },
  {
    title: 'Business Associate Agreements',
    description: 'We execute BAAs with all vendors and subcontractors who access PHI.'
  },
  {
    title: 'Audit Controls',
    description: 'Comprehensive logging and monitoring of all system access and activities.'
  },
  {
    title: 'Data Encryption',
    description: 'AES-256 encryption for data at rest and TLS 1.3 for data in transit.'
  }
];

export default function Compliance() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Compliance | HIPAA, Security & Privacy | Aethera Healthcare",
              "description": "Learn about Aethera Healthcare Solutions' comprehensive compliance program including HIPAA, security practices, and privacy protection for healthcare providers.",
              "url": "https://aetherahealthcare-website.pages.dev/compliance",
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
                Our Commitment to Compliance
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Comprehensive compliance program ensuring the highest standards of data protection and regulatory adherence.
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
                  Unwavering Commitment to Compliance
                </h2>
                <p className="text-gray mb-6">
                  At Aethera Healthcare Solutions, compliance isn't just a requirement—it's the foundation of everything we do.
                  We maintain the highest standards of data protection, privacy, and regulatory adherence to ensure your trust
                  and confidence in our services.
                </p>
                <p className="text-gray mb-6">
                  Our comprehensive compliance program encompasses all aspects of healthcare data management,
                  from HIPAA privacy and security to business associate agreements and incident response procedures.
                </p>
                <p className="text-gray">
                  We conduct annual risk assessments, provide ongoing employee training, and maintain detailed
                  documentation of all compliance activities to ensure continuous adherence to federal and state regulations.
                </p>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8 h-full">
                  <div className="flex items-center mb-6">
                    <Shield className="h-10 w-10 text-teal mr-4" />
                    <h3 className="text-2xl font-bold text-navy">Compliance Leadership</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="bg-teal text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        1
                      </div>
                      <p className="text-gray">Designated Privacy Officer and Security Officer</p>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-teal text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        2
                      </div>
                      <p className="text-gray">Annual third-party security assessments</p>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-teal text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        3
                      </div>
                      <p className="text-gray">Continuous employee training and awareness</p>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-teal text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        4
                      </div>
                      <p className="text-gray">Regular policy updates and reviews</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="COMPLIANCE STANDARDS"
            title="Our Compliance Framework"
            description="Comprehensive approach to healthcare compliance and data protection."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {standards.map((standard, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10 h-full flex flex-col">
                  <div className="text-teal mb-4">
                    {standard.icon}
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">{standard.title}</h3>
                  <p className="text-gray mb-4 flex-grow">{standard.description}</p>
                  <Link
                    href={standard.href}
                    className="text-teal font-medium hover:text-mint transition-colors flex items-center"
                  >
                    Learn more <span className="ml-1">→</span>
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Our Commitments */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="OUR COMMITMENTS"
            title="Compliance Excellence"
            description="Six key areas where we maintain the highest standards of compliance and security."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {commitments.map((commitment, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-cream rounded-xl p-6 border border-gray/10">
                  <div className="flex items-center mb-4">
                    <div className="bg-teal text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-navy">{commitment.title}</h3>
                  </div>
                  <p className="text-gray">{commitment.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center">
            <FadeIn>
              <div className="flex justify-center mb-6">
                <Users className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-6">
                Questions About Our Compliance?
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Contact our Compliance Officer for any questions about our policies and procedures.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="mailto:compliance@aetherahealthcare.com"
                  className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
                >
                  Email Compliance Officer
                </Link>
                <Link
                  href="/contact"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
                >
                  General Contact
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