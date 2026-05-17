import Link from 'next/link';

const services = [
  { name: 'Medical Coding', href: '/services/medical-coding' },
  { name: 'Claims & Billing', href: '/services/claims-billing' },
  { name: 'Payment Posting', href: '/services/payment-posting' },
  { name: 'Denial Management', href: '/services/denial-management' },
  { name: 'Provider Credentialing', href: '/services/credentialing' },
  { name: 'Eligibility Verification', href: '/services/eligibility-verification' },
  { name: 'Prior Authorization', href: '/services/prior-authorization' },
  { name: 'Patient Collections', href: '/services/patient-collections' },
  { name: 'Compliance & Auditing', href: '/services/compliance-auditing' },
  { name: 'Telehealth Billing', href: '/services/telehealth-billing' },
  { name: 'AR Follow-Up', href: '/services/ar-followup' },
  { name: 'Reporting & Analytics', href: '/services/reporting-analytics' },
];

const company = [
  { name: 'About', href: '/about' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Process', href: '/process' },
  { name: 'Specialties', href: '/specialties' },
  { name: 'Careers', href: '/careers' },
  { name: 'Blog', href: '/blog' },
  { name: 'FAQ', href: '/faq' },
];

const resources = [
  { name: 'Case Studies', href: '/case-studies' },
  { name: 'Provider Portal', href: '/portal' },
  { name: 'Payer Network', href: '/payers' },
  { name: 'EHR Integrations', href: '/integrations' },
  { name: 'Free Assessment', href: '/free-assessment' },
];

const compliance = [
  { name: 'HIPAA Compliance', href: '/compliance/hipaa' },
  { name: 'Privacy Policy', href: '/compliance/privacy-policy' },
  { name: 'Terms of Service', href: '/compliance/terms-of-service' },
  { name: 'Business Associate Agreement', href: '/compliance/baa' },
  { name: 'Security Practices', href: '/compliance/security' },
];

const trustBadges = [
  { label: 'HIPAA Compliant', icon: '🔒' },
  { label: 'SOC 2 Certified', icon: '✓' },
  { label: 'HBMA Member', icon: '★' },
  { label: 'BAA Available', icon: '📄' },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-cream">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-teal to-mint rounded-lg w-10 h-10 flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="ml-3 text-xl font-bold text-white font-playfair">Aethera</span>
            </div>
            <p className="mt-4 text-gray text-sm">
              Maximizing Revenue. Minimizing Burden.
            </p>
            <p className="mt-2 text-gray text-sm">
              Your full-service medical billing partner handling coding, claims, payments, denials, and collections.
            </p>
            <div className="mt-5">
              <Link
                href="/free-assessment"
                className="inline-block bg-mint hover:bg-teal text-navy font-bold text-xs py-2 px-4 rounded-full transition-colors"
              >
                Get Free Assessment →
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Services</h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.name}>
                  <Link href={service.href} className="text-gray hover:text-mint transition-colors text-sm">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Company</h3>
            <ul className="space-y-2">
              {company.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray hover:text-mint transition-colors text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Resources</h3>
            <ul className="space-y-2">
              {resources.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray hover:text-mint transition-colors text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Compliance</h3>
            <ul className="space-y-2">
              {compliance.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray hover:text-mint transition-colors text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 pt-6 border-t border-gray/20">
          <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
            {trustBadges.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-cream text-xs font-semibold px-3 py-1.5 rounded-full"
              >
                <span className="text-mint">{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray text-sm">
              &copy; {new Date().getFullYear()} Aethera Healthcare Solutions. All rights reserved.
            </p>
            <p className="text-gray text-sm mt-3 md:mt-0">
              Lakeland, FL &middot; aetherahealthcare.com
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
