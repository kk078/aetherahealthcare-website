'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building2,
  Wrench,
  Stethoscope,
  FileText,
  Rocket,
  ChevronRight,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  searchIndex,
  type SearchItem,
  type SearchCategory,
} from '@/lib/searchIndex';

const CATEGORIES: { key: SearchCategory; label: string }[] = [
  { key: 'all', label: 'All Results' },
  { key: 'payers', label: 'Payers (10,600+)' },
  { key: 'denials', label: 'Denial Codes' },
  { key: 'tools', label: 'Free Tools (33)' },
  { key: 'specialties', label: 'Specialties' },
  { key: 'services', label: 'RCM Services' },
];

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inspectingDenial, setInspectingDenial] = useState<SearchItem['denialDetail'] | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setInspectingDenial(null);
  }, []);

  // Filtered and searched items
  const results = useMemo(() => {
    return searchIndex(query, activeCategory, 30);
  }, [query, activeCategory]);

  // Open / Close keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle palette on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          if (prev) {
            setInspectingDenial(null);
            return false;
          }
          return true;
        });
      }

      // Close on Escape if open
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        if (inspectingDenial) {
          setInspectingDenial(null);
        } else {
          closePalette();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inspectingDenial, closePalette]);

  // Custom event listener for external triggers
  useEffect(() => {
    const handleCustomOpen = (e: Event) => {
      const custom = e as CustomEvent<{ query?: string; category?: SearchCategory }>;
      setIsOpen(true);
      if (custom.detail?.query !== undefined) {
        setQuery(custom.detail.query);
      }
      if (custom.detail?.category) {
        setActiveCategory(custom.detail.category);
      }
      setSelectedIndex(0);
      setInspectingDenial(null);
    };

    window.addEventListener('open-command-palette', handleCustomOpen);
    return () => window.removeEventListener('open-command-palette', handleCustomOpen);
  }, []);

  // Focus input & handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(0);
  };

  const handleCategoryChange = (cat: SearchCategory) => {
    setActiveCategory(cat);
    setSelectedIndex(0);
  };

  const handleSelect = useCallback((item: SearchItem) => {
    if (item.actionDetail?.type === 'expert_chat') {
      closePalette();
      window.dispatchEvent(
        new CustomEvent('open-expert-modal', {
          detail: { mode: 'chat', initialQuery: query ? `Tell me about ${query}` : undefined },
        })
      );
      return;
    }

    if (item.actionDetail?.type === 'theme_toggle') {
      closePalette();
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('aethera-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('aethera-theme', 'clinical-dark');
      }
      window.dispatchEvent(new CustomEvent('aethera-theme-change'));
      return;
    }

    if (item.actionDetail?.type === 'print_page') {
      closePalette();
      setTimeout(() => window.print(), 150);
      return;
    }

    if (item.href) {
      closePalette();
      router.push(item.href);
    }
  }, [query, router, closePalette]);

  const triggerAiExpertWithQuery = useCallback((userQuery: string) => {
    closePalette();
    window.dispatchEvent(
      new CustomEvent('open-expert-modal', {
        detail: {
          mode: 'chat',
          initialQuery: userQuery
            ? `Can you explain the medical billing and RCM rules for: ${userQuery}?`
            : undefined,
        },
      })
    );
  }, [closePalette]);

  // Arrow key navigation inside list
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalCount = results.length + (query.trim() ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalCount));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalCount) % Math.max(1, totalCount));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (query.trim()) {
        triggerAiExpertWithQuery(query);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Search and RCM Command Palette"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6 animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#001A52]/70 backdrop-blur-md transition-opacity"
        onClick={closePalette}
        aria-hidden="true"
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#003087]/20 flex flex-col max-h-[82vh] overflow-hidden z-10">
        
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="h-5 w-5 text-[#003087] shrink-0 ml-1 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleInputKeyDown}
            placeholder="Search 10,600+ payers, 1,283+ denial codes, calculators, specialties…"
            className="w-full bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-base sm:text-lg focus:outline-none"
            aria-label="Search across Aethera Healthcare"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors mr-2"
              aria-label="Clear query"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold text-slate-500 bg-white rounded-lg border border-slate-200 shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 bg-white overflow-x-auto no-scrollbar text-xs">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleCategoryChange(cat.key)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full font-medium transition-colors ${
                  isActive
                    ? 'bg-[#003087] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body: Split or Full List */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Results Column */}
          <div
            ref={listRef}
            className={`flex-1 overflow-y-auto divide-y divide-slate-100 p-2 ${
              inspectingDenial ? 'hidden md:block md:w-1/2 md:border-r md:border-slate-100' : 'w-full'
            }`}
          >
            {results.length === 0 && !query.trim() ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                Type a payer name (e.g. &ldquo;Aetna&rdquo;), denial code (&ldquo;CO-16&rdquo;), or tool (&ldquo;calculator&rdquo;)
              </div>
            ) : null}

            {results.map((item, index) => {
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  data-index={index}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => handleSelect(item)}
                  className={`group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#F0F4FB] text-[#001A52]'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  {/* Category Icon */}
                  <div
                    className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center mt-0.5 ${
                      item.category === 'payers'
                        ? 'bg-blue-50 text-[#003087]'
                        : item.category === 'denials'
                        ? 'bg-amber-50 text-amber-600'
                        : item.category === 'tools'
                        ? 'bg-teal-50 text-teal-700'
                        : item.category === 'specialties'
                        ? 'bg-purple-50 text-purple-700'
                        : item.category === 'actions'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.category === 'payers' && <Building2 className="h-4 w-4" />}
                    {item.category === 'denials' && <ShieldAlert className="h-4 w-4" />}
                    {item.category === 'tools' && <Wrench className="h-4 w-4" />}
                    {item.category === 'specialties' && <Stethoscope className="h-4 w-4" />}
                    {item.category === 'services' && <FileText className="h-4 w-4" />}
                    {item.category === 'actions' && <Rocket className="h-4 w-4" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm leading-tight text-[#001A52]">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            item.badgeVariant === 'blue'
                              ? 'bg-blue-100 text-[#003087]'
                              : item.badgeVariant === 'emerald'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.badgeVariant === 'amber'
                              ? 'bg-amber-100 text-amber-800'
                              : item.badgeVariant === 'purple'
                              ? 'bg-purple-100 text-purple-800'
                              : item.badgeVariant === 'teal'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {item.subtitle && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.subtitle}</p>
                    )}

                    {/* Quick inline metadata for Payers */}
                    {item.payerDetail?.timelyFiling && (
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-teal-700 font-medium">
                        <Clock className="h-3 w-3" />
                        <span className="line-clamp-1">{item.payerDetail.timelyFiling}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Action / Inspect */}
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    {item.denialDetail && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingDenial(item.denialDetail || null);
                        }}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#003087] hover:bg-[#F0F4FB] transition-colors"
                        title="Quick View Root Cause"
                      >
                        Playbook
                      </button>
                    )}
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        isSelected ? 'text-[#003087] translate-x-0.5' : 'text-slate-300'
                      }`}
                    />
                  </div>
                </div>
              );
            })}

            {/* Smart Fallback: Query AI Expert */}
            {query.trim() ? (
              <div
                data-index={results.length}
                onMouseEnter={() => setSelectedIndex(results.length)}
                onClick={() => triggerAiExpertWithQuery(query)}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer transition-all border border-mint/40 ${
                  selectedIndex === results.length
                    ? 'bg-mint/15 ring-2 ring-[#003087]'
                    : 'bg-mint/5 hover:bg-mint/10'
                }`}
              >
                <div className="h-9 w-9 rounded-xl bg-[#003087] text-white flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-mint animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#001A52] line-clamp-1">
                    Ask AI Expert: &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-slate-600">
                    Get grounded RCM intelligence, appeal guidance &amp; direct escalation
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#003087] flex items-center gap-1 shrink-0">
                  Ask AI <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            ) : null}
          </div>

          {/* Denial Code Side-Inspector (when activated) */}
          {inspectingDenial && (
            <div className="w-full md:w-1/2 p-4 bg-slate-50 overflow-y-auto flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 animate-in fade-in duration-150">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-[#003087] text-white font-mono font-bold text-xs">
                      {inspectingDenial.type} {inspectingDenial.code}
                    </span>
                    {inspectingDenial.difficulty && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wide">
                        {inspectingDenial.difficulty}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectingDenial(null)}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
                    aria-label="Close details"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-3 text-xs text-slate-700">
                  {inspectingDenial.category && (
                    <div>
                      <span className="font-bold text-[#001A52] uppercase tracking-wider block text-[10px] mb-0.5">
                        Category
                      </span>
                      <p className="font-medium text-slate-800">{inspectingDenial.category}</p>
                    </div>
                  )}

                  {inspectingDenial.rootCause && (
                    <div>
                      <span className="font-bold text-red-700 uppercase tracking-wider block text-[10px] mb-0.5">
                        Root Cause
                      </span>
                      <p className="bg-red-50/70 p-2.5 rounded-lg border border-red-100 leading-relaxed text-slate-800">
                        {inspectingDenial.rootCause}
                      </p>
                    </div>
                  )}

                  {inspectingDenial.workIt && (
                    <div>
                      <span className="font-bold text-teal-800 uppercase tracking-wider block text-[10px] mb-0.5">
                        How AR Rep Resolves It
                      </span>
                      <p className="bg-teal-50/70 p-2.5 rounded-lg border border-teal-100 leading-relaxed text-slate-800">
                        {inspectingDenial.workIt}
                      </p>
                    </div>
                  )}

                  {inspectingDenial.prevent && (
                    <div>
                      <span className="font-bold text-emerald-800 uppercase tracking-wider block text-[10px] mb-0.5">
                        Front-End Prevention
                      </span>
                      <p className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100 leading-relaxed text-slate-800">
                        {inspectingDenial.prevent}
                      </p>
                    </div>
                  )}

                  {inspectingDenial.rarc && (
                    <div>
                      <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-0.5">
                        Commonly Paired RARCs
                      </span>
                      <p className="font-mono text-slate-600 bg-white p-2 rounded border border-slate-200">
                        {inspectingDenial.rarc}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons in Inspector */}
              <div className="pt-4 mt-4 border-t border-slate-200 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closePalette();
                    router.push(`/tools/denial-code-lookup?code=${encodeURIComponent(inspectingDenial.code)}`);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#003087] text-white font-semibold text-xs hover:bg-[#001A52] transition-colors"
                >
                  <span>Open in Denial Code Tool</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closePalette();
                    window.dispatchEvent(
                      new CustomEvent('open-expert-modal', {
                        detail: {
                          mode: 'chat',
                          initialQuery: `How do I write an appeal letter for denial code ${inspectingDenial.type} ${inspectingDenial.code}?`,
                        },
                      })
                    );
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-slate-300 text-[#003087] font-semibold text-xs hover:bg-slate-100 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                  <span>Draft Appeal with AI Expert</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Navigation Hints */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-200 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-200 rounded">↓</kbd>
              <span className="text-slate-400">to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-200 rounded">↵</kbd>
              <span className="text-slate-400">to select</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-200 rounded">ESC</kbd>
              <span className="text-slate-400">to close</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Instant Grounded RCM Search</span>
          </div>
        </div>

      </div>
    </div>
  );
}
