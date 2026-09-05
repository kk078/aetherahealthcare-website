'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, BookOpen, ExternalLink, Copy, Check, Filter } from 'lucide-react';
import { GLOSSARY_TERMS, type GlossaryTerm } from '@/lib/glossaryData';

export type { GlossaryTerm };

export default function RcmGlossary() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Terms' },
    { id: 'claims', label: 'Billing & Claims' },
    { id: 'coding', label: 'Coding & Modifiers' },
    { id: 'payer', label: 'Payer & Compliance' },
    { id: 'tech', label: 'Technology & EDI' },
    { id: 'metrics', label: 'Financial Metrics' },
  ];

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter(t => {
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesQuery =
        !q ||
        t.term.toLowerCase().includes(q) ||
        (t.acronym && t.acronym.toLowerCase().includes(q)) ||
        t.definition.toLowerCase().includes(q) ||
        t.example.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [search, selectedCategory]);

  const copyToClipboard = (term: GlossaryTerm) => {
    const text = `${term.term}: ${term.definition}\nClinical Impact: ${term.clinicalImpact}\nExample: ${term.example}`;
    navigator.clipboard.writeText(text);
    setCopiedTerm(term.term);
    setTimeout(() => setCopiedTerm(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray/15 p-6 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search RCM acronyms, coding rules, EDI terms (e.g. 835, NCCI, Modifier 25, CARC, RVU)..."
            className="w-full pl-12 pr-4 py-3.5 bg-cream/50 border border-gray/20 rounded-xl text-navy placeholder:text-gray/60 focus:outline-none focus:ring-2 focus:ring-teal focus:bg-white text-sm sm:text-base font-medium transition-all"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray/10 items-center">
          <span className="text-xs font-bold text-gray uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-teal text-white shadow-xs'
                  : 'bg-cream text-navy hover:bg-teal/10 border border-gray/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="text-xs text-gray ml-auto font-mono">
            Showing {filteredTerms.length} of {GLOSSARY_TERMS.length} terms
          </span>
        </div>
      </div>

      {/* Glossary Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredTerms.map((item) => (
          <div
            key={item.term}
            className="bg-white rounded-2xl border border-gray/15 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal/10 text-teal mb-1.5">
                    {item.categoryLabel}
                  </span>
                  <h3 className="font-jakarta text-lg font-bold text-navy group-hover:text-teal transition-colors">
                    {item.term}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(item)}
                  title="Copy definition to clipboard"
                  className="p-1.5 rounded-lg text-gray hover:text-navy hover:bg-cream transition-colors shrink-0"
                >
                  {copiedTerm === item.term ? (
                    <Check className="h-4 w-4 text-emerald" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                {item.definition}
              </p>

              <div className="space-y-3 pt-3 border-t border-gray/10 text-xs">
                <div>
                  <span className="font-bold text-navy block mb-0.5">Clinical &amp; Revenue Impact:</span>
                  <p className="text-gray leading-relaxed">{item.clinicalImpact}</p>
                </div>
                <div>
                  <span className="font-bold text-teal block mb-0.5">Real-World Scenario:</span>
                  <p className="text-slate-600 bg-cream/60 p-2.5 rounded-lg border border-gray/10 italic">
                    &ldquo;{item.example}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {item.toolHref && (
              <div className="mt-5 pt-3 border-t border-gray/10 flex items-center justify-between">
                <span className="text-[11px] text-gray font-medium">Interactive Resource</span>
                <Link
                  prefetch={false}
                  href={item.toolHref}
                  className="inline-flex items-center text-xs font-bold text-teal hover:text-navy group/link"
                >
                  {item.toolLabel} <ExternalLink className="h-3 w-3 ml-1 transition-transform group-hover/link:translate-x-0.5" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray/15 p-12 text-center">
          <BookOpen className="h-10 w-10 text-gray/40 mx-auto mb-3" />
          <p className="text-navy font-bold text-lg mb-1">No glossary terms matched &ldquo;{search}&rdquo;</p>
          <p className="text-gray text-sm mb-4">Try searching for an acronym like EDI 835, CARC, NCCI, or RVU.</p>
          <button
            type="button"
            onClick={() => { setSearch(''); setSelectedCategory('all'); }}
            className="px-4 py-2 bg-teal text-white rounded-xl text-xs font-bold hover:bg-navy transition-colors"
          >
            Clear Search Filter
          </button>
        </div>
      )}
    </div>
  );
}
