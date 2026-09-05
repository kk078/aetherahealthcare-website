import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Sparkles, ShieldCheck } from 'lucide-react';
import SoloPracticeLandingClient from '@/components/ui/SoloPracticeLandingClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Medical Billing for Solo & Small Practices (1–5 Providers) | Aethera Healthcare Solutions',
  },
  description:
    'Tailored medical billing and RCM services built for independent solo doctors and 1–5 provider clinics. 4.5% all-inclusive rate, dedicated US pod, zero biller turnover.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function SoloPracticeLandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Medical Billing for Independent & Solo Practices',
    serviceType: 'Physician Revenue Cycle Management',
    provider: {
      '@type': 'Organization',
      name: 'Aethera Healthcare Solutions',
      url: 'https://aetherahealthcare.com',
    },
    description:
      'Turnkey RCM and medical billing services designed for independent 1–5 provider clinics, eliminating biller turnover and reducing overhead to 4.5%.',
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
              Small Practice Pods
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
              href="#pilot-form"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal hover:bg-teal/90 text-white text-xs font-bold transition shadow-sm hover:shadow-teal/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-mint" />
              <span>Get Small Clinic Audit</span>
            </a>
          </div>
        </div>
      </header>

      {/* Interactive Hero & Intake Section */}
      <SoloPracticeLandingClient />

      {/* Minimal Compliance Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal" />
            <span>Aethera Healthcare Solutions · HIPAA Compliant · Month-to-Month Contracts</span>
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
