import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import ARCostCalculator from '@/components/ui/ARCostCalculator';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: { absolute: 'A/R Days Cost Calculator — What Slow Accounts Receivable Costs You | Aethera Healthcare Solutions' },
  description:
    'Free A/R days cost calculator. See the cash tied up in slow accounts receivable and the annual carrying cost of staying above your target days-in-A/R.',
};

export default function ARCostCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      <section className="pt-24 pb-12 md:pt-28 md:pb-14 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link prefetch={false} href="/tools" className="inline-flex items-center text-cream/80 hover:text-white text-sm mb-5">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> All tools
          </Link>
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-playfair mb-4">A/R Days Cost Calculator</h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-xl text-cream max-w-3xl">
              Every extra day in A/R is cash sitting on the sidelines. See what slow collections tie up — and what it
              costs you to leave it there.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ARCostCalculator />
        </div>
      </section>

      <Footer />
    </div>
  );
}
