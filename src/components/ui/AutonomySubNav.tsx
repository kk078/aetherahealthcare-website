'use client';

import React from 'react';
import {
  Layers,
  Activity,
  Building2,
  GitCompare,
  Calculator,
  Fingerprint,
  Scale,
  ShieldAlert,
  Swords,
  PhoneCall,
  Gavel,
  FileCode,
  Compass,
  FlaskConical,
  Stethoscope,
  Clock,
  Syringe,
  GraduationCap,
  Pill,
  Droplets,
  Dna,
  HeartPulse,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: '3D Anatomy Atlas', href: '#anatomy-3d-explorer', icon: Layers },
  { label: 'Tissue Depth Slider', href: '#surgical-depth-slider', icon: Activity },
  { label: '20 ABMS Specialties', href: '#specialty-autonomy-matrix', icon: Building2 },
  { label: 'Claim Diff Viewer', href: '#claim-diff-viewer', icon: GitCompare },
  { label: 'Clawback Calculator', href: '#specialty-clawback-calculator', icon: Calculator },
  { label: 'Cryptographic Ledger', href: '#cryptographic-audit-ledger', icon: Fingerprint },
  { label: 'Safe-Harbor Auditor', href: '#federal-safe-harbor-auditor', icon: Scale },
  { label: 'Denial Defense Matrix', href: '#multi-payer-denial-matrix', icon: ShieldAlert },
  { label: 'P2P Audio Simulator', href: '#physician-p2p-simulator', icon: PhoneCall },
  { label: 'NSA IDR Arbiter', href: '#federal-idr-arbiter', icon: Gavel },
  { label: 'Fee Parity Radar', href: '#fee-schedule-parity', icon: Compass },
  { label: 'Research Auditor', href: '#clinical-research-auditor', icon: FlaskConical },
  { label: 'HAC / POA Guard', href: '#hac-poa-safeguard', icon: Stethoscope },
  { label: 'Two-Midnight Arbiter', href: '#two-midnight-arbiter', icon: Clock },
  { label: 'Drug Waste Guard', href: '#drug-waste-engine', icon: Syringe },
  { label: 'GME / IME Cap Optimizer', href: '#gme-ime-cap-optimizer', icon: GraduationCap },
  { label: '340B Compliance Guard', href: '#drug-340b-auditor', icon: Pill },
  { label: 'ESRD / KCC Arbiter', href: '#esrd-kcc-arbiter', icon: Droplets },
  { label: 'CLFS / PAMA Arbiter', href: '#clfs-pama-arbiter', icon: Dna },
  { label: 'RHC / FQHC Arbiter', href: '#rhc-fqhc-arbiter', icon: HeartPulse },
  { label: 'AI vs Human Arena', href: '#adjudication-benchmark-arena', icon: Swords },
  { label: 'Scrubber Simulator', href: '#scrubber-simulation', icon: FileCode },
];

export default function AutonomySubNav() {
  return (
    <nav
      aria-label="Human Autonomy Suite Navigation"
      className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 py-2.5 px-4 sm:px-6 shadow-xl"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold shrink-0 hidden md:inline-block mr-2">
          Suite Navigator:
        </span>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-teal-950 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-teal-300 text-xs font-semibold whitespace-nowrap transition-all shrink-0"
            >
              <Icon className="w-3.5 h-3.5 text-teal-400" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
