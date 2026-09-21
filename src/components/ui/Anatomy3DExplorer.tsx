'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ANATOMY_SYSTEMS, AnatomicalHotspot } from '@/data/anatomyAtlasData';
import {
  ShieldAlert,
  CheckCircle2,
  FileText,
  Search,
  BookOpen,
  Activity,
  Layers,
  ExternalLink,
  Award,
  AlertTriangle,
  Fingerprint,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Eye,
  Crosshair,
  Move,
  X,
  Stethoscope
} from 'lucide-react';

type ViewMode = 'volumetric' | 'neurovascular' | 'skeletal' | 'surgical';
type DepthFilter = 'all' | 'superficial' | 'intermediate' | 'deep';

export default function Anatomy3DExplorer() {
  const [selectedSystemId, setSelectedSystemId] = useState<string>('head-neck');
  const [activeTab, setActiveTab] = useState<'codes' | 'modifiers' | 'ncci' | 'cases' | 'sovereign'>('codes');
  const [searchQuery, setSearchQuery] = useState('');
  const [signedOffSystems, setSignedOffSystems] = useState<Record<string, boolean>>({});

  // 3D Interactivity State
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('volumetric');
  const [depthFilter, setDepthFilter] = useState<DepthFilter>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 3D Perspective Tilt State
  const [mouseTilt, setMouseTilt] = useState<{ rotateX: number; rotateY: number; glareX: number; glareY: number }>({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
  });

  const viewerRef = useRef<HTMLDivElement>(null);

  const activeSystem = useMemo(() => {
    return ANATOMY_SYSTEMS.find((s) => s.id === selectedSystemId) || ANATOMY_SYSTEMS[0];
  }, [selectedSystemId]);

  // Filtered hotspots by depth and search
  const visibleHotspots = useMemo(() => {
    if (!activeSystem.hotspots) return [];
    let list = activeSystem.hotspots;
    if (depthFilter !== 'all') {
      list = list.filter((h) => h.dissectionDepth === depthFilter);
    }
    if (viewMode === 'neurovascular') {
      list = list.filter((h) => h.structureCategory === 'neural' || h.structureCategory === 'vascular');
    } else if (viewMode === 'skeletal') {
      list = list.filter((h) => h.structureCategory === 'skeletal' || h.structureCategory === 'muscular');
    }
    return list;
  }, [activeSystem, depthFilter, viewMode]);

  const activeHotspot = useMemo(() => {
    if (!activeSystem.hotspots) return null;
    return activeSystem.hotspots.find((h) => h.id === activeHotspotId) || null;
  }, [activeSystem, activeHotspotId]);

  // Search filtering across all systems
  const filteredSystems = useMemo(() => {
    if (!searchQuery.trim()) return ANATOMY_SYSTEMS;
    const q = searchQuery.toLowerCase();
    return ANATOMY_SYSTEMS.filter((sys) => {
      const matchTitle = sys.title.toLowerCase().includes(q) || sys.subtitle.toLowerCase().includes(q);
      const matchLandmark = sys.anatomicalLandmarks.some((l) => l.toLowerCase().includes(q));
      const matchHotspot = sys.hotspots?.some(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.associatedCode.toLowerCase().includes(q) ||
          h.clinicalSignificance.toLowerCase().includes(q)
      );
      const matchCode = sys.codes.some(
        (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      );
      const matchMod = sys.mandatoryModifiers.some(
        (m) => m.modifier.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
      );
      return matchTitle || matchLandmark || matchHotspot || matchCode || matchMod;
    });
  }, [searchQuery]);

  // Mouse Parallax Physics
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewerRef.current) return;
    const rect = viewerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normalizedX = (x / rect.width) * 2 - 1;
    const normalizedY = (y / rect.height) * 2 - 1;

    if (isDragging && zoomLevel > 1) {
      const deltaX = (e.clientX - dragStart.x) / zoomLevel;
      const deltaY = (e.clientY - dragStart.y) / zoomLevel;
      setPanOffset((prev) => ({
        x: Math.max(-150, Math.min(150, prev.x + deltaX * 0.4)),
        y: Math.max(-150, Math.min(150, prev.y + deltaY * 0.4)),
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    setMouseTilt({
      rotateX: -normalizedY * 8,
      rotateY: normalizedX * 10,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
    });
  }, [isDragging, zoomLevel, dragStart]);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setMouseTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [zoomLevel]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(2.4, +(prev + 0.35).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(1, +(prev - 0.35).toFixed(2));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setMouseTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  const handleSignOff = (systemId: string) => {
    setSignedOffSystems((prev) => ({ ...prev, [systemId]: true }));
  };

  const selectHotspot = (hotspot: AnatomicalHotspot) => {
    setActiveHotspotId(hotspot.id);
  };

  const jumpToHotspotCode = (codeStr: string) => {
    setActiveTab('codes');
    const el = document.getElementById(`telemetry-code-${codeStr.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'skeletal':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-300',
          badge: 'bg-amber-950/80 text-amber-300 border-amber-800',
        };
      case 'neural':
        return {
          bg: 'bg-cyan-400',
          border: 'border-cyan-200',
          badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
        };
      case 'vascular':
        return {
          bg: 'bg-rose-500',
          border: 'border-rose-300',
          badge: 'bg-rose-950/80 text-rose-300 border-rose-800',
        };
      case 'visceral':
        return {
          bg: 'bg-emerald-400',
          border: 'border-emerald-200',
          badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
        };
      case 'muscular':
        return {
          bg: 'bg-violet-400',
          border: 'border-violet-200',
          badge: 'bg-violet-950/80 text-violet-300 border-violet-800',
        };
      default:
        return {
          bg: 'bg-teal-400',
          border: 'border-teal-200',
          badge: 'bg-teal-950/80 text-teal-300 border-teal-800',
        };
    }
  };

  const getViewModeFilterClass = () => {
    switch (viewMode) {
      case 'neurovascular':
        return 'contrast-[1.25] saturate-[1.4] hue-rotate-[180deg] brightness-[1.05]';
      case 'skeletal':
        return 'contrast-[1.35] saturate-[0.8] grayscale-[0.25] brightness-[1.1]';
      case 'surgical':
        return 'contrast-[1.2] brightness-[1.15] saturate-[1.25]';
      default:
        return 'contrast-[1.05] brightness-[1.02]';
    }
  };

  return (
    <section id="anatomy-3d-explorer" className="py-20 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-teal/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal/15 border border-teal/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            Rohen Photographic Atlas of Anatomy Digitalization (7th Ed.)
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Interactive 3D Anatomical Atlas &amp; Sovereign Gate Matrix
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            In medical billing and coding, <strong className="text-white">anatomy is the legal source of truth</strong>.
            Click any interactive landmark hotspot below to inspect real operative dissections, verify mandatory laterality modifiers,
            and enforce the certified human sovereign sign-off gate.
          </p>

          <div className="mt-6 relative max-w-xl mx-auto">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search anatomical landmark, code (e.g. 27447, D7240, 92928), or modifier (-LD, -FA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin scrollbar-thumb-slate-700">
          {filteredSystems.map((sys) => {
            const isSelected = sys.id === selectedSystemId;
            const isSigned = signedOffSystems[sys.id];
            return (
              <button
                key={sys.id}
                onClick={() => {
                  setSelectedSystemId(sys.id);
                  setActiveHotspotId(null);
                  handleResetZoom();
                }}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-lg shadow-teal-500/25 font-bold scale-[1.02]'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white hover:border-slate-600'
                }`}
              >
                <span>Ch. {sys.chapterNumber}: {sys.title.split(':')[0].split(',')[0]}</span>
                {isSigned && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive 3D Medical Render & Hotspot Viewer (6 cols) */}
          <div className="lg:col-span-6 bg-slate-850 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Chapter {activeSystem.chapterNumber} • {activeSystem.rohenPages}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">{activeSystem.title}</h3>
                <p className="text-xs text-slate-400">{activeSystem.subtitle}</p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-400" />
                {activeSystem.dissectionFiguresCount} Dissections
              </span>
            </div>

            {/* View Modes & Zoom Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-900/80 rounded-xl border border-slate-750 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-mono text-slate-400 px-1 hidden sm:inline">Mode:</span>
                {(
                  [
                    { id: 'volumetric', label: '3D Photoreal', icon: Eye },
                    { id: 'neurovascular', label: 'Neurovascular', icon: Activity },
                    { id: 'skeletal', label: 'Skeletal', icon: Stethoscope },
                    { id: 'surgical', label: 'Operative', icon: Layers },
                  ] as const
                ).map((m) => {
                  const Icon = m.icon;
                  const isModeActive = viewMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setViewMode(m.id)}
                      className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        isModeActive
                          ? 'bg-teal-500 text-slate-950 shadow-sm font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                      }`}
                      title={`Switch to ${m.label} perspective`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="text-[11px]">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px] text-teal-300">{zoomLevel.toFixed(1)}x</span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 2.4}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {zoomLevel > 1 && (
                  <button
                    onClick={handleResetZoom}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-amber-300 cursor-pointer transition-all ml-1"
                    title="Reset Zoom & Pan"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Interactive 3D Viewport */}
            <div
              ref={viewerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              className={`relative aspect-video rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 select-none ${
                zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'
              }`}
              style={{ perspective: 1000 }}
            >
              <div
                className="w-full h-full relative transition-transform duration-100 ease-out"
                style={{
                  transform: `rotateX(${mouseTilt.rotateX}deg) rotateY(${mouseTilt.rotateY}deg) scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                  transformOrigin: 'center center',
                }}
              >
                <Image
                  src={activeSystem.imagePath}
                  alt={activeSystem.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`object-cover transition-all duration-300 ${getViewModeFilterClass()}`}
                  priority
                />

                <div
                  className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40 transition-opacity"
                  style={{
                    background: `radial-gradient(circle at ${mouseTilt.glareX}% ${mouseTilt.glareY}%, rgba(45, 212, 191, 0.4) 0%, transparent 60%)`,
                  }}
                />

                {visibleHotspots.map((hotspot) => {
                  const isSelected = activeHotspotId === hotspot.id;
                  const colors = getCategoryColor(hotspot.structureCategory);
                  return (
                    <div
                      key={hotspot.id}
                      style={{
                        top: `${hotspot.y}%`,
                        left: `${hotspot.x}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                    >
                      <span className="absolute -inset-2.5 rounded-full pointer-events-none flex items-center justify-center">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            isSelected ? colors.bg : 'bg-teal-400/50'
                          }`}
                        />
                        <span
                          className={`relative inline-flex rounded-full h-3 w-3 ${
                            isSelected ? colors.bg : 'bg-teal-400'
                          }`}
                        />
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectHotspot(hotspot);
                        }}
                        className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-slate-950 font-extrabold text-[10px] border-2 shadow-xl transition-all duration-200 cursor-pointer ${
                          colors.bg
                        } ${colors.border} ${
                          isSelected
                            ? 'scale-125 ring-4 ring-white/60 shadow-teal-500/50'
                            : 'hover:scale-115 group-hover:ring-2 ring-white/40'
                        }`}
                        title={`${hotspot.name} (${hotspot.associatedCode})`}
                      >
                        <Crosshair className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                      </button>

                      <div className="absolute left-1/2 -translate-x-1/2 top-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-30">
                        <div className="px-2 py-1 rounded-md bg-slate-900/95 border border-slate-700 text-[10px] font-mono text-white shadow-xl backdrop-blur-sm flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.bg}`} />
                          <span>{hotspot.name}</span>
                          <span className="text-teal-300 font-bold">[{hotspot.associatedCode}]</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs z-30 pointer-events-auto">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-750 text-teal-300 font-mono text-[11px] backdrop-blur-sm">
                  <Activity className="w-3 h-3 text-teal-400" />
                  <span>Interactive 3D Dissection</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">{visibleHotspots.length} Active Hotspots</span>
                </span>

                {zoomLevel > 1 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700 text-amber-300 font-mono text-[10px]">
                    <Move className="w-2.5 h-2.5" /> Drag to Pan
                  </span>
                )}
              </div>
            </div>

            {/* Depth Layer Filter Pills */}
            <div className="flex items-center justify-between gap-2 p-2 bg-slate-800/40 border border-slate-750 rounded-xl text-xs">
              <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                <Layers className="w-3 h-3 text-teal-400" /> Dissection Depth:
              </span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: 'all', label: 'All Depths' },
                    { id: 'superficial', label: 'Superficial' },
                    { id: 'intermediate', label: 'Intermediate' },
                    { id: 'deep', label: 'Deep Visceral' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDepthFilter(d.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                      depthFilter === d.id
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Floating Callout Card for Active Hotspot */}
            {activeHotspot && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border border-teal-500/50 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          getCategoryColor(activeHotspot.structureCategory).badge
                        }`}
                      >
                        {activeHotspot.structureCategory} • {activeHotspot.dissectionDepth}
                      </span>
                      {activeHotspot.latinName && (
                        <span className="text-xs text-slate-400 italic">
                          {activeHotspot.latinName}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-extrabold text-white mt-1">
                      {activeHotspot.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveHotspotId(null)}
                    className="p-1 rounded-lg bg-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
                    title="Close Callout"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-750">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Associated Code:</span>
                    <span className="text-sm font-mono font-bold text-teal-300">{activeHotspot.associatedCode}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-750">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Mandatory Modifier:</span>
                    <span className="text-sm font-mono font-bold text-amber-300">
                      {activeHotspot.associatedModifier || 'Standard'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-slate-200">Anatomical Dissection Note: </strong>
                  {activeHotspot.clinicalSignificance}
                </div>

                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs space-y-1">
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Human Sovereign Sign-Off Check:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {activeHotspot.sovereignGateCheck}
                  </p>
                </div>

                <button
                  onClick={() => jumpToHotspotCode(activeHotspot.associatedCode)}
                  className="w-full py-2 px-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-teal-500/20 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Jump to {activeHotspot.associatedCode} in Telemetry &amp; NCCI Console
                </button>
              </div>
            )}

            {/* Anatomical Landmark Spotlight Chips */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  Verified Anatomical Structures ({activeSystem.hotspots?.length || 0})
                </span>
                <span className="text-[10px] font-mono text-slate-500">Click any landmark to inspect</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activeSystem.hotspots?.map((hotspot) => {
                  const isSelected = activeHotspotId === hotspot.id;
                  const catColor = getCategoryColor(hotspot.structureCategory);
                  return (
                    <button
                      key={hotspot.id}
                      onClick={() => selectHotspot(hotspot)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950 border-teal-300 font-bold shadow-md shadow-teal-500/25 scale-[1.03]'
                          : 'bg-slate-800/60 text-slate-300 border-slate-750 hover:bg-slate-750 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : catColor.bg}`} />
                      <span>{hotspot.name}</span>
                      <span className="font-mono text-[10px] opacity-75">({hotspot.associatedCode})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clinical Overview Note */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-teal-300">RCM Clinical Significance: </span>
              {activeSystem.clinicalOverview}
            </div>
          </div>

          {/* Right Column: RCM Coding & Sovereign Gate Telemetry Console (6 cols) */}
          <div className="lg:col-span-6 bg-slate-850 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-6">
            <div className="flex items-center gap-1 border-b border-slate-750 pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('codes')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'codes'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                1. Procedure Codes ({activeSystem.codes.length})
              </button>
              <button
                onClick={() => setActiveTab('modifiers')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'modifiers'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                2. Mandatory Modifiers ({activeSystem.mandatoryModifiers.length})
              </button>
              <button
                onClick={() => setActiveTab('ncci')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'ncci'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                3. NCCI Bundling Trap
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'cases'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                4. Clinical Case Study
              </button>
              <button
                onClick={() => setActiveTab('sovereign')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'sovereign'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                5. Sovereign Sign-Off Gate
              </button>
            </div>

            {/* TAB CONTENT 1: CODES */}
            {activeTab === 'codes' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Code &amp; Classification</span>
                  <span>Global Period / Billing Rules</span>
                </div>
                {activeSystem.codes.map((c) => {
                  const isHotspotMatch = activeHotspot?.associatedCode === c.code;
                  return (
                    <div
                      key={c.code}
                      id={`telemetry-code-${c.code.replace(/[^a-zA-Z0-9]/g, '')}`}
                      className={`p-4 rounded-xl transition-all space-y-2 border ${
                        isHotspotMatch
                          ? 'bg-slate-800 border-teal-400 shadow-lg shadow-teal-500/20 ring-1 ring-teal-400'
                          : 'bg-slate-800/80 border-slate-700/80 hover:border-teal-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-extrabold text-teal-300">{c.code}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-700 text-slate-300">
                            {c.system}
                          </span>
                          <span className="text-xs text-slate-400">• {c.category}</span>
                        </div>
                        {c.globalPeriod && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-teal-950 border border-teal-800/60 text-teal-400">
                            {c.globalPeriod}
                          </span>
                        )}
                      </div>

                      {isHotspotMatch && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-950/80 border border-teal-700 text-[10px] font-mono text-teal-300">
                          <Crosshair className="w-3 h-3 text-teal-400" />
                          Active 3D Landmark Selected: {activeHotspot.name}
                        </div>
                      )}

                      <div className="text-sm font-semibold text-white">{c.name}</div>
                      <div className="text-xs text-slate-300 leading-relaxed">{c.description}</div>
                      {c.crossCodeNotice && (
                        <div className="mt-1 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{c.crossCodeNotice}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT 2: MODIFIERS */}
            {activeTab === 'modifiers' && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Payers enforce automated rejection filters on claims lacking anatomical specificity. The following
                  modifiers are legally required for this anatomical compartment:
                </p>
                {activeSystem.mandatoryModifiers.map((mod) => (
                  <div
                    key={mod.modifier}
                    className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60">
                        {mod.modifier}
                      </span>
                      <span className="text-sm font-bold text-white">{mod.name}</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      <strong className="text-slate-200">Payer Requirement: </strong>
                      {mod.rule}
                    </div>
                    <div className="text-xs text-teal-300/90 bg-teal-950/40 p-2 rounded border border-teal-900/50">
                      <strong className="text-teal-200">Human Attestation: </strong>
                      {mod.attestationRequirement}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT 3: NCCI BUNDLING TRAP */}
            {activeTab === 'ncci' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{activeSystem.ncciBundlingTrap.ruleTitle}</span>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-900/60 text-rose-200 border border-rose-700/60">
                    {activeSystem.ncciBundlingTrap.carcCode}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeSystem.ncciBundlingTrap.conflictDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1.5">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Algorithmic Detection
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeSystem.ncciBundlingTrap.algorithmicDetection}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Human Sovereign Resolution
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeSystem.ncciBundlingTrap.humanResolution}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: CASES */}
            {activeTab === 'cases' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <div>
                    <span className="text-[11px] font-mono text-teal-400 uppercase tracking-widest font-bold">
                      Clinical Encounter
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {activeSystem.clinicalCaseScenario.patientCondition}
                    </h4>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-200">Operative Findings: </strong>
                    {activeSystem.clinicalCaseScenario.operativeFindings}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs space-y-1">
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> What Autonomous AI Failed:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {activeSystem.clinicalCaseScenario.unbundledAIFailure}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs space-y-1">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Certified Human Action:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {activeSystem.clinicalCaseScenario.certifiedHumanSignOff}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-teal-950/60 border border-teal-800/60 text-xs text-teal-200 font-mono flex items-center justify-between">
                    <span>Financial &amp; Compliance Result:</span>
                    <strong className="text-emerald-400">{activeSystem.clinicalCaseScenario.financialVariance}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: SOVEREIGN SIGN-OFF GATE */}
            {activeTab === 'sovereign' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-teal-400 font-bold uppercase tracking-wider">
                        Mandatory Audit Authority
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        {activeSystem.sovereignGateSignOff.auditorCredentials}
                      </h4>
                    </div>
                    {signedOffSystems[activeSystem.id] ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Claim Signed &amp; Dispatched
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-700/60 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Human Gate Pending
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Required Evidentiary Documentation:
                    </p>
                    <ul className="space-y-1.5">
                      {activeSystem.sovereignGateSignOff.requiredDocumentation.map((doc, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-750 text-xs text-slate-300 italic">
                    &ldquo;{activeSystem.sovereignGateSignOff.attestationStatement}&rdquo;
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleSignOff(activeSystem.id)}
                      disabled={signedOffSystems[activeSystem.id]}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                        signedOffSystems[activeSystem.id]
                          ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/60 cursor-default'
                          : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 font-extrabold hover:scale-[1.01]'
                      }`}
                    >
                      <Fingerprint className="w-4 h-4" />
                      {signedOffSystems[activeSystem.id]
                        ? 'Digital Cryptographic SHA-256 Signature Sealed • Certified Clean'
                        : 'Sign Off as Certified Coder & Authorize Claim Dispatch'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
