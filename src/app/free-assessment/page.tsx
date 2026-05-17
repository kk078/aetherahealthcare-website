'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle, FileText, BarChart3, Users, TrendingUp,
  Shield, Clock, Phone, ArrowRight, Star
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

const deliverables = [
  {
    icon: <BarChart3 className="h-7 w-7" />,
    title: 'Denial Rate Analysis',
    description: 'We audit your last 90 days of claims and identify your top 5 denial reasons with actionable fixes for each.',
  },
  {
    icon: <TrendingUp className="h-7 w-7" />,
    title: 'Revenue Leakage Report',
    description: 'Uncover unbilled charges, undercoding patterns, and missed reimbursement opportunities across your claim history.',
  },
  {
    icon: <FileText className="h-7 w-7" />,
    title: 'Benchmark Comparison',
    description: 'See how your key metrics — denial rate, AR days, clean claim rate — compare to top-performing practices in your specialty.',
  },
  {
    icon: <Shield className="h-7 w-7" />,
    title: 'Payer Performance Scorecard',
    description: 'Identify which payers are underreimbursing relative to your contracted rates and where to focus recovery efforts.',
  },
  {
    icon: <Clock className="h-7 w-7" />,
    title: 'AR Aging Deep Dive',
    description: 'Full breakdown of accounts receivable by age bucket and payer, with write-off risk flagging.',
  },
  {
    icon: <CheckCircle className="h-7 w-7" />,
    title: 'Written Action Plan',
    description: 'A prioritized, written report with specific steps your practice can take immediately — whether or not you partner with us.',
  },
];

const steps = [
  { step: '01', title: 'Submit Request', time: '5 min', desc: 'Fill out the form below. We\'ll confirm receipt within 1 business day.' },
  { step: '02', title: 'Intake Call', time: '20 min', desc: 'A brief call with our team to understand your practice and gather billing access.' },
  { step: '03', title: 'We Analyze', time: '3–5 days', desc: 'Our billing specialists conduct a full review of your revenue cycle data.' },
  { step: '04', title: 'Report Review', time: '30 min', desc: 'We walk you through your findings and answer every question — no sales pressure.' },
];

const faqs = [
  { q: 'Is it really free?', a: 'Yes. No setup fee, no hidden charges, and no obligation to become a client. We offer this assessment because we believe the findings speak for themselves.' },
  { q: 'What data do you need access to?', a: 'Typically read-only access to your practice management system or exports of recent claims, ERA/EOB files, and your AR aging report. We sign an NDA before accessing anything.' },
  { q: 'How long does the whole process take?', a: 'From your intake call to receiving your written report, most assessments are completed within 5 business days.' },
  { q: 'What if I\'m happy with my current billing?', a: 'That\'s great. The assessment will confirm it — or show you where small improvements could still mean tens of thousands of dollars annually. Either way, you leave better informed.' },
];

interface FormData {
  firstName: string;
  lastName: string;
  practiceName: string;
  specialty: string;
  providerCount: string;
  claimVolume: string;
  billingSituation: string;
  ehr: string;
  phone: string;
  email: string;
  challenge: string;
}

export default function FreeAssessment() {
  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', practiceName: '', specialty: '',
    providerCount: '', claimVolume: '', billingSituation: '', ehr: '',
    phone: '', email: '', challenge: '',
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-mint/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <FadeIn>
              <div className="inline-flex items-center bg-mint/20 border border-mint/40 rounded-full px-4 py-2 mb-6">
                <Star className="h-4 w-4 text-mint mr-2" />
                <span className="text-mint text-sm font-semibold">No obligation · No cost · No sales pitch</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-6 leading-tight">
                Get Your Free Revenue Cycle Assessment
              </h1>
              <p className="text-xl text-cream max-w-3xl mx-auto mb-10">
                Discover exactly where your practice is leaving money on the table — at zero cost and zero obligation. We deliver a written report with specific findings within 5 business days.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="flex flex-wrap justify-center gap-4">
                {['Delivered in 5 Business Days', 'Written Report Included', 'No Obligation to Partner'].map((badge, i) => (
                  <span key={i} className="bg-white/15 border border-white/30 text-white px-5 py-2 rounded-full text-sm font-medium">
                    ✓ {badge}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* What You'll Get */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="WHAT'S INCLUDED"
            title="Six Things You'll Know After Your Assessment"
            description="Our billing specialists spend hours in your data so you don't have to. Here's what's waiting in your report."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {deliverables.map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-6 border border-gray/10 shadow-sm h-full flex flex-col">
                  <div className="text-teal mb-4">{item.icon}</div>
                  <h3 className="text-lg font-bold text-navy mb-2">{item.title}</h3>
                  <p className="text-gray text-sm flex-grow">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Trust */}
      <section className="py-16 md:py-24 bg-white" id="request">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

            {/* Trust Column */}
            <div className="lg:col-span-2">
              <FadeIn>
                <h2 className="text-3xl font-bold text-navy font-playfair mb-4">
                  Request Your Assessment
                </h2>
                <p className="text-gray mb-8">
                  Join practices that discovered revenue they didn't know they were missing. The average assessment uncovers <strong className="text-navy">$47,000–$180,000</strong> in annual revenue improvement opportunities.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    'No setup fee — the assessment is 100% free',
                    'We sign an NDA before accessing any data',
                    'You own the report — keep it regardless',
                    'Our team handles the analysis, not software',
                    'Results reviewed live with a senior specialist',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                      <p className="text-gray text-sm">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-cream rounded-xl p-5 border border-gray/10">
                  <div className="flex items-center mb-3">
                    <Phone className="h-5 w-5 text-teal mr-2" />
                    <span className="font-bold text-navy text-sm">Prefer to call?</span>
                  </div>
                  <p className="text-gray text-sm">+1 (863) 694-0325</p>
                  <p className="text-gray text-xs mt-1">Mon–Fri, 9 AM–6 PM EST</p>
                </div>
              </FadeIn>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <FadeIn delay={0.2}>
                {submitted ? (
                  <div className="bg-teal/10 border border-teal rounded-2xl p-10 text-center">
                    <CheckCircle className="h-16 w-16 text-teal mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-navy font-playfair mb-3">Assessment Request Received!</h3>
                    <p className="text-gray mb-6">
                      Our team will reach out within <strong>1 business day</strong> to schedule your 20-minute intake call. Keep an eye on <strong>{form.email || 'your inbox'}</strong>.
                    </p>
                    <Link href="/" className="text-teal font-semibold hover:text-navy transition-colors">
                      ← Return to Homepage
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-cream rounded-2xl p-8 border border-gray/10 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-navy mb-1">First Name *</label>
                        <input required name="firstName" value={form.firstName} onChange={handleChange}
                          className="w-full border border-gray/30 rounded-lg px-4 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy mb-1">Last Name *</label>
                        <input required name="lastName" value={form.lastName} onChange={handleChange}
                          className="w-full border border-gray/30 rounded-lg px-4 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1">Practice Name *</label>
                      <input required name="practiceName" value={form.practiceName} onChange={handleChange}
                        className="w-full border border-gray/30 rounded-lg px-4 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal text-sm" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-navy mb-1">Specialty *</label>
                        <select required name="specialty" value={form.specialty} onChange={handleChange}
                          className="w-full border border-gray/30 rounded-lg px-4 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal text-sm">
                          <option value="">Select specialty</option>
                          {['Family Medicine','Internal Medicine','Cardiology','Dermatology','Orthopedic Surgery','Psychiatry / Behavioral Health','Neurology','Gastroenterology','Urology','Pediatrics','Pulmonology','Rheumatology','Other'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy mb-1">Number of Providers *</label>
                        <select required name="providerCount" value={form.providerCount} onChange={handleChange}
                          className="w-full border border-gray/30 rounded-lg px-4 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal text-sm">
                          <option value="">Select</option>
                          {['1','2–5','6–10','11–20','21+'].map(v => <option key={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-navy mb-1">Monthly Claim Volume *</label>
                        <select required name="claimVolume" value={form.claimVolume} onChange={handleChange}
                          className="w-full border border-gray/30 rounded-lg px-4 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal text-sm">
                          <option value="">Select</option>
                          {['Under 200','200–500','500–1,000','1,000–2,000','2,000+'].map(v => <option key={v}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy mb-1">Current Billing Situation *</label>
                        <select required name="billingSituation" value={form.billingSituation} onChange={handleChange}
                          className="w-full border border-gray/30 rounded-lg px-4 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal text-sm">
                          <option value="">Select</option>
                          {['In-house billing staff','Another billing company','Mixed (some in-house, some outsourced)','Physician bills personally'].map(v => <option key={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1">Current EHR / PM System</label>
                      <input name="ehr" value={form.ehr} onChange={handleChange} placeholder="e.g. Epic, athenahealth, Kareo, eClinicalWorks..."
                        className="w-full border border-gray/30 rounded-lg px-4 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal text-sm" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-navy mb-1">Phone *</label>
                        <input required type="tel" name="phone" value={form.phone} onChange={handleChange}
                          className="w-full border border-gray/30 rounded-lg px-4 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy mb-1">Email *</label>
                        <input required type="email" name="email" value={form.email} onChange={handleChange}
                          className="w-full border border-gray/30 rounded-lg px-4 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1">Biggest Billing Challenge (optional)</label>
                      <textarea name="challenge" value={form.challenge} onChange={handleChange} rows={3}
                        placeholder="e.g. High denial rates, slow AR, staff turnover, switching billing companies..."
                        className="w-full border border-gray/30 rounded-lg px-4 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal text-sm resize-none" />
                    </div>
                    <button type="submit"
                      className="w-full bg-teal hover:bg-navy text-white font-bold py-3.5 px-8 rounded-full transition-colors duration-300 flex items-center justify-center">
                      Request My Free Assessment
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </button>
                    <p className="text-xs text-gray text-center">
                      By submitting, you agree to our{' '}
                      <Link href="/compliance/privacy-policy" className="text-teal hover:underline">Privacy Policy</Link>.
                      We never share your data.
                    </p>
                  </form>
                )}
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="THE PROCESS"
            title="How Your Assessment Works"
            description="Four straightforward steps from request to report — most practices complete the process in under a week."
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            {steps.map((s, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="bg-white rounded-xl p-6 border border-gray/10 text-center h-full relative">
                  <div className="text-4xl font-bold text-teal/20 font-playfair mb-3">{s.step}</div>
                  <h3 className="text-lg font-bold text-navy mb-1">{s.title}</h3>
                  <span className="inline-block text-xs font-semibold text-teal bg-teal/10 px-3 py-1 rounded-full mb-3">{s.time}</span>
                  <p className="text-gray text-sm">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="FAQ" title="Assessment FAQs" description="Common questions about the free revenue cycle assessment." />
          <div className="space-y-4 mt-12">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-cream rounded-xl p-6 border border-gray/10">
                  <h3 className="font-bold text-navy mb-2">{faq.q}</h3>
                  <p className="text-gray text-sm">{faq.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
