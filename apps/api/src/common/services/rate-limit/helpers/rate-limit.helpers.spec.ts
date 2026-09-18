import type { Request } from 'express';
import type Redis from 'ioredis';

import { RateLimitHelpers } from './rate-limit.helpers';

describe('RateLimitHelpers', () => {
  let helpers: RateLimitHelpers;

  beforeEach(() => {
    // The limiter constructor only stores the client; no call reaches Redis in these tests.
    helpers = new RateLimitHelpers({} as Redis);
  });

  describe('normalizeIp', () => {
    it('strips the IPv4-mapped IPv6 prefix', () => {
      expect(helpers.normalizeIp('::ffff:203.0.113.5')).toBe('203.0.113.5');
    });

    it('leaves a plain IPv4 untouched', () => {
      expect(helpers.normalizeIp('203.0.113.5')).toBe('203.0.113.5');
    });

    it('leaves a real IPv6 untouched', () => {
      expect(helpers.normalizeIp('2001:db8::1')).toBe('2001:db8::1');
    });
  });

  describe('resolveSubjectKey', () => {
    it('keys on the normalized client IP', () => {
      expect(helpers.resolveSubjectKey({ ip: '::ffff:1.2.3.4' } as Request)).toBe('ip:1.2.3.4');
    });

    it('returns null when the IP is unknown', () => {
      expect(helpers.resolveSubjectKey({ ip: undefined } as unknown as Request)).toBeNull();
    });
  });

  describe('getLimiter', () => {
    const rule = { points: 5, duration: 60 };

    it('caches one limiter per (scope, method, path, rule)', () => {
      const a = helpers.getLimiter({ method: 'POST', path: '/x', rule, scope: 'ip' });
      const b = helpers.getLimiter({ method: 'POST', path: '/x', rule, scope: 'ip' });

      expect(a).toBe(b);
    });

    it('keeps the ip and global buckets separate for the same route', () => {
      const ip = helpers.getLimiter({ method: 'POST', path: '/x', rule, scope: 'ip' });
      const global = helpers.getLimiter({ method: 'POST', path: '/x', rule, scope: 'global' });

      expect(ip).not.toBe(global);
      expect((ip as unknown as { keyPrefix: string }).keyPrefix).toBe('ip:POST:/x');
      expect((global as unknown as { keyPrefix: string }).keyPrefix).toBe('global:POST:/x');
    });
  });
});
