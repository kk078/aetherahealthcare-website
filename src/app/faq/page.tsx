import { canonicalUrl } from '@/lib/siteConfig';
import FaqClient from './FaqClient';

export const metadata = {
  alternates: { canonical: canonicalUrl('/faq') },
  title: "Frequently Asked Questions",
  description: "Answers to common questions about Aethera's medical billing and revenue cycle management — onboarding, pricing, HIPAA compliance, reporting, and the payers and specialties we serve.",
};

export default function FAQPage() {
  return <FaqClient />;
}
