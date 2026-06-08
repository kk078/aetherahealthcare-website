import type { Metadata } from 'next';
import GapAnalysisRedirect from './GapAnalysisRedirect';

export const metadata: Metadata = {
  title: { absolute: 'A/R Gap Analysis | Aethera Healthcare Solutions' },
  description: 'The A/R Gap Analysis now lives on our Free Assessment page. Build your personalized A/R gap report in minutes.',
  alternates: { canonical: '/free-assessment' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <GapAnalysisRedirect />;
}
