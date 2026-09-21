'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, Cpu, UserCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CODE_SYSTEMS_DATA } from '@/data/autonomyData';

type FilterSystem = 'ALL' | 'CPT' | 'CDT' | 'NDC' | 'MODIFIER' | 'ICD-10';

export default function AutonomyCodeExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<FilterSystem>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('cpt-99214');

  const filteredCodes = useMemo(() => {
    return CODE_SYSTEMS_DATA.filter((item) => {
      const matchesSystem = selectedSystem === 'ALL' || item.system === selectedSystem;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesSystem;
      const hay = `${item.code} ${item.title} ${item.category} ${item.plainEnglishDescription} ${item.tags.join(' ')}`.toLowerCase();
      return matchesSystem && hay.includes(q);
    });
  }, [searchQuery, selectedSystem]);

  const counts = useMemo(() => {
    return {
      ALL: CODE_SYSTEMS_DATA.length,
      CPT: CODE_SYSTEMS_DATA.filter((c) => c.system === 'CPT').length,
      CDT: CODE_SYSTEMS_DATA.filter((c) => c.system === 'CDT').length,
      NDC: CODE_SYSTEMS_DATA.filter((c) => c.system === 'NDC').length,
      MODIFIER: CODE_SYSTEMS_DATA.filter((c) => c.system === 'MODIFIER').length,
      'ICD-10': CODE_SYSTEMS_DATA.filter((c) => c.system === 'ICD-10').length,
    };
  }, []);

  return (
    <div id="code-explorer" className="scroll-mt-24 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal bg-teal/10 px-3 py-1 rounded-full mb-2">
            <Cpu className="h-3.5 w-3.5" /> Full Code Systems Directory
          </div>
          <h3 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
            Search CPT, CDT, NDC &amp; Modifiers in Full
          </h3>
          <p className="text-gray text-sm mt-1">
            Every code shows its plain-English meaning, what our algorithms test, and what certified humans sign off on.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, modifier, drug, tooth..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray/20 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
          />
        </div>
      </div>

      {/* System Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'CPT', 'CDT', 'NDC', 'MODIFIER', 'ICD-10'] as FilterSystem[]).map((sys) => (
          <button
            key={sys}
            onClick={() => setSelectedSystem(sys)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedSystem === sys
                ? 'bg-navy text-white shadow-sm'
                : 'bg-cream text-gray hover:text-navy hover:bg-slate-100 border border-gray/10'
            }`}
          >
            {sys === 'ALL' ? 'All Codes' : sys === 'MODIFIER' ? 'Modifiers' : sys}{' '}
            <span className={selectedSystem === sys ? 'text-white/70' : 'text-gray'}>
              ({counts[sys]})
            </span>
          </button>
        ))}
      </div>

      {/* Code List Cards */}
      <div className="space-y-3">
        {filteredCodes.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-cream border border-gray/10">
            <p className="text-sm text-gray">No codes found matching &ldquo;{searchQuery}&rdquo;.</p>
          </div>
        ) : (
          filteredCodes.map((item) => {
            const isOpen = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray/15 hover:border-teal/40 transition-all duration-200 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpandedId(isOpen ? null : item.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-cream/40 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="shrink-0 min-w-[5.5rem] h-10 px-2.5 rounded-xl bg-navy text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm">
                      {item.code}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal font-mono">
                          {item.system} • {item.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-navy text-base leading-snug">{item.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Human Gate
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-teal' : ''
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 pt-2 border-t border-gray/10 space-y-5 bg-gradient-to-b from-cream/30 to-white">
                    {/* Plain English explanation */}
                    <div className="p-4 rounded-xl bg-cream border border-gray/10">
                      <p className="text-xs font-bold text-gray uppercase tracking-wider mb-1">
                        Plain-English Meaning
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {item.plainEnglishDescription}
                      </p>
                    </div>

                    {/* Anatomy breakdown pills if present */}
                    {item.anatomyBreakdown && item.anatomyBreakdown.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray uppercase tracking-wider mb-2">
                          Code Anatomy Breakdown
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.anatomyBreakdown.map((b, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-white border border-gray/15 text-xs text-navy font-mono flex items-center gap-2"
                            >
                              <span className="h-2 w-2 rounded-full bg-teal shrink-0" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2-Column AI vs Human Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* What AI does */}
                      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                          <Cpu className="h-4 w-4 text-emerald-600" />
                          Deterministic Software Check (Algorithmic)
                        </div>
                        <p className="text-xs text-emerald-950 leading-relaxed">
                          {item.aiDeterministicRole}
                        </p>
                      </div>

                      {/* What Human does */}
                      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                          <UserCheck className="h-4 w-4 text-amber-600" />
                          Certified Human Coder Sign-Off (Sovereign Gate)
                        </div>
                        <p className="text-xs text-amber-950 leading-relaxed">
                          {item.humanSovereigntyRole}
                        </p>
                      </div>
                    </div>

                    {/* Denial Risk & Clinical Example */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 text-red-900 space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-red-800 uppercase tracking-wide text-[11px]">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-600" /> Audit &amp; Denial Risk
                        </p>
                        <p className="leading-relaxed">{item.auditAndDenialRisk}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1">
                        <p className="font-bold text-navy uppercase tracking-wide text-[11px]">
                          Clinical Encounter Example
                        </p>
                        <p className="leading-relaxed">{item.clinicalExample}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
