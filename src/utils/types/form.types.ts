import { Expiration } from '@/utils/enums/expiration.enums';

export interface Option {
  label: string;
  value: string | number;
}

export interface ShortenedUrlFormValues {
  originUrl: string;
  expirationDate: Expiration;
}
