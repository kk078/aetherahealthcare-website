'use client';
import { useEffect, useRef, useState } from 'react';
import AnimatedCounter from './AnimatedCounter';
interface TargetItem {
  targetNumber: number;
  prefix?: string;
  suffix?: string;
  label: string;
  barClass: string;
  barWidth: string;
  icon: React.ReactNode;
  iconWrap: string;
}

export default function TargetCard({ t, index }: { t: TargetItem; index: number }) {
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
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView]);

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl p-7 border border-gray/15 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-mint/40 transition-all duration-300 h-full flex flex-col justify-between"
    >
      <div>
        <span className={`inline-flex items-center justify-center h-11 w-11 rounded-xl mb-6 ${t.iconWrap}`}>
          {t.icon}
        </span>
        <div className="font-jakarta font-extrabold text-navy text-4xl tracking-tight mb-1">
          <AnimatedCounter
            to={t.targetNumber}
            prefix={t.prefix}
            suffix={t.suffix}
            duration={1100 + index * 150}
          />
        </div>
        <div className="text-xs font-bold tracking-[0.12em] text-gray uppercase mb-4">{t.label}</div>
        <div className="w-full bg-gray/10 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${t.barClass}`}
            style={{
              width: inView ? t.barWidth : '0%',
              transition: `width 1s cubic-bezier(0.16, 1, 0.3, 1) ${0.2 + index * 0.1}s`,
            }}
          />
        </div>
      </div>
      <p className="mt-5 text-sm text-gray italic">Contractual target</p>
    </div>
  );
}

