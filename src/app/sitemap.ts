import { MetadataRoute } from 'next';

/**
 * Function to generate a sitemap.xml file
 */
export default function Sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://shortener.ksprptr.dev',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://link.ksprptr.dev',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
