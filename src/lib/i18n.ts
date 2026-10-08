export type Lang = 'en' | 'fr';
export const langs: Lang[] = ['en', 'fr'];
export const defaultLang: Lang = 'en';

const files = import.meta.glob('../data/*/*.json', { eager: true, import: 'default' }) as Record<string, any>;

/** Load one language's content file. Throws when it is missing: no silent fallback to English. */
export function getContent(lang: Lang, name: 'ui' | 'home' | 'classes' | 'pricing' | 'about' | 'blog'): any {
  const c = files[`../data/${lang}/${name}.json`];
  if (!c) throw new Error(`missing content: ${lang}/${name}`);
  return c;
}
