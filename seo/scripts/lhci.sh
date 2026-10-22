#!/usr/bin/env bash
# Run Lighthouse CI for one target and one or both presets.
#   seo/scripts/lhci.sh [local|production] [mobile|desktop|both] [--upload-only]
# --upload-only re-sends the reports already on disk to the LHCI server (e.g. after server downtime).
# Reports: seo/data/lhci/<target>-<preset>/ ; summary: seo/data/lhci/summary-<target>.{json,md}
# Optional self-hosted LHCI server upload when SEO_LHCI_SERVER_URL and
# SEO_LHCI_TOKEN_MOBILE / SEO_LHCI_TOKEN_DESKTOP are set (see seo/.env.example).
# Exit status is non-zero when any `error`-level assertion fails.
set -uo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$root"
lhci="$root/seo/node_modules/.bin/lhci"
target="${1:-local}"
case "${2:-both}" in both) presets=(mobile desktop) ;; mobile|desktop) presets=("$2") ;; *) echo "bad preset" >&2; exit 2 ;; esac
[[ "$target" == local || "$target" == production ]] || { echo "bad target" >&2; exit 2; }
upload_only=0; [[ "${3:-}" == --upload-only ]] && upload_only=1
if [[ $upload_only == 0 && "$target" == local && ! -f out/index.html ]]; then echo "No static export in out/; run npm run build first" >&2; exit 2; fi

status=0
for preset in "${presets[@]}"; do
  export SEO_LH_TARGET="$target" SEO_LH_PRESET="$preset"
  out="seo/data/lhci/$target-$preset"
  rm -rf .lighthouseci
  if [[ $upload_only == 1 ]]; then
    [[ -d "$out" ]] || { echo "no reports in $out" >&2; status=1; continue; }
    mkdir .lighthouseci && i=0
    for report in "$out"/*.report.json; do cp "$report" ".lighthouseci/lhr-$((i++)).json"; done
  else
    rm -rf "$out"; mkdir -p seo/data/lhci
    echo "== Lighthouse $target/$preset"
    "$lhci" collect --config=lighthouserc.js || { status=1; continue; }
    "$lhci" assert --config=lighthouserc.js > "$out.assert.txt" 2>&1 || status=1
    "$lhci" upload --config=lighthouserc.js >/dev/null || { echo "filesystem upload failed for $preset" >&2; status=1; }
  fi
  token_var="SEO_LHCI_TOKEN_${preset^^}"
  if [[ -n "${SEO_LHCI_SERVER_URL:-}" && -n "${!token_var:-}" ]]; then
    # The server keys builds by commit hash; production runs re-test the same commit weekly.
    # A synthetic hash is not a git object, so every other build-context field must be supplied too.
    if [[ "$target" == production ]]; then
      head="$(git rev-parse HEAD)"
      export LHCI_BUILD_CONTEXT__CURRENT_HASH="$head-prod-$(date -u +%Y%m%dT%H%M)" \
        LHCI_BUILD_CONTEXT__ANCESTOR_HASH="$head" \
        LHCI_BUILD_CONTEXT__COMMIT_MESSAGE="Production run $(date -u +%F) (site at $(git rev-parse --short HEAD))" \
        LHCI_BUILD_CONTEXT__AUTHOR="AetheraSEOBot <seo@aetherahealthcare.com>" \
        LHCI_BUILD_CONTEXT__AVATAR_URL="https://aetherahealthcare.com/favicon-192.png" \
        LHCI_BUILD_CONTEXT__COMMIT_TIME="$(date -u +%FT%TZ)"
    fi
    "$lhci" upload --target=lhci --serverBaseUrl="$SEO_LHCI_SERVER_URL" --token="${!token_var}" --ignoreDuplicateBuildFailure \
      ${SEO_LHCI_PASSWORD:+--basicAuth.username="${SEO_LHCI_USER:-aethera}" --basicAuth.password="$SEO_LHCI_PASSWORD"} \
      || { echo "warning: LHCI server upload failed for $preset (reports are still on disk)" >&2; [[ $upload_only == 1 ]] && status=1; }
    unset LHCI_BUILD_CONTEXT__CURRENT_HASH LHCI_BUILD_CONTEXT__ANCESTOR_HASH LHCI_BUILD_CONTEXT__COMMIT_MESSAGE \
      LHCI_BUILD_CONTEXT__AUTHOR LHCI_BUILD_CONTEXT__AVATAR_URL LHCI_BUILD_CONTEXT__COMMIT_TIME
  fi
done
rm -rf .lighthouseci
node seo/scripts/lhci-summary.mjs "$target"
exit $status
