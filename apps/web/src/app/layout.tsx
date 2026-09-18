import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import type { PropsWithChildren } from 'react';

import ThemeProvider from '@/components/providers/ThemeProvider';
import ToastProvider from '@/components/providers/ToastProvider';
import { appServerConfig } from '@/configs/app/app.server-config';
import { metadataConfig } from '@/configs/seo/metadata.config';

import './globals.css';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

const siteTitle = `${metadataConfig.title} · ${metadataConfig.tagline}`;

/** Relative to `metadataBase`, so the absolute URLs are derived from `APP_URL`. */
const images = [{ url: '/api/og', width: 1200, height: 630, alt: siteTitle }];

// Security: `APP_URL` is the only origin source — trusting `x-forwarded-host` is a cache-poisoning hole.
export const metadata: Metadata = {
  metadataBase: new URL(appServerConfig.urls.appUrl),
  title: {
    default: siteTitle,
    template: `${metadataConfig.title} · %s`,
  },
  description: metadataConfig.description,
  applicationName: metadataConfig.title,
  keywords: metadataConfig.keywords,
  authors: [{ name: metadataConfig.author.name, url: metadataConfig.author.url }],
  creator: metadataConfig.author.name,
  publisher: metadataConfig.author.name,
  category: 'technology',
  appleWebApp: { title: metadataConfig.shortTitle },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    title: siteTitle,
    description: metadataConfig.description,
    type: 'website',
    url: appServerConfig.urls.appUrl,
    siteName: metadataConfig.shortTitle,
    locale: 'en_US',
    images,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: metadataConfig.description,
    images,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: metadataConfig.colors.background },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

/**
 * The JavaScript-off screen, as raw markup.
 **/
// Injected, not rendered: React warns about a `<style>` element on a client render (an unmatched 404).
const NOSCRIPT_HTML = `
  <style>
    noscript { display: block; }
    .app-shell { display: none !important; }
    body { background: var(--color-zinc-50); }
    @media (prefers-color-scheme: dark) { body { background: var(--color-zinc-950); } }
  </style>
  <div class="noscript-screen">
    <p class="noscript-eyebrow">JavaScript required</p>
    <h1 class="noscript-title">This app needs JavaScript</h1>
    <p class="noscript-text">
      Shortening a link and managing the ones you already have both happen through the browser, so
      neither works with JavaScript turned off. Enable it for this site and reload the page.
      Following an existing short link keeps working either way.
    </p>
  </div>
`;

/**
 * Root layout: font, theme + toast providers and the JavaScript-off screen.
 **/
export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html
      lang='en'
      // Opts route transitions out of the `scroll-smooth` that globals.css sets on every element.
      data-scroll-behavior='smooth'
      suppressHydrationWarning>
      <body
        className={`${poppins.className} relative min-h-screen overflow-x-hidden bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50`}
        // Extensions (ColorZilla, Grammarly, …) stamp attributes on `body` before React hydrates.
        suppressHydrationWarning>
        <div className='app-shell'>
          <ThemeProvider>
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </div>

        <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_HTML }} />
      </body>
    </html>
  );
}
