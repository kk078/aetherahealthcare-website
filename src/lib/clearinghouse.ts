export interface ClearinghousePayer {
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

export const CLEARINGHOUSE_FLAGS = {
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

export function decodePayerTuple(tuple: CompactPayerTuple): ClearinghousePayer {
  const [name, id, type, mask, slug] = tuple;
  return {
    name,
    id,
    type,
    par: !!(mask & CLEARINGHOUSE_FLAGS.PAR),
    enrollment: !!(mask & CLEARINGHOUSE_FLAGS.ENROLLMENT),
    auto: !!(mask & CLEARINGHOUSE_FLAGS.AUTO),
    status: !!(mask & CLEARINGHOUSE_FLAGS.STATUS),
    dental: !!(mask & CLEARINGHOUSE_FLAGS.DENTAL),
    eligibility: !!(mask & CLEARINGHOUSE_FLAGS.ELIGIBILITY),
    encounters: !!(mask & CLEARINGHOUSE_FLAGS.ENCOUNTERS),
    hospital: !!(mask & CLEARINGHOUSE_FLAGS.HOSPITAL),
    professional: !!(mask & CLEARINGHOUSE_FLAGS.PROFESSIONAL),
    era: !!(mask & CLEARINGHOUSE_FLAGS.ERA),
    secondary: !!(mask & CLEARINGHOUSE_FLAGS.SECONDARY),
    wc: !!(mask & CLEARINGHOUSE_FLAGS.WC),
    att: !!(mask & CLEARINGHOUSE_FLAGS.ATT),
    curatedSlug: slug || null,
  };
}

export const CLEARINGHOUSE_TYPES = [
  'Commercial',
  'Workers Comp',
  'Dental',
  'BCBS',
  'Medicare',
  'Medicaid',
  'Auto / PIP',
  'Government',
] as const;
