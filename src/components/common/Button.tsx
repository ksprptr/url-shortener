'use client';

import { ExtendedProps } from '@/utils/types/global.types';

// Props interface
interface Props extends ExtendedProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'danger' | 'success';
  disabled?: boolean;
  fullWidth?: boolean;
  fullRounded?: boolean;
  onClick?: () => void;
}

/**
 * Component representing a button
 */
export default function Button({
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  fullRounded = false,
  onClick,
  children,
  className,
}: Props) {
  // Function to get the button variant styles
  const getVariant = () => {
    switch (variant) {
      case 'primary':
        return 'text-purple-800 bg-purple-600/15 hover:bg-purple-600/20 disabled:hover:bg-purple-600/15';
      case 'danger':
        return 'text-red-800 bg-red-600/15 hover:bg-red-600/20 disabled:hover:bg-red-600/15';
      case 'success':
        return 'text-green-800 bg-green-600/15 hover:bg-green-600/20 disabled:bg-green-600/15';
      default:
        break;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`${getVariant()} ${fullWidth ? 'w-full' : ''} ${fullRounded ? 'rounded-full' : 'rounded-md'} px-4 py-2 font-medium duration-150 hover:cursor-pointer disabled:opacity-75 ${className}`}>
      {children}
    </button>
  );
}
