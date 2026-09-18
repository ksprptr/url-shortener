import type { JwtService } from '@nestjs/jwt';

import { ACCESS_TOKEN_TTL_SECONDS } from '@/common/services/auth-tokens/auth-tokens.constants';
import type { JwtConfig } from '@/config/jwt.config';

import { AuthHelpers } from './auth.helpers';

describe('AuthHelpers', () => {
  const jwtCfg = { accessSecret: 'test-secret' } as JwtConfig;
  let signAsync: jest.Mock;
  let helpers: AuthHelpers;

  beforeEach(() => {
    signAsync = jest.fn().mockResolvedValue('signed-token');
    helpers = new AuthHelpers({ signAsync } as unknown as JwtService, jwtCfg);
  });

  describe('signAccessToken', () => {
    it('signs with HS256, the configured secret and the access TTL', async () => {
      const token = await helpers.signAccessToken({ sub: 'operator', ver: 3 });

      expect(token).toBe('signed-token');
      expect(signAsync).toHaveBeenCalledWith(
        { sub: 'operator', ver: 3 },
        { secret: 'test-secret', algorithm: 'HS256', expiresIn: ACCESS_TOKEN_TTL_SECONDS },
      );
    });
  });

  describe('generateRefreshSecret', () => {
    it('returns a URL-safe base64url string', () => {
      expect(helpers.generateRefreshSecret()).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('never repeats (48 random bytes)', () => {
      const secrets = new Set(Array.from({ length: 200 }, () => helpers.generateRefreshSecret()));

      expect(secrets.size).toBe(200);
    });
  });

  describe('hashToken', () => {
    it('is a deterministic 64-char hex SHA-256', () => {
      const hash = helpers.hashToken('secret');

      expect(hash).toMatch(/^[0-9a-f]{64}$/);
      expect(helpers.hashToken('secret')).toBe(hash);
    });

    it('never returns the input verbatim', () => {
      expect(helpers.hashToken('secret')).not.toBe('secret');
    });

    it('differs for different inputs', () => {
      expect(helpers.hashToken('a')).not.toBe(helpers.hashToken('b'));
    });
  });
});
