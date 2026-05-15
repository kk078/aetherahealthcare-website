import Head from 'next/head';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: "About Aethera Healthcare Solutions | Our Story & Mission",
  description: "Learn about Aethera Healthcare Solutions, a startup focused on providing personalized revenue cycle management for independent healthcare providers. Discover our mission, values, and commitment to your success.",
};

const values = [
  {
    title: 'Accuracy',
    description: 'We maintain the highest standards of coding and billing accuracy to maximize your revenue and minimize denials.',
  },
  {
    title: 'Transparency',
    description: 'Real-time access to your financial data with comprehensive reporting and no hidden fees or contracts.',
  },
  {
    title: 'Accountability',
    description: 'We take ownership of your revenue cycle success with dedicated account teams and measurable performance metrics.',
  },
  {
    title: 'Partnership',
    description: 'We work as an extension of your team, providing proactive recommendations and strategic guidance.',
  },
];

const teamRoles = [
  {
    title: 'Certified Medical Coders',
    description: 'Expert coders with CPC and CCS certifications ensuring accurate claim submission and maximum reimbursement.',
  },
  {
    title: 'Billing Specialists',
    description: 'Experienced professionals handling claim submission, payment posting, and denial management.',
  },
  {
    title: 'Denial Management Experts',
    description: 'Specialists focused on preventing denials and successfully appealing rejected claims.',
  },
  {
    title: 'Dedicated Account Managers',
    description: 'Your single point of contact who understands your practice, specialty, and unique needs.',
  },
];

const stats = [
  { value: '2025', label: 'Year Founded' },
  { value: '12+', label: 'Services Offered' },
  { value: '26+', label: 'Specialties Supported' },
  { value: '100%', label: 'Committed to Your Success' },
];

const reasons = [
  'Personalized attention — we partner with a select number of practices so every client gets the focus they deserve',
  'Proven track record of improving collections',
  'Dedicated account managers who understand your practice',
  'Advanced technology with real-time reporting',
  'Comprehensive compliance and security program',
  'Transparent pricing with no hidden fees',
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AboutPage",
              "name": "About Aethera Healthcare Solutions",
              "description": "Learn about Aethera Healthcare Solutions, a startup focused on providing personalized revenue cycle management for independent healthcare providers. Discover our mission, values, and commitment to your success.",
              "url": "https://aetherahealthcare-website.pages.dev/about",
              "publisher": {
                "@type": "Organization",
                "name": "Aethera Healthcare Solutions",
                "url": "https://aetherahealthcare-website.pages.dev",
                "logo": "https://aetherahealthcare-website.pages.dev/logo.png"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Aethera Healthcare Solutions",
              "alternateName": "Aethera",
              "description": "Personalized revenue cycle management for independent healthcare providers",
              "foundingDate": "2025",
              "founder": {
                "@type": "Person",
                "name": "Aethera Healthcare Solutions Team"
              },
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
      </Head>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-playfair mb-6">
                About Aethera Healthcare Solutions
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                We're on a mission to help healthcare providers focus on patient care while we handle the complexities of medical billing.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  Our Story
                </h2>
                <p className="text-gray mb-6">
                  Aethera Healthcare Solutions was founded in 2025 with a clear mission: to give independent healthcare providers the same quality of revenue cycle management that large hospital systems enjoy, but at a price point and service level designed for growing practices.
                </p>
                <p className="text-gray mb-6">
                  Our founding team brings years of experience in medical billing, coding, and healthcare operations. We saw firsthand how small and mid-sized practices were being underserved by large billing companies that treated them as afterthoughts — slow response times, generic support, and a revolving door of account managers who didn't understand their specialty.
                </p>
                <p className="text-gray">
                  We built Aethera to be different. We partner with a select number of providers, giving each one a dedicated team that knows their specialty, their payers, and their practice inside and out. We're small enough to give you personal attention, but experienced enough to deliver enterprise-level results.
                </p>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8 h-full">
                  <h3 className="text-2xl font-bold text-navy mb-6">Our Mission</h3>
                  <p className="text-gray mb-6">
                    To empower independent healthcare providers with expert, personalized revenue cycle management that maximizes collections and lets them focus on patient care.
                  </p>
                  <div className="border-t border-gray/10 pt-6">
                    <h3 className="text-2xl font-bold text-navy mb-6">Our Vision</h3>
                    <p className="text-gray">
                      To be the most trusted billing partner for independent medical practices in the United States.
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="OUR VALUES"
            title="What Guides Us"
            description="These core principles shape everything we do at Aethera Healthcare Solutions."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {values.map((value, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10 h-full">
                  <h3 className="text-xl font-bold text-navy mb-4">{value.title}</h3>
                  <p className="text-gray">{value.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="text-center">
                  <p className="text-4xl font-bold text-teal mb-2">{stat.value}</p>
                  <p className="text-gray">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="OUR TEAM"
            title="Expert Professionals"
            description="Our team of certified medical billing professionals, coders (CPC, CCS), and denial specialists brings extensive healthcare revenue cycle experience to every practice we serve."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {teamRoles.map((role, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10 h-full">
                  <h3 className="text-xl font-bold text-navy mb-4">{role.title}</h3>
                  <p className="text-gray">{role.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="WHY CHOOSE US"
            title="Why Healthcare Providers Choose Aethera"
            description="Six key reasons practices partner with us for their revenue cycle management."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            {reasons.map((reason, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="flex items-start">
                  <div className="bg-teal text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <p className="text-gray ml-4">{reason}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}