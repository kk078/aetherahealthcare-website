// Owner approved on 2026-10-08; one dev-only advisory, expires 2026-10-15.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const until = Date.parse('2026-10-15T00:00:00Z');
const advisory = 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm';
const chain = new Set(['braces', 'micromatch', 'fast-glob', '@next/eslint-plugin-next', 'eslint-config-next']);
export function blockedFindings(audit, lock, now = Date.now()) {
  function permitted(name, visited = new Set()) {
    const finding = audit.vulnerabilities[name];
    if (now >= until || !chain.has(name) || visited.has(name) || !finding?.nodes?.length || !finding.via?.length) return false;
    if (finding.nodes.some(node => lock.packages[node]?.dev !== true)) return false;
    return finding.via.every(via => typeof via === 'string' ? permitted(via, new Set([...visited, name])) : via.url === advisory);
  }
  return Object.entries(audit.vulnerabilities).filter(([, finding]) => ['high', 'critical'].includes(finding.severity)).filter(([name]) => !permitted(name));
}

import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const result = spawnSync('npm', ['audit', '--json'], { encoding: 'utf8' });
  if (result.error || result.signal || ![0, 1].includes(result.status)) throw new Error('Dependency audit could not complete');
  const audit = JSON.parse(result.stdout);
  if (audit.error || !audit.vulnerabilities) throw new Error('Invalid dependency audit response');
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));

  const severe = Object.entries(audit.vulnerabilities).filter(([, finding]) => ['high', 'critical'].includes(finding.severity));
  const blocked = blockedFindings(audit, lock);
  if (blocked.length) { console.error('Blocking dependency findings:', blocked.map(([name]) => name).join(', ')); process.exitCode = 1; }
  else if (severe.length) console.log(`Owner-approved temporary exception for ${advisory}; dev-only ESLint chain; expires 2026-10-15. No production finding exempted.`);
  else console.log('No high or critical dependency findings.');
}
