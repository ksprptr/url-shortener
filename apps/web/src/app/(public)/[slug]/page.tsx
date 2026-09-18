import { isAxiosError } from 'axios';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { resolveLink } from '@/common/services/api/links.api';
import LinkGone from '@/components/layouts/LinkGone';

interface Props {
  params: Promise<{ slug: string }>;
}

/** The lookup counts the visit, so this route can never be cached or prerendered. */
export const dynamic = 'force-dynamic';

// Only seen when the redirect does NOT happen; the unknown-slug case has its own not-found.tsx.
export const metadata: Metadata = {
  title: 'Link unavailable',
  robots: { index: false, follow: false },
};

type Outcome =
  | { kind: 'redirect'; targetUrl: string }
  | { kind: 'gone'; reason: 'expired' | 'disabled' }
  | { kind: 'missing' }
  | { kind: 'unavailable' };

/**
 * Asks the API where this slug points, mapping its failures onto what the visitor should see.
 **/
const resolveOutcome = async (slug: string): Promise<Outcome> => {
  try {
    const { targetUrl } = await resolveLink(slug);

    return { kind: 'redirect', targetUrl };
  } catch (error) {
    if (!isAxiosError(error) || !error.response) {
      return { kind: 'unavailable' };
    }

    if (error.response.status === 404) {
      return { kind: 'missing' };
    }

    if (error.response.status === 410) {
      const message = String(
        (error.response.data as { message?: string } | undefined)?.message ?? '',
      );

      return { kind: 'gone', reason: message.includes('disabled') ? 'disabled' : 'expired' };
    }

    return { kind: 'unavailable' };
  }
};

/**
 * Follows a short link: resolves the slug server-side and sends the browser on.
 **/
export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const outcome = await resolveOutcome(slug);

  // `redirect` throws, so it has to run outside the try/catch that classified the failure.
  if (outcome.kind === 'redirect') {
    redirect(outcome.targetUrl);
  }

  if (outcome.kind === 'missing') {
    notFound();
  }

  return <LinkGone reason={outcome.kind === 'gone' ? outcome.reason : 'unavailable'} />;
}
