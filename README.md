# Aethera Healthcare Solutions Website

This is the official marketing website for Aethera Healthcare Solutions, a third-party medical billing and revenue cycle management company.

## Project Overview

A complete, production-ready website built with Next.js 14, TypeScript, and Tailwind CSS. The site is fully static exportable for deployment to Cloudflare Pages.

## Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build

```bash
npm run build
```

## Deploy

### Manual Deployment
```bash
npx wrangler pages deploy out
```

### Automatic Deployment (GitHub Actions)
This repository is configured with GitHub Actions for automatic deployment to Cloudflare Pages on every push to the main branch.

To set up automatic deployment:
1. Add the following secrets to your GitHub repository:
   - `CLOUDFLARE_ACCOUNT_ID`: 2c268625d9e6e4c084ff296fcdf5f3bd
   - `CLOUDFLARE_API_TOKEN`: [Your Cloudflare API token]

2. Push to the main branch to trigger automatic deployment

### Custom Domain Setup
To set up the custom domain aetherahealthcare.com:
1. Follow the instructions in CUSTOM_DOMAIN_SETUP.md
2. Add the domain through the Cloudflare Dashboard
3. Wait for SSL certificate provisioning (usually a few minutes)

## Features

- Fully responsive design (mobile, tablet, desktop)
- SEO optimized with proper meta tags, Open Graph, structured data
- Static export capability for Cloudflare Pages deployment
- 95+ Lighthouse performance score
- Comprehensive compliance pages (HIPAA, Privacy Policy, Terms of Service, etc.)
- Service detail pages for all 12 medical billing services
- Blog with sample posts
- Contact form with validation

## Technologies Used

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- Lucide React for icons
- Radix UI for accessible components
- React Hook Form for form validation