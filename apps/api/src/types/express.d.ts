import type { RequestUser } from '@/common/types/auth-user.types';

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export {};
