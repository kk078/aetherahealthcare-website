import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import NicuCriticalCareScrubber from '@/components/ui/NicuCriticalCareScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'NICU & Pediatric Critical Care Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free NICU & Pediatric Critical Care Scrubber. Validate inpatient per-day neonatal critical care codes (CPT 99468–99476), intensive step-down weight tiers (99477–99480), and scrub out CPT bundled catheterizations (36510/36660) and intubations (31500).',
};

export default function NicuCriticalCareScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'NICU & Pediatric Critical Care Billing Scrubber',
    url: 'https://aetherahealthcare.com/tools/nicu-critical-care-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit neonatal and pediatric inpatient critical care codes, identify unbundled vascular line and intubation errors, and generate ANSI X12 837P claim lines under CMS and AAP guidelines.',
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
              NICU &amp; Pediatric Critical Care Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              CMS Chapter 11 and CPT coding guidelines mandate per-day global billing for neonatal and pediatric critical care (CPT 99468–99476). Bedside endotracheal intubations (31500), umbilical catheterizations (36510, 36660), and ventilator management are statutorily bundled. Audit your encounter packages, model stepped-down weight bands (99477–99480), and scrub unbundling errors before transmission.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <NicuCriticalCareScrubber />

          <ToolConversionBridge
            toolName="NICU & Pediatric Critical Care Scrubber"
            contextText="Avoid costly CO-97 unbundling denials and recoup undercoded delivery room resuscitation fees. Our certified pediatric hospitalist billing specialists will audit 50 recent NICU claims at zero cost."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
