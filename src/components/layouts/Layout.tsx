'use client';

import React, { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Component representing a layout
 */
export default function Layout({ children }: PropsWithChildren) {
  const pathName = usePathname();

  return (
    <div
      className={`${pathName === '/' ? 'max-w-screen-xl' : 'max-w-screen-lg'} mx-auto px-4 min-h-screen`}>
      {children}
    </div>
  );
}
