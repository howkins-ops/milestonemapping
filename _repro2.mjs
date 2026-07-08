import { chromium } from 'playwright-core';

const errors = [];
const browser = await chromium.launch({ channel: 'msedge', headless: true }).catch(() => chromium.launch({ headless: true }));
const ctx = await browser.newContext({ viewport: { width: 420, height: 900 } });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + (e.stack || e.message)));

const step = async (label) => {
  await page.waitForTimeout(1200);
  const t = (await page.innerText('body').catch(() => '')).replace(/\s+/g,' ').slice(0, 350);
  const glitch = /glitch|something went wrong/i.test(t);
  console.log(`\n[${label}] glitch=${glitch} err=${errors.length}`);
  console.log('   ' + JSON.stringify(t));
  return glitch;
};

await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
await page.fill('input[type="email"]', 'coachowkins@gmail.com');
await page.fill('input[type="password"]', 'demodemo');
await (await page.$('button[type="submit"]'))?.click();
await page.waitForTimeout(6000);

// dismiss splash SKIP if present
for (const s of ['button:has-text("SKIP")','text=SKIP ▶','text=SKIP']) {
  const el = await page.$(s); if (el) { await el.click({force:true}).catch(()=>{}); break; }
}
await step('after-login');

// click ENTER THE ZONE card
const enterZone = await page.$('text=ENTER THE ZONE');
if (enterZone) await enterZone.click({ force: true }).catch(()=>{});
await step('zone-home');

// Open the Roster from the topbar
const roster = await page.$('button:has-text("Roster")') || await page.$('[aria-label*="roster" i]') || await page.$('text=ROSTER');
console.log('ROSTER btn:', !!roster);
if (roster) await roster.click({ force: true }).catch(()=>{});
await step('roster-open');

// Launch Full Court
const fc = await page.$('button:has-text("Full Court")') || await page.$('text=Full Court');
console.log('FULLCOURT btn:', !!fc);
if (fc) await fc.click({ force: true }).catch(()=>{});
await step('fullcourt');

// Try each game in the roster if reachable: reopen roster and click each
const gameTitles = ['The Vow','Boss Forge','Chain of Fire','The Duel','Ascension','Dawn Raid','Eat the Frog','The Pit','Grind Room'];
for (const gt of gameTitles) {
  const r = await page.$('button:has-text("Roster")') || await page.$('text=ROSTER');
  if (r) { await r.click({force:true}).catch(()=>{}); await page.waitForTimeout(600); }
  const g = await page.$(`button:has-text("${gt}")`);
  if (g) { await g.click({ force: true }).catch(()=>{}); }
  const glitch = await step('game:'+gt);
  if (glitch) { console.log('!!! GLITCH on ' + gt); break; }
}

console.log('\n=== ERRORS (' + errors.length + ') ===');
for (const e of errors.slice(0, 25)) console.log(e.slice(0, 500));
await browser.close();
