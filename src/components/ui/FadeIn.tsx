'use client';
import { useEffect, useRef, type HTMLAttributes } from 'react';
interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number; direction?: 'up' | 'down' | 'left' | 'right' | 'none'; distance?: number;
}
export default function FadeIn({ children, delay = 0, direction = 'up', distance = 16, ...props }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !el.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const offsets = { up: `0, ${distance}px`, down: `0, -${distance}px`, left: `${distance}px, 0`, right: `-${distance}px, 0`, none: '0, 0' };
    const animation = el.animate([{ transform: `translate(${offsets[direction]})` }, { transform: 'none' }], { duration: 350, delay: delay * 1000, easing: 'ease-out' });
    return () => animation.cancel();
  }, [delay, direction, distance]);
  return <div ref={ref} {...props}>{children}</div>;
}
