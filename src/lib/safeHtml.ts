import sanitizeHtml from 'sanitize-html';
export function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
/** Generated article markup allows formatting and local navigation only. */
export function sanitizeArticle(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: ['h2', 'h3', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'code', 'br'],
    allowedAttributes: { '*': ['class'], a: ['href'] },
    allowedSchemes: [], allowProtocolRelative: false,
    transformTags: { a: (_tag, attrs) => ({ tagName: 'a', attribs: /^\/(?!\/)/.test(attrs.href || '') && !/[\\\u0000-\u0020]/.test(attrs.href) ? { href: attrs.href } : {} as Record<string, string> }) },
  });
}
