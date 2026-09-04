'use client';

import { useRef, useState, useEffect, type HTMLAttributes } from 'react';

interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
}

export default function FadeIn({
  children,
  className,
  delay = 0,
  direction = 'up',
  distance = 16,
  ...props
}: FadeInProps) {
  const [inView, setInView] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return false;
  });

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inView) return;

    const el = ref.current;
    if (!el) {
      const fallbackTimer = setTimeout(() => setInView(true), 0);
      return () => clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px 0px 0px 0px', threshold: 0 }
    );
    observer.observe(el);

    // Safety fallback: force visible after 800ms regardless
    const timer = setTimeout(() => setInView(true), 800);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [inView]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'none':
      default:
        return 'none';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translate3d(0, 0, 0)' : getInitialTransform(),
        transition: inView
          ? `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
          : 'none',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
