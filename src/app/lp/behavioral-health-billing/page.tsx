import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Brain, ShieldCheck } from 'lucide-react';
import BehavioralHealthLandingClient from '@/components/ui/BehavioralHealthLandingClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Behavioral Health & Addiction Treatment RCM Services | Aethera Healthcare',
  },
  description:
    'Dedicated behavioral health billing, UR peer reviews, and SUD revenue cycle management for residential detox, PHP, IOP, and outpatient mental health clinics.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function BehavioralHealthBillingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Behavioral Health & Addiction Treatment Revenue Cycle Management',
    serviceType: 'Substance Use Disorder and Mental Health RCM',
    provider: {
      '@type': 'Organization',
      name: 'Aethera Healthcare Solutions',
      url: 'https://aetherahealthcare.com',
      telephone: '+1-813-519-4640',
    },
    description:
      'Specialized revenue cycle management for residential addiction treatment, detox, partial hospitalization (PHP), and intensive outpatient (IOP) programs with ASAM criteria utilization review and MHPAEA parity enforcement.',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter antialiased selection:bg-teal-500 selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Minimal Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link prefetch={false} href="/" className="flex items-center gap-3 group">
            <span className="text-2xl font-black font-jakarta text-white tracking-tight">
              AETHERA<span className="text-teal-400 font-extrabold">.</span>
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-950/70 text-teal-300 border border-teal-500/30">
              Behavioral Health &amp; SUD Suite
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <a
              href="tel:+18135194640"
              className="hidden md:inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              <Phone className="w-4 h-4 text-teal-400" />
              <span>(813) 519-4640</span>
            </a>

            <a
              href="#behavioral-pilot-form"
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-500/20"
            >
              Request 30-Day Audit
            </a>
          </div>
        </div>
      </header>

      {/* Client Component */}
      <main>
        <BehavioralHealthLandingClient />
      </main>

      {/* Trust Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
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
              42 CFR Part 2 Safeguards
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
