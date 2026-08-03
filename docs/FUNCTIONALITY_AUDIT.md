# aetherahealthcare.com — Full Functionality Audit

> **Remediation status (2026-08-03):** every in-repo defect below has been fixed on this branch — the six user-visible breakages (except "Client Login", excluded by request), the lead-wiring gaps, stale tests/CI, dead code, and data/copy issues. Two things remain that only the site owner can do:
> 1. **Rotate the `CLOUDFLARE_API_TOKEN` GitHub Actions secret.** The token was invalidated on 2026-07-17 (auto-blog deploys fail with Cloudflare auth errors 10000/9109). Until it's rotated, **no deploy — including this branch's fixes and the 5 stranded blog posts — can reach production.** See DEPLOY.md §3 for steps.
> 2. **Restore `rcm.aetherahealthcare.com`** (Client Login target, currently Cloudflare error 1033) — explicitly excluded from this remediation.
>
> Optional dashboard-side items: raise HSTS max-age to ≥1 year and set X-Frame-Options DENY at the Cloudflare zone level; supply real Google Ads conversion labels (`NEXT_PUBLIC_GADS_LABEL_*`) and LinkedIn/Meta pixel IDs if those campaigns are wanted — the code paths exist and are env-gated.

**Date:** 2026-08-03 · **Scope:** every feature, module, and sub-module of the website repo plus the live production site.
**Method:** clean `npm ci` + production build + type-check + lint; headless-Chromium crawl of the built static export (40 pages, hydration/console-error checks); live-production checks of all 360+ sitemap URLs, decks, worker/CRM endpoints (GET/HEAD only); 10 parallel module code-audits; every critical/major finding independently re-verified by an adversarial reviewer. No production form was submitted and no code was changed.

---

## Verdict

**The site is substantially built and functional, but not *fully* functional.** The core marketing site, lead-capture funnel, tools suite, payer directory, and blog all genuinely work in production. However, there are **6 user-visible breakages**, a **content-publishing pipeline that has been silently failing since 2026-07-17**, a portal that is **marketing-only with a dead login link**, most **ad-conversion tracking silently disabled**, and a **test/CI suite that no longer matches the site and never runs automatically**.

### Health snapshot

| Module | Status |
|---|---|
| Build & rendering | ✅ Build passes; all 40 crawled pages render + hydrate with zero JS errors; all 360 live sitemap URLs return 200 |
| Lead capture (contact, callback, exit-intent, schedule, free assessment) | ✅ Works — live CRM ingest + Web3Forms email fallback (2 wiring defects below) |
| Tools (8 calculators/lookups) | ✅ Works — math verified sane; 1,298 denial codes; 233-payer manual finder (1 filter bug below) |
| Payer directory (229 payers, per-payer pages) | ✅ Works — clean data, full static coverage, working search/filters |
| Blog (68 posts) | ⚠️ Renders fine, but the 5 newest auto-published posts never reached production |
| Free assessment / gap analysis | ✅ Works — upload parsing (CSV/XLSX/PDF), report, CRM delivery |
| Provider portal | ❌ Marketing page only; the actual "Client Login" target is down (Cloudflare 1033) |
| Analytics / ads | ⚠️ GA4 + 1 of 5 Google Ads conversions live; LinkedIn/Meta pixels and 4 conversion actions are silent no-ops; cookie banner gates nothing |
| Tests & CI | ❌ Not functional as a quality gate — stale specs, dispatch-only CI, dead deploy workflows, `ignoreBuildErrors: true` |

---

## 1. Broken user-facing items (all independently verified)

1. **Dead "Schedule Consultation" button on /contact** — `src/components/ui/ContactTabs.tsx:55`. The outer tab's full-width CTA has no `onClick`, no `href`, no form. Clicking does nothing. (The working schedule form lives inside `ContactForm`'s own inner tabs.)
2. **All 4 "Apply Now" buttons on /careers are dead** — `src/app/careers/page.tsx:321`. Plain `<button>` in a server component: no handler, no link, no form, for every open position.
3. **Site-wide footer links to a 404** — `src/components/layout/Footer.tsx:5` points to `/services/hospitalist-billing`, which has no page (confirmed 404 live). Also advertised in JSON-LD.
4. **"Client Login" is dead in production** — `Navbar.tsx:163/230`. Desktop links to `https://rcm.aetherahealthcare.com/portal/`, mobile to `https://rcm.aetherahealthcare.com` (inconsistent), and the host currently returns Cloudflare **error 1033** (tunnel/origin unreachable). This is the only real portal entry point on the site.
5. **Denial Code Lookup "CARC" tab hides the 15 most common CARC codes** — `src/components/ui/DenialCodeLookup.tsx:50`. The curated top denials (CO-16, CO-50, CO-97, CO-197…) only render in All/Top-denials modes; on the CARC tab, searching e.g. "197" returns nothing while the tab count claims 266. Reproduced live.
6. **Auto-blog publishing is broken in production** — the last **5 auto-published posts (2026-07-17 → 2026-07-31) are committed to the repo but 404 on the live site**, and the live sitemap is frozen at 2026-07-17. The `auto-blog.yml` deploy step is not reaching production, so twice-weekly content marketing has been silently dead for ~7 weeks.

## 2. Leads & revenue-tracking gaps (silent, not visible to visitors)

- **Callback widget drops the "best time to call" field** — `CallbackButton` collects it, but `src/lib/worker.ts`'s contact mapping never forwards it, so the CRM lead arrives without the one piece of scheduling info the widget promises.
- **4 of 5 Google Ads conversion actions are permanent no-ops** — `src/lib/gtag.ts:16`: only `assessment` has a real label; `contact`/`meeting`/`booking`/`calculator` default to `''` and `trackConversion` early-returns. No workflow or env file sets the label vars. Only free-assessment conversions are ever reported to Google Ads.
- **Deploy race can strip even that** — three workflows fire on push to `main`; two deploy to the *same* Pages project and only `deploy-cloudflare.yml` sets `NEXT_PUBLIC_GOOGLE_ADS_ID`. (Today the repo default branch is `master`, so only `deploy-cloudflare.yml` actually runs — but any future `main` push races.)
- **LinkedIn/Meta retargeting pixels are dead in production** — env-gated (`NEXT_PUBLIC_LINKEDIN_PARTNER_ID` / `NEXT_PUBLIC_META_PIXEL_ID`) and the vars are set nowhere; confirmed absent from live HTML.
- **Forms can show success when the lead was lost** — `submitToWorker` never throws (CRM failure → email fallback, whose own failure is swallowed), so every form's success screen is unconditional. The free-assessment success screen also promises "report emailed to you," which nothing in this repo sends — it depends entirely on CRM-side behavior.
- **Cookie consent is cosmetic** — the banner stores a choice nothing reads; gtag/analytics load and fire before/without consent. If GDPR/CCPA posture matters, this is a compliance gap, not just a bug.
- **No honeypot on the two highest-value forms** (free assessment, meeting request); the other three forms have one.

## 3. Portal module

`/portal` is a polished static *marketing* page — there is no authenticated portal in this codebase. The magic-link flow that `DEPLOY.md` and `tests/e2e/portal-flow.spec.ts` describe was removed (`/gap-analysis` is now just a client redirect to `/free-assessment`); the legacy Worker still exposes `/api/portal/*` but no site code calls it. Combined with the dead `rcm.aetherahealthcare.com` login link, **the portal feature as advertised is not currently reachable by clients.** The portal mockup graphic also displays `portal.aetherahealthcare.com`, a hostname that doesn't resolve.

## 4. Tests & CI/CD — not functional as a safety net

- `ci.yml` is **`workflow_dispatch`-only**: no PR or push checks ever run. Nothing gates merges; `deploy-cloudflare.yml` ships every `master` push with zero checks, and `next.config.ts` sets `typescript.ignoreBuildErrors: true`.
- Even if dispatched, CI fails: the `worker-tests` job targets an `aethera-worker/` directory that **does not exist in this repo**; the e2e job installs only Chromium but the config runs a Firefox project too.
- Stale specs that fail against the current site: `smoke.spec.ts` (`/specialties/cardiology` is 404; `/blog` title is "The Aethera Pulse…", no "Blog"); `security-headers.spec.ts` (production serves `X-Frame-Options: SAMEORIGIN` and HSTS `max-age=15552000` ≈ 6 months, while `public/_headers` declares `DENY`/2 years — a Cloudflare zone setting is overriding the file); `contact-form.spec.ts` (react-hook-form ≠ native validation; required fields not filled); `portal-flow.spec.ts` (tests a removed feature); `worker-api.spec.ts` (tests the legacy `aethera-forms` path — the CRM ingest endpoints the site actually uses have **zero** test coverage).
- `deploy.yml` and `deploy-website.yml` are dead duplicates (trigger on `main` only, Node 18 vs Next 16's ≥20.9 requirement; one targets the wrong Pages project). `DEPLOY.md` documents `aethera-worker/` and `aethera-admin/` directories and a portal checklist that don't match this repo.
- E2E suites default to production and **submit real data** when they pass (Web3Forms emails, worker DB rows) — they should target staging or be tagged.

## 5. Data & content quality

- **42 of 68 blog posts are thin outlines** (~70–320 words) whose metadata claims "5–14 min read" — structurally complete, but a visible credibility gap; the auto-blog `readTime` formula floors at 5 min, perpetuating it.
- **`scripts/import-payers.mjs` would corrupt the directory if used as documented**: its merge mode upserts by `slugify(name)`, which mismatches the hand-written slugs of **114 of 229** payers → a re-import duplicates them; it also stamps unverified rows as verified-today.
- Cross-dataset drift: CareSource is "Medicaid" in `payers.data.json` but "Commercial" in `payerResources.data.json`; overlapping payers use unrelated slugs across the two files (harmless today).
- Stale copy: FAQ badge "30+ questions" (24 rendered); "12 RCM services" (15 listed); denial-lookup meta description "280+" (1,298 actual); home JSON-LD `SearchAction` targets a non-existent `/search`.
- Timely Filing Calculator is off by one day across fall-back DST transitions; RVU calculator defaults to the CY2025 conversion factor ($32.35), ~3% below CY2026.

## 6. Dead code & housekeeping

- `RevenueCycleHero3D` (the entire three.js dependency) and `KPICard` are never imported anywhere; `SchemaOrg.tsx` is never rendered (per-page JSON-LD mitigates); `BookingEmbed`'s no-URL branch is unreachable.
- Five `.fuse_hidden*` junk files are committed under `src/app/services/*/`.
- Sitemap emits slashless URLs while the site enforces trailing slashes → 364/365 entries are 308 redirects; `/gap-analysis` is noindex+canonical-elsewhere yet listed at priority 0.9. `public/CNAME` contains the `pages.dev` hostname (inert on Cloudflare Pages).
- Lint: 120 problems (95 errors — mostly unescaped entities / hook patterns); `tsc` is clean apart from missing `@types/three`.
- Case-studies and Integrations pages miss the `pt-16` fixed-navbar offset every other page uses, hiding the hero eyebrow chip behind the navbar.

## What was verified as working (highlights)

Production build and static export (100+ routes incl. 233 payer + 68 blog pages); zero hydration/console errors across a 40-page Chromium crawl; all 360 live sitemap URLs 200; all 18 deck PDFs served; forms worker healthy (v2.3) and CRM API alive with correct CORS for browser posts; Cal.com booking live (opened in a new tab, correctly sidestepping the site's `frame-src 'none'` CSP); all 8 tools' math verified; denial dataset clean (1,283 reference codes, 0 dups, spot-checks match official X12 meanings); aging-analysis math consistent; navbar/all-page internal links resolve (except the one footer 404); phone number consistent site-wide; CSP matches production byte-for-byte. The AI-assistant backend (`POST /api/assistant`) could not be exercised under this audit's read-only constraint — the widget degrades gracefully if it fails, but it deserves one manual click-test.

## Suggested priority order

1. Fix the auto-blog deploy (content pipeline silently dead) and the 6 user-visible breakages (§1).
2. Restore/repair `rcm.aetherahealthcare.com` or remove "Client Login" until it's back.
3. Set the 4 missing Google Ads conversion labels + pixel IDs (or delete the dead code); forward `bestTime` to the CRM.
4. Rewrite the e2e suite against the current site + CRM endpoints, turn `ci.yml` into a real PR gate, delete the two dead deploy workflows, drop `ignoreBuildErrors`.
5. Backfill the 42 thin blog posts (or de-inflate their read times); fix the import-payers slug matching before anyone re-imports.
