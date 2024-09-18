import { MetadataRoute } from 'next';

/**
 * Function to generate a robots.txt file
 */
export default function Robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://shortener.ksprptr.dev/sitemap.xml',
    host: 'https://shortener.ksprptr.dev',
  };
}
