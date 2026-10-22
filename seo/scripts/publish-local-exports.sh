#!/usr/bin/env bash
# Publish the latest local SEOnaut export and Phase 3 check results to the orphan `seo-data` branch so
# the weekly GitHub workflow can include them (Cloudflare may block scripted checks from CI runners). Contains only public-page crawl results (URLs, titles, descriptions,
# status codes); /portal and /api are never crawled. Uses a temporary worktree; never touches
# the current checkout.
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
src="$root/seo/data/seonaut"
[[ -f "$src/latest.json" ]] || { echo "No SEOnaut export; run make seo-crawl first" >&2; exit 1; }
tmp="$(mktemp -d)"
trap 'git -C "$root" worktree remove --force "$tmp" >/dev/null 2>&1 || true; rm -rf "$tmp"' EXIT

if git -C "$root" fetch -q origin seo-data 2>/dev/null; then
  git -C "$root" worktree add -q --detach "$tmp" FETCH_HEAD
else
  git -C "$root" worktree add -q --detach "$tmp"
  git -C "$tmp" checkout -q --orphan seo-data-new
  git -C "$tmp" rm -rfq . >/dev/null
  printf '# seo-data\nMachine-written SEO exports from the local monitoring stack (see seo/README.md on the default branch).\n' > "$tmp/README.md"
fi
mkdir -p "$tmp/seonaut" "$tmp/checks"
cp "$src/latest.json" "$src/latest.csv" "$tmp/seonaut/"
cp "$root"/seo/data/checks/*.json "$tmp/checks/" 2>/dev/null || true
git -C "$tmp" add -A
if git -C "$tmp" diff --cached --quiet; then echo "seo-data already up to date"; exit 0; fi
git -C "$tmp" commit -qm "SEO exports $(date -u +%F)"
git -C "$tmp" push -q origin HEAD:refs/heads/seo-data
echo "Published SEOnaut export to origin/seo-data"
