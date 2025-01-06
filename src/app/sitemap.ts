import { MetadataRoute } from 'next';

/**
 * Function to generate a sitemap.xml file
 */
export default function Sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://url.ksprptr.dev',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
