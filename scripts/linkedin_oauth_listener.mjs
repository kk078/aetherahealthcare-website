#!/usr/bin/env node
/**
 * One-click OAuth 2.0 Token Listener for LinkedIn
 */
import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const ENV_LOCAL = resolve(ROOT_DIR, '.env.local');

// Load .env.local
if (existsSync(ENV_LOCAL)) {
  const content = readFileSync(ENV_LOCAL, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq !== -1) {
      const k = trimmed.slice(0, eq).trim();
      let v = trimmed.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '';
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:8080/callback';
const PORT = 8080;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET must be set in .env.local');
  process.exit(1);
}

const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent('w_member_social openid profile email')}&state=aethera_${Date.now()}`;

console.log('====================================================');
console.log('  LinkedIn OAuth 2.0 One-Click Authentication Server');
console.log('====================================================\n');
console.log('Listening on:', REDIRECT_URI);
console.log('\nAuthorization URL:\n' + authUrl + '\n');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
      console.error(`Authorization rejected: ${error} - ${errorDescription}`);
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h2>Authorization Failed</h2><p>${error}: ${errorDescription}</p>`);
      return;
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h2>No code received</h2>');
      return;
    }

    console.log('Authorization code received. Exchanging for Access Token...');

    try {
      const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        throw new Error(`Token exchange failed (${tokenRes.status}): ${errText}`);
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;
      console.log('Access token received! Token length:', accessToken.length);

      console.log('Fetching userinfo from LinkedIn API...');
      const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      let authorUrn = '';
      let userName = 'Kiran';
      if (userRes.ok) {
        const userData = await userRes.json();
        userName = userData.name || userData.given_name || 'Kiran';
        authorUrn = `urn:li:person:${userData.sub}`;
        console.log(`Authenticated User: ${userName} (URN: ${authorUrn})`);
      }

      if (!authorUrn) {
        authorUrn = 'urn:li:person:YOUR_NUMERIC_ID';
      }

      let currentEnv = existsSync(ENV_LOCAL) ? readFileSync(ENV_LOCAL, 'utf8') : '';
      currentEnv = currentEnv
        .replace(/LINKEDIN_ACCESS_TOKEN=.*\n?/, '')
        .replace(/LINKEDIN_AUTHOR_URN=.*\n?/, '')
        .trim();

      const updatedEnv = `${currentEnv}\nLINKEDIN_ACCESS_TOKEN=${accessToken}\nLINKEDIN_AUTHOR_URN=${authorUrn}\n`.trim() + '\n';
      await writeFile(ENV_LOCAL, updatedEnv, 'utf8');
      console.log('Saved LINKEDIN_ACCESS_TOKEN and LINKEDIN_AUTHOR_URN to .env.local successfully!');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Aethera LinkedIn Authorization Success</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #001A52; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #fff; color: #1e293b; padding: 40px; border-radius: 16px; max-width: 520px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
            h1 { color: #003087; font-size: 26px; margin-bottom: 12px; }
            p { font-size: 16px; line-height: 1.5; color: #475569; }
            .badge { background: #E6F4EA; color: #137333; font-weight: 700; padding: 6px 14px; border-radius: 20px; display: inline-block; font-size: 14px; margin-bottom: 16px; }
            .urn { background: #f1f5f9; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 14px; color: #003087; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">✓ Connected Successfully</div>
            <h1>Authentication Complete</h1>
            <p>Welcome, <strong>${userName}</strong>! Your LinkedIn account has been authenticated for Aethera Healthcare Solutions.</p>
            <div class="urn">${authorUrn}</div>
            <p style="font-size: 14px; color: #64748B;">You can now close this tab and return to your terminal / agent.</p>
          </div>
        </body>
        </html>
      `);

      setTimeout(() => {
        console.log('Shutting down OAuth listener server...');
        server.close(() => process.exit(0));
      }, 2000);
    } catch (err) {
      console.error('Error during token exchange:', err.message);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h2>Error during token exchange</h2><p>${err.message}</p>`);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}. Waiting for authorization callback...`);
});
