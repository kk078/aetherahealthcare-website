import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Sparkles, ShieldCheck } from 'lucide-react';
import MedicareAdvantageLandingClient from '@/components/ui/MedicareAdvantageLandingClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Medicare Advantage & D-SNP Medical Billing Services | Aethera Healthcare Solutions',
  },
  description:
    'Dedicated Medicare Advantage (MA) and Dual-Eligible Special Needs Plan (D-SNP) revenue cycle management. Eliminate secondary crossover drops, ensure QMB balance billing compliance, and defend CMS-HCC v28 RAF scores.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function MedicareAdvantageLandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Medicare Advantage & D-SNP Revenue Cycle Management',
    serviceType: 'Geriatric & Dual-Eligible Medical Billing',
    provider: {
      '@type': 'Organization',
      name: 'Aethera Healthcare Solutions',
      url: 'https://aetherahealthcare.com',
    },
    description:
      'Specialized RCM infrastructure for Medicare Advantage and D-SNP populations, featuring automatic Medicaid secondary crossover claims and prospective v28 MEAT audits.',
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
              Medicare Advantage &amp; D-SNP Pod
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-teal hover:bg-mint text-navy transition shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free 50-Claim Audit</span>
            </a>
          </div>
        </div>
      </header>

      {/* Interactive Main Component */}
      <main id="pilot-form">
        <MedicareAdvantageLandingClient />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal" />
            <span>Dedicated Sovereign Infrastructure · Exclusively Directed by Kiran</span>
          </div>
          <p>
            &copy; {new Date().getFullYear()} Aethera Healthcare Solutions. All rights reserved. Strict HIPAA HITECH
            Compliance. All inquiries route directly to practice leadership.
          </p>
        </div>
      </footer>
    </div>
  );
}
