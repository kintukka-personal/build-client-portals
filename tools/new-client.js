#!/usr/bin/env node
// Scaffolds a new client from the templates, so every client starts from the same
// skeleton, the same file names and the same gates.
//
//   node tools/new-client.js <slug> --name "ACME" [--trading "ACME Health & Fitness"] [--website https://acme.com.au]
//
// Writes clients/<slug>/<slug>-intake.md               from template/intake.template.md
//        clients/<slug>/brand/<slug>-brand.json        from template/brand.template.json
//        clients/<slug>/brand/assets/<slug>-logo.svg   stand-in lockup, redrawn in Phase 1
//        clients/<slug>/brand/assets/<slug>-mark.svg   stand-in mark, redrawn in Phase 1
//        clients/<slug>/portal/<slug>-portal.json      from template/portal.template.json
//        clients/<slug>/portal/content/README.md       from template/portal/content-README.template.md
// then runs build-tokens and build-portal, so a grey-box portal opens straight away and
// `node tools/check-client.js <slug>` has something to report on.
// Refuses to touch a slug that already exists. No dependencies.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const argv = process.argv.slice(2);
const slug = argv[0];
const opt = k => { const i = argv.indexOf('--' + k); return i > 0 ? argv[i + 1] : undefined; };
if (!slug || !opt('name')) {
  console.error('usage: node tools/new-client.js <slug> --name "<Short name>" [--trading "<Trading name>"] [--website https://…]');
  process.exit(1);
}
// The slug is in every file name and in the subdomain, so it is short, lowercase and stable.
if (!/^[a-z][a-z0-9-]{1,30}$/.test(slug)) { console.error(`slug "${slug}" must be 2–31 lowercase letters, digits or hyphens, starting with a letter`); process.exit(1); }

const root = path.join(__dirname, '..');
const clientDir = path.join(root, 'clients', slug);
if (fs.existsSync(clientDir)) { console.error(`clients/${slug} already exists; nothing written`); process.exit(1); }

const name = opt('name');
const tradingName = opt('trading') || name;
const website = opt('website') || 'TODO: https://the-client-site';
const websiteLabel = /^https?:/.test(website) ? new URL(website).hostname.replace(/^www\./, '') : "TODO: the client's site";
const today = new Date().toISOString().slice(0, 10);
let author = '';
try { author = execFileSync('git', ['config', 'user.name'], { encoding: 'utf8' }).trim(); } catch (e) { /* no git identity */ }

// Replace {{tokens}} in every string of a parsed template, so a name with a quote or an
// ampersand in it cannot break the JSON.
const vars = { slug, name, tradingName, website, websiteLabel, today };
const fill = v => typeof v === 'string' ? v.replace(/\{\{(\w+)\}\}/g, (m, k) => k in vars ? vars[k] : m)
  : Array.isArray(v) ? v.map(fill)
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x)]))
  : v;
const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); console.log(`wrote ${path.relative(root, p)}`); };

// ---- brand --------------------------------------------------------------------
const brand = readJson(path.join(root, 'template', 'brand.template.json'));
Object.assign(brand.meta, { client: tradingName, slug, capturedOn: today, capturedBy: author });
Object.assign(brand.identity, { name, tradingName, website: /^https?:/.test(website) ? website : '' });
brand.logo.primary.files.vector = `assets/${slug}-logo.svg`;
brand.logo.mark.files.vector = `assets/${slug}-mark.svg`;
brand.simstudio.kitName = name;
brand.simstudio.typeface = brand.typography.family;
const brandDir = path.join(clientDir, 'brand');
write(path.join(brandDir, `${slug}-brand.json`), JSON.stringify(brand, null, 2) + '\n');

// Stand-ins in the viewBoxes the engine draws the logo and the mark into, so they sit
// where the real ones will. They are deliberately plain: nobody should mistake one for
// the client's mark.
const pal = brand.color.palette, roles = brand.color.roles;
const primary = pal[roles.primary].hex, text = pal[roles.text].hex;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const initial = (name.match(/[A-Za-z0-9]/) || ['?'])[0].toUpperCase();
const font = "Poppins, 'Segoe UI', Arial, sans-serif";
const note = `<!-- PLACEHOLDER written by tools/new-client.js. Redraw it from a zoomed capture in Phase 1 (docs/playbook/01-brand-portfolio.md, step 7), or drop the client's master file at this path. -->`;
const fit = name.length * 26 * 0.62 > 140 ? ' textLength="140" lengthAdjust="spacingAndGlyphs"' : '';
write(path.join(brandDir, 'assets', `${slug}-logo.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 80" role="img" aria-label="${esc(tradingName)}">
  ${note}
  <rect x="6" y="14" width="52" height="52" fill="none" stroke="${primary}" stroke-width="4"/>
  <text x="32" y="51" text-anchor="middle" font-family="${font}" font-weight="700" font-size="30" fill="${primary}">${esc(initial)}</text>
  <text x="70" y="50" font-family="${font}" font-weight="600" font-size="26" fill="${text}"${fit}>${esc(name)}</text>
</svg>
`);
write(path.join(brandDir, 'assets', `${slug}-mark.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 2 96 74" role="img" aria-label="${esc(name)} mark">
  ${note}
  <rect x="22" y="10" width="58" height="58" fill="none" stroke="${primary}" stroke-width="4"/>
  <text x="51" y="52" text-anchor="middle" font-family="${font}" font-weight="700" font-size="34" fill="${primary}">${esc(initial)}</text>
</svg>
`);
for (const d of ['reference', 'icons']) fs.mkdirSync(path.join(brandDir, 'assets', d), { recursive: true });

// ---- portal -------------------------------------------------------------------
const portalDir = path.join(clientDir, 'portal');
const portal = fill(readJson(path.join(root, 'template', 'portal.template.json')));
write(path.join(portalDir, `${slug}-portal.json`), JSON.stringify(portal, null, 2) + '\n');
const readme = fs.readFileSync(path.join(root, 'template', 'portal', 'content-README.template.md'), 'utf8');
write(path.join(portalDir, 'content', 'README.md'), fill(readme));
for (const d of ['sims/src', 'video']) fs.mkdirSync(path.join(portalDir, 'content', d), { recursive: true });

// ---- intake -------------------------------------------------------------------
const intake = fs.readFileSync(path.join(root, 'template', 'intake.template.md'), 'utf8');
write(path.join(clientDir, `${slug}-intake.md`), fill(intake));

// ---- first build ----------------------------------------------------------------
console.log('');
for (const tool of ['build-tokens.js', 'build-portal.js']) {
  execFileSync(process.execPath, [path.join(__dirname, tool), slug], { stdio: 'inherit' });
}
console.log(`
${name} is scaffolded. Open clients/${slug}/portal/${slug}-portal.html to see the grey box.
Next:  node tools/check-client.js ${slug}      where it stands against the workflow
       docs/ROADMAP.md                          what happens in each phase, in order`);
