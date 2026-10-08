import { marketingMetadata } from '@/lib/marketing';
import { canonicalUrl } from '@/lib/siteConfig';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import CaseStudiesDirectory from '@/components/ui/CaseStudiesDirectory';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/case-studies') },
  title: { absolute: 'Medical Billing Workflows by Specialty | Aethera Healthcare' },
  description:
    'Specialty billing workflows, documentation checkpoints and evidence requirements for verified customer outcomes.',

  ...marketingMetadata("/case-studies", 'Medical Billing Workflows by Specialty | Aethera Healthcare', 'Specialty billing workflows, documentation checkpoints and evidence requirements for verified customer outcomes.'),
};

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9]">
      <Navbar />

      <RcmHeroBand
        eyebrow="Specialty Billing Workflows"
        title="Billing challenges. Clear review steps."
        subtitle="Explore specialty billing workflows and documentation checkpoints, then request a review using your own practice data."
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
