import type { MetadataRoute } from 'next';

import { metadataConfig } from '@/configs/seo/metadata.config';

/**
 * Web app manifest; every icon is generated from the logo config by `pnpm run icons`.
 **/
export default function Manifest(): MetadataRoute.Manifest {
  return {
    name: `${metadataConfig.title} · ${metadataConfig.tagline}`,
    short_name: metadataConfig.shortTitle,
    description: metadataConfig.description,
    start_url: '/',
    // `browser`, not `standalone`: opts out of the install prompt while keeping name/theme/icons.
    display: 'browser',
    background_color: metadataConfig.colors.background,
    theme_color: metadataConfig.colors.theme,
    icons: [
      // Full-bleed squares: the platform crops them to its own shape.
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      // Shown as-is, so this one keeps the rounded tile.
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
