# SEO findings: prioritised fix list

First full run on 2026-10-22, against production (https://aetherahealthcare.com, 534 sitemap URLs,
787 URLs crawled by SEOnaut). The data is in `seo/reports/2026-10-22-baseline.md`. Regenerate it with
`make seo-weekly`.

**Score = impact × ease**, each rated 1–5. Impact means effect on indexing, rankings or conversions.
Ease 5 is a one-line or mechanical change; ease 1 needs design or content work. Ties go to the higher
impact. **PR** links a fix branch; *decision* means the fix needs a content, brand or Cloudflare
decision from you before code changes.

| # | Score | Issue | Where (exact pages) | Fix | Detected by | Status |
|--:|--:|---|---|---|---|---|
| 1 | 25 | **Organization logo URL is a 404.** `https://aetherahealthcare.com/logo.png` does not exist but is the `logo` in the Organization JSON-LD | 23 pages, from 23 source files: `src/app/page.tsx:146`, `about`, `compliance`, `careers`, `specialties`, all `services/*` … | Point `logo` at `/brand/logo-800x240.png` (exists, 200, meets Google's 112 px minimum) | linkinator (internal 404), SEOnaut | **Fixed**: #3, live 2026-10-22 |
| 2 | 20 | **Lighthouse SEO gate fails on the homepage (0.92 < 0.95).** 12 "Learn more" links share identical anchor text | `/` (`src/components/ui/ServiceCard.tsx:33`); same pattern on `/services/medical-coding/`, `/services/credentialing/`, `/services/compliance-auditing/`, `/compliance/` | Keep the visible text and add an sr-only suffix, e.g. "Learn more *about Denial Management*" | Lighthouse `link-text` (mobile + desktop) | **Fixed**: #4, live; homepage SEO 100 |
| 3 | 16 | **205 payer pages are orphans.** `/payers/directory/` paginates on the client (24 per page), so crawlers only reach payers 1–24 through HTML links. The rest are discoverable only via the sitemap | `/payers/directory/*` (205 of 229; e.g. `/payers/directory/aultcare/`, `/avmed/`, `/priority-health/`) | Render a static A–Z index of every payer link on `/payers/directory/`, below the interactive directory | internal-links report, SEOnaut `ERROR_ORPHAN` | **Fixed**: #6, live; 229/229 linked; SEOnaut orphans 206 → 1 |
| 4 | 15 | **44 internal links omit the trailing slash** and cost an extra 308 hop each (`trailingSlash: true`) | `/contact`, `/free-assessment`, `/pricing`, `/services/*`, `/tools/*`, `/blog/*`, `/medical-billing/*`, `/compare/*`; hrefs in `TopContactBar`, `ExitIntentCTA`, `ToolConversionBridge`, tool components, blog/compare pages | Add the trailing slash to every internal `href` | SEOnaut `ERROR_30x`, gateway log (44 × 308) | **Fixed**: #5, live; SEOnaut redirect hops 44 → 0 |
| 5 | 12 | **The 8 specialty service pages have no structured data and weak contextual linking** (1–2 in-content links each; the rest are nav and footer only) | `/services/cardiology-billing/`, `/orthopedic-billing/`, `/dermatology-billing/`, `/psychiatry-billing/`, `/family-medicine-billing/`, `/telehealth-billing/`, `/workers-compensation-billing/`, `/specialties/` | Add `Service` + `BreadcrumbList` JSON-LD (match `/services/denial-management/`). Link each from its `/medical-billing/<specialty>/` page and the matching blog guide with descriptive anchors | structured-data, internal-links | **Partly fixed**: #13, live (Service + BreadcrumbList on all 8). Contextual links still open (*decision*: anchor copy) |
| 6 | 12 | **11 internal links point at non-canonical URLs**, e.g. `/medical-billing/cardiology/` → canonical `/services/cardiology-billing/` | links to `/medical-billing/{cardiology,dermatology,family-medicine,orthopedics,behavioral-health}/` and `/free-assessment/?intent=partner_pilot` | Link to the canonical URL directly | SEOnaut `NON_CANONICAL_IN_SITEMAP` (despite the name, these are internal links) | *decision* (whether the `/medical-billing/` duplicates should stay) |
| 7 | 12 | **`/api/` is not disallowed in robots.txt** | `src/app/robots.txt/route.ts` | Add `Disallow: /api/`. Keep `/portal/` crawlable: it is `noindex`, and a Disallow would hide that from Google | sitemap/robots audit | **Fixed**: #5, live |
| 8 | 10 | **No `BreadcrumbList` outside blog posts.** 9 of 10 templates lack it | services, specialty, pricing, tools, glossary, payer directory, free-assessment | Shared `<Breadcrumbs>` component emitting visible crumbs + JSON-LD | structured-data | *decision* (visual design of crumbs) |
| 9 | 10 | **15 tool pages have no JSON-LD**, and tool pages lack `SoftwareApplication`/`WebApplication` | `/tools/`, `/tools/ar-cost-calculator/`, `/clean-claim-scorecard/`, `/denial-cost-calculator/`, `/edi-837-scrubber/`, `/rvu-calculator/`, `/timely-filing-calculator/` … (full list in report) | `WebApplication` (name, applicationCategory "BusinessApplication", operatingSystem "Web", offers price 0) | structured-data | **Fixed**: #11, live (91/91 tool pages; only the `/tools/` index lacks JSON-LD) |
| 10 | 9 | **Colour contrast fails on every template.** `text-emerald` on light backgrounds is below 4.5:1 | all 10 templates (740 axe + 486 HTML_CodeSniffer hits on the same elements); e.g. "Free Assessment" eyebrow labels, "Get Free Assessment →" | Darken the `emerald` token for text use, or add a `text-emerald-700` utility for small text | pa11y, Lighthouse `color-contrast` | *decision* (brand colour) |
| 11 | 8 | **Best-practices is 81–82 on every page.** `deprecations` come from Cloudflare's JavaScript Detections script `/cdn-cgi/challenge-platform/scripts/jsd/main.js` | site-wide | Cloudflare setting, not site code: disable *JavaScript detections* under Security → Bots if bot scoring is not used, or accept the score | Lighthouse (production) | *kept* (2026-10-22: Bot Fight Mode stays on; JS Detections is part of it on the Free plan) |
| 12 | 8 | **Titles too long on 524/534 pages** (median 90 chars). The " \| Aethera Healthcare Solutions" suffix (30 chars) is appended by `marketingMetadata()` and the layout template | site-wide; worst sections `/payers/*`, `/medical-billing/*`, `/tools/*` | Shorten the suffix to " \| Aethera" (brings about 160 titles under 60 chars), then trim the generated title templates in the data files for the remaining 373 | sitemap audit, SEOnaut `ERROR_LONG_TITLE` | *decision* (brand suffix) |
| 13 | 6 | **47 broken external links**, 41 of them in the payer manuals tool | `/tools/payer-provider-manuals/` (e.g. medicaid.ohio.gov, hfs.illinois.gov sub-pages, arkansasbluecross.com, avmed.org, bcbsnm.com, aetna.com login), `/payers/directory/{caresource,cigna-medicare-advantage,health-net,regence,ny-medicaid-emedny}/` | Update the URLs in the payer data files. Full list with sources: `seo/data/checks/link-check.json` | linkinator / external probe | **Fixed**: #12, live (32 confirmed-404 links). Left as is: CareSource (406), Ohio Medicaid, PEHP (roots also 404 to bots) |
| 14 | 6 | **`/tools/` desktop CLS 0.235** (limit 0.1). `section#tools` shifts after hydration | `/tools/` | Reserve height for the directory grid, or render the initial filter state on the server | Lighthouse (production desktop) | Not reproducible: 0.000 in two fresh desktop runs and the 2026-10-22 CI run; monitoring |
| 15 | 6 | **Meta descriptions over 160 chars on 280 pages** | `/medical-billing/*` (84), `/tools/*` (81), `/payers/*` (69), `/blog/*` (17), `/services/*` (17) | Trim the generated description templates to ≤155 chars | sitemap audit, SEOnaut | open (content) |
| 16 | 4 | **Thin or client-only content.** `/state-of-denials/` has 64 words of server-rendered main content (the rest renders client-side) | `/state-of-denials/`, `/compare/`, `/medical-billing/`, `/blog/editorial-policy/` (128 words), `/tools/edi-270-271-validator/`, `/tools/patient-liability-estimator/`, `/tools/practice-benchmark-scorecard/` | Server-render the explanatory copy and add 300+ words of unique intro for `/state-of-denials/` (a key ranking page) | sitemap audit, SEOnaut `ERROR_LITTLE_CONTENT` | *decision* (content) |
| 17 | 4 | **Tool page mobile TBT 277 ms** (limit 200) | `/tools/denial-code-lookup/` | Defer or split the code dataset (load on interaction or chunk by code range) | Lighthouse (production mobile) | open |
| 18 | 4 | **Heading order skips levels** | `/tools/denial-code-lookup/`, `/glossary/`, `/payers/directory/`, `/schedule/`, `/state-of-denials/` (19 pages per SEOnaut) | Make headings sequential (h2 → h3) | Lighthouse `heading-order`, SEOnaut `ERROR_NOT_VALID_HEADINGS` | **Fixed**: #10, live (card/section headings now h2) |
| 19 | 4 | **Two H1s** | `/tools/good-faith-estimate-generator/` (`GoodFaithEstimateGenerator.tsx:409`, the printable form heading) | Change the form heading to `h2` | sitemap audit | **Fixed**: #10, live |
| 20 | 3 | **Cloudflare email obfuscation link 404s** (`/cdn-cgi/l/email-protection`) | `/compliance/hipaa/` and 6 more pages | Turn off *Email Address Obfuscation* in Cloudflare (Scrape Shield), or render the address as a `mailto:` link | linkinator, SEOnaut | **done** (2026-10-22: obfuscation off; pages now serve plain `mailto:` links) |
| 21 | 3 | **77 images without width/height** (CLS risk); 15 alt texts over 100 chars | various; full list in `seo/data/seonaut/latest.csv` (`ERROR_IMG_SIZE_ATTR`, `ERROR_LONG_ALT_TEXT`) | Add explicit dimensions; shorten alt text | SEOnaut | open |
| 22 | 2 | **ARIA attribute misuse** (`aria-prohibited-attr`); one unlabelled text input | 4 templates; free-assessment form | Remove `aria-label` from non-interactive elements; label the input | pa11y (axe, HTML_CodeSniffer) | **Fixed**: #10, live (role="img"/"group", labelled search, underlined link) |

## Found after the first run

| # | Score | Issue | Where | Fix | Detected by | Status |
|--:|--:|---|---|---|---|---|
| 23 | 15 | **Cloudflare blocks scripted SEO checks from GitHub runners**: `sitemap.xml` returned 403 to the AetheraSEOBot fetch from a datacenter IP (200 from a residential IP); one Lighthouse page load also got a 403 (`errors-in-console`, best-practices 78–79 in CI) | weekly workflow, 2026-10-22 | Add the WAF skip rule in `seo/README.md` § Cloudflare. Until then the workflow falls back to check results published by the local stack | weekly workflow | *kept* (2026-10-22: Security Events show every block is Bot Fight Mode from ASN 8075/Azure, which no Free-plan rule can skip; Bot Fight Mode stays on and the weekly report uses the laptop timer's results) |

## Verified healthy

- Every one of the 534 sitemap URLs returns 200 directly: no redirects, none noindex, all self-canonical,
  none blocked by robots. Key sections are not blocked.
- robots.txt is valid and references the sitemap. Lighthouse `is-crawlable`, `robots-txt`, `canonical`,
  `meta-description` and `image-alt` pass on every template.
- No JSON-LD parse errors and no unknown schema.org types or properties (schema.org 30.1).
- Production Core Web Vitals (lab): mobile LCP 1.2–2.0 s and CLS 0 on all templates except `/tools/`
  desktop. Performance is 89–96 mobile and 85–97 desktop.

## Notes on the data

- Local Lighthouse runs (PR builds) score mobile performance 55–74 against 89–96 on production, because
  `npm run serve:export` serves without compression. Use the production numbers for performance.
- pa11y totals count the same contrast failures twice (axe and HTML_CodeSniffer both report them).
- 276 external links could not be verified (403, 429, timeouts, LinkedIn and similar). They are not
  counted as broken.
