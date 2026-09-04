'use client';

/**
 * RCMBillingFlow
 * --------------
 * A literal, interactive 2D animation of the U.S. medical-billing revenue cycle —
 * the real workflow Aethera runs for clients:
 *
 *   Encounter → Coding (ICD-10 / CPT) → Scrub → Submit → Payer
 *      → Denied (CARC 16) → Worked & appealed → PAID
 *
 * Visitors can let it auto-loop or click/tap any station to pause and inspect
 * Aethera's real-world SLA, technology, and clean-claim guarantee.
 * Respects prefers-reduced-motion.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, CheckCircle2 } from 'lucide-react';

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

interface StationDetail {
  id: string;
  x: number;
  label: string;
  targetP: number;
  badge: string;
  sla: string;
  desc: string;
}

const STATIONS: StationDetail[] = [
  { id: 'encounter', x: 120, label: 'Encounter', targetP: 0.05, badge: 'Intake', sla: 'Real-time', desc: 'Eligibility & benefits verified before the encounter across 900+ payers.' },
  { id: 'coding', x: 240, label: 'Coding', targetP: 0.22, badge: 'AAPC Certified', sla: '<24h Turnaround', desc: 'Dual AI-assisted & certified coder validation for 98%+ clean claim rate.' },
  { id: 'submit', x: 380, label: 'Submit', targetP: 0.46, badge: 'NCCI Scrubbed', sla: 'Same-day', desc: 'Clearinghouse transmission with automated rule scrubbing against LCD/NCD edits.' },
  { id: 'payer', x: 490, label: 'Payer', targetP: 0.58, badge: 'ERA / 835', sla: 'Live Track', desc: 'Automated 835 remittance matching and immediate denial detection.' },
  { id: 'paid', x: 560, label: 'Paid', targetP: 0.95, badge: 'Reconciled', sla: '<30 DAR', desc: 'Clean payment posted to practice bank account and reconciled with fee schedules.' },
];

export default function RCMBillingFlow({ compact = false }: { compact?: boolean }) {
  // Read prefers-reduced-motion without triggering cascading render in effect
  const [reduce] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [now, setNow] = useState(0);
  const [activeStation, setActiveStation] = useState<StationDetail | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const startRef = useRef<number | null>(null);
  const pauseOffsetRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);

  // Animation loop with throttled rendering (~33fps) to save mobile CPU/battery
  useEffect(() => {
    if (reduce) return;

    let raf = 0;
    const loop = (ts: number) => {
      if (startRef.current === null) startRef.current = ts - pauseOffsetRef.current;

      if (!isPaused && !activeStation) {
        if (ts - lastTsRef.current >= 30) {
          lastTsRef.current = ts;
          const currentOffset = ts - startRef.current;
          pauseOffsetRef.current = currentOffset % DURATION;
          setNow(pauseOffsetRef.current);
        }
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduce, isPaused, activeStation]);

  const selectStation = useCallback((st: StationDetail) => {
    if (activeStation?.id === st.id) {
      setActiveStation(null);
      setIsPaused(false);
      startRef.current = performance.now() - (st.targetP * DURATION);
    } else {
      setActiveStation(st);
      setIsPaused(true);
      setNow(st.targetP * DURATION);
    }
  }, [activeStation]);

  const togglePause = useCallback(() => {
    if (isPaused || activeStation) {
      setActiveStation(null);
      setIsPaused(false);
      startRef.current = performance.now() - now;
    } else {
      setIsPaused(true);
    }
  }, [isPaused, activeStation, now]);

  // progress calculation
  const p = reduce ? 0.90 : activeStation ? activeStation.targetP : (now % DURATION) / DURATION;
  const claim = interp(CLAIM, p);
  const status = statusFor(p);
  const pillW = Math.max(96, status.t.length * 7.2 + 26);

  // denial branch highlight (payer → tray → paid)
  const branchOn = p > 0.58 && p < 0.94;

  // ambient claim ticks
  const secs = now / 1000;
  const ambient = Array.from({ length: 6 }, (_, i) => {
    const u = (secs * 0.06 + i / 6) % 1;
    return { x: u * 720 - 30, o: 0.15 + 0.2 * Math.sin(u * Math.PI) };
  });

  const showChips = p > 0.10 && p < 0.35;

  return (
    <div className="relative w-full h-full select-none" aria-label="Animated medical-billing revenue cycle: coding, scrubbing, claim submission, denial, appeal, and payment.">
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
        {STATIONS.map((s) => {
          const isCurrent = activeStation?.id === s.id;
          return (
            <g
              key={s.label}
              fontFamily={FONT}
              className="cursor-pointer"
              onClick={() => selectStation(s)}
            >
              {/* hit target for touch */}
              <circle cx={s.x} cy={250} r={18} fill="transparent" />
              <circle
                cx={s.x}
                cy={250}
                r={isCurrent ? 8 : 6}
                fill={isCurrent ? MINT : '#0a2036'}
                stroke="#ffffff"
                strokeOpacity={isCurrent ? 1 : 0.5}
                strokeWidth={isCurrent ? 2.5 : 1.5}
              />
              <text
                x={s.x}
                y={286}
                fill={isCurrent ? '#ffffff' : '#9fc3e0'}
                fontSize={11.5}
                fontWeight={isCurrent ? 800 : 600}
                textAnchor="middle"
              >
                {s.label}
              </text>
            </g>
          );
        })}

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
          const flyX = smooth(0.31, 0.35, p) * 150;
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
          <text x={-80} y={-40} fill={NAVY} fontSize={12} fontWeight={800} letterSpacing="0.4">CMS-1500</text>
          <text x={80} y={-40} fill={SLATE} fontSize={11} fontWeight={600} textAnchor="end">#A-1042</text>
          <line x1={-80} y1={-31} x2={80} y2={-31} stroke="#e2e8f0" strokeWidth={1} />
          <rect x={-80} y={-22} width={110} height={6} rx={3} fill="#e8edf3" />
          <rect x={-80} y={-10} width={150} height={6} rx={3} fill="#eef2f7" />
          <text x={-80} y={22} fill={NAVY} fontSize={20} fontWeight={800} letterSpacing="-0.4">$420.00</text>
          <g>
            <rect x={-pillW / 2} y={34} width={pillW} height={24} rx={12} fill={status.bg} />
            <text x={0} y={50} fill="#ffffff" fontSize={11.5} fontWeight={800} textAnchor="middle" letterSpacing="0.3">{status.t}</text>
          </g>
        </g>
      </svg>

      {/* Interactive station callout overlay when inspected */}
      {activeStation && (
        <div className="absolute bottom-3 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md bg-navy/95 border border-mint/40 backdrop-blur-md rounded-xl p-3.5 shadow-2xl text-white animate-in fade-in slide-in-from-bottom-2 duration-200 z-20">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-mint uppercase tracking-wider">
              <CheckCircle2 className="h-3.5 w-3.5 text-mint" />
              Stage {STATIONS.findIndex((s) => s.id === activeStation.id) + 1} of 5: {activeStation.label}
            </span>
            <span className="text-[10px] font-semibold bg-mint/20 text-mint border border-mint/30 px-2 py-0.5 rounded-full">
              SLA: {activeStation.sla}
            </span>
          </div>
          <p className="text-xs text-cream/90 leading-relaxed">{activeStation.desc}</p>
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-cream/60">
            <span>Tap another step or play to resume</span>
            <button
              onClick={togglePause}
              className="text-mint font-semibold hover:underline flex items-center gap-1"
            >
              Resume flow &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Play / Pause toggle control */}
      {!reduce && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={togglePause}
            aria-label={isPaused || activeStation ? 'Play animation' : 'Pause animation'}
            className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 text-white/80 hover:text-white text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/15 backdrop-blur-sm transition-colors"
          >
            {isPaused || activeStation ? (
              <>
                <Play className="h-3 w-3 text-mint fill-mint" />
                <span>Play</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 text-white/70" />
                <span>Pause</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
