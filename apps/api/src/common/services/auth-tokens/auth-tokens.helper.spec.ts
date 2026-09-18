import type { Response } from 'express';

import type { AppConfig } from '@/config/app.config';
import type { AuthConfig } from '@/config/auth.config';

import { AuthTokensHelper } from './auth-tokens.helper';

describe('AuthTokensHelper', () => {
  let headers: Record<string, string | string[]>;
  let response: Response;

  const build = (isDevelopment: boolean, cookieDomain?: string) =>
    new AuthTokensHelper({ isDevelopment } as AppConfig, { cookieDomain } as AuthConfig);

  const setCookies = (): string[] => {
    const value = headers['Set-Cookie'];
    return Array.isArray(value) ? value : [value as string];
  };

  beforeEach(() => {
    headers = {};
    response = {
      getHeader: (name: string) => headers[name],
      setHeader: (name: string, value: string | string[]) => {
        headers[name] = value;
      },
    } as unknown as Response;
  });

  it('sets an httpOnly, lax, path=/ cookie', () => {
    build(false).addToResponse({ response, type: 'accessToken', value: 'a' });

    const [cookie] = setCookies();
    expect(cookie).toMatch(/^accessToken=a/);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Path=/');
  });

  it('marks the cookie Secure outside development', () => {
    build(false).addToResponse({ response, type: 'accessToken', value: 'a' });

    expect(setCookies()[0]).toContain('Secure');
  });

  it('omits Secure in development (so local http works)', () => {
    build(true).addToResponse({ response, type: 'accessToken', value: 'a' });

    expect(setCookies()[0]).not.toContain('Secure');
  });

  it('clears a cookie with Max-Age=0 when the value is empty', () => {
    build(false).addToResponse({ response, type: 'refreshToken', value: '' });

    expect(setCookies()[0]).toMatch(/Max-Age=0/);
  });

  it('includes the cookie domain only when configured', () => {
    build(false, '.example.com').addToResponse({ response, type: 'accessToken', value: 'a' });
    expect(setCookies()[0]).toContain('Domain=.example.com');

    headers = {};
    build(false).addToResponse({ response, type: 'accessToken', value: 'a' });
    expect(setCookies()[0]).not.toContain('Domain=');
  });

  it('appends rather than overwrites when a Set-Cookie already exists', () => {
    const helper = build(false);
    helper.addToResponse({ response, type: 'accessToken', value: 'a' });
    helper.addToResponse({ response, type: 'refreshToken', value: 'r' });

    const cookies = setCookies();
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toMatch(/^accessToken=/);
    expect(cookies[1]).toMatch(/^refreshToken=/);
  });
});
