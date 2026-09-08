import { canonicalUrl } from '@/lib/siteConfig';
import { TOOLS } from '@/lib/toolRegistry';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import ToolsDirectory from '@/components/ui/ToolsDirectory';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/tools') },
  title: { absolute: `${TOOLS.length} Free Medical Billing, EDI & RCM Tools | Aethera Healthcare` },
  description:
    'Free educational tools for revenue cycle teams: pediatric Hirschsprung pull-through scrubber, head & neck free flap reconstruction scrubber, pediatric TEF & esophageal atresia scrubber, DIEP flap breast reconstruction scrubber, and EDI parsers. No login required.',
};

export default function ToolsHub() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9]">
      <Navbar />

      <RcmHeroBand
        eyebrow="Free · No Login Required"
        title={`${TOOLS.length} Free Medical Billing & RCM Tools`}
        subtitle="Explore billing checklists, illustrative financial calculators and EDI parsers. Each tool states its review status and requires confirmation against current payer policies."
        primary={{ href: '#tools', label: `Explore All ${TOOLS.length} Tools` }}
        secondary={{ href: '/free-assessment', label: 'Get a Free Practice Audit' }}
        chips={[`${TOOLS.length} Free Tools`, 'No Login Required', 'Educational References', 'Review Before Use']}
      />

      <section id="tools" className="py-12 md:py-16 flex-1 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <aside className="surface-card border rounded-2xl p-6 mb-8">
            <h2 className="font-bold text-lg">Featured Interactive Simulation</h2>
            <p className="text-muted text-sm my-2">Explore the provider portal with illustrative claims and financial data.</p>
            <Link href="/portal/" className="text-teal font-semibold underline">Explore Portal Demo</Link>
          </aside>
          <ToolsDirectory />

          <div className="mt-14 text-center p-6 rounded-2xl bg-white border border-gray/20 shadow-2xs">
            <p className="text-xs sm:text-sm text-slate-600 mb-2">
              Looking for our national clearinghouse directory? Explore timely-filing limits, EDI capabilities, and electronic routing IDs.
            </p>
            <Link
              prefetch={false}
              href="/payers/directory"
              className="inline-flex items-center text-teal hover:text-navy font-bold text-xs sm:text-sm"
            >
              Open 10,600+ Payer Directory <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white border-t border-gray/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-navy mb-2">Rather Have Us Manage Your Entire Revenue Cycle?</h2>
          <p className="text-slate-600 mb-6 text-sm max-w-2xl mx-auto leading-relaxed">
            These tools reveal where revenue leaks. Aethera’s end-to-end team plugs the leaks permanently — charge capture, automated scrubbing, certified coding, denial recovery, and sub-30 day A/R compaction.
          </p>
          <Link
            prefetch={false}
            href="/free-assessment"
            className="inline-block bg-teal hover:bg-navy text-white font-bold py-3 px-8 rounded-full transition-colors text-xs sm:text-sm shadow-sm"
          >
            Request Free Practice Assessment
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
