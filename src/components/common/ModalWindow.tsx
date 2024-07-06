import React, { PropsWithChildren } from 'react';

/**
 * Component representing a modal window
 */
export default function ModalWindow({ children }: PropsWithChildren) {
  return (
    <div className='h-screen w-screen z-50 bg-black bg-opacity-50 rounded-lg flex flex-col justify-center items-center fixed'>
      <div>{children}</div>
    </div>
  );
}
