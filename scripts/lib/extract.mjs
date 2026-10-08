const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', nbsp: ' ' };

export function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&(amp|lt|gt|quot|nbsp);/g, (_, n) => NAMED[n]);
}

export function normalizeImageUrl(url) {
  return decode(url).split('?')[0];
}

export function collectImageUrls(html) {
  const found = html.match(/https?:\/\/primary\.jwwb\.nl\/[^"'()\s]+?\.(?:jpe?g|png|webp|gif)/gi) ?? [];
  const set = new Set(found.map(normalizeImageUrl).filter((u) => !/\/ai-logo-/.test(u)));
  return [...set];
}

export function extractLines(html) {
  const body = html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '');
  const lines = decode(body.replace(/<[^>]+>/g, '\n'))
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const start = lines.indexOf('Fitness Blog');
  if (start === -1) throw new Error('nav marker "Fitness Blog" not found: page is not a real site page');
  const afterNav = lines.slice(start + 1);
  const end = afterNav.indexOf('Create Your Own Website With');
  if (end === -1) throw new Error('footer marker "Create Your Own Website With" not found: page is truncated or the template changed');
  return afterNav.slice(0, end);
}
