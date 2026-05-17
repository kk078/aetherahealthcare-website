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

const specialtyServices = [
  { name: 'Cardiology Billing', href: '/services/cardiology-billing' },
  { name: 'Orthopedic Billing', href: '/services/orthopedic-billing' },
  { name: 'Dermatology Billing', href: '/services/dermatology-billing' },
  { name: 'Psychiatry Billing', href: '/services/psychiatry-billing' },
  { name: 'Family Medicine Billing', href: '/services/family-medicine-billing' },
];

const whyAethera = [
  { name: 'Case Studies', href: '/case-studies', desc: 'Real results from real practices' },
  { name: 'Provider Portal', href: '/portal', desc: '24/7 real-time billing dashboard' },
  { name: 'Payer Network', href: '/payers', desc: '900+ insurers we work with' },
  { name: 'EHR Integrations', href: '/integrations', desc: '50+ systems, zero disruption' },
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
            <Link href="/" className="flex items-center">
              <div className="bg-gradient-to-r from-teal to-mint rounded-lg w-10 h-10 flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="ml-3 text-xl font-bold text-navy font-playfair">Aethera</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block">
            <div className="ml-6 flex items-center space-x-6">

              {/* Services Dropdown */}
              <div className="relative group">
                <button className="text-gray hover:text-teal transition-colors text-sm font-medium">
                  Services ▾
                </button>
                <div className="absolute left-0 mt-2 w-[520px] bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray/10">
                  <div className="p-5">
                    <p className="text-xs font-bold text-gray uppercase tracking-widest mb-3">All RCM Services</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
                      {services.map((service) => (
                        <Link key={service.name} href={service.href} className="text-gray hover:text-teal transition-colors text-sm py-0.5">
                          {service.name}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray/10 pt-3 mt-2">
                      <p className="text-xs font-bold text-gray uppercase tracking-widest mb-2">By Specialty</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {specialtyServices.map((s) => (
                          <Link key={s.name} href={s.href} className="text-teal hover:text-navy transition-colors text-sm py-0.5 font-medium">
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Aethera Dropdown */}
              <div className="relative group">
                <button className="text-gray hover:text-teal transition-colors text-sm font-medium">
                  Why Aethera ▾
                </button>
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray/10">
                  <div className="p-4 space-y-1">
                    {whyAethera.map((item) => (
                      <Link key={item.name} href={item.href} className="flex flex-col px-3 py-2.5 rounded-lg hover:bg-cream transition-colors">
                        <span className="text-sm font-semibold text-navy">{item.name}</span>
                        <span className="text-xs text-gray mt-0.5">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/specialties" className="text-gray hover:text-teal transition-colors text-sm font-medium">
                Specialties
              </Link>

              <Link href="/pricing" className="text-gray hover:text-teal transition-colors text-sm font-medium">
                Pricing
              </Link>

              <Link href="/about" className="text-gray hover:text-teal transition-colors text-sm font-medium">
                About
              </Link>

              <Link href="/blog" className="text-gray hover:text-teal transition-colors text-sm font-medium">
                Blog
              </Link>

              <Link href="/contact" className="text-gray hover:text-teal transition-colors text-sm font-medium">
                Contact
              </Link>
            </div>
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/free-assessment"
              className="bg-mint hover:bg-teal text-navy font-bold py-2 px-5 rounded-full transition-colors duration-300 text-sm"
            >
              Free Assessment
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray hover:text-teal focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="px-4 pt-3 pb-5 space-y-1">

            <p className="text-xs font-bold text-gray uppercase tracking-widest py-2">Services</p>
            <div className="pl-2 grid grid-cols-2 gap-1 mb-2">
              {services.map((service) => (
                <Link key={service.name} href={service.href} className="text-gray hover:text-teal transition-colors text-sm py-1" onClick={() => setIsMenuOpen(false)}>
                  {service.name}
                </Link>
              ))}
            </div>

            <p className="text-xs font-bold text-teal uppercase tracking-widest pt-2 pb-1">By Specialty</p>
            <div className="pl-2 space-y-1 mb-2">
              {specialtyServices.map((s) => (
                <Link key={s.name} href={s.href} className="block text-teal hover:text-navy transition-colors text-sm py-1 font-medium" onClick={() => setIsMenuOpen(false)}>
                  {s.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-gray/10 pt-2">
              <p className="text-xs font-bold text-gray uppercase tracking-widest py-2">Why Aethera</p>
              <div className="pl-2 space-y-1">
                {whyAethera.map((item) => (
                  <Link key={item.name} href={item.href} className="block text-gray hover:text-teal transition-colors text-sm py-1" onClick={() => setIsMenuOpen(false)}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-gray/10 pt-3 space-y-2">
              <Link href="/specialties" className="block text-gray hover:text-teal transition-colors text-sm py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                Specialties
              </Link>
              <Link href="/pricing" className="block text-gray hover:text-teal transition-colors text-sm py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                Pricing
              </Link>
              <Link href="/about" className="block text-gray hover:text-teal transition-colors text-sm py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              <Link href="/blog" className="block text-gray hover:text-teal transition-colors text-sm py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                Blog
              </Link>
              <Link href="/contact" className="block text-gray hover:text-teal transition-colors text-sm py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              <Link
                href="/free-assessment"
                className="block bg-mint hover:bg-teal text-navy font-bold py-2 px-5 rounded-full transition-colors duration-300 text-sm text-center mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Free Assessment
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
