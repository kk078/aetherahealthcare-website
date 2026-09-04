import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import AppealLetterGenerator from '@/components/ui/AppealLetterGenerator';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Medical Denial Appeal Letter Generator | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Generate customized, legal-grade healthcare appeal letters with statutory citations (ERISA, ACA, CMS NCCI) for CARC 50, 197, 16, 29, 97, and 22 denials.',
};

export default function AppealLetterGeneratorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Medical Denial Appeal Letter Generator',
    url: 'https://aetherahealthcare.com/tools/appeal-letter-generator',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Free healthcare tool to generate formal medical claim appeal letters with statutory citations and clinical justifications.',
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
              Medical Denial Appeal Letter Generator
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Stop writing appeal letters from scratch. Create formal, legally robust dispute letters with official
              statutory citations (ERISA, ACA Section 2719, and CMS Claims Processing Manual) tailored to your exact denial code.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <AppealLetterGenerator />

          <ToolConversionBridge
            toolName="Appeal Letter Generator"
            contextText="Writing appeal letters takes hours of clinical staff time. Aethera revenue cycle teams overturn 82%+ of denials within 48 hours with zero administrative burden on your staff."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
