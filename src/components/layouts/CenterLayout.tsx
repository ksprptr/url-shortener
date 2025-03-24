import { PropsWithChildren } from 'react';

/**
 * Component representing a center layout
 */
export default function CenterLayout({ children }: PropsWithChildren) {
  return <div className='flex h-screen flex-col items-center justify-center px-4'>{children}</div>;
}
