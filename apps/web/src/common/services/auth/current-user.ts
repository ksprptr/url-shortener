import 'server-only';
import type { AuthUser } from '@url-shortener/types';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { SESSION_EXPIRED_REASON } from '@/common/constants/auth.constants';
import { getMe } from '@/common/services/api/auth.api';

/**
 * Current operator (per-request cached); redirects to the login page when the session is gone.
 **/
export const getCurrentUser = cache(async (): Promise<AuthUser> => {
  try {
    return await getMe();
  } catch {
    // The proxy clears the dead cookies on that leg — a render cannot write them itself.
    redirect(`/login?reason=${SESSION_EXPIRED_REASON}`);
  }
});
