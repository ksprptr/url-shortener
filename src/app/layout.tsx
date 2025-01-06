import './globals.css';

import Provider from '@/components/layouts/Provider';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

// Load Inter font
const inter = Inter({ subsets: ['latin'] });

// Metadata for the web
export const metadata: Metadata = {
  title: 'URL Shortnener',
  description:
    "Simple free-to-use URL shortener that doesn't store any user data and offers a link expiration date.",
  openGraph: {
    title: 'URL Shortnener',
    type: 'website',
    url: 'https://url.ksprptr.dev/',
    siteName: 'URL Shortnener',
    description:
      "Simple free-to-use URL shortener that doesn't store any user data and offers a link expiration date.",
    images: [
      {
        url: 'https://url.ksprptr.dev/assets/og_image.png',
        width: 1200,
        height: 630,
        alt: 'URL Shortener',
      },
    ],
  },
  twitter: {
    title: 'URL Shortnener',
    description:
      "Simple free-to-use URL shortener that doesn't store any user data and offers a link expiration date.",
    images: [
      {
        url: 'https://url.ksprptr.dev/assets/og_image.png',
        width: 1200,
        height: 630,
        alt: 'URL Shortener',
      },
    ],
    site: '@urlshortener',
    card: 'summary_large_image',
  },
};

/**
 * Component representing the root layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`bg-zinc-50 ${inter.className}`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
