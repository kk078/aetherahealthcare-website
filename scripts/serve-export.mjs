import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = resolve('out');
const policy = await readFile(resolve(root, '_headers'), 'utf8');
const headers = Object.fromEntries(policy.split('\n').slice(1).filter(line => /^  [\w-]+:/.test(line)).map(line => { const i=line.indexOf(':'); return [line.slice(0,i).trim(),line.slice(i+1).trim()]; }));
headers['Cache-Control'] = 'no-cache';
const mime = { '.html':'text/html', '.js':'application/javascript', '.mjs':'application/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain', '.pdf':'application/pdf' };
createServer(async (request,response) => {
  try {
    const path = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    let file = resolve(root,'.'+path);
    if (!file.startsWith(root+'/') && file !== root) throw new Error('Invalid path');
    if ((await stat(file)).isDirectory()) {
      if(!path.endsWith('/')) { response.writeHead(308,{Location:path+'/'});response.end();return; }
      file=resolve(file,'index.html');
    }
    const bytes=await readFile(file);
    response.writeHead(200,{...headers,'Content-Type':mime[extname(file)]||'application/octet-stream'}); response.end(bytes);
  } catch { response.writeHead(404,{'Content-Type':'text/plain'}); response.end('Not found'); }
}).listen(Number(process.env.PORT||3100),'localhost',()=>console.log('Static export at http://localhost:'+ (process.env.PORT||3100)));
