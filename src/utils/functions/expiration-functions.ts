import { Expiration, EXPIRATIONS } from '@/utils/enums/expiration-enums';

/**
 * Funciton to get the expiration date based on the expiration enum
 */
export const getExpirationDate = (expiration: Expiration): Date | null => {
  const date = new Date();

  switch (expiration) {
    case EXPIRATIONS.DAY:
      date.setDate(date.getDate() + 1);
      break;
    case EXPIRATIONS.WEEK:
      date.setDate(date.getDate() + 7);
      break;
    case EXPIRATIONS.MONTH:
      date.setMonth(date.getMonth() + 1);
      break;
    case EXPIRATIONS.NEVER:
      return null;
    default:
      return null;
  }

  return date;
};
