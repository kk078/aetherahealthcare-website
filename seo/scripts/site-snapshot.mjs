// One polite pass over robots.txt + sitemap.xml + every sitemap page. Records the per-page facts the
// sitemap audit, structured-data check and internal-link report need, so production is fetched once.
//   node seo/scripts/site-snapshot.mjs            (production)
//   SEO_BASE_URL=http://localhost:3100 node ...   (a local build)
// Output: seo/data/snapshot.json
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { baseUrl, config, fetchFollow, fetchSitemapUrls, isExcluded, parseRobots, seoRoot, writeJson } from './lib/common.mjs';

const root = baseUrl();
const host = new URL(root).host;
const prodHost = new URL(config.productionBase).host;
const normalise = href => {
  const url = new URL(href);
  url.hash = '';
  if (url.host === prodHost) {
    url.host = host;
    url.protocol = new URL(root).protocol;
  }
  return url.href;
};

const robotsResponse = await fetchFollow(`${root}/robots.txt`);
const robotsText = robotsResponse.response ? await robotsResponse.response.text() : '';
const robotsAllowed = parseRobots(robotsText);
const allSitemapUrls = await fetchSitemapUrls(root);
const sitemapUrls = allSitemapUrls.filter(url => !isExcluded(url));
console.log(`snapshot: ${sitemapUrls.length} sitemap URLs from ${root}`);

const pages = [];
for (const [index, url] of sitemapUrls.entries()) {
  const record = { url, path: new URL(url).pathname };
  try {
    const result = await fetchFollow(url);
    Object.assign(record, { status: result.status, finalUrl: result.finalUrl, redirectChain: result.chain });
    const response = result.response;
    record.xRobotsTag = response?.headers.get('x-robots-tag') ?? null;
    if (response && (response.headers.get('content-type') || '').includes('text/html')) {
      const $ = cheerio.load(await response.text());
      const main = $('main').length ? $('main') : $('body');
      record.title = $('head > title').first().text().trim();
      record.metaDescription = $('meta[name="description"]').attr('content')?.trim() ?? null;
      record.metaRobots = $('meta[name="robots"]').map((_, el) => $(el).attr('content')).get().join(', ') || null;
      record.canonicals = $('link[rel="canonical"]').map((_, el) => $(el).attr('href')).get();
      record.h1 = $('h1').map((_, el) => $(el).text().replace(/\s+/g, ' ').trim()).get();
      record.wordCount = main.text().replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
      record.jsonLd = $('script[type="application/ld+json"]').map((_, el) => $(el).contents().text()).get();
      const links = (scope, contextual) => scope.find('a[href]').map((_, el) => {
        try {
          const target = new URL($(el).attr('href'), result.finalUrl);
          if (!/^https?:$/.test(target.protocol)) return null;
          return { href: normalise(target.href), contextual, text: $(el).text().replace(/\s+/g, ' ').trim().slice(0, 80) };
        } catch { return null; }
      }).get().filter(Boolean);
      // "Contextual" = links in <main> outside nav/header/footer chrome; the rest are site-wide navigation.
      const chrome = 'header, nav, footer, [role="navigation"], [role="contentinfo"]';
      const contextualScope = main.clone();
      contextualScope.find(chrome).remove();
      const all = links($('body'), false);
      const contextual = new Set(links(contextualScope, true).map(link => link.href));
      record.links = all.map(link => ({ ...link, contextual: contextual.has(link.href) }))
        .filter((link, i, list) => list.findIndex(other => other.href === link.href) === i);
    }
  } catch (error) {
    record.error = String(error.message || error);
  }
  record.robotsAllowed = robotsAllowed(record.path);
  pages.push(record);
  if ((index + 1) % 50 === 0) console.log(`  ${index + 1}/${sitemapUrls.length}`);
}

const keySections = ['/', '/services/', '/medical-billing/', '/specialties/', '/pricing/', '/tools/', '/blog/', '/glossary/', '/payers/', '/payers/directory/', '/state-of-denials/', '/compare/', '/for-billing-companies/', '/integrations/', '/compliance/', '/free-assessment/', '/schedule/', '/contact/'];
await writeJson(join(seoRoot, 'data', 'snapshot.json'), {
  base: root,
  generatedAt: new Date().toISOString(),
  robots: {
    status: robotsResponse.status,
    text: robotsText,
    keySectionsBlocked: keySections.filter(path => !robotsAllowed(path)),
    excludedPathsDisallowed: ['/portal/', '/api/'].map(path => ({ path, disallowed: !robotsAllowed(path) })),
  },
  sitemapCount: sitemapUrls.length,
  excludedFromSitemap: allSitemapUrls.filter(isExcluded),
  pages,
});
console.log(`snapshot: wrote ${pages.length} pages`);
