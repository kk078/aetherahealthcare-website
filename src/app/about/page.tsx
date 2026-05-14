'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

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

const team = [
  {
    name: 'Jennifer Walsh',
    role: 'Chief Executive Officer',
    bio: '20+ years in healthcare revenue cycle management. Former VP at major RCM company.',
  },
  {
    name: 'Michael Torres',
    role: 'VP of Operations',
    bio: 'Expert in process optimization and team leadership. 15+ years in healthcare administration.',
  },
  {
    name: 'Sarah Kim',
    role: 'Director of Coding',
    bio: 'Certified Professional Coder with specialties in cardiology and gastroenterology billing.',
  },
  {
    name: 'David Chen',
    role: 'Director of Billing',
    bio: 'Revenue cycle expert with focus on denial management and collections optimization.',
  },
  {
    name: 'Lisa Rodriguez',
    role: 'Compliance Officer',
    bio: 'HIPAA compliance specialist with extensive experience in healthcare privacy regulations.',
  },
];

const stats = [
  { value: '15+', label: 'Years in Business' },
  { value: '500+', label: 'Providers Served' },
  { value: '50M+', label: 'Claims Processed' },
  { value: '25+', label: 'Specialties Covered' },
];

const reasons = [
  'Specialized expertise in your medical specialty',
  'Proven track record of improving collections',
  'Dedicated account managers who understand your practice',
  'Advanced technology with real-time reporting',
  'Comprehensive compliance and security program',
  'Transparent pricing with no hidden fees',
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
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
                  Founded in 2008, Aethera Healthcare Solutions emerged from a simple realization: healthcare providers were spending too much time on billing and not enough time on patient care.
                </p>
                <p className="text-gray mb-6">
                  Our founders, all former healthcare administrators, saw firsthand how inefficient billing processes were draining practices of revenue and energy. They envisioned a company that would handle the complexities of medical billing so providers could focus on what they do best—caring for patients.
                </p>
                <p className="text-gray">
                  Today, we serve over 500 healthcare providers across 25+ specialties, processing more than 2 million claims annually. But we haven't forgotten our core mission: to be the trusted partner that maximizes revenue while minimizing the burden on healthcare providers.
                </p>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8 h-full">
                  <h3 className="text-2xl font-bold text-navy mb-6">Our Mission</h3>
                  <p className="text-gray mb-6">
                    To empower healthcare providers with expert revenue cycle management that maximizes collections, ensures compliance, and allows them to focus on delivering exceptional patient care.
                  </p>
                  <div className="border-t border-gray/10 pt-6">
                    <h3 className="text-2xl font-bold text-navy mb-6">Our Vision</h3>
                    <p className="text-gray">
                      To be the gold standard in medical billing services, recognized by providers and payers alike for our integrity, expertise, and results-driven approach.
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
            title="Leadership"
            description="Meet the experienced professionals who lead Aethera Healthcare Solutions."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {team.map((member, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10 text-center">
                  <div className="bg-gray/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <span className="text-3xl font-bold text-navy">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">{member.name}</h3>
                  <p className="text-teal font-medium mb-4">{member.role}</p>
                  <p className="text-gray">{member.bio}</p>
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