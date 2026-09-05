import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import FqhcPpsScrubber from '@/components/ui/FqhcPpsScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'FQHC PPS Rate & Same-Day Service Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free FQHC Prospective Payment System (PPS) rate scrubber. Calculate GAF geographic adjustments, validate same-day medical + behavioral health encounter exemptions, and model Medicaid wrap reconciliations.',
};

export default function FqhcPpsScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'FQHC PPS Rate & Same-Day Service Scrubber',
    url: 'https://aetherahealthcare.com/tools/fqhc-pps-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Calculate CMS FQHC PPS encounter allowable rates, evaluate same-day mental health and subsequent illness exceptions, and reconcile Medicaid supplemental wrap-around differentials.',
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
              FQHC PPS Rate &amp; Same-Day Service Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Under Medicare and Medicaid Prospective Payment Systems (PPS), Federally Qualified Health Centers bill bundled
              all-inclusive rates adjusted by local Geographic Adjustment Factors (GAF). Scrub your qualifying encounter codes
              (G0466–G0470), validate same-day mental health statutory exceptions (Modifier 59/XE), and model supplemental
              Medicaid wrap-around reconciliations.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <FqhcPpsScrubber />

          <ToolConversionBridge
            toolName="FQHC PPS Rate Scrubber"
            contextText="Looking to eliminate unbilled same-day behavioral health encounters and accelerate Medicaid wrap-around cash flow? Aethera handles end-to-end UB-04 encounter scrubbing, sliding fee scale integrity, and state wrap reconciliation."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
