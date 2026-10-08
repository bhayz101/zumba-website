import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { extractLines, collectImageUrls, decode } from './lib/extract.mjs';

const BASE = 'https://www.zumbawithb.com';
const PAGES = { home: '', 'our-classes': 'our-classes', 'pricing-passes': 'pricing-passes', 'about-b': 'about-b', 'fitness-blog': 'fitness-blog' };
const UA = { 'User-Agent': 'Mozilla/5.0' };

async function get(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

await mkdir('scrape', { recursive: true });
await mkdir('public/images', { recursive: true });
const downloaded = new Map();

for (const [slug, p] of Object.entries(PAGES)) {
  const url = `${BASE}/${p}`;
  const html = await (await get(url)).text();
  const lines = extractLines(html);
  if (lines.length < 3) throw new Error(`${url}: only ${lines.length} lines extracted`);
  const title = decode(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? slug);
  const images = [];
  for (const remote of collectImageUrls(html)) {
    if (!downloaded.has(remote)) {
      const name = remote.split('/').slice(-1)[0];
      const file = `${downloaded.size}-${name}`.replace(/[^\w.-]/g, '_');
      const imgRes = await get(remote);
      if (!/^image\//.test(imgRes.headers.get('content-type') ?? '')) throw new Error(`not an image: ${remote}`);
      const buf = Buffer.from(await imgRes.arrayBuffer());
      await writeFile(path.join('public/images', file), buf);
      downloaded.set(remote, `/images/${file}`);
    }
    images.push({ remote, local: downloaded.get(remote) });
  }
  await writeFile(`scrape/${slug}.json`, JSON.stringify({ url, title, lines, images }, null, 2));
  console.log(`${slug}: ${lines.length} lines, ${images.length} images`);
}
