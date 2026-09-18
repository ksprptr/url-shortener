import type { Metadata } from 'next';

import NotFoundContent from '@/components/layouts/NotFoundContent';

// A matched route resolves its metadata before `notFound()` throws, so this segment needs its own.
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

/**
 * 404 for an unknown slug.
 **/
export default function SlugNotFound() {
  return <NotFoundContent />;
}
