'use client';

import { PropsWithChildren } from 'react';

/**
 * Component representing a layout
 */
export default function Layout({ children }: PropsWithChildren) {
  return <div className='mx-auto min-h-screen max-w-(--breakpoint-lg) px-4'>{children}</div>;
}
