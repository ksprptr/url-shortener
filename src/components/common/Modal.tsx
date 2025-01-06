import { PropsWithChildren } from 'react';

/**
 * Component representing a modal
 */
export default function Modal({ children }: PropsWithChildren) {
  return (
    <div className='h-screen w-screen z-50 bg-black bg-opacity-50 flex flex-col justify-center items-center fixed px-4'>
      {children}
    </div>
  );
}
