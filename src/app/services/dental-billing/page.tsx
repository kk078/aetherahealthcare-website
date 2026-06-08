import Link from 'next/link';
import { CheckCircle, TrendingUp, Shield, Clock, DollarSign, FileText, AlertCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: "Dental Billing & RCM Services | Medical-Dental Cross-Coding | Aethera Healthcare",
  description: "Dental revenue cycle management for general, specialty, and DSO practices. We handle CDT coding, medical-dental cross-coding, predeterminations, PPO fee schedules, ortho and oral surgery billing, and aging A/R. 97.5% clean claim rate.",
};

const stats = [
  {
    "value": "97.5%",
    "label": "Clean Claim Rate for Dental"
  },
  {
    "value": "2.4%",
    "label": "Write-off Rate"
  },
  {
    "value": "+19%",
    "label": "Avg Collections Lift"
  },
  {
    "value": "<35 Days",
    "label": "Average A/R Days"
  }
];

const challenges = [
  {
    icon: <AlertCircle className="h-6 w-6" />,
    title: "Medical-Dental Cross-Coding",
    description: "Oral surgery, trauma, sleep apnea appliances, biopsies, and TMJ care are often billable to medical insurance at far higher reimbursement. We cross-code with CPT/ICD-10 and medical necessity narratives to capture it.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Predeterminations & Frequency Limits",
    description: "Missed predeterminations and exceeded frequency limitations (cleanings, x-rays, perio) are top write-off causes. We verify benefits and submit predeterminations before treatment so patients and the practice aren't surprised.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "PPO Fee Schedule Management",
    description: "Every PPO contract has its own allowed fees, downgrades, and bundling rules. We load and maintain your fee schedules so claims post against the correct contracted amount and underpayments are caught.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Downgrades & Alternate Benefits",
    description: "Composite-to-amalgam downgrades, LEAT clauses, and alternate-benefit provisions quietly reduce payments. We identify them, bill correctly, and balance-bill patients where contractually allowed.",
  },
  {
    icon: <DollarSign className="h-6 w-6" />,
    title: "Orthodontic & Phased Treatment Billing",
    description: "Ortho banding, continuation claims, and lifetime maximums require precise installment billing across months. We manage the full ortho claim lifecycle so payments arrive on schedule.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Attachments & Narrative Documentation",
    description: "Perio charting, x-rays, intraoral images, and narratives are required for crowns, SRP, and surgical codes. Missing attachments are a leading denial trigger we eliminate.",
  },
];

const codes = [
  {
    "code": "D0150",
    "desc": "Comprehensive oral evaluation, new or established patient",
    "note": "Frequency-limited; verify last comprehensive exam date"
  },
  {
    "code": "D1110",
    "desc": "Prophylaxis \u2013 adult cleaning",
    "note": "Frequency limitation per plan (often 2/year); track to avoid denials"
  },
  {
    "code": "D2740",
    "desc": "Crown \u2013 porcelain/ceramic",
    "note": "Requires x-ray and narrative; watch alternate-benefit downgrades"
  },
  {
    "code": "D4341",
    "desc": "Periodontal scaling and root planing, 4+ teeth per quadrant",
    "note": "Perio charting and x-ray attachments required"
  },
  {
    "code": "D7140",
    "desc": "Extraction, erupted tooth or exposed root",
    "note": "Often medically cross-codable for trauma/surgical cases"
  },
  {
    "code": "D6010",
    "desc": "Surgical placement of implant body, endosteal",
    "note": "Frequently billable to medical with documentation of medical necessity"
  },
  {
    "code": "D8080",
    "desc": "Comprehensive orthodontic treatment, adolescent",
    "note": "Installment/continuation billing against lifetime ortho maximum"
  },
  {
    "code": "D9944",
    "desc": "Occlusal guard \u2013 hard appliance, full arch",
    "note": "Sleep/TMJ appliances may cross-code to medical (E0486/CPT)"
  }
];

const faqs = [
  {
    "q": "Do you do medical-dental cross-coding?",
    "a": "Yes \u2014 it's one of the biggest revenue opportunities we capture. Oral surgery, trauma, biopsies, implants, sleep apnea appliances, and TMJ care are frequently billable to medical insurance at higher reimbursement. We code them with CPT/ICD-10 and the required medical-necessity narratives."
  },
  {
    "q": "Will you load and maintain our PPO fee schedules?",
    "a": "Yes. We load every contracted fee schedule, apply downgrades and alternate-benefit provisions correctly, and flag underpayments where a payer pays below your contracted amount."
  },
  {
    "q": "Can you handle orthodontic installment billing?",
    "a": "Absolutely. We manage banding claims, monthly continuation claims, and lifetime-maximum tracking so ortho payments arrive on schedule across the full treatment plan."
  },
  {
    "q": "Do you work our aging insurance A/R?",
    "a": "Every week. We work insurance aging, resubmit with missing attachments, file appeals, and escalate timely-filing risks before claims become uncollectable."
  },
  {
    "q": "How quickly can you start?",
    "a": "Most dental practices are fully transitioned within 3\u20134 weeks, including PMS access, clearinghouse setup, fee-schedule loading, and parallel claim processing."
  }
];

const caseMetrics = [
  {
    "label": "Clean Claim Rate",
    "before": "88%",
    "after": "97.5%"
  },
  {
    "label": "A/R > 90 Days",
    "before": "$190K",
    "after": "$41K"
  },
  {
    "label": "Collections",
    "before": "Baseline",
    "after": "+19%"
  },
  {
    "label": "Write-offs",
    "before": "6.1%",
    "after": "2.4%"
  }
];

export default function DentalBilling() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-mint/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <FadeIn>
              <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-5">Dental Billing Specialists</span>
              <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-6 leading-tight">Dental Billing That Captures Every Dollar You Earn</h1>
              <p className="text-xl text-cream mb-10">From CDT coding and predeterminations to medical-dental cross-coding for oral surgery and sleep appliances — our dental RCM team turns clinical work into clean, fully-paid claims.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link prefetch={false} href="/free-assessment" className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors text-center">Get Free Dental Assessment</Link>
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
          <SectionHeader label="WHY DENTAL BILLING IS COMPLEX" title="The Dental Reimbursement Issues We Solve Daily" description="Dental practices leave significant revenue uncollected in cross-coding, predeterminations, and aging insurance A/R. These are the issues we resolve." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {challenges.map((c, i) => (<FadeIn key={i} delay={i * 0.1}><div className="bg-white rounded-xl p-6 border border-gray/10 shadow-sm h-full"><div className="text-teal mb-4">{c.icon}</div><h3 className="font-bold text-navy mb-2">{c.title}</h3><p className="text-gray text-sm">{c.description}</p></div></FadeIn>))}
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-5">How Aethera Handles Dental Billing</h2>
              <p className="text-gray mb-5">Dental billing sits at the intersection of two coding systems — CDT and medical CPT/ICD-10 — and most practices only bill one of them. The result is uncollected cross-codable revenue, write-offs from missed predeterminations, and insurance A/R that ages past collectability.</p>
              <p className="text-gray">Aethera assigns a dental-dedicated team that codes from your clinical notes, cross-codes to medical where it pays more, submits predeterminations and attachments proactively, and works your insurance aging every week — driving a 97.5% clean claim rate and a measurably lower write-off rate.</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-cream rounded-2xl p-7 border border-gray/10 space-y-3">
                <h3 className="font-bold text-navy mb-4">Specifically, we handle:</h3>
                {[
                  "CDT (D-code) coding from clinical documentation",
                  "Medical-dental cross-coding (CPT/ICD-10) for oral surgery, trauma, sleep, TMJ",
                  "Insurance verification and benefit breakdowns before treatment",
                  "Predetermination submission and tracking",
                  "PPO fee schedule loading, downgrades, and alternate-benefit handling",
                  "Claim attachments (x-rays, perio charts, narratives, images)",
                  "Orthodontic banding and continuation/installment billing",
                  "Oral surgery and implant medical-necessity claims",
                  "Secondary and coordination-of-benefits claims",
                  "Insurance A/R follow-up and appeals",
                  "Patient billing, statements, and balance collection",
                  "Annual maximum and frequency-limit tracking",
                ].map((item, i) => (<div key={i} className="flex items-start"><CheckCircle className="h-4 w-4 text-teal flex-shrink-0 mt-0.5 mr-3" /><p className="text-gray text-sm">{item}</p></div>))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="PROCEDURE CODES" title="Common Dental Codes We Bill" description="A sample of the CDT codes \u2014 and their common medical cross-codes \u2014 our team handles daily, each with payer-specific rules." />
          <div className="mt-12 overflow-x-auto">
            <table className="w-full bg-white rounded-xl overflow-hidden border border-gray/10">
              <thead><tr className="bg-navy text-white text-sm"><th className="py-3 px-5 text-left font-semibold">CDT Code</th><th className="py-3 px-5 text-left font-semibold">Description</th><th className="py-3 px-5 text-left font-semibold hidden md:table-cell">Billing Note</th></tr></thead>
              <tbody>{codes.map((row, i) => (<tr key={i} className={i % 2 === 0 ? 'bg-cream' : 'bg-white'}><td className="py-3 px-5 font-bold text-teal text-sm">{row.code}</td><td className="py-3 px-5 text-navy text-sm">{row.desc}</td><td className="py-3 px-5 text-gray text-xs hidden md:table-cell">{row.note}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-5">Case Study</span>
            <h2 className="text-3xl font-bold text-white font-playfair mb-4">3-Location Group Dental Practice, Florida</h2>
            <p className="text-cream/80 mb-8">This group was billing CDT only — never cross-coding oral surgery, implants, or sleep appliances to medical — and carried $190,000 in insurance A/R over 90 days from missing attachments and predeterminations.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">{caseMetrics.map((m, i) => (<div key={i} className="bg-white/10 rounded-xl p-4 text-center"><p className="text-xs text-gray/60 mb-1">{m.label}</p><p className="text-xs text-gray/40 line-through">{m.before}</p><p className="text-xl font-bold text-mint">{m.after}</p></div>))}</div>
            <blockquote className="border-l-4 border-mint pl-5"><p className="text-cream italic">“We were leaving medical reimbursement on the table for years. Aethera's cross-coding alone paid for the engagement in the first quarter.”</p></blockquote>
            <div className="mt-6"><Link prefetch={false} href="/case-studies" className="text-mint font-semibold hover:text-white transition-colors inline-flex items-center">Read all case studies <ArrowRight className="h-4 w-4 ml-1" /></Link></div>
          </FadeIn>
        </div>
      </section>
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="FAQ" title="Dental Billing Questions" description="Common questions from dentists and practice managers considering outsourcing their revenue cycle." />
          <div className="space-y-4 mt-12">{faqs.map((faq, i) => (<FadeIn key={i} delay={i * 0.1}><div className="bg-cream rounded-xl p-6 border border-gray/10"><h3 className="font-bold text-navy mb-2">{faq.q}</h3><p className="text-gray text-sm">{faq.a}</p></div></FadeIn>))}</div>
        </div>
      </section>
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-14 px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold text-white font-playfair mb-4">Ready to Collect Everything You Produce?</h2>
              <p className="text-cream max-w-xl mx-auto mb-8">Start with a free dental billing assessment. We'll audit your cross-coding opportunities and aging A/R and show you exactly where revenue is being left behind.</p>
              <Link prefetch={false} href="/free-assessment" className="inline-flex items-center bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors">Get Free Dental Assessment <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </FadeIn>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
