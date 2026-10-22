# SEO monitoring stack (tooling in seo/, containers in infra/). See seo/README.md.
SHELL := /bin/bash
ENV := seo/.env
COMPOSE := docker compose --env-file $(ENV)
STACKS := infra/lhci-server infra/seonaut infra/serpbear

.PHONY: seo-env seo-install seo-up seo-down seo-ps seo-lhci-init seo-lh seo-lh-prod seo-lh-reupload seo-crawl seo-export seo-checks seo-gsc seo-report seo-publish seo-weekly

seo-env:
	@test -f $(ENV) || { sed -E "s/=change-me$$/=__SECRET__/" seo/.env.example | while IFS= read -r line; do \
	  if [[ $$line == *=__SECRET__ ]]; then echo "$${line%__SECRET__}$$(openssl rand -hex 24)"; else echo "$$line"; fi; done > $(ENV); \
	  chmod 600 $(ENV); echo "Created $(ENV) with random secrets"; }

seo-install:
	npm ci --prefix seo

## One command: env + tooling + LHCI server + SEOnaut (with gateway) + SerpBear, all on 127.0.0.1.
seo-up: seo-env seo-install
	@mkdir -p seo/data/raw/gateway
	@for stack in $(STACKS); do $(COMPOSE) -f $$stack/docker-compose.yml up -d --wait || exit 1; done
	@echo "LHCI http://127.0.0.1:9001  SEOnaut http://127.0.0.1:9002  SerpBear http://127.0.0.1:9003"

seo-down:
	@for stack in $(STACKS); do $(COMPOSE) -f $$stack/docker-compose.yml down; done

seo-ps:
	@for stack in $(STACKS); do $(COMPOSE) -f $$stack/docker-compose.yml ps; done

seo-lhci-init:
	seo/scripts/lhci-server-init.sh

seo-lh:        ## Lighthouse against the local static export (npm run build first)
	set -a; source $(ENV); set +a; seo/scripts/lhci.sh local both

seo-lh-prod:   ## Lighthouse against production
	set -a; source $(ENV); set +a; seo/scripts/lhci.sh production both

seo-lh-reupload: ## Re-send on-disk Lighthouse reports to the LHCI server (TARGET=production|local)
	set -a; source $(ENV); set +a; seo/scripts/lhci.sh $(or $(TARGET),production) both --upload-only

seo-crawl:     ## SEOnaut full crawl of production via the gateway, then export
	set -a; source $(ENV); set +a; node seo/scripts/seonaut.mjs crawl

seo-export:    ## Re-export the latest finished SEOnaut crawl (CSV + JSON)
	set -a; source $(ENV); set +a; node seo/scripts/seonaut.mjs export

seo-checks:    ## Phase 3 checks against production
	node seo/scripts/run-checks.mjs

seo-report:    ## Build seo/reports/YYYY-MM-DD.md from whatever data is on disk
	node seo/scripts/weekly-report.mjs

seo-gsc:       ## Free Search Console rank export (needs SEARCH_CONSOLE_* in seo/.env)
	set -a; source $(ENV); set +a; node seo/scripts/gsc-export.mjs

seo-publish:   ## Push the latest SEOnaut export to the seo-data branch for the weekly workflow
	seo/scripts/publish-local-exports.sh

## Everything locally, continuing past individual failures (the report notes missing sources).
seo-weekly:
	-$(MAKE) seo-lh-prod
	-$(MAKE) seo-checks
	-$(MAKE) seo-gsc
	-$(MAKE) seo-crawl
	$(MAKE) seo-report
