import { MetadataRoute } from 'next';

// Make this route static for export
export const dynamic = 'force-static';

export function GET() {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://aetherahealthcare.com/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}