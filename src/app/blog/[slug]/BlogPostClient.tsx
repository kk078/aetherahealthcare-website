'use client';

import Head from 'next/head';
import Link from 'next/link';
import { Calendar, Clock, Tag, User, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';

export default function BlogPostClient({ post }: { post: any }) {
  // Generate breadcrumb structured data
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://aetherahealthcare-website.pages.dev/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://aetherahealthcare-website.pages.dev/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://aetherahealthcare-website.pages.dev/blog/${post.slug}`
      }
    ]
  };

  // Generate blog post structured data
  const blogPostSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://aetherahealthcare-website.pages.dev/blog/${post.slug}`
    },
    "headline": post.title,
    "description": post.excerpt || post.title,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Aethera Healthcare Solutions",
      "logo": {
        "@type": "ImageObject",
        "url": "https://aetherahealthcare-website.pages.dev/logo.png"
      }
    },
    "image": post.image,
    "articleBody": post.content.replace(/<[^>]*>/g, ''), // Strip HTML tags for clean text
    "keywords": post.category
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbs)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(blogPostSchema)
          }}
        />
      </Head>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-8 md:pt-32 md:pb-12 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Link href="/blog" className="text-cream hover:text-white flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
      </section>

      {/* Article */}
      <article className="py-16 md:py-24 bg-white flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Tag className="h-5 w-5 text-teal mr-2" />
                <span className="text-teal font-medium">{post.category}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-navy font-playfair mb-6">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray mr-2" />
                  <span className="text-gray">{post.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray mr-2" />
                  <time dateTime={post.date} className="text-gray">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray mr-2" />
                  <span className="text-gray">{post.readTime}</span>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-96 object-cover rounded-2xl"
              />
            </div>

            <div
              className="prose max-w-none text-gray"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </FadeIn>
        </div>
      </article>

      {/* Related Posts */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold text-navy font-playfair mb-12 text-center">
              Related Articles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {post.relatedPosts.map((relatedPost: any, index: number) => {
                // In a real app, this would come from a data fetch
                const blogPosts = [
                  {
                    slug: 'reduce-claim-denials',
                    title: '5 Ways to Reduce Claim Denials in Your Medical Practice',
                    image: 'https://images.unsplash.com/photo-1519494026892-80bb41fb7d0a?w=800&h=400&fit=crop'
                  },
                  {
                    slug: 'revenue-cycle-management',
                    title: 'Understanding Revenue Cycle Management: A Complete Guide for Providers',
                    image: 'https://images.unsplash.com/photo-1586495786027-6d0f4b6d2a3c?w=800&h=400&fit=crop'
                  },
                  {
                    slug: 'billing-partner',
                    title: 'Why Your Practice Needs a Dedicated Medical Billing Partner',
                    image: 'https://images.unsplash.com/photo-1586495786027-6d0f4b6d2a3c?w=800&h=400&fit=crop'
                  }
                ];

                const related = blogPosts.find(p => p.slug === relatedPost.slug);
                return (
                  <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray/10">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={related?.image || 'https://images.unsplash.com/photo-1586495786027-6d0f4b6d2a3c?w=800&h=400&fit=crop'}
                        alt={related?.title || ''}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-navy mb-3">
                        <Link href={`/blog/${related?.slug}`} className="hover:text-teal transition-colors">
                          {related?.title}
                        </Link>
                      </h3>
                      <Link
                        href={`/blog/${related?.slug}`}
                        className="text-teal font-medium hover:text-mint transition-colors flex items-center"
                      >
                        Read article <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </>
  );
}