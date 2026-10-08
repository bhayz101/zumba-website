/**
 * Prefix root-relative URLs with a base path, for hosting under a sub-path
 * (GitHub Pages project site before the custom domain is active).
 * Absolute URLs, protocol-relative URLs, hashes and mailto links are left alone.
 */
export function rebase(text, base) {
  if (!base) return text;
  return text
    .replace(/\b(href|src)="\/(?!\/)/g, `$1="${base}/`)
    .replace(/url\((['"]?)\/(?!\/)/g, `url($1${base}/`);
}
