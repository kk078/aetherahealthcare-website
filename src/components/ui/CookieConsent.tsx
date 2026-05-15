'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-navy border-t border-gray/20 dark:border-gray/30 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray dark:text-cream text-sm">
            We use cookies to improve your experience. By continuing to use this site, you agree to our{' '}
            <Link href="/compliance/privacy-policy" className="text-teal hover:text-mint dark:text-mint dark:hover:text-teal underline">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="flex gap-3">
            <button
              onClick={acceptCookies}
              className="bg-teal hover:bg-navy dark:hover:bg-teal text-white font-medium py-2 px-4 rounded-full text-sm transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}