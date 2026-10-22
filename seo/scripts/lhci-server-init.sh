#!/usr/bin/env bash
# Create the mobile and desktop projects on the self-hosted LHCI server and store their build
# tokens in seo/.env (idempotent: skips presets whose token is already set).
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
env_file="$root/seo/.env"
set -a; source "$env_file"; set +a
base="${SEO_LHCI_SERVER_URL:-http://127.0.0.1:9001}"
auth="${SEO_LHCI_USER:-aethera}:${SEO_LHCI_PASSWORD}"

for preset in mobile desktop; do
  var="SEO_LHCI_TOKEN_${preset^^}"
  if [[ -n "${!var:-}" ]]; then echo "$preset: token already set"; continue; fi
  response="$(curl -fsS -u "$auth" -H 'Content-Type: application/json' -X POST "$base/v1/projects" \
    -d "{\"name\":\"aetherahealthcare.com ($preset)\",\"externalUrl\":\"https://github.com/kk078/aetherahealthcare-website\",\"baseBranch\":\"master\"}")"
  token="$(node -e 'process.stdout.write(JSON.parse(process.argv[1]).token)' "$response")"
  sed -i "s|^$var=.*|$var=$token|" "$env_file"
  echo "$preset: project created, build token saved to seo/.env"
done
