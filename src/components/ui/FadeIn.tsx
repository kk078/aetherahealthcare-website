'use client';

import { useRef, useState, useEffect, type HTMLAttributes } from 'react';

interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function FadeIn({
  children,
  className,
  delay = 0,
  ...props
}: FadeInProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setInView(true); // fallback: show immediately
      return;
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
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: inView
          ? `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}s`
          : 'none',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
