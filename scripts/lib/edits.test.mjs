import test from 'node:test';
import assert from 'node:assert/strict';
import { applyEdits } from './edits.mjs';

test('applyEdits replaces em dashes with a comma and space', () => {
  assert.equal(applyEdits('holistic wellness—uplifting both'), 'holistic wellness, uplifting both');
});
test('applyEdits leaves other text alone', () => {
  assert.equal(applyEdits('Nothing to change here.'), 'Nothing to change here.');
});
