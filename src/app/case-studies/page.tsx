import { canonicalUrl } from '@/lib/siteConfig';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import CaseStudiesDirectory from '@/components/ui/CaseStudiesDirectory';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/case-studies') },
  title: { absolute: 'Medical Billing Case Studies by Specialty | Aethera Healthcare' },
  description:
    'Illustrative billing scenarios across medical specialties, with clearly stated evidence requirements for verified customer outcomes.',
};

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9]">
      <Navbar />

      <RcmHeroBand
        eyebrow="Clinical & Financial Case Studies"
        title="Billing challenges. Practical scenarios."
        subtitle="Explore educational examples across specialties. Scenario figures are illustrative; request a documented practice review for your own results."
        primary={{ href: '/free-assessment', label: 'Get a Free Practice Audit' }}
        chips={['Specialty workflows', 'Clear assumptions', 'Practice-specific review']}
      />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <CaseStudiesDirectory />
      </main>

      <Footer />
    </div>
  );
}
