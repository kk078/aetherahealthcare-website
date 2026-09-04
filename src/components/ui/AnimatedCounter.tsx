'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function AnimatedCounter({
  from = 0,
  to,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedCounterProps) {
  const [value, setValue] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return to;
    }
    return from;
  });

  const [hasAnimated, setHasAnimated] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return false;
  });

  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (hasAnimated) return;

    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();

          const startTime = performance.now();
          const startVal = from;
          const endVal = to;

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // easeOutExpo for a rapid launch and gentle precision settle
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentVal = startVal + (endVal - startVal) * ease;

            setValue(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setValue(endVal);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [from, to, duration, hasAnimated]);

  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

  return (
    <span ref={elementRef} className={className}>
      {prefix}
      {hasAnimated ? formatted : (decimals > 0 ? from.toFixed(decimals) : from.toLocaleString())}
      {suffix}
    </span>
  );
}
