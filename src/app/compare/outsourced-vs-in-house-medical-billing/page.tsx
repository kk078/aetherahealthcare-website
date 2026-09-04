import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import { Check, X, ArrowRight } from 'lucide-react';

export const metadata = {
  title: { absolute: 'Outsourced vs. In-House Medical Billing: A Practical Comparison | Aethera Healthcare Solutions' },
  description:
    'Outsourced vs. in-house medical billing compared on cost, collections, staffing risk, compliance, and control — with a clear framework for deciding which model fits your practice.',
  alternates: { canonical: 'https://aetherahealthcare.com/compare/outsourced-vs-in-house-medical-billing' },
};

const rows: { factor: string; inhouse: string; outsourced: string; edge: 'in' | 'out' | 'even' }[] = [
  { factor: 'Cost structure', inhouse: 'Fixed salaries, benefits, software, and overhead regardless of volume', outsourced: 'Variable — typically a % of collections, so cost scales with revenue', edge: 'out' },
  { factor: 'Collections / clean-claim rate', inhouse: 'Depends on the skill and bandwidth of a small team', outsourced: 'Specialty-trained teams and scrubbing usually lift first-pass rates', edge: 'out' },
  { factor: 'Staffing risk', inhouse: 'One biller leaving can stall cash flow for weeks', outsourced: 'Team-based coverage — no single point of failure', edge: 'out' },
  { factor: 'Denial & A/R follow-up', inhouse: 'Often deprioritized when staff are stretched', outsourced: 'Dedicated denial and A/R teams work it daily', edge: 'out' },
  { factor: 'Day-to-day control', inhouse: 'Full, direct control and immediate visibility', outsourced: 'Control via reporting and an account team, not down the hall', edge: 'in' },
  { factor: 'Local / institutional knowledge', inhouse: 'Deep familiarity with your patients and workflows', outsourced: 'Built through onboarding and a dedicated account team', edge: 'in' },
  { factor: 'Technology & compliance', inhouse: 'You buy, maintain, and secure the systems', outsourced: 'Platform, updates, and HIPAA/SOC 2 posture included', edge: 'out' },
  { factor: 'Scalability', inhouse: 'Hiring and training lag growth', outsourced: 'Capacity flexes with your volume', edge: 'out' },
];

const faqs = [
  { q: 'Is outsourced medical billing cheaper than in-house?', a: 'It depends on volume, but for most small and mid-size practices outsourcing is more cost-effective because you replace fixed salary, benefits, software, and overhead with a variable fee tied to collections. You also avoid the hidden cost of denials and aged A/R that pile up when an in-house team is short-staffed.' },
  { q: 'Will I lose control if I outsource billing?', a: 'You keep control through transparent, real-time reporting and a dedicated account team. The difference is that oversight happens through dashboards and regular reviews rather than walking down the hall. Reputable partners give you 24/7 visibility into claims, payments, and KPIs.' },
  { q: 'How long does it take to switch to an outsourced biller?', a: 'A typical transition runs 30–45 days with parallel processing, so new claims start flowing immediately while existing claims are worked to completion. Done right, there is no gap in cash flow.' },
  { q: 'What happens to my current billing staff?', a: 'Many practices redeploy billing staff to front-desk, patient-experience, or practice-management roles, or reduce overhead through natural attrition. The transition can be staged so nothing breaks.' },
];

export default function OutsourcedVsInHouse() {
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Compare', item: 'https://aetherahealthcare.com/compare' },
        { '@type': 'ListItem', position: 2, name: 'Outsourced vs. In-House Medical Billing', item: 'https://aetherahealthcare.com/compare/outsourced-vs-in-house-medical-billing' },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-jakarta mb-4">Outsourced vs. In-House Medical Billing</h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-xl text-cream max-w-3xl">
              The honest trade-offs on cost, collections, control, and risk — plus a simple way to decide which model fits your practice.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <p className="text-lg text-slate-700 leading-relaxed">
            There is no universally right answer — the best model depends on your size, specialty, and how your billing
            runs today. Below is a side-by-side on the factors that actually move revenue, followed by a quick way to
            tell which side you fall on.
          </p>

          {/* Comparison table */}
          <div className="overflow-hidden rounded-2xl border border-gray/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="text-left p-4 font-semibold">Factor</th>
                  <th className="text-left p-4 font-semibold">In-House</th>
                  <th className="text-left p-4 font-semibold">Outsourced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray/10">
                {rows.map(r => (
                  <tr key={r.factor} className="align-top">
                    <td className="p-4 font-semibold text-navy">{r.factor}</td>
                    <td className="p-4 text-slate-600">
                      <span className="flex items-start gap-2">
                        {r.edge === 'in' ? <Check className="h-4 w-4 text-teal shrink-0 mt-0.5" /> : r.edge === 'out' ? <X className="h-4 w-4 text-gray/40 shrink-0 mt-0.5" /> : null}
                        {r.inhouse}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className="flex items-start gap-2">
                        {r.edge === 'out' ? <Check className="h-4 w-4 text-teal shrink-0 mt-0.5" /> : r.edge === 'in' ? <X className="h-4 w-4 text-gray/40 shrink-0 mt-0.5" /> : null}
                        {r.outsourced}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Decision framework */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray/15 p-6">
              <h2 className="text-lg font-bold text-navy mb-3">In-house may fit if…</h2>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><Check className="h-4 w-4 text-teal shrink-0 mt-0.5" />You have a large, stable, well-trained billing team</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-teal shrink-0 mt-0.5" />Your clean-claim rate and days-in-A/R are already strong</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-teal shrink-0 mt-0.5" />You want billing physically in the building and value direct control</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-gray/15 p-6">
              <h2 className="text-lg font-bold text-navy mb-3">Outsourcing may fit if…</h2>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><Check className="h-4 w-4 text-teal shrink-0 mt-0.5" />Denials and aged A/R are creeping up</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-teal shrink-0 mt-0.5" />Billing stalls whenever someone is out or quits</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-teal shrink-0 mt-0.5" />You want to convert fixed billing overhead into a fee tied to collections</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-teal shrink-0 mt-0.5" />You are growing and need billing capacity to scale with you</li>
              </ul>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">Frequently asked questions</h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray/15 p-5">
                  <p className="font-semibold text-navy text-sm mb-1.5">{f.q}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-navy rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-2">Not sure which way to go?</h2>
            <p className="text-gray mb-6 max-w-xl mx-auto">A free assessment shows exactly where your current billing is leaking — then you decide. No contract, no pressure.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link prefetch={false} href="/free-assessment" className="bg-mint hover:bg-white text-navy font-bold py-3 px-6 rounded-full transition-colors text-sm">Get a Free Assessment</Link>
              <Link prefetch={false} href="/tools/ar-cost-calculator" className="border border-white/30 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-full transition-colors text-sm inline-flex items-center">
                Try the A/R Cost Calculator <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Footer />
    </div>
  );
}
