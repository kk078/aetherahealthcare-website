import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import { SEO_SPECIALTIES } from '@/lib/seo.data';
import { Stethoscope } from 'lucide-react';

export const metadata = {
  title: { absolute: 'Medical Billing Services by Specialty | Aethera Healthcare Solutions' },
  description:
    'Nationwide specialty medical billing and revenue cycle management for U.S. practices. Find billing built for your specialty — coding, claims, denials, and A/R handled end to end.',
  alternates: { canonical: 'https://aetherahealthcare.com/medical-billing' },
};

export default function MedicalBillingHub() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <RcmHeroBand
        eyebrow="Billing by Specialty"
        title="Medical billing built for your specialty"
        subtitle="Revenue cycle management tailored to how your specialty actually gets paid — for practices nationwide."
        primary={{ href: '/free-assessment', label: 'Get a Free Assessment' }}
        chips={['Nationwide', '26+ specialties', 'No long-term contract']}
      />

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Specialties */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-5 flex items-center"><Stethoscope className="h-6 w-6 mr-2 text-teal" />Specialties we bill</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SEO_SPECIALTIES.map((s, i) => (
                <FadeIn key={s.slug} delay={i * 0.04}>
                  <Link prefetch={false} href={`/medical-billing/${s.slug}`} className="group block bg-white rounded-xl border border-gray/15 p-4 hover:shadow-lg transition-all">
                    <span className="block text-navy font-semibold text-sm">{s.name}</span>
                    <span className="block text-xs text-gray mt-1 leading-snug">{s.cpt}</span>
                  </Link>
                </FadeIn>
              ))}
            </div>
            <p className="text-xs text-gray mt-3">Don&rsquo;t see your specialty? We bill for many more — <Link prefetch={false} href="/specialties" className="text-teal hover:text-navy font-semibold">see all specialties</Link> or get a free assessment.</p>
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
