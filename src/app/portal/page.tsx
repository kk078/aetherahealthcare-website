import Link from 'next/link';
import { BarChart3, Shield, Smartphone, TrendingUp, Eye, Bell, Lock, Users, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'Provider Portal | Real-Time Billing Dashboard | Aethera Healthcare',
  description: 'The Aethera Provider Portal gives you 24/7 real-time visibility into every claim, payment, denial, and KPI — from any device. See a live demo.',
};

const features = [
  {
    icon: <BarChart3 className="h-7 w-7" />,
    title: 'Claims Dashboard',
    description: 'Real-time claim status across all payers. Color-coded by status: submitted, pending, paid, or denied. Filter by date, provider, payer, or service type in seconds.',
  },
  {
    icon: <TrendingUp className="h-7 w-7" />,
    title: 'Revenue Analytics',
    description: 'Interactive charts showing collections by month, payer, and provider. Compare current performance against prior periods and specialty benchmarks.',
  },
  {
    icon: <Bell className="h-7 w-7" />,
    title: 'Denial Management Center',
    description: 'Every denied claim categorized by reason, with appeal status tracking and one-click appeal initiation. Never lose track of a denial again.',
  },
  {
    icon: <Eye className="h-7 w-7" />,
    title: 'AR Aging Report',
    description: 'Live accounts receivable aging by 0–30, 31–60, 61–90, and 90+ day buckets. Drill down by payer, provider, or claim type.',
  },
  {
    icon: <CheckCircle className="h-7 w-7" />,
    title: 'Payment Posting Log',
    description: 'Itemized ERA/EOB payment posting with automatic reconciliation and variance flagging so nothing slips through.',
  },
  {
    icon: <Shield className="h-7 w-7" />,
    title: 'KPI Benchmark Tracker',
    description: 'Live tracking of your clean claim rate, denial rate, net collection rate, and AR days vs. Aethera\'s guaranteed performance benchmarks.',
  },
];

const securityItems = [
  { icon: <Lock className="h-6 w-6" />, title: 'Role-Based Access', desc: 'Assign different access levels to physicians, office managers, and billing staff.' },
  { icon: <Shield className="h-6 w-6" />, title: 'Multi-Factor Auth', desc: 'Every login secured with MFA — no exceptions, no workarounds.' },
  { icon: <Eye className="h-6 w-6" />, title: 'AES-256 Encryption', desc: 'All data encrypted at rest and in transit with bank-level security standards.' },
];

const mobileFeatures = [
  'Check claim status from the exam room between patients',
  'Review daily collections on the go',
  'Approve appeal submissions from your phone',
  'Receive push alerts for large payments or urgent denials',
  'Export reports as PDF directly to your email',
];

export default function Portal() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-6">
              Your Revenue, In Real Time
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-xl text-cream max-w-3xl mx-auto mb-10">
              The Aethera Provider Portal gives you 24/7 visibility into every claim, payment, and performance metric — from any device, at any time.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link prefetch={false} href="/free-assessment" className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors duration-300">
                Request Portal Demo
              </Link>
              <Link prefetch={false} href="/contact" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full transition-colors duration-300">
                Schedule Consultation
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="PORTAL FEATURES"
            title="Everything You Need to See"
            description="Six core views that give you complete command of your revenue cycle — without opening a single spreadsheet."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-6 border border-gray/10 shadow-sm h-full">
                  <div className="text-teal mb-4">{f.icon}</div>
                  <h3 className="text-lg font-bold text-navy mb-2">{f.title}</h3>
                  <p className="text-gray text-sm">{f.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Mockup */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="PORTAL PREVIEW"
            title="A Closer Look at Your Dashboard"
            description="Representative view of the Aethera Provider Portal. Your actual dashboard reflects your live data."
          />
          <FadeIn delay={0.2}>
            <div className="mt-12 rounded-2xl overflow-hidden border border-gray/20 shadow-2xl">
              {/* Browser chrome */}
              <div className="bg-gray/10 border-b border-gray/20 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="ml-4 flex-grow bg-white rounded px-3 py-1 text-xs text-gray">portal.aetherahealthcare.com</div>
              </div>

              {/* Portal UI */}
              <div className="flex h-auto min-h-[520px]">
                {/* Sidebar */}
                <div className="bg-navy w-52 flex-shrink-0 p-4 hidden md:block">
                  <div className="flex items-center mb-8 mt-2">
                    <div className="bg-gradient-to-r from-teal to-mint rounded w-7 h-7 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">A</span>
                    </div>
                    <span className="ml-2 text-white font-bold text-sm font-playfair">Aethera</span>
                  </div>
                  {['Dashboard','Claims','Payments','Denials','AR Report','Analytics','Settings'].map((item, i) => (
                    <div key={i} className={`flex items-center px-3 py-2.5 rounded-lg mb-1 text-sm ${i === 0 ? 'bg-teal text-white font-semibold' : 'text-gray hover:bg-white/5 cursor-pointer'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-3 ${i === 0 ? 'bg-mint' : 'bg-gray/40'}`}></div>
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-grow bg-cream p-6 overflow-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-navy font-playfair">Dashboard</h2>
                      <p className="text-xs text-gray">May 2026 · All Providers</p>
                    </div>
                    <span className="text-xs bg-teal/10 text-teal border border-teal/20 px-3 py-1 rounded-full font-medium">Live Data</span>
                  </div>

                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'Clean Claim Rate', value: '97.2%', change: '+8.1%', up: true },
                      { label: 'Denial Rate', value: '3.1%', change: '−8.7%', up: true },
                      { label: 'Net Collection Rate', value: '96.8%', change: '+4.2%', up: true },
                      { label: 'Days in AR', value: '24.3', change: '−22.7 days', up: true },
                      { label: 'Monthly Collections', value: '$284,500', change: '+$51,200', up: true },
                      { label: 'Appeals Won', value: '71.4%', change: '+18.6%', up: true },
                    ].map((kpi, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 border border-gray/10">
                        <p className="text-xs text-gray mb-1">{kpi.label}</p>
                        <p className="text-xl font-bold text-navy">{kpi.value}</p>
                        <p className={`text-xs font-semibold mt-1 ${kpi.up ? 'text-teal' : 'text-red-500'}`}>
                          {kpi.change} vs prior period
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Bar Chart */}
                  <div className="bg-white rounded-xl p-4 border border-gray/10">
                    <p className="text-sm font-bold text-navy mb-4">Monthly Collections (6 months)</p>
                    <div className="flex items-end gap-3 h-28">
                      {[
                        { month: 'Dec', h: 55, val: '$233K' },
                        { month: 'Jan', h: 62, val: '$249K' },
                        { month: 'Feb', h: 58, val: '$241K' },
                        { month: 'Mar', h: 70, val: '$261K' },
                        { month: 'Apr', h: 75, val: '$271K' },
                        { month: 'May', h: 100, val: '$285K' },
                      ].map((bar, i) => (
                        <div key={i} className="flex flex-col items-center flex-1">
                          <span className="text-xs text-gray mb-1">{bar.val}</span>
                          <div
                            className={`w-full rounded-t-md ${i === 5 ? 'bg-teal' : 'bg-teal/30'}`}
                            style={{ height: `${bar.h}%` }}
                          ></div>
                          <span className="text-xs text-gray mt-1">{bar.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray mt-3">Portal Preview — Representative Screenshot · Your data will populate automatically</p>
          </FadeIn>
        </div>
      </section>

      {/* Security */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="SECURITY" title="Built to Protect Your Data" description="Every access point is secured with healthcare-grade security protocols." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {securityItems.map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-6 border border-gray/10 flex items-start gap-4 h-full">
                  <div className="text-teal flex-shrink-0 mt-1">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-navy mb-1">{item.title}</h3>
                    <p className="text-gray text-sm">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div className="flex items-center mb-4">
                <Smartphone className="h-7 w-7 text-teal mr-3" />
                <h2 className="text-3xl font-bold text-navy font-playfair">Fully Mobile</h2>
              </div>
              <p className="text-gray mb-6">The Aethera Portal is fully responsive — every feature available on your phone or tablet, no app download required.</p>
              <div className="space-y-3">
                {mobileFeatures.map((f, i) => (
                  <div key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <p className="text-gray text-sm">{f}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-gradient-to-br from-navy to-teal rounded-2xl p-8 text-white text-center">
                <Users className="h-12 w-12 text-mint mx-auto mb-4" />
                <h3 className="text-2xl font-bold font-playfair mb-3">Ready to See It Live?</h3>
                <p className="text-cream mb-6">We'll walk you through a live demo of the portal using sample data from your specialty.</p>
                <Link prefetch={false} href="/free-assessment" className="inline-flex items-center bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors duration-300">
                  Request Your Demo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
