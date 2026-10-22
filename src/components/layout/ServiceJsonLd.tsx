import { SITE, canonicalUrl } from '@/lib/siteConfig';

/** Service + BreadcrumbList structured data for a /services/* page (same Service shape as the RCM service pages). */
export default function ServiceJsonLd({ name, path, description }: { name: string; path: string; description?: string | null }) {
  const url = canonicalUrl(path);
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'Service', name, serviceType: name, url,
      ...(description && { description }),
      provider: { '@type': 'Organization', name: SITE.name, url: SITE.url, logo: `${SITE.url}/brand/logo-800x240.png` },
      areaServed: 'United States', category: 'Healthcare Services',
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Services', item: canonicalUrl('/services') },
        { '@type': 'ListItem', position: 3, name, item: url },
      ],
    },
  ];
  // Static page data, but escape "<" so no string can close the script element.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />;
}
