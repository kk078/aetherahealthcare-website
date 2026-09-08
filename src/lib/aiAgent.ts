/** Same-origin assistant proxy with a local educational reference fallback. */
import { mentionsEntity } from './entityMatch';

import { DENIAL_CODES } from '@/lib/denialCodes';
import { getAllPayers } from '@/lib/payers';

export interface AgentAction {
  type: 'denial_tool' | 'timely_filing' | 'roi_estimate' | 'escalate_kiran';
  title: string;
  data: Record<string, unknown>;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: AgentAction[];
  timestamp: string;
}



/**
 * Scan message text for RCM entities to synthesize agentic action cards.
 */
export function extractAgentActions(userPrompt: string, assistantResponse: string): AgentAction[] {
  const actions: AgentAction[] = [];
  const text = `${userPrompt} ${assistantResponse}`.toLowerCase();

  // 1. Denial Code Tool Detection (e.g., CO-45, 16, 97, 204, 50)
  const denialMatches = userPrompt.match(/\b(?:co|pr|oa)?[- ]?([0-9]{1,3})\b/i) ||
                        assistantResponse.match(/\b(?:co|pr|oa)[- ]([0-9]{1,3})\b/i);
  if (denialMatches) {
    const codeNum = denialMatches[1];
    const found = DENIAL_CODES.find(d => d.code === codeNum || d.aliases.some(a => a.includes(codeNum)));
    if (found) {
      actions.push({
        type: 'denial_tool',
        title: `Denial Code Insight: CARC ${found.code}`,
        data: {
          code: found.code,
          label: found.label,
          category: found.category,
          difficulty: found.difficulty,
          rootCause: found.rootCause,
          workIt: found.workIt,
          prevent: found.prevent,
          rarc: found.rarc,
        },
      });
    }
  }

  // 2. Timely Filing / Payer Detection
  const payers = getAllPayers();
  const mentionedPayer = payers.find(p => {
    const pName = p.name.toLowerCase();
    const pSlug = p.slug.toLowerCase();
    return mentionsEntity(userPrompt, pName) || mentionsEntity(userPrompt, pSlug) || (p.aka && p.aka.some(a => mentionsEntity(userPrompt, a)));
  });

  if (mentionedPayer && (text.includes('timely') || text.includes('filing') || text.includes('deadline') || text.includes('payer id'))) {
    actions.push({
      type: 'timely_filing',
      title: `Payer Profile: ${mentionedPayer.name}`,
      data: {
        name: mentionedPayer.name,
        timelyFiling: mentionedPayer.timelyFiling || 'Standard 90–365 days depending on network agreement',
        appeal: mentionedPayer.appeal || 'Submit formal appeal with proof of timely submission (EDI 999/277CA)',
        payerId: mentionedPayer.payerId || 'Varies by state/clearinghouse',
        portalUrl: mentionedPayer.portalUrl,
        clearinghouse: mentionedPayer.clearinghouse || 'Availity / Waystar / Change Healthcare',
      },
    });
  }

  // 3. ROI & Practice Collections Detection
  const moneyMatch = userPrompt.match(/\$?([0-9]{2,4})[kK]|\$([0-9]{1,3}(?:,[0-9]{3})+)/);
  if (moneyMatch || text.includes('denial rate') || text.includes('days in ar') || text.includes('how much can i save')) {
    let monthlyVolume = 50000;
    if (moneyMatch) {
      if (moneyMatch[1]) monthlyVolume = parseInt(moneyMatch[1], 10) * 1000;
      else if (moneyMatch[2]) monthlyVolume = parseInt(moneyMatch[2].replace(/,/g, ''), 10);
    }
    const annualLift = Math.round(monthlyVolume * 12 * 0.08); // 8% average conservative lift
    actions.push({
      type: 'roi_estimate',
      title: 'Practice Cash Lift Benchmark',
      data: {
        monthlyVolume,
        annualLift,
        targetCleanRate: '98.7%',
        targetDaysInAr: '<32 days',
      },
    });
  }

  // 4. Human Escalation / Direct Contact Intent
  if (
    text.includes('human') ||
    text.includes('call me') ||
    text.includes('speak to') ||
    text.includes('talk to') ||
    text.includes('kiran') ||
    text.includes('callback') ||
    text.includes('consultation') ||
    text.includes('audit') ||
    text.includes('hire') ||
    text.includes('proposal')
  ) {
    actions.push({
      type: 'escalate_kiran',
      title: 'Connect with Kiran (Senior RCM Partner)',
      data: {
        url: '/schedule',
        note: 'Direct review of your practice billing & free claim audit via meeting or email request.',
      },
    });
  }

  // Deduplicate by action type
  const uniqueActions: AgentAction[] = [];
  const seenTypes = new Set<string>();
  for (const act of actions) {
    if (!seenTypes.has(act.type)) {
      seenTypes.add(act.type);
      uniqueActions.push(act);
    }
  }

  return uniqueActions;
}

/**
 * Rigorously eradicate and purge all phone numbers from text strings.
 * Replaces phone numbers with appropriate online contact/schedule links.
 */
export function eradicatePhoneNumbers(text: string): string {
  if (!text) return '';
  return text
    // "or call us at (813) 519-4640 to speak with..." -> "or reach out via /contact to connect with..."
    .replace(/or\s+(?:please\s+)?call\s+(?:us\s+)?(?:directly\s+)?(?:at\s+)?(?:\+?1[-. ]?)?\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}(?:\s+to\s+speak\s+with)?/gi, 'or reach out via /contact to connect with')
    // "call us directly at (813) 519-4640"
    .replace(/(?:please\s+)?call\s+(?:us\s+)?(?:directly\s+)?at\s+(?:\+?1[-. ]?)?\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}/gi, 'reach out directly via /contact')
    // "or call (813) 519-4640 to discuss..."
    .replace(/or\s+call\s+(?:\+?1[-. ]?)?\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}(?:\s+to\s+discuss\s+(?:your\s+)?options)?/gi, 'or reach out via /contact')
    // "call (813) 519-4640"
    .replace(/(?:please\s+)?call\s+(?:\+?1[-. ]?)?\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}/gi, 'contact us via /contact')
    // Catch specific known numbers
    .replace(/(?:\+?1[-. ]?)?\(?813\)?[-. ]?519[-. ]?4640/g, 'our team via /contact')
    .replace(/(?:\+?1[-. ]?)?\(?863\)?[-. ]?694[-. ]?0325/g, 'our team via /contact')
    // Catch any remaining US phone numbers (10 digits formatted)
    .replace(/(?:\+?1[-. ]?)?\(?[2-9][0-9]{2}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}/g, 'our team via /contact')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Local Deterministic RCM Engine fallback.
 * Provides grounded, authoritative medical billing answers if API/network is unavailable.
 */
function localGroundedRcmAnswer(query: string): string {
  const q = query.toLowerCase();

  // Check specific combined CO-45 & PR-204
  if ((q.includes('45') || q.includes('co-45')) && (q.includes('204') || q.includes('pr-204'))) {
    return `### Overturning & Resolving CO-45 & PR-204 Remittance Adjustments

**1. CARC CO-45: Charge Exceeds Fee Schedule / Contracted Maximum Allowable**
- **Classification:** Contractual Obligation (Payer adjustment — cannot be balance-billed to patient under in-network agreements).
- **Resolution Strategy:**
  - Audit the 835 ERA against your signed contracted fee schedule for that specific CPT code and modifier combination.
  - If the payer reimbursed below your contracted rate or erroneously downcoded the service, submit a formal underpayment appeal with a copy of your contract fee schedule attachment.
  - If the reimbursement accurately reflects your contracted rate, write off the contractual adjustment in your practice management system.

**2. CARC PR-204: Service Not Covered Under Patient’s Current Benefit Plan**
- **Classification:** Patient Responsibility (Service excluded, benefit exhausted, or non-covered plan rider).
- **Resolution Strategy:**
  - Verify patient eligibility on the date of service via real-time 270/271 clearinghouse inquiry.
  - If secondary or commercial supplemental insurance exists, submit a coordination of benefits (COB) secondary claim along with the primary 835 ERA remittance.
  - If the service is genuinely non-covered and a signed Advance Beneficiary Notice (ABN) or Notice of Non-Coverage was executed before treatment, shift the balance to patient responsibility (PR).

Would you like Kiran and our senior billing team to audit your practice's recent denial batch? Request a free analysis at /free-assessment or submit an inquiry at /contact.`;
  }

  // Check specific denial codes
  for (const d of DENIAL_CODES) {
    if (new RegExp(`\\b(?:co|pr|oa)?[- ]?${d.code}\\b`, 'i').test(q) || d.aliases.some(a => q === a.toLowerCase())) {
      return `### Denial Code CARC ${d.code}: ${d.label}
**Category:** ${d.category} (${d.difficulty.toUpperCase()})

**Root Cause:**
${d.rootCause}

**Resolution Strategy:**
${d.workIt}

**Prevention Protocol:**
${d.prevent}

*Paired RARCs:* \`${d.rarc}\`

Would you like Kiran and our senior billing team to audit your practice's recent denial batch? Schedule a free analysis at /free-assessment or submit an inquiry at /contact.`;
    }
  }

  // Check payers
  const payers = getAllPayers();
  for (const p of payers) {
    if (mentionsEntity(q, p.slug) || mentionsEntity(q, p.name) || (p.aka && p.aka.some(a => mentionsEntity(q, a)))) {
      return `### Payer Profile: ${p.name}
- **Payer ID:** ${p.payerId || 'Varies by state plan (confirm on member ID card)'}
- **Timely Filing Limit:** ${p.timelyFiling || 'Typically 90 to 365 days from date of service depending on participating provider agreement.'}
- **Appeals Window & Process:** ${p.appeal || 'Formal appeal submitted with 277CA/999 acceptance report and clinical chart records.'}
- **Clearinghouse EDI:** ${p.clearinghouse || 'Direct Availity / Waystar / Change Healthcare connection'}
${p.portalUrl ? `- **Provider Portal:** ${p.portalUrl}` : ''}

*Educational directory reference. Confirm the member plan, current contract and payer policy before using any deadline or routing identifier.*`;
    }
  }

  // Fees & Pricing
  if (q.includes('price') || q.includes('pricing') || q.includes('charge') || q.includes('cost') || q.includes('rate') || q.includes('fee')) {
    return `### Aethera Healthcare Solutions Pricing & Terms

We operate on a transparent, **100% performance-aligned model**:
- **Percentage Fee:** **3.5% to 5.0% of net collections** (tailored to your practice volume and specialty).
- **Setup & Onboarding Fees:** **$0 (Zero)** — we never charge upfront onboarding or implementation fees.
- **Contract Terms:** No restrictive multi-year lock-ins. We earn your business every month through results.
- **Included Services:** Full demographic entry, eligibility checks, certified AAPC/AHIMA medical coding, electronic claim submission, 835 ERA posting, aggressive denial appeals within 48 hours, patient billing inquiries, and monthly executive KPI dashboards.

Would you like a customized fee proposal for your practice? Feel free to submit an email inquiry at /contact or schedule a meeting directly with Kiran at /schedule.`;
  }

  // Specialties
  if (q.includes('cardiology') || q.includes('hospitalist') || q.includes('internal medicine') || q.includes('orthopedic') || q.includes('pediatric') || q.includes('specialt')) {
    return `### Multi-Specialty Medical Billing Expertise

Yes, Aethera Healthcare Solutions provides dedicated, certified specialty billing teams for:
- **Cardiology:** Catheterizations, echocardiograms, nuclear stress tests, device checks, and complex modifier -25/-59 unbundling review.
- **Hospital Medicine & Hospitalists:** Initial care (99221-99223), subsequent visits (99231-99233), discharge management, critical care (99291), and midnight census reconciliation.
- **Internal Medicine & Family Practice:** Annual Wellness Visits (AWVs), Chronic Care Management (CCM), preventive and acute dual-coding.
- **Orthopedics & Surgery:** Global surgery periods, assistant-at-surgery modifiers (-80/-82), and pre-authorization validation.
- **Behavioral Health & Psychiatry:** Psychotherapy add-on codes (+90833), intake assessments, and telehealth parity rules.

Our certified coders ensure accurate LCD/NCD coverage determination before claims leave the clearinghouse door. Reach out at /contact or /schedule to discuss your specialty.`;
  }

  // Timely filing general
  if (q.includes('timely') || q.includes('filing')) {
    return `### Standard US Healthcare Timely Filing Benchmarks

- **Medicare Part B:** **365 calendar days** (1 year) from Date of Service. (Appeals: Redetermination within 120 days).
- **Medicaid:** Varies strictly by state (e.g., Texas Medicaid: **95 days**, Florida Medicaid: **365 days**, New York: **90 days**).
- **UnitedHealthcare (Commercial):** **90 days** from DOS for participating providers; **180 days** for appeals.
- **Aetna:** **90 days** from DOS for in-network physicians; **180 days** for appeals.
- **Cigna:** **90 days** from DOS for participating providers; **180 days** from remit.
- **Blue Cross Blue Shield:** Typically **90 to 365 days** depending on local state Blue plan contract.
- **Tricare & VA:** **365 days** from DOS.

*Tip:* Always preserve electronic batch 999 Functional Acknowledgments and 277CA Claim Acknowledgments to prove timely electronic delivery if a payer erroneously rejects for timely filing. Schedule a practice audit at /schedule or contact us at /contact.`;
  }

  // General fallthrough
  return `I am Aethera's AI Revenue Cycle Specialist. I can answer questions about:
- **Payer Timely Filing Limits & Appeals** (Medicare, Medicaid, UHC, BCBS, Aetna, Cigna)
- **Denial Code Resolution** (CARC/RARC codes like CO-45, PR-204, CO-16, CO-97)
- **Specialty Medical Billing** (Hospitalists, Cardiology, Primary Care, Orthopedics, Mental Health)
- **Aethera's Services & Transparent 3.5%–5.0% Pricing**

How can I help your practice today? You can submit an email request at /contact or schedule a consultation with Kiran and our senior billing team at /schedule anytime!`;
}

/**
 * Send a prompt to Agentic AI with fallback to forms worker and local grounded engine.
 */
export async function askAiAgent(
  prompt: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<{ text: string; actions: AgentAction[] }> {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    return { text: 'Please enter a question about billing, payers, or services.', actions: [] };
  }

  // 1. High-Confidence Grounded RCM Knowledge Engine (instant, deterministic, zero-lag)
  const groundedText = localGroundedRcmAnswer(cleanPrompt);
  const isGenericFallthrough = groundedText.startsWith("I am Aethera's AI Revenue Cycle Specialist");

  // If we have a specific domain match, return it immediately
  if (!isGenericFallthrough) {
    const sanitized = eradicatePhoneNumbers(groundedText);
    const actions = extractAgentActions(cleanPrompt, sanitized);
    return { text: sanitized, actions };
  }

  // 3. Query Cloudflare Forms Worker Assistant Endpoint (with mandatory phone eradication)
  try {
    const workerRes = await fetch('/api/assistant', {
      signal: AbortSignal.timeout(15000),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: cleanPrompt,
        history: history.slice(-6),
      }),
    });

    if (workerRes.ok) {
      const data = await workerRes.json();
      if (data.answer) {
        const sanitized = eradicatePhoneNumbers(data.answer);
        const actions = extractAgentActions(cleanPrompt, sanitized);
        return { text: sanitized, actions };
      }
    }
  } catch {
    // Fall through to grounded local engine
  }

  // 4. Grounded Deterministic Knowledge Fallback
  const sanitizedFallback = eradicatePhoneNumbers(groundedText);
  const actions = extractAgentActions(cleanPrompt, sanitizedFallback);
  return { text: sanitizedFallback, actions };
}

