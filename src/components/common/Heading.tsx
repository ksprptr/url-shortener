'use client';

import { ExtendedProps } from '@/utils/types/global-types';

// Props interface
interface Props extends ExtendedProps {
  size: 'xsm' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * Component representing a heading
 */
export default function Heading({ size = 'md', className, children }: Props) {
  const getSize = () => {
    switch (size) {
      case 'xsm':
        return '3xl:text-2xl lg:text-xl md:text-lg text-base';
      case 'sm':
        return '3xl:text-4xl lg:text-3xl text-2xl';
      case 'md':
        return '3xl:text-5xl lg:text-4xl md:text-3xl text-2xl';
      case 'lg':
        return '3xl:text-6xl lg:text-5xl md:text-4xl text-3xl';
      case 'xl':
        return '3xl:text-7xl lg:text-6xl md:text-5xl text-4xl';
      case '2xl':
        return '3xl:text-9xl lg:text-8xl md:text-7xl sm:text-6xl text-5xl';
      default:
        return '';
    }
  };

  return (
    <div
      className={`${getSize()} bg-linear-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent leading-normal! ${className}`}>
      {children}
    </div>
  );
}
