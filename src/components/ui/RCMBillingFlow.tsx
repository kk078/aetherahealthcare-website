'use client';

/**
 * RCMBillingFlow
 * --------------
 * A literal, looping 2D animation of the U.S. medical-billing revenue cycle —
 * the real workflow Aethera runs for clients:
 *
 *   Encounter → Coding (ICD-10 / CPT) → Scrub → Submit → Payer
 *      → Denied (CARC 16) → Worked & appealed → PAID
 *
 * A single claim card travels the pipeline and transforms at each stage; code
 * chips assemble during coding; the claim gets denied at the payer, drops into
 * the "denials worked" tray, is appealed, and returns as PAID while a lifetime
 * "$ recovered" counter ticks up. Pure SVG + rAF (no WebGL). Respects
 * prefers-reduced-motion (renders a static paid state).
 */

import { useEffect, useRef, useState } from 'react';

const DURATION = 15000; // ms per loop
const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

// palette
const NAVY = '#0B2545';
const ROYAL = '#0061A5';
const TEAL = '#0D7377';
const MINT = '#45C4B0';
const EMERALD = '#10B981';
const RED = '#DC2626';
const AMBER = '#D97706';
const SLATE = '#64748B';

type Key = { p: number; x: number; y: number; o: number };
const CLAIM: Key[] = [
  { p: 0.00, x: 200, y: 250, o: 0 },
  { p: 0.05, x: 200, y: 250, o: 1 },
  { p: 0.34, x: 200, y: 250, o: 1 },
  { p: 0.46, x: 380, y: 250, o: 1 },
  { p: 0.56, x: 490, y: 250, o: 1 },
  { p: 0.66, x: 490, y: 250, o: 1 },
  { p: 0.72, x: 372, y: 470, o: 1 },
  { p: 0.86, x: 372, y: 470, o: 1 },
  { p: 0.92, x: 560, y: 250, o: 1 },
  { p: 0.97, x: 560, y: 250, o: 1 },
  { p: 0.995, x: 560, y: 250, o: 0 },
  { p: 1.00, x: 200, y: 250, o: 0 },
];

function interp(keys: Key[], p: number) {
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (p >= a.p && p <= b.p) {
      const u = (p - a.p) / (b.p - a.p || 1);
      const s = u * u * (3 - 2 * u);
      return { x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s, o: a.o + (b.o - a.o) * s };
    }
  }
  const l = keys[keys.length - 1];
  return { x: l.x, y: l.y, o: l.o };
}
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (e0: number, e1: number, x: number) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

function statusFor(p: number): { t: string; bg: string } {
  if (p < 0.05) return { t: 'NEW CLAIM', bg: NAVY };
  if (p < 0.34) return { t: 'CODING', bg: ROYAL };
  if (p < 0.56) return { t: 'SCRUBBED ✓', bg: TEAL };
  if (p < 0.60) return { t: 'IN REVIEW', bg: SLATE };
  if (p < 0.72) return { t: 'DENIED · CARC 16', bg: RED };
  if (p < 0.88) return { t: 'APPEAL FILED', bg: AMBER };
  return { t: 'PAID', bg: EMERALD };
}

const CODE_CHIPS = [
  { t: 'ICD-10  I10', c: ROYAL },
  { t: 'ICD-10  E11.9', c: ROYAL },
  { t: 'CPT  99214', c: TEAL },
  { t: 'CPT  93000', c: TEAL },
];

const STATIONS = [
  { x: 120, label: 'Encounter' },
  { x: 240, label: 'Coding' },
  { x: 380, label: 'Submit' },
  { x: 490, label: 'Payer' },
  { x: 560, label: 'Paid' },
];

function fmt(n: number) { return '$' + Math.round(n).toLocaleString('en-US'); }

export default function RCMBillingFlow({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState(0);
  const [reduce, setReduce] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduce(true);
      return;
    }
    let raf = 0;
    const loop = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      setNow(ts - startRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // progress
  const p = reduce ? 0.90 : (now % DURATION) / DURATION;

  const claim = interp(CLAIM, p);
  const status = statusFor(p);
  const pillW = Math.max(96, status.t.length * 7.2 + 26);

  // denial branch highlight (payer → tray → paid)
  const branchOn = p > 0.58 && p < 0.94;

  // ambient claim ticks (independent of loop phase)
  const secs = now / 1000;
  const ambient = Array.from({ length: 6 }, (_, i) => {
    const u = (secs * 0.06 + i / 6) % 1;
    return { x: u * 720 - 30, o: 0.15 + 0.2 * Math.sin(u * Math.PI) };
  });

  const showChips = p > 0.10 && p < 0.35;

  return (
    <div className="absolute inset-0" aria-label="Animated medical-billing revenue cycle: coding, scrubbing, claim submission, denial, appeal, and payment.">
      <svg viewBox="0 0 680 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="cardShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#00101f" floodOpacity="0.45" />
          </filter>
          <linearGradient id="rail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={ROYAL} /><stop offset="60%" stopColor={TEAL} /><stop offset="100%" stopColor={EMERALD} />
          </linearGradient>
        </defs>

        {/* ambient claim volume */}
        {!compact && ambient.map((a, i) => (
          <rect key={i} x={a.x} y={162} width={26} height={9} rx={2.5} fill={MINT} opacity={reduce ? 0.18 : a.o} />
        ))}

        {/* ===== KPI panel ===== */}
        {!compact && (
        <g fontFamily={FONT}>
          <rect x={432} y={18} width={234} height={118} rx={14} fill="#ffffff" opacity={0.07} stroke="#ffffff" strokeOpacity={0.14} />
          <text x={450} y={46} fill="#9fc3e0" fontSize={12} fontWeight={700} letterSpacing="1.5">PERFORMANCE TARGETS</text>
          <g fontSize={13} fontWeight={700}>
            <circle cx={456} cy={72} r={3.5} fill={EMERALD} />
            <text x={468} y={76} fill="#cfe0ee">Clean claim 95%+</text>
            <circle cx={456} cy={97} r={3.5} fill={MINT} />
            <text x={468} y={101} fill="#cfe0ee">Denials worked &lt;5%</text>
            <circle cx={456} cy={122} r={3.5} fill="#9fc3e0" />
            <text x={468} y={126} fill="#cfe0ee">Days in A/R &lt;30</text>
          </g>
        </g>
        )}

        {/* ===== pipeline rail ===== */}
        <line x1={120} y1={250} x2={560} y2={250} stroke="url(#rail)" strokeWidth={3} strokeOpacity={0.55} />
        {STATIONS.map((s) => (
          <g key={s.label} fontFamily={FONT}>
            <circle cx={s.x} cy={250} r={6} fill="#0a2036" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={1.5} />
            <text x={s.x} y={286} fill="#9fc3e0" fontSize={11.5} fontWeight={600} textAnchor="middle">{s.label}</text>
          </g>
        ))}

        {/* denial branch */}
        <path d="M490 258 C 470 360, 420 420, 372 452 M372 452 C 470 420, 540 360, 560 258"
          fill="none" stroke={branchOn ? AMBER : '#ffffff'} strokeOpacity={branchOn ? 0.8 : 0.14}
          strokeWidth={branchOn ? 2.5 : 1.5} strokeDasharray="5 6" />

        {/* ===== denials tray ===== */}
        <g fontFamily={FONT}>
          <rect x={252} y={418} width={240} height={120} rx={14}
            fill={branchOn ? 'rgba(217,119,6,0.12)' : '#ffffff'} fillOpacity={branchOn ? 1 : 0.05}
            stroke={branchOn ? AMBER : '#ffffff'} strokeOpacity={branchOn ? 0.6 : 0.14} strokeWidth={1.5} />
          <text x={272} y={440} fill={branchOn ? '#f4c17a' : '#7f9bb3'} fontSize={11} fontWeight={700} letterSpacing="1.2">DENIALS — WORKED &amp; APPEALED</text>
          <text x={272} y={528} fill="#7f9bb3" fontSize={10.5} fontWeight={600}>CARC 16 · N290 → corrected → resubmit</text>
        </g>

        {/* ===== code chips (coding stage) ===== */}
        {showChips && CODE_CHIPS.map((chip, i) => {
          const appear = 0.13 + i * 0.045;
          const oIn = smooth(appear, appear + 0.03, p);
          const oOut = 1 - smooth(0.31, 0.345, p);
          const o = clamp01(oIn) * clamp01(oOut);
          const flyX = smooth(0.31, 0.35, p) * 150; // slide left into card as it "attaches"
          const cx = claim.x + 118 - flyX + (1 - clamp01(oIn)) * 24;
          const cy = claim.y - 52 + i * 30;
          const w = chip.t.length * 6.2 + 22;
          return (
            <g key={chip.t} opacity={o} fontFamily={FONT}>
              <rect x={cx} y={cy} width={w} height={22} rx={11} fill={chip.c} />
              <text x={cx + w / 2} y={cy + 15} fill="#ffffff" fontSize={11} fontWeight={700} textAnchor="middle">{chip.t}</text>
            </g>
          );
        })}

        {/* ===== the claim card ===== */}
        <g transform={`translate(${claim.x} ${claim.y})`} opacity={claim.o} fontFamily={FONT}>
          <rect x={-95} y={-62} width={190} height={124} rx={12} fill="#ffffff" filter="url(#cardShadow)" />
          {/* header */}
          <text x={-80} y={-40} fill={NAVY} fontSize={12} fontWeight={800} letterSpacing="0.4">CMS-1500</text>
          <text x={80} y={-40} fill={SLATE} fontSize={11} fontWeight={600} textAnchor="end">#A-1042</text>
          <line x1={-80} y1={-31} x2={80} y2={-31} stroke="#e2e8f0" strokeWidth={1} />
          {/* placeholder detail lines */}
          <rect x={-80} y={-22} width={110} height={6} rx={3} fill="#e8edf3" />
          <rect x={-80} y={-10} width={150} height={6} rx={3} fill="#eef2f7" />
          {/* amount */}
          <text x={-80} y={22} fill={NAVY} fontSize={20} fontWeight={800} letterSpacing="-0.4">$420.00</text>
          {/* status pill */}
          <g>
            <rect x={-pillW / 2} y={34} width={pillW} height={24} rx={12} fill={status.bg} />
            <text x={0} y={50} fill="#ffffff" fontSize={11.5} fontWeight={800} textAnchor="middle" letterSpacing="0.3">{status.t}</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
