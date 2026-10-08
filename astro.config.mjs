import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.zumbawithb.com',
  trailingSlash: 'ignore',
  build: { format: 'file' },
  integrations: [sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', fr: 'fr' } }, serialize: (item) => ({ ...item, url: item.url.replace(/\/fr$/, '/fr/'), links: item.links?.map((l) => ({ ...l, url: l.url.replace(/\/fr$/, '/fr/') })) }) })],
  vite: { plugins: [tailwindcss()] },
});
