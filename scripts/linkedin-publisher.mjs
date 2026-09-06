#!/usr/bin/env node
/**
 * Automated LinkedIn Publisher for Aethera Healthcare Solutions.
 *
 * Supports two execution engines:
 *   1. Official LinkedIn REST API (requires LINKEDIN_ACCESS_TOKEN & LINKEDIN_AUTHOR_URN)
 *   2. Headless Playwright Browser Engine (requires LINKEDIN_LI_AT cookie or browser session)
 *
 * Usage:
 *   node scripts/linkedin-publisher.mjs --list
 *   node scripts/linkedin-publisher.mjs --carousel clean_claim --dry-run
 *   node scripts/linkedin-publisher.mjs --carousel clean_claim --publish
 *   node scripts/linkedin-publisher.mjs --carousel hcc_v28 --publish
 *   node scripts/linkedin-publisher.mjs --carousel biller_departure --publish
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { chromium } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const CAROUSEL_DIR = resolve(ROOT_DIR, 'public', 'brand', 'carousel');
const LOGS_DIR = resolve(CAROUSEL_DIR, 'publish_logs');

// Load environment variables from .env / .env.local if present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = resolve(ROOT_DIR, file);
    if (existsSync(fullPath)) {
      try {
        const content = readFileSync(fullPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch (err) {
        // Ignore read errors
      }
    }
  }
}
loadEnv();

// Catalog of publication-ready carousel campaigns
export const CAMPAIGNS = {
  clean_claim: {
    id: 'clean_claim',
    title: 'The Anatomy of a Clean Claim in 2026',
    subtitle: 'Why 14% of medical claims get denied on first submission',
    pdfPath: resolve(CAROUSEL_DIR, 'anatomy_of_a_clean_claim_2026.pdf'),
    documentTitle: 'The Anatomy of a Clean Claim in 2026 | Aethera Healthcare Solutions',
    targetUrl: 'https://aetherahealthcare.com/tools?utm_source=linkedin&utm_medium=document_post&utm_campaign=anatomy_clean_claim',
    caption: `The average specialty medical practice loses $118,000 per full-time physician every year to unworked claim denials and expired timely filing limits.

The reason? Payers have completely automated their front-end claims adjudication.

They aren't using human examiners to spot check claims. They deploy algorithmic denial rules that reject claims for micro-discrepancies before human eyes ever see them.

Swipe through the carousel below to see:
📌 The 3 coding & billing errors driving 78% of avoidable rejections
📌 Why 65% of denied claims are never resubmitted by internal teams
📌 The 4-step protocol we use to maintain a 99.1% first-pass clean claim rate

We also opened up a complimentary 50-Claim Denial Recovery Pilot for specialty clinics and ASCs looking to reclaim trapped revenue.

👉 Run an instant scrub on your claims: https://aetherahealthcare.com/tools?utm_source=linkedin&utm_medium=document_post&utm_campaign=anatomy_clean_claim
👉 Schedule an executive strategy call: https://aetherahealthcare.com/schedule?utm_source=linkedin&utm_medium=document_post&utm_campaign=anatomy_clean_claim

What is your practice's biggest billing hurdle right now: prior auths, modifier denials, or timely filing?

#MedicalBilling #HealthcareRCM #PracticeManagement #DenialManagement #HealthcareFinance #RevenueCycle`,
  },
  hcc_v28: {
    id: 'hcc_v28',
    title: 'CMS-HCC Model v28: The 2,294 Dropped Codes',
    subtitle: 'Impact on RAF scores & benchmark capitation funding',
    pdfPath: resolve(CAROUSEL_DIR, 'cms_hcc_v28_dropped_codes_2026.pdf'),
    documentTitle: 'CMS-HCC Model v28 Risk Delta & Documentation Guide | Aethera Healthcare',
    targetUrl: 'https://aetherahealthcare.com/tools/hcc-raf-calculator?utm_source=linkedin&utm_medium=document_post&utm_campaign=hcc_v28_delta',
    caption: `CMS dropped 2,294 ICD-10 diagnosis codes from risk adjustment under HCC Model v28.

If your medical group manages Medicare Advantage or value-based capitation contracts, your RAF scores and benchmark payments may drop 6% to 14%—even if your patients' health status hasn't changed.

Swipe through the carousel below to see:
📌 Why uncomplicated diabetes (E11.9) now carries ZERO risk adjustment weight
📌 The major restructuring of angina pectoris and peripheral vascular disease
📌 The 4 documentation rules clinicians must follow to protect reimbursement

To help clinical leaders calculate the exact model delta, our team built a free interactive HCC RAF Calculator.

👉 Test your patient cohorts here: https://aetherahealthcare.com/tools/hcc-raf-calculator?utm_source=linkedin&utm_medium=document_post&utm_campaign=hcc_v28_delta
👉 Book an executive RAF audit: https://aetherahealthcare.com/schedule?utm_source=linkedin&utm_medium=document_post&utm_campaign=hcc_v28_delta

How is your practice preparing clinical documentation habits for Model v28?

#MedicareAdvantage #HCCv28 #RiskAdjustment #MedicalCoding #ValueBasedCare #HealthcareCFO`,
  },
  biller_departure: {
    id: 'biller_departure',
    title: 'The Solo Biller Departure Playbook',
    subtitle: 'What practice administrators must do in the first 30 days',
    pdfPath: resolve(CAROUSEL_DIR, 'solo_biller_departure_playbook_2026.pdf'),
    documentTitle: 'The Solo Biller Departure Playbook | Aethera Healthcare Solutions',
    targetUrl: 'https://aetherahealthcare.com/lp/switch-medical-billing?utm_source=linkedin&utm_medium=document_post&utm_campaign=biller_departure',
    caption: `What happens when your solo in-house medical biller gives two weeks' notice?

For most practice administrators, it’s a panic moment:
❌ Unsubmitted charges pile up
❌ Clearinghouse rejections sit unresolved
❌ Timely filing deadlines quietly expire
❌ Cash flow dips for 60 to 90 days while recruiting a replacement

Swipe through the carousel below for the complete 30-day triage protocol:
📌 The 3 things to audit in your clearinghouse during Week 1
📌 The hidden costs of replacing an in-house biller vs. partnering with an RCM firm
📌 How our team executes a 14-day zero-downtime transition with 99.1% clean claims

👉 Read the practice transition guide: https://aetherahealthcare.com/lp/switch-medical-billing?utm_source=linkedin&utm_medium=document_post&utm_campaign=biller_departure
👉 Book a confidential billing triage call: https://aetherahealthcare.com/schedule?utm_source=linkedin&utm_medium=document_post&utm_campaign=biller_departure

Have you ever experienced sudden billing staff turnover? How did your practice handle the handoff?

#PracticeManagement #MedicalPractice #HealthcareAdministration #MedicalBilling #RCM #HealthcareLeadership`,
  },
};

/**
 * Execute upload using Official LinkedIn REST API
 */
async function publishViaLinkedInApi(campaign, isDryRun) {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN; // e.g. urn:li:person:XXXXX or urn:li:organization:XXXXX

  if (!token || !authorUrn) {
    throw new Error('Missing LINKEDIN_ACCESS_TOKEN or LINKEDIN_AUTHOR_URN in environment / .env.local');
  }

  console.log(`[LinkedIn REST API] Initializing document upload for: "${campaign.title}"...`);
  if (isDryRun) {
    console.log('[LinkedIn REST API] Dry-run enabled. Simulated successful API upload.');
    return { success: true, simulated: true, authorUrn, campaignId: campaign.id };
  }

  // 1. Initialize Document Upload
  const initRes = await fetch('https://api.linkedin.com/rest/documents?action=initializeUpload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'LinkedIn-Version': '202401',
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: authorUrn,
      },
    }),
  });

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`LinkedIn initializeUpload failed (${initRes.status}): ${errText}`);
  }

  const initData = await initRes.json();
  const uploadUrl = initData.value.uploadUrl;
  const documentUrn = initData.value.document;
  console.log(`[LinkedIn REST API] Document upload URL obtained. Document URN: ${documentUrn}`);

  // 2. Upload PDF binary
  const fileBytes = await readFile(campaign.pdfPath);
  console.log(`[LinkedIn REST API] Uploading ${fileBytes.byteLength} bytes to uploadUrl...`);
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/pdf',
    },
    body: fileBytes,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`LinkedIn binary upload failed (${uploadRes.status}): ${errText}`);
  }
  console.log('[LinkedIn REST API] Binary upload succeeded.');

  // 3. Create Feed Post with Document Media
  console.log('[LinkedIn REST API] Creating feed post...');
  const postRes = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'LinkedIn-Version': '202401',
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      author: authorUrn,
      commentary: campaign.caption,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        media: {
          title: campaign.documentTitle,
          id: documentUrn,
        },
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!postRes.ok) {
    const errText = await postRes.text();
    throw new Error(`LinkedIn create post failed (${postRes.status}): ${errText}`);
  }

  const postUrn = postRes.headers.get('x-restli-id') || 'published';
  console.log(`[LinkedIn REST API] Post successfully published! Post URN: ${postUrn}`);
  return { success: true, postUrn, documentUrn };
}

/**
 * Execute upload using Playwright Headless Browser Session
 */
async function publishViaPlaywright(campaign, isDryRun) {
  const liAtCookie = process.env.LINKEDIN_LI_AT;
  if (!liAtCookie) {
    throw new Error(
      'Missing LINKEDIN_LI_AT session cookie. Please set LINKEDIN_LI_AT in .env.local.\n' +
      'To obtain: Log into linkedin.com in your browser -> Open DevTools (F12) -> Application -> Cookies -> Copy value of "li_at".'
    );
  }

  await mkdir(LOGS_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionLogPrefix = join(LOGS_DIR, `${campaign.id}_${timestamp}`);

  console.log(`[Playwright Engine] Launching headless browser with authenticated session...`);
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CI ? undefined : '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });

  // Inject session cookie
  await context.addCookies([
    {
      name: 'li_at',
      value: liAtCookie,
      domain: '.linkedin.com',
      path: '/',
      httpOnly: true,
      secure: true,
    },
  ]);

  const page = await context.newPage();

  try {
    console.log('[Playwright Engine] Navigating to LinkedIn feed...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Verify session
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/authwall') || currentUrl.includes('/checkpoint')) {
      await page.screenshot({ path: `${sessionLogPrefix}_auth_failed.png` });
      throw new Error(`LinkedIn session rejected or requires checkpoint verification. Saved screenshot: ${sessionLogPrefix}_auth_failed.png`);
    }
    console.log('[Playwright Engine] Authenticated session confirmed on LinkedIn feed.');

    // Click "Start a post"
    console.log('[Playwright Engine] Opening post composer modal...');
    const startPostBtn = page.locator('button:has-text("Start a post"), .share-box-feed-entry__trigger').first();
    await startPostBtn.waitFor({ state: 'visible', timeout: 10000 });
    await startPostBtn.click();

    // Wait for post modal
    const modal = page.locator('div[role="dialog"]').first();
    await modal.waitFor({ state: 'visible', timeout: 10000 });

    // Upload document
    console.log(`[Playwright Engine] Attaching PDF document: ${campaign.pdfPath}...`);
    // LinkedIn document upload can be triggered via file input or document button
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 10000 }).catch(() => null);
    const docBtn = modal.locator('button[aria-label*="document" i], button:has-text("Document")').first();

    if (await docBtn.isVisible()) {
      await docBtn.click();
    }

    const fileChooser = await fileChooserPromise;
    if (fileChooser) {
      await fileChooser.setFiles(campaign.pdfPath);
    } else {
      // Fallback: look for hidden file input
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(campaign.pdfPath);
    }

    // Set document title
    console.log(`[Playwright Engine] Setting document title: "${campaign.documentTitle}"...`);
    const titleInput = page.locator('input[placeholder*="title" i], input[name*="title" i], input[aria-label*="title" i]').first();
    await titleInput.waitFor({ state: 'visible', timeout: 15000 });
    await titleInput.fill(campaign.documentTitle);

    // Click "Done" / "Next" in document attachment modal
    const doneBtn = page.locator('button:has-text("Done"), button:has-text("Next")').first();
    await doneBtn.click();

    // Fill commentary caption
    console.log('[Playwright Engine] Entering post caption commentary...');
    const editor = modal.locator('div[role="textbox"][contenteditable="true"]').first();
    await editor.waitFor({ state: 'visible', timeout: 10000 });
    await editor.click();
    await editor.fill(campaign.caption);

    // Take pre-post screenshot
    const previewScreenshot = `${sessionLogPrefix}_pre_post_preview.png`;
    await page.screenshot({ path: previewScreenshot });
    console.log(`[Playwright Engine] Pre-post verification screenshot captured: ${previewScreenshot}`);

    if (isDryRun) {
      console.log('[Playwright Engine] Dry run active: Post not published. Closing browser.');
      return { success: true, dryRun: true, previewScreenshot };
    }

    // Click Post
    console.log('[Playwright Engine] Publishing post...');
    const postBtn = modal.locator('button:has-text("Post"), .share-actions__primary-action').first();
    await postBtn.click();

    // Wait for modal to close and toast/feed confirmation
    await modal.waitFor({ state: 'hidden', timeout: 20000 });
    await page.waitForTimeout(3000);

    const confirmationScreenshot = `${sessionLogPrefix}_published.png`;
    await page.screenshot({ path: confirmationScreenshot });
    console.log(`[Playwright Engine] Post successfully published! Confirmation screenshot: ${confirmationScreenshot}`);

    return { success: true, published: true, screenshot: confirmationScreenshot };
  } finally {
    await browser.close();
  }
}

/**
 * Main Controller
 */
async function main() {
  const args = process.argv.slice(2);
  const isList = args.includes('--list');
  const isDryRun = args.includes('--dry-run');
  const isPublish = args.includes('--publish');
  const carouselArgIdx = args.indexOf('--carousel');
  const carouselKey = carouselArgIdx !== -1 ? args[carouselArgIdx + 1] : null;

  console.log('======================================================');
  console.log('  Aethera Healthcare — LinkedIn Automated Publisher  ');
  console.log('======================================================\n');

  if (isList || (!carouselKey && !isPublish)) {
    console.log('Available Carousels Ready for Automated Publishing:\n');
    for (const [key, item] of Object.entries(CAMPAIGNS)) {
      const exists = existsSync(item.pdfPath);
      console.log(`• [${key}]`);
      console.log(`  Title: ${item.title}`);
      console.log(`  File:  ${item.pdfPath} (${exists ? 'READY' : 'MISSING'})`);
      console.log(`  Link:  ${item.targetUrl}`);
      console.log('');
    }
    console.log('Configuration Status:');
    console.log(`• LINKEDIN_ACCESS_TOKEN: ${process.env.LINKEDIN_ACCESS_TOKEN ? 'CONFIGURED' : 'NOT SET'}`);
    console.log(`• LINKEDIN_AUTHOR_URN:   ${process.env.LINKEDIN_AUTHOR_URN ? 'CONFIGURED' : 'NOT SET'}`);
    console.log(`• LINKEDIN_LI_AT:        ${process.env.LINKEDIN_LI_AT ? 'CONFIGURED' : 'NOT SET'}`);
    console.log('\nQuick Commands:');
    console.log('  node scripts/linkedin-publisher.mjs --carousel clean_claim --dry-run');
    console.log('  node scripts/linkedin-publisher.mjs --carousel clean_claim --publish');
    return;
  }

  const campaign = CAMPAIGNS[carouselKey];
  if (!campaign) {
    console.error(`Error: Unknown carousel key "${carouselKey}". Choose from: ${Object.keys(CAMPAIGNS).join(', ')}`);
    process.exit(1);
  }

  if (!existsSync(campaign.pdfPath)) {
    console.error(`Error: PDF document not found at ${campaign.pdfPath}. Run 'python3 scripts/generate_linkedin_carousel.py' first.`);
    process.exit(1);
  }

  console.log(`Target Campaign: ${campaign.title}`);
  console.log(`PDF Document:    ${campaign.pdfPath}`);
  console.log(`Mode:            ${isDryRun ? 'DRY RUN (Preview Only)' : 'LIVE PUBLISHING'}`);
  console.log('------------------------------------------------------');

  // Choose engine
  const hasApi = process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_AUTHOR_URN;
  const hasCookie = !!process.env.LINKEDIN_LI_AT;

  if (hasApi) {
    console.log('Using Engine: Official LinkedIn REST API');
    const result = await publishViaLinkedInApi(campaign, isDryRun);
    console.log('\nResult:', JSON.stringify(result, null, 2));
  } else if (hasCookie) {
    console.log('Using Engine: Playwright Headless Browser Session');
    const result = await publishViaPlaywright(campaign, isDryRun);
    console.log('\nResult:', JSON.stringify(result, null, 2));
  } else {
    console.log('\n[NOTICE] No LinkedIn credentials found in environment or .env.local.');
    console.log('\nTo automate uploads, configure ONE of the following options:\n');
    console.log('--- Option A: Browser Session Cookie (Quickest - 30 seconds) ---');
    console.log('1. Log into linkedin.com in Google Chrome');
    console.log('2. Open Chrome DevTools (Press F12) -> Click "Application" tab -> "Cookies" -> "https://www.linkedin.com"');
    console.log('3. Copy the value of the "li_at" cookie');
    console.log('4. Create a .env.local file in this repository with:');
    console.log('   LINKEDIN_LI_AT=your_li_at_cookie_here\n');
    console.log('--- Option B: Official Developer API Token ---');
    console.log('1. Go to https://www.linkedin.com/developers and create an App with "Share on LinkedIn" product');
    console.log('2. Generate an OAuth2 token with "w_member_social"');
    console.log('3. Add to .env.local:');
    console.log('   LINKEDIN_ACCESS_TOKEN=your_token_here');
    console.log('   LINKEDIN_AUTHOR_URN=urn:li:person:YOUR_ID or urn:li:organization:YOUR_PAGE_ID\n');
    console.log('Simulation Preview for this Carousel:');
    console.log('------------------------------------------------------');
    console.log(`Document Title: ${campaign.documentTitle}`);
    console.log(`Destination:    ${campaign.targetUrl}`);
    console.log(`Caption:\n${campaign.caption}\n`);
    console.log('------------------------------------------------------');
  }
}

main().catch((err) => {
  console.error('\nPublishing failed:', err.message);
  process.exit(1);
});
