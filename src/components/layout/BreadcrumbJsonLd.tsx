import { canonicalUrl } from '@/lib/siteConfig';

export type Crumb = { name: string; path: string };

/** BreadcrumbList structured data (no visible crumbs). Home is prepended; pass the trail after it. */
export default function BreadcrumbJsonLd({ trail }: { trail: Crumb[] }) {
  const ld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((crumb, i) => (
      { '@type': 'ListItem', position: i + 1, name: crumb.name, item: canonicalUrl(crumb.path) }
    )),
  };
  // Static page data, but escape "<" so no string can close the script element.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />;
}
