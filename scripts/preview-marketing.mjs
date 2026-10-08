import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
const server=spawn(process.execPath,['scripts/serve-export.mjs'],{env:{...process.env,PORT:'3101'},stdio:'ignore'});
let browser;
try {
  for(let attempt=0;attempt<100;attempt++){try {if((await fetch('http://localhost:3101/')).ok)break;}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
  browser=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='localhost'?route.continue():route.abort());
  await page.addInitScript(()=>localStorage.setItem('aethera-consent-v2',JSON.stringify({version:2,choice:'declined',expiresAt:Date.now()+86400000})));
  const dir=process.env.PLAYWRIGHT_ARTIFACT_DIR || '/tmp/aethera-marketing-verification/previews';await mkdir(dir,{recursive:true});
  for(const [slug,path] of [['home','/'],['pricing','/pricing/'],['campaign','/lp/solo-practice-rcm/'],['sprint','/lp/denial-recovery-sprint/'],['tools','/tools/']]){
    await page.goto('http://localhost:3101'+path);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(400);await page.screenshot({path:dir+'/'+slug+'-desktop.png'});
  }
  await page.setViewportSize({width:390,height:844});
  for(const [slug,path] of [['home','/'],['campaign','/lp/solo-practice-rcm/'],['sprint','/lp/denial-recovery-sprint/']]){
    await page.goto('http://localhost:3101'+path);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(400);await page.screenshot({path:dir+'/'+slug+'-mobile.png'});
  }
  await page.goto('http://localhost:3101/');await page.getByRole('button',{name:'Start the Free 50-Claim Pilot',exact:true}).click();await page.getByRole('dialog').waitFor();await page.screenshot({path:dir+'/pilot-mobile.png'});
  console.log('Saved 9 local previews to '+dir);
} finally {if(browser)await browser.close();server.kill();}
