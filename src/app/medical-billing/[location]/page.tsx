import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import { getLocation, SEO_LOCATIONS, SEO_SPECIALTIES } from '@/lib/seo.data';
import { MapPin, ArrowRight } from 'lucide-react';

export const dynamicParams = false;

export function generateStaticParams() {
  return SEO_LOCATIONS.map(l => ({ location: l.slug }));
}

type Params = Promise<{ location: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { location } = await params;
  const l = getLocation(location);
  if (!l) return {};
  return {
    title: { absolute: `Medical Billing Services in ${l.city}, FL | Aethera Healthcare Solutions` },
    description: `Full-service medical billing and revenue cycle management for ${l.city}, FL practices across every specialty. Higher clean-claim rates, fewer denials, faster A/R. Free assessment.`,
    alternates: { canonical: `https://aetherahealthcare.com/medical-billing/${l.slug}` },
  };
}

export default async function LocationPage({ params }: { params: Params }) {
  const { location } = await params;
  const l = getLocation(location);
  if (!l) notFound();

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Medical Billing', item: 'https://aetherahealthcare.com/medical-billing' },
      { '@type': 'ListItem', position: 2, name: l.city, item: `https://aetherahealthcare.com/medical-billing/${l.slug}` },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      <section className="pt-24 pb-12 md:pt-28 md:pb-14 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="flex items-center text-cream/80 text-sm mb-3"><MapPin className="h-4 w-4 mr-1.5" /> {l.region}, Florida</p>
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-jakarta mb-4">Medical Billing Services in {l.city}, FL</h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-xl text-cream max-w-3xl">
              Aethera serves practices across {l.blurb} with end-to-end revenue cycle management —
              coding, claims, denials, and A/R follow-up. Pick your specialty below.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy mb-6">{l.city} billing by specialty</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {SEO_SPECIALTIES.map((s, i) => (
              <FadeIn key={s.slug} delay={i * 0.05}>
                <Link prefetch={false} href={`/medical-billing/${l.slug}/${s.slug}`} className="group flex items-center justify-between bg-white rounded-xl border border-gray/15 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <span>
                    <span className="block text-navy font-semibold">{s.name} Billing</span>
                    <span className="block text-xs text-gray mt-0.5">{l.city}, FL</span>
                  </span>
                  <ArrowRight className="h-5 w-5 text-teal group-hover:translate-x-1 transition-transform" />
                </Link>
              </FadeIn>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link prefetch={false} href="/free-assessment" className="inline-block bg-teal hover:bg-navy text-white font-semibold py-3 px-6 rounded-full transition-colors text-sm">
              Get a Free Assessment for your {l.city} practice
            </Link>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Footer />
    </div>
  );
}
