/** Public URL path for a built page: no `.html`, no trailing slash, `/` for home. */
export function cleanPath(pathname) {
  const p = pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '');
  return p === '' ? '/' : p;
}

/** Same page in another language. English lives at the root, French under /fr. */
export function localizedPath(lang, pathname) {
  const clean = cleanPath(pathname);
  const base = clean.replace(/^\/fr(?=\/|$)/, '') || '/';
  if (lang === 'en') return base;
  return base === '/' ? '/fr/' : `/fr${base}`;
}
