'use client';

import { useState } from 'react';
import ContactForm from '@/components/ui/ContactForm';

export default function ContactTabs() {
  const [activeTab, setActiveTab] = useState('contact');

  return (
    <div className="bg-white dark:bg-navy rounded-2xl shadow-lg p-8 border border-gray/10 dark:border-gray/20">
      <div className="flex border-b border-gray/20 dark:border-gray/30 mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'contact' ? 'text-teal dark:text-mint border-b-2 border-teal dark:border-mint' : 'text-gray dark:text-cream'}`}
          onClick={() => setActiveTab('contact')}
        >
          Send Message
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'schedule' ? 'text-teal dark:text-mint border-b-2 border-teal dark:border-mint' : 'text-gray dark:text-cream'}`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule Consultation
        </button>
      </div>

      {activeTab === 'contact' ? (
        <ContactForm />
      ) : (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-navy dark:text-cream">Schedule a Free Consultation</h3>
          <p className="text-gray dark:text-cream">
            Book a 30-minute consultation with our revenue cycle experts to discuss how we can optimize your billing processes.
          </p>
          <div className="bg-cream dark:bg-navy rounded-lg p-4 border border-gray/10 dark:border-gray/20">
            <h4 className="font-bold text-navy dark:text-cream mb-2">What to expect:</h4>
            <ul className="space-y-2 text-gray dark:text-cream text-sm">
              <li className="flex items-start">
                <span className="text-teal dark:text-mint mr-2">•</span>
                <span>Review of your current billing challenges</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal dark:text-mint mr-2">•</span>
                <span>Overview of our services and approach</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal dark:text-mint mr-2">•</span>
                <span>Discussion of potential improvements</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal dark:text-mint mr-2">•</span>
                <span>Next steps and implementation timeline</span>
              </li>
            </ul>
          </div>
          <button className="w-full bg-mint hover:bg-teal dark:hover:bg-teal text-navy dark:text-cream font-bold py-3 px-6 rounded-full transition-colors duration-300">
            Schedule Consultation
          </button>
        </div>
      )}
    </div>
  );
}