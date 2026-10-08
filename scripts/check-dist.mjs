import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { decode } from './lib/extract.mjs';
import { applyEdits } from './lib/edits.mjs';

const PAGES = { home: 'index.html', 'our-classes': 'our-classes.html', 'pricing-passes': 'pricing-passes.html', 'about-b': 'about-b.html', 'fitness-blog': 'fitness-blog.html' };
const text = (html) => decode(html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, '\n')).replace(/\s+/g, ' ');
let failed = 0;
const URLS = { home: '/', 'our-classes': '/our-classes', 'pricing-passes': '/pricing-passes', 'about-b': '/about-b', 'fitness-blog': '/fitness-blog' };
// Owner removed this photo from the 'Designed for all bodies' section.
const LOCAL_IMAGES_OK_UNUSED = ['/images/5-26088455.jpeg'];

for (const [slug, file] of Object.entries(PAGES)) {
  const { lines, images } = JSON.parse(await readFile(`scrape/${slug}.json`, 'utf8'));
  const raw = await readFile(path.join('dist', file), 'utf8');
  const built = text(raw);
  const canonical = raw.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical !== `https://www.zumbawithb.com${URLS[slug]}`) { console.error(`CANONICAL [${slug}] ${canonical}`); failed++; }
  if (!new RegExp(`href="${URLS[slug]}"[^>]*aria-current="page"|aria-current="page"[^>]*href="${URLS[slug]}"`).test(raw)) { console.error(`NAV aria-current missing [${slug}]`); failed++; }
  for (const { local } of images) {
    if (LOCAL_IMAGES_OK_UNUSED.includes(local)) continue;
    if (!raw.includes(local)) { console.error(`IMAGE not rendered [${slug}] ${local}`); failed++; }
    try { await readFile(path.join('dist', local)); } catch { console.error(`IMAGE file missing in dist ${local}`); failed++; }
  }
  // Owner removed these buttons from the live copy.
const REMOVED = { 'about-b': ['View pricing and passes'] };
  for (const line of lines.map(applyEdits)) {
    if (REMOVED[slug]?.includes(line)) continue;
    if (!built.includes(line.replace(/\s+/g, ' '))) { console.error(`MISSING [${slug}] ${line}`); failed++; }
  }
}

async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { await walk(p); continue; }
    if (!/\.(html|css|js|xml|json|txt)$/.test(e.name)) continue;
    if (/jwwb\.nl|webador/i.test(await readFile(p, 'utf8'))) { console.error(`LEAK ${p}`); failed++; }
  }
}
await walk('dist');


// ---- language checks (en + fr) ----
const ORIGIN = 'https://www.zumbawithb.com';
const enBlog = JSON.parse(await readFile('src/data/en/blog.json', 'utf8'));
const frBlog = JSON.parse(await readFile('src/data/fr/blog.json', 'utf8'));
const enPaths = ['/', '/our-classes', '/pricing-passes', '/about-b', '/fitness-blog', ...enBlog.posts.map((p) => `/fitness-blog/${p.slug}`)];
const toFr = (p) => (p === '/' ? '/fr/' : `/fr${p}`);
const fileFor = (p) => (p === '/' ? 'index.html' : p === '/fr/' ? 'fr/index.html' : `${p.slice(1)}.html`);
const exists = async (p) => { try { await readFile(path.join('dist', fileFor(p))); return true; } catch { return false; } };
const PASSTHROUGH = /^\/(images|fonts|_astro|favicon|CNAME|sitemap)/;
const scrapeLinesFor = { '/': 'home', '/our-classes': 'our-classes', '/pricing-passes': 'pricing-passes', '/about-b': 'about-b', '/fitness-blog': 'fitness-blog' };
const articleTextEn = Object.fromEntries(enBlog.posts.map((p) => [`/fitness-blog/${p.slug}`, [p.title, p.text]]));
const articleTextFr = Object.fromEntries(frBlog.posts.map((p) => [`/fitness-blog/${p.slug}`, [p.title, p.text]]));

for (const lang of ['en', 'fr']) {
  for (const enPath of enPaths) {
    const own = lang === 'en' ? enPath : toFr(enPath);
    const tag = `${lang} ${own}`;
    if (!(await exists(own))) { console.error(`PAGE missing [${tag}]`); failed++; continue; }
    const raw = await readFile(path.join('dist', fileFor(own)), 'utf8');
    if (!raw.includes(`<html lang="${lang}"`)) { console.error(`LANG [${tag}] wrong <html lang>`); failed++; }
    const canonical = raw.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    if (canonical !== `${ORIGIN}${own}`) { console.error(`CANONICAL [${tag}] ${canonical}`); failed++; }
    const alt = Object.fromEntries([...raw.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));
    const want = { en: `${ORIGIN}${enPath}`, fr: `${ORIGIN}${toFr(enPath)}`, 'x-default': `${ORIGIN}${enPath}` };
    for (const [k, v] of Object.entries(want)) if (alt[k] !== v) { console.error(`HREFLANG [${tag}] ${k}=${alt[k]} expected ${v}`); failed++; }
    const sw = [...raw.matchAll(/<a href="([^"]+)" hreflang="(en|fr)"([^>]*)>/g)];
    if (sw.length !== 2) { console.error(`SWITCHER [${tag}] expected 2 links, found ${sw.length}`); failed++; }
    for (const [, href, hl, rest] of sw) {
      if (!(await exists(href))) { console.error(`SWITCHER [${tag}] target ${href} does not exist`); failed++; }
      if ((hl === lang) !== /aria-current="true"/.test(rest)) { console.error(`SWITCHER [${tag}] aria-current wrong on ${hl}`); failed++; }
    }
    for (const m of raw.matchAll(/<a ([^>]*)>/g)) {
      const href = m[1].match(/href="(\/[^"]*)"/)?.[1];
      if (!href || PASSTHROUGH.test(href) || /hreflang=/.test(m[1])) continue;
      const isFr = href === '/fr' || href.startsWith('/fr/');
      if (lang === 'fr' && !isFr) { console.error(`FR LINK [${tag}] points at English page ${href}`); failed++; }
      if (lang === 'en' && isFr) { console.error(`EN LINK [${tag}] points at French page ${href}`); failed++; }
    }
    if (lang === 'fr') {
      const body = text(raw);
      const english = scrapeLinesFor[enPath]
        ? JSON.parse(await readFile(`scrape/${scrapeLinesFor[enPath]}.json`, 'utf8')).lines.map(applyEdits)
        : articleTextEn[enPath];
      for (const sentence of english.flatMap((l) => l.split(/(?<=[.!?])\s+/))) {
        if (sentence.length > 30 && body.includes(sentence.replace(/\s+/g, ' '))) { console.error(`UNTRANSLATED [${tag}] ${sentence.slice(0, 60)}`); failed++; }
      }
      for (const line of articleTextFr[enPath] ?? []) {
        if (!body.includes(line)) { console.error(`FR article text missing [${tag}] ${line.slice(0, 50)}`); failed++; }
      }
    }
  }
}

// ---- sitemap: French home must be /fr/ everywhere, including hreflang alternates ----
const sitemap = await readFile('dist/sitemap-0.xml', 'utf8');
for (const m of sitemap.matchAll(/(?:<loc>|href=")([^"<]*\/fr)(?:<\/loc>|")/g)) { console.error(`SITEMAP ${m[1]} must end with /fr/`); failed++; }

if (failed) { console.error(`${failed} problem(s)`); process.exit(1); }
console.log('dist ok: all copy present, no Webador references, en/fr language checks pass');
