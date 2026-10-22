// Shared helpers for the SEO scripts: config, exclusion guard (no /portal, no /api — HIPAA hygiene),
// identifiable User-Agent, polite fetching and robots.txt checks.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

export const seoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const repoRoot = join(seoRoot, '..');
export const config = JSON.parse(readFileSync(join(seoRoot, 'config', 'urls.json'), 'utf8'));
export const userAgent = config.userAgent;
// Optional shared secret so a Cloudflare WAF skip rule can match more than a spoofable UA (seo/README.md).
// Sent only by politeFetch and only to our own host; browser-based tools would leak it to third parties.
const botToken = process.env.SEO_BOT_TOKEN;
const excluded = config.excludePatterns.map(pattern => new RegExp(pattern));

export const baseUrl = () => (process.env.SEO_BASE_URL || config.productionBase).replace(/\/$/, '');
export const templateFor = path => config.templates.find(entry => entry.path === path)?.template ?? path;

export function isExcluded(url) {
  const { pathname } = new URL(url, config.productionBase);
  return excluded.some(pattern => pattern.test(pathname));
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const delayMs = Number(process.env.SEO_CRAWL_DELAY_MS ?? 500);
let last = 0;

// Every outbound request goes through here: refuses excluded paths, sends the bot UA, rate-limits.
export async function politeFetch(url, options = {}) {
  if (isExcluded(url)) throw new Error(`Refusing to fetch excluded path: ${url}`);
  const wait = last + delayMs - Date.now();
  if (wait > 0) await sleep(wait);
  last = Date.now();
  return fetch(url, { redirect: 'manual', ...options, headers: { 'User-Agent': userAgent, ...(botToken && new URL(url).host === new URL(config.productionBase).host && { 'X-Aethera-SEO-Token': botToken }), ...options.headers }, signal: AbortSignal.timeout(30_000) });
}

// Follow redirects manually so chains are visible. Returns { status, finalUrl, chain, response }.
export async function fetchFollow(url, max = 10) {
  const chain = [];
  let current = url;
  for (let hop = 0; hop <= max; hop += 1) {
    const response = await politeFetch(current);
    const location = response.headers.get('location');
    if (response.status >= 300 && response.status < 400 && location) {
      chain.push({ url: current, status: response.status });
      await response.body?.cancel();
      current = new URL(location, current).href;
      if (isExcluded(current)) return { status: response.status, finalUrl: current, chain, response: null, excluded: true };
      continue;
    }
    return { status: response.status, finalUrl: current, chain, response };
  }
  return { status: 0, finalUrl: current, chain, response: null, error: 'too many redirects' };
}

export async function fetchSitemapUrls(root = baseUrl()) {
  const parser = new XMLParser();
  const queue = [`${root}/sitemap.xml`];
  const urls = [];
  while (queue.length) {
    const { response } = await fetchFollow(queue.shift());
    if (!response?.ok) throw new Error(`Sitemap fetch failed: ${response?.status}`);
    const xml = parser.parse(await response.text());
    const list = value => (Array.isArray(value) ? value : value ? [value] : []);
    for (const entry of list(xml.sitemapindex?.sitemap)) queue.push(entry.loc);
    for (const entry of list(xml.urlset?.url)) urls.push(entry.loc);
  }
  // A local base rewrites production URLs so the same sitemap can audit a build.
  return urls.map(url => url.replace(config.productionBase, root)); // callers must filter with isExcluded()
}

// Minimal robots.txt evaluation (groups for our UA or *, longest-match Allow/Disallow).
export function parseRobots(text, agent = 'AetheraSEOBot') {
  const groups = [];
  let group = null;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/#.*/, '').trim();
    const match = line.match(/^([\w-]+)\s*:\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    const field = key.toLowerCase();
    if (field === 'user-agent') {
      if (!group || group.rules.length) groups.push((group = { agents: [], rules: [] }));
      group.agents.push(value.toLowerCase());
    } else if ((field === 'allow' || field === 'disallow') && group) group.rules.push({ allow: field === 'allow', path: value });
  }
  const mine = groups.filter(entry => entry.agents.some(name => agent.toLowerCase().includes(name) && name !== '*'));
  const rules = (mine.length ? mine : groups.filter(entry => entry.agents.includes('*'))).flatMap(entry => entry.rules);
  return path => {
    let best = { allow: true, length: -1 };
    for (const rule of rules) {
      if (!rule.path) continue;
      const pattern = new RegExp('^' + rule.path.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$'));
      if (pattern.test(path) && rule.path.length > best.length) best = { allow: rule.allow, length: rule.path.length };
    }
    return best.allow;
  };
}

export function writeJson(path, data) {
  return import('node:fs').then(({ mkdirSync, writeFileSync }) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  });
}
