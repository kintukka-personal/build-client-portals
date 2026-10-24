#!/usr/bin/env node
// Builds a client's portal from the shared engine, the client's tokens and the client's content.
//
//   node tools/build-portal.js onyx
//
// Reads  template/portal/portal-engine.html
//        template/portal/sim-placeholder.html
//        clients/<slug>/brand/<slug>-tokens.css        (run tools/build-tokens.js first)
//        clients/<slug>/brand/assets/<slug>-logo.svg and <slug>-mark.svg
//        clients/<slug>/portal/<slug>-portal.json
// Writes clients/<slug>/portal/<slug>-portal.html
//        clients/<slug>/portal/content/sims/<slug>-sim-placeholder.html
// Fonts: if template/portal/fonts/<family>-<weight>.woff2 files exist they are embedded,
// otherwise a Google Fonts link is used. No dependencies.

const fs = require('fs');
const path = require('path');

const slug = process.argv[2];
if (!slug) { console.error('usage: node tools/build-portal.js <client-slug> [--no-embed] [--site] [--indexable]'); process.exit(1); }
// Sent as a single file, the portal cannot reach a sibling content/ folder, so every
// local simulation is inlined and the engine hands it to the frame as srcdoc. Pass
// --no-embed for a hosted build, where separate files load only when they are opened.
// --site writes a deployable folder instead: the portal as index.html beside a
// manifest, a service worker and icons, which is what makes it installable on a
// phone. A manifest and a worker have to be real files at real URLs, so the
// single-file build can never be installable — the two targets are different
// deliverables, not settings of one.
const site = process.argv.includes('--site');
const indexable = process.argv.includes('--indexable');
const embed = !process.argv.includes('--no-embed') && !site;

const root = path.join(__dirname, '..');
const brandDir = path.join(root, 'clients', slug, 'brand');
const portalDir = path.join(root, 'clients', slug, 'portal');
const read = p => fs.readFileSync(p, 'utf8');

const brand = JSON.parse(read(path.join(brandDir, `${slug}-brand.json`)));
const config = JSON.parse(read(path.join(portalDir, `${slug}-portal.json`)));
const tokens = read(path.join(brandDir, `${slug}-tokens.css`));
const engine = read(path.join(root, 'template', 'portal', 'portal-engine.html'));
const placeholder = read(path.join(root, 'template', 'portal', 'sim-placeholder.html'));

// ---- svg symbols ------------------------------------------------------------
function symbol(file, id) {
  const svg = read(file);
  const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 100 100';
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<!--[\s\S]*?-->/g, '').trim();
  return `<symbol id="${id}" viewBox="${vb}">${inner}</symbol>`;
}
const symbols = [
  symbol(path.join(brandDir, 'assets', `${slug}-logo.svg`), 'logo'),
  symbol(path.join(brandDir, 'assets', `${slug}-mark.svg`), 'mark'),
].join('\n    ');

// ---- fonts ------------------------------------------------------------------
const family = brand.typography.family;
const weights = Object.values(brand.typography.weights);
const fontDir = path.join(root, 'template', 'portal', 'fonts');
let fontsHtml;
const local = weights.map(w => ({ w, f: path.join(fontDir, `${family.toLowerCase()}-${w}.woff2`) })).filter(x => fs.existsSync(x.f));
if (local.length) {
  const faces = local.map(({ w, f }) => `@font-face{font-family:'${family}';font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${fs.readFileSync(f).toString('base64')}) format('woff2');}`).join('\n');
  fontsHtml = `<style>/* ${family}, SIL Open Font License, embedded for offline use */\n${faces}\n</style>`;
} else {
  fontsHtml = `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights.join(';')}&display=swap">`;
}

// ---- favicon: the mark on a black square ------------------------------------
const markSvg = read(path.join(brandDir, 'assets', `${slug}-mark.svg`)).replace(/<!--[\s\S]*?-->/g, '');
const markVb = (markSvg.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 100 100';
const markInner = markSvg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
const [vx, vy, vw, vh] = markVb.split(/\s+/).map(Number);
const favSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx - vw * 0.15} ${vy - vh * 0.25} ${vw * 1.3} ${vh * 1.5}"><rect x="${vx - vw}" y="${vy - vh}" width="${vw * 3}" height="${vh * 3}" fill="${brand.color.palette[brand.color.roles.bg].hex}"/>${markInner}</svg>`;
const favicon = `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(favSvg).replace(/'/g, '%27')}">`;

// ---- assemble ---------------------------------------------------------------
const jsonScript = (id, value) => `\n<script id="${id}" type="application/json">${JSON.stringify(value).replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--')}</script>`;
const inject = (html, extra, pwa) => {
  const cfgJson = JSON.stringify(config).replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
  let out = html
    .replace('<!-- @title -->', escapeHtml(config.client.portalTitle))
    .replace('<!-- @description -->', escapeHtml(`${config.client.tradingName} onboarding, training and support.`))
    .replace('<!-- @favicon -->', favicon)
    .replace('<!-- @pwa -->', pwa || '')
    .replace('<!-- @fonts -->', fontsHtml)
    .replace('<!-- @symbols -->', symbols)
    .replace('<!-- @config -->', `<script id="portal-config" type="application/json">${cfgJson}</script>${extra || ''}`);
  const a = out.indexOf('/* @tokens */'), b = out.indexOf('/* @/tokens */');
  if (a === -1 || b === -1) throw new Error('template has no @tokens markers');
  out = out.slice(0, a) + tokens.trim() + '\n' + out.slice(b + '/* @/tokens */'.length);
  return out;
};
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// validate config references
const ids = new Set(config.items.map(i => i.id));
for (const p of config.paths) for (const id of p.items) if (!ids.has(id)) throw new Error(`path ${p.id} references unknown item ${id}`);
for (const i of config.items) if (!config.audiences.some(a => a.id === i.audience)) throw new Error(`item ${i.id} has unknown audience ${i.audience}`);
for (const i of config.items) if (!config.areas.some(a => a.id === i.area)) throw new Error(`item ${i.id} has unknown area ${i.area}`);
if (config.groups) {
  for (const g of config.groups) if (!config.areas.some(a => a.id === g.area)) throw new Error(`group ${g.id} has unknown area ${g.area}`);
  for (const i of config.items) if (i.group && !config.groups.some(g => g.id === i.group)) throw new Error(`item ${i.id} has unknown group ${i.group}`);
  for (const i of config.items) if (i.group) { const g = config.groups.find(x => x.id === i.group); if (g.area !== i.area) throw new Error(`item ${i.id} is in area ${i.area} but group ${i.group} belongs to ${g.area}`); }
}
for (const i of config.items) if (i.src && !/^https?:/.test(i.src) && !fs.existsSync(path.join(portalDir, i.src.split('?')[0]))) {
  if (!/sim-placeholder\.html/.test(i.src)) console.warn(`warning: ${i.id} points at missing file ${i.src}`);
}

fs.mkdirSync(path.join(portalDir, 'content', 'sims'), { recursive: true });
// The placeholder is written first: it is one of the files the portal then inlines.
const outPh = path.join(portalDir, 'content', 'sims', `${slug}-sim-placeholder.html`);
fs.writeFileSync(outPh, inject(placeholder));

let sims = null, simBytes = 0;
if (embed) {
  sims = {};
  for (const i of config.items) {
    if (!i.src || /^https?:/.test(i.src)) continue;
    const rel = i.src.split('?')[0];          // one copy however many items point at it
    // Only pages are inlined. A video plays from its own src and never reads this copy,
    // and an .mp4 read as text would only bloat the file and corrupt on the way.
    if (!/\.html?$/i.test(rel) || sims[rel] !== undefined) continue;
    const f = path.join(portalDir, rel);
    if (!fs.existsSync(f)) continue;
    sims[rel] = read(f);
    simBytes += Buffer.byteLength(sims[rel]);
  }
  if (!Object.keys(sims).length) sims = null;
}
const kb = f => (fs.statSync(f).size / 1024).toFixed(0) + ' KB';
const rel = f => path.relative(process.cwd(), f);

if (!site) {
  const outPortal = path.join(portalDir, `${slug}-portal.html`);
  fs.writeFileSync(outPortal, inject(engine, sims ? jsonScript('portal-sims', sims) : ''));
  console.log(`wrote ${rel(outPortal)} (${kb(outPortal)}, ${config.items.length} items, ${config.paths.length} paths, fonts ${local.length ? 'embedded' : 'from Google Fonts'}, ${sims ? `${Object.keys(sims).length} simulations inlined, ${(simBytes / 1024).toFixed(0)} KB` : 'simulations linked'})`);
  console.log(`wrote ${rel(outPh)} (${kb(outPh)})`);
} else {
  // ---- the hosted, installable build -------------------------------------
  const siteDir = path.join(root, 'clients', slug, 'site');
  fs.rmSync(siteDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(siteDir, 'icons'), { recursive: true });

  const name = config.client.portalTitle;
  const short = config.client.name;
  const theme = (brand.color.palette[brand.color.roles.bg] || {}).hex || '#000000';
  const pwa = [
    '<link rel="manifest" href="manifest.webmanifest">',
    '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">',
    '<meta name="apple-mobile-web-app-title" content="' + escapeHtml(short) + '">',
    '<meta name="portal-installable" content="1">',
    indexable ? '' : '<meta name="robots" content="noindex, nofollow">'
  ].filter(Boolean).join('\n');

  const html = inject(engine, null, pwa);
  fs.writeFileSync(path.join(siteDir, 'index.html'), html);

  // Simulations and any other linked content ride along and are cached on first view.
  const contentSrc = path.join(portalDir, 'content');
  if (fs.existsSync(contentSrc)) fs.cpSync(contentSrc, path.join(siteDir, 'content'), { recursive: true });

  const iconSrc = path.join(brandDir, 'assets', 'icons');
  const icons = fs.existsSync(iconSrc) ? fs.readdirSync(iconSrc).filter(f => f.endsWith('.png')) : [];
  icons.forEach(f => fs.copyFileSync(path.join(iconSrc, f), path.join(siteDir, 'icons', f)));
  if (!icons.length) console.warn(`  ! no PNG icons at ${rel(iconSrc)} — it will not be installable`);

  const manifest = {
    id: './', name, short_name: short,
    description: `${config.client.tradingName} onboarding, training and support.`,
    start_url: './', scope: './', display: 'standalone',
    background_color: theme, theme_color: theme, lang: 'en-AU',
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ].filter(i => icons.includes(path.basename(i.src)))
  };
  fs.writeFileSync(path.join(siteDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

  // The cache is named after the content, so a redeploy that changed nothing does
  // not evict anyone, and one that did changes the name and takes effect.
  const stamp = require('crypto').createHash('sha1').update(html).digest('hex').slice(0, 10);
  fs.writeFileSync(path.join(siteDir, 'sw.js'), swSource(slug, stamp, icons));

  fs.writeFileSync(path.join(siteDir, 'robots.txt'),
    indexable ? 'User-agent: *\nAllow: /\n' : 'User-agent: *\nDisallow: /\n');
  fs.writeFileSync(path.join(siteDir, '_headers'), [
    '/*', indexable ? '  X-Robots-Tag: all' : '  X-Robots-Tag: noindex, nofollow',
    '  X-Content-Type-Options: nosniff', '  Referrer-Policy: strict-origin-when-cross-origin', '',
    // the worker and the page must revalidate or a deploy never reaches anyone
    '/sw.js', '  Cache-Control: no-cache', '',
    '/index.html', '  Cache-Control: no-cache', '',
    '/manifest.webmanifest', '  Cache-Control: no-cache', '',
    '/icons/*', '  Cache-Control: public, max-age=31536000, immutable', '',
    '/content/*', '  Cache-Control: public, max-age=3600', ''
  ].join('\n'));

  const total = f => fs.readdirSync(f, { withFileTypes: true })
    .reduce((a, e) => a + (e.isDirectory() ? total(path.join(f, e.name)) : fs.statSync(path.join(f, e.name)).size), 0);
  console.log(`wrote ${rel(siteDir)}/ (${(total(siteDir) / 1024).toFixed(0)} KB total, index.html ${kb(path.join(siteDir, 'index.html'))}, ${icons.length} icons, simulations linked${indexable ? '' : ', noindex'})`);
  console.log(`  deploy that folder as the site root, e.g. ${slug}.<your-domain>`);
}

function swSource(slug, stamp, icons) {
  return `/* ${slug} portal service worker — generated by tools/build-portal.js, do not edit. */
const V = '${slug}-${stamp}';
const CORE = ['./', './index.html', './manifest.webmanifest'${icons.map(i => `, './icons/${i}'`).join('')}];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  let u; try { u = new URL(r.url); } catch (x) { return; }
  /* Anything off this origin goes straight to the network. The spreadsheet parser
     the importer fetches on demand is the only one, and caching an opaque
     cross-origin response buys nothing and hides failures. */
  if (u.origin !== self.location.origin) return;
  if (r.mode === 'navigate') {
    /* The page itself is network-first, so a deploy lands on the next load rather
       than whenever the cache happens to turn over. Offline falls back to the copy. */
    e.respondWith(fetch(r).then(res => {
      const copy = res.clone();
      caches.open(V).then(c => c.put('./index.html', copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html').then(hit => hit || Response.error())));
    return;
  }
  /* Everything else is cache-first: simulations and icons do not change without a
     new cache name, and a member on gym wifi should pay for them once. */
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res && res.ok && res.type === 'basic') {
      const copy = res.clone();
      caches.open(V).then(c => c.put(r, copy)).catch(() => {});
    }
    return res;
  })));
});
`;
}
