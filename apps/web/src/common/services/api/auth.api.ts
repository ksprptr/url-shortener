import 'server-only';
import type { AuthUser } from '@url-shortener/types';

import { getHttp } from '@/common/services/axios/axios.instance';

// Server-side auth API — reached via getHttp(), never from the browser.

/**
 * Fetches the currently authenticated operator.
 **/
export const getMe = async (): Promise<AuthUser> => {
  const http = await getHttp();
  const { data } = await http.get<AuthUser>('/auth/me');

  return data;
};
