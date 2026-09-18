import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { JsonWebTokenError, type JwtService, TokenExpiredError } from '@nestjs/jwt';
import type { Request } from 'express';

import type { JwtConfig } from '@/config/jwt.config';

import type { AuthStateService } from '../auth-state.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let jwtService: { verifyAsync: jest.Mock };
  let authState: { getTokenVersion: jest.Mock };

  const contextWith = (cookie?: string): ExecutionContext => {
    const request = { headers: { cookie } } as Request;
    return {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };
    jwtService = { verifyAsync: jest.fn() };
    authState = { getTokenVersion: jest.fn().mockResolvedValue(0) };
    guard = new AuthGuard(
      reflector as unknown as Reflector,
      jwtService as unknown as JwtService,
      { accessSecret: 'secret' } as JwtConfig,
      authState as unknown as AuthStateService,
    );
  });

  it('lets a @Public() route through without a token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(contextWith())).resolves.toBe(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects a request with no access token', async () => {
    await expect(guard.canActivate(contextWith())).rejects.toThrow(UnauthorizedException);
  });

  it('accepts a valid token whose version matches and sets request.user', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'operator', ver: 0, iat: 1, exp: 2 });
    const context = contextWith('accessToken=valid');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    const request = context.switchToHttp().getRequest<Request>();
    expect(request.user).toEqual({ sub: 'operator' });
  });

  it('rejects a signature-valid token whose version is stale (post-logout revocation)', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'operator', ver: 0, iat: 1, exp: 2 });
    authState.getTokenVersion.mockResolvedValue(1);

    await expect(guard.canActivate(contextWith('accessToken=stale'))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects an expired token (verify throws TokenExpiredError → null)', async () => {
    jwtService.verifyAsync.mockRejectedValue(new TokenExpiredError('jwt expired', new Date()));

    await expect(guard.canActivate(contextWith('accessToken=expired'))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a malformed/forged token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new JsonWebTokenError('invalid signature'));

    await expect(guard.canActivate(contextWith('accessToken=forged'))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('does not check the token version until the signature is valid', async () => {
    await guard.canActivate(contextWith()).catch(() => undefined);

    expect(authState.getTokenVersion).not.toHaveBeenCalled();
  });
});
