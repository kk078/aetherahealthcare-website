import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const file = process.argv[2];
if (!file) throw new Error('Usage: node scripts/publish-blog-draft.mjs content/drafts/slug.json');
const full = resolve(file);
if (!full.startsWith(resolve('content/drafts') + '/')) throw new Error('Choose a draft from content/drafts');
const draft = JSON.parse(await readFile(full, 'utf8'));
const review = draft.review;
if (draft.status !== 'approved' || !review?.reviewer?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt || '') || !review.sources?.length) throw new Error('Set status to approved and supply an accountable reviewer, review date and primary sources after review.');
for (const source of review.sources) { const url = new URL(source); if (url.protocol !== 'https:') throw new Error('Sources must use HTTPS'); }
const sourcePath = 'src/lib/blogPosts.ts';
const source = await readFile(sourcePath, 'utf8');
const marker = 'export const POSTS: BlogPost[] = ';
const start = source.indexOf(marker) + marker.length;
const end = start + source.slice(start).search(/;\s*export const CATEGORIES/);
const posts = JSON.parse(source.slice(start, end));
if (posts.some(p => p.slug === draft.post.slug)) throw new Error('Slug is already published');
const queuePath = 'scripts/keyword-queue.json';
const queue = JSON.parse(await readFile(queuePath, 'utf8'));
const targetIndex = queue.pending.findIndex(item => item.keyword === draft.targetKeyword);
if (targetIndex !== -1) {
  const [target] = queue.pending.splice(targetIndex, 1);
  queue.done.push({ ...target, slug: draft.post.slug, publishedAt: draft.post.date });
}
posts.unshift({ ...draft.post, author: 'Aethera Editorial Team', review });
await writeFile(sourcePath, source.slice(0, start) + JSON.stringify(posts, null, 2) + source.slice(end));
if (targetIndex !== -1) await writeFile(queuePath, JSON.stringify(queue, null, 2) + '\n');
console.log('Added reviewed article to source. Review the diff and run the release checks before merging.');
