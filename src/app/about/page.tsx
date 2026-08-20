import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import RcmHeroBand from '@/components/ui/RcmHeroBand';

export const metadata = {
  title: { absolute: 'About Aethera Healthcare Solutions | Built by an Operator, Run in the Open' },
  description: 'Aethera Healthcare Solutions was founded in 2026 by Kiran Kumar Pedapudi. Automation with hard boundaries, humans where judgment matters, and an audit trail on everything — delivered from India at a cost structure that changes the economics for small and mid-size billing operations.',
};

const principles = [
  {
    title: 'Deterministic first.',
    description: 'Software parses payer responses by the book. Unknowns route to humans. Nothing is guessed.',
  },
  {
    title: 'Real numbers only.',
    description: "We publish no metric we can't defend — including on this website.",
  },
  {
    title: 'Compliance as architecture.',
    description: 'HIPAA safeguards, US-resident data, and VDI-only access are built into how we operate, not bolted on for the sales call.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AboutPage",
              "name": "About Aethera Healthcare Solutions",
              "description": "Aethera Healthcare Solutions was founded in 2026 by Kiran Kumar Pedapudi — automation with hard boundaries, humans where judgment matters, and an audit trail on everything.",
              "url": "https://aetherahealthcare.com/about",
              "publisher": {
                "@type": "Organization",
                "name": "Aethera Healthcare Solutions",
                "url": "https://aetherahealthcare.com",
                "logo": "https://aetherahealthcare.com/logo.png"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Aethera Healthcare Solutions",
              "alternateName": "Aethera",
              "description": "AI-first revenue cycle back office for US healthcare providers, delivered from India with hard AI boundaries and a full audit trail.",
              "foundingDate": "2026",
              "founder": {
                "@type": "Person",
                "name": "Kiran Kumar Pedapudi"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-813-519-4640",
                "contactType": "customer service",
                "email": "info@aetherahealthcare.com"
              },
              "sameAs": [
                "https://www.linkedin.com/company/aethera-healthcare-solutions"
              ]
            })
          }}
        />
      </>
      <Navbar />

      <RcmHeroBand
        eyebrow="About Aethera"
        title="Built by an operator, run in the open"
        primary={{ href: '/free-assessment', label: 'Start the Free 50-Claim Pilot' }}
        secondary={{ href: '/contact', label: 'Contact Us' }}
        chips={['Founder-led', 'Deterministic first', 'Compliance as architecture']}
      />

      {/* Founder intro */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-lg md:text-xl text-navy leading-relaxed">
              Aethera was founded in 2026 by <strong>Kiran Kumar Pedapudi</strong> [1&ndash;2 sentence bio:
              background, why RCM &mdash; KIRAN TO SUPPLY].
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Why we exist */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold text-navy font-jakarta mb-6">Why we exist</h2>
            <p className="text-gray text-lg leading-relaxed">
              US practices lose billions every year to preventable denials — half of them decided before the
              patient even reaches the front desk. The industry&apos;s answer has been cheaper labor or louder
              AI promises. Ours is different: automation with hard boundaries, humans where judgment matters,
              and an audit trail on everything, delivered from India at a cost structure that changes the
              economics for small and mid-size billing operations.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* How we work */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold tracking-[0.16em] text-teal uppercase mb-3">How we work</p>
            <h2 className="font-jakarta font-bold text-navy text-3xl md:text-4xl tracking-tight">Three principles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {principles.map((p, index) => (
              <FadeIn key={p.title} delay={index * 0.1}>
                <div className="bg-cream rounded-xl p-7 border border-gray/10 h-full">
                  <h3 className="text-xl font-bold text-navy mb-3 italic">{p.title}</h3>
                  <p className="text-gray leading-relaxed">{p.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Where we are */}
      <section className="py-16 md:py-20 bg-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white font-jakarta mb-6">Where we are</h2>
            <p className="text-cream/85 text-lg leading-relaxed">
              Registered in India ([City, India]), serving US clients on US hours through our +1 813 number.
              Founder-led: when you call, you get the person who signs the quality bar.
            </p>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
