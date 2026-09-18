import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_META_KEY = 'rate_limit:rule';

/** A limit keyed on a single fixed bucket, shared by every caller regardless of IP. */
export type GlobalRateLimit = {
  points: number;
  duration: number;
  blockDuration?: number;
};

export type RateLimitRule = {
  points: number;
  duration: number;
  // Lockout after the points are exhausted; defaults to `duration` when unset.
  blockDuration?: number;
  errorMessage?: string;
  // IP-independent cap on top of per-IP — rotating X-Forwarded-For cannot outrun one global bucket.
  global?: GlobalRateLimit;
};

/**
 * Applies a per-route rate limit rule.
 **/
export const RateLimit = (rule: RateLimitRule) => SetMetadata(RATE_LIMIT_META_KEY, rule);
