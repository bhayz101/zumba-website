import { mkdir, rename, access } from 'node:fs/promises';

// build.format "file" writes the French home page to dist/fr.html. Static hosts (GitHub Pages)
// serve /fr/ from fr/index.html, so move it there.
try { await access('dist/fr.html'); } catch { throw new Error('dist/fr.html not found: run `astro build` first'); }
await mkdir('dist/fr', { recursive: true });
await rename('dist/fr.html', 'dist/fr/index.html');
console.log('postbuild: dist/fr/index.html');
