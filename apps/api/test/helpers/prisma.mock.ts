/** A mock PrismaService for the e2e smoke tests; behavior is scripted per test via jest.fn returns. */
export interface PrismaMock {
  $queryRawUnsafe: jest.Mock;
  $transaction: jest.Mock;
  authState: { findUnique: jest.Mock; upsert: jest.Mock };
  refreshToken: {
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
    deleteMany: jest.Mock;
  };
  link: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
    aggregate: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  linkDailyStat: { upsert: jest.Mock; groupBy: jest.Mock };
}

/** A link row shaped like the Prisma model, overridable per test. */
export const linkRow = (over: Record<string, unknown> = {}) => ({
  id: 'link-1',
  slug: 'abc1234',
  targetUrl: 'https://example.com/',
  note: null,
  expiresAt: null,
  disabledAt: null,
  clickCount: 0,
  lastVisitedAt: null,
  source: 'PUBLIC',
  creatorHash: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...over,
});

/**
 * Creates a fresh Prisma mock with healthy defaults; the health check's raw ping resolves.
 **/
export const createPrismaMock = (): PrismaMock => {
  const mock = {
    $queryRawUnsafe: jest.fn().mockResolvedValue([{ ok: 1 }]),
    authState: {
      findUnique: jest.fn().mockResolvedValue({ tokenVersion: 0 }),
      upsert: jest.fn().mockResolvedValue(undefined),
    },
    refreshToken: {
      create: jest.fn().mockResolvedValue({ id: 'refresh-1' }),
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue(undefined),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    link: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve(linkRow(data))),
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      aggregate: jest.fn().mockResolvedValue({ _sum: { clickCount: 0 } }),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve(linkRow(data))),
      delete: jest.fn().mockResolvedValue(undefined),
    },
    linkDailyStat: {
      upsert: jest.fn().mockResolvedValue(undefined),
      groupBy: jest.fn().mockResolvedValue([]),
    },
  } as PrismaMock;

  // Array form resolves each element; callback form runs the interactive tx against the mock.
  mock.$transaction = jest.fn((arg: unknown) =>
    typeof arg === 'function'
      ? (arg as (tx: unknown) => unknown)(mock)
      : Promise.all(arg as Promise<unknown>[]),
  );

  return mock;
};
