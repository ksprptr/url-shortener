import type { PropsWithChildren } from 'react';

import DecorativeBackground from '@/components/layouts/DecorativeBackground';
import FooterBadge from '@/components/layouts/FooterBadge';
import GitHubLink from '@/components/layouts/GitHubLink';

/**
 * Shell of the public pages: the drifting background, a centred column and the corner badges.
 **/
export default function PublicLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <>
      <DecorativeBackground />
      <main className='mx-auto w-full max-w-3xl px-4'>{children}</main>
      <FooterBadge />
      <GitHubLink />
    </>
  );
}
