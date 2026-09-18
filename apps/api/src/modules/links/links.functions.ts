import type { Expiration, Link as LinkContract, LinkStatus } from '@url-shortener/types';
import { createHmac, randomInt } from 'node:crypto';
import type { Link } from 'prisma/generated/prisma/client';

import {
  ALLOWED_TARGET_PROTOCOLS,
  MAX_TARGET_URL_LENGTH,
  RESERVED_SLUGS,
  SLUG_ALPHABET,
} from './links.constants';

/**
 * Generates a random slug of `length` base62 characters.
 **/
// `randomInt` is the CSPRNG, and rejection-samples internally — `Math.random()` would make slugs guessable.
export const generateSlug = (length: number): string => {
  let slug = '';

  for (let index = 0; index < length; index += 1) {
    slug += SLUG_ALPHABET[randomInt(SLUG_ALPHABET.length)];
  }

  return slug;
};

/**
 * True when the slug would collide with a route the web app already owns.
 **/
export const isReservedSlug = (slug: string): boolean => RESERVED_SLUGS.has(slug.toLowerCase());

/**
 * Normalizes a submitted target URL, or null when it is not a usable http(s) address.
 **/
export const normalizeTargetUrl = (rawUrl: string): string | null => {
  const trimmed = rawUrl.trim();

  if (!trimmed || trimmed.length > MAX_TARGET_URL_LENGTH) {
    return null;
  }

  // A bare "example.com" is what people actually paste; assume https rather than rejecting it.
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  // Protocol allowlist: `javascript:`/`data:` targets would turn a short link into an XSS vector.
  if (!ALLOWED_TARGET_PROTOCOLS.includes(url.protocol) || !url.hostname) {
    return null;
  }

  return url.toString();
};

/**
 * True when the target points back at this deployment — a short link to itself is a redirect loop.
 **/
export const isSelfReferencing = (targetUrl: string, webAppUrl: string): boolean => {
  try {
    return new URL(targetUrl).host === new URL(webAppUrl).host;
  } catch {
    return false;
  }
};

/**
 * Turns one of the public form's presets into an absolute expiry (null = never).
 **/
export const resolveExpiration = (expiration: Expiration, from: Date = new Date()): Date | null => {
  const date = new Date(from);

  switch (expiration) {
    case 'HOUR':
      date.setUTCHours(date.getUTCHours() + 1);
      return date;
    case 'DAY':
      date.setUTCDate(date.getUTCDate() + 1);
      return date;
    case 'WEEK':
      date.setUTCDate(date.getUTCDate() + 7);
      return date;
    case 'MONTH':
      date.setUTCMonth(date.getUTCMonth() + 1);
      return date;
    case 'YEAR':
      date.setUTCFullYear(date.getUTCFullYear() + 1);
      return date;
    case 'NEVER':
    default:
      return null;
  }
};

/**
 * Derived state of a link — disabled wins over expired, since it is the explicit operator action.
 **/
export const resolveLinkStatus = (link: Pick<Link, 'expiresAt' | 'disabledAt'>): LinkStatus => {
  if (link.disabledAt) {
    return 'DISABLED';
  }

  if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
    return 'EXPIRED';
  }

  return 'ACTIVE';
};

/**
 * Pseudonymous, irreversible creator id for the public daily quota.
 **/
// A keyed hash, so the stored value cannot be walked back to an address without the server secret.
export const hashCreator = (ip: string, secret: string): string =>
  createHmac('sha256', secret).update(ip).digest('hex');

/**
 * UTC midnight of a timestamp — the bucket key of the per-day click counters.
 **/
export const toUtcDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

/**
 * `YYYY-MM-DD` of a UTC day bucket.
 **/
export const toDayKey = (date: Date): string => toUtcDay(date).toISOString().slice(0, 10);

/**
 * Maps a Prisma row onto the wire contract, adding the absolute short URL and derived status.
 **/
export const toLinkContract = (link: Link, webAppUrl: string): LinkContract => ({
  id: link.id,
  slug: link.slug,
  targetUrl: link.targetUrl,
  note: link.note,
  expiresAt: link.expiresAt?.toISOString() ?? null,
  disabledAt: link.disabledAt?.toISOString() ?? null,
  clickCount: link.clickCount,
  lastVisitedAt: link.lastVisitedAt?.toISOString() ?? null,
  source: link.source,
  createdAt: link.createdAt.toISOString(),
  updatedAt: link.updatedAt.toISOString(),
  shortUrl: `${webAppUrl}/${link.slug}`,
  status: resolveLinkStatus(link),
});
