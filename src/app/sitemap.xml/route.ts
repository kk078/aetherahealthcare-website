import { MetadataRoute } from 'next';

// Make this route static for export
export const dynamic = 'force-static';

export async function GET() {
  const baseUrl = 'https://aetherahealthcare.com';

  // Define all static routes
  const staticRoutes = [
    '/',
    '/about',
    '/services',
    '/specialties',
    '/pricing',
    '/process',
    '/contact',
    '/compliance',
    '/compliance/hipaa',
    '/compliance/privacy-policy',
    '/compliance/terms-of-service',
    '/compliance/baa',
    '/compliance/security',
    '/blog',
    '/faq',
    '/careers'
  ];

  // Define service routes
  const serviceRoutes = [
    '/services/medical-coding',
    '/services/claims-billing',
    '/services/payment-posting',
    '/services/denial-management',
    '/services/credentialing',
    '/services/eligibility-verification',
    '/services/prior-authorization',
    '/services/patient-collections',
    '/services/compliance-auditing',
    '/services/telehealth-billing',
    '/services/ar-followup',
    '/services/reporting-analytics'
  ];

  // Combine all routes
  const allRoutes = [...staticRoutes, ...serviceRoutes];

  // Generate sitemap entries
  const sitemapEntries = allRoutes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route === '/' ? 1.0 : route.includes('/services/') ? 0.8 : 0.7
  }));

  // Create sitemap XML
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(entry => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>
`).join('')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}