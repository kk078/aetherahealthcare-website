import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import { SEO_LOCATIONS, SEO_SPECIALTIES } from '@/lib/seo.data';
import { MapPin, Stethoscope, ArrowRight } from 'lucide-react';

export const metadata = {
  title: { absolute: 'Medical Billing Services by Specialty & Location | Aethera Healthcare Solutions' },
  description:
    'Specialty medical billing and revenue cycle management across Central Florida and Tampa Bay — Lakeland, Tampa, Orlando, St. Petersburg and more. Find billing built for your specialty and city.',
  alternates: { canonical: 'https://aetherahealthcare.com/medical-billing' },
};

export default function MedicalBillingHub() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      <RcmHeroBand
        eyebrow="Billing by Location"
        title="Medical billing by specialty & location"
        subtitle="Revenue cycle management built around your specialty and your market — across Central Florida and Tampa Bay."
        primary={{ href: '/free-assessment', label: 'Get a Free Assessment' }}
        chips={['Central Florida', 'Tampa Bay', '26+ specialties']}
      />

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Locations */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-5 flex items-center"><MapPin className="h-6 w-6 mr-2 text-teal" />Areas we serve</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {SEO_LOCATIONS.map((l, i) => (
                <FadeIn key={l.slug} delay={i * 0.04}>
                  <Link prefetch={false} href={`/medical-billing/${l.slug}`} className="group flex items-center justify-between bg-white rounded-xl border border-gray/15 p-4 hover:shadow-lg transition-all">
                    <span className="text-navy font-semibold text-sm">{l.city}, FL</span>
                    <ArrowRight className="h-4 w-4 text-teal group-hover:translate-x-1 transition-transform" />
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-5 flex items-center"><Stethoscope className="h-6 w-6 mr-2 text-teal" />Specialties we bill</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SEO_SPECIALTIES.map((s, i) => (
                <FadeIn key={s.slug} delay={i * 0.04}>
                  <Link prefetch={false} href={`/medical-billing/lakeland/${s.slug}`} className="group block bg-white rounded-xl border border-gray/15 p-4 hover:shadow-lg transition-all">
                    <span className="block text-navy font-semibold text-sm">{s.name}</span>
                    <span className="block text-xs text-gray mt-1 leading-snug">{s.cpt}</span>
                  </Link>
                </FadeIn>
              ))}
            </div>
            <p className="text-xs text-gray mt-3">Specialty links open the Lakeland page — every specialty is available in all of the cities above.</p>
          </div>

          <div className="text-center pt-2">
            <Link prefetch={false} href="/free-assessment" className="inline-block bg-teal hover:bg-navy text-white font-semibold py-3 px-6 rounded-full transition-colors text-sm">
              Get a Free Assessment
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
