import { decodeBuffer, parseDelimited, rowsToAggregates } from '../lib/agingAnalysis';
import { UPLOAD_LIMITS, validateUpload } from '../lib/uploadLimits';
self.onmessage = async (event: MessageEvent<File>) => {
  try {
    const file = event.data;
    const extension = validateUpload(file);
    const data = await file.arrayBuffer();
    let rows: string[][] = [];
    if (extension === 'xlsx' || extension === 'xls') {
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(data, { type: 'array', sheetRows: UPLOAD_LIMITS.rows + 1, dense: true });
      if (workbook.SheetNames.length > UPLOAD_LIMITS.sheets) throw new Error('Too many worksheets. Export at most 10 sheets.');
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error('The workbook has no worksheet.');
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
      if (range.e.c >= UPLOAD_LIMITS.columns) throw new Error('Report limit: 100 columns.');
      rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: '' });
    } else if (extension === 'pdf') {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('/workers/pdf.worker.min.mjs', self.location.origin).toString();
      const task = pdfjs.getDocument({ data, isEvalSupported: false });
      const doc = await task.promise;
      try {
        if (doc.numPages > UPLOAD_LIMITS.pages) throw new Error('PDF limit: 50 pages. Export a shorter report.');
        for (let pg = 1; pg <= doc.numPages; pg++) {
          const content = await (await doc.getPage(pg)).getTextContent();
          const lines = new Map<number, { x: number; text: string }[]>();
          for (const item of content.items) {
            if (!('str' in item)) continue;
            const y = Math.round(item.transform[5]);
            const line = lines.get(y) || [];
            line.push({ x: item.transform[4], text: item.str });
            lines.set(y, line);
          }
          for (const y of [...lines.keys()].sort((a, b) => b - a)) {
            const cells: string[] = [];
            let previous = -1;
            for (const part of lines.get(y)!.sort((a, b) => a.x - b.x)) {
              if (previous >= 0 && part.x - previous <= 24 && cells.length) cells[cells.length - 1] += ` ${part.text}`;
              else cells.push(part.text);
              previous = part.x;
            }
            rows.push(cells);
          }
          if (rows.length > UPLOAD_LIMITS.rows) throw new Error('Report limit: 20,000 rows.');
        }
      } finally { await task.destroy(); }
    } else rows = parseDelimited(decodeBuffer(data));
    if (rows.length > UPLOAD_LIMITS.rows || rows.some(row => row.length > UPLOAD_LIMITS.columns)) throw new Error('Report limit: 20,000 rows and 100 columns.');
    const aggregates = rowsToAggregates(rows.map(row => row.map(cell => String(cell ?? ''))));
    if (!aggregates.ok) throw new Error('No aging columns found. Export a tabular report or enter the bucket totals manually.');
    self.postMessage({ aggregates });
  } catch (error) { self.postMessage({ error: error instanceof Error ? error.message : 'Unable to parse this report.' }); }
};
