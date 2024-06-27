'use server';

import prisma from '@/utils/prisma/prisma-client';
import { ShortenedUrl } from '@prisma/client';
import { ExpirationType } from '@/utils/enums/expiration-enums';
import { ShortenUrlFormValues } from '@/utils/types/form-types';

/**
 * Funciton to get the expiration date based on the expiration enum
 */
const getExpirationDate = (expiration: ExpirationType): Date | null => {
  const date = new Date();
  switch (expiration) {
    case 'DAY':
      date.setDate(date.getDate() + 1);
      break;
    case 'WEEK':
      date.setDate(date.getDate() + 7);
      break;
    case 'MONTH':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'NEVER':
      return null;
      break;
    default:
      date.setFullYear(date.getFullYear() + 100);
      break;
  }

  return date;
};

/**
 * Function to generate a random ID
 */
async function generateId(length: number) {
  let generatedId = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    const randomInd = Math.floor(Math.random() * characters.length);
    generatedId += characters.charAt(randomInd);
  }

  const idAlreadyExists = await prisma.shortenedUrl.findUnique({
    where: {
      id: generatedId,
    },
  });

  if (idAlreadyExists) {
    return generateId(length);
  }

  return generatedId;
}

/**
 * Function to shorten an URL
 */
export async function shortenUrl(shortenUrlForm: ShortenUrlFormValues): Promise<ShortenedUrl> {
  const id = await generateId(6);
  const expirationDate = getExpirationDate(shortenUrlForm.expiration);

  const shortenedUrl = await prisma.shortenedUrl.create({
    data: {
      id,
      originUrl: shortenUrlForm.originUrl,
      expirationDate,
    },
  });

  return shortenedUrl;
}
