import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import HeadAndNeckFreeFlapScrubber from '@/components/ui/HeadAndNeckFreeFlapScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Head & Neck Free Flap Reconstruction Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Head & Neck Free Flap Reconstruction Claim Scrubber. Audit microvascular fibula (CPT 20955), anterolateral thigh ALT (15756), mandibular plating (+21247-59), operating microscope (+69990), neck dissection (+38724-59), and tracheostomy (+31600-59).',
};

export default function HeadAndNeckFreeFlapScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Head & Neck Free Flap Reconstruction Scrubber',
    url: 'https://aetherahealthcare.com/tools/head-and-neck-free-flap-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit head and neck microvascular free flap reconstructions, defend vascularized bone graft unbundling, operating microscope add-ons, and dual-attending surgical oncology co-surgery billing.',
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#0f172a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            prefetch={false}
            href="/tools"
            className="inline-flex items-center text-purple-200/80 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to All RCM Tools
          </Link>
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-jakarta mb-4">
              Head &amp; Neck Free Flap Reconstruction Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-purple-100/90 max-w-3xl leading-relaxed">
              Complex oncologic head and neck reconstructions involving microvascular fibula osseous free flaps or anterolateral thigh (ALT) soft-tissue transfers are among the highest RVU surgical claims in medicine. Yet academic medical centers routinely suffer severe clawbacks when payers improperly bundle rigid fixation plates (+21247), deny operating microscope magnification (+69990), or misapply co-surgeon Modifier -62 fee reductions across ENT and plastic surgery teams. Scrub and defend your operative claims.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <HeadAndNeckFreeFlapScrubber />

          <ToolConversionBridge
            toolName="Head & Neck Free Flap Reconstruction Scrubber"
            contextText="Head and neck surgical teams lose over $6,400 per case when clearinghouses bundle mandibular reconstruction plates or misapply Modifier -62 fee splits across dual surgical specialties."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
