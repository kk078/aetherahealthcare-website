/**
 * CARC / RARC denial-code reference for the free AR tools.
 *
 * Sourced from Aethera's own RCM denial-prevention knowledge base (the X12 Claim
 * Adjustment Reason Codes + Remittance Advice Remark Codes the coding/billing
 * agents reason over). Each record is framed for an AR/billing audience: what the
 * code means, how to work it, and how to prevent it next time.
 *
 * This is an educational quick reference — payer-specific handling varies by plan
 * and contract; always confirm in the payer portal or your clearinghouse.
 */

export type DenialDifficulty = 'correctable' | 'preventable' | 'hard';

export interface DenialCode {
  code: string;          // CARC code, e.g. "16"
  label: string;         // short official-ish label
  rarc: string;          // commonly paired RARC codes (may be empty)
  category: string;      // grouping for filters
  difficulty: DenialDifficulty;
  rootCause: string;     // why it happens
  workIt: string;        // what an AR rep does to resolve THIS denial
  prevent: string;       // how to stop it happening again (front-end / coding)
  aliases: string[];     // extra search terms
}

export const DENIAL_CODES: DenialCode[] = [
  {
    code: '16',
    label: 'Claim/service lacks information needed for adjudication',
    rarc: 'N290, N257, MA27, M51, N382',
    category: 'Missing / incomplete info',
    difficulty: 'correctable',
    rootCause:
      'A required data element is missing or incomplete — rendering/billing NPI, diagnosis pointers, units, or a required modifier. The accompanying RARC tells you exactly which element.',
    workIt:
      'Read the paired RARC to find the missing field, correct it, and submit a corrected claim. N290/N257 point to provider identifiers; M51 to a missing/invalid procedure code; MA27/N382 to subscriber/member ID issues.',
    prevent:
      'Scrub every loop and segment before submission — rendering & billing NPI, a diagnosis pointer on every service line, valid units, and any required modifier. Make sure each CPT links to a supporting diagnosis.',
    aliases: ['lacks information', 'missing info', 'incomplete', 'missing npi', 'diagnosis pointer'],
  },
  {
    code: '50',
    label: 'These are non-covered services — not deemed a medical necessity',
    rarc: 'N115',
    category: 'Medical necessity',
    difficulty: 'preventable',
    rootCause:
      "The diagnosis on the claim doesn't support medical necessity for the procedure under the payer's LCD/NCD policy.",
    workIt:
      'Compare the billed ICD-10 against the payer LCD/NCD for that CPT. If the record supports a covered diagnosis, submit a corrected claim; otherwise appeal with documentation or route to patient responsibility via ABN.',
    prevent:
      'Confirm the ICD-10 satisfies the LCD/NCD before the claim goes out, and capture an ABN when a service is likely non-covered.',
    aliases: ['medical necessity', 'not medically necessary', 'lcd', 'ncd', 'n115'],
  },
  {
    code: '11',
    label: 'The diagnosis is inconsistent with the procedure',
    rarc: 'M76',
    category: 'Coding / linkage',
    difficulty: 'correctable',
    rootCause: "The linked diagnosis doesn't clinically justify the procedure performed.",
    workIt:
      'Re-check diagnosis-to-procedure linkage against the documentation, point each CPT to the diagnosis that supports it, and submit corrected.',
    prevent:
      'Validate diagnosis pointers map to clinically consistent ICD-10 codes before building the 837.',
    aliases: ['diagnosis inconsistent', 'dx procedure mismatch', 'm76', 'linkage'],
  },
  {
    code: '97',
    label: 'Benefit is included in the payment for another service/procedure (bundled)',
    rarc: 'N19, M15, M144',
    category: 'Bundling / NCCI',
    difficulty: 'preventable',
    rootCause:
      'The procedure is a component of another billed procedure — an NCCI PTP edit or a service inside the global period.',
    workIt:
      'Run the NCCI PTP edit pair. If the column-2 service was truly separate and documented, append the appropriate modifier (59/XE/XS/XP/XU) and resubmit; otherwise the bundling is correct.',
    prevent:
      'Honor NCCI edits in claim scrubbing and never add an unbundling modifier without documentation of a distinct service.',
    aliases: ['bundled', 'inclusive', 'ncci', 'ptp edit', 'global period', 'unbundling'],
  },
  {
    code: '4',
    label: 'Procedure code is inconsistent with the modifier, or a required modifier is missing',
    rarc: 'M78, N519',
    category: 'Modifiers',
    difficulty: 'correctable',
    rootCause: 'A required modifier is absent, or a modifier conflicts with the procedure code.',
    workIt:
      'Apply the correct modifier per NCCI/payer rules (25 for a separate E/M, 59/X{EPSU}, 26/TC, 50, 51, RT/LT), remove any conflicting modifier, and submit a corrected claim.',
    prevent:
      'Confirm every service line carries valid modifiers for the CPT and payer before submission.',
    aliases: ['modifier missing', 'modifier inconsistent', 'modifier 25', 'modifier 59', 'm78'],
  },
  {
    code: '18',
    label: 'Exact duplicate claim/service',
    rarc: 'N111, M86',
    category: 'Duplicates',
    difficulty: 'preventable',
    rootCause:
      'The same service/date/provider was already submitted, or repeated units were billed as separate lines.',
    workIt:
      'Check claim history. If it is a true duplicate, no action. If it was a legitimately repeated service, bill correct units or append modifier 76/77/91 and resubmit.',
    prevent:
      'Search claim history for the same CPT/date/provider before sending, and use units instead of repeating a line.',
    aliases: ['duplicate', 'already submitted', 'n111', 'repeat service'],
  },
  {
    code: '197',
    label: 'Precertification / authorization / notification absent',
    rarc: 'N54, M62',
    category: 'Authorization',
    difficulty: 'preventable',
    rootCause: 'The service required prior authorization that was not obtained or not attached.',
    workIt:
      'Check for an auth on file. If one exists, submit a corrected claim with the authorization number. If not, request a retro-authorization where the payer allows it, then appeal.',
    prevent:
      'Flag procedures that typically need prior auth and confirm a valid authorization before the date of service.',
    aliases: ['authorization', 'prior auth', 'precert', 'no auth', 'n54', '197'],
  },
  {
    code: '96',
    label: 'Non-covered charge(s)',
    rarc: 'N130, N180, N386',
    category: 'Coverage / benefits',
    difficulty: 'hard',
    rootCause: "The service is not a covered benefit under the patient's plan.",
    workIt:
      'Verify the benefit. If covered, correct the coding/POS that triggered the denial and resubmit. If genuinely non-covered, bill the patient when an ABN/agreement is on file.',
    prevent:
      'Verify benefits before service; flag likely non-covered items (cosmetic, screening-vs-diagnostic) for a benefit check and ABN.',
    aliases: ['non-covered', 'not covered', 'benefit', 'n130', '96'],
  },
  {
    code: '151',
    label: 'Payment adjusted — information does not support this many services',
    rarc: 'N362',
    category: 'Frequency / MUE',
    difficulty: 'preventable',
    rootCause: "Units or frequency exceed the payer's allowed limit (MUE) for the code.",
    workIt:
      'Compare billed units to the MUE for that CPT. If documentation supports the higher count, resubmit with the correct modifier and records; otherwise correct the units.',
    prevent: 'Respect MUE/frequency limits and bill correct units before submission.',
    aliases: ['too many services', 'mue', 'units', 'frequency', 'n362', '151'],
  },
  {
    code: '109',
    label: 'Claim not covered by this payer/contractor',
    rarc: 'N418',
    category: 'Wrong payer / COB',
    difficulty: 'correctable',
    rootCause:
      'The claim was sent to the wrong payer, or the COB primary/secondary order is wrong.',
    workIt:
      'Verify the correct payer and coordination-of-benefits order, set the filing indicator and payer loop, and rebill to the right payer.',
    prevent: 'Confirm the active payer and COB order at registration and eligibility.',
    aliases: ['wrong payer', 'cob', 'coordination of benefits', 'n418', '109'],
  },
  {
    code: '27',
    label: 'Expenses incurred after coverage terminated',
    rarc: 'N30',
    category: 'Eligibility',
    difficulty: 'preventable',
    rootCause:
      "The date of service falls outside the patient's coverage effective/termination dates.",
    workIt:
      'Re-verify eligibility for the date of service. Rebill to the payer that was active on the DOS, or move to patient responsibility if no coverage existed.',
    prevent: 'Verify eligibility for the exact date of service before submission.',
    aliases: ['coverage terminated', 'eligibility', 'inactive coverage', 'n30', '27'],
  },
  {
    code: '29',
    label: 'The time limit for filing has expired (timely filing)',
    rarc: 'N211',
    category: 'Timely filing',
    difficulty: 'hard',
    rootCause: "The claim was submitted past the payer's filing deadline.",
    workIt:
      'Appeal with proof of timely filing — original clearinghouse acceptance reports, EDI acknowledgments, or prior submission records. Without proof, the denial usually stands.',
    prevent:
      'File within the payer window, monitor the unbilled/held queue daily, and keep clearinghouse acceptance reports for appeals.',
    aliases: ['timely filing', 'filing limit', 'tfl', 'too late', 'n211', '29'],
  },
  {
    code: '8',
    label: 'Procedure inconsistent with the provider type/specialty',
    rarc: 'N95',
    category: 'Provider / taxonomy',
    difficulty: 'correctable',
    rootCause: "The procedure is not payable for the rendering provider's type/specialty.",
    workIt:
      "Confirm the rendering provider's taxonomy/specialty supports the billed CPT; correct the rendering provider or taxonomy and resubmit.",
    prevent:
      "Confirm the procedure is within the rendering provider's scope/taxonomy before billing.",
    aliases: ['provider type', 'specialty', 'taxonomy', 'n95', '8'],
  },
  {
    code: 'B7',
    label: 'Provider was not certified/eligible to be paid for this service on this date',
    rarc: 'N570',
    category: 'Credentialing / enrollment',
    difficulty: 'hard',
    rootCause:
      'The rendering provider was not credentialed/enrolled with the payer for the date of service.',
    workIt:
      'Check enrollment effective dates. If credentialing was retro-effective, appeal; if a billing/supervising provider can be used per payer rules, correct and resubmit.',
    prevent:
      'Confirm the provider is credentialed and effective with the payer before the date of service; track enrollment effective dates.',
    aliases: ['not certified', 'credentialing', 'enrollment', 'b7', 'n570'],
  },
  {
    code: '23',
    label: 'Impact of prior payer(s) adjudication (including COB)',
    rarc: 'A59, N12',
    category: 'Wrong payer / COB',
    difficulty: 'correctable',
    rootCause:
      "The prior payer's payment or adjustment affects this claim — usually a coordination-of-benefits balance on a secondary claim.",
    workIt:
      'Attach the primary EOB/ERA and confirm the COB balance, allowed amounts, and patient responsibility carry correctly to the secondary claim, then resubmit.',
    prevent:
      'Capture primary payer details and post the primary remit before billing the secondary.',
    aliases: ['prior payer', 'secondary', 'cob', 'eob', 'a59', '23'],
  },
];

export function getAllDenialCodes(): DenialCode[] {
  return DENIAL_CODES;
}

export function denialCategories(): string[] {
  return Array.from(new Set(DENIAL_CODES.map(d => d.category))).sort();
}

export const DIFFICULTY_LABEL: Record<DenialDifficulty, string> = {
  correctable: 'Usually correctable',
  preventable: 'Preventable',
  hard: 'Often hard to overturn',
};

/* -------------------------------------------------------------------------- */
/*  Full CARC / RARC reference (extracted from the uploaded crosswalk PDFs)   */
/* -------------------------------------------------------------------------- */

import referenceData from './denialReference.json';

export type RefCodeType = 'CARC' | 'RARC';

export interface ReferenceCode {
  code: string;
  type: RefCodeType;
  description: string;
  category: string;
  difficulty?: DenialDifficulty;   // CARC only
  workIt?: string;                 // CARC only
  prevent?: string;                // CARC only
  handle?: string;                 // RARC only
}

interface RefFile {
  _meta: { note: string; source: string; updated: string };
  codes: ReferenceCode[];
}

const ref = referenceData as unknown as RefFile;

export const referenceMeta = ref._meta;

/** All CARC + RARC reference codes (excludes the curated guided codes above). */
export function getReferenceCodes(): ReferenceCode[] {
  return ref.codes;
}
