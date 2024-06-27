'use client';

import React from 'react';
import { Field } from 'formik';
import { Option } from '@/utils/types/form-types';
import { ExtendedProps } from '@/utils/types/global-types';

// Props interface
interface Props extends ExtendedProps {
  type: string;
  name: string;
  placeholder: string;
  as?: 'input' | 'textarea' | 'select';
  label?: string;
  error?: string | false;
  options?: Option[];
  defaultValue?: string | number;
  fullWidth?: boolean;
  fullRounded?: boolean;
  isReadOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Component representing an input field
 */
export default function InputField({
  type,
  name,
  placeholder,
  as = 'input',
  label,
  error,
  options,
  defaultValue,
  fullWidth = false,
  fullRounded = false,
  isReadOnly = false,
  onChange,
}: Props) {
  return (
    <div className='mb-4'>
      {label && (
        <label className='text-zinc-900 dark:text-zinc-50 font-medium' htmlFor={name}>
          {label}:
        </label>
      )}
      <Field
        as={as}
        type={type}
        name={name}
        placeholder={placeholder}
        readOnly={isReadOnly}
        defaultValue={defaultValue}
        {...(onChange
          ? {
              onChange: (e: any) => onChange(e.target.value),
            }
          : {})}
        className={`${fullWidth ? 'w-full' : ''} ${fullRounded ? 'rounded-full' : 'rounded-md'} ${as === 'select' ? 'hover:cursor-pointer' : ''} text-zinc-900 py-2 px-4 focus:outline-none select-none`}>
        {options &&
          options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
      </Field>
      <p className='mt-1 h-2 text-red-500 text-xs'>{error}</p>
    </div>
  );
}
