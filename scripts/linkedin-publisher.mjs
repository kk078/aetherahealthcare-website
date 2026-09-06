#!/usr/bin/env node
/**
 * Automated LinkedIn Publisher for Aethera Healthcare Solutions.
 *
 * Supports three formats:
 *   1. PDF Carousel Documents (Native LinkedIn Slide Decks)
 *   2. High-Resolution Architecture Infographics (Single-Image Posts)
 *   3. Strategic Text & Data Breakdown Posts (Thought Leadership)
 *
 * Execution Engines:
 *   - Official LinkedIn REST API (LINKEDIN_ACCESS_TOKEN & LINKEDIN_AUTHOR_URN) [Primary]
 *   - Session Cookie / Playwright Browser Engine [Fallback]
 *
 * Usage:
 *   node scripts/linkedin-publisher.mjs --list
 *   node scripts/linkedin-publisher.mjs --campaign ai_integration_stack --dry-run
 *   node scripts/linkedin-publisher.mjs --campaign ai_integration_stack --publish
 *   node scripts/linkedin-publisher.mjs --publish-next
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { chromium } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const CAROUSEL_DIR = resolve(ROOT_DIR, 'public', 'brand', 'carousel');
const INFOGRAPHICS_DIR = resolve(ROOT_DIR, 'public', 'brand', 'infographics');
const LOGS_DIR = resolve(CAROUSEL_DIR, 'publish_logs');
const LEDGER_PATH = resolve(__dirname, 'published-posts.json');

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
      } catch (err) {}
    }
  }
}
loadEnv();

export const CAMPAIGNS = {
  clean_claim: {
    id: 'clean_claim',
    format: 'document',
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

  india_ai: {
    id: 'india_ai',
    format: 'document',
    title: 'How US Billing Companies Scale With India + AI Economics',
    subtitle: 'Why legacy manual offshore BPOs fail and how AI-augmented certified hubs unlock 40%+ margins',
    pdfPath: resolve(CAROUSEL_DIR, 'india_ai_global_rcm_2026.pdf'),
    documentTitle: 'How US Medical Billing Companies Scale With India + AI Economics | Aethera',
    targetUrl: 'https://aetherahealthcare.com/for-billing-companies?utm_source=linkedin&utm_medium=document_post&utm_campaign=india_ai_delivery_model',
    caption: `US medical billing companies and RCM agencies are facing an unprecedented operating squeeze:

Certified AAPC coders and AR specialists in the US now command $38 to $52/hour ($75,000 to $95,000 fully loaded annual cost). With a 38% annual churn rate, agency owners spend more time recruiting and retraining than closing new provider accounts.

Meanwhile, pure software startups promise "fully automated AI billing" that falls flat on complex surgical operative notes and payer LCD rules. And legacy offshore BPOs in India sold manual keyboard work that led to 15%+ error rates and endless rework.

Pure AI fails on complex claims. Pure offshore manual labor fails on quality.
The winning model in 2026 is India + AI:

Swipe through the carousel below to see:
📌 The True Math: Why staffing an internal US billing pod caps agency profit margins at 18%
📌 The Failure Modes: Why black-box AI and traditional copy-paste BPOs both fall short
📌 The Hybrid Engine: How autonomous pre-submission scrubbing paired with AAPC-certified specialists in India delivers a 99.1% clean claim rate
📌 The White-Label Architecture: How Aethera operates directly inside your Athena, Epic, eClinicalWorks, or AdvancedMD system without disrupting your provider clients

We are opening up a Complimentary 50-Claim Back-Office Pilot for US billing agencies: send us 50 of your denied or aging claims, and our team will scrub them and prove cash recovery within 14 days. Zero cost, zero commitment.

👉 Explore our white-label partner program: https://aetherahealthcare.com/for-billing-companies?utm_source=linkedin&utm_medium=document_post&utm_campaign=india_ai_delivery_model
👉 Book an executive partner strategy call: https://aetherahealthcare.com/schedule?utm_source=linkedin&utm_medium=document_post&utm_campaign=india_ai_delivery_model
👉 Claim your 50-claim pilot audit: https://aetherahealthcare.com/free-assessment?utm_source=linkedin&utm_medium=document_post&utm_campaign=india_ai_delivery_model

For US billing company owners and RCM directors: What is your biggest operational headache right now—recruiting experienced coders or working stubborn commercial denials?

#MedicalBilling #RevenueCycleManagement #HealthcareRCM #MedicalCoding #HealthcareAI #HealthTech #PracticeManagement #HealthAdmin`,
  },

  ai_integration_stack: {
    id: 'ai_integration_stack',
    format: 'image',
    title: 'How US Medical Billing Companies Integrate AI & Global Delivery',
    subtitle: 'The 4-layer architecture to deploy autonomous AI without migrating EHRs',
    imagePath: resolve(INFOGRAPHICS_DIR, 'ai_rcm_integration_architecture_2026.png'),
    targetUrl: 'https://aetherahealthcare.com/for-billing-companies?utm_source=linkedin&utm_medium=image_post&utm_campaign=ai_integration_stack',
    caption: `How does a US medical billing company integrate autonomous AI without replacing their existing EHR or hiring software developers?

Most billing company founders and practice administrators think AI adoption requires a complete software migration.

It doesn’t.

Here is the exact 4-layer architecture we deploy behind the scenes for US medical billing agencies and specialty clinics:

🔹 Layer 1: Zero-Migration Ingestion
We operate directly inside your existing Practice Management system (AthenaHealth, Epic, eClinicalWorks, ModMed, AdvancedMD, Kareo). Your provider clients experience zero disruption, zero new logins, and zero migration risk.

🔹 Layer 2: Aethera AI Pre-Submission Neural Engine
Before an 837P claim touches the clearinghouse (Availity, Change, Waystar), our engine parses NCCI Procedure-to-Procedure bundling, CMS LCD/NCD medical necessity rules, and modifier requirements in under 250ms. 90% of routine claims are cleared autonomously.

🔹 Layer 3: AAPC/AHIMA Certified Specialist Pods (India Global Delivery Hub)
The 10% high-complexity exceptions—surgical operative note teardowns, unlisted CPT disputes, and commercial medical necessity reviews—are routed to dedicated AAPC-credentialed coders (CPC, COC, CRC). Working overnight across time zones, your backlog is cleared before your US team opens their inbox.

🔹 Layer 4: Automated 835 Remittance & Denial Defense
Real-time ERA parsing maps CARC/RARC codes to automated appeal packages citing clinical documentation and CMS guidelines, overturning 74%+ of initial denials.

The bottom-line result for US billing agencies:
✅ 99.1% first-pass clean claim rate
✅ 65% reduction in back-office operational costs
✅ Sub-14 day average AR days
✅ Scalable margin expansion without adding US FTE overhead

We’re inviting US billing company owners and practice administrators to test this in action with our Complimentary 50-Claim Back-Office Pilot. Send us 50 denied or aging claims—we’ll scrub them and deliver a complete recovery audit in 14 days at zero cost.

👉 Explore the white-label program: https://aetherahealthcare.com/for-billing-companies?utm_source=linkedin&utm_medium=image_post&utm_campaign=ai_integration_stack
👉 Book an executive architecture call: https://aetherahealthcare.com/schedule?utm_source=linkedin&utm_medium=image_post&utm_campaign=ai_integration_stack
👉 Request your 50-claim pilot audit: https://aetherahealthcare.com/free-assessment?utm_source=linkedin&utm_medium=image_post&utm_campaign=ai_integration_stack

How is your billing operation handling the explosion of payer denial algorithms this year?

#MedicalBilling #RevenueCycleManagement #HealthcareRCM #HealthTech #MedicalCoding #HealthcareAI #HealthAdministration #HospitalCFO`,
  },

  payer_ai_arms_race: {
    id: 'payer_ai_arms_race',
    format: 'text',
    title: 'Commercial Payers Are Denying Claims With AI. Why US Providers Cant Win with Manual Billing.',
    subtitle: 'The $43.84 rework cost vs $0.12 AI intercept financial teardown',
    targetUrl: 'https://aetherahealthcare.com/free-assessment?utm_source=linkedin&utm_medium=post&utm_campaign=payer_ai_arms_race',
    caption: `Commercial payers (UnitedHealthcare, Anthem, Aetna, Cigna) are no longer using human adjusters to review your routine claims.

They have deployed algorithmic denial bots and predictive rules engines that instantly reject claims for micro-discrepancies—missing clinical indicators, subtle LCD mismatches, or modifier 25/59 unbundling flags.

Meanwhile, most US medical practices and billing companies are still trying to fight an automated algorithm war with manual spreadsheets and entry-level staff.

Here is why that math is mathematically broken in 2026:

📊 The Cost Equation:
• Average cost to manually rework and appeal a single denied claim: $43.84
• Average time spent on hold with a commercial payer rep: 38 minutes
• Percentage of denied claims written off because staff ran out of time: 65%
• Cost to intercept that same error pre-submission with an AI rules engine: $0.12

When a practice submits 2,500 claims a month with a typical 12% denial rate, that’s 300 denials every month:
❌ $13,152/month ($157,800/year) spent purely on rework labor.
❌ An estimated $85,000+ in permanently lost cash flow from timely filing expirations.

How Aethera levels the playing field:
1️⃣ Autonomous Pre-Submission Scrubbing: We match claims against real-time CMS and commercial payer rules before clearinghouse transmission.
2️⃣ Hybrid Human-in-the-Loop Delivery: Proprietary AI pre-qualifies appeals, while our AAPC-certified specialists in India draft custom, clinical appeal dossiers for the complex 10%.
3️⃣ White-Label Integration: We plug directly into your AthenaHealth, Epic, or eCW system with zero disruption.

The outcome: A consistent 99.1% first-pass clean claim rate and an immediate 65% reduction in billing overhead.

If you want to see how much trapped revenue is hiding in your clearinghouse:
👉 Run a free assessment: https://aetherahealthcare.com/free-assessment?utm_source=linkedin&utm_medium=post&utm_campaign=payer_ai_arms_race
👉 Schedule an executive billing audit: https://aetherahealthcare.com/schedule?utm_source=linkedin&utm_medium=post&utm_campaign=payer_ai_arms_race

Are you seeing an uptick in automated denials from your top commercial payers? Which CARC code is causing your team the most grief?

#HealthcareFinance #RCM #RevenueCycle #MedicalBilling #HealthcareLeadership #PracticeManagement #HealthTech #DenialManagement`,
  },

  death_of_manual_bpo: {
    id: 'death_of_manual_bpo',
    format: 'text',
    title: 'The Death of the Offshore Keystroke BPO and the Rise of the AI-Augmented Certified Coder in India',
    subtitle: 'Transforming Indian coding talent into AI Copilots delivering 99.1% clean claims',
    targetUrl: 'https://aetherahealthcare.com/for-billing-companies?utm_source=linkedin&utm_medium=post&utm_campaign=death_of_manual_bpo',
    caption: `If you run a US medical billing company or manage an ambulatory surgery center, you probably have a horror story about traditional offshore outsourcing from the 2010s:

⚠️ Offshore teams who simply copied and pasted data from one screen to another
⚠️ High turnover that required you to constantly re-train new staff
⚠️ Coder errors that led to clearinghouse rejections and compliance audits
⚠️ Zero accountability and inflexible 1-year FTE contracts

That legacy BPO model is dead. And its demise is the best thing that ever happened to healthcare revenue cycle management.

Here is what has replaced it: The AI-Augmented Global Delivery Model.

In our delivery centers in India, our team members are not data-entry clerks. They are AAPC- and AHIMA-certified clinical coding professionals (CPC, COC, CRC) who work as AI Co-Pilots.

Here is how the synergy works between the US and India:
1. Intelligent Pre-Processing: Aethera’s proprietary AI engine parses the patient chart, matches NCCI edits, verifies local LCD coverage, and prepares a structured claim dossier in seconds.
2. Clinical Specialist Validation: Instead of spending 20 minutes typing basic patient demographics, our certified coders in India focus 100% of their cognitive energy on high-value clinical judgment—auditing complex operative notes, validating modifier 59/XS documentation, and structuring payer appeals.
3. Speed & Cost Efficiency: Because AI eliminates the tedious administrative friction, an AAPC-certified specialist in India can process 3x the volume with 99.1% clean claim accuracy, at a 65% lower operating cost than a US FTE.

This isn’t about replacing US billing companies. It’s about empowering US billing companies to scale from 15 provider accounts to 60 provider accounts without running out of cash or drowning in recruitment.

We are so confident in this hybrid delivery model that we offer a 50-Claim Back-Office Pilot with zero upfront commitment.

👉 Read how US billing companies scale with Aethera: https://aetherahealthcare.com/for-billing-companies?utm_source=linkedin&utm_medium=post&utm_campaign=death_of_manual_bpo
👉 Book a strategic partnership call: https://aetherahealthcare.com/schedule?utm_source=linkedin&utm_medium=post&utm_campaign=death_of_manual_bpo

What was your biggest hesitation when considering offshore delivery for your RCM operations?

#MedicalBilling #RCM #HealthAdministration #HealthcareOperations #MedicalCoding #GlobalDelivery #AAPC #HealthTech`,
  },

  hcc_v28: {
    id: 'hcc_v28',
    format: 'document',
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
    format: 'document',
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

  fifty_claim_challenge: {
    id: 'fifty_claim_challenge',
    format: 'text',
    title: 'The 50-Claim Challenge: Free Back-Office Audit for US Billing Companies',
    subtitle: 'Put our AI + India delivery model to the test with zero risk',
    targetUrl: 'https://aetherahealthcare.com/free-assessment?utm_source=linkedin&utm_medium=post&utm_campaign=50_claim_challenge',
    caption: `A challenge for US medical billing company founders, RCM executives, and practice administrators:

Send us 50 of your toughest aging or denied claims.

Our AI pre-submission rules engine and AAPC-certified clinical specialists will analyze them, identify root causes, draft payer-compliant appeals, and present a complete cash recovery audit within 14 days.

If we don't identify uncollected cash flow and prove our 99.1% clean-claim protocol, you've lost nothing.
If we do, you just found a back-office partner that can reduce your operational overhead by 65%.

Why are we offering this?

Because the US healthcare revenue cycle is plagued by software companies making empty promises about "magic AI" that fails in production, and offshore BPOs that create more errors than they solve.

We believe the only way to earn your trust is with proof on YOUR claims, in YOUR specialty, under YOUR payer mix.

Here is how the 50-Claim Challenge works:
1️⃣ Sign a standard mutual NDA and BAA (100% HIPAA compliant).
2️⃣ Upload a batch of 50 denied or aging claims from your clearinghouse (Athena, Epic, eCW, or CSV export).
3️⃣ In 14 days, receive an Executive Recovery Report detailing:
   • Specific NCCI / LCD bundling triggers that caused the initial rejections
   • Overturn propensity scores and drafted appeal dossiers for immediate filing
   • Financial forecast of recurring margin improvements if integrated across your full book of business

Zero software migration. Zero setup fees. Zero obligation to sign a contract.

👉 Claim one of our 5 pilot slots for this month: https://aetherahealthcare.com/free-assessment?utm_source=linkedin&utm_medium=post&utm_campaign=50_claim_challenge
👉 Or book an initial call directly with our leadership: https://aetherahealthcare.com/schedule?utm_source=linkedin&utm_medium=post&utm_campaign=50_claim_challenge

#MedicalBilling #RevenueCycle #PracticeManagement #HealthcareFinance #HealthcareCFO #MedicalPractice #DenialRecovery #HealthcareConsulting`,
  },
};

function getLedger() {
  if (!existsSync(LEDGER_PATH)) return [];
  try {
    return JSON.parse(readFileSync(LEDGER_PATH, 'utf8'));
  } catch (err) {
    return [];
  }
}

async function recordPublication(entry) {
  const ledger = getLedger();
  ledger.push(entry);
  await writeFile(LEDGER_PATH, JSON.stringify(ledger, null, 2), 'utf8');
}

/**
 * Execute upload using Official LinkedIn REST API
 */
async function publishViaLinkedInApi(campaign, isDryRun) {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN;

  if (!token || !authorUrn) {
    throw new Error('Missing LINKEDIN_ACCESS_TOKEN or LINKEDIN_AUTHOR_URN in environment / .env.local');
  }

  console.log(`[LinkedIn REST API] Preparing campaign "${campaign.title}" (${campaign.format})...`);
  if (isDryRun) {
    console.log('[LinkedIn REST API] Dry-run enabled. Simulated successful API publication.');
    return { success: true, simulated: true, authorUrn, campaignId: campaign.id, format: campaign.format };
  }

  let mediaUrn = null;

  // 1. PDF Document Upload
  if (campaign.pdfPath && existsSync(campaign.pdfPath)) {
    console.log(`[LinkedIn REST API] Initializing document upload for: "${campaign.title}"...`);
    const initRes = await fetch('https://api.linkedin.com/rest/documents?action=initializeUpload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'LinkedIn-Version': '202601',
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
    mediaUrn = initData.value.document;
    console.log(`[LinkedIn REST API] Document URN: ${mediaUrn}`);

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
    console.log('[LinkedIn REST API] Binary PDF upload succeeded.');
  }

  // 2. Image Upload
  else if (campaign.imagePath && existsSync(campaign.imagePath)) {
    console.log(`[LinkedIn REST API] Initializing image upload for: "${campaign.title}"...`);
    const initRes = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'LinkedIn-Version': '202601',
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
      throw new Error(`LinkedIn image initializeUpload failed (${initRes.status}): ${errText}`);
    }

    const initData = await initRes.json();
    const uploadUrl = initData.value.uploadUrl;
    mediaUrn = initData.value.image;
    console.log(`[LinkedIn REST API] Image URN: ${mediaUrn}`);

    const fileBytes = await readFile(campaign.imagePath);
    console.log(`[LinkedIn REST API] Uploading ${fileBytes.byteLength} bytes to uploadUrl...`);
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'image/png',
      },
      body: fileBytes,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`LinkedIn binary image upload failed (${uploadRes.status}): ${errText}`);
    }
    console.log('[LinkedIn REST API] Binary image upload succeeded.');
  }

  // 3. Create feed post
  console.log('[LinkedIn REST API] Creating feed post...');
  const postPayload = {
    author: authorUrn,
    commentary: campaign.caption,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  if (mediaUrn) {
    postPayload.content = {
      media: {
        title: campaign.documentTitle || campaign.title,
        id: mediaUrn,
      },
    };
  }

  const postRes = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'LinkedIn-Version': '202601',
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postPayload),
  });

  if (!postRes.ok) {
    const errText = await postRes.text();
    throw new Error(`LinkedIn create post failed (${postRes.status}): ${errText}`);
  }

  const postUrn = postRes.headers.get('x-restli-id') || 'published';
  const postUrl = `https://www.linkedin.com/feed/update/${postUrn}`;
  console.log(`[LinkedIn REST API] Post successfully published!`);
  console.log(`[LinkedIn REST API] Live Post URL: ${postUrl}`);

  await recordPublication({
    id: campaign.id,
    title: campaign.title,
    format: campaign.format,
    postUrn,
    postUrl,
    mediaUrn,
    publishedAt: new Date().toISOString(),
  });

  return { success: true, postUrn, postUrl, mediaUrn, format: campaign.format };
}

async function main() {
  const args = process.argv.slice(2);
  const isList = args.includes('--list');
  const isDryRun = args.includes('--dry-run');
  const isPublish = args.includes('--publish');
  const isPublishNext = args.includes('--publish-next');
  
  const campaignArgIdx = args.indexOf('--campaign') !== -1 ? args.indexOf('--campaign') : args.indexOf('--carousel');
  let campaignKey = campaignArgIdx !== -1 ? args[campaignArgIdx + 1] : null;

  const ledger = getLedger();
  const publishedIds = new Set(ledger.map(e => e.id));

  console.log('======================================================');
  console.log('  Aethera Healthcare — LinkedIn Autonomous Campaign Engine');
  console.log('======================================================\n');

  if (isPublishNext) {
    // Find first campaign that has not been published yet
    for (const [key, item] of Object.entries(CAMPAIGNS)) {
      if (!publishedIds.has(key)) {
        campaignKey = key;
        break;
      }
    }
    if (!campaignKey) {
      console.log('All scheduled campaigns in catalog have already been published!');
      console.log(`Total published: ${ledger.length}`);
      return;
    }
    console.log(`[Autonomous Scheduler] Auto-selected next campaign in queue: "${campaignKey}"`);
  }

  if (isList || (!campaignKey && !isPublish)) {
    console.log('Campaign Catalog & Pipeline Status:\n');
    for (const [key, item] of Object.entries(CAMPAIGNS)) {
      const isPublished = publishedIds.has(key);
      const pubInfo = ledger.find(e => e.id === key);
      const statusTag = isPublished ? '✓ PUBLISHED' : '• QUEUED';
      
      console.log(`${statusTag} [${key}] (${item.format.toUpperCase()})`);
      console.log(`  Title: ${item.title}`);
      if (item.pdfPath) console.log(`  PDF:   ${item.pdfPath} (${existsSync(item.pdfPath) ? 'READY' : 'MISSING'})`);
      if (item.imagePath) console.log(`  Image: ${item.imagePath} (${existsSync(item.imagePath) ? 'READY' : 'MISSING'})`);
      if (pubInfo) {
        console.log(`  URL:   ${pubInfo.postUrl}`);
        console.log(`  Date:  ${pubInfo.publishedAt}`);
      } else {
        console.log(`  Link:  ${item.targetUrl}`);
      }
      console.log('');
    }
    console.log('Configuration Status:');
    console.log(`• LINKEDIN_ACCESS_TOKEN: ${process.env.LINKEDIN_ACCESS_TOKEN ? 'CONFIGURED' : 'NOT SET'}`);
    console.log(`• LINKEDIN_AUTHOR_URN:   ${process.env.LINKEDIN_AUTHOR_URN ? 'CONFIGURED' : 'NOT SET'}`);
    console.log(`• TOTAL PUBLISHED:       ${ledger.length} / ${Object.keys(CAMPAIGNS).length}`);
    console.log('\nQuick Commands:');
    console.log('  node scripts/linkedin-publisher.mjs --campaign ai_integration_stack --dry-run');
    console.log('  node scripts/linkedin-publisher.mjs --campaign ai_integration_stack --publish');
    console.log('  node scripts/linkedin-publisher.mjs --publish-next');
    return;
  }

  const campaign = CAMPAIGNS[campaignKey];
  if (!campaign) {
    console.error(`Error: Unknown campaign key "${campaignKey}". Choose from: ${Object.keys(CAMPAIGNS).join(', ')}`);
    process.exit(1);
  }

  if (campaign.pdfPath && !existsSync(campaign.pdfPath)) {
    console.error(`Error: PDF document not found at ${campaign.pdfPath}.`);
    process.exit(1);
  }
  if (campaign.imagePath && !existsSync(campaign.imagePath)) {
    console.error(`Error: Image not found at ${campaign.imagePath}.`);
    process.exit(1);
  }

  console.log(`Target Campaign: ${campaign.title}`);
  console.log(`Format:          ${campaign.format.toUpperCase()}`);
  console.log(`Mode:            ${isDryRun ? 'DRY RUN (Preview Only)' : 'LIVE PUBLISHING'}`);
  console.log('------------------------------------------------------');

  const result = await publishViaLinkedInApi(campaign, isDryRun);
  console.log('\nResult:', JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error('\nPublishing failed:', err.message);
  process.exit(1);
});
