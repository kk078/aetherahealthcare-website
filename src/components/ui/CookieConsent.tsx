'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useConsent, setConsent } from '@/lib/consent';

export default function CookieConsent() {
  const consent = useConsent();
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    // Remove personal information left by older releases, regardless of consent.
    try { localStorage.removeItem('aethera_leads_vault'); } catch { /* Storage blocked. */ }
    const open = () => setEditing(true);
    window.addEventListener('open-cookie-preferences', open);
    return () => window.removeEventListener('open-cookie-preferences', open);
  }, []);
  if (consent !== 'unknown' && !editing) return null;
  const choose = (choice: 'accepted' | 'declined') => { setConsent(choice); setEditing(false); };
  return (
    <section aria-label="Cookie consent" className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md surface-card border rounded-2xl shadow-2xl p-5 z-[110]">
      <h2 className="font-bold text-base mb-2">Cookie preferences</h2>
      <p className="text-sm text-muted mb-4">With your permission, we use analytics and advertising services, including business visitor identification. Essential Only keeps these services off. Read our <Link href="/compliance/privacy-policy/" className="underline">privacy policy</Link>.</p>
      <div className="flex gap-3">
        <button onClick={() => choose('accepted')} className="flex-1 rounded-lg bg-teal text-white p-3 text-sm font-semibold">Accept Cookies</button>
        <button onClick={() => choose('declined')} className="flex-1 rounded-lg border p-3 text-sm font-semibold">Essential Only</button>
      </div>
    </section>
  );
}
