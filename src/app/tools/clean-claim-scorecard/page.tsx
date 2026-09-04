import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import CleanClaimScorecard from '@/components/ui/CleanClaimScorecard';
import { ArrowLeft } from 'lucide-react';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';

export const metadata = {
  title: { absolute: 'Clean-Claim Scorecard — Rate Your First-Pass Claim Readiness | Aethera Healthcare Solutions' },
  description:
    'Free clean-claim readiness scorecard. Check your front-end, coding, and submission workflow against 14 controls and see which CARC/RARC denials each gap invites.',
};

export default function CleanClaimScorecardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-8 pb-10 md:pt-12 md:pb-12 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link prefetch={false} href="/tools" className="inline-flex items-center text-cream/80 hover:text-white text-sm mb-5">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> All tools
          </Link>
          <FadeIn>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-jakarta mb-4">Clean-Claim Scorecard</h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-xl text-cream max-w-3xl">
              First-pass acceptance is the cheapest revenue you have. Check the controls your workflow actually runs —
              each gap shows the denial it invites.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <CleanClaimScorecard />
          <ToolConversionBridge
            toolName="Clean-Claim Scorecard"
            contextText="Found gaps in your front-end intake or coding controls? Aethera guarantees 98%+ clean claims backed by written SLAs."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
