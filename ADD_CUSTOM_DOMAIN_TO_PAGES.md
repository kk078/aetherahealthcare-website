# How to Add Custom Domain to Cloudflare Pages Project

Since the domain aetherahealthcare.com is already available in your Cloudflare account, here are the exact steps to configure it for your Pages project:

## Steps:

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Login with your credentials

2. **Navigate to Pages Project**
   - Click on "Pages" in the left sidebar
   - Select "aetherahealthcare-website" project

3. **Access Custom Domains Settings**
   - Click on the "Settings" tab
   - Scroll down to "Custom Domains" section
   - Click "Add custom domain"

4. **Add Your Domain**
   - Enter: `aetherahealthcare.com`
   - Click "Continue to DNS"

5. **Configure DNS (Option 1 - Recommended)**
   - Cloudflare will likely suggest a CNAME record:
     ```
     Type: CNAME
     Name: @ (or leave blank)
     Target: aetherahealthcare-website.pages.dev
     Proxy status: Proxied (orange cloud enabled)
     TTL: Auto
     ```
   - Click "Activate Domain" to save

6. **Alternative DNS Configuration (if CNAME doesn't work for apex domain)**
   - If Cloudflare suggests A records instead:
     ```
     Type: A
     Name: @ (or leave blank)
     IPv4 address: (Use the IPs provided by Cloudflare)
     Proxy status: Proxied (orange cloud enabled)
     TTL: Auto
     ```

7. **Add WWW Subdomain (Optional)**
   - To support www.aetherahealthcare.com:
     ```
     Type: CNAME
     Name: www
     Target: aetherahealthcare-website.pages.dev
     Proxy status: Proxied (orange cloud enabled)
     TTL: Auto
     ```

8. **Wait for SSL Certificate**
   - Cloudflare will automatically provision an SSL certificate
   - This usually takes 1-15 minutes
   - Status will change from "Pending" to "Active"

9. **Verify Configuration**
   - Visit https://aetherahealthcare.com
   - Check that the site loads correctly
   - Verify SSL certificate is working (padlock icon in browser)

## Troubleshooting:

- **DNS Propagation**: Can take up to 24 hours globally
- **SSL Issues**: Ensure DNS records are correct and propagated
- **Mixed Content**: All resources should load over HTTPS

## Post-Setup Recommendations:

1. Set up automatic HTTPS redirects in Cloudflare Dashboard:
   - Rules > Redirect Rules
   - Create rule to redirect HTTP to HTTPS

2. Enable HTTP/2 and HTTP/3 for better performance:
   - Network settings in Cloudflare Dashboard

3. Set up proper caching:
   - Caching settings in Cloudflare Dashboard

The site is already deployed and working at https://e79a2266.aetherahealthcare-website.pages.dev - once you complete these steps, aetherahealthcare.com will point to the same content.