import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parse, serializeOuter } from 'parse5';

// Read only HTML exported by Pencil MCP. Never open the encrypted .pen file.
const output = 'src/views/design';
fs.mkdirSync(output, { recursive: true });
fs.mkdirSync('public/design-assets', { recursive: true });
fs.cpSync('images', 'public/images', { recursive: true });
const attrs = n => Object.fromEntries((n.attrs || []).map(a => [a.name, a.value]));
const text = n => n.nodeName === '#text' ? n.value.trim() : (n.childNodes || []).map(text).filter(Boolean).join(' ');
const colors = { '#247346ff': 'var(--brand)', '#add9ccff': 'var(--background)', '#fefefeff': 'var(--surface)', '#ffffffff': 'var(--surface)', '#cb8335ff': 'var(--attention)', '#f25835ff': 'var(--accent)', '#000000ff': 'var(--text)' };
const classes = c => {
  for (const [hex, token] of Object.entries(colors)) c = c.replaceAll(hex, token);
  return c.replaceAll('url(images/', 'url(/images/').replaceAll('url(\'images/', 'url(\'/images/').replaceAll('url("images/', 'url("/images/');
};
function convert(n) {
  if (n.nodeName === '#text') return n.value.trim() || null;
  if (!n.tagName) return null;
  const a = attrs(n);
  const out = { tag: n.tagName, id: a['data-pencil-id'], name: a['data-pencil-name'], className: classes(a.class || '') };
  if (n.tagName === 'svg') {
    const svg = serializeOuter(n);
    const hash = crypto.createHash('sha256').update(svg).digest('hex').slice(0, 16);
    fs.writeFileSync(`public/design-assets/${hash}.svg`, svg);
    return { ...out, tag: 'img', src: `/design-assets/${hash}.svg`, decorative: true };
  }
  if (a.src) out.src = a.src.replace(/^\.\.?\/images\//, '/images/');
  out.children = (n.childNodes || []).map(convert).filter(Boolean);
  return out;
}
const roots = new Map();
for (const filename of ['screens', 'forms', 'dialogs', 'extras']) {
  const dom = parse(fs.readFileSync(`reference/${filename}.html`, 'utf8'));
  function find(n) {
    const a = attrs(n);
    if (a['data-pencil-id']) roots.set(a['data-pencil-id'], n);
    (n.childNodes || []).forEach(find);
  }
  find(dom);
}
const screens = {
  TL01: ['yvZir', 'OflCN'], TL02: ['JSJFS', 'N3bLP'], TL03: ['S6MuSC', 'VOKeD'],
  TL04: ['wgE1w', 'jbg8U'], TL05: ['Stfn1', 'gQmGK'], TL06: ['OkrI8', 'D7LRW'],
  TL07: ['mIedK', 'JRehE'], TL08: ['EJyfL', 'fPdzK'], TL09: ['uATVz', 'RKtmG'],
  TL10: ['t7oEDq', 'BGG1n'], TL11: ['c0vsjT', 'deq1Y'], TL12: ['R7HSQE', 'w2cXI'],
  TL13: ['b95AAL', 'MYay8'], TL14: ['PMvyJ', 'TWCnE'], TL15: ['Ajjm8', 'TuokS'],
  TL16: ['k4NRI', 'C84JH'], TL17: ['cLoVM', 'dDJNl'],
  petEdit: ['iqaXY', 'U5wMSd'], userCreate: ['lpQaB', 'S0kyO'], userEdit: ['D32Vlk', 'zxebj'],
  createGoal: ['NoDeL', 'tY5c0'], editGoal: ['qR2Lm', 'tY5c0'], loadedGoal: ['YszXA', 'tY5c0'],
  revenue: ['GanWI', 'CS7QG'], linkPlan: ['Z0uXT', 'LSnQw'], createPlan: ['GWuOZ', 'lr1sW'],
  editPlan: ['j41X5z', 'Z70B7v'], goals: ['A1RSG', 'MYay8'], confirmation: ['XZ0g4', 'X5ZhWJ'],
  assistant: ['UGrgU', 'NlYGW'],
};
const steps = {
  TL03: ['VOKeD', 'S0Y2Rq', 'n3UVlF', 'XUsQ0'],
  TL04: ['jbg8U', 'z7cWDi', 'Dr1OR'],
  TL06: ['D7LRW', 'ecPpF', 'B70VX', 'Nug4n', 'M5ZdI', 'nQ0mp'],
  petEdit: ['U5wMSd', 'W3Hi8w', 'MfWJN', 'JQtFn', 'U3hV6', 'gv5Qs'],
  userCreate: ['S0kyO', 'WKGec', 'T4h9pU', 'oDaaS'],
  userEdit: ['zxebj', 'c3RGeZ', 'b73ypR', 'Zdgvo'],
  createGoal: ['tY5c0', 'yYOcn'], editGoal: ['tY5c0', 'yYOcn'],
  revenue: ['CS7QG', 'cKPQR', 'byCVc'],
  linkPlan: ['LSnQw', 'xHum7', 'tg8kZ', 'tfLVM'],
  createPlan: ['lr1sW', 'vFO3n', 'ILYX2'], editPlan: ['Z70B7v', 'Ks29c', 'MC79D'],
};
for (const [key, ids] of Object.entries(screens)) {
  const variants = ids.map(id => {
    if (!roots.has(id)) throw new Error(`Missing Pencil frame ${id} (${key})`);
    return convert(roots.get(id));
  });
  fs.writeFileSync(`${output}/${key}.json`, JSON.stringify({ desktop: variants[0], mobile: variants[1], steps: (steps[key] || []).map(id => convert(roots.get(id))) }));
}
// Tailwind scans exact exported utilities, preserving design measurements.
fs.writeFileSync(`${output}/sources.css`, '@source "./*.json";\n');
console.log(`Imported ${Object.keys(screens).length} screen/state pairs and mobile steps from MCP exports.`);
