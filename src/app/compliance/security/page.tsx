import Link from 'next/link';
import { Database, FileCheck, ShieldCheck, Globe, Bot, Milestone, Mail } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import RcmHeroBand from '@/components/ui/RcmHeroBand';

export const metadata = {
  title: 'Security & Compliance | Aethera Healthcare Solutions',
  description: "How Aethera protects PHI: US data residency, virtual-desktop-only offshore access, BAAs before any data moves, a written HIPAA program, offshore-restriction screening, and hard boundaries on what our AI is allowed to do.",
};

const sections = [
  {
    icon: <Database className="h-7 w-7" />,
    title: 'Data residency',
    body: 'PHI stays in US-based systems. Our India-based team accesses it only through virtual desktops with copy, download, print, and USB transfer disabled — by policy and by technology, not just by rule. Every session is logged, so access to a record is always attributable to a specific person at a specific time.',
  },
  {
    icon: <FileCheck className="h-7 w-7" />,
    title: 'BAAs',
    body: "We sign a Business Associate Agreement with every client before any PHI moves — ours or yours. The same requirement extends down our vendor chain: every subcontractor who could touch PHI signs a BAA too, and we maintain a register of every agreement in force.",
  },
  {
    icon: <ShieldCheck className="h-7 w-7" />,
    title: 'HIPAA program',
    body: 'Written privacy, security, and breach-notification policies (POL-01 through POL-14) govern how we operate. We run an annual security risk assessment, require workforce HIPAA training with signed attestations, and maintain an incident response plan that notifies affected clients within the timelines set in your BAA.',
  },
  {
    icon: <Globe className="h-7 w-7" />,
    title: 'Offshore restrictions',
    body: 'Some states restrict offshore handling of Medicaid or other state-program data — Florida, Wisconsin, Texas, Arizona, Ohio, Missouri, and New Jersey among them. We screen every engagement’s state and payer mix up front and carve out any restricted book of business before work begins, not after you ask.',
  },
  {
    icon: <Bot className="h-7 w-7" />,
    title: 'AI governance',
    body: 'Our AI never generates a billing code, a dollar amount, or a date of service. Deterministic software parses payer data first; AI assists with drafting and triage; a human reviews anything ambiguous. Every automated action is attributed and logged with the model version that produced it.',
  },
  {
    icon: <Milestone className="h-7 w-7" />,
    title: 'Roadmap',
    body: 'We are targeting SOC 2 Type I after our first client cohort, and our ISO 27001 program is underway in India. Neither is complete today — we’re telling you where we’re headed, not claiming a certification we don’t hold.',
  },
];

export default function SecurityCompliance() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <RcmHeroBand
        eyebrow="Security & Compliance"
        title="How we protect your data — offshore, transparently"
        subtitle="HIPAA-compliant architecture, US data residency, and a BAA before anything moves. Here's exactly how, with nothing rounded up."
        primary={{ href: '/free-assessment', label: 'Start the Free 50-Claim Pilot' }}
        secondary={{ href: '/contact', label: 'Contact Us' }}
        chips={['HIPAA-compliant architecture', 'BAA available', 'US data residency']}
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((s, index) => (
              <FadeIn key={s.title} delay={index * 0.08}>
                <div className="bg-cream rounded-2xl p-8 border border-gray/10 h-full">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-navy text-white mb-5">{s.icon}</span>
                  <h2 className="font-jakarta font-bold text-navy text-xl mb-3">{s.title}</h2>
                  <p className="text-gray leading-relaxed">{s.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center">
            <FadeIn>
              <Mail className="h-10 w-10 text-mint mx-auto mb-5" />
              <h2 className="text-2xl md:text-3xl font-bold text-white font-jakarta mb-4">
                Request our Security One-Pager and Offshore FAQ
              </h2>
              <p className="text-cream/85 max-w-xl mx-auto mb-8">
                A written summary of everything on this page — architecture, BAAs, offshore screening, and our
                certification roadmap — for your compliance or legal review.
              </p>
              <Link prefetch={false}
                href="/contact"
                className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
              >
                Request via Contact Form
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
