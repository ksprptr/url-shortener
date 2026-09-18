import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import Redis from 'ioredis';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';

import { REDIS_RATE_LIMIT } from '../rate-limit.constants';

interface GetLimiterParams {
  method: string;
  path: string;
  rule: { points: number; duration: number; blockDuration?: number };
  // Keeps the per-IP and the global limiter for one route in separate Redis buckets.
  scope: 'ip' | 'global';
}

/**
 * Resolves the subject key and caches one Redis-backed limiter per (method, path, rule).
 **/
@Injectable()
export class RateLimitHelpers {
  private readonly limiterCache = new Map<string, RateLimiterRedis>();

  constructor(@Inject(REDIS_RATE_LIMIT) private readonly redis: Redis) {}

  /**
   * Resolves the subject key (by IP), or null when the IP is unknown.
   **/
  resolveSubjectKey(req: Request): string | null {
    const ip = req.ip ? this.normalizeIp(req.ip) : null;

    return ip ? `ip:${ip}` : null;
  }

  /**
   * Normalizes IPv4-mapped IPv6 addresses to plain IPv4.
   **/
  normalizeIp(ip: string): string {
    return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  }

  /**
   * Gets or creates the (method, path, rule) limiter; Redis-backed with an in-memory insurance fallback.
   **/
  getLimiter({ method, path, rule, scope }: GetLimiterParams): RateLimiterRedis {
    const blockDuration = rule.blockDuration ?? rule.duration;
    const keyPrefix = `${scope}:${method}:${path}`;
    const cacheKey = `${keyPrefix}:${rule.points}:${rule.duration}:${blockDuration}`;
    const existing = this.limiterCache.get(cacheKey);

    if (existing) {
      return existing;
    }

    const limiter = new RateLimiterRedis({
      storeClient: this.redis,
      keyPrefix,
      points: rule.points,
      duration: rule.duration,
      blockDuration,
      insuranceLimiter: new RateLimiterMemory({
        keyPrefix,
        points: rule.points,
        duration: rule.duration,
        blockDuration,
      }),
    });

    this.limiterCache.set(cacheKey, limiter);

    return limiter;
  }
}
