import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PlatformTelemetryDashboard from '@/components/ui/PlatformTelemetryDashboard';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Platform Telemetry & Clearinghouse SLA Dashboard | Aethera Healthcare Solutions',
  },
  description:
    'Live telemetry dashboard inspecting Aethera global edge latency, EDI 837/835 clearinghouse transmission speeds, and HIPAA zero-knowledge ephemeral memory sweeps.',
};

export default function PlatformTelemetryPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Platform Telemetry & Clearinghouse SLA Dashboard',
    url: 'https://aetherahealthcare.com/tools/platform-telemetry',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Real-time infrastructure transparency dashboard displaying healthcare clearinghouse SLAs, client roundtrip performance, and data security compliance.',
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
              Platform Telemetry & System SLAs
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Transparent, real-time telemetry inspecting our direct clearinghouse gateway throughput, global edge network distribution, Core Web Vitals speed, and zero-persistence HIPAA data isolation.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PlatformTelemetryDashboard />

          <ToolConversionBridge
            toolName="Enterprise Telemetry SLA"
            contextText="Looking for guaranteed 99.5%+ uptime and under-24-hour denial turnaround backed by strict financial SLAs? Schedule an architecture review with our billing engineering team."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
