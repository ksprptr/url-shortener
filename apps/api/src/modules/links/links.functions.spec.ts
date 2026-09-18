import {
  generateSlug,
  hashCreator,
  isReservedSlug,
  isSelfReferencing,
  normalizeTargetUrl,
  resolveExpiration,
  resolveLinkStatus,
  toDayKey,
  toUtcDay,
} from './links.functions';

describe('generateSlug', () => {
  it('returns the requested length from the base62 alphabet', () => {
    const slug = generateSlug(7);

    expect(slug).toHaveLength(7);
    expect(slug).toMatch(/^[A-Za-z0-9]{7}$/);
  });

  it('does not repeat itself', () => {
    const slugs = new Set(Array.from({ length: 200 }, () => generateSlug(7)));

    expect(slugs.size).toBe(200);
  });
});

describe('normalizeTargetUrl', () => {
  it('keeps an absolute https URL', () => {
    expect(normalizeTargetUrl('https://example.com/a?b=c')).toBe('https://example.com/a?b=c');
  });

  it('assumes https for a bare host', () => {
    expect(normalizeTargetUrl('example.com/path')).toBe('https://example.com/path');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeTargetUrl('  https://example.com  ')).toBe('https://example.com/');
  });

  it.each(['javascript:alert(1)', 'data:text/html,<script>', 'ftp://example.com', 'https://'])(
    'rejects %s',
    (value) => {
      expect(normalizeTargetUrl(value)).toBeNull();
    },
  );

  it('rejects an empty value', () => {
    expect(normalizeTargetUrl('   ')).toBeNull();
  });

  it('rejects a URL past the length cap', () => {
    expect(normalizeTargetUrl(`https://example.com/${'a'.repeat(2048)}`)).toBeNull();
  });
});

describe('isSelfReferencing', () => {
  it('detects a target on the app host', () => {
    expect(isSelfReferencing('https://url.ksprptr.dev/abc', 'https://url.ksprptr.dev')).toBe(true);
  });

  it('allows a different host', () => {
    expect(isSelfReferencing('https://example.com', 'https://url.ksprptr.dev')).toBe(false);
  });
});

describe('isReservedSlug', () => {
  it.each(['admin', 'ADMIN', 'login', 'api'])('reserves %s', (slug) => {
    expect(isReservedSlug(slug)).toBe(true);
  });

  it('allows an ordinary slug', () => {
    expect(isReservedSlug('aB3xY7z')).toBe(false);
  });
});

describe('resolveExpiration', () => {
  const from = new Date('2026-09-17T12:00:00.000Z');

  it.each([
    ['HOUR', '2026-09-17T13:00:00.000Z'],
    ['DAY', '2026-09-18T12:00:00.000Z'],
    ['WEEK', '2026-09-24T12:00:00.000Z'],
    ['MONTH', '2026-10-17T12:00:00.000Z'],
    ['YEAR', '2027-09-17T12:00:00.000Z'],
  ] as const)('%s resolves to %s', (expiration, expected) => {
    expect(resolveExpiration(expiration, from)?.toISOString()).toBe(expected);
  });

  it('NEVER resolves to null', () => {
    expect(resolveExpiration('NEVER', from)).toBeNull();
  });
});

describe('resolveLinkStatus', () => {
  it('reports a live link as active', () => {
    expect(resolveLinkStatus({ expiresAt: null, disabledAt: null })).toBe('ACTIVE');
  });

  it('reports a past expiry as expired', () => {
    expect(resolveLinkStatus({ expiresAt: new Date(Date.now() - 1000), disabledAt: null })).toBe(
      'EXPIRED',
    );
  });

  it('lets disabled win over expired', () => {
    expect(
      resolveLinkStatus({ expiresAt: new Date(Date.now() - 1000), disabledAt: new Date() }),
    ).toBe('DISABLED');
  });
});

describe('hashCreator', () => {
  it('is stable for the same address and secret', () => {
    expect(hashCreator('1.2.3.4', 'secret')).toBe(hashCreator('1.2.3.4', 'secret'));
  });

  it('does not contain the address', () => {
    expect(hashCreator('1.2.3.4', 'secret')).not.toContain('1.2.3.4');
  });

  it('differs per secret', () => {
    expect(hashCreator('1.2.3.4', 'a')).not.toBe(hashCreator('1.2.3.4', 'b'));
  });
});

describe('day buckets', () => {
  it('truncates to UTC midnight', () => {
    expect(toUtcDay(new Date('2026-09-17T23:59:59.000Z')).toISOString()).toBe(
      '2026-09-17T00:00:00.000Z',
    );
  });

  it('formats the day key', () => {
    expect(toDayKey(new Date('2026-09-17T23:59:59.000Z'))).toBe('2026-09-17');
  });
});
