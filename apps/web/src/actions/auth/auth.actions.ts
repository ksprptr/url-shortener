'use server';

import { isAxiosError } from 'axios';
import { cookies } from 'next/headers';

import { applyAuthCookies, parseAuthSetCookies } from '@/common/services/auth/tokens.server';
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
