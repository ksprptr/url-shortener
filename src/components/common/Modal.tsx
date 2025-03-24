import { ExtendedProps } from '@/utils/types/global-types';

/**
 * Component representing a modal
 */
export default function Modal({ children, ref }: ExtendedProps) {
  return (
    <div className='fixed z-50 flex h-screen w-screen flex-col items-center justify-center rounded-lg bg-black/50'>
      <div {...(ref ? { ref: ref } : {})}>{children}</div>
    </div>
  );
}
