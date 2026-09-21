import { canonicalUrl } from '@/lib/siteConfig';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import HumanAutonomy3DHero from '@/components/ui/HumanAutonomy3DHero';
import AutonomyBoundaryMatrix from '@/components/ui/AutonomyBoundaryMatrix';
import CodeAnatomyVisualizer from '@/components/ui/CodeAnatomyVisualizer';
import AutonomyCodeExplorer from '@/components/ui/AutonomyCodeExplorer';
import InteractiveClaimScrubberSimulator from '@/components/ui/InteractiveClaimScrubberSimulator';
import ClinicalCaseScenarios from '@/components/ui/ClinicalCaseScenarios';
import {
  HelpCircle,
  Sparkles,
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

        {/* Section 1: Executive Manifesto & Boundary Matrix */}
        <section className="py-16 md:py-24 bg-cream border-b border-gray/10">
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

        {/* Section 2: Interactive Code Anatomy (NDC, CPT, CDT, Modifiers) */}
        <section className="py-16 md:py-24 bg-white border-b border-gray/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <FadeIn>
              <CodeAnatomyVisualizer />
            </FadeIn>
          </div>
        </section>

        {/* Section 3: Interactive Scrubber Simulation */}
        <section className="py-16 md:py-24 bg-cream border-b border-gray/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <FadeIn>
              <InteractiveClaimScrubberSimulator />
            </FadeIn>
          </div>
        </section>

        {/* Section 4: Comprehensive Searchable Code Systems Directory */}
        <section className="py-16 md:py-24 bg-white border-b border-gray/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <FadeIn>
              <AutonomyCodeExplorer />
            </FadeIn>
          </div>
        </section>

        {/* Section 5: Real-World Clinical Evidence & Case Studies */}
        <section className="py-16 md:py-24 bg-cream border-b border-gray/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <FadeIn>
              <ClinicalCaseScenarios />
            </FadeIn>
          </div>
        </section>

        {/* Section 6: Educational FAQ Section */}
        <section className="py-16 md:py-24 bg-white border-b border-gray/10">
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

        {/* High-Intent Conversion CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-navy via-[#0A2240] to-teal text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-mint text-xs font-bold uppercase tracking-wider border border-mint/20">
              <Sparkles className="h-3.5 w-3.5" /> Zero-Obligation Proof
            </span>
            <h2 className="font-jakarta text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Test Our Human Autonomy Framework on 50 of Your Real Claims
            </h2>
            <p className="text-cream/90 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              We sign your BAA, analyze 50 of your recent encounters, run our deterministic scrubbers, and have
              our certified coders provide a 1-page exception scorecard in your actual numbers. Free in 14 days.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/free-assessment"
                className="px-8 py-4 rounded-xl bg-mint text-navy font-extrabold text-sm sm:text-base hover:bg-white transition-all shadow-xl shadow-mint/20"
              >
                Claim Your Free 50-Claim Pilot Slot
              </Link>
              <Link
                href="/schedule"
                className="px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm sm:text-base hover:bg-white/20 transition-all"
              >
                Schedule Technical Architecture Walkthrough
              </Link>
            </div>
            <p className="text-xs text-slate-400 pt-2 font-mono">
              BAA Signed Before Any Ingestion • Zero Setup Fees • Contractual 95%+ Clean-Claim Guarantee
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
