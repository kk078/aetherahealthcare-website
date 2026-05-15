import Head from 'next/head';
import { Phone, Mail, Clock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';
import ContactTabs from '@/components/ui/ContactTabs';

export const metadata = {
  title: "Contact Us | Free Consultation | Aethera Healthcare Solutions",
  description: "Get in touch with Aethera Healthcare Solutions for a free consultation. Contact us by phone at +1 (863) 694-0325 or email at info@aetherahealthcare.com.",
};

export default function Contact() {

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ContactPage",
              "name": "Contact Aethera Healthcare Solutions",
              "description": "Get in touch with Aethera Healthcare Solutions for a free consultation. Contact us by phone at +1 (863) 694-0325 or email at info@aetherahealthcare.com.",
              "url": "https://aetherahealthcare-website.pages.dev/contact",
              "publisher": {
                "@type": "Organization",
                "name": "Aethera Healthcare Solutions",
                "url": "https://aetherahealthcare-website.pages.dev",
                "logo": "https://aetherahealthcare-website.pages.dev/logo.png"
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
              "url": "https://aetherahealthcare-website.pages.dev",
              "logo": "https://aetherahealthcare-website.pages.dev/logo.png",
              "contactPoint": [{
                "@type": "ContactPoint",
                "telephone": "+1-863-694-0325",
                "contactType": "customer service",
                "email": "info@aetherahealthcare.com",
                "availableLanguage": "English",
                "contactOption": "TollFree"
              }, {
                "@type": "ContactPoint",
                "email": "support@aetherahealthcare.com",
                "contactType": "technical support"
              }],
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Lakeland",
                "addressRegion": "FL",
                "postalCode": "33801",
                "streetAddress": "PO Box 1234"
              },
              "email": "info@aetherahealthcare.com",
              "telephone": "+1-863-694-0325"
            })
          }}
        />
      </Head>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-playfair mb-6">
                Contact Us
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Ready to maximize your revenue and minimize your burden? Get in touch with our team today.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

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
              <div className="bg-cream rounded-2xl p-8 h-full">
                <h3 className="text-2xl font-bold text-navy mb-6">Contact Information</h3>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-teal text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-navy">Phone</h4>
                      <p className="text-gray">+1 (863) 694-0325</p>
                      <p className="text-gray text-sm">Monday-Friday, 9:00 AM - 6:00 PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-teal text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-navy">Email</h4>
                      <p className="text-gray">info@aetherahealthcare.com</p>
                      <p className="text-gray">support@aetherahealthcare.com</p>
                      <p className="text-gray">aetherahealthcare.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-teal text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-navy">Business Hours</h4>
                      <p className="text-gray">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                      <p className="text-gray">Saturday - Sunday: Closed</p>
                    </div>
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
                <h3 className="text-lg font-bold text-navy mb-2">What's the best way to reach you?</h3>
                <p className="text-gray">Call us at +1 (863) 694-0325 during business hours, or email info@aetherahealthcare.com anytime. We'll get back to you within one business day.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}