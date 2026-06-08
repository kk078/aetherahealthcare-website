import Link from 'next/link';
import { CheckCircle, TrendingUp, Shield, Clock, DollarSign, FileText, AlertCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: "Pharmacy Billing & RCM Services | Retail, Specialty & LTC Pharmacy | Aethera Healthcare",
  description: "Pharmacy revenue cycle management for retail, specialty, compounding, and long-term care pharmacies. We handle NCPDP claims, PBM adjudication, DIR fee reconciliation, 340B, prior authorizations, and copay assistance. 98.2% clean claim rate.",
};

const stats = [
  {
    "value": "98.2%",
    "label": "Clean Claim Rate for Pharmacy"
  },
  {
    "value": "<24 hrs",
    "label": "Specialty PA Turnaround"
  },
  {
    "value": "$19K/mo",
    "label": "Avg DIR Recovered"
  },
  {
    "value": "3%",
    "label": "Script Abandonment"
  }
];

const challenges = [
  {
    icon: <AlertCircle className="h-6 w-6" />,
    title: "PBM Claim Rejects & Reversals",
    description: "DUR rejects, refill-too-soon, plan limitations, and NDC-not-covered rejections are resolved in real time so scripts aren't abandoned at the counter and revenue isn't lost to walk-aways.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "DIR Fee Reconciliation",
    description: "Direct and Indirect Remuneration fees claw back margin weeks after dispensing. We reconcile DIR against every claim, flag underpayments, and quantify true net reimbursement per script.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Specialty Drug Prior Authorization",
    description: "High-cost specialty medications require clinical PAs, step therapy, and benefit investigations. Our team manages the full PA lifecycle to prevent $0-pay dispenses and inventory write-offs.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "340B Program Integrity",
    description: "Covered-entity eligibility, contract pharmacy split-billing, and duplicate-discount avoidance demand precise claim tagging. We keep 340B capture compliant and audit-ready.",
  },
  {
    icon: <DollarSign className="h-6 w-6" />,
    title: "Compounding & DAW Coding",
    description: "Compound claim segments, DAW codes, days-supply calculations, and quantity dispensed math are frequent rejection triggers. We bill them correctly the first time.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Copay Assistance & Coordination of Benefits",
    description: "Manufacturer copay cards, foundation assistance, and primary/secondary COB sequencing are coordinated so patients can afford therapy and the pharmacy is made whole.",
  },
];

const codes = [
  {
    "code": "NDC (11-digit)",
    "desc": "National Drug Code identifying product, strength, and package",
    "note": "Must match dispensed package size; 10-to-11 digit conversion errors trigger rejects"
  },
  {
    "code": "DAW 0-9",
    "desc": "Dispense As Written codes for brand/generic substitution",
    "note": "DAW 1 (prescriber) vs DAW 2 (patient) drives copay and reimbursement"
  },
  {
    "code": "NCPDP D.0",
    "desc": "Telecommunication claim standard for pharmacy adjudication",
    "note": "Segment-level errors are the top cause of real-time rejects"
  },
  {
    "code": "J-codes (Part B)",
    "desc": "HCPCS for provider-administered drugs billed medically",
    "note": "Used when a drug is covered under Part B, not Part D"
  },
  {
    "code": "340B Modifier",
    "desc": "Claim identifiers for 340B-acquired drugs",
    "note": "Required to avoid duplicate discounts and stay audit-ready"
  },
  {
    "code": "Compound Segment",
    "desc": "Multi-ingredient compound claim reporting",
    "note": "Each ingredient NDC, quantity, and cost must be reported correctly"
  },
  {
    "code": "Days Supply",
    "desc": "Calculated dispensing duration for the claim",
    "note": "Mismatch with quantity/sig is a frequent refill-too-soon trigger"
  },
  {
    "code": "PA / Override",
    "desc": "Prior authorization and rejection override codes",
    "note": "Specialty and step-therapy drugs require documented clinical PA"
  }
];

const faqs = [
  {
    "q": "Do you support retail, specialty, compounding, and LTC pharmacies?",
    "a": "Yes. We handle all dispensing models \u2014 retail point-of-sale adjudication, specialty PA-heavy workflows, compounding claim segments, and LTC cycle-fill/per-diem billing \u2014 each with its own rules and reimbursement logic."
  },
  {
    "q": "Can you reconcile DIR fees and show our true net reimbursement?",
    "a": "Absolutely. We reconcile every remittance against expected reimbursement and applied DIR fees, flag underpayments and clawbacks, and report net margin at the script level so you know your real profitability."
  },
  {
    "q": "How do you handle specialty drug prior authorizations?",
    "a": "Our team manages the full PA lifecycle \u2014 benefits investigation, clinical documentation, step-therapy attestations, and appeals \u2014 so high-cost specialty scripts don't end in $0-pay dispenses or inventory write-offs."
  },
  {
    "q": "Do you support 340B contract pharmacy billing?",
    "a": "Yes. We manage split-billing, covered-entity eligibility tracking, and duplicate-discount avoidance so your 340B capture stays compliant and audit-ready."
  },
  {
    "q": "How quickly can you start?",
    "a": "Most pharmacies are fully transitioned within 3\u20135 weeks, including switch/PBM credential setup, claim-feed integration, and parallel processing so there's no gap in adjudication."
  }
];

const caseMetrics = [
  {
    "label": "Clean Claim Rate",
    "before": "89%",
    "after": "98.2%"
  },
  {
    "label": "Abandoned Scripts",
    "before": "11%",
    "after": "3%"
  },
  {
    "label": "DIR Recovered",
    "before": "$0",
    "after": "$19K/mo"
  },
  {
    "label": "PA Turnaround",
    "before": "4 days",
    "after": "<24 hrs"
  }
];

export default function PharmacyBilling() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-mint/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <FadeIn>
              <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-5">Pharmacy Billing Specialists</span>
              <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-6 leading-tight">Pharmacy Billing Built for Every Dispensing Model</h1>
              <p className="text-xl text-cream mb-10">From NCPDP claim adjudication and PBM rejects to DIR fee reconciliation, 340B, and specialty prior authorizations — our pharmacy RCM team protects margin on every script.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link prefetch={false} href="/free-assessment" className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors text-center">Get Free Pharmacy Assessment</Link>
                <Link prefetch={false} href="/contact" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full transition-colors text-center">Talk to a Specialist</Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      <section className="py-10 bg-white border-b border-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (<div key={i}><p className="text-3xl font-bold text-teal">{s.value}</p><p className="text-gray text-sm mt-1">{s.label}</p></div>))}
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="WHY PHARMACY BILLING IS COMPLEX" title="The Pharmacy Reimbursement Issues We Solve Daily" description="Pharmacy margin is won and lost at the point of adjudication. These are the issues we resolve for retail, specialty, compounding, and LTC pharmacies." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {challenges.map((c, i) => (<FadeIn key={i} delay={i * 0.1}><div className="bg-white rounded-xl p-6 border border-gray/10 shadow-sm h-full"><div className="text-teal mb-4">{c.icon}</div><h3 className="font-bold text-navy mb-2">{c.title}</h3><p className="text-gray text-sm">{c.description}</p></div></FadeIn>))}
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-5">How Aethera Handles Pharmacy Billing</h2>
              <p className="text-gray mb-5">Pharmacy reimbursement is a real-time, high-volume, low-margin business — and a single mis-adjudicated claim or unreconciled DIR fee can erase the profit on dozens of scripts. Our pharmacy RCM specialists understand NCPDP claim formats, PBM contract logic, and the downstream fees that determine your true net.</p>
              <p className="text-gray">When you partner with Aethera, you get a pharmacy-dedicated team that works your rejection queue, reconciles every remittance against expected reimbursement and DIR, manages specialty PAs end to end, and gives you script-level net-margin visibility — driving a 98.2% clean claim rate.</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-cream rounded-2xl p-7 border border-gray/10 space-y-3">
                <h3 className="font-bold text-navy mb-4">Specifically, we handle:</h3>
                {[
                  "NCPDP D.0 claim submission and real-time adjudication support",
                  "PBM reject resolution (DUR, refill-too-soon, plan limits, NDC coverage)",
                  "DIR fee reconciliation and net-reimbursement reporting",
                  "Specialty pharmacy prior authorization and benefits investigation",
                  "340B split-billing, eligibility tracking, and duplicate-discount avoidance",
                  "Compounding claim segments and DAW code management",
                  "Coordination of benefits (primary/secondary/tertiary)",
                  "Manufacturer copay card and foundation assistance enrollment",
                  "Long-term care (LTC) cycle fill and per-diem billing",
                  "Medicare Part B vs. Part D determination for applicable drugs",
                  "Days-supply and quantity-dispensed validation",
                  "Audit response and PBM recoupment defense",
                ].map((item, i) => (<div key={i} className="flex items-start"><CheckCircle className="h-4 w-4 text-teal flex-shrink-0 mt-0.5 mr-3" /><p className="text-gray text-sm">{item}</p></div>))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="BILLING REFERENCE" title="Pharmacy Billing Elements We Manage" description="A sample of the pharmacy claim elements and program codes our team handles daily \u2014 each with payer- and PBM-specific rules." />
          <div className="mt-12 overflow-x-auto">
            <table className="w-full bg-white rounded-xl overflow-hidden border border-gray/10">
              <thead><tr className="bg-navy text-white text-sm"><th className="py-3 px-5 text-left font-semibold">Code / Field</th><th className="py-3 px-5 text-left font-semibold">Description</th><th className="py-3 px-5 text-left font-semibold hidden md:table-cell">Billing Note</th></tr></thead>
              <tbody>{codes.map((row, i) => (<tr key={i} className={i % 2 === 0 ? 'bg-cream' : 'bg-white'}><td className="py-3 px-5 font-bold text-teal text-sm">{row.code}</td><td className="py-3 px-5 text-navy text-sm">{row.desc}</td><td className="py-3 px-5 text-gray text-xs hidden md:table-cell">{row.note}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-5">Case Study</span>
            <h2 className="text-3xl font-bold text-white font-playfair mb-4">Independent Specialty Pharmacy, Tampa Bay</h2>
            <p className="text-cream/80 mb-8">This specialty pharmacy was losing roughly $28,000/month to abandoned scripts from unresolved PA rejects and had never reconciled DIR fees against expected reimbursement. Net margin was invisible.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">{caseMetrics.map((m, i) => (<div key={i} className="bg-white/10 rounded-xl p-4 text-center"><p className="text-xs text-gray/60 mb-1">{m.label}</p><p className="text-xs text-gray/40 line-through">{m.before}</p><p className="text-xl font-bold text-mint">{m.after}</p></div>))}</div>
            <blockquote className="border-l-4 border-mint pl-5"><p className="text-cream italic">“We had no idea how much DIR was eating our margin until Aethera reconciled it. Now we see net profit per script in real time.”</p></blockquote>
            <div className="mt-6"><Link prefetch={false} href="/case-studies" className="text-mint font-semibold hover:text-white transition-colors inline-flex items-center">Read all case studies <ArrowRight className="h-4 w-4 ml-1" /></Link></div>
          </FadeIn>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="FAQ" title="Pharmacy Billing Questions" description="Common questions from pharmacy owners considering outsourcing their revenue cycle." />
          <div className="space-y-4 mt-12">{faqs.map((faq, i) => (<FadeIn key={i} delay={i * 0.1}><div className="bg-cream rounded-xl p-6 border border-gray/10"><h3 className="font-bold text-navy mb-2">{faq.q}</h3><p className="text-gray text-sm">{faq.a}</p></div></FadeIn>))}</div>
        </div>
      </section>
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-14 px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold text-white font-playfair mb-4">Ready to Protect Your Pharmacy Margin?</h2>
              <p className="text-cream max-w-xl mx-auto mb-8">Start with a free pharmacy billing assessment. We'll audit your reject patterns and DIR exposure and show you exactly where margin is leaking.</p>
              <Link prefetch={false} href="/free-assessment" className="inline-flex items-center bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors">Get Free Pharmacy Assessment <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </FadeIn>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
