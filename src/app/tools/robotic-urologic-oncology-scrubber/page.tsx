import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import RoboticUrologicScrubber from '@/components/ui/RoboticUrologicScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Robotic Urologic Oncology & Reconstructive Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Robotic Urologic Oncology Scrubber. Audit robot-assisted radical prostatectomy (CPT 55866), defend extended pelvic lymphadenectomy (+38572-59), robot-assisted partial nephrectomy (50543), intracorporeal urinary diversions (51595/51596), and Modifier -22 complexity justifications.',
};

export default function RoboticUrologicScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Robotic Urologic Oncology & Complex Reconstructive Scrubber',
    url: 'https://aetherahealthcare.com/tools/robotic-urologic-oncology-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit robot-assisted radical prostatectomy, extended pelvic lymph node dissection (+38572-59), robotic partial nephrectomy, intracorporeal neobladder diversions, and Modifier -22 surgical complexity.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#064e3b] via-[#0f172a] to-[#042f2e]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-teal-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Robotic Urologic Oncology &amp; Complex Reconstructive Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Minimally invasive robotic urologic oncology commands exceptional surgical precision. However, clearinghouses
              and commercial payers continually bundle extended pelvic lymphadenectomy (+38572) into primary prostatectomy
              (55866), reject robotic technique S-codes (S2900), and disallow Modifier -22 complexity uplifts on prolonged
              warm ischemia partial nephrectomies. Audit your robotic urology surgical claims with automated compliance rules.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <RoboticUrologicScrubber />

          <ToolConversionBridge
            toolName="Robotic Urologic Oncology Scrubber"
            contextText="Robotic radical prostatectomy and partial nephrectomy cases frequently experience extended lymphadenectomy denials and Modifier -22 clawbacks."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
