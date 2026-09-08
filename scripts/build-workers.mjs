import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
await mkdir('public/workers', { recursive: true });
await build({ entryPoints: ['src/workers/agingParser.worker.ts'], outfile: 'public/workers/aging-parser.js', bundle: true, minify: true, format: 'esm', platform: 'browser', external: ['node:*'], target: ['es2022'] });
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'public/workers/pdf.worker.min.mjs');
