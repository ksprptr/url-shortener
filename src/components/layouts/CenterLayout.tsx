import { PropsWithChildren } from 'react';

/**
 * Component representing a center layout
 */
export default function CenterLayout({ children }: PropsWithChildren) {
  return <div className='px-4 flex flex-col h-screen justify-center items-center'>{children}</div>;
}
