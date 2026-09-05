import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricCdhEcmoScrubber from '@/components/ui/PediatricCdhEcmoScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric CDH & Neonatal ECMO Repair Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric CDH & Neonatal ECMO Repair Scrubber. Audit neonatal congenital diaphragmatic hernia repair (CPT 39503), defend Gore-Tex prosthetic patch reconstruction (+49568-59), unbundle VA-ECMO cutdown cannulation (+33946-59), and safeguard staged silo closure (49605-58).',
};

export default function PediatricCdhEcmoScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric CDH & Neonatal ECMO Repair Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-cdh-ecmo-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit neonatal diaphragmatic hernia repair, prosthetic patch reconstruction, surgical ECMO cutdown cannulation, and staged abdominal silo closure.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#042f2e] via-[#0f172a] to-[#134e4a]">
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
              Pediatric CDH &amp; Neonatal ECMO Repair Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Neonatal congenital diaphragmatic hernia (CDH) repairs with extracorporeal membrane oxygenation (ECMO) represent
              the pinnacle of high-risk pediatric surgical critical care. Yet commercial clearinghouses frequently bundle
              life-saving VA-ECMO cannulation (+33946) into bedside resuscitation, disallow prosthetic Gore-Tex patch reconstruction
              (+49568), and trigger 90-day global period clawbacks on staged abdominal silo closures. Audit your neonatal cases with
              automated clinical scrub rules.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricCdhEcmoScrubber />

          <ToolConversionBridge
            toolName="Pediatric CDH & Neonatal ECMO Repair Scrubber"
            contextText="Pediatric fetal centers and neonatal surgery departments face extensive unbundling challenges on ECMO cutdown cannulations, prosthetic patch closures, and staged abdominal domain silos."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
