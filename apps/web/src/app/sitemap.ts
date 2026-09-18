import type { MetadataRoute } from 'next';

import { appServerConfig } from '@/configs/app/app.server-config';

/** Last meaningful content change — a build timestamp would claim one on every deploy. */
const LAST_MODIFIED = new Date('2026-09-17');

/**
 * Sitemap — the two indexable routes: the shortener and the logo page.
 **/
export default function Sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${appServerConfig.urls.appUrl}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${appServerConfig.urls.appUrl}/logo`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
