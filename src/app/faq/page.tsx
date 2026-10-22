import { marketingMetadata } from '@/lib/marketing';
import { canonicalUrl } from '@/lib/siteConfig';
import FaqClient from './FaqClient';

export const metadata = {
  alternates: { canonical: canonicalUrl('/faq') },
  title: "Frequently Asked Questions",
  description: "Answers about Aethera's medical billing and RCM: onboarding, pricing, HIPAA compliance, reporting, and the payers and specialties we serve.",

  ...marketingMetadata("/faq", "Frequently Asked Questions", "Answers about Aethera's medical billing and RCM: onboarding, pricing, HIPAA compliance, reporting, and the payers and specialties we serve."),
};

export default function FAQPage() {
  return <FaqClient />;
}
