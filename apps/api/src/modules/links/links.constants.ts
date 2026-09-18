/** Base62 — unambiguous in a URL and case-sensitive, so 7 characters already cover ~3.5e12 slugs. */
export const SLUG_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** A custom slug the operator may set: URL-safe characters only, long enough to not collide with a route. */
export const SLUG_PATTERN = /^[A-Za-z0-9_-]{3,64}$/;

/** Retries when a generated slug happens to be taken; the keyspace makes more than a couple absurd. */
export const SLUG_GENERATION_ATTEMPTS = 6;

/** Longest target URL accepted — comfortably above what browsers and proxies handle. */
export const MAX_TARGET_URL_LENGTH = 2048;

/** The only schemes a short link may point at; everything else (`javascript:`, `data:`, …) is refused. */
export const ALLOWED_TARGET_PROTOCOLS = ['http:', 'https:'];

/** Slugs the web app owns; a link on one would be shadowed by the real route, so it is refused at creation. */
export const RESERVED_SLUGS = new Set([
  '_next',
  'about',
  'admin',
  'api',
  'assets',
  'dashboard',
  'favicon.ico',
  'health',
  'icon',
  'login',
  'logout',
  'manifest.webmanifest',
  'not-found',
  'opensearch.xml',
  'privacy',
  'public',
  'robots.txt',
  'sitemap.xml',
  'static',
  'terms',
]);

/** How many days of history the admin dashboard chart covers. */
export const STATS_WINDOW_DAYS = 30;

/** How many links the dashboard's "most visited" list shows. */
export const TOP_LINKS_LIMIT = 5;

/** Admin listing page size bounds. */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
