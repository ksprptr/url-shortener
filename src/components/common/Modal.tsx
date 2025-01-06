import { ExtendedProps } from '@/utils/types/global-types';

/**
 * Component representing a modal
 */
export default function Modal({ children, ref }: ExtendedProps) {
  return (
    <div className='h-screen w-screen z-50 bg-black bg-opacity-50 rounded-lg flex flex-col justify-center items-center fixed'>
      <div {...(ref ? { ref: ref } : {})}>{children}</div>
    </div>
  );
}
