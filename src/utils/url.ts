// Prefixes site-relative paths with the deploy folder, so the same code works at
// the domain root (main site) and in a sub-folder such as /test/ (preview site).
// External links (https:, mailto:, tel:) are returned unchanged.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path?: string): string {
  if (!path) return path ?? '';
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return BASE + path;
}
