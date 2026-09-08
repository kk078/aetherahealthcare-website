import { canonicalUrl } from '@/lib/siteConfig';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PlatformTelemetryDashboard from '@/components/ui/PlatformTelemetryDashboard';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  alternates: { canonical: canonicalUrl('/tools/platform-telemetry') },
  robots: { index: false, follow: true },
  title: {
    absolute: 'Browser Performance Measurements | Aethera Healthcare Solutions',
  },
  description:
    'Inspect measured browser navigation timings for your current page load.',
};

export default function PlatformTelemetryPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Browser Performance Measurements',
    url: 'https://aetherahealthcare.com/tools/platform-telemetry',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Navigation Timing API measurements for the current browser page load.',
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
              Browser Performance Measurements
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Inspect your browser’s page-load timings with clear measurement limits.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PlatformTelemetryDashboard />

          <ToolConversionBridge
            toolName="Enterprise Telemetry SLA"
            contextText="Discuss service targets, reporting requirements, and available evidence with our billing team."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
