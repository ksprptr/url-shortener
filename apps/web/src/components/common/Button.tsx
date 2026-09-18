'use client';

import type { ExtendedProps } from '@/common/types/global.types';
import LoadingIndicator from '@/components/loadings/LoadingIndicator';

interface Props extends ExtendedProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'normal' | 'danger' | 'soft-danger' | 'transparent';
  size?: 'sm' | 'md';
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  loading?: boolean;
  title?: string;
  ariaLabel?: string;
}

const VARIANTS: Record<NonNullable<Props['variant']>, string> = {
  primary:
    'bg-cyan-600 text-white shadow-sm shadow-cyan-600/25 hover:bg-cyan-700 disabled:bg-cyan-600',
  secondary:
    'bg-cyan-600/10 text-cyan-700 hover:bg-cyan-600/20 dark:bg-cyan-500/15 dark:text-cyan-300 dark:hover:bg-cyan-500/25',
  normal:
    'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800',
  danger: 'bg-red-500/90 text-white hover:bg-red-500',
  'soft-danger': 'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400',
  transparent:
    'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
};

const SIZES: Record<NonNullable<Props['size']>, string> = {
  sm: 'gap-x-1.5 rounded-lg px-2.5 py-1.5 text-xs',
  md: 'gap-x-2 rounded-xl px-4 py-2.5 text-sm',
};

/**
 * Shared button with themed variants.
 **/
export default function Button({
  type = 'button',
  variant = 'normal',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  loading,
  title,
  ariaLabel,
  children,
  className,
}: Props) {
  return (
    <button
      {...(onClick ? { onClick } : {})}
      {...(title ? { title } : {})}
      {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
      disabled={disabled || loading}
      type={type}
      className={`inline-flex items-center justify-center font-medium transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${fullWidth ? 'w-full' : ''} ${className ?? ''}`}>
      {loading && <LoadingIndicator className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
      {children}
    </button>
  );
}
