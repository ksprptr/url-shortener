'use client';

import type { InputHTMLAttributes } from 'react';

import { controlClassName } from '@/components/common/Field';

/**
 * Text input carrying the shared control styling.
 **/
export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${controlClassName} ${className ?? ''}`} {...props} />;
}
