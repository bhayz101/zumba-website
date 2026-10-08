import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanPath, localizedPath } from './paths.mjs';

test('cleanPath normalises html, index and trailing slash', () => {
  assert.equal(cleanPath('/about-b.html'), '/about-b');
  assert.equal(cleanPath('/'), '/');
  assert.equal(cleanPath('/index.html'), '/');
  assert.equal(cleanPath('/fr/'), '/fr');
  assert.equal(cleanPath('/fr/index.html'), '/fr');
  assert.equal(cleanPath('/fitness-blog/x.html'), '/fitness-blog/x');
});

test('localizedPath maps a page to the other language and back', () => {
  assert.equal(localizedPath('fr', '/'), '/fr/');
  assert.equal(localizedPath('en', '/fr/'), '/');
  assert.equal(localizedPath('fr', '/our-classes.html'), '/fr/our-classes');
  assert.equal(localizedPath('en', '/fr/fitness-blog/x'), '/fitness-blog/x');
  assert.equal(localizedPath('fr', '/fr/about-b'), '/fr/about-b');
  assert.equal(localizedPath('en', '/about-b'), '/about-b');
});

test('localizedPath does not treat /frost as french', () => {
  assert.equal(localizedPath('en', '/frost'), '/frost');
});
