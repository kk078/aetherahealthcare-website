import { marketingMetadata } from '@/lib/marketing';
import { canonicalUrl } from '@/lib/siteConfig';
import Link from 'next/link';
import { CheckCircle, TrendingUp, Shield, Clock, DollarSign, FileText, AlertCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  alternates: { canonical: canonicalUrl('/services/workers-compensation-billing') },
  title: "Workers' Compensation Billing & RCM | State Fee Schedules, Liens, eBill",
  description: "Workers' compensation revenue cycle management. We handle state fee schedules, jurisdiction rules, utilization review, narrative reports, IAIABC eBilling, lien filing, and bill-review appeals. Faster WC payment, fewer write-offs.",

  ...marketingMetadata("/services/workers-compensation-billing", "Workers' Compensation Billing & RCM | State Fee Schedules, Liens, eBill", "Workers' compensation revenue cycle management. We handle state fee schedules, jurisdiction rules, utilization review, narrative reports, IAIABC eBilling, lien filing, and bill-review appeals. Faster WC payment, fewer write-offs."),
};

const stats = [
  { value: 'In writing', label: 'Agreed targets' },
  { value: 'BAA first', label: 'Clinical intake' },
  { value: 'Human review', label: 'Claim decisions' },
  { value: 'Scoped', label: 'Onboarding and reporting' },
];

const challenges = [
  {
    icon: <AlertCircle className="h-6 w-6" />,
    title: "State-Specific Fee Schedules",
    description: "Every jurisdiction sets its own WC fee schedule, conversion factors, and billing rules. We maintain current fee schedules for each state you practice in so claims bill at the correct allowable \u2014 not the carrier's lowball.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Utilization Review & Authorization",
    description: "WC care requires authorization and is subject to UR and Independent Medical Review. We track authorizations, attach UR approvals, and dispute denials so authorized care gets paid.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Narrative & Documentation Requirements",
    description: "WC carriers demand detailed narrative reports, work-status forms, and causation documentation. Missing or weak narratives are a top denial trigger we eliminate with structured documentation capture.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Lien Filing & Deadlines",
    description: "When carriers underpay or deny, recovery often runs through the lien process with strict jurisdictional deadlines. We file, perfect, and track liens so recoverable revenue isn't lost to the clock.",
  },
  {
    icon: <DollarSign className="h-6 w-6" />,
    title: "IAIABC eBilling & Attachments",
    description: "Most states now mandate electronic WC billing (IAIABC standards) with required attachments. We submit compliant eBills with the right documentation so claims aren't auto-rejected.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Bill Review & Reduction Appeals",
    description: "Third-party bill-review companies reduce WC bills aggressively. We audit every reduction against the applicable fee schedule and appeal improper downcoding and reductions.",
  },
];

const codes = [
  {
    "code": "CMS-1500",
    "desc": "Standard professional claim form for WC billing",
    "note": "Must include claim/WCB number, employer, and date of injury"
  },
  {
    "code": "State Fee Schedule",
    "desc": "Jurisdiction-set allowable amounts and conversion factors",
    "note": "Bill at state allowable; audit bill-review reductions against it"
  },
  {
    "code": "DWC Forms",
    "desc": "State work-status and treatment forms (e.g., DWC-073, PR-2)",
    "note": "Required for payment in many states; missing forms = denial"
  },
  {
    "code": "99455/99456",
    "desc": "Work-related disability evaluation services",
    "note": "WC-specific E/M; documentation of impairment required"
  },
  {
    "code": "Authorization #",
    "desc": "Pre-authorization / UR approval reference",
    "note": "Attach to claim; unauthorized care is routinely denied"
  },
  {
    "code": "IAIABC eBill",
    "desc": "Electronic WC billing standard with attachments",
    "note": "Mandated in most states; non-compliant bills auto-reject"
  },
  {
    "code": "Lien (jurisdictional)",
    "desc": "Claim of lien for disputed/underpaid WC services",
    "note": "Strict filing and perfection deadlines vary by state"
  },
  {
    "code": "Narrative Report",
    "desc": "Detailed causation and treatment narrative",
    "note": "Often required for payment of higher-level and surgical services"
  }
];

const faqs = [
  {
    "q": "Do you handle multi-state workers' comp?",
    "a": "Yes. We maintain current fee schedules, forms, and billing rules for every state you practice in, and route each claim to the correct carrier, TPA, or employer under that jurisdiction's requirements."
  },
  {
    "q": "Will you appeal bill-review reductions?",
    "a": "Always. We audit every reduction against the applicable state fee schedule and pursue Second/Independent Bill Review or appeals where the reduction is improper \u2014 a major source of recovered WC revenue."
  },
  {
    "q": "Can you file and track liens?",
    "a": "Yes. When carriers deny or underpay, we file and perfect liens within jurisdictional deadlines and track them through resolution so recoverable revenue isn't lost to timing rules."
  },
  {
    "q": "Do you manage authorizations, UR, and narratives?",
    "a": "We track authorizations and UR/IMR outcomes, attach approvals to claims, and capture the narrative and work-status documentation WC carriers require for payment."
  },
  {
    "q": "How quickly can you start?",
    "a": "Most clinics are transitioned within 4\u20136 weeks, including jurisdiction setup, eBilling enrollment, fee-schedule loading, and parallel processing on open WC claims."
  }
];


export default function WorkersCompBilling() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="pt-8 pb-12 md:pt-12 md:pb-16 bg-gradient-to-br from-navy to-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-mint/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <FadeIn>
              <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-5">Workers&apos; Comp Billing Specialists</span>
              <h1 className="text-4xl md:text-6xl font-bold text-white font-jakarta mb-6 leading-tight">Workers&apos; Comp Billing Without the Write-Offs</h1>
              <p className="text-xl text-cream mb-10">State fee schedules, jurisdiction rules, utilization review, narrative requirements, and lien deadlines — our workers&apos; compensation RCM team navigates all of it so you actually get paid for the care you deliver.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link prefetch={false} href="/free-assessment" className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors text-center">Get Free Workers&apos; Comp Assessment</Link>
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
          <SectionHeader label="WHY WORKERS' COMP BILLING IS COMPLEX" title="The Workers' Comp Reimbursement Issues We Solve Daily" description="Workers' comp is the most write-off-prone payer class in medicine \u2014 different rules in every state, slow carriers, and unforgiving deadlines. These are the issues we resolve." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {challenges.map((c, i) => (<FadeIn key={i} delay={i * 0.1}><div className="bg-white rounded-xl p-6 border border-gray/10 shadow-sm h-full"><div className="text-teal mb-4">{c.icon}</div><h3 className="font-bold text-navy mb-2">{c.title}</h3><p className="text-gray text-sm">{c.description}</p></div></FadeIn>))}
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-jakarta mb-5">How Aethera Handles Workers&apos; Comp Billing</h2>
              <p className="text-gray mb-5">Workers&apos; compensation isn&apos;t one payer — it&apos;s fifty different rule sets, plus carriers, third-party administrators, and bill-review firms whose business model is paying you less. Most practices treat WC like commercial insurance, and the result is a mountain of write-offs and A/R that ages for months.</p>
              <p className="text-gray">Aethera runs WC as its own discipline: jurisdiction-specific fee schedules, authorization and UR tracking, structured narrative capture, compliant IAIABC eBilling, and an appeals-and-lien workflow that pursues every recoverable dollar — so your WC line stops being a loss leader.</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-cream rounded-2xl p-7 border border-gray/10 space-y-3">
                <h3 className="font-bold text-navy mb-4">Specifically, we handle:</h3>
                {[
                  "State-by-state WC fee schedule loading and application",
                  "Jurisdiction-specific billing rules and form requirements",
                  "Authorization, utilization review, and IMR tracking",
                  "Narrative report and work-status (e.g., DWC) form management",
                  "IAIABC-compliant electronic WC billing with attachments",
                  "Carrier, TPA, and employer claim routing",
                  "Bill-review reduction audits and appeals",
                  "Lien filing, perfection, and deadline tracking",
                  "Causation and medical-necessity documentation support",
                  "Second Bill Review (SBR) and Independent Bill Review (IBR) where applicable",
                  "A/R follow-up tuned to slow WC payment cycles",
                  "Settlement and Medicare Set-Aside (MSA) coordination support",
                ].map((item, i) => (<div key={i} className="flex items-start"><CheckCircle className="h-4 w-4 text-teal flex-shrink-0 mt-0.5 mr-3" /><p className="text-gray text-sm">{item}</p></div>))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="BILLING REFERENCE" title="Workers' Comp Billing Elements We Manage" description="A sample of the codes, forms, and processes our WC team handles daily \u2014 each governed by jurisdiction-specific rules." />
          <div className="mt-12 overflow-x-auto">
            <table className="w-full bg-white rounded-xl overflow-hidden border border-gray/10">
              <thead><tr className="bg-navy text-white text-sm"><th className="py-3 px-5 text-left font-semibold">Code / Form</th><th className="py-3 px-5 text-left font-semibold">Description</th><th className="py-3 px-5 text-left font-semibold hidden md:table-cell">Billing Note</th></tr></thead>
              <tbody>{codes.map((row, i) => (<tr key={i} className={i % 2 === 0 ? 'bg-cream' : 'bg-white'}><td className="py-3 px-5 font-bold text-teal text-sm">{row.code}</td><td className="py-3 px-5 text-navy text-sm">{row.desc}</td><td className="py-3 px-5 text-gray text-xs hidden md:table-cell">{row.note}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="py-12 bg-navy text-white"><div className="max-w-4xl mx-auto px-5"><h2 className="text-2xl font-bold">Review your own practice data</h2><p className="mt-3 text-white/80">We agree the baseline, reporting period and success criteria before work begins. Verified client outcomes are published only with supporting records and permission.</p><Link href="/case-studies/" className="mt-5 inline-block text-mint underline">Explore specialty billing workflows</Link></div></section>
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="FAQ" title="Workers' Comp Billing Questions" description="Common questions from clinics and providers handling workers' compensation claims." />
          <div className="space-y-4 mt-12">{faqs.map((faq, i) => (<FadeIn key={i} delay={i * 0.1}><div className="bg-cream rounded-xl p-6 border border-gray/10"><h3 className="font-bold text-navy mb-2">{faq.q}</h3><p className="text-gray text-sm">{faq.a}</p></div></FadeIn>))}</div>
        </div>
      </section>
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-14 px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold text-white font-jakarta mb-4">Ready to Stop Writing Off Workers&apos; Comp?</h2>
              <p className="text-cream max-w-xl mx-auto mb-8">Start with a free workers&apos; comp billing assessment. We&apos;ll audit your write-offs, reductions, and lien opportunities and show you exactly where recoverable revenue is being lost.</p>
              <Link prefetch={false} href="/free-assessment" className="inline-flex items-center bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors">Get Free Workers&apos; Comp Assessment <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </FadeIn>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
