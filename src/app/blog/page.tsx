'use client';

import Head from 'next/head';
import Link from 'next/link';
import { Calendar, Clock, Tag, User } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

const blogPosts = [
  {
    slug: 'reduce-claim-denials',
    title: '5 Ways to Reduce Claim Denials in Your Medical Practice',
    excerpt: 'Learn practical strategies to minimize claim denials and maximize your revenue cycle performance.',
    date: '2026-05-10',
    author: 'Jennifer Walsh',
    readTime: '8 min read',
    category: 'Denials & Collections',
    image: 'https://images.unsplash.com/photo-1519494026892-80bb41fb7d0a?w=800&h=400&fit=crop'
  },
  {
    slug: 'revenue-cycle-management',
    title: 'Understanding Revenue Cycle Management: A Complete Guide for Providers',
    excerpt: 'A comprehensive overview of revenue cycle management and how it impacts your practice\'s financial health.',
    date: '2026-05-05',
    author: 'Michael Torres',
    readTime: '12 min read',
    category: 'Revenue Cycle',
    image: 'https://images.unsplash.com/photo-1586495786027-6d0f4b6d2a3c?w=800&h=400&fit=crop'
  },
  {
    slug: 'billing-partner',
    title: 'Why Your Practice Needs a Dedicated Medical Billing Partner',
    excerpt: 'Discover the benefits of outsourcing your medical billing to experts who understand your specialty.',
    date: '2026-04-28',
    author: 'Sarah Kim',
    readTime: '6 min read',
    category: 'Practice Management',
    image: 'https://images.unsplash.com/photo-1586495786027-6d0f4b6d2a3c?w=800&h=400&fit=crop'
  },
  {
    slug: 'telehealth-billing',
    title: 'Mastering Telehealth Billing: A Guide for Modern Medical Practices',
    excerpt: 'Navigate the complexities of telehealth billing with our comprehensive guide to reimbursement best practices.',
    date: '2026-04-20',
    author: 'David Chen',
    readTime: '10 min read',
    category: 'Telehealth',
    image: 'https://images.unsplash.com/photo-1581091226033-d54615f8d3d4?w=800&h=400&fit=crop'
  },
  {
    slug: 'patient-collections',
    title: 'Effective Patient Collections Strategies That Actually Work',
    excerpt: 'Transform your patient collections approach with proven techniques that improve cash flow without damaging relationships.',
    date: '2026-04-15',
    author: 'Amanda Rodriguez',
    readTime: '9 min read',
    category: 'Collections',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e03f184?w=800&h=400&fit=crop'
  },
  {
    slug: 'credentialing-best-practices',
    title: 'Provider Credentialing Best Practices: Avoiding Common Pitfalls',
    excerpt: 'Streamline your credentialing process and avoid costly delays with these essential best practices.',
    date: '2026-04-10',
    author: 'Robert Johnson',
    readTime: '7 min read',
    category: 'Credentialing',
    image: 'https://images.unsplash.com/photo-1517242039478-88104f383fb5?w=800&h=400&fit=crop'
  },
  {
    slug: 'hipaa-compliance',
    title: 'HIPAA Compliance in 2026: What Healthcare Practices Need to Know',
    excerpt: 'Stay compliant with the latest HIPAA requirements and protect your practice from costly violations.',
    date: '2026-04-05',
    author: 'Lisa Thompson',
    readTime: '11 min read',
    category: 'Compliance',
    image: 'https://images.unsplash.com/photo-1584432411024-d8a9d317d9c4?w=800&h=400&fit=crop'
  },
  {
    slug: 'coding-audits',
    title: 'How to Conduct Effective Medical Coding Audits for Your Practice',
    excerpt: 'Implement a comprehensive coding audit process to ensure accuracy and compliance while maximizing reimbursements.',
    date: '2026-03-28',
    author: 'Mark Wilson',
    readTime: '13 min read',
    category: 'Coding',
    image: 'https://images.unsplash.com/photo-1586495786027-6d0f4b6d2a3c?w=800&h=400&fit=crop'
  },
  {
    slug: 'prior-authorization',
    title: 'Streamlining Prior Authorization: A Guide to Faster Approvals',
    excerpt: 'Learn how to optimize your prior authorization process and reduce delays in patient care and reimbursement.',
    date: '2026-03-20',
    author: 'Jennifer Walsh',
    readTime: '10 min read',
    category: 'Prior Authorization',
    image: 'https://images.unsplash.com/photo-1516549698021-6e073c7f0bad?w=800&h=400&fit=crop'
  },
  {
    slug: 'denial-management',
    title: 'Advanced Denial Management Strategies for 2026',
    excerpt: 'Proven techniques to prevent, identify, and successfully appeal insurance claim denials.',
    date: '2026-03-15',
    author: 'Michael Torres',
    readTime: '12 min read',
    category: 'Denials & Collections',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e03f184?w=800&h=400&fit=crop'
  },
  {
    slug: 'patient-communications',
    title: 'Effective Patient Communication Strategies for Better Collections',
    excerpt: 'Improve patient satisfaction and collections with these proven communication techniques.',
    date: '2026-03-10',
    author: 'Sarah Kim',
    readTime: '8 min read',
    category: 'Patient Relations',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop'
  },
  {
    slug: 'revenue-analytics',
    title: 'Using Revenue Analytics to Optimize Your Practice Performance',
    excerpt: 'Leverage data analytics to identify trends, improve collections, and maximize revenue.',
    date: '2026-03-05',
    author: 'David Chen',
    readTime: '11 min read',
    category: 'Analytics',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e03f184?w=800&h=400&fit=crop'
  },
  {
    slug: 'insurance-contracts',
    title: 'Negotiating Better Insurance Contracts: A Provider\'s Guide',
    excerpt: 'Maximize reimbursement rates and minimize administrative burden with strategic contract negotiation.',
    date: '2026-02-28',
    author: 'Amanda Rodriguez',
    readTime: '14 min read',
    category: 'Contract Management',
    image: 'https://images.unsplash.com/photo-1586495786027-6d0f4b6d2a3c?w=800&h=400&fit=crop'
  }
];

export default function Blog() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              "name": "Aethera Healthcare Solutions Blog",
              "url": "https://aetherahealthcare-website.pages.dev/blog",
              "description": "Insights, tips, and industry news to help optimize your medical practice's revenue cycle.",
              "publisher": {
                "@type": "Organization",
                "name": "Aethera Healthcare Solutions",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://aetherahealthcare-website.pages.dev/logo.png"
                }
              }
            })
          }}
        />
      </Head>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-playfair mb-6">
                Aethera Blog
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl text-cream max-w-3xl mx-auto">
                Insights, tips, and industry news to help optimize your medical practice's revenue cycle.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-6">
                Expert Insights for Healthcare Providers
              </h2>
              <p className="text-gray text-lg mb-8">
                Our blog provides valuable resources on medical billing best practices, revenue cycle optimization,
                compliance updates, and industry trends. Stay informed with expert insights from our team of specialists.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="bg-teal text-white px-4 py-2 rounded-full text-sm">
                  Billing Best Practices
                </span>
                <span className="bg-mint text-navy px-4 py-2 rounded-full text-sm">
                  Revenue Cycle Tips
                </span>
                <span className="bg-cream text-teal px-4 py-2 rounded-full text-sm">
                  Industry Updates
                </span>
                <span className="bg-navy text-white px-4 py-2 rounded-full text-sm">
                  Compliance Guides
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="LATEST ARTICLES"
            title="Recent Blog Posts"
            description="Stay up to date with the latest insights from our revenue cycle experts."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {blogPosts.map((post, index) => (
              <FadeIn key={index} delay={index * 0.1}>
                <article className="bg-white rounded-xl shadow-md overflow-hidden border border-gray/10 h-full flex flex-col">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center mb-3">
                      <Tag className="h-4 w-4 text-teal mr-2" />
                      <span className="text-sm text-teal font-medium">{post.category}</span>
                    </div>
                    <h3 className="text-xl font-bold text-navy mb-3">
                      <Link href={`/blog/${post.slug}`} className="hover:text-teal transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray mb-4 flex-grow">{post.excerpt}</p>
                    <div className="mt-auto pt-4 border-t border-gray/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray mr-2" />
                          <span className="text-sm text-gray">{post.author}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray mr-2" />
                          <span className="text-sm text-gray">{post.readTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center mt-2">
                        <Calendar className="h-4 w-4 text-gray mr-2" />
                        <time dateTime={post.date} className="text-sm text-gray">
                          {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="BLOG CATEGORIES"
            title="Explore by Topic"
            description="Find articles on the topics most relevant to your practice."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <FadeIn>
              <div className="bg-cream rounded-xl p-6 text-center">
                <Tag className="h-8 w-8 text-teal mx-auto mb-3" />
                <h3 className="text-lg font-bold text-navy mb-2">Billing Best Practices</h3>
                <p className="text-gray text-sm">Optimization strategies and expert tips</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="bg-cream rounded-xl p-6 text-center">
                <Tag className="h-8 w-8 text-teal mx-auto mb-3" />
                <h3 className="text-lg font-bold text-navy mb-2">Revenue Cycle</h3>
                <p className="text-gray text-sm">Complete guides and performance metrics</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-cream rounded-xl p-6 text-center">
                <Tag className="h-8 w-8 text-teal mx-auto mb-3" />
                <h3 className="text-lg font-bold text-navy mb-2">Compliance</h3>
                <p className="text-gray text-sm">HIPAA, security, and regulatory updates</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="bg-cream rounded-xl p-6 text-center">
                <Tag className="h-8 w-8 text-teal mx-auto mb-3" />
                <h3 className="text-lg font-bold text-navy mb-2">Practice Management</h3>
                <p className="text-gray text-sm">Efficiency tips and operational guidance</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-6">
                Never Miss an Update
              </h2>
              <p className="text-cream text-xl max-w-2xl mx-auto mb-8">
                Subscribe to our newsletter for the latest blog posts and industry insights.
              </p>
              <div className="max-w-md mx-auto flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-4 py-3 rounded-l-full focus:outline-none"
                />
                <button className="bg-mint hover:bg-white text-navy font-bold py-3 px-6 rounded-r-full transition-colors duration-300">
                  Subscribe
                </button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}