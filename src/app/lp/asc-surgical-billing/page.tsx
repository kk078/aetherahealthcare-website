import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Scissors, ShieldCheck } from 'lucide-react';
import AscSurgicalLandingClient from '@/components/ui/AscSurgicalLandingClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Ambulatory Surgery Center (ASC) Revenue Cycle Management & Billing | Aethera Healthcare',
  },
  description:
    'Specialized ASC billing service for surgery centers. Recapture 100% of high-cost implant carve-outs, master UB-04 & CMS-1500 dual billing, and compress surgical A/R to under 22 days.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function AscSurgicalBillingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Ambulatory Surgery Center (ASC) Revenue Cycle Management',
    serviceType: 'Outpatient Surgical Billing and Implant Carve-Out Recapture',
    provider: {
      '@type': 'Organization',
      name: 'Aethera Healthcare Solutions',
      url: 'https://aetherahealthcare.com',
    },
    description:
      'Turnkey revenue cycle management and billing services engineered specifically for Ambulatory Surgery Centers (ASCs) and Office-Based Surgical Suites, recovering implant carve-outs and eliminating MPPR underpayments.',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter antialiased selection:bg-cyan-500 selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Minimal Distraction Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link prefetch={false} href="/" className="flex items-center gap-3 group">
            <span className="text-2xl font-black font-jakarta text-white tracking-tight">
              AETHERA<span className="text-cyan-400 font-extrabold">.</span>
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">
              ASC Surgical Billing Suite
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link prefetch={false}
              href="/schedule"
              className="hidden md:inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Schedule Meeting</span>
            </Link>

            <a
              href="#asc-pilot-form"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-500/20"
            >
              Request 30-Case Audit
            </a>
          </div>
        </div>
      </header>

      {/* Client Component with Calculator and Intake */}
      <main>
        <AscSurgicalLandingClient />
      </main>

      {/* Trust Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Aethera Healthcare Solutions &copy; {new Date().getFullYear()}. All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <Link prefetch={false} href="/privacy" className="hover:text-slate-400 transition">
              Privacy Policy
            </Link>
            <Link prefetch={false} href="/terms" className="hover:text-slate-400 transition">
              Terms of Service
            </Link>
            <Link prefetch={false} href="/security" className="hover:text-slate-400 transition">
              HIPAA Safeguards
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
