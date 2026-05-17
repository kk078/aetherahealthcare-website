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

const teamMembers = [
  {
    name: 'Marcus Webb',
    title: 'Founder & CEO',
    credentials: 'MBA, CHBME',
    initials: 'MW',
    color: 'bg-teal',
    bio: 'Marcus brings 15+ years of healthcare revenue cycle leadership, having managed billing operations for multi-specialty groups across Florida and Georgia. He founded Aethera to bring enterprise-grade RCM to independent practices.',
    specialties: ['Revenue Cycle Strategy', 'Payer Contracting', 'Practice Growth'],
  },
  {
    name: 'Dr. Priya Nair',
    title: 'Head of Clinical Operations',
    credentials: 'MD, CPC',
    initials: 'PN',
    color: 'bg-navy',
    bio: 'A former hospitalist turned billing operations expert, Dr. Nair leads clinical documentation integrity and coding accuracy programs. Her dual perspective as clinician and coder has helped clients recover an average of 23% in previously undercaptured revenue.',
    specialties: ['Clinical Documentation', 'Specialty Coding', 'Compliance Auditing'],
  },
  {
    name: 'Jordan Cole',
    title: 'Director of Billing Operations',
    credentials: 'CPC, CPMA',
    initials: 'JC',
    color: 'bg-mint',
    bio: 'Jordan oversees day-to-day claim submission, denial management, and AR workflows for all client accounts. With a background in cardiology and orthopedics billing, Jordan has reduced average AR days below 28 across the client portfolio.',
    specialties: ['Denial Management', 'AR Optimization', 'Payer Relations'],
  },
  {
    name: 'Sandra Liu',
    title: 'Client Success Manager',
    credentials: 'CMRS, RHIT',
    initials: 'SL',
    color: 'bg-teal',
    bio: 'Sandra is the primary point of contact for all Aethera clients, ensuring every practice gets the personalized attention it deserves. She specializes in onboarding, EHR integration coordination, and monthly performance reviews.',
    specialties: ['Client Onboarding', 'EHR Integration', 'Performance Reporting'],
  },
  {
    name: 'Ahmed Hassan',
    title: 'Lead Medical Coder',
    credentials: 'CPC, CCS, CEMC',
    initials: 'AH',
    color: 'bg-navy',
    bio: "Ahmed leads Aethera's coding team with expertise spanning surgery, evaluation & management, and behavioral health. His rigorous review process maintains a 99.2% coding accuracy rate across all client specialties.",
    specialties: ['Surgical Coding', 'E&M Coding', 'Behavioral Health'],
  },
  {
    name: 'Rachel Torres',
    title: 'Credentialing Specialist',
    credentials: 'CPCS, NAMSS Member',
    initials: 'RT',
    color: 'bg-mint',
    bio: 'Rachel manages provider enrollment and credentialing across 900+ payer contracts. Her streamlined process gets new providers credentialed an average of 40% faster than industry standard, minimizing revenue gaps during onboarding.',
    specialties: ['Provider Enrollment', 'Payer Credentialing', 'CAQH Management'],
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

      {/* Real Team Bios */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="MEET THE TEAM"
            title="The People Behind Your Revenue"
            description="Certified billers, coders, and clinicians who know your specialty, understand your payers, and are accountable for your results."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {teamMembers.map((member, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray/10 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`${member.color} w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold text-lg">{member.initials}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy leading-tight">{member.name}</h3>
                      <p className="text-teal text-sm font-semibold">{member.title}</p>
                      <p className="text-gray text-xs mt-0.5">{member.credentials}</p>
                    </div>
                  </div>
                  <p className="text-gray text-sm leading-relaxed flex-grow">{member.bio}</p>
                  <div className="mt-4 pt-4 border-t border-gray/10 flex flex-wrap gap-2">
                    {member.specialties.map((s, i) => (
                      <span key={i} className="bg-cream text-navy text-xs font-medium px-2 py-1 rounded-full border border-gray/10">
                        {s}
                      </span>
                    ))}
                  </div>
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