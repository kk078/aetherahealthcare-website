import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import EndoscopicPituitaryOdontoidScrubber from '@/components/ui/EndoscopicPituitaryOdontoidScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Endoscopic Skull Base Pituitary & Odontoid Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Endoscopic Skull Base Pituitary & Odontoid Scrubber. Audit transnasal odontoidectomy (61575), transsphenoidal hypophysectomy (61548), vascularized Hadad nasoseptal flaps (+15730), and ENT/Neurosurgery co-surgeon Modifier -62.',
};

export default function EndoscopicPituitaryOdontoidScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Endoscopic Skull Base Pituitary & Odontoid Scrubber',
    url: 'https://aetherahealthcare.com/tools/endoscopic-pituitary-odontoid-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit expanded endoscopic endonasal skull base procedures, transnasal odontoidectomy, vascularized nasoseptal flap repairs, and dual-attending Modifier 62 co-surgery.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#1c1917] via-[#0f172a] to-[#292524]">
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
              Endoscopic Skull Base Pituitary &amp; Odontoid Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Expanded endoscopic endonasal approaches (EEA) allow direct ventral decompression of retroflexed odontoid pegs (CPT 61575) and total resection of sellar/clival tumors (61548/61600). Yet commercial clearinghouses routinely downcode transnasal odontoidectomy to standard transsphenoidal hypophysectomy, bundle vascularized Hadad nasoseptal flaps (+15730), and reject ENT/Neurosurgery Modifier -62 claims. Scrutinize your endoscopic skull base claims with surgical intelligence.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <EndoscopicPituitaryOdontoidScrubber />

          <ToolConversionBridge
            toolName="Endoscopic Skull Base Pituitary & Odontoid Scrubber"
            contextText="Skull base neurosurgeons and rhinologists lose significant revenue when commercial payers misclassify complex ventral craniovertebral decompression or bundle pedicled mucosal flap reconstructions."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
