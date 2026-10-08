import { mkdir, rename, access, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { rebase } from './lib/rebase.mjs';

// build.format "file" writes the French home page to dist/fr.html. Static hosts (GitHub Pages)
// serve /fr/ from fr/index.html, so move it there.
try { await access('dist/fr.html'); } catch { throw new Error('dist/fr.html not found: run `astro build` first'); }
await mkdir('dist/fr', { recursive: true });
await rename('dist/fr.html', 'dist/fr/index.html');
console.log('postbuild: dist/fr/index.html');

// Preview on a sub-path (no custom domain yet): prefix root-relative URLs with BASE_PATH.
const base = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
if (base) {
  let files = 0;
  const walk = async (dir) => {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { await walk(p); continue; }
      if (!/\.(html|css)$/.test(e.name)) continue;
      const src = await readFile(p, 'utf8');
      const out = rebase(src, base);
      if (out !== src) { await writeFile(p, out); files++; }
    }
  };
  await walk('dist');
  console.log(`postbuild: rebased ${files} files under ${base}`);
}
