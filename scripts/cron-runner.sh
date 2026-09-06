#!/usr/bin/env bash
set -e

# Aethera LinkedIn Autonomous Posting Runner
# Can be run manually or configured via crontab:
# Example: 0 14 * * 1,3,5 /bin/bash /home/kiran/aetherahealthcare-website/scripts/cron-runner.sh >> /home/kiran/aetherahealthcare-website/public/brand/carousel/publish_logs/cron.log 2>&1

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "========================================================"
echo "Starting Scheduled LinkedIn Publisher at $(date)"
echo "Working directory: $PROJECT_DIR"

# Run publisher for next queued campaign
node scripts/linkedin-publisher.mjs --publish-next --publish

echo "Completed execution at $(date)"
echo "========================================================"
