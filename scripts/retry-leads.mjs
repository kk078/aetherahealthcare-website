/**
 * Autonomous retry dispatcher for pending website leads.
 * Connects directly to the Cloudflare D1 REST API (bypassing public CDN and Bot Fight Mode),
 * finds any unacknowledged leads, dispatches them to the CRM, and updates their delivery status.
 */

const {
  CLOUDFLARE_API_TOKEN: token,
  CLOUDFLARE_ACCOUNT_ID: account,
  CRM_API_URL: crmUrl,
  CRM_API_TOKEN: crmToken,
  LEAD_RETRY_SECRET: retrySecret,
} = process.env;

const CRM_BASE = (crmUrl || 'https://aethera-crm-api.aetherahealthcare.workers.dev/api/v1/public/website').replace(/\/$/, '');
const CONTACT_EMAIL = 'kirkmar078@gmail.com';

function mapToCrm(lead) {
  const { data, formType } = lead;
  const s = (key) => (data[key] == null ? '' : String(data[key]));
  const name =
    s('name') ||
    s('contactName') ||
    [s('firstName'), s('lastName')].filter(Boolean).join(' ') ||
    s('practiceContact') ||
    'Website Visitor';
  const shared = {
    submissionId: lead.submissionId,
    source: formType,
    routedTo: CONTACT_EMAIL,
    attribution: lead.attribution ?? {},
  };
  if (['gap', 'gap_analysis', 'free_assessment'].includes(formType)) {
    return {
      path: formType === 'free_assessment' ? '/assessments' : '/gap-analyses',
      payload: { ...data, ...shared },
    };
  }
  const detail = Object.fromEntries(
    Object.entries(data).filter(([key]) => !['hp_field', 'botcheck'].includes(key))
  );
  return {
    path: '/contact',
    payload: {
      ...shared,
      name,
      email: s('email') || s('contactEmail') || s('scheduleEmail'),
      phone: s('phone') || s('contactPhone') || s('schedulePhone'),
      practice: s('practice') || s('practiceName') || s('contactPractice'),
      specialty: s('specialty') || s('practiceSpecialty'),
      message: [
        s('message') ||
          s('consultationNotes') ||
          s('notes') ||
          s('bottleneck') ||
          `${formType.replaceAll('_', ' ')} from website`,
        JSON.stringify(detail),
        lead.attribution ? `Campaign: ${JSON.stringify(lead.attribution)}` : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
    },
  };
}

function acknowledged(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  if (body.ok === false || body.success === false || body.success === 'false' || body.error) return false;
  return body.ok === true || body.success === true || body.success === 'true' || typeof body.id === 'string' || typeof body.id === 'number';
}

async function cfApi(path, method = 'GET', body = null) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30000),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(`Cloudflare API ${method} ${path} failed (${response.status}): ${JSON.stringify(result.errors || [])}`);
  }
  return result.result;
}

async function queryD1(dbId, sql, params = []) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${dbId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
    signal: AbortSignal.timeout(30000),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(`D1 query failed: ${JSON.stringify(result.errors || [])}`);
  }
  return result.result?.[0]?.results || [];
}

async function executeD1(dbId, sql, params = []) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${dbId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
    signal: AbortSignal.timeout(30000),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(`D1 execute failed: ${JSON.stringify(result.errors || [])}`);
  }
  return result.result?.[0];
}

async function processDirectD1() {
  const dbName = 'aethera-website-leads';
  const databases = await cfApi(`/d1/database?name=${dbName}`);
  const db = databases.find((d) => d.name === dbName);
  if (!db) {
    console.log(`D1 database "${dbName}" not found. Nothing to retry.`);
    return;
  }
  const dbId = db.uuid;
  const now = Date.now();

  // Find up to 20 pending leads whose lease has expired
  const pendingLeads = await queryD1(
    dbId,
    'SELECT id, payload FROM leads WHERE delivered_at IS NULL AND lease_until < ? ORDER BY created_at LIMIT 20',
    [now]
  );

  console.log(`Found ${pendingLeads.length} pending lead(s) needing delivery.`);

  for (const row of pendingLeads) {
    const { id, payload } = row;
    try {
      // Lease row to prevent duplicate dispatch
      await executeD1(dbId, 'UPDATE leads SET lease_until = ?, attempts = attempts + 1 WHERE id = ?', [now + 60000, id]);

      const lead = JSON.parse(payload);
      const mapped = mapToCrm(lead);
      const targetUrl = CRM_BASE + mapped.path;

      console.log(`Dispatching lead ${id} to ${targetUrl}...`);
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': id,
          ...(crmToken ? { Authorization: `Bearer ${crmToken}` } : {}),
        },
        body: JSON.stringify(mapped.payload),
        signal: AbortSignal.timeout(15000),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok || !acknowledged(body)) {
        throw new Error(`CRM rejected lead (${res.status}): ${JSON.stringify(body)}`);
      }

      await executeD1(dbId, 'UPDATE leads SET delivered_at = ?, last_error = NULL WHERE id = ?', [Date.now(), id]);
      console.log(`Successfully delivered lead ${id}.`);
    } catch (err) {
      console.error(`Failed to dispatch lead ${id}:`, err.message);
      await executeD1(
        dbId,
        'UPDATE leads SET last_error = ?, lease_until = ? WHERE id = ?',
        [String(err.message).slice(0, 200), Date.now() + 300000, id]
      ).catch(() => {});
    }
  }

  // Cleanup old delivered leads (>30 days) and expired rate limits
  await executeD1(dbId, 'DELETE FROM leads WHERE delivered_at IS NOT NULL AND delivered_at < ?', [Date.now() - 30 * 86400000]).catch(() => {});
  await executeD1(dbId, 'DELETE FROM request_limits WHERE expires_at < ?', [Date.now()]).catch(() => {});

  const remaining = await queryD1(dbId, 'SELECT COUNT(*) AS count FROM leads WHERE delivered_at IS NULL');
  console.log(`Retry pass complete. Remaining pending leads: ${remaining[0]?.count ?? 0}`);
}

async function processViaEdgeHttp() {
  const url = 'https://aetherahealthcare.com/api/retry-leads';
  console.log(`Attempting edge HTTP trigger: ${url}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${retrySecret}`,
      Accept: 'application/json',
      Origin: 'https://aetherahealthcare.com',
      Referer: 'https://aetherahealthcare.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  console.log('Edge retry successful:', data);
}

async function main() {
  if (token && account) {
    await processDirectD1();
  } else if (retrySecret) {
    await processViaEdgeHttp();
  } else {
    console.warn('Neither CLOUDFLARE_API_TOKEN nor LEAD_RETRY_SECRET provided. Skipping.');
  }
}

main().catch((err) => {
  console.error('Fatal error during lead retry:', err);
  process.exit(1);
});
