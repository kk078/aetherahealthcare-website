/**
 * Agentic AI Client for Aethera Healthcare Solutions.
 *
 * Multi-tier intelligent architecture:
 * 1. Direct LLM REST API (when NEXT_PUBLIC_AI_API_KEY is configured)
 * 2. Cloudflare Worker Assistant proxy (https://aethera-forms.aetherahealthcare.workers.dev/api/assistant)
 * 3. Grounded Deterministic RCM Knowledge Engine (instant lookup across 10,600+ clearinghouse payers, 229 curated playbooks, and CARC/RARC denial codes)
 *
 * Also extracts structured agentic actions (denial resolution, timely filing, ROI recovery, and human escalation to Kiran).
 */

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

const FORMS_URL = process.env.NEXT_PUBLIC_FORMS_URL || 'https://aethera-forms.aetherahealthcare.workers.dev';
const API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY || '';

const SYSTEM_PROMPT = `You are Aethera's Senior AI Revenue Cycle & Practice Management Specialist, pairing with Kiran and the senior billing leadership team at Aethera Healthcare Solutions.

Your mission:
Provide authoritative, actionable, and clinically grounded medical billing guidance for US physicians, hospitalists, clinic owners, and practice managers.

Key Aethera Facts:
- Core Services: Full-service Revenue Cycle Management (RCM), credentialing, charge capture & scrubbing, certified coding (AAPC/AHIMA), EDI 837 claim submission, 835 ERA auto-posting, denial recovery & appeals, patient billing & statements, monthly KPI analytics.
- Pricing: Performance-based, transparent fee between 3.5% and 5.0% of net collections based on monthly volume and specialty. Zero upfront setup fee, zero onboarding fee, no long-term restrictive contracts.
- Performance: 98.7% first-pass clean claim rate, average 15-20% revenue collection lift, Days in A/R under 32 days (industry average is 45-50+ days).
- Direct Senior Partner: Kiran (kirkmar078@gmail.com) and the senior billing team review every practice profile directly.
- Phone: +1 (813) 519-4640.

Guidance Rules:
- If asked about denial codes (e.g., CO-45, PR-204, CO-16, CO-18, CO-97), explain the CARC/RARC root cause, difference between contractual adjustment and patient balance, and step-by-step appeal/resubmission strategy.
- If asked about timely filing limits, quote standard payer rules (e.g. Medicare 365 days, Texas Medicaid 95 days, UHC/Aetna/Cigna 90 days commercial) and mention proving timely filing via 277CA / 999 EDI confirmations.
- Always offer escalation to Kiran (kirkmar078@gmail.com) or booking a free practice assessment at /free-assessment for a deep audit of their specific billing claims and aging A/R.
- Be concise, professional, empathetic, and organized with clear bullet points.`;

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
    return text.includes(pName) || text.includes(pSlug) || (p.aka && p.aka.some(a => text.includes(a.toLowerCase())));
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
        email: 'kirkmar078@gmail.com',
        phone: '(813) 519-4640',
        note: 'Direct review of your practice billing & free claim audit.',
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
 * Local Deterministic RCM Engine fallback.
 * Provides grounded, authoritative medical billing answers if API/network is unavailable.
 */
function localGroundedRcmAnswer(query: string): string {
  const q = query.toLowerCase();

  // Check specific denial codes
  for (const d of DENIAL_CODES) {
    if (q.includes(d.code) || d.aliases.some(a => q.includes(a.toLowerCase()))) {
      return `### Denial Code CARC ${d.code}: ${d.label}
**Category:** ${d.category} (${d.difficulty.toUpperCase()})

**Root Cause:**
${d.rootCause}

**Resolution Strategy:**
${d.workIt}

**Prevention Protocol:**
${d.prevent}

*Paired RARCs:* \`${d.rarc}\`

Would you like Kiran and our senior billing team to audit your practice's recent denial batch? Click **Request Callback** or schedule a free analysis at /free-assessment.`;
    }
  }

  // Check payers
  const payers = getAllPayers();
  for (const p of payers) {
    if (q.includes(p.slug.toLowerCase()) || q.includes(p.name.toLowerCase()) || (p.aka && p.aka.some(a => q.includes(a.toLowerCase())))) {
      return `### Payer Profile: ${p.name}
- **Payer ID:** ${p.payerId || 'Varies by state plan (confirm on member ID card)'}
- **Timely Filing Limit:** ${p.timelyFiling || 'Typically 90 to 365 days from date of service depending on participating provider agreement.'}
- **Appeals Window & Process:** ${p.appeal || 'Formal appeal submitted with 277CA/999 acceptance report and clinical chart records.'}
- **Clearinghouse EDI:** ${p.clearinghouse || 'Direct Availity / Waystar / Change Healthcare connection'}
${p.portalUrl ? `- **Provider Portal:** ${p.portalUrl}` : ''}

*Aethera Healthcare maintains direct electronic claim pipelines with ${p.name} for sub-second verification and clean claims submission.*`;
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

Would you like a customized fee proposal for your practice? Feel free to request a callback or connect directly with Kiran at kirkmar078@gmail.com.`;
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

Our certified coders ensure accurate LCD/NCD coverage determination before claims leave the clearinghouse door.`;
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

*Tip:* Always preserve electronic batch 999 Functional Acknowledgments and 277CA Claim Acknowledgments to prove timely electronic delivery if a payer erroneously rejects for timely filing.`;
  }

  // General fallthrough
  return `I am Aethera's AI Revenue Cycle Specialist. I can answer questions about:
- **Payer Timely Filing Limits & Appeals** (Medicare, Medicaid, UHC, BCBS, Aetna, Cigna)
- **Denial Code Resolution** (CARC/RARC codes like CO-45, PR-204, CO-16, CO-97)
- **Specialty Medical Billing** (Hospitalists, Cardiology, Primary Care, Orthopedics, Mental Health)
- **Aethera's Services & Transparent 3.5%–5.0% Pricing**

How can I help your practice today? You can also request a callback from Kiran and our senior billing team anytime!`;
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

  // 1. If API key is available, query direct REST API
  if (API_KEY) {
    try {
      const contents = [
        ...history.slice(-6).map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
        { role: 'user', parts: [{ text: cleanPrompt }] },
      ];

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          const actions = extractAgentActions(cleanPrompt, candidate);
          return { text: candidate, actions };
        }
      }
    } catch {
      // Fall through to forms worker proxy
    }
  }

  // 2. Query Cloudflare Forms Worker Assistant Endpoint
  try {
    const workerRes = await fetch(`${FORMS_URL}/api/assistant`, {
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
        const actions = extractAgentActions(cleanPrompt, data.answer);
        return { text: data.answer, actions };
      }
    }
  } catch {
    // Fall through to grounded local engine
  }

  // 3. Grounded Deterministic Knowledge Fallback
  const groundedText = localGroundedRcmAnswer(cleanPrompt);
  const actions = extractAgentActions(cleanPrompt, groundedText);
  return { text: groundedText, actions };
}

