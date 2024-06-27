import { ExpirationType } from '@/utils/enums/expiration-enums';

export interface Option {
  label: string;
  value: string | number;
}

export interface ShortenUrlFormValues {
  originUrl: string;
  expiration: ExpirationType;
}
