import data from './payerResources.data.json';

export type PayerResourceType = 'Commercial' | 'Blue Cross' | 'Medicare Advantage' | 'Medicaid' | 'Government';

export interface PayerResource {
  slug: string;
  name: string;
  type: PayerResourceType;
  providerHome: string | null;
  providerManual: string | null;
  policies: string | null;
  credentialing: string | null;
  eligibility: string | null;
  confidence: 'high' | 'medium' | 'low';
  notes: string | null;
}

interface PayerResourceFile {
  _meta: { note: string; updated: string };
  payers: PayerResource[];
}

const file = data as unknown as PayerResourceFile;

export const payerResourcesMeta = file._meta;

export function getPayerResources(): PayerResource[] {
  return (file.payers || []).slice().sort((a, b) => a.name.localeCompare(b.name));
}

export function payerResourceTypes(): PayerResourceType[] {
  return ['Commercial', 'Blue Cross', 'Medicare Advantage', 'Medicaid', 'Government'];
}
