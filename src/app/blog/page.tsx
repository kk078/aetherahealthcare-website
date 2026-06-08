import type { Metadata } from 'next';
import BlogIndexClient from './BlogIndexClient';

export const metadata: Metadata = {
  title: { absolute: 'The Aethera Pulse — Revenue Cycle Insights for U.S. Healthcare | Aethera Healthcare Solutions' },
  description:
    'Sharp, practical insights on U.S. healthcare revenue cycle management — denials, prior authorization, coding, compliance, telehealth billing, payer contracts and the data behind getting paid faster.',
  alternates: { canonical: '/blog' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'The Aethera Pulse — Aethera Healthcare Solutions Blog',
  url: 'https://aetherahealthcare.com/blog',
  description: "Insights, data, and field-tested strategies to optimize your medical practice's revenue cycle.",
  publisher: {
    '@type': 'Organization',
    name: 'Aethera Healthcare Solutions',
    logo: { '@type': 'ImageObject', url: 'https://aetherahealthcare.com/logo.png' },
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogIndexClient />
    </>
  );
}
