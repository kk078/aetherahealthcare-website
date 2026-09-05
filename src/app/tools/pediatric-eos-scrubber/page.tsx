import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricEosScrubber from '@/components/ui/PediatricEosScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Early-Onset Scoliosis (EOS) & Growing Rod Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric Early-Onset Scoliosis (EOS) Scrubber. Audit magnetically controlled growing rods (MCGR), staged surgical lengthenings (22849-58), VEPTR rib-to-spine distraction, pelvic anchors (+22848), and outpatient magnetic distraction clinics.',
};

export default function PediatricEosScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Early-Onset Scoliosis (EOS) & Growing Rod Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-eos-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit pediatric growth-friendly spine instrumentation, magnetically controlled growing rods, staged surgical distraction Modifier -58 compliance, and outpatient distraction clinic coding.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#064e3b] via-[#0f172a] to-[#0f766e]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-emerald-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Pediatric Early-Onset Scoliosis &amp; Growing Rod Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-emerald-100/90 max-w-3xl leading-relaxed">
              Growth-sparing spine surgery in young children requires repeated planned distractions, specialized
              rib/pelvic foundation hardware, and non-invasive magnetic expansion clinics. Yet commercial payers
              routinely bundle staged surgical distractions into prior global periods, reject rib cradle anchors, and
              downcode outpatient MCGR lengthenings. Eliminate revenue leakage with automated pediatric orthopedic audit logic.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricEosScrubber />

          <ToolConversionBridge
            toolName="Pediatric Orthopedic & Spine Deformity RCM"
            contextText="Tired of commercial payer global surgery denials on serial growing rod lengthenings, unbundled pelvic/rib anchors, or downgraded MCGR distraction clinic encounters? Aethera's specialized pediatric spine billing specialists protect your surgical revenue."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
