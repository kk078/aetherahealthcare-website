import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import AnesthesiaCalculator from '@/components/ui/AnesthesiaCalculator';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Anesthesia ASA Unit & Reimbursement Calculator | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Calculate total ASA anesthesia billing units (Base + 15-Min Time + Physical Modifiers + Qualifying Circumstances) and reimbursement across Medicare, Commercial, and CMS Concurrency models.',
};

export default function AnesthesiaCalculatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Anesthesia ASA Unit & Reimbursement Calculator',
    url: 'https://aetherahealthcare.com/tools/anesthesia-calculator',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Interactive clinical tool for anesthesia practices and CRNAs to calculate ASA units, concurrency splits (AA, QZ, QK, QX), and commercial vs Medicare yields.',
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
              Anesthesia ASA Unit & Reimbursement Calculator
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Calculate total billable anesthesia units based on ASA Relative Value Guide (Base Units + 15-Minute Exact Time Units + Physical Status Modifiers + Qualifying Circumstances). Model CMS medical direction concurrency splits (AA, QZ, QK, QX, QY) and compare Commercial vs Medicare allowable yields in real time.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <AnesthesiaCalculator />

          <ToolConversionBridge
            toolName="Anesthesia RVG Calculator"
            contextText="Anesthesia billing is fraught with time rounding disputes, concurrency documentation rejections, and commercial fee schedule compressions. Aethera captures every eligible physical status modifier and defends ASA unit yields."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
