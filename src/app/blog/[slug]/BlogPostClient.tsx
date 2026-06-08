'use client';

import Link from 'next/link';
import { Calendar, Clock, Tag, User, ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';

interface Related { slug: string; title: string; image: string; }
interface PostProp {
  slug: string; title: string; date: string; author: string; readTime: string;
  category: string; image: string; excerpt: string; content: string; relatedPosts: Related[];
}

export default function BlogPostClient({ post }: { post: PostProp }) {
  const base = 'https://aetherahealthcare.com';
  const breadcrumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${base}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${base}/blog/${post.slug}` },
    ],
  };
  const blogPostSchema = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${base}/blog/${post.slug}` },
    headline: post.title, description: post.excerpt, datePublished: post.date, dateModified: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'Aethera Healthcare Solutions', logo: { '@type': 'ImageObject', url: `${base}/logo.png` } },
    image: post.image, keywords: post.category,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }} />
      <Navbar />

      <section className="pt-24 pb-8 md:pt-32 md:pb-12 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link prefetch={false} href="/blog" className="text-cream hover:text-white inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to The Aethera Pulse
          </Link>
        </div>
      </section>

      <article className="py-14 md:py-20 bg-white flex-grow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Tag className="h-5 w-5 text-teal mr-2" />
                <span className="text-teal font-semibold">{post.category}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-navy font-playfair mb-6 leading-tight">{post.title}</h1>
              <div className="flex flex-wrap items-center justify-center gap-5 text-gray text-sm">
                <span className="flex items-center"><User className="h-4 w-4 mr-1.5" />{post.author}</span>
                <span className="flex items-center"><Calendar className="h-4 w-4 mr-1.5" /><time dateTime={post.date}>{new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time></span>
                <span className="flex items-center"><Clock className="h-4 w-4 mr-1.5" />{post.readTime}</span>
              </div>
            </div>

            <div className="mb-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image} alt={post.title} className="w-full h-80 object-cover rounded-2xl" />
            </div>

            <p className="text-lg text-navy font-medium leading-relaxed mb-6 border-l-4 border-teal pl-4">{post.excerpt}</p>
            <div className="max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

            {/* inline CTA */}
            <div className="mt-12 bg-gradient-to-br from-navy to-teal rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white font-playfair mb-2">See what your revenue cycle is leaking</h3>
              <p className="text-cream/85 mb-5 max-w-xl mx-auto">Upload your A/R aging report and get a free, instant analysis — KPIs, denials, payer bottlenecks and a recovery plan.</p>
              <Link prefetch={false} href="/free-assessment" className="inline-flex items-center bg-mint hover:bg-white text-navy font-bold py-3 px-7 rounded-full transition-colors">
                Run my free A/R analysis <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </article>

      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold text-navy font-playfair mb-10 text-center">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {post.relatedPosts.map((rp) => (
                <Link prefetch={false} key={rp.slug} href={`/blog/${rp.slug}`} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden border border-gray/10">
                  <div className="h-44 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={rp.image} alt={rp.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-navy mb-3 leading-snug group-hover:text-teal transition-colors">{rp.title}</h3>
                    <span className="text-teal font-semibold inline-flex items-center text-sm">Read article <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
