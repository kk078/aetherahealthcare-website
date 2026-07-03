#!/usr/bin/env node
/**
 * Auto-blog generator for The Aethera Pulse.
 *
 * Runs in CI (twice weekly). It:
 *   1. Loads existing posts from src/lib/blogPosts.ts
 *   2. Reads the next target keyword from scripts/keyword-queue.json (if any)
 *   3. Pulls a few recent U.S. healthcare headlines (best-effort, for freshness)
 *   4. Asks an LLM to write ONE fresh, accurate RCM article in our JSON schema,
 *      targeting that keyword and including required internal links
 *   5. Enforces internal links + a CTA (safety net), normalizes, dedupes the slug
 *   6. Inserts it at the top, rewrites blogPosts.ts, and advances the keyword queue
 *
 * LLM provider (auto-detected):
 *   OLLAMA_API_KEY    -> Ollama Cloud, OpenAI-compatible /v1/chat/completions  (preferred)
 *     OLLAMA_BASE_URL   optional (default https://ollama.com)
 *     OLLAMA_MODEL      optional (default gpt-oss:120b)
 *   ANTHROPIC_API_KEY -> Anthropic Messages API (fallback)
 *     ANTHROPIC_MODEL   optional (default claude-sonnet-4-6)
 *   AUTO_BLOG_MOCK=1  -> skip the API, insert a deterministic sample (for tests)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_FILE = resolve(__dirname, '..', 'src', 'lib', 'blogPosts.ts');
const QUEUE_FILE = resolve(__dirname, 'keyword-queue.json');
const START = 'export const POSTS: BlogPost[] = ';
const FOOTER_MARK = ';\n\nexport const CATEGORIES';

// Default internal links appended to every post as a safety net (SEO: never publish an orphan).
const DEFAULT_LINKS = [
  { href: '/services', text: 'medical billing & RCM services' },
  { href: '/free-assessment', text: 'free revenue assessment' },
];

const CATEGORIES = [
  'Denials & Appeals', 'Revenue Cycle', 'Practice Management', 'Telehealth',
  'Patient Access & Collections', 'Credentialing & Enrollment', 'Compliance & Privacy',
  'Medical Coding', 'Prior Authorization', 'Data & Analytics', 'Payer Contracting',
  'Regulatory & Policy', 'Medicare & Medicaid', 'Value-Based Care', 'Clinical Documentation',
  'Technology & AI', 'Specialty Billing',
];
const IMG = {
  'Denials & Appeals': '1519494026892-80bb41fb7d0a', 'Revenue Cycle': '1586495777744-4413f21062fa',
  'Practice Management': '1576091160550-2173dba999ef', 'Telehealth': '1581091226825-a6a2a5aee158',
  'Patient Access & Collections': '1554224155-6726b3ff858f', 'Credentialing & Enrollment': '1517242039478-88104f383fb5',
  'Compliance & Privacy': '1563986768609-322da13575f3', 'Medical Coding': '1454165804606-c3d57bc86b40',
  'Prior Authorization': '1576091160399-112ba8d25d1d', 'Data & Analytics': '1551288049-bebda4e38f71',
  'Payer Contracting': '1450101499163-c8848c66ca85', 'Regulatory & Policy': '1450101499163-c8848c66ca85',
  'Medicare & Medicaid': '1576091160550-2173dba999ef', 'Value-Based Care': '1551288049-bebda4e38f71',
  'Clinical Documentation': '1454165804606-c3d57bc86b40', 'Technology & AI': '1551288049-bebda4e38f71',
  'Specialty Billing': '1576091160550-2173dba999ef',
};
const AUTHORS = ['Jennifer Walsh', 'Michael Torres', 'Sarah Kim', 'David Chen', 'Amanda Rodriguez', 'Robert Johnson', 'Lisa Thompson', 'Mark Wilson'];
const imgUrl = (cat) => `/images/blog/${slugify(cat)}.svg`;
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);
const wordCount = (post) => post.sections.reduce((n, s) => n + (s.h ? 3 : 0) + (s.sub ? 3 : 0) + (s.p || []).join(' ').split(/\s+/).length + (s.ul || []).join(' ').split(/\s+/).length, 0);

function hasKey() { return !!(process.env.OLLAMA_API_KEY || process.env.ANTHROPIC_API_KEY); }

async function loadQueue() {
  try {
    const raw = JSON.parse(await readFile(QUEUE_FILE, 'utf8'));
    if (!raw || !Array.isArray(raw.pending)) return null;
    if (!Array.isArray(raw.done)) raw.done = [];
    return raw;
  } catch { return null; }
}

async function saveQueue(queue) {
  await writeFile(QUEUE_FILE, JSON.stringify(queue, null, 2).replace(/\r\n/g, '\n') + '\n', 'utf8');
}

async function loadPosts() {
  const content = await readFile(POSTS_FILE, 'utf8');
  const i0 = content.indexOf(START);
  if (i0 < 0) throw new Error('POSTS marker not found');
  const i1 = i0 + START.length;
  // CRLF-tolerant: match the array terminator ';' just before `export const CATEGORIES`
  const fm = content.slice(i1).match(/;\s*export const CATEGORIES/);
  if (fm == null) throw new Error('footer marker not found');
  const i2 = i1 + fm.index;
  const posts = JSON.parse(content.slice(i1, i2));
  return { header: content.slice(0, i1), footer: content.slice(i2), posts };
}

async function recentHeadlines() {
  const feeds = ['https://www.cms.gov/newsroom/rss.xml', 'https://www.beckershospitalreview.com/rss/finance.xml'];
  const titles = [];
  for (const url of feeds) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      const xml = await res.text();
      for (const m of xml.matchAll(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/g)) {
        const tt = m[1].trim();
        if (tt && tt.length > 12 && !/rss|feed/i.test(tt)) titles.push(tt);
      }
    } catch { /* best-effort */ }
  }
  return titles.slice(0, 12);
}

function buildPrompt(posts, headlines, target) {
  const existing = posts.map((p) => `- ${p.slug}: ${p.title}`).join('\n');
  const links = (target && Array.isArray(target.links) && target.links.length) ? target.links : DEFAULT_LINKS;
  const linkList = links.map((l) => `  <a href="${l.href}">${l.text}</a>`).join('\n');
  const targeting = target
    ? `PRIMARY KEYWORD: "${target.keyword}". Write the article to rank for this search. Use the keyword (or a close variant) in the title, the intro's first sentence, and at least one heading.\n- "category" MUST be exactly: ${target.category}.`
    : `- Choose a fresh, useful RCM topic not covered below.\n- "category" MUST be exactly one of: ${CATEGORIES.join(' | ')}.`;
  return `You are a senior U.S. healthcare revenue-cycle (RCM) writer for "The Aethera Pulse", the blog of Aethera Healthcare Solutions (a medical billing / RCM company).

Write ONE new, original article for U.S. medical practices. Requirements:
- Audience: U.S. practice owners, administrators, and billers.
- Be accurate and practical. Do NOT invent specific statistics, dollar amounts, dates, or "breaking" regulatory facts you are unsure about. Prefer durable, useful guidance; keep any rule/trend references general and correct.
- Must NOT duplicate any existing article below (use a different angle and a unique slug).
${targeting}
- Use 5-7 sections. The first section is the intro with only "p". End with a short "How Aethera helps" section.
- INTERNAL LINKS (required for SEO): naturally weave the following links into your paragraphs as inline HTML anchors, using this exact href for each. Every article MUST contain at least these links somewhere in the body:
${linkList}
  You may also add ONE call to action linking to a free revenue assessment at /free-assessment.
- Anchors must be plain inline HTML like <a href="/path">descriptive text</a>. Do not use markdown links. Only link to on-site paths that start with "/".

Existing articles (avoid duplicating):
${existing}

${headlines.length ? `Recent U.S. healthcare headlines you may optionally tie into, only if you can do so accurately:\n- ${headlines.join('\n- ')}\n` : ''}
Return ONLY valid JSON (no markdown, no commentary) of exactly this shape:
{"slug":"kebab-case","title":"...","category":"<one allowed category>","excerpt":"1-2 sentence summary","sections":[{"p":["intro paragraph with an inline internal link"]},{"h":"Heading","p":["paragraph"],"ul":["bullet","bullet"]}]}`;
}

// Flatten every section's text so we can check for existing links against the RAW markup
// (not JSON-escaped output — that mismatch would defeat the "already present" check).
function sectionsText(sections) {
  return sections.map((s) => [s.h, s.sub, ...(s.p || []), ...(s.ul || [])].filter(Boolean).join(' ')).join(' ');
}

// Safety net: guarantee every post has the required internal links + a CTA, even if the LLM ignored them.
function enforceInternalLinks(post, target) {
  const links = (target && Array.isArray(target.links) && target.links.length) ? target.links : DEFAULT_LINKS;
  let text = sectionsText(post.sections);
  const missing = links.filter((l) => !text.includes(`href="${l.href}"`));
  if (missing.length) {
    const items = missing.map((l) => `<a href="${l.href}">${l.text}</a>`);
    const list = items.length > 1
      ? items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]
      : items[0];
    post.sections.push({ h: 'Related resources', p: [`Explore Aethera's ${list} to go deeper on this topic.`] });
    text = sectionsText(post.sections);
  }
  if (!text.includes('href="/free-assessment"')) {
    post.sections.push({ p: ['Not sure where your revenue is leaking? <a href="/free-assessment">Get a free revenue assessment</a> and we will show you exactly where to recover it.'] });
  }
  return post;
}

function parseJsonObject(text) {
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error('no JSON object in LLM output');
  return JSON.parse(text.slice(a, b + 1));
}

async function generateViaLLM(posts, headlines, target) {
  const prompt = buildPrompt(posts, headlines, target);

  if (process.env.OLLAMA_API_KEY) {
    const base = (process.env.OLLAMA_BASE_URL || 'https://ollama.com').replace(/\/+$/, '');
    const model = process.env.OLLAMA_MODEL || 'gpt-oss:120b';
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.OLLAMA_API_KEY}` },
      body: JSON.stringify({
        model, temperature: 0.7, max_tokens: 4000,
        messages: [
          { role: 'system', content: 'You are a precise assistant. Output only valid JSON with no markdown fences.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Ollama API ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    return parseJsonObject(text);
  }

  if (process.env.ANTHROPIC_API_KEY) {
    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 4000, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    const text = (data.content || []).map((c) => c.text || '').join('');
    return parseJsonObject(text);
  }

  throw new Error('no LLM key configured');
}

function mockPost(existingSlugs) {
  let slug = 'auto-blog-self-test', n = 1;
  while (existingSlugs.has(slug)) slug = `auto-blog-self-test-${++n}`;
  return {
    slug, title: 'Auto-Blog Self Test (safe to delete)', category: 'Revenue Cycle',
    excerpt: 'A deterministic sample used to validate the auto-blog file rewrite. Safe to delete.',
    sections: [{ p: ['This is a test article generated in mock mode to validate the pipeline.'] }, { h: 'Section', p: ['Body paragraph.'], ul: ['One', 'Two'] }],
  };
}

function normalize(raw, posts) {
  if (!raw || !raw.title || !Array.isArray(raw.sections) || !raw.sections.length) throw new Error('LLM returned invalid post');
  const category = CATEGORIES.includes(raw.category) ? raw.category : 'Revenue Cycle';
  const existing = new Set(posts.map((p) => p.slug));
  let slug = slugify(raw.slug || raw.title) || 'rcm-insight';
  let s = slug, k = 1; while (existing.has(s)) s = `${slug}-${++k}`; slug = s;
  const sections = raw.sections.map((sec) => {
    const o = {};
    if (sec.h) o.h = String(sec.h);
    if (sec.sub) o.sub = String(sec.sub);
    if (Array.isArray(sec.p) && sec.p.length) o.p = sec.p.map(String);
    if (Array.isArray(sec.ul) && sec.ul.length) o.ul = sec.ul.map(String);
    return o;
  }).filter((o) => o.h || o.sub || o.p || o.ul);
  if (!sections.length) throw new Error('no usable sections');
  const post = {
    slug, title: String(raw.title), category,
    author: AUTHORS[Math.floor(Math.random() * AUTHORS.length)],
    date: new Date().toISOString().slice(0, 10),
    readTime: '', image: imgUrl(category),
    excerpt: String(raw.excerpt || raw.title), sections,
  };
  post.readTime = `${Math.max(5, Math.min(14, Math.round(wordCount(post) / 200)))} min read`;
  return post;
}

async function main() {
  const { header, footer, posts } = await loadPosts();
  const existingSlugs = new Set(posts.map((p) => p.slug));
  const queue = await loadQueue();
  const target = queue && queue.pending.length ? queue.pending[0] : null;
  if (target) console.log(`Targeting queued keyword: "${target.keyword}" (${target.category})`);
  else console.log('Keyword queue empty or missing — falling back to free-choice topic.');

  let post;
  if (process.env.AUTO_BLOG_MOCK === '1') {
    post = normalize(mockPost(existingSlugs), posts);
  } else {
    if (!hasKey()) { console.log('No OLLAMA_API_KEY / ANTHROPIC_API_KEY set — skipping (no post generated).'); return; }
    const headlines = await recentHeadlines();
    post = normalize(await generateViaLLM(posts, headlines, target), posts);
  }

  enforceInternalLinks(post, target);
  post.readTime = `${Math.max(5, Math.min(14, Math.round(wordCount(post) / 200)))} min read`;
  posts.unshift(post);
  const outContent = (header + JSON.stringify(posts, null, 2) + footer).replace(/\r\n/g, '\n');
  await writeFile(POSTS_FILE, outContent, 'utf8');

  // Advance the keyword queue: move the consumed target from pending -> done.
  if (queue && target) {
    queue.pending.shift();
    queue.done.push({ ...target, slug: post.slug, publishedAt: post.date });
    await saveQueue(queue);
    console.log(`Queue advanced: ${queue.pending.length} keywords remaining.`);
  }

  console.log(`AUTO_BLOG_NEW_SLUG=${post.slug}`);
  console.log(`Added: "${post.title}" (${post.category}) — total ${posts.length} posts.`);
}

main().catch((e) => { console.error('auto-blog failed:', e.message); process.exit(1); });
