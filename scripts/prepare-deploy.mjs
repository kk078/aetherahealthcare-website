/** Provision the website's durable lead database and bind server secrets before deployment. */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account, RATE_LIMIT_SECRET: rateSecret, LEAD_RETRY_SECRET: retrySecret } = process.env;
if (!token || !account || !rateSecret || !retrySecret) throw new Error('Deployment requires CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, RATE_LIMIT_SECRET and LEAD_RETRY_SECRET. No deployment was attempted.');
async function api(path, method = 'GET', body) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}${path}`, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000) });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(`Cloudflare ${method} ${path} failed (${response.status}); check token permissions. No credentials logged.`);
  return result.result;
}
const name = 'aethera-website-leads';
let database = (await api('/d1/database?name='+name)).find(db => db.name === name);
if (!database) database = await api('/d1/database','POST',{ name });
const project = 'aetherahealthcare-website';
const projectInfo = await api(`/pages/projects/${project}`);
if (typeof projectInfo.production_branch !== 'string' || !/^[a-zA-Z0-9_./-]+$/.test(projectInfo.production_branch)) throw new Error('Pages project must have a configured production branch.');
for (const [name, value] of [['RATE_LIMIT_SECRET', rateSecret], ['LEAD_RETRY_SECRET', retrySecret]]) {
  // Feed one secret through stdin; never serialize masked existing secrets back to the API.
  execFileSync('npx', ['wrangler', 'pages', 'secret', 'put', name, '--project-name', project], { input: value, stdio: ['pipe', 'pipe', 'pipe'] });
}
await mkdir('.wrangler', { recursive: true });
await writeFile('.wrangler/production-branch', projectInfo.production_branch);
await writeFile('.wrangler/deploy.json', JSON.stringify({
  name: project, pages_build_output_dir: resolve('out'), compatibility_date: '2026-09-07',
  d1_databases: [{ binding: 'LEADS_DB', database_name: name, database_id: database.uuid, migrations_dir: resolve('migrations') }],
}, null, 2));
console.log('Durable lead binding prepared. Apply migrations and deploy the tested artifact with .wrangler/deploy.json.');
