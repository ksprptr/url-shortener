'use client';

import { getVariant } from '@/utils/functions/button-functions';
import { ExtendedProps } from '@/utils/types/global-types';

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
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`${getVariant(variant)} ${fullWidth ? 'w-full' : ''} ${fullRounded ? 'rounded-full' : 'rounded-md'} py-2 px-4 font-medium select-none duration-150 disabled:opacity-75 ${className}`}>
      {children}
    </button>
  );
}
