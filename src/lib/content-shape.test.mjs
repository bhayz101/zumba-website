import test from 'node:test';
import assert from 'node:assert/strict';
import { compareShape } from './content-shape.mjs';

test('identical shapes with translated strings pass', () => {
  assert.deepEqual(compareShape({ a: 'Hello there my friend how are you doing today ok' }, { a: 'Bonjour mon ami comment vas-tu aujourd hui très bien' }), []);
});
test('missing and extra keys are reported', () => {
  const p = compareShape({ a: 'x', b: 'y' }, { a: 'x', c: 'z' });
  assert.ok(p.some((s) => /b.*missing/.test(s)));
  assert.ok(p.some((s) => /c.*extra/.test(s)));
});
test('array length mismatch and empty strings are reported', () => {
  assert.ok(compareShape({ a: [1, 2] }, { a: [1] }).some((s) => /length/.test(s)));
  assert.ok(compareShape({ a: 'x' }, { a: '' }).some((s) => /empty/.test(s)));
});
test('long identical sentences are flagged as untranslated, short and url fields are not', () => {
  const en = 'This is a long untranslated sentence that stays in English here';
  assert.ok(compareShape({ text: en }, { text: en }).some((s) => /untranslated/.test(s)));
  assert.deepEqual(compareShape({ text: 'Zumba', href: '/our-classes' }, { text: 'Zumba', href: '/our-classes' }), []);
});
test('slugs must be equal across languages', () => {
  assert.ok(compareShape({ slug: 'a-b' }, { slug: 'a-c' }).some((s) => /slug/.test(s)));
  assert.deepEqual(compareShape({ slug: 'a-b' }, { slug: 'a-b' }), []);
});
