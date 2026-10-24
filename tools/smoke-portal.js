#!/usr/bin/env node
// Walks a built portal as every audience and fails on what the ONYX render passes kept
// catching by eye: a script error, a page that renders empty, and a page wider than the
// phone it is on.
//
//   node tools/smoke-portal.js onyx                 the single file, clients/<slug>/portal/<slug>-portal.html
//   node tools/smoke-portal.js onyx --shots <dir>   also screenshot every page at 390px and 1280px
//
// Each audience is entered by seeding its storage with every key unlocked, then the tool
// visits its tabs, its path, every item it can see, every process, post and the Insights
// page where the config has them. Exits non-zero on any failure, so an automation can
// gate on it. Needs Playwright, which is preinstalled in the cloud sessions; nothing in
// the build depends on it.

const fs = require('fs');
const path = require('path');

const slug = process.argv[2];
if (!slug) { console.error('usage: node tools/smoke-portal.js <client-slug> [--shots <dir>]'); process.exit(1); }
const si = process.argv.indexOf('--shots');
const shots = si > 0 ? path.resolve(process.argv[si + 1]) : null;
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright is not installed here; run this where it is (any cloud session has it).'); process.exit(2); }

const root = path.join(__dirname, '..');
const portalDir = path.join(root, 'clients', slug, 'portal');
const file = path.join(portalDir, `${slug}-portal.html`);
const cfg = JSON.parse(fs.readFileSync(path.join(portalDir, `${slug}-portal.json`), 'utf8'));
if (!fs.existsSync(file)) { console.error(`no build at ${path.relative(root, file)}; run node tools/build-portal.js ${slug}`); process.exit(1); }

// The engine's own rule for who sees whose content, for audiences that do not declare it.
const sees = a => a.sees || (a.id === 'employee' ? ['employee'] : [a.id, 'employee']);
const gated = (block, a) => block && (!block.audiences || block.audiences.includes(a.id));

function pagesFor(a) {
  const hashes = new Set(['#/home']);
  for (const n of cfg.nav || []) if (!n.audiences || n.audiences.includes(a.id)) hashes.add('#/' + n.id);
  if ((cfg.paths || []).some(p => p.audience === a.id)) hashes.add('#/path');
  for (const i of cfg.items) if (sees(a).includes(i.audience)) hashes.add('#/item/' + i.id);
  if (gated(cfg.processes, a)) for (const p of cfg.processes.items || []) hashes.add('#/process/' + p.id);
  if (gated(cfg.news, a)) for (const p of cfg.news.posts || []) hashes.add('#/post/' + p.id);
  if (gated(cfg.reports, a) && cfg.reports.insights) hashes.add('#/insights');
  return [...hashes];
}

(async () => {
  const browser = await chromium.launch();
  const failures = [];
  let visited = 0;
  for (const a of cfg.audiences) {
    const state = { landed: true, nameSkipped: true, name: 'QA', audience: a.id,
      unlocked: Object.fromEntries(cfg.audiences.filter(x => x.key).map(x => [x.id, true])) };
    for (const vp of shots ? [{ w: 390, h: 844 }, { w: 1280, h: 900 }] : [{ w: 390, h: 844 }]) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.w < 500, hasTouch: vp.w < 500 });
      await ctx.addInitScript(([k, s]) => { if (!sessionStorage.getItem('smoke')) { localStorage.setItem(k, s); sessionStorage.setItem('smoke', '1'); } }, [cfg.storageKey, JSON.stringify(state)]);
      const page = await ctx.newPage();
      let errs = [];
      page.on('pageerror', e => errs.push(e.message));
      page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_INTERNET_DISCONNECTED|net::/.test(m.text())) errs.push(m.text()); });
      await page.goto('file://' + file + '#/home');
      for (const h of pagesFor(a)) {
        errs = [];
        await page.evaluate(x => { location.hash = x; }, h);
        await page.waitForTimeout(120);
        const r = await page.evaluate(() => ({
          hash: location.hash,
          text: (document.getElementById('view') || {}).innerText || '',
          over: document.documentElement.scrollWidth - document.documentElement.clientWidth
        }));
        visited++;
        const where = `${a.id} ${vp.w}px ${h}`;
        if (errs.length) failures.push(`${where}: script error: ${errs.join(' | ')}`);
        if (r.text.trim().length < 20) failures.push(`${where}: rendered empty (landed on ${r.hash})`);
        else if (/^#\/welcome/.test(r.hash) || (h !== '#/home' && r.hash === '#/home')) failures.push(`${where}: bounced to ${r.hash}`);
        if (vp.w < 500 && r.over > 0) failures.push(`${where}: ${r.over}px of horizontal scroll at phone width`);
        if (shots) {
          fs.mkdirSync(shots, { recursive: true });
          await page.screenshot({ path: path.join(shots, `${slug}-${a.id}-${vp.w}-${h.replace(/^#\//, '').replace(/[^a-z0-9-]+/gi, '_')}.png`), fullPage: true });
        }
      }
      await ctx.close();
    }
  }
  await browser.close();
  if (failures.length) {
    console.log(`${slug}: ${failures.length} failure${failures.length > 1 ? 's' : ''} across ${visited} page views`);
    failures.forEach(f => console.log('  ✗ ' + f));
    process.exit(1);
  }
  console.log(`${slug}: ${visited} page views across ${cfg.audiences.length} audiences, no script errors, nothing empty, nothing wider than a phone${shots ? `; screenshots in ${path.relative(process.cwd(), shots) || '.'}` : ''}`);
})();
