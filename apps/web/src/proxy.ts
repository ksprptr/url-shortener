import { cookies } from 'next/headers';
import { NextRequest, NextResponse, type ProxyConfig } from 'next/server';

import {
  ACCESS_EXP_SKEW_MS,
  ACCESS_TOKEN_COOKIE,
  REFRESH_LOCK_COOKIE,
  REFRESH_LOCK_MAX_AGE_S,
  REFRESH_TOKEN_COOKIE,
  REFRESH_WAIT_INTERVAL_MS,
  REFRESH_WAIT_MAX_ATTEMPTS,
  SESSION_EXPIRED_REASON,
} from '@/common/constants/auth.constants';
import { peekRefresh, refreshSession } from '@/common/services/auth/refresh.server';
import {
  applyAuthCookies,
  clearAuthCookies,
  type CookieWriter,
  type ParsedSetCookie,
} from '@/common/services/auth/tokens.server';
import { isAccessTokenFresh } from '@/common/utils/jwt.functions';
import { isCrossSiteRequest, resolveRequestOrigin } from '@/common/utils/request-origin';
import { appServerConfig } from '@/configs/app/app.server-config';

/** Everything under here needs a session. The rest of the app (landing, redirects) is public. */
const PROTECTED_PREFIX = '/admin';

/** Signed-in visitors are bounced away from this one. */
const LOGIN_PATH = '/login';

/**
 * Applies the rotated session to this request's Cookie header so RSC reads the fresh token.
 **/
const withRefreshedCookies = (request: NextRequest, tokens: ParsedSetCookie[]): Headers => {
  const jar = new Map(request.cookies.getAll().map(({ name, value }) => [name, value]));
  jar.delete(REFRESH_LOCK_COOKIE);

  for (const { name, value } of tokens) {
    jar.set(name, value);
  }

  const headers = new Headers(request.headers);
  headers.set('cookie', Array.from(jar, ([name, value]) => `${name}=${value}`).join('; '));

  return headers;
};

/**
 * Builds a redirect to the login page, optionally flagging an expired session.
 **/
// Clears through the cookie store rather than the response: once anything in this pass has written
// via `cookies()` — the refresh lock below does — Next emits only those writes and drops the ones
// made on the returned response, which would silently leave the dead cookies in place.
const redirectToLogin = (
  request: NextRequest,
  cookieStore: CookieWriter,
  sessionExpired: boolean,
): NextResponse => {
  const url = new URL(LOGIN_PATH, resolveRequestOrigin(request));
  if (sessionExpired) {
    url.searchParams.set('reason', SESSION_EXPIRED_REASON);
  }

  clearAuthCookies(cookieStore);

  return NextResponse.redirect(url);
};

/**
 * Waits for a concurrent in-flight refresh to land (polls the memo), or null on timeout.
 **/
const waitForRefresh = async (refreshToken: string): Promise<ParsedSetCookie[] | null> => {
  for (let attempt = 0; attempt < REFRESH_WAIT_MAX_ATTEMPTS; attempt += 1) {
    const state = peekRefresh(refreshToken);
    if (Array.isArray(state)) {
      return state;
    }

    // eslint-disable-next-line no-await-in-loop -- deliberate delay between poll attempts
    await new Promise((resolve) => setTimeout(resolve, REFRESH_WAIT_INTERVAL_MS));
  }

  return null;
};

/**
 * Auth gate for `/admin`: guards it and proactively refreshes the access token before render.
 **/
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Everything outside the admin and the login page is public (the landing page and the redirects).
  const isProtected = pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`);
  if (!isProtected && pathname !== LOGIN_PATH) {
    return NextResponse.next();
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const accessFresh = isAccessTokenFresh(accessToken, ACCESS_EXP_SKEW_MS);

  if (pathname === LOGIN_PATH) {
    // The admin bounces here when the API rejects a token that still looks fresh; sending it back
    // on `accessFresh` would loop, so the flag ends the session here instead. A render cannot write
    // cookies, which is why the dead pair is cleared on this leg rather than by the page itself.
    if (request.nextUrl.searchParams.get('reason') === SESSION_EXPIRED_REASON) {
      // Same-site only: a forced cross-site navigation must not be able to sign the operator out.
      if (!isCrossSiteRequest(request)) {
        clearAuthCookies(cookieStore);
      }

      return NextResponse.next();
    }

    return accessFresh
      ? NextResponse.redirect(new URL(PROTECTED_PREFIX, resolveRequestOrigin(request)))
      : NextResponse.next();
  }

  if (!refreshToken) {
    return redirectToLogin(request, cookieStore, false);
  }

  if (accessFresh) {
    return NextResponse.next();
  }

  // A lock cookie means a refresh is already underway on this instance; wait for it.
  const lockActive = Boolean(cookieStore.get(REFRESH_LOCK_COOKIE)?.value);

  if (lockActive && peekRefresh(refreshToken) === null) {
    const waited = await waitForRefresh(refreshToken);
    if (waited) {
      applyAuthCookies(cookieStore, waited);
      return NextResponse.next({ request: { headers: withRefreshedCookies(request, waited) } });
    }
    // Timed out → the lock is likely stale (crashed refresh); refresh ourselves.
  }

  cookieStore.set(REFRESH_LOCK_COOKIE, '1', {
    httpOnly: true,
    secure: appServerConfig.nodeEnv.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_LOCK_MAX_AGE_S,
  });

  try {
    const tokens = await refreshSession({ refreshToken });

    applyAuthCookies(cookieStore, tokens);
    cookieStore.delete(REFRESH_LOCK_COOKIE);

    return NextResponse.next({ request: { headers: withRefreshedCookies(request, tokens) } });
  } catch {
    return redirectToLogin(request, cookieStore, true);
  }
}

/** Skip Next internals, route handlers and static assets; the proxy runs on navigations only. */
export const config: ProxyConfig = {
  matcher: '/((?!_next|api|.*\\..*).*)',
};
