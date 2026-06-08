'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, Search, ArrowRight, ArrowUpRight, Mail, CheckCircle,
  TrendingDown, FileWarning, Timer, RefreshCw, Sparkles,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import { submitToWorker } from '@/lib/worker';
import { POSTS } from '@/lib/blogPosts';

const blogPosts = POSTS;

const CAT_COLOR: Record<string, string> = {
  'Denials & Appeals': '#ef4444', 'Revenue Cycle': '#0ea5a4', 'Practice Management': '#0f2a43',
  'Telehealth': '#6366f1', 'Patient Access & Collections': '#d97706', 'Credentialing & Enrollment': '#0891b2',
  'Compliance & Privacy': '#7c3aed', 'Medical Coding': '#059669', 'Prior Authorization': '#db2777',
  'Data & Analytics': '#0d9488', 'Payer Contracting': '#b45309', 'Regulatory & Policy': '#1d4ed8',
  'Medicare & Medicaid': '#0e7490', 'Value-Based Care': '#16a34a', 'Clinical Documentation': '#9333ea',
  'Technology & AI': '#4f46e5', 'Specialty Billing': '#c026d3',
};
const catColor = (c: string) => CAT_COLOR[c] || '#0ea5a4';

const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const PULSE = [
  { icon: <FileWarning className="h-5 w-5" />, stat: '~11%', label: 'of claims are denied on first submission' },
  { icon: <RefreshCw className="h-5 w-5" />, stat: '~$25', label: 'average cost to rework a single denied claim' },
  { icon: <Timer className="h-5 w-5" />, stat: '≤ 35 days', label: 'best-practice days in A/R benchmark' },
  { icon: <TrendingDown className="h-5 w-5" />, stat: '60%+', label: 'of denials are never reworked or appealed' },
];

export default function BlogIndexClient() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('All');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const categories = useMemo(() => ['All', ...Array.from(new Set(blogPosts.map((p) => p.category)))], []);
  const featured = blogPosts[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogPosts.filter((p) => {
      const inCat = active === 'All' || p.category === active;
      const inQ = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      return inCat && inQ;
    });
  }, [query, active]);

  const gridPosts = active === 'All' && !query.trim() ? filtered.filter((p) => p.slug !== featured.slug) : filtered;

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    void submitToWorker('contact_message', {
      name: 'Newsletter Subscriber', email: email.trim(),
      message: 'Subscribed to The Aethera Pulse newsletter from the blog page.',
    });
    setSubscribed(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-navy via-navy to-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-mint/15 to-transparent"></div>
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-mint/10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn>
            <div className="inline-flex items-center bg-mint/20 border border-mint/40 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="h-4 w-4 text-mint mr-2" />
              <span className="text-mint text-sm font-semibold tracking-wide">THE AETHERA PULSE · U.S. HEALTHCARE RCM</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-5 leading-tight max-w-4xl">
              The business of getting paid in American healthcare.
            </h1>
            <p className="text-xl text-cream/90 max-w-2xl mb-10">
              Denials, prior auth, coding, compliance, payer contracts, policy and the tech reshaping the revenue cycle — decoded into plays your practice can run this week.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {PULSE.map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-mint mb-1">{s.icon}<span className="text-2xl font-bold text-white">{s.stat}</span></div>
                  <p className="text-cream/70 text-xs leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-cream/40 text-[11px] mt-2">Illustrative U.S. industry benchmarks — your numbers may vary. Run a <Link prefetch={false} href="/free-assessment" className="underline hover:text-mint">free A/R analysis</Link> to see yours.</p>
          </FadeIn>
        </div>
      </section>

      <section className="bg-white border-b border-gray/10 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative lg:w-72 flex-shrink-0">
            <Search className="h-4 w-4 text-gray absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles…" aria-label="Search articles"
              className="w-full border border-gray/30 rounded-full pl-9 pr-4 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1">
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => setActive(c)}
                className={`whitespace-nowrap text-sm font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${active === c ? 'bg-navy text-white border-navy' : 'bg-white text-gray border-gray/30 hover:border-teal hover:text-teal'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {active === 'All' && !query.trim() && (
        <section className="py-12 md:py-16 bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <Link prefetch={false} href={`/blog/${featured.slug}`} className="group grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden border border-gray/10 shadow-sm hover:shadow-xl transition-shadow">
                <div className="relative h-64 lg:h-auto overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.image} alt={featured.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-4 left-4 inline-flex items-center text-white text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: catColor(featured.category) }}>FEATURED</span>
                </div>
                <div className="p-8 lg:p-10 flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: catColor(featured.category) }}>{featured.category}</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-navy font-playfair mb-3 leading-tight group-hover:text-teal transition-colors">{featured.title}</h2>
                  <p className="text-gray mb-5">{featured.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-gray mb-6">
                    <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" />{fmtDate(featured.date)}</span>
                    <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" />{featured.readTime}</span>
                    <span>By {featured.author}</span>
                  </div>
                  <span className="inline-flex items-center text-teal font-bold group-hover:text-navy transition-colors">Read the story <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform" /></span>
                </div>
              </Link>
            </FadeIn>
          </div>
        </section>
      )}

      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl font-bold text-navy font-playfair">{active === 'All' && !query.trim() ? 'Latest articles' : `${gridPosts.length} ${gridPosts.length === 1 ? 'article' : 'articles'}`}</h2>
            {(active !== 'All' || query.trim()) && (
              <button type="button" onClick={() => { setActive('All'); setQuery(''); }} className="text-sm font-semibold text-teal hover:text-navy">Clear filters</button>
            )}
          </div>

          {gridPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-navy font-semibold mb-1">No articles match that search.</p>
              <p className="text-gray text-sm">Try a different keyword or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {gridPosts.map((post, i) => (
                <FadeIn key={post.slug} delay={(i % 3) * 0.08}>
                  <Link prefetch={false} href={`/blog/${post.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="relative h-44 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.image} alt={post.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 left-3 text-white text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: catColor(post.category) }}>{post.category}</span>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-navy mb-2 leading-snug group-hover:text-teal transition-colors">{post.title}</h3>
                      <p className="text-gray text-sm flex-grow">{post.excerpt}</p>
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray/10 text-xs text-gray">
                        <span>{post.author}</span>
                        <span className="flex items-center gap-3">
                          <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" />{post.readTime.replace(' read', '')}</span>
                          <ArrowUpRight className="h-4 w-4 text-teal group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-14 md:py-20 bg-gradient-to-br from-navy to-teal relative overflow-hidden">
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-mint/10 blur-3xl"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {subscribed ? (
            <FadeIn>
              <CheckCircle className="h-12 w-12 text-mint mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-white font-playfair mb-2">You&apos;re on the list.</h2>
              <p className="text-cream/80">Watch <strong className="text-white">{email}</strong> for The Aethera Pulse — practical RCM insights, no fluff.</p>
            </FadeIn>
          ) : (
            <FadeIn>
              <Mail className="h-10 w-10 text-mint mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-3">Get The Aethera Pulse</h2>
              <p className="text-cream/85 mb-8 max-w-xl mx-auto">Revenue cycle strategies, payer intel, policy updates and benchmarks for U.S. practices — to your inbox. No spam, unsubscribe anytime.</p>
              <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourpractice.com" aria-label="Email address"
                  className="flex-grow border border-white/30 bg-white/95 rounded-full px-5 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-mint" />
                <button type="submit" className="bg-mint hover:bg-white text-navy font-bold py-3 px-7 rounded-full transition-colors whitespace-nowrap">Subscribe</button>
              </form>
              <p className="text-cream/50 text-xs mt-4">Or skip ahead — <Link prefetch={false} href="/free-assessment" className="underline hover:text-mint">run a free A/R gap analysis</Link>.</p>
            </FadeIn>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
