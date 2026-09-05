import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  CheckCircle2,
  Phone,
  ArrowRight,
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle,
  FileCheck,
  Building2,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react';
import DenialPilotLandingClient from '@/components/ui/DenialPilotLandingClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Free 50-Claim Denial Recovery Pilot | Aethera Healthcare Solutions',
  },
  description:
    'Test Aethera AAPC-certified revenue cycle teams on 50 of your active denials or pending claims. 14-day zero-risk trial with guaranteed under-48-hour findings. No credit card required.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function DenialRecoveryLandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SpecialAnnouncement',
    name: 'Aethera Free 50-Claim Denial Recovery Pilot',
    text: 'Aethera Healthcare Solutions is offering a 14-day zero-risk 50-claim revenue cycle audit pilot for U.S. medical practices and surgical centers.',
    url: 'https://aetherahealthcare.com/lp/denial-recovery-pilot',
    provider: {
      '@type': 'Organization',
      name: 'Aethera Healthcare Solutions',
      url: 'https://aetherahealthcare.com',
      telephone: '+1-813-519-4640',
    },
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
              <span>Claim Free 50-Claim Pilot</span>
            </a>
          </div>
        </div>
      </header>

      {/* Interactive Hero & Intake Section */}
      <DenialPilotLandingClient />

      {/* Trust & Comparison Section */}
      <section className="py-16 sm:py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-jakarta text-white tracking-tight">
              Why Traditional Billing Models Fail Modern Practices
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
              With payer clearinghouses using algorithmic denial sweeps, manual billing departments and generic offshore BPOs can&apos;t keep up. Compare your current setup:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Model 1: In-House Billing */}
            <div className="bg-slate-950/60 rounded-3xl p-8 border border-slate-800 space-y-5">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Option 1</div>
              <h3 className="text-xl font-bold font-jakarta text-white">In-House Staff</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Single points of failure, staff turnover, expensive salaries ($65K+ plus benefits), and backlog delays during sick leave or vacations.
              </p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2 text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> High turnover & continuous retraining
                </li>
                <li className="flex items-center gap-2 text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> Fixed overhead regardless of collections
                </li>
                <li className="flex items-center gap-2 text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> Limited payer-specific denial appeal expertise
                </li>
              </ul>
            </div>

            {/* Model 2: Offshore BPO */}
            <div className="bg-slate-950/60 rounded-3xl p-8 border border-slate-800 space-y-5">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Option 2</div>
              <h3 className="text-xl font-bold font-jakarta text-white">Generic Offshore BPOs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                12-hour time zone lag, rigid ticketing portals, mechanical re-submissions without clinical nuance, and aggressive write-offs on aged AR.
              </p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> Impersonal communication & tickets
                </li>
                <li className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> Inability to handle complex appeals or P2P
                </li>
                <li className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> Blind re-filing triggering duplicate CARC 18s
                </li>
              </ul>
            </div>

            {/* Model 3: Aethera Dedicated Pods */}
            <div className="bg-gradient-to-b from-teal/20 via-slate-900 to-slate-950 rounded-3xl p-8 border-2 border-teal/40 space-y-5 relative shadow-xl">
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-teal text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                Recommended
              </div>
              <div className="text-teal text-xs font-bold uppercase tracking-wider">The Aethera Model</div>
              <h3 className="text-xl font-bold font-jakarta text-white">Dedicated Specialty Pods</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Senior AAPC-certified coders specialized exclusively in your clinical field. Real-time direct clearinghouse scrubbing, 21-day average AR, and performance-aligned fees.
              </p>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-center gap-2 text-mint font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> 98.6% First-Pass Clean Claim Rate
                </li>
                <li className="flex items-center gap-2 text-mint font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Sub-24 Hour Denial Turnaround
                </li>
                <li className="flex items-center gap-2 text-mint font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Free 50-Claim Risk-Free Pilot
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Guarantee Banner */}
      <footer className="py-12 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-teal" /> HIPAA BAA Provided</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-teal" /> 256-Bit TLS In-Memory Security</span>
            <span className="flex items-center gap-1.5"><FileCheck className="w-4 h-4 text-teal" /> AAPC-Certified Coders</span>
          </div>
          <p>© {new Date().getFullYear()} Aethera Healthcare Solutions. All rights reserved. Direct inquiries: kirkmar078@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}
