import { Expiration, EXPIRATIONS } from '@/utils/enums/expiration-enums';

/**
 * Function to get the expiration date based on the expiration enum
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

/**
 * Function to format the expiration date
 */
export const formatExpirationDate = (expiration: Expiration): string => {
  switch (expiration) {
    case EXPIRATIONS.DAY:
      return '1 Day';
    case EXPIRATIONS.WEEK:
      return '1 Week';
    case EXPIRATIONS.MONTH:
      return '1 Month';
    case EXPIRATIONS.NEVER:
      return 'Never';
    default:
      return 'Unknown';
  }
};
