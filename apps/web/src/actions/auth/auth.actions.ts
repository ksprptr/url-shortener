'use server';

import { isAxiosError } from 'axios';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  applyAuthCookies,
  clearAuthCookies,
  parseAuthSetCookies,
  type ParsedSetCookie,
} from '@/common/services/auth/tokens.server';
import { getHttp } from '@/common/services/axios/axios.instance';
import { extractApiError } from '@/common/utils/action.functions';

/** Outcome of a sign-in attempt. */
export interface LoginResult {
  ok: boolean;
  error?: string;
}

/**
 * Signs the operator in and writes the returned auth cookies to the browser.
 **/
export async function login(password: string): Promise<LoginResult> {
  try {
    const http = await getHttp();
    const response = await http.post('/auth/login', { password });

    const setCookieHeader = response.headers['set-cookie'];
    const setCookies = parseAuthSetCookies(
      Array.isArray(setCookieHeader) ? setCookieHeader : undefined,
    );

    if (setCookies.length === 0) {
      return { ok: false, error: 'Login failed.' };
    }

    applyAuthCookies(await cookies(), setCookies);

    return { ok: true };
  } catch (error) {
    // HTTP response = rejected (bad credentials); no response = API unreachable.
    if (isAxiosError(error) && error.response) {
      return { ok: false, error: extractApiError(error) ?? 'Invalid password.' };
    }

    return { ok: false, error: 'The API is currently unavailable.' };
  }
}

/**
 * Revokes the session at the API, clears the auth cookies and returns to the login page.
 **/
// An action rather than a GET route: Next prefetches `<Link>` targets in production builds, so a
// linked sign-out URL is followed the moment the header renders — signing the operator straight
// back out. A POST is never prefetched, and Server Actions carry their own origin check.
export async function logout(): Promise<never> {
  const cookieStore = await cookies();
  let cleared: ParsedSetCookie[] = [];

  try {
    const http = await getHttp();
    const { headers } = await http.post('/auth/logout');

    // The API's own clearing cookies carry the Domain it set them with — forwarding them is what makes the delete land.
    cleared = parseAuthSetCookies(
      Array.isArray(headers['set-cookie']) ? headers['set-cookie'] : undefined,
    );
  } catch {
    // Unreachable API — the session stays alive server-side, but clear locally below regardless.
  }

  if (cleared.length > 0) {
    applyAuthCookies(cookieStore, cleared);
  } else {
    clearAuthCookies(cookieStore);
  }

  // Outside the try: `redirect` reports through a thrown error the catch above must not swallow.
  redirect('/login');
}
