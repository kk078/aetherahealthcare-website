'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

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

const complianceItems = [
  { name: 'HIPAA Compliance', href: '/compliance/hipaa' },
  { name: 'Privacy Policy', href: '/compliance/privacy-policy' },
  { name: 'Terms of Service', href: '/compliance/terms-of-service' },
  { name: 'Business Associate Agreement', href: '/compliance/baa' },
  { name: 'Security Practices', href: '/compliance/security' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="bg-gradient-to-r from-teal to-mint rounded-lg w-10 h-10 flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="ml-3 text-xl font-bold text-navy font-playfair">Aethera</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <div className="relative group">
                <button className="text-gray hover:text-teal transition-colors">
                  Services
                </button>
                <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="grid grid-cols-2 gap-4 p-6">
                    {services.map((service) => (
                      <Link
                        key={service.name}
                        href={service.href}
                        className="text-gray hover:text-teal transition-colors text-sm"
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/specialties" className="text-gray hover:text-teal transition-colors">
                Specialties
              </Link>

              <Link href="/pricing" className="text-gray hover:text-teal transition-colors">
                Pricing
              </Link>

              <Link href="/about" className="text-gray hover:text-teal transition-colors">
                About
              </Link>

              <div className="relative group">
                <button className="text-gray hover:text-teal transition-colors">
                  Compliance
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="py-2">
                    {complianceItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 text-gray hover:bg-cream hover:text-teal transition-colors text-sm"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/blog" className="text-gray hover:text-teal transition-colors">
                Blog
              </Link>

              <Link href="/contact" className="text-gray hover:text-teal transition-colors">
                Contact
              </Link>
            </div>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/contact"
              className="bg-mint hover:bg-teal text-navy font-medium py-2 px-6 rounded-full transition-colors duration-300"
            >
              Free Consultation
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray hover:text-teal focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="pt-2 pb-3 space-y-1">
              {/* Services Dropdown */}
              <div className="space-y-1">
                <button className="w-full text-left text-gray hover:text-teal transition-colors py-2">
                  Services
                </button>
                <div className="pl-4 space-y-2">
                  {services.map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      className="block text-gray hover:text-teal transition-colors text-sm py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/specialties"
                className="block text-gray hover:text-teal transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Specialties
              </Link>

              <Link
                href="/pricing"
                className="block text-gray hover:text-teal transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>

              <Link
                href="/about"
                className="block text-gray hover:text-teal transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>

              {/* Compliance Dropdown */}
              <div className="space-y-1">
                <button className="w-full text-left text-gray hover:text-teal transition-colors py-2">
                  Compliance
                </button>
                <div className="pl-4 space-y-2">
                  {complianceItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block text-gray hover:text-teal transition-colors text-sm py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/blog"
                className="block text-gray hover:text-teal transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>

              <Link
                href="/contact"
                className="block text-gray hover:text-teal transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              <Link
                href="/contact"
                className="block bg-mint hover:bg-teal text-navy font-medium py-2 px-4 rounded-full transition-colors duration-300 text-center mt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Free Consultation
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}