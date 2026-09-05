import Link from 'next/link';
import { Calendar, Mail, Clock, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';
import ContactTabs from '@/components/ui/ContactTabs';
import RcmHeroBand from '@/components/ui/RcmHeroBand';

export const metadata = {
  title: { absolute: "Contact Us | Free Consultation | Aethera Healthcare Solutions" },
  description: "Get in touch with Aethera Healthcare Solutions for a free consultation. Submit an email inquiry or schedule a meeting directly with our team.",
};

export default function Contact() {

  return (
    <div className="min-h-screen flex flex-col">
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ContactPage",
              "name": "Contact Aethera Healthcare Solutions",
              "description": "Get in touch with Aethera Healthcare Solutions for a free consultation. Submit an email inquiry or schedule a meeting directly with our team.",
              "url": "https://aetherahealthcare.com/contact",
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
              "url": "https://aetherahealthcare.com",
              "logo": "https://aetherahealthcare.com/logo.png",
              "contactPoint": [{
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://aetherahealthcare.com/contact",
                "availableLanguage": "English"
              }]
            })
          }}
        />
      </>
      <Navbar />

      <RcmHeroBand
        eyebrow="Contact"
        title="Let's maximize your revenue"
        subtitle="Ready to maximize your revenue and minimize your burden? Submit an email inquiry or schedule a direct consultation with our revenue cycle leadership."
        primary={{ href: '/free-assessment', label: 'Get a Free Assessment' }}
        chips={['Free consultation', '5-day turnaround', 'No obligation']}
      />

      {/* Contact Information */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="GET IN TOUCH"
            title="We're Here to Help"
            description="Reach out to our team for a free consultation or if you have any questions about our services."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
            <FadeIn>
              <div className="bg-cream rounded-2xl p-8 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-navy mb-6">Ways to Connect</h3>

                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-bold text-navy">Schedule a Meeting</h4>
                        <p className="text-gray text-sm mt-1">
                          Book a 1-on-1 video or phone consultation directly with Kiran at a time that works best for your schedule.
                        </p>
                        <Link
                          prefetch={false}
                          href="/schedule"
                          className="inline-flex items-center gap-1.5 mt-2.5 px-4 py-1.5 bg-navy hover:bg-teal text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                        >
                          Pick a Time on Calendar &rarr;
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-bold text-navy">Online Email Request</h4>
                        <p className="text-gray text-sm mt-1">
                          Submit your practice details or billing questions using our form. Kiran and our senior billing team personally review every submission.
                        </p>
                        <p className="text-teal font-semibold text-xs mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Direct response guaranteed within 1 business day
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-teal text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-bold text-navy">Operating Hours</h4>
                        <p className="text-gray text-sm">Monday &ndash; Friday: 9:00 AM &ndash; 6:00 PM EST</p>
                        <p className="text-gray text-xs mt-0.5">Weekend urgent inquiries triaged on-demand</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray/15">
                  <div className="bg-white rounded-xl p-4 border border-teal/20 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-teal shrink-0" />
                    <p className="text-xs text-navy leading-snug">
                      <strong>Zero Sales Spam:</strong> You will interface directly with revenue cycle specialists and practice leadership.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <ContactTabs />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="CONTACT FAQ"
            title="Frequently Asked Questions"
            description="Quick answers to common questions about contacting us."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <FadeIn>
              <div className="bg-cream rounded-xl p-6">
                <h3 className="text-lg font-bold text-navy mb-2">How quickly do you respond to inquiries?</h3>
                <p className="text-gray">We respond to all inquiries within 24 business hours.</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="bg-cream rounded-xl p-6">
                <h3 className="text-lg font-bold text-navy mb-2">What information should I prepare?</h3>
                <p className="text-gray">For a consultation, please have your practice information, current billing challenges, and payer mix ready to discuss.</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-cream rounded-xl p-6">
                <h3 className="text-lg font-bold text-navy mb-2">Do you offer virtual consultations?</h3>
                <p className="text-gray">Yes, we offer both phone and video consultations for your convenience.</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="bg-cream rounded-xl p-6">
                <h3 className="text-lg font-bold text-navy mb-2">What&apos;s the best way to reach you?</h3>
                <p className="text-gray">Submit an email inquiry through our contact form or book a consultation via our meeting scheduler. Kiran and our senior billing team respond within one business day.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}