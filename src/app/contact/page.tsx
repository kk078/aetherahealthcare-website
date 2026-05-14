'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';
import ContactForm from '@/components/ui/ContactForm';

export default function Contact() {
  const [activeTab, setActiveTab] = useState('contact');

  return (
    <div className="min-h-screen flex flex-col">
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
                      <p className="text-gray">(800) 555-1234</p>
                      <p className="text-gray text-sm">Monday-Friday, 8:00 AM - 6:00 PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-teal text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-navy">Email</h4>
                      <p className="text-gray">info@aetherahealthcare.com</p>
                      <p className="text-gray">billing@aetherahealthcare.com</p>
                      <p className="text-gray">support@aetherahealthcare.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-teal text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-navy">Address</h4>
                      <p className="text-gray">123 Healthcare Drive</p>
                      <p className="text-gray">Suite 100</p>
                      <p className="text-gray">Baltimore, MD 21201</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-teal text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-navy">Business Hours</h4>
                      <p className="text-gray">Monday - Friday: 8:00 AM - 6:00 PM EST</p>
                      <p className="text-gray">Saturday - Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray/10">
                <div className="flex border-b border-gray/20 mb-6">
                  <button
                    className={`py-2 px-4 font-medium ${activeTab === 'contact' ? 'text-teal border-b-2 border-teal' : 'text-gray'}`}
                    onClick={() => setActiveTab('contact')}
                  >
                    Send Message
                  </button>
                  <button
                    className={`py-2 px-4 font-medium ${activeTab === 'schedule' ? 'text-teal border-b-2 border-teal' : 'text-gray'}`}
                    onClick={() => setActiveTab('schedule')}
                  >
                    Schedule Consultation
                  </button>
                </div>

                {activeTab === 'contact' ? (
                  <ContactForm />
                ) : (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-navy">Schedule a Free Consultation</h3>
                    <p className="text-gray">
                      Book a 30-minute consultation with our revenue cycle experts to discuss how we can optimize your billing processes.
                    </p>
                    <div className="bg-cream rounded-lg p-4">
                      <h4 className="font-bold text-navy mb-2">What to expect:</h4>
                      <ul className="space-y-2 text-gray text-sm">
                        <li className="flex items-start">
                          <span className="text-teal mr-2">•</span>
                          <span>Review of your current billing challenges</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-teal mr-2">•</span>
                          <span>Overview of our services and approach</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-teal mr-2">•</span>
                          <span>Discussion of potential improvements</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-teal mr-2">•</span>
                          <span>Next steps and implementation timeline</span>
                        </li>
                      </ul>
                    </div>
                    <button className="w-full bg-mint hover:bg-teal text-navy font-bold py-3 px-6 rounded-full transition-colors duration-300">
                      Schedule Consultation
                    </button>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="OUR LOCATION"
            title="Visit Our Office"
            description="We're located in the heart of Baltimore's medical district for easy access."
          />

          <FadeIn delay={0.2}>
            <div className="mt-16 bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-96 bg-gray/20 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-teal mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-navy mb-2">Interactive Map</h3>
                  <p className="text-gray">123 Healthcare Drive, Baltimore, MD 21201</p>
                  <button className="mt-4 bg-teal hover:bg-navy text-white font-medium py-2 px-6 rounded-full transition-colors">
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
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
                <p className="text-gray">We typically respond to all inquiries within 2 business hours during our regular business hours.</p>
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
                <h3 className="text-lg font-bold text-navy mb-2">Can I speak with a specialist?</h3>
                <p className="text-gray">Absolutely. We'll connect you with a specialist familiar with your medical specialty.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}