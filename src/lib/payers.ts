import data from './payers.data.json';

export interface Payer {
  slug: string;
  name: string;
  aka: string[];
  type: string;
  payerId: string | null;
  payerIdNote?: string | null;
  timelyFiling: string | null;
  appeal: string | null;
  providerPhone: string | null;
  portalUrl: string | null;
  website: string | null;
  clearinghouse: string | null;
  claimsAddress: string | null;
  fax: string | null;
  notes?: string | null;
  verified: string | null;
}

interface PayerFile {
  _meta: { note: string; updated: string };
  payers: Payer[];
}

const file = data as unknown as PayerFile;

export const payersMeta = file._meta;

export function getAllPayers(): Payer[] {
  return (file.payers || []).slice().sort((a, b) => a.name.localeCompare(b.name));
}

export function getPayer(slug: string): Payer | undefined {
  return (file.payers || []).find(p => p.slug === slug);
}

export function payerTypes(): string[] {
  return Array.from(new Set(getAllPayers().map(p => p.type))).sort();
}
