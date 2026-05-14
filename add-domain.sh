#!/bin/bash

# Script to add custom domain to Cloudflare Pages project
# Note: This is a demonstration script as the actual domain addition requires dashboard interaction

echo "Adding custom domain to Cloudflare Pages project..."

# Project details
PROJECT_NAME="aetherahealthcare-website"
CUSTOM_DOMAIN="aetherahealthcare.com"

echo "Project: $PROJECT_NAME"
echo "Domain to add: $CUSTOM_DOMAIN"

# In a real implementation, this would use the Cloudflare API
# But for Pages custom domains, dashboard interaction is currently required

echo ""
echo "Steps to complete in Cloudflare Dashboard:"
echo "1. Go to https://dash.cloudflare.com"
echo "2. Navigate to Pages > $PROJECT_NAME"
echo "3. Click Settings > Custom Domains"
echo "4. Click 'Add custom domain'"
echo "5. Enter '$CUSTOM_DOMAIN' and follow prompts"
echo "6. Configure DNS records as instructed"
echo "7. Wait for SSL certificate provisioning"

echo ""
echo "The site is already deployed and available at:"
echo "https://e79a2266.aetherahealthcare-website.pages.dev"

echo ""
echo "Once you complete the dashboard steps, your site will be accessible at:"
echo "https://$CUSTOM_DOMAIN"