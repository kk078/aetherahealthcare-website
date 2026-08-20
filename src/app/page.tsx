'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  CheckCircle,
  DollarSign,
  Shield,
  Clock,
  FileText,
  CreditCard,
  Users,
  Calendar,
  BarChart3,
  Zap,
  ShieldCheck,
  Activity,
  Network,
  ArrowRight,
  AlertTriangle,
  Bot,
  ScrollText,
  Globe,
  FlaskConical,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import ServiceCard from '@/components/ui/ServiceCard';
import CTABanner from '@/components/ui/CTABanner';
import ROICalculator from '@/components/ui/ROICalculator';

// Client-only animated illustration of the medical-billing revenue cycle
// (coding → scrub → submit → denial → appeal → paid). Lightweight SVG/CSS,
// kept off SSR so the static export stays clean.
const RCMBillingFlow = dynamic(() => import('@/components/ui/RCMBillingFlow'), {
  ssr: false,
  loading: () => null,
});

const services = [
  { icon: <FileText className="h-8 w-8" />, title: 'Medical Coding', description: 'Accurate ICD-10, CPT, and HCPCS coding for maximum reimbursement.', href: '/services/medical-coding' },
  { icon: <DollarSign className="h-8 w-8" />, title: 'Claims & Billing', description: 'End-to-end claim submission and billing management.', href: '/services/claims-billing' },
  { icon: <CreditCard className="h-8 w-8" />, title: 'Payment Posting', description: 'Efficient payment application and reconciliation.', href: '/services/payment-posting' },
  { icon: <Shield className="h-8 w-8" />, title: 'Denial Management', description: 'Proactive denial prevention and appeal services.', href: '/services/denial-management' },
  { icon: <Users className="h-8 w-8" />, title: 'Provider Credentialing', description: 'Complete credentialing and enrollment services.', href: '/services/credentialing' },
  { icon: <CheckCircle className="h-8 w-8" />, title: 'Eligibility Verification', description: 'Real-time insurance verification and benefits.', href: '/services/eligibility-verification' },
  { icon: <Calendar className="h-8 w-8" />, title: 'Prior Authorization', description: 'Streamlined prior auth submission and tracking.', href: '/services/prior-authorization' },
  { icon: <CreditCard className="h-8 w-8" />, title: 'Patient Collections', description: 'Professional patient statement management.', href: '/services/patient-collections' },
  { icon: <Shield className="h-8 w-8" />, title: 'Compliance & Auditing', description: 'HIPAA compliance and revenue cycle audits.', href: '/services/compliance-auditing' },
  { icon: <Zap className="h-8 w-8" />, title: 'Telehealth Billing', description: 'Specialized billing for telehealth services.', href: '/services/telehealth-billing' },
  { icon: <Clock className="h-8 w-8" />, title: 'AR Follow-Up', description: 'Dedicated accounts receivable management.', href: '/services/ar-followup' },
  { icon: <BarChart3 className="h-8 w-8" />, title: 'Reporting & Analytics', description: 'Comprehensive financial and operational reporting.', href: '/services/reporting-analytics' },
];

const specialties = [
  'Primary Care', 'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'Neurology',
  'Orthopedics', 'Pediatrics', 'Psychiatry', 'Surgery', 'Urology', 'Other',
];

const targets = [
  {
    value: '95%+', label: 'Clean-Claim Rate',
    barClass: 'bg-emerald', barWidth: '95%',
    icon: <CheckCircle className="h-5 w-5" />, iconWrap: 'bg-emerald/10 text-emerald',
  },
  {
    value: '<5%', label: 'Eligibility-Driven Denial Rate',
    barClass: 'bg-royal', barWidth: '20%',
    icon: <AlertTriangle className="h-5 w-5" />, iconWrap: 'bg-royal/10 text-royal',
  },
  {
    value: '<30 days', label: 'In Accounts Receivable',
    barClass: 'bg-navy', barWidth: '40%',
    icon: <Clock className="h-5 w-5" />, iconWrap: 'bg-navy/10 text-navy',
  },
  {
    value: '96%+', label: 'Of Billed Revenue Collected',
    barClass: 'bg-teal', barWidth: '96%',
    icon: <DollarSign className="h-5 w-5" />, iconWrap: 'bg-teal/10 text-teal',
  },
];

const difference = [
  {
    icon: <Bot className="h-7 w-7" />,
    title: 'AI with a hard boundary.',
    desc: 'Most vendors say "AI-powered." We say what our AI is not allowed to do: it never generates a billing code, a dollar figure, or a date of service. Deterministic software parses payer data; AI assists with drafting and triage; certified humans approve anything that touches money. Your compliance officer will like this answer.',
  },
  {
    icon: <ScrollText className="h-7 w-7" />,
    title: 'An audit trail on everything.',
    desc: 'Every eligibility check and claim action is logged in a tamper-evident, hash-chained audit trail — who (or what) did it, when, and from what source data. When a payer or auditor asks "why was this billed this way?", the answer is one click, not an archaeology project.',
  },
  {
    icon: <Globe className="h-7 w-7" />,
    title: 'Offshore, done transparently.',
    desc: 'US-resident data. India-based experts working through locked-down virtual desktops — no downloads, no USB, no local copies, enforced by technology. BAA signed before anything moves. We screen your state and payer mix for offshore restrictions up front and tell you before you ask.',
    link: { href: '/compliance/security', label: 'Read our Security One-Pager' },
  },
  {
    icon: <FlaskConical className="h-7 w-7" />,
    title: 'Proof before commitment.',
    desc: 'No long contract on faith. We take 50 of your real claims, agree success criteria in writing first, and deliver results in your numbers within two weeks — free. If we don’t beat your current process, you’ve lost nothing and learned where your leaks are.',
  },
];

const pilotSteps = [
  { n: '1', title: 'Sign the BAA.', desc: 'Ours or yours — before any data moves.' },
  { n: '2', title: 'Send 50 claims (or 50 eligibility checks).', desc: 'We agree in writing what success means: accuracy vs. your manual process, turnaround time, issues caught.' },
  { n: '3', title: 'Get the results in 14 days.', desc: 'A one-page scorecard in your numbers, a live walkthrough of every exception we found, zero obligation.' },
];

const architecture = [
  { icon: <Activity className="h-6 w-6" />, title: 'Advanced Coding Analytics', desc: 'Clinical-grade logic reviews every ICD-10 and CPT code so claims are optimized for accurate reimbursement and compliance before they ever reach a payer.' },
  { icon: <ShieldCheck className="h-6 w-6" />, title: 'Institutional Compliance', desc: 'Rigorous HIPAA-compliant data handling and payer-contract management protect your practice’s legal and financial standing at every step.' },
  { icon: <Network className="h-6 w-6" />, title: 'Unified Payer Visibility', desc: 'A single source of truth across 900+ payers gives you real-time visibility into claims, denials, and collections wherever your revenue lives.' },
];

const faqs = [
  { question: 'How quickly can you start managing our billing?', answer: 'Most practices are fully operational with Aethera within 30-45 days. Our onboarding process is designed for minimal disruption to your workflow.' },
  { question: 'What makes Aethera different from other billing companies?', answer: 'We combine expert human billing professionals with advanced technology to deliver superior results. Our dedicated account teams understand the nuances of each specialty and work proactively to maximize your revenue.' },
  { question: 'How do you ensure HIPAA compliance?', answer: 'We maintain comprehensive HIPAA compliance with annual training, business associate agreements, encrypted data transmission, and secure facilities. We undergo regular third-party security audits.' },
  { question: 'What reporting do you provide?', answer: 'We provide real-time access to our provider portal with detailed analytics on collections, denials, AR days, and more. Monthly executive summaries and quarterly business reviews are included.' },
  { question: 'Do you work with all insurance types?', answer: 'Yes, we handle Medicare, Medicaid, commercial insurance, and workers’ compensation claims. Our team stays current with payer-specific requirements and updates.' },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col pt-16 font-inter">
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "Organization",
          "name": "Aethera Healthcare Solutions",
          "url": "https://aetherahealthcare.com",
          "logo": "https://aetherahealthcare.com/logo.png",
          "description": "Aethera Healthcare Solutions is your full-service medical billing partner handling coding, claims, payments, denials, and collections so you can focus on patients.",
          "contactPoint": { "@type": "ContactPoint", "telephone": "+1-813-519-4640", "contactType": "customer service", "email": "info@aetherahealthcare.com" },
          "sameAs": ["https://www.linkedin.com/company/aethera-healthcare-solutions"],
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "WebSite", "name": "Aethera Healthcare Solutions",
          "url": "https://aetherahealthcare.com",
        }) }} />
      </>
      <Navbar />

      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-ink">
        {/* layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-navy to-[#06304f]" />
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(120,160,200,0.35) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute -top-1/3 -right-1/4 w-[70%] h-[140%] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(closest-side, rgba(69,196,176,0.16), transparent)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">
            {/* Left */}
            <div>
              <FadeIn>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3.5 py-1.5 text-xs font-semibold tracking-[0.14em] text-cream uppercase">
                  <ShieldCheck className="h-4 w-4 text-mint" /> AI-first revenue cycle
                </span>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 className="font-jakarta font-extrabold text-white text-4xl md:text-6xl leading-[1.05] tracking-tight mt-6 mb-5">
                  Billing run by AI. Signed off by humans. Proven on your claims.
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-lg md:text-xl text-cream/85 max-w-xl leading-relaxed mb-8">
                  Aethera&apos;s founder spent years adjudicating claims on the insurance side before running
                  billing operations for providers. That knowledge is now software: AI that verifies everything
                  and is never allowed to guess — it cannot invent a code, a dollar amount, or a date — with a
                  tamper-evident audit trail on every action. Free 50-claim pilot; success criteria agreed in
                  writing.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link prefetch={false} href="/free-assessment"
                    className="inline-flex items-center justify-center gap-2 bg-mint hover:bg-white text-navy font-bold py-3.5 px-7 rounded-xl transition-colors duration-200 shadow-lg shadow-black/20">
                    Start the Free 50-Claim Pilot <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link prefetch={false} href="#aethera-difference"
                    className="inline-flex items-center justify-center border border-white/35 text-white hover:bg-white/10 font-semibold py-3.5 px-7 rounded-xl transition-colors duration-200">
                    How our AI works
                  </Link>
                </div>
              </FadeIn>
              <FadeIn delay={0.4}>
                <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 text-cream/70 text-sm">
                  <span className="flex items-center gap-2"><Network className="h-4 w-4 text-mint" /> 900+ payers</span>
                  <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-mint" /> 50+ EHR integrations</span>
                  <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-mint" /> HIPAA-compliant architecture</span>
                  <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-mint" /> 15 RCM services</span>
                </div>
              </FadeIn>
            </div>

            {/* Right — animated medical-billing revenue cycle */}
            <div className="relative h-[360px] sm:h-[460px] lg:h-[560px] w-full lg:w-[112%] lg:-mr-[12%]">
              <RCMBillingFlow />
            </div>
          </div>
        </div>
        {/* bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-cream" />
      </section>

      {/* ===================== PERFORMANCE TARGETS ===================== */}
      <section className="py-16 md:py-20 bg-cream border-b border-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="font-jakarta font-bold text-navy text-3xl md:text-4xl tracking-tight">The standards we sign our name to</h2>
            <p className="text-gray mt-3 max-w-2xl leading-relaxed">
              We&apos;re a new firm, and we won&apos;t show you invented track records. Instead, these are the
              performance standards we commit to <strong className="text-navy">in writing, in your service
              agreement</strong> — with remedies if we miss them.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {targets.map((t, i) => (
              <FadeIn key={t.label} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-7 border border-gray/15 shadow-sm hover:shadow-xl transition-shadow h-full">
                  <span className={`inline-flex items-center justify-center h-11 w-11 rounded-xl mb-6 ${t.iconWrap}`}>{t.icon}</span>
                  <div className="font-jakarta font-extrabold text-navy text-4xl tracking-tight mb-1">{t.value}</div>
                  <div className="text-xs font-bold tracking-[0.12em] text-gray uppercase mb-4">{t.label}</div>
                  <div className="w-full bg-gray/10 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${t.barClass}`} style={{ width: t.barWidth }} />
                  </div>
                  <p className="mt-5 text-sm text-gray italic">Contractual target</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <p className="text-center text-gray italic mt-10 max-w-2xl mx-auto">
              When our first pilot results are in, this section will show real client outcomes — and nothing else ever will.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ===================== THE AETHERA DIFFERENCE ===================== */}
      <section id="aethera-difference" className="py-16 md:py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold tracking-[0.16em] text-teal uppercase mb-3">Why Aethera</p>
            <h2 className="font-jakarta font-bold text-navy text-3xl md:text-4xl tracking-tight mb-3">The Aethera Difference</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {difference.map((d, i) => (
              <FadeIn key={d.title} delay={i * 0.1}>
                <div className="bg-cream rounded-2xl p-8 border border-gray/10 h-full">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-navy text-white mb-5">{d.icon}</span>
                  <h3 className="font-jakarta font-bold text-navy text-xl mb-3">{d.title}</h3>
                  <p className="text-gray leading-relaxed">{d.desc}</p>
                  {d.link && (
                    <Link prefetch={false} href={d.link.href} className="inline-flex items-center gap-1.5 text-teal font-semibold hover:text-navy transition-colors mt-4">
                      {d.link.label} <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== THE FREE 50-CLAIM PILOT ===================== */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-ink via-navy to-[#06304f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.25] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(120,160,200,0.4) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-mint/15 border border-mint/40 text-mint text-xs font-bold tracking-[0.14em] uppercase px-4 py-1.5 rounded-full mb-4">Zero obligation</span>
          <h2 className="font-jakarta font-bold text-white text-3xl md:text-4xl tracking-tight mb-12">The Free 50-Claim Pilot</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-12">
            {pilotSteps.map((s) => (
              <FadeIn key={s.n} delay={Number(s.n) * 0.1}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-7 h-full">
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-mint text-navy font-bold text-sm mb-5">{s.n}</span>
                  <h3 className="font-jakarta font-bold text-white text-lg mb-2">{s.title}</h3>
                  <p className="text-cream/80 leading-relaxed text-sm">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <Link prefetch={false} href="/free-assessment"
            className="inline-flex items-center justify-center gap-2 bg-mint hover:bg-white text-navy font-bold py-3.5 px-8 rounded-xl transition-colors duration-200 shadow-lg shadow-black/20">
            Claim your pilot slot <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ===================== INTEGRATED ECOSYSTEM ===================== */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Visual panel (self-contained, no external assets) */}
            <FadeIn>
              <div className="relative">
                <div className="rounded-2xl bg-gradient-to-br from-navy to-[#06304f] p-7 md:p-9 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-cream/70 text-xs font-bold tracking-[0.14em] uppercase">Revenue Cycle · Contractual targets</span>
                    <span className="flex items-center gap-1.5 text-emerald text-xs font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" /> In writing</span>
                  </div>
                  <div className="space-y-5">
                    {[
                      { k: 'Clean claims', v: '95%+', w: '95%', c: 'bg-emerald' },
                      { k: 'Collected of billed', v: '96%+', w: '96%', c: 'bg-mint' },
                      { k: 'Denials worked', v: '<5%', w: '22%', c: 'bg-royal' },
                      { k: 'Days in A/R', v: '<30', w: '40%', c: 'bg-cream' },
                    ].map((r) => (
                      <div key={r.k}>
                        <div className="flex justify-between text-sm text-cream/85 mb-1.5"><span>{r.k}</span><span className="font-semibold text-white">{r.v}</span></div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden"><div className={`h-full rounded-full ${r.c}`} style={{ width: r.w }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* floating factual card (no fabricated numbers) */}
                <div className="absolute -bottom-6 -right-3 sm:-right-6 bg-white/90 backdrop-blur rounded-xl shadow-xl border border-gray/15 p-5 max-w-[15rem]">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="h-5 w-5 text-emerald" />
                    <span className="text-xs font-bold tracking-[0.12em] text-navy uppercase">Performance in writing</span>
                  </div>
                  <p className="text-xs text-gray leading-relaxed">Clean-claim, denial, and A/R targets committed in your agreement — no setup fees, no long-term lock-in.</p>
                </div>
              </div>
            </FadeIn>

            {/* Copy */}
            <div>
              <FadeIn>
                <p className="text-xs font-bold tracking-[0.16em] text-teal uppercase mb-3">Aethera Architecture</p>
                <h2 className="font-jakarta font-bold text-navy text-3xl md:text-4xl tracking-tight mb-8 leading-tight">
                  An integrated ecosystem for practice health
                </h2>
              </FadeIn>
              <div className="space-y-7">
                {architecture.map((a, i) => (
                  <FadeIn key={a.title} delay={i * 0.1}>
                    <div className="flex gap-5 group">
                      <span className="flex-shrink-0 h-12 w-12 rounded-full border border-gray/25 flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-white transition-colors">{a.icon}</span>
                      <div>
                        <h3 className="font-jakarta font-bold text-navy text-lg mb-1.5">{a.title}</h3>
                        <p className="text-gray leading-relaxed">{a.desc}</p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
              <FadeIn delay={0.3}>
                <div className="mt-9 pt-7 border-t border-gray/15">
                  <Link prefetch={false} href="/about" className="inline-flex items-center gap-2 text-teal font-semibold hover:text-navy transition-colors">
                    How we work <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SERVICES ===================== */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold tracking-[0.16em] text-teal uppercase mb-3">Our services</p>
            <h2 className="font-jakarta font-bold text-navy text-3xl md:text-4xl tracking-tight mb-3">Comprehensive revenue cycle management</h2>
            <p className="text-gray">We handle every step of medical billing so you can focus on what matters most — patient care.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <FadeIn key={index} delay={index * 0.05}>
                <ServiceCard icon={service.icon} title={service.title} description={service.description} href={service.href} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SPECIALTIES ===================== */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold tracking-[0.16em] text-teal uppercase mb-3">Specialties</p>
            <h2 className="font-jakarta font-bold text-navy text-3xl md:text-4xl tracking-tight mb-3">Billing built for your specialty</h2>
            <p className="text-gray">Specialized teams that understand the unique billing requirements of each medical field.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {specialties.map((specialty, index) => (
              <FadeIn key={index} delay={index * 0.04}>
                <span className="bg-cream text-teal border border-teal/15 px-4 py-2 rounded-full text-sm font-medium">{specialty}</span>
              </FadeIn>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link prefetch={false} href="/specialties" className="text-teal font-semibold hover:text-navy transition-colors">View all specialties we serve &rarr;</Link>
          </div>
        </div>
      </section>

      {/* ===================== ROI CALCULATOR ===================== */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-ink via-navy to-[#06304f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.25] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(120,160,200,0.4) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block bg-mint/15 border border-mint/40 text-mint text-xs font-bold tracking-[0.14em] uppercase px-4 py-1.5 rounded-full mb-4">Revenue calculator</span>
            <h2 className="font-jakarta font-bold text-white text-3xl md:text-4xl tracking-tight mb-3">Calculate your recovery potential</h2>
            <p className="text-cream/80 max-w-2xl mx-auto">See how much additional revenue Aethera could recover for your practice. Adjust the inputs below to match your current situation.</p>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* ===================== EXPLORE RESOURCES ===================== */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-[0.16em] text-teal uppercase mb-3">Explore Aethera</p>
              <h2 className="font-jakarta font-bold text-navy text-3xl md:text-4xl tracking-tight">Everything you need to decide</h2>
              <p className="text-gray mt-3 max-w-2xl mx-auto">Case studies. A live billing dashboard. Your payers. Your EHR. And a free assessment to start.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { href: '/case-studies', label: 'Case Studies', title: 'Case Studies by Specialty', desc: 'Illustrative examples of how our process tackles common billing challenges — by specialty, challenge, and outcome.', cta: 'Read Case Studies', accent: 'text-teal', border: 'border-teal' },
              { href: '/free-assessment', label: 'Free Assessment', title: 'See What Your Practice Is Missing', desc: 'A no-obligation revenue cycle audit identifying denial leakage, AR gaps, and undercoding. Delivered in 5 business days.', cta: 'Get Free Assessment', accent: 'text-emerald', border: 'border-emerald' },
              { href: '/for-billing-companies', label: 'For Billing Companies', title: 'Your White-Label Back Office', desc: 'Own the client relationship and your brand. We run eligibility, claims, payment posting, AR follow-up, and denials behind it.', cta: 'See the Partnership', accent: 'text-teal', border: 'border-navy' },
              { href: '/integrations', label: 'EHR Integrations', title: 'Works With Your Current System', desc: 'Epic, Cerner, athenahealth, eClinicalWorks, Kareo, and 45+ more. Setup in 1-4 weeks, zero workflow disruption.', cta: 'View Integrations', accent: 'text-teal', border: 'border-teal' },
              { href: '/payers', label: 'Payer Network', title: '900+ Insurers We Work With', desc: 'From Medicare and Medicaid to regional Blues plans and workers comp carriers. We know your payers’ rules cold.', cta: 'See Payer Network', accent: 'text-teal', border: 'border-navy' },
              { href: '/tools', label: 'Free Tools', title: 'Denial Lookup & AR Calculators', desc: 'A searchable CARC/RARC denial-code library, clean-claim scorecard, and AR cost calculator — free for any billing team.', cta: 'Open Free Tools', accent: 'text-emerald', border: 'border-emerald' },
            ].map((card, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <Link prefetch={false} href={card.href} className={`group block bg-white rounded-2xl p-6 border-2 ${card.border} hover:shadow-lg transition-all duration-200 h-full`}>
                  <span className={`text-xs font-bold uppercase tracking-[0.12em] ${card.accent}`}>{card.label}</span>
                  <h3 className="font-jakarta text-lg font-bold text-navy mt-2 mb-2 group-hover:text-teal transition-colors">{card.title}</h3>
                  <p className="text-gray text-sm leading-relaxed mb-4">{card.desc}</p>
                  <span className={`text-sm font-semibold ${card.accent} group-hover:underline`}>{card.cta} &rarr;</span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <CTABanner title="Ready to Maximize Your Revenue?" buttonText="Schedule a Meeting" href="/schedule" />
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.16em] text-teal uppercase mb-3">FAQ</p>
            <h2 className="font-jakarta font-bold text-navy text-3xl md:text-4xl tracking-tight">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FadeIn key={index} delay={index * 0.06}>
                <div className="bg-cream rounded-xl p-6 border border-gray/12">
                  <h3 className="font-jakarta text-lg font-bold text-navy mb-2">{faq.question}</h3>
                  <p className="text-gray leading-relaxed">{faq.answer}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link prefetch={false} href="/faq" className="text-teal font-semibold hover:text-navy transition-colors">View all FAQs &rarr;</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
