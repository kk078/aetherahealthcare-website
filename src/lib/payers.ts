import data from './payers.data.json';

export interface PayerEdiCapabilities {
  era: boolean;
  eligibility: boolean;
  claimStatus: boolean;
  professional: boolean;
  hospital: boolean;
  dental: boolean;
  secondary: boolean;
  workersComp: boolean;
  auto: boolean;
  attachments: boolean;
}

export interface ClearinghouseMatch {
  id: string;
  name: string;
  par: 'Par' | 'Non-Par';
  enrollment: boolean;
  services: string[];
}

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
  clearinghouseId?: string | null;
  parStatus?: 'Par' | 'Non-Par' | null;
  enrollmentRequired?: boolean | null;
  ediCapabilities?: PayerEdiCapabilities | null;
  clearinghouseMatches?: ClearinghouseMatch[];
}

interface PayerFile {
  _meta: {
    note: string;
    updated: string;
    clearinghouse_source?: string;
    clearinghouse_total_payors?: number;
    clearinghouse_updated?: string;
  };
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
