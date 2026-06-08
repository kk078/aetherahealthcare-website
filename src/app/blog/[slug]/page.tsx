import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { POSTS, getPost, getRelated, postHtml } from '@/lib/blogPosts';
import BlogPostClient from './BlogPostClient';

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: { absolute: 'Article | Aethera Healthcare Solutions' } };
  return {
    title: { absolute: `${post.title} | Aethera Healthcare Solutions` },
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.excerpt, images: [post.image], type: 'article' },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const full = {
    ...post,
    content: postHtml(post),
    relatedPosts: getRelated(post).map((r) => ({ slug: r.slug, title: r.title, image: r.image })),
  };
  return <BlogPostClient post={full} />;
}
