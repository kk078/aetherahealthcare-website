'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Schedule check to avoid synchronous cascading renders
    const timer = setTimeout(() => {
      const consent = localStorage.getItem('cookieConsent');
      if (!consent) {
        setShowConsent(true);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 sm:p-5 z-[65] animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal/10 text-teal">
            <Cookie className="h-4 w-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-navy">Cookie Preferences</span>
        </div>
        <button
          onClick={declineCookies}
          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
          aria-label="Close cookie banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-slate-600 text-xs leading-relaxed mb-4">
        We use cookies and telemetry to improve navigation and measure site performance. Read our{' '}
        <Link prefetch={false} href="/compliance/privacy-policy" className="text-teal hover:underline font-semibold">
          Privacy Policy
        </Link>
        .
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={acceptCookies}
          className="flex-1 bg-teal hover:bg-navy text-white font-semibold py-2 px-3 rounded-xl text-xs transition-colors text-center shadow-sm"
        >
          Accept Cookies
        </button>
        <button
          onClick={declineCookies}
          className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2 px-3 rounded-xl text-xs transition-colors text-center"
        >
          Essential Only
        </button>
      </div>
    </div>
  );
}