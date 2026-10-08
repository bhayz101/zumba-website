# Zumba with B

Static Astro site for https://www.zumbawithb.com, migrated off Webador.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Build to `dist/` (also moves the French home to `dist/fr/index.html`) |
| `npm run check` | Build, then verify every scraped line is present, no Webador references remain, and the EN/FR pages, canonicals, `hreflang`, switcher and links are correct |
| `npm test` | Unit tests: scraper helpers, path helpers, and that `fr` content matches `en` in shape and is translated |
| `npm run scrape` | Re-snapshot the live site into `scrape/` and `public/images/` |
| `node scripts/build-content.mjs` | Regenerate the English content `src/data/en/*.json` from `scrape/` (overwrites hand edits to English; never touches French) |

## Languages (EN default, FR under `/fr/`)

- English pages: `/`, `/our-classes`, ... French pages: `/fr/`, `/fr/our-classes`, ... Same blog slugs in both. The `EN | FR` switcher in the header links to the same page in the other language.
- Text lives in `src/data/<lang>/*.json` (`ui.json` has nav, buttons and form labels). `src/data/fr/` is hand-written: no script regenerates it.
- To change wording, edit both `en` and `fr`. `npm test` fails if the two files differ in keys, array lengths or blog slugs, if a value is empty, or if a long sentence is left in English.
- Page markup is in `src/templates/` and takes a `lang` prop; `src/pages/` and `src/pages/fr/` are thin wrappers.
- Shared data (links, PayPal, newsletter) is in `src/data/site.json`.

## Configuration

Edit `src/data/site.json`:

- `whatsapp`: community chat link (set).
- `paypal`: PayPal.me or hosted-button URL. The pay button appears only when set.
- `newsletterEndpoint`: form endpoint (e.g. Formspree). The signup form appears only when set.

## Cutover

1. Push to `main`; GitHub Actions builds and deploys to GitHub Pages.
2. Point DNS for `www.zumbawithb.com` at GitHub Pages (see Remaining steps). URLs are identical, so no redirects are needed.
3. Keep the Webador site until DNS has propagated.

## Remaining steps

- [ ] **PayPal:** replace `paypal` in `src/data/site.json` (currently `https://www.paypal.me/REPLACE_ME`). Use a PayPal.me or hosted-button URL.
- [x] **Newsletter form:** create a form on Formspree (or similar) and replace `newsletterEndpoint` in `site.json` (set to `https://formspree.io/f/xqpeqpej`). Check the free-first-class reply or automation works.
- [ ] **Blog articles:** each article page holds only the one paragraph from the live site. Add full article text in `src/data/en/blog.json` and `src/data/fr/blog.json`.
- [ ] **French copy review:** skim every file in `src/data/fr/` (tone, wording, "vous", the PayPal and newsletter labels) and fix anything that sounds off.
- [ ] **Images:** resize and compress to about 1200px WebP (several are over 1 MB, one is a 1.8 MB PNG). Add `width`/`height` to `<img>` tags.
- [ ] **Favicon:** add `public/favicon.svg` or `.ico` (the ZB logo is in `public/images/`).
- [ ] **Phone check:** test all pages at 375px, especially the pricing table and header nav.
- [ ] **Lighthouse:** aim for 90+ on performance and accessibility on every page.
- [ ] **Git remote:** create the GitHub repo, rename the branch to `main` (`git branch -m main`) and push. The deploy workflow runs on pushes to `main`.
- [ ] **GitHub Pages:** in repo Settings > Pages, set Source to "GitHub Actions". The workflow in `.github/workflows/deploy.yml` runs tests, the dist check, then deploys.
- [ ] **Custom domain:** `public/CNAME` already says `www.zumbawithb.com`. In Settings > Pages, set the custom domain and enable "Enforce HTTPS" once the certificate is ready.
- [ ] **Preview first:** the first deploy lands on `https://<user>.github.io/<repo>/` only if no custom domain is set; with the CNAME it redirects to the domain. To preview before cutover, temporarily remove `public/CNAME` and set `base` in `astro.config.mjs` to `/<repo>`, or test with `npm run preview`.
- [ ] **Cutover (DNS):** at the domain registrar, point `www` to GitHub Pages with a CNAME record to `<user>.github.io`. Also add the 4 GitHub `A` records (185.199.108.153, .109.153, .110.153, .111.153) for the apex `zumbawithb.com` so it redirects to `www`. Keep Webador until DNS has propagated.
- [ ] **Before launch:** remove all `REPLACE_ME` values; `grep -r REPLACE_ME src` should return nothing.
