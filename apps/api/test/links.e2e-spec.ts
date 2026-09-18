import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { accessCookie } from './helpers/auth.helper';
import { createPrismaMock, linkRow, type PrismaMock } from './helpers/prisma.mock';
import { createTestApp } from './helpers/test-app.helper';

const API = '/api/v1';

describe('Links (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaMock;

  beforeAll(async () => {
    prisma = createPrismaMock();
    app = await createTestApp(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    prisma.link.findUnique.mockResolvedValue(null);
    prisma.link.count.mockResolvedValue(0);
  });

  describe('public shorten (POST /links)', () => {
    it('creates a link and returns an absolute short URL (201)', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/links`)
        .send({ targetUrl: 'example.com', expiration: 'DAY' })
        .expect(201);

      expect(res.body.shortUrl).toMatch(/^http:\/\/localhost:3000\/\w+$/);
      expect(res.body.targetUrl).toBe('https://example.com/');
    });

    it('rejects a javascript: target (400) — protocol allowlist through the pipe + service', async () => {
      await request(app.getHttpServer())
        .post(`${API}/links`)
        .send({ targetUrl: 'javascript:alert(1)', expiration: 'DAY' })
        .expect(400);
    });

    it('rejects a body missing required fields (400)', async () => {
      await request(app.getHttpServer()).post(`${API}/links`).send({}).expect(400);
    });

    it('rejects an unknown expiration value (400)', async () => {
      await request(app.getHttpServer())
        .post(`${API}/links`)
        .send({ targetUrl: 'https://x.com', expiration: 'DECADE' })
        .expect(400);
    });
  });

  describe('redirect lookup (POST /links/:slug/resolve)', () => {
    it('404s an unknown slug', async () => {
      await request(app.getHttpServer()).post(`${API}/links/nope/resolve`).expect(404);
    });

    it('returns the target and counts the visit for a live link (200)', async () => {
      prisma.link.findUnique.mockResolvedValue(linkRow());

      await request(app.getHttpServer())
        .post(`${API}/links/abc1234/resolve`)
        .expect(200, { targetUrl: 'https://example.com/' });

      expect(prisma.link.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ clickCount: { increment: 1 } }),
        }),
      );
    });

    it('410s a disabled link', async () => {
      prisma.link.findUnique.mockResolvedValue(linkRow({ disabledAt: new Date() }));

      await request(app.getHttpServer()).post(`${API}/links/abc1234/resolve`).expect(410);
    });

    it('410s an expired link', async () => {
      prisma.link.findUnique.mockResolvedValue(linkRow({ expiresAt: new Date(Date.now() - 1000) }));

      await request(app.getHttpServer()).post(`${API}/links/abc1234/resolve`).expect(410);
    });
  });

  describe('admin (behind the guard)', () => {
    it('lists links for an authenticated operator (200)', async () => {
      prisma.link.count.mockResolvedValue(1);
      prisma.link.findMany.mockResolvedValue([linkRow()]);

      const res = await request(app.getHttpServer())
        .get(`${API}/admin/links`)
        .set('Cookie', accessCookie())
        .expect(200);

      expect(res.body.total).toBe(1);
      expect(res.body.items[0].slug).toBe('abc1234');
    });

    it('creates a link, rejecting a reserved slug (409)', async () => {
      await request(app.getHttpServer())
        .post(`${API}/admin/links`)
        .set('Cookie', accessCookie())
        .send({ targetUrl: 'https://x.com', expiration: 'NEVER', slug: 'admin' })
        .expect(409);
    });
  });
});
