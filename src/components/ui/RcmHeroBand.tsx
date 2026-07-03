'use client';

/**
 * RcmHeroBand — the shared RCM-reskin page hero.
 * Dark navy gradient + dotted grid + heading/subhead/CTAs on the left, and the
 * animated medical-billing revenue-cycle illustration on the right. Used across
 * all top-level pages for a consistent, on-brand animated header.
 */

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const RCMBillingFlow = dynamic(() => import('./RCMBillingFlow'), { ssr: false, loading: () => null });

type Cta = { href: string; label: string };

export default function RcmHeroBand({
  eyebrow,
  title,
  subtitle,
  primary,
  secondary,
  chips,
  compact = true,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  primary?: Cta;
  secondary?: Cta;
  chips?: string[];
  compact?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="absolute inset-0 bg-gradient-to-br from-ink via-navy to-[#06304f]" />
      <div className="absolute inset-0 opacity-[0.32] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(120,160,200,0.35) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute -top-1/3 -right-1/4 w-[70%] h-[140%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(closest-side, rgba(69,196,176,0.14), transparent)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-14 md:pt-20 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            {eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3.5 py-1.5 text-xs font-semibold tracking-[0.14em] text-cream uppercase">
                {eyebrow}
              </span>
            )}
            <h1 className="font-jakarta font-extrabold text-white text-3xl md:text-5xl leading-[1.06] tracking-tight mt-5 mb-4">
              {title}
            </h1>
            {subtitle && <p className="text-base md:text-lg text-cream/85 max-w-xl leading-relaxed mb-7">{subtitle}</p>}
            {(primary || secondary) && (
              <div className="flex flex-col sm:flex-row gap-3">
                {primary && (
                  <Link prefetch={false} href={primary.href}
                    className="inline-flex items-center justify-center gap-2 bg-mint hover:bg-white text-navy font-bold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg shadow-black/20">
                    {primary.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {secondary && (
                  <Link prefetch={false} href={secondary.href}
                    className="inline-flex items-center justify-center border border-white/35 text-white hover:bg-white/10 font-semibold py-3 px-6 rounded-xl transition-colors duration-200">
                    {secondary.label}
                  </Link>
                )}
              </div>
            )}
            {chips && chips.length > 0 && (
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-cream/70 text-sm">
                {chips.map((c) => (
                  <span key={c} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-mint" /> {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="relative h-[240px] sm:h-[300px] lg:h-[380px] w-full lg:w-[110%] lg:-mr-[10%]">
            <RCMBillingFlow compact={compact} />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-b from-transparent to-cream" />
    </section>
  );
}
