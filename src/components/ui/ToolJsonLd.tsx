'use client';
import { usePathname } from 'next/navigation';
import { TOOLS } from '@/lib/toolRegistry';
import { SITE, canonicalUrl } from '@/lib/siteConfig';
/** WebApplication + BreadcrumbList structured data for every registered tool page. */
export default function ToolJsonLd() {
  const pathname = usePathname().replace(/\/$/, '');
  const tool = TOOLS.find(t => t.href === pathname);
  if (!tool || pathname.endsWith('/platform-telemetry')) return null;
  const url = canonicalUrl(tool.href);
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'WebApplication', name: tool.name, description: tool.desc, url,
      applicationCategory: 'BusinessApplication', operatingSystem: 'Web', isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Free Tools', item: canonicalUrl('/tools') },
        { '@type': 'ListItem', position: 3, name: tool.name, item: url },
      ],
    },
  ];
  // Registry data is static, but escape "<" so no string can close the script element.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />;
}
