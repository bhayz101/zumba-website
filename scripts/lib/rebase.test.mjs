import test from 'node:test';
import assert from 'node:assert/strict';
import { rebase } from './rebase.mjs';

const B = '/zumba-website';

test('rebase prefixes root-relative href, src and CSS url()', () => {
  assert.equal(rebase('<a href="/our-classes">x</a><img src="/images/a.png">', B), '<a href="/zumba-website/our-classes">x</a><img src="/zumba-website/images/a.png">');
  assert.equal(rebase('@font-face{src:url(/fonts/a.ttf)}', B), '@font-face{src:url(/zumba-website/fonts/a.ttf)}');
  assert.equal(rebase("a{background:url('/images/b.png')}", B), "a{background:url('/zumba-website/images/b.png')}");
});
test('rebase maps the home link to the base with a trailing slash', () => {
  assert.equal(rebase('<a href="/">Home</a>', B), '<a href="/zumba-website/">Home</a>');
});
test('rebase leaves absolute, protocol-relative, hash and mailto links alone', () => {
  const html = '<a href="https://x.com/a">1</a><a href="//cdn.x/a">2</a><a href="#main">3</a><a href="mailto:a@b.c">4</a><link rel="canonical" href="https://www.zumbawithb.com/fr/">';
  assert.equal(rebase(html, B), html);
});
test('rebase with an empty base is a no-op', () => {
  assert.equal(rebase('<a href="/x">x</a>', ''), '<a href="/x">x</a>');
});
