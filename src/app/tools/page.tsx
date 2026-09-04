import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import RcmHeroBand from '@/components/ui/RcmHeroBand';
import { Search, ClipboardCheck, Calculator, ArrowRight, CalendarClock, ListChecks, TrendingDown, Gauge, BookOpen } from 'lucide-react';

export const metadata = {
  title: { absolute: 'Free Medical Billing & AR Tools | Aethera Healthcare Solutions' },
  description:
    'Free tools for billing and AR teams: a CARC/RARC denial-code lookup, a clean-claim readiness scorecard, and an A/R days cost calculator. No login required.',
};

const tools = [
  {
    href: '/tools/denial-code-lookup',
    icon: Search,
    name: 'Denial Code Lookup',
    desc: 'Search CARC/RARC denial codes and get plain-English reasons, how to work each one, and how to prevent it.',
    tag: 'Reference',
  },
  {
    href: '/tools/clean-claim-scorecard',
    icon: ClipboardCheck,
    name: 'Clean-Claim Scorecard',
    desc: 'Score your front-end, coding, and submission workflow against 14 controls — and see which denials each gap invites.',
    tag: 'Self-assessment',
  },
  {
    href: '/tools/ar-cost-calculator',
    icon: Calculator,
    name: 'A/R Days Cost Calculator',
    desc: 'See the cash tied up in slow A/R and the yearly carrying cost of staying above your target days-in-A/R.',
    tag: 'Calculator',
  },
  {
    href: '/tools/timely-filing-calculator',
    icon: CalendarClock,
    name: 'Timely Filing Calculator',
    desc: 'Enter a date of service and the payer filing limit to get the exact submission deadline, days remaining, and a risk flag.',
    tag: 'Calculator',
  },
  {
    href: '/tools/eligibility-checklist',
    icon: ListChecks,
    name: 'Eligibility & Prior-Auth Checklist',
    desc: 'Score your pre-visit verification against the checks that prevent CO-27, CO-197, and eligibility denials before they happen.',
    tag: 'Self-assessment',
  },
  {
    href: '/tools/denial-cost-calculator',
    icon: TrendingDown,
    name: 'Denial Cost Calculator',
    desc: 'See what denials really cost — lost reimbursement plus rework — per week, month, and year, and the combined annual impact.',
    tag: 'Calculator',
  },
  {
    href: '/tools/rvu-calculator',
    icon: Gauge,
    name: 'RVU Payment Calculator',
    desc: 'Turn work, PE, and malpractice RVUs into an estimated Medicare allowed amount using GPCI and the conversion factor.',
    tag: 'Calculator',
  },
  {
    href: '/tools/payer-provider-manuals',
    icon: BookOpen,
    name: 'Payer Manual & Policy Finder',
    desc: 'Jump straight to provider manuals, medical/payment policies, credentialing, and eligibility pages for 200+ payers, Medicaid programs, and Medicare MACs.',
    tag: 'Reference',
  },
];

export default function ToolsHub() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <RcmHeroBand
        eyebrow="Free · No login"
        title="Free AR & medical-billing tools"
        subtitle="Practical tools our own RCM team uses every day — open to anyone working denials, clean claims, timely filing, and A/R."
        primary={{ href: '#tools', label: 'Browse the Tools' }}
        secondary={{ href: '/free-assessment', label: 'Get a Free Assessment' }}
        chips={['8 free tools', 'No login', 'Built by billers']}
      />

      <section id="tools" className="py-14 md:py-20 bg-cream flex-1 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((t, i) => (
              <FadeIn key={t.href} delay={i * 0.1}>
                <Link prefetch={false} href={t.href} className="group block h-full bg-white rounded-2xl border border-gray/15 p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-teal/10 text-teal group-hover:bg-teal group-hover:text-white transition-colors">
                      <t.icon className="h-6 w-6" />
                    </span>
                    <span className="text-[11px] font-semibold text-gray uppercase tracking-widest">{t.tag}</span>
                  </div>
                  <h2 className="text-lg font-bold text-navy mb-2">{t.name}</h2>
                  <p className="text-sm text-gray leading-relaxed mb-4">{t.desc}</p>
                  <span className="inline-flex items-center text-teal font-semibold text-sm group-hover:text-navy transition-colors">
                    Open tool <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray mb-4">Looking for the payer reference? Browse timely-filing limits, payer IDs, and portals.</p>
            <Link prefetch={false} href="/payers/directory" className="inline-flex items-center text-teal hover:text-navy font-semibold">
              Open the Payer Directory <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white border-t border-gray/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-navy mb-2">Rather have us run the whole thing?</h2>
          <p className="text-gray mb-6 max-w-2xl mx-auto">
            These tools show where revenue leaks. Aethera&apos;s team plugs the leaks — coding, claims, denials, and A/R follow-up end to end.
          </p>
          <Link prefetch={false} href="/free-assessment" className="inline-block bg-teal hover:bg-navy text-white font-semibold py-3 px-6 rounded-full transition-colors text-sm">
            Get a Free Assessment
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
