// 统计每个前端 service 中「后端未实现」的接口，供清单文档使用。
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const stem = (p) => p.replace(/^\/+/, '').split('?')[0].replace(/\/+$/, '').split(/\/[:$]/)[0];

const backend = new Set();
const walk = (d) => readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = join(d, e.name);
  if (e.isDirectory()) return walk(p);
  if (!e.name.endsWith('.controller.ts')) return;
  const src = readFileSync(p, 'utf8');
  const prefix = (src.match(/@Controller\('([^']*)'\)/) || [, ''])[1];
  // 同时支持单路径 @Get('a') 与数组形式 @Get(['a', 'a/:id'])
  for (const m of src.matchAll(/@(?:Post|Get|Put|Patch|Delete)\(\s*(?:\[([^\]]*)\]|'([^']*)')/g)) {
    const paths = m[1]
      ? [...m[1].matchAll(/'([^']*)'/g)].map((x) => x[1])
      : [m[2]];
    for (const p of paths) {
      backend.add(stem([prefix, p].filter(Boolean).join('/')));
    }
  }
});
walk('backend/src/modules');

const rows = [];
for (const f of readdirSync('src/app/services').sort()) {
  if (!f.endsWith('.ts')) continue;
  const src = readFileSync(join('src/app/services', f), 'utf8');
  const found = new Map();
  const add = (method, url) => {
    const s = stem(url);
    if (backend.has(s) || backend.has(s.replace(/\/[^/]*$/, ''))) return;
    if (!found.has(s)) found.set(s, method);
  };
  for (const m of src.matchAll(/http\.(post|get|put|delete)[^(]*\(\s*[`'"]([^`'"]+)[`'"]/g)) add(m[1].toUpperCase(), m[2]);
  for (const m of src.matchAll(/appendQuery\(\s*[`'"]([^`'"]+)[`'"]/g)) add('POST', m[1]);
  if (found.size) rows.push({ file: f, count: found.size, eps: [...found].map(([s, m]) => `${m} /${s}`) });
}

let total = 0;
for (const r of rows) total += r.count;
console.log(`受影响的 service: ${rows.length} 个，缺失接口合计: ${total} 个\n`);
for (const r of rows) {
  console.log(`── services/${r.file}  (${r.count})`);
  r.eps.forEach((e) => console.log(`     ${e}`));
}
