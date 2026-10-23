import { marketingMetadata } from '@/lib/marketing';
import { POSTS } from '@/lib/blogPosts';
import type { Metadata } from 'next';
import BlogIndexClient from './BlogIndexClient';

export const metadata: Metadata = {
  title: { absolute: 'The Aethera Pulse — Revenue Cycle Insights' },
  description:
    'Practical insights on U.S. revenue cycle management: denials, prior authorization, coding, compliance, payer contracts and getting paid faster.',
  alternates: { canonical: '/blog/' },

  ...marketingMetadata("/blog", 'The Aethera Pulse — Revenue Cycle Insights', 'Practical insights on U.S. revenue cycle management: denials, prior authorization, coding, compliance, payer contracts and getting paid faster.'),
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
    logo: { '@type': 'ImageObject', url: 'https://aetherahealthcare.com/brand/logo-800x240.png' },
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogIndexClient blogPosts={POSTS.map(({ slug, title, date, category, excerpt, image, readTime }) => ({ slug, title, date, author: 'Aethera Editorial Team', category, excerpt, image, readTime }))} />
    </>
  );
}
