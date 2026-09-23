import { CMS_DOCUMENTS } from '../data/cmsDocuments';

const MAX_BYTES = 24 * 1024 * 1024;
const security = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store', 'Content-Security-Policy': "sandbox allow-downloads; default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'" };
export function cmsFailure(status: number, message: string) {
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CMS reference access</title><body style="font:18px system-ui;max-width:700px;margin:60px auto;padding:24px;line-height:1.6"><h1>CMS reference access</h1><p>${message}</p><p><a href="/cms-references/">Return to CMS references</a> · <a href="/anatomy-atlas/">Return to anatomy atlas</a></p><p>This service retrieves selected public documents from CMS. It cannot guarantee that CMS will accept Cloudflare requests.</p></body></html>`, { status, headers: { ...security, 'Content-Type': 'text/html; charset=utf-8' } });
}
export async function fetchCmsDocument(id: string, fetcher: typeof fetch = fetch): Promise<Response> {
  const document = CMS_DOCUMENTS.find(item => item.id === id);
  if (!document) return cmsFailure(404, 'This document is not in the supported reference list.');
  try {
    // Do not follow redirects: new destinations need explicit source review.
    const upstream = await fetcher(document.url, { method: 'GET', redirect: 'manual', headers: { Accept: 'application/pdf', 'User-Agent': 'AetheraReferenceReader/1.0 (+https://aetherahealthcare.com/cms-references/)' }, signal: AbortSignal.timeout(20000) });
    if (upstream.status !== 200 || !upstream.headers.get('content-type')?.toLowerCase().startsWith('application/pdf')) {
      await upstream.body?.cancel();
      return cmsFailure(502, 'CMS did not provide a PDF to Cloudflare. The document may be blocked, moved or temporarily unavailable. Use the official source link on the reference page or try again later.');
    }
    if (Number(upstream.headers.get('content-length')) > MAX_BYTES) { await upstream.body?.cancel(); return cmsFailure(502, 'This document exceeds the supported download size.'); }
    const reader = upstream.body?.getReader();
    if (!reader) return cmsFailure(502, 'CMS returned an empty response.');
    const chunks: Uint8Array[] = []; let length = 0;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) { await reader.cancel(); return cmsFailure(502, 'This document exceeds the supported download size.'); }
      chunks.push(value);
    }
    const data = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.length; }
    if (new TextDecoder().decode(data.subarray(0, 5)) !== '%PDF-') return cmsFailure(502, 'CMS did not return a valid PDF document.');
    return new Response(data, { headers: { ...security, 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="cms-${id}.pdf"`, 'Content-Length': String(length), 'X-Reference-Source': document.url, 'X-Reference-Retrieved': new Date().toISOString() } });
  } catch { return cmsFailure(502, 'The CMS document request failed or timed out. Please try the official source or retry later.'); }
}
