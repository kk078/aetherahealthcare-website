import { marketingMetadata } from '@/lib/marketing';
import type { Metadata } from 'next';
import FreeAssessmentClient from './FreeAssessmentClient';
import BreadcrumbJsonLd from '@/components/layout/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: { absolute: 'Free A/R Gap Analysis & Revenue Assessment | Aethera Healthcare Solutions' },
  description:
    'Build your free A/R gap analysis in minutes. Enter your practice details and accounts-receivable aging to instantly see at-risk revenue, what’s recoverable, your A/R health score and DSO gap — on-screen instantly and downloadable as a PDF.',
  alternates: { canonical: '/free-assessment/' },

  ...marketingMetadata("/free-assessment", 'Free A/R Gap Analysis & Revenue Assessment | Aethera Healthcare Solutions', 'Build your free A/R gap analysis in minutes. Enter your practice details and accounts-receivable aging to instantly see at-risk revenue, what’s recoverable, your A/R health score and DSO gap — on-screen instantly and downloadable as a PDF.'),
};

export default function Page() {
  return <><BreadcrumbJsonLd trail={[{ name: 'Free Assessment', path: '/free-assessment/' }]} /><FreeAssessmentClient /></>;
}
