import type { Metadata } from 'next';
import FreeAssessmentClient from './FreeAssessmentClient';

export const metadata: Metadata = {
  title: { absolute: 'Free A/R Gap Analysis & Revenue Assessment | Aethera Healthcare Solutions' },
  description:
    'Build your free A/R gap analysis in minutes. Enter your practice details and accounts-receivable aging to instantly see at-risk revenue, what’s recoverable, your A/R health score and DSO gap — emailed to you and downloadable as a PDF.',
  alternates: { canonical: '/free-assessment' },
};

export default function Page() {
  return <FreeAssessmentClient />;
}
