# CMS NCD 310.1 & Clinical Research IDE/IND Compliance Auditor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the interactive "CMS NCD 310.1 & Clinical Research IDE/IND Compliance Auditor" on `/human-autonomy`, empowering clinical researchers, surgical CFOs, and sovereign billing specialists to audit Category A vs. B IDEs, IND oncology split-billing, modifiers `-Q0`/`-Q1`, and prevent False Claims Act double-dipping violations.

**Architecture:** 
1. Deterministic data repository (`src/data/clinicalResearchComplianceData.ts`) defining authentic CMS NCD 310.1 statutes, 42 CFR § 405 Subpart B IDE categories, IND split-billing rules, 4 real-world clinical research trials, and line-item billing ledgers.
2. Interactive component (`src/components/ui/ClinicalResearchComplianceAuditor.tsx`) with trial protocol selector, split-billing dual-ledger (Medicare vs. Sponsor), interactive compliance scrubber with FCA risk simulation, NCD 310.1 qualification checklist, and 1-click legal attestation & defense brief modal.
3. Subnav integration (`AutonomySubNav.tsx`) with `#clinical-research-auditor` and route embedding in `src/app/human-autonomy/page.tsx`.
4. Automated verification via unit tests (`src/data/__tests__/clinicalResearchComplianceData.test.ts`, `src/components/ui/__tests__/ClinicalResearchComplianceAuditor.test.tsx`), `npm run check`, `npm run build`, and live Cloudflare Pages production deployment with screenshot telemetry.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide React icons, Vitest, Playwright.

**Spec:** Initiative 6 specifications approved by Kiran.

## Global Constraints
- Full Autonomous Operation per `GEMINI.md`: no prompts for permission to execute shell commands, edit files, build, or deploy.
- Strictly authentic, non-synthetic statutory data (CMS NCD 310.1, 42 CFR § 405 Subpart B, 31 U.S.C. § 3729 False Claims Act, modifiers -Q0, -Q1, -QA, Condition Code 30, Value Code D4, Revenue Code 0624).
- Full obsidian slate styling matching existing autonomy tools (`bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20`).
- No synthetic personal data.

---

### Task 1: Clinical Research Compliance Data Model (`src/data/clinicalResearchComplianceData.ts`)

**Files:**
- Create: `src/data/clinicalResearchComplianceData.ts`
- Test: `src/data/__tests__/clinicalResearchComplianceData.test.ts`

**Interfaces:**
- Produces: `CLINICAL_RESEARCH_TRIALS`, `NCD_310_1_CRITERIA`, `IDE_CATEGORY_DEFINITIONS`, `ClinicalResearchTrial`, `BillingLineItem`, `TrialMisallocationScenario`

- [ ] **Step 1: Write the failing unit test for data integrity**
- [ ] **Step 2: Implement the authentic data models and trial configurations**
- [ ] **Step 3: Run the test and verify it passes**
- [ ] **Step 4: Commit changes**

---

### Task 2: Component Implementation (`src/components/ui/ClinicalResearchComplianceAuditor.tsx`)

**Files:**
- Create: `src/components/ui/ClinicalResearchComplianceAuditor.tsx`
- Test: `src/components/ui/__tests__/ClinicalResearchComplianceAuditor.test.tsx`

**Interfaces:**
- Consumes: Data structures from `src/data/clinicalResearchComplianceData.ts`
- Produces: React component `ClinicalResearchComplianceAuditor` with protocol selector, dual-ledger breakdown, misallocation simulator, and defense modal

- [ ] **Step 1: Write the failing component unit test**
- [ ] **Step 2: Implement the interactive UI with obsidian styling, tabs, interactive line items, and modal**
- [ ] **Step 3: Run component tests to verify rendering, interaction, and calculation accuracy**
- [ ] **Step 4: Commit changes**

---

### Task 3: Navigation & Page Integration

**Files:**
- Modify: `src/components/ui/AutonomySubNav.tsx`
- Modify: `src/app/human-autonomy/page.tsx`

**Interfaces:**
- Adds anchor `#clinical-research-auditor` to subnav
- Embeds `<ClinicalResearchComplianceAuditor />` into Section 3J of `/human-autonomy`

- [ ] **Step 1: Update `AutonomySubNav.tsx` with Research Auditor link and icon**
- [ ] **Step 2: Import and render `<ClinicalResearchComplianceAuditor />` in `page.tsx`**
- [ ] **Step 3: Verify with `npm run check` and `npm run build`**
- [ ] **Step 4: Commit changes**

---

### Task 4: Production Deployment & Visual Telemetry

**Files:**
- Run: `git push origin master`
- Monitor: GitHub Actions deployment to Cloudflare Pages
- Capture: Playwright live production screenshots
- Create: Walkthrough artifact `clinical_research_compliance_auditor_walkthrough.md`

- [ ] **Step 1: Push commits to GitHub origin master**
- [ ] **Step 2: Monitor GitHub Actions pipeline to successful deployment**
- [ ] **Step 3: Capture live production screenshots with Playwright**
- [ ] **Step 4: Generate detailed walkthrough artifact with embedded production images**
