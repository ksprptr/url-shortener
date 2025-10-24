'use server';

import http from '@/utils/http.client';
import { ShortenedUrlFormValues } from '@/utils/types/form.types';

/**
 * Function to shorten a URL by sending a POST request to the api
 */
export const shortenUrl = async (values: ShortenedUrlFormValues, expirationDate: Date | null) => {
  try {
    const res = await http.post('/shortened-urls', {
      originUrl: values.originUrl,
      ...(expirationDate && { expirationDate: expirationDate.toISOString() }),
    });

    return { status: res.status, data: res.data };
  } catch (error) {
    console.error('Error shortening URL:', error);

    return { status: 500, data: null };
  }
};
