import { getAllPayers } from '@/lib/payers';
import { SEO_SPECIALTIES } from '@/lib/seo.data';
import { POSTS } from '@/lib/blogPosts';
import { ROUTES } from '@/lib/routes.generated';
import { canonicalUrl } from '@/lib/siteConfig';
export const dynamic = 'force-static';
export function GET() {
  const entries = new Map<string, string | undefined>();
  for (const route of ROUTES) if (route.indexable) entries.set(route.path, undefined);
  for (const payer of getAllPayers()) entries.set(`/payers/directory/${payer.slug}`, undefined);
  for (const specialty of SEO_SPECIALTIES) entries.set(`/medical-billing/${specialty.slug}`, undefined);
  for (const post of POSTS) entries.set(`/blog/${post.slug}`, post.date);
  const xml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...entries].map(([path, modified]) => `  <url><loc>${xml(canonicalUrl(path))}</loc>${modified ? `<lastmod>${xml(modified)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
}
