import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeImageUrl, extractLines, collectImageUrls } from './extract.mjs';

test('normalizeImageUrl strips resize params and decodes entities', () => {
  const u = 'https://primary.jwwb.nl/pexels/39/3927386.jpeg?enable-io=true&amp;crop=1.388%3A1&amp;width=800';
  assert.equal(normalizeImageUrl(u), 'https://primary.jwwb.nl/pexels/39/3927386.jpeg');
});

test('collectImageUrls de-duplicates widths of the same image and skips badge', () => {
  const html = `<img src="https://primary.jwwb.nl/a/img.png?width=226">
  <img src="https://primary.jwwb.nl/a/img.png?width=1920">
  <img src="https://primary.jwwb.nl/a/ai-logo-4a13-standard.png?width=131">`;
  assert.deepEqual(collectImageUrls(html), ['https://primary.jwwb.nl/a/img.png']);
});

test('extractLines keeps body copy, decodes entities, drops nav/footer/script', () => {
  const html = `<script>var x=1</script><nav><a>Home</a><a>Fitness Blog</a></nav>
  <h1>Pricing &amp; Passes</h1><p>Don&#39;t stop</p>
  <p>Create Your Own Website With</p><p>Webador</p>`;
  assert.deepEqual(extractLines(html), ['Pricing & Passes', "Don't stop"]);
});

test('extractLines throws when the nav marker is missing (error page)', () => {
  assert.throws(() => extractLines('<html><body>Access denied</body></html>'), /marker/);
});

test('extractLines throws when the footer marker is missing (truncated or restyled page)', () => {
  const html = '<nav><a>Fitness Blog</a></nav><h1>Title</h1><p>Body</p><p>Powered by Webador</p>';
  assert.throws(() => extractLines(html), /footer marker/);
});
