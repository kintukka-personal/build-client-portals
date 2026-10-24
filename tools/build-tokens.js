#!/usr/bin/env node
// Builds a client's CSS design tokens from clients/<slug>/brand/<slug>-brand.json.
//
//   node tools/build-tokens.js onyx
//
// Writes clients/<slug>/brand/<slug>-tokens.css and, if <slug>-brand-sheet.html exists beside it,
// refreshes the block between "/* @tokens */" and "/* @/tokens */" so the sheet stays
// a single self-contained file. Also prints the contrast ratios that <slug>-brand.md quotes.
// No dependencies.

const fs = require('fs');
const path = require('path');

const slug = process.argv[2];
if (!slug) { console.error('usage: node tools/build-tokens.js <client-slug>'); process.exit(1); }

const dir = path.join(__dirname, '..', 'clients', slug, 'brand');
const brand = JSON.parse(fs.readFileSync(path.join(dir, `${slug}-brand.json`), 'utf8'));

// ---- colour helpers --------------------------------------------------------
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length <= 4 ? h.split('').map(c => c + c).join('') : h;
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16));
}
function luminance([r, g, b]) {
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a, b) {
  const [l1, l2] = [luminance(hexToRgb(a)), luminance(hexToRgb(b))].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
const grade = r => r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large only' : 'fail';

// ---- tokens ----------------------------------------------------------------
const pal = brand.color.palette;
const roles = brand.color.roles;
const type = brand.typography;
const shape = brand.shape;

const lines = [];
lines.push(`/* ${brand.meta.client} design tokens. Generated from ${slug}-brand.json v${brand.meta.version} by tools/build-tokens.js. Do not edit by hand. */`);
lines.push(':root {');
lines.push('  /* palette */');
for (const [k, v] of Object.entries(pal)) lines.push(`  --c-${k}: ${v.hex};`);
lines.push('  /* roles */');
for (const [k, v] of Object.entries(roles)) {
  if (!pal[v]) throw new Error(`role ${k} points at unknown palette entry "${v}"`);
  lines.push(`  --${kebab(k)}: var(--c-${v});`);
}
lines.push('  /* typography */');
lines.push(`  --font: ${type.fallback};`);
for (const [k, v] of Object.entries(type.weights)) lines.push(`  --w-${k}: ${v};`);
for (const [k, v] of Object.entries(type.scale)) {
  lines.push(`  --t-${kebab(k)}-size: ${v.size};`);
  lines.push(`  --t-${kebab(k)}-weight: ${v.weight};`);
  lines.push(`  --t-${kebab(k)}-lh: ${v.lineHeight};`);
  lines.push(`  --t-${kebab(k)}-ls: ${v.letterSpacing};`);
}
lines.push('  /* shape */');
for (const [k, v] of Object.entries(shape.radius)) lines.push(`  --r-${k}: ${v};`);
for (const [k, v] of Object.entries(shape.borderWidth)) lines.push(`  --bw-${k}: ${v};`);
lines.push('  /* simstudio kit */');
for (const [k, v] of Object.entries(brand.simstudio.decisions)) lines.push(`  --sim-${kebab(k)}: ${v.hex};`);
lines.push(`  --sim-dim: ${brand.simstudio.shapeAndStrength.screenDim};`);
lines.push(`  --sim-roundness: ${brand.simstudio.shapeAndStrength.roundness}px;`);
lines.push(`  --sim-border: ${brand.simstudio.shapeAndStrength.borderWeight}px;`);
lines.push('}');
const css = lines.join('\n') + '\n';

fs.writeFileSync(path.join(dir, `${slug}-tokens.css`), css);
console.log(`wrote ${path.relative(process.cwd(), path.join(dir, `${slug}-tokens.css`))} (${lines.length - 2} declarations)`);

// ---- inject into the brand sheet -------------------------------------------
const sheet = path.join(dir, `${slug}-brand-sheet.html`);
if (fs.existsSync(sheet)) {
  const html = fs.readFileSync(sheet, 'utf8');
  const open = '/* @tokens */', close = '/* @/tokens */';
  const a = html.indexOf(open), b = html.indexOf(close);
  if (a === -1 || b === -1) throw new Error(`${slug}-brand-sheet.html has no @tokens markers`);
  const out = html.slice(0, a + open.length) + '\n' + css + html.slice(b);
  fs.writeFileSync(sheet, out);
  console.log(`refreshed tokens inside ${slug}-brand-sheet.html`);
}

// ---- contrast report -------------------------------------------------------
// The pairs are named by role, so every client gets the same report whatever its
// palette keys are called. Printed by palette key, which is what <slug>-brand.md quotes.
// text-on-primary and text-on-cta are checked in plain text as well as in ink, because
// that is the site pattern that usually fails and needs a portal variant.
const rolePairs = [
  ['primary', 'bg'], ['text', 'bg'], ['cta', 'bg'], ['logoWordmark', 'bg'], ['textMuted', 'bg'],
  ['text', 'primary'], ['textOnPrimary', 'primary'], ['text', 'cta'], ['textOnCta', 'cta'],
  ['primary', 'surface'], ['text', 'surface'], ['error', 'bg'], ['text', 'error'],
];
console.log('\ncontrast (foreground on background)');
const live = rolePairs.map(([fr, br]) => [roles[fr], roles[br]]).filter(([f, b]) => f && b);
const [fw, bw] = [Math.max(6, ...live.map(p => p[0].length)), Math.max(8, ...live.map(p => p[1].length))];
for (const [f, b] of live) {
  const r = contrast(pal[f].hex, pal[b].hex);
  console.log(`  ${f.padEnd(fw)} on ${b.padEnd(bw)} ${r.toFixed(2).padStart(6)}:1  ${grade(r)}`);
}

function kebab(s) { return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(); }
