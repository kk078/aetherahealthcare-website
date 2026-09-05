import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import GlobalPeriodScrubber from '@/components/ui/GlobalPeriodScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Surgical Global Period & Post-Op Modifier Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free CMS surgical global period scrubber. Verify 0-day, 10-day, and 90-day post-op windows, validate compliant usage of Modifiers 24, 58, 78, 79, 54, and 55, and generate ANSI X12 837P Loop 2400 SV1 segments.',
};

export default function GlobalPeriodScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Surgical Global Period & Post-Op Modifier Scrubber',
    url: 'https://aetherahealthcare.com/tools/global-period-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Evaluate surgical global fee periods under CMS Chapter 12 § 40.1, validate compliant post-operative modifier selection, and prevent unbundling recoupments.',
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
              Surgical Global Period &amp; Post-Op Modifier Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Surgical practices lose hundreds of thousands annually to post-operative unbundling recoupments and unbilled
              unrelated services. Scrub surgical follow-up encounters against Medicare 0-day, 10-day, and 90-day global
              packages to confirm defensible usage of Modifiers 24, 58, 78, and 79.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <GlobalPeriodScrubber />

          <ToolConversionBridge
            toolName="Surgical Global Period Scrubber"
            contextText="Are post-operative claims triggering CARC CO-97 unbundling denials or retrospective commercial recoupment demands? Aethera's certified surgical coders cross-verify every operative note and diagnosis code against active global fee clocks to defend 100% of earned surgical revenue."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
