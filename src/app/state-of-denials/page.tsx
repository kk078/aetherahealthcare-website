import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import DenialsReport from '@/components/ui/DenialsReport';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import { INDUSTRY_HEADLINES } from '@/lib/denialBenchmarks';
import { BarChart3, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: { absolute: 'The State of Medical Billing Denials 2026 — Benchmark Report by Specialty | Aethera Healthcare Solutions' },
  description:
    'A free benchmark report on medical billing denials by specialty: typical denial rates, clean-claim rates, days-in-A/R, top denial reasons (CARC), and how much is preventable. Compare your practice.',
  alternates: { canonical: 'https://aetherahealthcare.com/state-of-denials' },
};

export default function StateOfDenialsPage() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Report',
    name: 'The State of Medical Billing Denials — Benchmark Report by Specialty',
    about: 'Medical billing claim denial benchmarks by specialty',
    datePublished: '2026-06-24',
    publisher: { '@type': 'Organization', name: 'Aethera Healthcare Solutions', url: 'https://aetherahealthcare.com' },
    url: 'https://aetherahealthcare.com/state-of-denials',
  };

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      <RcmHeroBand
        eyebrow="Benchmark Report · 2026"
        title="The State of Medical Billing Denials"
        subtitle={`How denials really break down by specialty — and how your practice compares. Around ${INDUSTRY_HEADLINES.preventableShare} of denials are preventable, yet roughly ${INDUSTRY_HEADLINES.neverReworkedShare} are never reworked.`}
        primary={{ href: '/free-assessment', label: 'Get a Free Assessment' }}
        chips={['By specialty', 'Preventable vs. worked', 'Free report']}
      />

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Headline strip */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-navy text-white rounded-2xl p-5">
              <p className="text-xs text-gray uppercase tracking-widest">Avg. initial denial rate</p>
              <p className="text-3xl font-bold text-mint mt-1">{INDUSTRY_HEADLINES.avgInitialDenialRate}</p>
            </div>
            <div className="bg-navy text-white rounded-2xl p-5">
              <p className="text-xs text-gray uppercase tracking-widest">Preventable</p>
              <p className="text-3xl font-bold text-mint mt-1">{INDUSTRY_HEADLINES.preventableShare}</p>
            </div>
            <div className="bg-navy text-white rounded-2xl p-5">
              <p className="text-xs text-gray uppercase tracking-widest">Rework cost / claim</p>
              <p className="text-3xl font-bold text-mint mt-1">{INDUSTRY_HEADLINES.reworkCostPerClaim}</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-navy mb-2">Pick your specialty</h2>
          <p className="text-gray mb-6">See the benchmark denial mix for your specialty, then unlock the full breakdown.</p>

          <DenialsReport />

          {/* Methodology */}
          <div className="flex items-start gap-3 bg-white border border-gray/15 rounded-xl p-4 mt-10">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-gray leading-relaxed">
              <strong className="text-navy">Methodology.</strong> Figures are directional industry benchmark ranges compiled from
              public RCM/MGMA/AAFP/AAPC commentary and Aethera&apos;s denial-prevention knowledge base. They are typical ranges for
              comparison, not proprietary or guaranteed figures. Denial-reason shares are approximate and vary by payer mix, region,
              and contract. For your actual numbers, request a free assessment.
            </p>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Footer />
    </div>
  );
}
