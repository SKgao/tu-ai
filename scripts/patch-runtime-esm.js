const fs = require('fs');
const path = require('path');

const nodeModulesDir = path.resolve(__dirname, '..', 'node_modules');
const helperImportPattern = /@babel\/runtime\/helpers\/esm\/([A-Za-z0-9_]+)(?:\.js)?(?=["'])/g;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.bin') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
      continue;
    }
    if (entry.isFile() && /\.(js|mjs)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function shouldPatch(filePath) {
  return filePath.includes(`${path.sep}es${path.sep}`) || filePath.includes(`${path.sep}esm${path.sep}`);
}

let patchedFiles = 0;

if (fs.existsSync(nodeModulesDir)) {
  for (const filePath of walk(nodeModulesDir)) {
    if (!shouldPatch(filePath)) continue;
    const source = fs.readFileSync(filePath, 'utf8');
    if (!source.includes('@babel/runtime/helpers/esm/')) continue;

    const next = source.replace(helperImportPattern, (_, helperName) => {
      return `babel-runtime-helpers/${helperName}.js`;
    });

    if (next !== source) {
      fs.writeFileSync(filePath, next);
      patchedFiles += 1;
    }
  }
}

console.log(`[patch-runtime-esm] patched ${patchedFiles} files`);
