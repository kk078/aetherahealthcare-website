import { canonicalUrl } from '@/lib/siteConfig';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import HumanAutonomy3DHero from '@/components/ui/HumanAutonomy3DHero';
import AutonomySubNav from '@/components/ui/AutonomySubNav';
import AutonomyBoundaryMatrix from '@/components/ui/AutonomyBoundaryMatrix';
import Anatomy3DExplorer from '@/components/ui/Anatomy3DExplorer';
import SurgicalDepthLayerSlider from '@/components/ui/SurgicalDepthLayerSlider';
import SpecialtyAutonomyMatrix from '@/components/ui/SpecialtyAutonomyMatrix';
import ClaimDiffViewer from '@/components/ui/ClaimDiffViewer';
import SpecialtyClawbackCalculator from '@/components/ui/SpecialtyClawbackCalculator';
import CryptographicAuditLedger from '@/components/ui/CryptographicAuditLedger';
import FederalSafeHarborAuditor from '@/components/ui/FederalSafeHarborAuditor';
import MultiPayerDenialMatrix from '@/components/ui/MultiPayerDenialMatrix';
import PhysicianP2PSimulator from '@/components/ui/PhysicianP2PSimulator';
import FederalIdrArbiter from '@/components/ui/FederalIdrArbiter';
import { FeeScheduleParityHeatmap } from '@/components/ui/FeeScheduleParityHeatmap';
import ClinicalResearchComplianceAuditor from '@/components/ui/ClinicalResearchComplianceAuditor';
import HacPoaPenaltySafeguard from '@/components/ui/HacPoaPenaltySafeguard';
import TwoMidnightRuleArbiter from '@/components/ui/TwoMidnightRuleArbiter';
import DrugWasteEngine from '@/components/ui/DrugWasteEngine';
import GmeImeCapOptimizer from '@/components/ui/GmeImeCapOptimizer';
import Drug340bAuditor from '@/components/ui/Drug340bAuditor';
import EsrdKccArbiter from '@/components/ui/EsrdKccArbiter';
import ClfsPamaArbiter from '@/components/ui/ClfsPamaArbiter';
import AdjudicationBenchmarkArena from '@/components/ui/AdjudicationBenchmarkArena';
import CodeAnatomyVisualizer from '@/components/ui/CodeAnatomyVisualizer';
import AutonomyCodeExplorer from '@/components/ui/AutonomyCodeExplorer';
import InteractiveClaimScrubberSimulator from '@/components/ui/InteractiveClaimScrubberSimulator';
import ClinicalCaseScenarios from '@/components/ui/ClinicalCaseScenarios';
import {
  HelpCircle,
  ShieldCheck,
  Lock,
  Fingerprint,
  FileCheck2,
  CheckCircle2,
  Scale,
  ArrowRight,
} from 'lucide-react';

export const metadata = {
  alternates: { canonical: canonicalUrl('/human-autonomy') },
  title: 'Human Autonomy in Healthcare RCM — Complete Code Systems & Sovereign Approval Framework | Aethera Healthcare',
  description:
    'Explore Aethera’s Human Autonomy framework across CPT, CDT, NDC, and Modifiers. Learn how deterministic rule engines paired with certified human sovereign sign-off ensure 100% compliance with zero AI hallucination.',
};

const FAQS = [
  {
    q: 'Why does Aethera prohibit generative AI from assigning medical codes unilaterally?',
    a: 'Generative LLMs are probabilistic token predictors that cannot guarantee compliance under federal false claims statutes. Under the False Claims Act (31 U.S.C. § 3729) and HIPAA EDI rules, billing an unverified or hallucinated medical code constitutes fraud. Aethera utilizes deterministic algorithmic rule scrubbers that calculate mathematical edits, but requires AAPC/AHIMA certified human billing specialists to sign off on every code, modifier, and dollar figure.',
  },
  {
    q: 'How does Aethera handle 11-digit NDC conversions for oncology and specialty medications?',
    a: 'FDA packaging uses multiple 10-digit formats (5-4-1, 5-3-2, 4-4-2). Under HIPAA 5010 837P standards, payers mandate an exact 11-digit format (5-4-2) with strict zero-padding. Our deterministic software automatically identifies the packaging pattern and pads the leading zero. Certified oncology billers then verify the administered milligrams, calculate discarded waste from single-dose vials, and ensure mandatory CMS Modifier -JW (waste) or -JZ (zero waste) compliance.',
  },
  {
    q: 'Can dental procedures (CDT) be billed to medical insurance (CMS-1500)?',
    a: 'Yes. When dental trauma, surgical extraction of full bony impactions, severe cysts, or obstructive sleep apnea appliances are documented with medical necessity, our framework provides dental-to-medical cross-coding. This protects patients from exhausting their standard $1,500 annual dental cap by capturing full commercial major medical coverage.',
  },
  {
    q: 'What is the purpose of the tamper-evident SHA-256 audit trail?',
    a: 'Every clinical note extraction, algorithmic NCCI check, modifier substantiation, and human coder sign-off is hashed into a sequential cryptographic ledger block. When a commercial payer, CMS Recovery Audit Contractor (RAC), or OIG auditor reviews a claim, Aethera produces a 1-click legal evidence packet showing exactly who approved the claim, when, and from what clinical note excerpt.',
  },
  {
    q: 'How does Aethera ensure offshore billing experts adhere to sovereign US data security?',
    a: 'All client PHI resides exclusively within US-resident sovereign cloud data stores. Our India-based credentialed billing experts work through secure, locked-down virtual desktop infrastructure (VDI) with zero local download, no USB transfer, no print permissions, and continuous activity monitoring. A full Business Associate Agreement (BAA) is executed before any onboarding begins.',
  },
];

export default function HumanAutonomyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: 'Human Autonomy Framework in Healthcare Revenue Cycle Management',
    url: 'https://aetherahealthcare.com/human-autonomy',
    description:
      'The definitive guide to human-in-the-loop sovereign autonomy in medical billing across CPT, CDT, NDC, Modifiers, and ICD-10.',
    publisher: {
      '@type': 'Organization',
      name: 'Aethera Healthcare Solutions',
      url: 'https://aetherahealthcare.com',
    },
    mainEntity: {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <main className="flex-1">
        {/* Interactive 3D Spatial Canvas Hero */}
        <HumanAutonomy3DHero />

        {/* Interactive Suite Sticky Navigation Bar */}
        <AutonomySubNav />

        {/* Section 1: Executive Manifesto & Boundary Matrix */}
        <section id="boundary-matrix" className="py-16 md:py-24 bg-cream border-b border-gray/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <FadeIn>
              <div className="max-w-3xl">
                <span className="text-xs font-bold uppercase tracking-wider text-teal bg-teal/10 px-3 py-1 rounded-full">
                  The Sovereign Gate
                </span>
                <h2 className="font-jakarta text-3xl sm:text-4xl font-extrabold text-navy tracking-tight mt-3">
                  Why Autonomous AI Must Have a Human Seal
                </h2>
                <p className="text-gray mt-3 text-base sm:text-lg leading-relaxed">
                  In revenue cycle management, blind automation is reckless. A computer program can calculate
                  arithmetic and query tables, but it cannot assess clinical judgment or assume legal liability.
                  Here is where software stops and certified human sovereignty begins.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <AutonomyBoundaryMatrix />
            </FadeIn>
          </div>
        </section>

        {/* Section 2: 3D Anatomical Atlas & Sovereign Gate Matrix (Rohen 7th Ed.) */}
        <Anatomy3DExplorer />

        {/* Section 2B: Interactive Surgical Depth Layer Slider (Tissue Planes to CPT Mapping) */}
        <SurgicalDepthLayerSlider />

        {/* Section 3: ABMS 20 Core Medical Specialties RCM Directory & Autonomy Matrix */}
        <SpecialtyAutonomyMatrix />

        {/* Section 3B: Live Claim Diff Viewer (AI Hallucination vs Sovereign Human Seal) */}
        <ClaimDiffViewer />

        {/* Section 3C: Specialty Clawback & Denial Risk Calculator (Sovereign RCM ROI Modeler) */}
        <SpecialtyClawbackCalculator />

        {/* Section 3D: Cryptographic Audit Trail & Chain of Custody (CMS RAC Defense Engine) */}
        <CryptographicAuditLedger />

        {/* Section 3E: Federal Safe-Harbor Checklist & FCA Risk Auditor */}
        <FederalSafeHarborAuditor />

        {/* Section 3F: Multi-Payer Prior Authorization & Algorithmic Denial Defense Matrix */}
        <MultiPayerDenialMatrix />

        {/* Section 3G: Interactive Physician Peer-to-Peer (P2P) Audio/Script Simulator */}
        <PhysicianP2PSimulator />

        {/* Section 3H: Federal No Surprises Act (NSA) & Independent Dispute Resolution (IDR) Arbiter Engine */}
        <FederalIdrArbiter />

        {/* Section 3I: Global Commercial vs. Medicare Fee Schedule Parity Heatmap */}
        <FeeScheduleParityHeatmap />

        {/* Section 3J: CMS NCD 310.1 & Clinical Research IDE/IND Compliance Auditor */}
        <ClinicalResearchComplianceAuditor />

        {/* Section 3K: Hospital-Acquired Condition (HAC) & POA Penalty Safeguard */}
        <HacPoaPenaltySafeguard />

        {/* Section 3L: CMS-4201-F Two-Midnight Rule & MA Level-of-Care Arbiter */}
        <TwoMidnightRuleArbiter />

        {/* Section 3M: CMS Single-Dose Vial Drug Waste Engine (Modifiers -JW / -JZ) */}
        <DrugWasteEngine />

        {/* Section 3N: CMS Teaching Hospital GME/IME Resident Cap & Direct GME Optimizer */}
        <GmeImeCapOptimizer />

        {/* Section 3O: 340B Covered Entity Eligibility & Split-Billing Compliance Auditor */}
        <Drug340bAuditor />

        {/* Section 3P: ESRD Prospective Payment System & Kidney Care Choices (KCC) Arbiter */}
        <EsrdKccArbiter />

        {/* Section 3Q: Clinical Laboratory Fee Schedule (CLFS) Private Payer Data Reporting & PAMA Market-Based Rate Arbiter */}
        <ClfsPamaArbiter />

        {/* Section 3R: Sovereign Coder vs Autonomous AI Live Adjudication Benchmark Arena */}
        <AdjudicationBenchmarkArena />

        {/* Section 3: Interactive Code Anatomy (NDC, CPT, CDT, Modifiers) */}
        <section id="code-anatomy" className="py-16 md:py-24 bg-white border-b border-gray/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <FadeIn>
              <CodeAnatomyVisualizer />
            </FadeIn>
          </div>
        </section>

        {/* Section 3: Interactive Scrubber Simulation */}
        <section id="scrubber-simulation" className="py-16 md:py-24 bg-cream border-b border-gray/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <FadeIn>
              <InteractiveClaimScrubberSimulator />
            </FadeIn>
          </div>
        </section>

        {/* Section 4: Comprehensive Searchable Code Systems Directory */}
        <section id="code-explorer" className="py-16 md:py-24 bg-white border-b border-gray/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <FadeIn>
              <AutonomyCodeExplorer />
            </FadeIn>
          </div>
        </section>

        {/* Section 5: Real-World Clinical Evidence & Case Studies */}
        <section id="case-studies" className="py-16 md:py-24 bg-cream border-b border-gray/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <FadeIn>
              <ClinicalCaseScenarios />
            </FadeIn>
          </div>
        </section>

        {/* Section 6: Educational FAQ Section */}
        <section id="faqs" className="py-16 md:py-24 bg-white border-b border-gray/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-teal bg-teal/10 px-3 py-1 rounded-full">
                Regulatory &amp; Compliance Inquiries
              </span>
              <h2 className="font-jakarta text-3xl sm:text-4xl font-extrabold text-navy tracking-tight mt-3">
                Frequently Asked Questions
              </h2>
              <p className="text-gray text-sm sm:text-base mt-2">
                Everything practice managers, CFOs, and compliance officers need to know about our human-in-the-loop framework.
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-cream border border-gray/15 hover:border-teal/30 transition-all shadow-xs"
                >
                  <h3 className="font-bold text-navy text-base flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed mt-3 pl-8">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: Dedicated Sovereign Human Autonomy Verification Terminal */}
        <section id="sovereign-terminal" className="py-20 md:py-28 bg-gradient-to-br from-[#021024] via-[#051C33] to-[#0A2E50] text-white relative overflow-hidden border-t border-teal-500/20">
          {/* Ambient Glow & Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#45C4B0_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal/15 blur-[160px] rounded-full pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
            {/* Terminal Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal/15 border border-teal/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
                <Fingerprint className="h-3.5 w-3.5 text-teal-400" />
                Sovereign Trust Architecture • Zero Generative Hallucinations
              </div>
              <h2 className="font-jakarta text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                The Sovereign Human Autonomy Verification Terminal
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                In healthcare revenue cycle management, algorithms evaluate mathematics, but only certified human billing specialists
                bear statutory liability under the False Claims Act. Every claim released through Aethera contains deterministic validation,
                certified human attestation, and an immutable SHA-256 cryptographic proof.
              </p>
            </div>

            {/* 3 Dedicated Functional Compliance Modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Module 1: Pre-Claim Compliance Audit */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal/40 transition-all space-y-4 backdrop-blur-sm shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Sovereign Encounter Audit</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Benchmark your clinical encounters through our deterministic scrubber with AAPC/AHIMA certified coder sign-off.
                    Identify unbundling vulnerabilities, missing laterality modifiers, and zero-padded NDC format discrepancies before payer submission.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/free-assessment"
                    className="w-full py-3 px-4 rounded-xl bg-mint text-navy font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-white transition-all shadow-md shadow-mint/20"
                  >
                    <span>Request Practice Encounter Audit</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Module 2: SHA-256 Cryptographic Ledger Block Audit */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all space-y-4 backdrop-blur-sm shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Cryptographic Proof Ledger</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Every clinical note excerpt, algorithmic check, modifier rationale, and human coder sign-off is chained into a tamper-evident
                    cryptographic block. If a CMS RAC, MAC, or commercial payer audits your claim, produce a 1-click legal evidence packet.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-750 font-mono text-[11px] text-emerald-300 flex items-center justify-between">
                  <span>Block Hash:</span>
                  <span className="text-slate-400 truncate max-w-[150px]">7a9f...c41e [Sealed]</span>
                </div>
              </div>

              {/* Module 3: Sovereign Regulatory Safe-Harbor Consultation */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all space-y-4 backdrop-blur-sm shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Regulatory Safe-Harbor Review</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Schedule a technical walkthrough with our certified compliance leadership on False Claims Act (31 U.S.C. § 3729) safe harbors,
                    HIPAA 5010 837P EDI protocols, and sovereign US cloud data residency protections.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/schedule"
                    className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Schedule Compliance Consultation</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Regulatory & Sovereign Certification Badges */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-mono">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> 100% Certified AAPC/AHIMA Human Seal
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-teal-300">
                  <ShieldCheck className="w-4 h-4" /> HIPAA EDI 5010 837P / CMS-1500 Standard
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Scale className="w-4 h-4" /> False Claims Act § 3729 Safe Harbor
                </span>
              </div>
              <div>
                <span>Dedicated Sovereign US Cloud Infrastructure • BAA Executed Prior to Ingestion</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
