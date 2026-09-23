import { SOURCES } from './autonomyReferences';

// Fixed public documents only. Never accept arbitrary URLs or forward visitor credentials.
export const CMS_DOCUMENTS = [
  { id: 'ncci-2026', title: '2026 Medicare NCCI Policy Manual', url: 'https://www.cms.gov/files/document/2026-ncci-medicare-policy-manual-all-chapters.pdf', official: SOURCES.ncci.url },
  { id: 'claims-chapter-26', title: 'Medicare Claims Processing Manual — Chapter 26', url: SOURCES.modifiers.url, official: SOURCES.modifiers.url },
  { id: 'jw-jz', title: 'JW and JZ modifier FAQs', url: SOURCES.drugs.url, official: SOURCES.drugs.url },
  { id: 'evaluation-management', title: 'Evaluation and management services', url: 'https://www.cms.gov/files/document/mln006764-evaluation-management-services.pdf', official: 'https://www.cms.gov/files/document/mln006764-evaluation-management-services.pdf' },
  { id: 'rhc-update', title: 'Rural health clinic policy update', url: SOURCES.rhc.url, official: SOURCES.rhc.url },
  { id: 'fqhc', title: 'Federally qualified health centers', url: SOURCES.fqhc.url, official: SOURCES.fqhc.url },
  { id: 'ipf-2026', title: 'FY 2026 inpatient psychiatric facility payment updates', url: SOURCES.ipf.url, official: SOURCES.ipf.url },
  { id: 'hospice-2026', title: 'FY 2026 hospice payment update', url: SOURCES.hospice.url, official: SOURCES.hospice.url },
];
