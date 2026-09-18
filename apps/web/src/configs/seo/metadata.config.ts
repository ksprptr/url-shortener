import { appConfig } from '@/configs/app/app.config';
import { authorConfig } from '@/configs/author.config';

interface MetadataConfig {
  title: string;
  shortTitle: string;
  /** Appended to the site title (homepage + link previews). */
  tagline: string;
  /** The line the hero renders — one source, so the page and the link preview cannot drift. */
  subtitle: string;
  description: string;
  keywords: string[];
  author: {
    name: string;
    url: string;
  };
  colors: {
    background: string;
    theme: string;
  };
}

// Site metadata for the layout, manifest, robots, sitemap and the OG image.
export const metadataConfig: MetadataConfig = {
  title: appConfig.name,
  shortTitle: appConfig.name,
  tagline: 'Short links that expire when you say so',
  subtitle: 'Short links that expire when you say so.',
  description:
    'A fast, privacy-friendly URL shortener. Pick how long a link lives — an hour, a week, forever — and share it. No accounts, no tracking, nothing about the visitor is stored.',
  keywords: [
    'url shortener',
    'link shortener',
    'short links',
    'short url',
    'expiring links',
    'temporary links',
    'link expiration',
    'privacy friendly',
    'no tracking',
    'self-hosted',
    'open source',
  ],
  author: authorConfig,
  colors: {
    background: '#fafafa',
    theme: '#0891b2',
  },
};
