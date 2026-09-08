'use client';
import { useConsent } from '@/lib/consent';
import GoogleAds from './GoogleAds';
import CloudflareAnalytics from './CloudflareAnalytics';
import RetargetingPixels from './RetargetingPixels';
import B2BVisitorTracker from './B2BVisitorTracker';
import AttributionTracker from './AttributionTracker';
export default function AnalyticsGate() {
  const consent = useConsent();
  if (consent !== 'accepted') return null;
  return <><GoogleAds /><CloudflareAnalytics /><RetargetingPixels /><B2BVisitorTracker /><AttributionTracker /></>;
}
