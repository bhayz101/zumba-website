import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compareShape } from './content-shape.mjs';

const names = ['ui', 'home', 'classes', 'pricing', 'about', 'blog'];
for (const name of names) {
  test(`fr/${name}.json has the same shape as en/${name}.json and is translated`, async () => {
    const en = JSON.parse(await readFile(`src/data/en/${name}.json`, 'utf8'));
    const fr = JSON.parse(await readFile(`src/data/fr/${name}.json`, 'utf8'));
    assert.deepEqual(compareShape(en, fr, name), []);
  });
}

test('French pay button label', async () => {
  const fr = JSON.parse(await readFile('src/data/fr/ui.json', 'utf8'));
  assert.equal(fr.payWithPaypal, 'Payer avec PayPal');
});
