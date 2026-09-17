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
if (!slug) { console.error('usage: node tools/build-portal.js <client-slug>'); process.exit(1); }

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
const inject = (html, extra) => {
  const cfgJson = JSON.stringify(config).replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
  let out = html
    .replace('<!-- @title -->', escapeHtml(config.client.portalTitle))
    .replace('<!-- @description -->', escapeHtml(`${config.client.tradingName} onboarding, training and support.`))
    .replace('<!-- @favicon -->', favicon)
    .replace('<!-- @fonts -->', fontsHtml)
    .replace('<!-- @symbols -->', symbols)
    .replace('<!-- @config -->', `<script id="portal-config" type="application/json">${cfgJson}</script>`);
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
for (const i of config.items) if (i.src && !/^https?:/.test(i.src) && !fs.existsSync(path.join(portalDir, i.src.split('?')[0]))) {
  if (!/sim-placeholder\.html/.test(i.src)) console.warn(`warning: ${i.id} points at missing file ${i.src}`);
}

fs.mkdirSync(path.join(portalDir, 'content', 'sims'), { recursive: true });
const outPortal = path.join(portalDir, `${slug}-portal.html`);
fs.writeFileSync(outPortal, inject(engine));
const outPh = path.join(portalDir, 'content', 'sims', `${slug}-sim-placeholder.html`);
fs.writeFileSync(outPh, inject(placeholder));

const kb = f => (fs.statSync(f).size / 1024).toFixed(0) + ' KB';
console.log(`wrote ${path.relative(process.cwd(), outPortal)} (${kb(outPortal)}, ${config.items.length} items, ${config.paths.length} paths, fonts ${local.length ? 'embedded' : 'from Google Fonts'})`);
console.log(`wrote ${path.relative(process.cwd(), outPh)} (${kb(outPh)})`);
