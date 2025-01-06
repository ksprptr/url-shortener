'use client';

import { PropsWithChildren } from 'react';

/**
 * Component representing a layout
 */
export default function Layout({ children }: PropsWithChildren) {
  return <div className='max-w-screen-lg mx-auto px-4 min-h-screen'>{children}</div>;
}
