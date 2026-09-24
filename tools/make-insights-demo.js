#!/usr/bin/env node
// Fills reports.insights.demo in a client's portal config with the worked example
// shown on the Insights page before anything has been imported.
//
//   node tools/make-insights-demo.js onyx
//
// The converter is not reimplemented here. It is lifted verbatim out of
// template/portal/portal-engine.html, between the @converter markers, and run over
// the sample, so the numbers shipped in the config are the same arithmetic an
// owner's own file goes through. Change the converter and re-run this; the two
// cannot drift apart.
//
// The sample is clients/<slug>/workbench/demo-data.json: real structured columns,
// synthesised note text. A value like 2026-08-15T11:15:47 was a real date cell in
// the source export and is revived as one; the two written with a space were text
// in the original and stay text, which is what the data-fault check looks for.
// No dependencies.

const fs = require('fs');
const path = require('path');

const slug = process.argv[2];
if (!slug) { console.error('usage: node tools/make-insights-demo.js <client-slug>'); process.exit(1); }

const root = path.join(__dirname, '..');
const enginePath = path.join(root, 'template', 'portal', 'portal-engine.html');
const cfgPath = path.join(root, 'clients', slug, 'portal', `${slug}-portal.json`);
const samplePath = path.join(root, 'clients', slug, 'workbench', 'demo-data.json');

const engine = fs.readFileSync(enginePath, 'utf8');
const a = engine.indexOf('/* @converter */'), b = engine.indexOf('/* @/converter */');
if (a === -1 || b === -1) throw new Error('the engine has no @converter markers');
const block = engine.slice(a + '/* @converter */'.length, b);
const { autoMap, CONVERTERS } = new Function(`${block}\nreturn { autoMap, CONVERTERS };`)();

const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const imp = ((cfg.reports || {}).import) || {};
const conv = (imp.converters || []).find(c => c.status === 'ready');
if (!conv) throw new Error('no converter is marked ready in the config');
if (!CONVERTERS[conv.kind]) throw new Error(`the engine has no converter for kind "${conv.kind}"`);

const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
const rows = sample.rows.map(r => r.map(v => (typeof v === 'string' && ISO.test(v)) ? new Date(v + 'Z') : v));

const map = autoMap(sample.headers, conv.expect);
const missing = (conv.expect || []).filter(e => e.required && map[e.role] == null);
if (missing.length) throw new Error('the sample is missing ' + missing.map(m => m.label).join(', '));

const result = CONVERTERS[conv.kind](rows, sample.headers, map, {
  vocabulary: imp.vocabulary || [], corporate: conv.corporate || [],
  patterns: conv.patterns || {}, typed: true
});

cfg.reports.insights.demo = result;
fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');

const cov = result.coverage;
console.log(`${slug}: ${result.rows} rows, ${result.period.from} to ${result.period.to}`);
console.log(`  mapped   ${Object.keys(map).length} of ${conv.expect.length} roles`);
console.log(`  joined   ${result.split.flag} (${result.base}%) — ${result.split.sold} sold, ${result.split.corporate} employer scheme, ${result.split.winback} win-backs`);
console.log(`  notes    ${cov.tagged} of ${cov.withNote} rows tagged (${Math.round(cov.tagged / cov.withNote * 100)}%)`);
console.log(`  output   ${result.findings.length} findings, ${result.groups.length} breakdowns, ${result.tags.length} tags`);
result.groups.forEach(g => console.log(`    ${g.title}: ` + g.rows.slice(0, 3).map(r => `${r.k} ${r.c}/${r.n}`).join(', ')));
