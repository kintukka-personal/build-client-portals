#!/usr/bin/env node
// Reports where a client stands against workflow/client-portal.workflow.json: every
// phase, every automatic gate check, and the manual ones still to tick.
//
//   node tools/check-client.js onyx            the report
//   node tools/check-client.js onyx --all      also list the manual checks of every phase
//   node tools/check-client.js onyx --run      also run the gate commands (the smoke test)
//   node tools/check-client.js onyx --json     the same, as JSON, for an automation
//
// It reads files and never writes them. Exits 0 whatever it finds: the report is the
// result. No dependencies.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const slug = process.argv[2];
const flag = f => process.argv.includes('--' + f);
if (!slug) { console.error('usage: node tools/check-client.js <client-slug> [--all] [--run] [--json]'); process.exit(1); }

const root = path.join(__dirname, '..');
const wf = JSON.parse(fs.readFileSync(path.join(root, 'workflow', 'client-portal.workflow.json'), 'utf8'));
if (!fs.existsSync(path.join(root, 'clients', slug))) { console.error(`clients/${slug} does not exist; scaffold it with: ${wf.commands.scaffold.replace(/\{slug\}/g, slug)}`); process.exit(1); }

const sub = s => s.replace(/\{slug\}/g, slug);
const abs = key => path.join(root, sub(wf.outputs[key] || key));
const text = key => { try { return fs.readFileSync(abs(key), 'utf8'); } catch (e) { return null; } };
const json = key => { const t = text(key); try { return t == null ? null : JSON.parse(t); } catch (e) { return null; } };
const at = (o, p) => (p || '').split('.').filter(Boolean).reduce((x, k) => (x == null ? x : x[k]), o);
const walk = (v, fn, k) => { fn(v, k); if (v && typeof v === 'object') for (const [kk, x] of Object.entries(v)) walk(x, fn, kk); };
const count = (v, pred) => { let n = 0; walk(v, (x, k) => { if (pred(x, k)) n++; }); return n; };

const cfg = json('portalJson') || {};
const brand = json('brandJson') || {};
const portalDir = path.dirname(abs('portalJson'));
const items = cfg.items || [];
const today = new Date().toISOString().slice(0, 10);

// The same escaping build-portal.js applies, so "built" means the output carries this exact config.
const embedded = c => JSON.stringify(c).replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const isPlaceholderSim = i => /sim-placeholder\.html/.test(i.src || '');
const localSrc = i => i.src && !/^https?:/.test(i.src) && !isPlaceholderSim(i);
function overdue(p) {
  if (!p.reviewed || p.status === 'gap') return false;
  const m = String(p.reviewCycle || '').match(/(\d+)\s*(week|month|year)/i); if (!m) return false;
  const d = new Date(p.reviewed + 'T00:00:00Z'); const n = +m[1]; const u = m[2].toLowerCase();
  if (u === 'week') d.setUTCDate(d.getUTCDate() + 7 * n); else if (u === 'month') d.setUTCMonth(d.getUTCMonth() + n); else d.setUTCFullYear(d.getUTCFullYear() + n);
  return d.toISOString().slice(0, 10) < today;
}

// Each returns [pass, detail]. A null pass means "not evaluated" (a manual check, or a
// command not asked for with --run).
const CHECKS = {
  exists: c => { const p = abs(c.path); const ok = fs.existsSync(p) && (!fs.statSync(p).isDirectory() || fs.readdirSync(p).length > 0); return [ok, ok ? '' : 'missing']; },
  noTodoText: c => { const t = text(c.path); if (t == null) return [false, 'file missing']; const n = (t.match(/\bTODO\b/g) || []).length; return [n === 0, n ? `${n} TODO left` : '']; },
  noHelpKeys: c => { const j = json(c.path); if (!j) return [false, 'file missing or not JSON']; const n = count(j, (x, k) => k === '_help'); return [n === 0, n ? `${n} _help key${n > 1 ? 's' : ''} left` : '']; },
  jsonNotIn: c => { const v = at(json(c.path), c.at); return [v != null && !c.values.includes(v), `${c.at} is ${JSON.stringify(v)}`]; },
  jsonIn: c => { const v = at(json(c.path), c.at); return [c.values.includes(v), `${c.at} is ${JSON.stringify(v)}`]; },
  jsonMin: c => { const v = at(json(c.path), c.at) || []; return [v.length >= c.min, `${c.at} has ${v.length}`]; },
  jsonMax: c => { const v = at(json(c.path), c.at) || []; return [v.length <= c.max, `${c.at} has ${v.length}`]; },
  jsonPresent: c => { const v = at(json(c.path), c.at); return [v != null && (typeof v !== 'object' || Object.keys(v).length > 0), v == null ? `${c.at} missing` : '']; },
  notContains: c => { const t = text(c.path); if (t == null) return [false, 'file missing']; return [!t.includes(c.text), t.includes(c.text) ? `still says ${c.text}` : '']; },
  brandRoles: () => {
    const r = (brand.color || {}).roles || {}; const pal = (brand.color || {}).palette || {}; const bad = [];
    if (r.primaryTint === r.primary) bad.push('primaryTint is the solid primary, so the active nav label disappears');
    if (r.primaryDeep === r.primary) bad.push('primaryDeep is the primary, so pressed states do not show');
    if (r.ctaDeep === r.cta) bad.push('ctaDeep is the cta, so button hovers do not show');
    const tint = (pal[r.primaryTint] || {}).hex || '';
    if (r.primaryTint !== r.primary && !/^#[0-9a-f]{8}$/i.test(tint)) bad.push(`primaryTint ${tint} has no alpha`);
    return [bad.length === 0, bad.join('; ')];
  },
  dirFiles: c => { const p = abs(c.path); const n = fs.existsSync(p) ? fs.readdirSync(p).filter(f => !f.startsWith('.') && (!c.suffix || f.endsWith(c.suffix))).length : 0; return [n >= c.min, `${n} of ${c.min}`]; },
  built: c => {
    const p = c.file ? path.join(abs(c.path), c.file) : abs(c.path);
    if (!fs.existsSync(p)) return [c.optional ? null : false, 'not built'];
    return fs.readFileSync(p, 'utf8').includes(embedded(cfg)) ? [true, ''] : [false, 'stale: the config changed since the last build'];
  },
  noTodo: c => { const n = count(at(cfg, c.at) || cfg, x => typeof x === 'string' && /^TODO\b/.test(x)); return [n === 0, n ? `${n} TODO value${n > 1 ? 's' : ''}` : '']; },
  noDemo: () => { const n = count(cfg, (x, k) => k === 'demo' && x === true); return [n === 0, n ? `${n} demo flag${n > 1 ? 's' : ''}` : '']; },
  processDrives: () => { const ids = new Set(items.map(i => i.id)); const bad = ((cfg.processes || {}).items || []).flatMap(p => (p.drives || []).filter(d => !ids.has(d)).map(d => `${p.id} → ${d}`)); return [bad.length === 0, bad.join(', ')]; },
  noPlaceholderSims: () => { const l = items.filter(isPlaceholderSim); return [l.length === 0, l.length ? `${l.length} on the placeholder: ${l.map(i => i.id).join(', ')}` : '']; },
  srcExists: () => { const l = items.filter(i => localSrc(i) && !fs.existsSync(path.join(portalDir, i.src.split('?')[0]))); return [l.length === 0, l.map(i => `${i.id} → ${i.src}`).join(', ')]; },
  noNullVideo: () => { const l = items.filter(i => i.type === 'video' && !i.src); return [l.length === 0, l.length ? `${l.length} without a file: ${l.map(i => i.id).join(', ')}` : '']; },
  readyConverter: () => { const l = (((cfg.reports || {}).import || {}).converters || []); const r = l.filter(x => x.status === 'ready'); return [r.length > 0, `${r.length} ready of ${l.length}`]; },
  processReviews: () => { const l = ((cfg.processes || {}).items || []).filter(overdue); return [l.length === 0, l.length ? `${l.length} past review: ${l.map(p => p.id).join(', ')}` : '']; },
  command: c => {
    if (!flag('run')) return [null, 'run with --run'];
    try { execSync(sub(wf.commands[c.command]), { cwd: root, stdio: 'pipe' }); return [true, '']; }
    catch (e) { return [false, String(e.stdout || e.message).trim().split('\n').slice(0, 4).join(' / ')]; }
  },
  manual: () => [null, ''],
};

const phases = wf.phases.map(ph => {
  const na = ph.optional && !at(cfg, ph.optional);
  const checks = ph.gate.map(c => {
    const fn = CHECKS[c.type]; if (!fn) return { ...c, pass: false, detail: `unknown check type ${c.type}` };
    const [pass, detail] = na ? [null, 'n/a'] : fn(c);
    return { id: c.id, type: c.type, label: sub(c.label || c.text || (wf.outputs[c.path] ? wf.outputs[c.path] : `${c.type} ${c.path || ''}`.trim())), pass, detail };
  });
  const auto = checks.filter(c => c.pass !== null);
  const passed = auto.filter(c => c.pass).length;
  const manual = checks.filter(c => c.type === 'manual');
  const unrun = checks.filter(c => c.type === 'command' && c.pass === null).length;
  const state = na ? 'n/a' : !auto.length ? 'manual' : passed === auto.length ? 'done' : passed ? 'started' : 'not started';
  return { id: ph.id, key: ph.key, title: ph.title, playbook: ph.playbook, state, passed, total: auto.length, manual: manual.length, unrun, checks };
});

const byAud = {}; items.forEach(i => { byAud[i.audience] = (byAud[i.audience] || 0) + 1; });
const summary = {
  client: brand.meta ? brand.meta.client : (cfg.client || {}).tradingName, slug,
  brand: { version: (brand.meta || {}).version, status: (brand.meta || {}).status, openAsks: ((brand.meta || {}).confirmWithClient || []).length },
  items: items.length, byAudience: byAud, paths: (cfg.paths || []).length,
  todo: count(cfg, x => typeof x === 'string' && /^TODO\b/.test(x)),
  demo: count(cfg, (x, k) => k === 'demo' && x === true),
  placeholderSims: items.filter(isPlaceholderSim).length,
  processes: ((cfg.processes || {}).items || []).length,
  modules: ['reports', 'processes', 'news', 'floorplans'].filter(k => cfg[k] || (k === 'floorplans' && cfg.floorplan)),
};
const next = phases.find(p => p.state !== 'done' && p.state !== 'n/a');

if (flag('json')) { console.log(JSON.stringify({ workflow: wf.workflow, version: wf.version, checkedOn: today, summary, next: next ? next.id : null, phases }, null, 2)); process.exit(0); }

const mark = { done: '✓', started: '◐', 'not started': '○', manual: '·', 'n/a': '–' };
console.log(`${summary.client} (${slug}) against ${wf.workflow} v${wf.version}, ${today}\n`);
for (const p of phases) {
  const score = p.state === 'n/a' ? 'not in this portal' : p.total ? `${p.passed}/${p.total} automatic` : p.unrun ? 'commands not run (add --run)' : 'manual only';
  console.log(`  ${mark[p.state]} ${p.id} ${p.title.padEnd(26)} ${score}${p.manual ? ` · ${p.manual} to confirm by hand` : ''}`);
  for (const c of p.checks) {
    if (c.pass === false) console.log(`        ✗ ${c.label}${c.detail && !c.label.includes(c.detail) ? ` — ${c.detail}` : ''}`);
    else if (flag('all') && c.pass === null && p.state !== 'n/a') console.log(`        ☐ ${c.label}${c.detail ? ` (${c.detail})` : ''}`);
  }
}
const aud = Object.entries(byAud).map(([k, v]) => `${k} ${v}`).join(', ');
console.log(`
  brand     v${summary.brand.version} ${summary.brand.status}, ${summary.brand.openAsks} open ask${summary.brand.openAsks === 1 ? '' : 's'}
  content   ${summary.items} items (${aud}), ${summary.paths} paths, ${summary.processes} processes
  markers   ${summary.todo} TODO, ${summary.demo} demo, ${summary.placeholderSims} simulations on the placeholder
  modules   ${summary.modules.join(', ') || 'none'}`);
if (next) console.log(`\n  next      ${next.id} ${next.title} — ${next.playbook}`);
