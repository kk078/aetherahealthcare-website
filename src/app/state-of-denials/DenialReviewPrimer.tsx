import Link from 'next/link';
import { SPECIALTY_BENCHMARKS } from '@/lib/denialBenchmarks';

/** Server-rendered guide copy, so the page's substance doesn't depend on picking a specialty first. */
export default function DenialReviewPrimer() {
  return (
    <section className="mb-10 space-y-6 text-slate-700">
      <div>
        <h2 className="text-2xl font-bold text-navy">How to review a denied claim</h2>
        <p className="mt-3">
          A denial is the payer&apos;s answer to a specific claim on a specific date of service, so a useful review starts
          with the remittance rather than with a guess. The 835 ERA or paper EOB carries a claim adjustment group code
          and one or more claim adjustment reason codes (CARCs), often with remittance advice remark codes (RARCs) that
          narrow down what the payer wants. Read those codes against the current X12 code lists before deciding whether
          the claim needs a correction, a reconsideration or a formal appeal.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-bold text-navy">What the group code tells you</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>CO (contractual obligation):</strong> the provider is responsible, so the amount cannot be billed to the patient.</li>
          <li><strong>PR (patient responsibility):</strong> deductible, coinsurance, copay or a non-covered service the patient agreed to.</li>
          <li><strong>OA (other adjustment):</strong> neither of the above, for example a coordination-of-benefits adjustment.</li>
          <li><strong>PI (payer-initiated reduction):</strong> a payer reduction that is not contractual and not the patient&apos;s responsibility.</li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-bold text-navy">A four-step review</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Collect the EOB or ERA, the claim as submitted, the payer policy and the supporting documentation.</li>
          <li>Confirm the reason code in the current code list and check coverage and contract terms for the date of service.</li>
          <li>Check eligibility, authorization, coding and documentation before choosing between a corrected claim and an appeal.</li>
          <li>Record the filing deadline, the owner and the next action, then track outcomes against your own baseline.</li>
        </ol>
      </div>
      <div>
        <h3 className="text-lg font-bold text-navy">Where each specialty&apos;s denials usually start</h3>
        <dl className="mt-2 grid gap-3 sm:grid-cols-2">
          {SPECIALTY_BENCHMARKS.map(item => (
            <div key={item.slug} className="rounded-xl border border-slate-200 bg-white p-4">
              <dt className="font-semibold text-navy">{item.name}</dt>
              <dd className="mt-1 text-sm">{item.watchout}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p>
        Look up any code in the <Link href="/tools/denial-code-lookup/" className="text-teal underline">CARC and RARC lookup</Link>,
        decode a full remittance with the <Link href="/tools/era-835-decoder/" className="text-teal underline">835 ERA decoder</Link>,
        or draft a response with the <Link href="/tools/appeal-letter-generator/" className="text-teal underline">appeal letter generator</Link>.
        Choose your specialty below for a printable checklist.
      </p>
    </section>
  );
}
