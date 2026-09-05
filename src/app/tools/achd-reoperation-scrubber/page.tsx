import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import AchdReoperationScrubber from '@/components/ui/AchdReoperationScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Adult Congenital Heart Disease (ACHD) & Fontan Conversion Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free ACHD Surgical Scrubber. Audit complex Fontan conversion (CPT 33737), defend redo sternotomy adhesiolysis add-ons (+33530), safeguard concomitant arrhythmia cryoablation Maze (+33257/+33258), and audit pulmonary valve replacements.',
};

export default function AchdReoperationScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Adult Congenital Heart Disease (ACHD) & Fontan Conversion Scrubber',
    url: 'https://aetherahealthcare.com/tools/achd-reoperation-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit adult congenital heart surgery, Fontan conversions to extracardiac conduit, redo sternotomy mediastinal adhesiolysis add-ons, and concomitant cryoablation Maze procedures.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#450a0a] via-[#0f172a] to-[#881337]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-rose-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Adult Congenital Heart Disease (ACHD) &amp; Fontan Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-rose-100/90 max-w-3xl leading-relaxed">
              Adult congenital heart disease surgeries involve intricate hemodynamics, multiple prior sternotomies,
              and complex arrhythmia management. Yet commercial payers aggressively downcode Fontan conversion (33737)
              to simple revisions, reject redo sternotomy add-ons (+33530), and bundle cryoablation Maze procedures.
              Audit your operative cases with automated clinical coding intelligence.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <AchdReoperationScrubber />

          <ToolConversionBridge
            toolName="ACHD & Congenital Cardiac Surgical RCM"
            contextText="Frustrated by commercial payer downcoding clawbacks on Fontan conversions, bundled cryoablation Maze add-ons, or unbundling denials on redo sternotomies? Aethera's specialized congenital cardiothoracic coding experts ensure maximum legitimate reimbursement."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
