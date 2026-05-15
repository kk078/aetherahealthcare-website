# Instructions to Add Custom Domain to Cloudflare Pages

## Step 1: Access Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Log in with your credentials
3. Select your account with ID: 2c268625d9e6e4c084ff296fcdf5f3bd

## Step 2: Find Your Pages Project
1. In the left sidebar, look for "Workers & Pages" or just "Pages"
2. Find your project named "aetherahealthcare-website"
3. Click on the project to open its settings

## Step 3: Add Custom Domain
1. In the project dashboard, look for "Custom domains" or "Domains" section
2. Click "Add custom domain"
3. Enter: aetherahealthcare.com
4. Repeat for: www.aetherahealthcare.com

## Step 4: Verify DNS Records (if needed)
If prompted to add DNS records, Cloudflare will provide the specific records needed.
This typically involves adding:
- CNAME record for @ (root domain) pointing to your Pages subdomain
- CNAME record for www pointing to your Pages subdomain

## Step 5: Wait for SSL Certificate
Cloudflare will automatically provision SSL certificates for your custom domain.
This may take a few minutes to complete.

## Alternative: Manual DNS Setup
If the automatic setup doesn't work, you can manually add these DNS records:

1. CNAME record:
   - Name: @
   - Target: ae098127.aetherahealthcare-website.pages.dev
   - Proxy status: Proxied (orange cloud)

2. CNAME record:
   - Name: www
   - Target: ae098127.aetherahealthcare-website.pages.dev
   - Proxy status: Proxied (orange cloud)

Note: Cloudflare's CNAME flattening will handle the root domain restriction.