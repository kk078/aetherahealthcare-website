import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import CardiacEpScrubber from '@/components/ui/CardiacEpScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Cardiac Electrophysiology & Catheter Ablation Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Cardiac EP Billing Scrubber. Audit pulmonary vein isolation (CPT 93656) and SVT ablation edits, validate 3D mapping and ICE guidance add-ons, prevent diagnostic study unbundling denials, and check remote telemetry 90-day intervals.',
};

export default function CardiacEpScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Cardiac Electrophysiology & Catheter Ablation Scrubber',
    url: 'https://aetherahealthcare.com/tools/cardiac-ep-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit cardiac electrophysiology catheter ablations, billable 3D mapping add-ons, diagnostic EP study NCCI bundling, and remote device interrogation cadence.',
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
              Cardiac Electrophysiology &amp; Ablation Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Catheter ablation billing is prone to severe NCCI unbundling denials (CARC CO-97) when baseline diagnostic
              studies (93619/93620) or atrial recordings are billed alongside comprehensive PVI (CPT 93656). Concurrently,
              EP labs miss legitimate revenue on 3D mapping (93613) and intracardiac ultrasound (93662). Scrub your
              electrophysiology claim lines and audit remote cardiac device telemetry intervals before submission.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <CardiacEpScrubber />

          <ToolConversionBridge
            toolName="Cardiac Electrophysiology Scrubber"
            contextText="Struggling with catheter ablation denials, missed 3D electroanatomical mapping add-ons, or telemetry clawbacks? Aethera provides certified cardiac EP coding specialists who protect revenue across EP labs, device clinics, and arrhythmia centers."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
