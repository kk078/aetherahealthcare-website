import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import UrogynecologyScrubber from '@/components/ui/UrogynecologyScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Urogynecology & Pelvic Floor Reconstruction Bundling Scrubber | Free RCM Tool | Aethera Healthcare Solutions',
  },
  description:
    'Free Urogynecology & Pelvic Floor Reconstruction Bundling Scrubber. Audit laparoscopic sacrocolpopexy (57425), mid-urethral sling (57288), and colporrhaphy (57240/57250/57260), test routine cystoscopy (52000) bundling clawbacks, validate POP-Q prolapse staging medical necessity, and configure multi-channel urodynamics (UDS) component stacking.',
};

export default function UrogynecologyScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Urogynecology & Pelvic Floor Reconstruction Bundling Scrubber',
    url: 'https://aetherahealthcare.com/tools/urogynecology-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit female pelvic medicine and reconstructive surgery (FPMRS) episodes, resolve NCCI cystoscopy bundling edits, validate POP-Q prolapse staging, and stack multi-channel urodynamic diagnostic components.',
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
              Urogynecology &amp; Pelvic Floor Bundling Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-cream/90 max-w-3xl leading-relaxed">
              Pelvic reconstructive surgery and urodynamics are heavily scrutinized by commercial payers and Medicare MACs.
              Routine cystourethroscopy (CPT 52000) performed to verify ureteral patency is statutorily bundled into primary repairs
              (57425/57288), multi-channel urodynamics require precise technical/professional splitting (-TC/-26), and prolapse
              repairs demand strict POP-Q clinical documentation. Simulate your claims and prevent revenue clawbacks.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <UrogynecologyScrubber />

          <ToolConversionBridge
            toolName="Pelvic Floor & Urogynecology Scrubber"
            contextText="Tired of commercial payers bundling cystoscopy, downcoding combined colporrhaphies, or disputing multi-channel urodynamics? Aethera's specialized FPMRS billing teams resolve complex reconstructive denials and maximize legitimate surgical reimbursement."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
