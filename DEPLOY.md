# Aethera Healthcare — Deployment Quick Reference

This repo contains the **website only** (Next.js 16 static export → Cloudflare Pages).
The forms Worker (`aethera-forms`), CRM API (`aethera-crm-api`), and admin dashboard
live in their own repositories — deploy them from there, not from here.

## Prerequisites

```bash
# Set env vars (or use .env file)
export CLOUDFLARE_API_TOKEN=<token>
export CLOUDFLARE_ACCOUNT_ID=<account_id>
```

---

## 1. Build & Deploy the Site

Pushes to `master` deploy automatically via `.github/workflows/deploy-cloudflare.yml`.
Manual deploy:

```bash
npm ci
npm run build                             # generates ./out/ (includes TypeScript check)
npx wrangler pages deploy out \
  --project-name aetherahealthcare-website \
  --branch main
```

**Check deployment status:**
```bash
npx wrangler pages deployment list --project-name aetherahealthcare-website
```

---

## 2. CI

`.github/workflows/ci.yml` runs on every pull request and push to `master`:
1. **Build & type check** — `npm run build` (fails on TypeScript errors).
2. **E2E** — Playwright page tests against the PR's own build; security-header
   and CRM-API tests read-only against production. No CI run submits live form
   data — the contact-form live-submission test only runs with `E2E_LIVE_SUBMIT=1`.

Run locally:
```bash
npm run typecheck
npm run test:e2e                                     # against production
BASE_URL=http://localhost:3000 npm run test:e2e      # against a local build/dev server
```

---

## 3. Auto-Blog (The Aethera Pulse)

`.github/workflows/auto-blog.yml` generates an article twice a week
(Tue/Fri 13:00 UTC), commits it with `[skip ci]`, builds, and deploys directly.
It needs the same `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets plus
an LLM key (`ANTHROPIC_API_KEY` or `OLLAMA_API_KEY`).

> **If auto-blog runs fail at the deploy step with "Authentication error
> [code: 10000]" / "Invalid access token [code: 9109]", the Cloudflare API token
> has expired or been revoked.** Rotate it: Cloudflare dashboard → My Profile →
> API Tokens → create a token with *Cloudflare Pages: Edit* on the account, then
> update the `CLOUDFLARE_API_TOKEN` secret in GitHub → Settings → Secrets →
> Actions. Committed-but-undeployed posts publish on the next successful deploy.

---

## 4. GitHub Secrets Required for CI/CD

Add these in GitHub → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | From Cloudflare dashboard (Pages: Edit permission) |
| `CLOUDFLARE_ACCOUNT_ID` | `2c268625d9e6e4c084ff296fcdf5f3bd` |
| `ANTHROPIC_API_KEY` (or `OLLAMA_API_KEY`) | For auto-blog generation |

---

## 5. Live URLs

| Resource | URL |
|----------|-----|
| Production site | https://aetherahealthcare.com |
| Forms worker (AI assistant) | https://aethera-forms.aetherahealthcare.workers.dev |
| Forms worker health | https://aethera-forms.aetherahealthcare.workers.dev/api/health |
| CRM ingest API (all site forms) | https://aethera-crm-api.aetherahealthcare.workers.dev/api/v1/public/website |
| Cloudflare dashboard | https://dash.cloudflare.com |

---

## 6. Deployment Checklist

- [ ] `npm run build` succeeds locally (includes type check)
- [ ] CI green on the PR (build + e2e)
- [ ] Pages deployment live at aetherahealthcare.com
- [ ] Security headers present (`curl -sI https://aetherahealthcare.com | grep -i strict`)
- [ ] Sitemap fresh (`curl -s https://aetherahealthcare.com/sitemap.xml | grep -c "<url>"` matches the build)
- [ ] Newest blog post reachable (spot-check `/blog/<latest-slug>/`)
- [ ] Contact form submits successfully (manual test email)
