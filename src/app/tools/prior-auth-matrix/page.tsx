import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PriorAuthMatrix from '@/components/ui/PriorAuthMatrix';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Prior-Authorization Requirement & Payer SLA Matrix | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Inspect prior-authorization requirements, statutory review SLAs under CMS-0057-F, peer-to-peer deadlines, and state Gold Card exemption rules across 20+ outpatient and surgical procedures.',
};

export default function PriorAuthMatrixPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Prior-Authorization Requirement & Payer SLA Matrix',
    url: 'https://aetherahealthcare.com/tools/prior-auth-matrix',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free clinical RCM tool to verify prior authorization requirements, statutory turnaround SLAs under CMS-0057-F, and state Gold Card exemption rules.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-navy via-[#003087] to-teal">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-cream/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Prior-Authorization &amp; Payer Gold-Card Matrix
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Navigate statutory prior authorization requirements under the CMS-0057-F Interoperability Rule (72-hour expedited vs 7-day standard SLAs), state Gold Card exemption statutes (TX HB 3459, MI PA 60), and avoid CARC 197 denials before scheduled surgery.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PriorAuthMatrix />

          <ToolConversionBridge
            toolName="Prior Authorization Matrix"
            contextText="Prior authorization bottlenecks cause 34% of preventable procedure cancellations. Aethera’s pre-certification team handles 100% of authorizations with guaranteed sub-24 hour turnaround."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
