import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DenialsReport from '@/components/ui/DenialsReport';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import { marketingMetadata } from '@/lib/marketing';
export const metadata = marketingMetadata('/state-of-denials', 'Medical Billing Denial Review Guide', 'Review denial documentation, adjustment reasons and follow-up steps by specialty. Access current primary reference collections and request a practice-specific review.');
export default function StateOfDenialsPage() {
  return <div className="flex min-h-screen flex-col"><Navbar /><RcmHeroBand eyebrow="Free Specialty Guide" title="Understand your denials. Plan the next review." subtitle="A practical review checklist with primary reference links. Use your own practice data to establish a baseline." primary={{ href: '/lp/denial-recovery-sprint/', label: 'Explore the 48-Hour Denial Sprint' }} chips={['By specialty', 'Evidence first', 'Free guide']} /><main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12"><DenialsReport /></main><Footer /></div>;
}
