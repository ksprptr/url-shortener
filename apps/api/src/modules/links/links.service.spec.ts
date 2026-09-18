import {
  BadRequestException,
  ConflictException,
  GoneException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma/client';

import type { AppConfig } from '@/config/app.config';
import type { JwtConfig } from '@/config/jwt.config';
import type { LinksConfig } from '@/config/links.config';
import type { PrismaService } from '@/prisma/prisma.service';

import { LinksService } from './links.service';

const P2002 = () =>
  new Prisma.PrismaClientKnownRequestError('unique', { code: 'P2002', clientVersion: 't' });

describe('LinksService', () => {
  let service: LinksService;
  let prisma: {
    link: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    linkDailyStat: { upsert: jest.Mock };
    $transaction: jest.Mock;
  };

  const appCfg = { webAppUrl: 'https://url.example' } as AppConfig;
  const jwtCfg = { accessSecret: 'k' } as JwtConfig;
  const linksCfg = { publicDailyLimit: 3, slugLength: 7 } as LinksConfig;

  const row = (over: Record<string, unknown> = {}) => ({
    id: 'id-1',
    slug: 'abc1234',
    targetUrl: 'https://example.com/',
    note: null,
    expiresAt: null,
    disabledAt: null,
    clickCount: 0,
    lastVisitedAt: null,
    source: 'PUBLIC',
    creatorHash: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...over,
  });

  beforeEach(() => {
    prisma = {
      link: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve(row(data))),
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve(row(data))),
        delete: jest.fn().mockResolvedValue(undefined),
      },
      linkDailyStat: { upsert: jest.fn() },
      // Array form runs the batch; callback form runs the interactive tx against the same mock.
      $transaction: jest.fn((arg: unknown) =>
        typeof arg === 'function'
          ? (arg as (tx: unknown) => unknown)(prisma)
          : Promise.all(arg as unknown[]),
      ),
    };
    service = new LinksService(appCfg, jwtCfg, linksCfg, prisma as unknown as PrismaService);
  });

  describe('createPublic', () => {
    it('refuses when the client IP is unknown', async () => {
      await expect(
        service.createPublic({ targetUrl: 'a.com', expiration: 'DAY' }, null),
      ).rejects.toThrow(BadRequestException);
    });

    it('enforces the daily quota with a 429', async () => {
      prisma.link.count.mockResolvedValue(3);

      const promise = service.createPublic({ targetUrl: 'a.com', expiration: 'DAY' }, '1.2.3.4');
      await expect(promise).rejects.toBeInstanceOf(HttpException);
      await expect(promise).rejects.toMatchObject({ status: 429 });
    });

    it('creates a link under the quota and returns an absolute short URL', async () => {
      prisma.link.count.mockResolvedValue(2);

      const link = await service.createPublic(
        { targetUrl: 'example.com', expiration: 'NEVER' },
        '1.2.3.4',
      );

      expect(link.shortUrl).toBe(`https://url.example/${link.slug}`);
      expect(link.targetUrl).toBe('https://example.com/');
      expect(prisma.link.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ source: 'PUBLIC', creatorHash: expect.any(String) }),
        }),
      );
    });

    it('stores a pseudonymous creatorHash, never the raw IP', async () => {
      prisma.link.count.mockResolvedValue(0);
      await service.createPublic({ targetUrl: 'example.com', expiration: 'DAY' }, '203.0.113.9');

      const { creatorHash } = prisma.link.create.mock.calls[0][0].data;
      expect(creatorHash).not.toContain('203.0.113.9');
      expect(creatorHash).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('createAsAdmin', () => {
    it('rejects an invalid target URL', async () => {
      await expect(
        service.createAsAdmin({ targetUrl: 'javascript:alert(1)', expiration: 'NEVER' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a reserved slug', async () => {
      await expect(
        service.createAsAdmin({ targetUrl: 'https://x.com', expiration: 'NEVER', slug: 'admin' }),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects a target that points back at the app', async () => {
      await expect(
        service.createAsAdmin({ targetUrl: 'https://url.example/foo', expiration: 'NEVER' }),
      ).rejects.toThrow('cannot point back');
    });

    it('maps a taken custom slug (P2002) to a 409', async () => {
      prisma.link.create.mockRejectedValueOnce(P2002());

      await expect(
        service.createAsAdmin({ targetUrl: 'https://x.com', expiration: 'NEVER', slug: 'mine' }),
      ).rejects.toThrow('already taken');
    });

    it('retries a generated-slug collision and succeeds on a later attempt', async () => {
      prisma.link.create
        .mockRejectedValueOnce(P2002())
        .mockRejectedValueOnce(P2002())
        .mockImplementationOnce(({ data }) => Promise.resolve(row(data)));

      const link = await service.createAsAdmin({ targetUrl: 'https://x.com', expiration: 'NEVER' });

      expect(link.id).toBeDefined();
      expect(prisma.link.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('resolve', () => {
    it('404s an unknown slug', async () => {
      prisma.link.findUnique.mockResolvedValue(null);

      await expect(service.resolve('nope')).rejects.toThrow(NotFoundException);
    });

    it('410s a disabled link', async () => {
      prisma.link.findUnique.mockResolvedValue(row({ disabledAt: new Date() }));

      await expect(service.resolve('abc1234')).rejects.toThrow(GoneException);
    });

    it('410s an expired link', async () => {
      prisma.link.findUnique.mockResolvedValue(row({ expiresAt: new Date(Date.now() - 1000) }));

      await expect(service.resolve('abc1234')).rejects.toThrow('expired');
    });

    it('returns the target and records the visit for a live link', async () => {
      prisma.link.findUnique.mockResolvedValue(row());

      const result = await service.resolve('abc1234');

      expect(result).toEqual({ targetUrl: 'https://example.com/' });
      expect(prisma.link.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ clickCount: { increment: 1 } }),
        }),
      );
      expect(prisma.linkDailyStat.upsert).toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('computes pageCount and clamps the page size to the max', async () => {
      prisma.link.count.mockResolvedValue(45);
      prisma.link.findMany.mockResolvedValue([row()]);

      const page = await service.list({ page: 2, pageSize: 999 });

      expect(page.total).toBe(45);
      expect(page.pageSize).toBe(100); // MAX_PAGE_SIZE
      expect(page.pageCount).toBe(1);
      expect(page.items[0].shortUrl).toBe(`https://url.example/${page.items[0].slug}`);
    });

    it('never reports a pageCount below 1, even with no rows', async () => {
      prisma.link.count.mockResolvedValue(0);

      const page = await service.list({});

      expect(page.pageCount).toBe(1);
    });
  });

  describe('findOne / update / remove', () => {
    it('findOne 404s a missing link', async () => {
      prisma.link.findUnique.mockResolvedValue(null);

      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });

    it('update sets disabledAt when disabled=true and clears it when false', async () => {
      await service.update('id-1', { disabled: true });
      expect(prisma.link.update.mock.calls[0][0].data.disabledAt).toBeInstanceOf(Date);

      await service.update('id-1', { disabled: false });
      expect(prisma.link.update.mock.calls[1][0].data.disabledAt).toBeNull();
    });

    it('update maps a missing link (P2025) to a 404', async () => {
      prisma.link.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('missing', { code: 'P2025', clientVersion: 't' }),
      );

      await expect(service.update('gone', { note: 'x' })).rejects.toThrow(NotFoundException);
    });

    it('remove maps a missing link (P2025) to a 404', async () => {
      prisma.link.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('missing', { code: 'P2025', clientVersion: 't' }),
      );

      await expect(service.remove('gone')).rejects.toThrow(NotFoundException);
    });
  });
});
