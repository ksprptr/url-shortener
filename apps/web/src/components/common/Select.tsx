'use client';

import type { SelectHTMLAttributes } from 'react';

import { controlClassName } from '@/components/common/Field';

interface Option {
  value: string;
  label: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
}

/**
 * Select carrying the shared control styling (the chevron comes from `globals.css`).
 **/
export default function Select({ options, className, ...props }: Props) {
  return (
    <select className={`${controlClassName} ${className ?? ''}`} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
