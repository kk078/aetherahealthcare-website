export interface ClaimLogicPayer {
  name: string;
  id: string;
  type: string;
  par: boolean;
  enrollment: boolean;
  auto: boolean;
  status: boolean;
  dental: boolean;
  eligibility: boolean;
  encounters: boolean;
  hospital: boolean;
  professional: boolean;
  era: boolean;
  secondary: boolean;
  wc: boolean;
  att: boolean;
  curatedSlug?: string | null;
}

export const CLAIM_LOGIC_FLAGS = {
  PAR: 1 << 0,
  ENROLLMENT: 1 << 1,
  AUTO: 1 << 2,
  STATUS: 1 << 3,
  DENTAL: 1 << 4,
  ELIGIBILITY: 1 << 5,
  ENCOUNTERS: 1 << 6,
  HOSPITAL: 1 << 7,
  PROFESSIONAL: 1 << 8,
  ERA: 1 << 9,
  SECONDARY: 1 << 10,
  WC: 1 << 11,
  ATT: 1 << 12,
} as const;

export type CompactPayerTuple = [string, string, string, number, string];

export function decodePayerTuple(tuple: CompactPayerTuple): ClaimLogicPayer {
  const [name, id, type, mask, slug] = tuple;
  return {
    name,
    id,
    type,
    par: !!(mask & CLAIM_LOGIC_FLAGS.PAR),
    enrollment: !!(mask & CLAIM_LOGIC_FLAGS.ENROLLMENT),
    auto: !!(mask & CLAIM_LOGIC_FLAGS.AUTO),
    status: !!(mask & CLAIM_LOGIC_FLAGS.STATUS),
    dental: !!(mask & CLAIM_LOGIC_FLAGS.DENTAL),
    eligibility: !!(mask & CLAIM_LOGIC_FLAGS.ELIGIBILITY),
    encounters: !!(mask & CLAIM_LOGIC_FLAGS.ENCOUNTERS),
    hospital: !!(mask & CLAIM_LOGIC_FLAGS.HOSPITAL),
    professional: !!(mask & CLAIM_LOGIC_FLAGS.PROFESSIONAL),
    era: !!(mask & CLAIM_LOGIC_FLAGS.ERA),
    secondary: !!(mask & CLAIM_LOGIC_FLAGS.SECONDARY),
    wc: !!(mask & CLAIM_LOGIC_FLAGS.WC),
    att: !!(mask & CLAIM_LOGIC_FLAGS.ATT),
    curatedSlug: slug || null,
  };
}

export const CLAIM_LOGIC_TYPES = [
  'Commercial',
  'Workers Comp',
  'Dental',
  'BCBS',
  'Medicare',
  'Medicaid',
  'Auto / PIP',
  'Government',
] as const;
