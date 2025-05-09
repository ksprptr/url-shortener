import { MetadataRoute } from 'next';

/**
 * Function to generate a manifest file
 */
export default function Manifest(): MetadataRoute.Manifest {
  return {
    name: 'URL Shortener',
    short_name: 'URL Shortener',
    description:
      'A simple, free-to-use URL shortener that respects user privacy by storing no personal data and supports link expiration.',
    start_url: '/',
    display: 'browser',
    background_color: '#fafafa',
    theme_color: '#fafafa',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
