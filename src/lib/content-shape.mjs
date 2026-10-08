const UNTRANSLATED_OK = new Set(['href', 'image', 'alt', 'calendar', 'map', 'instagram', 'email', 'slug', 'variant']);

/** Compare two language versions of one content file. Returns a list of problems. */
export function compareShape(a, b, path = '') {
  const problems = [];
  const key = path.split('.').pop()?.replace(/\[\d+\]$/, '') ?? '';
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return [`${path}: type mismatch`];
    if (a.length !== b.length) return [`${path}: array length ${a.length} vs ${b.length}`];
    a.forEach((v, i) => problems.push(...compareShape(v, b[i], `${path}[${i}]`)));
    return problems;
  }
  if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object') return [`${path}: type mismatch`];
    for (const k of Object.keys(a)) {
      if (!(k in b)) problems.push(`${path}.${k}: missing in translation`);
      else problems.push(...compareShape(a[k], b[k], `${path}.${k}`));
    }
    for (const k of Object.keys(b)) if (!(k in a)) problems.push(`${path}.${k}: extra key in translation`);
    return problems;
  }
  if (typeof a !== typeof b) return [`${path}: type mismatch`];
  if (typeof a === 'string') {
    if (b.trim() === '') problems.push(`${path}: empty string`);
    if (key === 'slug' && a !== b) problems.push(`${path}: slug differs (${a} vs ${b})`);
    if (!UNTRANSLATED_OK.has(key) && a === b && a.length > 40 && /\s/.test(a)) problems.push(`${path}: untranslated sentence`);
  }
  return problems;
}
