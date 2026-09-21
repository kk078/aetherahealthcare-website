# Hospital-Acquired Condition (HAC) & Present on Admission (POA) Penalty Safeguard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the interactive "Hospital-Acquired Condition (HAC) & Present on Admission (POA) Penalty Safeguard" on `/human-autonomy`, equipping hospital executives, inpatient CDI specialists, and sovereign coders to audit POA indicators (`Y`/`N`/`U`/`W`/`1`), prevent secondary DRG downward reclassifications ($4,000–$12,800 per encounter), and model CMS Hospital-Acquired Condition Reduction Program (HACRP) 1% IPPS statutory penalty thresholds.

**Architecture:** 
1. Deterministic data repository (`src/data/hacPoaData.ts`) defining authentic CMS 14 HAC categories under DRA 2005, POA indicator rules, 4 high-risk inpatient clinical admission cases with MS-DRG weights/rates, and HACRP PSI 90 / NHSN penalty algorithms.
2. Interactive component (`src/components/ui/HacPoaPenaltySafeguard.tsx`) with admission case selector, interactive POA indicator toggler (`Y`, `N`, `U`, `W`, `1`), live DRG downward reclassification calculator, clinical evidence drawer (ED triage vs. Day 2 progress), annual hospital HACRP 1% IPPS penalty modeler, and 1-click physician query & RAC audit defense modal.
3. Subnav integration (`AutonomySubNav.tsx`) with `#hac-poa-safeguard` and route embedding in `src/app/human-autonomy/page.tsx`.
4. Automated verification via unit tests (`tests/unit/hac-poa.test.ts`), `npm run check`, `npm run build`, and live Cloudflare Pages production deployment with screenshot telemetry.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide React icons, Node.js test runner.

**Spec:** Initiative 7 specifications approved by Kiran.

## Global Constraints
- Full Autonomous Operation per `GEMINI.md`: no prompts for permission to execute shell commands, edit files, build, or deploy.
- Strictly authentic, non-synthetic statutory data (SSA § 1886(d)(4)(D), SSA § 1886(p), CMS IPPS MS-DRGs 453/455, 235/236, 871/872, 469/470, CMS FY2024 standardized base rate $6,500.00).
- Full obsidian slate styling matching existing autonomy tools (`bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20`).
- No synthetic personal data.

---

### Task 1: HAC & POA Penalty Data Models (`src/data/hacPoaData.ts`)

**Files:**
- Create: `src/data/hacPoaData.ts`
- Test: `tests/unit/hac-poa.test.ts`

**Interfaces:**
- Produces: `HAC_CATEGORIES`, `POA_INDICATOR_DEFINITIONS`, `INPATIENT_HAC_CASES`, `calculateDrgReclassification`, `calculateHacrpAnnualExposure`, `InpatientHacCase`, `PoaIndicator`

- [ ] **Step 1: Write the failing unit test for data integrity and DRG grouper math**
- [ ] **Step 2: Implement the authentic data models, MS-DRG weights, and calculation engines**
- [ ] **Step 3: Run the test and verify it passes**
- [ ] **Step 4: Commit changes**

---

### Task 2: Component Implementation (`src/components/ui/HacPoaPenaltySafeguard.tsx`)

**Files:**
- Create: `src/components/ui/HacPoaPenaltySafeguard.tsx`

**Interfaces:**
- Consumes: Data structures and functions from `src/data/hacPoaData.ts`
- Produces: React component `HacPoaPenaltySafeguard` with case selector, POA toggler, DRG downcode delta, HACRP annual penalty slider, and physician query modal

- [ ] **Step 1: Implement the interactive UI with obsidian styling, tabs, POA buttons, interactive evidence drawers, and modal**
- [ ] **Step 2: Verify with `npm run typecheck`**
- [ ] **Step 3: Commit changes**

---

### Task 3: Navigation & Page Integration

**Files:**
- Modify: `src/components/ui/AutonomySubNav.tsx`
- Modify: `src/app/human-autonomy/page.tsx`

**Interfaces:**
- Adds anchor `#hac-poa-safeguard` to subnav
- Embeds `<HacPoaPenaltySafeguard />` into Section 3K of `/human-autonomy`

- [ ] **Step 1: Update `AutonomySubNav.tsx` with HAC/POA Safeguard link and icon**
- [ ] **Step 2: Import and render `<HacPoaPenaltySafeguard />` in `page.tsx`**
- [ ] **Step 3: Verify with `npm run check` and `npm run build`**
- [ ] **Step 4: Commit changes**

---

### Task 4: Production Deployment & Visual Telemetry

**Files:**
- Run: `git push origin master`
- Monitor: GitHub Actions deployment to Cloudflare Pages
- Capture: Playwright live production screenshots
- Create: Walkthrough artifact `hac_poa_penalty_safeguard_walkthrough.md`

- [ ] **Step 1: Push commits to GitHub origin master**
- [ ] **Step 2: Monitor GitHub Actions pipeline to successful deployment**
- [ ] **Step 3: Capture live production screenshots with Playwright**
- [ ] **Step 4: Generate detailed walkthrough artifact with embedded production images**
