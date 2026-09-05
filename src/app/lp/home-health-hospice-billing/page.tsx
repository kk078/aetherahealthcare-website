import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, HeartHandshake, ShieldCheck } from 'lucide-react';
import HomeHealthLandingClient from '@/components/ui/HomeHealthLandingClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Home Health & Hospice RCM Services | PDGM & LUPA Defense | Aethera Healthcare',
  },
  description:
    'Full-service revenue cycle management for home health agencies and hospice organizations. Prevent PDGM LUPA cuts, late NOA penalties, and aggregate cap recoupments.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomeHealthHospiceBillingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Home Health & Hospice Revenue Cycle Management',
    serviceType: 'Post-Acute and Palliative Care RCM',
    provider: {
      '@type': 'Organization',
      name: 'Aethera Healthcare Solutions',
      url: 'https://aetherahealthcare.com',
    },
    description:
      'Specialized RCM for Medicare-certified home health agencies and hospices. Eliminating PDGM LUPA payment adjustments, ensuring 5-day Notice of Admission compliance, and auditing statutory aggregate caps.',
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
              Home Health &amp; Hospice Suite
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
              href="#home-health-pilot-form"
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition shadow-md shadow-emerald-400/20"
            >
              Request 30-Day Audit
            </a>
          </div>
        </div>
      </header>

      {/* Interactive Main Body */}
      <main>
        <HomeHealthLandingClient />
      </main>

      {/* Minimal Campaign Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex justify-center items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">Aethera Healthcare Solutions</span> · Dedicated Post-Acute Billing Infrastructure
          </div>
          <p className="max-w-xl mx-auto text-slate-400">
            Compliant with CMS Medicare Claims Processing Manual Chapter 10 (Home Health) and Chapter 11 (Hospice).
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
