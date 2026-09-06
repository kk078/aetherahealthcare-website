import Link from 'next/link';
import { BarChart3, Shield, Smartphone, TrendingUp, Eye, Bell, Lock, Users, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import InteractivePortalDemo from '@/components/ui/InteractivePortalDemo';

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

      <RcmHeroBand
        eyebrow="Provider Portal"
        title="Your revenue, in real time"
        subtitle="The Aethera Provider Portal gives you 24/7 visibility into every claim, payment, and performance metric — from any device, at any time."
        primary={{ href: '/free-assessment', label: 'Request Portal Demo' }}
        secondary={{ href: '/contact', label: 'Schedule Consultation' }}
        chips={['Live claims', 'Denial queue', 'A/R aging']}
      />

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
            label="LIVE CLIENT SANDBOX"
            title="Interactive Provider Portal Experience"
            description="Test-drive Aethera's 24/7 revenue command center. Switch between clinical specialties, inspect EDI 837P/835 transaction loops, simulate real-time remittances, and trigger AI appeal packages."
          />
          <FadeIn delay={0.2}>
            <div className="mt-12">
              <InteractivePortalDemo />
            </div>
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
                <h2 className="text-3xl font-bold text-navy font-jakarta">Fully Mobile</h2>
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
                <h3 className="text-2xl font-bold font-jakarta mb-3">Ready to See It Live?</h3>
                <p className="text-cream mb-6">We&apos;ll walk you through a live demo of the portal using sample data from your specialty.</p>
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
