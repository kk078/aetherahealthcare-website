'use client';

import { useSyncExternalStore } from 'react';

export type Consent = 'unknown' | 'accepted' | 'declined';
const KEY = 'aethera-consent-v2';
const EVENT = 'aethera-consent-change';
let memory: Consent = 'unknown';

export function getConsent(): Consent {
  if (typeof window === 'undefined') return 'unknown';
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return 'unknown';
    const saved = JSON.parse(raw);
    if (saved.version === 2 && saved.expiresAt > Date.now() && ['accepted', 'declined'].includes(saved.choice)) return saved.choice;
    return 'unknown';
  } catch { return memory; /* Session-only preference when storage is unavailable. */ }
}

export function setConsent(choice: Exclude<Consent, 'unknown'>) {
  const previous = getConsent();
  memory = choice;
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 2, choice, expiresAt: Date.now() + 180 * 86400000 }));
    localStorage.removeItem('cookieConsent');
    localStorage.removeItem('aethera_leads_vault');
    if (choice === 'declined') sessionStorage.removeItem('aethera_session_attribution');
  } catch { /* Keep the preference in memory for this page. */ }
  window.dispatchEvent(new Event(EVENT));
  // Reload after withdrawal to terminate SDKs already running in this document.
  if (previous === 'accepted' && choice === 'declined') window.location.reload();
}

function subscribe(callback: () => void) {
  let previous = getConsent();
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY && event.key !== null) return;
    memory = 'unknown';
    const current = getConsent();
    if (previous === 'accepted' && current !== 'accepted') {
      try { sessionStorage.removeItem('aethera_session_attribution'); } catch { /* Storage unavailable. */ }
      window.location.reload();
      return;
    }
    previous = current;
    callback();
  };
  const onChange = () => { previous = getConsent(); callback(); };
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}
export function useConsent() {
  return useSyncExternalStore(subscribe, getConsent, () => 'unknown' as Consent);
}
