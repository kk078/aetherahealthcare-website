import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Building2, ShieldCheck } from 'lucide-react';
import FqhcRhcLandingClient from '@/components/ui/FqhcRhcLandingClient';

export const metadata: Metadata = {
  title: {
    absolute: 'FQHC & Rural Health Clinic RCM Services | PPS Rate & Wrap Recovery | Aethera',
  },
  description:
    'Comprehensive revenue cycle management for Federally Qualified Health Centers (FQHCs) and Rural Health Clinics (RHCs). Capture unbilled same-day behavioral health visits and eliminate Medicaid wrap delays.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function FqhcRhcBillingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'FQHC & Rural Health Clinic Revenue Cycle Management',
    serviceType: 'Community Health Center RCM & PPS Billing',
    provider: {
      '@type': 'Organization',
      name: 'Aethera Healthcare Solutions',
      url: 'https://aetherahealthcare.com',
    },
    description:
      'Specialized RCM for Section 330 FQHCs, Look-Alikes, and certified Rural Health Clinics. Optimizing PPS qualifying encounters, same-day mental health splits with Modifier 59/XE, and Medicaid supplemental wrap reconciliations.',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter antialiased selection:bg-emerald-500 selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Minimal Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link prefetch={false} href="/" className="flex items-center gap-3 group">
            <span className="text-2xl font-black font-jakarta text-white tracking-tight">
              AETHERA<span className="text-emerald-400 font-extrabold">.</span>
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
              FQHC &amp; RHC Suite
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link prefetch={false}
              href="/schedule"
              className="hidden md:inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Schedule Meeting</span>
            </Link>

            <a
              href="#audit-form"
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition shadow-md shadow-emerald-400/20"
            >
              Request 30-Day Audit
            </a>
          </div>
        </div>
      </header>

      {/* Interactive Main Body */}
      <main>
        <FqhcRhcLandingClient />
      </main>

      {/* Minimal Campaign Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex justify-center items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">Aethera Healthcare Solutions</span> · Dedicated Community Health RCM Infrastructure
          </div>
          <p className="max-w-xl mx-auto text-slate-400">
            Compliant with Section 330 Public Health Service Act, CMS Benefit Policy Manual Chapter 13, and Medicare Claims Processing Manual Chapter 9.
            HIPAA HITECH SOC-2 certified systems.
          </p>
          <div className="pt-2 text-slate-400">
            © {new Date().getFullYear()} Aethera Healthcare Solutions. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
