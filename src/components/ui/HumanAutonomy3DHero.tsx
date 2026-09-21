'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  ShieldCheck,
  Cpu,
  UserCheck,
  Lock,
  Layers,
  Sparkles,
  ChevronRight,
  FileCheck2,
  CheckCircle2,
  Hash,
} from 'lucide-react';
import Link from 'next/link';

interface LayerInfo {
  id: string;
  name: string;
  badge: string;
  role: string;
  icon: typeof ShieldCheck;
  color: string;
  borderColor: string;
  bgGlow: string;
  zOffset: number;
  dataPacket: {
    status: string;
    details: string;
    auditProof: string;
  };
}

const LAYERS: LayerInfo[] = [
  {
    id: 'layer-1',
    name: 'Layer 1: Clinical Origin',
    badge: 'Source Data',
    role: 'EHR Encounter, Operative Note & Chart Ingestion',
    icon: FileCheck2,
    color: 'text-sky-400',
    borderColor: 'border-sky-500/30',
    bgGlow: 'bg-sky-500/10',
    zOffset: 0,
    dataPacket: {
      status: 'Raw Documentation Ingested',
      details: 'Patient encounter note with procedure duration, site, and medication order.',
      auditProof: 'SHA-256: 8f9b4c2... (Original Source Immutable)',
    },
  },
  {
    id: 'layer-2',
    name: 'Layer 2: Deterministic AI Engine',
    badge: 'Algorithmic Verification',
    role: 'NCCI Edits, 11-Digit NDC Padding & Payer LCD/NCD Scrubbing',
    icon: Cpu,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgGlow: 'bg-emerald-500/10',
    zOffset: 45,
    dataPacket: {
      status: 'Zero Hallucination Guarantee',
      details: 'Evaluates 1,300+ CARC rules; converts 10-digit NDC to 5-4-2; detects unbundling pairs.',
      auditProof: 'Algorithm: Rule Engine v4.8 (Deterministic pass)',
    },
  },
  {
    id: 'layer-3',
    name: 'Layer 3: The Sovereign Human Gate',
    badge: 'Certified Coder Sign-Off',
    role: 'AAPC / AHIMA Certified Coders Verify Medical Intent',
    icon: UserCheck,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgGlow: 'bg-amber-500/10',
    zOffset: 90,
    dataPacket: {
      status: 'Human Sovereign Seal',
      details: 'Certified coder validates separate E/M workup, approves Modifier 25/59, signs off.',
      auditProof: 'Signer: CPC-883921 | Timestamp: Verified UTC',
    },
  },
  {
    id: 'layer-4',
    name: 'Layer 4: Tamper-Evident Ledger & 837 Dispatch',
    badge: 'Clearinghouse Release',
    role: 'Cryptographic Hash-Chained Audit Trail & 837P Release',
    icon: Lock,
    color: 'text-teal-400',
    borderColor: 'border-teal-500/40',
    bgGlow: 'bg-teal-500/10',
    zOffset: 135,
    dataPacket: {
      status: 'Dispatch Certified Clean',
      details: 'Exact $0.00 balancing variance; ANSI X12 837P packet dispatched to payer.',
      auditProof: 'Ledger Block #49102 | Hash-Chain Certified',
    },
  },
];

export default function HumanAutonomy3DHero() {
  const [isExploded, setIsExploded] = useState(false);
  const [activeLayer, setActiveLayer] = useState<number>(2); // Default to Human Gate
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse physics for 3D rotation tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [18, -18]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-22, 22]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const currentPacket = LAYERS[activeLayer];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#001529] via-[#051C33] to-[#09223D] text-white py-16 md:py-24 border-b border-white/10">
      {/* Ambient background glow dots */}
      <div className="absolute inset-0 bg-[radial-gradient(#45C4B0_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-teal/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Breadcrumb & Tag */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-mint/30 text-mint text-xs font-semibold tracking-wide">
            <span className="h-2 w-2 rounded-full bg-mint animate-pulse" />
            HUMAN-IN-THE-LOOP AUTONOMY FRAMEWORK
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Zero Hallucinations
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-300" />
              100% Certified Human Sign-Off
            </span>
          </div>
        </div>

        {/* Hero Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission & Plain English Manifesto */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="font-jakarta text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Human Sovereignty in <span className="text-mint">AI-First RCM</span>.
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
              Healthcare billing cannot tolerate black-box hallucinations. At Aethera, deterministic
              algorithms parse payer contracts, NCCI edits, and 11-digit NDCs with mathematical
              rigor — but <strong>only certified human billing specialists</strong> are authorized to approve
              codes, attest modifiers, and release claims to payers.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
                  <Cpu className="h-4 w-4" /> Deterministic AI
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  Mathematical rule evaluation: NCCI unbundling, 11-digit NDC zero-padding, timely filing calculations.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1">
                  <UserCheck className="h-4 w-4" /> Sovereign Human Gate
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  AAPC/AHIMA certified coders personally attest medical necessity, clinical intent, and sign every claim.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="#code-explorer"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-mint text-navy font-bold text-sm hover:bg-white transition-all shadow-lg shadow-mint/20"
              >
                Explore Code Systems (CPT, CDT, NDC) <ChevronRight className="h-4 w-4 ml-1.5" />
              </Link>
              <button
                onClick={() => setIsExploded(!isExploded)}
                className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/15 transition-all"
              >
                <Layers className="h-4 w-4 mr-2 text-mint" />
                {isExploded ? 'Collapse 3D Layers' : 'Explode 3D Layers (Inspect)'}
              </button>
            </div>
          </div>

          {/* Right Column: Interactive 3D Spatial Architecture Canvas */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[460px] sm:min-h-[520px] cursor-grab active:cursor-grabbing select-none"
            style={{ perspective: 1200 }}
          >
            {/* 3D Model Stage Container */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }}
              className="relative w-full max-w-[440px] h-[340px] flex items-center justify-center transition-all duration-300"
            >
              {LAYERS.map((layer, index) => {
                const isSelected = activeLayer === index;
                const Icon = layer.icon;
                const dynamicZ = isExploded ? layer.zOffset * 1.8 - 120 : layer.zOffset - 60;
                const dynamicY = isExploded ? (index - 1.5) * 55 : (index - 1.5) * 18;

                return (
                  <motion.div
                    key={layer.id}
                    onClick={() => setActiveLayer(index)}
                    animate={{
                      z: dynamicZ,
                      y: dynamicY,
                      scale: isSelected ? 1.04 : 0.98,
                      opacity: 1,
                    }}
                    transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                    className={`absolute w-[92%] sm:w-[380px] p-5 rounded-2xl backdrop-blur-xl border cursor-pointer transition-all duration-300 shadow-2xl ${
                      layer.borderColor
                    } ${
                      isSelected
                        ? `${layer.bgGlow} ring-2 ring-mint/60 shadow-mint/20`
                        : 'bg-[#0B1E36]/85 hover:bg-[#0E2542]/95'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl bg-white/10 ${layer.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {layer.badge}
                          </p>
                          <h4 className="text-sm font-extrabold text-white">{layer.name}</h4>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        Z: {Math.round(dynamicZ)}px
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-snug">{layer.role}</p>

                    {/* Mini live status bar inside card */}
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            index === 2 ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                          }`}
                        />
                        {layer.dataPacket.status}
                      </span>
                      <span className="text-mint font-semibold text-[10px] uppercase">
                        {isSelected ? 'Inspecting' : 'Click to View'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Interactive Data Packet Inspector Callout */}
            <div className="w-full max-w-[440px] mt-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-mint flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" /> Layer Telemetry &amp; Proof
                </span>
                <span className="text-[11px] font-mono text-slate-400">{currentPacket.name}</span>
              </div>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {currentPacket.dataPacket.details}
              </p>
              <div className="mt-2 text-[10px] font-mono text-emerald-300/90 bg-black/40 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 truncate">
                {currentPacket.dataPacket.auditProof}
              </div>
            </div>

            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-mint" />
              <span>Hover &amp; move cursor to rotate 3D canvas • Click layer cards to inspect</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
