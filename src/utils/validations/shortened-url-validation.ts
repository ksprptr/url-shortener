import * as Yup from 'yup';
import { EXPIRATIONS } from '@/utils/enums/expiration-enums';

export const shortenedUrlValidationSchema = Yup.object({
  originUrl: Yup.string().url('Invalid URL.').required('Original URL is required.'),
  expirationDate: Yup.string().oneOf(Object.keys(EXPIRATIONS)).nullable().notRequired(),
});
