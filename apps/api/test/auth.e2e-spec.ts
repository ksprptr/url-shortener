import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { accessCookie } from './helpers/auth.helper';
import { createPrismaMock, type PrismaMock } from './helpers/prisma.mock';
import { createTestApp } from './helpers/test-app.helper';

const API = '/api/v1';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaMock;

  beforeAll(async () => {
    prisma = createPrismaMock();
    app = await createTestApp(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('the global AuthGuard is wired up', () => {
    it('rejects GET /auth/me without a token (401)', async () => {
      await request(app.getHttpServer()).get(`${API}/auth/me`).expect(401);
    });

    it('accepts GET /auth/me with a valid access cookie (200)', async () => {
      await request(app.getHttpServer())
        .get(`${API}/auth/me`)
        .set('Cookie', accessCookie())
        .expect(200, { authenticated: true });
    });

    it('rejects a token whose version is stale — logout revocation (401)', async () => {
      prisma.authState.findUnique.mockResolvedValueOnce({ tokenVersion: 5 });

      await request(app.getHttpServer())
        .get(`${API}/auth/me`)
        .set('Cookie', accessCookie({ ver: 0 }))
        .expect(401);
    });

    it('guards every admin route (401 without a token)', async () => {
      const server = app.getHttpServer();
      await request(server).get(`${API}/admin/links`).expect(401);
      await request(server).get(`${API}/admin/stats`).expect(401);
      await request(server).post(`${API}/admin/links`).send({}).expect(401);
    });
  });

  describe('login', () => {
    it('rejects a wrong password (401) and sets no cookie', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/auth/login`)
        .send({ password: 'wrong' })
        .expect(401);

      expect(res.headers['set-cookie']).toBeUndefined();
    });

    it('accepts the correct password and issues httpOnly cookies', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/auth/login`)
        .send({ password: 'test-password' })
        .expect(200);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c) => c.startsWith('accessToken='))).toBe(true);
      expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
      expect(cookies.every((c) => /HttpOnly/i.test(c))).toBe(true);
    });

    it('rejects a login body with an unexpected field (ValidationPipe whitelist)', async () => {
      await request(app.getHttpServer())
        .post(`${API}/auth/login`)
        .send({ password: 'test-password', role: 'admin' })
        .expect(400);
    });
  });
});
