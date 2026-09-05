import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Sparkles, ShieldCheck } from 'lucide-react';
import EnterpriseRcmLandingClient from '@/components/ui/EnterpriseRcmLandingClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Enterprise Revenue Cycle Management for Health Systems & MSOs | Aethera Healthcare',
  },
  description:
    'Multi-site RCM consolidation, central business office (CBO) optimization, and sub-25 day AR performance for health systems, MSOs, and large physician groups.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function EnterpriseRcmLandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Enterprise Revenue Cycle Management & CBO Consolidation',
    serviceType: 'Health System Revenue Cycle Management',
    provider: {
      '@type': 'Organization',
      name: 'Aethera Healthcare Solutions',
      url: 'https://aetherahealthcare.com',
    },
    description:
      'Turnkey enterprise revenue cycle management for multi-site health systems, MSOs, and hospital networks, compressing days in AR to under 25 days across all facilities.',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter antialiased selection:bg-teal selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Minimal Distraction Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link prefetch={false} href="/" className="flex items-center gap-3 group">
            <span className="text-2xl font-black font-jakarta text-white tracking-tight">
              AETHERA<span className="text-teal font-extrabold">.</span>
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal/10 text-teal border border-teal/20">
              Enterprise RCM &amp; MSO
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link prefetch={false}
              href="/schedule"
              className="hidden md:inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              <Calendar className="w-4 h-4 text-teal" />
              <span>Schedule Meeting</span>
            </Link>

            <a
              href="#rfp-form"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal hover:bg-teal/90 text-white text-xs font-bold transition shadow-sm hover:shadow-teal/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-mint" />
              <span>Submit Enterprise RFP</span>
            </a>
          </div>
        </div>
      </header>

      {/* Interactive Hero & Intake Section */}
      <EnterpriseRcmLandingClient />

      {/* Minimal Compliance Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal" />
            <span>Aethera Healthcare Solutions · Enterprise SOC 2 Aligned · Dedicated Health System Pods</span>
          </div>
          <div className="flex items-center gap-6">
            <Link prefetch={false} href="/privacy" className="hover:text-slate-200 transition">
              Privacy Policy
            </Link>
            <Link prefetch={false} href="/terms" className="hover:text-slate-200 transition">
              Terms of Service
            </Link>
            <Link prefetch={false} href="/contact" className="hover:text-slate-200 transition">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
