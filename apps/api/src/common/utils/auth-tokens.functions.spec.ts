import type { Request } from 'express';

import { extractTokenFromCookies } from './auth-tokens.functions';

const requestWith = (cookie?: string) => ({ headers: { cookie } }) as Request;

describe('extractTokenFromCookies', () => {
  it('reads the named token from the cookie header', () => {
    const request = requestWith('accessToken=abc; refreshToken=def');

    expect(extractTokenFromCookies({ type: 'accessToken', request })).toBe('abc');
    expect(extractTokenFromCookies({ type: 'refreshToken', request })).toBe('def');
  });

  it('returns undefined when the cookie header is absent', () => {
    expect(
      extractTokenFromCookies({ type: 'accessToken', request: requestWith() }),
    ).toBeUndefined();
  });

  it('returns undefined when the requested token is not among the cookies', () => {
    const request = requestWith('somethingElse=1');

    expect(extractTokenFromCookies({ type: 'accessToken', request })).toBeUndefined();
  });

  it('does not confuse one token for the other', () => {
    const request = requestWith('refreshToken=only-refresh');

    expect(extractTokenFromCookies({ type: 'accessToken', request })).toBeUndefined();
    expect(extractTokenFromCookies({ type: 'refreshToken', request })).toBe('only-refresh');
  });
});
