// 接口覆盖校验（实现完成后的不变量）：
//   1) 前端 service 调用的每个接口，后端都必须已实现
//   2) MISSING-API.md 里出现的、属于前端契约的接口，也都必须能在后端找到
// 用法: node scripts/verify-api-coverage.mjs [doc路径]
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const docPath = process.argv[2] || 'backend/MISSING-API.md';

// 路径 → 「稳定前缀」：去掉 query 与路径参数(:id / {id} / ${...})
const stem = (p) =>
  p
    .trim()
    .replace(/^\/+/, '')
    .split('?')[0]
    .replace(/\/+$/, '')
    .replace(/\/\.\.\..*$/, '')
    .replace(/\/\{[^}]*\}.*$/, '')
    .split(/\/[:$]/)[0];

// 看起来像路由：含至少一个 /，且不含空格、通配符、文件扩展名、行号
const looksLikeRoute = (s) =>
  /^[A-Za-z][\w-]*(\/[\w{}$.\-:]*)+$/i.test(s) &&
  !s.includes('*') &&
  !/\.(tsx?|jsx?|prisma|md)(:|$)/.test(s) &&
  !/:\d/.test(s);

// ---- 后端已实现的路由 stem ----
const backend = new Set();
const walk = (d) =>
  readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = join(d, e.name);
    if (e.isDirectory()) return walk(p);
    if (!e.name.endsWith('.controller.ts')) return;
    const src = readFileSync(p, 'utf8');
    const prefix = (src.match(/@Controller\('([^']*)'\)/) || [, ''])[1];
    // 同时支持单路径 @Get('a') 与数组形式 @Get(['a', 'a/:id'])
    for (const m of src.matchAll(/@(?:Post|Get|Put|Patch|Delete)\(\s*(?:\[([^\]]*)\]|'([^']*)')/g)) {
      const paths = m[1] ? [...m[1].matchAll(/'([^']*)'/g)].map((x) => x[1]) : [m[2]];
      for (const path of paths) {
        backend.add(stem([prefix, path].filter(Boolean).join('/')));
      }
    }
  });
walk('backend/src/modules');

// ---- 前端 service 实际调用的接口 stem ----
const frontend = new Set();
for (const f of readdirSync('src/app/services')) {
  if (!f.endsWith('.ts')) continue;
  const src = readFileSync(join('src/app/services', f), 'utf8');
  const add = (u) => {
    const s = stem(u);
    if (s) frontend.add(s);
  };
  for (const m of src.matchAll(/http\.(?:post|get|put|delete)[^(]*\(\s*[`'"]([^`'"]+)[`'"]/g)) add(m[1]);
  for (const m of src.matchAll(/appendQuery\(\s*[`'"]([^`'"]+)[`'"]/g)) add(m[1]);
}

// 后端用不同路径表达同一能力时的别名（补集，避免误报）
const BACKEND_ALIASES = new Map([
  // 前端 `pass/delete/:id` 与 `pass/delete`（query）都指向同一删除能力
  ['pass/del', 'pass/delete'],
]);

const isImplemented = (key) => {
  const aliased = BACKEND_ALIASES.get(key);
  if (backend.has(key)) return true;
  if (aliased && backend.has(aliased)) return true;
  // 例如 session/list/:textbookId 与 session/list 的差异
  return backend.has(key.replace(/\/[^/]*$/, ''));
};

const problems = [];

// 1) 前端调用必须已实现
const unimplemented = [...frontend].filter((u) => !isImplemented(u));
for (const u of unimplemented) {
  problems.push(`前端已调用但后端未实现: ${u}`);
}

// 2) 文档中提到的前端契约接口必须已实现
const doc = readFileSync(docPath, 'utf8');
const documented = new Set();
for (const m of doc.matchAll(/`([^`\n]+)`/g)) {
  const raw = m[1].trim();
  const noQuery = raw.split('?')[0] || raw;
  if (!looksLikeRoute(noQuery)) continue;
  const s = stem(noQuery);
  if (s && frontend.has(s)) documented.add(s);
}
for (const d of documented) {
  if (!isImplemented(d)) {
    problems.push(`文档声明为契约但后端未实现: ${d}`);
  }
}

console.log(`后端路由 stem: ${backend.size} | 前端调用 stem: ${frontend.size} | 文档覆盖 stem: ${documented.size}`);
console.log(
  problems.length
    ? `\n问题:\n${problems.map((p) => `  ✗ ${p}`).join('\n')}`
    : '\n✓ 覆盖完整：前端调用的接口后端全部已实现，文档中的契约接口也全部存在',
);
process.exit(problems.length ? 1 : 0);
