import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SkullBaseBypassAneurysmScrubber from '@/components/ui/SkullBaseBypassAneurysmScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Complex EC-IC Cerebrovascular Bypass & Aneurysm Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Complex EC-IC Cerebrovascular Bypass & Aneurysm Scrubber. Audit STA-MCA microvascular bypass (61711), unbundle orbitozygomatic approaches (61592), defend autologous graft harvest (+35500/35600), and capture operating microscope (+69990) and co-surgeon Modifier -62.',
};

export default function SkullBaseBypassAneurysmScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Complex EC-IC Cerebrovascular Bypass & Aneurysm Scrubber',
    url: 'https://aetherahealthcare.com/tools/skull-base-bypass-aneurysm-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit microvascular extracranial-to-intracranial (EC-IC) bypass, skull base approaches, autologous vein/artery graft harvesting, and co-surgeon Modifier 62 coordination.',
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
              Complex EC-IC Cerebrovascular Bypass &amp; Aneurysm Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Extracranial-to-intracranial (EC-IC) revascularization for unclippable giant cerebral aneurysms and skull base tumors represents the pinnacle of microvascular neurosurgery. Yet commercial clearinghouses routinely bundle skull base orbitozygomatic approaches (61592) into primary anastomosis (61711), disallow separate saphenous/radial interposition graft harvests (+35500/35600), and reject operating microscope add-ons (+69990). Audit your cerebrovascular cases with intelligent surgical edits.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <SkullBaseBypassAneurysmScrubber />

          <ToolConversionBridge
            toolName="Complex EC-IC Cerebrovascular Bypass & Aneurysm Scrubber"
            contextText="Cerebrovascular neurosurgeons and tertiary skull base institutes face severe reimbursement clawbacks on microvascular arterial bypasses, autologous vein harvesting, and dual-surgeon Modifier -62 claims."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
