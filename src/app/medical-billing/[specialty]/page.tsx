import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import { getSpecialty, SEO_SPECIALTIES } from '@/lib/seo.data';
import { AlertTriangle, CheckCircle2, ArrowRight, Wrench } from 'lucide-react';

export const dynamicParams = false;

export function generateStaticParams() {
  return SEO_SPECIALTIES.map((s) => ({ specialty: s.slug }));
}

type Params = Promise<{ specialty: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { specialty } = await params;
  const s = getSpecialty(specialty);
  if (!s) return {};
  return {
    title: { absolute: `${s.name} Medical Billing Services | Aethera Healthcare Solutions` },
    description: `Nationwide ${s.name.toLowerCase()} medical billing and revenue cycle management for U.S. practices. ${s.blurb} Free assessment — no long-term contract.`,
    alternates: { canonical: `https://aetherahealthcare.com/medical-billing/${s.slug}` },
  };
}

export default async function SpecialtyPage({ params }: { params: Params }) {
  const { specialty } = await params;
  const s = getSpecialty(specialty);
  if (!s) notFound();

  const title = `${s.name} Medical Billing Services`;
  const url = `https://aetherahealthcare.com/medical-billing/${s.slug}`;

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: title,
      serviceType: `${s.name} medical billing and revenue cycle management`,
      areaServed: { '@type': 'Country', name: 'United States' },
      provider: {
        '@type': 'Organization',
        name: 'Aethera Healthcare Solutions',
        url: 'https://aetherahealthcare.com',
        telephone: '+1-813-519-4640',
      },
      url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Medical Billing', item: 'https://aetherahealthcare.com/medical-billing' },
        { '@type': 'ListItem', position: 2, name: s.name, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: s.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  // sibling specialties for internal linking
  const others = SEO_SPECIALTIES.filter((x) => x.slug !== s.slug).slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      <section className="pt-24 pb-12 md:pt-28 md:pb-14 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-cream/80 text-sm mb-3">Medical Billing · Nationwide</p>
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-jakarta mb-4">{title}</h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-xl text-cream max-w-3xl">{s.blurb}</p>
          </FadeIn>
          <FadeIn delay={0.25}>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link prefetch={false} href="/free-assessment" className="bg-mint hover:bg-white text-navy font-bold py-3 px-6 rounded-full transition-colors text-sm">
                Get a Free Assessment
              </Link>
              <a href="tel:+18135194640" className="border-2 border-white/40 text-white hover:bg-white/10 font-semibold py-3 px-6 rounded-full transition-colors text-sm">
                Call (813) 519-4640
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              {/* Intro */}
              <div className="prose-aethera">
                <p className="text-lg text-slate-700 leading-relaxed">
                  Aethera Healthcare Solutions provides full-service medical billing and revenue cycle management to{' '}
                  {s.noun} across the United States. We handle coding, claims, payment posting, denial management, and
                  A/R follow-up end to end — so your team can stay focused on patient care while your revenue cycle runs
                  cleanly.
                </p>
                <p className="text-slate-600 leading-relaxed mt-4">
                  Typical {s.name.toLowerCase()} CPT range we work: <strong className="text-navy">{s.cpt}</strong>.
                </p>
              </div>

              {/* Pain points */}
              <div>
                <h2 className="text-2xl font-bold text-navy mb-4">Why {s.name.toLowerCase()} billing leaks revenue</h2>
                <div className="space-y-3">
                  {s.painPoints.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white rounded-xl border border-gray/15 p-4">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 leading-relaxed">{p}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What we do */}
              <div>
                <h2 className="text-2xl font-bold text-navy mb-4">How Aethera fixes it</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    'Specialty-trained coders (CPC/CCS) code to the documentation',
                    'First-pass claim scrubbing against payer and NCCI edits',
                    'Proactive denial prevention and 72-hour denial work',
                    'Relentless A/R follow-up to drive days-in-A/R down',
                    'Eligibility and prior-auth verification before service',
                    'Transparent, real-time reporting in the provider portal',
                  ].map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-white rounded-xl border border-gray/15 p-4">
                      <CheckCircle2 className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700">{t}</p>
                    </div>
                  ))}
                </div>
                {s.serviceHref && (
                  <Link prefetch={false} href={s.serviceHref} className="inline-flex items-center text-teal hover:text-navy font-semibold text-sm mt-5">
                    See our full {s.name} billing service <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Link>
                )}
              </div>

              {/* Free tools cross-link */}
              <div className="bg-white rounded-2xl border border-gray/15 p-6">
                <h2 className="text-lg font-bold text-navy mb-2 flex items-center"><Wrench className="h-5 w-5 mr-2 text-teal" />Free tools for your billing team</h2>
                <p className="text-sm text-gray mb-3">Use these any time — no login required.</p>
                <div className="flex flex-wrap gap-2">
                  <Link prefetch={false} href="/tools/denial-code-lookup" className="text-sm bg-cream border border-teal/30 text-teal rounded-full px-3 py-1.5 hover:bg-teal hover:text-white transition-colors">Denial Code Lookup</Link>
                  <Link prefetch={false} href="/tools/clean-claim-scorecard" className="text-sm bg-cream border border-teal/30 text-teal rounded-full px-3 py-1.5 hover:bg-teal hover:text-white transition-colors">Clean-Claim Scorecard</Link>
                  <Link prefetch={false} href="/tools/ar-cost-calculator" className="text-sm bg-cream border border-teal/30 text-teal rounded-full px-3 py-1.5 hover:bg-teal hover:text-white transition-colors">A/R Cost Calculator</Link>
                  <Link prefetch={false} href="/payers/directory" className="text-sm bg-cream border border-teal/30 text-teal rounded-full px-3 py-1.5 hover:bg-teal hover:text-white transition-colors">Payer Directory</Link>
                </div>
              </div>

              {/* FAQ */}
              <div>
                <h2 className="text-2xl font-bold text-navy mb-4">{s.name} billing FAQ</h2>
                <div className="space-y-3">
                  {s.faqs.map((f, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray/15 p-5">
                      <p className="font-semibold text-navy text-sm mb-1.5">{f.q}</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-28 self-start space-y-6">
              <div className="bg-navy rounded-2xl p-6 text-white">
                <h2 className="text-lg font-bold mb-2">Serving practices nationwide</h2>
                <p className="text-sm text-gray mb-4">Month-to-month. No setup fees. 30–45 day onboarding with parallel processing — zero disruption.</p>
                <Link prefetch={false} href="/free-assessment" className="block text-center bg-mint hover:bg-white text-navy font-bold py-2.5 px-5 rounded-full transition-colors text-sm">
                  Free Revenue Assessment
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-gray/15 p-6">
                <p className="text-xs font-bold text-gray uppercase tracking-widest mb-3">Other specialties we bill</p>
                <ul className="space-y-1.5">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <Link prefetch={false} href={`/medical-billing/${o.slug}`} className="text-sm text-teal hover:text-navy">
                        {o.name} billing
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Footer />
    </div>
  );
}
