export const UPLOAD_LIMITS = { bytes: 10 * 1024 * 1024, rows: 20000, columns: 100, sheets: 10, pages: 50, timeoutMs: 30000 } as const;
export function validateUpload(file: Pick<File, 'size' | 'name'>): string {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!['csv', 'tsv', 'xlsx', 'xls', 'pdf'].includes(extension)) throw new Error('Choose a CSV, TSV, Excel or PDF file.');
  if (!file.size) throw new Error('The file is empty.');
  if (file.size > UPLOAD_LIMITS.bytes) throw new Error('File limit: 10 MB. Export a smaller report or enter totals manually.');
  return extension;
}
