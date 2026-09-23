import { CMS_DOCUMENTS } from '../../src/data/cmsDocuments';
import { cmsFailure, fetchCmsDocument } from '../../src/server/cmsDocuments';
import { consumeRateLimit, type LeadEnv } from '../../src/server/leads';

export async function onRequest({ request, env }: { request: Request; env: LeadEnv }) {
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET', 'Cache-Control': 'no-store' } });
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  if ([...url.searchParams.keys()].some(key => key !== 'id') || url.searchParams.getAll('id').length !== 1 || !CMS_DOCUMENTS.some(item => item.id === id)) return cmsFailure(404, 'Select a supported document from the reference page.');
  try {
    if (!await consumeRateLimit(request, env, 'cms-document', 30)) return cmsFailure(429, 'The reference request limit has been reached or the service is temporarily unavailable. Please try later.');
    return await fetchCmsDocument(id);
  } catch { return cmsFailure(503, 'The reference service is temporarily unavailable.'); }
}
