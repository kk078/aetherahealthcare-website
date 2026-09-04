import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: { absolute: 'Compare Medical Billing Options | Aethera Healthcare Solutions' },
  description:
    'Honest comparisons to help you choose: outsourced vs. in-house medical billing, and how to evaluate a medical billing company before you switch.',
  alternates: { canonical: 'https://aetherahealthcare.com/compare' },
};

const pages = [
  {
    href: '/compare/outsourced-vs-in-house-medical-billing',
    title: 'Outsourced vs. In-House Medical Billing',
    desc: 'A side-by-side look at cost, collections, control, and risk — and how to know which model fits your practice.',
  },
  {
    href: '/compare/how-to-choose-a-medical-billing-company',
    title: 'How to Choose a Medical Billing Company',
    desc: 'The questions to ask, the red flags to avoid, and the metrics that actually predict whether a billing partner will lift your revenue.',
  },
];

export default function CompareHub() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <RcmHeroBand
        eyebrow="Compare Options"
        title="Compare your billing options"
        subtitle="Straight comparisons — not a sales pitch — to help you decide how to run your revenue cycle."
        primary={{ href: '/free-assessment', label: 'Get a Free Assessment' }}
      />
      <section className="py-14 md:py-20 bg-cream flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 gap-6">
          {pages.map((p, i) => (
            <FadeIn key={p.href} delay={i * 0.1}>
              <Link prefetch={false} href={p.href} className="group block h-full bg-white rounded-2xl border border-gray/15 p-7 hover:shadow-xl hover:-translate-y-1 transition-all">
                <h2 className="text-lg font-bold text-navy mb-2">{p.title}</h2>
                <p className="text-sm text-gray leading-relaxed mb-4">{p.desc}</p>
                <span className="inline-flex items-center text-teal font-semibold text-sm group-hover:text-navy">Read the comparison <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
