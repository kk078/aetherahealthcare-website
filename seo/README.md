# SEO monitoring stack — aetherahealthcare.com

Self-hosted and open source only: Lighthouse CI, SEOnaut, linkinator, pa11y-ci, ajv plus the schema.org
vocabulary, SerpBear, and the free Google Search Console API. Nothing here is a paid service, and no
report is stored with a third party.

| Piece | Where | What it answers |
|---|---|---|
| Lighthouse CI | `lighthouserc.js`, `seo/scripts/lhci.sh`, `.github/workflows/lighthouse.yml`, `infra/lhci-server/` | Performance, SEO, accessibility and best-practice scores per template (mobile + desktop, median of 3) |
| SEOnaut | `infra/seonaut/`, `seo/scripts/seonaut.mjs` | Full crawl: broken links, redirect chains, titles/descriptions, H1s, orphans, canonical/noindex vs sitemap, thin pages |
| Site snapshot + analyzers | `seo/scripts/site-snapshot.mjs` → `sitemap-audit`, `structured-data`, `internal-links` | Sitemap/robots health, JSON-LD validity and coverage, internal links into service/specialty pages |
| linkinator | `seo/scripts/link-check.mjs` | Broken internal and external links across every sitemap page |
| pa11y-ci | `seo/scripts/a11y.mjs` | WCAG 2 AA issues (axe + HTML_CodeSniffer) on the template URLs |
| SerpBear | `infra/serpbear/`, `seo/config/keywords.csv` | Keyword tracking UI (see [rank tracking](#rank-tracking)) |
| Search Console export | `seo/scripts/gsc-export.mjs` | Free US average position, clicks and impressions for the tracked keywords |
| Weekly report | `seo/scripts/weekly-report.mjs`, `.github/workflows/seo-weekly.yml` | `seo/reports/YYYY-MM-DD.md` |

The tooling has its own `seo/package.json` and lockfile. Lighthouse, puppeteer and their proxy
dependencies carry npm advisories that would otherwise trip the site's release gate
(`scripts/release-audit.mjs`). Keeping them in `seo/` leaves the website's dependency tree and audit
unchanged.

## Setup

Requirements: Node 22, Docker with Compose v2, and Google Chrome (`/usr/bin/google-chrome`).

```sh
make seo-up          # creates seo/.env with random secrets, installs seo/ deps, starts all three stacks
make seo-lhci-init   # once: creates the mobile/desktop projects on the LHCI server, saves tokens to seo/.env
```

Every service binds to `127.0.0.1` only:

- LHCI server http://127.0.0.1:9001 (basic auth: `SEO_LHCI_USER / SEO_LHCI_PASSWORD`)
- SEOnaut http://127.0.0.1:9002 (account created by the first `make seo-crawl`; `SEONAUT_EMAIL` / `SEONAUT_PASSWORD`)
- SerpBear http://127.0.0.1:9003 (`SERPBEAR_USER` / `SERPBEAR_PASSWORD`)

`make seo-down` stops everything. Data lives in named Docker volumes and survives restarts.

## Commands

| Command | Does |
|---|---|
| `npm run build && make seo-lh` | Lighthouse against the local static export (what PRs run) |
| `make seo-lh-prod` | Lighthouse against production |
| `make seo-checks` | Phase 3 checks against production (`SEO_BASE_URL=http://localhost:3100` for a local build served by `npm run serve:export`) |
| `node seo/scripts/run-checks.mjs --only=site-snapshot,sitemap-audit` | Run selected checks only |
| `make seo-lh-reupload` | Re-send the on-disk Lighthouse reports to the LHCI server (`TARGET=local` for PR-build reports) |
| `make seo-crawl` | SEOnaut full crawl through the gateway, then export |
| `make seo-export` | Re-export the latest finished SEOnaut crawl to `seo/data/seonaut/` (CSV + JSON) |
| `make seo-gsc` | Search Console rank export (once configured) |
| `make seo-report` | Write today's `seo/reports/YYYY-MM-DD.md` from the data on disk |
| `make seo-weekly` | Everything above in sequence. A failed step is recorded in the report and does not stop the run |
| `make seo-publish` | Push the latest SEOnaut export to the `seo-data` branch so the GitHub weekly report includes it |

Outputs, all gitignored except `reports/`:

```
seo/data/lhci/{local,production}-{mobile,desktop}/   LHR HTML+JSON per run, manifest.json
seo/data/lhci/summary-<target>.{md,json}              median scores table
seo/data/snapshot.json                                one record per sitemap page
seo/data/checks/{sitemap-audit,structured-data,internal-links,link-check,a11y}.json
seo/data/seonaut/latest.{json,csv}, issues-<date>.csv
seo/data/gsc/latest.json, <date>.json
seo/reports/YYYY-MM-DD.{md,json}                      committed weekly
```

## HIPAA hygiene: what is never crawled

`/portal` and `/api` are excluded everywhere. The list lives in `seo/config/urls.json` (`excludePatterns`).

- **Scripts:** every request goes through `politeFetch`, which throws on an excluded path. Sitemap
  entries matching the exclusions are dropped, and redirects into excluded paths are not followed.
- **linkinator** skips those links. **Lighthouse and pa11y** only visit the template list, and
  `lighthouserc.js` refuses to load if that list contains an excluded path.
- **SEOnaut** has no URL-exclusion setting, and `/portal/` is linked from the site navigation on every
  page. SEOnaut therefore has no internet route at all: its container sits on an `internal` Docker
  network, and the only way out is the `seo-gateway` nginx container. The gateway does four things:
  1. It answers `/portal` and `/api` with a local 403. Those requests are never forwarded.
  2. It adds `Disallow: /portal/` and `Disallow: /api/` to the proxied robots.txt, so SEOnaut never
     queues them.
  3. It forces the `AetheraSEOBot` UA, strips cookies and Authorization headers, and rate-limits
     upstream requests to 2/s.
  4. It logs every forwarded request to `seo/data/raw/gateway/crawl.log` and every refused one to
     `blocked.log`. Check with `grep -cP '\t/(portal|api)(/|\?|\t|$)' seo/data/raw/gateway/crawl.log` (expect 0).
- No tool sends cookies or credentials. The authenticated routes are never requested, so no PHI can
  enter any report.

The gateway also rewrites `https://aetherahealthcare.com` to `http://seo-gateway:8080` so links stay
internal for SEOnaut. The exporter maps URLs back and drops findings that are only artefacts of the
plain-HTTP, rate-limited hop: HTTP scheme or links, insecure forms, slow TTFB, and missing HSTS.

## Cloudflare: letting the crawler and CI through without evading bot protection

All tools identify themselves with `AetheraSEOBot/1.0 (+https://aetherahealthcare.com/; SEO monitoring)`.
The browser-based tools (Lighthouse, pa11y) append that token to a normal Chrome UA so pages render
realistically. On 2026-10-22 production answered this UA from a residential IP with 200. GitHub-hosted
runners use datacenter IPs and are more likely to be challenged.

1. **Bot Fight Mode (Free plan)** cannot be skipped by any WAF rule. If it is on and CI gets 403/503
   challenges, the only options are to turn it off (Security → Bots) or to move to Pro, where *Super*
   Bot Fight Mode can be skipped. Check this first.
2. **Custom rule.** Go to Security → WAF → Custom rules → *Create rule*:
   - Name: `Allow AetheraSEOBot (SEO monitoring)`
   - Expression (Edit expression):
     ```
     (http.user_agent contains "AetheraSEOBot")
     and (http.request.method in {"GET" "HEAD"})
     and not starts_with(http.request.uri.path, "/portal")
     and not starts_with(http.request.uri.path, "/api")
     ```
   - Action: **Skip**. Components to skip: *All Super Bot Fight Mode rules* (Pro+) and *All rate
     limiting rules*. Leave *Managed rules* and *Custom rules* enforced, so the WAF still protects the
     site against anything abusing this UA.
   - Place it first in the custom-rule order.
3. **Optional hardening.** A User-Agent is easy to spoof. Pick the variant that matches how you run:
   - Local stack only: add `and ip.src eq <your public IP>`.
   - Scripted checks (snapshot, sitemap audit): set a random `SEO_BOT_TOKEN` (seo/.env and GitHub
     secret) and add `and any(http.request.headers["x-aethera-seo-token"][*] eq "<token>")`. Only
     `politeFetch` sends it, and only to aetherahealthcare.com. Lighthouse and pa11y do not send it,
     because browser tools would leak the header to Google Analytics and the other third-party hosts
     the page loads.
4. Afterwards, check Security → Events filtered by User-Agent contains `AetheraSEOBot`. You should see
   *Skip*, not *Managed challenge*.

## Lighthouse CI

- URLs: `seo/config/urls.json` holds one URL per template. Add or replace entries there; Lighthouse,
  pa11y and the schema check all pick them up.
- Each run does 3 passes per URL and uses the median. Mobile is the Lighthouse default; desktop uses
  `preset: desktop`.
- Assertions at error level fail the build: SEO ≥ 0.95, `meta-description`, `canonical`,
  `is-crawlable`, `robots-txt`, `image-alt`. Warning level: a11y ≥ 0.90, best-practices ≥ 0.90,
  performance ≥ 0.85 mobile (0.90 desktop), LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms.
- PRs run against the PR's own static export, served on the runner by `npm run serve:export`. A single
  bot comment is created or updated with the score table and any failed assertions. Reports are
  workflow artifacts. Every Monday at 05:00 UTC the same runs go against production.
- Report store: the self-hosted LHCI server in `infra/lhci-server` (SQLite). Local runs upload to it
  when `SEO_LHCI_TOKEN_*` are set. GitHub-hosted runners cannot reach `127.0.0.1`, so CI keeps reports as
  artifacts unless you expose the server and set the `SEO_LHCI_SERVER_URL`, `SEO_LHCI_TOKEN_MOBILE`,
  `SEO_LHCI_TOKEN_DESKTOP` and `SEO_LHCI_PASSWORD` secrets. A private Tailscale Funnel or Cloudflare
  Tunnel (with Access) are both free ways to expose it. That is an infrastructure decision, so it is
  not automated.

## Reading the reports

`seo/reports/YYYY-MM-DD.md` contains:

1. **Data sources**: which inputs were present and whether any are stale (older than 8 days).
2. **Executive summary**: the 5 issue types with the highest impact² × log₂(pages affected + 1), so severity outweighs volume. Impact
   weights are in `IMPACT` in `weekly-report.mjs`. 5 means it blocks indexing or users (non-200,
   noindex in sitemap, broken internal links); 1 is cosmetic (title length).
3. **Score trends**: average template scores and health counts, with ▲/▼ against last week's
   `YYYY-MM-DD.json`.
4. **New and fixed issues**: a diff of issue keys (`type|path`) against last week.
5. **Broken links**, **Schema coverage** (per template and per section), **Rank changes** (GSC average
   position, lower is better), and the **SEOnaut** crawl summary.

`seo/FINDINGS.md` is the hand-curated, prioritised fix list. Rebuild it after major changes.

## Rank tracking

SerpBear tracks *positions* for its keywords using a SERP scraper. Its Search Console integration is
free, but it only adds GSC impressions and clicks next to those keywords; it does not check positions.
The scraper options are:

| Option | Cost | Notes |
|---|---|---|
| Google Search Console (`gsc-export.mjs`, SerpBear GSC integration) | Free | Real Google data for US queries where the site already earns impressions, as a 28-day average position. Data lags 2–3 days. Keywords with no impressions show "—". **Used by default.** |
| ScrapingRobot | Free tier ~5,000 requests/mo; paid above | 61 keywords × daily checks ≈ 1,830/mo, so the free tier covers it. It is still a third-party SaaS, so it needs your approval. |
| Serper.dev / SearchApi / ValueSERP / SerpApi / Scrapingant | Paid (trial credits; roughly $50/mo and up for daily tracking) | Not configured. |
| SerpBear "proxy" mode with your own proxies | Proxy cost; scraping Google directly breaks its ToS and gets blocked | Not recommended. |

**Not configured: no scraper.** Search Console is the free source of rank data here. To enable it:

1. In Google Cloud (free), create a project and a service account, enable the *Google Search Console
   API*, and create a JSON key.
2. In Search Console → Settings → Users and permissions, add the service-account email as a
   **Restricted** user on `aetherahealthcare.com`.
3. Put `SEARCH_CONSOLE_CLIENT_EMAIL` and `SEARCH_CONSOLE_PRIVATE_KEY` (the key with `\n` escapes) in
   `seo/.env`. Add the same two as GitHub secrets, and set the `GSC_SITE_URL` variable if the property
   is URL-prefix rather than domain (`https://aetherahealthcare.com/`).
4. Run `make seo-gsc`, then restart SerpBear (`make seo-up`) so its Search Console tab picks up the
   credentials.

### Adding keywords

Append rows to `seo/config/keywords.csv` with these columns: `keyword, cluster, intent, target_page,
country, device`. Country is always US. Intent is one of `commercial`, `informational`,
`transactional` or `tool`. The GSC export and the report read the file directly. In SerpBear, add the
domain once, then paste the keyword column under *Add keywords* (country US).

## GitHub configuration

| Name | Type | Used by | Required |
|---|---|---|---|
| `SEO_LHCI_SERVER_URL`, `SEO_LHCI_TOKEN_MOBILE`, `SEO_LHCI_TOKEN_DESKTOP`, `SEO_LHCI_PASSWORD` | secrets | lighthouse.yml | Optional (only for an exposed LHCI server) |
| `SEARCH_CONSOLE_CLIENT_EMAIL`, `SEARCH_CONSOLE_PRIVATE_KEY` | secrets | seo-weekly.yml | Optional (rank section) |
| `GSC_SITE_URL` | variable | seo-weekly.yml | Optional |

The weekly workflow commits `seo/reports/` to the default branch with `GITHUB_TOKEN`. Pushes made with
`GITHUB_TOKEN` do not trigger `ci.yml`, so a report commit never deploys. If branch protection rejects
the push, the workflow opens a PR instead.

## Scheduling the local half

SEOnaut and SerpBear run on this machine, so the weekly GitHub report includes SEOnaut only after
`make seo-crawl && make seo-publish`. To automate that, add a weekly systemd user timer (Sunday night,
before the Monday 05:00 UTC workflow). The unit files are in `seo/systemd/`; installing them is a
system change, so do it yourself:

```sh
cp seo/systemd/aethera-seo-crawl.* ~/.config/systemd/user/
systemctl --user daemon-reload && systemctl --user enable --now aethera-seo-crawl.timer
```
