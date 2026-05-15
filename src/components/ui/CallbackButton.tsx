'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';

export default function CallbackButton() {
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bestTime: '',
  });

  const handleCallClick = () => {
    window.location.href = 'tel:+18636940325';
  };

  const handleRequestCallback = () => {
    // In a real implementation, you would send this data to your backend
    // For now, we'll just log it and close the popup
    console.log('Callback requested:', formData);
    setShowPopup(false);
    setFormData({ name: '', phone: '', bestTime: '' });
    alert('Thank you! We will call you back soon.');
  };

  return (
    <div className="fixed bottom-8 left-8 z-40">
      <button
        onClick={handleCallClick}
        className="bg-teal hover:bg-navy dark:hover:bg-teal text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
        aria-label="Request callback"
      >
        <Phone className="h-6 w-6" />
      </button>

      {showPopup && (
        <div className="absolute bottom-16 left-0 bg-white dark:bg-navy rounded-xl shadow-lg p-6 w-80 border border-gray/10 dark:border-gray/20">
          <h3 className="text-xl font-bold text-navy dark:text-cream mb-4">Request a Callback</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="callback-name" className="block text-gray dark:text-cream text-sm mb-1">
                Full Name
              </label>
              <input
                id="callback-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray/20 dark:border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal dark:bg-navy dark:text-cream"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="callback-phone" className="block text-gray dark:text-cream text-sm mb-1">
                Phone Number
              </label>
              <input
                id="callback-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray/20 dark:border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal dark:bg-navy dark:text-cream"
                placeholder="Your phone number"
              />
            </div>
            <div>
              <label htmlFor="callback-time" className="block text-gray dark:text-cream text-sm mb-1">
                Best Time to Call
              </label>
              <select
                id="callback-time"
                value={formData.bestTime}
                onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray/20 dark:border-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal dark:bg-navy dark:text-cream"
              >
                <option value="">Select time</option>
                <option value="Morning">Morning (9AM - 12PM)</option>
                <option value="Afternoon">Afternoon (12PM - 5PM)</option>
                <option value="Evening">Evening (5PM - 8PM)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 bg-gray/20 hover:bg-gray/30 dark:bg-gray/30 dark:hover:bg-gray/40 text-gray dark:text-cream font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestCallback}
                className="flex-1 bg-teal hover:bg-navy dark:hover:bg-teal text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Request Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}