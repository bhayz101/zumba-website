// Structures scrape/*.json lines into src/data/*.json. Copy is referenced by
// line index so nothing is retyped; images and links are the only added data.
import { readFile, writeFile } from 'node:fs/promises';
import { applyEdits } from './lib/edits.mjs';

const load = async (slug) => JSON.parse(await readFile(`scrape/${slug}.json`, 'utf8')).lines.map(applyEdits);
const out = (name, data) => writeFile(`src/data/en/${name}.json`, JSON.stringify(data, null, 2) + '\n');
const pairs = (L, from, to) => Array.from({ length: (to - from + 1) / 2 }, (_, i) => ({ q: L[from + i * 2], a: L[from + i * 2 + 1] }));

const h = await load('home');
await out('home', {
  hero: { title: h[0], text: h[1], image: '/images/0-13409546.jpeg', alt: 'Smiling dancer in a Zumba top mid-move', buttons: [{ label: h[2], href: '/our-classes' }, { label: h[3], href: '/pricing-passes', variant: 'ghost' }] },
  formats: { title: h[4], name: h[5], text: h[6], image: '/images/1-8957645.jpeg', alt: 'Dancers moving together in a bright studio' },
  quote: { text: h[7], author: h[8] },
  cta: { title: h[9], text: h[10], button: h[11], href: '/pricing-passes' },
  faq: { title: h[12], intro: h[13], items: pairs(h, 14, 23) },
  community: {
    title: h[24], venue: h[25], city: h[26], address: h[27], scheduleTitle: h[28], schedule: h[29],
    contactTitle: h[30], contactIntro: h[31], whatsappLabel: h[32], email: h[33], followTitle: h[34], instagramLabel: h[35],
    calendar: 'https://calendar.app.google/cCHH4upGEMzYH4hz6',
    instagram: 'https://instagram.com/awhbethh',
    map: 'https://www.google.com/maps/place//data=!4m2!3m1!1s0x47e66d93169280d1:0xf0af5c5646c02da2',
    image: '/images/2-16761894.jpeg', alt: 'Parisian street corner near the studio',
  },
});

const c = await load('our-classes');
await out('classes', {
  hero: { title: c[0], text: c[1], image: '/images/3-3775566.jpeg', alt: 'Group dance fitness class in a bright brick studio', button: { label: c[2], href: '/pricing-passes' } },
  expect: {
    title: c[3], intro: c[4],
    steps: [{ title: c[5], text: c[6] }, { title: c[7], text: c[8] }, { title: c[9], text: c[10] }],
    button: { label: c[11], href: '/pricing-passes' }, image: '/images/4-img_6554-high.png', alt: 'Instructor mid-jump on a stage under bright lights',
  },
  sections: [
    { title: c[12], text: c[13] },
    { title: c[14], text: c[15], image: '/images/6-3927386.jpeg', alt: 'Workout clothes, water bottle, headphones and sneakers laid out on a table' },
    { title: c[16], text: c[17], button: { label: c[18], href: '/pricing-passes' } },
  ],
});

const a = await load('about-b');
await out('about', {
  hero: { title: a[0], text: a[1] },
  sections: [
    { title: a[2], text: a[3], button: { label: a[4], href: '/our-classes' }, image: '/images/9-img_6548-1-standard.png', alt: 'Black and white portrait of B laughing on stage' },
    { title: a[5], text: a[6], image: '/images/8-img_4625-standard.png', alt: 'B teaching a Zumba class in front of a mirror' },
    { title: a[8], text: a[9], button: { label: a[10], href: '/fitness-blog' }, image: '/images/10-img_4955-1-standard.jpg', alt: 'Group photo of the Zumba community after class' },
  ],
  quote: { text: a[11], author: a[12] },
});

const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const b = await load('fitness-blog');
await out('blog', {
  hero: { title: b[0], text: b[1] },
  posts: [
    { slug: slugify(b[2]), title: b[2], text: b[3], image: '/images/11-6516187.jpeg', alt: 'Woman stretching her arm in a bright studio', focus: '50% 40%' },
    { slug: slugify(b[4]), title: b[4], text: b[5], image: '/images/12-8436586.jpeg', alt: 'Smiling woman seated on a yoga mat', focus: '50% 30%' },
    { slug: slugify(b[6]), title: b[6], text: b[7], image: '/images/13-7242828.jpeg', alt: 'Smiling woman with curly hair outdoors', focus: '50% 30%' },
  ],
});

const p = await load('pricing-passes');
const idx = (s) => p.indexOf(s);
const tbl = (capIdx, h0, rows) => ({ caption: p[capIdx], head: [p[h0], p[h0 + 1]], rows: Array.from({ length: rows }, (_, i) => [p[h0 + 2 + i * 2], p[h0 + 3 + i * 2]]) });
// Owner addition (not on the live site): no-show policy, same tone as the other policy rows.
const withNoShow = (t) => ({ ...t, rows: [...t.rows, ['No-show fee', 'Full payment is taken, no refund']] });
const t1 = idx('Class options'), t2 = idx('Payment options'), t3 = idx('Terms and cancellation'), cta = idx('Ready to dance with us?');
await out('pricing', {
  hero: { title: p[0], text: p[1] },
  intro: { title: p[2], text: p[3] },
  tables: [tbl(t1, t1, (t2 - t1 - 2) / 2), tbl(t2, t2, (t3 - t2 - 2) / 2), withNoShow(tbl(t3, t3, (cta - t3 - 2) / 2))],
  cta: { title: p[cta], text: p[cta + 1], button: p[cta + 2], href: '/our-classes' },
});
console.log('content ok');
