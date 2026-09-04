'use client';

import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let ticking = false;

    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) {
        setProgress(0);
        return;
      }
      const currentScroll = window.scrollY;
      const pct = Math.min(Math.max(currentScroll / scrollHeight, 0), 1);
      setProgress(pct);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrollProgress();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-24 left-0 right-0 h-[2.5px] z-30 pointer-events-none bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-mint via-teal to-royal origin-left transition-transform duration-75 ease-out shadow-[0_0_8px_rgba(69,196,176,0.6)]"
        style={{
          transform: `scaleX(${progress})`,
        }}
      />
    </div>
  );
}
