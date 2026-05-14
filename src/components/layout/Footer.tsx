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

const compliance = [
  { name: 'HIPAA Compliance', href: '/compliance/hipaa' },
  { name: 'Privacy Policy', href: '/compliance/privacy-policy' },
  { name: 'Terms of Service', href: '/compliance/terms-of-service' },
  { name: 'Business Associate Agreement', href: '/compliance/baa' },
  { name: 'Security Practices', href: '/compliance/security' },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-cream">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
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
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Services</h3>
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
            <h3 className="text-white font-bold text-lg mb-4">Company</h3>
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

          {/* Compliance */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Compliance</h3>
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

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray text-sm">
            &copy; {new Date().getFullYear()} Aethera Healthcare Solutions. All rights reserved.
          </p>
          <p className="text-gray text-sm mt-4 md:mt-0">
            aetherahealthcare.com
          </p>
        </div>
      </div>
    </footer>
  );
}