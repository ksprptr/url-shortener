import { UnauthorizedException } from '@nestjs/common';

import type { AuthConfig } from '@/config/auth.config';
import type { PrismaService } from '@/prisma/prisma.service';

import { AuthService } from './auth.service';
import type { AuthStateService } from './auth-state.service';
import type { AuthHelpers } from './helpers/auth.helpers';

describe('AuthService', () => {
  let service: AuthService;
  let authHelpers: {
    signAccessToken: jest.Mock;
    generateRefreshSecret: jest.Mock;
    hashToken: jest.Mock;
  };
  let authState: { getTokenVersion: jest.Mock; bumpTokenVersion: jest.Mock };
  let prisma: {
    $transaction: jest.Mock;
    refreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  // Bcrypt hash of 'secret' at cost 4 — the service only compares; a low cost keeps the spec fast.
  const authCfg = {
    passwordHash: '$2b$04$SQSBRPZls1QCHOVEbynEUuSwADMFuJ2aUDal2rHHoGLm/pTtXah46',
    cookieDomain: undefined,
  } as AuthConfig;

  const liveRow = (over: Record<string, unknown> = {}) => ({
    id: 'row-1',
    tokenHash: 'hashed',
    subject: 'operator',
    revokedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
    sessionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ...over,
  });

  beforeEach(() => {
    authHelpers = {
      signAccessToken: jest.fn().mockResolvedValue('access-token'),
      generateRefreshSecret: jest.fn().mockReturnValue('raw-secret'),
      hashToken: jest.fn((t: string) => `hash(${t})`),
    };
    authState = {
      getTokenVersion: jest.fn().mockResolvedValue(0),
      bumpTokenVersion: jest.fn().mockResolvedValue(undefined),
    };
    prisma = {
      $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(prisma)),
      refreshToken: {
        create: jest.fn().mockResolvedValue({ id: 'new-row' }),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    service = new AuthService(
      authCfg,
      authHelpers as unknown as AuthHelpers,
      authState as unknown as AuthStateService,
      prisma as unknown as PrismaService,
    );
  });

  describe('login', () => {
    it('rejects a wrong password', async () => {
      await expect(service.login({ password: 'wrong' })).rejects.toThrow(UnauthorizedException);
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });

    it('issues a session for the correct password', async () => {
      const result = await service.login({ password: 'secret' });

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'raw-secret' });
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshTokens', () => {
    it('rejects a missing token', async () => {
      await expect(service.refreshTokens(null)).rejects.toThrow('Missing refresh token.');
    });

    it('rejects an unknown token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('nope')).rejects.toThrow('Invalid refresh token.');
    });

    it('rotates a valid token: revokes the old row and links it to the new one', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(liveRow());

      const result = await service.refreshTokens('raw');

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'raw-secret' });
      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'row-1' },
          data: expect.objectContaining({ replacedByTokenId: 'new-row' }),
        }),
      );
    });

    it('treats replay of an already-revoked token as theft: revokes all + no rotation', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(liveRow({ revokedAt: new Date() }));

      await expect(service.refreshTokens('stolen')).rejects.toThrow('reuse detected');
      expect(authState.bumpTokenVersion).toHaveBeenCalled();
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { subject: 'operator', revokedAt: null } }),
      );
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });

    it('rejects a token past its idle window', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(
        liveRow({ expiresAt: new Date(Date.now() - 1000) }),
      );

      await expect(service.refreshTokens('idle')).rejects.toThrow('expired');
    });

    it('rejects a token past its absolute session cap', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(
        liveRow({ sessionExpiresAt: new Date(Date.now() - 1000) }),
      );

      await expect(service.refreshTokens('capped')).rejects.toThrow('expired');
    });

    it('a rotated session inherits the original absolute deadline', async () => {
      const sessionExpiresAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      prisma.refreshToken.findUnique.mockResolvedValue(liveRow({ sessionExpiresAt }));

      await service.refreshTokens('raw');

      expect(prisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ sessionExpiresAt }) }),
      );
    });
  });

  describe('logout', () => {
    it('is a no-op for a missing token', async () => {
      await service.logout(null);

      expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
      expect(authState.bumpTokenVersion).not.toHaveBeenCalled();
    });

    it('revokes the row and bumps the version when a live token is presented', async () => {
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      await service.logout('raw');

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { tokenHash: 'hash(raw)', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
      expect(authState.bumpTokenVersion).toHaveBeenCalled();
    });

    it('does not bump the version when nothing was revoked (unknown token)', async () => {
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 0 });

      await service.logout('unknown');

      expect(authState.bumpTokenVersion).not.toHaveBeenCalled();
    });
  });
});
