# Website marketing fixes and verification — 8 October 2026

Prepared on `proposal/0018-website-marketing` from website commit `5505bb1`. The original working tree and live website were left unchanged. The owner's existing verified LinkedIn footer addition is preserved in this branch.

## Changes

- Homepage: clearer practice-focused headline, shorter explanation, visible primary pilot CTA, and a separate route for billing companies. Commercial navigation comes before educational resources. Tool counts and portal-demo labels are accurate.
- Offers: one shared definition for the free 50-claim/eligibility pilot (14 days after BAA, complete intake and agreed criteria), plus a distinct 5–10 denied-claim sprint (48 hours after BAA and complete EOBs/encounter notes). The new sprint page supports the existing LinkedIn outreach offer. Forms acknowledge receipt rather than promising a reserved slot.
- Pricing: the existing 3.5–5% configuration is the shared net-collections range. Scope, exclusions and performance targets require written agreement. The main calculator takes the visitor's collections and improvement assumption, charges fees on projected net collections, and allows negative benefit. Preset campaign calculators claiming unsupported recovery rates were retired.
- Campaigns: nine pages retain their own audience, billing-review topics and reference links, with a shared three-required-field intake. Phone and EHR details are optional; neither EHR nor practice identity is prefilled.
- Trust: fabricated client case studies and unsupported specialty outcome metrics were replaced with billing workflows. Named article authors without verified records were replaced with an organizational byline. EHR listings explain that feasibility requires discovery and do not imply vendor partnerships or certified connections.
- Lead handling: newsletter, calculator, report and tool failures do not claim success. Retry IDs include page context, accepted retries clear the delivery warning, and newsletter requests require explicit versioned consent on the server. Newsletter request receipt does not imply activation in an email service.
- Resources: denial guidance is available without an email gate or invented industry percentages. PDF guide links open directly. The tools directory features common tasks and keeps search/category controls. All 92 registered tools and 76 articles expose primary reference collections and their actual review status.
- Discovery: page-specific canonical, Open Graph and Twitter metadata; duplicate brand suffixes removed; preferred service canonicals for five specialty aliases; aliases excluded from the sitemap; corrected endocrinology/general-surgery routes and dental/pharmacy guide links; actual blog logo path in structured data.
- Measurement: optional analytics remain consent-gated. Client navigation records page views without query strings or submitted fields; accepted leads record form type and page path. Campaign attribution persists after consent. Calendar opening remains engagement rather than a confirmed booking. Attribution before consent is deliberately unavailable.

## Verification

| Check | Result |
| --- | --- |
| `npm run check` | Passed: route registry, strict lint, TypeScript, 37 unit tests |
| `npm run build -- --webpack` | Passed: complete static production export |
| Marketing, pilot and smoke browser suites | 60 passed across desktop Chromium and Pixel 5 |
| Updated campaign regressions | 18 passed across desktop and mobile |
| Exported page/link/metadata scan | 552 pages; 67,240 references; zero errors |
| `git diff --check` | Passed |
| Visual inspection | Desktop/mobile homepage, pricing, campaign, sprint, tools and pilot previews inspected |
| Required aethera `make check` | Blocked by eight existing lint errors in `src/aethera/telemetry/memory_guard.py` and `tests/unit/test_memory_guard.py`; no unrelated protected files changed |

Browser tests block external network and intercept the same-origin lead endpoint. New submission tests use the owner's confirmed name, organization and public contact address; no live lead or message was delivered. Existing tool-rule tests were not treated as specialist certification.

Evidence and screenshots are in `/tmp/aethera-marketing-verification/`. The reproducible local preview command is `node scripts/preview-marketing.mjs`. Browser commands:

```bash
npx playwright test tests/e2e/marketing-verification.spec.ts tests/e2e/free-pilot-modal.spec.ts tests/e2e/smoke.spec.ts --project=chromium --project=mobile-chrome --workers=2
npx playwright test --grep 'Campaign page explains scope' --project=chromium --project=mobile-chrome --workers=2
```

## Owner-dependent work

1. Review proposal 18 before applying the website branch. The aethera executor operates on its own repository, so this card cannot automatically merge or deploy the separate website repository. Reconcile the original local Footer changes before merging; this branch already includes the verified LinkedIn addition. Preserve other original untracked work.
2. Verify production lead-store/CRM configuration and actual delivery using an owner-authorized request. No live delivery, calendar booking or deployment was tested. Complete newsletter-service activation and confirmation handling before advertising an active subscription.
3. Obtain qualified current-policy review for the 92 tools and 76 articles before promoting them as validated billing guidance. The companion review queue contains actual paths and sources with no invented reviewer or effective date. Reference collections alone do not validate individual coding rules, deadlines or financial assumptions. Existing PDF guides also need specialist review before being represented as current guidance.
4. Revoke/rotate the credential embedded in the original untracked `src/lib/hostingerReach.ts` and move the integration credential to approved server-side secret storage. That file and its contents are excluded from the proposal; the credential was not used.
5. Resolve the separate existing aethera lint failures through the owner's normal proposal process. This website change does not repair or bypass those system checks.
