import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricCraniofacialScrubber from '@/components/ui/PediatricCraniofacialScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric Craniofacial & Cleft Palate Staging Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Pediatric Craniofacial Scrubber. Audit cleft palatoplasty (42200-42210), defend alveolar bone grafting against illegal unbundling, safeguard Modifier 58 staged sequencing, and overturn cosmetic exclusion denials.',
};

export default function PediatricCraniofacialScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric Craniofacial & Cleft Palate Staging Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-craniofacial-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit complex pediatric cleft palatoplasty, alveolar bone grafting, midface LeFort I osteotomy, and cranial vault remodeling against illegal unbundling and cosmetic denials.',
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
              Pediatric Craniofacial &amp; Cleft Palate Staging Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Pediatric craniofacial surgery involves multi-year, staged reconstructive protocols vulnerable to severe
              coding hazards: payers routinely deny staged palate revisions without Modifier 58, reject orthognathic and
              nasal corrections under arbitrary &quot;cosmetic exclusions&quot;, and trigger lethal NCCI recoupments when
              graft harvesting is unbundled from CPT 42210. Protect your surgical yield with precision scrub audits.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricCraniofacialScrubber />

          <ToolConversionBridge
            toolName="Pediatric Craniofacial & Plastic Surgery RCM"
            contextText="Tired of fighting commercial insurance denials mislabeling congenital cleft and craniofacial corrections as cosmetic procedures? Aethera's specialized pediatric surgical billing experts overturn denials and secure full statutory reimbursement."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
