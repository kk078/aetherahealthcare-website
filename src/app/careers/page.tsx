'use client';

import Head from 'next/head';
import Link from 'next/link';
import {
  Users,
  Heart,
  Award,
  TrendingUp,
  Briefcase,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

const benefits = [
  {
    title: 'Competitive Compensation',
    description: 'Above-industry-average salaries with performance bonuses',
    icon: <DollarSign className="h-6 w-6" />
  },
  {
    title: 'Health & Wellness',
    description: 'Comprehensive medical, dental, and vision insurance',
    icon: <Heart className="h-6 w-6" />
  },
  {
    title: 'Professional Development',
    description: 'Continuing education allowance and certification support',
    icon: <Award className="h-6 w-6" />
  },
  {
    title: 'Career Growth',
    description: 'Clear advancement paths and internal mobility',
    icon: <TrendingUp className="h-6 w-6" />
  },
  {
    title: 'Work-Life Balance',
    description: 'Flexible schedules and remote work options',
    icon: <Clock className="h-6 w-6" />
  },
  {
    title: 'Inclusive Culture',
    description: 'Diverse, collaborative, and supportive environment',
    icon: <Users className="h-6 w-6" />
  }
];

const positions = [
  {
    title: 'Senior Medical Coder',
    department: 'Coding',
    location: 'Remote',
    type: 'Full-time',
    description: 'Lead coding initiatives for complex medical specialties with mentorship responsibilities.'
  },
  {
    title: 'Revenue Cycle Analyst',
    department: 'Analytics',
    location: 'Remote',
    type: 'Full-time',
    description: 'Analyze billing performance and develop optimization strategies for healthcare practices.'
  },
  {
    title: 'Client Success Manager',
    department: 'Account Management',
    location: 'Remote',
    type: 'Full-time',
    description: 'Manage relationships with healthcare providers and ensure exceptional service delivery.'
  },
  {
    title: 'Compliance Specialist',
    department: 'Compliance',
    location: 'Remote',
    type: 'Full-time',
    description: 'Maintain HIPAA compliance and develop security protocols for our platforms.'
  }
];

export default function Careers() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Careers at Aethera Healthcare Solutions",
              "description": "Join our mission-driven team and help transform revenue cycle management for healthcare providers.",
              "url": "https://aetherahealthcare-website.pages.dev/careers",
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
                Join Our Team
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Help healthcare providers focus on patient care while we handle the complexities of medical billing.
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
                  Our Mission-Driven Culture
                </h2>
                <p className="text-gray mb-6">
                  At Aethera Healthcare Solutions, we believe that when healthcare providers can focus entirely on patient care,
                  everyone benefits. Our team is passionate about simplifying the complex world of medical billing so providers
                  can do what they do best—save lives and improve health outcomes.
                </p>
                <p className="text-gray mb-6">
                  We're looking for talented, dedicated professionals who share our commitment to excellence and our passion
                  for making a difference in healthcare. If you thrive in a collaborative, innovative environment and want
                  to be part of a growing company that's transforming revenue cycle management, we'd love to hear from you.
                </p>
                <p className="text-gray">
                  Our remote-first culture allows talented professionals from across the country to contribute to our mission
                  while maintaining work-life balance and personal fulfillment.
                </p>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8 h-full">
                  <div className="flex items-center mb-6">
                    <Users className="h-10 w-10 text-teal mr-4" />
                    <h3 className="text-2xl font-bold text-navy">Why Aethera?</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span className="text-gray">Mission-driven work that directly impacts healthcare providers and patients</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span className="text-gray">Opportunities for professional growth and development</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span className="text-gray">Collaborative, inclusive, and supportive team environment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span className="text-gray">Cutting-edge technology and innovative approaches</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span className="text-gray">Flexible remote work arrangements</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal font-bold mr-2">•</span>
                      <span className="text-gray">Competitive compensation and benefits</span>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="EMPLOYEE BENEFITS"
            title="What We Offer"
            description="Comprehensive benefits package designed to support your health, wealth, and career growth."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {benefits.map((benefit, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10 h-full">
                  <div className="text-teal mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">{benefit.title}</h3>
                  <p className="text-gray">{benefit.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <div className="bg-cream rounded-2xl p-8 h-full">
                  <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                    Our Culture
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-navy mb-2">Collaboration</h3>
                      <p className="text-gray">
                        We believe the best solutions emerge when diverse perspectives work together toward common goals.
                        Cross-functional collaboration is built into how we work.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-navy mb-2">Innovation</h3>
                      <p className="text-gray">
                        Healthcare is constantly evolving, and we embrace change as an opportunity to improve our services
                        and better support our clients.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-navy mb-2">Integrity</h3>
                      <p className="text-gray">
                        We maintain the highest ethical standards in all our interactions with clients, colleagues, and
                        the healthcare community we serve.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  Professional Development
                </h2>
                <p className="text-gray mb-6">
                  We invest in our team members' growth through comprehensive professional development programs:
                </p>
                <ul className="space-y-4 mb-6">
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span className="text-gray">Annual education allowance for courses and certifications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span className="text-gray">Conference attendance and industry event participation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span className="text-gray">Mentorship programs pairing junior and senior team members</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span className="text-gray">Leadership development and management training</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal font-bold mr-2">•</span>
                    <span className="text-gray">Internal mobility and career advancement opportunities</span>
                  </li>
                </ul>
                <div className="bg-gradient-to-r from-teal to-mint rounded-xl p-6">
                  <h3 className="text-xl font-bold text-navy mb-2">Learning Culture</h3>
                  <p className="text-gray">
                    We encourage continuous learning through book clubs, lunch-and-learn sessions, and peer knowledge sharing.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="OPEN POSITIONS"
            title="Join Our Growing Team"
            description="We're always looking for talented professionals to join our mission."
          />

          <div className="grid grid-cols-1 gap-6 mt-16">
            {positions.map((position, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-navy mb-2">{position.title}</h3>
                      <p className="text-gray mb-4">{position.description}</p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 text-teal mr-2" />
                          <span className="text-sm text-gray">{position.department}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-teal mr-2" />
                          <span className="text-sm text-gray">{position.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-teal mr-2" />
                          <span className="text-sm text-gray">{position.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <button className="bg-teal hover:bg-navy text-white font-bold py-2 px-6 rounded-full transition-colors">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray mb-6">
              Don't see a position that matches your skills? We're always interested in hearing from talented professionals.
            </p>
            <Link
              href="mailto:careers@aetherahealthcare.com"
              className="text-teal font-medium hover:text-mint transition-colors"
            >
              Send us your resume →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-6">
                Ready to Make a Difference?
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Join our team and help healthcare providers focus on what matters most—patient care.
              </p>
              <Link
                href="mailto:careers@aetherahealthcare.com"
                className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
              >
                Contact Our HR Team
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}