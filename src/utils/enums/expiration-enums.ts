export const EXPIRATIONS = {
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  NEVER: 'NEVER',
} as const;

export type Expiration = keyof typeof EXPIRATIONS;
