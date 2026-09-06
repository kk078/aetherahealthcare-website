'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

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
  { name: 'Pharmacy Billing', href: '/services/pharmacy-billing' },
  { name: 'Dental Billing', href: '/services/dental-billing' },
  { name: "Workers' Comp Billing", href: '/services/workers-compensation-billing' },
];

const whyAethera = [
  { name: 'About Us', href: '/about', desc: 'Our story, founder adjudication roots & team' },
  { name: 'Case Studies', href: '/case-studies', desc: 'Results our process is built to deliver' },
  { name: 'Security & Compliance', href: '/compliance/security', desc: 'How we protect PHI, offshore and in the US' },
  { name: 'Compare Options', href: '/compare', desc: 'Outsourced vs. in-house, and how to choose' },
  { name: 'Blog & Articles', href: '/blog', desc: 'Healthcare RCM insights & payer guides' },
  { name: 'RCM & Billing Glossary', href: '/glossary', desc: 'Authoritative dictionary of EDI, NCCI, and denial terms' },
  { name: 'State of Denials Report', href: '/state-of-denials', desc: 'Free benchmark report by specialty' },
  { name: 'Guides & Playbooks', href: '/decks', desc: 'Specialty one-pagers & revenue playbooks' },
];

const solutions = [
  { name: 'For Billing Companies', href: '/for-billing-companies', desc: 'White-label back-office billing partnership' },
  { name: 'Payer Services', href: '/payer-services', desc: 'Contracting, credentialing & fee schedules' },
  { name: 'EHR Integrations', href: '/integrations', desc: '50+ certified EHR & PM platforms supported' },
  { name: 'Payer Network', href: '/payers', desc: '900+ commercial, Medicare & Medicaid plans' },
  { name: 'Billing by Specialty', href: '/specialties', desc: 'Tailored workflows for 15+ medical fields' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lockedDropdown, setLockedDropdown] = useState<'services' | 'solutions' | 'why' | null>(null);
  const [hoverDropdown, setHoverDropdown] = useState<'services' | 'solutions' | 'why' | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  const activeDropdown = lockedDropdown || hoverDropdown;

  const openHover = (name: 'services' | 'solutions' | 'why') => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (!lockedDropdown) {
      setHoverDropdown(name);
    }
  };

  const closeHover = () => {
    // If the user clicked to open, NEVER close on mouseleave!
    if (lockedDropdown) return;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setHoverDropdown(null);
    }, 600);
  };

  const toggleClick = (name: 'services' | 'solutions' | 'why') => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHoverDropdown(null);
    setLockedDropdown((prev) => (prev === name ? null : name));
  };

  const closeAll = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setLockedDropdown(null);
    setHoverDropdown(null);
  };

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | PointerEvent) => {
      const target = e.target as HTMLElement | null;
      // Close dropdown if click is outside any nav dropdown container
      if (!target?.closest?.('[data-nav-dropdown]')) {
        closeAll();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAll();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-8 w-full ${
        isMenuOpen ? 'z-[60]' : 'z-40'
      } transition-all duration-300 ${
        isScrolled
          ? 'glass-nav border-b border-[rgba(0,0,0,0.1)] shadow-[0_1px_0_rgba(0,0,0,0.08)]'
          : 'bg-white border-b border-[rgba(0,0,0,0.06)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link prefetch={false} href="/" className="flex items-center">
              <Image
                src="/brand/logo-full.svg"
                alt="Aethera Healthcare"
                width={160}
                height={48}
                className="h-9 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav ref={navRef} className="hidden lg:block">
            <div className="ml-4 xl:ml-6 flex items-center space-x-4 xl:space-x-6">

              {/* Services Dropdown */}
              <div
                data-nav-dropdown="services"
                className="relative py-2"
                onMouseEnter={() => openHover('services')}
                onMouseLeave={closeHover}
              >
                <button
                  type="button"
                  onClick={() => toggleClick('services')}
                  aria-expanded={activeDropdown === 'services'}
                  aria-haspopup="true"
                  className={`inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium transition-colors cursor-pointer py-1 px-1.5 rounded-md ${
                    activeDropdown === 'services'
                      ? 'text-[#003087] font-semibold bg-[#003087]/5'
                      : 'text-[#334155] hover:text-[#003087]'
                  }`}
                >
                  Services
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === 'services' ? 'rotate-180 text-[#003087]' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {/* Dropdown Menu Container with top padding for seamless hover bridge */}
                <div
                  className={`absolute left-0 top-full pt-1.5 w-[520px] z-50 transition-all duration-200 before:absolute before:-top-4 before:left-0 before:w-full before:h-6 before:content-[''] ${
                    activeDropdown === 'services'
                      ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                      : 'opacity-0 invisible -translate-y-1 pointer-events-none'
                  }`}
                  onMouseEnter={() => openHover('services')}
                  onMouseLeave={closeHover}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLockedDropdown('services');
                  }}
                >
                  <div className="p-5 bg-white rounded-xl shadow-2xl border border-[#003087]/15">
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3">All RCM Services</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
                      {services.map((service) => (
                        <Link
                          prefetch={false}
                          key={service.name}
                          href={service.href}
                          onClick={closeAll}
                          className="text-[#334155] hover:text-[#003087] hover:bg-[#F0F4FB] px-2 py-1 rounded transition-colors text-sm"
                        >
                          {service.name}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-[#003087]/10 pt-3 mt-2">
                      <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">By Specialty</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {specialtyServices.map((s) => (
                          <Link
                            prefetch={false}
                            key={s.name}
                            href={s.href}
                            onClick={closeAll}
                            className="text-[#003087] hover:text-[#001A52] hover:bg-[#F0F4FB] px-2 py-1 rounded transition-colors text-sm font-medium"
                          >
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solutions Dropdown */}
              <div
                data-nav-dropdown="solutions"
                className="relative py-2"
                onMouseEnter={() => openHover('solutions')}
                onMouseLeave={closeHover}
              >
                <button
                  type="button"
                  onClick={() => toggleClick('solutions')}
                  aria-expanded={activeDropdown === 'solutions'}
                  aria-haspopup="true"
                  className={`inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium transition-colors cursor-pointer py-1 px-1.5 rounded-md ${
                    activeDropdown === 'solutions'
                      ? 'text-[#003087] font-semibold bg-[#003087]/5'
                      : 'text-[#334155] hover:text-[#003087]'
                  }`}
                >
                  Solutions
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === 'solutions' ? 'rotate-180 text-[#003087]' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <div
                  className={`absolute left-0 top-full pt-1.5 w-80 z-50 transition-all duration-200 before:absolute before:-top-4 before:left-0 before:w-full before:h-6 before:content-[''] ${
                    activeDropdown === 'solutions'
                      ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                      : 'opacity-0 invisible -translate-y-1 pointer-events-none'
                  }`}
                  onMouseEnter={() => openHover('solutions')}
                  onMouseLeave={closeHover}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLockedDropdown('solutions');
                  }}
                >
                  <div className="p-4 space-y-1 bg-white rounded-xl shadow-2xl border border-[#003087]/15">
                    {solutions.map((item) => (
                      <Link
                        prefetch={false}
                        key={item.name}
                        href={item.href}
                        onClick={closeAll}
                        className="flex flex-col px-3 py-2.5 rounded-lg hover:bg-[#F0F4FB] transition-colors"
                      >
                        <span className="text-sm font-semibold text-[#001A52]">{item.name}</span>
                        <span className="text-xs text-[#64748B] mt-0.5">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link prefetch={false} href="/tools" className="text-[#334155] hover:text-[#003087] transition-colors text-sm font-medium whitespace-nowrap">
                Free Tools
              </Link>
              <Link prefetch={false} href="/pricing" className="text-[#334155] hover:text-[#003087] transition-colors text-sm font-medium whitespace-nowrap">
                Pricing
              </Link>

              {/* Why Aethera Dropdown */}
              <div
                data-nav-dropdown="why"
                className="relative py-2"
                onMouseEnter={() => openHover('why')}
                onMouseLeave={closeHover}
              >
                <button
                  type="button"
                  onClick={() => toggleClick('why')}
                  aria-expanded={activeDropdown === 'why'}
                  aria-haspopup="true"
                  className={`inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium transition-colors cursor-pointer py-1 px-1.5 rounded-md ${
                    activeDropdown === 'why'
                      ? 'text-[#003087] font-semibold bg-[#003087]/5'
                      : 'text-[#334155] hover:text-[#003087]'
                  }`}
                >
                  Why Aethera
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === 'why' ? 'rotate-180 text-[#003087]' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <div
                  className={`absolute left-0 top-full pt-1.5 w-80 z-50 transition-all duration-200 before:absolute before:-top-4 before:left-0 before:w-full before:h-6 before:content-[''] ${
                    activeDropdown === 'why'
                      ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                      : 'opacity-0 invisible -translate-y-1 pointer-events-none'
                  }`}
                  onMouseEnter={() => openHover('why')}
                  onMouseLeave={closeHover}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLockedDropdown('why');
                  }}
                >
                  <div className="p-4 space-y-1 bg-white rounded-xl shadow-2xl border border-[#003087]/15">
                    {whyAethera.map((item) => (
                      <Link
                        prefetch={false}
                        key={item.name}
                        href={item.href}
                        onClick={closeAll}
                        className="flex flex-col px-3 py-2.5 rounded-lg hover:bg-[#F0F4FB] transition-colors"
                      >
                        <span className="text-sm font-semibold text-[#001A52]">{item.name}</span>
                        <span className="text-xs text-[#64748B] mt-0.5">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link prefetch={false} href="/contact" className="text-[#334155] hover:text-[#003087] transition-colors text-sm font-medium whitespace-nowrap">
                Contact
              </Link>
            </div>
          </nav>

          {/* Desktop Search + CTA Buttons */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Desktop Command Palette Trigger */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
              className="hidden xl:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50/90 hover:bg-white hover:border-[#003087]/40 text-xs text-slate-500 hover:text-[#003087] transition-all shadow-xs mr-1"
              aria-label="Search payers, denial codes, and tools (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-[13px]">Search payers, codes, tools…</span>
              <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white rounded border border-slate-200 shadow-xs">
                <span>⌘</span>K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
              className="hidden lg:inline-flex xl:hidden p-2 rounded-full text-[#334155] hover:text-[#003087] hover:bg-slate-100 transition-colors"
              aria-label="Search payers, denial codes, and tools (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>

            <ThemeToggle variant="pill" className="hidden xl:inline-flex" />
            <ThemeToggle variant="compact" className="hidden lg:inline-flex xl:hidden" />

            <Link prefetch={false}
              href="/schedule"
              className="text-[#1d1d1f] hover:text-[#003087] font-medium py-2 px-3 xl:px-4 rounded-full text-sm transition-colors duration-200 whitespace-nowrap"
            >
              Schedule Meeting
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-free-pilot-modal'))}
              className="bg-[#003087] hover:bg-[#001A52] text-white font-semibold py-2 px-4 xl:px-5 rounded-full transition-all duration-200 text-sm shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
            >
              Start Free Pilot
            </button>
          </div>

          {/* Mobile search + theme + menu button */}
          <div className="lg:hidden flex items-center gap-1">
            <ThemeToggle variant="compact" />
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
              className="p-2 text-[#334155] hover:text-[#003087] hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
              aria-label="Search payers, codes, and tools"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#334155] hover:text-[#003087] p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white shadow-2xl h-[calc(100vh-6rem)] overflow-y-auto border-t border-[#003087]/10">
          <div className="px-4 pt-4 pb-8 space-y-4">
            {/* Mobile Quick Search Bar */}
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                window.dispatchEvent(new CustomEvent('open-command-palette'));
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-sm text-slate-600 font-medium"
              aria-label="Search payers, codes, and tools"
            >
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[#003087]" />
                <span>Search payers, codes &amp; tools…</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">⌘K</span>
            </button>

            {/* Mobile Low-Glare Mode Switcher */}
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="font-medium">Theme Appearance</span>
              <ThemeToggle variant="pill" />
            </div>

            {/* Quick Action CTAs */}
            <div className="grid grid-cols-2 gap-2 pt-1 pb-3 border-b border-slate-100">
              <Link prefetch={false}
                href="/schedule"
                className="flex items-center justify-center border-2 border-[#003087] text-[#003087] font-semibold py-2.5 px-3 rounded-xl text-sm text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Schedule Meeting
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('open-free-pilot-modal'));
                }}
                className="flex items-center justify-center bg-[#003087] hover:bg-[#001A52] text-white font-bold py-2.5 px-3 rounded-xl text-sm text-center shadow-sm cursor-pointer"
              >
                Start Free Pilot
              </button>
            </div>

            {/* Services */}
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">RCM Services</p>
              <div className="grid grid-cols-2 gap-1">
                {services.map((service) => (
                  <Link
                    prefetch={false}
                    key={service.name}
                    href={service.href}
                    className="text-[#334155] hover:text-[#003087] hover:bg-slate-50 transition-colors text-sm py-2 px-2.5 rounded-lg flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Solutions & Platform */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">Solutions &amp; Platform</p>
              <div className="space-y-1">
                {solutions.map((item) => (
                  <Link
                    prefetch={false}
                    key={item.name}
                    href={item.href}
                    className="text-[#334155] hover:text-[#003087] hover:bg-slate-50 transition-colors text-sm py-2 px-2.5 rounded-lg flex flex-col"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="font-medium text-navy">{item.name}</span>
                    <span className="text-xs text-slate-500">{item.desc}</span>
                  </Link>
                ))}
                <Link
                  prefetch={false}
                  href="/tools"
                  className="text-navy hover:text-[#003087] hover:bg-slate-50 transition-colors text-sm py-2 px-2.5 rounded-lg flex items-center font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Free Tools &amp; Denial Lookup
                </Link>
                <Link
                  prefetch={false}
                  href="/pricing"
                  className="text-navy hover:text-[#003087] hover:bg-slate-50 transition-colors text-sm py-2 px-2.5 rounded-lg flex items-center font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing Plans &amp; ROI
                </Link>
              </div>
            </div>

            {/* Company & Knowledge */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2">Why Aethera &amp; About</p>
              <div className="space-y-1">
                {whyAethera.map((item) => (
                  <Link
                    prefetch={false}
                    key={item.name}
                    href={item.href}
                    className="text-[#334155] hover:text-[#003087] hover:bg-slate-50 transition-colors text-sm py-2 px-2.5 rounded-lg flex items-center justify-between"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{item.name}</span>
                    <span className="text-xs text-slate-400">→</span>
                  </Link>
                ))}
                <Link
                  prefetch={false}
                  href="/contact"
                  className="text-[#003087] hover:bg-slate-50 transition-colors text-sm py-2.5 px-2.5 rounded-lg flex items-center font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact Our Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
