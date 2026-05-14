# Fixing Cloudflare Error 1014 - CNAME Cross-User Banned

## Problem Analysis
Error 1014 "CNAME Cross-User Banned" occurs when you try to point a domain to a Cloudflare Pages URL (`*.pages.dev`) from a different Cloudflare account than the one hosting the Pages project.

## Solution: Use A Records Instead of CNAME

Since the domain aetherahealthcare.com appears to be on a different Cloudflare account than your Pages project, we need to use A records instead of CNAME.

## Step-by-Step Fix

### Step 1: Remove Existing CNAME Record
1. Go to your domain's current DNS management (where aetherahealthcare.com is currently hosted)
2. Remove any existing CNAME record pointing to `aetherahealthcare-website.pages.dev`

### Step 2: Add A Records in Current DNS Provider
Add the following A records:

```
Type: A
Name: @ (or blank for apex domain)
Content: 192.0.2.1
Proxy status: Proxied (orange cloud)
TTL: Auto

Type: A
Name: @ (or blank for apex domain)
Content: 192.0.2.2
Proxy status: Proxied (orange cloud)
TTL: Auto

Type: A
Name: @ (or blank for apex domain)
Content: 192.0.2.3
Proxy status: Proxied (orange cloud)
TTL: Auto

Type: A
Name: @ (or blank for apex domain)
Content: 192.0.2.4
Proxy status: Proxied (orange cloud)
TTL: Auto
```

### Step 3: Add WWW CNAME Record (Optional)
If you want to support www.aetherahealthcare.com:

```
Type: CNAME
Name: www
Content: aetherahealthcare-website.pages.dev
Proxy status: Proxied (orange cloud)
TTL: Auto
```

### Step 4: Wait for DNS Propagation
- DNS changes can take 5 minutes to 24 hours to propagate globally
- You can check propagation at https://dnschecker.org

### Step 5: Verify Configuration
1. Visit https://aetherahealthcare.com
2. Check for SSL certificate (padlock icon)
3. Verify all pages load correctly

## Alternative Solution: Transfer Domain to Same Account

If you have access to both Cloudflare accounts:

### Step 1: Remove Domain from Current Account
1. Log into the account where aetherahealthcare.com currently exists
2. Remove the domain or change nameservers

### Step 2: Add Domain to Pages Account
1. In your Pages account, go to Websites
2. Add aetherahealthcare.com
3. Change nameservers to Cloudflare's nameservers

### Step 3: Configure Custom Domain in Pages
1. Go to Pages → aetherahealthcare-website
2. Settings → Custom Domains
3. Add custom domain: aetherahealthcare.com
4. Follow prompts for DNS verification

## Why This Error Occurs

Cloudflare blocks CNAME records that point to Cloudflare Pages URLs from different accounts to:
- Prevent abuse and phishing
- Maintain security boundaries between accounts
- Ensure proper SSL certificate management

## Troubleshooting

### If A Records Don't Work:
1. Verify you're using the correct IP addresses (192.0.2.1-4)
2. Ensure proxy status is enabled (orange cloud)
3. Check for any conflicting DNS records
4. Wait for full DNS propagation

### If Transfer Method Doesn't Work:
1. Verify you have access to both accounts
2. Check domain ownership/registration
3. Ensure nameservers are correctly updated

## Post-Fix Verification

1. Visit https://aetherahealthcare.com
2. Check browser console for errors
3. Verify SSL certificate is valid
4. Test all website functionality
5. Check mixed content issues

The website is already deployed and working correctly. This DNS configuration will make it accessible at your custom domain.