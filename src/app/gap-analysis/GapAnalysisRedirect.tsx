'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GapAnalysisRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/free-assessment');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="text-navy font-semibold mb-2">Taking you to the A/R Gap Analysis…</p>
      <p className="text-gray text-sm mb-6">It now lives on our Free Assessment page.</p>
      <Link prefetch={false} href="/free-assessment" className="text-teal font-semibold hover:text-navy transition-colors">
        Continue to Free Assessment →
      </Link>
    </div>
  );
}
