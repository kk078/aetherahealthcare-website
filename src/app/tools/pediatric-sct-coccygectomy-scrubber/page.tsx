import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import PediatricSctCoccygectomyScrubber from '@/components/ui/PediatricSctCoccygectomyScrubber';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: {
    absolute: 'Pediatric SCT & Coccygectomy Scrubber | Free RCM Tool | Aethera Healthcare',
  },
  description:
    'Free Pediatric Sacrococcygeal Teratoma & Coccygectomy Scrubber. Audit presacral teratoma resection (49220/45120), en-bloc coccygectomy (27075-59), combined abdominoperineal approach (49000-59), and pelvic floor reconstruction.',
};

export default function PediatricSctCoccygectomyScrubberPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Pediatric SCT & Coccygectomy Scrubber',
    url: 'https://aetherahealthcare.com/tools/pediatric-sct-coccygectomy-scrubber',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    description:
      'Audit neonatal sacrococcygeal teratoma (SCT) resections, en-bloc coccygectomy unbundling defenses, abdominoperineal two-incision staging, and pelvic floor levatorplasty.',
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
              Pediatric SCT &amp; Coccygectomy Scrubber
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-teal-100/90 max-w-3xl leading-relaxed">
              Neonatal sacrococcygeal teratoma (SCT) excision mandates en-bloc coccygectomy to prevent fatal malignant recurrence. Yet pediatric surgery programs routinely experience severe reimbursement clawbacks when commercial clearinghouses bundle the mandatory coccygectomy (CPT 27075), deny the distinct abdominal laparotomy incision (49000-59), or disallow pelvic floor levator ani reconstruction (49900). Scrub and defend your pediatric oncologic claims.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#fbf9f6] flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <PediatricSctCoccygectomyScrubber />

          <ToolConversionBridge
            toolName="Pediatric SCT & Coccygectomy Scrubber"
            contextText="Children's surgical hospitals lose up to $4,150 per neonatal case when clearinghouses bundle coccygectomy bone resections into soft-tissue tumor codes or reject dual-incision approaches."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
