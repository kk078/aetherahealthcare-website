import { getAllPayers } from '@/lib/payers';
import { SEO_LOCATIONS, allBillingParams } from '@/lib/seo.data';

// Make this route static for export
export const dynamic = 'force-static';

export function GET() {
  const baseUrl = 'https://aetherahealthcare.com';

  const staticRoutes = [
    '/', '/about', '/services', '/specialties', '/pricing', '/process', '/contact',
    '/compliance', '/compliance/hipaa', '/compliance/privacy-policy', '/compliance/terms-of-service',
    '/compliance/baa', '/compliance/security', '/blog', '/faq', '/careers',
    '/payers', '/payer-services', '/integrations', '/portal', '/case-studies', '/decks',
  ];

  const serviceRoutes = [
    '/services/medical-coding', '/services/claims-billing', '/services/payment-posting',
    '/services/denial-management', '/services/credentialing', '/services/eligibility-verification',
    '/services/prior-authorization', '/services/patient-collections', '/services/compliance-auditing',
    '/services/telehealth-billing', '/services/ar-followup', '/services/reporting-analytics',
    // specialty service pages
    '/services/cardiology-billing', '/services/orthopedic-billing', '/services/dermatology-billing',
    '/services/psychiatry-billing', '/services/family-medicine-billing', '/services/pharmacy-billing',
    '/services/dental-billing', '/services/workers-compensation-billing', '/services/hospitalist-billing',
  ];

  // Free tools
  const toolRoutes = [
    '/tools', '/tools/denial-code-lookup', '/tools/clean-claim-scorecard', '/tools/ar-cost-calculator',
  ];

  // Payer directory
  const payerRoutes = [
    '/payers/directory',
    ...getAllPayers().map(p => `/payers/directory/${p.slug}`),
  ];

  // Comparison pages + benchmark report
  const compareRoutes = [
    '/compare',
    '/compare/outsourced-vs-in-house-medical-billing',
    '/compare/how-to-choose-a-medical-billing-company',
    '/state-of-denials',
  ];

  // Programmatic specialty × location pages
  const billingRoutes = [
    '/medical-billing',
    ...SEO_LOCATIONS.map(l => `/medical-billing/${l.slug}`),
    ...allBillingParams().map(p => `/medical-billing/${p.location}/${p.specialty}`),
  ];

  const allRoutes = [
    ...staticRoutes, ...serviceRoutes, ...toolRoutes,
    ...payerRoutes, ...compareRoutes, ...billingRoutes,
  ];

  const lastmod = new Date().toISOString();
  const priority = (route: string) => {
    if (route === '/') return '1.0';
    if (route.startsWith('/services/') || route.startsWith('/medical-billing/')) return '0.8';
    if (route.startsWith('/tools') || route.startsWith('/compare') || route.startsWith('/payers/directory')) return '0.7';
    return '0.6';
  };

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority(route)}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
