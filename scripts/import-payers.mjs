#!/usr/bin/env node
/**
 * Payer Directory importer — turns an AR-maintained spreadsheet into the site's
 * payer data. Run after the AR team updates the sheet, then redeploy.
 *
 *   node scripts/import-payers.mjs path/to/payers.xlsx [--replace]
 *
 * By default it MERGES (upsert by slug/payer name) into src/lib/payers.data.json,
 * so the curated starter set is preserved and rows are added/updated. Pass
 * --replace to overwrite the directory entirely from the sheet.
 *
 * Accepted column headers (case-insensitive, spaces/underscores ignored). Only
 * "name" is required:
 *   name | aka/subsidiaries | type | payer id | payer id note | timely filing
 *   appeal | provider phone | fax | claims address | portal url | website
 *   clearinghouse | notes | verified
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import * as XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '../src/lib/payers.data.json');

const args = process.argv.slice(2);
const replace = args.includes('--replace');
const xlsxPath = args.find(a => !a.startsWith('--'));
if (!xlsxPath) {
  console.error('Usage: node scripts/import-payers.mjs <payers.xlsx> [--replace]');
  process.exit(1);
}

const slugify = s => String(s).toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const norm = s => String(s).toLowerCase().replace(/[\s_]+/g, '');
const pick = (row, ...keys) => {
  for (const k of keys) {
    const hit = Object.keys(row).find(h => norm(h) === norm(k));
    if (hit && row[hit] != null && String(row[hit]).trim() !== '') return String(row[hit]).trim();
  }
  return null;
};

const wb = XLSX.readFile(xlsxPath);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
const today = new Date().toISOString().slice(0, 10);

const imported = rows
  .map(r => {
    const name = pick(r, 'name', 'payer', 'payername', 'insurance');
    if (!name) return null;
    const akaRaw = pick(r, 'aka', 'subsidiaries', 'alsoknownas', 'brands');
    return {
      slug: slugify(name),
      name,
      aka: akaRaw ? akaRaw.split(/[;,|]/).map(s => s.trim()).filter(Boolean) : [],
      type: pick(r, 'type', 'payertype', 'category') || 'Commercial',
      payerId: pick(r, 'payerid', 'payeridnumber', 'edipayerid', 'id'),
      payerIdNote: pick(r, 'payeridnote', 'idnote'),
      timelyFiling: pick(r, 'timelyfiling', 'tfl', 'timelyfilinglimit', 'filinglimit'),
      appeal: pick(r, 'appeal', 'appealwindow', 'appealfilinglimit', 'appeallimit'),
      providerPhone: pick(r, 'providerphone', 'phone', 'providerservices', 'phonenumber'),
      portalUrl: pick(r, 'portalurl', 'portal', 'providerportal'),
      website: pick(r, 'website', 'url', 'web'),
      clearinghouse: pick(r, 'clearinghouse', 'clearinghouses', 'ch'),
      claimsAddress: pick(r, 'claimsaddress', 'claimaddress', 'mailingaddress', 'address'),
      fax: pick(r, 'fax', 'claimsfax', 'faxnumber'),
      notes: pick(r, 'notes', 'note', 'comments'),
      verified: pick(r, 'verified', 'lastverified', 'verifieddate') || today,
    };
  })
  .filter(Boolean);

let out;
if (replace) {
  out = imported;
} else {
  const existing = JSON.parse(readFileSync(DATA, 'utf8')).payers || [];
  const bySlug = new Map(existing.map(p => [p.slug, p]));
  for (const p of imported) bySlug.set(p.slug, { ...(bySlug.get(p.slug) || {}), ...p });
  out = [...bySlug.values()];
}

out.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(
  DATA,
  JSON.stringify({ _meta: { note: 'Payer reference — verify every value with the payer/clearinghouse before filing.', updated: today }, payers: out }, null, 2) + '\n',
);
console.log(`Imported ${imported.length} rows from ${xlsxPath} → ${out.length} total payers (${replace ? 'replaced' : 'merged'}). Rebuild + deploy to publish.`);
