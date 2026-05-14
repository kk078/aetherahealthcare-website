# Custom Domain Setup Guide for Aethera Healthcare Solutions

## Prerequisites
To configure the custom domain `aetherahealthcare.com` for your Cloudflare Pages website, you'll need:

1. Access to the Cloudflare dashboard (https://dash.cloudflare.com)
2. Ownership/control of the domain `aetherahealthcare.com`
3. Ability to modify DNS records for the domain

## Steps to Configure Custom Domain

### Step 1: Log into Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Log in with your Cloudflare account credentials

### Step 2: Navigate to Pages Project
1. In the dashboard, click on "Pages" in the left sidebar
2. Find and click on the "aetherahealthcare-website" project

### Step 3: Access Custom Domains Settings
1. Click on the "Settings" tab
2. Scroll down to the "Custom Domains" section
3. Click "Add custom domain"

### Step 4: Add Your Custom Domain
1. Enter `aetherahealthcare.com` in the domain field
2. Click "Continue"
3. Cloudflare will provide DNS records that need to be added to your domain

### Step 5: Configure DNS Records
Depending on what Cloudflare indicates, you'll need to add one or more of these DNS records:

#### Option A: If Cloudflare provides a CNAME record
- Type: CNAME
- Name: @ (or blank, depending on your DNS provider)
- Content: aetherahealthcare-website.pages.dev
- TTL: Auto or 1 hour

#### Option B: If Cloudflare provides an A record
- Type: A
- Name: @ (or blank)
- Content: (IP address provided by Cloudflare)
- TTL: Auto or 1 hour

#### Option C: For www subdomain (if needed)
- Type: CNAME
- Name: www
- Content: aetherahealthcare-website.pages.dev
- TTL: Auto or 1 hour

### Step 6: Wait for SSL Certificate Provisioning
1. After adding the DNS records, Cloudflare will automatically provision an SSL certificate
2. This process typically takes a few minutes to a few hours
3. You can check the status in the Custom Domains section

### Step 7: Verify Configuration
1. Once the SSL certificate is provisioned, your site will be accessible at https://aetherahealthcare.com
2. Test both http://aetherahealthcare.com and https://aetherahealthcare.com
3. Verify that all pages load correctly

## Troubleshooting

### DNS Propagation
- DNS changes can take up to 24-48 hours to propagate globally
- You can check propagation at sites like https://dnschecker.org

### SSL Certificate Issues
- If SSL certificate provisioning fails, ensure your DNS records are correct
- Wait for full DNS propagation before expecting SSL to work

### Mixed Content Issues
- Ensure all resources (images, scripts, stylesheets) are loaded over HTTPS
- The current site is already configured for HTTPS, so this shouldn't be an issue

## Current Deployment Information
- **Current URL**: https://f9eb2526.aetherahealthcare-website.pages.dev
- **Project Name**: aetherahealthcare-website
- **Deployment Status**: Active

## Post-Configuration Steps
After successfully configuring the custom domain:

1. Update any internal links in the website content to reference the new domain
2. Set up proper redirects if needed
3. Update your Google Search Console and Analytics properties
4. Submit your sitemap to Google Search Console
5. Monitor the site for any issues

## Need Help?
If you encounter any issues during the setup process, please contact:
- Cloudflare Support: https://support.cloudflare.com/
- Or refer to Cloudflare's documentation: https://developers.cloudflare.com/pages/