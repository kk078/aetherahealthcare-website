/** Bounded educational calculations. No clinical decisions, payer predictions or attestations. */
export function finiteNumber(value: number, label: string, min = 0, max = 1e9) {
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${label} must be between ${min} and ${max}.`);
  return value;
}

export function drugBillingUnits(administeredMg: number, packagedMg: number, mgPerUnit: number) {
  finiteNumber(administeredMg, 'Administered amount', 0.001);
  finiteNumber(packagedMg, 'Packaged amount', 0.001);
  finiteNumber(mgPerUnit, 'Milligrams per billing unit', 0.001);
  if (administeredMg > packagedMg) throw new Error('Administered amount cannot exceed the labeled supply.');
  const supplyUnits = packagedMg / mgPerUnit;
  if (supplyUnits < 1 || Math.abs(supplyUnits - Math.round(supplyUnits)) > Number.EPSILON * Math.max(1, supplyUnits) * 4) {
    throw new Error('This example requires a labeled supply that is a whole number of billing units; consult payer instructions for other packages.');
  }
  // CMS JW/JZ FAQ: do not bill waste already included in a rounded administered unit.
  const exactUnits = administeredMg / mgPerUnit;
  const nearest = Math.round(exactUnits);
  const administeredUnits = nearest >= 1 && Math.abs(exactUnits - nearest) <= Number.EPSILON * Math.max(1, exactUnits) * 4 ? nearest : Math.ceil(exactUnits);
  const discardedUnits = Math.max(0, Math.round(supplyUnits) - administeredUnits);
  return { administeredUnits, discardedUnits, totalUnits: administeredUnits + discardedUnits,
    discardedMg: packagedMg - administeredMg, modifier: discardedUnits > 0 ? 'JW' : 'JZ' };
}

export function convertNdc(value: string) {
  const parts = value.trim().split('-');
  if (parts.length !== 3 || !parts.every(p => /^\d+$/.test(p))) throw new Error('Enter a hyphenated 10-digit NDC with the original package segments.');
  const format = parts.map(p => p.length).join('-');
  if (!['4-4-2', '5-3-2', '5-4-1'].includes(format)) throw new Error('Use a 4-4-2, 5-3-2 or 5-4-1 package format. Do not guess the segments.');
  return parts.map((p, i) => p.padStart([5, 4, 2][i], '0')).join('-');
}

export function admissionReview(hasOrder: boolean, expectedMidnights: number, hasRationale: boolean) {
  finiteNumber(expectedMidnights, 'Expected midnights', 0, 365);
  if (!Number.isInteger(expectedMidnights)) throw new Error('Expected midnights must be a whole number.');
  if (!hasOrder) return { status: 'Missing admission order', detail: 'Resolve the missing valid practitioner order before relying on inpatient status. This screen cannot establish Part A payment eligibility.' };
  if (!hasRationale) return { status: 'Clinical documentation needed', detail: 'An order and a count of midnights alone do not establish reasonable and necessary inpatient care. Review the documented clinical basis.' };
  if (expectedMidnights < 2) return { status: 'Short-stay review needed', detail: 'The usual two-midnight expectation is not met. Review applicable exceptions and case-specific clinical factors; this is not an automatic denial.' };
  return { status: 'Benchmark inputs present — review required', detail: 'The entered order, expectation and rationale warrant review against 42 CFR § 412.3. This is not a coverage determination or a guaranteed payment.' };
}

export function clfsPhaseInFloor(previousRate: number, year: number) {
  finiteNumber(previousRate, 'Previous rate', 0.01);
  if (![2026, 2027, 2028, 2029].includes(year)) throw new Error('Select a supported payment year (2026–2029).');
  const reduction = year === 2026 ? 0 : 0.15;
  return { reduction, floor: Math.round(previousRate * (1 - reduction) * 10000) / 10000 };
}

export function scenarioCost(claims: number, averageAllowed: number, denialPercent: number, recoveryPercent: number, reworkCost: number) {
  finiteNumber(claims, 'Annual claims', 0, 1e7);
  if (!Number.isInteger(claims)) throw new Error('Annual claims must be a whole number.');
  finiteNumber(averageAllowed, 'Average allowed amount', 0, 1e7);
  finiteNumber(denialPercent, 'Denial percentage', 0, 100);
  finiteNumber(recoveryPercent, 'Recovery percentage', 0, 100);
  finiteNumber(reworkCost, 'Rework cost', 0, 1e6);
  const denied = claims * denialPercent / 100;
  const unrecovered = denied * averageAllowed * (1 - recoveryPercent / 100);
  return { denied, unrecovered, rework: denied * reworkCost, total: unrecovered + denied * reworkCost };
}

export async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function verifyDemoRecord(payload: string, expectedHash: string) {
  return (await sha256(payload)) === expectedHash;
}
