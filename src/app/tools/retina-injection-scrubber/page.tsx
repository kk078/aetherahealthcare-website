import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import RetinaInjectionScrubber from '@/components/ui/RetinaInjectionScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Anti-VEGF Intravitreal Injection & Bilateral Eye Surgery Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Anti-VEGF Intravitreal Injection Scrubber for retina practices. Audit drug dosage and wastage (Modifiers JW/JZ), calculate Medicare Part B bilateral modifier logic (-50 vs -RT/-LT), enforce 28-day LCD frequency limits, and generate ANSI X12 837P claim lines.',
};

export default function RetinaInjectionScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Anti-VEGF Intravitreal Injection & Bilateral Eye Surgery Scrubber',
    url: 'https://aetherahealthcare.com/tools/retina-injection-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit ophthalmic anti-VEGF drug dosage and wastage (Modifiers JW/JZ), check Medicare Part B 28-day injection intervals, evaluate bilateral modifier rules (-50 vs -RT/-LT), and generate compliant ANSI 837P claim lines.',
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
              Anti-VEGF Intravitreal Injection &amp; Bilateral Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Ophthalmic anti-VEGF injections represent high-dollar buy-and-bill investments where single-digit billing errors
              cause catastrophic revenue leakage. Medicare Part B strictly enforces 28-day treatment intervals, mandates Modifier JW
              for discarded single-dose vial wastage (and Modifier JZ for zero waste), and applies divergent bilateral billing
              requirements (-50 vs -RT/-LT). Scrub your injection and diagnostic claims before submission.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <RetinaInjectionScrubber />

          <ToolConversionBridge
            toolName="Retina Injection Scrubber"
            contextText="Struggling with anti-VEGF drug wastage audits, denied bilateral injection modifiers, or delayed OCT reimbursements? Aethera provides certified retina coding specialists who protect margins across eye clinics and ambulatory surgery centers."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
