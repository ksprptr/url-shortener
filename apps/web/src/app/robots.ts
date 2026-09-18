import type { MetadataRoute } from 'next';

import { appServerConfig } from '@/configs/app/app.server-config';

/**
 * Robots — the landing page is public; the admin and the short links are not for crawlers.
 **/
export default function Robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin', '/login', '/logout'],
    },
    sitemap: `${appServerConfig.urls.appUrl}/sitemap.xml`,
  };
}
