import { mkdir, writeFile } from 'node:fs/promises';

const CSS_URL = 'https://gfonts.jwwb.nl/css?display=swap&family=Roboto%3A400%2C700%7CMontserrat%3A400%2C700';
const cssRes = await fetch(CSS_URL, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120' } });
if (!cssRes.ok) throw new Error(`${cssRes.status} ${CSS_URL}`);
const css = await cssRes.text();
await mkdir('public/fonts', { recursive: true });
let out = css;
for (const url of new Set(css.match(/https?:\/\/[^)'"\s]+\.(?:woff2|ttf)/g) ?? [])) {
  const file = url.split('/').slice(-3).join('-');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await writeFile(`public/fonts/${file}`, Buffer.from(await res.arrayBuffer()));
  out = out.replaceAll(url, `/fonts/${file}`);
}
if (!/\/fonts\//.test(out)) throw new Error('no font files found in CSS');
await writeFile('src/styles/fonts.css', out);
console.log('fonts ok');
