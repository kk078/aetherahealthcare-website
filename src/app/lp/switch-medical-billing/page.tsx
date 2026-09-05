import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Sparkles, ShieldCheck } from 'lucide-react';
import SwitchBillingLandingClient from '@/components/ui/SwitchBillingLandingClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Switch Medical Billing Companies With Zero Downtime | Aethera Healthcare Solutions',
  },
  description:
    'Switch medical billing services with zero cash flow disruption. Aethera guarantees parallel EDI/ERA cutover, active old AR recovery, and a free 50-claim shadow pilot.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function SwitchMedicalBillingLandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Medical Billing Company Transition & Cutover Services',
    serviceType: 'Healthcare Revenue Cycle Management Transition',
    provider: {
      '@type': 'Organization',
      name: 'Aethera Healthcare Solutions',
      url: 'https://aetherahealthcare.com',
      telephone: '+1-813-519-4640',
    },
    description:
      'Seamless parallel transition protocol for medical practices switching billing companies, eliminating cash flow stoppage and recovering legacy AR.',
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
              Healthcare Solutions
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <a
              href="tel:+18135194640"
              className="hidden md:inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              <Phone className="w-4 h-4 text-teal" />
              <span>(813) 519-4640</span>
            </a>

            <a
              href="#pilot-form"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal hover:bg-teal/90 text-white text-xs font-bold transition shadow-sm hover:shadow-teal/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-mint" />
              <span>Get Custom Cutover Plan</span>
            </a>
          </div>
        </div>
      </header>

      {/* Interactive Hero & Risk Engine */}
      <SwitchBillingLandingClient />

      {/* Minimal Compliance Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal" />
            <span>Aethera Healthcare Solutions · HIPAA Compliant · SOC 2 Type II Partner Protocols</span>
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
