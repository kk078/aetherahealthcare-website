import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import CaseStudiesDirectory from '@/components/ui/CaseStudiesDirectory';

export const metadata: Metadata = {
  title: { absolute: 'Medical Billing Case Studies by Specialty | Aethera Healthcare' },
  description:
    'Documented case studies across 10 medical specialties showing measurable 15%–25% revenue lifts, 75%+ denial reductions, and Days in AR compacted under 26 days.',
};

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9]">
      <Navbar />

      <RcmHeroBand
        eyebrow="Clinical & Financial Case Studies"
        title="Real practices. Measurable results."
        subtitle="Explore documented financial outcomes across 10 clinical specialties — proving our 98.7% clean claim rate, sub-30 day A/R compaction, and aggressive denial overturns."
        primary={{ href: '/free-assessment', label: 'Get a Free Practice Audit' }}
        chips={['+15–25% Collection Lift', 'Denials Cut by 75%', 'Days in A/R Under 28d', 'Zero Setup Fees']}
      />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <CaseStudiesDirectory />
      </main>

      <Footer />
    </div>
  );
}
