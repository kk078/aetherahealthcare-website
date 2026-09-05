import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SpineArthrodesisScrubber from '@/components/ui/SpineArthrodesisScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Spine Arthrodesis & Multi-Level Instrumentation Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Spine Arthrodesis & Multi-Level Instrumentation Scrubber. Audit complex spinal fusions (TLIF/PLIF 22633, ACDF 22551, ALIF 22558), test NCCI decompression bundling (63047), audit Modifier -62 co-surgeon rules, and ensure compliance on instrumentation (+22842/+22845) and bone graft (+20930/+20936) add-on codes.',
};

export default function SpineArthrodesisScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Spine Arthrodesis & Multi-Level Instrumentation Scrubber',
    url: 'https://aetherahealthcare.com/tools/spine-arthrodesis-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit complex spine surgical episodes, NCCI canal decompression bundling edits, Modifier 62 co-surgeon compliance, and multi-level segmental instrumentation and bone graft add-on codes.',
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
              Spine Arthrodesis &amp; Instrumentation Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Spine surgery coding represents one of the highest denial and audit risk areas in surgical revenue cycle.
              Unbundling laminectomy (63047) from interbody fusions (22633/22551), appending Modifier -62 incorrectly to
              instrumentation add-ons (+22842/+22845), or missing bone graft (+20930/+20936) and cage (+22853) codes causes catastrophic
              revenue loss. Simulate your operative episodes and verify NCCI compliance before billing.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <SpineArthrodesisScrubber />

          <ToolConversionBridge
            toolName="Spine Surgical RCM Scrubber"
            contextText="Facing multi-level spine claim rejections, co-surgeon payment splits, or aggressive payer audits on interbody instrumentation? Aethera's spine surgical billing specialists optimize documentation, secure prior authorizations, and maximize surgical allowable recovery."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
