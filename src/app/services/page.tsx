import Head from 'next/head';
import Link from 'next/link';
import {
  FileText,
  DollarSign,
  CreditCard,
  Shield,
  Users,
  CheckCircle,
  Calendar,
  Headphones,
  Zap,
  Clock,
  BarChart3,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';
import ServiceCard from '@/components/ui/ServiceCard';

export const metadata = {
  title: "RCM Services | Medical Billing, Coding, Denial Management",
  description: "Discover Aethera Healthcare Solutions' comprehensive revenue cycle management services including medical coding, claims processing, payment posting, denial management, and more for healthcare providers.",
};

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

export default function Services() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "serviceType": "Revenue Cycle Management Services",
              "provider": {
                "@type": "Organization",
                "name": "Aethera Healthcare Solutions",
                "url": "https://aetherahealthcare-website.pages.dev",
                "logo": "https://aetherahealthcare-website.pages.dev/logo.png"
              },
              "description": "Comprehensive revenue cycle management services including medical coding, claims processing, payment posting, denial management, and more for healthcare providers.",
              "areaServed": "United States",
              "category": "Healthcare Services"
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
                Our Medical Billing Services
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Comprehensive revenue cycle management tailored to your specialty and practice needs.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="ALL SERVICES"
            title="Complete Revenue Cycle Management"
            description="We handle every aspect of medical billing so you can focus on patient care."
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

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-6">
                Ready to Optimize Your Revenue Cycle?
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Schedule a free consultation to see how Aethera can improve your collections and reduce administrative burden.
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