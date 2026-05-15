'use client';

import Link from 'next/link';
import { Lock, Shield, CheckCircle, Users, Zap } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

const securityAreas = [
  {
    title: 'Data Encryption',
    description: 'AES-256 encryption at rest for all PHI and TLS 1.3 encryption for data in transit.',
    icon: <Lock className="h-8 w-8" />
  },
  {
    title: 'Access Controls',
    description: 'Role-based access control with multi-factor authentication for all users.',
    icon: <Shield className="h-8 w-8" />
  },
  {
    title: 'Network Security',
    description: 'Firewalls, intrusion detection, and DDoS protection with regular vulnerability scanning.',
    icon: <Zap className="h-8 w-8" />
  },
  {
    title: 'Physical Security',
    description: 'Secure data centers with badge access controls and surveillance monitoring.',
    icon: <Lock className="h-8 w-8" />
  },
  {
    title: 'Employee Security',
    description: 'Background checks, annual HIPAA training, and comprehensive security policies.',
    icon: <Users className="h-8 w-8" />
  },
  {
    title: 'Incident Response',
    description: '24/7 monitoring with documented response procedures and breach notification.',
    icon: <Shield className="h-8 w-8" />
  }
];

export default function SecurityPractices() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-playfair mb-6">
                Security Practices
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Our comprehensive approach to protecting your data through advanced security measures and best practices.
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
                  Our Security Philosophy
                </h2>
                <p className="text-gray mb-6">
                  At Aethera Healthcare Solutions, security is not an add-on—it's fundamental to everything we do.
                  We implement a comprehensive, multi-layered security approach that protects your data at every level,
                  from physical infrastructure to application security.
                </p>
                <p className="text-gray mb-6">
                  Our security program is built on industry best practices and regulatory requirements including
                  HIPAA, SOC 2, and NIST cybersecurity framework. We conduct annual third-party security assessments
                  and maintain continuous monitoring of our systems.
                </p>
                <p className="text-gray">
                  We believe that protecting your data is our responsibility and privilege. Our dedicated security
                  team works around the clock to ensure your information remains confidential, available, and secure.
                </p>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8 h-full">
                  <div className="flex items-center mb-6">
                    <Shield className="h-10 w-10 text-teal mr-4" />
                    <h3 className="text-2xl font-bold text-navy">Security Framework</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mr-3" />
                      <p className="text-gray">HIPAA Security Rule compliance</p>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mr-3" />
                      <p className="text-gray">NIST Cybersecurity Framework</p>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mr-3" />
                      <p className="text-gray">SOC 2 Type II compliance pathway</p>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mr-3" />
                      <p className="text-gray">Annual third-party assessments</p>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mr-3" />
                      <p className="text-gray">Continuous security monitoring</p>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Security Areas */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="SECURITY AREAS"
            title="Comprehensive Protection Framework"
            description="Six key areas where we implement advanced security measures to protect your data."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {securityAreas.map((area, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10 h-full">
                  <div className="text-teal mb-4">
                    {area.icon}
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">{area.title}</h3>
                  <p className="text-gray">{area.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Data Encryption */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  Data Encryption
                </h2>
                <p className="text-gray mb-6">
                  We implement industry-leading encryption standards to protect your data both at rest and in transit.
                  All protected health information is encrypted using AES-256, the same standard used by the U.S.
                  government for classified information.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">AES-256 Encryption at Rest</p>
                      <p className="text-gray text-sm">All PHI stored in our databases and file systems</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">TLS 1.3 Encryption in Transit</p>
                      <p className="text-gray text-sm">All data transmission between systems and users</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">Field-Level Encryption</p>
                      <p className="text-gray text-sm">SSN, DOB, and TIN encrypted at the field level</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-gradient-to-br from-navy to-teal rounded-2xl p-8 text-white h-full">
                  <h3 className="text-2xl font-bold mb-6">Encryption Standards</h3>
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        1
                      </div>
                      <p>AES-256 for all database storage</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        2
                      </div>
                      <p>TLS 1.3 for all network communications</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        3
                      </div>
                      <p>SHA-256 hashing for password storage</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        4
                      </div>
                      <p>256-bit keys for field-level encryption</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        5
                      </div>
                      <p>Perfect Forward Secrecy implementation</p>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Access Controls */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <div className="bg-white rounded-2xl p-8 h-full border border-gray/10">
                  <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                    Access Controls
                  </h2>
                  <p className="text-gray mb-6">
                    We implement comprehensive access controls to ensure that only authorized personnel can access
                    protected health information. Our system is built on the principle of least privilege with
                    multiple layers of authentication and authorization.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <div>
                        <p className="font-bold text-navy">Role-Based Access Control (RBAC)</p>
                        <p className="text-gray text-sm">Access permissions based on job function and necessity</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <div>
                        <p className="font-bold text-navy">Multi-Factor Authentication (MFA)</p>
                        <p className="text-gray text-sm">Required for all users accessing PHI or administrative functions</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <div>
                        <p className="font-bold text-navy">Automatic Session Timeout</p>
                        <p className="text-gray text-sm">15-minute inactivity timeout for all sessions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-navy mb-6">Access Control Features</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        1
                      </div>
                      <div>
                        <p className="font-bold text-navy">Unique User IDs</p>
                        <p className="text-gray text-sm">Individual accounts for all users with audit trails</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        2
                      </div>
                      <div>
                        <p className="font-bold text-navy">Emergency Access Procedures</p>
                        <p className="text-gray text-sm">Documented processes for critical system access</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        3
                      </div>
                      <div>
                        <p className="font-bold text-navy">Account Lockout</p>
                        <p className="text-gray text-sm">Automatic lockout after failed authentication attempts</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        4
                      </div>
                      <div>
                        <p className="font-bold text-navy">Regular Access Reviews</p>
                        <p className="text-gray text-sm">Quarterly reviews of user access permissions</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Network Security */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  Network Security
                </h2>
                <p className="text-gray mb-6">
                  Our network security infrastructure provides multiple layers of protection against cyber threats.
                  We utilize enterprise-grade firewalls, intrusion detection systems, and DDoS protection to ensure
                  the integrity and availability of our services.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">Firewalls and Intrusion Detection</p>
                      <p className="text-gray text-sm">Next-generation firewalls with real-time threat detection</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">DDoS Protection</p>
                      <p className="text-gray text-sm">Cloudflare protection against distributed denial of service attacks</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">Vulnerability Scanning</p>
                      <p className="text-gray text-sm">Regular automated and manual vulnerability assessments</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-gradient-to-br from-navy to-teal rounded-2xl p-8 text-white h-full">
                  <h3 className="text-2xl font-bold mb-6">Security Monitoring</h3>
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        1
                      </div>
                      <p>24/7 security operations center monitoring</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        2
                      </div>
                      <p>Real-time threat intelligence feeds</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        3
                      </div>
                      <p>Automated incident response procedures</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        4
                      </div>
                      <p>Quarterly penetration testing</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        5
                      </div>
                      <p>Annual third-party security assessments</p>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Physical Security */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <div className="bg-white rounded-2xl p-8 h-full border border-gray/10">
                  <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                    Physical Security
                  </h2>
                  <p className="text-gray mb-6">
                    Our physical security measures protect the infrastructure that stores and processes your data.
                    We utilize enterprise-grade data centers with comprehensive physical security controls.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <div>
                        <p className="font-bold text-navy">Secure Data Centers</p>
                        <p className="text-gray text-sm">SOC 2 and SSAE 18 compliant facilities with 24/7 security</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <div>
                        <p className="font-bold text-navy">Badge Access Controls</p>
                        <p className="text-gray text-sm">Biometric and card-based access with detailed logging</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <div>
                        <p className="font-bold text-navy">Surveillance Monitoring</p>
                        <p className="text-gray text-sm">24/7 video surveillance with 90-day retention</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-navy mb-6">Physical Security Features</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        1
                      </div>
                      <div>
                        <p className="font-bold text-navy">Redundant Power Systems</p>
                        <p className="text-gray text-sm">Uninterruptible power supply and backup generators</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        2
                      </div>
                      <div>
                        <p className="font-bold text-navy">Environmental Controls</p>
                        <p className="text-gray text-sm">HVAC systems with temperature and humidity monitoring</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        3
                      </div>
                      <div>
                        <p className="font-bold text-navy">Fire Suppression</p>
                        <p className="text-gray text-sm">FM200 gas-based fire suppression systems</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        4
                      </div>
                      <div>
                        <p className="font-bold text-navy">Visitor Management</p>
                        <p className="text-gray text-sm">Escort requirements and detailed visitor logs</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Employee Security */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  Employee Security
                </h2>
                <p className="text-gray mb-6">
                  Our employees are our first line of defense against security threats. We implement comprehensive
                  screening, training, and policy enforcement to ensure all team members understand their role
                  in protecting your data.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">Background Checks</p>
                      <p className="text-gray text-sm">Criminal background and employment verification for all employees</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">Annual HIPAA Training</p>
                      <p className="text-gray text-sm">Comprehensive training on privacy and security requirements</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">Confidentiality Agreements</p>
                      <p className="text-gray text-sm">Signed agreements for all employees handling PHI</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-gradient-to-br from-navy to-teal rounded-2xl p-8 text-white h-full">
                  <h3 className="text-2xl font-bold mb-6">Employee Security Program</h3>
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        1
                      </div>
                      <p>Pre-employment screening and verification</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        2
                      </div>
                      <p>Annual security awareness training</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        3
                      </div>
                      <p>Quarterly phishing simulation exercises</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        4
                      </div>
                      <p>Sanctions policy for security violations</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        5
                      </div>
                      <p>Clean desk and mobile device policies</p>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Incident Response */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <div className="bg-white rounded-2xl p-8 h-full border border-gray/10">
                  <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                    Incident Response
                  </h2>
                  <p className="text-gray mb-6">
                    We maintain a comprehensive incident response program to quickly identify, contain, and remediate
                    security incidents. Our 24/7 monitoring ensures rapid detection and response to potential threats.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <div>
                        <p className="font-bold text-navy">24/7 Incident Monitoring</p>
                        <p className="text-gray text-sm">Continuous monitoring with automated alerting systems</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <div>
                        <p className="font-bold text-navy">Documented Response Procedures</p>
                        <p className="text-gray text-sm">Detailed procedures for incident identification and response</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <div>
                        <p className="font-bold text-navy">Breach Notification</p>
                        <p className="text-gray text-sm">Compliance with 60-day notification requirement for breaches</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-navy mb-6">Incident Response Process</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        1
                      </div>
                      <div>
                        <p className="font-bold text-navy">Detection and Analysis</p>
                        <p className="text-gray text-sm">Identify and assess the nature and scope of incidents</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        2
                      </div>
                      <div>
                        <p className="font-bold text-navy">Containment and Eradication</p>
                        <p className="text-gray text-sm">Isolate affected systems and remove threats</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        3
                      </div>
                      <div>
                        <p className="font-bold text-navy">Recovery and Validation</p>
                        <p className="text-gray text-sm">Restore systems and verify normal operations</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        4
                      </div>
                      <div>
                        <p className="font-bold text-navy">Post-Incident Review</p>
                        <p className="text-gray text-sm">Analyze incidents and implement preventive measures</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Business Continuity */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  Business Continuity
                </h2>
                <p className="text-gray mb-6">
                  Our business continuity program ensures that your medical billing services remain available
                  even during unexpected disruptions. We maintain redundant systems and comprehensive disaster
                  recovery procedures.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">Automated Daily Backups</p>
                      <p className="text-gray text-sm">Full system backups with geographically distributed storage</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">Geographic Redundancy</p>
                      <p className="text-gray text-sm">Multiple data center locations for disaster recovery</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">Disaster Recovery Plan</p>
                      <p className="text-gray text-sm">Comprehensive plan tested annually with all stakeholders</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-gradient-to-br from-navy to-teal rounded-2xl p-8 text-white h-full">
                  <h3 className="text-2xl font-bold mb-6">Recovery Objectives</h3>
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        1
                      </div>
                      <p>Recovery Time Objective: 4 hours for critical systems</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        2
                      </div>
                      <p>Recovery Point Objective: 1 hour maximum data loss</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        3
                      </div>
                      <p>Annual disaster recovery testing and validation</p>
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        4
                      </div>
                      <p>Quarterly backup restoration verification</p>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Certifications */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="COMPLIANCE"
            title="Certifications and Assessments"
            description="Our commitment to maintaining the highest standards of security and compliance."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <FadeIn>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10 text-center">
                <Shield className="h-12 w-12 text-teal mx-auto mb-4" />
                <h3 className="text-xl font-bold text-navy mb-2">HIPAA Compliance</h3>
                <p className="text-gray">Annual risk assessments and comprehensive compliance program</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10 text-center">
                <CheckCircle className="h-12 w-12 text-teal mx-auto mb-4" />
                <h3 className="text-xl font-bold text-navy mb-2">SOC 2 Type II</h3>
                <p className="text-gray">Pathway to full certification with annual third-party assessments</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray/10 text-center">
                <Lock className="h-12 w-12 text-teal mx-auto mb-4" />
                <h3 className="text-xl font-bold text-navy mb-2">PCI DSS</h3>
                <p className="text-gray">Compliance for patient payment processing and card data security</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Vendor Management */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                  Vendor Management
                </h2>
                <p className="text-gray mb-6">
                  We maintain strict security standards for all technology vendors and subcontractors who may access
                  PHI in the course of providing services to us. Every vendor must meet our comprehensive security
                  requirements.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">Business Associate Agreements</p>
                      <p className="text-gray text-sm">Execution of BAAs with all vendors accessing PHI</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">Vendor Security Assessment</p>
                      <p className="text-gray text-sm">Comprehensive evaluation of vendor security practices</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <div>
                      <p className="font-bold text-navy">Regular Compliance Reviews</p>
                      <p className="text-gray text-sm">Annual reviews of vendor compliance with security requirements</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            <div>
              <FadeIn delay={0.2}>
                <div className="bg-cream rounded-2xl p-8 border border-teal">
                  <h3 className="text-2xl font-bold text-navy mb-6">Vendor Security Requirements</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        1
                      </div>
                      <div>
                        <p className="font-bold text-navy">Data Encryption</p>
                        <p className="text-gray text-sm">AES-256 at rest, TLS 1.3 in transit</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        2
                      </div>
                      <div>
                        <p className="font-bold text-navy">Access Controls</p>
                        <p className="text-gray text-sm">MFA required, role-based access</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        3
                      </div>
                      <div>
                        <p className="font-bold text-navy">Security Training</p>
                        <p className="text-gray text-sm">Annual training for personnel handling PHI</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                        4
                      </div>
                      <div>
                        <p className="font-bold text-navy">Incident Response</p>
                        <p className="text-gray text-sm">24/7 monitoring, breach notification within 24 hours</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center">
            <FadeIn>
              <div className="flex justify-center mb-6">
                <Users className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-6">
                Responsible Disclosure
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                We welcome security researchers to help us identify and address potential vulnerabilities.
              </p>
              <div className="max-w-2xl mx-auto text-left bg-white/10 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-4">How to Report Security Issues:</h3>
                <ul className="space-y-2 text-cream">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    <span>Email security concerns to security@aetherahealthcare.com</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    <span>Provide detailed information about the vulnerability</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    <span>Include steps to reproduce the issue if applicable</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">•</span>
                    <span>Allow reasonable time for investigation and remediation</span>
                  </li>
                </ul>
              </div>
              <p className="text-cream">
                We will acknowledge receipt of your report within 24 hours and work with you to resolve
                any confirmed vulnerabilities promptly.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}