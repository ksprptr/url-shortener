export const EXPIRATIONS = {
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  NEVER: 'NEVER',
};

export type ExpirationType = keyof typeof EXPIRATIONS;
