import { readFileSync } from 'node:fs';

const EDITS = JSON.parse(readFileSync(new URL('../copy-edits.json', import.meta.url), 'utf8'));

/** Owner-approved wording changes applied on top of the scraped copy. */
export function applyEdits(line) {
  return EDITS.reduce((s, { from, to }) => s.replaceAll(from, to), line);
}
