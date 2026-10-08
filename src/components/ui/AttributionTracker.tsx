'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureAttribution } from '@/lib/attribution';
import { trackCustomEvent } from '@/lib/gtag';
export default function AttributionTracker() {
  const pathname = usePathname();
  useEffect(() => {
    captureAttribution();
    // Queue after the consent-gated tag initializer; exclude queries and form fields.
    const timer = window.setTimeout(() => trackCustomEvent('page_view', { page_path: pathname, page_location: window.location.origin + pathname }), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);
  return null;
}
