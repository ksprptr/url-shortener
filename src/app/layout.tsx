import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Footer from '@/components/layouts/Footer';
import Layout from '@/components/layouts/Layout';

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
    url: 'https://shortener.kasparpetr.com/',
    siteName: 'URL Shortnener',
    description:
      "Simple free-to-use URL shortener that doesn't store any user data and offers a link expiration date.",
    images: [
      {
        url: 'https://shortener.kasparpetr.com/assets/og_image.png',
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
        url: 'https://shortener.kasparpetr.com/assets/og_image.png',
        width: 1200,
        height: 630,
        alt: 'URL Shortener',
      },
    ],
    site: '@urlshortener',
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`bg-zinc-50 ${inter.className}`}>
        <Layout>{children}</Layout>
        <Footer />
      </body>
    </html>
  );
}
