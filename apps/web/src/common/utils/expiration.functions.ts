import type { Expiration } from '@url-shortener/types';

interface ExpirationOption {
  value: Expiration;
  label: string;
}

/** What the public form offers, in the order it shows them. */
export const EXPIRATION_OPTIONS: ExpirationOption[] = [
  { value: 'HOUR', label: '1 hour' },
  { value: 'DAY', label: '1 day' },
  { value: 'WEEK', label: '1 week' },
  { value: 'MONTH', label: '1 month' },
  { value: 'YEAR', label: '1 year' },
  { value: 'NEVER', label: 'Never' },
];

export const DEFAULT_EXPIRATION: Expiration = 'DAY';
