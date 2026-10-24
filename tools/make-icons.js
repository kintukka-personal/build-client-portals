#!/usr/bin/env node
// Renders a client's app icons from their mark, the way ONYX's were drawn: the mark
// centred on a square of the canvas colour.
//
//   node tools/make-icons.js onyx
//
// Reads  clients/<slug>/brand/assets/<slug>-mark.svg and the bg role in <slug>-brand.json
// Writes clients/<slug>/brand/assets/icons/
//          icon-192.png  icon-512.png       the mark at 70% of the square
//          icon-maskable-512.png             at 50%, inside the circle a launcher may crop to
//          apple-touch-icon.png              180px, opaque, as iOS wants it
// which is the set `build-portal.js --site` copies into the hosted build. Re-run it
// whenever the mark changes. Needs Playwright, as tools/smoke-portal.js does.

const fs = require('fs');
const path = require('path');

const slug = process.argv[2];
if (!slug) { console.error('usage: node tools/make-icons.js <client-slug>'); process.exit(1); }
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright is not installed here; run this where it is (any cloud session has it).'); process.exit(2); }

const brandDir = path.join(__dirname, '..', 'clients', slug, 'brand');
const brand = JSON.parse(fs.readFileSync(path.join(brandDir, `${slug}-brand.json`), 'utf8'));
const bg = brand.color.palette[brand.color.roles.bg].hex;
const mark = fs.readFileSync(path.join(brandDir, 'assets', `${slug}-mark.svg`), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '').replace(/<svg\b/, '<svg width="100%" height="100%"');
const out = path.join(brandDir, 'assets', 'icons');
fs.mkdirSync(out, { recursive: true });

const icons = [
  ['icon-192.png', 192, 0.7], ['icon-512.png', 512, 0.7],
  ['icon-maskable-512.png', 512, 0.5], ['apple-touch-icon.png', 180, 0.7],
];
(async () => {
  const browser = await chromium.launch();
  for (const [file, size, scale] of icons) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(`<!doctype html><html><body style="margin:0;background:${bg};display:grid;place-items:center;width:${size}px;height:${size}px">
      <div style="width:${Math.round(size * scale)}px;height:${Math.round(size * scale)}px">${mark}</div></body></html>`);
    await page.screenshot({ path: path.join(out, file), omitBackground: false });
    await page.close();
    console.log(`wrote ${path.relative(process.cwd(), path.join(out, file))} (${size}×${size})`);
  }
  await browser.close();
})();
