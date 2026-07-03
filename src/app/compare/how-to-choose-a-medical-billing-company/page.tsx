import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const metadata = {
  title: { absolute: 'How to Choose a Medical Billing Company: Questions, Red Flags & Metrics | Aethera Healthcare Solutions' },
  description:
    'A practical guide to evaluating a medical billing company — the questions to ask, the red flags to avoid, and the metrics that predict whether a partner will actually raise your collections.',
  alternates: { canonical: 'https://aetherahealthcare.com/compare/how-to-choose-a-medical-billing-company' },
};

const questions = [
  { q: 'What is your average first-pass clean-claim rate?', why: 'This is the single best predictor of how much rework — and lost revenue — you will see. Look for 95%+.' },
  { q: 'What are your typical days-in-A/R and denial rate by specialty?', why: 'Vague answers are a red flag. A good partner benchmarks by specialty and shares real numbers.' },
  { q: 'How fast do you work denials, and what is your appeal success rate?', why: 'Denials decay with age. Ask for a denial-response SLA (e.g. 72 hours) and a real appeal win rate.' },
  { q: 'Will I have a dedicated account team that knows my specialty?', why: 'Specialty nuance drives coding accuracy. Generic, rotating reps miss specialty-specific revenue.' },
  { q: 'What reporting and real-time visibility do I get?', why: 'You should have 24/7 access to claims, payments, and KPIs — not a monthly PDF you cannot question.' },
  { q: 'What are your contract terms and fees — all of them?', why: 'Look for transparent pricing, no hidden setup fees, and reasonable termination terms.' },
  { q: 'How do you handle HIPAA, BAAs, and data security?', why: 'A BAA is non-negotiable. Ask about encryption, SOC 2, and how PHI is protected.' },
  { q: 'What does onboarding look like, and how do you avoid a cash-flow gap?', why: 'Parallel processing during a 30–45 day transition prevents claims from stalling.' },
];

const redFlags = [
  'Won\'t share clean-claim rate, denial rate, or days-in-A/R',
  'Long lock-in contracts with steep termination penalties',
  'Hidden setup, integration, or "technology" fees',
  'No dedicated account team — just a ticket queue',
  'No BAA or vague answers on HIPAA and data security',
  'Reporting is a monthly PDF with no real-time access',
  'Promises a specific revenue lift before reviewing your data',
];

const faqs = [
  { q: 'What clean-claim rate should a good billing company have?', a: 'Aim for a first-pass clean-claim rate of 95% or higher. Below that, denials and rework quietly erode collections. A strong partner will share their rate and benchmark it by specialty.' },
  { q: 'What questions should I ask before hiring a medical billing company?', a: 'Ask about first-pass clean-claim rate, denial rate and days-in-A/R by specialty, denial-response SLA and appeal success rate, whether you get a dedicated specialty account team, real-time reporting, full fee transparency, HIPAA/BAA practices, and how onboarding avoids a cash-flow gap.' },
  { q: 'What are red flags in a medical billing company?', a: 'Major red flags include refusing to share performance metrics, long lock-in contracts with steep penalties, hidden fees, no dedicated account team, no BAA, monthly-PDF-only reporting, and guaranteeing a revenue lift before they have seen your data.' },
];

export default function HowToChoose() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Compare', item: 'https://aetherahealthcare.com/compare' },
        { '@type': 'ListItem', position: 2, name: 'How to Choose a Medical Billing Company', item: 'https://aetherahealthcare.com/compare/how-to-choose-a-medical-billing-company' },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      <section className="pt-24 pb-12 md:pt-28 md:pb-14 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-jakarta mb-4">How to Choose a Medical Billing Company</h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-xl text-cream max-w-3xl">The questions to ask, the red flags to walk away from, and the metrics that actually predict whether a partner will lift your revenue.</p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Questions */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">8 questions to ask before you sign</h2>
            <div className="space-y-3">
              {questions.map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray/15 p-5">
                  <p className="font-semibold text-navy flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />{item.q}</p>
                  <p className="text-sm text-slate-600 mt-1.5 pl-7">{item.why}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Red flags */}
          <div className="bg-white rounded-2xl border border-amber-200 p-6">
            <h2 className="text-xl font-bold text-navy mb-4 flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />Red flags to walk away from</h2>
            <ul className="grid sm:grid-cols-2 gap-2.5">
              {redFlags.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />{f}</li>
              ))}
            </ul>
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

          <div className="bg-navy rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-2">Put us to the test</h2>
            <p className="text-gray mb-6 max-w-xl mx-auto">Ask us every question on this page. Start with a free assessment of where your current billing is leaking.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link prefetch={false} href="/free-assessment" className="bg-mint hover:bg-white text-navy font-bold py-3 px-6 rounded-full transition-colors text-sm">Get a Free Assessment</Link>
              <Link prefetch={false} href="/compare/outsourced-vs-in-house-medical-billing" className="border border-white/30 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-full transition-colors text-sm inline-flex items-center">
                Outsourced vs. in-house <ArrowRight className="h-4 w-4 ml-1.5" />
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
